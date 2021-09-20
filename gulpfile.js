// Gulp
const gulp = require("gulp");
// Polyfill - es6 support for old browsers
const babel = require("gulp-babel");
// Concatenation - merge files
const concat = require("gulp-concat");
// Uglify - JS minimization
const uglify = require("gulp-uglify");
// Sass - css preprocessor
const sass = require("gulp-sass");
// Autoprefixer - adding css vendor prefixes during preprocessing
const autoprefixer = require("gulp-autoprefixer");
// cleanCss - CSS minimization
const cleanCSS = require("gulp-clean-css");
// inject - injecting html templates in a html files
const inject = require("gulp-inject");
// Rename - rename files
const rename = require("gulp-rename");
// sourcemaps - adding source map files for JS and CSS
const sourcemaps = require("gulp-sourcemaps");
// Browser Sync - page refresh and style injection on changes
const browserSync = require("browser-sync");
// Del - delete files and folders
const del = require("del");
// Plumber - improve error handling during pipelines
const plumber = require("gulp-plumber");
// Imagemin - image compression
const imagemin = require("gulp-imagemin");
// imagemin-pngquant - png compression plugin
const imageminPngquant = require("imagemin-pngquant");

// Yargs - get terminal arguments
const argv = require("yargs").argv;

const autoOpen = argv.open || argv.o ? true : false;
// Config properties
const config = {
  port: 4100,
  autoOpen: autoOpen,
};

const paths = {
  styles: {
    src: "src/scss/**/*.scss",
    dest: "dist/css/",
  },
  scripts: {
    src: "src/js/**/*.js",
    dest: "dist/js/",
    tpl: [
      "node_modules/jquery/dist/jquery.min.js",
      "node_modules/popper.js/dist/umd/popper.min.js",
      "node_modules/bootstrap/dist/js/bootstrap.min.js",
      "node_modules/waypoints/lib/jquery.waypoints.min.js",
      "node_modules/dom-i18n/dist/dom-i18n.min.js",
      "node_modules/howler/dist/howler.min.js",
      "node_modules/progressively/dist/progressively.min.js",
    ],
  },
  html: {
    contentSrc: "src/html/content/**/*.html",
    includeHeaderSrc: "src/html/includes/header.html",
    includeFooterSrc: "src/html/includes/footer.html",
    dest: "dist",
  },
  assets: {
    fontsSrc: "src/fonts/**",
    fontsDest: "dist/fonts",
    imgSrc: "src/images/**",
    assetsSrc: "src/assets/**",
    assetsDest: "dist/assets",
  },
  libraries: {
    src: "src/libs/**",
    dest: "dist/libs",
  },
};

// Delete dist folder
function clean(done) {
  // Returns callback
  del.sync("dist");
  done();
}

// Build css from scss, minimize, move to dist and inject if browserSync running
function buildStyles() {
  // Returns stream
  return (
    gulp
      .src(paths.styles.src)
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(
        sass({
          includePaths: ["node_modules"],
          outputStyle: "compressed",
          errLogToConsole: true,
        }),
      )
      .on("error", function (err) {
        console.log(err.toString());
        this.emit("end");
      })
      .pipe(
        autoprefixer({
          cascade: false,
        }),
      )
      .pipe(cleanCSS())
      // pass in options to the stream
      .pipe(
        rename({
          suffix: ".min",
        }),
      )
      .pipe(sourcemaps.write("./")) // path related to target destination
      .pipe(gulp.dest(paths.styles.dest))
      // Inject css if browserSync running
      .pipe(browserSync.stream())
  );
}

// Build html, inject templates and move to dist
function buildHtml() {
  // Returns stream
  return (
    gulp
      .src(paths.html.contentSrc)
      .pipe(plumber())
      .pipe(
        inject(gulp.src([paths.html.includeHeaderSrc]), {
          starttag: "<!-- inject:header:{{ext}} -->",
          transform: function (filePath, file) {
            // return file contents as string
            return file.contents.toString("utf8");
          },
        }),
      )
      .pipe(
        inject(gulp.src([paths.html.includeFooterSrc]), {
          starttag: "<!-- inject:footer:{{ext}} -->",
          transform: function (filePath, file) {
            // return file contents as string
            return file.contents.toString("utf8");
          },
        }),
      )
      .pipe(gulp.dest(paths.html.dest))
      // Inject css if browserSync running
      .pipe(browserSync.stream())
  );
}

