
import * as events from "./events";
import * as geom from "./geom";
import * as geomutils from "../Utils/geom";
import * as styles from "./styles";
import * as controller from "./controller";

export const DEFAULT_CONTROL_SIZE = 5;

export const EV_PROPERTY_CHANGED = 0;
export const EV_SHAPE_ADDED = 1;
export const EV_SHAPE_REMOVED = 2;

const ShapeGlobals = {
    _shapeCounter: 1
}

/**
 * Holds information about the instance of a shape.
 */
export class Shape extends events.EventSource {
    constructor(configs) {
        super();
        configs = configs || {};
        this.id = ShapeGlobals._shapeCounter++;
        this._scene = null;
        this._parent = null;
        this.isGroup = false;
        this.isVisible = true;
        this._children = [];
        this._globalTransform = new geom.Transform();
        this._lastTransformed = Date.now();
        this.controlSize = DEFAULT_CONTROL_SIZE;

        this._bounds = new geom.Bounds(configs)
        // The reference width and height denote the "original" width and height
        // for this shape and is used as a way to know what the current "scale" is.
        this._refWidth = this._bounds.width;
        this._refHeight = this._bounds.height;
        this.controller = new controller.ShapeController(this);

        // Observable properties
        this.name = configs.name || this.className;
        this.angle = configs.angle || 0;
        this.scale = configs.scale || new geom.Point(1, 1);
        this.zIndex = configs.zIndex || 0;
        this.lineWidth = configs.lineWidth || 2;
        this.lineJoin = configs.lineJoin || null;
        this.lineCap = configs.lineCap || null;
        this.miterLimit = configs.miterLimit || null;
        this.fillStyle = configs.fillStyle || null;
        this.strokeStyle = configs.strokeStyle || null;
    }

    childAtIndex(i) { return this._children[i]; } 
    get hasChildren() { return this._children.length > 0; } 
    get childCount() { return this._children.length; } 
    get parent() { return this._parent; } 
    get bounds() { return this._bounds; }
    get scene() { return this._scene; } 
    get controller() { return this._controller; }

    // Observable Properties that will trigger change events
    get name() { return this._name; }
    set name(value) { return this.set("name", value); }

    get angle() { return this._angle; }
    set angle(value) { return this.set("angle", value); }

    get zIndex() { return this._zIndex; }
    set zIndex(value) { return this.set("zIndex", value); }

    get lineWidth() { return this._lineWidth; }
    set lineWidth(value) { return this.set("lineWidth", value); }

    get lineJoin() { return this._lineJoin; }
    set lineJoin(value) { return this.set("lineJoin", value); }

    get lineCap() { return this._lineCap; }
    set lineCap(value) { return this.set("lineCap", value); }

    get miterLimit() { return this._miterLimit; }
    set miterLimit(value) { return this.set("miterLimit", value); }

    get strokeStyle() { return this._strokeStyle; }
    set strokeStyle(value) { 
        if (value != null && typeof value === "string") {
            value = new styles.Literal(value);
        }
        return this.set("strokeStyle", value); 
    }

    get fillStyle() { return this._fillStyle; }
    set fillStyle(value) { 
        if (value != null && typeof value === "string") {
            value = new styles.Literal(value);
        }
        return this.set("fillStyle", value); 
    }

