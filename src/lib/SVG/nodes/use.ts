
import { Core } from "../../Core/index"
import { Element } from "../../Core/base"
import * as base from "./base"
type Int = number
type Nullable<T> = T | null;

export class UseNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.animationElements
                .concat(base.descriptiveElements)
    }

    get validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat(base.xlinkAttributes)
                .concat(["class", "style", "externalResourcesRequired",
                         "transform", "x", "y", "width", "height", "xlink:href"])
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        var href = elem.getAttribute("xlink:href") || elem.getAttribute("href") || null;
        if (href == null) {
            throw new Error("Use needs a xlink:href attribute.");
        }

        // Get and clone the source pointed by href
        var source = this.getRef(parent, href);
        var sourceCopy = source.clone();

        var out = new Core.Models.Group();

        var bounds = parent ? new Bounds() : this.configs.bounds.copy();
        out.setBounds(bounds);
        if (parent != null) parent.add(out);
        this.processStyleAttributes(elem, out);
        this.processBoundsAttributes(elem, bounds);
        this.processTransformAttributes(elem, out);
        this.processMetaAttributes(elem, out);
        return parent;
    }
}

