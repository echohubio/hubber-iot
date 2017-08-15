import iot from 'aws-iot-device-sdk';
import log from 'electron-log';

let thingShadows;
let thingName;

const saveState = (name, value) => {
  const state = {
    state: {
      reported: {},
    },
  };

  // TODO load current state and merge

  state.state.reported[name] = value;

  const clientTokenUpdate = thingShadows.update(thingName, state);

  if (clientTokenUpdate === null) {
    console.error('update shadow failed, operation still in progress');
  }

  log.debug(state);
  log.debug(`saved state for ${name}`);

  // TODO keep track of clientTokenUpdate and updates
  // TODO: Retry on fail?
};

const setup = (options, imports, register) => {
  if (!options.x509) {
    register('Not configured');
    return;
  }

  thingName = options.clientId;
  const host = options.iotHost;

  const iotOptions = {
    clientId: options.clientId,
    privateKey: new Buffer(options.x509.keyPair.PrivateKey),
    clientCert: new Buffer(options.x509.certificatePem),
    caCert: new Buffer(options.x509.rootCertificatePem),
    host,
  };

  thingShadows = iot.thingShadow(iotOptions);

  thingShadows.on('connect', () => {
    log.debug('connect');

    log.debug(`register ${thingName}`);
    thingShadows.register(thingName, {}, (err, failedTopics) => {
      if (err) {
        log.debug('Failed to register: ', err);
        log.debug('Failed topics: ', failedTopics);

        register('Failed to register');
        return;
      }

      register(null, {
        iot: {
          saveState,
          thingShadows,
        },
      });

      log.debug('registration successful');
    });

    log.debug(`subscribe to hubber/${thingName}`);
    thingShadows.subscribe(`hubber/${thingName}/#`);
  });

  // All below just for debugging

  thingShadows.on('status', (name, stat, clientToken, stateObject) => {
    log.debug(`received status ${stat} from ${clientToken} on ${name}: ${JSON.stringify(stateObject)}`);
  });

  thingShadows.on('delta', (name, stateObject) => {
    log.debug(`received delta on ${name}: ${JSON.stringify(stateObject)}`);
  });

  thingShadows.on('timeout', (name, clientToken) => {
    log.debug(`received timeout on ${name} with token: ${clientToken}`);
  });

  thingShadows.on('reconnect', () => {
    log.debug('reconnect');
  });

  thingShadows.on('close', () => {
    log.debug('close');
  });

  thingShadows.on('offline', () => {
    log.debug('offline');
  });
};

export default setup;
