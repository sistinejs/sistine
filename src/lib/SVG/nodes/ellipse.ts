
import * as base from "./base"
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import { Builtins } from "../../Builtins/index"
import * as models from "../models"
import * as layouts from "../layouts"
import { Element } from "../../Core/base"
import { Int, Nullable } from "../Core/types"

const CM = layouts.defaultCM;
const Bounds = Geom.Models.Bounds;
const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

export class EllipseNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.animationElements.concat(base.descriptiveElements);
    }

    get validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat([ "class", "style", "externalResourcesRequired",
                          "transform", "cx", "cy", "r"]);
    }

    get hasStyles() { return true; }
    get hasTransforms() { return true; }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        var out = new Builtins.Ellipse();
        if (parent != null) parent.add(out);
        super.processElement(elem, out);
        CM.addXConstraint(out, "cx", this.getLength(elem, "cx"));
        CM.addYConstraint(out, "cy", this.getLength(elem, "cy"));
        CM.addXYConstraint(out, "rx", this.getLength(elem, "rx"));
        CM.addXYConstraint(out, "ry", this.getLength(elem, "ry"));
        return out;
    }
}
