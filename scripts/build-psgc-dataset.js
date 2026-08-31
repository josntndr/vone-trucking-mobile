#!/usr/bin/env node

/**
 * Builds the local Philippine PSGC dataset used by the address selector.
 *
 * Preferred input:
 *   PSGC_SOURCE_JSON=path/to/official-psa-masterlist.json node scripts/build-psgc-dataset.js
 *
 * Fallback input:
 *   node scripts/build-psgc-dataset.js --download
 *
 * The fallback downloads PSGC-compatible JSON and applies PSA-published 2Q 2026
 * structural updates before writing the offline dataset. Always run
 * `node scripts/validate-psgc-dataset.js` after generation.
 */

const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '..', 'src', 'data', 'locations', 'philippines-psgc-2026-q2.json');
const CACHE_DIR = path.join(__dirname, 'data');
const CACHE_FILE = path.join(CACHE_DIR, 'psgc-source-cache.json');

const DATASET_META = {
  release: 'PSGC 2Q 2026',
  asOf: '2026-06-30',
  source: 'Philippine Statistics Authority (PSA)',
  sourceUrl: 'https://psa.gov.ph/classification/psgc/',
  publication: 'Philippine Standard Geographic Code as of 30 June 2026',
  expectedCounts: {
    regions: 18,
    provinces: 82,
    highlyUrbanizedCities: 33,
    independentComponentCities: 5,
    componentCities: 111,
    cities: 149,
    municipalities: 1493,
    barangays: 42010,
  },
};

const REGION_NAMES = new Map([
  ['0100000000', 'Region I (Ilocos Region)'],
  ['0200000000', 'Region II (Cagayan Valley)'],
  ['0300000000', 'Region III (Central Luzon)'],
  ['0400000000', 'Region IV-A (CALABARZON)'],
  ['0500000000', 'Region V (Bicol Region)'],
  ['0600000000', 'Region VI (Western Visayas)'],
  ['0700000000', 'Region VII (Central Visayas)'],
  ['0800000000', 'Region VIII (Eastern Visayas)'],
  ['0900000000', 'Region IX (Zamboanga Peninsula)'],
  ['1000000000', 'Region X (Northern Mindanao)'],
  ['1100000000', 'Region XI (Davao Region)'],
  ['1200000000', 'Region XII (SOCCSKSARGEN)'],
  ['1300000000', 'National Capital Region (NCR)'],
  ['1400000000', 'Cordillera Administrative Region (CAR)'],
  ['1600000000', 'Region XIII (Caraga)'],
  ['1700000000', 'MIMAROPA Region'],
  ['1800000000', 'Negros Island Region (NIR)'],
  ['1900000000', 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)'],
]);

const HUC_CODES = new Set([
  '1380100000', '1380200000', '1380300000', '1380400000', '1380500000', '1380600000',
  '1380700000', '1380800000', '1380900000', '1381000000', '1381100000', '1381200000',
  '1381300000', '1381400000', '1381500000', '1381600000', '1430300000', '0330100000',
  '0331400000', '0431200000', '1731500000', '0631000000', '1830200000', '0730600000',
  '0731100000', '0731300000', '0831600000', '0931700000', '1030500000', '1030900000',
  '1130700000', '1230800000', '1630400000',
]);

const ICC_CODES = new Set(['0105518000', '0203135000', '0517240000', '0837380000', '1908703000']);

const RENAMES = new Map([
  ['0201527000', 'Sanchez Mira'],
  ['1102314000', 'Sawata'],
]);

