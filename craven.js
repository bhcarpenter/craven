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
};

/**
 * @param {Object} base
 * @param {Object} extension
 */
var extend = function(base, extension) {
  for (var k in extension) {
    base[k] = extension[k];
  }
};

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
    if (this._events && event in this._events) {
      var handlers = this._events[event];
      var contexts = this._eventContexts[event];

      var count = handlers.length;
      while (count--) {
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
    if (this._events && event in this._events) {

      // Create copies since the handlers may unregister themselves during the loop.
      var handlers = this._events[event].slice(0);
      var contexts = this._eventContexts[event].slice(0);

      var count = handlers.length;
      var args = slice.call(arguments, 1);
      args.push(this);
      while (count--) {
        handlers[count].apply(contexts[count], args);
      }

    }
  }
};

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

Model.prototype.on = Events.on;
Model.prototype.off = Events.off;
Model.prototype.trigger = Events.trigger;

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
  var filtered = pick(data, this['attributes']);
  this._saved = filtered;
  extend(this, filtered);
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
  var filtered = pick(data, this['attributes']);
  extend(this, filtered);
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
 *
 * @return {boolean}
 */
Model.prototype.save = function() {
  if (false === this['validate']()) return false;

  var current = this.toJSON();
  var old = this._saved;
  this._saved = current;

  var key, changed={}, hasChanged=false;
  for (key in current) {
    if (current[key] !== old[key]) {
      hasChanged = changed[key] = current[key];
    }
  }

  hasChanged && this.trigger('change', changed, old);
  return true;
}

Model.prototype.destroy = function() {
  this.trigger('destroy');
}

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

Controller.prototype['tagName'] = 'div';
Controller.prototype['attributes'] = {};
Controller.prototype.render = function() {}

/**
 * @this Controller
 */
var _remove =  // Alias for later chaining (size optimization)
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

/**
 * @constructor
 * @extends Controller
 * @param {Model} model Model object to display.
 * @param {Object=} opts A list of options to attach to the controller
 * @param {boolean=} skipViewCreation Set to true to disable the automatic view creation
 */
var ModelController = function(model, opts, skipViewCreation) {
  Controller.call(this, opts, skipViewCreation);
  this['model'] = model;
  model && this._bindEvents();
}

/**
 * Generates a prototype instance for use by subtypes.
 * @return {ModelController}
 */
ModelController.Prototype = function() {
  return new ModelController(null, null, true);
}

ModelController.prototype = Controller.Prototype();

/** @override */
ModelController.prototype.remove = function() {
  this._unbindEvents();
  _remove.call(this);
}

/**
 * Binds to the model's change and destroy events.
 */
ModelController.prototype._bindEvents = function() {
  var m = this['model'];
  m.on('change', _onChange, this);
  m.on('destroy', _onDestroy, this);
}

/**
 * Unbinds from the model's events.
 */
ModelController.prototype._unbindEvents = function() {
  var m = this['model'];
  m.off('change', _onChange, this);
  m.off('destroy', _onDestroy, this);
}

/**
 * Runs the current render() method, which may have
 * changed since this was added as an event listener
 * @this ModelController
 */
var _onChange = function() {
  this['render']();
}

/**
 * Runs the current remove() method, which may have
 * changed since this was added as an event listener
 * @this ModelController
 */
var _onDestroy = function() {
  this['remove']();
}

/**
 * @constructor
 * @extends Controller
 * @param {Collection} collection Collection to display
 * @param {Object=} opts A list of options to attach to the controller
 * @param {boolean=} skipViewCreation Set to true to disable the automatic view creation
 */
var CollectionController = function(collection, opts, skipViewCreation) {
  Controller.call(this, opts, skipViewCreation);
  this['collection'] = collection;
  this._modelControllers = [];

  if (collection) {
    this._addModels(collection, 0);
    this._bindEvents();
  }
}

/**
 * Generates a prototype instance for use by subtypes.
 * @return {CollectionController}
 */
CollectionController.Prototype = function() {
  return new CollectionController(null, null, true);
}

/** @type {Controller} */
CollectionController.prototype = Controller.Prototype();

/** @type {Function} The constructor to use when generating ModelControllers */
CollectionController.prototype['modelControllerType'] = ModelController;

/** @override */
CollectionController.prototype.remove = function() {
  this._unbindEvents();
  _remove.call(this);
}

/**
 * Binds to the add/remove events of the collection.
 */
CollectionController.prototype._bindEvents = function() {
  var c = this['collection'];
  c.on('add', this._addModels, this);
  c.on('remove', this._removeModels, this);
}

/**
 * Stops listening to the collection's events.
 */
CollectionController.prototype._unbindEvents = function() {
  var c = this['collection'];
  c.off('add', this._addModels, this);
  c.off('remove', this._removeModels, this);
}

/**
 * @param {Array.<Model>} models
 * @param {number} index
 */
CollectionController.prototype._addModels = function(models, index) {
  var fragment = document.createDocumentFragment();

  // Generate model controllers and add views to the fragment
  var count = models.length;
  var controllers = new Array(count);
  var controller;
  while (count--) {
    controller = controllers[count] = new this['modelControllerType'](models[count]);
    controller.render();
    fragment.appendChild(controller['view']);
  }

  // Insert controllers into the modelControllers list
  splice2(this._modelControllers, index, 0, controllers);

  // Insert the fragment into the DOM.
  var parent = this['view'];
  parent.insertBefore(fragment, parent.children[index]);
}

/**
 * @param {Array.<Model>} models
 * @param {number} index
 */
CollectionController.prototype._removeModels = function(models, index) {
  var count = models.length;
  var controllers = this._modelControllers.splice(index, count);
  while (count--) {
    controllers[count].remove();
  }
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
Events['on'] = Events.on;
Events['off'] = Events.off;
Events['trigger'] = Events.trigger;

Craven['Model'] = Model;
Model['Prototype'] = Model.Prototype;
Model.prototype['reset'] = Model.prototype.reset;
Model.prototype['update'] = Model.prototype.update;
Model.prototype['toJSON'] = Model.prototype.toJSON;
Model.prototype['validate'] = Model.prototype.validate;
Model.prototype['save'] = Model.prototype.save;
Model.prototype['destroy'] = Model.prototype.destroy;
Model.prototype['on'] = Model.prototype.on;
Model.prototype['off'] = Model.prototype.off;
Model.prototype['trigger'] = Model.prototype.trigger;

Craven['Collection'] = Collection;
Collection['Prototype'] = Collection.Prototype;
Collection.prototype['reset'] = Collection.prototype.reset;
Collection.prototype['remove'] = Collection.prototype.remove;
Collection.prototype['removeAt'] = Collection.prototype.removeAt;
Collection.prototype['on'] = Collection.prototype.on;
Collection.prototype['off'] = Collection.prototype.off;
Collection.prototype['trigger'] = Collection.prototype.trigger;

Craven['Controller'] = Controller;
Controller['Prototype'] = Controller.Prototype;
Controller.prototype['render'] = Controller.prototype.render;
Controller.prototype['remove'] = Controller.prototype.remove;

Craven['ModelController'] = ModelController;
ModelController['Prototype'] = ModelController.Prototype;

Craven['CollectionController'] = CollectionController;
CollectionController['Prototype'] = CollectionController.Prototype;

Craven['Router'] = Router;
Router['add'] = Router.add;
Router['activate'] = Router.activate;
Router['navigate'] = Router.navigate;

