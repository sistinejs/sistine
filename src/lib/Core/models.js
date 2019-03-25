
import * as counters from "./counters";
import * as events from "./events";
import * as styles from "./styles";
import * as controller from "./controller";
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"

export const DEFAULT_CONTROL_SIZE = 5;

export const EV_PROPERTY_CHANGED = 0;
export const EV_SHAPE_ADDED = 1;
export const EV_SHAPE_REMOVED = 2;

const ShapeCounter = new counters.Counter("ShapeIDs");

/**
 * The Scene is the raw model where all layers and shapes are 
 * managed.  As far as possible this does not perform any view 
 * related operations as that is decoupled into the view entity.
 */
export class Scene {
    constructor(configs) {
        configs = configs || {};
        this._eventHub =  new events.EventHub();
        this._layers = []
        this.addLayer();
        this._selectedLayer = 0;
    }

    get eventHub() { return this._eventHub; }

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
        layer.setScene(null);
        this._layers.splice(index, 1);
        return layer;
    }

    insertLayer(index) {
        var layer = new Layer();
        layer.setScene(this);
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

export class Element extends events.EventSource {
    constructor() {
        super();
        this._parent = null;
        this._defs = {};
        this._metadata = {};
    }

    getMetaData(key) { return this._metadata[key] || null; }
    setMetaData(key, value) { this._metadata[key] = value; return this; }

    markUpdated() { this._lastUpdated = Date.now(); }

    get hasChildren() { return false; }

    get parent() { return this._parent; } 
}

/**
 * Holds information about the instance of a shape.
 */
export class Shape extends Element {
    constructor(configs) {
        super();
        configs = configs || {};
        this._uuid = ShapeCounter.next();
        this._scene = null;
        this.isVisible = true;
        this._globalTransform = new geom.Transform();
        this._logicalBounds = null;
        this.markTransformed();
        this.controlRadius = DEFAULT_CONTROL_SIZE;

        // Transform properties
        this._rotation = 0;
        this._translation = new geom.Point(0, 0);
        this._scaleFactor = new geom.Point(1, 1);
        this._shearFactor = new geom.Point(1, 1);

        // The reference width and height denote the "original" width and height
        // for this shape and is used as a way to know what the current "scale" is.
        this._controller = null; 

        // Observable properties
        this.name = configs.name || this.className;
        this.zIndex = configs.zIndex || 0;
        this.lineWidth = configs.lineWidth || 2;
        this.lineJoin = configs.lineJoin || null;
        this.lineCap = configs.lineCap || null;
        this.miterLimit = configs.miterLimit || null;
        this.fillStyle = configs.fillStyle || null;
        this.strokeStyle = configs.strokeStyle || null;
        this.shouldFill = true;
        this.shouldStroke = true;
    }

    get uuid() { return this._uuid; }
    get logicalBounds() {
        if (this._logicalBounds == null) {
            this._logicalBounds = this._evalBounds();
        }
        return this._logicalBounds;
    }

    markTransformed() { 
        this.markUpdated();
        this._lastTransformed = Date.now(); 
    }

    get scene() { return this._scene; } 
    get controllerClass() { return controller.ShapeController; }
    get controller() { 
        if (this._controller == null) {
            this._controller = new this.controllerClass(this);
        }
        return this._controller; 
    }

    // Observable Properties that will trigger change events
    get name() { return this._name; }
    set name(value) { return this.set("name", value); }

    get rotation() { return this._rotation; }
    set rotation(value) { return this.set("rotation", value); }

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

    get globalTransform() {
        var gt = this._globalTransform;
        if (this._parent != null) {
            var pt = this._parent.globalTransform;
            if (pt.timeStamp > gt.timeStamp ||
                this._lastUpdated > gt.timeStamp) {
                // updated ourselves
                this._globalTransform = this._updateTransform(pt.copy());
            }
        } else if (this._lastUpdated > gt.timeStamp) {
            this._globalTransform = this._updateTransform();
        }
        return this._globalTransform;
    }
    _updateTransform(result) {
        result = result || new geom.Transform();
        var cx = this._translation.x;
        var cy = this._translation.y;
        // Notice we are doing "invserse transforms here"
        // since we need to map a point "back" to global form
        result.translate(cx, cy)
              .rotate(- this._rotation)
              .scale(1.0 / this._scaleFactor.x, 1.0 / this._scaleFactor.y)
              .translate(-cx, -cy);
        return result;
    }

    set controller(c) {
        if (this._controller != c) {
            this._controller = c;
        }
    }

    setScene(s) {
        if (this._scene != s) {
            // unchain previous scene
            this.markUpdated();
            if (this._scene) {
                this._eventHub.unchain(this._scene.eventHub);
            }
            this._scene = s;
            if (this._scene) {
                this._eventHub.chain(this._scene.eventHub);
            }
            return true;
        }
        return false;
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
        this.markUpdated();
        this.triggerOn("PropertyChanged:" + property, event);
        return true;
    }

    move(dx, dy) { return this.moveTo(this._translation.x + dx, this._translation.y + dy); } 
    moveTo(x, y) {
        var oldX = this._translation.x;
        var oldY = this._translation.y;
        if (x == oldX && y == oldY) return false;

        var event = new events.GeometryChanged(this, "location", [ oldX, oldY ], [ x, y ]);

        if (this.validateBefore(event.name, event) == false) return false;

        this._translation.x = x;
        this._translation.y = y;
        this.markTransformed();
        this._locationChanged(oldX, oldY);
        this.triggerOn(event.name, event);
        return true;
    }
    scale(sx, sy) { return this.scaleTo(this._scaleFactor.x * sx, this._scaleFactor.y * sy); } 
    scaleTo(x, y) {
        var oldScaleX = this._scaleFactor.x;
        var oldScaleY = this._scaleFactor.y;
        if (x == oldScaleX && y == oldScaleY) return false;

        // Check minimum sizes
        var C2 = this.controlRadius + this.controlRadius;
        if (x * this.logicalBounds.width <= C2 || y * this.logicalBounds.height <= C2) return false;

        var event = new events.GeometryChanged(this, "scale", [ oldScaleX, oldScaleY ], [ x, y ]);
        if (this.validateBefore(event.name, event) == false) return false;

        this._scaleFactor.set(x, y);
        this.markTransformed();
        this._scaleChanged(oldScaleX, oldScaleY);
        this.triggerOn(event.name, event);
        return true;
    }
    rotate(theta) { return this.rotateTo(this._rotation + theta); }
    rotateTo(theta) {
        if (theta == this._rotation) return false;

        var event = new events.GeometryChanged(this, "angle", this._rotation, theta);
        if (this.validateBefore(event.name, event) == false) return false;

        var oldAngle = this._rotation;
        this._rotation = theta;
        this.markTransformed();
        this._rotationChanged(oldAngle);
        this.triggerOn(event.name, event);
        return true;
    }

    /**
     * A easy wrapper to control shape dimensions by just setting its bounds.
     * This will also reset the scaleFactor to 1.
     */
    setBounds(newBounds) {
        if (this.canSetBounds(newBounds)) {
            var oldBounds = this.logicalBounds.copy();
            var event = new events.GeometryChanged(this, "bounds", oldBounds, newBounds);
            if (this.validateBefore(event.name, event) == false) return false;
            this._scaleFactor.x = this._scaleFactor.y = 1.0;
            this._setBounds(newBounds);
            this._logicalBounds = null;
            this.markTransformed();
            this.triggerOn(event.name, event);
            return true;
        }
    } 
    canSetBounds(newBounds) { return true; }
    _setBounds(newBounds) {
        throw Error("Not Implemented for: ", this);
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
                    shape.setScene(this.scene);
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
            var lBounds = this.logicalBounds;
            ctx.strokeRect(lBounds.left, lBounds.top, lBounds.width, lBounds.height);
        }
    }

    /**
     * Draws this shape on a given context.
     */
    applyStyles(ctx, options) {
        if (this.shouldFill && this.fillStyle) {
            ctx.fillStyle = null;
        }
        if (this.shouldStroke) {
            if (this.strokeStyle) {
                this.strokeStyle.apply(this, "strokeStyle", ctx);
            }
            if (this.lineJoin) {
                ctx.lineJoin = this.lineJoin;
            }
            if (this.lineCap) {
                ctx.lineCap = this.lineCap;
            }
            if (this.lineDash) {
                ctx.setLineDash(this.lineDash);
            }
            if (this.lineWidth > 0) {
                ctx.lineWidth = this.lineWidth;
            }
            if (this.lineDashOffset) {
                ctx.lineDashOffset = this.lineDashOffset;
            }
        }
    }

    applyTransforms(ctx) {
        var angle = this._rotation;
        if (angle || this._scaleFactor.x != 1 || this._scaleFactor.y != 1 ||
            this._translation.x || this._translation.y) {
            ctx.save(); 
            var lBounds = this.logicalBounds;
            var cx = this.logicalBounds.centerX;
            var cy = this.logicalBounds.centerY;
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.scale(this._scaleFactor.x, this._scaleFactor.y);
            ctx.translate(-cx + this._translation.x, -cy + this._translation.y);
        }
    }

    revertTransforms(ctx) {
        var angle = this._rotation;
        if (angle) {
            ctx.restore(); 
        }
    }

    drawControls(ctx, options) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.5
        var lBounds = this.logicalBounds;
        var l = lBounds.left;
        var r = lBounds.right;
        var t = lBounds.top;
        var b = lBounds.bottom;
        ctx.strokeRect(l, t, lBounds.width, lBounds.height);
        ctx.fillStyle = "yellow";

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
            ctx.fillRect(px - this.controlRadius, py - this.controlRadius,
                           this.controlRadius + this.controlRadius,
                           this.controlRadius + this.controlRadius);
            ctx.strokeRect(px - this.controlRadius, py - this.controlRadius,
                           this.controlRadius + this.controlRadius,
                           this.controlRadius + this.controlRadius);
        }
        // Draw the "rotation" control
        ctx.beginPath();
        geomutils.pathEllipse(ctx, lBounds.right + 50 - this.controlRadius, 
                         lBounds.centerY - this.controlRadius, 
                         this.controlRadius * 2, this.controlRadius * 2);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.moveTo(lBounds.right, lBounds.centerY);
        ctx.lineTo(lBounds.right + 50, lBounds.centerY);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
    }

    /**
     * Returns true if this shape contains a particular coordinate, 
     * false otherwise.
     */
    containsPoint(x, y) {
        var newp = this.globalTransform.apply(x, y, {});
        return this.logicalBounds.containsPoint(newp.x, newp.y);
    }

    /**
     * Returns true if this shape intersects another bounds instance,
     * false otherwise.
     */
    intersects(anotherBounds) {
        return this.logicalBounds.intersects(anotherBounds);
    }

    _locationChanged(oldX, oldY) { }
    _scaleChanged(oldW, oldH) { }
    _rotationChanged(oldAngle) { }
}

