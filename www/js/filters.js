// Simple filter to uppercase the first letter or a word
angular.module('filters').filter('capitalize', function() {
  return function(input, all) {
    return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }) : '';
  };
});

angular.module('filters').filter('bytes', function() {
  return function(bytes, precision) {
    if (bytes === 0) {
      return '0 bytes';
    }
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;

    var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024)),
      val = (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision);

    return (val.match(/\.0*$/) ? val.substr(0, val.indexOf('.')) : val) + ' ' + units[number];
  };
});