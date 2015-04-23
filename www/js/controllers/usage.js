angular.module('controllers').controller('TrafficChartCtrl', function($scope, $rootScope, $location, $filter) {

  // $scope.options = {
  //   chart: {
  //       type: 'lineChart',
  //       height: 250,
  //       margin : {
  //           top: 10,
  //           right: 40,
  //           bottom: 40,
  //           left: 55
  //       },
  //       showMaxMin: false,
  //       // x: function(d){ return d.label; },
  //       // y: function(d){ return d.value; },
  //       showValues: true,
  //       valueFormat: function(d){
  //         return d3.format(',.4f')(d);
  //       },
  //       transitionDuration: 500,
  //       xAxis: {
  //         // axisLabel: 'Day',
  //         highlightZero: false,
  //         showMaxMin: false,
  //         tickFormat: function(d) {
  //           return $filter('date')(d, "EEE, MMM d");
  //         },
  //         axisLabelDistance: 10
  //       },
  //       yAxis: {
  //         showMaxMin: false,
  //         axisLabel: 'Visits',
  //         axisLabelDistance: 30
  //       }
  //   }
  // };

  $scope.options = {
    renderer: 'line'
  };

  function xFormat(x) {
    return x + 'f';
  }

  $scope.features = {
    palette: 'colorwheel',
    xAxis: {
      // timeUnit: 'day',
      tickFormat: xFormat
    },
    yAxis: {},
    hover: {
      xFormatter: function(x) {
        return x;
      },
      yFormatter: function(y) {
        return y;
      }
    },
    legend: {}
  };

  $scope.series = [{data: [{x:0,y:0}]}];

  // Create random number for each of the last 7 days
  $scope.$watch('applications', function() {
    var chartData = [];
    _.each($scope.$parent.applications, function(app) {
      var series = {
        name: app.name,
        data: []
      };

      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

      // Get the number of app sessions for the last 7 days
      for (var i=-7; i<=0; i++) {
        var dt = new Date(today.getTime() + (i * 24 * 60 * 60 * 1000));
        series.data.push({
          x: new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0).getTime() / 1000,
          y: _.random(100, 200)
        });
      }

      chartData.push(series);
    });

    $scope.series = chartData;
  });
});
