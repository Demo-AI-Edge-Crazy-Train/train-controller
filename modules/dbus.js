const dbus = require('dbus-native');

// Create a new DBus system bus
const systemBus = dbus.systemBus();

// Get a reference to the BlueZ service
const bluezService = systemBus.getService('org.bluez');

// The path to the device will depend on your system
//const devicePath = '/org/bluez/hci0';

// Start scanning for devices
exports.startScanning = function startScanning() {

    bluezService.getInterface('/', 'org.freedesktop.DBus.ObjectManager', function(err, objectManagerInterface) {
        if (err) {
            console.error(err);
        } else {
            objectManagerInterface.on('InterfacesAdded', function(path, interfaces) {
                if ('org.bluez.Device1' in interfaces) {
                    console.log('Device found: ' + path);
                }
            });

            var adapterPath = '/org/bluez/hci0';

            bluezService.getInterface(adapterPath, 'org.bluez.Adapter1', function(err, adapterInterface) {
                if (err) {
                    console.error(err);
                } else {
                    adapterInterface.StartDiscovery();
                }
            });
        }
    });
}

// Listen for device found events
exports.onDeviceFound = function onDeviceFound(callback) {
    systemBus.addMatch("type='signal',interface='org.bluez.Adapter1',member='DeviceFound'", (err) => {
        if (err) {
            console.error(err);
            return;
        }

        systemBus.on('message', (msg) => {
            if (msg && msg.member === 'DeviceFound') {
                callback(msg.body[0], msg.body[1]);
            }
        });
    });
}



// Connect to the device
exports.connect = function connect() {
    bluezService.getInterface(devicePath, 'org.bluez.Device1', (err, deviceInterface) => {
        if (err) {
            console.error(err);
            return;
        }

        deviceInterface.Connect();
    });
}

// Disconnect from the device
exports.disconnect = function disconnect() {
    bluezService.getInterface(devicePath, 'org.bluez.Device1', (err, deviceInterface) => {
        if (err) {
            console.error(err);
            return;
        }

        deviceInterface.Disconnect();
    });
}

// Replace XX_XX_XX_XX_XX_XX with your device's MAC address
exports.moveTrain = function moveTrain(speed) {
    bluezService.getInterface(devicePath, 'org.bluez.GattCharacteristic1', (err, gattCharacteristic) => {
        if (err) {
            console.error(err);
            return;
        }

        // The exact command will depend on your train model
        const command = [0x81, 0x00, 0x11, 0x51, 0x00, speed];
        gattCharacteristic.WriteValue(command, {});
    });
}

