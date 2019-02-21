
import * as events from "./events";
import * as core from "./core";
import * as panes from "./panes";
import * as handlers from "./handlers";
import { getcssint } from "../utils/dom"

/**
 * The stage model if where all layers and shapes are managed. 
 * As far as possible this does not perform any view related operations as 
 * that is decoupled into the view entity.
 */
export class Stage extends events.EventHandler {
    constructor(divId, scene, configs) {
        super();
        configs = configs || {};
        configs.x = configs.x || 0;
        configs.y = configs.y || 0;
        configs.width = configs.width || 1000;
        configs.height = configs.height || 1000;

        // By default stages are not editable
        this._editable = false;
        this._showBackground = false;

        // The boundaries of the "Stage"
        this._bounds = new core.Bounds(configs);
        this._zoom = 1.0;
        this._offset = new core.Point()

        this._divId = divId;
        this._parentDiv = $("#" + divId);
        this._scene = scene || new core.Scene();
        this._shapeIndex = new ShapeIndex(scene);
        this._shapeIndex.defaultPane = "main";

        // Track mouse/touch drag events
        this._panes = [];

        // Main panel where shapes are drawn at rest
        this._mainPane = this.acquirePane("main");
        this.scene.addHandler(this);

        // Information regarding Selections
        this.selection = new Selection(this);

        // The touch mode passes information on what each of the handlers are ok to perform
        this._touchContext = new handlers.TouchContext()
    }

    get touchContext() {
        return this._touchContext;
    }

    setTouchContext(mode, data) {
        this._touchContext.mode = mode || handlers.TouchModes.NONE;
        this._touchContext.data = data;
        if (this._touchContext.mode == handlers.TouchModes.NONE) {
            this.cursor = "auto";
        }
    }

    get bounds() { return this._bounds; }

    set cursor(c) {
        c = c || "auto";
        this._parentDiv.css("cursor", c);
    }

    get zoom() { return this._zoom; }
    setZoom(z) {
        if (z < 0) z = 1;
        if (z > 10) z = 10;
        if (this._zoom != z) {
            this._zoom = z;
            this._panes.forEach(function(pane, index) {
                pane.setZoom(z);
            });
            this.repaint();
        }
    }

    get offset() { return this._offset; }
    setOffset(x, y) {
        if (this._offset.x != x || this._offset.y != y) {
            this._offset = new core.Point(x, y);
            this._panes.forEach(function(pane, index) {
                pane.setOffset(x, y);
            });
            this.repaint();
        }
    }

    get element() {
        return this._parentDiv;
    }

    get showBackground() {
        return this._showBackground;
    }

    set showBackground(show) {
        if (this._showBackground != show) {
            this._showBackground = show;
            if (show) {
                this.bgHandler = new handlers.StageBackgroundHandler(this);
            } else {
                this.bgHandler.detach();
                this.bgHandler.null;
            }
        }
    }

    get isEditable() {
        return this._editable;
    }

    set isEditable(editable) {
        if (this._editable != editable) {
            this._editable = editable;
            if (editable) {
                this.touchHandler = new handlers.StageTouchHandler(this);
                this.keyHandler = new handlers.StageKeyHandler(this);
            } else {
                this.keyHandler.detach();
                this.keyHandler.null;
                this.touchHandler.detach();
                this.touchHandler.null;
            }
        }
    }

    acquirePane(name, PaneClass) {
        PaneClass = PaneClass || panes.ShapesPane;
        var pane = this.getPane(name);
        if (pane == null) {
            pane = new PaneClass(name, this, name + "pane_" + this.divId);
            this._panes.push(pane);
            this.layout();
        } else {
            pane.acquire();
        }
        return pane;
    }

    releasePane(name) {
        for (var i = this._panes.length;i >= 0;i--) {
            var pane = this._panes[i];
            if (pane.name == name) {
                if ( ! pane.release() ) {
                    pane.remove();
                    this._panes.splice(i, 1);
                    return ;
                }
            }
        }
    }

    getPane(name) {
        for (var i = this._panes.length - 1; i >= 0;i--)  {
            if (this._panes[i].name == name) {
                return this._panes[i];
            }
        }
        return null;
    }

    get numPanes() {
        return this._panes.length;
    }

    indexOfPane(pane) {
        for (var i = this._panes.length;i >= 0;i--) {
            if (this._panes[i] == pane) return i;
        }
        return -1;
    }

