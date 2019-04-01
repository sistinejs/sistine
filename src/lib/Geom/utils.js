
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
var PIx2 = Math.PI * 2.0;

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

export function boundsOfQuadCurve(x0, y0, x1, y1, x2, y2) {
    return boundsOfCubicCurve(x0, y0,
                              x0 + (2 * (x1 - x0) / 3.0),
                              y0 + (2 * (y1 - y0) / 3.0),
                              x2 + (2 * (x1 - x2) / 3.0),
                              y2 + (2 * (y1 - y2) / 3.0),
                              x2, y2);
}

// SOURCE: https://stackoverflow.com/questions/2587751/an-algorithm-to-find-bounding-box-of-closed-bezier-curves
export function boundsOfCubicCurve(x0, y0, x1, y1, x2, y2, x3, y3)
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

/**
 * Converts from center to endpoint parametrization.  
 *
 * Given an arc denoted by:
 *      cx cy rx ry φ θ1 Δθ
 *
 * Returns:
 *      x1 y1 x2 y2 fA fS
 *
 * Source: https://www.w3.org/TR/SVG11/implnote.html#ArcConversionCenterToEndpoint
 */
export function centerToEndpoints(cx, cy, rx, ry, phi, theta, deltaTheta) {
    var sinphi = Math.sin(phi);
    var cosphi = Math.cos(phi);
    var sintheta = Math.sin(theta);
    var costheta = Math.cos(theta);
    var sintheta2 = Math.sin(theta + deltaTheta);
    var costheta2 = Math.cos(theta + deltaTheta);
    return {
        x1: cx + (rx * costheta1 * cosphi) - (ry * sintheta1 * sinphi),
        y1: cy + (rx * costheta1 * sinphi) + (ry * sintheta1 * cosphi),
        x2: cx + (rx * costheta2 * cosphi) - (ry * sintheta2 * sinphi),
        y2: cy + (rx * costheta2 * sinphi) + (ry * sintheta2 * cosphi),
        fA: Math.abs(deltaTheta) > Math.PI,
        fS: deltaTheta > Math.PI,
        clockwise: deltaTheta > Math.PI,
    };
}

/**
 * Converts from endpoint to center point parametrization.
 *
 * Given the following variables:
 *      x1 y1 x2 y2 fA fS rx ry φ
 * 
 * Returns:
 *      cx cy θ1 Δθ
 *
 * Source: https://www.w3.org/TR/SVG11/implnote.html#ArcConversionEndpointToCenter
 */
export function endpointsToCenter(x1, y1, rx, ry, phi, fA, fS, x2, y2) {
    var cx, cy, startAngle, deltaAngle, endAngle;

    if (rx < 0) {
        rx = -rx;
    }
    if (ry < 0) {
        ry = -ry;
    }

    // F.6.6: Step 1 - ensure radii are non-zero so treat as non zero
    if (rx == 0.0 || ry == 0.0) { // invalid arguments
        return outputObj = { /* cx, cy, startAngle, deltaAngle */
            cx: (x1 + x2) / 2.0,
            cy: (y1 + y2) / 2.0,
            startAngle: 0,
            deltaAngle: Math.PI / 2,
            endAngle: Math.PI / 2,
            isLine: true,
            clockwise: true
        }
    }

    var s_phi = Math.sin(phi);
    var c_phi = Math.cos(phi);
    var hd_x = (x1 - x2) / 2.0; // half diff of x
    var hd_y = (y1 - y2) / 2.0; // half diff of y
    var hs_x = (x1 + x2) / 2.0; // half sum of x
    var hs_y = (y1 + y2) / 2.0; // half sum of y

    // F6.5.1
    var x1_ = c_phi * hd_x + s_phi * hd_y;
    var y1_ = c_phi * hd_y - s_phi * hd_x;

    // F.6.6 Correction of out-of-range radii
    //   Step 3: Ensure radii are large enough
    var lambda = (x1_ * x1_) / (rx * rx) + (y1_ * y1_) / (ry * ry);
    if (lambda > 1) {
        rx = rx * Math.sqrt(lambda);
        ry = ry * Math.sqrt(lambda);
    }

    var rxry = rx * ry;
    var rxy1_ = rx * y1_;
    var ryx1_ = ry * x1_;
    var sum_of_sq = rxy1_ * rxy1_ + ryx1_ * ryx1_; // sum of square
    if (!sum_of_sq) {
        throw Error('start point can not be same as end point');
    }
    var coe = Math.sqrt(Math.abs((rxry * rxry - sum_of_sq) / sum_of_sq));
    if (fA == fS) { coe = -coe; }

    // F6.5.2
    var cx_ = coe * rxy1_ / ry;
    var cy_ = -coe * ryx1_ / rx;

    // F6.5.3
    cx = c_phi * cx_ - s_phi * cy_ + hs_x;
    cy = s_phi * cx_ + c_phi * cy_ + hs_y;

    var xcr1 = (x1_ - cx_) / rx;
    var xcr2 = (x1_ + cx_) / rx;
    var ycr1 = (y1_ - cy_) / ry;
    var ycr2 = (y1_ + cy_) / ry;

    // F6.5.5
    startAngle = angleBetweenVectors(1.0, 0.0, xcr1, ycr1);

    // F6.5.6
    deltaAngle = angleBetweenVectors(xcr1, ycr1, -xcr2, -ycr2);
    while (deltaAngle > PIx2) { deltaAngle -= PIx2; }
    while (deltaAngle < 0.0) { deltaAngle += PIx2; }
    if (fS == false || fS == 0) { deltaAngle -= PIx2; }
    endAngle = startAngle + deltaAngle;
    while (endAngle > PIx2) { endAngle -= PIx2; }
    while (endAngle < 0.0) { endAngle += PIx2; }

    var outputObj = { /* cx, cy, startAngle, deltaAngle */
        cx: cx,
        cy: cy,
        startAngle: startAngle,
        deltaAngle: deltaAngle,
        endAngle: endAngle,
        isLine: false,
        clockwise: (fS == true || fS == 1)
    }
    return outputObj;
}

/**
 * Calculates the angle in radians between two vectors.
 */
export function angleBetweenVectors(ux, uy, vx, vy) {
    var  dot = ux * vx + uy * vy;
    var  mod = Math.sqrt( ( ux * ux + uy * uy ) * ( vx * vx + vy * vy ) );
    var  rad = Math.acos( dot / mod );
    if( ux * vy - uy * vx < 0.0 ) {
        rad = -rad;
    }
    return rad;
}
