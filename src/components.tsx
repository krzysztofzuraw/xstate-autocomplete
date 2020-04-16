import { classnames, focus } from 'tailwindcss-classnames';
import React, { FunctionComponent, FormEventHandler, useState, useEffect } from 'react';
import MapGL, { Marker } from 'react-map-gl';
import useGeolocation from 'react-hook-geolocation';

import { GeocodeResult } from './models';

export const Wrapper: FunctionComponent = ({ children }) => (
  <div
    className={classnames(
      'mx-auto',
      'container',
      'h-screen',
      'grid' as any,
      'gap-1' as any,
      'grid-rows-4' as any,
      'grid-flow-col' as any
    )}
  >
    {children}
  </div>
);

export const Input: FunctionComponent<{
  onChange?: FormEventHandler<HTMLInputElement>;
}> = ({ onChange }) => (
  <div
    className={classnames(
      'row-start-1' as any,
      'row-end-2' as any,
      'flex',
      'justify-center',
      'items-center'
    )}
  >
    <input
      className={classnames(
        focus('outline-none'),
        focus('shadow-outline'),
        'border',
        'border-gray-300',
        'rounded-lg',
        'py-2',
        'px-4',
        'block',
        'w-1/2',
        'appearance-none',
        'leading-normal',
        'shadow-lg'
      )}
      type="text"
      placeholder="Your address"
      onChange={onChange}
    />
  </div>
);

export const Card: FunctionComponent = ({ children }) => (
  <div
    className={classnames(
      'row-start-2' as any,
      'row-end-5' as any,
      'lg:row-end-4' as any,
      'border',
      'border-gray-300',
      'bg-white',
      'rounded-lg',
      'shadow-lg',
      'grid' as any,
      'grid-cols-1' as any,
      'lg:grid-cols-2' as any
    )}
  >
    {children}
  </div>
);

export const List: FunctionComponent<{
  items: GeocodeResult[];
  onClick: (center: readonly [number, number]) => void;
}> = ({ items, onClick }) => (
  <div className={classnames('p-4', 'flex', 'overflow-auto')}>
    {items.length !== 0 ? (
      <ul className={classnames('w-full', 'flex', 'flex-col')}>
        {items.map(result => (
          <li
            onClick={() => onClick(result.center)}
            key={result.id}
            className={classnames(
              'border',
              'border-gray-400',
              'p-5',
              'rounded-lg',
              'shadow-lg',
              'mb-4'
            )}
          >
            <div className={classnames('flex', 'items-baseline', 'justify-between', 'my-3')}>
              <span className={classnames('font-bold', 'text-xl', 'mr-5')}>{result.text}</span>
              <span className={classnames('text-sm', 'font-thin', 'text-grey-darker' as any)}>
                {result.place}
              </span>
            </div>
            <div className={classnames('flex', 'items-baseline', 'justify-between', 'mt-2')}>
              <span className={classnames('font-semibold', 'text-lg', 'text-blue-400')}>
                {result.zipCode}
              </span>
              <div>
                <span
                  className={classnames(
                    'text-sm',
                    'font-thin',
                    'text-grey-darker' as any,
                    'mr-3',
                    'bg-green-300',
                    'p-2',
                    'rounded-sm'
                  )}
                >
                  {result.region}
                </span>
                <span
                  className={classnames(
                    'text-sm',
                    'font-thin',
                    'text-grey-darker' as any,
                    'bg-orange-300',
                    'p-2',
                    'rounded-sm'
                  )}
                >
                  {result.country}
                </span>
              </div>
            </div>
            <div className={classnames('flex', 'items-baseline', 'mt-2')}>
              {result.type.map((type, idx) => (
                <span
                  key={`${type}-${idx}`}
                  className={classnames(
                    'text-xs',
                    'font-hairline',
                    'bg-gray-200',
                    'p-1',
                    'rounded-sm',
                    'mr-3'
                  )}
                >
                  {type}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p
        className={classnames(
          'text-base',
          'font-thin',
          'tracking-wide',
          'leading-relaxed',
          'text-gray-500',
          'm-auto'
        )}
      >
        Type address above to see the results
      </p>
    )}
  </div>
);

export const Map: React.FunctionComponent<{ center: readonly [number, number] | null }> = ({
  center,
}) => {
  const [viewport, setViewport] = useState({
    latitude: 51.107,
    longitude: 17.038,
    zoom: 12,
  });
  useGeolocation({}, geolocation =>
    setViewport({ ...viewport, latitude: geolocation.latitude, longitude: geolocation.longitude })
  );
  useEffect(() => {
    if (center) {
      setViewport({ ...viewport, latitude: center[1], longitude: center[0] });
    }
  }, [center]);
  return (
    <MapGL
      {...viewport}
      width="100%"
      height="100%"
      mapStyle="mapbox://styles/kzuraw/ck8hi7zg4078l1iohbssemlzu"
      onViewportChange={setViewport}
      mapboxApiAccessToken={process.env.MAPBOX_TOKEN}
    >
      {center && (
        <Marker longitude={center[0]} latitude={center[1]}>
          PIN
        </Marker>
      )}
    </MapGL>
  );
};
