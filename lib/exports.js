// Closure compiler exports
var Craven = {};
window['Craven'] = Craven;

Craven['Events'] = Events;

Craven['Model'] = Model;
Model['Prototype'] = Model.Prototype;
Model.prototype['reset'] = Model.prototype.reset;
Model.prototype['update'] = Model.prototype.update;
Model.prototype['toJSON'] = Model.prototype.toJSON;
Model.prototype['validate'] = Model.prototype.validate;
Model.prototype['save'] = Model.prototype.save;
Model.prototype['destroy'] = Model.prototype.destroy;

Craven['Collection'] = Collection;
Collection['Prototype'] = Collection.Prototype;
Collection.prototype['reset'] = Collection.prototype.reset;
Collection.prototype['remove'] = Collection.prototype.remove;
Collection.prototype['removeAt'] = Collection.prototype.removeAt;

Craven['Controller'] = Controller;
Controller['Prototype'] = Controller.Prototype;
Controller.prototype['render'] = Controller.prototype.render;
Controller.prototype['remove'] = Controller.prototype.remove;

Craven['ModelController'] = ModelController;
ModelController['Prototype'] = ModelController.Prototype;

Craven['CollectionController'] = CollectionController;
CollectionController['Prototype'] = CollectionController.Prototype;

Craven['Router'] = Router;
Router['add'] = Router.add;
Router['activate'] = Router.activate;
Router['navigate'] = Router.navigate;

