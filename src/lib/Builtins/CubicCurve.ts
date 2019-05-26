
import { Geom } from "../Geom/index"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class CubicCurve extends models.Shape {
    private created : boolean = false;
    readonly x0 : number = 0;
    readonly y0 : number = 0;
    readonly x1 : number = 0;
    readonly y1 : number = 0;
    readonly x2 : number = 0;
    readonly y2 : number = 0;
    readonly x3 : number = 0;
    readonly y3 : number = 0;
    constructor(configs : any) {
        super((configs = configs || {}));
        this.closed = configs.closed || false;
        if (configs.x0 && configs.y0) {
            this.created = true;
        } else {
            this.x0 = configs.x0 || 0;
            this.y0 = configs.y0 || 0;
            this.x1 = configs.x1 || 0;
            this.y1 = configs.y1 || 0;
            this.x2 = configs.x2 || 0;
            this.y2 = configs.y2 || 0;
            this.x3 = configs.x3 || 0;
            this.y3 = configs.y3 || 0;
        }
    }

    _setBounds(newBounds) {
        if (!this._created) {
            // creating by bounds
            var w4 = newBounds.width * 0.25;
            this.x0 = newBounds.left;
            this.y0 = newBounds.bottom;
            this.x1 = newBounds.left + w4;
            this.y1 = newBounds.top;
            this.x2 = newBounds.right - w4;
            this.y2 = newBounds.bottom;
            this.x3 = newBounds.right;
            this.y3 = newBounds.top;
            this._created = true;
        } else {
            var oldBounds = this.boundingBox;
            var sx = newBounds.width / oldBounds.width;
            var sy = newBounds.height / oldBounds.height;

            this.x0 = newBounds.x + ((this.x0 - oldBounds.x) * sx)
            this.y0 = newBounds.y + ((this.y0 - oldBounds.y) * sy)
            this.x1 = newBounds.x + ((this.x1 - oldBounds.x) * sx)
            this.y1 = newBounds.y + ((this.y1 - oldBounds.y) * sy)
            this.x2 = newBounds.x + ((this.x2 - oldBounds.x) * sx)
            this.y2 = newBounds.y + ((this.y2 - oldBounds.y) * sy);
            this.x3 = newBounds.x + ((this.x3 - oldBounds.x) * sx)
            this.y3 = newBounds.y + ((this.y3 - oldBounds.y) * sy);
        }
    }

    _evalBoundingBox() {
        if (!this._created) {
            // shape hasnt been created yet
            return new Geom.Models.Bounds();
        }
        var result = Geom.Utils.boundsOfCubicCurve(this.x0, this.y0,
                                              this.x1, this.y1,
                                              this.x2, this.y2,
                                              this.x3, this.y3);
        return new Geom.Models.Bounds(result.left, result.top,
                                      result.right - result.left,
                                      result.bottom - result.top);
    }

    get className() { return "CubicCurve"; };

    draw(ctx) {
        super.drawControls(ctx);
        ctx.beginPath();
        ctx.moveTo(this.x0, this.y0);
        ctx.bezierCurveTo(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
        if (this.closed) {
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
    }

    drawControls(ctx) {
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.cubicWidth = 2;

        ctx.beginPath();
        ctx.arc(this.x0, this.y0, controllers.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x1, this.y1, controllers.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x2, this.y2, controllers.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x3, this.y3, controllers.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class CubicCurveController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }

    _evalControlPoints() {
        var parents = super._evalControlPoints();
        var curve = this.shape;
        var ours = [new ControlPoint(curve.x0, curve.y0, HitType.CONTROL, 0, "grab"),
                    new ControlPoint(curve.x1, curve.y1, HitType.CONTROL, 1, "grab"),
                    new ControlPoint(curve.x2, curve.y2, HitType.CONTROL, 2, "grab"),
                    new ControlPoint(curve.x3, curve.y3, HitType.CONTROL, 3, "grab")]
        return ours.concat(parents);
    }

    _checkMoveHitInfo(x, y) {
        var boundingBox = this.shape.boundingBox;
        if (boundingBox.containsPoint(x, y)) {
            return new HitInfo(this.shape, HitType.MOVE, 0, "move");
        }
        return null;
    }

    applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY) {
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
        cubic._boundingBox = null;
        cubic.markTransformed();
    }

    snapshotFor(hitInfo) {
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
}
