import { interpret } from 'xstate';

import { autocompleteMachine, Context } from './machine';

const mockFetchGeocodingService = async (_context: Context, _service: {}) => {
  return {
    text: 'OMG',
  };
};

describe('autocompleteMachine', () => {
  // it('integration tests', done => {
  //   const autocompleteService = interpret(autocompleteMachine)
  //     .onTransition(state => {
  //       if (state.matches({ submitted: 'loaded' })) {
  //         expect(state.context.results).not.toEqual([]);
  //         // expect(state.context.query).toEqual('Henryka Brodatego 4, Wrocław');
  //         done();
  //       }
  //     })
  //     .start();
  //   autocompleteService.send('SUBMIT', { query: 'Henryka Brodatego 4, Wrocław' });
  // });

  const autocompleteTestMachine = autocompleteMachine.withConfig({
    services: {
      geocodeQuery: context => mockFetchGeocodingService(context, {}),
    },
  });

  it('should work', () => {
    const autocompleteService = interpret(autocompleteTestMachine)
      .onTransition(state => {
        if (state.matches('loaded')) {
          expect(state.context.results).toEqual([]);
        }
      })
      .start();

    autocompleteService.send('KEYSTROKE', { query: 'SUPER' });
  });
});
