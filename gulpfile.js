const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const watchify = require('watchify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const minimist = require('minimist');
const gulpLoadPlugins = require('gulp-load-plugins');

const $ = gulpLoadPlugins();
const options = minimist(process.argv.slice(2), {
  alias: {
    p: 'production'
  },
  default: {
    production: false
  }
});

function bundle(watching) {
  const b = browserify({
    entries: ['resources/assets/js/app.js'],
    transform: ['babelify'],
    debug: true,
    plugin: (watching) ? [watchify] : null
  })
  .on('update', () => {
    console.log('rebuild js start');
    bundler().on('end', ()=> console.log('rebuild js succeed'));
  });

  function bundler() {
    return b.bundle()
      .on('error', (err) => console.log(err.message))
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(options.production ? $.nop() : $.sourcemaps.init({loadMaps: true}))
      .pipe($.uglify())
      .pipe(options.production ? $.nop() : $.sourcemaps.write('./'))
      .pipe(gulp.dest('public/js/'));
  }

  return bundler();
}

gulp.task('js', () => bundle());

gulp.task('watch', () => bundle(true));

gulp.task('w', ['watch']);

gulp.task('default', ['js']);
