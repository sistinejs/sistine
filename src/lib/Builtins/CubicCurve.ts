
import { Geom } from "../Geom/index"
import * as geom from "../Geom/models"
import * as models from "../Core/models"
import * as controller from "../Core/controller"
import Nullable from "../Core/types"

let ControlPoint = controller.ControlPoint;
type Bounds = geom.Bounds;
type HitInfo = controller.HitInfo;
let HitType = controller.HitType;

export class CubicCurve extends models.Shape {
    private created : boolean = false;
    private _x0 : number = 0;
    private _y0 : number = 0;
    private _x1 : number = 0;
    private _y1 : number = 0;
    private _x2 : number = 0;
    private _y2 : number = 0;
    private _x3 : number = 0;
    private _y3 : number = 0;
    closed : boolean = false;
    constructor(configs : any) {
        super((configs = configs || {}));
        this.closed = configs.closed || false;
        if (configs.x0 && configs.y0) {
            this.created = true;
        } else {
            this._x0 = configs.x0 || 0;
            this._y0 = configs.y0 || 0;
            this._x1 = configs.x1 || 0;
            this._y1 = configs.y1 || 0;
            this._x2 = configs.x2 || 0;
            this._y2 = configs.y2 || 0;
            this._x3 = configs.x3 || 0;
            this._y3 = configs.y3 || 0;
        }
    }

    get x0() : number { return this.x0; }
    get y0() : number { return this.y0; }
    get x1() : number { return this.x1; }
    get y1() : number { return this.y1; }
    get x2() : number { return this.x2; }
    get y2() : number { return this.y2; }
    get x3() : number { return this.x3; }
    get y3() : number { return this.y3; }
    set x0(value : number) { this._x0 = value; this.markTransformed(); }
    set y0(value : number) { this._y0 = value; this.markTransformed(); }
    set x1(value : number) { this._x1 = value; this.markTransformed(); }
    set y1(value : number) { this._y1 = value; this.markTransformed(); }
    set x2(value : number) { this._x2 = value; this.markTransformed(); }
    set y2(value : number) { this._y2 = value; this.markTransformed(); }
    set x3(value : number) { this._x3 = value; this.markTransformed(); }
    set y3(value : number) { this._y3 = value; this.markTransformed(); }

    _setBounds(newBounds : Bounds) {
        if (!this.created) {
            // creating by bounds
            var w4 = newBounds.width * 0.25;
            this._x0 = newBounds.left;
            this._y0 = newBounds.bottom;
            this._x1 = newBounds.left + w4;
            this._y1 = newBounds.top;
            this._x2 = newBounds.right - w4;
            this._y2 = newBounds.bottom;
            this._x3 = newBounds.right;
            this._y3 = newBounds.top;
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
            this._x3 = newBounds.x + ((this._x3 - oldBounds.x) * sx)
            this._y3 = newBounds.y + ((this._y3 - oldBounds.y) * sy);
        }
    }

    _evalBoundingBox() {
        if (!this.created) {
            // shape hasnt been created yet
            return new Bounds();
        }
        var result = Geom.Utils.boundsOfCubicCurve(this._x0, this._y0,
                                              this._x1, this._y1,
                                              this._x2, this._y2,
                                              this._x3, this._y3);
        return new Geom.Models.Bounds(result.left, result.top,
                                      result.right - result.left,
                                      result.bottom - result.top);
    }

    draw(ctx : any) {
        ctx.beginPath();
        ctx.moveTo(this._x0, this._y0);
        ctx.bezierCurveTo(this._x1, this._y1, this._x2, this._y2, this._x3, this._y3);
        if (this.closed) {
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class CubicCurveController extends controller.ShapeController<CubicCurve> {
    _evalControlPoints() : Array<controller.ControlPoint> {
        var parents = super._evalControlPoints();
        var curve = this.shape;
        var ours = [new controller.ControlPoint(curve.x0, curve.y0, HitType.CONTROL, 0, "grab"),
                    new controller.ControlPoint(curve.x1, curve.y1, HitType.CONTROL, 1, "grab"),
                    new controller.ControlPoint(curve.x2, curve.y2, HitType.CONTROL, 2, "grab"),
                    new controller.ControlPoint(curve.x3, curve.y3, HitType.CONTROL, 3, "grab")]
        return ours.concat(parents);
    }

    _checkMoveHitInfo(x : number, y : number) : Nullable<HitInfo> {
        var boundingBox = this.shape.boundingBox;
        if (boundingBox.containsPoint(x, y)) {
            return new controller.HitInfo(this.shape, HitType.MOVE, 0, "move");
        }
        return null;
    }

    applyHitChanges(hitInfo : HitInfo, savedInfo : any,
                    downX : number, downY : number,
                    currX : number, currY : number) {
        if (hitInfo.hitType != HitType.CONTROL) {
            return super.applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY);
        }
        var deltaX = currX - downX;
        var deltaY = currY - downY;
        var cubic = this.shape;
        if (hitInfo.hitType == HitType.MOVE) {
            cubic.x0 = savedInfo.downX0 + deltaX;
            cubic.y0 = savedInfo.downY0 + deltaY;
            cubic.x1 = savedInfo.downX1 + deltaX;
            cubic.y1 = savedInfo.downY1 + deltaY;
            cubic.x2 = savedInfo.downX2 + deltaX;
            cubic.y2 = savedInfo.downY2 + deltaY;
            cubic.x3 = savedInfo.downX3 + deltaX;
            cubic.y3 = savedInfo.downY3 + deltaY;
        }
        else if (hitInfo.hitIndex == 0) {
            cubic.x0 = savedInfo.downX0 + deltaX;
            cubic.y0 = savedInfo.downY0 + deltaY;
        } else if (hitInfo.hitIndex == 1) {
            cubic.x1 = savedInfo.downX1 + deltaX;
            cubic.y1 = savedInfo.downY1 + deltaY;
        } else if (hitInfo.hitIndex == 2) {
            cubic.x2 = savedInfo.downX2 + deltaX;
            cubic.y2 = savedInfo.downY2 + deltaY;
        } else {
            cubic.x3 = savedInfo.downX3 + deltaX;
            cubic.y3 = savedInfo.downY3 + deltaY;
        }
        cubic.markTransformed();
    }

    snapshotFor(hitInfo : controller.HitInfo) : controller.HitInfoSnapshot {
        var out = super.snapshotFor(hitInfo);
        out.downX0 = this.shape.x0;
        out.downY0 = this.shape.y0;
        out.downX1 = this.shape.x1;
        out.downY1 = this.shape.y1;
        out.downX2 = this.shape.x2;
        out.downY2 = this.shape.y2;
        out.downX3 = this.shape.x3;
        out.downY3 = this.shape.y3;
        return out;
    }

    drawControls(ctx : any) {
        super.drawControls(ctx);
        var shape = this.shape;
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.cubicWidth = 2;

        ctx.beginPath();
        ctx.arc(shape.x0, shape.y0, controller.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(shape.x1, shape.y1, controller.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(shape.x2, shape.y2, controller.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(shape.x3, shape.y3, controller.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}
