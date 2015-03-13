/* global angular:true */
(function(angular){

    var Jcrop = jQuery.Jcrop;

    angular.module('ngJcrop', [])

    .constant('ngJcroptDefaultConfig', {
        widthLimit: 1000,
        heightLimit: 1000,
        jcrop: {
            maxWidth: 300,
            maxHeight: 200
        }
    })

    .constant('ngJcropTemplate',
        '<div class="ng-jcrop">' +
        '    <div class="ng-jcrop-image-wrapper">' +
        '        <img class="ng-jcrop-image" />' +
        '   </div>' +
        '   <div class="ng-jcrop-thumbnail-wrapper" ng-style="previewImgStyle">' +
        '       <img class="ng-jcrop-thumbnail" />' +
        '   </div>' +
        '</div>'
    )

    .provider('ngJcropConfig', ['ngJcroptDefaultConfig', 'ngJcropTemplate', function(ngJcroptDefaultConfig, ngJcropTemplate){
        var config = angular.copy(ngJcroptDefaultConfig);
        config.template = ngJcropTemplate;

        return {
            setConfig: function(objConfig){
                angular.extend(config, objConfig);
            },
            setJcropConfig: function(objConfig){
                angular.extend(config.jcrop, objConfig);
            },
            $get: function(){
                return config;
            }
        };

    }])

    .run(['$window', function($window){
        if( !$window.jQuery ){
            throw new Error("jQuery isn't included");
        }

        if( !$window.jQuery.Jcrop ){
            throw new Error("Jcrop isn't included");
        }

    }])

    .directive('ngJcrop', ['ngJcropConfig', function(ngJcropConfig){

        return {
            restrict: 'A',
            scope: {ngJcrop: '=', thumbnail: '=', selection: '='},
            template: ngJcropConfig.template,
            controller: 'JcropController'
        };

    }])

    .directive('ngJcropInput', function(){

        return {
            restrict: 'A',
            controller: 'JcropInputController'
        };

    })

    .controller('JcropInputController', ['$rootScope', '$element', '$scope',
    function($rootScope, $element, $scope){

        if( $element[0].type !== 'file' ){
            throw new Error('ngJcropInput directive must be placed with an input[type="file"]');
        }

        $scope.setImage = function(image){
            var reader = new FileReader();

            reader.onload = function(ev){
                $rootScope.$broadcast('JcropChangeSrc', ev.target.result);
                $element[0].value = '';
            };

            reader.readAsDataURL(image);
        };

        $element.on('change', function(ev){
            var image = ev.currentTarget.files[0];
            $scope.setImage(image);
        });

    }])

    .controller('JcropController', ['$scope', '$element', 'ngJcropConfig', '$window', '$rootScope',
    function($scope, $element, ngJcropConfig, $window, $rootScope){


        /* Checking the mandatory attributes */
        if( angular.isUndefined($scope.selection) ){
            throw new Error('ngJcrop: attribute `selection` is mandatory');
        } else if( !angular.isArray($scope.selection) && !($scope.selection === null)){
            throw new Error('ngJcrop: attribute `selection` must be an array');
        }

        /**
         * jquery element storing the main img tag
         * @type {jQuery}
         */
        $scope.mainImg = null;
        $scope.imgStyle = {'width': ngJcropConfig.jcrop.maxWidth, 'height': ngJcropConfig.jcrop.maxHeight};

        /**
         * jquery element storing the preview img tag
         * @type {jQuery}
         */
        $scope.previewImg = null;
        $scope.previewImgStyle = {'width': '100px', 'height': '100px', 'overflow': 'hidden', 'margin-left': '5px'};

        /**
         * Stores the jcrop instance
         * @type {jCrop}
         */
        $scope.jcrop = null;

        /**
         * Updates the `imgStyle` with width and height
         * @param  {Image} img
         */
        $scope.updateCurrentSizes = function(img){
            var widthShrinkRatio = img.width / ngJcropConfig.jcrop.maxWidth,
                heightShrinkRatio = img.height / ngJcropConfig.jcrop.maxHeight,
                widthConstraining = img.width > ngJcropConfig.jcrop.maxWidth && widthShrinkRatio > heightShrinkRatio,
                heightConstraining = img.height > ngJcropConfig.jcrop.maxHeight && heightShrinkRatio > widthShrinkRatio;

            if (widthConstraining) {
                $scope.imgStyle.width = ngJcropConfig.jcrop.maxWidth;
                $scope.imgStyle.height = img.height / widthShrinkRatio;
            } else if (heightConstraining) {
                $scope.imgStyle.height = ngJcropConfig.jcrop.maxHeight;
                $scope.imgStyle.width = img.width / heightShrinkRatio;
            } else {
                $scope.imgStyle.height = img.height;
                $scope.imgStyle.width = img.width;
            }
        };

        /**
         * set the `$scope.selection` variable
         * @param {object} coords An object like this: {x: 1, y: 1, x2: 1, y2: 1, w: 1, h: 1}
         */
        $scope.setSelection = function(coords){
            if( !angular.isArray($scope.selection) ){
                $scope.selection = [];
            }

            $scope.selection[0] = Math.round(coords.x);
            $scope.selection[1] = Math.round(coords.y);
            $scope.selection[2] = Math.round(coords.x2);
            $scope.selection[3] = Math.round(coords.y2);
            $scope.selection[4] = Math.round(coords.w);
            $scope.selection[5] = Math.round(coords.h);
        };

        /**
         * Updates the preview regarding the coords form jCrop
         */
        $scope.showPreview = function(coords){
            if( !$scope.selectionWatcher ){
                $scope.$apply(function(){
                    $scope.setSelection(coords);
                });
            }

            if( !$scope.thumbnail ){
                return;
            }

            var rx = 100 / coords.w;
            var ry = 100 / coords.h;

            $scope.previewImg.css({
                width: Math.round(rx * $scope.imgStyle.width) + 'px',
                maxWidth: Math.round(rx * $scope.imgStyle.width) + 'px',
                height: Math.round(ry * $scope.imgStyle.height) + 'px',
                maxHeight: Math.round(ry * $scope.imgStyle.height) + 'px',
                marginLeft: '-' + Math.round(rx * coords.x) + 'px',
                marginTop: '-' + Math.round(ry * coords.y) + 'px'
            });
        };

        /**
         * @event
         */
        $scope.onMainImageLoad = function(){
            $scope.mainImg.off('load', $scope.onMainImageLoad);
            $scope.updateCurrentSizes(jQuery('<img>').attr('src', $scope.mainImg[0].src)[0]);
            
            // This is a hack for angular_media to get the aspectRatio settings from $rootScope
            var ratio = $rootScope.settings[$rootScope.activeField].cropRatio != undefined && $rootScope.settings[$rootScope.activeField].cropRatio != 'free' ? 
                eval($rootScope.settings[$rootScope.activeField].cropRatio) :
                undefined;

            var config = angular.extend({
                onChange: $scope.showPreview,
                onSelect: $scope.showPreview,
                aspectRatio: ratio
            }, ngJcropConfig.jcrop);

            if( $scope.selection && $scope.selection.length === 6 ){
                config.setSelect = $scope.selection;
            }


            $scope.jcrop = Jcrop($scope.mainImg, config);
        };

        /**
         * Destroys the current jcrop instance
         */
        $scope.destroy = function(){
            if( $scope.jcrop ){
                if( $scope.mainImg ){ $scope.mainImg.off('load'); }
                $scope.jcrop.destroy();
                $scope.jcrop = null;
            }
        };

        /**
         * @init
         */
        $scope.init = function(src){
            $scope.destroy();

            $scope.mainImg = jQuery('<img>').addClass('ng-jcrop-image');
            $scope.mainImg.on('load', $scope.onMainImageLoad);
            $scope.mainImg.css({ maxWidth: ngJcropConfig.jcrop.maxWidth, maxHeight: ngJcropConfig.jcrop.maxHeight });
            $scope.mainImg.attr('src', src);

            $element.find('.ng-jcrop-image-wrapper').empty().append($scope.mainImg);

            var thumbnailWrapper = $element.find('.ng-jcrop-thumbnail-wrapper');
            $scope.previewImg = $element.find('.ng-jcrop-thumbnail');

            if( $scope.thumbnail ){
                thumbnailWrapper.show();
                $scope.previewImg.attr('src', src);
            } else {
                thumbnailWrapper.hide();
            }

        };

        $scope.$on('$destroy', $scope.destroy);

        $scope.$on('JcropChangeSrc', function(ev, src){
            $scope.$apply(function(){
                $scope.setSelection({
                    x: 0,
                    y: 0,
                    x2: ngJcropConfig.widthLimit,
                    y2: ngJcropConfig.heightLimit,
                    w: ngJcropConfig.widthLimit,
                    h: ngJcropConfig.heightLimit
                });

                $scope.ngJcrop = src;
            });
        });

        $scope.$watch('ngJcrop', function(newValue, oldValue, scope){
            scope.init(newValue);
        });

        $scope.$watch('thumbnail', function(newValue, oldValue, scope){
            var src = scope.mainImg.attr('src');
            scope.init(src);
        });

        $scope.$watch('selection', function(newValue, oldValue, scope){
            if( scope.jcrop ){
                scope.selectionWatcher = true;
                if( angular.isArray(scope.selection) ){
                    scope.jcrop.setSelect(scope.selection);
                } else {
                    scope.jcrop.release();
                }
                scope.selectionWatcher = false;
            }
        });

    }]);


})(angular);
