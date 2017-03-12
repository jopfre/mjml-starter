var gulp = require('gulp')
var mjml = require('gulp-mjml')
var browserSync = require('browser-sync').create();

var path = require('path');
var dirName = path.basename(__dirname);

gulp.task('browser-sync', function() {
  browserSync.init({
    proxy: 'localhost/'+dirName
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('mjml', function () {
  return gulp.src('./src/index.mjml')
  .pipe(mjml())
  .pipe(gulp.dest('./'))
});

gulp.task('default', ['browser-sync'], function(){
  gulp.watch(["./src/*.mjml"],  ['mjml']);  
  gulp.watch(["*.html"],  ['bs-reload']);  
})

