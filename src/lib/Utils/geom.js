
var pow = Math.pow,
    sqrt = Math.sqrt,
    min = Math.min,
    max = Math.max,
    abs = Math.abs,
    sin = Math.sin,
    cos = Math.cos,
    tan = Math.tan,
    PI = Math.PI;

export function copysign(x, y) {
    var out = abs(x);
    if (y < 0) {
        return -x;
    } else {
        return x;
    }
}

export function pathEllipse(ctx, x, y, w, h) {
    var kappa = .5522848,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle

    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    //ctx.closePath(); // not used correctly, see comments (use to close off open path)
}

export function pointOnCircle(R, theta, out) {
    out = out || [];
    out[0] = R * cos(theta);
    out[1] = R * sin(theta);
    return out;
}

export function pointOnRect(W, H, theta, out) {
    out = out || [];
    out[0] = R * cos(theta);
    out[1] = R * sin(theta);
    return out;
}

export function pointOnEllipse(A, B, theta, out) {
    out = out || [];
    while (theta > 2 * PI) theta -= (2 * PI);
    var epsilon = 0.0001;
    if (abs(theta) < epsilon) {
        // close to 0
        out[0] = A;
        out[1] = 0;
    } else if (abs(theta - PI) < epsilon) {
        // close to PI
        out[0] = -A;
        out[1] = 0;
    } else if (abs(theta - PI * 0.5) < epsilon) {
        // close to PI / 2
        out[0] = 0;
        out[1] = -B;
    } else if (abs(theta - PI * 1.5) < epsilon) {
        // close to 3 * PI / 2
        out[0] = 0;
        out[1] = B;
    } else {
        var ab = A * B;
        var tantheta = tan(theta);
        var den = sqrt((B * B) + (A * A * tantheta * tantheta));
        if (theta > PI * 0.5 && theta < PI * 1.5) {
            out[0] = ab / den;
            out[1] = ab * tantheta / den;
        } else {
            out[0] = -ab / den;
            out[1] = -ab * tantheta / den;
        }
    }
    return out;
}

// SOURCE: https://stackoverflow.com/questions/2587751/an-algorithm-to-find-bounding-box-of-closed-bezier-curves
export function boundsOfCurve(x0, y0, x1, y1, x2, y2, x3, y3)
{
  var tvalues = new Array();
  var bounds = [new Array(), new Array()];
  var points = new Array();

  var a, b, c, t, t1, t2, b2ac, sqrtb2ac;
  for (var i = 0; i < 2; ++i)
  {
    if (i == 0)
    {
      b = 6 * x0 - 12 * x1 + 6 * x2;
      a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
      c = 3 * x1 - 3 * x0;
    }
    else
    {
      b = 6 * y0 - 12 * y1 + 6 * y2;
      a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
      c = 3 * y1 - 3 * y0;
    }

    if (abs(a) < 1e-12) // Numerical robustness
    {
      if (abs(b) < 1e-12) // Numerical robustness
      {
        continue;
      }
      t = -c / b;
      if (0 < t && t < 1)
      {
        tvalues.push(t);
      }
      continue;
    }
    b2ac = b * b - 4 * c * a;
    sqrtb2ac = sqrt(b2ac);
    if (b2ac < 0)
    {
      continue;
    }
    t1 = (-b + sqrtb2ac) / (2 * a);
    if (0 < t1 && t1 < 1)
    {
      tvalues.push(t1);
    }
    t2 = (-b - sqrtb2ac) / (2 * a);
    if (0 < t2 && t2 < 1)
    {
      tvalues.push(t2);
    }
  }

  var x, y, j = tvalues.length,
    jlen = j,
    mt;
  while (j--)
  {
    t = tvalues[j];
    mt = 1 - t;
    x = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
    bounds[0][j] = x;

    y = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
    bounds[1][j] = y;
    points[j] = {
      X: x,
      Y: y
    };
  }

  tvalues[jlen] = 0;
  tvalues[jlen + 1] = 1;
  points[jlen] = {
    X: x0,
    Y: y0
  };
  points[jlen + 1] = {
    X: x3,
    Y: y3
  };
  bounds[0][jlen] = x0;
  bounds[1][jlen] = y0;
  bounds[0][jlen + 1] = x3;
  bounds[1][jlen + 1] = y3;
  tvalues.length = bounds[0].length = bounds[1].length = points.length = jlen + 2;

  return {
    left: min.apply(null, bounds[0]),
    top: min.apply(null, bounds[1]),
    right: max.apply(null, bounds[0]),
    bottom: max.apply(null, bounds[1]),
    points: points, // local extremes
    tvalues: tvalues // t values of local extremes
  };
};


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
