
import { Geom } from "../../Geom/index"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class CubicCurve extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._p0 = configs.p0 || null;
        this._p1 = configs.p1 || null;
        this._p2 = configs.p2 || null;
        this._p3 = configs.p3 || null;
        this.closed = configs.closed || false;
    }

    get controllerClass() { return CubicCurve.Controller; }

    _setBounds(newBounds) {
        if (this._p0 == null) {
            // creating by bounds
            var w4 = newBounds.width * 0.25;
            this._p0 = new Geom.Models.Point(newBounds.left, newBounds.bottom);
            this._p1 = new Geom.Models.Point(newBounds.left + w4, newBounds.top);
            this._p2 = new Geom.Models.Point(newBounds.right, newBounds.bottom);
            this._p3 = new Geom.Models.Point(newBounds.right - w4, newBounds.top);
        } else {
            var oldBounds = this.boundingBox;
            var sx = newBounds.width / oldBounds.width;
            var sy = newBounds.height / oldBounds.height;
            this._p0.scale(sx, sy, oldBounds.x, oldBounds.y).translate(newBounds.x, newBounds.y);
            this._p1.scale(sx, sy, oldBounds.x, oldBounds.y).translate(newBounds.x, newBounds.y);
            this._p2.scale(sx, sy, oldBounds.x, oldBounds.y).translate(newBounds.x, newBounds.y);
            this._p3.scale(sx, sy, oldBounds.x, oldBounds.y).translate(newBounds.x, newBounds.y);
        }
    }

    _evalBoundingBox() {
        if (this._p0 == null) {
            // shape hasnt been created yet
            return new Geom.Models.Bounds();
        }
        var result = Geom.Utils.boundsOfCubicCurve(this._p0.x, this._p0.y,
                                              this._p1.x, this._p1.y,
                                              this._p2.x, this._p2.y,
                                              this._p3.x, this._p3.y);
        return new Geom.Models.Bounds(result.left, result.top,
                                      result.right - result.left,
                                      result.bottom - result.top);
    }

    get className() { return "CubicCurve"; };

    draw(ctx) {
        super.drawControls(ctx);
        ctx.beginPath();
        ctx.moveTo(this._p0.x, this._p0.y);
        ctx.bezierCurveTo(this._p1.x, this._p1.y, this._p2.x, this._p2.y, this._p3.x, this._p3.y);
        if (this.closed) {
            ctx.closePath();
        }
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.lineWidth > 0) {
            ctx.stroke();
        }
    }

    drawControls(ctx) {
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(this._p0.x, this._p0.y, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this._p1.x, this._p1.y, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this._p2.x, this._p2.y, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this._p3.x, this._p3.y, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
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
        var ours = [new ControlPoint(curve._p0, HitType.CONTROL, 0, "grab"),
                new ControlPoint(curve._p1, HitType.CONTROL, 1, "grab"),
                new ControlPoint(curve._p2, HitType.CONTROL, 2, "grab"),
                new ControlPoint(curve._p3, HitType.CONTROL, 3, "grab")];
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
        var line = this.shape;
        if (hitInfo.hitType == HitType.MOVE) {
            line._p0.set(savedInfo.downP0.x + deltaX, savedInfo.downP0.y + deltaY);
            line._p1.set(savedInfo.downP1.x + deltaX, savedInfo.downP1.y + deltaY);
            line._p2.set(savedInfo.downP2.x + deltaX, savedInfo.downP2.y + deltaY);
            line._p3.set(savedInfo.downP3.x + deltaX, savedInfo.downP3.y + deltaY);
        }
        else if (hitInfo.hitIndex == 0) {
            line._p0.set(savedInfo.downP0.x + deltaX, savedInfo.downP0.y + deltaY);
        } else if (hitInfo.hitIndex == 1) {
            line._p1.set(savedInfo.downP1.x + deltaX, savedInfo.downP1.y + deltaY);
        } else if (hitInfo.hitIndex == 2) {
            line._p2.set(savedInfo.downP2.x + deltaX, savedInfo.downP2.y + deltaY);
        } else {
            line._p3.set(savedInfo.downP3.x + deltaX, savedInfo.downP3.y + deltaY);
        }
        line._boundingBox = null;
        line.markTransformed();
    }

    snapshotFor(hitInfo) {
        var out = super.snapshotFor(hitInfo);
        out.downP0 = this.shape._p0.copy();
        out.downP1 = this.shape._p1.copy();
        out.downP2 = this.shape._p2.copy();
        out.downP3 = this.shape._p3.copy();
        return out;
    }
}
