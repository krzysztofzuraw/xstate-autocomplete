import * as ReactDOM from 'react-dom';
import React, { FunctionComponent } from 'react';
import { useMachine } from '@xstate/react';

import { autocompleteMachine } from './machine';
import { Wrapper, Input, Card, List, Map } from './components';

const Root: FunctionComponent = () => {
  const [current, send] = useMachine(autocompleteMachine);
  const { results } = current.context;

  return (
    <Wrapper>
      <Input onChange={event => send('KEYSTROKE', { query: event.currentTarget.value })} />
      <Card>
        <List items={results} />
        <Map />
      </Card>
    </Wrapper>
  );
};

ReactDOM.render(<Root />, document.getElementById('root') as HTMLElement);
