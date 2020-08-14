'use strict';

angular.module('bahmni.common.referral')
    .directive('patientReferral', ['referralService', 'messagingService', 'spinner', 'confirmBox', 'appService', '$q', 'queueService',
        function (referralService, messagingService, spinner, confirmBox, appService, $q, queueService) {
            var controller = function ($scope) {
                $scope.isDepartmentAutoComplete = function () {
                    return appService.getAppDescriptor().getConfigValue("departmentAutocomplete") || false;
                };

                var mapKeyValueResponse = function (response) {
                    var list = _.get(response, 'data', []);
                    return _.map(list, function (item) {
                        return ({
                            display: item.value,
                            label: item.value,
                            value: item.value,
                            key: item.key
                        });
                    });
                };

                $scope.mapKeyValueResponse = mapKeyValueResponse;

                $scope.searchDepartment = function (q) {
                    return referralService.getAllDepartment(q.term);
                };

                $scope.handleSelectDepartment = function (department) {
                    $scope.referral.setOrClearDepartment(department);
                };

                $scope.hasActiveToken = function () {
                    return $scope.registration && _.get($scope.activeToken, 'id');
                };

                var init = function () {
                    var departmentPromise = referralService.getAllDepartment('');
                    var referralPromise = referralService.getLatestReferral($scope.patient.uuid);
                    var tokenPromise = queueService.getAssignedToken($scope.patient.uuid);
                    spinner.forPromise($q.all([departmentPromise, tokenPromise, referralPromise]).then(function (response) {
                        $scope.allDepartments = mapKeyValueResponse(response[0]);
                        $scope.activeToken = _.get(response[1], 'data', null);
                        $scope.referral.copyFrom(_.get(response[2], 'data'));
                    }));
                };
                init();
            };
            return {
                restrict: 'E',
                scope: {
                    patient: "=",
                    registration: "=",
                    referral: "="
                },
                controller: controller,
                template: '<ng-include src="\'../common/referral/views/patientReferral.html\'" />'
            };
        }]);
