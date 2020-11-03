import { task, src, dest } from 'gulp';
import { packagePaths } from '../config';

/**
 * Copies assets like Readme.md or LICENSE from the project base path
 * to all the packages.
 */
function copyMisc(): NodeJS.ReadWriteStream {
  copyFromPackage(() => {});
  return copyFromRoot();
}

function copyFromRoot(): NodeJS.ReadWriteStream {
  const miscFiles = src(['LICENSE']);
  // Since `dest()` does not take a string-array, we have to append it
  // ourselves
  return packagePaths.reduce((stream, packagePath) => stream.pipe(dest(`${packagePath}/dist`)), miscFiles);
}

function copyFromPackage(done: () => void) {
  packagePaths.forEach(packagePath =>
    src([`${packagePath}/README.md`, `${packagePath}/package.json`]).pipe(dest(`${packagePath}/dist`)),
  );
  done();
}
task('copy-misc', copyMisc);
