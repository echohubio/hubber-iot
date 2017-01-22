// var request = require('request-promise-native');
import iot from 'aws-iot-device-sdk';
import Debug from 'debug';

import config from '../lib/config';

const debug = Debug('iot');

const setup = (options, imports, register) => {
  const setupThingShadow = () => {
    const iotConfig = config.get('iot');
    if (!iotConfig) {
      // TODO set a timer to keep checking if we are configured
      return;
    }

    const thingName = iotConfig.clientId;
    const iotOptions = {
      clientId: iotConfig.clientId,
      privateKey: new Buffer(iotConfig.x509.keyPair.PrivateKey),
      clientCert: new Buffer(iotConfig.x509.certificatePem),
      caCert: new Buffer(iotConfig.x509.rootCertificatePem),
      region: 'us-east-1',
    };

    const thingShadows = iot.thingShadow(iotOptions);

    thingShadows.on('connect', (connack) => {
      debug('connect', connack);

      debug(`register ${thingName}`);
      thingShadows.register(thingName, {}, (err, failedTopics) => {
        if (err) {
          debug('Failed to register: ', err);
          debug('Failed topics: ', failedTopics);
          return;
        }

        debug('registration successful');
      });

      debug(`subscribe to hubber/${thingName}`);
      thingShadows.subscribe(`hubber/${thingName}/#`);
    });

    thingShadows.on('status', (name, stat, clientToken, stateObject) => {
      debug(`received status ${stat}from ${clientToken} on ${name}: ${JSON.stringify(stateObject)}`);
    });

    thingShadows.on('delta', (name, stateObject) => {
      debug(`received delta on ${name}: ${JSON.stringify(stateObject)}`);
    });

    thingShadows.on('timeout', (name, clientToken) => {
      debug(`received timeout on ${name} with token: ${clientToken}`);
    });

    thingShadows.on('message', (topic, payloadJSON) => {
      debug(`received message on topic ${topic}`, payloadJSON.toString());
    });

    thingShadows.on('reconnect', () => {
      debug('reconnect');
    });

    thingShadows.on('close', () => {
      debug('close');
    });

    thingShadows.on('offline', () => {
      debug('offline');
    });
  };


  setupThingShadow();
