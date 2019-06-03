import * as geomutils from "../Geom/utils"
import * as logging from "../Utils/logging"
import { Nullable } from "../Core/types"
import { Transform } from "../Geom/models"

enum PropertyState {
    NONE,
    PRESENT,
    INHERITED
}

class AttribFrame {
    parent : Nullable<AttribFrame> = null;
    transform : Transform = new Transform();
    private _fillStyle : any;
    private _fillStyleState : PropertyState;
    private _fillOpacity : any;
    private _fillOpacityState : PropertyState;
    private _fillRule : any;
    private _fillRuleState : PropertyState;

    private _strokeStyle : any;
    private _strokeStyleState : PropertyState;
    private _strokeOpacity : any;
    private _strokeOpacityState : PropertyState;
    private _lineWidth : any;
    private _lineWidthState : PropertyState;
    private _lineCap : any;
    private _lineCapState : PropertyState;
    private _lineJoin : any;
    private _lineJoinState : PropertyState;
    private _miterLimit : any;
    private _miterLimitState : PropertyState;
    private _lineDash : any;
    private _lineDashState : PropertyState;
    private _lineDashOffset : any;
    private _lineDashOffsetState : PropertyState;

    private _markerStart : any;
    private _markerStartState : PropertyState;
    private _markerMid : any;
    private _markerMidState : PropertyState;
    private _markerEnd : any;
    private _markerEndState : PropertyState;

    private _shadowOffsetX : any;
    private _shadowOffsetXState : PropertyState;
    private _shadowOffsetY : any;
    private _shadowOffsetYState : PropertyState;
    private _shadowBlur : any;
    private _shadowBlurState : PropertyState;
    private _shadowColor : any;
    private _shadowColorState : PropertyState;
    private _textAlign : any;
    private _textAlignState : PropertyState;
    private _textBaseline : any;
    private _textBaselineState : PropertyState;
    private _font : any;
    private _fontState : PropertyState;
    private _direction : any;
    private _directionState : PropertyState;
    private _globalCompositeOperation : any;
    private _globalCompositeOperationState : PropertyState;
    private _imageSmoothingEnabled : any;
    private _imageSmoothingEnabledState : PropertyState;

    constructor(parent : Nullable<AttribFrame> = null) {
        this.parent = parent;

        if (this.parent == null) {
            // at root so give them initial values
            this._assignProperty("_fillStyle", "#000000", PropertyState.PRESENT);
            this._assignProperty("_fillOpacity", 1.0, PropertyState.PRESENT);
            this._assignProperty("_fillRule", "nonzero", PropertyState.PRESENT);

            this._assignProperty("_strokeStyle", null, PropertyState.PRESENT);
            this._assignProperty("_strokeOpacity", 1.0, PropertyState.PRESENT);
            this._assignProperty("_lineWidth", 1.0, PropertyState.PRESENT);
            this._assignProperty("_lineCap", "butt", PropertyState.PRESENT);
            this._assignProperty("_lineJoin", "miter", PropertyState.PRESENT);
            this._assignProperty("_miterLimit", 4, PropertyState.PRESENT);
            this._assignProperty("_lineDash", null, PropertyState.PRESENT);
            this._assignProperty("_lineDashOffset", 0, PropertyState.PRESENT);

            this._assignProperty("_shadowOffsetX", 0, PropertyState.PRESENT);
            this._assignProperty("_shadowOffsetY", 0, PropertyState.PRESENT);
            this._assignProperty("_shadowBlur", 0, PropertyState.PRESENT);
            this._assignProperty("_shadowColor", null, PropertyState.PRESENT);
            this._assignProperty("_textAlign", "start", PropertyState.PRESENT);
            this._assignProperty("_textBaseline", "alphabetic", PropertyState.PRESENT);
            this._assignProperty("_font", null, PropertyState.PRESENT);
            this._assignProperty("_direction", "inherit", PropertyState.PRESENT);
            this._assignProperty("_globalCompositeOperation", "source-over", PropertyState.PRESENT);
            this._assignProperty("_imageSmoothingEnabled", true, PropertyState.PRESENT);
        } else {
            this._assignProperty("_fillStyle", null, PropertyState.NONE);
            this._assignProperty("_fillOpacity", null, PropertyState.NONE);
            this._assignProperty("_fillRule", null, PropertyState.NONE);

            this._assignProperty("_strokeStyle", null, PropertyState.NONE);
            this._assignProperty("_strokeOpacity", null, PropertyState.NONE);
            this._assignProperty("_lineWidth", null, PropertyState.NONE);
            this._assignProperty("_lineCap", null, PropertyState.NONE);
            this._assignProperty("_lineJoin", null, PropertyState.NONE);
            this._assignProperty("_miterLimit", null, PropertyState.NONE);
            this._assignProperty("_lineDash", null, PropertyState.NONE);
            this._assignProperty("_lineDashOffset", null, PropertyState.NONE);

            this._assignProperty("_markerStart", null, PropertyState.NONE);
            this._assignProperty("_markerMid", null, PropertyState.NONE);
            this._assignProperty("_markerEnd", null, PropertyState.NONE);

            this._assignProperty("_shadowOffsetX", null, PropertyState.NONE);
            this._assignProperty("_shadowOffsetY", null, PropertyState.NONE);
            this._assignProperty("_shadowBlur", null, PropertyState.NONE);
            this._assignProperty("_shadowColor", null, PropertyState.NONE);
            this._assignProperty("_textAlign", null, PropertyState.NONE);
            this._assignProperty("_textBaseline", null, PropertyState.NONE);
            this._assignProperty("_font", null, PropertyState.NONE);
            this._assignProperty("_direction", null, PropertyState.NONE);
            this._assignProperty("_globalCompositeOperation", null, PropertyState.NONE);
            this._assignProperty("_imageSmoothingEnabled", null, PropertyState.NONE);
        }
    }

