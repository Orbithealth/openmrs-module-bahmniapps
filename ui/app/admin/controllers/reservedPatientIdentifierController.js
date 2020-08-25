'use strict';

angular.module('bahmni.admin')
    .controller('reservedPatientIdentifierController', ['$scope', 'spinner', 'adminReservedIdentifierService', 'messagingService', '$translate',
        function ($scope, spinner, adminReservedIdentifierService, messagingService, $translate) {
            $scope.selectedIndex = null;
            $scope.selected = null;

            $scope.saveIdgenRange = function (uuid, range) {
                spinner.forPromise(adminReservedIdentifierService.saveIdGenSourceRange(uuid, range)).then(function () {
                    init();
                });
            };

            $scope.deleteIdGenSourceRange = function (uuid) {
                spinner.forPromise(adminReservedIdentifierService.deleteIdGenSourceRange(uuid)).then(function () {
                    init();
                });
            };

            $scope.selectIdgenSource = function (index, selected) {
                $scope.selectedIndex = index;
                $scope.selected = selected;
            };

            var init = function () {
                $scope.list = [];
                $scope.range = {
                    start: '',
                    end: ''
                };
                spinner.forPromise(adminReservedIdentifierService.getAllIdGenSource().then(function (response) {
                    $scope.list = response.data;
                    if (response.data && response.data.length > 0) {
                        $scope.selectedIndex = $scope.selectedIndex || 0;
                        $scope.selectIdgenSource($scope.selectedIndex, $scope.list[$scope.selectedIndex]);
                    }
                }));
            };

            init();
        }]);
