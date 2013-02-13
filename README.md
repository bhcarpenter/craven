Craven.js
=========

The cowardly MVCish JavaScript framework. Craven.js is TINY, full-featured, and suitable for use client-side or server-side.

Features
--------
- < 2k minified and gzipped
- no dependencies for well-behaved browsers (see polyfills below)
- Models, Collections, Controllers, Routing, DOMless Events

Components
----------

###Models

The models component of Craven.js provides a simple PubSub system and scaffolding for setting up Models and Collections that model the business requirements of a system.

####Events

A mixin of the following methods suitable for including in other objects:

- **`on(eventName, callback[, context])` -** Binds `callback` to the `eventName` event. When it executes, `context` will be used as the value of `this`. If `context` is omitted, the object `on` was called on will be used as `this` instead.
- **`off(eventName, callback[, context])` -** Removes an event listener added by `on` with the same parameters.
- **`trigger(eventName[, args...])` -** Executes all of the event listeners that are bound to the `eventName` event on the called object, passing them the given arguments. Additionally, the object that `trigger` was called on will be passed as the last argument.

####Model


**Constructor:**

- **`Model([attributesHash])` -** Creates a new Model instance, optionally setting it's initial state by passing `attributesHash` to the `reset` instance method.

**Model instance methods:**

- **`reset(attributesHash)` -** Sets properties on the model in bulk from the given `attributesHash` hash. Only properties listed in the `attributes` property of the object will be set.
- **`update(attributesHash)` -** Just like `reset`, but doesn't reset the Model's "dirty" state. This means that after calling `update`, you can call `save` to trigger an "update" event.
- **`toJSON()` -** Creates an attributes hash of the Model's properties that are listed in it's `attributes` list. Note that this returns an _object_, not a string, in order to be compatible with JSON.stringify.
- **`validate()` -** A method called internally by `save`. If it returns `false` (strictly), `save` will abort. It is recommended that subtypes of Model override this method to return `false` and trigger an "error" event with a property name => error message hash if any properties are invalid.
- **`save()` -** If `validate` doesn't return false, checks to see if any attributes have changed since the last `save` or `reset`. If there are some changes, `save` will trigger a "change" event, passing it a hash of changed attributes, and another hash of the values that those attributes used to be. 
- **`destroy()` -** Triggers a "destroy" event.

It also has one public property:

- **`attributes` -** An array of attribute names to read when serializing the object using toJSON. Also used in determining if the object has been "changed" or not.

Additionally, the constructor Model has a method:

- **`subtype(attributesList[, initializer])` -** Returns a new subtype of Model. It will use `attributesList` as its list of serialiable attributes. If `initializer` is given, it will be called during object construction _after the superconstructor_.

####Collection

A constructor that creates a collection for holding groups of a particular Model subtype. Collections are subtypes of Array, so any methods that work on normal arrays also work on Collections.

**Constructor:**

- **`Collection(model[, models])` -** Create a new Collection of the given `model` class, optionally initializing it with the given `models` array.

**Adding Models**

These Array methods are overridden to trigger an "add" event as well as adding the objects to the Collection: `push`, `unshift`, `splice`.

**Removing Models**

These Array methods are overridden to trigger a "remove" event as well as removing the objects from the Collection: `pop`, `shift`, `splice`.

**Additional Collection instance methods:**

- **`reset(models)` -** Replaces all models currently in the Collection with the given `models` array. Triggers a "reset" event with a list of the models that were removed as an argument.
- **`remove(model)` -** Searches for `model` within the Collection and removes it. Triggers a "remove" event with a list containing the removed model as an argument.
- **`removeAt(index)` -** Removes the model at the given index. Triggers a "remove" event with a list containing the removed model as an argument.
- **`toJSON()` -** Overrides the default Array `toJSON` method to return a list of attribute hashes that represent the Models in the collection. Note that this returns an _Array_, not a string, in order to be compatible with JSON.stringify.

**Model Integration**

- Any of these methods that add Models to the Collection will accept attribute hashes instead of Models, and will convert those attribute hashes into the model class specified in the constructor.
- If the `destroy` method of any of the contained Models is called, that Model will automatically be removed from the Collection.

###Views and Controllers

Everyone has a different idea about the role of Controllers in an MV(whatever) architecture. In Craven.js, Views are the actual DOM elements that represent business components on the page, and Controllers are responsible for setting up the connections (i.e. events) between Views and Models. Additionally, client-side controllers are a fine place to setup any UI components or transitions.

