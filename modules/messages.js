const mqtt = require('mqtt');

exports.connect = function connect(mqtthost) {
    var clientmqtt = mqtt.connect(mqtthost);
    clientmqtt.on('connect', () => {
        console.log('connected to mqtt');
    });
    return clientmqtt;
}

exports.subscribeTopic = function subscribeTopic(clientmqtt, topic) {
    clientmqtt.subscribe(topic, (err) => {
        if (!err) {
            console.log('subscribed to topic ', topic);
        }
    });
}

exports.disconnect = function disconnect(clientmqtt) {
    clientmqtt.end();
}