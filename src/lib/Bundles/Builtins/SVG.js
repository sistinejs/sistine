
import * as geom from "../../Geom/models"
import * as geomutils from "../../Geom/utils"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

export const AlignMin = "min"
export const AlignMid = "mid"
export const AlignMax = "max"
export const AlignAny = "*"

export class SVG extends models.Group {
    constructor(configs) {
        super((configs = configs || {}));
        this._bounds = configs.bounds || new geom.Bounds();
        this._viewBox = configs.bounds || null;
        this._preserveAspectRatio = configs.preserveAspectRatio || false;
        this._xAlign = (configs.xalign || AlignMid).toLowerCase();
        this._yAlign = (configs.xalign || AlignMid).toLowerCase();
        this._meetOrSlice = configs.meetOrSlice || "meet";
        this._controller = new SVG.Controller(this);
    }

    _evalBoundingBox() {
        return this._bounds.copy();
    }

    get className() { return "SVG"; }

    applyTransforms(ctx) {
        // Apply scale and the cropping
        if (this._viewBox && !this._viewBox.isZeroSized) {
            ctx.save(); 
            // todo - consider aspect ratios
            var scaleX = this._bounds.width / this._viewBox.width;
            var scaleY = this._bounds.height / this._viewBox.height;
            ctx.scale(scaleX, scaleY);
            ctx.translate(this._viewBox.x, this._viewBox.y);

            // clip too?
        }
    }

    revertTransforms(ctx) {
        if (this._viewBox && !this._bounds.isZeroSized) {
            ctx.restore(); 
        }
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
SVG.Controller = class SVGController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
