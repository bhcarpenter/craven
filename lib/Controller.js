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
  var v = document.createElement(this['tagName']);
  extend(v, this['attributes']);
  this['view'] = v;
}

