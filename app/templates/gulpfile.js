const { src, dest, watch, series, parallel, lastRun } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const autoprefixer = require('autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('cssnano');
const { argv } = require('yargs');

const $ = gulpLoadPlugins();
const server = browserSync.create();
const port = argv.port || 9000;

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const isDev = !isProd && !isTest;

// Task for styles
function styles() {
  return src('app/styles/*.scss', { sourcemaps: !isProd })
    .pipe($.plumber())
    .pipe(sass.sync({ outputStyle: 'expanded', precision: 10, includePaths: ['.'] })
      .on('error', sass.logError))
    .pipe($.postcss([autoprefixer()]))
    .pipe(dest('.tmp/styles', { sourcemaps: !isProd }))
    .pipe(server.reload({ stream: true }));
}

// Task for scripts
function scripts() {
  return src('app/scripts/**/*.js', { sourcemaps: !isProd })
    .pipe($.plumber())
    .pipe($.babel())
    .pipe(dest('.tmp/scripts', { sourcemaps: !isProd ? '.' : false }))
    .pipe(server.reload({ stream: true }));
}

// Task for linting
function lint() {
  return src('app/scripts/**/*.js')
    .pipe($.eslint({ fix: true }))
    .pipe(server.reload({ stream: true, once: true }))
    .pipe($.eslint.format())
    .pipe($.if(!server.active, $.eslint.failAfterError()))
    .pipe(dest('app/scripts'));
}

// Task for HTML processing
function html() {
  return src('app/*.html')
    .pipe($.useref({ searchPath: ['.tmp', 'app', '.'] }))
    .pipe($.if(/\.js$/, $.uglify({ compress: { drop_console: true } })))
    .pipe($.if(/\.css$/, $.postcss([cssnano({ safe: true, autoprefixer: false })])))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: { compress: { drop_console: true } },
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(dest('dist'));
}

// Task for images optimization
function images() {
  return src('app/images/**/*', { since: lastRun(images) })
    .pipe($.imagemin())
    .pipe(dest('dist/images'));
}

// Task for fonts
function fonts() {
  return src('app/fonts/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe($.if(!isProd, dest('.tmp/fonts'), dest('dist/fonts')));
}

// Task for extras
function extras() {
  return src(['app/*', '!app/*.html'], { dot: true })
    .pipe(dest('dist'));
}

// Task for cleaning
function clean() {
  return del(['.tmp', 'dist']);
}

// Measure size of build
function measureSize() {
  return src('dist/**/*')
    .pipe($.size({ title: 'build', gzip: true }));
}

// Build process
const build = series(
  clean,
  parallel(lint, series(parallel(styles, scripts), html), images, fonts, extras),
  measureSize
);

// Development server
function startAppServer() {
  server.init({
    notify: false,
    port,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });

  watch(['app/*.html', 'app/images/**/*', '.tmp/fonts/**/*']).on('change', server.reload);
  watch('app/styles/**/*.scss', styles);
  watch('app/scripts/**/*.js', scripts);
  watch('app/fonts/**/*', fonts);
}

// Choose server based on environment
let serve;
if (isDev) {
  serve = series(clean, parallel(styles, scripts, fonts), startAppServer);
} else if (isTest) {
  serve = series(clean, scripts, startAppServer);
} else if (isProd) {
  serve = series(build, startAppServer);
}

exports.serve = serve;
exports.build = build;
exports.default = build;


 
  


   
   
   
     
    

 
    
}
function lint() {
  return lintBase('app/scripts/**/*.js', { fix: true })
    .pipe(dest('app/scripts'));
};
function lintTest() {
  return lintBase('test/spec/**/*.js');
};

function html() {
  return src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.postcss([cssnano({safe: true, autoprefixer: false})])))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(dest('dist'));
}

function images() {
  return src('app/images/**/*', { since: lastRun(images) })
    .pipe($.imagemin())
    .pipe(dest('dist/images'));
};

function fonts() {
  return src('app/fonts/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe($.if(!isProd, dest('.tmp/fonts'), dest('dist/fonts')));
};

function extras() {
  return src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(dest('dist'));
};

function clean() {
  return del(['.tmp', 'dist'])
}

function measureSize() {
  return src('dist/**/*')
    .pipe($.size({title: 'build', gzip: true}));
}

const build = series(
  clean,
  parallel(
    lint,
    <%_ if (includeModernizr) { -%>
    series(parallel(styles, scripts, modernizr), html),
    <%_ } else { -%>
    series(parallel(styles, scripts), html),
    <%_ } -%>
    images,
    fonts,
    extras
  ),
  measureSize
);

function startAppServer() {
  server.init({
    notify: false,
    port,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });

  watch([
    'app/*.html',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', server.reload);

  <%_ if (includeSass) { -%>
  watch('app/styles/**/*.scss', styles);
  <%_ } else { -%>
  watch('app/styles/**/*.css', styles);
  <%_ } -%>
  watch('app/scripts/**/*.js', scripts);
  <%_ if (includeModernizr) { -%>
  watch('modernizr.json', modernizr);
  <%_ } -%>
  watch('app/fonts/**/*', fonts);
}

function startTestServer() {
  server.init({
    notify: false,
    port,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/node_modules': 'node_modules'
      }
    }
  });

  watch('test/index.html').on('change', server.reload);
  watch('app/scripts/**/*.js', scripts);
  watch('test/spec/**/*.js', lintTest);
}

function startDistServer() {
  server.init({
    notify: false,
    port,
    server: {
      baseDir: 'dist',
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });
}

let serve;
if (isDev) {
  <%_ if (includeModernizr) { -%>
  serve = series(clean, parallel(styles, scripts, modernizr, fonts), startAppServer);
  <%_ } else { -%>
  serve = series(clean, parallel(styles, scripts, fonts), startAppServer);
  <%_ } -%>
} else if (isTest) {
  serve = series(clean, scripts, startTestServer);
} else if (isProd) {
  serve = series(build, startDistServer);
}

exports.serve = serve;
exports.build = build;
exports.default = build;
