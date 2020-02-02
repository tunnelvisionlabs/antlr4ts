const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const gulpif = require('gulp-if');

const tsProj = ts.createProject('tsconfig.json');

const babelConfig = {
  "presets": [
    // Target supported browser environments
    ["@babel/preset-env", { "targets": "> 0.25%, not dead" }]
  ],
  "plugins": [
    // Enable generator runtime support
    ["@babel/plugin-transform-runtime", { "regenerator": true }]
  ],
};

function build() {
  return gulp.src('src/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(tsProj())
    .pipe(gulpif(/[.]js$/, babel(babelConfig)))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('target/src'));
};

exports.default = build;