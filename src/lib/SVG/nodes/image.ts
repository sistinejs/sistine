
import * as base from "./base"
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import { Builtins } from "../../Builtins/index"
import * as models from "../models"
import * as layouts from "../layouts"
import { Int, Nullable } from "../../Core/types"

const CM = layouts.defaultCM;
const Bounds = Geom.Models.Bounds;
const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

export class ImageNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.animationElements.concat(base.descriptiveElements);
    }

    get validAttributes() {
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
        var href = elem.getAttribute("xlink:href") || elem.getAttrib("href") || null;
        if (href == null) {
            throw new Error("Use needs a xlink:href attribute.");
        }
        var out = new Builtins.Image({ url: href });
        super.processElement(elem, out);
        CM.addXConstraint(out, "x", this.getLength(elem, "x"));
        CM.addYConstraint(out, "y", this.getLength(elem, "y"));
        CM.addXConstraint(out, "width", this.getLength(elem, "width"));
        CM.addYConstraint(out, "height", this.getLength(elem, "height"));
        parent.add(out);
        return out;
    }
}
