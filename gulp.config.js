(function() {
    module.exports = function() {

        var GlobalConfig = {
            env: process.env.NODE_ENV,
            key: undefined,
            secret: undefined,
            appName: 'ScratchCard',
            appPath: 'app/',
            // configuration used in the app depending on the development environment
            inAppConfig: require('./config/' + process.env.NODE_ENV + '.json')
        };

        return {

            inAppConfig: GlobalConfig.inAppConfig,
            appName: GlobalConfig.appName,

            environment: GlobalConfig.env,
            appPath: GlobalConfig.appPath,

            lessPath: GlobalConfig.appPath + "_public/styles/less/*.less",
            cssPath: GlobalConfig.env + "/_public/styles/*.css",

            fontsPath: GlobalConfig.appPath + "_public/styles/fonts/*.*",
            htmlPath: GlobalConfig.appPath + "**/*.html",
            imgagesPath: GlobalConfig.appPath + "_public/images/*.*",

            tsPath: GlobalConfig.appPath + "**/*.ts",
            jsPath: [GlobalConfig.env + "/*.module.js", GlobalConfig.env + "/app.*.js", GlobalConfig.env + "/**/*.js"],

            index: "index.html",

        };

    };
}());