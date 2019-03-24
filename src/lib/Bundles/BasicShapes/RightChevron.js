
import * as rightArrows from "./RightArrow"

export function newShape(configs) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    configs.backDepth = 0.2;
    configs.tipLength = 0.2;
    configs._name = configs._name || "RightChevron";
    return new rightArrows.RightArrowShape(configs);
}

