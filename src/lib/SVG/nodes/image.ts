
import * as base from "./base"
import { Builtins } from "../../Builtins/index"
import * as layouts from "../layouts"
import { Nullable } from "../../Core/types"
import { Element } from "../../Core/base"

const CM = layouts.defaultCM;

export class ImageNodeProcessor extends base.NodeProcessor {
    validChildren() {
        return base.animationElements.concat(base.descriptiveElements);
    }

    validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat([ "class", "style", "externalResourcesRequired",
                          "transform", "x", "y", "width", "height"]);
    }

    get hasStyles() { return true; }
    get hasTransforms() { return true; }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        var href = elem.getAttribute("xlink:href") || elem.getAttribute("href") || null;
        if (href == null) {
            throw new Error("Use needs a xlink:href attribute.");
        }
        var out = new Builtins.Image({ url: href });
        if (parent != null) parent.add(out);
        super.processElement(elem, out);
        CM.addXConstraint(out, "x", this.getLength(elem, "x"));
        CM.addYConstraint(out, "y", this.getLength(elem, "y"));
        CM.addXConstraint(out, "width", this.getLength(elem, "width"));
        CM.addYConstraint(out, "height", this.getLength(elem, "height"));
        return out;
    }
}