    /**
    * There are two ways to handle coordinates.  Globally or Locally
    * In Global method, a global coordinate (say on the screen) remains as is
    * and each element on the screen can tell you if a given global point 
    * lies within itself.   This is great when we are doing things like
    * handling mouse/touch hits to see where a global point falls within 
    * a shape.
    *
    * In the local method, the global coordinates are converted into a 
    * local system each time it is needed.  This way the shape does not need to know about screen coordinates and transformations etc.
    *
    * The second method is easier from the Shape's perspective but the global 
    * point has to be transformed through each parent in the hierarchy while doing a hit test.
    *
    * With the first method, a global transform change on a parent will modify the global transform parameter for all its children.   So if we expect transformations to be small enough making this parameter change in all children is not bad.
    *
    * But a transform could happen either via animation or via ui controls, so if a high refresh rate is required a tree walk to update this parameter could be expensive.  Instead updating on read could be a better option by seeing if a parent's transform has changed and only updating if the timestamp is newer.
    */
    get globalTransform() {
        var gt = this._globalTransform;
        if (this._parent != null) {
            var pt = this._parent.globalTransform;
            if (pt.timeStamp > gt.timeStamp ||
                this._lastTransformed > gt.timeStamp) {
                // updated ourselves
                this._globalTransform = this._updateTransform(pt.copy());
            }
        } else if (this._lastTransformed > gt.timeStamp) {
            this._globalTransform = this._updateTransform();
        }
        return this._globalTransform;
    }
    _updateTransform(result) {
        result = result || new geom.Transform();
        var cx = this._bounds.centerX;
        var cy = this._bounds.centerY;
        // Notice we are doing "invserse transforms here"
        // since we need to map a point "back" to global form
        result.translate(cx, cy)
              .rotate(- this.angle)
              .scale(1.0 / this.scale.x, 1.0 / this.scale.y)
              .translate(-cx, -cy);
        console.log("updated transform: ", this, result);
        return result;
    }

    set controller(c) {
        if (this._controller != c) {
            this._controller = c;
        }
    }

    set scene(s) {
        if (this._scene != s) {
            // unchain previous scene
            if (this._scene) {
                this._eventHub.unchain(this._scene.eventHub);
            }
            this._scene = s;
            if (this._scene) {
                this._eventHub.chain(this._scene.eventHub);
            }
            for (var i = 0, L = this._children.length;i < L;i++) {
                this._children[i].scene = s;
            }
        }
    }

    forEachChild(handler, self, mutable) {
        var shapes = this._children;
        if (mutable == true) {
            shapes = shapes.slice(0, shapes.length);
        }
        for (var index in shapes) {
            var shape = shapes[index];
            if (handler(shape, index, self) == false)
                break;
        }
    }

    canSetProperty(property, newValue) {
        var oldValue = this["_" + property];
        if (oldValue == newValue) 
            return null;
        var event = new events.PropertyChanged(this, property, oldValue, newValue);
        if (this.validateBefore("PropertyChanged:" + property, event) == false)
            return null;
        return event;
    }

    set(property, newValue) {
        var event = this.canSetProperty(property, newValue);
        if (event == null)
            return false;
        this["_" + property] = newValue;
        this.triggerOn("PropertyChanged:" + property, event);
        return true;
    }

    canSetLocation(x, y) {
        if (x == this._bounds._x && y == this._bounds._y)
            return null;
        var oldValue = [ this._bounds._x, this._bounds._y ];
        var event = new events.PropertyChanged(this, "location", oldValue, [ x, y ]);
        if (this.validateBefore("PropertyChanged:location", event) == false) 
            return null;
        return event;
    }

    setLocation(x, y) {
        var event = this.canSetLocation(x, y);
        if (event == null) return false;
        this._bounds._x = x;
        this._bounds._y = y;
        this._lastTransformed = Date.now();
        this.triggerOn("PropertyChanged:location", event);
        return true;
    }

    canSetCenter(x, y) {
        if (x == this._bounds.centerX && y == this._bounds.centerY)
            return null;
        var oldValue = [ this._bounds.midX, this._bounds.midY ];
        var event = new events.PropertyChanged(this, "center", oldValue, [x, y]);
        if (this.validateBefore("PropertyChanged:center", event) == false) 
            return null;
        return event;
    }

    setCenter(x, y) {
        event = this.canSetCenter(x, y);
        if (event == null) return false;
        this._bounds.centerX = x;
        this._bounds.centerY = y;
        this._lastTransformed = Date.now();
        this.triggerOn("PropertyChanged:center", event);
        return true;
    }

