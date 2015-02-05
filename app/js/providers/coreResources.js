angular.module('app.core')

// JSON endpoint provided by Drupal view.
.factory('CoreBrowser', function ($resource, $rootScope) {
    return $resource($rootScope.apiUrl + 'browse/:person/:type/:name', {
      format: 'json',
      type: '@type',
      name: '@name',
      person: '@person'
    }, { 'load': { method: 'JSON' } });
})


// Read/edit/create files. Provided by angular_media.module.
.factory('CoreFile', function ($resource, $rootScope) {
    return $resource($rootScope.apiUrl + 'file', {
      format: 'json',
      type: '@fid',
      type: '@name',
      type: '@title',
      type: '@alt',
      type: '@license',
      type: '@source',
    }, { 'load': { method: 'JSON' } });
})
