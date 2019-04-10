
export const PixelsPerCM = 37.79527559055118;
export const PixelsPerInch = 96;
export const PointsPerPixel = 0.75;
export const PixelsPerPica = 16;

export const LengthTypeUnknown = 0;
export const LengthTypeNumber = 1;
export const LengthTypePercentage = 2;
export const LengthTypeEMS = 3;
export const LengthTypeEXS = 4;
export const LengthTypePX = 5;
export const LengthTypeCM = 6;
export const LengthTypeMM = 7;
export const LengthTypeIN = 8;
export const LengthTypePT = 9;
export const LengthTypePC = 10;

export class Length {
    constructor(value, units) {
        units = units || LengthTypeNumber;
        this.value = value || 0;
        this._units = units;
        this._pixelValue = 0;
        this._isAbsolute = (units == LengthTypeEMS || units == LengthTypeEXS || units == LengthTypePercentage);

        if (units == LengthTypeNumber) {
            this._pixelValue = value;
        } else if (units == LengthTypePX) {
            this._pixelValue = value;
        } else if (units == LengthTypeCM) {
            this._pixelValue = value * PixelsPerCM;
        } else if (units == LengthTypeIN) {
            this._pixelValue = value * PixelsPerInch;
        } else if (units == LengthTypePT) {
            this._pixelValue = value / PointsPerPixel;
        } else if (units == LengthTypePC) {
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
}

Length.parse = function(input) {
    var units = LengthTypeNumber;
    if ($.isNumeric(input)) {
        return new Length(parseFloat(input));
    }
    input = input.trim();
    if (input.endsWith("em")) {
        units = LengthTypeEMS;
        input = input.substring(0, input.length - 2).trim();
    } else if (input.endsWith("ex")) {
        units = LengthTypeEXS;
        input = input.substring(0, input.length - 2).trim();
    } else if (input.endsWith("px")) {
        units = LengthTypePX;
        input = input.substring(0, input.length - 2).trim();
    } else if (input.endsWith("cm")) {
        units = LengthTypeCM;
        input = input.substring(0, input.length - 2).trim();
    } else if (input.endsWith("in")) {
        units = LengthTypeIN;
        input = input.substring(0, input.length - 2).trim();
    } else if (input.endsWith("pt")) {
        units = LengthTypePT;
        input = input.substring(0, input.length - 2).trim();
    } else if (input.endsWith("pc")) {
        units = LengthTypePC;
        input = input.substring(0, input.length - 2).trim();
    } else if (input.endsWith("%")) {
        units = LengthTypePercentage;
        input = input.substring(0, input.length - 1).trim();
    }
    
    if (!$.isNumeric(input)) {
        throw new Error("Invalid length value: " + input);
    }
    var value = parseFloat(input);
    units = LengthTypeNumber;
    return new Length(value, units);
}

export class Transform {
    /**
     * Construct a 2D transform with 6 parameters forming the matrix:
     *              __       __
     *              |  a c e  |
     *              |  b d f  |
     *              |  0 0 1  |
     *              --       --
     */
    constructor(a, b, c, d, e, f) {
        this.set(a,b,c,d,e,f);
    }

    /**
     * Resets the values of the transform matrix to the given values.
     */
    set(a, b, c, d, e, f) {
        this.a = a || 1;
        this.b = b || 0;
        this.c = c || 0;
        this.d = d || 1;
        this.e = e || 0;
        this.f = f || 0;
        this.timeStamp = Date.now();
    }

    get isIdentity() {
        return this.a == 1 && this.b == 0 && this.c == 0 &&
               this.d == 1 && this.e == 0 && this.f == 0;
    }

    /**
     * Applies this transform to a point and returns the result.
     */
    apply(x, y, result) {
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
    multiply(another, result) {
        result = result || this;
        var a = this.a, A = another.a;
        var b = this.b, B = another.b;
        var c = this.c, C = another.C;
        var d = this.d, D = another.D;
        var e = this.e, E = another.E;
        var f = this.f, F = another.F;
        var na = a * A + c * B,   nc = a * C + c * D,    ne = a * E + c * F + e;
        var nb = b * A + d * B,   nd = b * C + d * D,    nf = b * E + d * F + f;
        result.set(na, nb, nc, nd, ne, nf);
        return result;
    }

    /**
     * Applies a translation by an offset (tx,ty) onto this Transform.
     */
    translate(E, F, result) {
        result = result || this;
        var ne = this.a * E  + this.c * F + this.e;
        var nf = this.b * E  + this.d * F + this.f;
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
    skew(sx, sy, result) {
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

    scale(sx, sy, result) {
        result = result || this;
        result.a = this.a * sx;
        result.d = this.d * sy;
        result.timeStamp = Date.now();
        return result;
    }

    /**
     * Apply a rotation by a given angle (in radians) onto this Transform.
     */
    rotate(theta, result) {
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
    constructor(w, h) {
        this.width = w || 0;
        this.height = h || 0;
    }
}

export class Point {
    constructor(x, y) {
        this.set(x, y);
    }

    isWithin(x, y, radius) {
        var cx = this.x;
        var cy = this.y;
        return x >= cx - radius && x <= cx + radius && y >= cy - radius && y <= cy + radius;
    }

    set(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    copy() {
        return new Point(this.x, this.y);
    }

    scale(sx, sy, cx, cy, result) {
        result = result || this;
        result.x = ((this.x - cx) * sx);
        result.y = ((this.y - cy) * sy);
        return result;
    }

    translate(tx, ty, result) {
        result = result || this;
        result.x += tx;
        result.y += ty;
        return result;
    }

    rotate(theta, result) {
        result = result || this;
        var costheta = Math.cos(theta);
        var sintheta = Math.sin(theta);
        var nx = (this.x * costheta) - (this.y * sintheta);
        var ny = (this.y * costheta) + (this.x * sintheta);
        result.x = nx;
        result.y = ny;
        return result;
    }

    transform(a, b, c, d, e, f, result) {
        result = result || this;
        var x = this.x;
        var y = this.y;
        result.x = a * x + b * y + c;
        result.y = d * x + e * y + f;
        return result;
    }
}

export class Bounds {
    constructor(x, y, width, height) {
        this.set(x, y, width, height);
    }

    set(x, y, width, height) {
        this._x = x || 0;
        this._y = y || 0;
        this._width = width || 0;
        this._height = height || 0;
    }
    get innerRadius() { return Math.min(this._width, this._height) / 2.0; }
    get x() { return this._x; }
    get y() { return this._y; }
    get x2() { return this._x + this._width; }
    get y2() { return this._y + this._height; }
    get width() { return this._width; }
    get height() { return this._height; }
    get left() { return this._width >= 0 ? this._x : this._x + this._width; }
    get top() { return this._height >= 0 ? this._y : this._y + this._height; }
    get right() { return this._width < 0 ? this._x : this._x + this._width; }
    get bottom() { return this._height < 0 ? this._y : this._y + this._height; }
    get centerX() { return this._x + (this._width / 2.0) };
    get centerY() { return this._y + (this._height / 2.0) };

    set x(value) { this._x = value; }
    set y(value) { this._y = value; }
    set centerX(value) { this._x = value - (this._width / 2.0); }
    set centerY(value) { this._y = value - (this._height / 2.0); }
    set width(value) { this._width = value; }
    set height(value) { this._height = value; }
    get isZeroSized() { return this._width === 0 || this._height === 0; }

    set left(value) { this._x = value; }
    set top(value) { this._y = value; }
    set right(value) { this._width = value - this._x; }
    set bottom(value) { this._height = value - this._y; }

    /**
     * Extends this bounds by unioning the coordinates of this one with another bounds.
     */
    union(another, result) {
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
    intersect(another, result) {
        result = result || this;
        TBD();
        return result;
    }

    move(deltaX, deltaY) {
        return new Bounds(this.left + deltaX, this.top + deltaY, this.width, this.height);
    }

    copy() {
        return new Bounds(this.left, this.top, this.width, this.height);
    }

    /**
     * Returns true if this shape contains a particular coordinate,
     * false otherwise.
     */
    containsPoint(x, y) {
        return  x >= this._x && x <= this.right &&
                y >= this._y && y <= this.bottom;
    }

    /**
     * Returns true if this bounds instance intersects another
     * bounds instance, false otherwise.
     */
    intersects(anotherBounds) {
        if (anotherBounds == null) return true;
        return true;
        return this.bounds.intersects(anotherBounds);
    }
}
