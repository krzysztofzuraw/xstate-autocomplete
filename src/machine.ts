import { Machine, assign } from 'xstate';
import geocodingClient, { GeocodeService } from '@mapbox/mapbox-sdk/services/geocoding';
import { BehaviorSubject } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';

import { MapboxResponse, GeocodeResult } from './models';

const fetchGeocodingService = (context: Context, geocodingService: GeocodeService) => {
  return geocodingService
    .forwardGeocode({
      query: context.querySubject.getValue(),
      mode: 'mapbox.places',
      countries: ['PL'],
      limit: 5,
      types: ['address'],
    })
    .send()
    .then(response => transformResponse(response.body));
};

const transformResponse = (response: MapboxResponse): GeocodeResult[] => {
  return response.features.map(feature => ({
    text: feature.text,
    id: feature.id,
    zipCode: feature.context.find(ctx => ctx.id.startsWith('postcode'))?.text ?? '',
    place: feature.context.find(ctx => ctx.id.startsWith('place'))?.text ?? '',
    region: feature.context.find(ctx => ctx.id.startsWith('region'))?.text ?? '',
    country: feature.context.find(ctx => ctx.id.startsWith('country'))?.text ?? '',
    center: feature.center,
    type: feature.place_type,
  }));
};

const debounceKeystrokes = (subject: BehaviorSubject<string>) =>
  subject.pipe(
    debounceTime(300),
    filter(value => value.length > 2),
    map(value => ({ type: 'STOPED', value }))
  );

export type Context = {
  results: GeocodeResult[];
  querySubject: BehaviorSubject<string>;
};

type Event = {
  type: string;
  // fix typing here
  query: string;
  features: string[];
};

export const autocompleteMachine = Machine<Context, Event>(
  {
    id: 'autocomplete',
    initial: 'idle',
    context: {
      results: [],
      querySubject: new BehaviorSubject(''),
    },
    states: {
      idle: {
        on: {
          KEYSTROKE: {
            target: 'startedTyping',
          },
        },
      },
      startedTyping: {
        on: {
          KEYSTROKE: {
            actions: (context, event) => context.querySubject.next(event.query),
          },
          STOPED: {
            target: 'stopedTyping',
          },
        },
        invoke: {
          src: context => debounceKeystrokes(context.querySubject),
        },
      },
      stopedTyping: {
        invoke: {
          id: 'autocomplete-query',
          src: 'geocodeQuery',
          onDone: {
            target: 'loaded',
            actions: assign({
              results: (_context, event) => event.data,
            }),
          },
          onError: 'failed',
        },
      },
      loaded: {
        on: {
          KEYSTROKE: {
            target: 'idle',
          },
        },
      },
      failed: {},
    },
  },
  {
    services: {
      geocodeQuery: context =>
        fetchGeocodingService(
          context,
          geocodingClient({
            accessToken: process.env.MAPBOX_TOKEN || '',
          })
        ),
    },
  }
);

export const selectedPointMachine = Machine<
  { center: null | readonly [number, number] },
  { type: string; center: [number, number] }
>({
  id: 'selectedPointMachine',
  context: {
    center: null,
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        SELECTED: {
          target: 'selected',
          actions: assign({
            center: (_context, event) => event.center,
          }),
        },
      },
    },
    selected: {
      on: {
        SELECTED: {
          target: 'selected',
          actions: assign({
            center: (_context, event) => event.center,
          }),
        },
      },
    },
  },
});
