#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATASET_FILE = path.join(__dirname, '..', 'src', 'data', 'locations', 'philippines-psgc-2026-q2.json');
const dataset = JSON.parse(fs.readFileSync(DATASET_FILE, 'utf8'));
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function assertUnique(records, label) {
  const seen = new Set();
  for (const record of records) {
    assert(Boolean(record.code), `${label} has an empty code`);
    assert(Boolean(record.name), `${label} ${record.code || '(empty code)'} has an empty name`);
    assert(!/[ÃÂ�â]/.test(record.name), `${label} ${record.code} has suspicious text encoding: ${record.name}`);
    assert(!seen.has(record.code), `${label} code is duplicated: ${record.code}`);
    seen.add(record.code);
  }
}

const expected = dataset.meta.expectedCounts;
const regions = dataset.regions;
const provinces = dataset.provinces;
const citiesMunicipalities = dataset.citiesMunicipalities;
const barangays = dataset.barangays;

assertUnique(regions, 'Region');
assertUnique(provinces, 'Province');
assertUnique(citiesMunicipalities, 'City/municipality');
assertUnique(barangays, 'Barangay');

assert(regions.length === expected.regions, `Expected ${expected.regions} regions, found ${regions.length}`);
assert(provinces.length === expected.provinces, `Expected ${expected.provinces} provinces, found ${provinces.length}`);

const cityCount = citiesMunicipalities.filter((record) => record.type !== 'municipality').length;
const municipalityCount = citiesMunicipalities.filter((record) => record.type === 'municipality').length;
assert(cityCount === expected.cities, `Expected ${expected.cities} cities, found ${cityCount}`);
assert(municipalityCount === expected.municipalities, `Expected ${expected.municipalities} municipalities, found ${municipalityCount}`);
assert(barangays.length === expected.barangays, `Expected ${expected.barangays} barangays, found ${barangays.length}`);

const regionCodes = new Set(regions.map((record) => record.code));
const provinceCodes = new Set(provinces.map((record) => record.code));
const cityCodes = new Set(citiesMunicipalities.map((record) => record.code));

for (const province of provinces) {
  assert(regionCodes.has(province.regionCode), `Province ${province.code} points to missing region ${province.regionCode}`);
}

for (const city of citiesMunicipalities) {
  assert(regionCodes.has(city.regionCode), `City/municipality ${city.code} points to missing region ${city.regionCode}`);
  if (city.provinceCode) {
    assert(provinceCodes.has(city.provinceCode), `City/municipality ${city.code} points to missing province ${city.provinceCode}`);
    const province = provinces.find((record) => record.code === city.provinceCode);
    assert(province.regionCode === city.regionCode, `City/municipality ${city.code} province/region mismatch`);
  }
}

const barangayParentKeys = new Set();
const barangayParentNames = new Set();
for (const barangay of barangays) {
  assert(regionCodes.has(barangay.regionCode), `Barangay ${barangay.code} points to missing region ${barangay.regionCode}`);
  assert(cityCodes.has(barangay.cityMunicipalityCode), `Barangay ${barangay.code} points to missing city/municipality ${barangay.cityMunicipalityCode}`);
  if (barangay.provinceCode) {
    assert(provinceCodes.has(barangay.provinceCode), `Barangay ${barangay.code} points to missing province ${barangay.provinceCode}`);
  }

  const parent = citiesMunicipalities.find((record) => record.code === barangay.cityMunicipalityCode);
  assert(parent.regionCode === barangay.regionCode, `Barangay ${barangay.code} parent/region mismatch`);
  assert((parent.provinceCode || null) === (barangay.provinceCode || null), `Barangay ${barangay.code} parent/province mismatch`);

  const parentKey = `${barangay.cityMunicipalityCode}:${barangay.code}`;
  assert(!barangayParentKeys.has(parentKey), `Barangay ${barangay.code} is duplicated under ${barangay.cityMunicipalityCode}`);
  barangayParentKeys.add(parentKey);

  const parentNameKey = `${barangay.cityMunicipalityCode}:${barangay.name.toLowerCase()}`;
  assert(!barangayParentNames.has(parentNameKey), `Barangay name "${barangay.name}" is duplicated under ${barangay.cityMunicipalityCode}`);
  barangayParentNames.add(parentNameKey);
}

const parentsWithoutBarangays = citiesMunicipalities.filter((city) => !barangays.some((barangay) => barangay.cityMunicipalityCode === city.code));
assert(parentsWithoutBarangays.length === 0, `City/municipality records without barangays: ${parentsWithoutBarangays.map((record) => `${record.name} (${record.code})`).slice(0, 10).join(', ')}`);

if (errors.length > 0) {
  console.error('PSGC dataset validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('PSGC dataset validation passed.');
console.log(`Release: ${dataset.meta.release} (${dataset.meta.asOf})`);
console.log(`Regions: ${regions.length}`);
console.log(`Provinces: ${provinces.length}`);
console.log(`Cities: ${cityCount}`);
console.log(`Municipalities: ${municipalityCount}`);
console.log(`Barangays: ${barangays.length}`);
