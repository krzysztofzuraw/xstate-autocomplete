export type ForwardGeocodeResponse = {
  id: string;
  matching_place_name: string;
};

export type GeocodeResult = {
  id: number;
  text: string;
  zipCode: string;
  place: string;
  region: string;
  country: string;
  center: readonly [number, number];
  type: string[];
};
