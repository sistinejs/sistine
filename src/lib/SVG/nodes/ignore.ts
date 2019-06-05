

import * as base from "./base"

import { Int, Nullable } from "../../Core/types"

export class IgnoreNodeProcessor extends base.NodeProcessor {
    validAttributes() {
        return ["type", "xlink:href"];
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        // do nothing
        return null;
    }
}

