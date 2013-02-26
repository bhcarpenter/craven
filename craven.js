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
    copy[keys[count]] = data[keys[count]];
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

/**
 * Events mixin.
 */
var Events = {
  /** 
   * @this {Object}
   * @param {string} event
   * @param {function()} fct
   * @param {Object} ctx
   */
  on: function(event, fct, ctx) {
    if (!this._events) {
      this._events = {};
      this._eventContexts = {};
    }
    if (!this._events[event]) {
      this._events[event] = [];
      this._eventContexts[event] = [];
    }
    this._events[event].push(fct);
    this._eventContexts[event].push(ctx || this);
  },

  /**
   * @this {Object}
   * @param {string} event
   * @param {function()} fct
   * @param {Object} ctx
   */
  off: function(event, fct, ctx) {
    var handlers, contexts, count;

    if (
      this._events &&
      (handlers = this._events[event]) &&
      (contexts = this._eventContexts[event])
    ) {
      for (count = handlers.length; count--;) {
        if (handlers[count] == fct && contexts[count] == ctx) {
          handlers.splice(count, 1);
          contexts.splice(count, 1);
          return;
        }
      }
    }
  },

  /**
   * @this {Object}
   * @param {...*} event
   */
  trigger: function(event) {
    var handlers, contexts, count, args;

    if (
      this._events &&
      (handlers = this._events[event]) &&
      (contexts = this._eventContexts[event])
    ) {
      // Create copies since the handlers may unregister themselves during the loop.
      handlers = handlers.slice(0);
      contexts = contexts.slice(0);
      args = slice.call(arguments, 1);
      args.push(this);

      for (count = handlers.length; count--;) {
        handlers[count].apply(contexts[count], args);
      }
    }
  }
};

// Export these functions here instead of in exports.js so that objects that
// extend Events will have the exports again.
Events['on'] = Events.on;
Events['off'] = Events.off;
Events['trigger'] = Events.trigger;

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

/**
 * Collection constructor
 *
 * Collections maintain an ordered set of models.
 *
 * @constructor
 * @param {Array.<Model>=} models Models to initialize the collection with
 */
var Collection = function(models) {
  models && push.apply(this, this._objectify(models));
}

/**
 * Generates a prototype instance for use by subtypes.
 * @return {Collection}
 */
Collection.Prototype = function() {
  return new Collection();
}

/** @type {Array} */
Collection.prototype = new Array();

extend(Collection.prototype, /** @lends {Collection.prototype} */(Events));

/** @type {function(new:Model)} */
Collection.prototype['modelType'] = Model;

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
}

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

/**
 * Handles the "change" event from the models it holds, and
 * re-triggers a "change" event on this Collection
 * @param {Object} changed A hash of the attributes that changed
 * @param {Object} old The previous attributes of the model
 * @param {Model} model The model that was changed.
 */
Collection.prototype._triggerChange = function(changed, old, model) {
  this.trigger('change', changed, old, model);
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
  var modelType = this['modelType'];

  return map.call(data, function(model) {
    if (!(model instanceof modelType)) {
      model = new modelType(model);
    }
    model.on('destroy', this.remove, this);
    model.on('change', this._triggerChange, this);
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
    models[count].on('change', this._triggerChange, this);
  }
}

/**
 * @constructor
 * @param {Object=} opts A list of options to attach to the controller
 * @param {boolean=} skipViewCreation Set to true to disable the automatic view creation
 * properties (optional)
 */
var Controller = function(opts, skipViewCreation) {
  opts && extend(this, opts);
  this['view'] || skipViewCreation || this._createView();
}

/**
 * Generates a prototype instance for use by subtypes.
 * @return {Controller}
 */
Controller.Prototype = function() {
  return new Controller(null, true);
}

/** @type {string} */
Controller.prototype['tagName'] = 'div';

/** @type {Object} */
Controller.prototype['attributes'] = {};

/**
 */
Controller.prototype.remove = function() {
  var el = this['view'];
  var parent = el.parentNode;
  parent && parent.removeChild(el);
}

/**
 * Creates this Controller's "view" property, using the given
 * tagName and attributes
 */
Controller.prototype._createView = function() {
  var v = document.createElement(result(this, 'tagName'))
  extend(v, result(this, 'attributes'));
  this['view'] = v;
}

var Router = {
  _routes: [],

  /** @this Object */
  add: function(route, handler, context) {
    var r = {};
    r.pattern = new RegExp(route.replace(/(^|\/):[\w\d]*(\/|$)/, '$1(.+)$2'));
    r.handler = handler;
    r.context = context;
    this._routes.push(r);
  },

  /** @this Object */
  activate: function() {
    var that = this;
    window.addEventListener('popstate', function() {
      that._route(location.pathname);
    }, false);
  },

  /** @this Object */
  navigate: function(url) {
    window.history.pushState({}, '', url);
    this._route(url);
  },

  /** @this Object */
  _route: function(url) {
    var routes = this._routes;
    var count = routes.length;
    var route, matches;
    while (count--) {
      route = routes[count];
      if (matches = route.pattern.exec(url)) {
        matches.unshift();
        route.handler.apply(route.context, matches);
      }
    }
  }

};

// Closure compiler exports
var Craven = {};
window['Craven'] = Craven;

Craven['Events'] = Events;

Craven['Model'] = Model;
Model['Prototype'] = Model.Prototype;
Model.prototype['reset'] = Model.prototype.reset;
Model.prototype['update'] = Model.prototype.update;
Model.prototype['toJSON'] = Model.prototype.toJSON;
Model.prototype['validate'] = Model.prototype.validate;
Model.prototype['save'] = Model.prototype.save;
Model.prototype['destroy'] = Model.prototype.destroy;

Craven['Collection'] = Collection;
Collection['Prototype'] = Collection.Prototype;
Collection.prototype['reset'] = Collection.prototype.reset;
Collection.prototype['remove'] = Collection.prototype.remove;
Collection.prototype['removeAt'] = Collection.prototype.removeAt;

Craven['Controller'] = Controller;
Controller['Prototype'] = Controller.Prototype;
Controller.prototype['remove'] = Controller.prototype.remove;

Craven['Router'] = Router;
Router['add'] = Router.add;
Router['activate'] = Router.activate;
Router['navigate'] = Router.navigate;

