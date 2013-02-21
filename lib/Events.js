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

