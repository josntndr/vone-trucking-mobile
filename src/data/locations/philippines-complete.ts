import dataset from './philippines-psgc-2026-q2.json';

export type CityType =
  | 'highly_urbanized_city'
  | 'independent_component_city'
  | 'component_city'
  | 'municipality';

export interface DatasetMeta {
  release: string;
  asOf: string;
  source: string;
  sourceUrl: string;
  publication: string;
  generatedAt: string;
  expectedCounts: {
    regions: number;
    provinces: number;
    highlyUrbanizedCities: number;
    independentComponentCities: number;
    componentCities: number;
    cities: number;
    municipalities: number;
    barangays: number;
  };
}

export interface Country {
  code: string;
  name: string;
}

export interface Region {
  code: string;
  name: string;
  hasProvinces: boolean;
}

export interface Province {
  code: string;
  name: string;
  regionCode: string;
}

export interface City {
  code: string;
  name: string;
  type: CityType;
  regionCode: string;
  provinceCode: string | null;
  postalCodes?: string[];
}

export interface Barangay {
  code: string;
  name: string;
  regionCode: string;
  provinceCode: string | null;
  cityMunicipalityCode: string;
}

type PsgcDataset = {
  meta: DatasetMeta;
  countries: Country[];
  regions: Region[];
  provinces: Province[];
  citiesMunicipalities: City[];
  barangays: Barangay[];
};

const psgcDataset = dataset as PsgcDataset;

export const PSGC_DATASET_META = psgcDataset.meta;
export const COUNTRIES = psgcDataset.countries;
export const REGIONS = psgcDataset.regions;
export const PROVINCES = psgcDataset.provinces;
export const CITIES = psgcDataset.citiesMunicipalities;
export const BARANGAYS = psgcDataset.barangays;
