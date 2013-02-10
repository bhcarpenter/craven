// Shortcuts to array methods
var arr = [];
var slice = arr.slice,
  splice = arr.splice,
  push = arr.push,
  shift = arr.shift,
  pop = arr.pop,
  unshift = arr.unshift;

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
};

/**
 * @param {Array} arr
 * @param {Function} iterator
 * @param {Object=} context
 */
var map = function(arr, iterator, context) {
  if (arr.map) return arr.map(iterator, context);
  var count = arr.length;
  var results = new Array(count);
  while (count--) {
    results[count] = iterator.call(context, arr[count]);
  }
  return results;
};

/**
 * @param {...Object} base
 */
var extend = function(base) {
  var extensions = slice.call(arguments, 1);
  for (var i=0, count=extensions.length; i < count; i++) {
    var extension = extensions[i];
    for (var k in extension) {
      base[k] = extension[k];
    }
  }
  return base;
};

/**
 * @param {Object} object
 * @param {string} property
 */
var result = function(object, property) {
  var value = object[property];
  return typeof value === 'function' ? value.call(object) : value;
}

