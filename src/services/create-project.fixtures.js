// @flow
import type { ProjectInternal } from '../types';

// Fake data for manually testing project-creation flow.
export const FAKE_CRA_PROJECT: ProjectInternal = {
  name: 'haidddd',
  version: '0.1.0',
  private: true,
  dependencies: {
    react: '^16.4.0',
    'react-dom': '^16.4.0',
    'react-scripts': '1.1.4',
  },
  scripts: {
    start: 'react-scripts start',
    build: 'react-scripts build',
    test: 'react-scripts test --env=jsdom',
    eject: 'react-scripts eject',
  },
  __skpm_createdAt: Date.now(),
};
