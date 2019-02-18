
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
        this._offsetX = this._offsetY = 0;
        this._parentDiv = $("#" + stage.divId);
        this._ensureCanvas();
        this._refCount = 1;
    }

    get zoom() { return this._zoom; }
    setZoom(z) {
        if (z < 0) z = 1;
        if (z > 10) z = 10;
        if (this._zoom != z) {
            this._zoom = z;
            this.needsRepaint = true;
        }
    }

    get offsetX() { return this._offsetX; }
    get offsetY() { return this._offsetY; }
    setOffset(x, y) {
        if (x < this._bounds.x) x = this._bounds.x;
        if (y < this._bounds.y) y = this._bounds.y;
        if (x > this._bounds.right) {
            x = this._bounds.right;
        }
        if (y > this._bounds.bottom) {
            y = this._bounds.bottom;
        }
        if (this._offsetX != x || this._offsetY != y) {
            this._offsetX = x;
            this._offsetY = y;
            this.needsRepaint = true;
        }
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
        this._canvas = $("<canvas style='position: absolute' id = '" + this._canvasId + "'/>");
        this._parentDiv.append(this._canvas);
        this.layout();
        this._context = this._canvas[0].getContext("2d");
    }

    get needsRepaint() {
        return this._needsRepaint;
    }

    set needsRepaint(n) {
        this._needsRepaint = n;
    }

    get width() { return this._canvas.width(); }
    get height() { return this._canvas.height(); }

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
        this.needsRepaint = true;
    }
}

export class ShapesPane extends Pane {
    constructor(name, stage, canvasId) {
        super(name, stage, canvasId);
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
            this.needsRepaint = false;
        }
    }
}

export class BGPane extends Pane {
    constructor(name, stage, canvasId) {
        super(name, stage, canvasId);
        // Space between ruler lines on the background
        this._lineSpacing = 50;
        this._lineColor = "darkGray";
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

    clear() {
        var ctx = this.context;
        ctx.fillStyle = "#c6cbd3";
        ctx.fillRect(0, 0, this.width, this.height);
    }

    repaint(force) {
        if (force || this.needsRepaint) {
            var stage = this._stage;
            this.clear();
            var ctx = this.context;
            var width = this.width;
            var height = this.height;
            var zoom = this.zoom;
            var space = this.lineSpacing * zoom;
            ctx.strokeStyle = this.lineColor;

            ctx.beginPath();
            var startX = -zoom * this.offsetX;
            var startY = -zoom * this.offsetY;
            // Horiz lines
            for (var currY = startY; currY < height; currY += space) {
                if (currY > 0) {
                    ctx.moveTo(0, currY);
                    ctx.lineTo(width, currY);
                }
		    }
            for (var currX = startX; currX < width; currX += space) {
                if (currX > 0) {
                    ctx.moveTo(currX, 0);
                    ctx.lineTo(currX, height);
                }
		    }
            ctx.stroke();
            this.needsRepaint = false;
        }
    }
}
