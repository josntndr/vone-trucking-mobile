/**
 * Philippine Location Data
 * Based on Philippine Standard Geographic Code (PSGC)
 * 
 * This is a comprehensive but not exhaustive dataset covering major
 * provinces, cities, municipalities, and barangays in the Philippines.
 * Focused on NCR and nearby regions (Calabarzon, Central Luzon).
 */

export interface Barangay {
  code: string;
  name: string;
  cityCode: string;
}

export interface City {
  code: string;
  name: string;
  type: 'city' | 'municipality';
  provinceCode: string;
  postalCodes?: string[];
}

export interface Province {
  code: string;
  name: string;
  region: string;
  regionCode: string;
}

export interface Country {
  code: string;
  name: string;
}

// Countries (Philippines default, extensible for international)
export const COUNTRIES: Country[] = [
  { code: 'PH', name: 'Philippines' },
];

// Provinces (NCR, Calabarzon, Central Luzon focus)
export const PROVINCES: Province[] = [
  // National Capital Region
  { code: '1300000', name: 'Metro Manila', region: 'National Capital Region', regionCode: '13' },
  
  // Calabarzon (Region IV-A)
  { code: '0434000', name: 'Cavite', region: 'Calabarzon', regionCode: '04' },
  { code: '0456000', name: 'Laguna', region: 'Calabarzon', regionCode: '04' },
  { code: '0458000', name: 'Batangas', region: 'Calabarzon', regionCode: '04' },
  { code: '0410000', name: 'Rizal', region: 'Calabarzon', regionCode: '04' },
  { code: '0421000', name: 'Quezon', region: 'Calabarzon', regionCode: '04' },
  
  // Central Luzon (Region III)
  { code: '0314000', name: 'Bulacan', region: 'Central Luzon', regionCode: '03' },
  { code: '0369000', name: 'Pampanga', region: 'Central Luzon', regionCode: '03' },
  { code: '0371000', name: 'Tarlac', region: 'Central Luzon', regionCode: '03' },
  { code: '0349000', name: 'Nueva Ecija', region: 'Central Luzon', regionCode: '03' },
  { code: '0377000', name: 'Zambales', region: 'Central Luzon', regionCode: '03' },
  { code: '0308000', name: 'Bataan', region: 'Central Luzon', regionCode: '03' },
  { code: '0303000', name: 'Aurora', region: 'Central Luzon', regionCode: '03' },
];

