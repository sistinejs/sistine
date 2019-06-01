
import * as base from "./base"
import { Core } from "../../Core/index"
import { Utils } from "../../Utils/index"
import { Builtins } from "../../Builtins/index"
import { Int, Nullable, Element } from "../../Core/base"
import { NumbersTokenizer, PathDataParser, TransformParser } from "../../Utils/svg"
import { Point, Length, Bounds } from "../../Geom/models"

const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

export class DefsNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.animationElements
                .concat(base.descriptiveElements)
                .concat(base.shapeElements)
                .concat(base.structuralElements)
                .concat(base.gradientElements)
                .concat(["a", "altGlyphDef", "clipPath", "color-profile",
                         "cursor", "filter", "font", "font-face",
                         "foreignObject", "image", "marker", "mask", "pattern",
                         "script", "style", "switch", "text", "view" ]);
    }

    get validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat([ "class", "style", "externalResourcesRequired",
                          "transform", "lengthAdjust", "x", "y", "dx", "dy",
                          "rotate", "textLength"]);
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        var loader = this.loader;
        Utils.DOM.forEachChild(elem, function(child : HTMLElement, index : Int) {
            var item = loader.processElement(child, parent);
            var id = child.getAttribute("id");
            if (parent != null) parent.addDef(id, item);
            if (item && item.removeFromParent) item.removeFromParent();
        });
        return parent;
    }
}

