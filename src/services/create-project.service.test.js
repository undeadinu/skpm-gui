import { getBuildInstructions } from './create-project.service';

jest.mock('os', () => ({
  homedir: jest.fn(),
  platform: () => process.platform,
}));

jest.mock('../reducers/paths.reducer.js', () => ({
  defaultParentPath: 'test',
}));

jest.mock('../services/platform.service', () => ({
  formatCommandForPlatform: cmd => cmd,
}));

describe('getBuildInstructions', () => {
  const name = '/some/path/id';
  const id = 'id';

  it('should return the build instructions for a `empty` project', () => {
    const expectedOutput = [
      'npx',
      'create-sketch-plugin@1.1.5',
      id,
      '--name=' + name,
    ];
    expect(getBuildInstructions('empty', { name, id })).toEqual(expectedOutput);
  });

  it('should return the build instructions for a `webview` project', () => {
    const expectedOutput = [
      'npx',
      'create-sketch-plugin@1.1.5',
      id,
      '--name=' + name,
      '--template=skpm/with-webview',
    ];
    expect(getBuildInstructions('webview', { name, id })).toEqual(
      expectedOutput
    );
  });

  it('should throw an exception when passed an unknown project type', () => {
    const projectType = 'some-unknown-project-type';

    expect(() => getBuildInstructions(projectType, { name, id })).toThrowError(
      `Unrecognized project type: ${projectType}`
    );
  });
});
