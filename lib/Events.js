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
   * @param {string} event
   */
  trigger: function(event /* , args... */) {
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

