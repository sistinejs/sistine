
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

const Length = geom.Length;

export class Circle extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._created = false;
        if (configs.cx && configs.cy) {
            this._created = true;
        } else {
            this._cx = configs.cx || 0;
            this._cy = configs.cy || 0;
            this._radius = configs.radius || 0;
        }
    }

    newInstance() {
        var out = super.newInstance();
        out._cx = this._cx;
        out._cy = this._cy;
        out._radius = this._radius;
        return out;
    }

    get controllerClass() { return Circle.Controller; }

    get cx() { return this._cx; }
    get cy() { return this._cy; }
    get radius() { return this._radius; }
    set cx(value) { this._cx = parseFloat(value); }
    set cy(value) { this._cy = parseFloat(value); }
    set radius(value) {
        this._radius = parseFloat(value);
        if (this._radius < 0) {
            throw new Error("Radius cannot be negative");
        }
    }

    _evalBoundingBox() {
        var r = this._radius;
        return new geom.Bounds(this._cx - r, this._cy - r, r * 2, r * 2);
    }
    _setBounds(newBounds) {
        this.cx = newBounds.centerX;
        this.cy = newBounds.centerY;
        this.radius = newBounds.innerRadius;
    }
    canSetBounds(newBounds) {
        newBounds.width = newBounds.height = Math.min(newBounds.width, newBounds.height);
        return true;
    }

    get className() { return "Circle"; }

    get radius() { return this._radius; }

    setSize(w, h, force) {
        this.radius = Math.min(w, h);
        return super.setSize(this._radius, this._radius, force);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this._cx, this._cy, this._radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
Circle.Controller = class CircleController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
