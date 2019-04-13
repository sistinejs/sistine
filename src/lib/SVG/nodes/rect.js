
import * as base from "./base"
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import { Bundles } from "../../Bundles/index"
import * as parser from "../parser"
import * as models from "../models"

const Builtins = Bundles.Builtins;
const Bounds = Geom.Models.Bounds;
const NumbersTokenizer = parser.NumbersTokenizer;
const PathDataParser = parser.PathDataParser;
const TransformParser = parser.TransformParser;
const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

export class RectNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.animationElements.concat(base.descriptiveElements);
    }

    get validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat([ "class", "style", "externalResourcesRequired",
                          "transform", "x", "y", "rx", "ry",
                          "width", "height"]);
    }

    processElement(elem, parent) {
        var out = new Builtins.Rectangle(configs);
        this.extractXLengthAttribute(elem, "x", parent, out, "x");
        this.extractYLengthAttribute(elem, "y", parent, out, "y");
        this.extractXLengthAttribute(elem, "cx", parent, out, "cx");
        this.extractYLengthAttribute(elem, "cy", parent, out, "cy");
        this.extractXLengthAttribute(elem, "width", parent, out, "width");
        this.extractYLengthAttribute(elem, "height", parent, out, "height");
        this.extractDiagLengthAttribute(elem, "rx", parent, out, "rx");
        this.extractDiagLengthAttribute(elem, "ry", parent, out, "ry");
        parent.add(out);
        return out;
    }
}
