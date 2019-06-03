
import { Int, Nullable } from "../Core/types"

export const PixelsPerCM = 37.79527559055118;
export const PixelsPerInch = 96;
export const PointsPerPixel = 0.75;
export const PixelsPerPica = 16;

export enum LengthType {
    Unknown,
    Number,
    Percentage,
    EMS,
    EXS,
    PX,
    CM,
    MM,
    IN,
    PT,
    PC,
};

export class Length {
    value : number = 0
    private _units : LengthType = LengthType.Unknown;
    private _pixelValue : number = 0;
    private _isAbsolute : boolean = false;
    constructor(value : number, units : LengthType = LengthType.Number) {
        this._units = units;
        this._isAbsolute = (units == LengthType.Number || units == LengthType.EMS || units == LengthType.EXS);

        if (units == LengthType.Number) {
            this._pixelValue = value;
        } else if (units == LengthType.PX) {
            this._pixelValue = value;
        } else if (units == LengthType.CM) {
            this._pixelValue = value * PixelsPerCM;
        } else if (units == LengthType.IN) {
            this._pixelValue = value * PixelsPerInch;
        } else if (units == LengthType.PT) {
            this._pixelValue = value / PointsPerPixel;
        } else if (units == LengthType.PC) {
            this._pixelValue = value * PixelsPerPica;
        }
    }

    get units() {
        return this._units;
    }

    get isAbsolute() {
        return this._isAbsolute;
    }

    get pixelValue() {
        return this._pixelValue;
    }

    static parse(input : Length | string | number) : Length {
        if (input instanceof Length) return input;
        var units = LengthType.Number;
        if ($.isNumeric(input)) {
            return new Length(parseFloat(input));
        }
        input = input.trim();
        if (input.endsWith("em")) {
            units = LengthType.EMS;
            input = input.substring(0, input.length - 2).trim();
        } else if (input.endsWith("ex")) {
            units = LengthType.EXS;
            input = input.substring(0, input.length - 2).trim();
        } else if (input.endsWith("px")) {
            units = LengthType.PX;
            input = input.substring(0, input.length - 2).trim();
        } else if (input.endsWith("cm")) {
            units = LengthType.CM;
            input = input.substring(0, input.length - 2).trim();
        } else if (input.endsWith("in")) {
            units = LengthType.IN;
            input = input.substring(0, input.length - 2).trim();
        } else if (input.endsWith("pt")) {
            units = LengthType.PT;
            input = input.substring(0, input.length - 2).trim();
        } else if (input.endsWith("pc")) {
            units = LengthType.PC;
            input = input.substring(0, input.length - 2).trim();
        } else if (input.endsWith("%")) {
            units = LengthType.Percentage;
            input = input.substring(0, input.length - 1).trim();
        }
        
        if (!$.isNumeric(input)) {
            throw new Error("Invalid length value: " + input);
        }
        var value = parseFloat(input);
        units = LengthType.Number;
        return new Length(value, units);
    }
}

export class Transform {
    timeStamp : number = 0;
    a : number = 1;
    b : number = 0;
    c : number = 0;
    d : number = 1;
    e : number = 0;
    f : number = 0;
    /**
     * Construct a 2D transform with 6 parameters forming the matrix:
     *              __       __
     *              |  a c e  |
     *              |  b d f  |
     *              |  0 0 1  |
     *              --       --
     */
    constructor(a : number = 1, b : number = 0, c : number = 0, d : number = 1,
                e : number = 0, f : number = 0) {
        this.set(a,b,c,d,e,f);
    }

    /**
     * Resets the values of the transform matrix to the given values.
     */
    set(a : number = 1, b : number = 0, c : number = 0, d : number = 1,
        e : number = 0, f : number = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        this.timeStamp = Date.now();
    }

    get isIdentity() {
        return this.a == 1 && this.b == 0 && this.c == 0 &&
               this.d == 1 && this.e == 0 && this.f == 0;
    }

