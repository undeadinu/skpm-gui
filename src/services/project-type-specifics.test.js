import { getDocumentationLink } from './project-type-specifics';

import type { ProjectType } from '../types';

describe('getDocumentationLink', () => {
  it('should get the documentation link', () => {
    const documentationLink = getDocumentationLink();

    expect(typeof documentationLink).toEqual('string');
  });
});
