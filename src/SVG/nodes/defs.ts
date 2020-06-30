
import * as base from "./base"
import { Utils } from "../../Utils/index"
import { Int, Nullable } from "../../Core/types"
import { Element } from "../../Core/base"


export class DefsNodeProcessor extends base.NodeProcessor {
    validChildren() {
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

    validAttributes() {
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
        Utils.DOM.forEachChild(elem, function(child : HTMLElement, _index : Int) {
            var item = loader.processElement(child, parent);
            var id = child.getAttribute("id");
            if (id != null && parent != null) {
                parent.addDef(id, item);
                if (item && item.removeFromParent) item.removeFromParent();
            }
            return true;
        });
        return parent;
    }
}

