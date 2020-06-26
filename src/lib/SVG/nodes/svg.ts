import { Bounds } from "../../Geom/models";
import * as base from "./base";
import * as models from "../models";
import { Nullable } from "../../Core/types";
import { Element } from "../../Core/base";
import { forEachAttribute } from "../../Utils/dom";

export class SVGNodeProcessor extends base.NodeProcessor {
  validChildren() {
    return base.animationElements
      .concat(base.descriptiveElements)
      .concat(base.shapeElements)
      .concat(base.structuralElements)
      .concat(base.gradientElements)
      .concat([
        "a",
        "altGlyphDef",
        "clipPath",
        "color-profile",
        "cursor",
        "filter",
        "font",
        "font-face",
        "foreignObject",
        "image",
        "marker",
        "mask",
        "pattern",
        "script",
        "style",
        "switch",
        "text",
        "view",
      ]);
  }

  validAttributes() {
    return base.conditionalProcessingAttributes
      .concat(base.coreAttributes)
      .concat(base.documentEventAttributes)
      .concat(base.graphicalEventAttributes)
      .concat(base.presentationAttributes)
      .concat([
        "class",
        "style",
        "externalResourcesRequired",
        "x",
        "y",
        "width",
        "height",
        "viewBox",
        "preserveAspectRatio",
        "zoomAndPan",
        "version",
        "baseProfile",
        "contentScriptType",
        "contentStyleType",
        "version",
        "baseProfile",
      ]);
  }

  processElement(
    elem: HTMLElement,
    parent: Nullable<Element>
  ): Nullable<Element> {
    var out = new models.SVG();
    if (parent != null) parent.add(out);
    var bounds = parent ? new Bounds() : this.configs.bounds.copy();
    var viewBox = null;
    var self = this;
    this.processStyleAttributes(elem, out);
    this.processBoundsAttributes(elem, bounds);
    this.processTransformAttributes(elem, out);
    this.processMetaAttributes(elem, out);
    forEachAttribute(elem, function (attrib, value) {
      attrib = attrib.toLowerCase();
      if (attrib === "viewbox") {
        var value = value.split(" ");
        viewBox = new Bounds();
        viewBox.x = parseFloat(value[0]);
        viewBox.y = parseFloat(value[1]);
        viewBox.width = parseFloat(value[2]);
        viewBox.height = parseFloat(value[3]);
      } else if (
        attrib.startsWith("xmlns:") ||
        ["xmlns", "baseprofile"].indexOf(attrib) >= 0 ||
        attrib.startsWith("sodipodi:") ||
        attrib.startsWith("inkscape:")
      ) {
        // ignore list
        console.log("Ignoring attribute: ", attrib, " = ", value);
      } else if (self.validAttributes().indexOf(attrib) >= 0) {
        // Valid attribute, do nothing
      } else {
        throw new Error("Cannot process attribute: " + attrib);
      }
    });
    out.setBounds(bounds);
    if (viewBox != null) out.viewBox = viewBox;
    this.processChildrenOf(elem, out);
    return out;
  }
}
