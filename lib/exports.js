// Closure compiler exports
var Craven = {};
window['Craven'] = Craven;

Craven['Events'] = Events;
Events['on'] = Events.on;
Events['off'] = Events.off;
Events['trigger'] = Events.trigger;

Craven['Model'] = Model;
Model['subtype'] = Model.subtype;
Model.prototype['reset'] = Model.prototype.reset;
Model.prototype['update'] = Model.prototype.update;
Model.prototype['toJSON'] = Model.prototype.toJSON;
Model.prototype['validate'] = Model.prototype.validate;
Model.prototype['save'] = Model.prototype.save;
Model.prototype['destroy'] = Model.prototype.destroy;
Model.prototype['on'] = Model.prototype.on;
Model.prototype['off'] = Model.prototype.off;
Model.prototype['trigger'] = Model.prototype.trigger;

Craven['Collection'] = Collection;
Collection.prototype['reset'] = Collection.prototype.reset;
Collection.prototype['remove'] = Collection.prototype.remove;
Collection.prototype['removeAt'] = Collection.prototype.removeAt;
Collection.prototype['on'] = Collection.prototype.on;
Collection.prototype['off'] = Collection.prototype.off;
Collection.prototype['trigger'] = Collection.prototype.trigger;

Craven['Controller'] = Controller;
Controller.prototype['render'] = Controller.prototype.render;
Controller.prototype['remove'] = Controller.prototype.remove;

Craven['ModelController'] = ModelController;
Craven['CollectionController'] = CollectionController;

Craven['Router'] = Router;
Router['add'] = Router.add;
Router['activate'] = Router.activate;
Router['navigate'] = Router.navigate;

