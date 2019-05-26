
import * as rightArrows from "./RightArrow"

function sanitizeConfigs(configs) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    configs.backDepth = 0.2;
    configs.tipLength = 0.2;
    configs._name = configs._name || "RightChevron";
}

export class RightChevron extends rightArrows.RightArrow {
    constructor(configs) {
        super((configs = sanitizeConfigs(configs)));
    }
}
