/**
 * @constructor
 * @extends Controller
 * @param {Model} model Model object to display
 * @param {Object=} opts A list of options to attach to the controller
 * @param {boolean=} skipViewCreation Set to true to disable the automatic view creation
 */
var ModelController = function(model, opts, skipViewCreation) {
  Controller.call(this, opts, skipViewCreation);
  this['model'] = model;
  this._bindEvents();
}

ModelController.prototype = new Controller(null, true);

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

