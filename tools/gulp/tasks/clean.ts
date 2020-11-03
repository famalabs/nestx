import { task, src, series } from 'gulp';
import { source } from '../config';
import * as clean from 'gulp-clean';

/**
 * Cleans the build output assets from the packages folders (but don't touch node_modules!!!!)
 */
function cleanOutput() {
  return src([`${source}/**/dist`, `!${source}/**/node_modules/**`], {
    read: false,
  }).pipe(clean());
}

task('clean:output', cleanOutput);
task('clean:bundle', series('clean:output'));
