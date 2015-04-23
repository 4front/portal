angular.module('directives').directive('cliInstruction', function($timeout) {
  var template = '<div class="input-group cli">' +
    '<input class="form-control" type="text" value="{{value}}" readonly select-on-click />' +
    '<span class="input-group-btn" tooltip="{{tooltip}}" tooltip-placement="bottom" tooltip-append-to-body="1">' +
    '<button type="button" class="btn btn-default" clip-copy="value" clip-click="clipClicked()">' +
    '<i class="fa fa-clipboard" />' +
    '</button>' +
    '</span>' +
    '</div>';

  var tooltip = 'Copy to clipboard';

  return {
    restrict: 'E',
    scope: {
      value: '='
    },
    template: template,
    link: function(scope) {
      scope.tooltip = tooltip;

      scope.clipClicked = function() {
        this.tooltip = "Copied!";
        var self = this;
        $timeout(function() {
          self.tooltip = tooltip;
        }, 1000);
      };
    }
  };
});
