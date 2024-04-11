//const { predictImage  } = require('./modules/rest.js');
const PoweredUP = require("node-poweredup");
const messages = require('./modules/messages.js');

const poweredUP = new PoweredUP.PoweredUP();

(async function() { 
    poweredUP.scan(); // Start scanning for Hubs
    console.log("Scanning for Hubs...");
    const clientmqtt = messages.connect('mqtt://localhost:1883');
    messages.subscribeTopic(clientmqtt, 'train-command');
    poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
        console.log(`Discovered ${hub.name}!`);
        await hub.connect(); // Connect to the Hub
        console.log("Connected");
        const motorB = await hub.waitForDeviceAtPort("B");
        motorB.setPower(100); 
        console.log("Set power to 100");
        clientmqtt.on('message', (topic, payload) => {
          console.log('Received Message:', topic, payload.toString());
           if(payload.toString() === '0'){
              motorB.setPower(30); 
              console.log("Speed Limit to 30 set power to 30");
          } else {
                motorB.brake();
                console.log("Stop motor B  ");
            } 
        })
    });
})()