import { task, src, series } from 'gulp';
import { source } from '../config';
import * as clean from 'gulp-clean';

/**
 * Cleans the build output assets from the packages folders (but don't touch node_modules!!!!)
 */
function cleanOutputProd() {
  return src([`${source}/**/dist`, `!${source}/**/node_modules/**`], {
    read: false,
  }).pipe(clean());
}

/**
 * Cleans the build output assets from the root node_modules folders)
 */
function cleanOutputDev() {
  return src([`node_modules/@famalabs/`], {
    read: false,
    allowEmpty: true,
  }).pipe(clean());
}

task('clean:prod', cleanOutputProd);
task('clean:dev', cleanOutputDev);