    private _assignProperty(name : string, value : any, state : PropertyState) {
        (this as any)[name] = value;
        (this as any)[name + "State"] = state;
    }

    get fillStyle() : any {
        if (this._fillStyleState === PropertyState.PRESENT) return this._fillStyle;
        else return this.parent == null ? null : this.parent.fillStyle;
    }

    set fillStyle(value) {
        if (value === "none") value = null;
        this._fillStyle = value;
        this._fillStyleState = PropertyState.PRESENT;
    }

    get fillOpacity() : any {
        if (this._fillOpacityState === PropertyState.PRESENT) return this._fillOpacity;
        else return this.parent == null ? null : this.parent.fillOpacity;
    }

    set fillOpacity(value) {
        this._fillOpacity = value;
        this._fillOpacityState = PropertyState.PRESENT;
    }

    get fillRule()  : any {
        if (this._fillRuleState === PropertyState.PRESENT) return this._fillRule;
        else return this.parent == null ? null : this.parent.fillRule;
    }

    set fillRule(value) {
        this._fillRule = value;
        this._fillRuleState = PropertyState.PRESENT;
    }

    get strokeStyle() : any {
        if (this._strokeStyleState === PropertyState.PRESENT) return this._strokeStyle;
        else return this.parent == null ? null : this.parent.strokeStyle;
    }

    set strokeStyle(value) {
        if (value === "none") value = null;
        this._strokeStyle = value;
        this._strokeStyleState = PropertyState.PRESENT;
    }

    get strokeOpacity() : any {
        if (this._strokeOpacityState === PropertyState.PRESENT) return this._strokeOpacity;
        else return this.parent == null ? null : this.parent.strokeOpacity;
    }

    set strokeOpacity(value) {
        this._strokeOpacity = value;
        this._strokeOpacityState = PropertyState.PRESENT;
    }

    get lineWidth() : any {
        if (this._lineWidthState === PropertyState.PRESENT) return this._lineWidth;
        else return this.parent == null ? null : this.parent.lineWidth;
    }

    set lineWidth(value) {
        this._lineWidth = value;
        this._lineWidthState = PropertyState.PRESENT;
    }

    get lineCap() : any {
        if (this._lineCapState === PropertyState.PRESENT) return this._lineCap;
        else return this.parent == null ? null : this.parent.lineCap;
    }

    set lineCap(value) {
        this._lineCap = value;
        this._lineCapState = PropertyState.PRESENT;
    }

