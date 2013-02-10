var Events = Craven.Events;

describe('Events', function() {
  var subject;

  var Test = function() {};
  Test.prototype.on = Events.on;
  Test.prototype.off = Events.off;
  Test.prototype.trigger = Events.trigger;

  beforeEach(function() {
    addPubSubMatchers.call(this);
    subject = new Test();
  });
  
  it('triggers an event handler set with the given context', function() {
    var context = {
      handler: function() {
        expect(this).toBe(context);
      }
    };
    spyOn(context, 'handler');

    subject.on('event', context.handler, context);
    subject.trigger('event');
    expect(context.handler).toHaveBeenCalled();
  });

  it('doesn\'t trigger an event handler that has been unset', function() {
    var context = { handler: function() {} };
    spyOn(context, 'handler');

    subject.on('event', context.handler, context);
    subject.off('event', context.handler, context);
    subject.trigger('event');
    expect(context.handler).not.toHaveBeenCalled();
  });

  it('doesn\'t break if an event handler removes itself during execution', function() {
    var context = {
      handler: function() {
        subject.off('event', context.handler, context);
      }
    };
    spyOn(context, 'handler');

    subject.on('event', context.handler, context);
    subject.trigger('event');
    expect(context.handler).toHaveBeenCalled();
  });

});

