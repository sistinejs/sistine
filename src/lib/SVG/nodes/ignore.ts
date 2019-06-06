

import * as base from "./base"

import { Nullable } from "../../Core/types"
import { Element } from "../../Core/base"

export class IgnoreNodeProcessor extends base.NodeProcessor {
    validAttributes() {
        return ["type", "xlink:href"];
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        // do nothing
        return null;
    }
}

