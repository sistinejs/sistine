
import * as geom from "../Geom/models"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class Line extends models.Shape {
    private created : boolean = false
    private _x0 : number = 0;
    private _y0 : number = 0;
    private _x1 : number = 0;
    private _y1 : number = 0;
    constructor(configs : any) {
        super((configs = configs || {}));
        if (configs.x0 && configs.y0) {
            this.created = true;
        } else {
            this._x0 = configs.x0 || 0;
            this._y0 = configs.y0 || 0;
            this._y1 = configs.y1 || 0;
            this._x1 = configs.x1 || 0;
        }
    }

    get x0() : number { return this.x0; }
    get y0() : number { return this.y0; }
    get x1() : number { return this.x1; }
    get y1() : number { return this.y1; }
    set x0(value : number) { this._x0 = value; this.markTransformed(); }
    set y0(value : number) { this._y0 = value; this.markTransformed(); }
    set x1(value : number) { this._x1 = value; this.markTransformed(); }
    set y1(value : number) { this._y1 = value; this.markTransformed(); }

    _setBounds(newBounds : geom.Bounds) {
        this._x0 = newBounds.x;
        this._y0 = newBounds.y;
        this._x1 = newBounds.x2;
        this._y1 = newBounds.y2;
    }

    _evalBoundingBox() {
        var left = Math.min(this._x0, this._x1);
        var right = Math.max(this._x0, this._x1);
        var top = Math.min(this._y0, this._y1);
        var bottom = Math.max(this._y0, this._y1);
        return new geom.Bounds(left, top, right - left, bottom - top);
    }

    draw(ctx : any) {
        ctx.beginPath();
        ctx.moveTo(this._x0, this._y0);
        ctx.lineTo(this._x1, this._y1);
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class LineController extends controller.ShapeController<Line> {
    _evalControlPoints() {
        var line = this.shape;
        return [new ControlPoint(line.x0, line.y0, HitType.CONTROL, 0, "grab"),
                new ControlPoint(line.x1, line.y1, HitType.CONTROL, 1, "grab")]
    }

    drawControls(ctx : any) {
        var line = this.shape;
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(line.x0, line.y0, controller.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(line.x1, line.y1, controller.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    _checkMoveHitInfo(x : number, y : number) {
        var boundingBox = this.shape.boundingBox;
        if (boundingBox.containsPoint(x, y)) {
            return new HitInfo(this.shape, HitType.MOVE, 0, "move");
        }
        return null;
    }

    applyHitChanges(hitInfo : controller.HitInfo, savedInfo : any,
                    downX : number, downY : number, currX : number, currY : number) {
        var deltaX = currX - downX;
        var deltaY = currY - downY;
        var line = this.shape;
        if (hitInfo.hitType == HitType.MOVE) {
            line.x0 = savedInfo.downX0 + deltaX;
            line.y0 = savedInfo.downY0 + deltaY;
            line.x1 = savedInfo.downX1 + deltaX;
            line.y1 = savedInfo.downY1 + deltaY;
        }
        else if (hitInfo.hitIndex == 1) {
            line.x0 = savedInfo.downX0 + deltaX;
            line.y0 = savedInfo.downY0 + deltaY;
        } else {
            line.x1 = savedInfo.downX1 + deltaX;
            line.y1 = savedInfo.downY1 + deltaY;
        }
        line.markTransformed();
    }

    snapshotFor(hitInfo : controller.HitInfo) : controller.HitInfoSnapshot {
        var out = super.snapshotFor(hitInfo);
        out.downX0 = this.shape.x0;
        out.downY0 = this.shape.y0;
        out.downX1 = this.shape.x1;
        out.downY1 = this.shape.y1;
        return out;
    }
}
