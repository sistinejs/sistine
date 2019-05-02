import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"
import * as logging from "../Utils/logging"

const PROPERTY_STATE_NONE = 0;
const PROPERTY_STATE_PRESENT = 1;
const PROPERTY_STATE_INHERITED = 2;

class AttribFrame {
    constructor(parent) {
        this.parent = parent || null;

        this.transform = new geom.Transform();

        if (this.parent == null) {
            // at root so give them initial values
            this._assignProperty("_fillStyle", "#000000", PROPERTY_STATE_PRESENT);
            this._assignProperty("_fillOpacity", 1.0, PROPERTY_STATE_PRESENT);
            this._assignProperty("_fillRule", "nonzero", PROPERTY_STATE_PRESENT);

            this._assignProperty("_strokeStyle", null, PROPERTY_STATE_PRESENT);
            this._assignProperty("_strokeOpacity", 1.0, PROPERTY_STATE_PRESENT);
            this._assignProperty("_lineWidth", 1.0, PROPERTY_STATE_PRESENT);
            this._assignProperty("_lineCap", "butt", PROPERTY_STATE_PRESENT);
            this._assignProperty("_lineJoin", "miter", PROPERTY_STATE_PRESENT);
            this._assignProperty("_miterLimit", 4, PROPERTY_STATE_PRESENT);
            this._assignProperty("_lineDash", null, PROPERTY_STATE_PRESENT);
            this._assignProperty("_lineDashOffset", 0, PROPERTY_STATE_PRESENT);

            this._assignProperty("_shadowOffsetX", 0, PROPERTY_STATE_PRESENT);
            this._assignProperty("_shadowOffsetY", 0, PROPERTY_STATE_PRESENT);
            this._assignProperty("_shadowBlur", 0, PROPERTY_STATE_PRESENT);
            this._assignProperty("_shadowColor", null, PROPERTY_STATE_PRESENT);
            this._assignProperty("_textAlign", "start", PROPERTY_STATE_PRESENT);
            this._assignProperty("_textBaseline", "alphabetic", PROPERTY_STATE_PRESENT);
            this._assignProperty("_font", null, PROPERTY_STATE_PRESENT);
            this._assignProperty("_direction", "inherit", PROPERTY_STATE_PRESENT);
            this._assignProperty("_globalCompositeOperation", "source-over", PROPERTY_STATE_PRESENT);
            this._assignProperty("_imageSmoothingEnabled", true, PROPERTY_STATE_PRESENT);
        } else {
            this._assignProperty("_fillStyle", null, PROPERTY_STATE_NONE);
            this._assignProperty("_fillOpacity", null, PROPERTY_STATE_NONE);
            this._assignProperty("_fillRule", null, PROPERTY_STATE_NONE);

            this._assignProperty("_strokeStyle", null, PROPERTY_STATE_NONE);
            this._assignProperty("_strokeOpacity", null, PROPERTY_STATE_NONE);
            this._assignProperty("_lineWidth", null, PROPERTY_STATE_NONE);
            this._assignProperty("_lineCap", null, PROPERTY_STATE_NONE);
            this._assignProperty("_lineJoin", null, PROPERTY_STATE_NONE);
            this._assignProperty("_miterLimit", null, PROPERTY_STATE_NONE);
            this._assignProperty("_lineDash", null, PROPERTY_STATE_NONE);
            this._assignProperty("_lineDashOffset", null, PROPERTY_STATE_NONE);

            this._assignProperty("_markerStart", null, PROPERTY_STATE_NONE);
            this._assignProperty("_markerMid", null, PROPERTY_STATE_NONE);
            this._assignProperty("_markerEnd", null, PROPERTY_STATE_NONE);

            this._assignProperty("_shadowOffsetX", null, PROPERTY_STATE_NONE);
            this._assignProperty("_shadowOffsetY", null, PROPERTY_STATE_NONE);
            this._assignProperty("_shadowBlur", null, PROPERTY_STATE_NONE);
            this._assignProperty("_shadowColor", null, PROPERTY_STATE_NONE);
            this._assignProperty("_textAlign", null, PROPERTY_STATE_NONE);
            this._assignProperty("_textBaseline", null, PROPERTY_STATE_NONE);
            this._assignProperty("_font", null, PROPERTY_STATE_NONE);
            this._assignProperty("_direction", null, PROPERTY_STATE_NONE);
            this._assignProperty("_globalCompositeOperation", null, PROPERTY_STATE_NONE);
            this._assignProperty("_imageSmoothingEnabled", null, PROPERTY_STATE_NONE);
        }
    }

    _assignProperty(name, value, state) {
        this[name] = value;
        this[name + "State"] = state;
    }

    get fillStyle() {
        if (this._fillStyleState === PROPERTY_STATE_PRESENT) return this._fillStyle;
        else return this.parent.fillStyle;
    }

