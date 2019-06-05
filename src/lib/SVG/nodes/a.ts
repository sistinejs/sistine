import { Element } from "../../Core/base"

import * as base from "./base"

import { Int, Nullable } from "../Core/types"

export class ANodeProcessor extends base.NodeProcessor {
    validChildren() {
        return base.animationElements
                .concat(base.descriptiveElements)
                .concat(base.shapeElements)
                .concat(base.gradientElements)
                .concat(["a", "altGlyphDef", "clipPath", "color-profile", "cursor",
                         "filter", "font", "font-face", "foreignObject", "image",
                         "marker", "mask", "pattern", "script", "style", "switch",
                         "text", "view"]);
    }

    validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat(base.xlinkAttributes)
                .concat(["class", "style", "externalResourcesRequired", "target",
                         "transform", "xlink:href", "xlink:show", "xlink:actuate"])
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        this.processChildrenOf(elem, parent);
        return null;
    }
}

