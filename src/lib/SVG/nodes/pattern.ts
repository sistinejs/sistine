
import * as base from "./base"
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import { Bundles } from "../../Bundles/index"
import * as models from "../models"
import * as layouts from "../layouts"

const CM = layouts.defaultCM;
const Bounds = Geom.Models.Bounds;
const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

export class PatternNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.descriptiveElements
                .concat(base.animationElements)
                // .concat(base.paintServerElements)
                .concat(base.shapeElements)
                .concat(base.structuralElements)
                .concat(["a", "audio", "canvas", "clipPath", "filter",
                         "foreignObject", "iframe", "image", "marker",
                         "mask", "script", "style", "switch", "text", "video", "view"])
    }

    get validAttributes() {
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