    canSetSize(w, h) {
        var oldWidth = this._bounds._width;
        var oldHeight = this._bounds._height;
        if (w == oldWidth && h == oldHeight)
            return null;
        var oldValue = [ oldWidth, oldHeight ];
        var event = new events.PropertyChanged(this, "bounds", oldValue, [ w, h ]);
        if (this.validateBefore("PropertyChanged:size", event) == false)
            return null;
        var C2 = this.controlSize + this.controlSize;
        if (w <= C2 || h <= C2)
            return null;
        return event;
    }

    setSize(w, h) {
        var event = this.canSetSize(w, h);
        if (event == null) return false;
        this._bounds.width = w;
        this._bounds.height = h;
        this._lastTransformed = Date.now();
        this.triggerOn("PropertyChanged:size", event);
        return true;
    }

    canSetAngle(theta) {
        if (theta == this._angle) 
            return null;
        var event = new events.PropertyChanged(this, "angle", this.angle, theta);
        if (this.validateBefore("PropertyChanged:angle", event) == false)
            return null;
        return event;
    }

    setAngle(theta) {
        var event = this.canSetAngle(theta);
        if (event == null) return false;
        this._angle = theta;
        this._lastTransformed = Date.now();
        this.triggerOn("PropertyChanged:angle", event);
        return true;
    }

    setScale(sx, sy) {
        if (sx == 0 || sy == 0) return false;
        this.configs._scaleX = sx;
        this.configs._scaleY = sy;
        this._lastTransformed = Date.now();
        return true;
    }

    move(dx, dy) {
        return this.setLocation(this.bounds.x + dx, this.bounds.y + dy);
    }

    scale(dx, dy) {
        return this.setSize(this.bounds.width * dx, this.bounds.height * dy);
    }

    rotate(dtheta, dy) {
        return this.setAngle(this.angle + dtheta);
    }

