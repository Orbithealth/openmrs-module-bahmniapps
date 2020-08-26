'use strict';

angular.module('bahmni.adt')
    .directive('adtPatientSearch', ['$timeout', function ($timeout) {
        var link = function ($scope, element) {
            $timeout(function () {
                element.find('.desktop-menu ul').prepend($('.tab-item-desktop'));
                element.find('.mobile-menu ul').prepend($('.tab-item-mobile'));
                element.find('.tab-content').append($('#ward-list'));
                if ($scope.isBedManagementEnabled && !$scope.search.navigated) {
                    $scope.search.searchType = undefined;
                }
            });
        };

        return {
            restrict: 'E',
            controller: 'PatientsListController',
            link: link,
            templateUrl: '../common/patient-search/views/patientsList.html'
        };
    }]);
