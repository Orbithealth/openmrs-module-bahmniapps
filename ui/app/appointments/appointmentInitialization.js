'use strict';

angular.module('bahmni.appointments').factory('appointmentInitialization',
    ['appointmentsService', 'patientService', 'appointmentsServiceService', function (appointmentsService, patientService, appointmentsServiceService) {
        return function ($stateParams) {
            if ($stateParams.appointment) {
                return {appointment: $stateParams.appointment};
            }
            if ($stateParams.uuid) {
                return appointmentsService.getAppointmentByUuid($stateParams.uuid).then(function (response) {
                    return {appointment: response.data};
                });
            }
            if ($stateParams.puuid) {
                var loc = {};
                var pat = {};
                return patientService.getPatient($stateParams.puuid).then(function (response) {
                    var patientObj = {};
                    var preferedIdentifier = _.find(response.data.identifiers, function (ident) {
                        return ident.preferred;
                    });
                    patientObj.label = response.data.person.display + " (" + preferedIdentifier.identifier + ")";
                    patientObj.uuid = response.data.uuid;
                    pat = patientObj;
                    if ($stateParams.location) {
                        return {patient: pat, serviceName: $stateParams.location};
                    }
                });
            }

            return {};
        };
    }]
);