    get lineJoin() : any {
        if (this._lineJoinState === PropertyState.PRESENT) return this._lineJoin;
        else return this.parent == null ? null : this.parent.lineJoin;
    }

    set lineJoin(value) {
        this._lineJoin = value;
        this._lineJoinState = PropertyState.PRESENT;
    }

    get miterLimit() : any {
        if (this._miterLimitState === PropertyState.PRESENT) return this._miterLimit;
        else return this.parent == null ? null : this.parent.miterLimit;
    }

    set miterLimit(value) {
        this._miterLimit = value;
        this._miterLimitState = PropertyState.PRESENT;
    }

    get lineDash() : any {
        if (this._lineDashState === PropertyState.PRESENT) return this._lineDash;
        else return this.parent == null ? null : this.parent.lineDash;
    }

    set lineDash(value) {
        this._lineDash = value;
        this._lineDashState = PropertyState.PRESENT;
    }

    get lineDashOffset() : any {
        if (this._lineDashOffsetState === PropertyState.PRESENT) return this._lineDashOffset;
        else return this.parent == null ? null : this.parent.lineDashOffset;
    }

    set lineDashOffset(value) {
        this._lineDashOffset = value;
        this._lineDashOffsetState = PropertyState.PRESENT;
    }

    get shadowOffsetX() : any {
        if (this._shadowOffsetXState === PropertyState.PRESENT) return this._shadowOffsetX;
        else return this.parent == null ? null : this.parent.shadowOffsetX;
    }

    set shadowOffsetX(value) {
        this._shadowOffsetX = value;
        this._shadowOffsetXState = PropertyState.PRESENT;
    }

    get shadowOffsetY() : any {
        if (this._shadowOffsetYState === PropertyState.PRESENT) return this._shadowOffsetY;
        else return this.parent == null ? null : this.parent.shadowOffsetY;
    }

    set shadowOffsetY(value) {
        this._shadowOffsetY = value;
        this._shadowOffsetYState = PropertyState.PRESENT;
    }

    get shadowBlur() : any {
        if (this._shadowBlurState === PropertyState.PRESENT) return this._shadowBlur;
        else return this.parent == null ? null : this.parent.shadowBlur;
    }

    set shadowBlur(value) {
        this._shadowBlur = value;
        this._shadowBlurState = PropertyState.PRESENT;
    }

    get shadowColor() : any {
        if (this._shadowColorState === PropertyState.PRESENT) return this._shadowColor;
        else return this.parent == null ? null : this.parent.shadowColor;
    }

    set shadowColor(value) {
        this._shadowColor = value;
        this._shadowColorState = PropertyState.PRESENT;
    }

    get font() : any {
        if (this._fontState === PropertyState.PRESENT) return this._font;
        else return this.parent == null ? null : this.parent.font;
    }

    set font(value) {
        this._font = value;
        this._fontState = PropertyState.PRESENT;
    }

    get textAlign() : any {
        if (this._textAlignState === PropertyState.PRESENT) return this._textAlign;
        else return this.parent == null ? null : this.parent.textAlign;
    }

    set textAlign(value) {
        this._textAlign = value;
        this._textAlignState = PropertyState.PRESENT;
    }

    get textBaseline() : any {
        if (this._textBaselineState === PropertyState.PRESENT) return this._textBaseline;
        else return this.parent == null ? null : this.parent.textBaseline;
    }

    set textBaseline(value) {
        this._textBaseline = value;
        this._textBaselineState = PropertyState.PRESENT;
    }

    get direction() : any {
        if (this._directionState === PropertyState.PRESENT) return this._direction;
        else return this.parent == null ? null : this.parent.direction;
    }

    set direction(value) {
        this._direction = value;
        this._directionState = PropertyState.PRESENT;
    }

    get imageSmoothingEnabled() : any {
        if (this._imageSmoothingEnabledState === PropertyState.PRESENT) return this._imageSmoothingEnabled;
        else return this.parent == null ? null : this.parent.imageSmoothingEnabled;
    }

    set imageSmoothingEnabled(value) {
        this._imageSmoothingEnabled = value;
        this._imageSmoothingEnabledState = PropertyState.PRESENT;
    }

