
import { Geom } from "../Geom/index"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class CubicCurve extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this.closed = configs.closed || false;
        this._created = false;
        if (configs.x0 && configs.y0) {
            this._created = true;
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

    get controllerClass() { return CubicCurve.Controller; }

    _setBounds(newBounds) {
        if (!this._created) {
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
            this._created = true;
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
        if (!this._created) {
            // shape hasnt been created yet
            return new Geom.Models.Bounds();
        }
        var result = Geom.Utils.boundsOfCubicCurve(this._x0, this._y0,
                                              this._x1, this._y1,
                                              this._x2, this._y2,
                                              this._x3, this._y3);
        return new Geom.Models.Bounds(result.left, result.top,
                                      result.right - result.left,
                                      result.bottom - result.top);
    }

    get className() { return "CubicCurve"; };

    draw(ctx) {
        super.drawControls(ctx);
        ctx.beginPath();
        ctx.moveTo(this._x0, this._y0);
        ctx.bezierCurveTo(this._x1, this._y1, this._x2, this._y2, this._x3, this._y3);
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
        ctx.arc(this._x0, this._y0, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this._x1, this._y1, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this._x2, this._y2, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this._x3, this._y3, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
CubicCurve.Controller = class CubicCurveController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }

    _evalControlPoints() {
        var parents = super._evalControlPoints();
        var curve = this.shape;
        var ours = [new ControlPoint(curve._x0, curve._y0, HitType.CONTROL, 0, "grab"),
                    new ControlPoint(curve._x1, curve._y1, HitType.CONTROL, 1, "grab"),
                    new ControlPoint(curve._x2, curve._y2, HitType.CONTROL, 2, "grab"),
                    new ControlPoint(curve._x3, curve._y3, HitType.CONTROL, 3, "grab")]
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
            cubic._x0 = savedInfo.downX0 + deltaX;
            cubic._y0 = savedInfo.downY0 + deltaY;
            cubic._x1 = savedInfo.downX1 + deltaX;
            cubic._y1 = savedInfo.downY1 + deltaY;
            cubic._x2 = savedInfo.downX2 + deltaX;
            cubic._y2 = savedInfo.downY2 + deltaY;
            cubic._x3 = savedInfo.downX3 + deltaX;
            cubic._y3 = savedInfo.downY3 + deltaY;
        }
        else if (hitInfo.hitIndex == 0) {
            cubic._x0 = savedInfo.downX0 + deltaX;
            cubic._y0 = savedInfo.downY0 + deltaY;
        } else if (hitInfo.hitIndex == 1) {
            cubic._x1 = savedInfo.downX1 + deltaX;
            cubic._y1 = savedInfo.downY1 + deltaY;
        } else if (hitInfo.hitIndex == 2) {
            cubic._x2 = savedInfo.downX2 + deltaX;
            cubic._y2 = savedInfo.downY2 + deltaY;
        } else {
            cubic._x3 = savedInfo.downX3 + deltaX;
            cubic._y3 = savedInfo.downY3 + deltaY;
        }
        cubic._boundingBox = null;
        cubic.markTransformed();
    }

    snapshotFor(hitInfo) {
        var out = super.snapshotFor(hitInfo);
        out.downX0 = this.shape._x0;
        out.downY0 = this.shape._y0;
        out.downX1 = this.shape._x1;
        out.downY1 = this.shape._y1;
        out.downX2 = this.shape._x2;
        out.downY2 = this.shape._y2;
        out.downX3 = this.shape._x3;
        out.downY3 = this.shape._y3;
        return out;
    }
}
