
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
        this.x = x || 0;
        this.y = y || 0;
    }

    copy() {
        return new Point(this.x, this.y);
    }

    move(tx, ty) {
        this.x += tx;
        this.y += ty;
        return this;
    }

    rotate(theta) {
        var costheta = Math.cos(theta);
        var sintheta = Math.sin(theta);
        var nx = (this.x * costheta) - (this.y * sintheta);
        var ny = (this.y * costheta) + (this.x * sintheta);
        this.x = nx;
        this.y = ny;
        return this;
    }

    transform(a, b, c, d, e, f) {
        var x = this.x;
        var y = this.y;
        this.x = a * x + b * y + c;
        this.y = d * x + e * y + f;
        return this;
    }
}

export class Bounds {
    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }

    get innerRadius() { return Math.min(this._width, this._height) / 2.0; }
    get left() { return this._x; }
    get top() { return this._y; }
    get x() { return this._x; }
    get y() { return this._y; }
    get right() { return this._x + this._width; }
    get bottom() { return this._y + this._height; }
    get width() { return this._width; }
    get height() { return this._height; }
    get centerX() { return this._x + (this._width / 2.0) };
    get centerY() { return this._y + (this._height / 2.0) };

    set left(value) { this._x = value; }
    set top(value) { this._y = value; }
    set x(value) { this._x = value; }
    set y(value) { this._y = value; }
    set centerX(value) { this._x = value - (this._width / 2.0); }
    set centerY(value) { this._y = value - (this._height / 2.0); }
    set right(value) { this._width = value - this._x; }
    set bottom(value) { this._height = value - this._y; }
    set width(value) { this._width = value; }
    set height(value) { this._height = value; }

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

