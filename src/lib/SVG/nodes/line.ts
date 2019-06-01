
import * as base from "./base"
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import { Builtins } from "../../Builtins/index"
import * as layouts from "../layouts"
import * as models from "../models"

const CM = layouts.defaultCM;
const Bounds = Geom.Models.Bounds;
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

    get hasStyles() { return true; }
    get hasTransforms() { return true; }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        var out = new Builtins.Line();
        super.processElement(elem, out);
        CM.addXConstraint(out, "x1", this.getLength(elem, "x1"));
        CM.addYConstraint(out, "y1", this.getLength(elem, "y1"));
        CM.addXConstraint(out, "x2", this.getLength(elem, "x2"));
        CM.addYConstraint(out, "y2", this.getLength(elem, "y2"));
        parent.add(out);
        return out;
    }
}
