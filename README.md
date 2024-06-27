# Demo Stop The Crazy Train - Lego Train Controller

![lego](https://www.lego.com/cdn/cs/set/assets/blt95604d8cc65e26c4/CITYtrain_Hero-XL-Desktop.png?fit=crop&format=webply&quality=80&width=1600&height=1000&dpr=1)

## Description

This demo is a part of global demo "Stop The Crazy train" :
“ The train is running mad at full speed and has no driver ! Your mission, should you choose to accept it, is to train and deploy an AI model at the edge to stop the train before it crashes. This message will self-destruct in five seconds. Four. three. Two. one.  tam tam tada tum tum tada tum tum tada tum tum tada tiduduuuuummmm tiduduuuuuuuuummm ”

## Objectives

Showcase a nodejs application that control a [Lego Train Ref : 60337](https://www.lego.com/en-fr/themes/city/train) using Bluetooth, all commands are read from mqtt broker.

The controller can :

- discover the hub
- start and stop the train
- increase/decrase speed

### Prerequisites

You will need:

- Podman
- Nodejs v20.7.0
- MQTT broker (mosquitto docker image)
- MQTT cli (mosquitto)

### Local installation

On linux

```sh
sudo dnf install -y podman
sudo mkdir -p /tmp/mosquitto/{config,data,log}
sudo tee /tmp/mosquitto/config/mosquitto.conf <<EOF
persistence true
persistence_location /mosquitto/data/
listener 1883 0.0.0.0
protocol mqtt
allow_anonymous true
log_dest file /mosquitto/log/mosquitto.log
EOF
sudo dnf install -y mosquitto
```

On macos

```sh
mkdir -p /tmp/mosquitto/{config,data,log}
tee /tmp/mosquitto/config/mosquitto.conf <<EOF
persistence true
persistence_location /mosquitto/data/
listener 1883 0.0.0.0
protocol mqtt
allow_anonymous true
log_dest file /mosquitto/log/mosquitto.log
EOF
brew install mosquitto
```

Install package dependencies nodejs.

```sh
npm install
```

### Test

Run the mqtt broker on linux.

```sh
sudo podman run -d --rm --name mosquitto -p 1883:1883 -p 9001:9001 -v /tmp/mosquitto/config:/mosquitto/config:z -v /tmp/mosquitto/data:/mosquitto/data:z -v /tmp/mosquitto/log:/mosquitto/log:z docker.io/library/eclipse-mosquitto:2.0.18
```

Run the mqtt broker on macos.

```sh
podman run -d --rm --name mosquitto -p 1883:1883 -p 9001:9001 -v /Users/mouchan/projects/mosquitto/config:/mosquitto/config -v /Users/mouchan/projects/mosquitto/data:/mosquitto/data -v /Users/mouchan/projects/mosquitto/log:/mosquitto/log docker.io/library/eclipse-mosquitto:2.0.18
```

On linux, you have to configure DBUS:

```sh
cat > /etc/dbus-1/system.d/node-ble.conf <<EOF
<busconfig>
  <policy user="$(id -un)">
   <allow own="org.bluez"/>
    <allow send_destination="org.bluez"/>
    <allow send_interface="org.bluez.GattCharacteristic1"/>
    <allow send_interface="org.bluez.GattDescriptor1"/>
    <allow send_interface="org.freedesktop.DBus.ObjectManager"/>
    <allow send_interface="org.freedesktop.DBus.Properties"/>
  </policy>
</busconfig>
EOF
```

Run the controller.

```sh
export NOBLE_USE_BLUEZ_WITH_DBUS=true
export DEBUG="bluez-dbus-bindings,poweredup,technicmediumhub,basehub"
node ./index.js
```

You should see something like this.

```
Connecting to MQTT broker mqtt://localhost:1883...
Scanning for Lego PoweredUp Hubs...
Connected to MQTT broker mqtt://localhost:1883!
Subscribed to topic train-command!
Connected to Lego Hub!
All hardware pieces have been discovered!
Lego City Train #60337 reached max speed!
```

Send all MQTT commands sequentially.

```sh
for cmd in `seq 0 1`; do mosquitto_pub -h localhost -p 1883 -t train-command -m "$cmd"; sleep 10; done
```

On the train-controller logs, you should see something like this.

```
Received message on MQTT topic train-command: 0
Handling SpeedLimit_30...
Processed command 0!
Received message on MQTT topic train-command: 1
Handling DangerAhead...
Processed command 1!
```

## Available commands

  ```text
  0: "SpeedLimit_30",
  1: "DangerAhead",
  ```

## Enabling the Mock

If you do not have a proper Lego Hub, you can mock it.

```sh
export LEGO_BACKEND=mock
export DEBUG="lego-gear-mock"
node ./index.js
```
