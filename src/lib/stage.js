
import * as events from "./events";
import * as core from "./core";
import { getcssint } from "../utils/dom"

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
     * Applies a visitor for shapes in a given view port.
     */
    forShapesInViewPort(viewPort, visitor) {
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
            if (shape != null) {
                var hitInfo = shape.getHitInfo(x, y);
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

export class SceneCanvas {
    constructor(divId, canvasId, configs) {
        this._divId = divId;
        this._canvasId = canvasId;
        this._canvas = null;
        this._zoom = 1.0;
        this._ensureCanvas();
    }

    set cursor(c) {
        c = c || "auto";
        this._canvas.css("cursor", c);
    }

    get divId() { return this._divId; }
    get canvasId() { return this._canvasId; }
    get context() { return this._context; }
    get element() { return this._canvas; }

    _ensureCanvas() {
        var divId = this._divId;
        var $parent = $("#" + divId);
        this._parentDiv = $parent;
        this._canvas = $("<canvas style='position: absolute; left: 0px; right: 0px; bottom: 0px; top: 0px' " +
                         "id = '" + this._canvasId + "'/>");
        $parent.append(this._canvas);
        this.layout();
        this._context = this._canvas[0].getContext("2d");
    }

    get needsRepaint() {
        return true;
    }

    clear() {
        this.context.clearRect(0, 0, this._canvas.width(), this._canvas.height());
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
        this._scene = scene;

        // Track mouse/touch drag events
        this.downX = null;
        this.downY = null;
        this.currX = null;
        this.currY = null;
        this._setupCanvases();
        this._setupHandlers();
        this.hitInfo = null;
        this.selectedShape = null;
        this.relatedShapes = [];
    }

    _setupCanvases() {
        // Indexes maintain the different shapes require for static vs dynamic shapes
        this._mainIndex = new SceneIndex(this._scene);
        this._editIndex = new SceneIndex();

        this._mainCanvas = new SceneCanvas(this._divId, "maincanvas_" + this._divId);
        this._editCanvas = new SceneCanvas(this._divId, "editcanvas_" + this._divId);
        this.layout();
    }

    _setupHandlers() {
        var stage = this;
        this.mousedown(function(event) { return stage._onMouseDown(event); });
        this.mouseup(function(event) { return stage._onMouseUp(event); });
        this.mouseover(function(event) { return stage._onMouseOver(event); });
        this.mouseout(function(event) { return stage._onMouseOut(event); });
        this.mouseenter(function(event) { return stage._onMouseEnter(event); });
        this.mouseleave(function(event) { return stage._onMouseLeave(event); });
        this.mousemove(function(event) { return stage._onMouseMove(event); });
        this.scene.addHandler(this);
    }

    get scene() {
        return this._scene;
    }

    layout() {
        this._mainCanvas.layout();
        this._editCanvas.layout();
        var canvas = this;
        canvas.repaint();
    }

    get bounds() { return this._bounds; }
    get viewBounds() { return this._viewBounds; }

    repaint() {
        var stage = this;
        if (this._mainCanvas.needsRepaint) {
            this._mainCanvas.clear();
            this._mainIndex.forShapesInViewPort(this.viewPort, function(shape) {
                shape.applyStyles(stage._mainCanvas.context);
                shape.draw(stage._mainCanvas.context);
                if (shape == stage.selectedShape ||
                    (stage.hitInfo != null && stage.hitInfo.shape == shape)) {
                    shape.drawControls(stage._mainCanvas.context);
                }
            });
        }
        if (this._editCanvas.needsRepaint) {
            this._editCanvas.clear();
            this._editIndex.forShapesInViewPort(this.viewPort, function(shape) {
                shape.applyStyles(stage._editCanvas.context);
                shape.draw(stage._editCanvas.context);
                if (shape == stage.selectedShape ||
                    (stage.hitInfo != null && stage.hitInfo.shape == shape)) {
                    shape.drawControls(stage._editCanvas.context);
                }
            });
        }
    }

    draw(context) {
        this.scene._layers.forEach(function(layer, index) {
            layer.draw(context);
        });
    }

    // Make mouse handlers proxy to the canvas
    // TODO - make source be the SceneCanvas instead of CanvasElement
    mouseover(handler) { this._editCanvas.mouseover(handler); return this; } 
    mouseout(handler) { this._editCanvas.mouseout(handler); return this; } 
    mouseenter(handler) { this._editCanvas.mouseenter(handler); return this; } 
    mouseleave(handler) { this._editCanvas.mouseleave(handler); return this; } 
    mousedown(handler) { this._editCanvas.mousedown(handler); return this; } 
    mouseup(handler) { this._editCanvas.mouseup(handler); return this; } 
    mousemove(handler) { this._editCanvas.mousemove(handler); return this; }

    ////  Local handling of mouse/touch events
    // What are the states our stage can be in?
    // 1. Plain rendering - all shapes/lines etc are drawn
    // 2. Transformation mode
    //      - shape being moved
    //      - shape being sized
    //      - shape's control point being moved (could result in above two)
    // We would have 
    _onMouseDown(event) {
        this.currX = this.downX = event.offsetX;
        this.currY = this.downY = event.offsetY;

        // Get the shape that is under the mouse
        this.hitInfo = this._mainIndex.getHitInfo(this.downX, this.downY);
        if (this.hitInfo != null) {
            this._editCanvas.cursor = this.hitInfo.cursor;
            this.selectedShape = this.hitInfo.shape;

            // Get the shapes related to this shape that will change as we transform this shape
            this.relatedShapes = [];

            // remove the selected and related shapes from the mainIndex and add it to the edited index
            this._mainIndex.remove(this.selectedShape);
            this._mainIndex.removeShapes(this.relatedShapes);
            this._editIndex.add(this.selectedShape);
            this._editIndex.addShapes(this.relatedShapes);
            console.log("OnDown mainIndex Shapes: ", this._mainIndex._allShapes, this._mainIndex._shapeIndexes);
            console.log("OnDown editIndex Shapes: ", this._editIndex._allShapes, this._editIndex._shapeIndexes);
            this.repaint();
        }
        console.log("HitInfo: ", this.hitInfo);
    }

    _onMouseUp(event) {
        this.downX = null;
        this.downY = null;

        // Add selected and related shapes back to main index from edit index
        if (this.selectedShape != null) {
            this._editIndex.remove(this.selectedShape);
            this._mainIndex.add(this.selectedShape);
        }
        this._editIndex.removeShapes(this.relatedShapes);
        this._mainIndex.addShapes(this.relatedShapes);
        this.selectedShape = null;
        this.relatedShapes = [];
        console.log("OnOver mainIndex Shapes: ", this._mainIndex._allShapes, this._mainIndex._shapeIndexes);
        console.log("OnOver editIndex Shapes: ", this._editIndex._allShapes, this._editIndex._shapeIndexes);
        this.repaint();
    }

    _onMouseMove(event) { 
        this.currX = event.offsetX;
        this.currY = event.offsetY;
        if (this.hitInfo != null) {
            var newHitInfo = this.hitInfo.shape.getHitInfo(this.currX, this.currY);
            if (newHitInfo != null && newHitInfo.shape == this.hitInfo.shape) {
                this._editCanvas.cursor = newHitInfo.cursor;
            } else {
                this._editCanvas.cursor = "auto";
            }
        }

        if (this.downX != null) {
            // We are in a position to "transform" the entry pressed
            if (this.hitInfo != null) {
                this.hitInfo.shape.applyHitChanges(this.hitInfo,
                                                   this.downX, this.downY, this.currX, this.currY);
                this.repaint();
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

    trigger(event) {
        console.log("Event: ", event);
        if (event.name == "ShapeAdded") {
            this._mainIndex.add(event.shape);
        } else if (event.name == "ShapeRemoved") {
            this._mainIndex.remove(event.shape);
        }
    }
}
