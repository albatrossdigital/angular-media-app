angular.module('app.flickr')

// See https://www.flickr.com/services/api/flickr.photos.search.html
// Photo url documentation: https://www.flickr.com/services/api/misc.urls.html
.factory('Flickr', function ($resource, $rootScope) {

    return $resource('https://api.flickr.com/services/rest/', {
      api_key: $rootScope.flickrApiKey, 
      format: 'json', 
      jsoncallback: 'JSON_CALLBACK'
    }, { 'load': { method: 'JSONP' } });

})
