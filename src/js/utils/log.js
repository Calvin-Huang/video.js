/**
 * @file log.js
 * @module log
 */
import window from 'global/window';

let log;

// This is the private tracking variable for logging level.
let level = 'info';

// This is the private tracking variable for the logging history.
let history = [];

/**
 * Log messages to the console and history based on the type of message
 *
 * @private
 * @param  {string} type
 *         The name of the console method to use.
 *
 * @param  {Array} args
 *         The arguments to be passed to the matching console method.
 */
export const logByType = (type, args) => {
  const lvl = log.levels[level];
  const lvlRegExp = new RegExp(`^(${lvl})$`);

  if (type !== 'log') {

    // Add the type to the front of the message when it's not "log".
    args.unshift(type.toUpperCase() + ':');
  }

  // Add a clone of the args at this point to history.
  if (history) {
    history.push([].concat(args));
  }

  // Add console prefix after adding to history.
  args.unshift('VIDEOJS:');

  // If there's no console then don't try to output messages, but they will
  // still be stored in history.
  if (!window.console) {
    return;
  }

  // Was setting these once outside of this function, but containing them
  // in the function makes it easier to test cases where console doesn't exist
  // when the module is executed.
  let fn = window.console[type];

  if (!fn && type === 'debug') {
    // Certain browsers don't have support for console.debug. For those, we
    // should default to the closest comparable log.
    fn = window.console.info || window.console.log;
  }

  // Bail out if there's no console or if this type is not allowed by the
  // current logging level.
  if (!fn || !lvl || !lvlRegExp.test(type)) {
    return;
  }

  fn[Array.isArray(args) ? 'apply' : 'call'](window.console, args);
};

/**
 * Logs plain debug messages. Similar to `console.log`.
 *
 * @class
 * @param    {Mixed[]} args
 *           One or more messages or objects that should be logged.
 */
log = function(...args) {
  logByType('log', args);
};

/**
 * Enumeration of available logging levels, where the keys are the level names
 * and the values are `|`-separated strings containing logging methods allowed
 * in that logging level. These strings are used to create a regular expression
 * matching the function name being called.
 *
 * Levels provided by video.js are:
 *
 * - `off`: Matches no calls. Any value that can be cast to `false` will have
 *   this effect. The most restrictive.
 * - `all`: Matches only Video.js-provided functions (`debug`, `log`,
 *   `log.warn`, and `log.error`).
 * - `debug`: Matches `log.debug`, `log`, `log.warn`, and `log.error` calls.
 * - `info` (default): Matches `log`, `log.warn`, and `log.error` calls.
 * - `warn`: Matches `log.warn` and `log.error` calls.
 * - `error`: Matches only `log.error` calls.
 *
 * @type {Object}
 */
log.levels = {
  all: 'debug|log|warn|error',
  off: '',
  debug: 'debug|log|warn|error',
  info: 'log|warn|error',
  warn: 'warn|error',
  error: 'error',
  DEFAULT: level
};

/**
 * Get or set the current logging level. If a string matching a key from
 * {@link log.levels} is provided, acts as a setter. Regardless of argument,
 * returns the current logging level.
 *
 * @param  {string} [lvl]
 *         Pass to set a new logging level.
 *
 * @return {string}
 *         The current logging level.
 */
log.level = (lvl) => {
  if (typeof lvl === 'string') {
    if (!log.levels.hasOwnProperty(lvl)) {
      throw new Error(`"${lvl}" in not a valid log level`);
    }
    level = lvl;
  }
  return level;
};

/**
 * Returns an array containing everything that has been logged to the history.
 *
 * This array is a shallow clone of the internal history record. However, its
 * contents are _not_ cloned; so, mutating objects inside this array will
 * mutate them in history.
 *
 * @return {Array}
 */
log.history = () => history ? [].concat(history) : [];

/**
 * Clears the internal history tracking, but does not prevent further history
 * tracking.
 */
log.history.clear = () => {
  if (history) {
    history.length = 0;
  }
};

/**
 * Disable history tracking if it is currently enabled.
 */
log.history.disable = () => {
  if (history !== null) {
    history.length = 0;
    history = null;
  }
};

/**
 * Enable history tracking if it is currently disabled.
 */
log.history.enable = () => {
  if (history === null) {
    history = [];
  }
};

/**
 * Logs error messages. Similar to `console.error`.
 *
 * @param {Mixed[]} args
 *        One or more messages or objects that should be logged as an error
 */
log.error = (...args) => logByType('error', args);

/**
 * Logs warning messages. Similar to `console.warn`.
 *
 * @param {Mixed[]} args
 *        One or more messages or objects that should be logged as a warning.
 */
log.warn = (...args) => logByType('warn', args);

/**
 * Logs debug messages. Similar to `console.debug`, but may also act as a comparable
 * log if `console.debug` is not available
 *
 * @param {Mixed[]} args
 *        One or more messages or objects that should be logged as debug.
 */
log.debug = (...args) => logByType('debug', args);

export default log;
