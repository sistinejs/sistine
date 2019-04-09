
import * as base from "./base"
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import * as parser from "../parser"
import * as models from "../models"

const NumbersTokenizer = parser.NumbersTokenizer;
const PathDataParser = parser.PathDataParser;
const TransformParser = parser.TransformParser;
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

    processElement(elem, parent) {
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
                self.validAttributes.indexOf(attrib) >= 0) {
                    // ignore list
                console.log("Ingoring attribute: ", attrib, " = ", value);
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

