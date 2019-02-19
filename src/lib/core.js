
import * as events from "./events";

export const DEFAULT_CONTROL_SIZE = 5;

export class Transform {
    /**
     * Construct a 2D transform with 6 parameters forming the matrix:
     *              __       __
     *              |  a c e  |
     *              |  b d f  |
     *              |  0 0 1  |
     *              --       --
     */
    constructor(a, b, c, d, e, f) {
        this.set(a,b,c,d,e,f);
    }

    /**
     * Resets the values of the transform matrix to the given values.
     */
    set(a, b, c, d, e, f) {
        this.a = a || 1;
        this.b = b || 0;
        this.c = c || 0;
        this.d = d || 1;
        this.e = e || 0;
        this.f = f || 0;
    }

    copy() {
        return new Transform(this.a, this.b, this.c, this.d, this.e, this.f);
    }

    /**
     * Performs ( this * another ) and returns the result as a new Transform 
     * or into the result Transform if it is provided.
     */
    multiply(another, result) {
        result = result || this;
        var a = this.a, A = another.a;
        var b = this.b, B = another.b;
        var c = this.c, C = another.C;
        var d = this.d, D = another.D;
        var e = this.e, E = another.E;
        var f = this.f, F = another.F;
        var na = a * A + c * B,   nc = a * C + c * D,    ne = a * E + c * F + e;
        var nb = b * A + d * B,   nd = b * C + d * D,    nf = b * E + d * F + f;
        result.set(na, nb, nc, nd, ne, nf);
        return result;
    }

    /**
     * Applies a translation by an offset (tx,ty) onto this Transform.
     */
    translate(E, F, result) {
        result = result || this;
        result.e = this.a * E  + this.c * F + this.e;
        result.f = this.b * E  + this.d * F + this.f;
        return result;
    }

    /**
     * Apply a rotation by a given angle (in radians) onto this Transform.
     */
    rotate(theta, result) {
        result = result || this;
        var costheta = Math.cos(theta);
        var sintheta = Math.sin(theta);
        var nx = (this.x * costheta) - (this.y * sintheta);
        var ny = (this.y * costheta) + (this.x * sintheta);
        result.x = nx;
        result.y = ny;
        return result;
    }
}

export class Point {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    move(tx, ty) {
        this.x += tx;
        this.y += ty;
        return this;
    }

    rotate(theta) {
        var costheta = Math.cos(theta);
        var sintheta = Math.sin(theta);
        var nx = (this.x * costheta) - (this.y * sintheta);
        var ny = (this.y * costheta) + (this.x * sintheta);
        this.x = nx;
        this.y = ny;
        return this;
    }

    transform(a, b, c, d, e, f) {
        var x = this.x;
        var y = this.y;
        this.x = a * x + b * y + c;
        this.y = d * x + e * y + f;
        return this;
    }
}

export class Bounds {
    constructor(configs) {
        configs = configs || {};
        this._x = configs.x || 0;
        this._y = configs.y || 0;
        this._width = configs.width || 0;
        this._height = configs.height || 0;
    }

    get innerRadius() { return Math.min(this._width, this._height) / 2.0; }
    get left() { return this._x; }
    get top() { return this._y; }
    get x() { return this._x; }
    get y() { return this._y; }
    get right() { return this._x + this._width; }
    get bottom() { return this._y + this._height; }
    get width() { return this._width; }
    get height() { return this._height; }
    get centerX() { return this._x + (this._width / 2.0) };
    get centerY() { return this._y + (this._height / 2.0) };

