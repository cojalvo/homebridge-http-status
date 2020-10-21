"use strict";

let Service, Characteristic, closeState, openState;
const axios = require('axios');

// Update UI immediately after sensor state change
const updateUI = true;

module.exports = function (homebridge) {

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerPlatform('homebridge-http-status', 'HttpStatus', HttpsStatusPlatform);
    homebridge.registerAccessory('homebridge-http-status', 'HttpStatusContact', HttpsStatusContactAccessory);

    openState = Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
    closeState = Characteristic.ContactSensorState.CONTACT_DETECTED;

};

function HttpsStatusPlatform(log, config) {

    this.log = log;

    this.sensors = config['sensors'] || [];

    // Allow retrieval of data from package.json
    this.pkginfo = require('pkginfo')(module);

}

HttpsStatusPlatform.prototype = {

    accessories: function (callback) {

        const accessories = [];

        for (let i = 0; i < this.sensors.length; i++) {
            var sensorAccessory = new HttpsStatusContactAccessory(this.pkginfo, this.log, this.sensors[i]);
            accessories.push(sensorAccessory);
        }
        const accessoriesCount = accessories.length;
        this.log(callback);
        callback(accessories);
    }

};

function HttpsStatusContactAccessory(pkginfo, log, config) {
    this.log = log;
    this.name = config['name'] || 'Https Status Sensor';
    this.url = config['url'] || 'localhost';
    this.method = config['method'] || 'get';
    this.headers = config['headers'] || {};
    this.expectedResponse = config['expectedResponse'];
    this.responsePath = config['responsePath'];
    this.requestBody = config['requestBody'];
    this.okStatus = config['okStatus'] || 200;
    this.pingInterval = parseInt(config['interval']) || 300;

    // Initial state
    this.stateValue = closeState;
    this.lastStateValue = closeState;

    this._service = new Service.ContactSensor(this.name);

    // Default state is open, we want it to be closed
    this._service.getCharacteristic(Characteristic.ContactSensorState)
        .setValue(this.stateValue);

    this._service
        .getCharacteristic(Characteristic.ContactSensorState)
        .on('get', this.getState.bind(this));

    this._service.addCharacteristic(Characteristic.StatusFault);

    this.changeHandler = (function (newState) {

        this.log('[' + this.name + '] Setting sensor state set to ' + newState);
        this._service.getCharacteristic(Characteristic.ContactSensorState)
            .setValue(newState ? closeState : openState);

        if (updateUI)
            this._service.getCharacteristic(Characteristic.ContactSensorState)
                .getValue();

    }).bind(this);

    this.doCheckStatus();
    setInterval(this.doCheckStatus.bind(this), this.pingInterval * 1000);

}

HttpsStatusContactAccessory.prototype = {

    updateStateIfNeeded: function () {
        if (this.lastStateValue !== this.stateValue) {
            this.log('[' + this.name + '] Changing state to:' + this.stateValue);
            this._service.getCharacteristic(Characteristic.ContactSensorState)
                .setValue(this.stateValue);
            this._service.getCharacteristic(Characteristic.ContactSensorState)
                .getValue();
            this.lastStateValue = this.stateValue;
        }
    }, doCheckStatus: async function () {

        try {
            this.log(`Start checking status for ${this.url}`);
            const config = {
                method: this.method,
                baseURL: this.url,
                headers: this.headers,
                data: this.requestBody,
                url: ''
            };
            const res = await axios.request(config);
            let success = res.status === this.okStatus;
            //check body?
            if (success && this.expectedResponse && this.responsePath) {
                this.log(`Parsing response body: ${JSON.stringify(res.data)}`);
                const parts = this.responsePath.split('.');
                let finalRes = res.data;
                parts.forEach(p => {
                    finalRes = finalRes[p];
                });

                this.log(`Parsed response: ${finalRes} , Expected response: ${this.expectedResponse}`);
                success = finalRes === this.expectedResponse;
            }

            this.stateValue = success ? closeState : openState;

            this.setStatusFault(0);
            this.updateStateIfNeeded()
            this.log('[' + this.name + '] Ping result for ' + this.url + ' was ' + (success ? 'ok' : 'not ok'));
        } catch (e) {
            this.log(JSON.stringify(e));
            this.stateValue = openState;
            this.updateStateIfNeeded();
            this.setStatusFault(1);
        }

    },

    setStatusFault: function (value) {

        this._service.setCharacteristic(Characteristic.StatusFault, value);

    },

    identify: function (callback) {

        this.log('[' + this.name + '] Identify sensor requested');
        callback();

    },

    getState: function (callback) {

        this.log('[' + this.name + '] Getting sensor state, which is currently ' + this.stateValue);
        callback(null, this.stateValue);

    },

    getServices: function () {

        var informationService = new Service.AccessoryInformation();

        // Set plugin information
        informationService
            .setCharacteristic(Characteristic.Manufacturer, 'jsWorks')
            .setCharacteristic(Characteristic.Model, 'Ping State Sensor')
            .setCharacteristic(Characteristic.SerialNumber, 'Version ' + module.exports.version);

        return [informationService, this._service];

    }

};