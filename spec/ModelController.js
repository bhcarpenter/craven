var Model = Craven.Model;
var ModelController = Craven.ModelController;

describe('ModelController', function() {
  var subject;
  var model;

  var TestModel = function(data) {
    Model.call(this, data);
  }
  TestModel.prototype = Model.Prototype();
  TestModel.prototype.attributes = ['prop1', 'prop2'];

  beforeEach(function() {
    addPubSubMatchers.call(this);
    model = new TestModel();
    subject = new ModelController(model);
  });

  it('rerenders itself when the model is changed', function() {
    spyOn(subject, 'render');
    model.prop1 = 'val1';
    model.save();
    expect(subject.render).toHaveBeenCalled();
  });

  it('removes itself from the DOM when the model is destroyed', function() {
    spyOn(subject, 'remove');
    model.destroy();
    expect(subject.remove).toHaveBeenCalled();
  });

});

