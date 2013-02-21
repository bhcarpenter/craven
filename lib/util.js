// Shortcuts to array methods
var arr = [];
var slice = arr.slice,
  splice = arr.splice,
  push = arr.push,
  shift = arr.shift,
  pop = arr.pop,
  unshift = arr.unshift,
  map = arr.map;

/**
 * Calls splice on the given array with an array of objects for replacement,
 * instead of using variable arguments.
 *
 * @param {Array} arr
 * @param {number} index
 * @param {number} count
 * @param {Array.<Object>} objs
 */
var splice2 = function(arr, index, count, objs) {
  var args = [index, count];
  push.apply(args, objs);
  return splice.apply(arr, args);
}

/**
 * @param {Object} data
 * @param {Array.<string>} keys
 * @return {Object}
 */
var pick = function(data, keys) {
  var copy = {};
  var count = keys.length;
  while (count--) {
    if (keys[count] in data) {
      copy[keys[count]] = data[keys[count]];
    }
  }
  return copy;
}

/**
 * @param {Object} base
 * @param {Object} extension
 */
var extend = function(base, extension) {
  for (var k in extension) {
    base[k] = extension[k];
  }
}

/**
 * @param {Object} object
 * @param {string} property
 */
var result = function(object, property) {
  var value = object[property];
  return typeof value === 'function' ? value.call(object) : value;
}

