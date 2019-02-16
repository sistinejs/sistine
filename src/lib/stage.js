
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
    }

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
        return this._needsRepaint = n;
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
                if (touchHandler != null && touchHandler.isShapeSelected(shape)) {
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
     * Called when a shape's one or more of a shape's properties have changed (indicated via an event) 
     * which would allow us to re-index the shape appropriately.
     */
    changeShape(shape, event) {
    }

    /**
     * Given a coordinate (x,y) returns the most suitable "hit info".  Hit Info 
     * represents a shape and what info about what can be "done" to a shape at that coordinate.
     */
    getHitInfo(x, y) {
        var allShapes = this._allShapes;
        for (var index in allShapes) {
            var shape = allShapes[index];
            if (shape != null && shape.controller != null) {
                var hitInfo = shape.controller.getHitInfo(x, y);
                if (hitInfo != null) {
                    return hitInfo;
                }
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

class StageTouchHandler {
    constructor(stage) {
        this.stage = stage;
        this.downX = null;
        this.downY = null;
        this.currX = null;
        this.currY = null;
        this.hitInfos = {};
        this._editPane = this.stage.addPane("edit");
        this._setupHandlers();
    }

    detach() {
        this.stage.removePane("edit");
    }

    isShapeSelected(shape) {
        return shape.id in this.hitInfos;
    }
    
    addHitInfo(hitInfo) {
        this.hitInfos[hitInfo.shape.id] = hitInfo;
    }

    removeHitInfo(hitInfo) {
        delete this.hitInfos[hitInfo.shape.id];
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
        console.log("MetaKey: ", event.metaKey);
        return event.metaKey;
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

        if (!this._selectingMultipleShapes(event)) {
            this.hitInfos = {};
        }

        // Get the shape that is under the mouse
        var shapeIndex = this.stage.shapeIndex;
        var hitInfo = shapeIndex.getHitInfo(this.downX, this.downY);
        if (hitInfo != null) {
            var shape = hitInfo.shape;
            this._editPane.cursor = hitInfo.cursor;
            shapeIndex.setPane(shape, "edit");
            this.addHitInfo(hitInfo);
            this.stage.repaint();
        } else {
            this.hitInfos = {};
        }
    }

    _onMouseUp(event) {
        this.currX = event.offsetX;
        this.currY = event.offsetY;
        this.downX = null;
        this.downY = null;
        if (!this._selectingMultipleShapes(event)) {
            this.selectedShapes = [];
        }

        // Get the shape that is under the mouse
        if (this.hitInfo != null) {
            var shape = this.hitInfo.shape;
            var index = this.selectedShapes.indexOf(shape.id);
            if (this.isShapeSelected(shape)) {
                this.selectShape(shape, false);
                shapeIndex.setPane(shape, "main");
            } else {
                this.selectShape(shape, true);
                shapeIndex.setPane(shape, "edit");
            }
        }
        this.stage.repaint();
    }

    _onMouseMove(event) { 
        this.currX = event.offsetX;
        this.currY = event.offsetY;
        console.log(this.currX, this.currY);
        var currHitInfo = null;
        for (var shapeId in this.hitInfos) {
            var hitInfo = this.hitInfos[shapeId];
            var shape = hitInfo.shape
            currHitInfo = shape.controller.getHitInfo(this.currX, this.currY);
            if (currHitInfo != null && currHitInfo.shape == hitInfo.shape) {
                this._editPane.cursor = currHitInfo.cursor;
                break;
            } else {
                this._editPane.cursor = "auto";
            }
        }

        if (this.downX != null) {
            // We are in a position to "transform" the entry pressed
            if (currHitInfo != null) {
                var shape = currHitInfo.shape;
                var currHitInfo = this.hitInfos[shape.id];
                shape.controller.applyHitChanges(currHitInfo,
                                                 this.downX, this.downY, this.currX, this.currY);
                this._editPane.repaint();
            } else {
                // Just draw a "selection rectangle"
                var x = Math.min(this.downX, this.currX);
                var y = Math.min(this.downY, this.currY);
                var w = Math.abs(this.downX - this.currX);
                var h = Math.abs(this.downY - this.currY);
                this._editPane.repaint();
                this._editPane.context.strokeRect(x, y, w, h);
            }
        }
    }

    _onMouseEnter(event) { }
    _onMouseLeave(event) { }
    _onMouseOver(event) { }
    _onMouseOut(event) { }
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
        this.addPane("main");
        this.scene.addHandler(this);
    }

    get isEditable() {
        return this._editable;
    }

    set isEditable(editable) {
        if (this._editable != editable) {
            this._editable = editable;
            if (editable) {
                this.touchHandler = new StageTouchHandler(this);
            } else {
                this.touchHandler.detach();
                this.touchHandler.null;
            }
        }
    }

    addPane(name) {
        var newPane = new Pane(name, this, name + "pane_" + this.divId);
        this._panes.push(newPane);
        this.layout();
        return newPane;
    }

    removePane(name) {
        for (var i = this._panes.length;i >= 0;i--) {
            var pane = this._panes[i];
            if (pane.name == name) {
                pane.remove();
                this._panes.splice(i, 1);
                return
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
