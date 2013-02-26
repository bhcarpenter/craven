/**
 * @constructor
 * @param {Object=} opts A list of options to attach to the controller
 * @param {boolean=} skipViewCreation Set to true to disable the automatic view creation
 * properties (optional)
 */
var Controller = function(opts, skipViewCreation) {
  opts && extend(this, opts);
  this['view'] || skipViewCreation || this._createView();
  this._createViewListener();
  this._bindModel();
  this._bindView();
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

  this._unbindModel();
  this._unbindView();
}

/**
 * Creates this Controller's "view" property, using the given
 * tagName and attributes
 */
Controller.prototype._createView = function() {
  var v = document.createElement(this['tagName']);
  extend(v, this['attributes']);
  this['view'] = v;
}

/**
 */
Controller.prototype._bindModel = function() {
  toggleModelEvents(this, 'on');
}

/**
 */
Controller.prototype._unbindModel = function() {
  toggleModelEvents(this, 'off');
}

/**
 */
Controller.prototype._bindView = function() {
  toggleViewEvents(this, 'addEventListener');
}

/**
 */
Controller.prototype._unbindView = function() {
  toggleViewEvents(this, 'removeEventListener');
}

/**
 * Creates a view listener function that is bound to the current controller.
 */
Controller.prototype._createViewListener = function() {
  var that = this;
  this._boundViewListener = function(event) {
    var elements = that['domEvents'][event.type];
    var view = that['view'];
    var target = event.target;

    for (var element in elements) {
      var methodName = elements[element];
      if (
          (element === '' && view === target)
          || (-1 !== slice.call(view.querySelectorAll(element), 0).indexOf(target))
      ) {
        that[methodName](event);
      }
    }
  }
}

/**
 * Helper function, reduces code duplication.
 */
var toggleModelEvents = function(controller, onoff) {
  var model = controller['model'];
  var events = controller['events'];

  if (model && events) {
    for (var event in events) {
      var methodName = events[event];
      model[onoff](event, controller[methodName], controller);
    }
  }
}

/**
 * Helper function, reduces code duplication.
 */
var toggleViewEvents = function(controller, onoff) {
  var events = controller['domEvents'];
  var view = controller['view'];

  if (events && view) {
    for (var event in events) {
      view[onoff](event, controller._boundViewListener, false);
    }
  }
}

