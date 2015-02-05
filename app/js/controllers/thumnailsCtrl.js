
// @todo: look into angular crop: https://github.com/alexk111/ngImgCrop/
// ex: http://jsfiddle.net/iceye/ryb31tj1/ (see https://github.com/alexk111/ngImgCrop/issues/6)
// Also look into: https://github.com/LukeMason/angular-img-editor (http://www.lukemason.co/sandbox/angular-img-editor/example/)
// 


angular.module('app.core')

.controller('thumbnails', function($scope, $rootScope, $state, $stateParams, FileUploader){
  // set rootscope settings
  $scope.init = function(params) {
    //$rootScope.appUrl = params.appUrl != undefined ? params.appUrl : '';
    $rootScope.apiUrl = params.apiUrl != undefined ? params.apiUrl : '';
    $rootScope.multiple = params.multiple != undefined ? params.multiple : false;
    $rootScope.files = params.files != undefined ? params.files : [];
  }

  // Deal with drop to upload
  var uploader = $scope.uploader = new FileUploader({
      url: $rootScope.apiUrlUpload + 'upload',
      autoUpload: true
  });
})
