
/**
 * Connect events from the different components to affect each other's behaviours.
 */
function connectEventHandlers() {
    // 1. When selection changes, we want different panels/toolbuttons to react to this.
    var selection = theStage.selection;
    theStage.selection.on("ShapesSelected", function(event, eventType) {
        console.log("Shapes Selected: ", event.shapes);
        if (selection.count == 1) {
            // if we have a single shape in our selection, we can set fill properties from this shape
            setFillPropertiesFromShape(selection.get(0));
        }
    }).on("ShapesUnselected", function(event, eventType) {
        console.log("Shapes Unselected: ", event.shapes);
        if (selection.count == 1) {
            setFillPropertiesFromShape(selection.get(0));
        }
    });

    // 2. When properties in sidebar changes, we want shapes to reflect those
    // theSidebar.fillProperties
    theSidebar.fillPropertiesPanel
}

function setFillPropertiesFromShape(shape) {
}

function applyFillPropertiesToSelection(selection) {
}