    /**
     * Applies this transform to a point and returns the result.
     */
    apply(x : number, y : number, result? : {x: number, y: number}) {
        result = result || new Point();
        result.x = this.a * x + this.c * y + this.e;
        result.y = this.b * x + this.d * y + this.f;
        return result;
    }

    /**
     * Creates a new copy of this Transform.
     */
    copy() {
        return new Transform(this.a, this.b, this.c, this.d, this.e, this.f);
    }

    /**
     * Performs ( this * another ) and returns the result as a new Transform
     * or into the result Transform if it is provided.
     */
    multiply(another : Transform, result? : Transform) {
        result = result || this;
        var a = this.a, A = another.a;
        var b = this.b, B = another.b;
        var c = this.c, C = another.c;
        var d = this.d, D = another.d;
        var e = this.e, E = another.e;
        var f = this.f, F = another.f;
        var na = a * A + c * B,   nc = a * C + c * D,    ne = a * E + c * F + e;
        var nb = b * A + d * B,   nd = b * C + d * D,    nf = b * E + d * F + f;
        result.set(na, nb, nc, nd, ne, nf);
        return result;
    }

    /**
     * Applies a translation by an offset (tx,ty) onto this Transform.
     */
    translate(tx : number, ty : number, result? : Transform) {
        result = result || this;
        var ne = this.a * tx  + this.c * ty + this.e;
        var nf = this.b * tx  + this.d * ty + this.f;
        result.e = ne;
        result.f = nf;
        result.timeStamp = Date.now();
        return result;
    }

    /**
     * Skews by a particular factor along x and/or y axes.
     *
     * Equivalent to the multiplication by the following transform:
     *
     *    __          __
     *    |  1  sx  0  |
     *    |  sy  1  0  |
     *    |  0   0  1  |
     *    --          --
     */
    skew(sx : number, sy : number, result? : Transform) {
        result = result || this;
        var a = this.a, A = 1;
        var b = this.b, B = sy;
        var c = this.c, C = sx;
        var d = this.d, D = 1;
        var e = this.e, E = 0;
        var f = this.f, F = 0;
        var na = a * A + c * B,   nc = a * C + c * D,    ne = a * E + c * F + e;
        var nb = b * A + d * B,   nd = b * C + d * D,    nf = b * E + d * F + f;
        result.set(na, nb, nc, nd, ne, nf);
        return result;
    }

    scale(sx : number, sy : number, result? : Transform) {
        result = result || this;
        result.a = this.a * sx;
        result.d = this.d * sy;
        result.timeStamp = Date.now();
        return result;
    }

    /**
     * Apply a rotation by a given angle (in radians) onto this Transform.
     */
    rotate(theta : number, result? : Transform) {
        result = result || this;
        var costheta = Math.cos(theta);
        var sintheta = Math.sin(theta);
        var a = this.a, c = this.c;
        var b = this.b, d = this.d;
        result.a = a * costheta + c * sintheta;
        result.b = b * costheta + d * sintheta;
        result.c = a * -sintheta + c * costheta;
        result.d = b * -sintheta + d * costheta;
        result.timeStamp = Date.now();
        return result;
    }
}

export class Size {
    width : number = 0;
    height : number = 0;
    constructor(w : number = 0, h : number = 0) {
        this.width = w;
        this.height = h;
    }
}

export class Point {
    x : number = 0;
    y : number = 0;
    constructor(x : number = 0, y : number = 0) {
        this.set(x, y);
    }

    isWithin(x : number, y : number, radius : number) {
        var cx = this.x;
        var cy = this.y;
        return x >= cx - radius && x <= cx + radius && y >= cy - radius && y <= cy + radius;
    }

    set(x : number = 0, y : number = 0) {
        this.x = x;
        this.y = y;
    }

    copy() : Point {
        return new Point(this.x, this.y);
    }

    scale(sx : number, sy : number, cx : number, cy : number, result? : Point) : Point {
        result = result || this;
        result.x = ((this.x - cx) * sx);
        result.y = ((this.y - cy) * sy);
        return result;
    }

