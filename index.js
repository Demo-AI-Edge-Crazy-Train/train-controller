const PoweredUP = require("node-poweredup");
const rest = require('./modules/rest.js');

// var async = require('async');
// var resultPrediction = null;

// const host = 'traffic-crazy-train.apps.rhods-internal.61tk.p1.openshiftapps.com';
// const path = '/v2/models/traffic/infer';
// const inputs = require("../payloads/exemple-payload.json");

// (async function() { 
//   resultPrediction = await rest.predictImage(host, path, inputs);
//   console.log("result prediction ", resultPrediction);
//   })()
  const poweredUP = new PoweredUP.PoweredUP();
  poweredUP.scan(); // Start scanning for Hubs
  console.log("Scanning for Hubs...");
  poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
      console.log(`Discovered ${hub.name}!`);
      await hub.connect(); // Connect to the Hub
      console.log("Connected");
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
  });


