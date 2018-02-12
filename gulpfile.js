var gulp = require('gulp');
var del = require('del');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var beautify = require('gulp-beautify');
var jshint = require('gulp-jshint');
var minimist = require('minimist');
var gulpif = require('gulp-if');
var pug = require('gulp-pug');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var traceur = require('gulp-traceur');

var knownOptions = {
	string: 'env',
	default: { env: process.env.NODE_ENV || 'development' }
};

var options = minimist(process.argv.slice(2), knownOptions);

function HandleError() {
	console.log(arguments);
}

console.log(options);

// CSS/Less related tasks
gulp.task('less', ['clear_css'], function () {
	var dest = 'public/css';

	var stream = gulp.src(['less/site.less', 'less/bootstrap/bootstrap.less'])
		.pipe(gulpif(options.env === 'production',
			less({
				compress: true,
				cleancss: true,
				strictMath: true,
				strictUnits: true,
			}),
			less({
				strictMath: true,
				strictUnits: true,
			})))
		.pipe(gulp.dest(dest));
});

gulp.task('clear_css', function (callback) {
	del('public/css/**/*.css', function (err) {
		if (err)
		{
			console.log('Could not delete old css files.');
			callback(err)
		}
		else
		{
			callback(err);
			console.log("Old CSS files deleted.");
		}
	});
});

gulp.task('watch_css', function () {
	return gulp.watch('less/**/*.less', ['less']);
});


// Javascript related tasks
gulp.task('client_js', ['clear_js', 'jshint'], function () {
	var dest = 'public/js';

	var stream = gulp.src(['scripts/**/*.js', '!scripts/routes/**/*.js', '!scripts/bootstrap/**/*.js'])
		.pipe(traceur({
				modules: 'amd',
			}))
		.pipe(gulpif(options.env === 'production',
			uglify({
				sequences: true,
				properties: true,
				dead_code: true,
				conditionals: true,
				comparisons: true,
				loops: true,
				preserveComments: 'all',
				unused: true,
				join_vars: true,
				compress: {
					drop_console: true
				},
				global_defs: {
					DEBUG: false
				}
			}),
			beautify({
				lookup: false,
				compress: false,
				beautify: true,
				sequences: true,
				properties: true,
				dead_code: true,
				conditionals: true,
				comparisons: true,
				loops: true,
				unused: true,
				join_vars: true,
				preserveComments: 'all',
				mangle: false,
				global_defs: {
					DEBUG: true
				}
			})))
		.pipe(rename({ extname: '.js' }))
		.pipe(gulp.dest(dest));

	gulp.src(['scripts/bootstrap/affix.js','scripts/bootstrap/tooltip.js', 'scripts/bootstrap/alert.js', 'scripts/bootstrap/button.js',
			'scripts/bootstrap/carousel.js', 'scripts/bootstrap/collapse.js', 'scripts/bootstrap/dropdown.js', 'scripts/bootstrap/modal.js',
			'scripts/bootstrap/popover.js', 'scripts/bootstrap/scrollspy.js', 'scripts/bootstrap/tab.js', 'scripts/bootstrap/transition.js'])
		.pipe(concat('bootstrap.min.js'))
		.pipe(gulpif(options.env === 'production',
			uglify({
				wrap: 'Jeopardy.<%= pkg.name %>',
				sequences: true,
				properties: true,
				dead_code: true,
				conditionals: true,
				comparisons: true,
				loops: true,
				unused: true,
				join_vars: true,
				compress: {
					drop_console: true
				},
				global_defs: {
					DEBUG: false
				}
			}),
			uglify({
				compress: false,
				beautify: true,
				sequences: true,
				properties: true,
				dead_code: true,
				conditionals: true,
				comparisons: true,
				loops: true,
				unused: true,
				join_vars: true,
				preserveComments: 'all',
				mangle: false,
				global_defs: {
					DEBUG: true
				}
			})))
		.pipe(gulp.dest(dest));

	gulp.src('scripts/routes/**/*.js')
		.pipe(traceur({
			modules: 'amd',
			moduleName: true
		}))
		.pipe(concat('controllers.min.js'))
		.pipe(gulpif(options.env === 'production',
			uglify({
				wrap: 'Jeopardy.<%= pkg.name %>',
				sequences: true,
				properties: true,
				dead_code: true,
				conditionals: true,
				comparisons: true,
				loops: true,
				unused: true,
				join_vars: true,
				compress: {
					drop_console: true
				},
				global_defs: {
					DEBUG: false
				}
			}),
			beautify({
				lookup: false,
				compress: false,
				beautify: true,
				sequences: true,
				properties: true,
				dead_code: true,
				conditionals: true,
				comparisons: true,
				loops: true,
				unused: true,
				join_vars: true,
				preserveComments: 'all',
				mangle: false,
				global_defs: {
					DEBUG: true
				}
			})))
		.pipe(gulp.dest(dest));
});

