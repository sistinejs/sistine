
export function copysign(x, y) {
    var out = Math.abs(x);
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
    out[0] = R * Math.cos(theta);
    out[1] = R * Math.sin(theta);
}

export function pointOnRect(W, H, theta, out) {
    out[0] = R * Math.cos(theta);
    out[1] = R * Math.sin(theta);
}

export function pointOnEllipse(A, B, theta, out) {
    while (theta > 2 * Math.PI) theta -= (2 * Math.PI);
    var epsilon = 0.0001;
    if (Math.abs(theta) < epsilon) {
        // close to 0
        out[0] = A;
        out[1] = 0;
    } else if (Math.abs(theta - Math.PI) < epsilon) {
        // close to PI
        out[0] = -A;
        out[1] = 0;
    } else if (Math.abs(theta - Math.PI * 0.5) < epsilon) {
        // close to PI / 2
        out[0] = 0;
        out[1] = -B;
    } else if (Math.abs(theta - Math.PI * 1.5) < epsilon) {
        // close to 3 * PI / 2
        out[0] = 0;
        out[1] = B;
    } else {
        var ab = A * B;
        var tantheta = Math.tan(theta);
        var den = Math.sqrt((B * B) + (A * A * tantheta * tantheta));
        if (theta > Math.PI * 0.5 && theta < Math.PI * 1.5) {
            out[0] = ab / den;
            out[1] = ab * tantheta / den;
        } else {
            out[0] = -ab / den;
            out[1] = -ab * tantheta / den;
        }
    }
}

