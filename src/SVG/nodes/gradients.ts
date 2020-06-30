
import * as base from "./base"
import { Length } from "../../Geom/models"
import { Element } from "../../Core/base"
import { Int, Nullable } from "../../Core/types"
import { Gradient, LinearGradient, RadialGradient } from "../../Core/styles"
import { forEachChild } from "../../Utils/dom";

abstract class GradientNodeProcessor extends base.NodeProcessor {
    validChildren() {
        return base.descriptiveElements
                .concat(["animate", "animateTransform", "set", "stop"]);
    }

    abstract newGradient(elem : HTMLElement) : Gradient;

    validAttributes() {
        return base.coreAttributes
                .concat(base.presentationAttributes)
                .concat(base.xlinkAttributes)
                .concat([ "class", "style", "externalResourcesRequired",
                          "gradientUnits", "gradientTransform",
                          "spreadMethod", "xlink:href"])
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Gradient {
        var out = this.newGradient(elem);
        var id = this.ensureAttribute(elem, "id");
        var gradientUnits = elem.getAttribute("gradientUnits") || "objectBoundingBox";
        out.relativeToBounds = (gradientUnits == "objectBoundingBox");
        this.processTransformAttributes(elem, out, "gradientTransform");
        if (parent != null) parent.addDef(id, out);

        var self = this;
        forEachChild(elem, function(child : HTMLElement, _index : Int) {
            if (child.tagName == "set") {
                throw new Error("Cannot process elem: " + child.tagName);
            } else if (child.tagName == "stop") {
                self.processStopNode(child, out);
            } else if (child.tagName == "animate") {
                throw new Error("Cannot process elem: " + child.tagName);
            } else if (child.tagName == "animateTransform") {
                throw new Error("Cannot process elem: " + child.tagName);
            } else {
                throw new Error("Cannot process elem: " + child.tagName);
            }
            return true;
        });
        return out;
    }

    processStopNode(elem : HTMLElement, gradient : Gradient) {
        var offset = this.getDecimal(elem, "offset", 0);
        var stopColor = elem.getAttribute("stop-color") || "black";
        var stopOpacity = elem.getAttribute("stop-opacity");
        if (stopOpacity) {
            throw new Error("Not sure how to use stop opacity.");
        }
        gradient.addStop(offset, stopColor);

        forEachChild(elem, function(child : HTMLElement, _index : Int) {
            if (child.tagName == "set") {
                throw new Error("Cannot process elem: " + child.tagName);
            } else if (child.tagName == "animate") {
                throw new Error("Cannot process elem: " + child.tagName);
            } else if (child.tagName == "animateColor") {
                throw new Error("Cannot process elem: " + child.tagName);
            }
            return true;
        });
    }

    getDecimal(elem : HTMLElement, attrib : string, defaultValue : any) {
        var val = Length.parse(elem.getAttribute(attrib) || defaultValue);
        if (val.isAbsolute) {
            return val.value;
        } else {
            return val.value / 100.0;
        }
    }
}

export class LinearGradientNodeProcessor extends GradientNodeProcessor {
    validAttributes() {
        return super.validAttributes().concat([ "x1", "y1", "x2", "y2" ]);
    }

    newGradient(elem : HTMLElement) : Gradient {
        var x1 = Length.parse(elem.getAttribute("x1") || "0%");
        var y1 = Length.parse(elem.getAttribute("y1") || "0%");
        var x2 = Length.parse(elem.getAttribute("x2") || "0%");
        var y2 = Length.parse(elem.getAttribute("y2") || "0%");
        return new LinearGradient(x1, y1, x2, y2);
    }
}

export class RadialGradientNodeProcessor extends GradientNodeProcessor {
    validAttributes() {
        return super.validAttributes().concat([ "cx", "cy", "r", "fx", "fy" ]);
    }

    newGradient(elem : HTMLElement) : Gradient {
        var cx = Length.parse(elem.getAttribute("cx") || "50%");
        var cy = Length.parse(elem.getAttribute("cy") || "50%");
        var r = Length.parse(elem.getAttribute("r") || "50%");
        var fx = Length.parse(elem.getAttribute("fx") || cx);
        var fy = Length.parse(elem.getAttribute("fy") || cy);
        return new RadialGradient(fx, fy, 0, cx, cy, r);
    }
}
