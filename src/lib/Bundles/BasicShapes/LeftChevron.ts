
import * as leftArrows from "./LeftArrow"

function sanitizeConfigs(configs) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    configs.backDepth = 0.2;
    configs.tipLength = 0.2;
    configs._name = configs._name || "LeftChevron";
}

export class LeftChevron extends leftArrows.LeftArrow {
    constructor(configs) {
        super((configs = sanitizeConfigs(configs)));
    }
}
