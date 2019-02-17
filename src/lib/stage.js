
import * as events from "./events";
import * as core from "./core";
import { getcssint } from "../utils/dom"

/**
 * A Pane is a wrapper over our drawing element/context.   Shapes can be drawn at 
 * exactly one pane at a time.  Panes help us give the idea of 'depth' in our stage 
 * so we can different shapes based on their level of intensity (in activity and
 * refresh rates etc).
 */
export class Pane {
    constructor(name, stage, canvasId) {
        this._name = name;
        this._stage = stage;
        this._needsRepaint = true;
        this._divId = stage.divId;
        this._canvasId = canvasId;
        this._canvas = null;
        this._zoom = 1.0;
        this._ensureCanvas();
        this._refCount = 1;
    }

    acquire() { this._refCount += 1; }
    release() { this._refCount -= 1; }

    set cursor(c) {
        c = c || "auto";
        this._canvas.css("cursor", c);
    }

    get name() { return this._name; }
    get divId() { return this._divId; }
    get canvasId() { return this._canvasId; }
    get context() { return this._context; }
    get element() { return this._canvas; }

    /**
     * Removes this canvas and cleans ourselves up.
     */
    remove() {
        this.element.remove();
    }

    _ensureCanvas() {
        var divId = this._divId;
        var $parent = $("#" + divId);
        this._parentDiv = $parent;
        this._canvas = $("<canvas style='position: absolute' id = '" + this._canvasId + "'/>");
        $parent.append(this._canvas);
        this.layout();
        this._context = this._canvas[0].getContext("2d");
    }

    get needsRepaint() {
        return this._needsRepaint;
    }

    set needsRepaint(n) {
        this._needsRepaint = n;
    }

    get width() { this._canvas.width() }
    get height() { this._canvas.height() }

    clear() {
        this.context.clearRect(0, 0, this._canvas.width(), this._canvas.height());
    }

    repaint(force) {
        if (force || this.needsRepaint) {
            this.clear();
            var stage = this._stage;
            var touchHandler = stage.touchHandler;
            var context = this.context;
            stage.shapeIndex.forShapesInViewPort(this, this.viewPort, function(shape) {
                shape.applyTransforms(context);
                shape.applyStyles(context);
                shape.draw(context);
                if (touchHandler != null && stage.selection.contains(shape)) {
                    shape.drawControls(context);
                }
                shape.revertTransforms(context);
            });
        }
    }

    layout() {
        var $parent = this._parentDiv;
        var elem = this._canvas;
        var horiz_padding = getcssint(elem, "padding-left") +
                            getcssint(elem, "padding-right") +
                            getcssint(elem, "margin-left") +
                            getcssint(elem, "margin-right") +
                            getcssint($parent, "border-left") +
                            getcssint($parent, "border-right");
        var vert_padding  = getcssint(elem, "padding-top") +
                            getcssint(elem, "padding-bottom") +
                            getcssint(elem, "margin-top") +
                            getcssint(elem, "margin-bottom") +
                            getcssint($parent, "border-top") +
                            getcssint($parent, "border-bottom");
        var finalHeight = $parent.height() - vert_padding;
        var finalWidth = $parent.width() - horiz_padding;
        elem.height(finalHeight);
        elem.width(finalWidth);
        elem[0].width = finalWidth;
        elem[0].height = finalHeight;
    }

    click(handler) {
        this._canvas.click(handler);
        return this;
    }

    mouseover(handler) {
        this._canvas.mouseover(handler);
        return this;
    }

    keydown(handler) {
        this._canvas.keydown(handler);
        return this;
    }

    keyup(handler) {
        this._canvas.keyup(handler);
        return this;
    }

    keypress(handler) {
        this._canvas.keypress(handler);
        return this;
    }

    mouseout(handler) {
        this._canvas.mouseout(handler);
        return this;
    }

    mouseenter(handler) {
        this._canvas.mouseenter(handler);
        return this;
    }

    mouseleave(handler) {
        this._canvas.mouseleave(handler);
        return this;
    }

    mousedown(handler) {
        this._canvas.mousedown(handler);
        return this;
    }

    mouseup(handler) {
        this._canvas.mouseup(handler);
        return this;
    }

    mousemove(handler) {
        this._canvas.mousemove(handler);
        return this;
    }

    contextmenu(handler) {
        this._canvas.contextmenu(handler);
        return this;
    }
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
        if (shape != null)
            shape.pane = pane.name;
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

/**
 * The stage model if where all layers and shapes are managed. 
 * As far as possible this does not perform any view related operations as 
 * that is decoupled into the view entity.
 */
export class Stage extends events.EventHandler {
    constructor(divId, scene, configs) {
        super();
        configs = configs || {};
        this._viewBounds = configs.viewBounds || new core.Bounds();
        this._divId = divId;
        this._scene = scene || new core.Scene();
        this._shapeIndex = new ShapeIndex(scene);
        this._shapeIndex.defaultPane = "main";

        // Track mouse/touch drag events
        this._editable = false;
        this._panes = [];
        this._mainPane = this.acquirePane("main");
        this.scene.addHandler(this);

        // Information regarding Selections
        this.selection = new Selection(this);
    }

