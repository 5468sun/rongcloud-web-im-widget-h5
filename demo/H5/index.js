var demo = angular.module("demo", ["RongCloudkefu"]);

demo.controller("main", ["$scope","RongKefu", function($scope,RongKefu) {
  $scope.title="asdf";
  RongKefu.init({
        appkey:"mgb7ka1nbkczg",//selfe
        token:"V/Z/nwY7REJigmcfm/bk+T1T3zMswu0gBtgpGX74/E8EBtHNSjmKVYOs6chEtHSqICQoSl4ISUQiZs/NawvcEg==",//selfe kefu
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
