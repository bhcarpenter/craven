/**
 * Collection constructor
 *
 * Collections maintain an ordered set of models.
 *
 * @constructor
 * @param {?function(new:Model)} model The type of Model to store in this Collection.
 * @param {Array.<Model>=} models
 */
var Collection = function(model, models) {
  this['model'] = model;
  models && push.apply(this, this._objectify(models));
}

/**
 * Generates a prototype instance for use by subtypes.
 * @return {Collection}
 */
Collection.Prototype = function() {
  return new Collection(null);
}

Collection.prototype = new Array();
Collection.prototype.on = Events.on;
Collection.prototype.off = Events.off;
Collection.prototype.trigger = Events.trigger;


/* ***************************************
 * Extend Array mutators.
 *************************************** */

/** @override */
Collection.prototype.pop = function() {
  return this._remove(pop, this.length-1);
}

/** @override */
Collection.prototype.push = function() {
  return this._insert(arguments, push, this.length);
}

/** @override */
Collection.prototype.shift = function() {
  return this._remove(shift, 0);
}

/** @override */
Collection.prototype.unshift = function() {
  return this._insert(arguments, unshift, 0);
}

/** @override */
Collection.prototype.splice = function() {
  var args = arguments;
  var models = this._objectify(slice.call(args, 2));

  var removed = splice2(this, args[0], args[1], models)
  this._unbind(removed);

  // Trigger events
  removed.length && this.trigger('remove', removed);
  models.length && this.trigger('add', models);

  return removed;
}

/**
 * @param {Array.<Model>|Array.<Object>} data
 * @param {Function} method
 * @param {number} index
 */
Collection.prototype._insert = function(data, method, index) {
  var models = this._objectify(data);
  var result = method.apply(this, models);
  this.trigger('add', models, index);
  return result;
}

/**
 * @param {Function} method
 * @param {number} index
 */
Collection.prototype._remove = function(method, index) {
  var removed = method.call(this);
  this._unbind(removed);
  removed && this.trigger('remove', [removed], index);
  return removed;
}


/* ***************************************
 * Instance Methods.
 *************************************** */

/**
 * @param {Array.<Model>|Array.<Object>} data
 */
Collection.prototype.reset = function(data) {
  var old = splice2(this, 0, this.length, this._objectify(data));
  this._unbind(old);
  this.trigger('reset', old);
}

/**
 * @param {Model} obj
 */
Collection.prototype.remove = function(obj) {
  this.removeAt(this.indexOf(obj));
};

/**
 * @param {number} index
 */
Collection.prototype.removeAt = function(index) {
  if (-1 != index) {
    var old = splice.call(this, index, 1);
    this._unbind(old);
    this.trigger('remove', old, index);
  }
}

/** @override */
Collection.prototype.toJSON = function() {
  return this.map(function(object) {
    return object.toJSON();
  });
}


/* ***************************************
 * Converting to and from Model objects.
 *************************************** */

/**
 * Converts paramater hashes into Model objects, and sets up
 * event listeners.
 *
 * @param {Array.<Model>|Array.<Object>} data
 */
Collection.prototype._objectify = function(data) {
  var modelClass = this['model'];

  return map.call(data, function(model) {
    if (!(model instanceof modelClass)) {
      model = new modelClass(model);
    }
    model.on('destroy', this.remove, this);
    return model;
  }, this);
}

/**
 * Unlisten to the 'destroy' event for each of the given models.
 */
Collection.prototype._unbind = function(models) {
  var count = models.length;
  while (count--) {
    models[count].off('destroy', this.remove, this);
  }
}

