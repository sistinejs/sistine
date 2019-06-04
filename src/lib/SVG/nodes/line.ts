
import * as base from "./base"
import { Line } from "../../Builtins/Line"
import * as layouts from "../layouts"
import { Nullable } from "../../Core/types"
import { Element } from "../../Core/base"

const CM = layouts.defaultCM;

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
        var out = new Line();
        super.processElement(elem, out);
        CM.addXConstraint(out, "x1", this.getLength(elem, "x1"));
        CM.addYConstraint(out, "y1", this.getLength(elem, "y1"));
        CM.addXConstraint(out, "x2", this.getLength(elem, "x2"));
        CM.addYConstraint(out, "y2", this.getLength(elem, "y2"));
        if (parent != null) parent.add(out);
        return out;
    }
}
