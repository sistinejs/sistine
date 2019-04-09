
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

export class LineNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.animationElements.concat(base.descriptiveElements);
    }

    get validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat(["class", "style", "externalResourcesRequired",
                          "transform",
                         "x1", "y1", "x2", "y2" ])
    }

    processElement(elem, parent) {
        var configs = {};
        var x1 = elem.getAttribute("x1") || 0;
        var y1 = elem.getAttribute("y1") || 0;
        var x2 = elem.getAttribute("x2") || 0;
        var y2 = elem.getAttribute("y2") || 0;
        configs.p1 = new Point(x1, y1);
        configs.p2 = new Point(x2, y2);
        var out = new Builtins.Line(configs);
        this.processStyleAttributes(elem, out);
        parent.add(out);
        return out;
    }
}
