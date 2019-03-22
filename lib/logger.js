'use strict';

const Winston = require('winston');
const Logger = new Winston.Logger();
const path = require('path');

const LEVEL = 'trace';

Logger.configure({
  levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, trace: 5 },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    verbose: 'cyan',
    debug: 'magenta',
    trace: 'gray'
  },
});

Logger.add(Winston.transports.Console, {
  timestamp:true,
  prettyPrint: false,
  humanReadableUnhandledException: false,
  colorize: false,
  handleExceptions: false,
  silent: false,
  stringify: true,
  LEVEL,
});

module.exports = Logger;
