#!/usr/bin/env node
/**
 * Provision the Locus Location Intelligence Airtable base.
 *
 * Requires:
 *   AIRTABLE_TOKEN          Personal access token with schema.bases:write + data.records:write
 *   AIRTABLE_WORKSPACE_ID   Workspace ID (wsp…)
 *
 * Optional:
 *   AIRTABLE_BASE_NAME      Defaults to "Locus Location Intelligence"
 *   SKIP_SEED=1             Create schema only (no sample records)
 *
 * Usage:
 *   node scripts/provision-airtable.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const schemaPath = join(root, 'airtable/schema/base-schema.json');
const seedDir = join(root, 'airtable/seed');
const outDir = join(root, 'airtable/generated');

const TOKEN = process.env.AIRTABLE_TOKEN;
const WORKSPACE_ID = process.env.AIRTABLE_WORKSPACE_ID;
const BASE_NAME =
  process.env.AIRTABLE_BASE_NAME || 'Locus Location Intelligence';
const SKIP_SEED = process.env.SKIP_SEED === '1';

if (!TOKEN || !WORKSPACE_ID) {
  console.error(`
Missing credentials.

Set:
  export AIRTABLE_TOKEN="pat…"
  export AIRTABLE_WORKSPACE_ID="wsp…"

Token scopes needed:
  schema.bases:write
  data.records:write
  (optionally schema.bases:read)
`);
  process.exit(1);
}

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

async function airtable(method, path, body) {
  const res = await fetch(`https://api.airtable.com/v0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(
      `${method} ${path} → ${res.status}: ${JSON.stringify(json)}`,
    );
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

function stripPrimary(fields, primaryField) {
  // Primary is first; keep order with primary at index 0
  const primary = fields.find((f) => f.name === primaryField);
  const rest = fields.filter((f) => f.name !== primaryField);
  return primary ? [primary, ...rest] : fields;
}

async function createBase() {
  console.log(`Creating base "${BASE_NAME}" in ${WORKSPACE_ID}…`);
  const tables = schema.tables.map((t) => ({
    name: t.name,
    description: t.description,
    fields: stripPrimary(t.fields, t.primaryField),
  }));

  const created = await airtable('POST', '/meta/bases', {
    name: BASE_NAME,
    workspaceId: WORKSPACE_ID,
    tables,
  });

  console.log(`Base created: ${created.id}`);
  return created;
}

async function addLinkedFields(baseId, tables) {
  const byName = Object.fromEntries(tables.map((t) => [t.name, t]));
  console.log(`Adding ${schema.links.length} linked-record relationships…`);

  for (const link of schema.links) {
    const table = byName[link.table];
    const linked = byName[link.linkedTable];
    if (!table || !linked) {
      console.warn(`  skip ${link.name}: missing table`);
      continue;
    }
    // Skip if field already exists (re-runs / inverse auto-created)
    const existing = (table.fields || []).find((f) => f.name === link.name);
    if (existing) {
      console.log(`  exists: ${link.table}.${link.name}`);
      continue;
    }
    try {
      const field = await airtable(
        'POST',
        `/meta/bases/${baseId}/tables/${table.id}/fields`,
        {
          name: link.name,
          type: 'multipleRecordLinks',
          options: {
            linkedTableId: linked.id,
            prefersSingleRecordLink: !!link.prefersSingleRecordLink,
            ...(link.inverseName
              ? { inverseLinkFieldName: link.inverseName }
              : {}),
          },
        },
      );
      console.log(`  + ${link.table}.${link.name} → ${link.linkedTable} (${field.id})`);
      // Refresh schema after each link so inverse fields are visible
      const refreshed = await airtable('GET', `/meta/bases/${baseId}/tables`);
      for (const t of refreshed.tables) byName[t.name] = t;
    } catch (e) {
      // Inverse may already exist from the other side
      console.warn(`  ! ${link.table}.${link.name}: ${e.message}`);
    }
  }

  return byName;
}

function loadSeed(file) {
  return JSON.parse(readFileSync(join(seedDir, file), 'utf8'));
}

async function createRecords(baseId, tableId, records) {
  const chunks = [];
  for (let i = 0; i < records.length; i += 10) {
    chunks.push(records.slice(i, i + 10));
  }
  const created = [];
  for (const chunk of chunks) {
    const res = await airtable('POST', `/${baseId}/${tableId}`, {
      records: chunk.map((fields) => ({ fields })),
      typecast: true,
    });
    created.push(...res.records);
  }
  return created;
}

async function seedData(baseId, tablesByName) {
  console.log('Seeding sample records…');
  const idMaps = {};

  const order = [
    ['Demographics', 'demographics.json', 'Area Name'],
    ['Franchise Requirements', 'franchise-requirements.json', 'Brand'],
    ['Clients', 'clients.json', 'Company Name'],
    ['Retail Centers', 'retail-centers.json', 'Shopping Center Name'],
    ['Businesses / Tenants', 'businesses.json', 'Business Name'],
    ['Competitors', 'competitors.json', 'Business Name'],
    ['Development Projects', 'developments.json', 'Project Name'],
    ['Opportunities', 'opportunities.json', 'Opportunity Name'],
    ['Reports', 'reports.json', 'Report Name'],
  ];

  for (const [tableName, file, primary] of order) {
    const table = tablesByName[tableName];
    if (!table) continue;
    let rows = loadSeed(file);

    // Resolve link placeholders like {Retail Centers:Irvine Spectrum Center}
    rows = rows.map((row) => resolveLinks(row, idMaps));

    const created = await createRecords(baseId, table.id, rows);
    idMaps[tableName] = Object.fromEntries(
      created.map((r) => [r.fields[primary], r.id]),
    );
    console.log(`  ${tableName}: ${created.length} records`);
  }
}

function resolveLinks(row, idMaps) {
  const out = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      const inner = value.slice(1, -1);
      const [table, name] = inner.split(':');
      const id = idMaps[table]?.[name];
      out[key] = id ? [id] : undefined;
      if (!id) delete out[key];
    } else if (
      Array.isArray(value) &&
      value.every((v) => typeof v === 'string' && v.startsWith('{'))
    ) {
      out[key] = value
        .map((v) => {
          const inner = v.slice(1, -1);
          const [table, name] = inner.split(':');
          return idMaps[table]?.[name];
        })
        .filter(Boolean);
      if (!out[key].length) delete out[key];
    }
  }
  return out;
}

function writeViewsGuide(baseId) {
  mkdirSync(outDir, { recursive: true });
  const lines = [
    `# Airtable Views to Create`,
    ``,
    `Base ID: \`${baseId}\``,
    ``,
    `Airtable’s Meta API creates a default Grid view per table. Create these filtered views in the UI (or Interfaces):`,
    ``,
  ];
  for (const v of schema.views) {
    lines.push(`## ${v.table} → ${v.name}`);
    lines.push(`- Filter: \`${v.filter}\``);
    if (v.sort?.length) {
      lines.push(
        `- Sort: ${v.sort.map((s) => `${s.field} ${s.direction}`).join(', ')}`,
      );
    }
    if (v.limit) lines.push(`- Show first: ${v.limit}`);
    lines.push(``);
  }
  const path = join(outDir, 'VIEWS.md');
  writeFileSync(path, lines.join('\n'));
  console.log(`Wrote ${path}`);
}

async function main() {
  const created = await createBase();
  const tablesByName = await addLinkedFields(created.id, created.tables);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, 'base-meta.json'),
    JSON.stringify(
      {
        baseId: created.id,
        name: BASE_NAME,
        tables: Object.fromEntries(
          Object.values(tablesByName).map((t) => [
            t.name,
            { id: t.id, primaryFieldId: t.primaryFieldId },
          ]),
        ),
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  writeViewsGuide(created.id);

  if (!SKIP_SEED) {
    await seedData(created.id, tablesByName);
  } else {
    console.log('SKIP_SEED=1 — schema only.');
  }

  console.log(`
Done.
Open: https://airtable.com/${created.id}
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
