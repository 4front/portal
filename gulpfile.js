var gulp = require('gulp');
var gutil = require('gulp-util');
// var minifyHtml = require("gulp-minify-html");
var concat = require("gulp-concat");
// var uglify = require("gulp-uglify");
// var minifyCss = require('gulp-minify-css');
var stylus = require('gulp-stylus');
var nib = require('nib');
var runSequence = require('run-sequence');
var del = require('del');
var path = require('path');
var webpack = require('webpack');
// var ExtractTextPlugin = require('extract-text-webpack-plugin');

var webpackConfig = buildWebPackConfig();

gulp.task('default', ['build', 'watch']);

gulp.task('clean', function(cb) {
  del(['./www/dist'], cb);
});

gulp.task('stylus', function() {
  gulp.src('./app/stylus/*.styl')
     .pipe(stylus({
       use: nib(),
       compress: true
     }))
     .pipe(concat('app.min.css'))
     .pipe(gulp.dest('./dist'));
});

gulp.task('webpack', function(done) {
  /* eslint-disable */
  webpack(webpackConfig).run(function(err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('[webpack]', 'bundling');

    /* useful for debugging webpack */
     gutil.log('[webpack]', stats.toString({
       hash: true,
       colors: true,
       cached: false
     }));

    done();
  });
});

gulp.task('watch', ['webpack:watch', 'stylus:watch']);

gulp.task('webpack:watch', function() {
  gulp.watch('./app/**/*.js', ['webpack']);
});

gulp.task('stylus:watch', function() {
  gulp.watch('./app/stylus/*.styl', ['stylus']);
});

gulp.task('build', function(callback) {
  runSequence('clean', ['webpack', 'stylus'], callback);
});

function buildWebPackConfig() {
  var plugins = [
   // Manually do source maps to use alternate host.
   new webpack.SourceMapDevToolPlugin(
     'bundle.js.map',
     '\n//# sourceMappingURL=/portal/dist/[url]')
  ];

  return {
    cache: true,
    context: path.join(__dirname, 'app'),
    entry: './components/App.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loaders: ['babel-loader'],
          exclude: /node_modules/
        }
      ],
    },
    resolve: {
      extensions: ['','.js','.jsx']
    },
    plugins: plugins
  };
}
