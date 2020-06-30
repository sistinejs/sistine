import { Shape } from "../Core/models"
import { ShapeController, ControlPoint, HitInfo, HitType, HitInfoSnapshot, DEFAULT_CONTROL_SIZE } from "../Core/controller"
import { Point, Bounds } from "../Geom/models"
import { boundsOfQuadCurve } from "../Geom/utils"
import { Nullable } from "../Core/types"

export class Rectangle extends Shape {
    private _x : number = 0;
    private _y : number = 0;
    private _rx : number = 0;
    private _ry : number = 0;
    private _width : number = 0;
    private _height : number = 0;
    constructor(configs? : any) {
        super((configs = configs || {}));
        this._x = configs._x || 0;
        this._y = configs._y || 0;
        this._rx = configs._rx || 0;
        this._ry = configs._ry || 0;
        this._width = configs._width || 0;
        this._height = configs._height || 0;
    }

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

    get rx() { return this._rx; }
    get ry() { return this._ry; }
    set rx (value) {
        this._rx = value;
        if (this._rx < 0) {
            throw new Error("Radius X cannot be negative");
        }
    }
    set ry (value) {
        this._ry = value;
        if (this._ry < 0) {
            throw new Error("Radius Y cannot be negative");
        }
    }

    _setBounds(newBounds : Bounds) {
        this._x = newBounds.left;
        this._y = newBounds.top;
        this._width = newBounds.width;
        this._height = newBounds.height;
    }

    _evalBoundingBox() {
        return new Bounds(this.x, this.y, this.width, this.height);
    }

    draw(ctx : any) {
        var lBounds = this.boundingBox;
        ctx.fillRect(lBounds.left, lBounds.top, lBounds.width, lBounds.height);
        ctx.strokeRect(lBounds.left, lBounds.top, lBounds.width, lBounds.height);
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class RectangleController extends ShapeController<Rectangle> {
}
