
import { Geom } from "../Geom/index"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class Ellipse extends models.Shape {
    constructor(configs : any) {
        super((configs = configs || {}));
        this._created = false;
        if (configs.cx && configs.cy) {
            this._created = true;
        } else {
            this._cx = configs.cx || 0;
            this._cy = configs.cy || 0;
            this._rx = configs.rx || 0;
            this._ry = configs.ry || 0;
        }
    }

    get cx() { return this._cx; }
    get cy() { return this._cy; }
    set cx(value) { this._cx = value; }
    set cy(value) { this._cy = value; }

    get rx() { return this._rx; }
    set rx (value) {
        this._rx = value;
        if (this._rx < 0) {
            throw new Error("Radius X cannot be negative");
        }
    }

    get ry() { return this._ry; }
    set ry (value) {
        this._ry = value;
        if (this._ry < 0) {
            throw new Error("Radius Y cannot be negative");
        }
    }

    _evalBoundingBox() {
        return new Geom.Models.Bounds(this._cx - this._rx,
                                      this._cy - this._ry,
                                      top, this._rx * 2, this._ry * 2);
    }
    _setBounds(newBounds) {
        this.cx = newBounds.centerX;
        this.cy = newBounds.centerY;
        this.rx = newBounds.width / 2;
        this.ry = newBounds.height / 2;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.ellipse(this._cx, this._cy, this._rx, this._ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class EllipseController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
