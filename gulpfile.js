var gulp = require('gulp')
var mjml = require('gulp-mjml')
var browserSync = require('browser-sync').create();
// var litmus = require('gulp-litmus');
var exec = require('child_process').exec;

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

gulp.task('litmus', function (cb) {
  exec('node litmus', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('default', ['browser-sync'], function(){
  gulp.watch(["./src/*.mjml"], ['mjml']);  
  gulp.watch(["index.html"], ['litmus']);  
  gulp.watch(["*.html"], ['bs-reload']);  
})

