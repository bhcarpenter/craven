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

