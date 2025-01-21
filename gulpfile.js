const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const htmlclean = require('gulp-htmlclean');
const webpHTML = require('gulp-webp-html');
const autoprefixer = require('gulp-autoprefixer');
const webpCss = require('gulp-webp-css');
const cleanCss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const groupMedia = require('gulp-group-css-media-queries');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const changed = require('gulp-changed');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const fonter = require('gulp-fonter-fix');
const ttf2woff2 = require('gulp-ttf2woff2');
const rename = require('gulp-rename');
const fs = require('fs');

const plumberNotify = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};

gulp.task('html', function() {
  return (
    gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
		  .pipe(changed('./docs/'))
		  .pipe(plumber(plumberNotify('HTML')))
      .pipe(fileInclude({
        prefix: '@@',
        basepath: '@file',
      }))
      .pipe(
        replace(
          /(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
          '$1./$4$5$7$1'
        )
      )
		  .pipe(webpHTML())
		  .pipe(htmlclean())
		  .pipe(gulp.dest('./docs/'))
  )
});

gulp.task('css', function() {
  return (
    gulp.src('./src/css/**/*.css')
      .pipe(changed('./docs/css'))
      .pipe(plumber(plumberNotify('CSS')))
      .pipe(autoprefixer())
      .pipe(webpCss())
      .pipe(groupMedia())
      .pipe(concat('index.css'))
      .pipe(
        replace(
          /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
          '$1$2$3$4$6$1'
        )
      )
      .pipe(cleanCss())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest('./docs/css/'))
  )
});

gulp.task('img', function() {
  return (
    gulp.src('./src/images/**/*')
      .pipe(changed('./docs/images'))
      .pipe(webp())
      .pipe(gulp.dest('./docs/images/'))
		  .pipe(gulp.src('./src/images/**/*'))
		  .pipe(changed('./docs/images/'))
		  .pipe(imagemin({ verbose: true }))
		  .pipe(gulp.dest('./docs/images/'))
  )
});

gulp.task('fonts', function () {
	return (
    gulp
		.src('./src/fonts/**/*.ttf', {})
      .pipe(fonter({ formats: ['woff'], }))
		  .pipe(gulp.dest('./docs/fonts/'))
      .pipe(gulp.src('./src/fonts/**/*.ttf'))
      .pipe(ttf2woff2())
      .pipe(gulp.dest('./docs/fonts/'))
      .pipe(
        plumber(
          notify.onError({ title: 'FONTS', message: 'Error: <%= error.message %>', })
        )
      )
  )
});

gulp.task('js', function () {
	return (
    gulp.src('./src/js/*.js')
		.pipe(changed('./docs/js/'))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(babel())
		.pipe(webpack(require('./webpack.config.js')))
		.pipe(gulp.dest('./docs/js/'))
  ) 
});

gulp.task('clean', function(done) {
  if(fs.existsSync('./docs/')) {
    return (
      gulp.src('./docs/', { read: false})
      .pipe(clean({ force: true }))
    )
  }
  done();
});

gulp.task('watch', function() {
  gulp.watch('./src/html/**/*.html', gulp.parallel('html'))
  gulp.watch('./src/css/**/*.css', gulp.parallel('css'))
  gulp.watch('./src/images/**/*', gulp.parallel('img'))
  gulp.watch('./src/fonts/**/*', gulp.parallel('fonts'))
  gulp.watch('./src/js/**/*.js', gulp.parallel('js'))
})

gulp.task('server', function () {
	return(
    gulp.src('./docs/')
      .pipe(server({ livereload: true, open: true, }))
  ) 
});

gulp.task('default', gulp.series(
  'clean',
  gulp.parallel('html', 'css', 'img', 'fonts', 'js'),
  gulp.parallel('server', 'watch')
));