    movePane(pane, newIndex) {
        var currIndex = this.indexOfPane(pane);
        if (newIndex < 0) newIndex = this._panes.length;
        if (currIndex >= 0 && currIndex != newIndex) {
            this._panes.splice(currIndex, 1);
            this._panes.splice(newIndex, 0, pane);
            var elem = pane.element.detach();
            if (newIndex >= this.element.children().length) {
                this.element.append(pane.element);
            } else {
                var child = $(this.element.children()[newIndex]);
                pane.element.insertBefore(child);
            }
        }
    }

    get scene() {
        return this._scene;
    }

    get shapeIndex() {
        return this._shapeIndex;
    }

    get bounds() { return this._bounds; }
    get divId() { return this._divId; }
    get viewBounds() { return this._viewBounds; }

    layout() {
        for (var i = this._panes.length - 1; i >= 0;i--) this._panes[i].layout();
        this.repaint();
    }

    repaint(force) {
        for (var i = this._panes.length - 1; i >= 0;i--)
            this._panes[i].repaint(force);
    }

    setShapePane(shape, pane) {
        if (shape.pane != pane) {
            this.paneNeedsRepaint(shape.pane);
            this.shapeIndex.setPane(shape, "edit");
            this.paneNeedsRepaint(shape.pane);
        }
    }

    eventTriggered(event) {
        // console.log("Event: ", event);
        if (event.name == "ShapeAdded") {
            this.shapeIndex.add(event.shape);
            this.paneNeedsRepaint(event.shape.pane)
        } else if (event.name == "ShapeRemoved") {
            this.shapeIndex.remove(event.shape);
            this.paneNeedsRepaint(event.shape.pane)
        } else if (event.name == "PropertyChanged") {
            this.paneNeedsRepaint(event.source.pane)
        }
        this.repaint();
    }

    paneNeedsRepaint(name) {
        name = name || null;
        if (name == null) {
            // all panes
            for (var i = 0;i < this._panes.length;i++) {
                this._panes[i].needsRepaint = true;
            }
        } else {
            var pane = this.getPane(name);
            if (pane == null) pane = this._mainPane;
            pane.needsRepaint = true;
        }
    }

    _setupHandler(element, method, handler) {
        var source = this;
        element[method](function(event) {
            event.theSource = source;
            handler(event);
        });
        return this;
    }

    keypress(handler) { return this._setupHandler(this.element, "keypress", handler); }
    keyup(handler) { return this._setupHandler(this.element, "keyup", handler); }
    keydown(handler) { return this._setupHandler(this.element, "keydown", handler); }

    click(handler) { return this._setupHandler(this.element, "click", handler); }
    mouseover(handler) { return this._setupHandler(this.element, "mouseover", handler); }
    mouseout(handler) { return this._setupHandler(this.element, "mouseout", handler); }
    mouseenter(handler) { return this._setupHandler(this.element, "mouseenter", handler); }
    mouseleave(handler) { return this._setupHandler(this.element, "mouseleave", handler); }
    mousedown(handler) { return this._setupHandler(this.element, "mousedown", handler); }
    mouseup(handler) { return this._setupHandler(this.element, "mouseup", handler); }
    mousemove(handler) { return this._setupHandler(this.element, "mousemove", handler); }
    contextmenu(handler) { return this._setupHandler(this.element, "contextmenu", handler); }
    scroll(handler) { return this._setupHandler(this.element, "scroll", handler); }
}

/**
 * The index structure of a scene lets us re-model how we store and index shapes in a scene
 * for faster access and grouping not just by hierarchy but also to cater for various access
 * characteristics. (say by location, by attribute type, by zIndex etc)
 */
export class ShapeIndex {
    constructor(scene) {
        this._shapeIndexes = {};
        this._allShapes = [];
        this.scene = scene;
        this.defaultPane = null;
    }

    get scene() {
        return this._scene || null;
    }

    set scene(s) {
        if (s != this._scene) {
            this._scene = s;
            this._shapeIndexes = {};
            this._allShapes = [];
            this.reIndex();     // Build the index for this new scene!
        }
    }

    setPane(shape, pane) {
        if (shape != null && shape.pane != pane) {
            shape.pane = pane;
        }
    }

