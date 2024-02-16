
const dbus = require('./modules/dbus.js');
const messages = require('./modules/messages.js');


// Connect to the train
dbus.connect();

// Start scanning
dbus.startScanning();

// Handle device found events
dbus.onDeviceFound((address, properties) => {
    console.log('Found device:', address, properties);
    // Move the train at speed 5
    setTimeout(() => {
        dbus.moveTrain(50);
    }, 2000);

    // Stop the train after 5 seconds
    setTimeout(() => {
        dbus.moveTrain(0);
    }, 5000);

    // Disconnect from the train after 7 seconds
    setTimeout(() => {
        dbus.disconnect();
    }, 7000);
});



