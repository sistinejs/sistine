
import * as base from "./base"

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

    processElement(elem, parent) {
        var configs = {};
        configs.cx = elem.getAttribute("cx") || 0;
        configs.cy = elem.getAttribute("cy") || 0;
        configs.radius = elem.getAttribute("r");
        configs.x = elem.getAttribute("x") || 0;
        configs.y = elem.getAttribute("y") || 0;
        configs.rx = elem.getAttribute("rx") || 0;
        configs.ry = elem.getAttribute("ry") || 0;
        configs.width = elem.getAttribute("width");
        configs.height = elem.getAttribute("height");
        var out = new Builtins.Rectangle(configs);
        parent.add(out);
        return out;
    }
}
