const PoweredUP = require("node-poweredup");
var async = require('async');
const poweredUP = new PoweredUP.PoweredUP();

exports.scan = function scan() {
    poweredUP.scan(); // Start scanning for Hubs
    console.log("Scanning for Hubs..");
}
exports.connect = async function connect() {
    poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
        console.log(`Discovered ${hub.name}!`);
        await hub.connect(); // Connect to the Hub
        console.log("Connected");
        return hub;
    });
}
exports.controllMotor = async function controllMotor(clientmqtt, topic, hub) {
        const motorB = await hub.waitForDeviceAtPort("B");
        clientmqtt.on('message', (topic, payload) => {
                console.log('Received Message:', topic, payload)
                console.log(payload.toString());
            if(payload.toString() === 'on'){
                console.log("received on ");
                motorB.setPower(50); // Start a motor attached to port B to run a 3/4 speed (75) indefinitely
            } else if(payload.toString() === 'off'){
                console.log("received off ");
                motorB.brake();
            }else if(payload.toString() === 'disconnect'){
                hub.disconnect();
            }else if(payload.toString() === 'connect'){
                hub.connect();
            } else if(payload.toString() === 'scan'){
                poweredUP.scan();
            }
        })

  
}