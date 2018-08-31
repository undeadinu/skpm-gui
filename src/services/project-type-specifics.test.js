import { getDocumentationLink } from './project-type-specifics';

describe('getDocumentationLink', () => {
  it('should get the documentation link', () => {
    const documentationLink = getDocumentationLink();

    expect(typeof documentationLink).toEqual('string');
  });
});