const BARANGAY_RENAMES = new Map([
  ['0502002000:Ginitligan', 'Genitligan'],
  ['0304927000:Villa Floresca', 'Villa Floresta'],
  ['1600208000:Santo Niño', 'Sto. Niño'],
  ['1600208000:Santo Rosario', 'Sto. Rosario'],
  ['0300807000:Parang Parang', 'Parang-Parang'],
  ['1001311000:Baborawon', 'Barorawon'],
  ['1001311000:Maca-opao', 'Macaopao'],
  ['1001319000:Balukbukan', 'Balocbocan'],
  ['1001314000:Indalaza', 'Indalasa'],
  ['1001314000:Kabalabag', 'Kibalabag'],
  ['1001321000:Merangerang', 'Merangeran'],
  ['1001321000:Santa Cruz', 'Sta. Cruz'],
  ['1001322000:Culasi', 'Kulasi'],
  ['1001323000:Santo Niño', 'Sto. Niño'],
  ['1001325000:Nabago', 'Nabag-o'],
  ['1001325000:Kahapunan', 'Kahaponan'],
  ['1001325000:Lurogan', 'Lurugan'],
  ['1001318000:Santa Ines', 'Sta. Ines'],
  ['1102314000:Sawata', 'Poblacion'],
]);

const BARANGAY_NAME_OVERRIDES = new Map([
  ['0405622058', 'Rizal (Rural)'],
  ['0405622095', 'Rizal (Poblacion)'],
  ['0506213047', 'San Antonio (Millabas)'],
  ['0506213048', 'San Antonio (Sapa)'],
  ['0506216003', 'Balogo (Sorsogon East District)'],
  ['0506216010', 'Buenavista (Sorsogon West District)'],
  ['0506216024', 'Peñafrancia'],
  ['0506216029', 'Salvacion (Sorsogon West District)'],
  ['0506216031', 'San Isidro (Sorsogon West District)'],
  ['0506216032', 'San Juan (Roro)'],
  ['0506216039', 'Balogo (Bacon District)'],
  ['0506216042', 'Bogña'],
  ['0506216043', 'Buenavista (Bacon District)'],
  ['0506216053', 'Salvacion (Bacon District)'],
  ['0506216054', 'San Isidro (Bacon District)'],
  ['0506216063', 'Santo Niño'],
  ['0631000097', 'Luna (Jaro)'],
  ['0631000151', 'San Isidro (Jaro)'],
  ['0631000154', 'San Jose (Jaro)'],
  ['0631000155', 'San Jose (Arevalo)'],
  ['0631000158', 'San Pedro (Molo)'],
  ['0631000159', 'San Pedro (Jaro)'],
  ['0631000175', 'Tabuc Suba (Jaro)'],
  ['0631000198', 'Luna (La Paz)'],
  ['0631000199', 'San Isidro (La Paz)'],
  ['0631000200', 'San Jose (City Proper)'],
  ['0631000201', 'Tabuc Suba (La Paz)'],
  ['0931700027', 'Dulian (Upper Bunguiao)'],
  ['0931700028', 'Dulian (Upper Pasonanca)'],
  ['1102317012', 'Cogon (Talicod)'],
  ['1102317032', 'San Isidro (Babak)'],
  ['1102317033', 'San Isidro (Kaputian)'],
  ['1908821013', 'Pagatin (Pagatin I)'],
]);

const BARANGAY_PARENT_OVERRIDES = new Map([
  ['Cembo', '1381500000'],
  ['Comembo', '1381500000'],
  ['East Rembo', '1381500000'],
  ['Pembo', '1381500000'],
  ['Pitogo', '1381500000'],
  ['Post Proper Northside', '1381500000'],
  ['Post Proper Southside', '1381500000'],
  ['Rizal', '1381500000'],
  ['South Cembo', '1381500000'],
  ['West Rembo', '1381500000'],
]);

const BARANGAY_SKIP_CODES = new Set([
  '1380100176',
]);

