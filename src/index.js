import iot from 'aws-iot-device-sdk';
import log from 'electron-log';

import rootCertificatePem from './caCert';

const setup = (options, imports, register) => {
  if (!options.x509) {
    register('Not configured');
    return;
  }

  let registered = false;

  const thingName = options.clientId;

  const iotOptions = {
    clientId: options.clientId,
    privateKey: new Buffer(options.x509.keyPair.PrivateKey),
    clientCert: new Buffer(options.x509.certificatePem),
    caCert: new Buffer(rootCertificatePem),
    host: options.endpoint,
  };

  const device = iot.device(iotOptions);

  device.on('connect', () => {
    log.debug('connect');

    log.debug(`subscribe to hubber/${thingName}`);
    device.subscribe(`hubber/${thingName}/+`);

    if (!registered) {
      register(null, {
        iot: {
          device,
        },
      });
      registered = false;
    }
  });

  // All below just for debugging
  device.on('reconnect', () => {
    log.debug('reconnect');
  });

  device.on('close', () => {
    log.debug('close');
  });

  device.on('offline', () => {
    log.debug('offline');
  });

  device.on('error', (error) => {
    log.debug('error', error);
  });
};

export default setup;
