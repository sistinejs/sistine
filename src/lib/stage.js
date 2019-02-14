
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
    constructor(stage, canvasId, configs) {
        this._stage = stage;
        this._divId = stage.divId;
        this._canvasId = canvasId;
        this._canvas = null;
        this._zoom = 1.0;
        this._ensureCanvas();
        this._sceneIndex = new SceneIndex();
    }

    get sceneIndex() {
        return this._sceneIndex;
    }

    set cursor(c) {
        c = c || "auto";
        this._canvas.css("cursor", c);
    }

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
        return true;
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
            this.sceneIndex.forShapesInViewPort(this.viewPort, this, function(shape) {
                shape.applyStyles(context);
                shape.draw(context);
                if (touchHandler != null) {
                    if (shape == touchHandler.selectedShape ||
                        (touchHandler.hitInfo != null && touchHandler.hitInfo.shape == shape)) {
                        shape.drawControls(context);
                    }
                }
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
}

/**
 * The index structure of a scene lets us re-model how we store and index shapes in a scene
 * for faster access and grouping not just by hierarchy but also to cater for various access
 * characteristics. (say by location, by attribute type, by zIndex etc)
 */
export class SceneIndex {
    constructor(scene) {
        this._shapeIndexes = {};
        this._allShapes = [];
        this.scene = scene;
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

    /**
     * Applies a visitor for shapes in a given view port in a given pane.
     */
    forShapesInViewPort(pane, viewPort, visitor) {
        var allShapes = this._allShapes;
        for (var index in allShapes) {
            var shape = allShapes[index];
            if (shape != null && shape.intersects(viewPort)) {
                visitor(shape);
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
        this.hitInfo = null;
        this.selectedShape = null;
        this.relatedShapes = [];
        this._setupHandlers();
    }

    _setupHandlers() {
        var stage = this.stage;
        var handler = this;
        stage.editPane.mousedown(function(event) { return handler._onMouseDown(event); });
        stage.editPane.mouseup(function(event) { return handler._onMouseUp(event); });
        stage.editPane.mouseover(function(event) { return handler._onMouseOver(event); });
        stage.editPane.mouseout(function(event) { return handler._onMouseOut(event); });
        stage.editPane.mouseenter(function(event) { return handler._onMouseEnter(event); });
        stage.editPane.mouseleave(function(event) { return handler._onMouseLeave(event); });
        stage.editPane.mousemove(function(event) { return handler._onMouseMove(event); });
    }

    ////  Local handling of mouse/touch events
    _onMouseDown(event) {
        this.currX = this.downX = event.offsetX;
        this.currY = this.downY = event.offsetY;

        var mainIndex = this.stage.mainPane.sceneIndex;
        var editIndex = this.stage.editPane.sceneIndex;
        // Get the shape that is under the mouse
        this.hitInfo = mainIndex.getHitInfo(this.downX, this.downY);
        if (this.hitInfo != null) {
            this.stage.editPane.cursor = this.hitInfo.cursor;
            this.selectedShape = this.hitInfo.shape;

            // Get the shapes related to this shape that will change as we transform this shape
            this.relatedShapes = [];

            // remove the selected and related shapes from the mainIndex and add it to the edited index
            mainIndex.remove(this.selectedShape);
            mainIndex.removeShapes(this.relatedShapes);
            editIndex.add(this.selectedShape);
            editIndex.addShapes(this.relatedShapes);
            console.log("OnDown mainIndex Shapes: ", mainIndex._allShapes, mainIndex._shapeIndexes);
            console.log("OnDown editIndex Shapes: ", editIndex._allShapes, editIndex._shapeIndexes);
            this.stage.repaint();
        }
        console.log("HitInfo: ", this.hitInfo);
    }

    _onMouseUp(event) {
        this.downX = null;
        this.downY = null;

        var mainIndex = this.stage.mainPane.sceneIndex;
        var editIndex = this.stage.editPane.sceneIndex;
        // Add selected and related shapes back to main index from edit index
        if (this.selectedShape != null) {
            editIndex.remove(this.selectedShape);
            mainIndex.add(this.selectedShape);
        }
        editIndex.removeShapes(this.relatedShapes);
        mainIndex.addShapes(this.relatedShapes);
        this.selectedShape = null;
        this.relatedShapes = [];
        console.log("OnOver mainIndex Shapes: ", mainIndex._allShapes, mainIndex._shapeIndexes);
        console.log("OnOver editIndex Shapes: ", editIndex._allShapes, editIndex._shapeIndexes);
        this.stage.repaint();
    }

    _onMouseMove(event) { 
        this.currX = event.offsetX;
        this.currY = event.offsetY;
        if (this.hitInfo != null) {
            var shape = this.hitInfo.shape
            var newHitInfo = shape.controller.getHitInfo(this.currX, this.currY);
            if (newHitInfo != null && newHitInfo.shape == this.hitInfo.shape) {
                this.stage.editPane.cursor = newHitInfo.cursor;
            } else {
                this.stage.editPane.cursor = "auto";
            }
        }

        if (this.downX != null) {
            // We are in a position to "transform" the entry pressed
            if (this.hitInfo != null) {
                var shape = this.hitInfo.shape
                shape.controller.applyHitChanges(this.hitInfo,
                                                 this.downX, this.downY, this.currX, this.currY);
                this.stage.repaint();
            } else {
                // Just draw a "selection rectangle"
            }
        }
        // console.log("Selected Shape: ", this.currX, this.currY, this.selectedShape, new Date());
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

        // Track mouse/touch drag events
        this._editable = false;
        this._setupPanes();
        this.scene.addHandler(this);
    }

    get isEditable() {
        return this._editable;
    }

    set isEditable(editable) {
        if (this._editable != editable) {
            this._editable = editable;
            if (editable) {
                this._setupEditPane();
                this.touchHandler = new StageTouchHandler(this);
            } else {
                this.touchHandler = null;
                this.editPane.remove();
                this.editPane = null;
            }
        }
    }

    get topPane() {
        return this.editPane || this.mainPane;
    }

    get mainPane() {
        return this._mainPane;
    }

    get editPane() {
        return this._editPane;
    }

    get scene() {
        return this._scene;
    }

    get bounds() { return this._bounds; }
    get divId() { return this._divId; }
    get viewBounds() { return this._viewBounds; }

    layout() {
        this.mainPane.layout();
        if (this.isEditable)
            this.editPane.layout();
        this.repaint();
    }

    repaint() {
        this.mainPane.repaint();
        if (this.isEditable)
            this.editPane.repaint();
    }

    eventTriggered(event) {
        // console.log("Event: ", event);
        if (event.name == "ShapeAdded") {
            this.mainPane.sceneIndex.add(event.shape);
        } else if (event.name == "ShapeRemoved") {
            this.mainPane.sceneIndex.remove(event.shape);
        }
    }

    _setupPanes() {
        // Indexes maintain the different shapes require for static vs dynamic shapes
        this._setupMainPane();
        this._setupEditPane();
        this.layout();
    }

    _setupMainPane() {
        this._mainPane = new Pane(this, "maincanvas_" + this.divId);
        this.mainPane.sceneIndex.scene = this.scene;
    }

    _setupEditPane() {
        if (this.isEditable) {
            this._editPane = new Pane(this, "editcanvas_" + this.divId);
        }
    }
}