    set fillStyle(value) {
        if (value === "none") value = null;
        this._fillStyle = value;
        this._fillStyleState = PROPERTY_STATE_PRESENT;
    }

    get fillOpacity() {
        if (this._fillOpacityState === PROPERTY_STATE_PRESENT) return this._fillOpacity;
        else return this.parent.fillOpacity;
    }

    set fillOpacity(value) {
        this._fillOpacity = value;
        this._fillOpacityState = PROPERTY_STATE_PRESENT;
    }

    get fillRule() {
        if (this._fillRuleState === PROPERTY_STATE_PRESENT) return this._fillRule;
        else return this.parent.fillRule;
    }

    set fillRule(value) {
        this._fillRule = value;
        this._fillRuleState = PROPERTY_STATE_PRESENT;
    }

    get strokeStyle() {
        if (this._strokeStyleState === PROPERTY_STATE_PRESENT) return this._strokeStyle;
        else return this.parent.strokeStyle;
    }

    set strokeStyle(value) {
        if (value === "none") value = null;
        this._strokeStyle = value;
        this._strokeStyleState = PROPERTY_STATE_PRESENT;
    }

    get strokeOpacity() {
        if (this._strokeOpacityState === PROPERTY_STATE_PRESENT) return this._strokeOpacity;
        else return this.parent.strokeOpacity;
    }

    set strokeOpacity(value) {
        this._strokeOpacity = value;
        this._strokeOpacityState = PROPERTY_STATE_PRESENT;
    }

    get lineWidth() {
        if (this._lineWidthState === PROPERTY_STATE_PRESENT) return this._lineWidth;
        else return this.parent.lineWidth;
    }

    set lineWidth(value) {
        this._lineWidth = value;
        this._lineWidthState = PROPERTY_STATE_PRESENT;
    }

    get lineCap() {
        if (this._lineCapState === PROPERTY_STATE_PRESENT) return this._lineCap;
        else return this.parent.lineCap;
    }

    set lineCap(value) {
        this._lineCap = value;
        this._lineCapState = PROPERTY_STATE_PRESENT;
    }

    get lineJoin() {
        if (this._lineJoinState === PROPERTY_STATE_PRESENT) return this._lineJoin;
        else return this.parent.lineJoin;
    }

    set lineJoin(value) {
        this._lineJoin = value;
        this._lineJoinState = PROPERTY_STATE_PRESENT;
    }

    get miterLimit() {
        if (this._miterLimitState === PROPERTY_STATE_PRESENT) return this._miterLimit;
        else return this.parent.miterLimit;
    }

    set miterLimit(value) {
        this._miterLimit = value;
        this._miterLimitState = PROPERTY_STATE_PRESENT;
    }

    get lineDash() {
        if (this._lineDashState === PROPERTY_STATE_PRESENT) return this._lineDash;
        else return this.parent.lineDash;
    }

    set lineDash(value) {
        this._lineDash = value;
        this._lineDashState = PROPERTY_STATE_PRESENT;
    }

    get lineDashOffset() {
        if (this._lineDashOffsetState === PROPERTY_STATE_PRESENT) return this._lineDashOffset;
        else return this.parent.lineDashOffset;
    }

    set lineDashOffset(value) {
        this._lineDashOffset = value;
        this._lineDashOffsetState = PROPERTY_STATE_PRESENT;
    }

    get shadowOffsetX() {
        if (this._shadowOffsetXState === PROPERTY_STATE_PRESENT) return this._shadowOffsetX;
        else return this.parent.shadowOffsetX;
    }

    set shadowOffsetX(value) {
        this._shadowOffsetX = value;
        this._shadowOffsetXState = PROPERTY_STATE_PRESENT;
    }

    get shadowOffsetY() {
        if (this._shadowOffsetYState === PROPERTY_STATE_PRESENT) return this._shadowOffsetY;
        else return this.parent.shadowOffsetY;
    }

    set shadowOffsetY(value) {
        this._shadowOffsetY = value;
        this._shadowOffsetYState = PROPERTY_STATE_PRESENT;
    }

    get shadowBlur() {
        if (this._shadowBlurState === PROPERTY_STATE_PRESENT) return this._shadowBlur;
        else return this.parent.shadowBlur;
    }

    set shadowBlur(value) {
        this._shadowBlur = value;
        this._shadowBlurState = PROPERTY_STATE_PRESENT;
    }

    get shadowColor() {
        if (this._shadowColorState === PROPERTY_STATE_PRESENT) return this._shadowColor;
        else return this.parent.shadowColor;
    }

    set shadowColor(value) {
        this._shadowColor = value;
        this._shadowColorState = PROPERTY_STATE_PRESENT;
    }

    get font() {
        if (this._fontState === PROPERTY_STATE_PRESENT) return this._font;
        else return this.parent.font;
    }

