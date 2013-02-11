// We can't actually run these tests locally.
if ('file://' !== location.origin) {
  var Router = Craven.Router;
  describe('Router', function() {

    Router.activate();

    describe('navigate', function() {
      it('fires the callback that matches the given URL',  function() {
        var mock = { handler: function(param1) { expect(param1).toBe('val1'); } };
        spyOn(mock, 'handler');
        Router.add('/test/:blerg', mock.handler);
        Router.navigate('/test/val1');
        expect(mock.handler).toHaveBeenCalled();
        Router.navigate('/SpecRunner.html');
      });

      it('updates the browser\'s location bar', function() {
        Router.navigate('/test/val1');
        expect(window.location.pathname).toBe('/test/val1');
        Router.navigate('/SpecRunner.html');
      });
    });

    describe('onpopstate', function() {
      it('fires the callback that matches the new URL', function() {
        var mock = { handler: function() { console.log('test'); } };
        spyOn(mock, 'handler');
        Router.add('/SpecRunner\.html', mock.handler);
        window.dispatchEvent(document.createEvent('PopStateEvent'));
        expect(mock.handler).toHaveBeenCalled();
      });
    });

  });
}