    translate(tx : number, ty : number, result? : Point) {
        result = result || this;
        result.x += tx;
        result.y += ty;
        return result;
    }

    rotate(theta : number, result? : Point) {
        result = result || this;
        var costheta = Math.cos(theta);
        var sintheta = Math.sin(theta);
        var nx = (this.x * costheta) - (this.y * sintheta);
        var ny = (this.y * costheta) + (this.x * sintheta);
        result.x = nx;
        result.y = ny;
        return result;
    }

    transform(a : number = 1, b : number = 0, c : number = 0, d : number = 1,
              e : number = 0, f : number = 0, result? : Point) {
        result = result || this;
        var x = this.x;
        var y = this.y;
        result.x = a * x + b * y + c;
        result.y = d * x + e * y + f;
        return result;
    }
}

export class Bounds {
    _x : number
    _y : number
    _width : number
    _height : number
    constructor(x : number = 0, y : number = 0, width : number = 0, height : number = 0) {
        this.set(x, y, width, height);
    }

    set(x : number = 0, y : number = 0, width : number = 0, height : number = 0) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }
    get innerRadius() : number { return Math.min(this._width, this._height) / 2.0; }
    get x() : number { return this._x; }
    get y() : number { return this._y; }
    get x2() : number { return this._x + this._width; }
    get y2() : number { return this._y + this._height; }
    get width() : number { return this._width; }
    get height() : number { return this._height; }
    get left() : number { return this._width >= 0 ? this._x : this._x + this._width; }
    get top() : number { return this._height >= 0 ? this._y : this._y + this._height; }
    get right() : number { return this._width < 0 ? this._x : this._x + this._width; }
    get bottom() : number { return this._height < 0 ? this._y : this._y + this._height; }
    get centerX() : number { return this._x + (this._width / 2.0) };
    get centerY() : number { return this._y + (this._height / 2.0) };

    set x(value : number) { this._x = value; }
    set y(value : number) { this._y = value; }
    set centerX(value : number) { this._x = value - (this._width / 2.0); }
    set centerY(value : number) { this._y = value - (this._height / 2.0); }
    set width(value : number) { this._width = value; }
    set height(value : number) { this._height = value; }
    get isZeroSized() : boolean { return this._width === 0 || this._height === 0; }

    set left(value : number) { this._x = value; }
    set top(value : number) { this._y = value; }
    set right(value : number) { this._width = value - this._x; }
    set bottom(value : number) { this._height = value - this._y; }

    /**
     * Extends this bounds by unioning the coordinates of this one with another bounds.
     */
    union(another : Bounds, result? : Bounds) : Bounds {
        result = result || this;
        var newLeft = Math.min(this.left, another.left);
        var newTop = Math.min(this.top, another.top);
        var newRight = Math.max(this.right, another.right);
        var newBottom = Math.max(this.bottom, another.bottom);
        result.left = newLeft;
        result.top = newTop;
        result.right = newRight;
        result.bottom = newBottom;
        return result;
    }

    /**
     * Clips this bounds by intersecting the coordinates of this one with another bounds.
     */
    intersect(another : Bounds, result? : Bounds) : Bounds {
        throw new Error("Not yet implemented");
    }

    move(deltaX : number, deltaY : number) : Bounds {
        return new Bounds(this.left + deltaX, this.top + deltaY, this.width, this.height);
    }

    copy() : Bounds {
        return new Bounds(this.left, this.top, this.width, this.height);
    }

    /**
     * Returns true if this shape contains a particular coordinate,
     * false otherwise.
     */
    containsPoint(x : number, y : number) : boolean {
        return  x >= this._x && x <= this.right &&
                y >= this._y && y <= this.bottom;
    }

    /**
     * Returns true if this bounds instance intersects another
     * bounds instance, false otherwise.
     */
    intersects(anotherBounds : Nullable<Bounds>) : boolean {
        if (anotherBounds == null) return true;
        return true;
    }
}
