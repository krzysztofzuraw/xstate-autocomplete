import { interpret } from 'xstate';

import { autocompleteMachine } from './machine';

describe('autocompleteMachine', () => {
  it('integration tests', done => {
    const autocompleteService = interpret(autocompleteMachine)
      .onTransition(state => {
        if (state.matches({ submitted: 'loaded' })) {
          expect(state.context.results).not.toEqual([]);
          // expect(state.context.query).toEqual('Henryka Brodatego 4, Wrocław');
          done();
        }
      })
      .start();
    autocompleteService.send('SUBMIT', { query: 'Henryka Brodatego 4, Wrocław' });
  });
});
