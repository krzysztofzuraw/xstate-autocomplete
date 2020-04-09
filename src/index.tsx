import * as ReactDOM from 'react-dom';
import React, { FunctionComponent, useState } from 'react';
import { useMachine } from '@xstate/react';
import ReactMapGL from 'react-map-gl';

import { autocompleteMachine } from './machine';
import { Wrapper, Input, Card, List } from './components';

const Root: FunctionComponent = () => {
  const [current, send] = useMachine(autocompleteMachine);
  const { results } = current.context;

  const [viewport, setViewport] = useState({
    width: '100%',
    height: '100%',
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8,
  });

  return (
    <Wrapper>
      <Input onChange={event => send('KEYSTROKE', { query: event.currentTarget.value })} />
      <Card>
        <List items={results} />
        <ReactMapGL
          {...viewport}
          mapStyle="mapbox://styles/kzuraw/ck8hi7zg4078l1iohbssemlzu"
          // onViewportChange={setViewport}
          mapboxApiAccessToken={process.env.MAPBOX_TOKEN}
        />
      </Card>
    </Wrapper>
  );
};

ReactDOM.render(<Root />, document.getElementById('root') as HTMLElement);
