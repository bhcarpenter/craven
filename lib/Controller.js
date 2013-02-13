var controllerDefaults = {
  view: null,
  tagName: 'div',
  id: '',
  className: ''
};

/**
 * @constructor
 * @param {Object=} opts A list of options to attach to the controller
 * @param {boolean=} skipViewCreation Set to true to disable the automatic view creation
 * properties (optional)
 */
var Controller = function(opts, skipViewCreation) {
  extend(this, controllerDefaults, opts);
  this['view'] || skipViewCreation || this._createView();
}

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
 * tagName, attributes, id, and className
 */
Controller.prototype._createView = function() {
  this['view'] = extend(
    document.createElement(result(this, 'tagName')),
    result(this, 'attributes'),
    {
      id: result(this, 'id'),
      className: result(this, 'className')
    }
  );
}

