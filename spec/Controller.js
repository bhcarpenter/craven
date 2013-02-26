var Controller = Craven.Controller;
var Model = Craven.Model;

describe('Controller', function() {
  var subject;

  var SubController = function() { Controller.apply(this, arguments) };
  SubController.prototype = Controller.Prototype();
  SubController.prototype.render = function() {}

  function triggerDOMEvent(node, event) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true); // event type,bubbling,cancelable
    node.dispatchEvent(evt);
  }

  it('saves options passed to the constructor', function() {
    subject = new Controller({prop1: 'value1'});
    expect(subject.prop1).toBe('value1');
  });

  it('creates a view from options if one isn\'t given', function() {
    subject = new Controller({
      tagName: 'P',
      attributes: {
        id: 'testID',
        className: 'myClass',
        custom: 'customVal'
      }
    });

    expect(subject.view.tagName).toBe('P');
    expect(subject.view.id).toBe('testID');
    expect(subject.view.className).toBe('myClass');
    expect(subject.view.custom).toBe('customVal');
  });

  it('binds to the events specified by the `events` options', function() {
    var model = new Model();

    spyOn(SubController.prototype, 'render');

    subject = new SubController({
      model: model,
      events: { 'update': 'render' }
    });

    model.trigger('update');
    expect(subject.render).toHaveBeenCalled()
  });

  it('binds to the DOM events specified by the `domEvents` options', function() {
    var model = new Model();

    spyOn(SubController.prototype, 'render');

    subject = new SubController({
      model: model,
      domEvents: { 
        click: {
          '': 'render' 
        }
      }
    });

    triggerDOMEvent(subject.view, 'click');
    expect(subject.render).toHaveBeenCalled()
  });

  // TODO: figure out how to test this.
  //it('uses event delegation for `domEvents`', function() {
  //});

  describe('remove', function() {
    it('removes the view from the DOM', function() {
      subject = new Controller();
      document.body.appendChild(subject.view);
      expect(subject.view.parentNode).toBe(document.body);

      subject.remove();
      expect(subject.view.parentNode).toBe(null);
    });

    it('unbinds from model events', function() {
      var model = new Model();

      spyOn(SubController.prototype, 'render');

      subject = new SubController({
        model: model,
        events: { 'update': 'render' }
      });
      subject.remove();

      model.trigger('update');
      expect(subject.render).not.toHaveBeenCalled()
    });

    it('unbinds the DOM events', function() {
      var model = new Model();

      spyOn(SubController.prototype, 'render');

      subject = new SubController({
        model: model,
        domEvents: { 
          click: {
            '': 'render' 
          }
        }
      });
      subject.remove();

      triggerDOMEvent(subject.view, 'click');
      expect(subject.render).not.toHaveBeenCalled()
    });
  });

});