    get isEditable() {
        return this._editable;
    }

    set isEditable(editable) {
        if (this._editable != editable) {
            this._editable = editable;
            if (editable) {
                this.touchHandler = new StageTouchHandler(this);
                this.keyHandler = new StageKeyHandler(this);
            } else {
                this.keyHandler.detach();
                this.keyHandler.null;
                this.touchHandler.detach();
                this.touchHandler.null;
            }
        }
    }

    acquirePane(name) {
        var pane = this.getPane(name);
        if (pane == null) {
            pane = new Pane(name, this, name + "pane_" + this.divId);
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

    repaint() {
        for (var i = this._panes.length - 1; i >= 0;i--) this._panes[i].repaint();
    }

    eventTriggered(event) {
        // console.log("Event: ", event);
        if (event.name == "ShapeAdded") {
            this.shapeIndex.add(event.shape);
        } else if (event.name == "ShapeRemoved") {
            this.shapeIndex.remove(event.shape);
        } else if (event.name == "PropertyChanged") {
        }
        this.repaint();
    }
}

class StageKeyHandler {
    constructor(stage) {
        this.stage = stage;

        this._editPane = this.stage.acquirePane("edit");
        this._editPane.element.attr("tabindex", 1);
        this._setupHandlers();
    }

    detach() {
        this.stage.releasePane("edit");
    }

    _setupHandlers() {
        var handler = this;
        this._editPane.keypress(function(event) { return handler._onKeyPress(event); });
        this._editPane.keyup(function(event) { return handler._onKeyUp(event); });
        this._editPane.keydown(function(event) { return handler._onKeyDown(event); });
    }

    _onKeyPress(event) { console.log("KeyPress: ", event); }
    _onKeyDown(event) { console.log("KeyDown: ", event); }
    _onKeyUp(event) {
        console.log("KeyUp: ", event);
        var shapes = this.stage.selection.allShapes;
        if (event.key == "Backspace") {
            this.stage.selection.clear();
            for (var i = 0;i < shapes.length;i++) {
                shapes[i].removeFromParent();
            }
        }
        this.stage.repaint();
    }
}

class StageTouchHandler {
    constructor(stage) {
        this.stage = stage;
        this.downX = null;
        this.downY = null;
        this.downTime = 0;
        this.currX = null;
        this.currY = null;
        this.selectingMultiple = false;
        this._shapeForCreation = null;

        // Max time before a mouse down goes from a "click" to a "hold"
        this.clickThresholdTime = 500;

        this._editPane = this.stage.acquirePane("edit");
        this._setupHandlers();
    }

    detach() {
        this.stage.releasePane("edit");
    }

    get shapeForCreation() {
        return this._shapeForCreation;
    }

    set shapeForCreation(s) {
        this._shapeForCreation = s;
    }

    _setupHandlers() {
        var handler = this;
        this._editPane.contextmenu(function(event) { return handler._onContextMenu(event); });
        this._editPane.click(function(event) { return handler._onClick(event); });
        this._editPane.mousedown(function(event) { return handler._onMouseDown(event); });
        this._editPane.mouseup(function(event) { return handler._onMouseUp(event); });
        this._editPane.mouseover(function(event) { return handler._onMouseOver(event); });
        this._editPane.mouseout(function(event) { return handler._onMouseOut(event); });
        this._editPane.mouseenter(function(event) { return handler._onMouseEnter(event); });
        this._editPane.mouseleave(function(event) { return handler._onMouseLeave(event); });
        this._editPane.mousemove(function(event) { return handler._onMouseMove(event); });
    }

    _selectingMultipleShapes(event) {
        console.log("MetaKey, Button, Buttons: ", event.metaKey, event.button, event.buttons);
        return event.button == 0 && event.metaKey;
    }

    ////  Local handling of mouse/touch events
    _onContextMenu(event) {
        console.log("Context Menu Clicked");
        return false;
    }

    _onClick(event) { }

    _onMouseDown(event) {
        this.currX = this.downX = event.offsetX;
        this.currY = this.downY = event.offsetY;
        this.downTime = event.timeStamp;
        this.downHitInfo = null;
        var shapeIndex = this.stage.shapeIndex;
        var selection = this.stage.selection;

        if (this._shapeForCreation != null) {
            console.log("Creating: ", this._shapeForCreation);
            selection.clear();
            this._shapeForCreation.setLocation(this.downX, this.downY);
            this.stage.shapeIndex.setPane(this._shapeForCreation, "edit");
            this.stage.scene.add(this._shapeForCreation);
        } else {
            this.selectingMultiple = this._selectingMultipleShapes(event);
            if (event.button == 0) {
                // We have alt button down so allow multiple shapes to be added
                var hitShape = shapeIndex.getShapeAt(this.downX, this.downY);
                if (hitShape == null) {
                    selection.clear();
                } else {
                    this.downHitInfo = hitShape.controller.getHitInfo(this.downX, this.downY);
                    if (this.selectingMultiple) {
                        selection.toggleMembership(hitShape);
                    } else if ( ! selection.contains(hitShape)) {
                        // On clear and add a new shape if it is not already selected
                        selection.clear();
                        selection.toggleMembership(hitShape);
                    }
                }
                selection.checkpointShapes(this.downHitInfo);
                this.stage.repaint();
            }
        }
    }

    _onMouseUp(event) {
        this.currX = event.offsetX;
        this.currY = event.offsetY;
        var currTime = event.timeStamp;
        var timeDelta = currTime - this.downTime;
        var isClick = timeDelta <= this.clickThresholdTime;
        var selection = this.stage.selection;
        this.downTime = null;
        this.downX = null;
        this.downY = null;

        if (this._shapeForCreation != null) {
            // only add a new shape once!
            this._shapeForCreation = null;
            this._editPane.cursor = "auto";
        } else {
            if (event.button == 0) {
                if ( ! this.selectingMultiple) {
                    console.log("Mouse Up, isClick: ", isClick);
                    if (isClick) {
                        // this was a click so just "toggleMembership" the shape selection
                        var shapeIndex = this.stage.shapeIndex;
                        var hitShape = shapeIndex.getShapeAt(this.currX, this.currY);
                        selection.clear();
                        selection.toggleMembership(hitShape);
                    } else {
                        console.log("HitApplyDone");
                    }
                }
            } else {
                console.log("Mouse Over, Button: ", event.button);
            }
        }
        this.stage.repaint();
    }

    _onMouseMove(event) { 
        this.currX = event.offsetX;
        this.currY = event.offsetY;
        var selection = this.stage.selection;
        console.log(this.currX, this.currY);
        if (this._shapeForCreation != null) {
            // This mode is when we are showing a cross hair for creating an object
            this._editPane.cursor = "crosshair";
            if (this.downX != null) {
                var minX = Math.min(this.downX, this.currX);
                var minY = Math.min(this.downY, this.currY);
                this._shapeForCreation.setLocation(minX, minY);
                this._shapeForCreation.setSize(Math.abs(this.currX - this.downX),
                                             Math.abs(this.currY - this.downY));
            }
        } else {
            // Mouse is not primed for "creating" an object
            selection.forEach(function(self, shape) {
                var currHitInfo = shape.controller.getHitInfo(self.currX, self.currY);
                if (currHitInfo != null) {
                    self._editPane.cursor = currHitInfo.cursor;
                    return false;
                } else {
                    self._editPane.cursor = "auto";
                }
            }, this);

            if (this.downX != null) {
                // We are in a position to "transform" the entry pressed
                var shapesFound = false;
                selection.forEach(function(self, shape) {
                    shapesFound = true;
                    var savedInfo = selection.getSavedInfo(shape);
                    shape.controller.applyHitChanges(self.downHitInfo, savedInfo,
                                                     self.downX, self.downY,
                                                     self.currX, self.currY);
                }, this);
                this._editPane.repaint();
                if ( ! shapesFound ) {
                    // Just draw a "selection rectangle"
                    var x = Math.min(this.downX, this.currX);
                    var y = Math.min(this.downY, this.currY);
                    var w = Math.abs(this.downX - this.currX);
                    var h = Math.abs(this.downY - this.currY);
                    this._editPane.context.strokeRect(x, y, w, h);
                }
            }
        }
    }

    _onMouseEnter(event) { 
        console.log("Entered: ", event);
        this._editPane.element.focus();
    }
    _onMouseLeave(event) { 
        console.log("Left: ", event);
        this._editPane.element.blur();
    }
    _onMouseOver(event) {
        console.log("Went Over: ", event);
        this._editPane.element.focus();
    }
    _onMouseOut(event) { 
        console.log("Went Out: ", event);
        this._editPane.element.blur();
    }
}

class Selection {
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
        this.stage.shapeIndex.setPane(shape, "edit");
    }

    remove(shape) {
        if ( shape.id in this.shapes ) {
            this._count --;
        }
        this.stage.shapeIndex.setPane(shape, "main");
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
            var shape = this.shapes[shapeId];
            shapeIndex.setPane(shape, "main");
        }
        this.savedInfos = {};
        this.shapes = {};
    }

    /**
     * Create a group out of the elements in this Selection.
     */
    group() {
    }
}
