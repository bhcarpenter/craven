/**
 * @constructor
 * @extends Controller
 * @param {Collection} collection Collection to display
 * @param {Object=} opts A list of options to attach to the controller
 */
var CollectionController = function(collection, opts) {
  Controller.call(this, opts);
  this['collection'] = collection;
  this._modelControllers = [];
  this._addModels(collection, 0);
  this._bindEvents();
}

CollectionController.prototype = new Controller();

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
    controller = controllers[count] = new ModelController(models[count]);
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

