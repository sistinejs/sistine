
import * as leftArrows from "./LeftArrow"

export function newShape(configs) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    return new leftArrows.LeftArrowShape(configs);
}

