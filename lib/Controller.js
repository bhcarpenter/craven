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

