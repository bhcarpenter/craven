// Matchers to validate MiniPubSub events

function addPubSubMatchers() {

  this.addMatchers({

    toTriggerEvent: function(object, event, handler) {
      this.message = function() {
        return [
          "Expected  " + event + " to have been triggered.",
          "Expected " + event + " not to have been triggered."
        ];
      };

      handler = handler || function() {};

      // Spy
      var mock = { handler: handler };
      spyOn(mock, 'handler');

      // Bind to the subject.
      object.on(event, mock.handler);

      this.actual();

      return mock.handler.wasCalled;
    }

  });

}