    get globalCompositeOperation() : any {
        if (this._globalCompositeOperationState === PropertyState.PRESENT) return this._globalCompositeOperation;
        else return this.parent == null ? null : this.parent.globalCompositeOperation;
    }

    set globalCompositeOperation(value) {
        this._globalCompositeOperation = value;
        this._globalCompositeOperationState = PropertyState.PRESENT;
    }
}

export class VirtualContext {
    currentFrame : AttribFrame = new AttribFrame();
    ctx : any
    constructor(ctx : any) {
        this.ctx = ctx;
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

    fill(path : any) {
        if (this.currentFrame.fillStyle != null) {
            var fillRule = this.currentFrame.fillRule || "nonzero";
            if (path) {
                this.ctx.fill(path, fillRule);
            } else {
                this.ctx.fill(fillRule);
                logging.logfunc("ctx.fill", fillRule);
            }
        }
    }

    stroke(path : any) {
        if (this.currentFrame.strokeStyle != null) {
            if (path) {
                this.ctx.stroke(path);
            } else {
                this.ctx.stroke();
                logging.logfunc("ctx.stroke");
            }
        }
    }

    transform(a : number = 1, b : number = 0, c : number = 0, d : number = 1,
              e : number = 0, f : number = 0) {
        // this.currentFrame.transform.multiply(new geom.Transform(a, b, c, d, e, f));
        this.ctx.transform(a, b, c, d, e, f);
        logging.logfunc("ctx.transform", a, b, c, d, e, f);
    }

    setTransform(a : number = 1, b : number = 0, c : number = 0, d : number = 1,
                 e : number = 0, f : number = 0) {
        this.currentFrame.transform.set(a, b, c, d, e, f);
        this.ctx.setTransform(a, b, c, d, e, f);
        logging.logfunc("ctx.setTransform", a, b, c, d, e, f);
    }

    scale(sx : number, sy : number) {
        this.currentFrame.transform.scale(sx, sy);
        this.ctx.scale(sx, sy);
        logging.logfunc("ctx.scale", sx, sy);
    }

    translate(tx : number, ty : number) {
        this.currentFrame.transform.translate(tx, ty);
        this.ctx.translate(tx, ty);
        logging.logfunc("ctx.translate", tx, ty);
    }

    fillRect(x : number, y : number, w : number, h : number) {
        if (this.currentFrame.fillStyle != null) {
            this.ctx.fillRect(x, y, w, h);
            logging.logfunc("ctx.fillRect", x, y, w, h);
        }
    }
    strokeRect(x : number, y : number, w : number, h : number) {
        if (this.currentFrame.strokeStyle != null) {
            this.ctx.strokeRect(x, y, w, h);
            logging.logfunc("ctx.strokeRect", x, y, w, h);
        }
    }

    drawImage(img: any, sx: number, sy: number, sw: number, sh: number, x: number, y: number, w: number, h: number) {
        if (x === undefined) {
            this.ctx.drawImage(img, sx, sy, sw, sh);
            logging.logfunc("ctx.drawImage", sx, sy, sw, sh);
        } else {
            this.ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
            logging.logfunc("ctx.drawImage", sx, sy, sw, sh, x, y, w, h);
        }
    }

    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
        logging.logfunc("ctx.createRadialGradient", x0, y0, r0, x1, y1, r1);
        return this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
    }

    createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
        logging.logfunc("ctx.createLinearGradient", x0, y0, x1, y1);
        return this.ctx.createLinearGradient(x0, y0, x1, y1);
    }

    // Pass throughs
    clearRect(x: number, y: number, w: number, h: number) { 
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
    moveTo(x: number, y: number) { 
        logging.logfunc("ctx.moveTo", x, y);
        this.ctx.moveTo(x, y); 
    }
    lineTo(x: number, y: number) { 
        logging.logfunc("ctx.lineTo", x, y);
        this.ctx.lineTo(x, y); 
    }
    ellipse(x: number, y: number, rx: number, ry: number, theta: number, startAngle: number, endAngle: number, anticlockwise: boolean) {
        logging.logfunc("ctx.ellipse", x, y, rx, ry, theta,
                         startAngle, endAngle, anticlockwise);
        this.ctx.ellipse(x, y, rx, ry, theta, startAngle, endAngle, anticlockwise);
    }
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
        logging.logfunc("ctx.arc", x, y, radius, startAngle, endAngle);
        this.ctx.arc(x, y, radius, startAngle, endAngle);
    }
    bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
        logging.logfunc("ctx.bezierCurveTo", x1, y1, x2, y2, x3, y3);
        this.ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
    }
    quadraticCurveTo(x1: number, y1: number, x2: number, y2: number) {
        logging.logfunc("ctx.quadraticCurveTo", x1, y1, x2, y2);
        this.ctx.quadraticCurveTo(x1, y1, x2, y2);
    }

    set fillStyle(style : any) {
        this.currentFrame.fillStyle = style;
        this.ctx.fillStyle = style;
        logging.debug("ctx.fillStyle = ", style === "none" ? "null" : style);
    }

    set strokeStyle(style : any) {
        this.currentFrame.strokeStyle = style;
        this.ctx.strokeStyle = style;
        logging.debug("ctx.strokeStyle = ", style === "none" ? "null" : style);
    }

    set fillOpacity(value : number) {
        this.currentFrame.fillOpacity = value;
        this.ctx.fillOpacity = value;
        logging.debug("ctx.fillOpacity = ", value);
    }

    set fillRule(value : Nullable<string>) {
        this.currentFrame.fillRule = value;
    }

    set strokeOpacity(value : number) {
        this.currentFrame.strokeOpacity = value;
        // TODO: set the opacity in the original color or during stroking
    }

    set lineWidth(value : number) {
        this.currentFrame.lineWidth = value;
        this.ctx.lineWidth = value;
        logging.debug("ctx.lineWidth = ", value);
    }

    set lineCap(value : string) {
        this.currentFrame.lineCap = value;
        this.ctx.lineCap = value;
        logging.debug("ctx.lineCap = ", value);
    }

    set lineJoin(value : string) {
        this.currentFrame.lineJoin = value;
        this.ctx.lineJoin = value;
        logging.debug("ctx.lineJoin = ", value);
    }

    set miterLimit(value : number) {
        this.currentFrame.miterLimit = value;
        this.ctx.miterLimit = value;
        logging.debug("ctx.miterLimit = ", value);
    }

    setLineDash(value : Nullable<Array<number>>) {
        this.currentFrame.lineDash = value;
        this.ctx.setLineDash(value);
        logging.logfunc("ctx.setLineDash", value);
    }

    set lineDashOffset(value : number) {
        this.currentFrame.lineDashOffset = value;
        this.ctx.lineDashOffset = value;
        logging.debug("ctx.lineDashOffset = ", value);
    }

    set shadowOffsetX(value : number) {
        this.currentFrame.shadowOffsetX = value;
        this.ctx.shadowOffsetX = value;
        logging.debug("ctx.shadowOffsetX = ", value);
    }

    set shadowOffsetY(value : number) {
        this.currentFrame.shadowOffsetY = value;
        this.ctx.shadowOffsetY = value;
        logging.debug("ctx.shadowOffsetY = ", value);
    }

    set shadowBlur(value : number) {
        this.currentFrame.shadowBlur = value;
        this.ctx.shadowBlur = value;
        logging.debug("ctx.shadowBlur = ", value);
    }

    set shadowColor(value : any) {
        this.currentFrame.shadowColor = value;
        this.ctx.shadowColor = value;
        logging.debug("ctx.shadowColor = ", value);
    }

    set font(value : string) {
        this.currentFrame.font = value;
        this.ctx.font = value;
    }

    set textAlign(value : string) {
        this.currentFrame.textAlign = value;
        this.ctx.textAlign = value;
    }

    set textBaseline(value : string) {
        this.currentFrame.textBaseline = value;
        this.ctx.textBaseline = value;
    }

    set direction(value : string) {
        this.currentFrame.direction = value;
        this.ctx.direction = value;
    }

    set imageSmoothingEnabled(value : boolean) {
        this.currentFrame.imageSmoothingEnabled = value;
        this.ctx.imageSmoothingEnabled = value;
    }

    set globalCompositeOperation(value : number) {
        this.currentFrame.globalCompositeOperation = value;
        this.ctx.globalCompositeOperation = value;
    }
}

