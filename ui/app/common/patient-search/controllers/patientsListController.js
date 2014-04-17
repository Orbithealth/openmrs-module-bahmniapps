'use strict';

angular.module('bahmni.common.patientSearch')
    .controller('PatientsListController', ['$scope', '$location', '$window', 'patientService', 'patientMapper', '$rootScope', 'appService', 'spinner', '$stateParams','$q',
    function ($scope, $location, $window, patientService, patientMapper, $rootScope, appService, spinner, $stateParams, $q) {

        $scope.searchTypes = [];
        $scope.searchCriteria = {searchParameter:'', type: undefined};
        var routeParameters = angular.extend({}, $stateParams);

        var handlePatientList = function (patientList, callback) {
            resetPatientLists();
            if (patientList) {
                $scope.storeWindowDimensions();
                patientList.forEach(function (patient) {
                    patient.name = getPatientDisplayName(patient);
                    patient.display = patient.identifier + " - " + patient.name;
                    patient.image = patientMapper.constructImageUrl(patient.uuid);
                });
                $scope.activePatients = patientList;
                $scope.searchResults = $scope.activePatients;
                $scope.visiblePatients = $scope.searchResults.slice(0, $scope.tilesToFit);
            }
            if (callback) {
                callback();
            }
        };

        var getPatientDisplayName = function(patient) {
            if (patient.hasOwnProperty("name")) {
                return patient.name;
            } else {
                return patient.givenName + ' ' + patient.familyName;
            }
            
        };

        var findPatientsByHandler = function (handlerName) {
            var findPatientsPromise = patientService.findPatients(handlerName).success(function (data) {
                handlePatientList(data, function () {
                    $scope.searchPatients();
                });
            });
            spinner.forPromise(findPatientsPromise);
        };

        var searchPatientsWithIdentifier = function(patientIdentifier) {
            return spinner.forPromise(patientService.search(patientIdentifier).success(function (data) {
                handlePatientList(data.results, function() {
                    if ($scope.activePatients.length === 0) {
                        $rootScope.server_error = "Could not find patient with identifier/name " + patientIdentifier + ". Please verify the patient ID entered ";
                    } else if ($scope.activePatients.length === 1) {
                        $scope.forwardPatient($scope.activePatients[0]);
                    }
                });
            }));
        };

        $scope.loadMore = function () {
            if ($scope.visiblePatients !== undefined) {
                var last = $scope.visiblePatients.length;
                var more = ($scope.searchResults.length - last);
                var toShow = (more > $scope.tilesToLoad) ? $scope.tilesToLoad : more;
                if (toShow > 0) {
                    for (var i = 1; i <= toShow; i++) {
                        $scope.visiblePatients.push($scope.searchResults[last + i - 1]);
                    }
                }
            }
        };

        $scope.storeWindowDimensions = function () {
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            var tileWidth = Bahmni.Common.PatientSearch.Constants.patientTileWidth;
            var tileHeight = Bahmni.Common.PatientSearch.Constants.patientTileHeight;
            $scope.tilesToFit = Math.ceil(windowWidth * windowHeight / (tileWidth * tileHeight));
            $scope.tilesToLoad = Math.ceil($scope.tilesToFit * Bahmni.Common.PatientSearch.Constants.tileLoadRatio);
        };


        var matchesNameOrId = function (patient) {
            return patient.display.toLowerCase().search($scope.searchCriteria.searchParameter.toLowerCase()) !== -1;
        };

        $scope.searchPatients = function () {
            if (shouldUseCustomHandler($scope.searchCriteria.type)) {
                var searchList = $scope.activePatients.filter(function (patient) {
                    return matchesNameOrId(patient);
                });
                $scope.searchResults = searchList;
                if ($scope.searchResults) {
                    $scope.visiblePatients = $scope.searchResults.slice(0, $scope.tilesToFit);
                }
            } else {
                searchPatientsWithIdentifier($scope.searchCriteria.searchParameter);
            }
        };

        $scope.forwardPatient = function (patient) {
            var currentAppExtension = $scope.searchTypes.filter(function (searchType) {
                return $scope.searchCriteria.type.id == searchType.id;
            })[0];

            var options = $.extend({}, routeParameters);
            $.extend(options, {
                patientUuid:patient.uuid,
                visitUuid:patient.activeVisitUuid || null
            });

            $window.location = appService.getAppDescriptor().formatUrl(currentAppExtension.forwardUrl, options, true);
        };

        var shouldUseCustomHandler = function(sType) {
            return sType.handler ? true : false;
        };

        $scope.showPatientsForType = function (sType) {
            $scope.searchCriteria.searchParameter= '';
            $scope.searchCriteria.type = sType;
            if (shouldUseCustomHandler(sType)) {
                findPatientsByHandler(sType.handler);
            } else {
                handlePatientList([]);
            }
            
        };


        var resetPatientLists = function () {
            $scope.activePatients = [];
            $scope.searchResults = [];
            $scope.visiblePatients = [];
        };

        var getAllowedSearchTypes = function () {
            var appExtensions = appService.getAppDescriptor().getExtensions("org.bahmni.patient.search", "config");
            var allowedSearches = [];
            appExtensions.forEach(function (appExtn) {
                allowedSearches.push({
                    name: appExtn.label,
                    display: appExtn.extensionParams.display,
                    handler: appExtn.extensionParams.searchHandler,
                    forwardUrl: appExtn.extensionParams.forwardUrl,
                    id: appExtn.id
                });
            });
            $scope.searchTypes = allowedSearches;
            return allowedSearches;
        }

        var setDefaultType = function () {
            var defaultType = $scope.searchTypes.length > 0 ? $scope.searchTypes[0] : null;
            $scope.searchCriteria = { searchParameter: '', type: defaultType};
            if (defaultType && defaultType.handler) {
                findPatientsByHandler($scope.searchCriteria.type.handler);
            }
        }

        var initialize = function () {
            var deferrables = $q.defer();
            var promises = [];
            resetPatientLists();
            promises.push(getAllowedSearchTypes());
            setDefaultType();
            $q.all(promises).then(function () {
                deferrables.resolve();
            });
            return deferrables.promise;
        };

        spinner.forPromise(initialize());

    }]).directive('resize', function ($window) {
        return function (scope, element) {
            scope.storeWindowDimensions();
            angular.element($window).bind('resize', function () {
                scope.$apply(function () {
                    scope.storeWindowDimensions();
                    if (scope.searchResults !== undefined) {
                        scope.visiblePatients = scope.searchResults.slice(0, scope.tilesToFit);
                    }
                });
            });
        };
    });
;

