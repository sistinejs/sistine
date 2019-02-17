
export function copysign(x, y) {
    var out = Math.abs(x);
    if (y < 0) {
        return -x;
    } else {
        return x;
    }
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

