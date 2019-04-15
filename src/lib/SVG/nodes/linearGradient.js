
import * as base from "./base"
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import { Bundles } from "../../Bundles/index"
import * as parser from "../parser"
import * as models from "../models"
import * as layouts from "../layouts"

const CM = layouts.defaultCM;
const Bounds = Geom.Models.Bounds;
const NumbersTokenizer = parser.NumbersTokenizer;
const PathDataParser = parser.PathDataParser;
const TransformParser = parser.TransformParser;
const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

export class LinearGradientNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.descriptiveElements
                .concat(["animate", "animateTransform", "set", "stop"]);
    }

    get validAttributes() {
        return base.coreAttributes
                .concat(base.presentationAttributes)
                .concat(base.xlinkAttributes)
                .concat([ "class", "style", "externalResourcesRequired",
                          "x1", "y1", "x2", "y2", "gradientUnits",
                          "gradientTransform", "spreadMethod", "xlink:href"])
    }

    processElement(elem, parent) {
        var out = new Builtins.Ellipse();
        super.processElement(elem, out);
        CM.addXConstraint(out, "cx", this.getLength(elem, "cx"));
        CM.addYConstraint(out, "cy", this.getLength(elem, "cy"));
        CM.addXYConstraint(out, "rx", this.getLength(elem, "rx"));
        CM.addXYConstraint(out, "ry", this.getLength(elem, "ry"));
        parent.add(out);
        return out;
    }
}