const BACOOR_BARANGAYS = [
  ['0402103004', 'Bayanan'],
  ['0402103007', 'Dulong Bayan'],
  ['0402103008', 'Habay I'],
  ['0402103012', 'Maliksi 1'],
  ['0402103013', 'Mambog 1'],
  ['0402103014', 'Molino I'],
  ['0402103018', 'P.F. Espiritu 1'],
  ['0402103020', 'Salinas I'],
  ['0402103021', 'San Nicolas 1'],
  ['0402103026', 'Queens Row Central'],
  ['0402103027', 'Queens Row East'],
  ['0402103028', 'Queens Row West'],
  ['0402103034', 'Habay II'],
  ['0402103036', 'Ligas 2'],
  ['0402103042', 'Mambog 3'],
  ['0402103043', 'Mambog 4'],
  ['0402103045', 'Molino II'],
  ['0402103046', 'Molino III'],
  ['0402103047', 'Molino IV'],
  ['0402103048', 'Molino V'],
  ['0402103049', 'Molino VI'],
  ['0402103050', 'Molino VII'],
  ['0402103055', 'P.F. Espiritu 3'],
  ['0402103058', 'P.F. Espiritu 5'],
  ['0402103059', 'P.F. Espiritu 6'],
  ['0402103064', 'San Nicolas II'],
  ['0402103065', 'San Nicolas III'],
  ['0402103066', 'Talaba 2'],
  ['0402103075', 'Zapote 3'],
  ['0402103076', 'Aniban 1'],
  ['0402103077', 'Aniban 2'],
  ['0402103078', 'Kaingin Digman'],
  ['0402103079', 'Ligas 1'],
  ['0402103080', 'Mabolo'],
  ['0402103081', 'Maliksi 2'],
  ['0402103082', 'Mambog 2'],
  ['0402103083', 'Niog'],
  ['0402103084', 'P.F. Espiritu 2'],
  ['0402103085', 'P.F. Espiritu 4'],
  ['0402103086', 'Poblacion'],
  ['0402103087', 'Real'],
  ['0402103088', 'Salinas 2'],
  ['0402103089', 'Sinbanali'],
  ['0402103090', 'Talaba 1'],
  ['0402103091', 'Talaba 3'],
  ['0402103092', 'Zapote 1'],
  ['0402103093', 'Zapote 2'],
];

const OFFICIAL_BARANGAY_PATCHES = [
  ...BACOOR_BARANGAYS.map(([code, name]) => ({ code, name, cityMunicipalityCode: '0402103000' })),
  { code: '1380100189', name: 'Barangay 176-A', cityMunicipalityCode: '1380100000' },
  { code: '1380100190', name: 'Barangay 176-B', cityMunicipalityCode: '1380100000' },
  { code: '1380100191', name: 'Barangay 176-C', cityMunicipalityCode: '1380100000' },
  { code: '1380100192', name: 'Barangay 176-D', cityMunicipalityCode: '1380100000' },
  { code: '1380100193', name: 'Barangay 176-E', cityMunicipalityCode: '1380100000' },
  { code: '1380100194', name: 'Barangay 176-F', cityMunicipalityCode: '1380100000' },
  { code: '1206317017', name: 'Juan-Loreto Tamayo', cityMunicipalityCode: '1206317000' },
  { code: '1606801027', name: 'Guinhalinan', cityMunicipalityCode: '1606801000' },
  { code: '1903617146', name: 'Angoyao', cityMunicipalityCode: '1903617000' },
  { code: '1903617147', name: 'Sultan Corobong', cityMunicipalityCode: '1903617000' },
  { code: '1903617148', name: 'Sultan Panoroganan', cityMunicipalityCode: '1903617000' },
];

function repairMojibake(value) {
  const text = String(value || '');
  if (!/[ÃÂ]/.test(text)) {
    return text;
  }

  return Buffer.from(text, 'latin1').toString('utf8');
}

function cleanName(value) {
  return repairMojibake(value).replace(/\s+/g, ' ').trim();
}

function transformCode(code) {
  const raw = String(code).padStart(10, '0');

  if (raw.startsWith('06045') || raw.startsWith('07046') || raw.startsWith('07061')) {
    return `18${raw.slice(2)}`;
  }

  if (raw === '0630200000' || raw.startsWith('06302')) {
    return `18${raw.slice(2)}`;
  }

  if (raw.startsWith('19066')) {
    return `09${raw.slice(2)}`;
  }

  return raw;
}

