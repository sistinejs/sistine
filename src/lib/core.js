
import * as events from "./events";

export const DEFAULT_CONTROL_SIZE = 5;

export class Bounds {
    constructor(configs) {
        configs = configs || {};
        this._x = configs.x || 0;
        this._y = configs.y || 0;
        this._width = configs.width || 0;
        this._height = configs.height || 0;
    }

    get left() { return this._x; }
    get top() { return this._y; }
    get x() { return this._x; }
    get y() { return this._y; }
    get right() { return this._x + this._width; }
    get bottom() { return this._y + this._height; }
    get width() { return this._width; }
    get height() { return this._height; }
    get midX() { return this._x + (this._width / 2.0) };
    get midY() { return this._y + (this._height / 2.0) };

    set left(value) { this._x = value; }
    set top(value) { this._y = value; }
    set x(value) { this._x = value; }
    set y(value) { this._y = value; }
    set right(value) { this._width = value - this._x; }
    set bottom(value) { this._height = value - this._y; }
    set width(value) { this._width = value; }
    set height(value) { this._height = value; }

    copy() {
        return new Bounds({'x': this.left, 'y': this.top, 'width': this.width, 'height': this.height});
    }

    /**
     * Returns true if this shape contains a particular coordinate, 
     * false otherwise.
     */
    containsPoint(x, y) {
        return  x >= this._x && x <= this.right && 
                y >= this._y && y <= this.bottom;
    }

    /**
     * Returns true if this bounds instance intersects another 
     * bounds instance, false otherwise.
     */
    intersects(anotherBounds) {
        if (anotherBounds == null) return true;
        return true;
        return this.bounds.intersects(anotherBounds);
    }
}

const ShapeGlobals = {
    _shapeCounter: 1
}

/**
 * Holds information about the instance of a shape.
 */
export class Shape {
    constructor(configs) {
        configs = configs || {};
        this.id = ShapeGlobals._shapeCounter++;
        this.parent = null;
        this._configs = configs;
        configs.name = configs.name || "";
        configs.angle = configs.angle || 0;
        configs.zIndex = configs.zIndex || 0;
        this._prev = this._next = null;
        this._bounds = new Bounds(configs)
        this._scene = null;
        this._children = [];
        this._connections = [];
        this._controller = null;
    }

    get controller() {
        return this._controller;
    }

    setLocation(x, y, force) {
        if (x != this._bounds._x || y != this._bounds._y) {
            var event = new events.LocationChanged(this._bounds._x, this._bounds._y, x, y);
            if (force || this.shouldTrigger(event)) {
                var oldvalue = [ this._bounds._x, this._bounds._y ];
                this._bounds._x = x;
                this._bounds._y = y;
                this.eventTriggered(event);
            }
        }
    }

    setSize(w, h, force) {
        if (w != this._bounds._width || h != this._bounds._height) {
            var event = new events.SizeChanged(this._bounds._width, this._bounds._height, w, h);
            if (force || this.shouldTrigger(event)) {
                var C2 = DEFAULT_CONTROL_SIZE + DEFAULT_CONTROL_SIZE;
                if (w > C2 && h > C2) {
                    this._bounds.width = w;
                    this._bounds.height = h;
                    this.eventTriggered(event);
                }
            }
        }
    }

    set(property, newValue, force) {
        var oldvalue = this._configs[property];
        if (oldvalue != newvalue) {
            event = new events.PropertyChanged(property, oldvalue, newvalue);
            if (force || this.shouldTrigger(event)) {
                this._configs[config] = newvalue;
                this.eventTriggered(event);
            }
        }
        return this;
    }

    get(name) {
        return this._configs[name];
    }

    get bounds() { return this._bounds; }
    get name() { return this.get("name"); }
    get angle() { return this.get("angle"); }
    get zIndex() { return this.get("zIndex"); }
    get lineWidth() { return this.get("lineWidth"); }
    get lineJoin() { return this.get("lineJoin"); }
    get lineCap() { return this.get("lineCap"); }
    get strokeStyle() { return this.get("strokeStyle"); }
    get fillStyle() { return this.get("fillStyle"); }
    get miterLimit() { return this.get("miterLimit"); }

    get scene() {
        return this._scene;
    }

    set scene(s) {
        if (this.scene != s) {
            this._scene = s;
            for (var i = 0, L = this._children.length;i < L;i++) {
                this._children[i].scene = s;
            }
        }
    }

