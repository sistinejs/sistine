
import * as models from "./models"

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
    out = out || new models.Point();
    out.x = R * cos(theta);
    out.y = R * sin(theta);
    return out;
}

export function pointOnRect(W, H, theta, out) {
    out = out || new models.Point();
    out.x = R * cos(theta);
    out.y = R * sin(theta);
    return out;
}

export function pointOnEllipse(A, B, theta, out) {
    out = out || new models.Point();
    while (theta > 2 * PI) theta -= (2 * PI);
    var epsilon = 0.0001;
    if (abs(theta) < epsilon) {
        // close to 0
        out.x = A;
        out.y = 0;
    } else if (abs(theta - PI) < epsilon) {
        // close to PI
        out.x = -A;
        out.y = 0;
    } else if (abs(theta - PI * 0.5) < epsilon) {
        // close to PI / 2
        out.x = 0;
        out.y = -B;
    } else if (abs(theta - PI * 1.5) < epsilon) {
        // close to 3 * PI / 2
        out.x = 0;
        out.y = B;
    } else {
        var ab = A * B;
        var tantheta = tan(theta);
        var den = sqrt((B * B) + (A * A * tantheta * tantheta));
        if (theta > PI * 0.5 && theta < PI * 1.5) {
            out.x = ab / den;
            out.y = ab * tantheta / den;
        } else {
            out.x = -ab / den;
            out.y = -ab * tantheta / den;
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

