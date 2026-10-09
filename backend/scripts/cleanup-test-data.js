#!/usr/bin/env node

/*
 * Finds data created by regression-test.js across all service databases.
 *
 * Run from the repository root:
 *   node backend/scripts/cleanup-test-data.js            # dry run
 *   node backend/scripts/cleanup-test-data.js --confirm  # hard delete
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const mongoose = require('mongoose');

const root = join(__dirname, '..', '..');
const confirm = process.argv.includes('--confirm');
const services = [
  ['student-service', 'student-service'], ['teacher-service', 'teacher-service'],
  ['class-subject-service', 'class-subject-service'], ['timetable-service', 'timetable-service'],
  ['attendance-service', 'attendance-service'], ['examination-service', 'examination-service'],
  ['assignment-service', 'assignment-service'], ['fee-service', 'fee-service'],
  ['leave-service', 'leave-service'], ['admission-service', 'admission-service'],
  ['certificate-service', 'certificate-service'], ['notice-service', 'notice-service'],
  ['library-service', 'library-service'], ['transport-service', 'transport-service'],
  ['auth-service', 'auth-service'],
];
const prefix = /^(Role |Write |QA |Public)/i;
const testEmail = /@brightboard\.test$/i;
const testPhone = /^\+91999999999[6-9]$/;
const testCode = /^(ROLE-|WRITE-)/i;
const exactText = new Set(['Role regression test.', 'Regression fixture.']);

function envValue(service) {
  const file = join(root, 'backend', 'services', service, '.env');
  const line = readFileSync(file, 'utf8').split(/\r?\n/).find((value) => value.startsWith('MONGODB_URI='));
  if (!line) throw new Error('MONGODB_URI is missing from ' + file);
  return line.slice('MONGODB_URI='.length).trim();
}

function databaseName(service) {
  return new URL(envValue(service)).pathname.replace(/^\//, '');
}

function hasDirectFingerprint(record) {
  const prefixed = ['name', 'title', 'routeName', 'firstName', 'applicantFirstName', 'feeType']
    .some((field) => typeof record[field] === 'string' && prefix.test(record[field]));
  const email = ['email', 'guardianEmail'].some((field) => typeof record[field] === 'string' && testEmail.test(record[field]));
  const text = ['reason', 'message', 'description'].some((field) => exactText.has(record[field]));
  const phone = ['phone', 'driverContact', 'guardianContact'].some((field) => typeof record[field] === 'string' && testPhone.test(record[field]));
  const code = ['vehicleNumber', 'isbn', 'rollNumber', 'code', 'transactionRef'].some((field) => typeof record[field] === 'string' && testCode.test(record[field]));
  return prefixed || email || text || phone || code || record.guardianName === 'QA Guardian' || record.driverName === 'QA Driver';
}

function referencesKnownId(value, ids) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return ids.has(value);
  if (Array.isArray(value)) return value.some((item) => referencesKnownId(item, ids));
  if (typeof value !== 'object') return false;
  return Object.entries(value).some(([key, item]) => key !== '_id' && referencesKnownId(item, ids));
}

function summary(record) {
  const fields = ['_id', 'name', 'firstName', 'lastName', 'applicantFirstName', 'title', 'routeName', 'email', 'guardianEmail', 'vehicleNumber', 'isbn', 'reason', 'message', 'description'];
  return fields.filter((field) => record[field] !== undefined).map((field) => field + '=' + JSON.stringify(record[field])).join(', ');
}

async function openCollections() {
  const entries = [];
  const rootConnection = await mongoose.createConnection(envValue(services[0][1]), { maxPoolSize: 4 }).asPromise();
  const opened = await Promise.all(services.map(async ([label, service]) => {
    console.log('Scanning ' + label + '…');
    const database = rootConnection.useDb(databaseName(service));
    const collections = await database.db.listCollections({}, { nameOnly: true }).toArray();
    return collections.filter((item) => !item.name.startsWith('system.')).map((item) => ({ label, collection: item.name, connection: rootConnection, store: database.collection(item.name), matches: new Map() }));
  }));
  entries.push(...opened.flat());
  return entries;
}

async function findMatches(entries) {
  const ids = new Set();
  for (const entry of entries) {
    for (const record of await entry.store.find({}).toArray()) {
      if (hasDirectFingerprint(record)) { entry.matches.set(String(record._id), record); ids.add(String(record._id)); }
    }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const entry of entries) {
      for (const record of await entry.store.find({}).toArray()) {
        const id = String(record._id);
        if (!entry.matches.has(id) && referencesKnownId(record, ids)) {
          entry.matches.set(id, record); ids.add(id); changed = true;
        }
      }
    }
  }
}

async function main() {
  console.log(confirm ? 'CONFIRM MODE: deleting only identified regression-test records and dependent records.' : 'DRY RUN: no records will be deleted. Re-run with --confirm to delete.');
  const entries = await openCollections();
  try {
    await findMatches(entries);
    let total = 0;
    for (const entry of entries) {
      const records = [...entry.matches.values()];
      console.log('\n' + entry.label + '/' + entry.collection + ': ' + records.length + ' matching record(s)');
      if (!records.length) continue;
      total += records.length;
      records.slice(0, 5).forEach((record) => console.log('  ' + summary(record)));
      if (records.length > 5) console.log('  … ' + (records.length - 5) + ' more');
    }
    console.log('\nTotal matching records: ' + total);
    if (confirm) {
      for (const entry of entries) {
        const ids = [...entry.matches.keys()].map((id) => new mongoose.Types.ObjectId(id));
        if (!ids.length) continue;
        const result = await entry.store.deleteMany({ _id: { $in: ids } });
        console.log('Deleted ' + result.deletedCount + ' from ' + entry.label + '/' + entry.collection + '.');
      }
    }
  } finally {
    await Promise.all([...new Set(entries.map((entry) => entry.connection))].map((connection) => connection.close()));
  }
}

main().catch((error) => {
  console.error('Cleanup failed: ' + error.message);
  process.exitCode = 1;
});
