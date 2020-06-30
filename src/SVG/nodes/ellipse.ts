
import * as base from "./base"
import { Builtins } from "../../Builtins/index"
import * as layouts from "../layouts"
import { Nullable } from "../../Core/types"
import { Element } from "../../Core/base"

const CM = layouts.defaultCM;

export class EllipseNodeProcessor extends base.NodeProcessor {
    validChildren() {
        return base.animationElements.concat(base.descriptiveElements);
    }

    validAttributes() {
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
