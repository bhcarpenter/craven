var Model = Craven.Model;
var Collection = Craven.Collection;

describe('Collection', function() {
  var subject;

  var TestModel = function(data) {
    Model.call(this, data);
  }
  TestModel.prototype = Model.Prototype();
  TestModel.prototype.attributes = ['prop1', 'prop2'];

  var models = [new TestModel, new TestModel];

  describe('constructor', function() {
    it('initializes with an empty array', function() {
      subject = new Collection(TestModel);
      expect(subject.length).toBe(0);
    });

    it('stores models passed in the constructor in order', function() {
      subject = new Collection(TestModel, models);
      expect(subject[0]).toBe(models[0]);
      expect(subject[1]).toBe(models[1]);
    });

    it('converts attribute hashes into Model objects', function() {
      var models = [{prop1: 'val1', prop2: 'val2'}];
      subject = new Collection(TestModel, models);
      expect(subject[0] instanceof TestModel).toBe(true);
      expect(subject[0].prop1).toBe(models[0].prop1);
    });
  });

  describe('mutators', function() {
    beforeEach(function() {
      subject = new Collection(TestModel, models);
      addPubSubMatchers.call(this);
    });

    describe('pop', function() {
      it('removes a Model from the end of the Collection', function() {
        expect(subject[1]).toEqual(models[1]);
        subject.pop();
        expect(subject[1]).toBeUndefined();
      });

      it('triggers a "remove" event with the removed model and it\'s previous index', function() {
        expect(function() {
          subject.pop();
        }).toTriggerEvent(subject, 'remove', function(removed, index) {
          expect(index).toBe(1);
          expect(removed[0]).toBe(models[index]);
        });
      });
    });

    describe('shift', function() {
      it('removes a Model from the beginning of the Collection', function() {
        expect(subject[1]).toEqual(models[1]);
        subject.shift();
        expect(subject[1]).toBeUndefined();
      });

      it('triggers a "remove" event with the removed model and it\'s previous index', function() {
        expect(function() {
          subject.shift();
        }).toTriggerEvent(subject, 'remove', function(removed, index) {
          expect(index).toBe(0);
          expect(removed[0]).toBe(models[index]);
        });
      });
    });

    describe('remove', function() {
      it('removes the specified Model from the Collection', function() {
        expect(subject[1]).toEqual(models[1]);
        subject.remove(models[1]);
        expect(subject.indexOf(models[1])).toBe(-1);
      });

      it('triggers a "remove" event with the removed model and it\'s previous index', function() {
        expect(function() {
          subject.remove(models[1]);
        }).toTriggerEvent(subject, 'remove', function(removed, index) {
          expect(index).toBe(1);
          expect(removed[0]).toBe(models[index]);
        });
      });
    });

    describe('removeAt', function() {
      it('removes the Model at the specified index from the Collection', function() {
        expect(subject[1]).toEqual(models[1]);
        subject.removeAt(1);
        expect(subject.indexOf(models[1])).toBe(-1);
      });

      it('triggers a "remove" event with the removed model and it\'s previous index', function() {
        expect(function() {
          subject.removeAt(1);
        }).toTriggerEvent(subject, 'remove', function(removed, index) {
          expect(index).toBe(1);
          expect(removed[0]).toBe(models[index]);
        });
      });
    });

    describe('push', function() {
      it('adds the specified model to the end of the Collection', function() {
        var model = new TestModel;
        subject.push(model);
        expect(subject[subject.length-1]).toBe(model);
      });

      it('converts attribute hashes into Model objects', function() {
        var model = {prop1: 'val1', prop2: 'val2'};
        subject.push(model);
        var added = subject[subject.length-1];
        expect(added instanceof TestModel).toBe(true);
        expect(added.prop1).toBe(model.prop1);
      });

      it('triggers an "add" event with the added model and it\'s index', function() {
        var model = new TestModel;

        expect(function() {
          subject.push(model);
        }).toTriggerEvent(subject, 'add', function(added, index) {
          expect(index).toBe(subject.length-1);
          expect(added[0]).toBe(subject[index]);
        });

      });
    });

    describe('unshift', function() {
      it('adds the specified model to the beginning of the Collection', function() {
        var model = new TestModel;
        subject.unshift(model);
        expect(subject[0]).toBe(model);
      });

      it('converts attribute hashes into Model objects', function() {
        var model = {prop1: 'val1', prop2: 'val2'};
        subject.unshift(model);
        var added = subject[0];
        expect(added instanceof TestModel).toBe(true);
        expect(added.prop1).toBe(model.prop1);
      });

      it('triggers an "add" event with the added model and it\'s index', function() {
        var model = new TestModel;

        expect(function() {
          subject.unshift(model);
        }).toTriggerEvent(subject, 'add', function(added, index) {
          expect(index).toBe(0);
          expect(added[0]).toBe(subject[index]);
        });

      });
    });

    describe('splice', function() {
      it('works like Array.prototype.splice', function() {
        var model = new TestModel;
        var model2 = new TestModel;

        subject.splice(1, 1, model, model2);

        expect(subject[1]).toBe(model);
        expect(subject[2]).toBe(model2);
      });

      it('converts attribute hashes into Model objects', function() {
        var model = {prop1: 'val1', prop2: 'val2'};
        subject.splice(0, subject.length, model);
        var added = subject[0];
        expect(added instanceof TestModel).toBe(true);
        expect(added.prop1).toBe(model.prop1);
      });

      it('triggers a "remove" if items were removed', function() {
        var model = new TestModel;

        expect(function() {
          subject.splice(1, 1);
        }).toTriggerEvent(subject, 'remove', function(removed, index) {
          expect(index).toBe(1);
          expect(removed[0]).toBe(models[index]);
        });
      });

      it('triggers an "add" if items were added', function() {
        var model = new TestModel;

        expect(function() {
          subject.splice(0, 0, model);
        }).toTriggerEvent(subject, 'add', function(added, index) {
          expect(index).toBe(0);
          expect(added[0]).toBe(subject[index]);
        });
      });
    });

    describe('reset', function() {

      it('replaces the collection with the given array', function() {
        var models = [new TestModel];
        subject.reset(models);
        expect(subject[0]).toBe(models[0]);
        expect(subject.length).toBe(1);
      });

      it('converts attribute hashes into Model objects', function() {
        var model = {prop1: 'val1', prop2: 'val2'};
        subject.reset([model]);
        var added = subject[0];
        expect(added instanceof TestModel).toBe(true);
        expect(added.prop1).toBe(model.prop1);
      });

      it('triggers a "reset" event with the removed Models', function() {
        var newModels = [new TestModel];

        expect(function() {
          subject.reset(newModels);
        }).toTriggerEvent(subject, 'reset', function(old) {
          expect(old[0]).toBe(models[0]);
        });
      });

    });

  }); // mutators

  it('automatically removes destroyed Models', function() {
    subject = new Collection(TestModel, models);
    models[0].destroy();
    expect(subject[0]).toBe(models[1]);
  });

}); // Collection

