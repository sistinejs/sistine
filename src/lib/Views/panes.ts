
import { Shape } from "../Core/models"
import { Nullable, Timestamp } from "../Core/types"
import { Stage } from "./stage"
import { VirtualContext } from "./context"
import { getcssint } from "../Utils/dom"
import { Point, Bounds } from "../Geom/models"

/**
 * A Pane is a wrapper over our drawing element/context.   Shapes can be drawn at 
 * exactly one pane at a time.  Panes help us give the idea of 'depth' in our stage 
 * so we can different shapes based on their level of intensity (in activity and
 * refresh rates etc).
 */
export class Pane {
    readonly viewBounds : Bounds = new Bounds();
    zoom : number = 1.0;
    drawTime : Timestamp = 0;
    protected _configs : any;
    protected _name : string;
    protected _stage : Stage;
    protected _refCount = 1;
    protected _offset : Point = new Point();
    protected _needsRepaint : boolean = true;
    protected _divId : string;
    protected _canvasId : string;
    protected _parentDiv : JQuery<HTMLElement>;
    protected _canvas : JQuery<HTMLElement>;
    protected _rawContext : any;
    protected _virtualContext : VirtualContext;

    constructor(name : string, stage : Stage, canvasId : string, configs? : any) {
        this._configs = configs || {};
        this._name = name;
        this._stage = stage;
        this._parentDiv = $("#" + stage.divId);
        this._canvasId = canvasId;
        this._ensureCanvas();
    }

    draw(_ctx : any) { }

    get(name : string) : any {
        return this._configs[name];
    }

    set(property : any, newValue : any, _force : boolean = false) {
        var oldValue = this._configs[property];
        if (oldValue != newValue) {
            this._configs[property] = newValue;
        }
        return this;
    }

    setZoom(z : number) {
        if (z < 0) z = 1;
        if (z > 10) z = 10;
        if (this.zoom != z) {
            this.zoom = z;
            this.viewBoundsChanged();
        }
    }

    get offset() { return this._offset; }
    setOffset(x: number, y: number) {
        if (this._offset.x != x || this._offset.y != y) {
            this._offset = new Point(x, y);
            this.viewBoundsChanged();
        }
    }

    /**
     * Converts world coordinates to screen coordinates.
     */
    toScreen(x : number, y : number, result? : Point) : Point  {
        result = result || new Point(x, y);
        result.x = this.zoom * (x - this.offset.x);
        result.y = this.zoom * (y - this.offset.y);
        return result;
    }

    toWorld(x : number, y : number, result : Nullable<Point> = null) : Point  {
        if (result == null) result = new Point(x, y);
        result.x = (x / this.zoom) + this.offset.x;
        result.y = (y / this.zoom) + this.offset.y;
        return result;
    }

    acquire() { this._refCount += 1; }
    release() {
        if (this._refCount > 0) {
            this._refCount -= 1;
        }
        return this._refCount <= 0;
    }

    get name() { return this._name; }
    get divId() { return this._stage.divId; }
    get canvasId() { return this._canvasId; }
    get rawContext() { return this._rawContext; }
    get virtualContext() { return this._virtualContext; }
    get context() { return this._virtualContext; }
    get element() { return this._canvas as JQuery<HTMLElement>; }

    /**
     * Removes this canvas and cleans ourselves up.
     */
    remove() {
        this.element.remove();
    }

    /**
     * Clears the pane completely.
     */
    clear(ctx : any) {
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

    paint(force = false) {
        if (force || this.needsRepaint) {
            var ctx = this.virtualContext;
            this.clear(ctx);
            var startTime = Date.now();
            ctx.save();
            this.draw(ctx);
            ctx.restore();
            this.drawTime = Date.now() - startTime;
            this.needsRepaint = false;
        }
    }

    _ensureCanvas() {
        var divId = this.divId;
        this._canvas = $("<canvas style='position: absolute' id = '" + this._canvasId + "'/>");
        this._parentDiv.append(this._canvas);
        this._rawContext = (this._canvas[0] as HTMLCanvasElement).getContext("2d");
        this._virtualContext = new VirtualContext(this._rawContext);
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

    get width() { return this._canvas.width() as number; }
    get height() { return this._canvas.height() as number; }

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
        var finalHeight = ($parent.height() as number) - vert_padding;
        var finalWidth = ($parent.width()  as number) - horiz_padding;
        elem.height(finalHeight);
        elem.width(finalWidth);
        elem[0].width = finalWidth;
        elem[0].height = finalHeight;
        this.viewBoundsChanged();
    }

    private viewBoundsChanged() {
        var p1 = this.toWorld(0, 0);
        var p2 = this.toWorld(this.width, this.height);
        this.viewBounds.x = p1.x;
        this.viewBounds.y = p1.y;
        this.viewBounds.right = p2.x;
        this.viewBounds.bottom = p2.y;
        // this.transformChanged = true;
        // if (this.transformChanged) {
            var ctx = this.virtualContext;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(this.zoom, this.zoom);
            ctx.translate(-this.offset.x, -this.offset.y);
            // this.transformChanged = false;
        // }
        this.needsRepaint = true;
    }
}

export class ShapesPane extends Pane {
    constructor(name : string, stage : Stage, canvasId : string) {
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
    draw(ctx : any) {
        var stage = this._stage;
        var scene = stage.scene;
        this.drawShape(ctx, scene, stage, this.viewBounds);
    }

    drawShape(ctx : any, shape : Shape, stage : Stage, clipBounds : Bounds) {
        // TODO: Update clip boundingBox as necessary
        if (!shape.isVisible) return;
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
            var cx = 0; // shape.boundingBox.centerX;
            var cy = 0; // shape.boundingBox.centerY;
            // ctx.translate(cx, cy);
            // ctx.rotate((Math.PI * shape.get("angle")) / 180.0);
            ctx.translate(shape.boundingBox.x - cx, shape.boundingBox.y - cy);
            shape.forEachChild(function(child, _index, self) {
                self.drawShape(ctx, child, stage, clipBounds);
                return true;
            }, this);
            ctx.translate(cx - shape.boundingBox.x, cy - shape.boundingBox.y);
            // ctx.restore();
        }
        shape.revertStyles(ctx);
        shape.revertTransforms(ctx);
        if (belongsToPane && stage.selection.contains(shape)) {
            shape.controller.drawControls(ctx);
        }
        // if (belongsToPane && stage.selection.contains(shape)) shape.drawControls(ctx);
    }

    _ensureParentTransform(ctx : any, shape : Shape) {
        if (shape) {
            this._ensureParentTransform(ctx, shape.parent as Shape);
            var angle = shape.get("angle") as number;
            var cx = shape.boundingBox.centerX;
            var cy = shape.boundingBox.centerY;
            ctx.translate(cx, cy);
            ctx.rotate((Math.PI * angle) / 180.0);
            ctx.translate(shape.boundingBox.x - cx, shape.boundingBox.y - cy);
        }
    }
}

export class BGPane extends Pane {
    private _lineSpacing = 50;
    private _lineColor = "darkGray";
    constructor(name : string, stage : Stage, canvasId : string, configs? : any) {
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

    draw(_ctx : any) {
        var ctx = this.virtualContext;
        var space = this.lineSpacing;
        ctx.strokeStyle = this.lineColor;

        ctx.beginPath();
        var startX = this.viewBounds.left;
        var startY = this.offset.y;
        var endX = this.viewBounds.right;
        var endY = this.viewBounds.bottom;
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
