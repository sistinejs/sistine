
import { Geom } from "../../Geom/index"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class Line extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._x1 = configs.x1 || 0;
        this._y1 = configs.y1 || 0;
        this._y2 = configs.y2 || 0;
        this._x2 = configs.x2 || 0;
    }

    get controllerClass() { return Line.Controller; }

    _setBounds(newBounds) {
        this._x1 = newBounds.x1;
        this._y1 = newBounds.y1;
        this._x2 = newBounds.x2;
        this._y2 = newBounds.y2;
    }

    _evalBoundingBox() {
        var left = Math.min(this._x1, this._x2);
        var right = Math.max(this._x1, this._x2);
        var top = Math.min(this._y1, this._y2);
        var bottom = Math.max(this._y1, this._y2);
        return new Geom.Models.Bounds(left, top, right - left, bottom - top);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this._x1.value, this._y1.value);
        ctx.lineTo(this._x2.value, this._y2.value);
        ctx.stroke();
    }

    drawControls(ctx) {
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this._x1, this._y1, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this._x2, this._y2, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
Line.Controller = class LineController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }

    _evalControlPoints() {
        var line = this.shape;
        return [new ControlPoint(line._p1.x, line._p1.y, HitType.CONTROL, 1, "grab"),
                new ControlPoint(line._p2.x, line._p2.y, HitType.CONTROL, 2, "grab")]
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
        var line = this.shape;
        if (hitInfo.hitType == HitType.MOVE) {
            line._p1.set(savedInfo.downP1.x + deltaX, savedInfo.downP1.y + deltaY);
            line._p2.set(savedInfo.downP2.x + deltaX, savedInfo.downP2.y + deltaY);
        }
        else if (hitInfo.hitIndex == 1) {
            line._p1.set(savedInfo.downP1.x + deltaX, savedInfo.downP1.y + deltaY);
        } else {
            line._p2.set(savedInfo.downP2.x + deltaX, savedInfo.downP2.y + deltaY);
        }
        line._boundingBox = null;
        line.markTransformed();
    }

    snapshotFor(hitInfo) {
        return {
            downP1: this.shape._p1.copy(),
            downP2: this.shape._p2.copy(),
        };
    }
}
