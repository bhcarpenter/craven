var Model = Craven.Model;

describe('Model', function() {
  var subject;
  var sampleAttributes = { attr1: 'value1', attr2: 'value2' };
  Model.prototype.attributes = ['attr1'];

  describe('constructor', function() {
    beforeEach(function() {
      subject = new Model(sampleAttributes);
    });

    it('populates attributes listed in "attributes" when a hash is passed', function() {
      expect(subject.attr1).toBe(sampleAttributes.attr1);
    });

    it('ignores attributes not listed in "attributes" when a hash is passed', function() {
      expect(subject.attr2).toBeUndefined();
    });
  });

  describe('toJSON', function() {
    it('generates a hash containing all values that are listed in "attributes"', function() {
      subject = new Model(sampleAttributes);

      var data = subject.toJSON();
      expect(data.attr1).toBe(sampleAttributes.attr1);
      expect(data.attr2).toBeUndefined();
    });

    it('returns values assigned since the latest create, save, or reset', function() {
      subject = new Model({ attr1: 'value1' });
      subject.attr1 = 'value2';

      var data = subject.toJSON();
      expect(data.attr1).toBe(subject.attr1);
    });
  });

  describe('reset', function() {
    it('replaces all values listed in "attributes"', function() {
      subject = new Model();

      var newData = { attr1: subject.attr1+'update', attr2: 'value2' };
      subject.reset(newData);

      expect(subject.attr1).toBe(newData.attr1);
      expect(subject.attr2).toBeUndefined();
    });
  });

  describe('update', function() {
    it('updates properties listed in "attributes"', function() {
      subject = new Model();
      var newData = { attr1: subject.attr1+'update' };
      subject.update(newData);
      expect(subject.attr1).toBe(newData.attr1);
    });

    it('ignores properties not listed in "attributes"', function() {
      subject = new Model();
      var newData = { attr2: 'value2' };
      subject.update(newData);
      expect(subject.attr2).toBeUndefined();
    });
  });

  describe('save', function() {
    beforeEach(function() {
      addPubSubMatchers.call(this);
      subject = new Model({ attr1: 'value1' });
    });

    it('triggers a change event with updated attributes and original values if attributes were updated', function() {
      subject.attr1 = 'value2';

      expect(function() {
        subject.save();
      }).toTriggerEvent(subject, 'change', function(changed, old) {
        expect(changed.attr1).toBe('value2');
        expect(old.attr1).toBe('value1');
      });

    });

    it('doesn\'t trigger a change event if no attributes were updated', function() {
      expect(function() {
        subject.save();
      }).not.toTriggerEvent(subject, 'change');
    });

    it('doesn\'t trigger a change event if validation fails', function() {
      subject.validate = function() { return false; }
      subject.attr1 = 'value2';

      expect(function() {
        subject.save();
      }).not.toTriggerEvent(subject, 'change');
    });
  });

});

