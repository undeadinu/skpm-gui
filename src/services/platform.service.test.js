// @flow
import path from 'path';

import { getBaseProjectEnvironment, isWin } from './platform.service';

const pathKey = isWin ? 'Path' : 'PATH';

describe('Platform service', () => {
  describe('getBaseProjectEnvironment', () => {
    it('returns a valid PATH', () => {
      const baseEnv = getBaseProjectEnvironment('hello-world', {
        [pathKey]: 'existingPATH',
      });

      expect(baseEnv[pathKey]).toBeTruthy();
      expect(
        baseEnv[pathKey].indexOf(
          path.join('existingPATH', 'hello-world', 'node_modules', '.bin')
        )
      ).toBeGreaterThan(0);
    });

    it('includes FORCE_COLOR: true', () => {
      const baseEnv = getBaseProjectEnvironment('hello-world', {
        [pathKey]: 'existingPATH',
      });

      expect(baseEnv.FORCE_COLOR).toBe(true);
    });
  });
});
