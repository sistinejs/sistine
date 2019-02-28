
import * as events from "./events"
import * as geom from "./geom"
import * as shapes from "./shapes"

export class Layer extends shapes.Shape { }

/**
 * The Scene is the raw model where all layers and shapes are 
 * managed.  As far as possible this does not perform any view 
 * related operations as that is decoupled into the view entity.
 */
export class Scene extends events.EventDispatcher {
    constructor(configs) {
        super();
        configs = configs || {};
        this._bounds = configs.bounds || new geom.Bounds();
        this._layers = []
        this.addLayer();
        this._selectedLayer = 0;
    }

    get bounds() { return this._bounds; }

    layerAtIndex(index) {
        return this._layers[index];
    }

    get layers() {
        return this._layers;
    }

    get layerCount() {
        return this._layers.length;
    }

    get selectedLayer() {
        return this._selectedLayer;
    }

    set selectedLayer(index) {
        if (index != this._selectedLayer) {
            if (index >= 0 && index < this.layerCount) {
                this._selectedLayer = index;
            }
        }
    }

    add(shape) {
        return this._layers[this.selectedLayer].add(shape);
    }

    addLayer() {
        return this.insertLayer(-1);
    }

    removeLayer(index) {
        var layer = this._layers[index];
        layer.scene = null;
        this._layers.splice(index, 1);
        return layer;
    }

    insertLayer(index) {
        var layer = new Layer();
        layer.scene = this;
        if (index < 0) {
            this._layers.push(layer);
        } else {
            this._layers.splice(index, 0, layer);
        }
        return layer;
    }
}
