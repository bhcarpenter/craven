/**
 * Model constructor
 *
 * Model objects maintain a set of attributes and associated methods.
 * @constructor
 * @param {Object=} attr A hash of attributes to set on the new instance.
 */
var Model = function(attr) {
  attr && this.reset(attr);
}

/**
 * Generates a prototype instance for use by subtypes.
 * @return {Model}
 */
Model.Prototype = function() {
  return new Model();
}

extend(Model.prototype, /** @lends {Model.prototype} */(Events));

/** @dict */
Model.prototype._saved = {};

/** @type {Array.<string>} */
Model.prototype['attributes'] = [];

/**
 * Reset this Model's attributes from the given hash.
 *
 * Only attributes that have been listed in the Model's attributes array will
 * be populated, other attributes will be ignored.
 *
 * All existing attributes will be erased. To change only a subset of the
 * attributes use update() instead.
 *
 * @param {Object} data
 */
Model.prototype.reset = function(data) {
  extend(this, this._saved = pick(data, this['attributes']));
}

/**
 * Updates a subset of this Model's attributes
 *
 * Only attributes that have been listed in the Model's attributes array will
 * be populated, other attributes will be ignored.
 *
 * @param {Object} data
 */
Model.prototype.update = function(data) {
  extend(this, pick(data, this['attributes']));
}

/**
 * Return this Model's attributes as a hash.
 *
 * Only attributes that have been listed in the Model's attributes array will
 * be returned.
 *
 * @return {Object}
 */
Model.prototype.toJSON = function() {
  return pick(this, this['attributes']);
}

/**
 * Stub for use in validation. Intended to be overridden.
 *
 * Subclasses are recommended to trigger an 'error' event on failure with
 * a hash of validation errors and return false.
 *
 * @return {boolean|undefined}
 */
Model.prototype.validate = function() {}

/**
 * Updates this Model's 'current' property with the current attributes.
 *
 * If any attributes have changed, a 'change' event is triggered, and handlers
 * are passed a hash of the values that changed, and a copy of the previous
 * state.
 */
Model.prototype.save = function() {
  if (this['validate']() !== false) {
    var old = this._saved;
    var current = this._saved = this.toJSON();

    var key, changed={}, hasChanged=false;
    for (key in current) {
      if (current[key] !== old[key]) {
        hasChanged = changed[key] = current[key];
      }
    }

    hasChanged && this.trigger('change', changed, old);
  }
}

/** */
Model.prototype.destroy = function() {
  this.trigger('destroy');
}

