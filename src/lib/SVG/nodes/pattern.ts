
import * as base from "./base"
import { Element } from "../../Core/base"
import { Nullable } from "../../Core/types"

export class PatternNodeProcessor extends base.NodeProcessor {
    validChildren() {
        return base.descriptiveElements
                .concat(base.animationElements)
                // .concat(base.paintServerElements)
                .concat(base.shapeElements)
                .concat(base.structuralElements)
                .concat(["a", "audio", "canvas", "clipPath", "filter",
                         "foreignObject", "iframe", "image", "marker",
                         "mask", "script", "style", "switch", "text", "video", "view"])
    }

    validAttributes() {
        return base.coreAttributes
                .concat(base.presentationAttributes)
                .concat(base.xlinkAttributes)
                .concat([ "viewBox", "preserveAspectRatio", "x", "y", "width", "height",
                          "patternUnits", "patternContentUnits", "patternTransform", "href"])
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        // TODO
        return null;
    }
}

