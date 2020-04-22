import { Machine, assign } from 'xstate';
import geocodingClient, { GeocodeService } from '@mapbox/mapbox-sdk/services/geocoding';
import { BehaviorSubject } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';

import { MapboxResponse, GeocodeResult } from './models';

const fetchGeocodingService = (context: AutoCompleteContext, geocodingService: GeocodeService) => {
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

export type AutoCompleteContext = {
  results: GeocodeResult[];
  querySubject: BehaviorSubject<string>;
};

type AutocompleteEvent = { type: 'KEYSTROKE'; query: string } | { type: 'STOPPED' };

export const autocompleteMachine = Machine<AutoCompleteContext, AutocompleteEvent>(
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
          STOPPED: {
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

type SelectedPointContext = { center: null | readonly [number, number] };
type SelectedPointEvent = { type: 'SELECTED'; center: readonly [number, number] };

export const selectedPointMachine = Machine<SelectedPointContext, SelectedPointEvent>({
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