// Build, concat, minimize and move to dist third party libraries
function tplScripts() {
  // Returns stream
  return gulp
    .src(paths.scripts.tpl)
    .pipe(plumber())
    .pipe(concat("components.min.js")) // Take all of components and compile into components.min.js
    .pipe(uglify()) // Minify this file
    .pipe(gulp.dest(paths.scripts.dest)); // Move it to dist/js
}
// Build, minimize, and move to dist custom scripts
function customScripts() {
  // Returns stream
  return gulp
    .src(paths.scripts.src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"],
      }),
    )
    .pipe(uglify()) // Minify this file
    .pipe(
      rename({
        suffix: ".min", // Rename it
      }),
    )
    .pipe(sourcemaps.write("./")) // path related to target destination
    .pipe(gulp.dest(paths.scripts.dest)); // Move it to dist/js
}
const buildScripts = gulp.parallel(customScripts, tplScripts);

// Move fonts from working to dist directory
function buildFonts() {
  return gulp
    .src(paths.assets.fontsSrc)
    .pipe(gulp.dest(paths.assets.fontsDest));
}

// Optimize and move images from working to dist directory
function buildImagesProd() {
  return (
    gulp
      .src(paths.assets.imgSrc) // Take all iamages
      .pipe(plumber())
      // Optimize
      .pipe(
        imagemin([
          imageminPngquant({
            quality: [0.7, 0.9], // Image quality around 70%-90%
            speed: 1, // The lowest speed of optimization with the highest quality
            floyd: 1, // Controls level of dithering (0 = none, 1 = full).
          }),
        ]),
      )
      .pipe(gulp.dest(paths.assets.assetsDest))
  ); // Move it to dist/assets
}
function buildImagesDev() {
  // Move images without optimization to save rebuild time on dev
  return gulp.src(paths.assets.imgSrc).pipe(gulp.dest(paths.assets.assetsDest));
}

function buildAssets() {
  // Move other assets / non-images
  return gulp
    .src(paths.assets.assetsSrc)
    .pipe(gulp.dest(paths.assets.assetsDest));
}

// Export all libraries
function buildLibraries() {
  // Returns stream
  return gulp.src(paths.libraries.src).pipe(gulp.dest(paths.libraries.dest)); // Move it to dist/libs
}

const buildAssetsProd = gulp.parallel(buildFonts, buildImagesProd, buildAssets);
const buildAssetsDev = gulp.parallel(buildFonts, buildImagesDev, buildAssets);

// Config and start browser sync
function bSync() {
  browserSync({
    // Run browser Sync
    server: {
      baseDir: "dist",
    },
    port: config.port,
    notify: false, // Notifications off
    open: false, // Auto open off
  });
}

// Start file watch
function watchFiles() {
  // Inject styles on change, styles injection handled in a styles task
  gulp.watch(paths.styles.src, buildStyles);
  // Build html and reload, it's possible to inject but not recommended
  gulp.watch(
    [
      paths.html.contentSrc,
      paths.html.includeFooterSrc,
      paths.html.includeHeaderSrc,
    ],
    buildHtml,
  );

  // Build scripts and reload on change, it's possible to inject but not recommended
  gulp
    .watch(paths.scripts.src, gulp.series(buildScripts))
    .on("change", browserSync.reload);
  // Reload on libs change
  gulp
    .watch(paths.libraries.src, gulp.series(buildLibraries))
    .on("change", browserSync.reload);
  // Reload on assets change
  gulp
    .watch(paths.assets.assetsSrc, gulp.series(buildAssetsDev))
    .on("change", browserSync.reload);
  gulp
    .watch(paths.assets.imgSrc, gulp.series(buildAssetsDev))
    .on("change", browserSync.reload);
  // Reload on fonts change
  gulp
    .watch(paths.assets.fontsSrc, gulp.series(buildFonts))
    .on("change", browserSync.reload);
}

// To chain series funtions must return callback, promise, stream, observable, child process
const build = gulp.series(
  clean,
  buildStyles,
  buildHtml,
  buildScripts,
  buildAssetsProd,
  buildLibraries,
);
exports.build = build;

const watch = gulp.series(build, gulp.parallel(watchFiles, bSync));
exports.watch = watch;

exports.default = watch;