/**
 * Creating explicit group class to handle groups of objects so that we 
 * can extend this to performing layouts etc on child chapes.
 */
export class Group extends Shape {
    constructor(configs) {
        super(configs);
        this._children = [];
        this._viewBox = null;
    }

    setScene(s) {
        if (!super.setScene(s)) return false;
        for (var i = 0, L = this._children.length;i < L;i++) {
            this._children[i].setScene(s);
        }
        return true;
    }

    childAtIndex(i) { return this._children[i]; } 
    get hasChildren() { return this._children.length > 0; } 
    get childCount() { return this._children.length; } 

    _evalBounds() {
        if (this._viewBox == null) {
            var out = new geom.Bounds(0, 0, 0, 0);
            for (var i = 0;i < this._children.length;i++) {
                out.union(this._children[i].logicalBounds);
            }
            return out;
        } else {
            return this._viewBox.copy();
        }
    }

    _setBounds(newBounds) {
        this._viewBox = newBounds.copy();
    }
}

export class Layer extends Group { 
    _evalBounds() {
        return new geom.Bounds(0, 0, 0, 0);
    }
}

export class Selection extends events.EventSource {
    constructor() {
        super();
        this._shapes = [];
        this._shapesByUUID = {};
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
        var shapesByUUID = this._shapesByUUID;
        if (mutable == true) {
            shapesByUUID = Object.assign({}, shapesByUUID);
        }
        for (var shapeId in shapesByUUID) {
            var shape = shapesByUUID[shapeId];
            if (handler(shape, self) == false)
                break;
        }
    }

