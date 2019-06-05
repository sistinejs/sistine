
import * as base from "./base"

import { Int, Nullable } from "../../Core/types"

export class SymbolNodeProcessor extends base.NodeProcessor {
    validChildren() {
        return base.animationElements
                .concat(base.descriptiveElements)
                .concat(base.shapeElements)
                .concat(base.gradientElements)
                .concat(base.structuralElements)
                .concat(["a", "altGlyphDef", "clipPath", "color-profile", "cursor",
                         "filter", "font", "font-face", "foreignObject", "image",
                         "marker", "mask", "pattern", "script", "style", "switch",
                         "text", "view" ]);
    }

    validAttributes() {
        return base.coreAttributes
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat(["class", "style", "externalResourcesRequired",
                         "preserveAspectRatio", "viewBox" ]);
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        null.a = 3;
        return null;
    }
}

