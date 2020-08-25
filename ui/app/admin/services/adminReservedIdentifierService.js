'use strict';

angular.module('bahmni.admin')
.service('adminReservedIdentifierService', ['$http', function ($http) {
    this.getAllIdGenSource = function () {
        return $http.get(Bahmni.Common.Constants.adminReservedIdentifierUrl);
    };
    this.saveIdGenSourceRange = function (uuid, payload) {
        var headers = {"Content-Type": "application/json", "Accept": "application/json"};
        return $http.post(Bahmni.Common.Constants.adminReservedIdentifierUrl + "/" + uuid, payload, headers);
    };
    this.deleteIdGenSourceRange = function (uuid) {
        return $http.delete(Bahmni.Common.Constants.adminReservedIdentifierUrl + "/" + uuid);
    };
}]);
