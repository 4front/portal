var gulp = require('gulp');
// var minifyHtml = require("gulp-minify-html");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var ngHtml2Js = require("gulp-ng-html2js");
var ngAnnotate = require('gulp-ng-annotate');
var minifyCss = require('gulp-minify-css');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var nib = require('nib');
var runSequence = require('run-sequence');
var series =  require('stream-series');
var del = require('del');

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('clean', function(cb) {
  del(['./www/dist'], cb);
});

gulp.task('buildVendorJs', function() {
  var vendor = [
    // Add any other vendors scripts here
    'node_modules/angular-scroll/angular-scroll.min.js'
  ];

  gulp.src(vendor)
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('./www/dist'));
});

gulp.task('buildJs', function() {
  var scripts = gulp.src('www/js/**/*.js')
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(concat('scripts.min.js'));

  // Compile all the partials into a
  // var partials = gulp.src("app/partials/*.jade")
  //   .pipe(minifyHtml({
  //       empty: true,
  //       spare: true,
  //       quotes: true
  //   }))
  //   .pipe(ngHtml2Js({
  //       moduleName: "templates",
  //       prefix: "partials/"
  //   }))
  //   .pipe(uglify());

  // Combine the scripts and partials into a single uglified app.min.js file.
  series(scripts)
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('./www/dist'));
});

gulp.task('buildCss', function() {
   gulp.src('./stylus/*.styl')
     .pipe(stylus({
       use: nib(),
       compress: true
     }))
     .pipe(concat('app.min.css'))
     .pipe(gulp.dest('./www/dist'));
});

gulp.task('build', function(callback) {
  runSequence('clean', ['buildVendorJs', 'buildJs', 'buildCss'], callback);
});
