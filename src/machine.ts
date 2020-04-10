import { Machine, assign } from 'xstate';
import geocodingClient from '@mapbox/mapbox-sdk/services/geocoding';
import { BehaviorSubject } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';

import { ForwardGeocodeResponse } from './models';

const geocodingService = geocodingClient({
  accessToken: process.env.MAPBOX_TOKEN ?? '',
});

const invokeAutocompleteQuery = (context: Context) => {
  return geocodingService
    .forwardGeocode({
      query: context.querySubject.getValue(),
      mode: 'mapbox.places',
      countries: ['PL'],
      limit: 5,
      types: ['address'],
    })
    .send()
    .then(response => transformReponse(response.body));
};

const transformReponse = (response: any) => {
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

type Context = {
  results: ForwardGeocodeResponse[];
  querySubject: BehaviorSubject<string>;
};

type Event = {
  type: string;
  query: string;
  features: string[];
};

export const autocompleteMachine = Machine<Context, Event>({
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
        src: invokeAutocompleteQuery,
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
});
