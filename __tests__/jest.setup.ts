import React from 'react';
import { setConfig } from 'next/config';
import '@testing-library/jest-dom';
import config from '../next.config';

// extends jest expect with jest-dom matchers

// Mock icon packages to avoid jest compilation errors.
jest.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        return (props) =>
          React.createElement('svg', { ...props, 'data-icon': prop });
      },
    }
  );
});
jest.mock('react-icons/lu', () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        return (props) =>
          React.createElement('svg', { ...props, 'data-icon': prop });
      },
    }
  );
});

// Make sure you can use "publicRuntimeConfig" within tests.
setConfig(config);
