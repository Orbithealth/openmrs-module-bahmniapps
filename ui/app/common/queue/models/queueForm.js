'use strict';

Bahmni.Common.Queue.QueueForm = function (queueData, queueConfig) {
    angular.copy(queueData, this);
    var self = this;

    this.priority = 'NORMAL';
    this.service = '';
    this.serviceProvider = null;
    this.selectedToken = null;
    this.expanded = false;
    this.normalTokens = [];
    this.priorityTokens = [];

    this.tokens = _.get(queueData, 'tokens', []);
    this.queueLocationDtos = _.get(queueData, 'queueLocationDtos', []);

    if (this.tokens && this.tokens.length > 0) {
        var tokensByPriority = _.groupBy(this.tokens, function (token) {
            return token.priorityType;
        });
        this.normalTokens = _.sortBy(_.get(tokensByPriority, 'NORMAL', []), 'sequence');
        this.priorityTokens = _.sortBy(_.get(tokensByPriority, 'HIGH', []), 'sequence');
    }

    this.providerRequired = _.get(queueConfig, 'queueServiceProviderRequired', false);
    var setDefaultServiceProvider = function () {
        if (self.providerRequired && self.queueLocationDtos && self.queueLocationDtos.length > 0) {
            self.service = self.queueLocationDtos[0].id;
            self.serviceProvider = self.queueLocationDtos[0];
        }
    };
    setDefaultServiceProvider();

    this.open = function () {
        this.expanded = true;
    };
    this.toggle = function () {
        if (this.expanded) {
            this.close();
        } else {
            this.open();
        }
    };
    this.close = function () {
        this.reset();
    };
    this.selectToken = function (token) {
        this.selectedToken = token;
    };
    this.resetToken = function () {
        this.selectedToken = null;
    };
    this.selectService = function (serviceProvider) {
        this.serviceProvider = serviceProvider;
    };
    this.getCurrentToken = function () {
        if (this.priority === 'NORMAL') {
            return _.get(this.currentNormalPriorityToken, 'value', '-');
        } else if (this.priority === 'HIGH') {
            return _.get(this.currentHigherPriorityToken, 'value', '-');
        }
    };
    this.getTokenNumber = function () {
        return _.get(this.selectedToken, 'tokenNumber');
    };
    this.getServiceProviderDisplay = function (serviceProvider) {
        return [_.get(serviceProvider, 'serviceLocation.value'), _.get(serviceProvider, 'provider.value')].filter(Boolean).join(' - ');
    };
    this.isDirty = function () {
        return this.selectedToken;
    };
    this.reset = function () {
        this.priority = 'NORMAL';
        this.service = '';
        this.selectedToken = null;
        this.expanded = false;
        setDefaultServiceProvider();
    };
    this.getTokenPayload = function (patient, loggedInUser) {
        var payload = angular.copy(this.selectedToken);
        payload.patient = { key: patient.uuid, value: patient.name };
        payload.queueLocationAssignmentId = _.get(this.serviceProvider, 'id', null);
        payload.assignee = { key: loggedInUser.uuid, value: loggedInUser.username };
        return payload;
    };
    this.validate = function () {
        if (!this.selectedToken) {
            return 'Please select a token';
        } else if (this.providerRequired && !_.get(this.serviceProvider, 'id', undefined)) {
            return 'Please select a service provider';
        }
        return undefined;
    };
    this.isTokenAssigned = function () {
        return this.selectedToken && this.selectedToken.state !== 'NOT_ASSIGNED';
    };
    this.getTokenState = function () {
        if (this.selectedToken && this.selectedToken.state) {
            return 'TOKEN_STATE_LABLE_' + this.selectedToken.state;
        }
        return '';
    };
};

Bahmni.Common.Queue.QueueForm.createFromToken = function (token) {
    var queue = new Bahmni.Common.Queue.QueueForm();
    queue.id = token.queue.key;
    queue.name = token.queue.value;
    queue.priority = token.priorityType;
    queue.service = token.queueLocationAssignmentId;
    queue.department = token.department;
    queue.serviceProvider = {
        id: token.queueLocationAssignmentId,
        serviceLocation: token.service,
        provider: token.provider
    };
    queue.selectedToken = token;
    queue.server = true;
    return queue;
};