    set font(value) {
        this._font = value;
        this._fontState = PROPERTY_STATE_PRESENT;
    }

    get textAlign() {
        if (this._textAlignState === PROPERTY_STATE_PRESENT) return this._textAlign;
        else return this.parent.textAlign;
    }

    set textAlign(value) {
        this._textAlign = value;
        this._textAlignState = PROPERTY_STATE_PRESENT;
    }

    get textBaseline() {
        if (this._textBaselineState === PROPERTY_STATE_PRESENT) return this._textBaseline;
        else return this.parent.textBaseline;
    }

    set textBaseline(value) {
        this._textBaseline = value;
        this._textBaselineState = PROPERTY_STATE_PRESENT;
    }

    get direction() {
        if (this._directionState === PROPERTY_STATE_PRESENT) return this._direction;
        else return this.parent.direction;
    }

    set direction(value) {
        this._direction = value;
        this._directionState = PROPERTY_STATE_PRESENT;
    }

    get imageSmoothingEnabled() {
        if (this._imageSmoothingEnabledState === PROPERTY_STATE_PRESENT) return this._imageSmoothingEnabled;
        else return this.parent.imageSmoothingEnabled;
    }

    set imageSmoothingEnabled(value) {
        this._imageSmoothingEnabled = value;
        this._imageSmoothingEnabledState = PROPERTY_STATE_PRESENT;
    }

    get globalCompositeOperation() {
        if (this._globalCompositeOperationState === PROPERTY_STATE_PRESENT) return this._globalCompositeOperation;
        else return this.parent.globalCompositeOperation;
    }

    set globalCompositeOperation(value) {
        this._globalCompositeOperation = value;
        this._globalCompositeOperationState = PROPERTY_STATE_PRESENT;
    }
}

export class VirtualContext {
    constructor(ctx) {
        this.ctx = ctx;
        this.currentFrame = new AttribFrame();
    }

    save() {
        logging.logfunc("ctx.save");
        this.currentFrame = new AttribFrame(this.currentFrame);
        this.ctx.save();
    }

    restore() {
        if (this.currentFrame.parent != null) {
            this.currentFrame = this.currentFrame.parent;
            this.ctx.restore();
            logging.logfunc("ctx.restore");
        }
    }

    fill() {
        if (this.currentFrame.fillStyle != null) {
            this.ctx.fill(this.currentFrame.fillRule);
            logging.logfunc("ctx.fill", this.currentFrame.fillRule);
        } else {
            this.ctx.fill();
            logging.logfunc("ctx.fill");
        }
    }

    stroke() {
        if (this.currentFrame.strokeStyle != null) {
            this.ctx.stroke();
            logging.logfunc("ctx.stroke");
        }
    }

    transform(a, b, c, d, e, f) {
        // this.currentFrame.transform.multiply(new geom.Transform(a, b, c, d, e, f));
        this.ctx.transform(a, b, c, d, e, f);
        logging.logfunc("ctx.transform", a, b, c, d, e, f);
    }

    setTransform(a, b, c, d, e, f) {
        this.currentFrame.transform.set(a, b, c, d, e, f);
        this.ctx.setTransform(a, b, c, d, e, f);
        logging.logfunc("ctx.setTransform", a, b, c, d, e, f);
    }

    scale(sx, sy) {
        this.currentFrame.transform.scale(sx, sy);
        this.ctx.scale(sx, sy);
        logging.logfunc("ctx.scale", sx, sy);
    }

    translate(tx, ty) {
        this.currentFrame.transform.translate(tx, ty);
        this.ctx.translate(tx, ty);
        logging.logfunc("ctx.translate", tx, ty);
    }

