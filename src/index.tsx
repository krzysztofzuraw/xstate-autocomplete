import * as ReactDOM from 'react-dom';
import React, { FunctionComponent } from 'react';
import { useMachine } from '@xstate/react';

import { autocompleteMachine, selectedPointMachine } from './machine';
import { Wrapper, Input, Card, List, Map } from './components';

const Root: FunctionComponent = () => {
  const [autocompleteState, sendEventToAutocompleteMachine] = useMachine(autocompleteMachine);
  const [selectedPointState, sendEventToPointMachine] = useMachine(selectedPointMachine);
  const { results } = autocompleteState.context;
  const { center } = selectedPointState.context;

  return (
    <Wrapper>
      <Input
        onChange={event =>
          sendEventToAutocompleteMachine('KEYSTROKE', { query: event.currentTarget.value })
        }
      />
      <Card>
        <List items={results} onClick={center => sendEventToPointMachine('SELECTED', { center })} />
        <Map center={center} />
      </Card>
    </Wrapper>
  );
};

ReactDOM.render(<Root />, document.getElementById('root') as HTMLElement);
