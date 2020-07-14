import { EventSource, Event } from "../../../src/Core/events";
import { ShapesSelected, ShapesUnselected } from "../../../src/Core/selection";
import { App } from "./App";

/**
 * Connect events from the different components to affect each other's behaviours.
 */
export function connectEventHandlers(theApp: App) {
  // 1. When selection changes, we want different panels/toolbuttons to react to this.
  var theStage = theApp.stage;
  var selection = theStage.selection;
  theStage.selection
    .on("ShapesSelected", function (eventType: string, _source: EventSource, event: ShapesSelected) {
      console.log("Shapes Selected: ", event.shapes);
      if (selection.count == 1) {
        // if we have a single shape in our selection, we can set fill properties from this shape
        setFillPropertiesFromShape(selection.get(0));
      }
    })
    .on("ShapesUnselected", function (eventType: string, _source: EventSource, event: ShapesUnselected) {
      console.log("Shapes Unselected: ", event.shapes);
      if (selection.count == 1) {
        setFillPropertiesFromShape(selection.get(0));
      }
    });

  // 2. When properties in sidebar changes, we want shapes to reflect those
  // theSidebar.fillProperties
  theApp.fillPropertiesPanel.on("styleChanged", function (eventType: string, _source: EventSource, event: Event) {
    var currentStyle = theApp.fillPropertiesPanel.paintStylePanel.currentStyle;
    console.log(eventType, event, "Style: ", currentStyle);
    selection.forEach(function (shape) {
      if (currentStyle.copy) {
        currentStyle = currentStyle.copy();
      }
      shape.setFillStyle(currentStyle);
      theStage.paneNeedsRepaint(shape.pane);
    });
  });

  // 2. When properties in sidebar changes, we want shapes to reflect those
  // theSidebar.fillProperties
  theApp.strokePropertiesPanel.on("styleChanged", function (eventType: string, source: EventSource, event: Event) {
    var currentStyle = theApp.strokePropertiesPanel.paintStylePanel.currentStyle;
    console.log(eventType, event, "Style: ", currentStyle);
    selection.forEach(function (shape: any) {
      if (currentStyle.copy) {
        currentStyle = currentStyle.copy();
      }
      shape.strokeStyle = currentStyle;
      theStage.paneNeedsRepaint(shape.pane);
    });
  });

  theApp.strokePropertiesPanel.on("dashOffsetChanged", function (eventType: string, source: EventSource, event: Event) {
    selection.forEach(function (shape) {
      shape.dashOffset = theApp.strokePropertiesPanel.dashOffset;
      theStage.paneNeedsRepaint(shape.pane);
    });
  });

  theApp.strokePropertiesPanel.on("miterLimitChanged", function (eventType: string, source: EventSource, event: Event) {
    selection.forEach(function (shape) {
      shape.miterLimit = theApp.strokePropertiesPanel.miterLimit;
      theStage.paneNeedsRepaint(shape.pane);
    });
  });

  theApp.strokePropertiesPanel.on("lineWidthChanged", function (eventType: string, source: EventSource, event: Event) {
    selection.forEach(function (shape) {
      shape.setLineWidth(theApp.strokePropertiesPanel.lineWidth);
      theStage.paneNeedsRepaint(shape.pane);
    });
  });

  theApp.strokePropertiesPanel.on("lineCapChanged", function (eventType: string, source: EventSource, event: Event) {
    selection.forEach(function (shape) {
      shape.lineCap = theApp.strokePropertiesPanel.lineCap || null;
      theStage.paneNeedsRepaint(shape.pane);
    });
  });

  theApp.strokePropertiesPanel.on("lineJoinChanged", function (eventType: string, source: EventSource, event: Event) {
    selection.forEach(function (shape) {
      shape.lineJoin = theApp.strokePropertiesPanel.lineJoin;
      theStage.paneNeedsRepaint(shape.pane);
    });
  });

  theApp.strokePropertiesPanel.on("lineDashChanged", function (eventType: string, source: EventSource, event: Event) {
    selection.forEach(function (shape) {
      shape.dashArray = theApp.strokePropertiesPanel.lineDash;
      theStage.paneNeedsRepaint(shape.pane);
    });
  });
}

function setFillPropertiesFromShape(shape: any) {}
