import iot from 'aws-iot-device-sdk';
import Debug from 'debug';

const debug = Debug('hubber:plugin:iot');

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

  debug(state);
  debug(`saved state for ${name}`);

  // TODO keep track of clientTokenUpdate and updates
  // TODO: Retry on fail?
};

const setup = (options, imports, register) => {
  if (!options.x509) {
    register('Not configured');
    return;
  }

  thingName = options.clientId;

  const iotOptions = {
    clientId: options.clientId,
    privateKey: new Buffer(options.x509.keyPair.PrivateKey),
    clientCert: new Buffer(options.x509.certificatePem),
    caCert: new Buffer(options.x509.rootCertificatePem),
    region: 'us-east-1',
  };

  thingShadows = iot.thingShadow(iotOptions);

  thingShadows.on('connect', () => {
    debug('connect');

    debug(`register ${thingName}`);
    thingShadows.register(thingName, {}, (err, failedTopics) => {
      if (err) {
        debug('Failed to register: ', err);
        debug('Failed topics: ', failedTopics);

        register('Failed to register');
        return;
      }

      register(null, {
        iot: {
          saveState,
          thingShadows,
        },
      });

      debug('registration successful');
    });

    debug(`subscribe to hubber/${thingName}`);
    thingShadows.subscribe(`hubber/${thingName}/#`);
  });

  // All below just for debugging

  thingShadows.on('status', (name, stat, clientToken, stateObject) => {
    debug(`received status ${stat} from ${clientToken} on ${name}: ${JSON.stringify(stateObject)}`);
  });

  thingShadows.on('delta', (name, stateObject) => {
    debug(`received delta on ${name}: ${JSON.stringify(stateObject)}`);
  });

  thingShadows.on('timeout', (name, clientToken) => {
    debug(`received timeout on ${name} with token: ${clientToken}`);
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

export default setup;
