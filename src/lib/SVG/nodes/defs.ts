
import * as base from "./base"
import { Utils } from "../../Utils/index"

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

    processElement(elem, parent) {
        var loader = this.loader;
        Utils.DOM.forEachChild(elem, function(child, index) {
            var item = loader.processElement(child, parent);
            var id = child.getAttribute("id");
            parent.addDef(id, item);
            if (item && item.removeFromParent) item.removeFromParent();
        });
    }
}

