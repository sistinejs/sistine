
import * as geom from "../../Geom/models"
import * as geomutils from "../../Geom/utils"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

export class Square extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._p0 = configs.p0 || new geom.Point(0, 0);
        this._size = configs.size || 10;
        this._controller = new Square.Controller(this);
    }

    canSetSize(newBounds) {
        newBounds.width = newBounds.height = Math.min(newBounds.width, newBounds.height);
        return true;
    }
    _setBounds(newBounds) {
        this._p0.set(newBounds.left, newBounds.top);
        this._size = newBounds.width;
    }

    _evalBounds() {
        return new geom.Bounds(this._p0.x, this._p0.y, this._size, this._size);
    }

    get className() { return "Square"; }

    setSize(w, h, force) {
        w = h = Math.min(w, h);
        return super.setSize(w, h, force);
    }

    draw(ctx) {
        var size = this._size;
        var left = this._p0.x;
        var top = this._p0.y;
        if (this.fillStyle) {
            ctx.fillRect(left, top, size, size);
        }
        if (this.lineWidth > 0) {
            ctx.strokeRect(left, top, size, size);
        }
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
Square.Controller = class SquareController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
