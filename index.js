
const dbus = require('./modules/dbus.js');
const messages = require('./modules/messages.js');

// Start scanning for devices
dbus.startScanning();

// Connect to the train
//dbus.connect('00:16:53:AB:3C:64');


// // Handle device found events
// dbus.onDeviceFound((address, properties) => {
//     console.log('Found device:', address, properties);
//     // Move the train at speed 5
//     setTimeout(() => {
//         dbus.moveTrain(50);
//     }, 2000);

//     // Stop the train after 5 seconds
//     setTimeout(() => {
//         dbus.moveTrain(0);
//     }, 5000);

//     // Disconnect from the train after 7 seconds
//     setTimeout(() => {
//         dbus.disconnect();
//     }, 7000);
// });