gulp.task('jshint', function () {
	return gulp.src(['scripts/**/*.js', '!scripts/bootstrap/**/*.js'])
		.pipe(jshint({
			curly: true,
			unused: true,
			esnext: true
		}));
});

gulp.task('clear_js', function (callback) {
	del(['public/js/**/*', '!public/js/libs', '!public/js/libs/**/*.js'], function (err) {
		if(err)
		{
			console.log('Could not delete old javascript files.');
			callback(err)
		}
		else
		{
			console.log("Old JavaScript files deleted.");
			callback();
		}
	});
});

gulp.task('watch_js', function () {
	return gulp.watch(['scripts/**/*.js', 'Modules/**/*.es6'], ['client_js']);
});

gulp.task('server_js', ['clear_server_js'], function() {
	RouteStream(gulp.src(['Modules/**/*.es6']))
		.pipe(gulp.dest('Modules'));

	RouteStream(gulp.src(['Controllers/**/*.es6']))
		.pipe(gulp.dest('Controllers'));

	function RouteStream (stream) {
		return stream.pipe(traceur({
			moduleName: true,
			modules: 'commonjs'
		}))
		.pipe(gulpif(options.env === 'production',
			uglify({
				sequences: true,
				properties: true,
				dead_code: true,
				conditionals: true,
				comparisons: true,
				loops: true,
				preserveComments: 'all',
				unused: true,
				join_vars: true,
				compress: {
					drop_console: true
				},
				global_defs: {
					DEBUG: false
				}
			}),
			beautify({
				lookup: false,
				compress: false,
				beautify: true,
				sequences: true,
				properties: true,
				dead_code: true,
				conditionals: true,
				comparisons: true,
				loops: true,
				unused: true,
				join_vars: true,
				preserveComments: 'all',
				mangle: false,
				global_defs: {
					DEBUG: true
				}
			})))
		.pipe(rename({ extname: '.js' }));
	};
});

gulp.task('clear_server_js', function(callback) {
	del(['Modules/**/*.js', 'Controllers/**/*.js'], function (err) {
		if(err)
		{
			console.log('Could not delete old javascript files.');
			callback(err)
		}
		else
		{
			console.log("Old JavaScript files deleted.");
			callback();
		}
	});
})

gulp.task('watch_server_js', function () {
	return gulp.watch(['Modules/**/*.es6', 'Controllers/**/*.es6'], ['server_js']);
});


// HTML related tasks
gulp.task('pug', ['clear_pug'], function () {
	var dest = 'Views/Templates';

	return gulp.src(['Views/Templates/**/*.pug'])
		.pipe(gulpif(options.env === 'production',
			pug({
				compileDebug: false
			}),
			pug({
				pretty: true
			})))
		.pipe(rename({ extname: '.html' }))
		.pipe(gulp.dest(dest));
});

gulp.task('clear_pug', function (callback) {
	del(['Views/Templates/**/*.html'], function (err) {
		if(err)
		{
			console.log('Could not delete old pug-compiled html files.');
			callback(err);
		}
		else
		{
			console.log('Old pug templates deleted.');
			callback();
		}
	});
});

gulp.task('watch_pug', function () {
	return gulp.watch('Views/Templates/**/*.pug', ['pug']);
});



// Final build tasks
gulp.task('clear_old', ['clear_css', 'clear_server_js', 'clear_js', 'clear_pug']);
gulp.task('watch', ['watch_server_js', 'watch_js', 'watch_css', 'watch_pug']);
gulp.task('default', ['server_js', 'client_js', 'less', 'pug']);

