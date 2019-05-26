import { Geom } from "../Geom/index"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;
let Bounds = Geom.Models.Bounds;

export class Arc extends models.Shape {
    private created : boolean = false
    private _x0 : number = 0;
    private _y0 : number = 0;
    private _x1 : number = 0;
    private _y1 : number = 0;
    private _x2 : number = 0;
    private _y2 : number = 0;
    constructor(configs : any) {
        super((configs = configs || {}));
        if (configs.x0 && configs.y0) {
            this.created = true;
        } else {
            this._x0 = configs.x0 || 0;
            this._y0 = configs.y0 || 0;
            this._x1 = configs.x1 || 0;
            this._y1 = configs.y1 || 0;
            this._x2 = configs.x2 || 0;
            this._y2 = configs.y2 || 0;
        }
    }

    _setBounds(newBounds : Bounds) {
        if (!this.created) {
            // creating by bounds
            this._x0 = newBounds.left;
            this._y0 = newBounds.bottom;
            this._x1 = newBounds.centerX;
            this._y1 = newBounds.top;
            this._x2 = newBounds.right;
            this._y2 = newBounds.bottom;
            this.created = true;
        } else {
            var oldBounds = this.boundingBox;
            var sx = newBounds.width / oldBounds.width;
            var sy = newBounds.height / oldBounds.height;
            this._x0 = newBounds.x + ((this._x0 - oldBounds.x) * sx)
            this._y0 = newBounds.y + ((this._y0 - oldBounds.y) * sy)
            this._x1 = newBounds.x + ((this._x1 - oldBounds.x) * sx)
            this._y1 = newBounds.y + ((this._y1 - oldBounds.y) * sy)
            this._x2 = newBounds.x + ((this._x2 - oldBounds.x) * sx)
            this._y2 = newBounds.y + ((this._y2 - oldBounds.y) * sy);
        }
    }

    _evalBoundingBox() {
        if (!this.created) {
            // shape hasnt been created yet
            return new Geom.Models.Bounds();
        }
        var left = Math.min(this._x0, this._x1);
        var top = Math.min(this._y0, this._y1);
        var right = Math.max(this._x0, this._x1);
        var bottom = Math.max(this._y0, this._y1);
        return new Geom.Models.Bounds(left, top, right - left, bottom - top);
    }

    get className() { return "Arc"; };

    draw(ctx : any) {
        ctx.beginPath();
        ctx.moveTo(this._x0, this._y0);
        ctx.arcTo(this._x1, this._y1);
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class ArcController extends controller.ShapeController<Arc> {
    constructor(shape : Arc) {
        super(shape);
    }

    _evalControlPoints() {
        var arc = this.shape;
        return [new ControlPoint(arc.x0, arc.y0, HitType.CONTROL, 0, "grab"),
                new ControlPoint(arc.x1, arc.y1, HitType.CONTROL, 1, "grab")]
    }

    _checkMoveHitInfo(x, y) {
        var boundingBox = this.shape.boundingBox;
        if (boundingBox.containsPoint(x, y)) {
            return new HitInfo(this.shape, HitType.MOVE, 0, "move");
        }
        return null;
    }

    applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY) {
        var deltaX = currX - downX;
        var deltaY = currY - downY;
        var arc = this.shape;
        if (hitInfo.hitType == HitType.MOVE) {
            arc.x0 = savedInfo.downX0 + deltaX;
            arc.y0 = savedInfo.downY0 + deltaY;
            arc.x1 = savedInfo.downX1 + deltaX;
            arc.y1 = savedInfo.downY1 + deltaY;
            arc.x2 = savedInfo.downX2 + deltaX;
            arc.y2 = savedInfo.downY2 + deltaY;
        }
        else if (hitInfo.hitIndex == 0) {
            arc.x0 = savedInfo.downX0 + deltaX;
            arc.y0 = savedInfo.downY0 + deltaY;
        } else if (hitInfo.hitIndex == 1) {
            arc.x1 = savedInfo.downX1 + deltaX;
            arc.y1 = savedInfo.downY1 + deltaY;
        } else if (hitInfo.hitIndex == 2) {
            arc.x2 = savedInfo.downX2 + deltaX;
            arc.y2 = savedInfo.downY2 + deltaY;
        }
        arc._boundingBox = null;
        arc.markTransformed();
    }

    snapshotFor(hitInfo) {
        return {
            downX0: this.shape.x0,
            downY0: this.shape.y0,
            downX1: this.shape.x1,
            downY1: this.shape.y1,
        };
    }

    drawControls(ctx) {
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.arcWidth = 2;
        ctx.beginPath();
        ctx.arc(this._x0, this._y0, controller.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this._x1, this._y1, controller.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}
