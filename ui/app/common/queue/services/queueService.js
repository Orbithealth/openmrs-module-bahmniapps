'use strict';

angular.module('bahmni.common.queue')
    .factory('queueService', ['$http', function ($http) {
        var nuacareQueueUrl = Bahmni.Common.Constants.nuacareQueueUrl;
        var departmentUrl = nuacareQueueUrl + "/department";
        var serviceUrl = nuacareQueueUrl + "/service-location";
        var tokenUrl = nuacareQueueUrl + "/token";
        var queueUrl = nuacareQueueUrl + "/queue";
        var combineMode = { AND: 'AND', OR: 'OR' };

        var createCriteria = function (key, operation, value) {
            return ({ type: 'criteria', key: key, operation: operation, value: value });
        };

        var combineCriteria = function (left, right, combineMode) {
            if (left && right) {
                return ({ left: left, right: right, mode: combineMode, type: 'combineMode' });
            } else if (left) {
                return left;
            }
            return right;
        };

        var searchDepartment = function (query) {
            return $http.get(departmentUrl + "/search", { params: { name: query }, withCredentials: true });
        };

        var searchService = function (query) {
            return $http.get(serviceUrl + "/locationSearch", { params: { name: query }, withCredentials: true });
        };

        var searchProvider = function (query) {
            return $http.get(queueUrl + "/searchDoctor", { params: { searchString: query }, withCredentials: true });
        };

        var findQueue = function (id) {
            return $http.get(queueUrl + "/findOne", { params: { queueId: id }, withCredentials: true });
        };

        var getAssignedToken = function (patient) {
            return $http.get(tokenUrl + "/activeToken", { params: { patientUuid: patient }, withCredentials: true });
        };

        var removeAssignedToken = function (tokenId) {
            return $http.get(tokenUrl + "/resetToken", { params: { tokenId: tokenId }, withCredentials: true });
        };

        var changeTokenState = function (tokenId, state) {
            return $http.get(tokenUrl + "/changeState", { params: { tokenId: tokenId, state: state }, withCredentials: true });
        };

        var callNextToken = function (queueId, queueLocationAssignmentId) {
            var params = {
                queueId: queueId,
                queueLocationAssignmentId: queueLocationAssignmentId
            };
            return $http.get(tokenUrl + "/callNextToken", { params: params, withCredentials: true });
        };

        var assignToken = function (paylod) {
            var config = {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            };
            return $http.post(tokenUrl + "/assignToken", paylod, config);
        };

        var getAllQueue = function (department, service, provider, loggedInLocation) {
            var construct = combineCriteria(
                createCriteria('queue.status', '=', 'ACTIVE'),
                createCriteria('queue.status', '=', 'LIVE'),
                combineMode.OR
            );
            if (loggedInLocation) {
                construct = combineCriteria(
                    construct,
                    createCriteria('department.name', '=', loggedInLocation),
                    combineMode.AND
                );
            } else {
                if (department) {
                    construct = combineCriteria(
                        construct,
                        createCriteria('department.id', '=', department),
                        combineMode.AND
                    );
                }
                if (service) {
                    construct = combineCriteria(construct, createCriteria('location.id', '=', service), combineMode.AND);
                }
                if (provider) {
                    construct = combineCriteria(construct, createCriteria('doctor.providerId', '=', provider), combineMode.AND);
                }
            }
            var config = {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            };
            return $http.post(queueUrl + "/all", construct, config);
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
            searchDepartment: searchDepartment,
            searchService: searchService,
            searchProvider: searchProvider,
            getAllQueue: getAllQueue,
            findQueue: findQueue,
            assignToken: assignToken,
            getAssignedToken: getAssignedToken,
            removeAssignedToken: removeAssignedToken,
            changeTokenState: changeTokenState,
            callNextToken: callNextToken,
            getSqlResponse: getSqlResponse
        };
    }]);
