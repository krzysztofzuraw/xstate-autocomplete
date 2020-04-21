import { interpret } from 'xstate';

import { autocompleteMachine, Context } from './machine';
import { GeocodeResult } from './models';

const mockedRespnse: GeocodeResult = {
  text: 'henryka',
  id: '42',
  zipCode: '50-043',
  place: 'Henryka',
  region: 'Dolnoslaskie',
  country: 'PL',
  center: [52, 17],
  type: ['address'],
};

const mockFetchGeocodingService = async (_context: Context, _service: {}) => {
  return [mockedRespnse];
};

describe('autocompleteMachine', () => {
  const autocompleteTestMachine = autocompleteMachine.withConfig({
    services: {
      geocodeQuery: context => mockFetchGeocodingService(context, {}),
    },
  });

  it('should send request to geocode when user stoped typing', () => {
    const autocompleteService = interpret(autocompleteTestMachine)
      .onTransition(state => {
        if (state.matches('loaded')) {
          expect(state.context.results).toEqual([mockedRespnse]);
        }
      })
      .start();

    autocompleteService.send('KEYSTROKE', { query: 'h' });
    autocompleteService.send('KEYSTROKE', { query: 'e' });
    autocompleteService.send('KEYSTROKE', { query: 'n' });
    autocompleteService.send('STOPED');
  });
});
