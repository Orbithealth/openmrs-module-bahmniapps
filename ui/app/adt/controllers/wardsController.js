'use strict';

angular.module('bahmni.adt')
    .controller('WardsController', ['$scope', '$rootScope', '$window', '$document', 'spinner', 'wardService',
        function ($scope, $rootScope, $window, $document, spinner, wardService) {
            $scope.wards = null;

            var init = function () {
                return loadAllWards();
            };

            var loadAllWards = function () {
                return wardService.getWardsList().success(function (wardsList) {
                    $scope.wards = [];
                    var ward = _.find(wardsList.results, function (ward) {
                        return ward.ward.name === $rootScope.currentUser.currentLocation;
                    });
                    if (ward) {
                        $scope.wards.push(ward);
                    }
                });
            };
            spinner.forPromise(init());
        }]);
