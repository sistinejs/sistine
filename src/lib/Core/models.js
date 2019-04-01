
import * as mixins from "./mixins";
import * as base from "./base";
import * as events from "./events";
import * as controller from "./controller";
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"

export const DEFAULT_CONTROL_SIZE = 5;

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

/**
 * Holds information about the instance of a shape.
 */
export class Shape extends mixins.Styleable {
    constructor(configs) {
        configs = configs || {};
        super(configs);
        this._scene = null;
        this._boundingBox = null;

        this.isVisible = true;
        this.controlRadius = DEFAULT_CONTROL_SIZE;
    }

    get boundingBox() {
        if (this._boundingBox == null) {
            this._boundingBox = this._evalBoundingBox();
        }
        return this._boundingBox;
    }

    get scene() { return this._scene; } 
    get controllerClass() { return controller.ShapeController; }
    get controller() { 
        if (this._controller == null) {
            this._controller = new this.controllerClass(this);
        }
        return this._controller; 
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

    /**
     * A easy wrapper to control shape dimensions by just setting its bounds.
     * This will also reset the scaleFactor to 1.
     */
    setBounds(newBounds) {
        if (this.canSetBounds(newBounds)) {
            var oldBounds = this.boundingBox.copy();
            var event = new events.GeometryChanged(this, "bounds", oldBounds, newBounds);
            if (this.validateBefore(event.name, event) == false) return false;
            this._scaleFactor.x = this._scaleFactor.y = 1.0;
            this._setBounds(newBounds);
            this._boundingBox = null;
            this.markTransformed();
            this.triggerOn(event.name, event);
            return true;
        }
    }
    canSetBounds(newBounds) { return true; }
    _setBounds(newBounds) {
        throw Error("Not Implemented for: ", this);
    }

    draw(ctx) {
        if (this._children.length > 0) {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.5;
            var lBounds = this.boundingBox;
            ctx.strokeRect(lBounds.left, lBounds.top, lBounds.width, lBounds.height);
        }
    }

    drawControls(ctx, options) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.5
        var lBounds = this.boundingBox;
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
        return this.boundingBox.containsPoint(newp.x, newp.y);
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
        super((configs = configs || {}));
        this._bounds = configs.bounds || new geom.Bounds();
        this._children = [];
    }

    childAtIndex(i) { return this._children[i]; } 
    get hasChildren() { return this._children.length > 0; } 
    get childCount() { return this._children.length; } 

    setScene(s) {
        if (!super.setScene(s)) return false;
        for (var i = 0, L = this._children.length;i < L;i++) {
            this._children[i].setScene(s);
        }
        return true;
    }

    _setBounds(newBounds) {
        this._bounds = newBounds.copy();
    }

    _evalBoundingBox() {
        if (this._bounds) {
            return this._bounds.copy();
        } else {
            var out = new geom.Bounds(0, 0, 0, 0);
            for (var i = 0;i < this._children.length;i++) {
                out.union(this._children[i].boundingBox);
            }
            return out;
        }
    }
}

export class Layer extends Group { 
    _evalBoundingBox() {
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
                    boundingBox: shape.boundingBox.copy(),
                    shapes: []
                };
            }
            groups[parId].shapes.push(shape);
            groups[parId].boundingBox.union(shape.boundingBox);
        });

        this.clear();
        for (var parentId in groups) {
            var currGroup = groups[parentId];
            var currBounds = currGroup.boundingBox;
            var currParent = currGroup.parent;
            // Here create a new shape group if we have atleast 2 shapes
            if (currGroup.shapes.length > 1)  {
                var newParent = new models.Group();
                currParent.add(newParent);
                newParent.setLocation(currBounds.x, currBounds.y);
                newParent.setSize(currBounds.width, currBounds.height);
                currGroup.shapes.forEach(function(child, index) {
                    newParent.add(child);
                    child.setLocation(child.boundingBox.x - currBounds.x, child.boundingBox.y - currBounds.y);
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
                var lBounds = shape.boundingBox;
                shape.forEachChild(function(child, index, self) {
                    newParent.add(child);
                    child.setLocation(lBounds.x + child.boundingBox.x,
                                      lBounds.y + child.boundingBox.y);
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