    /**
     * Adds a new shape to this group.
     * Returns true if a shape was successfully added
     * false if the addition was blocked.
     */
    add(shape, index) {
        index = index || -1;
        if (shape.parent != this) {
            var event = new events.ShapeAdded(this, shape);
            if (this.validateBefore("ShapeAdded", event) != false) {
                // remove from old parent - Important!
                if (shape.removeFromParent()) {
                    this._children.push(shape);
                    shape._parent = this;
                    shape.scene = this.scene;
                    this.triggerOn("ShapeAdded", event);
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
    remove(shape) {
        if (shape.parent == this) {
            var event = new events.ShapeRemoved(this, shape);
            if (this.validateBefore("ShapeRemoved", event) != false) {
                for (var i = 0;i < this._children.length;i++) {
                    if (this._children[i] == shape) {
                        this._children.splice(i, 1);
                        shape._parent = null;
                        this.triggerOn("ShapeRemoved", event);
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
            this._parent = null;
            return true;
        }
        return false;
    }
    
    /**
     * Changes the index of a given shape within the parent.  The indexOrDelta 
     * parameter denotes whether a shape is to be moved to an absolute index or 
     * relative to its current position depending on the 'relative' parameter.
     */
    changeShapeIndex(shape, indexOrDelta, relative) {
        if (shape.parent != this) return ;

        var newIndex = indexOrDelta;
        if (relative || false) {
            newIndex = index + indexOrDelta;
        }

        if (newIndex < 0)
            newIndex = 0;
        if (newIndex >= this._children.length)
            newIndex = this._children.length - 1;

        var index = this._children.indexOf(shape);
        if (newIndex == index) {
            return ;
        }
        var event = new events.ShapeIndexChanged(shape, index, newIndex);
        if (this.validateBefore("ShapeIndexChanged", event) != false) {
            this._children.splice(index, 1);
            this._children.splice(newIndex, 0, shape);
            this.triggerOn("ShapeIndexChanged", event);
        }
    }

    /**
     * Brings a child shape forward by one level.
     */
    bringForward(shape) {
        return this.changeShapeIndex(shape, 1, true);

        if (index >= 0 && index < this._children.length - 1) {
            var temp = this._children[index];
            this._children[index] = this._children[index + 1];
            this._children[index + 1] = temp;
        }
    }

    /**
     * Sends a child shape backward by one index.
     */
    sendBackward(shape) {
        return this.changeShapeIndex(shape, -1, true);

        if (index > 0) {
            var temp = this._children[index];
            this._children[index] = this._children[index - 1];
            this._children[index - 1] = temp;
        }
    }

    /**
     * Brings a child shape to the front of the child stack.
     */
    bringToFront(shape) {
        return this.changeShapeIndex(shape, this._children.length, false);

        if (shape.parent != this) return ;
        var index = this._children.indexOf(shape);
        if (index >= 0 && index < this._children.length - 1) {
            this._children.splice(index, 1);
            this._children.push(shape);
        }
    }

    /**
     * Sends a child shape to the back of the child stack.
     */
    sendToBack(shape) {
        return this.changeShapeIndex(shape, 0, false);

        if (index > 0) {
            this._children.splice(index, 1);
            this._children.splice(0, 0, shape);
        }
    }

    draw(ctx) {
        if (this._children.length > 0) {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(this.bounds.left, this.bounds.top, this.bounds.width, this.bounds.height);
        }
    }

    /**
     * Draws this shape on a given context.
     */
    applyStyles(ctx, options) {
        if (this.fillStyle) {
            this.fillStyle.apply(this, "fillStyle", ctx);
        }
        if (this.strokeStyle) {
            this.strokeStyle.apply(this, "strokeStyle", ctx);
        }
        ctx.lineJoin = this.lineJoin;
        ctx.lineCap = this.lineCap;
        ctx.lineWidth = this.lineWidth;
    }

    applyTransforms(ctx) {
        var angle = this.angle;
        if (angle) {
            ctx.save(); 
            var cx = this.bounds.centerX;
            var cy = this.bounds.centerY;
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.translate(-cx, -cy);
        }
    }

    revertTransforms(ctx) {
        var angle = this.angle;
        if (angle) {
            ctx.restore(); 
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
            ctx.strokeRect(px - this.controlSize, py - this.controlSize,
                           this.controlSize + this.controlSize,
                           this.controlSize + this.controlSize);
        }
        // Draw the "rotation" control
        ctx.beginPath();
        geomutils.pathEllipse(ctx, this.bounds.right + 50 - this.controlSize, 
                         this.bounds.centerY - this.controlSize, 
                         this.controlSize * 2, this.controlSize * 2);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.moveTo(this.bounds.right, this.bounds.centerY);
        ctx.lineTo(this.bounds.right + 50, this.bounds.centerY);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
    }

    /**
     * Returns true if this shape contains a particular coordinate, 
     * false otherwise.
     */
    containsPoint(x, y) {
        var newp = this.globalTransform.apply(x, y, {});
        return this.bounds.containsPoint(newp.x, newp.y);
    }

    /**
     * Returns true if this shape intersects another bounds instance,
     * false otherwise.
     */
    intersects(anotherBounds) {
        return this.bounds.intersects(anotherBounds);
    }
}

/**
 * Creating explicit group class to handle groups of objects so that we 
 * can extend this to performing layouts etc on child chapes.
 */
export class Group extends Shape {
    constructor(configs) {
        super(configs);
        this.isGroup = true;
    }

    canSetSize(w, h) {
        var event = super.canSetSize(w, h);
        if (event != null) {
            // check if children sizes can be set.
        }
        return event;
    }
}

export class Layer extends Shape { }

/**
 * The Scene is the raw model where all layers and shapes are 
 * managed.  As far as possible this does not perform any view 
 * related operations as that is decoupled into the view entity.
 */
export class Scene {
    constructor(configs) {
        configs = configs || {};
        this._eventHub =  new events.EventHub();
        this._bounds = configs.bounds || new geom.Bounds();
        this._layers = []
        this.addLayer();
        this._selectedLayer = 0;
    }

    get eventHub() { return this._eventHub; }

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

    on(eventTypes, handler) {
        if (this._eventHub == null) {
            this._eventHub = new events.EventHub();
        }
        this._eventHub.on(eventTypes, handler);
        return this;
    }

    before(eventTypes, handler) {
        if (this._eventHub == null) {
            this._eventHub = new events.EventHub();
        }
        this._eventHub.before(eventTypes, handler);
        return this;
    }
}

/**
 * A wrapper over a path.
 */
export class Path extends Shape {
    constructor(configs) {
        super(configs);
        this._commands = [];
    }

    _cmdMoveTo(ctx, args) { ctx.moveTo.apply(args); }
    _cmdLineTo(ctx, args) { ctx.lineTo.apply(args); }
    _cmdClosePath(ctx, args) { ctx.closePath(); }
    _cmdArc(ctx, args) { ctx.arc.apply(args); }
    _cmdArcTo(ctx, args) { ctx.arcTo.apply(args); }
    _cmdQuadraticCurveTo(ctx, args) { ctx.quadraticCurveTo.apply(args); }
    _cmdBezierCurveTo(ctx, args) { ctx.bezierCurveTo.apply(args); }
    _addCommand(cmd, args) {
        this._commands.push([cmd, args]);
    }

    moveTo(x, y) { this._addCommand(this._cmdMoveTo, [x, y]); }
    lineTo(x, y) { this._addCommand(this._cmdLineTo, [x, y]); }
    arc(x, y, radius, startAngle, endAngle, anticlockwise) {
        this._addCommand(this._cmdArc, [x, y, radius, startAngle, endAngle, anticlockwise]);
    }
    arcTo(x1, y1, x2, y2, radius) {
        this._addCommand(this._cmdArcTo, [x1, y1, x2, y2, radius]);
    }
    quadraticCurveTo(cp1x, cp1y, x, y) {
        this._addCommand(this._cmdQuadraticCurveTo, [cp1x, cp1y, x, y]);
    }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        this._addCommand(this._cmdQuadraticCurveTo, [cp1x, cp1y, cp2x, cp2y, x, y]);
    }
    closePath() {
        this._addCommand(this._cmdClosePath);
    }

    draw(ctx) {
        ctx.beginPath();
        this._commands.forEach(function(cmd) {
            var func = cmd[0];
            var args = cmd[1];
            func(ctx, args);
        });
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.lineWidth > 0) {
            ctx.stroke();
        }
    }
}

export class Selection extends events.EventSource {
    constructor() {
        super();
        this._shapes = [];
        this._shapesById = {};
        this.savedInfos = {};
    }

    get count() {
        return this._shapes.length;
    }

    get allShapes() {
        var out = [];
        this.forEach(function(shape) {
            out.push(shape);
        });
        return out;
    }

    forEach(handler, self, mutable) {
        var shapesById = this._shapesById;
        if (mutable == true) {
            shapesById = Object.assign({}, shapesById);
        }
        for (var shapeId in shapesById) {
            var shape = shapesById[shapeId];
            if (handler(shape, self) == false)
                break;
        }
    }

    contains(shape) {
        return shape.id in this._shapesById;
    }
    
    get(index) {
        return this._shapes[index];
    }

    add(shape) {
        var event = new events.ShapesSelected(this, [shape]);
        if (this.validateBefore("ShapesSelected", event) != false) {
            if ( ! (shape.id in this._shapesById)) {
                this._shapes.push(shape);
            }
            this._shapesById[shape.id] = shape;
            this.savedInfos[shape.id] = shape.controller.snapshotFor();
            this.triggerOn("ShapesSelected", event);
        }
    }

    remove(shape) {
        var event = new events.ShapesUnselected(this, [shape]);
        if (this.validateBefore("ShapesUnselected", event) != false) {
            if ( shape.id in this._shapesById ) {
                for (var i = 0;i < this._shapes.length;i++) {
                    if (this._shapes[i].id == shape.id) {
                        this._shapes.splice(i, 1);
                        break ;
                    }
                }
            }
            delete this._shapesById[shape.id];
            delete this.savedInfos[shape.id];
            this.triggerOn("ShapesUnselected", event);
        }
    }

    checkpointShapes(hitInfo) {
        // Updated the save info for all selected shapes
        this.forEach(function(shape, self) {
            self.savedInfos[shape.id] = shape.controller.snapshotFor(hitInfo);
        }, this);
    }

    getSavedInfo(shape) {
        return this.savedInfos[shape.id];
    }

    toggleMembership(shape) {
        if (shape == null) return false;
        if (this.contains(shape)) {
            this.remove(shape);
            return false;
        } else {
            this.add(shape);
            return true;
        }
    }

    clear() {
        var event = new events.ShapesUnselected(this, this.allShapes);
        this.triggerOn("ShapesUnselected", event);
        this.savedInfos = {};
        this._shapes = [];
        this._shapesById = {};
        this._count = 0;
    }

    /**
     * Brings the selected shapes forward by one level within their parents.
     */
    bringForward() {
        this.forEach(function(shape) {
            shape.parent.bringForward(shape);
        });
    }

    /**
     * Sends the selected shapes backward by one level within their parents.
     */
    sendBackward() {
        this.forEach(function(shape) {
            shape.parent.sendBackward(shape);
        });
    }

    /**
     * Brings the selected shapes to the front of the stack within their parents.
     */
    bringToFront() {
        this.forEach(function(shape) {
            shape.parent.bringToFront(shape);
        });
    }

    /**
     * Sends the selected shapes to the back of the stack within their parents.
     */
    sendToBack() {
        this.forEach(function(shape) {
            shape.parent.sendToBack(shape);
        });
    }

    /**
     * Create a group out of the elements in this Selection.
     */
    group() {
        // Collect all shapes in this selection
        // Identify their parents.
        // Do they all have the same parent?
        // if all parents are "null" then they are all at the top level
        // if they are all non null but same then they are all at teh same 
        // level under the same parent so same as above and OK.
        // But if different shapes have different parents then only
        // those shapes that share a parent can be grouped together.
        var groups = {};
        this.forEach(function(shape) {
            var parId = shape.parent;
            if (parId) {
                parId = shape.parent.id;
            }
            if (! (parId in groups)) {
                groups[parId] = {
                    parent: shape.parent,
                    bounds: shape.bounds.copy(),
                    shapes: []
                };
            }
            groups[parId].shapes.push(shape);
            groups[parId].bounds.union(shape.bounds);
        });

        this.clear();
        for (var parentId in groups) {
            var currGroup = groups[parentId];
            var currBounds = currGroup.bounds;
            var currParent = currGroup.parent;
            // Here create a new shape group if we have atleast 2 shapes
            if (currGroup.shapes.length > 1)  {
                var newParent = new models.Group();
                currParent.add(newParent);
                newParent.setLocation(currBounds.x, currBounds.y);
                newParent.setSize(currBounds.width, currBounds.height);
                currGroup.shapes.forEach(function(child, index) {
                    newParent.add(child);
                    child.setLocation(child.bounds.x - currBounds.x, child.bounds.y - currBounds.y);
                });
                this.add(newParent);
            }
        }
    }

    /**
     * Ungroups all elements in the current selection.  This is a no-op if number
     * of elements in the selection is not 1 and the existing element is not a ShapeGroup.
     */
    ungroup() {
        var selection = this;
        this.forEach(function(shape, self) {
            if (shape.isGroup) {
                selection.remove(shape);
                var newParent = shape.parent;
                var bounds = shape.bounds;
                shape.forEachChild(function(child, index, self) {
                    newParent.add(child);
                    child.setLocation(bounds.x + child.bounds.x,
                                      bounds.y + child.bounds.y);
                    selection.add(child);
                }, this, true);
                newParent.remove(shape);
            }
        }, this, true);
    }

    /**
     * Regroups elements in the selection.  This is useful if elements are added after
     * grouping and we want to add to existing groups consolidating multiple groups
     * into a single group.
     */
    regroup() {
    }

    /**
     * "Copies" the shapes in this selection to the clipboard along with their current state
     * so that it can be pasted later.   The "cut" parameter also dictates whether the
     * selected shapes are to be removed from the Scene model too.
     */
    copyToClipboard(cut) {
    }

    /**
     * Paste a copy of shapes stored in the clipboard.
     */
    pasteFromClipboard() {
    }
}
