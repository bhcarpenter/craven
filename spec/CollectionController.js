var Model = Craven.Model;
var Collection = Craven.Collection;
var CollectionController = Craven.CollectionController;

describe('CollectionController', function() {
  var subject;
  var collection;

  beforeEach(function() {
    collection = new Collection(Model);
    subject = new CollectionController(collection);
  });

  it('automatically inserts views for added models into the DOM', function() {
    collection.push({});
    expect(subject.view.children.length).toBe(1);
  });

  it('automatically removes views from removed models from the DOM', function() {
    collection.push({});
    collection.pop();
    expect(subject.view.children.length).toBe(0);
  });

});