    /**
     * Applies a visitor for shapes in a given view port in a given pane.
     */
    forShapesInViewPort(pane, viewPort, visitor) {
        var allShapes = this._allShapes;
        for (var index in allShapes) {
            var shape = allShapes[index];
            if (shape != null) {
                var spane = shape.pane || null;
                if (spane == null) {
                    if (pane.name == this.defaultPane) {
                        visitor(shape);
                    }
                } else if (spane == pane.name) {
                    visitor(shape);
                }
            }
        }
    }

    shapeExists(shape) {
        return shape.id in this._shapeIndexes;
    }

    /**
     * A new shape is added to the index.
     */
    add(shape) {
        shape.pane = shape.pane || null;
        // See if shape already has an index assigned to it
        if (this.shapeExists(shape)) {
            var index = this._shapeIndexes[shape.id];
            if (this._allShapes[index] != null) {
                throw Error("Adding shape again without removing it first");
            }
            this._allShapes[index] = shape;
        } else {
            this._shapeIndexes[shape.id] = this._allShapes.length;
            this._allShapes.push(shape);
        }
        shape.pane = shape.pane || this.defaultPane;
    }

    addShapes(shapes) {
        for (var i in shapes) {
            this.add(shapes[i]);
        }
    }

    /**
     * Remove a shape from the index.
     */
    remove(shape) {
        if (!this.shapeExists(shape)) {
            throw Error("Shape does not exist in this index.");
        }
        var index = this._shapeIndexes[shape.id];
        this._allShapes[index] = null;
    }

    removeShapes(shapes) {
        for (var i in shapes) {
            this.remove(shapes[i]);
        }
    }

    /**
     * Given a coordinate (x,y) returns the topmost shape that contains this point.
     */
    getShapeAt(x, y) {
        var allShapes = this._allShapes;
        for (var index in allShapes) {
            var shape = allShapes[index];
            if (shape != null && shape.containsPoint(x, y)) {
                return shape;
            }
        }
        return null;
    }

    reIndex() {
        var scene = this._scene;
        if (scene) {
            for (var index in scene.layers) {
                var layer = scene.layers[index];
                this._reIndexShape(layer);
            }
        }
    }

    _reIndexShape(shape) {
        this.add(shape);
        for (var index in shape.children) {
            var child = shape.children[index];
            this._reIndexShape(child);
        }
    }
}

export class Selection {
    constructor(stage) {
        this.stage = stage;
        this.shapes = {};
        this.downHitInfo = null;
        this.savedInfos = {};
        this._count = 0;
    }

    get count() {
        return this._count;
    }

    get allShapes() {
        var out = [];
        this.forEach(function(self, shape) {
            out.push(shape);
        }, this);
        return out;
    }

    forEach(handler, self) {
        for (var shapeId in this.shapes) {
            var shape = this.shapes[shapeId];
            if (handler(self, shape, this) == false)
                break;
        }
    }

    contains(shape) {
        return shape.id in this.shapes;
    }
    
    add(shape) {
        if ( ! (shape.id in this.shapes)) {
            this._count ++;
        }
        this.shapes[shape.id] = shape;
        this.savedInfos[shape.id] = shape.controller.snapshotFor();
        this.stage.setShapePane(shape, "edit");
    }

    remove(shape) {
        if ( shape.id in this.shapes ) {
            this._count --;
        }
        this.stage.setShapePane(shape, "main");
        delete this.shapes[shape.id];
        delete this.savedInfos[shape.id];
    }

    checkpointShapes(hitInfo) {
        // Updated the save info for all selected shapes
        this.forEach(function(self, shape) {
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
        var shapeIndex = this.stage.shapeIndex;
        for (var shapeId in this.shapes) {
            this.stage.setShapePane(this.shapes[shapeId], "main");
        }
        this.savedInfos = {};
        this.shapes = {};
    }

    /**
     * Brings the selected forward by one level.
     */
    bringForward() {
    }

    /**
     * Sends the selected backward by one level.
     */
    sendBackward() {
    }

    /**
     * Brings the selected shapes to the front of the stack within their parents.
     */
    bringToFront() {
    }

    /**
     * Sends the selected shapes to the back of the stack within their parents.
     */
    sendToBack() {
    }

    /**
     * Create a group out of the elements in this Selection.
     */
    group() {
    }

    /**
     * Ungroups all elements in the current selection.  This is a no-op if number
     * of elements in the selection is not 1 and the existing element is not a ShapeGroup.
     */
    ungroup() {
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
