
import * as base from "./base"

export class SymbolNodeProcessor extends base.NodeProcessor {
    get validChildren() {
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

    get validAttributes() {
        return base.coreAttributes
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat(["class", "style", "externalResourcesRequired",
                         "preserveAspectRatio", "viewBox" ]);
    }

    processElement(elem, parent) {
        null.a = 3;
    }
}

