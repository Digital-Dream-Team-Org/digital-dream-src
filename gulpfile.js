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
// Imagemin - image minimization and optimization
const imagemin = require("gulp-imagemin");
// Pngquant - imagemin utility library for png optimization
const pngquant = require("imagemin-pngquant");
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

// Yargs - get terminal arguments
const argv = require("yargs").argv;

const autoOpen = argv.open || argv.o ? true : false;
// Config properties
const config = {
  port: 4100,
  autoOpen: autoOpen
};

const paths = {
  styles: {
    src: "src/scss/**/*.scss",
    dest: "dist/css/"
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
      "node_modules/progressively/dist/progressively.min.js"
    ]
  },
  html: {
    contentSrc: "src/html/content/**/*.html",
    includeHeaderSrc: "src/html/includes/header.html",
    includeFooterSrc: "src/html/includes/footer.html",
    dest: "dist"
  },
  assets: {
    fontsSrc: "src/fonts/**",
    fontsDest: "dist/fonts",
    soundsSrc: "src/sounds/**",
    soundsDest: "dist/sounds",
    imagesSrc: "src/images/**",
    imagesDest: "dist/images",
    projectsSrc: "src/projects/**",
    projectsDest: "dist/projects"
  }
};

// Delete dist folder
function clean(done) {
  // Returns callback
  del.sync("dist");
  done();
}

// Build css from scss, minimize, move to dist and inject if browserSync running
function styles() {
  // Returns stream
  return (
    gulp
      .src(paths.styles.src)
      .pipe(sourcemaps.init())
      .pipe(
        sass({
          includePaths: ["node_modules"],
          outputStyle: "compressed",
          errLogToConsole: true
        })
      )
      .on("error", function(err) {
        console.log(err.toString());

        this.emit("end");
      })
      .pipe(
        autoprefixer({
          cascade: false
        })
      )
      .pipe(cleanCSS())
      // pass in options to the stream
      .pipe(
        rename({
          suffix: ".min"
        })
      )
      .pipe(sourcemaps.write("./")) // path related to target destination
      .pipe(gulp.dest(paths.styles.dest))
      // Inject css if browserSync running
      .pipe(browserSync.stream())
  );
}

// Build html, inject templates and move to dist
function html() {
  // Returns stream
  return gulp
    .src(paths.html.contentSrc)
    .pipe(
      inject(gulp.src([paths.html.includeHeaderSrc]), {
        starttag: "<!-- inject:header:{{ext}} -->",
        transform: function(filePath, file) {
          // return file contents as string
          return file.contents.toString("utf8");
        }
      })
    )
    .pipe(
      inject(gulp.src([paths.html.includeFooterSrc]), {
        starttag: "<!-- inject:footer:{{ext}} -->",
        transform: function(filePath, file) {
          // return file contents as string
          return file.contents.toString("utf8");
        }
      })
    )
    .pipe(gulp.dest(paths.html.dest));
}

// Build, concat, minimize and move to dist third party libraries
function tplScripts() {
  // Returns stream
  return gulp
    .src(paths.scripts.tpl)
    .pipe(concat("components.min.js")) // Собираем их в кучу в новом файле components.min.js
    .pipe(uglify()) // Сжимаем JS файл
    .pipe(gulp.dest(paths.scripts.dest)); // Выгружаем в папку app/js
}
// Build, minimize, and move to dist custom scripts
function customScripts() {
  // Returns stream
  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(uglify()) // Сжимаем JS файл
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(sourcemaps.write("./")) // path related to target destination
    .pipe(gulp.dest(paths.scripts.dest)); // Выгружаем в папку app/js
}
const scripts = gulp.parallel(customScripts, tplScripts);

// Move fonts from working to dist directory
function fonts() {
  return gulp
    .src(paths.assets.fontsSrc)
    .pipe(gulp.dest(paths.assets.fontsDest));
}
// Optimize and move images from working to dist directory
function cleanImgFolder(done) {
  del.sync("dist/images");
  done();
}
function images() {
  return gulp
    .src(paths.assets.imagesSrc) // Берем все изображения из app
    .pipe(
      imagemin({
        // Сжимаем их с наилучшими настройками с учетом кеширования
        interlaced: true,
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()]
      })
    )
    .pipe(gulp.dest(paths.assets.imagesDest));
}

function sounds() {
  return gulp
    .src(paths.assets.soundsSrc)
    .pipe(gulp.dest(paths.assets.soundsDest));
}

function projects() {
  return gulp
    .src(paths.assets.projectsSrc)
    .pipe(gulp.dest(paths.assets.projectsDest));
}

const assets = gulp.parallel(fonts, images, sounds, projects);

// Config and start browser sync
function bSync() {
  browserSync({
    // Выполняем browser Sync
    server: {
      baseDir: "dist"
    },
    port: config.port,
    notify: false, // Отключаем уведомления
    open: false // Авто открытие в браузере
  });
}

// Start file watch
function watchFiles() {
  // Inject styles on change, styles injection handled in a styles task
  gulp.watch(paths.styles.src, styles);
  // Build scripts and reload on change, it's possible to inject but not recommended
  gulp
    .watch(paths.scripts.src, gulp.series(scripts))
    .on("change", browserSync.reload);
  // Build html and reload, it's possible to inject but not recommended
  gulp
    .watch(
      [
        paths.html.contentSrc,
        paths.html.includeFooterSrc,
        paths.html.includeHeaderSrc
      ],
      gulp.series(html)
    )
    .on("change", browserSync.reload);
  // Reload on images change
  gulp
    .watch(paths.assets.imagesSrc, gulp.series(cleanImgFolder, images))
    .on("change", browserSync.reload);
  // Reload on fonts change
  gulp
    .watch(paths.assets.fontsSrc, gulp.series(fonts))
    .on("change", browserSync.reload);

  // Reload on sounds change
  gulp
    .watch(paths.assets.soundsSrc, gulp.series(sounds))
    .on("change", browserSync.reload);

  // Reload on projects change
  gulp
    .watch(paths.assets.projectsSrc, gulp.series(projects))
    .on("change", browserSync.reload);
}

exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.assets = assets;

// To chain series funtions must return callback, promise, stream, observable, child process
const build = gulp.series(clean, styles, html, scripts, assets);
exports.build = build;

const watch = gulp.series(build, gulp.parallel(watchFiles, bSync));
exports.watch = watch;

exports.default = watch;
