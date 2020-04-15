export type GeocodeResult = {
  id: string;
  text: string;
  zipCode: string;
  place: string;
  region: string;
  country: string;
  center: readonly [number, number];
  type: string[];
};

export type MapboxResponse = {
  features: {
    text: string;
    id: string;
    context: { id: string; text: string }[];
    center: [number, number];
    place_type: string[];
  }[];
};
