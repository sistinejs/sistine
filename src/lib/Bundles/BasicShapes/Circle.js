
import * as geom from "../../Geom/models"
import * as geomutils from "../../Geom/utils"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

export class Circle extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._center = configs.center || new geom.Point(0, 0);
        this._radius = configs.radius || 10;
        this._controller = new Circle.Controller(this);
    }

    _evalBounds() {
        return new geom.Bounds(this._center.x - this._radius,
                               this._center.y - this._radius,
                               this._radius * 2,
                               this._radius * 2);
    }
    _setBounds(newBounds) {
        this._center.x = newBounds.centerX;
        this._center.y = newBounds.centerY;
        this._radius = newBounds.innerRadius;
    }
    canSetBounds(newBounds) {
        newBounds.width = newBounds.height = Math.min(newBounds.width, newBounds.height);
        return true;
    }

    get className() { return "Circle"; }

    get radius() { return this._radius; }

    setSize(w, h, force) {
        this._radius = Math.min(w, h);
        return super.setSize(this._radius, this._radius, force);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this._center.x, this._center.y, this._radius, 0, 2 * Math.PI);
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.lineWidth > 0) {
            ctx.stroke();
        }
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class CircleController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
