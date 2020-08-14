'use strict';

angular.module('bahmni.common.referral')
    .factory('referralService', ['$http', function ($http) {
        var referralUrl = Bahmni.Common.Constants.nuacareQueueUrl + "/referral";
        var departmentUrl = Bahmni.Common.Constants.nuacareQueueUrl + "/department";

        var getAllDepartment = function (name) {
            return $http.get(departmentUrl + "/search", { params: { name: name || '' }, withCredentials: true });
        };

        var getLatestReferral = function (patientUuid) {
            return $http.get(referralUrl + "/getLatestReferral", { params: { patientUuid: patientUuid }, withCredentials: true });
        };

        var referPatient = function (paylod) {
            var config = {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            };
            return $http.post(referralUrl + "/create", paylod, config);
        };

        var getSqlResponse = function (query, patientUuid) {
            var params = {
                q: query,
                v: "full",
                patientUuid: patientUuid
            };
            return $http.get(Bahmni.Common.Constants.sqlUrl, {
                method: "GET",
                params: params,
                withCredentials: true
            });
        };

        return {
            getAllDepartment: getAllDepartment,
            referPatient: referPatient,
            getLatestReferral: getLatestReferral,
            getSqlResponse: getSqlResponse
        };
    }]);