function regionCodeFor(code) {
  return `${code.slice(0, 2)}00000000`;
}

function provinceCandidateFor(code) {
  return `${code.slice(0, 5)}00000`;
}

function cityType(record, code) {
  if (record.type === 'SGU') return 'municipality';
  if (record.type === 'Mun') return 'municipality';
  if (HUC_CODES.has(code)) return 'highly_urbanized_city';
  if (ICC_CODES.has(code) || code === '0990101000') return 'independent_component_city';
  return 'component_city';
}

function sortByNameThenCode(a, b) {
  return a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true }) || a.code.localeCompare(b.code);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, attempt = 1) {
  const response = await fetch(url);
  if (!response.ok) {
    if ((response.status === 429 || response.status >= 500) && attempt <= 8) {
      const retryAfter = Number(response.headers.get('retry-after') || 0);
      const waitMs = retryAfter > 0 ? retryAfter * 1000 : Math.min(30000, 750 * attempt * attempt);
      await sleep(waitMs);
      return fetchJson(url, attempt + 1);
    }

    throw new Error(`Request failed ${response.status}: ${url}`);
  }
  return response.json();
}

async function downloadFallbackSource() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const [regionsResponse, provincesResponse, localitiesResponse] = await Promise.all([
    fetchJson('https://psgc.cloud/api/v2/regions'),
    fetchJson('https://psgc.cloud/api/v2/provinces'),
    fetchJson('https://psgc.cloud/api/v2/cities-municipalities'),
  ]);

  const localities = localitiesResponse.data;
  const barangays = [];

  for (let index = 0; index < localities.length; index += 1) {
    const locality = localities[index];
    const response = await fetchJson(`https://psgc.cloud/api/v2/cities-municipalities/${locality.code}/barangays`);
    barangays.push(...response.data.map((barangay) => ({ ...barangay, sourceParentCode: locality.code })));
    await sleep(75);

    if ((index + 1) % 100 === 0) {
      process.stdout.write(`Fetched barangays for ${index + 1}/${localities.length} localities\n`);
    }
  }

  const source = {
    fetchedAt: new Date().toISOString(),
    seedSource: 'https://psgc.cloud/api/v2 (PSGC-compatible JSON seed)',
    regions: regionsResponse.data,
    provinces: provincesResponse.data,
    localities,
    barangays,
  };

  fs.writeFileSync(CACHE_FILE, JSON.stringify(source, null, 2));
  return source;
}

function readSource() {
  const sourceArgIndex = process.argv.indexOf('--source');
  const sourceFile = process.env.PSGC_SOURCE_JSON || (sourceArgIndex >= 0 ? process.argv[sourceArgIndex + 1] : '');

  if (sourceFile) {
    return JSON.parse(fs.readFileSync(path.resolve(sourceFile), 'utf8'));
  }

  if (process.argv.includes('--download')) {
    return downloadFallbackSource();
  }

  if (fs.existsSync(CACHE_FILE)) {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  }

  throw new Error('No PSGC source cache found. Run with --download or pass PSGC_SOURCE_JSON.');
}

