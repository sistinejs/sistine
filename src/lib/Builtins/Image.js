
import { Geom } from "../Geom/index"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class Image extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._x = configs._x || 0;
        this._y = configs._y || 0;
        this._width = configs._width || 0;
        this._height = configs._height || 0;
    }

    get controllerClass() { return Image.Controller; }

    get x() { return this._x; }
    get y() { return this._y; }
    set x(value) { this._x = value; }
    set y(value) { this._y = value; }

    get width() { return this._width; }
    set width (value) {
        this._width = value;
        if (this._width < 0) {
            throw new Error("Width cannot be negative");
        }
    }

    get height() { return this._height; }
    set height (value) {
        this._height = value;
        if (this._height < 0) {
            throw new Error("Height cannot be negative");
        }
    }

    _setBounds(newBounds) {
        this._x = newBounds.left;
        this._y = newBounds.top;
        this._width = newBounds.width;
        this._height = newBounds.height;
    }

    _evalBoundingBox() {
        return new Geom.Models.Bounds(this.x, this.y, this.width, this.height);
    }

    get className() { return "Image"; }

    draw(ctx) {
        var lBounds = this.boundingBox;
        ctx.fillRect(lBounds.left, lBounds.top, lBounds.width, lBounds.height);
        ctx.strokeRect(lBounds.left, lBounds.top, lBounds.width, lBounds.height);
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
Image.Controller = class ImageController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