// Cities and Municipalities (Comprehensive for Cavite, major cities for others)
export const CITIES: City[] = [
  // Metro Manila
  { code: '137401', name: 'Manila', type: 'city', provinceCode: '1300000', postalCodes: ['1000', '1001', '1002', '1003', '1004', '1005', '1006'] },
  { code: '137402', name: 'Quezon City', type: 'city', provinceCode: '1300000', postalCodes: ['1100', '1101', '1102', '1103', '1104', '1105', '1106', '1107', '1108', '1109', '1110', '1111', '1112', '1113', '1114', '1115', '1116', '1117', '1118', '1119', '1120', '1121', '1122', '1123', '1124', '1125', '1126', '1127', '1128'] },
  { code: '137403', name: 'Caloocan', type: 'city', provinceCode: '1300000', postalCodes: ['1400', '1401', '1402', '1403', '1404', '1405', '1406', '1407', '1408', '1409', '1410', '1411', '1412', '1413', '1414', '1415', '1416', '1417', '1418', '1419', '1420', '1421', '1422', '1423', '1424', '1425', '1426', '1427', '1428'] },
  { code: '137404', name: 'Pasay', type: 'city', provinceCode: '1300000', postalCodes: ['1300', '1301', '1302', '1303', '1304', '1305', '1306', '1307', '1308', '1309'] },
  { code: '137501', name: 'Makati', type: 'city', provinceCode: '1300000', postalCodes: ['1200', '1201', '1202', '1203', '1204', '1205', '1206', '1207', '1208', '1209', '1210', '1211', '1212', '1213', '1214', '1215', '1216', '1217', '1218', '1219', '1220', '1221', '1222', '1223', '1224', '1225', '1226', '1227', '1228', '1229', '1230', '1231', '1232'] },
  { code: '137502', name: 'Mandaluyong', type: 'city', provinceCode: '1300000', postalCodes: ['1550', '1551', '1552', '1553', '1554', '1555'] },
  { code: '137503', name: 'Pasig', type: 'city', provinceCode: '1300000', postalCodes: ['1600', '1601', '1602', '1603', '1604', '1605', '1606', '1607', '1608', '1609', '1610', '1611'] },
  { code: '137504', name: 'Taguig', type: 'city', provinceCode: '1300000', postalCodes: ['1630', '1631', '1632', '1633', '1634', '1635', '1636', '1637', '1638', '1639'] },
  { code: '137505', name: 'Parañaque', type: 'city', provinceCode: '1300000', postalCodes: ['1700', '1701', '1702', '1703', '1704', '1705', '1706', '1707', '1708', '1709', '1710'] },
  { code: '137506', name: 'Las Piñas', type: 'city', provinceCode: '1300000', postalCodes: ['1740', '1741', '1742', '1743', '1744', '1745', '1746', '1747'] },
  { code: '137507', name: 'Muntinlupa', type: 'city', provinceCode: '1300000', postalCodes: ['1770', '1771', '1772', '1773', '1774', '1775', '1776', '1777', '1778', '1779', '1780', '1781'] },
  { code: '137601', name: 'Malabon', type: 'city', provinceCode: '1300000', postalCodes: ['1470', '1471', '1472', '1473', '1474', '1475'] },
  { code: '137602', name: 'Navotas', type: 'city', provinceCode: '1300000', postalCodes: ['1480', '1485'] },
  { code: '137603', name: 'Valenzuela', type: 'city', provinceCode: '1300000', postalCodes: ['1440', '1441', '1442', '1443', '1444', '1445'] },
  { code: '137604', name: 'Marikina', type: 'city', provinceCode: '1300000', postalCodes: ['1800', '1801', '1802', '1803', '1804', '1805', '1806', '1807', '1808', '1809', '1810'] },
  { code: '137605', name: 'San Juan', type: 'city', provinceCode: '1300000', postalCodes: ['1500', '1501', '1502', '1503', '1504', '1505'] },
  { code: '137606', name: 'Pateros', type: 'municipality', provinceCode: '1300000', postalCodes: ['1620'] },

  // Cavite (Comprehensive - all cities and municipalities)
  { code: '043401', name: 'Bacoor', type: 'city', provinceCode: '0434000', postalCodes: ['4102'] },
  { code: '043402', name: 'Cavite City', type: 'city', provinceCode: '0434000', postalCodes: ['4100'] },
  { code: '043403', name: 'Dasmariñas', type: 'city', provinceCode: '0434000', postalCodes: ['4114', '4115', '4116'] },
  { code: '043404', name: 'General Trias', type: 'city', provinceCode: '0434000', postalCodes: ['4107'] },
  { code: '043405', name: 'Imus', type: 'city', provinceCode: '0434000', postalCodes: ['4103'] },
  { code: '043406', name: 'Tagaytay', type: 'city', provinceCode: '0434000', postalCodes: ['4120'] },
  { code: '043407', name: 'Trece Martires', type: 'city', provinceCode: '0434000', postalCodes: ['4109'] },
  { code: '043408', name: 'Alfonso', type: 'municipality', provinceCode: '0434000', postalCodes: ['4123'] },
  { code: '043409', name: 'Amadeo', type: 'municipality', provinceCode: '0434000', postalCodes: ['4119'] },
  { code: '043410', name: 'Carmona', type: 'municipality', provinceCode: '0434000', postalCodes: ['4116'] },
  { code: '043411', name: 'Gen. Mariano Alvarez', type: 'municipality', provinceCode: '0434000', postalCodes: ['4117'] },
  { code: '043412', name: 'Indang', type: 'municipality', provinceCode: '0434000', postalCodes: ['4122'] },
  { code: '043413', name: 'Kawit', type: 'municipality', provinceCode: '0434000', postalCodes: ['4104'] },
  { code: '043414', name: 'Magallanes', type: 'municipality', provinceCode: '0434000', postalCodes: ['4113'] },
  { code: '043415', name: 'Maragondon', type: 'municipality', provinceCode: '0434000', postalCodes: ['4112'] },
  { code: '043416', name: 'Mendez', type: 'municipality', provinceCode: '0434000', postalCodes: ['4124'] },
  { code: '043417', name: 'Naic', type: 'municipality', provinceCode: '0434000', postalCodes: ['4110'] },
  { code: '043418', name: 'Noveleta', type: 'municipality', provinceCode: '0434000', postalCodes: ['4105'] },
  { code: '043419', name: 'Rosario', type: 'municipality', provinceCode: '0434000', postalCodes: ['4106'] },
  { code: '043420', name: 'Silang', type: 'municipality', provinceCode: '0434000', postalCodes: ['4118'] },
  { code: '043421', name: 'Tanza', type: 'municipality', provinceCode: '0434000', postalCodes: ['4108'] },
  { code: '043422', name: 'Ternate', type: 'municipality', provinceCode: '0434000', postalCodes: ['4111'] },

  // Laguna (Major cities)
  { code: '045601', name: 'Biñan', type: 'city', provinceCode: '0456000', postalCodes: ['4024'] },
  { code: '045602', name: 'Cabuyao', type: 'city', provinceCode: '0456000', postalCodes: ['4025'] },
  { code: '045603', name: 'Calamba', type: 'city', provinceCode: '0456000', postalCodes: ['4027'] },
  { code: '045604', name: 'San Pablo', type: 'city', provinceCode: '0456000', postalCodes: ['4000'] },
  { code: '045605', name: 'San Pedro', type: 'city', provinceCode: '0456000', postalCodes: ['4023'] },
  { code: '045606', name: 'Santa Rosa', type: 'city', provinceCode: '0456000', postalCodes: ['4026'] },
  { code: '045607', name: 'Los Baños', type: 'municipality', provinceCode: '0456000', postalCodes: ['4030'] },
  { code: '045608', name: 'Santa Cruz', type: 'municipality', provinceCode: '0456000', postalCodes: ['4009'] },

  // Batangas (Major cities)
  { code: '045801', name: 'Batangas City', type: 'city', provinceCode: '0458000', postalCodes: ['4200'] },
  { code: '045802', name: 'Lipa', type: 'city', provinceCode: '0458000', postalCodes: ['4217'] },
  { code: '045803', name: 'Tanauan', type: 'city', provinceCode: '0458000', postalCodes: ['4232'] },
  { code: '045804', name: 'Santo Tomas', type: 'municipality', provinceCode: '0458000', postalCodes: ['4234'] },

  // Rizal (Major cities)
  { code: '041001', name: 'Antipolo', type: 'city', provinceCode: '0410000', postalCodes: ['1870'] },
  { code: '041002', name: 'Cainta', type: 'municipality', provinceCode: '0410000', postalCodes: ['1900'] },
  { code: '041003', name: 'Taytay', type: 'municipality', provinceCode: '0410000', postalCodes: ['1920'] },
  { code: '041004', name: 'Binangonan', type: 'municipality', provinceCode: '0410000', postalCodes: ['1940'] },
  { code: '041005', name: 'Rodriguez (Montalban)', type: 'municipality', provinceCode: '0410000', postalCodes: ['1860'] },
  { code: '041006', name: 'San Mateo', type: 'municipality', provinceCode: '0410000', postalCodes: ['1850'] },

  // Bulacan (Major cities)
  { code: '031401', name: 'Malolos', type: 'city', provinceCode: '0314000', postalCodes: ['3000'] },
  { code: '031402', name: 'Meycauayan', type: 'city', provinceCode: '0314000', postalCodes: ['3020'] },
  { code: '031403', name: 'San Jose del Monte', type: 'city', provinceCode: '0314000', postalCodes: ['3023'] },
  { code: '031404', name: 'Marilao', type: 'municipality', provinceCode: '0314000', postalCodes: ['3019'] },
  { code: '031405', name: 'Bocaue', type: 'municipality', provinceCode: '0314000', postalCodes: ['3018'] },

  // Pampanga (Major cities)
  { code: '036901', name: 'Angeles', type: 'city', provinceCode: '0369000', postalCodes: ['2009'] },
  { code: '036902', name: 'San Fernando', type: 'city', provinceCode: '0369000', postalCodes: ['2000'] },
  { code: '036903', name: 'Mabalacat', type: 'city', provinceCode: '0369000', postalCodes: ['2010'] },
];

