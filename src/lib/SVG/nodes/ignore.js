

import * as base from "./base"

export class IgnoreNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return [];
    }

    get validAttributes() {
        return ["type", "xlink:href"];
    }

    processElement(elem, parent) {
        // do nothing
    }
}