    set left(value) { this._x = value; }
    set top(value) { this._y = value; }
    set x(value) { this._x = value; }
    set y(value) { this._y = value; }
    set centerX(value) { this._x = value - (this._width / 2.0); }
    set centerY(value) { this._y = value - (this._height / 2.0); }
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
        configs.lineWidth = configs.lineWidth || 2;
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
            var oldValue = [ this._bounds._x, this._bounds._y ];
            var event = new events.PropertyChanged("location", oldValue, [ x, y ]);
            if (force || this.shouldTrigger(event) != false) {
                this._bounds._x = x;
                this._bounds._y = y;
                this.eventTriggered(event);
            }
        }
    }

    setCenter(x, y, force) {
        if (x != this._bounds.centerX || y != this._bounds.centerY) {
            var oldValue = [ this._bounds.midX, this._bounds.midY ];
            var event = new events.PropertyChanged("center", oldValue, [x, y]);
            if (force || this.shouldTrigger(event) != false) {
                this._bounds.midX = x;
                this._bounds.midY = y;
                this.eventTriggered(event);
            }
        }
    }

    setSize(w, h, force) {
        if (w != this._bounds._width || h != this._bounds._height) {
            var oldValue = [ this._bounds._width, this._bounds._height ];
            var event = new events.PropertyChanged("bounds", oldValue, [ w, h ]);
            if (force || this.shouldTrigger(event) != false) {
                var C2 = DEFAULT_CONTROL_SIZE + DEFAULT_CONTROL_SIZE;
                if (w > C2 && h > C2) {
                    this._bounds.width = w;
                    this._bounds.height = h;
                    this.eventTriggered(event);
                }
            }
        }
    }

    setAngle(theta, force) {
        if (theta != this._configs.angle) {
            var event = new events.PropertyChanged("angle", this.angle, theta);
            if (force || this.shouldTrigger(event) != false) {
                this._configs.angle = theta;
                this.eventTriggered(event);
            }
        }
    }

    set(property, newValue, force) {
        var oldValue = this._configs[property];
        if (oldValue != newValue) {
            event = new events.PropertyChanged(property, oldValue, newValue);
            if (force || this.shouldTrigger(event) != false) {
                this._configs[property] = newValue;
                this.eventTriggered(event);
            }
        }
        return this;
    }

    move(dx, dy, force) {
        return this.setLocation(this.bounds.x + dx, this.bounds.y + dy, force);
    }

    scale(dx, dy, force) {
        return this.setSize(this.bounds.width * dx, this.bounds.height * dy, force);
    }

    rotate(dtheta, dy, force) {
        return this.setAngle(this.angle + dtheta);
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
            if (force || this.shouldTrigger(event) != false) {
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
            if (force || this.shouldTrigger(event) != false) {
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
        if (this.parent.remove(this)) {
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

    applyTransforms(ctx) {
        if (this.get("angle")) {
            ctx.save(); 
            var cx = this.bounds.centerX;
            var cy = this.bounds.centerY;
            ctx.translate(cx, cy);
            ctx.rotate((Math.PI * this.get("angle")) / 180.0);
            ctx.translate(-cx, -cy);
        }
    }

    revertTransforms(ctx) {
        ctx.restore(); 
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

    /**
     * Returns true if this shape contains a particular coordinate, 
     * false otherwise.
     */
    containsPoint(x, y) {
        return this.bounds.containsPoint(x, y);
    }

    /**
     * Returns true if this shape intersects another bounds instance,
     * false otherwise.
     */
    intersects(anotherBounds) {
        return this.bounds.intersects(anotherBounds);
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

export class Layer extends Shape {
    draw(context) {
    }
}

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
    constructor(hitType, hitIndex, cursor) {
        this.hitType = hitType || 0;
        this.hitIndex = hitIndex || 0;
        this.cursor = cursor || "auto";
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
                return new HitInfo(HitType.SIZE, i, cursor);
            }
        }
        if (bounds.containsPoint(x, y)) {
            return new HitInfo(HitType.MOVE, 0, "move");
        }
        return null;
    }

    snapshotFor(hitInfo) {
        return this.shape.bounds.copy();
    }

    applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY) {
        var deltaX = currX - downX;
        var deltaY = currY - downY;
        console.log("Delta: ", deltaX, deltaY);
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
}

