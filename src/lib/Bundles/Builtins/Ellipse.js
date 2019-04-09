
import { Geom } from "../../Geom/index"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class Ellipse extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._cx = Length.parse(configs.cx || 0);
        this._cy = Length.parse(configs.cy || 0);
        this._rx = Length.parse(configs.rx || 0);
        this._ry = Length.parse(configs.ry || 0);
    }

    get cx() { return this._cx; }
    get cy() { return this._cy; }
    set cx(value) { this._cx = Length.parse(value); }
    set cy(value) { this._cy = Length.parse(value); }

    get rx() { return this._rx; }
    get ry() { return this._ry; }
    set rx (value) {
        this._rx = Length.parse(value);
        if (this._rx.value < 0) {
            throw new Error("Radius cannot be negative");
        }
    }
    set ry (value) {
        this._ry = Length.parse(value);
        if (this._ry.value < 0) {
            throw new Error("Radius cannot be negative");
        }
    }

    get controllerClass() { return Ellipse.Controller; }

    _evalBoundingBox() {
        return new Geom.Models.Bounds(this._cx.value - this._rx.value,
                                      this._cy.value - this._ry.value,
                                      top, rx.value * 2, ry.value * 2);
    }
    _setBounds(newBounds) {
        this.cx = newBounds.centerX;
        this.cy = newBounds.centerY;
        this.rx = newBounds.width / 2;
        this.ry = newBounds.height / 2;
    }

    draw(ctx) {
        var lBounds = this.boundingBox;
        var x = lBounds.x;
        var y = lBounds.y;
        var w = lBounds.width;
        var h = lBounds.height;

        ctx.beginPath();
        Geom.Utils.pathEllipse(ctx, x, y, w, h);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
Ellipse.Controller = class EllipseController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
