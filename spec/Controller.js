var Controller = Craven.Controller;

describe('Controller', function() {
  var subject;

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

  describe('remove', function() {
    it('removes the view from the DOM', function() {
      subject = new Controller();
      document.body.appendChild(subject.view);
      expect(subject.view.parentNode).toBe(document.body);

      subject.remove();
      expect(subject.view.parentNode).toBe(null);
    });
  });

});