// Barangays (Comprehensive for Imus, sample for other major cities)
export const BARANGAYS: Barangay[] = [
  // Imus, Cavite (All 97 barangays)
  { code: '043405001', name: 'Alapan I-A', cityCode: '043405' },
  { code: '043405002', name: 'Alapan I-B', cityCode: '043405' },
  { code: '043405003', name: 'Alapan I-C', cityCode: '043405' },
  { code: '043405004', name: 'Alapan II-A', cityCode: '043405' },
  { code: '043405005', name: 'Alapan II-B', cityCode: '043405' },
  { code: '043405006', name: 'Anabu I-A', cityCode: '043405' },
  { code: '043405007', name: 'Anabu I-B', cityCode: '043405' },
  { code: '043405008', name: 'Anabu I-C', cityCode: '043405' },
  { code: '043405009', name: 'Anabu I-D', cityCode: '043405' },
  { code: '043405010', name: 'Anabu I-E', cityCode: '043405' },
  { code: '043405011', name: 'Anabu I-F', cityCode: '043405' },
  { code: '043405012', name: 'Anabu I-G', cityCode: '043405' },
  { code: '043405013', name: 'Anabu II-A', cityCode: '043405' },
  { code: '043405014', name: 'Anabu II-B', cityCode: '043405' },
  { code: '043405015', name: 'Anabu II-C', cityCode: '043405' },
  { code: '043405016', name: 'Anabu II-D', cityCode: '043405' },
  { code: '043405017', name: 'Anabu II-E', cityCode: '043405' },
  { code: '043405018', name: 'Anabu II-F', cityCode: '043405' },
  { code: '043405019', name: 'Bagong Silang', cityCode: '043405' },
  { code: '043405020', name: 'Bayan Luma I', cityCode: '043405' },
  { code: '043405021', name: 'Bayan Luma II', cityCode: '043405' },
  { code: '043405022', name: 'Bayan Luma III', cityCode: '043405' },
  { code: '043405023', name: 'Bayan Luma IV', cityCode: '043405' },
  { code: '043405024', name: 'Bayan Luma IX', cityCode: '043405' },
  { code: '043405025', name: 'Bayan Luma V', cityCode: '043405' },
  { code: '043405026', name: 'Bayan Luma VI', cityCode: '043405' },
  { code: '043405027', name: 'Bayan Luma VII', cityCode: '043405' },
  { code: '043405028', name: 'Bayan Luma VIII', cityCode: '043405' },
  { code: '043405029', name: 'Bucandala I', cityCode: '043405' },
  { code: '043405030', name: 'Bucandala II', cityCode: '043405' },
  { code: '043405031', name: 'Bucandala III', cityCode: '043405' },
  { code: '043405032', name: 'Bucandala IV', cityCode: '043405' },
  { code: '043405033', name: 'Bucandala V', cityCode: '043405' },
  { code: '043405034', name: 'Buhay na Tubig', cityCode: '043405' },
  { code: '043405035', name: 'Carsadang Bago I', cityCode: '043405' },
  { code: '043405036', name: 'Carsadang Bago II', cityCode: '043405' },
  { code: '043405037', name: 'Magdalo', cityCode: '043405' },
  { code: '043405038', name: 'Maharlika', cityCode: '043405' },
  { code: '043405039', name: 'Malagasang I-A', cityCode: '043405' },
  { code: '043405040', name: 'Malagasang I-B', cityCode: '043405' },
  { code: '043405041', name: 'Malagasang I-C', cityCode: '043405' },
  { code: '043405042', name: 'Malagasang I-D', cityCode: '043405' },
  { code: '043405043', name: 'Malagasang I-E', cityCode: '043405' },
  { code: '043405044', name: 'Malagasang I-F', cityCode: '043405' },
  { code: '043405045', name: 'Malagasang I-G', cityCode: '043405' },
  { code: '043405046', name: 'Malagasang II-A', cityCode: '043405' },
  { code: '043405047', name: 'Malagasang II-B', cityCode: '043405' },
  { code: '043405048', name: 'Malagasang II-C', cityCode: '043405' },
  { code: '043405049', name: 'Malagasang II-D', cityCode: '043405' },
  { code: '043405050', name: 'Malagasang II-E', cityCode: '043405' },
  { code: '043405051', name: 'Malagasang II-F', cityCode: '043405' },
  { code: '043405052', name: 'Malagasang II-G', cityCode: '043405' },
  { code: '043405053', name: 'Mariano Espeleta I', cityCode: '043405' },
  { code: '043405054', name: 'Mariano Espeleta II', cityCode: '043405' },
  { code: '043405055', name: 'Mariano Espeleta III', cityCode: '043405' },
  { code: '043405056', name: 'Medicion I-A', cityCode: '043405' },
  { code: '043405057', name: 'Medicion I-B', cityCode: '043405' },
  { code: '043405058', name: 'Medicion I-C', cityCode: '043405' },
  { code: '043405059', name: 'Medicion I-D', cityCode: '043405' },
  { code: '043405060', name: 'Medicion II-A', cityCode: '043405' },
  { code: '043405061', name: 'Medicion II-B', cityCode: '043405' },
  { code: '043405062', name: 'Medicion II-C', cityCode: '043405' },
  { code: '043405063', name: 'Medicion II-D', cityCode: '043405' },
  { code: '043405064', name: 'Medicion II-E', cityCode: '043405' },
  { code: '043405065', name: 'Medicion II-F', cityCode: '043405' },
  { code: '043405066', name: 'Palico I', cityCode: '043405' },
  { code: '043405067', name: 'Palico II', cityCode: '043405' },
  { code: '043405068', name: 'Palico III', cityCode: '043405' },
  { code: '043405069', name: 'Palico IV', cityCode: '043405' },
  { code: '043405070', name: 'Pasong Buaya I', cityCode: '043405' },
  { code: '043405071', name: 'Pasong Buaya II', cityCode: '043405' },
  { code: '043405072', name: 'Pinagbuklod', cityCode: '043405' },
  { code: '043405073', name: 'Poblacion I-A', cityCode: '043405' },
  { code: '043405074', name: 'Poblacion I-B', cityCode: '043405' },
  { code: '043405075', name: 'Poblacion I-C', cityCode: '043405' },
  { code: '043405076', name: 'Poblacion II-A', cityCode: '043405' },
  { code: '043405077', name: 'Poblacion II-B', cityCode: '043405' },
  { code: '043405078', name: 'Poblacion III-A', cityCode: '043405' },
  { code: '043405079', name: 'Poblacion III-B', cityCode: '043405' },
  { code: '043405080', name: 'Poblacion IV-A', cityCode: '043405' },
  { code: '043405081', name: 'Poblacion IV-B', cityCode: '043405' },
  { code: '043405082', name: 'Poblacion IV-C', cityCode: '043405' },
  { code: '043405083', name: 'Poblacion IV-D', cityCode: '043405' },
  { code: '043405084', name: 'Real de Imus', cityCode: '043405' },
  { code: '043405085', name: 'Tanzang Luma I', cityCode: '043405' },
  { code: '043405086', name: 'Tanzang Luma II', cityCode: '043405' },
  { code: '043405087', name: 'Tanzang Luma III', cityCode: '043405' },
  { code: '043405088', name: 'Tanzang Luma IV', cityCode: '043405' },
  { code: '043405089', name: 'Tanzang Luma V', cityCode: '043405' },
  { code: '043405090', name: 'Tanzang Luma VI', cityCode: '043405' },
  { code: '043405091', name: 'Toclong I-A', cityCode: '043405' },
  { code: '043405092', name: 'Toclong I-B', cityCode: '043405' },
  { code: '043405093', name: 'Toclong I-C', cityCode: '043405' },
  { code: '043405094', name: 'Toclong II-A', cityCode: '043405' },
  { code: '043405095', name: 'Toclong II-B', cityCode: '043405' },
  { code: '043405096', name: 'Bagong Silang (Bahayang Pag-Asa)', cityCode: '043405' },
  { code: '043405097', name: 'Pag-Asa I', cityCode: '043405' },

  // Bacoor, Cavite (Sample barangays)
  { code: '043401001', name: 'Alima', cityCode: '043401' },
  { code: '043401002', name: 'Aniban I', cityCode: '043401' },
  { code: '043401003', name: 'Aniban II', cityCode: '043401' },
  { code: '043401004', name: 'Aniban III', cityCode: '043401' },
  { code: '043401005', name: 'Aniban IV', cityCode: '043401' },
  { code: '043401006', name: 'Aniban V', cityCode: '043401' },
  { code: '043401007', name: 'Banalo', cityCode: '043401' },
  { code: '043401008', name: 'Bayanan', cityCode: '043401' },
  { code: '043401009', name: 'Campo Santo', cityCode: '043401' },
  { code: '043401010', name: 'Daang Bukid', cityCode: '043401' },
  { code: '043401011', name: 'Digman', cityCode: '043401' },
  { code: '043401012', name: 'Dulong Bayan', cityCode: '043401' },
  { code: '043401013', name: 'Habay I', cityCode: '043401' },
  { code: '043401014', name: 'Habay II', cityCode: '043401' },
  { code: '043401015', name: 'Kaingin', cityCode: '043401' },
  { code: '043401016', name: 'Ligas I', cityCode: '043401' },
  { code: '043401017', name: 'Ligas II', cityCode: '043401' },
  { code: '043401018', name: 'Ligas III', cityCode: '043401' },
  { code: '043401019', name: 'Mabolo I', cityCode: '043401' },
  { code: '043401020', name: 'Mabolo II', cityCode: '043401' },
  { code: '043401021', name: 'Mabolo III', cityCode: '043401' },
  { code: '043401022', name: 'Maliksi I', cityCode: '043401' },
  { code: '043401023', name: 'Maliksi II', cityCode: '043401' },
  { code: '043401024', name: 'Maliksi III', cityCode: '043401' },
  { code: '043401025', name: 'Mambog I', cityCode: '043401' },
  { code: '043401026', name: 'Mambog II', cityCode: '043401' },
  { code: '043401027', name: 'Mambog III', cityCode: '043401' },
  { code: '043401028', name: 'Mambog IV', cityCode: '043401' },
  { code: '043401029', name: 'Mambog V', cityCode: '043401' },
  { code: '043401030', name: 'Molino I', cityCode: '043401' },
  { code: '043401031', name: 'Molino II', cityCode: '043401' },
  { code: '043401032', name: 'Molino III', cityCode: '043401' },
  { code: '043401033', name: 'Molino IV', cityCode: '043401' },
  { code: '043401034', name: 'Molino V', cityCode: '043401' },
  { code: '043401035', name: 'Molino VI', cityCode: '043401' },
  { code: '043401036', name: 'Molino VII', cityCode: '043401' },
  { code: '043401037', name: 'Niog I', cityCode: '043401' },
  { code: '043401038', name: 'Niog II', cityCode: '043401' },
  { code: '043401039', name: 'Niog III', cityCode: '043401' },
  { code: '043401040', name: 'Panapaan I', cityCode: '043401' },
  { code: '043401041', name: 'Panapaan II', cityCode: '043401' },
  { code: '043401042', name: 'Panapaan III', cityCode: '043401' },
  { code: '043401043', name: 'Panapaan IV', cityCode: '043401' },
  { code: '043401044', name: 'Panapaan V', cityCode: '043401' },
  { code: '043401045', name: 'Panapaan VI', cityCode: '043401' },
  { code: '043401046', name: 'Panapaan VII', cityCode: '043401' },
  { code: '043401047', name: 'Panapaan VIII', cityCode: '043401' },
  { code: '043401048', name: 'Queens Row Central', cityCode: '043401' },
  { code: '043401049', name: 'Queens Row East', cityCode: '043401' },
  { code: '043401050', name: 'Queens Row West', cityCode: '043401' },
  { code: '043401051', name: 'Real I', cityCode: '043401' },
  { code: '043401052', name: 'Real II', cityCode: '043401' },
  { code: '043401053', name: 'Salinas I', cityCode: '043401' },
  { code: '043401054', name: 'Salinas II', cityCode: '043401' },
  { code: '043401055', name: 'Salinas III', cityCode: '043401' },
  { code: '043401056', name: 'Salinas IV', cityCode: '043401' },
  { code: '043401057', name: 'San Nicolas I', cityCode: '043401' },
  { code: '043401058', name: 'San Nicolas II', cityCode: '043401' },
  { code: '043401059', name: 'San Nicolas III', cityCode: '043401' },
  { code: '043401060', name: 'Sineguelasan', cityCode: '043401' },
  { code: '043401061', name: 'Tabing Dagat', cityCode: '043401' },
  { code: '043401062', name: 'Talaba I', cityCode: '043401' },
  { code: '043401063', name: 'Talaba II', cityCode: '043401' },
  { code: '043401064', name: 'Talaba III', cityCode: '043401' },
  { code: '043401065', name: 'Talaba IV', cityCode: '043401' },
  { code: '043401066', name: 'Talaba V', cityCode: '043401' },
  { code: '043401067', name: 'Talaba VI', cityCode: '043401' },
  { code: '043401068', name: 'Talaba VII', cityCode: '043401' },
  { code: '043401069', name: 'Zapote I', cityCode: '043401' },
  { code: '043401070', name: 'Zapote II', cityCode: '043401' },
  { code: '043401071', name: 'Zapote III', cityCode: '043401' },
  { code: '043401072', name: 'Zapote IV', cityCode: '043401' },
  { code: '043401073', name: 'Zapote V', cityCode: '043401' },

  // Dasmariñas, Cavite (Sample barangays)
  { code: '043403001', name: 'Salitran I', cityCode: '043403' },
  { code: '043403002', name: 'Salitran II', cityCode: '043403' },
  { code: '043403003', name: 'Salitran III', cityCode: '043403' },
  { code: '043403004', name: 'Salitran IV', cityCode: '043403' },
  { code: '043403005', name: 'Paliparan I', cityCode: '043403' },
  { code: '043403006', name: 'Paliparan II', cityCode: '043403' },
  { code: '043403007', name: 'Paliparan III', cityCode: '043403' },
  { code: '043403008', name: 'Langkaan I', cityCode: '043403' },
  { code: '043403009', name: 'Langkaan II', cityCode: '043403' },
  { code: '043403010', name: 'Emmanuel Bergado I', cityCode: '043403' },
  { code: '043403011', name: 'Emmanuel Bergado II', cityCode: '043403' },
  { code: '043403012', name: 'San Agustin I', cityCode: '043403' },
  { code: '043403013', name: 'San Agustin II', cityCode: '043403' },
  { code: '043403014', name: 'San Agustin III', cityCode: '043403' },
  { code: '043403015', name: 'Sabang', cityCode: '043403' },
  { code: '043403016', name: 'Burol', cityCode: '043403' },
  { code: '043403017', name: 'Victoria Reyes', cityCode: '043403' },
  { code: '043403018', name: 'Zone I (Pob.)', cityCode: '043403' },
  { code: '043403019', name: 'Zone II (Pob.)', cityCode: '043403' },
  { code: '043403020', name: 'Zone III (Pob.)', cityCode: '043403' },
  { code: '043403021', name: 'Zone IV (Pob.)', cityCode: '043403' },

  // General Trias, Cavite (Sample barangays)
  { code: '043404001', name: 'Alingaro', cityCode: '043404' },
  { code: '043404002', name: 'Arnaldo Pob. (Bgy. 7)', cityCode: '043404' },
  { code: '043404003', name: 'Bagumbayan Pob. (Bgy. 5)', cityCode: '043404' },
  { code: '043404004', name: 'Biclatan', cityCode: '043404' },
  { code: '043404005', name: 'Buenavista I', cityCode: '043404' },
  { code: '043404006', name: 'Buenavista II', cityCode: '043404' },
  { code: '043404007', name: 'Buenavista III', cityCode: '043404' },
  { code: '043404008', name: 'Corregidor Pob. (Bgy. 10)', cityCode: '043404' },
  { code: '043404009', name: 'Dulong Bayan Pob. (Bgy. 3)', cityCode: '043404' },
  { code: '043404010', name: 'Governor Ferrer Pob. (Bgy. 1)', cityCode: '043404' },
  { code: '043404011', name: 'Javalera', cityCode: '043404' },
  { code: '043404012', name: 'Manggahan', cityCode: '043404' },
  { code: '043404013', name: 'Navarro', cityCode: '043404' },
  { code: '043404014', name: 'Ninety Sixth Pob. (Bgy. 96)', cityCode: '043404' },
  { code: '043404015', name: 'Panungyanan', cityCode: '043404' },
  { code: '043404016', name: 'Pasong Camachile I', cityCode: '043404' },
  { code: '043404017', name: 'Pasong Camachile II', cityCode: '043404' },
  { code: '043404018', name: 'Pasong Kawayan I', cityCode: '043404' },
  { code: '043404019', name: 'Pasong Kawayan II', cityCode: '043404' },
  { code: '043404020', name: 'Pinagtipunan', cityCode: '043404' },
  { code: '043404021', name: 'Prinza Pob. (Bgy. 9)', cityCode: '043404' },
  { code: '043404022', name: 'San Francisco', cityCode: '043404' },
  { code: '043404023', name: 'San Gabriel Pob. (Bgy. 2)', cityCode: '043404' },
  { code: '043404024', name: 'San Juan I', cityCode: '043404' },
  { code: '043404025', name: 'San Juan II', cityCode: '043404' },
  { code: '043404026', name: 'Santa Clara', cityCode: '043404' },
  { code: '043404027', name: 'Santiago', cityCode: '043404' },
  { code: '043404028', name: 'Santol', cityCode: '043404' },
  { code: '043404029', name: 'Tejero', cityCode: '043404' },
  { code: '043404030', name: 'Vibora Pob. (Bgy. 8)', cityCode: '043404' },

  // Quezon City (Sample barangays)
  { code: '137402001', name: 'Alicia', cityCode: '137402' },
  { code: '137402002', name: 'Bagong Pag-asa', cityCode: '137402' },
  { code: '137402003', name: 'Bahay Toro', cityCode: '137402' },
  { code: '137402004', name: 'Balingasa', cityCode: '137402' },
  { code: '137402005', name: 'Batasan Hills', cityCode: '137402' },
  { code: '137402006', name: 'Commonwealth', cityCode: '137402' },
  { code: '137402007', name: 'Cubao', cityCode: '137402' },
  { code: '137402008', name: 'Diliman', cityCode: '137402' },
  { code: '137402009', name: 'Fairview', cityCode: '137402' },
  { code: '137402010', name: 'Kamuning', cityCode: '137402' },
  { code: '137402011', name: 'Loyola Heights', cityCode: '137402' },
  { code: '137402012', name: 'Novaliches Proper', cityCode: '137402' },
  { code: '137402013', name: 'Old Capitol Site', cityCode: '137402' },
  { code: '137402014', name: 'Payatas', cityCode: '137402' },
  { code: '137402015', name: 'Project 4', cityCode: '137402' },
  { code: '137402016', name: 'Project 6', cityCode: '137402' },
  { code: '137402017', name: 'Project 8', cityCode: '137402' },
  { code: '137402018', name: 'San Antonio', cityCode: '137402' },
  { code: '137402019', name: 'San Bartolome', cityCode: '137402' },
  { code: '137402020', name: 'Tatalon', cityCode: '137402' },
  { code: '137402021', name: 'Teachers Village East', cityCode: '137402' },
  { code: '137402022', name: 'Teachers Village West', cityCode: '137402' },
  { code: '137402023', name: 'UP Campus', cityCode: '137402' },
  { code: '137402024', name: 'Veterans Village', cityCode: '137402' },
  { code: '137402025', name: 'West Triangle', cityCode: '137402' },

  // Makati (Sample barangays)
  { code: '137501001', name: 'Bangkal', cityCode: '137501' },
  { code: '137501002', name: 'Bel-Air', cityCode: '137501' },
  { code: '137501003', name: 'Carmona', cityCode: '137501' },
  { code: '137501004', name: 'Cembo', cityCode: '137501' },
  { code: '137501005', name: 'Comembo', cityCode: '137501' },
  { code: '137501006', name: 'Dasmariñas', cityCode: '137501' },
  { code: '137501007', name: 'Forbes Park', cityCode: '137501' },
  { code: '137501008', name: 'Guadalupe Nuevo', cityCode: '137501' },
  { code: '137501009', name: 'Guadalupe Viejo', cityCode: '137501' },
  { code: '137501010', name: 'Kasilawan', cityCode: '137501' },
  { code: '137501011', name: 'La Paz', cityCode: '137501' },
  { code: '137501012', name: 'Magallanes', cityCode: '137501' },
  { code: '137501013', name: 'Olympia', cityCode: '137501' },
  { code: '137501014', name: 'Palanan', cityCode: '137501' },
  { code: '137501015', name: 'Pembo', cityCode: '137501' },
  { code: '137501016', name: 'Pinagkaisahan', cityCode: '137501' },
  { code: '137501017', name: 'Pio del Pilar', cityCode: '137501' },
  { code: '137501018', name: 'Pitogo', cityCode: '137501' },
  { code: '137501019', name: 'Poblacion', cityCode: '137501' },
  { code: '137501020', name: 'Rizal', cityCode: '137501' },
  { code: '137501021', name: 'San Antonio', cityCode: '137501' },
  { code: '137501022', name: 'San Isidro', cityCode: '137501' },
  { code: '137501023', name: 'San Lorenzo', cityCode: '137501' },
  { code: '137501024', name: 'Santa Cruz', cityCode: '137501' },
  { code: '137501025', name: 'Singkamas', cityCode: '137501' },
  { code: '137501026', name: 'South Cembo', cityCode: '137501' },
  { code: '137501027', name: 'Tejeros', cityCode: '137501' },
  { code: '137501028', name: 'Urdaneta', cityCode: '137501' },
  { code: '137501029', name: 'Valenzuela', cityCode: '137501' },
  { code: '137501030', name: 'West Rembo', cityCode: '137501' },

  // Manila (Sample barangays)
  { code: '137401001', name: 'Binondo', cityCode: '137401' },
  { code: '137401002', name: 'Ermita', cityCode: '137401' },
  { code: '137401003', name: 'Intramuros', cityCode: '137401' },
  { code: '137401004', name: 'Malate', cityCode: '137401' },
  { code: '137401005', name: 'Paco', cityCode: '137401' },
  { code: '137401006', name: 'Pandacan', cityCode: '137401' },
  { code: '137401007', name: 'Port Area', cityCode: '137401' },
  { code: '137401008', name: 'Quiapo', cityCode: '137401' },
  { code: '137401009', name: 'Sampaloc', cityCode: '137401' },
  { code: '137401010', name: 'San Miguel', cityCode: '137401' },
  { code: '137401011', name: 'San Nicolas', cityCode: '137401' },
  { code: '137401012', name: 'Santa Ana', cityCode: '137401' },
  { code: '137401013', name: 'Santa Cruz', cityCode: '137401' },
  { code: '137401014', name: 'Santa Mesa', cityCode: '137401' },
  { code: '137401015', name: 'Tondo', cityCode: '137401' },
];