Craven.js doesn't provide any built-in templating for generating views of models, and there's not really any structure dictating how server-side Controllers should work. There are a few constructors built in to Craven.js for dealing with client-side Controllers though.

####Controller

The base type of client-side controllers.

**Constructor:**

- **`Controller([options, skipViewCreation])` -** Creates a new Controller, optionally setting the `options` hash as properties on the Controller. If `skipViewCreation` is not set to true, the controller will automatically generate a `view` object from the options. The following options have special meanings:
  - **`view` -** The DOMElement to use as the new Controller's `view` property. If this isn't given, one will automatically be created.
  - **`tagName` -** The type of DOMElement to create for the Controller's `view`, or a function that returns the type. The default is "div".
  - **`id` -** The id attribute of the DOMElement to create for the Controller's `view`, or a function that returns the id.
  - **`className` -** The class attribute of the DOMElement to create for the Controller's `view`, or a function that returns the class.
  - **`attributes` -** A hash of additional attributes to add to the created DOMElement, or a functino that returns the hash.

**Collection instance properties:**

- **`view` -** A DOMElement.

**Collection instance methods:**

- **`render()` -** A noop by default. Instances should override this method to populate the contents of the Controller's view.
- **`remove()` -** Removes the `view` property from the DOM heirarchy, if it has been added to the page.

####ModelController

A controller that represents a single Model object.

**Constructor:**

- **`ModelController(model[, options, skipViewCreation])` -** Creates a new ModelController instance that represents the given `model` object, optionally passing the given `options` and `skipViewCreation` values to the superconstructor.

**Instance properties:**

- **`model` -** The Model that the ModelController represents.

**Model Integration:**

The ModelController's `render` method will automatically be called when the Model's "change" event fires. Also, the ModelController's `remove` method will be called when the Model's "destroy" event fires.

Additionally, the constructor ModelController has a method:

- **`subtype([initializer])` -** Returns a new subtype of ModelController. If `initializer` is given, it will be called during object construction _after the superconstructor_.

####CollectionController

A controller that represents a Collection.

**Constructor:**

- **`CollectionController(collection[, options, skipViewCreation])` -** Creates a new CollectionController instances that represents the given `collection`, optionally passing the given `options` and `skipViewCreation` values to the superconstructor.

**Instance properties:**

- **`collection` -** The Collection that the CollectionController represents.

**Collection Integration:**

When Models are added to the Collection represented by the CollectionController, the CollectionController will automatically create new ModelControllers for the Models and insert their views into the appropriate position within the CollectionController's view. Likewise, removing a Model from the Collection will also remove that Model's view.

###Routing

The Craven.js routing component provides a way of registering callbacks to execute whenever the browser's history changes, as well as manually updating the browser's location bar (and triggering matched routes to execute).

####Router

An object with the following methods:

- **`activate()` -** Registers Router with the window.onpopstate event, so that it can fire matching callbacks whenever the location changes.
- **`add(route, handler, context)` -** Registers a new route.
  - `route` - A string representing a URL in "/part1/:variable/part2" (etc.) format. The route is considered to be matching if all segments (delimted by slashes) are matched. Segments starting with a colon will match any string and are passed to the given handler function as arguments. Other segments must match exactly.
  - `handler` - A function to run when the route is matched.
  - `context` - The object to use as `this` when executing the `handler`.
- **`navigate(url)` -** Updates the browser's location bar to match the given URL, and executes and registered handlers that match the URL.

Polyfills
---------

In modern browsers, Craven.js has no dependencies. However, for older browsers some polyfills may be necessary. Here's some of the functionality that is used that may not be available in older browsers:

- **Array.prototype.map** ([compatibility](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map#Browser_compatibility)). Recommended polyfill: 
[es5-shim](https://github.com/kriskowal/es5-shim/) or the method listed on [MDN](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map#Compatibility).
- **DOMElement.addEventListener** ([compatibility](https://developer.mozilla.org/en-US/docs/DOM/element.addEventListener#Browser_Compatibility)). Recommended polyfill: [EventListener](https://github.com/jonathantneal/EventListener).
- **window.onpopstate / history.pushState** ([compatibility](https://developer.mozilla.org/en-US/docs/DOM/Manipulating_the_browser_history#Browser_compatibility)). Recommended polyfill: [HTML5-History-API](https://github.com/devote/HTML5-History-API)

I highly recommend using a conditional loader such as [YepNope](http://yepnopejs.com/) to load your polyfills.

License
-------

The MIT License. See LICENSE.

