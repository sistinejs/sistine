
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
    constructor(name, stage, canvasId, configs) {
        this._configs = configs || {};
        this._name = name;
        this._stage = stage;
        this._needsRepaint = true;
        this._divId = stage.divId;
        this._parentDiv = $("#" + stage.divId);
        this._canvasId = canvasId;
        this._canvas = null;
        this._zoom = 1.0;
        this._offset = new core.Point();
        this._viewBounds = new core.Bounds();
        this._ensureCanvas();
        this._refCount = 1;
    }

    get(name) {
        return this._configs[name];
    }

    set(property, newValue, force) {
        var oldValue = this._configs[property];
        if (oldValue != newValue) {
            this._configs[property] = newValue;
        }
        return this;
    }

    get zoom() { return this._zoom; }
    setZoom(z) {
        if (z < 0) z = 1;
        if (z > 10) z = 10;
        if (this._zoom != z) {
            this._zoom = z;
            this._viewBoundsChanged();
        }
    }

    get offset() { return this._offset; }
    setOffset(x, y) {
        if (this._offset.x != x || this._offset.y != y) {
            this._offset = new core.Point(x, y);
            this._viewBoundsChanged();
        }
    }

    /**
     * Converts world coordinates to screen coordinates.
     */
    toScreen(x, y, result) {
        result = result || new core.Point(x, y);
        result.x = this.zoom * (x - this.offset.x);
        result.y = this.zoom * (y - this.offset.y);
        return result;
    }

    toWorld(x, y, result) {
        result = result || new core.Point(x, y);
        result.x = (x / this.zoom) + this.offset.x;
        result.y = (y / this.zoom) + this.offset.y;
        return result;
    }

    acquire() { this._refCount += 1; }
    release() { this._refCount -= 1; }

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

    /**
     * Clears the pane completely.
     */
    clear(ctx) {
        var p1 = this.toWorld(0, 0);
        var p2 = this.toWorld(this.width, this.height);
        var fillStyle = this.get("fillStyle");
        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        } else {
            ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        }
    }

    paint(force) {
        if (force || this.needsRepaint) {
            var ctx = this.context;
            this.clear(ctx);
            ctx.save();
            this.draw(ctx);
            ctx.restore();
            this.needsRepaint = false;
        }
    }

    _ensureCanvas() {
        var divId = this._divId;
        this._canvas = $("<canvas style='position: absolute' id = '" + this._canvasId + "'/>");
        this._parentDiv.append(this._canvas);
        this._context = this._canvas[0].getContext("2d");
        this.layout();
    }

    get needsRepaint() {
        return this._needsRepaint;
    }

    /**
     * Ensures that a given region needs repainting.
     */
    set needsRepaint(n) {
        this._needsRepaint = n;
    }

    get width() { return this._canvas.width(); }
    get height() { return this._canvas.height(); }

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
        this._viewBoundsChanged();
    }


    _viewBoundsChanged() {
        var p1 = this.toWorld(0, 0);
        var p2 = this.toWorld(this.width, this.height);
        this._viewBounds.x = p1.x;
        this._viewBounds.y = p1.y;
        this._viewBounds.right = p2.x;
        this._viewBounds.bottom = p2.y;
        // this.transformChanged = true;
        // if (this.transformChanged) {
            var ctx = this.context;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(this.zoom, this.zoom);
            ctx.translate(-this.offset.x, -this.offset.y);
            // this.transformChanged = false;
        // }
        this.needsRepaint = true;
    }
}

export class ShapesPane extends Pane {
    constructor(name, stage, canvasId) {
        super(name, stage, canvasId);
    }

