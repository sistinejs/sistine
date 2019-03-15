
import * as events from "./events";

/////////////// Controllers 

export const HitType = {
    MOVE: 0,
    SIZE: 1,
    ROTATE: 2,
    CONTROL: 3,

    SIZE_N: 0,
    SIZE_NE: 1,
    SIZE_E: 2,
    SIZE_SE: 3,
    SIZE_S: 4,
    SIZE_SW: 5,
    SIZE_W: 6,
    SIZE_NW: 7,
}

export class HitInfo {
    constructor(shape, hitType, hitIndex, cursor) {
        this.hitShape = shape;
        this.hitType = hitType || 0;
        this.hitIndex = hitIndex || 0;
        this.cursor = cursor || "auto";
    }
}

/**
 * ShapeControllers provide information needed to facilitate updates to a shape as 
 * well as in accepting events to make updates to shapes.
 */
export class ShapeController {
    constructor(shape) {
        this._shape = shape;
    }

    get shape() {
        return this._shape;
    }

    /**
     * Returns the "topmost" shape that can be hit at a given coordinate.
     */
    getHitInfo(gx, gy) {
        var newp = this.shape.globalTransform.apply(gx, gy, {});
        var x = newp.x;
        var y = newp.y;
        var bounds = this.shape.bounds;
        var controlSize = this.shape.controlSize;
        var l = bounds.left;
        var r = bounds.right;
        var t = bounds.top;
        var b = bounds.bottom;
        var sizePoints = [
            [[(l + r) / 2, t], "n-resize"],
            [[r, t], "ne-resize"],
            [[r, (t + b) / 2], "e-resize"],
            [[r, b], "se-resize"],
            [[(l + r) / 2, b], "s-resize"],
            [[l, b], "sw-resize"],
            [[l, (t + b) / 2], "w-resize"],
            [[l, t], "nw-resize"],
        ]
        for (var i in sizePoints) {
            var hti = sizePoints[i];
            var px = hti[0][0];
            var py = hti[0][1];
            var cursor = hti[1];
            if (x >= px - controlSize && x <= px + controlSize &&
                y >= py - controlSize && y <= py + controlSize) {
                return new HitInfo(this.shape, HitType.SIZE, i, cursor);
            }
        }

        var rotX = bounds.right + 50;
        var rotY = bounds.centerY;
        if (x >= rotX - controlSize && x <= rotX + controlSize &&
            y >= rotY - controlSize && y <= rotY + controlSize) {
            return new HitInfo(this.shape, HitType.ROTATE, 0, "grab");
        }
        if (bounds.containsPoint(x, y)) {
            return new HitInfo(this.shape, HitType.MOVE, 0, "move");
        }
        return null;
    }

    snapshotFor(hitInfo) {
        return {'bounds': this.shape.bounds.copy(), angle: this.shape.angle};
    }

    applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY) {
        var deltaX = currX - downX;
        var deltaY = currY - downY;
        var shape = this.shape;
        console.log("Delta: ", deltaX, deltaY, shape.isGroup);
        if (hitInfo.hitType == HitType.MOVE) {
            shape.setLocation(savedInfo.bounds.left + deltaX,
                              savedInfo.bounds.top + deltaY);
        } else if (hitInfo.hitType == HitType.SIZE) {
            var newTop = savedInfo.bounds.top;
            var newLeft = savedInfo.bounds.left;
            var newHeight = savedInfo.bounds.height;
            var newWidth = savedInfo.bounds.width;
            if (hitInfo.hitIndex == HitType.SIZE_N) {
                newHeight -= deltaY;
                newTop += deltaY;
            } else if (hitInfo.hitIndex == HitType.SIZE_NE) {
                newHeight -= deltaY;
                newWidth += deltaX;
                newTop += deltaY;
            } else if (hitInfo.hitIndex == HitType.SIZE_E) {
                newWidth += deltaX;
            } else if (hitInfo.hitIndex == HitType.SIZE_SE) {
                newHeight += deltaY;
                newWidth += deltaX;
            } else if (hitInfo.hitIndex == HitType.SIZE_S) {
                newHeight += deltaY;
            } else if (hitInfo.hitIndex == HitType.SIZE_SW) {
                newHeight += deltaY;
                newWidth -= deltaX;
                newLeft += deltaX;
            } else if (hitInfo.hitIndex == HitType.SIZE_W) {
                newLeft += deltaX;
                newWidth -= deltaX;
            } else if (hitInfo.hitIndex == HitType.SIZE_NW) {
                newHeight -= deltaY;
                newTop += deltaY;
                newLeft += deltaX;
                newWidth -= deltaX;
            }
            shape.setLocation(newLeft, newTop);
            shape.setSize(newWidth, newHeight);
        } else if (hitInfo.hitType == HitType.ROTATE) {
            var centerX = hitInfo.hitShape.bounds.centerX;
            var centerY = hitInfo.hitShape.bounds.centerY;
            var deltaX = currX - centerX;
            var deltaY = currY - centerY;
            var newAngle = 0;
            if (deltaX == 0) {
                if (deltaY > 0) {
                    newAngle = Math.PI / 2;
                } else {
                    newAngle = Math.PI * 3 / 2;
                }
            } else {
                newAngle = Math.atan(deltaY / deltaX);
            }
            if (deltaX < 0) {
                newAngle += Math.PI;
            }
            console.log("Rotating: ", deltaX, deltaY,
                        (deltaX == 0 ? "Inf" : deltaY / deltaX), newAngle);
            shape.setAngle(newAngle);
        } else if (hitInfo.hitType == HitType.CONTROL) {
        }
    }
}

class PathController extends ShapeController {
}

