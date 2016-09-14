/*
* * * Authored by Mohammad K. Sidani: mohdsidani@gmail.com / moe.sidani@vinelab.com
*/

(function () {

  'use strict';
  var browserSync = require("browser-sync");
  var config = require("./gulp.config.js")();
  var gulp = require("gulp");
  var lazy = require("gulp-load-plugins")({lazy: true});
  var runSequence = require("run-sequence"); /* Exceptionally used to run tasks in a sequence - not in parallel */
  var wiredep = require("wiredep");
  var fse = require("fs-extra");


/*
* * * Tasks defined as Test-...-... trigger test tasks written inside gulp-test.js
*/

  /*                                 */
 /* * * Development Environment * * */
/*                                 */

/*
* * * Run this task to List all tasks
*/
gulp.task("list-tasks", lazy.taskListing);

gulp.task("app-config",function(){
  gulp.src('')
      .pipe(lazy.ngConstant({
        name: config.appName,
        constants: config.inAppConfig,
        deps: false
      }))
      .pipe(lazy.rename('app.config.js'))
      .pipe(gulp.dest(config.environment));
});

/*
* * * Compile Typescript to JavaScript
*/
gulp.task("ts-compiler", function () {
    return gulp.src(config.tsPath)
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
              .pipe(gulp.dest(config.environment));
});
gulp.task("Test-ts-compiler", ["test-ts-compiler"]);

/*
* * * Inject all JavaScript files into index.html
*/
gulp.task("js-injector",['ts-compiler', 'app-config'], function () {
    return gulp.src(config.index)
               .pipe(lazy.inject(gulp.src(config.jsPath, {read: false})))
               .pipe(gulp.dest(""));
});
gulp.task("Test-js-injector", ["test-js-injector"]);


/*
* * * Concat all Less files and then compile to css
*/
gulp.task("less-css", function () {
    return gulp.src(["./app/_public/styles/less/variables.less", config.lessPath])
               .pipe(lazy.concat("main.less"))
               .pipe(lazy.less())
               .pipe(gulp.dest(config.environment + "/_public/styles/"));
});
gulp.task("Test-less-css", ["test-less-css"]);


/*
* * * Add browser prefixes to make the Css rules compatible across browsers in the main.css file
*/
gulp.task("auto-prefixer", ['less-css'], function () {
    return gulp.src(config.environment + "/_public/styles/main.css")
               .pipe(lazy.autoprefixer({
                  browsers: ["> 0%"],
                  cascade: true
               }))
               .pipe(gulp.dest(config.environment + "/_public/styles/"));
});
gulp.task("Test-auto-prefixer", ["test-auto-prefixer"]);


/*
* * * Inject all Css files into index.html
*/
gulp.task("css-injector", ['auto-prefixer'], function () {
    return gulp.src(config.index)
               .pipe(lazy.inject(gulp.src(config.environment + "/_public/styles/main.css", {read: false})))
               .pipe(gulp.dest(""));
});
gulp.task("Test-css-injector", ["test-css-injector"])


/*
* * * Inject all Bower components into index.html
*/
gulp.task("bower-injector", function () {
    return gulp.src(config.index)
               .pipe(wiredep.stream())
               .pipe(gulp.dest(""));
});
gulp.task("Test-bower-injector", ["test-bower-injector"]);


/*
* * * Move all HTML files to "development" destination
*/
gulp.task("copy-html", function () {
    return gulp.src(config.htmlPath)
               .pipe(gulp.dest(config.environment));
});


/*
* * *  Watch for newly added Typescript files, compile them, and then added their Js files into index.html.
* * * If a file has been deleted, its corresponding Js will be deleted and its following script will be
* * * also deleted from index.html
*/
gulp.task("ts-watcher", function () {
    lazy.watch(config.tsPath)
        .on("add", function (path) {
          console.log("New file has been added " + path);
          runSequence("js-injector");
        })
        .on("change", function (path) {
            console.log("File has been changed " + path);
            gulp.start("ts-compiler");
        })
        .on("unlink", function (path) {

            var jsPath = path.replace(".ts", ".js").replace("/app", "/development");
            deleteFiles(jsPath);
            setTimeout(function() {
              gulp.start("js-injector");
            }, 1000);
        });
});


/*
  less watcher
*/
gulp.task("less-watcher", function () {
    lazy.watch([config.lessPath])
        .on("change", function (path) {
           runSequence("less-css", "auto-prefixer");
        });
});

/*
* * *
*/
gulp.task("html-watcher", function () {
    lazy.watch(config.htmlPath)
        .on("add", function (path) {
          console.log('html added');
          var devFile = path.replace("app", config.environment);
          copyFiles(path, devFile);
        })
        .on("change", function (path) {

          var devFile = path.replace("app", config.environment);
          copyFiles(path, devFile);

        })
        .on("unlink", function (path) {
          var devFile = path.replace("app", config.environment);
          deleteFiles(devFile);
        });
});

/****** temp images ****/

gulp.task("copy-images", function(){
  copyFiles('./app/_public/images', config.environment + "/_public/images");
});

function copyFiles (file, dest) {
  fse.copy(file, dest, function(err){
    console.log(file + " copied to " + dest);
  });
};

function deleteFiles(path){
  fse.remove(path, function(err){
    console.log("File has been deleted: " + path);
  });
};


gulp.task("clean", function(){
  deleteFiles(config.environment);
})


/*
* * * Browser Sync Starter
*/
gulp.task("browser-sync", startBrowserSync);


/*
* * * Browser Sync configuration. Synchronize code across browsers. Watch for changes and reload the browsers.
*/
function startBrowserSync() {

  if (browserSync.active) {
    return;
  }

  var options = {
      server: {
        baseDir: "./"
      },
      port: 9090,
      files: ["!" + config.lessPath, config.environment + "/**/*.*"],
      ghostMode: {
        clicks: true,
        location: true,
        forms: true,
        scroll: true
      },
      injectChanges: true,
      logFileChanges: true,
      logLevel: "debug",
      logPrefix: "gulp-patterns",
      notify: true,
      reloadDelay: 50,
      online: false,
      open: false,
      browser: "google chrome"
  };

  browserSync(options);
}

/*
* * * Fire the main task to create the "development" environment.
*/
gulp.task("start", function () {
  runSequence("clean",
              "js-injector",
              "copy-images",
              "css-injector",
              "bower-injector",
              "copy-html",
              "less-watcher",
              "ts-watcher",
              "html-watcher",
              "browser-sync");
});

  /*                                  */
 /* * *     Build Environment    * * */
/*                                  */

/*
* * * Minify Html
*/
gulp.task("minify-html", function () {
    return gulp.src(config.htmlPath)
               .pipe(lazy.minifyHtml({conditionals: true, spare:true}))
               .pipe(gulp.dest(config.build));
});
gulp.task("Test-minify-html", ["test-minify-html"]);



/*
* * * Compressing Images
*/
gulp.task("images", function () {
    return gulp.src(config.imagesPath)
               .pipe(lazy.imagemin({optimizationLevel: 5}))
               .pipe(gulp.dest(config.build + "_public/img"));
});
gulp.task("Test-images", ["test-images"]);




/*
* * * Copying fonts to their destination
*/
gulp.task("copy-fonts", function () {
    return gulp.src(config.fontsPath)
               .pipe(gulp.dest(config.build + "_public/styles/fonts"))
});


/*
* * * Template cache
*/
gulp.task("template-cache", function () {
    return gulp.src(config.htmlPath)
               .pipe(lazy.minifyHtml({empty: true}))
               .pipe(lazy.angularTemplatecache())
               .pipe(gulp.dest(config.build));
});
gulp.task("Test-template-cache", ["test-template-cache"]);



/*
* * * Minify Css
*/
gulp.task("minify-css", function () {
    return gulp.src(config.build + "main.css")
               .pipe(lazy.minifyCss({keepBreaks: false}))
               .pipe(lazy.rename({suffix: '.optimized.min'}))
               .pipe(gulp.dest(config.build));
});
gulp.task("Test-minify-css", ["test-minify-css"]);



/*
* * * Minify JS
*/
gulp.task("minify-js", function () {
    return gulp.src(config.build + "build.js")
               .pipe(lazy.stripDebug())
               .pipe(lazy.uglify())
               .pipe(lazy.rename({suffix: '.optimized.min'}))
               .pipe(gulp.dest(config.build));
});
gulp.task("Test-minify-js", ["test-minify-js"]);



/*
* * * Fix angular's dependecie's names
*/
gulp.task("dependency-fixer", function () {
  return gulp.src(config.jsPath)
             .pipe(lazy.ngAnnotate())
             .pipe(gulp.dest(config.environment));
});
gulp.task("Test-dependency-fixer", ["test-dependency-fixer"]);



/*
* * * IF the environment is the build environment, it injects the html partials in the
* * * angular template cache before merging all the scripts together in one file.
*/
function useRefBuild () {
  var assets = lazy.useref.assets();
  gulp.src(config.index)
      .pipe(lazy.inject(gulp.src(config.build + "templates.js", {read: false}), {starttag: "<!-- inject:templates:js -->"}))
      .pipe(assets)
      .pipe(assets.restore())
      .pipe(lazy.useref())
      .pipe(gulp.dest("./build"))
      .on("end", function () {
          runSequence("minify-js", "minify-css", function () {
            deleteFiles([config.build + "main.css", config.build + "build.js", config.build + "templates.js"]);
            setTimeout(rename, 1000);
          });
      });
}


/*
* * * Rename the newly optimized files back to build.js and main.css respectively, then delete the old optimized files,
* * * because he useRef in the index.html is always pointing at two files named: build.js and main.css.
*/
function rename() {
  gulp.src(config.build + "build.optimized.min.js")
      .pipe(lazy.rename("./build/app/build.js"))
      .pipe(gulp.dest(""))
      .on("end", function () {
        deleteFiles(config.build + "build.optimized.min.js");
      });
  gulp.src(config.build + "main.optimized.min.css")
      .pipe(lazy.rename("./build/app/main.css"))
      .pipe(gulp.dest(""))
      .on("end", function () {
        deleteFiles(config.build + "main.optimized.min.css");
      });
}

/*
* * * Fire the main tasks to prepare the "build" environment. Optimize All. For publishing app.js lib.js app.css lib.css
*/
gulp.task("env-build", ["minify-html",
                        "images",
                        "copy-fonts",
                        "template-cache",
                        "dependency-fixer"], useRefBuild);
}());
