
import * as leftArrows from "./LeftArrow"

export function newShape(configs) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    configs.backDepth = 0.2;
    configs.tipLength = 0.2;
    configs._name = configs._name || "LeftChevron";
    return new leftArrows.LeftArrowShape(configs);
}

