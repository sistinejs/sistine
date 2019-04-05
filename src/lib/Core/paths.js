import { Geom } from "../Geom/index"
import * as dlist from "../Utils/dlist";
import * as models from "./models"
import * as controller from "./controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

/**
 * A wrapper over a path.
 */
export class Path extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        configs = configs || {};
        this._components = [];
        this._currPoint = null;
    }

    get currPoint() { return this._currPoint; }

    get controllerClass() { return Path.Controller; }

    _setBounds(newBounds) {
        var oldBounds = this.boundingBox;
        var sx = newBounds.width / oldBounds.width;
        var sy = newBounds.height / oldBounds.height;
        for (var i = 0;i < this._components.length;i++) {
            var currComp = this._components[i];
            var nCPT = currComp.numControlPoints;
            for (var i = nCPT - 1;i >= 0;i--) {
                var cpt = currComp.getControlPoint(i);
                var nx = newBounds.x + ((cpt.x - oldBounds.x) * sx);
                var ny = newBounds.y + ((cpt.y - oldBounds.y) * sy);
                currComp.setControlPoint(i, nx, ny);
            }
        }
    }

    _evalBoundingBox() {
        var out = new Geom.Models.Bounds();
        for (var i = 0;i < this._components.length;i++) {
            var currComp = this._components[i];
            out.union(currComp.boundingBox);
        }
        return out;
    }

    /**
     * Add a new path component at the end of the path.
     */
    addComponent(component) {
        this._components.push(component);
        this.markTransformed();
    }

    get componentCount() {
        return this._components.length;
    }

    setCurrentPoint(x, y, isRelative) {
        if (this._currPoint == null) {
            this._currPoint = new Geom.Models.Point(x, y);
        }
        else if (isRelative) {
            this._currPoint.translate(x, y);
        } else {
            this._currPoint.set(x, y);
        }
        return this._currPoint;
    }
    get hasCurrentPoint() {
        return this._currPoint !=- null;
    }
    _ensureCurrentPoint() {
        if (this._currPoint == null) {
            throw new Error("Current point is null");
        }
        return this._currPoint;
    }

    get currentComponent() {
        if (this._components.length == 0) return null;
        return this._components[this._components.length - 1];
    }

    moveTo(x, y, isRelative) { 
        var cp = this.setCurrentPoint(x, y, isRelative);
        this.addComponent(new MoveToComponent(this.currentComponent, cp.x, cp.y));
    }
    closePath() {
        this.addComponent(new CloseComponent(this.currentComponent));
    }
    lineTo(x, y, isRelative) { 
        var cp = this.setCurrentPoint(x, y, isRelative);
        this.addComponent(new LineToComponent(this.currentComponent, cp.x, cp.y));
    }
    hlineTo(x, isRelative) { 
        var cp = this._ensureCurrentPoint();
        if (isRelative) {
            cp.x += x;
        } else {
            cp.x = x;
        }
        this.addComponent(new LineToComponent(this.currentComponent, cp.x, cp.y));
    }
    vlineTo(y, isRelative) { 
        var cp = this._currPoint;
        if (isRelative) {
            cp.y += y;
        } else {
            cp.y = y;
        }
        this.addComponent(new LineToComponent(this.currentComponent, cp.x, cp.y));
    }
    quadraticCurveTo(cp1x, cp1y, x, y, isRelative, isSmooth) {
        if (isSmooth) {
            throw new Error("Smooth curves not yet implemented.");
        }
        var cp = this._currPoint || new Geom.Models.Point();
        var x1 = cp1x;
        var y1 = cp1y;
        var x2 = x;
        var y2 = y;
        if (isRelative) {
            x1 += cp.x;
            y1 += cp.y;
            x2 += cp.x;
            y2 += cp.y;
        }
        this._currPoint = new Geom.Models.Point(x2, y2);
        this.addComponent(new QuadraticToComponent(this.currentComponent, x1, y1, x2, y2));
    }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y, isRelative, isSmooth) {
        if (isSmooth) {
            throw new Error("Smooth curves not yet implemented.");
        }
        var cp = this._currPoint || new Geom.Models.Point();
        var x1 = cp1x;
        var y1 = cp1y;
        var x2 = cp2x;
        var y2 = cp2y;
        var x3 = x;
        var y3 = y;
        if (isRelative) {
            x1 += cp.x;
            y1 += cp.y;
            x2 += cp.x;
            y2 += cp.y;
            x3 += cp.x;
            y3 += cp.y;
        }
        this._currPoint = new Geom.Models.Point(x3, y3);
        this.addComponent(new BezierToComponent(this.currentComponent, x1, y1, x2, y2, x3, y3));
    }
    arc(x, y, radius, startAngle, endAngle, anticlockwise, isRelative) {
        this.addComponent(new ArcComponent(this.currentComponent, x, y, radius, startAngle, endAngle, anticlockwise));
    }
    arcTo(x1, y1, x2, y2, radius, isRelative) {
        this.addComponent(new ArcToComponent(this.currentComponent, this._cmdArcTo, x1, y1, x2, y2, radius));
    }
    svgArcTo(rx, ry, rotation, isLargeArc, shouldSweep, endX, endY, isRelative) {
        var cp = this.setCurrentPoint(endX, endY, isRelative);
        this.addComponent(new SVGArcToComponent(this.currentComponent, rx, ry, rotation, isLargeArc, shouldSweep, cp.x, cp.y));
    }

    draw(ctx) {
        ctx.beginPath();
        for (var i = 0;i < this._components.length;i++) {
            var currComp = this._components[i];
            currComp.draw(ctx);
        }
        if (this.fillStyle.value && !this.fillStyle.inherit) {
            ctx.fill();
        }
        if (this.lineWidth.value && this.lineWidth.value > 0) {
            ctx.stroke();
        }
        // Draw fornow till we figure out hit tests and bounding boxes
        // this.drawControls(ctx);
    }

    drawControls(ctx, options) {
        super.drawControls(ctx, options);
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        for (var i = 0;i < this._components.length;i++) {
            var currComp = this._components[i];
            currComp.draw(ctx);
            for (var i = currComp.numControlPoints - 1;i >= 0;i--) {
                var cpt = currComp.getControlPoint(i);
                ctx.beginPath();
                ctx.arc(cpt.x, cpt.y, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }
    }
}

/**
 * A path is composed of several path components and form different kinds of units in a path
 * like lines, arcs, quadratic beziers etc.
 */
export class PathComponent {
    constructor(prev) {
        this.next = null;
        this.prev = prev || null;
        if (prev) prev.next = this;
        this._boundingBox = null;
    }

    get boundingBox() {
        if (this._boundingBox == null) {
            this._boundingBox = this._evalBoundingBox();
        }
        return this._boundingBox;
    }

    getControlPoint(i) { throw new Error( "Not implemented"); }
    setControlPoint(index, x, y) { throw new Error( "Not implemented"); }
    // get controlPoints() { return this._controlPoints; } 
    // setControlPoint(index, x, y) { this._controlPoints[index].set(x, y); this.markTransformed(); }
    get numControlPoints() { return 0; } 

    /**
     * Called when the previous component has changed in which case the 
     * current component needs to be updated.
     */
    previousChanged() { }

    _notifyNext() {
        if (this.next != null) {
            this.next.previousChanged();
        }
    }
}

export class CloseComponent extends PathComponent {
    _evalBoundingBox() {
        return new Geom.Models.Bounds();
    }

    get endPoint() {
        return this.prev ? this.prev.endPoint : null;
    }

    draw(ctx) { ctx.closePath(); }
}

export class MoveToComponent extends PathComponent {
    constructor(prev, x, y) {
        super(prev);
        this._endPoint = new Geom.Models.Point(x, y);
    }

    _evalBoundingBox() {
        return new Geom.Models.Bounds(this._endPoint.x, this._endPoint.y, 0, 0);
    }

    get endPoint() { return this._endPoint; }

    draw(ctx) {
        ctx.moveTo(this._endPoint.x, this._endPoint.y);
    }

    getControlPoint(index) {
        return this._endPoint;
    }

    setControlPoint(index, x, y) {
        this._endPoint.set(x, y);
        this._boundingBox = null;
        this.notifyNext();
    }

    get numControlPoints() {
        return 1;
    }
}

export class LineToComponent extends PathComponent {
    constructor(prev, x, y) {
        super(prev);
        this._endPoint = new Geom.Models.Point(x, y);
    }

    _evalBoundingBox() {
        var minx = this._endPoint.x;
        var miny = this._endPoint.y;
        var maxx = minx;
        var maxy = miny;
        if (this.prev) {
            minx = Math.min(minx, this.prev.endPoint.x);
            miny = Math.min(miny, this.prev.endPoint.y);
            maxx = Math.max(maxx, this.prev.endPoint.x);
            maxy = Math.max(maxy, this.prev.endPoint.y);
        }
        return new Geom.Models.Bounds(minx, miny, maxx - minx, maxy - miny);
    }

    get endPoint() { return this._endPoint; }

    draw(ctx) {
        ctx.lineTo(this._endPoint.x, this._endPoint.y);
    }

    getControlPoint(index) {
        return this._endPoint;
    }

    setControlPoint(index, x, y) {
        this._endPoint.set(x, y);
        this._boundingBox = null;
        this.notifyNext();
    }

    get numControlPoints() {
        return 1;
    }
}

export class QuadraticToComponent extends PathComponent {
    constructor(prev, x1, y1, x2, y2) {
        super(prev);
        this.p1 = new Geom.Models.Point(x1, y1);
        this.p2 = new Geom.Models.Point(x2, y2);
    }

    _evalBoundingBox() {
        var result = null;
        if (this.prev) {
            var p0 = this.prev.endPoint;
            var p1 = this.p1;
            var p2 = this.p2;
            result = Geom.Utils.boundsOfQuadCurve(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
            return new Geom.Models.Bounds(result.left, result.top,
                                          result.right - result.left,
                                          result.bottom - result.top);
        } else {
            var minx = Math.min(this.p1.x, this.p2.x);
            var miny = Math.min(this.p1.y, this.p2.y);
            var maxx = Math.max(this.p1.x, this.p2.x);
            var maxy = Math.max(this.p1.y, this.p2.y);
            return new Geom.Models.Bounds(minx, miny, maxx - minx, maxy - miny);
        }
    }

    draw(ctx) {
        ctx.quadraticCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    }

    get endPoint() {
        return this.p2;
    }

    getControlPoint(index) {
        if (index == 0) {
            return this.p1;
        } else {
            return this.p2;
        }
    }

    setControlPoint(index, x, y) {
        if (index == 0) {
            this.p1.set(x, y);
        } else {
            this.p2.set(x, y);
        }
        this._boundingBox = null;
    }

    get numControlPoints() {
        return 2;
    }
}

export class BezierToComponent extends PathComponent {
    constructor(prev, x1, y1, x2, y2, x3, y3) {
        super(prev);
        this.p1 = new Geom.Models.Point(x1, y1);
        this.p2 = new Geom.Models.Point(x2, y2);
        this.p3 = new Geom.Models.Point(x3, y3);
    }

    draw(ctx) {
        ctx.bezierCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
    }

    get endPoint() {
        return this.p3;
    }

    setControlPoint(index, x, y) {
        if (index == 0) {
            this.p1.set(x, y);
        } else if (index == 1) {
            this.p2.set(x, y);
        } else {
            this.p3.set(x, y);
        }
        this._boundingBox = null;
    }

    getControlPoint(i) {
        if (i == 0) {
            return this.p1;
        } else if (i == 1) {
            return this.p2;
        } else {
            return this.p3;
        }
    }

    get numControlPoints() {
        return 3;
    }

    _evalBoundingBox() {
        var result = null;
        if (this.prev) {
            result = Geom.Utils.boundsOfCubicCurve(this.prev.endPoint.x, this.prev.endPoint.y, 
                                                  this.p1.x, this.p1.y,
                                                  this.p2.x, this.p2.y,
                                                  this.p3.x, this.p3.y);
        } else {
            result = Geom.Utils.boundsOfCubicCurve(this.p1.x, this.p1.y,
                                                   this.p1.x, this.p1.y,
                                                   this.p2.x, this.p2.y,
                                                   this.p3.x, this.p3.y);
        }
        return new Geom.Models.Bounds(result.left, result.top,
                                      result.right - result.left,
                                      result.bottom - result.top);
    }
}

export class ArcComponent extends PathComponent {
    constructor(prev, x, y, radius, startAngle, endAngle, anticlockwise) {
        super(prev);
        this._cx = cx;
        this._cy = cy;
        this._radius = radius;
        this._startAngle = startAngle;
        this._endAngle = endAngle;
        this._anticlockwise = anticlockwise;
    }

    draw(ctx) {
        ctx.arc(this._cx, this._cy, this._radius, this._startAngle, this._endAngle, this._anticlockwise);
    }
}

export class ArcToComponent extends PathComponent {
    constructor(prev, x1, y1, x2, y2, radius) {
        super(prev);
        this.p1 = new Geom.Models.Point(x1, y1);
        this.p2 = new Geom.Models.Point(x2, y2);
    }

    draw(ctx) {
        ctx.arcTo(this.startPoint.x, this.startPoint.y,
                  this.endPoint.x, this.endPoint.x, this.radius);
    }

    get endPoint() {
        return this.p2;
    }

    getControlPoint(index) {
        if (index == 0) {
            return this.p1;
        } else {
            return this.p2;
        }
    }

    setControlPoint(index, x, y) {
        if (index == 0) {
            this.p1.set(x, y);
        } else {
            this.p2.set(x, y);
        }
        this._boundingBox = null;
    }

    get numControlPoints() {
        return 2;
    }
}

/**
 * An elliptical arc parametrized by endpoints as in an SVG path.
 */
export class SVGArcToComponent extends PathComponent {
    constructor(prev, rx, ry, rotation, isLargeArc, shouldSweep, endX, endY) {
        super(prev);
        this._rx = rx;
        this._ry = ry;
        this._rotation = rotation;
        this._rotationPoint = new Geom.Models.Point();
        this._center = new Geom.Models.Point();
        this._endPoint = new Geom.Models.Point(endX, endY);
        this._isLargeArc = isLargeArc;
        this._shouldSweep = shouldSweep;
    }

    get startPoint() { return this.prev.endPoint; }
    get endPoint() { return this._endPoint; }
    get startAngle() { return this._startAngle; }
    get endAngle() { return this._endAngle; }

    draw(ctx) {
        ctx.ellipse(this._center.x, this._center.y,
                    this._rx, this._ry, this._rotation,
                    this._startAngle, this._endAngle, this._anticlockwise);
    }

    set isAnticlockwise(anticlockwise) {
        this._isAnticlockwise = anticlockwise || false;
        this._boundingBox = null;
    }

    _evalBoundingBox() {
        var prevX = this.startPoint.x;
        var prevY = this.startPoint.y;
        var params = Geom.Utils.endpointsToCenter(prevX, prevY, this._rx, this._ry, this._rotation,
                                                  this._isLargeArc, this._shouldSweep,
                                                  this._endPoint.x, this._endPoint.y);
        this._rotationPoint.set();
        this._center.set(params.cx, params.cy);
        this._rx = params.rx;
        this._ry = params.ry;
        this._startAngle = params.startAngle;
        this._endAngle = params.endAngle;
        this._anticlockwise = !params.clockwise;

        var bounds = Geom.Utils.svgArcBounds(prevX, prevY, this._rx, this._ry,
                                             this._rotation, this._isLargeArc,
                                             this._shouldSweep,
                                             this._endPoint.x, this._endPoint.y);
        return new Geom.Models.Bounds(bounds.xmin, bounds.ymin,
                                      bounds.xmax - bounds.xmin,
                                      bounds.ymax - bounds.ymin);
    }
}

/**
 * An elliptical arc parametrized by center points.
 */
export class EllipticalArcComponent extends PathComponent {
    constructor(prev, centerX, centerY, rx, ry, rotation, startAngle, endAngle, anticlockwise) {
        super(prev);
        this.rx = rx;
        this.ry = ry;
        this._center = new Geom.Models.Point(centerX, centerY);
        this._startPoint = new Geom.Models.Point();
        this._endPoint = new Geom.Models.Point();
        this._startAngle = startAngle;
        this._endAngle = endAngle;
        this._rotation = rotation;
        this._rotationPoint = new Geom.Models.Point();
        this.isAnticlockwise = anticlockwise || false;
    }

    get startPoint() { return this._startPoint; }
    get endPoint() { return this._endPoint; }
    get startAngle() { return this._startAngle; }
    get endAngle() { return this._endAngle; }

    draw(ctx) {
        ctx.ellipse(this._center.x, this._center.y,
                    this.rx, this.ry, this.rotation,
                    this.startAngle, this.endAngle, this.isAnticlockwise);
    }

    set isAnticlockwise(anticlockwise) {
        this._isAnticlockwise = anticlockwise || false;
        this._boundingBox = null;
    }

    get numControlPoints() { return 4; } 

    getControlPoint(index) {
        if (index == 0) {
            return this._endPoint;
        } else if (index == 1) {
            return this._center;
        } else if (index == 2) {
            return this._startPoint;
        } else {
            return this._rotationPoint;
        }
    }

    setControlPoint(index, x, y) {
        if (index == 0) {
            this._endPoint.set(x, y);
            this.notifyNext();
        } else if (index == 1) {
            this._center.set(x, y);
        } else if (index == 2) {
            this._startPoint.set(x, y);
        } else {
            this._rotationPoint.set(x, y);
        }
        this._boundingBox = null;
    }

    _evalBoundingBox() {
        var params = Geom.Utils.centerToEndpoints(this._center.x, this._center.y,
                                                  this._rx, this._ry,
                                                  this._rotation, this._startAngle,
                                                  this._endAngle - this._startAngle);
        this._startPoint.set(params.x1, params.y1);
        this._endPoint.set(params.x2, params.y2);
        var bounds = Geom.Utils.ellipticalArcBounds(this._center.x, this._center.y,
                                                    this._rx, this._ry,
                                                    this._rotation, this._startAngle,
                                                    this._endAngle - this._startAngle,
                                                    this._anticlockwise);
        return new Geom.Models.Bounds(params.xmin, params.ymin,
                                      params.xmax - params.xmin,
                                      params.ymax - params.ymin);
    }
}


Path.Controller = class PathController extends controller.ShapeController {
    _evalControlPoints() {
        var ours = [];
        var path = this.shape;
        var j = 1;
        var components = path._components;
        for (var i = 0;i < components.length;i++) {
            var currComp = components[i];
            var nCPT = currComp.numControlPoints;
            for (var i = 0;i < nCPT;i++) {
                var cpt = currComp.getControlPoint(i);
                var controlPoint = new ControlPoint(cpt, HitType.CONTROL, j++, "grab", {'component': currComp, 'index': i})
                ours.push(controlPoint);
            }
        }
        var parents = super._evalControlPoints();
        return ours.concat(parents);
    }

    applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY) {
        if (hitInfo.hitType != HitType.CONTROL) {
            return super.applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY);
        }

        var deltaX = currX - downX;
        var deltaY = currY - downY;
        var path = this.shape;
        var downPoint = savedInfo.downPoint;
        var nx = downPoint.x + deltaX;
        var ny = downPoint.y + deltaY;
        var cpComponent = hitInfo.controlPoint.extraData.component;
        var cpIndex = hitInfo.controlPoint.extraData.index;
        cpComponent.setControlPoint(cpIndex, nx, ny);
        path._boundingBox = null;
        path.markTransformed();
    }

    snapshotFor(hitInfo) {
        var out = super.snapshotFor(hitInfo);
        if (hitInfo && hitInfo.hitType == HitType.CONTROL) {
            out.downPoint = hitInfo.controlPoint.point.copy();
        }
        return out;
    }
}
