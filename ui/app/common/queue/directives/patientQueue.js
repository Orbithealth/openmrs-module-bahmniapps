'use strict';

angular.module('bahmni.common.queue')
    .directive('patientQueue', ['queueService', 'messagingService', 'spinner', 'confirmBox', 'appService', '$q', '$rootScope',
        function (queueService, messagingService, spinner, confirmBox, appService, $q, $rootScope) {
            var controller = function ($scope) {
                var queueConfig = appService.getAppDescriptor().getConfigValue("queueConfig");
                console.log($rootScope.currentUser);
                var loggedInUser = $rootScope.currentUser;
                $scope.loggedInLocation = _.get(loggedInUser, 'currentLocation', undefined);
                $scope.query = {
                    department: '',
                    service: '',
                    provider: ''
                };

                if ($scope.location) {
                    $scope.department = $scope.location;
                    $scope.loggedInLocation = undefined;
                }
                else {
                    $scope.department = null;
                }
                $scope.$watch('location', function () {
                    if ($scope.location) {
                        $scope.department = $scope.location;
                        $scope.loggedInLocation = undefined;
                        $scope.handleClickSearch();
                    }
                });

                $scope.service = null;
                $scope.provider = null;
                $scope.queueList = [];
                $scope.requestProcessed = false; // this one is used to determine to show error/warning section of unavailable queue to ensure the request to get queue has been run before showing the warning

                $scope.searchDepartment = function (q) {
                    return queueService.searchDepartment(q.term);
                };

                $scope.searchService = function (q) {
                    return queueService.searchService(q.term);
                };

                $scope.searchProvider = function (q) {
                    return queueService.searchProvider(q.term);
                };

                $scope.mapKeyValueResponse = function (response) {
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
                $scope.handleSelectDepartment = function (selected) {
                    $scope.department = selected.key;
                };
                $scope.handleSelectService = function (selected) {
                    $scope.service = selected.key;
                };
                $scope.handleSelectProvider = function (selected) {
                    $scope.provider = selected.key;
                };
                $scope.handleClickSearch = function () {
                    var defer = $q.defer();
                    if ((!$scope.provider && !$scope.service && !$scope.department) && !$scope.loggedInLocation) {
                        messagingService.showMessage('warning', 'Please select Department, Service or Provider');
                        defer.reject();
                    } else {
                        spinner.forPromise(queueService.getAllQueue($scope.department, $scope.service, $scope.provider, $scope.loggedInLocation).then(function (response) {
                            $scope.queueList = _.map(_.get(response, 'data.content', []), function (queue) {
                                return new Bahmni.Common.Queue.QueueForm(queue, queueConfig);
                            });
                            if ($scope.queueList.length > 0) {
                                $scope.queueList[0].open();
                            }
                            defer.resolve($scope.queueList);

                            if (!$scope.requestProcessed) {
                                $scope.requestProcessed = true;
                            }
                        }));
                    }
                    return defer.promise;
                };
                $scope.handleClickClear = function () {
                    $scope.query = { department: '', service: '', provider: '' };
                    $scope.department = null;
                    $scope.service = null;
                    $scope.provider = null;
                    $scope.queueList = [];
                };

                var displayConfirmationBox = function (message, okLabel, okCallback, cancelLabel) {
                    var childScope = {};
                    childScope.actionOk = okCallback;
                    childScope.message = message;
                    childScope.actionCancel = cancelConfirmBox;
                    confirmBox({
                        scope: childScope,
                        actions: [{name: 'actionCancel', display: cancelLabel}, {name: 'actionOk', display: okLabel}],
                        className: "ngdialog-theme-default queue-confirmation-box"
                    });
                };

                var cancelConfirmBox = function (closeDialog) {
                    closeDialog();
                };
                $scope.addQueue = function (queue) {
                    var error = queue.validate();
                    if (error) {
                        messagingService.showMessage('error', error);
                    } else {
                        $scope.updateQueue()(queue);
                        $scope.queueList = [];
                    }
                };
                var deleteConfirm = function (closeDialog) {
                    $scope.requestProcessed = false;
                    if ($scope.queue.server) {
                        spinner.forPromise(queueService.removeAssignedToken($scope.queue.selectedToken.id).then(function () {
                            $scope.updateQueue()(null);
                            $scope.handleClickSearch();
                            closeDialog();
                        }));
                    } else {
                        $scope.updateQueue()(null);
                        $scope.handleClickSearch();
                        closeDialog();
                    }
                };
                $scope.deleteQueue = function () {
                    displayConfirmationBox('REGISTRATION_QUEUE_DELETE_CONFIRM_MESSAGE', 'YES_KEY', deleteConfirm, 'CANCEL_KEY');
                };
                $scope.editQueue = function () {
                    spinner.forPromise(queueService.findQueue($scope.queue.id).then(function (response) {
                        var queue = new Bahmni.Common.Queue.QueueForm(response.data);
                        queue.priority = _.get($scope.queue, 'priority');
                        queue.service = _.get($scope.queue, 'service');
                        queue.serviceProvider = _.get($scope.queue, 'serviceProvider');
                        queue.selectedToken = _.get($scope.queue, 'selectedToken');
                        queue.expanded = true;
                        $scope.queueList = [queue];
                        $scope.updateQueue()(null);
                    }));
                };
                $scope.isQueueAdded = function () {
                    return $scope.queue && $scope.queue.id;
                };

                $scope.toggleQueue = function (index) {
                    // warn user of unsaved changes if any other queue is expanded and form is dirty
                    var dirtyQueue = _.find($scope.queueList, function (queue) {
                        return queue.expanded && queue.isDirty();
                    });
                    if (dirtyQueue) {
                        var ok = function (closeDialog) {
                            dirtyQueue.close();
                            if (dirtyQueue.id !== $scope.queueList[index].id) {
                                $scope.queueList[index].open();
                            }
                            closeDialog();
                        };
                        displayConfirmationBox('REGISTRATION_QUEUE_UNSAVED_CHANGES_MESSAGE', 'YES_KEY', ok, 'CANCEL_KEY');
                    } else {
                        var expandedQ = _.find($scope.queueList, function (queue) {
                            return queue.expanded;
                        });
                        if (expandedQ) {
                            expandedQ.close();
                        }
                        if (_.get(expandedQ, 'id') !== $scope.queueList[index].id) {
                            $scope.queueList[index].open();
                        }
                    }
                };

                $scope.shouldAppointmentKeyBeShown = function (key) {
                    return key !== 'expanded' && key !== 'QUEUE_TITLE_APPOINTMENTS_DATE_KEY';
                };

                var init = function () {
                    $scope.referrals = [];
                    $scope.appointments = [];
                    var tokenPromise = queueService.getAssignedToken($scope.patient.uuid);
                    var appointmentForTodayPromise = queueService.getSqlResponse('bahmni.sqlGet.queueAppointmentsForToday', $scope.patient.uuid);
                    var pastAppointmentPromise = queueService.getSqlResponse('bahmni.sqlGet.queuePastAppointments', $scope.patient.uuid);
                    var upcomingAppointmentPromise = queueService.getSqlResponse('bahmni.sqlGet.queueUpcomingAppointments', $scope.patient.uuid);
                    spinner.forPromise($q.all([
                        tokenPromise, appointmentForTodayPromise, pastAppointmentPromise, upcomingAppointmentPromise, $scope.handleClickSearch()
                    ])).then(function (response) {
                        var assignedToken = response[0].data;
                        if (assignedToken) {
                            var queue = Bahmni.Common.Queue.QueueForm.createFromToken(assignedToken);
                            $scope.updateQueue()(queue);
                        }
                        var todaysAppointments = response[1].data || [];
                        todaysAppointments = _.map(todaysAppointments, function (app) {
                            app.expanded = true;
                            return app;
                        });
                        $scope.allAppointments = {
                            todayAppointment: { appointments: todaysAppointments, label: "QUEUE_TITLE_TODAYS_APPOINTMENTS", expanded: true },
                            upcomingAppointment: { appointments: response[3].data || [], label: "QUEUE_TITLE_UPCOMING_APPOINTMENTS" },
                            pastAppointment: { appointments: response[2].data || [], label: "QUEUE_TITLE_PAST_APPOINTMENTS" }
                        };

                        $scope.requestProcessed = true;
                    });
                };
                init();
            };
            return {
                restrict: 'E',
                scope: {
                    patient: "=",
                    queue: "=",
                    updateQueue: "&",
                    location: "=?"
                },
                controller: controller,
                template: '<ng-include src="\'../common/queue/views/patientQueue.html\'" />'
            };
        }]);