    contains(shape) {
        return shape._uuid in this._shapesByUUID;
    }
    
    get(index) {
        return this._shapes[index];
    }

    add(shape) {
        var event = new events.ShapesSelected(this, [shape]);
        if (this.validateBefore("ShapesSelected", event) != false) {
            if ( ! (shape._uuid in this._shapesByUUID)) {
                this._shapes.push(shape);
            }
            this._shapesByUUID[shape._uuid] = shape;
            this.savedInfos[shape._uuid] = shape.controller.snapshotFor();
            this.triggerOn("ShapesSelected", event);
        }
    }

    remove(shape) {
        var event = new events.ShapesUnselected(this, [shape]);
        if (this.validateBefore("ShapesUnselected", event) != false) {
            if ( shape._uuid in this._shapesByUUID ) {
                for (var i = 0;i < this._shapes.length;i++) {
                    if (this._shapes[i]._uuid == shape._uuid) {
                        this._shapes.splice(i, 1);
                        break ;
                    }
                }
            }
            delete this._shapesByUUID[shape._uuid];
            delete this.savedInfos[shape._uuid];
            this.triggerOn("ShapesUnselected", event);
        }
    }

    checkpointShapes(hitInfo) {
        // Updated the save info for all selected shapes
        this.forEach(function(shape, self) {
            self.savedInfos[shape._uuid] = shape.controller.snapshotFor(hitInfo);
        }, this);
    }

