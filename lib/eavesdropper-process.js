'use strict';

const Eavesdropper = require('./eavesdropper.js');
const BaseProcess = require('./base/base-process.js');
const C = require('./constants.js');
const LOG_PREFIX = "[eavesdropper-process]";

const manager = new Eavesdropper();
const newProcess = new BaseProcess(manager, LOG_PREFIX);

const start = async () => {
  await newProcess.start();
};

start();
