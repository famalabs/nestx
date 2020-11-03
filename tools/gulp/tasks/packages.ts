import { source, packagePaths } from '../config';
import { task, watch, series, dest } from 'gulp';
import { createProject } from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import * as log from 'fancy-log';

// Has to be a hardcoded object due to build order
const packages = {
  core: createProject('packages/core/tsconfig.json'),
  auth: createProject('packages/auth/tsconfig.json'),
};

const modules = Object.keys(packages); //modules is an array with keys of packages folder as item

const distId = process.argv.indexOf('--dist'); //if --dist is provided in gulp build via console
const dist = distId < 0 ? source : process.argv[distId + 1]; //if the index of --dist is <0 (no --dist param) then dist=source. Otherwise dist=process.argv[distId+1] e.g. gulp build --dist dir1 then dist=dir1

/**
 * Watches the packages/* folder and
 * builds the package on file change
 */
function defaultTask() {
  log.info('Watching files..');
  modules.forEach(packageName => {
    watch([`${source}/${packageName}/**/*.ts`, `${source}/${packageName}/*.ts`], series(packageName));
  });
}

/**
 * Builds the given package in dist/packageName
 * @param packageName The name of the package
 */
function buildPackage(packageName: string) {
  return packages[packageName]
    .src()
    .pipe(packages[packageName]())
    .pipe(dest(`${dist}/${packageName}`));
}

/**
 * Builds the given package and adds sourcemaps
 * @param packageName The name of the package
 */
function buildPackageDev(packageName: string) {
  return packages[packageName]
    .src()
    .pipe(sourcemaps.init())
    .pipe(packages[packageName]())
    .pipe(sourcemaps.mapSources((sourcePath: string) => './' + sourcePath.split('/').pop()))
    .pipe(sourcemaps.write('.', {}))
    .pipe(dest(`${dist}/${packageName}`));
}

modules.forEach(packageName => {
  //foreach packageName in modules
  task(packageName, () => buildPackage(packageName)); // create a task that when gulp packageName is invoked from cli then buildPackage(packageName) is executed
  task(`${packageName}:dev`, () => buildPackageDev(packageName)); //create a task that when gulp packageName:dev is invoked from cli then buildPackageDEv(packageName) is executed
});

/**
 * when gulp common:dev is invoked:
 * 1) Return an array like modules where packageName are packageName:dev.
 * 2)After this all task created before (see modules.foreach above) are executed in sequential order. (only packageName:dev tasks)
 */
task('common:dev', series(modules.map(packageName => `${packageName}:dev`)));

/**
 * When gulp build is invoked then all modules task created before (see modules.foreach above) are executed in sequential order.  (only packageName tasks)
 */
task('build', series(modules));

/**
 * when gulp build:dev is invoked execute common:dev task
 */
task('build:dev', series('common:dev'));

/**
 * when gulp default is invoken, defaultTask is executed
 */
task('default', defaultTask);
