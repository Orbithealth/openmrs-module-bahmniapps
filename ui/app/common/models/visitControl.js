'use strict';

Bahmni.Common.VisitControl = function (visitTypes, defaultVisitTypeName, encounterService,
                                       $translate, visitService, paymentConfig) {
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var self = this;

    self.initialValues = { // to allow performing user confirmation on change
        caseType: 'NEW',
        patientType: '',
        attributes: {}
    };
    self.patientType = '';
    self.caseType = 'NEW';
    self.attributes = {};
    self.attributesToKeep = [];
    var paymentTypeVisitAttributeUuid = _.get(paymentConfig, 'paymentTypeVisitAttributeUuid');
    var nonUpdatableAttributes = _.get(paymentConfig, 'nonUpdatableAttributes', []);

    self.visitTypes = visitTypes;
    self.defaultVisitTypeName = defaultVisitTypeName;
    self.defaultVisitType = visitTypes.filter(function (visitType) {
        return visitType.name === defaultVisitTypeName;
    })[0];

    self.startButtonText = function (visitType) {
        return $translate.instant('REGISTRATION_START_VISIT', {visitType: visitType.name});
    };

    self.startVisit = function (visitType) {
        self.onStartVisit();
        self.selectedVisitType = visitType;
    };

    self.selectCaseType = function (value) {
        self.caseType = value;
    };

    self.clearAttributes = function () {
        self.attributes = [];
    };

    self.reset = function () {
        self.patientType = self.initialValues.patientType;
        self.attributes = self.initialValues.attributes;
    };

    var getVisitAttributes = function () {
        var attributes = [];
        if (self.patientType) {
            attributes.push({
                attributeType: paymentTypeVisitAttributeUuid,
                value: self.patientType
            });
            var attributeTypes = _.get(paymentConfig, 'form.' + self.patientType, []);
            _.forEach(attributeTypes, function (attribute) {
                var value = _.get(self.attributes, attribute.attributeType, null);
                if (value != null) {
                    switch (attribute.format) {
                    case 'org.openmrs.customdatatype.datatype.DateDatatype':
                        value = DateUtil.getDateWithoutTime(value);
                        break;
                    default:
                    }
                    attributes.push({
                        attributeType: attribute.attributeType,
                        value: value
                    });
                }
            });
        }
        if (self.attributesToKeep && self.attributesToKeep.length > 0) {
            attributes = attributes.concat(self.attributesToKeep);
        }
        return attributes;
    };

    self.createVisitOnly = function (patientUuid, visitLocationUuid) {
        var visitType = self.selectedVisitType || self.defaultVisitType;
        var visitDetails = {
            patient: patientUuid,
            visitType: visitType.uuid,
            location: visitLocationUuid,
            attributes: getVisitAttributes(),
            caseType: self.caseType
        };
        return visitService.createVisit(visitDetails);
    };

    self.updateVisitOnly = function (visitUuid) {
        return visitService.updateVisit(visitUuid, { caseType: self.caseType, attributes: getVisitAttributes() });
    };

    self.setDefaults = function (visit, keepAttributes) {
        self.caseType = _.get(visit, 'caseType', 'NEW');
        self.attributes = {};
        self.attributesToKeep = [];
        var attributes = _.get(visit, 'attributes', []);
        if (attributes && attributes.length > 0) {
            _.forEach(attributes, function (attribute) {
                if (keepAttributes && nonUpdatableAttributes.indexOf(attribute.attributeType.uuid) > -1) {
                    self.attributesToKeep.push({ uuid: attribute.uuid });
                } else if (attribute.attributeType.uuid === paymentTypeVisitAttributeUuid) {
                    self.patientType = attribute.value;
                } else {
                    var value = attribute.value;
                    switch (attribute.attributeType.datatypeClassname) {
                    case 'org.openmrs.customdatatype.datatype.DateDatatype':
                        value = DateUtil.parse(value);
                        break;
                    default:
                    }
                    _.set(self.attributes, attribute.attributeType.uuid, value);
                }
            });
        }
        self.initialValues.patientType = self.patientType;
        self.initialValues.attributes = self.attributes;
        self.initialValues.caseType = self.caseType;
    };
};

