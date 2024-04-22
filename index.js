const PoweredUP = require("node-poweredup").PoweredUP;
const mqtt = require('mqtt');
const debug = require('debug')('train-controller');

// Parse options from environment variables
const mqttBrokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
const mqttTopic = process.env.MQTT_TOPIC || "train-command";
const legoMotorFullPower = parseInt(process.env.LEGO_MOTOR_FULL_POWER || "100", 10);
const legoMotorLowPower = parseInt(process.env.LEGO_MOTOR_LOW_POWER || "70", 10);
const legoSleepTime = parseInt(process.env.LEGO_SLEEP_TIME || "1000", 10);
const legoRampUpTime = parseInt(process.env.LEGO_RAMPUP_TIME || "1000", 10);

// Action associated with each command id
const actionMap = {
    // SpeedLimit_30
    0: async (motor, led, hub) => {
        console.log("Handling SpeedLimit_30...")
        await motor.setPower(legoMotorLowPower);
        for (i = 0; i < 2; i++) {
            await led.setBrightness(100);
            await hub.sleep(250);
            await led.setBrightness(0);
            await hub.sleep(250);
        }
        // Add a 1-second break
        await hub.sleep(legoSleepTime);
        // Start the train again
        await motor.rampPower(legoMotorLowPower, legoMotorFullPower, legoRampUpTime);
    },
    // DangerAhead
    1: async (motor, led, hub) => {
        console.log("Handling DangerAhead...")
        await motor.brake();
        for (i = 0; i < 2; i++) {
            await led.setBrightness(100);
            await hub.sleep(250);
            await led.setBrightness(0);
            await hub.sleep(250);
        }
        // Add a 1-second break
        await hub.sleep(legoSleepTime);
        // Start the train again
        await motor.rampPower(legoMotorLowPower, legoMotorFullPower, legoRampUpTime);
    }
};

// Connection to MQTT broker
console.log("Connecting to MQTT broker %s...", mqttBrokerUrl);
var mqttClient = mqtt.connect(mqttBrokerUrl);
mqttClient.on('connect', () => {
    console.log("Connected to MQTT broker %s!", mqttBrokerUrl);
    mqttClient.subscribe(mqttTopic, (err) => {
        if (!err) {
            debug("Subscribed to topic %s!", mqttTopic);
        }
    });
});

// MQTT Disconnection handling
mqttClient.on("close", () => {
    console.log("Disconnected from MQTT server");
    cleanupAndExit();
});

// MQTT Message processing
var legoGear = {
    hub: null,
    motor: null,
    led: null
};
var actionInProgress = true;
mqttClient.on('message', (topic, payload) => {
    debug('Received message on MQTT topic %s: %s', topic, payload.toString());
    
    // the payload is a string representing an integer
    var actionCode = parseInt(payload.toString(), 10);
    var action = actionMap[actionCode];

    // Safety check
    if (typeof action !== "function") {
        debug("Unknown action %s (int = %d)...", payload.toString(), actionCode);
        return;
    }

    // Safety check
    if (legoGear == null || legoGear.motor == null || legoGear.led == null) {
        debug("Not acting on %d since the Lego PoweredUp hub is not initialized yet!", actionCode);
        return;
    }

    // Do not accept commands if the previous one is still ongoing
    if (actionInProgress) {
        debug("Ignoring command %d since the last one is still ongoing...", actionCode);
        return;
    }

    // Acting on the lego gear for real
    actionInProgress = true;
    action(legoGear.motor, legoGear.led, legoGear.hub).then(() => {
        console.log("Processed command %d!", actionCode);
        // hub.sleep(legoSleepTime);
        // console.log("Train slept for "+legoSleepTime);
    }).catch((e) => {
        console.log(e);
    }).finally(() => {
        actionInProgress = false;
    });
});

// Lego PoweredUP discovery
const legoPoweredUp = new PoweredUP();
legoPoweredUp.on("discover", async (hub) => {
    console.log(`Discovered ${hub.name}!`);
    // Stop the discovery process once we have a compatible Lego hub
    legoPoweredUp.stop();

    // Connect to the Hub
    await hub.connect();
    console.log("Connected to Lego Hub!");
    hub.on("disconnect", () => {
        legoGear = { hub: null, motor: null, led: null };
        hub.connected = false;
        hub.connecting = false;
        console.log("Lego PoweredUp Hub disconnected!");
        cleanupAndExit();
    })
    legoGear.hub = hub;

    // Make sure a motor is plugged into port A
    const motorA = await hub.waitForDeviceAtPort("A");
    legoGear.motor = motorA;

    // Make sure a led is plugged into port B
    const ledB = await hub.waitForDeviceAtPort("B");
    legoGear.led = ledB;
    
    // Let the MQTT client use the PoweredUp objects
    console.log("All hardware pieces have been discovered!");

    // Start the train
    await motorA.rampPower(legoMotorLowPower, legoMotorFullPower, 5000);
    actionInProgress = false;
});

console.log("Scanning for Lego PoweredUp Hubs...");
legoPoweredUp.scan(); // Start scanning for Hubs

// Cleanup function
var cleanupInProgress = false;
function cleanupAndExit () {
    if (cleanupInProgress) {
        return;
    }
    cleanupInProgress = true;

    var promises = [];
    if (mqttClient != null && mqttClient.connected) {
        console.log("Disconnecting from MQTT Broker...");
        promises.push(mqttClient.endAsync().then(() => {
            mqttClient = null;
        }));
    }

    if (legoGear.hub != null && (legoGear.hub.connected || legoGear.hub.connecting)) {
        var hub = legoGear.hub;
        console.log("Disconnecting from Lego Hub...");
        promises.push(
            new Promise((resolve) => {
                hub.on("disconnect", () => {
                    resolve();
                });
                hub.disconnect();
            }).catch((e) => {
                console.log(e);
            })
        );
    }

    Promise.all(promises).then(() => {
        debug("Cleanup done!");
        process.exit(0);
    });
}

process.on('SIGTERM', cleanupAndExit);
process.on('SIGINT', cleanupAndExit);