    /**
     * Adds a new shape to this group.
     * Returns true if a shape was successfully added
     * false if the addition was blocked.
     */
    add(shape, force) {
        if (shape.parent != this) {
            var event = new events.ShapeAdded(this, shape);
            if (force || this.shouldTrigger(event)) {
                // remove from old parent - Important!
                if (shape.removeFromParent()) {
                    this._children.push(shape);
                    shape.parent = this;
                    shape.scene = this.scene;
                    this.eventTriggered(event);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Removes an existing shape from this group.
     * Returns true if a shape was successfully removed,
     * false if the removal was blocked.
     */
    remove(shape, force) {
        if (shape.parent == this) {
            var event = new events.ShapeRemoved(this, shape);
            if (force || this.shouldTrigger(event)) {
                for (var i = 0;i < this._children.length;i++) {
                    if (this._children[i] == shape) {
                        this._children.splice(i, 1);
                        shape.parent = null;
                        this.eventTriggered(event);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    removeFromParent() {
        if (this.parent == null) return true;
        if (this.parent.remove(shape)) {
            this.parent = null;
            return true;
        }
        return false;
    }

    /**
     * Draws this shape on a given context.
     */
    applyStyles(ctx, options) {
        if (this.get("fillStyle")) {
            ctx.fillStyle = this.get("fillStyle");
        }
        if (this.get("lineJoin")) {
            ctx.lineJoin = this.get("lineJoin");
        }
        if (this.get("lineCap")) {
            ctx.lineCap = this.get("lineCap");
        }
        if (this.get("lineWidth")) {
            ctx.lineWidth = this.get("lineWidth");
        }
        if (this.get("strokeStyle")) {
            ctx.strokeStyle = this.get("strokeStyle");
        }
    }

    drawControls(ctx, options) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(this.bounds.left, this.bounds.top, this.bounds.width, this.bounds.height);

        var l = this.bounds.left;
        var r = this.bounds.right;
        var t = this.bounds.top;
        var b = this.bounds.bottom;
        var sizePoints = [
            [l, t],
            [(l + r) / 2, t],
            [r, t],
            [r, (t + b) / 2],
            [r, b],
            [(l + r) / 2, b],
            [l, b],
            [l, (t + b) / 2]
        ]
        for (var i = sizePoints.length - 1;i >= 0;i--) {
            var px = sizePoints[i][0];
            var py = sizePoints[i][1];
            ctx.strokeRect(px - DEFAULT_CONTROL_SIZE, py - DEFAULT_CONTROL_SIZE,
                           DEFAULT_CONTROL_SIZE + DEFAULT_CONTROL_SIZE,
                           DEFAULT_CONTROL_SIZE + DEFAULT_CONTROL_SIZE);
        }
    }

    // Event handling
    /**
     * All events are syncronous and follow a "shouldTriggerX" followed by a 
     * "triggerX" call.  This is a chance for listeners to "prevent" the sending 
     * of the event there by preventing a certain change that may be going on.
     */
    shouldTrigger(event) {
        // TODO: Currently we are using a Scene as a single "broker" for our 
        // events.  But this could be inefficient based on patterns.  So
        // at some point we may want to have multiple "brokers" we want to use
        // to optimise for different cases, eg:
        // Many listeners for same kind of event
        // Many listeners for all events on a single shape only
        // Many listeners for all events etc.
        if (this.scene) {
            event.source = this;
            var out = true;
            if (this._controller)
                out = this._controller.shouldTrigger(event) != false;
            return out && (this.scene.shouldTrigger(event) != false);
        }
        return true;
    }

    /**
     * This is called after a particular change has been approved to notify that a change has
     * indeed gone through.
     */
    eventTriggered(event) {
        if (this.scene) {
            event.source = this;
            var out = this.scene.eventTriggered(event) != false;
            if (this._controller) 
                out = out && (this._controller.eventTriggered(event) != false);
            return out;
        }
    }
}

export class Layer extends Shape { }

/**
 * The Scene is the raw model where all layers and shapes are 
 * managed.  As far as possible this does not perform any view 
 * related operations as that is decoupled into the view entity.
 */
export class Scene extends events.EventHandler {
    constructor(configs) {
        super();
        configs = configs || {};
        this._bounds = configs.bounds || new Bounds();
        this._layers = []
        this.addLayer();
        this._selectedLayer = 0;
        this._eventHandlers = [];
    }

    addHandler(handler) {
        var i = this._eventHandlers.indexOf(handler);
        if (i < 0) {
            this._eventHandlers.push(handler);
        }
    }

    removeHandler(handler) {
        var i = this._eventHandlers.indexOf(handler);
        if (i >= 0) {
            this._eventHandlers.splice(i, 1);
        }
    }

    get bounds() { return this._bounds; }

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

    // Event handling
    /**
     * All events are syncronous and follow a "shouldTriggerX" followed by a 
     * "triggerX" call.  This is a chance for listeners to "prevent" the sending 
     * of the event there by preventing a certain change that may be going on.
     */
    shouldTrigger(event) {
        for (var i = 0, L = this._eventHandlers.length;i < L;i++) {
            if (!this._eventHandlers[i].shouldTrigger(event)) {
                return false;
            }
        }
        return true;
    }

    /**
     * This is called after a particular change has been approved to notify that 
     * a change has indeed gone through.
     */
    eventTriggered(event) {
        for (var i = 0, L = this._eventHandlers.length;i < L;i++) {
            this._eventHandlers[i].eventTriggered(event);
        }
    }
}

/////////////// Controllers 

export const HitType = {
    MOVE: 0,
    SIZE: 1,
    CONTROL: 2,

    SIZE_N: 0,
    SIZE_NE: 1,
    SIZE_E: 2,
    SIZE_SE: 3,
    SIZE_S: 4,
    SIZE_SW: 5,
    SIZE_W: 6,
    SIZE_NW: 7,
}

export class HitInfo {
    constructor(shape, hitType, hitIndex, cursor, savedInfo) {
        this.shape = shape;
        this.hitType = hitType || 0;
        this.hitIndex = hitIndex || 0;
        this.cursor = cursor || "auto";
        this.savedInfo = savedInfo || {};
    }
}

/**
 * ShapeControllers provide information needed to facilitate updates to a shape as 
 * well as in accepting events to make updates to shapes.
 */
export class ShapeController extends events.EventHandler {
    constructor(shape) {
        super();
        this._shape = shape;
    }

    get shape() {
        return this._shape;
    }

    /**
     * This is called after a particular change has been approved to notify that a change has
     * indeed gone through.
     */
    eventTriggered(event) {
        if (this.shape == event.source) {
        }
    }

    /**
     * Returns the "topmost" shape that can be hit at a given coordinate.
     */
    getHitInfo(x, y) {
        var bounds = this.shape.bounds;
        var l = bounds.left;
        var r = bounds.right;
        var t = bounds.top;
        var b = bounds.bottom;
        var sizePoints = [
            [[(l + r) / 2, t], "n-resize"],
            [[r, t], "ne-resize"],
            [[r, (t + b) / 2], "e-resize"],
            [[r, b], "se-resize"],
            [[(l + r) / 2, b], "s-resize"],
            [[l, b], "sw-resize"],
            [[l, (t + b) / 2], "w-resize"],
            [[l, t], "nw-resize"],
        ]
        for (var i in sizePoints) {
            var hti = sizePoints[i];
            var px = hti[0][0];
            var py = hti[0][1];
            var cursor = hti[1];
            if (x >= px - DEFAULT_CONTROL_SIZE && x <= px + DEFAULT_CONTROL_SIZE &&
                y >= py - DEFAULT_CONTROL_SIZE && y <= py + DEFAULT_CONTROL_SIZE) {
                return new HitInfo(this.shape, HitType.SIZE, i, cursor, bounds.copy());
            }
        }
        if (bounds.containsPoint(x, y)) {
            return new HitInfo(this.shape, HitType.MOVE, 0, "move", bounds.copy());
        }
        return null;
    }

    applyHitChanges(hitInfo, downX, downY, currX, currY) {
        var savedInfo = hitInfo.savedInfo;
        var deltaX = currX - downX;
        var deltaY = currY - downY;
        var shape = this.shape;
        if (hitInfo.hitType == HitType.MOVE) {
            shape.setLocation(savedInfo.left + deltaX, savedInfo.top + deltaY);
        } else if (hitInfo.hitType == HitType.SIZE) {
            var newTop = savedInfo.top;
            var newLeft = savedInfo.left;
            var newHeight = savedInfo.height;
            var newWidth = savedInfo.width;
            if (hitInfo.hitIndex == HitType.SIZE_N) {
                newHeight -= deltaY;
                newTop += deltaY;
            } else if (hitInfo.hitIndex == HitType.SIZE_NE) {
                newHeight -= deltaY;
                newWidth += deltaX;
                newTop += deltaY;
            } else if (hitInfo.hitIndex == HitType.SIZE_E) {
                newWidth += deltaX;
            } else if (hitInfo.hitIndex == HitType.SIZE_SE) {
                newHeight += deltaY;
                newWidth += deltaX;
            } else if (hitInfo.hitIndex == HitType.SIZE_S) {
                newHeight += deltaY;
            } else if (hitInfo.hitIndex == HitType.SIZE_SW) {
                newHeight += deltaY;
                newWidth -= deltaX;
                newLeft += deltaX;
            } else if (hitInfo.hitIndex == HitType.SIZE_W) {
                newLeft += deltaX;
                newWidth -= deltaX;
            } else if (hitInfo.hitIndex == HitType.SIZE_NW) {
                newHeight -= deltaY;
                newTop += deltaY;
                newLeft += deltaX;
                newWidth -= deltaX;
            }
            shape.setLocation(newLeft, newTop);
            shape.setSize(newWidth, newHeight);
        } else if (hitInfo.hitType == HitType.CONTROL) {
        }
    }


    /**
     * Returns true if this shape contains a particular coordinate, 
     * false otherwise.
     */
    containsPoint(x, y) {
        return this.shape.bounds.containsPoint(x, y);
    }

    /**
     * Returns true if this shape intersects another bounds instance,
     * false otherwise.
     */
    intersects(anotherBounds) {
        return this.shape.bounds.intersects(anotherBounds);
    }
}

