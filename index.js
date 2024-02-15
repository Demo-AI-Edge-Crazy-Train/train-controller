//const { predictImage  } = require('./modules/rest.js');
const PoweredUP = require("node-poweredup");
const messages = require('./modules/messages.js');

const poweredUP = new PoweredUP.PoweredUP();

(async function() { 
    poweredUP.scan(); // Start scanning for Hubs
    console.log("Scanning for Hubs...");
    const clientmqtt = messages.connect('mqtt://localhost:1883');
    messages.subscribeTopic(clientmqtt, 'lego');
    poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
        console.log(`Discovered ${hub.name}!`);
        await hub.connect(); // Connect to the Hub
        console.log("Connected");
        const motorB = await hub.waitForDeviceAtPort("B");
        clientmqtt.on('message', (topic, payload) => {
          console.log('Received Message:', topic, payload.toString());
          if(payload.toString() === 'disconnect'){
              hub.disconnect();
          }else if(payload.toString() === 'connect'){
              hub.connect();
          } else if(payload.toString() === 'scan'){
              poweredUP.scan();
          } else if(payload.toString() === '0'){
              motorB.setPower(30); 
              console.log("Speed Limit to 30 set power to 30");
          } else if(payload.toString() === '1'){
              motorB.setPower(50); 
              console.log("Speed Limit to 50 set power to 50");
            } else if(payload.toString() === '2' || payload.toString() === '3' || payload.toString() === '4'){
                motorB.brake();
                if(payload.toString() === '2'){
                  console.log("Traffic Signals Ahead set power to 0");
                }else if(payload.toString() === '3'){
                  console.log("Pedestrian Crossing Ahead set power to 0");
                }else if(payload.toString() === '4'){
                    console.log("Red traffic light set power to 0");  
                }
            } else if(payload.toString() === 'GreenTrafficLight'){
                console.log("Green traffic light set power to 50");
                motorB.setPower(50);
            }
        })
    });
})()