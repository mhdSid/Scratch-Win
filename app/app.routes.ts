/// <reference path="./../tools/typings/angularjs/angular.d.ts" />
((): void => {
    angular.module('ScratchCard').config(configFn);
    configFn.$inject = ['$routeProvider', '$locationProvider', 'cdn']
    function configFn($routeProvider: any, $locationProvider: any, cdn): any {
            $locationProvider.html5Mode(true);
            $routeProvider
            .when('/',
            {
                templateUrl: cdn.mainUrl + 'scratch-card-pixi/scratch-card-pixi.html'
            })
            .when('/scratch-card-canvas',
            {
                templateUrl: cdn.mainUrl + 'scratch-card-canvas/scratch-card-canvas.html'

            })
            .otherwise({
                redirectTo: '/'
            });
    };
})();
