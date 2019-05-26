
import { Geom } from "../Geom/index"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class QuadCurve extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
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
        }
        this.closed = configs.closed || false;
    }

    get controllerClass() { return QuadCurve.Controller; }

    _setBounds(newBounds) {
        if (!this._created) {
            // creating by bounds
            this._x0 = newBounds.left;
            this._y0 = newBounds.bottom;
            this._x1 = newBounds.centerX;
            this._y1 = newBounds.top;
            this._x2 = newBounds.right;
            this._y2 = newBounds.bottom;
            this._created = true;
        } else {
            var oldBounds = this.boundingBox;
            var sx = newBounds.width / oldBounds.width;
            var sy = newBounds.height / oldBounds.height;
            this._x0 = newBounds.x + ((this._x0 - oldBounds.x) * sx)
            this._y0 = newBounds.y + ((this._y0 - oldBounds.y) * sy)
            this._x1 = newBounds.x + ((this._p1.x - oldBounds.x) * sx)
            this._y1 = newBounds.y + ((this._p1.y - oldBounds.y) * sy)
            this._x2 = newBounds.x + ((this._p2.x - oldBounds.x) * sx)
            this._y2 = newBounds.y + ((this._p2.y - oldBounds.y) * sy);
        }
    }

    _evalBoundingBox() {
        if (!this._created) {
            // shape hasnt been created yet
            return new Geom.Models.Bounds();
        }
        var result = Geom.Utils.boundsOfQuadCurve(this._x0, this._y0, this._p1.x, this._p1.y, this._p2.x, this._p2.y);
        return new Geom.Models.Bounds(result.left, result.top,
                                      result.right - result.left,
                                      result.bottom - result.top);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this._x0, this._y0);
        ctx.quadraticCurveTo(this._p1.x, this._p1.y, this._p2.x, this._p2.y);
        if (this.closed) {
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
    }

    drawControls(ctx) {
        super.drawControls(ctx);
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(this._x0, this._y0, controllers.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this._p1.x, this._p1.y, controllers.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this._p2.x, this._p2.y, controllers.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
QuadCurve.Controller = class QuadCurveController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }

    _evalControlPoints() {
        var parents = super._evalControlPoints();
        var curve = this.shape;
        var ours = [new ControlPoint(curve._x0, curve._y0, HitType.CONTROL, 0, "grab"),
                new ControlPoint(curve._x1, curve._y1, HitType.CONTROL, 1, "grab"),
                new ControlPoint(curve._x2, curve._y2, HitType.CONTROL, 2, "grab")]
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
        console.log("Hit Info: ", hitInfo);
        if (hitInfo.hitType != HitType.CONTROL) {
            return super.applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY);
        }
        var deltaX = currX - downX;
        var deltaY = currY - downY;
        var quad = this.shape;
        if (hitInfo.hitType == HitType.MOVE) {
            quad._x0 = savedInfo.downX0 + deltaX;
            quad._y0 = savedInfo.downY0 + deltaY;
            quad._x1 = savedInfo.downX1 + deltaX;
            quad._y1 = savedInfo.downY1 + deltaY;
            quad._x2 = savedInfo.downX2 + deltaX;
            quad._y2 = savedInfo.downY2 + deltaY;
        }
        else if (hitInfo.hitIndex == 0) {
            quad._x0 = savedInfo.downX0 + deltaX;
            quad._y0 = savedInfo.downY0 + deltaY;
        } else if (hitInfo.hitIndex == 1) {
            quad._x1 = savedInfo.downX1 + deltaX;
            quad._y1 = savedInfo.downY1 + deltaY;
        } else {
            quad._x2 = savedInfo.downX2 + deltaX;
            quad._y2 = savedInfo.downY2 + deltaY;
        }
        quad._boundingBox = null;
        quad.markTransformed();
    }

    snapshotFor(hitInfo) {
        var out = super.snapshotFor(hitInfo);
        out.downX0 = this.shape._x0;
        out.downY0 = this.shape._y0;
        out.downX1 = this.shape._x1;
        out.downY1 = this.shape._y1;
        out.downX2 = this.shape._x2;
        out.downY2 = this.shape._y2;
        return out;
    }
}