    fillRect(x, y, w, h) {
        if (this.currentFrame.fillStyle != null) {
            this.ctx.fillRect(x, y, w, h);
            logging.logfunc("ctx.fillRect", x, y, w, h);
        }
    }
    strokeRect(x, y, w, h) {
        if (this.currentFrame.strokeStyle != null) {
            this.ctx.strokeRect(x, y, w, h);
            logging.logfunc("ctx.strokeRect", x, y, w, h);
        }
    }

    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        logging.logfunc("ctx.createRadialGradient", x0, y0, r0, x1, y1, r1);
        return this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
    }

    createLinearGradient(x0, y0, x1, y1) {
        logging.logfunc("ctx.createLinearGradient", x0, y0, x1, y1);
        return this.ctx.createLinearGradient(x0, y0, x1, y1);
    }

    // Pass throughs
    clearRect(x, y, w, h) { 
        this.ctx.clearRect(x, y, w, h); 
        logging.logfunc("ctx.clearRect", x, y, w, h);
    }
    beginPath() { 
        logging.logfunc("ctx.beginPath");
        this.ctx.beginPath(); 
    }
    closePath() { 
        logging.logfunc("ctx.closePath");
        this.ctx.closePath(); 
    }
    moveTo(x, y) { 
        logging.logfunc("ctx.moveTo", x, y);
        this.ctx.moveTo(x, y); 
    }
    lineTo(x, y) { 
        logging.logfunc("ctx.lineTo", x, y);
        this.ctx.lineTo(x, y); 
    }
    ellipse(x, y, rx, ry, theta, startAngle, endAngle, anticlockwise) {
        logging.logfunc("ctx.ellipse", x, y, rx, ry, theta,
                         startAngle, endAngle, anticlockwise);
        this.ctx.ellipse(x, y, rx, ry, theta, startAngle, endAngle, anticlockwise);
    }
    arc(x, y, radius, startAngle, endAngle) {
        logging.logfunc("ctx.arc", x, y, radius, startAngle, endAngle);
        this.ctx.arc(x, y, radius, startAngle, endAngle);
    }
    bezierCurveTo(x1, y1, x2, y2, x3, y3) {
        logging.logfunc("ctx.bezierCurveTo", x1, y1, x2, y2, x3, y3);
        this.ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
    }
    quadraticCurveTo(x1, y1, x2, y2) {
        logging.logfunc("ctx.quadraticCurveTo", x1, y1, x2, y2);
        this.ctx.quadraticCurveTo(x1, y1, x2, y2);
    }

    set fillStyle(style) {
        this.currentFrame.fillStyle = style;
        this.ctx.fillStyle = style;
        logging.debug("ctx.fillStyle = ", style);
    }

    set strokeStyle(style) {
        this.currentFrame.strokeStyle = style;
        this.ctx.strokeStyle = style;
        logging.debug("ctx.strokeStyle = ", style);
    }

    set fillOpacity(value) {
        this.currentFrame.fillOpacity = value;
        this.ctx.fillOpacity = value;
        logging.debug("ctx.fillOpacity = ", value);
    }

    set fillRule(value) {
        this.currentFrame.fillRule = value;
    }

    set strokeOpacity(value) {
        this.currentFrame.strokeOpacity = value;
        // TODO: set the opacity in the original color or during stroking
    }

    set lineWidth(value) {
        this.currentFrame.lineWidth = value;
        this.ctx.lineWidth = value;
        logging.debug("ctx.lineWidth = ", value);
    }

    set lineCap(value) {
        this.currentFrame.lineCap = value;
        this.ctx.lineCap = value;
        logging.debug("ctx.lineCap = ", value);
    }

    set lineJoin(value) {
        this.currentFrame.lineJoin = value;
        this.ctx.lineJoin = value;
        logging.debug("ctx.lineJoin = ", value);
    }

    set miterLimit(value) {
        this.currentFrame.miterLimit = value;
        this.ctx.miterLimit = value;
        logging.debug("ctx.miterLimit = ", value);
    }

    setLineDash(value) {
        this.currentFrame.lineDash = value;
        this.ctx.setLineDash(value);
        logging.logfunc("ctx.setLineDash", value);
    }

    set lineDashOffset(value) {
        this.currentFrame.lineDashOffset = value;
        this.ctx.lineDashOffset = value;
        logging.debug("ctx.lineDashOffset = ", value);
    }

    set shadowOffsetX(value) {
        this.currentFrame.shadowOffsetX = value;
        this.ctx.shadowOffsetX = value;
        logging.debug("ctx.shadowOffsetX = ", value);
    }

    set shadowOffsetY(value) {
        this.currentFrame.shadowOffsetY = value;
        this.ctx.shadowOffsetY = value;
        logging.debug("ctx.shadowOffsetY = ", value);
    }

    set shadowBlur(value) {
        this.currentFrame.shadowBlur = value;
        this.ctx.shadowBlur = value;
        logging.debug("ctx.shadowBlur = ", value);
    }

    set shadowColor(value) {
        this.currentFrame.shadowColor = value;
        this.ctx.shadowColor = value;
        logging.debug("ctx.shadowColor = ", value);
    }

    set font(value) {
        this.currentFrame.font = value;
        this.ctx.font = value;
    }

    set textAlign(value) {
        this.currentFrame.textAlign = value;
        this.ctx.textAlign = value;
    }

    set textBaseline(value) {
        this.currentFrame.textBaseline = value;
        this.ctx.textBaseline = value;
    }

    set direction(value) {
        this.currentFrame.direction = value;
        this.ctx.direction = value;
    }

    set imageSmoothingEnabled(value) {
        this.currentFrame.imageSmoothingEnabled = value;
        this.ctx.imageSmoothingEnabled = value;
    }

    set globalCompositeOperation(value) {
        this.currentFrame.globalCompositeOperation = value;
        this.ctx.globalCompositeOperation = value;
    }
}

