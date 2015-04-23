// Simple directive that sets the active class on an element if the
// href attribute == the current location path
angular.module('directives').directive('navHref', function($location, $rootScope) {
  return {
    restrict: 'A',
    // priority: 1200,
    link: function(scope, element, attrs) {
      attrs.$observe('navHref', function(href) {
        element.attr('href', href);
        updateActiveClass(element, href);
      });

      // On subsequent route changes update the active class
      $rootScope.$on('$routeChangeStart', function() {
        updateActiveClass(element, element.attr('href'));
      });
    }
  };

  function updateActiveClass(element, href) {
    if (href == $location.$$path)
      element.addClass('active');
    else
      element.removeClass('active');
  }
});

angular.module('directives').directive('selectOnClick', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('click', function() {
        this.select();
      });
    }
  };
});
