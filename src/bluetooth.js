const PoweredUP = require("node-poweredup").PoweredUP;
const debug = require('debug')('lego-gear-bluetooth');
const EventEmitter = require('events');

class TrainControllerBluetooth extends EventEmitter {
    constructor() {
        super();
        this.hub = null;
        this.led = null;
        this.motor = null;
        this.initComplete = false;
    }

    init() {
        this._legoPoweredUp = new PoweredUP();
        this._legoPoweredUp.on("discover", async (hub) => {
            debug(`Discovered ${hub.name}!`);
            // Stop the discovery process once we have a compatible Lego hub
            this._legoPoweredUp.stop();
        
            // Connect to the Hub
            await hub.connect();
            this.emit('connected');
            hub.on("disconnect", () => {
                this.hub = null;
                this.led = null;
                this.motor = null;
                this.emit('disconnected');
            })
            this.hub = hub;
        
            // Make sure a motor is plugged into port A
            this.motor = await hub.waitForDeviceAtPort("A");
        
            // Make sure a led is plugged into port B
            this.led = await hub.waitForDeviceAtPort("B");
            
            // Let the MQTT client use the PoweredUp objects
            this.initComplete = true;
            this.emit('ready');
        });
        this._legoPoweredUp.scan(); // Start scanning for Hubs
    }
}

module.exports = TrainControllerBluetooth;
