
import * as base from "./base"

export class CircleNodeProcessor extends base.NodeProcessor {
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

    processElement(elem, parent) {
        var configs = {};
        var value = 
        configs.cx = elem.getAttribute("cx") || 0;
        configs.cy = elem.getAttribute("cy") || 0;
        configs.radius = elem.getAttribute("r");
        var out = new Builtins.Circle(configs);
        this.processStyleAttributes(elem, out);
        parent.add(out);
        return out;
    }
}
