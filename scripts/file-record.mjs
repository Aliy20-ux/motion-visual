#!/usr/bin/env node
// Files quotes and invoices into the Motion Visual records folder and keeps its INDEX.csv registers accurate.
//
//   node scripts/file-record.mjs quote <MV-W-….json> [<MV-W-…-quote-email.html>]
//   node scripts/file-record.mjs invoice <invoice.pdf> --ref MV-1009 --customer "Name" --issued 2026-10-22 --total 800 \
//        [--deposit 100] [--status "…"] [--project "…"] [--notes "…"]
//
// Records live outside the repo (customer data must never be committed). Override the location with
// MV_RECORDS_DIR; the default is ~/Documents/motion-visual-records. Nothing is ever overwritten: a folder
// or reference that already exists is an error.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

const ROOT = process.env.MV_RECORDS_DIR ?? join(homedir(), 'Documents', 'motion-visual-records');
const HEADER = 'ref,type,date_issued,customer,project,total_pounds,deposit_pounds,status,folder,notes\n';

const fail = (message) => { console.error(`error: ${message}`); process.exit(1); };
const csv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

// "Sweets ’N’ Treats" -> "SweetsNTreats", matching the existing folders.
const slug = (name) => name.normalize('NFKD').replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ')
  .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

function parseFlags(args) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) flags[args[i].slice(2)] = args[++i];
    else rest.push(args[i]);
  }
  return { flags, rest };
}

function register(kind, row) {
  const dir = join(ROOT, kind);
  const indexPath = join(dir, 'INDEX.csv');
  mkdirSync(dir, { recursive: true });
  if (!existsSync(indexPath)) writeFileSync(indexPath, HEADER);
  const existing = readFileSync(indexPath, 'utf8').split('\n').some(line => line.startsWith(`${row.ref},`));
  if (existing) fail(`${row.ref} is already in ${indexPath}`);
  appendFileSync(indexPath, [row.ref, row.type, row.date, row.customer, row.project, row.total, row.deposit, row.status, row.folder, row.notes].map(csv).join(',') + '\n');
}

function makeFolder(kind, ref, customer) {
  const folder = `${ref}_${slug(customer)}`;
  const path = join(ROOT, kind, folder);
  if (existsSync(path)) fail(`${path} already exists — not overwriting`);
  mkdirSync(path, { recursive: true });
  return { folder, path };
}

const [command, ...args] = process.argv.slice(2);
const { flags, rest } = parseFlags(args);

if (command === 'quote') {
  const [jsonPath, htmlPath] = rest;
  if (!jsonPath) fail('usage: file-record.mjs quote <record.json> [quote-email.html]');
  const record = JSON.parse(readFileSync(jsonPath, 'utf8'));
  if (record.type !== 'quote' || !/^MV-[QW]-[\w-]+$/.test(record.ref ?? '') || !record.customer?.name) fail('that file is not a quote record');
  const { folder, path } = makeFolder('quotes', record.ref, record.customer.name);
  writeFileSync(join(path, 'record.json'), JSON.stringify(record, null, 2) + '\n');
  if (htmlPath) copyFileSync(htmlPath, join(path, basename(htmlPath)));
  register('quotes', {
    ref: record.ref, type: 'quote', date: record.issuedOn, customer: record.customer.name, project: record.project,
    total: record.totalPounds, deposit: record.depositPounds, status: record.statusAtIssue, folder,
    notes: `Valid until ${record.validUntil}. ${record.issuedUnderTerms ?? ''}`.trim(),
  });
  console.log(`filed ${record.ref} -> ${path}`);
} else if (command === 'invoice') {
  const [pdfPath] = rest;
  const { ref, customer, issued, total } = flags;
  if (!pdfPath || !ref || !customer || !issued || !total) fail('usage: file-record.mjs invoice <invoice.pdf> --ref MV-1009 --customer "Name" --issued YYYY-MM-DD --total 800 [--deposit 100] [--status "…"] [--project "…"] [--notes "…"]');
  if (!/^MV-\d+$/.test(ref)) fail('invoice refs look like MV-1009');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issued)) fail('--issued must be YYYY-MM-DD');
  if (!existsSync(pdfPath)) fail(`${pdfPath} does not exist`);
  const { folder, path } = makeFolder('invoices', ref, customer);
  copyFileSync(pdfPath, join(path, basename(pdfPath)));
  const status = flags.status ?? 'NOT RECORDED — update when paid';
  writeFileSync(join(path, 'record.json'), JSON.stringify({
    type: 'invoice', ref, issuedOn: issued, billedTo: { name: customer }, project: flags.project ?? null,
    totalPounds: Number(total), depositPaidPounds: flags.deposit ? Number(flags.deposit) : null,
    currentStatus: status, notes: flags.notes ?? null, files: [basename(pdfPath)],
  }, null, 2) + '\n');
  register('invoices', { ref, type: 'invoice', date: issued, customer, project: flags.project ?? '', total, deposit: flags.deposit ?? '', status, folder, notes: flags.notes ?? '' });
  console.log(`filed ${ref} -> ${path}`);
} else {
  fail('commands: quote | invoice (see the comment at the top of this file)');
}
