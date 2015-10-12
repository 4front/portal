var gulp = require('gulp');
var gutil = require('gulp-util');
// var minifyHtml = require("gulp-minify-html");
var concat = require('gulp-concat');
// var rename = require('gulp-rename');
// var uglify = require("gulp-uglify");
// var minifyCss = require('gulp-minify-css');
var stylus = require('gulp-stylus');
var nib = require('nib');
var runSequence = require('run-sequence');
var del = require('del');
var path = require('path');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
// var ExtractTextPlugin = require('extract-text-webpack-plugin');

var webpackConfig = buildWebPackConfig();

gulp.task('default', ['build', 'watch']);

gulp.task('clean', function(cb) {
  del(['./dist'], cb);
});

gulp.task('stylus', function() {
  gutil.log('compiling stylus');
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

gulp.task('webpack-dev-server', function() {
	// modify some webpack config options
	var myConfig = Object.create(webpackConfig);
	myConfig.devtool = 'eval'; // "eval-source-map";
	myConfig.debug = true;

	// Start a webpack-dev-server
	new WebpackDevServer(webpack(myConfig), {
		publicPath: "http://localhost:8080/assets/",
		stats: {
			colors: true
		}
	}).listen(8080, 'localhost', function(err) {
		if(err) throw new gutil.PluginError("webpack-dev-server", err);
		gutil.log("[webpack-dev-server]");
	});
});

gulp.task('watch', ['webpack-dev-server', 'stylus:watch']);

gulp.task('stylus:watch', function() {
  gulp.watch('./app/stylus/*.styl', ['stylus']);
});

gulp.task('build', function(callback) {
  runSequence('clean', ['webpack', 'stylus'], callback);
});

function buildWebPackConfig() {
  var plugins = [
    // Manually do source maps to use alternate host.
    // new webpack.SourceMapDevToolPlugin('bundle.js.map', '\n//# sourceMappingURL=/portal/dist/[url]'),
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor-bundle.js")
  ];

  if (process.env.NODE_ENV === 'production') {
    plugins.push(new webpack.optimize.DedupePlugin());
    plugins.push(new webpack.optimize.UglifyJsPlugin());
    plugins.push(new webpack.DefinePlugin({
      'process.env': {
        // Signal production mode for React JS libs.
        NODE_ENV: 'production'
      }
    }));
  }

  return {
    cache: true,
    context: path.join(__dirname, 'app'),
    entry: {
      app: './components/App.js',
      vendor: ['lodash', 'superagent', 'react', 'superagent-promise',
        'react-router', 'event-emitter', 'classnames', 'history']
    },
    output: {
      path: path.join(__dirname, 'www/dist'),
      filename: 'app-bundle.js'
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
    alias: {
      underscore: "lodash"
    },
    plugins: plugins
  };
}
