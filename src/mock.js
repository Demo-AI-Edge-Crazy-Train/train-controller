const debug = require('debug')('lego-gear-mock');
const EventEmitter = require('events');
const disconnectDuration = 250;
const connectDuration = 2000;

class LegoMotorMock extends EventEmitter {
    rampPower(from, to, time) {
        debug(`MOTOR: Rampup from ${from}% to ${to}% in ${time} ms.`);
        return new Promise((resolve) => {
            setTimeout(() => { resolve(); }, time);
        }).catch((e) => {
            console.log(e);
        });
    }

    brake() {
        debug(`MOTOR: Brake`);
        return new Promise((resolve) => {
            resolve();
        }).catch((e) => {
            console.log(e);
        });
    }

    setPower(power) {
        debug(`MOTOR: Power at ${power}%.`);
        return new Promise((resolve) => {
            resolve();
        }).catch((e) => {
            console.log(e);
        });
    }
}

class LegoLedMock extends EventEmitter {
    setBrightness(power) {
        return new Promise((resolve) => {
            debug(`LED  : Power at ${power}%.`);
            resolve();
        }).catch((e) => {
            console.log(e);
        });
    }
}

class LegoHubMock extends EventEmitter {
    disconnect() {
        debug(`Disconnecting Lego Hub.`);
        return new Promise((resolve) => {
            setTimeout(() => {
                this.connected = false;
                this.connecting = false;
                this.emit("disconnect");
                resolve();
            }, disconnectDuration);
        }).catch((e) => {
            console.log(e);
        });
    }

    sleep(time) {
        debug(`HUB  : Sleep for ${time} ms.`);
        return new Promise((resolve) => {
            setTimeout(() => { resolve(); }, time);
        }).catch((e) => {
            console.log(e);
        });
    }

    connect() {
        debug(`Connecting Lego Hub.`);
        this.connecting = true;
        return new Promise((resolve) => {
            setTimeout(() => {
                this.connected = true;
                this.connecting = false;
                this.emit("connect");
                resolve();
            }, connectDuration);
        }).catch((e) => {
            console.log(e);
        });
    }
}

class TrainControllerMock extends EventEmitter {
    constructor() {
        super();
        this.hub = null;
        this.led = null;
        this.motor = null;
        this.initComplete = false;
    }

    init() {
        this.hub = new LegoHubMock();
        this.led = new LegoLedMock();
        this.motor = new LegoMotorMock();
        this.hub.on("connect", () => {
            this.emit('connected');
            this.initComplete = true;
            this.emit('ready');
        });
        this.hub.on("disconnect", () => {
            this.emit('disconnected');
        });
        this.hub.connect();
    }
}

module.exports = TrainControllerMock;
