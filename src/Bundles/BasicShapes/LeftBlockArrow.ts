
import * as leftArrows from "./LeftArrow"

function sanitizeConfigs(configs? : any) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    return configs;
}

export class LeftBlockArrow extends leftArrows.LeftArrow {
    constructor(configs : any) {
        super((configs = sanitizeConfigs(configs)));
    }
}

