var demo = angular.module("demo", ["RongCloudkefu"]);

demo.controller("main", ["$scope","RongKefu", function($scope,RongKefu) {
  $scope.title="asdf";
  RongKefu.init({
        appkey:"mgb7ka1nbkczg",//selfe
        token:"Jo9g+W0LCjETAgDuPYpOM0Z0Hq5rhvnx0xOCtgKejolCVM1pOvbdAQcuMWMbumko10nbOEzSZJ/hmgl3Vlynzbs61w3Fr6Du",//selfe kefu
        kefuId:"KEFU147669210349165",//selfe
        position:RongKefu.KefuPostion.left,
        onSuccess:function(e){
          console.log(e);
          RongKefu.show();
        }
  })
    $scope.show = function() {
      RongKefu.show();
    }

    $scope.kefu=function(){
        RongKefu.show();
    }

    $scope.hidden = function() {
      RongKefu.hidden();
    }
}]);
