
import * as base from "./base"
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import * as models from "../models"
import { Int, Nullable } from "../../Core/types"

const NumbersTokenizer = Utils.SVG.NumbersTokenizer;
const PathDataParser = Utils.SVG.PathDataParser;
const TransformParser = Utils.SVG.TransformParser;
const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

export class GNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.animationElements
                .concat(base.descriptiveElements)
                .concat(base.shapeElements)
                .concat(base.structuralElements)
                .concat(base.gradientElements)
                .concat(["a", "altGlyphDef", "clipPath", "color-profile",
                         "cursor", "filter", "font", "font-face", "foreignObject",
                         "image", "marker", "mask", "pattern", "script", "style",
                         "switch", "text", "view" ]);
    }

    get validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat([ "class", "style", "externalResourcesRequired", "transform" ]);
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        var out = new Core.Models.Group();
        var bounds = parent ? new Bounds() : this.configs.bounds.copy();
        var viewBox = null;
        this.processStyleAttributes(elem, out);
        this.processBoundsAttributes(elem, bounds);
        this.processTransformAttributes(elem, out);
        this.processMetaAttributes(elem, out);
        var self = this;
        forEachAttribute(elem, function(attrib, value) {
            if ([ "xmlns" ].indexOf(attrib) >= 0 ||
                attrib.startsWith("sodipodi:") ||
                attrib.startsWith("inkscape:")) {
                    // ignore list
                console.log("Ignoring attribute: ", attrib, " = ", value);
            } else if (self.validAttributes.indexOf(attrib) >= 0) {
                // Valid attribute, do nothing
            } else {
                throw new Error("Cannot process attribute: " + attrib);
            }
        });
        out.setBounds(bounds);
        out.viewBox = viewBox;
        parent.add(out);
        this.processChildrenOf(elem, out);
        return out;
    }
}

