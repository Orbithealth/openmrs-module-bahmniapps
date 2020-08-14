'use strict';

Bahmni.Common.Referral.PatientReferral = function (referral) {
    angular.copy({}, this);

    var self = this;
    this.patient = null;
    this.referredFromDepartment = _.get(referral, 'department', null);
    this.department = _.get(referral, 'department', null);
    this.departmentDisplay = _.get(referral, 'department.value', '');
    this.referredBy = null;
    this.action = null;
    this.notes = _.get(referral, 'notes', '');
    this.dateTime = null;
    this.dirty = false;

    this.setDepartment = function (department) {
        this.dirty = true;
        this.department = department;
    };

    this.setOrClearDepartment = function (department) {
        this.dirty = true;
        if (this.department) {
            if (this.department.key === department.key) {
                this.department = null;
                return;
            }
        }
        this.department = department;
    };

    this.reset = function () {
        this.dirty = true;
        this.department = null;
        this.departmentDisplay = '';
        this.referredTo = null;
    };

    this.isDirty = function () {
        return this.dirty && (this.department != null || this.referredTo != null);
    };

    this.shouldShowDepartmentChangeWarning = function () {
        var referredFrom = _.get(this.referredFromDepartment, 'key');
        if (referredFrom) {
            return referredFrom !== _.get(this.department, 'key');
        }
        return false;
    };

    this.validate = function () {
        if (!_.get(this.department, 'key')) {
            return 'Please select department';
        }
        return undefined;
    };
    this.copyFrom = function (referral) {
        angular.copy(new Bahmni.Common.Referral.PatientReferral(referral), this);
    };
};

Bahmni.Common.Referral.PatientReferral.getPayload = function (referral, patient, provider, loggedInLocation, visitUuid, action) {
    var payload = new Bahmni.Common.Referral.PatientReferral(referral);
    payload.patient = { key: patient.uuid, value: patient.name };
    payload.referredBy = { key: provider.uuid, value: provider.name };
    payload.referredFrom = { key: null, value: loggedInLocation };
    payload.action = action || 'NEW';
    payload.visitUuid = visitUuid;
    return payload;
};