    /**
     * Our drawing needs to be smarter here.
     * We currently would have sets of regions that need to be
     * repainted.  But since we may not be doing a recursive
     * tree walking, we need to ensure that when a Shape "S" is being 
     * rendered, all its parent/ancestor nodes' transforms have 
     * already been applied.
    *
    * So we have the hierarchy:
    *
    * A -> B -> C
    * |    |    |--- D
    * |    |    |--- E
    * |    |--> F
    * |         |--- H
    * |    |--> G
    * |         |--- I
    * |--- I
    * |--- J
    *      |--- K
    *      |--- L
    *
    * If these shapes can be arrived at any order, then we need following to be met:
    * All ancestors are drawn first.
    * When a node, say D is draw, its ancestors' transforms are applied.
    *
    * For this optimization we definitely need a "topological" sorting of nodes, 
    * This can be achieved by simply tree walking the scene graph if the entire
    * graph is to be drawn otherwise we need better indexing.
    */
    draw(ctx) {
        var pane = this;
        var stage = this._stage;
        var touchHandler = stage.touchHandler;
        var byWalking = true;
        if (byWalking) {
            var scene = stage.scene;
            for (var i = 0;i < scene.layers.length;i++) {
                var layer = scene.layers[i];
                this.drawShape(ctx, layer, stage, this.viewPort);
            }
        } else {
            stage.shapeIndex.forShapesInViewPort(this, this.viewPort, function(shape) {
                if (!shape.isVisible) return ;
                ctx.save();
                pane._ensureParentTransform(ctx, shape.parent);
                shape.applyTransforms(ctx);
                shape.applyStyles(ctx);
                shape.draw(ctx);
                if (touchHandler != null && stage.selection.contains(shape)) {
                    shape.drawControls(ctx);
                }
                shape.revertTransforms(ctx);
                ctx.restore();
            });
        }
    }

    drawShape(ctx, shape, stage, clipBounds) {
        // TODO: Update clip bounds as necessary
        if (!shape.isVisible) return;
        var touchHandler = stage.touchHandler;
        var belongsToPane = shape.pane == this.name;
        shape.applyTransforms(ctx);
        shape.applyStyles(ctx);
        if (belongsToPane) {
            shape.draw(ctx);
        }
        // Now draw all the children
        if (shape.hasChildren) {
            // ctx.save();
            // var angle = shape.get("angle");
            var cx = 0; // shape.bounds.centerX;
            var cy = 0; // shape.bounds.centerY;
            // ctx.translate(cx, cy);
            // ctx.rotate((Math.PI * shape.get("angle")) / 180.0);
            ctx.translate(shape.bounds.x - cx, shape.bounds.y - cy);
            shape.forEachChild(function(child, index, self) {
                self.drawShape(ctx, child, stage, clipBounds);
            }, this);
            ctx.translate(cx - shape.bounds.x, cy - shape.bounds.y);
            // ctx.restore();
        }
        if (belongsToPane) {
            if (touchHandler != null && stage.selection.contains(shape)) {
                shape.drawControls(ctx);
            }
        }
        shape.revertTransforms(ctx);
    }

    _ensureParentTransform(ctx, shape) {
        if (shape) {
            this._ensureParentTransform(ctx, shape.parent);
            var angle = shape.get("angle");
            var cx = shape.bounds.centerX;
            var cy = shape.bounds.centerY;
            ctx.translate(cx, cy);
            ctx.rotate((Math.PI * shape.get("angle")) / 180.0);
            ctx.translate(shape.bounds.x - cx, shape.bounds.y - cy);
        }
    }
}

export class BGPane extends Pane {
    constructor(name, stage, canvasId, configs) {
        super(name, stage, canvasId, configs);
        // Space between ruler lines on the background
        this._lineSpacing = 50;
        this._lineColor = "darkGray";
        this.set("fillStyle", this.get("fillStyle") || "#c6cbd3");
    }

    get lineSpacing() { return this._lineSpacing; }
    get lineColor() { return this._lineColor; }
    set lineSpacing(value) {
        if (this._lineSpacing != value) {
            this._lineSpacing = value;
            this.needsRepaint = true;
        }
    }
    set lineColor(value) {
        if (this._lineColor != value) {
            this._lineColor = value;
            this.needsRepaint = true;
        }
    }

    draw(ctx) {
        var ctx = this.context;
        var width = this.width;
        var height = this.height;
        var zoom = this.zoom;
        var space = this.lineSpacing;
        ctx.strokeStyle = this.lineColor;

        ctx.beginPath();
        var startX = this._viewBounds.left;
        var startY = this.offset.y;
        var endX = this._viewBounds.right;
        var endY = this._viewBounds.bottom;
        // Horiz lines
        for (var currY = 0; currY < endY; currY += space) {
            ctx.moveTo(startX, currY);
            ctx.lineTo(endX, currY);
        }
        for (var currY = -space; currY > startY; currY -= space) {
            ctx.moveTo(startX, currY);
            ctx.lineTo(endX, currY);
        }

        // Vert lines
        for (var currX = 0; currX < endX; currX += space) {
            ctx.moveTo(currX, startY);
            ctx.lineTo(currX, endY);
        }
        for (var currX = -space; currX > startX; currX -= space) {
            ctx.moveTo(currX, startY);
            ctx.lineTo(currX, endY);
        }
        ctx.stroke();
    }
}