// Helper functions for location queries
export function getProvincesForCountry(countryCode: string): Province[] {
  if (countryCode === 'PH') {
    return PROVINCES;
  }
  return [];
}

export function getCitiesForProvince(provinceCode: string): City[] {
  return CITIES.filter(city => city.provinceCode === provinceCode);
}

export function getBarangaysForCity(cityCode: string): Barangay[] {
  return BARANGAYS.filter(barangay => barangay.cityCode === cityCode);
}

export function getPostalCodesForCity(cityCode: string): string[] {
  const city = CITIES.find(c => c.code === cityCode);
  return city?.postalCodes || [];
}

export function findProvinceByCode(code: string): Province | undefined {
  return PROVINCES.find(p => p.code === code);
}

export function findCityByCode(code: string): City | undefined {
  return CITIES.find(c => c.code === code);
}

export function findBarangayByCode(code: string): Barangay | undefined {
  return BARANGAYS.filter(b => b.code === code)[0];
}

export function formatAddress(parts: {
  addressLine1: string;
  addressLine2?: string;
  barangayCode: string;
  cityCode: string;
  provinceCode: string;
  postalCode: string;
  countryCode: string;
}): string {
  const barangay = findBarangayByCode(parts.barangayCode);
  const city = findCityByCode(parts.cityCode);
  const province = findProvinceByCode(parts.provinceCode);
  const country = COUNTRIES.find(c => c.code === parts.countryCode);

  const addressParts = [
    parts.addressLine1,
    barangay?.name,
    city?.name,
    province?.name,
    parts.postalCode,
    country?.name,
  ].filter(Boolean);

  return addressParts.join(', ');
}
