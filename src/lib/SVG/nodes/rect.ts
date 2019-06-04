
import * as base from "./base"
import { Rectangle } from "../../Builtins/Rectangle"
import * as layouts from "../layouts"
import { Nullable } from "../../Core/types"
import { Element } from "../../Core/base"

const CM = layouts.defaultCM;

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

    get hasStyles() { return true; }
    get hasTransforms() { return true; }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        var out = new Rectangle();
        if (parent != null) parent.add(out);
        super.processElement(elem, out);
        CM.addXConstraint(out, "x", this.getLength(elem, "x"));
        CM.addYConstraint(out, "y", this.getLength(elem, "y"));
        CM.addXConstraint(out, "width", this.getLength(elem, "width"));
        CM.addYConstraint(out, "height", this.getLength(elem, "height"));
        CM.addXYConstraint(out, "rx", this.getLength(elem, "rx"));
        CM.addXYConstraint(out, "ry", this.getLength(elem, "ry"));
        return out;
    }
}
