'use strict';

angular.module('app.core', [
  'ui.router',
  'angularFileUpload'
])

.config(
  [ '$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      
      //$urlRouterProvider
      //  .when('/', '/flickr');

      $stateProvider
        
        .state("base", {})

        .state("modal", {
          templateUrl: appUrl + 'views/modal.html',
          onEnter: function($state){
            // Hitting the ESC key closes the modal
            $(document).on('keyup', function(e){
              if(e.keyCode == 27){
                $(document).off('keyup')
                $state.go('base')
              }
            });

            // Clicking outside of the modal closes it
            $(document).on('click', '.modal-backdrop, .modal-holder', function() {
              $state.go('base');
            });

            // Clickin on the modal or it's contents doesn't cause it to close
            $(document).on('click', '.modal-box, .modal-box *', function(e) {
              e.stopPropagation();
            });
          },
          abstract: true
        })

        .state("modal.upload", {
          url: "/upload",
          templateUrl: appUrl + 'views/upload.html',
          controller: 'upload'
        })

        .state("modal.browse", {
          url: "/browse/:person",
          templateUrl: appUrl + 'views/browse.html',
          controller: 'browse'
        })
    }
  ]
)



.controller('browse', function($scope, $rootScope, $state, $stateParams, CoreBrowser, CoreFile){
  $scope.filters = {
    page: 1,
    person: $stateParams.person
  };
  console.log($stateParams);

  $scope.selected = [];
  $scope.items = [];

  $scope.loadItems = function(push) {
    CoreBrowser.query($scope.filters, function(data) {
      if (push !== undefined && push == true) {
        Array.prototype.push.apply($scope.items, data);
      }
      else {
        $scope.items = data;
      }
      console.log($scope.items);
    });
  }

  $scope.updateFilters = function() {
    $scope.filters.page = 1;
    console.log('prehi');
    $scope.items = $scope.loadItems();
    console.log('hi');
    console.log($scope.items);
    //$scope.photos.constructUrl(item);
  }
  $scope.updateFilters();

  $scope.updateActive = function(item) {
    if (item != undefined) {
      if ($rootScope.multiple && item.active) {
        item.active = false;
        angular.forEach($scope.selected, function(activeItem, key) {
          if (activeItem.id == item.id) {
            $scope.selected.splice(key, 1);
          }
        });
      }
      else {
        $scope.active = item;
        if ($rootScope.multiple) {
          item.active = true;
          $scope.active = item;
        }
        else {
          angular.forEach($scope.items, function(activeItem, key) {
            $scope.items[key].active = activeItem.id == item.id ? true : false;
          });
        }
        if ($rootScope.multiple) {
          $scope.selected.push(item);
        }
        else {
          $scope.selected = [item];
        }
        CoreFile.load({fid: item.fid}, function(data) {
          $scope.active = data;
          console.log(data);
        });
      }
    }
  }

  $scope.submit = function() {
    //$scope.filters.page++;
    console.log($scope.selected);

    Array.prototype.push.apply($rootScope.files, $scope.selected);
    $state.go('base');

    //var newData = Flickr.load($scope.filters);
    //Array.prototype.push.apply($scope.items, newData);
  }

  $scope.addItems = function() {
    /*console.log('add');
    $scope.filters.page++;
    var newData = $scope.loadItems();
    Array.prototype.push.apply($scope.items, newData);*/
  }

})




.controller('upload', function($scope, $rootScope, $state, $stateParams, FileUploader){
  $scope.uploading = false;
  $scope.selected = [];

  var uploader = $scope.uploader = new FileUploader({
    url: $rootScope.apiUrlUpload + 'upload',
    autoUpload: true
  });
  uploader.onSuccessItem = function(fileItem, response, status, headers) {
    console.info('onSuccessItem', fileItem, response, status, headers);
    $scope.selected.push(response);
  };
  uploader.onBeforeUploadItem = function(item) {
    console.info('onBeforeUploadItem', item);
    $scope.uploading = true;
  };
  uploader.onCompleteAll = function() {
    console.info('onCompleteAll');
    $scope.uploading = false;
  };

  $scope.submit = function($event) {
    //$scope.filters.page++;
    console.log($scope.selected);

    Array.prototype.push.apply($rootScope.files, $scope.selected);
    $scope.selected = [];
    $state.go('base');

    $event.preventDefault();

    //var newData = Flickr.load($scope.filters);
    //Array.prototype.push.apply($scope.items, newData);
  }
  

  // CALLBACKS

  /*      uploader.onWhenAddingFileFailed = function(item, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };*/
});