function buildDataset(source) {
  const sourceLocalities = source.localities || [];
  const sourceBarangays = source.barangays || [];

  const regions = [...REGION_NAMES.entries()]
    .map(([code, name]) => ({
      code,
      name,
      hasProvinces: code !== '1300000000',
    }))
    .sort(sortByNameThenCode);

  const provinces = (source.provinces || [])
    .map((province) => {
      const code = transformCode(province.code);
      return {
        code,
        name: cleanName(province.name),
        regionCode: regionCodeFor(code),
      };
    })
    .sort(sortByNameThenCode);

  const provinceCodes = new Set(provinces.map((province) => province.code));
  const localityByCode = new Map();
  const subMunicipalityParent = new Map();

  for (const locality of sourceLocalities) {
    const code = transformCode(locality.code);
    const recordType = locality.type;

    if (recordType === 'SubMun') {
      subMunicipalityParent.set(transformCode(locality.code), `${code.slice(0, 5)}00000`);
      continue;
    }

    const renamedName = RENAMES.get(code);
    const name = renamedName || cleanName(locality.name);
    const type = cityType(locality, code);
    const candidateProvinceCode = provinceCandidateFor(code);
    const provinceCode = provinceCodes.has(candidateProvinceCode) && (type === 'municipality' || type === 'component_city')
      ? candidateProvinceCode
      : null;

    localityByCode.set(code, {
      code,
      name,
      type,
      regionCode: regionCodeFor(code),
      provinceCode,
      postalCodes: locality.zip_code ? [String(locality.zip_code)] : [],
    });
  }

  const carmona = localityByCode.get('0402104000');
  if (carmona) {
    carmona.type = 'component_city';
    carmona.name = 'City of Carmona';
  }

  const barangays = [];
  for (const barangay of sourceBarangays) {
    const code = transformCode(barangay.code);
    const transformedParent = transformCode(barangay.sourceParentCode || `${String(barangay.code).slice(0, 7)}000`);
    let cityMunicipalityCode = subMunicipalityParent.get(transformedParent) || transformedParent;
    const originalName = cleanName(barangay.name);

    if (cityMunicipalityCode === '1380300000') {
      cityMunicipalityCode = BARANGAY_PARENT_OVERRIDES.get(originalName) || cityMunicipalityCode;
    }

    const parent = localityByCode.get(cityMunicipalityCode);
    if (!parent) {
      continue;
    }

    if (cityMunicipalityCode === '0402103000' || BARANGAY_SKIP_CODES.has(code)) {
      continue;
    }

    if (cityMunicipalityCode === '0401007000' && originalName === 'San Rafael') {
      continue;
    }

    const renamedName = BARANGAY_NAME_OVERRIDES.get(code) || BARANGAY_RENAMES.get(`${cityMunicipalityCode}:${originalName}`);
    barangays.push({
      code,
      name: renamedName || originalName,
      regionCode: parent.regionCode,
      provinceCode: parent.provinceCode,
      cityMunicipalityCode,
    });
  }

  const existingBarangayCodes = new Set(barangays.map((barangay) => barangay.code));
  for (const patch of OFFICIAL_BARANGAY_PATCHES) {
    const parent = localityByCode.get(patch.cityMunicipalityCode);
    if (!parent || existingBarangayCodes.has(patch.code)) {
      continue;
    }

    barangays.push({
      code: patch.code,
      name: patch.name,
      regionCode: parent.regionCode,
      provinceCode: parent.provinceCode,
      cityMunicipalityCode: parent.code,
    });
    existingBarangayCodes.add(patch.code);
  }

  const citiesMunicipalities = [...localityByCode.values()].sort(sortByNameThenCode);

  return {
    meta: {
      ...DATASET_META,
      generatedAt: new Date().toISOString(),
    },
    countries: [{ code: 'PH', name: 'Philippines' }],
    regions,
    provinces,
    citiesMunicipalities,
    barangays: barangays.sort(sortByNameThenCode),
  };
}

Promise.resolve(readSource())
  .then((source) => {
    const dataset = buildDataset(source);
    fs.writeFileSync(OUT_FILE, `${JSON.stringify(dataset)}\n`);
    process.stdout.write(`Wrote ${OUT_FILE}\n`);
    process.stdout.write(`Regions: ${dataset.regions.length}\n`);
    process.stdout.write(`Provinces: ${dataset.provinces.length}\n`);
    process.stdout.write(`Cities/Municipalities: ${dataset.citiesMunicipalities.length}\n`);
    process.stdout.write(`Barangays: ${dataset.barangays.length}\n`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