    getSavedInfo(shape) {
        return this.savedInfos[shape._uuid];
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
        this._shapesByUUID = {};
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
                parId = shape.parent._uuid;
            }
            if (! (parId in groups)) {
                groups[parId] = {
                    parent: shape.parent,
                    logicalBounds: shape.logicalBounds.copy(),
                    shapes: []
                };
            }
            groups[parId].shapes.push(shape);
            groups[parId].logicalBounds.union(shape.logicalBounds);
        });

        this.clear();
        for (var parentId in groups) {
            var currGroup = groups[parentId];
            var currBounds = currGroup.logicalBounds;
            var currParent = currGroup.parent;
            // Here create a new shape group if we have atleast 2 shapes
            if (currGroup.shapes.length > 1)  {
                var newParent = new models.Group();
                currParent.add(newParent);
                newParent.setLocation(currBounds.x, currBounds.y);
                newParent.setSize(currBounds.width, currBounds.height);
                currGroup.shapes.forEach(function(child, index) {
                    newParent.add(child);
                    child.setLocation(child.logicalBounds.x - currBounds.x, child.logicalBounds.y - currBounds.y);
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
                var lBounds = shape.logicalBounds;
                shape.forEachChild(function(child, index, self) {
                    newParent.add(child);
                    child.setLocation(lBounds.x + child.logicalBounds.x,
                                      lBounds.y + child.logicalBounds.y);
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
