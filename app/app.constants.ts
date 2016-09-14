/// <reference path="./../tools/typings/angularjs/angular.d.ts" />

angular.module("ScratchCard").constant("__OPTIONS__", {

   __BRUSHBOXBOACKGROUND__: '/development/_public/images/scratch.png',

   __MAINBACKGROUNDIMAGE__: '/development/_public/images/background.jpeg',

   __BRUSHIMAGE__: '/development/_public/images/realBrush.png',  //realBrush

   __PRIZEIMAGES__: "/development/_public/images/carr0.jpg," +
                    "/development/_public/images/carr1.jpg," +
                    "/development/_public/images/carr2.jpg-" +
                    "/development/_public/images/carr3.jpg," +
                    "/development/_public/images/carr4.jpg," +
                    "/development/_public/images/carr5.jpg-" + 
                    "/development/_public/images/carr6.jpg," +
                    "/development/_public/images/carr7.jpg," +
                    "/development/_public/images/carr8.jpg", 

    __BRUSHBOXWIDTH__: 500,

    __BRUSHBOXHEIGHT__: 500,

    __BRUSHBOXPADDING__: 20,

    __MATRIXROWX__: 3, 

    __MMATRIXCOLY__: 3,

    __BRUSHSIZE__: 30,

    __ROOTTEMPLATE__: '<div id="renderer"></div>'
});
