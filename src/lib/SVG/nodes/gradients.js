
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

class GradientNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.descriptiveElements
                .concat(["animate", "animateTransform", "set", "stop"]);
    }

    get validAttributes() {
        return base.coreAttributes
                .concat(base.presentationAttributes)
                .concat(base.xlinkAttributes)
                .concat([ "class", "style", "externalResourcesRequired",
                          "gradientUnits", "gradientTransform",
                          "spreadMethod", "xlink:href"])
    }

    processElement(elem, parent) {
        var out = this.newGradient(elem);
        var id = this.ensureAttribute(elem, "id");
        var gradientUnits = elem.getAttribute("gradientUnits") || "objectBoundingBox";
        out.relativeToBounds = (gradientUnits == "objectBoundingBox");
        this.processTransformAttributes(elem, out, "gradientTransform");
        parent.addDef(id, out);

        var self = this;
        forEachChild(elem, function(child, index) {
            if (child.tagName == "set") {
                throw new Error("Cannot process elem: ", child.tagName);
            } else if (child.tagName == "stop") {
                self.processStopNode(child, out);
            } else if (child.tagName == "animate") {
                throw new Error("Cannot process elem: ", child.tagName);
            } else if (child.tagName == "animateTransform") {
                throw new Error("Cannot process elem: ", child.tagName);
            } else {
                throw new Error("Cannot process elem: ", child.tagName);
            }
        });
        return out;
    }

    processStopNode(elem, gradient) {
        var offset = this.getDecimal(elem, "offset", 0);
        var stopColor = elem.getAttribute("stop-color") || "black";
        var stopOpacity = elem.getAttribute("stop-opacity");
        if (stopOpacity) {
            throw new Error("Not sure how to use stop opacity.");
        }
        gradient.addStop(offset, stopColor);

        forEachChild(elem, function(child, index) {
            if (child.tagName == "set") {
                throw new Error("Cannot process elem: ", child.tagName);
            } else if (child.tagName == "animate") {
                throw new Error("Cannot process elem: ", child.tagName);
            } else if (child.tagName == "animateColor") {
                throw new Error("Cannot process elem: ", child.tagName);
            }
        });
    }

    getDecimal(elem, attrib, defaultValue) {
        var val = Length.parse(elem.getAttribute(attrib) || defaultValue);
        if (val.isAbsolute) {
            return val.value;
        } else {
            return val.value / 100.0;
        }
    }
}

export class LinearGradientNodeProcessor extends GradientNodeProcessor {
    get validAttributes() {
        return super.validAttributes.concat([ "x1", "y1", "x2", "y2" ]);
    }

    newGradient(elem) {
        var x1 = Length.parse(elem.getAttribute("x1") || "0%");
        var y1 = Length.parse(elem.getAttribute("y1") || "0%");
        var x2 = Length.parse(elem.getAttribute("x2") || "0%");
        var y2 = Length.parse(elem.getAttribute("y2") || "0%");
        return new Core.Styles.LinearGradient(x1, y1, x2, y2);
    }
}

export class RadialGradientNodeProcessor extends GradientNodeProcessor {
    get validAttributes() {
        return super.validAttributes.concat([ "cx", "cy", "r", "fx", "fy" ]);
    }

    newGradient(elem) {
        var cx = Length.parse(elem.getAttribute("cx") || "50%");
        var cy = Length.parse(elem.getAttribute("cy") || "50%");
        var r = Length.parse(elem.getAttribute("r") || "50%");
        var fx = Length.parse(elem.getAttribute("fx") || cx);
        var fy = Length.parse(elem.getAttribute("fy") || cy);
        return new Core.Styles.RadialGradient(fx, fy, 0, cx, cy, r);
    }
}
