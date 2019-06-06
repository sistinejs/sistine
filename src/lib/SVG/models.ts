
import { Point, Bounds } from "../Geom/models"
import { Shape, Group } from "../Core/models"
import { ShapeController } from "../Core/controller"

enum Alignment {
    Mid = "mid",
    Min = "min",
    Max = "max",
    Any = "*"
}

export class SVG extends Group {
    private _preserveAspectRatio = false;
    private _xAlign : Alignment
    private _yAlign : Alignment
    private _meetOrSlice : string;
    constructor(configs? : any) {
        super((configs = configs || {}));
        this._viewBox = configs.bounds || null;
        this._preserveAspectRatio = configs.preserveAspectRatio || false;
        this._xAlign = (configs.xalign.toLowerCase() as Alignment || Alignment.Mid)
        this._yAlign = (configs.yalign.toLowerCase() as Alignment || Alignment.Mid)
        this._meetOrSlice = configs.meetOrSlice || "meet";
    }

    applyTransforms(ctx : any) {
        // Apply scale and the cropping
        var boundingBox = this.boundingBox;
        ctx.translate(boundingBox.x, boundingBox.y);
        if (this._viewBox && !this._viewBox.isZeroSized) {
            ctx.save(); 
            // todo - consider aspect ratios
            var scaleX = boundingBox.width / this._viewBox.width;
            var scaleY = boundingBox.height / this._viewBox.height;
            ctx.scale(scaleX, scaleY);
            ctx.translate(-this._viewBox.x, -this._viewBox.y);

            // clip too?
        }
        ctx.translate(-boundingBox.x, -boundingBox.y);
    }

    revertTransforms(ctx : any) {
        if (this._viewBox && !this._viewBox.isZeroSized) {
            ctx.restore(); 
        }
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class SVGController extends ShapeController<SVG> {
}
