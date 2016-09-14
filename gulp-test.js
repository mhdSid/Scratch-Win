/*
* * * Authored by Mohammad K. Sidani: mohdsidani@gmail.com / moe.sidani@vinelab.com
*/

(function () {
  
  'use strict';
  var browserSync = require("browser-sync");
  var config = require("./gulp.config.js")();
  var gulp = require("gulp");
  var lazy = require("gulp-load-plugins")({lazy: true});
  var wiredep = require("wiredep");
  /*
  * * * This task is used for testing. Compile a simple ts file to js
  */
  gulp.task("test-ts-compiler", function () {
      return gulp.src("./Test/lib/*.ts")
                 .pipe(lazy.typescript({
                    // Generates corresponding .map file. 
                    sourceMap : false,
                
                    // Generates corresponding .d.ts file. 
                    declaration : true,
 
                    // Do not emit comments to output. 
                    removeComments : false,
 
                    // Warn on expressions and declarations with an implied 'any' type. 
                    noImplicitAny : false,
 
                    // Skip resolution and preprocessing. 
                    noResolve : false,
 
                    // Specify module code generation: 'commonjs' or 'amd'   
                    module : "amd",
 
                    // Specify ECMAScript target version: 'ES3' (default), or 'ES5' 
                    target : "ES5"
                  }))
                  .pipe(gulp.dest(config.testDest));
  });


  /*
  * * *This task is used for testing. Compile simple less file to css
  */
  gulp.task("test-less-css", function () {
      return gulp.src(config.testLib + "*.less")
                 .pipe(lazy.less())
                 .pipe(gulp.dest(config.testDest));
  });


  /*
  * * *This task is used for testing. Concat css files
  */
  gulp.task("test-concat-css", function () {
      return gulp.src([config.testDest + "test-style*.css", config.testDest + "newstyle.css"])
                 .pipe(lazy.concatCss("test-main.css"))
                 .pipe(gulp.dest(config.testDest + "dest/"));
  });


  /*
  * * * This task is used for testing. Simply adds browser prefixes to the main css file test-main.css
  */
  gulp.task("test-auto-prefixer", function () {
      return gulp.src(config.testDest + "dest/test-main.css")
                 .pipe(lazy.autoprefixer({
                    browsers: ["> 0%"],
                    cascade: true
                 }))
                 .pipe(gulp.dest(config.testDest + "dest/"));
  });


  /*
  * * * This task is used for testing. Simply adds bower components into test-index.html
  */
  gulp.task("test-bower-injector", function () {
      return gulp.src(config.index)
                 .pipe(wiredep.stream())
                 .pipe(lazy.rename({prefix: 'test-'}))
                 .pipe(gulp.dest(config.testDest + "dest/"));
  });

  /*
  * * * This task is used for testing. Simply adds js scripts components into test-index.html
  */
  gulp.task("test-js-injector", function () {                                    
      return gulp.src(config.testDest + "dest/test-index.html")
                 .pipe(lazy.inject(gulp.src(config.testDest + "*.js", {read: false})))
                 .pipe(gulp.dest(config.testDest + "dest/"));
  });


  /*
  * * * This task is used for testing. Simply adds Css scripts components into test-index.html
  */
  gulp.task("test-css-injector", function () {
      return gulp.src("./Test/dest/dest/test-index.html")
                 .pipe(lazy.inject(gulp.src(config.testDest + "dest/test-main.css", {read: false})))
                 .pipe(gulp.dest(config.testDest + "dest/"));
  });


  /*
  * * * This task is used for testing. To check whether a simple html page has been minified or not
  */
  gulp.task("test-minify-html", function () {
      return gulp.src(config.testLib + "test.html")
                 .pipe(lazy.minifyHtml({conditionals: true, spare:true}))
                 .pipe(lazy.rename({suffix: ".min"}))
                 .pipe(gulp.dest(config.testDest));
  });


  /*
  * * * This tasks is used for testing. To check whether a simple image has been minified or not
  */
  gulp.task("test-images", function () {
      return gulp.src(config.testLib + "img.jpg")
                 .pipe(lazy.imagemin({optimizationLevel: 5}))
                 .pipe(gulp.dest(config.testDest));
  });


  /*
  * * * This task is used for testing.
  */
  gulp.task("test-template-cache", function () {
      return gulp.src(config.testLib + "tmpl.html")
                 .pipe(lazy.minifyHtml({empty: true}))
                 .pipe(lazy.angularTemplatecache())
                 .pipe(gulp.dest(config.testDest));
  });


  /*
  * * * This task is used for testing. To check whether a simple css file has been minified or not
  */
  gulp.task("test-minify-css", function () {
      return gulp.src(config.testLib + "test.css")
                 .pipe(lazy.minifyCss({keepBreaks: false}))
                 .pipe(lazy.rename({suffix: ".min"}))
                 .pipe(gulp.dest(config.testDest));
 });


  /*
  * * * This task is used for testing. To check whether a simple css file has been minified or not
  */
  gulp.task("test-minify-js", function () {
      return gulp.src(config.testLib + "test.js")
                 .pipe(lazy.stripDebug())
                 .pipe(lazy.uglify())
                 .pipe(lazy.rename({suffix: ".min"}))
                 .pipe(gulp.dest(config.testDest));
 });


  /*
  * * * This task is used for testing. It should inject angular dependecies 
  */
  gulp.task("test-dependency-fixer", function () {
    return gulp.src(config.testLib + "dependency-test.js")
               .pipe(lazy.ngAnnotate()) 
               .pipe(gulp.dest(config.testDest));
  });
}());