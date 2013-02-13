var Model = Craven.Model;
var ModelContrller = Craven.ModelController;
var Collection = Craven.Collection;
var CollectionController = Craven.CollectionController;

describe('CollectionController', function() {
  var subject;
  var collection;

  var TestModelController = ModelController.subtype();
  TestModelController.prototype.tagName = 'P';

  beforeEach(function() {
    collection = new Collection(Model);
    subject = new CollectionController(collection);
    subject.modelControllerType = TestModelController;
  });

  it('automatically inserts views for added models into the DOM', function() {
    collection.push({});
    expect(subject.view.children.length).toBe(1);
    expect(subject.view.firstChild.tagName).toBe('P');
  });

  it('automatically removes views from removed models from the DOM', function() {
    collection.push({});
    collection.pop();
    expect(subject.view.children.length).toBe(0);
  });

});

