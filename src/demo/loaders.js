
function loadComponents() {
    /*
    var shape_icons = $(".shape_icon");
    shape_icons.each(function(index, icondiv) {
        // We have divs where these buttons should go.
        // What we need is some kind of element in these buttons, that will:
        // 1. Show the icon corresponding to that button
        // 2. Add a drag handler that will let us drop that *component* onto the canvas
        // 3. Associate the button to an actual node component.
        // 4. This implies the node component corresponding to the ID will be responsible for the above.
        var $icondiv = $(icondiv)
        $icondiv.empty()

        var shapeId = icondiv.id.replace(/holder_/, "");
        var nodeViewer = shape_builders[shapeId];
        var canvasId = "canvas_" + shapeId;
        var $child = $("<canvas class = 'shape_icon_canvas' id = '" + canvasId + "' title = '" + nodeViewer.iconLabel + "'/>");
        $icondiv.append($child)

        iconCanvases[shapeId] = new fabric.StaticCanvas(canvasId);
        fillChildComponent($child);

        var toolbarShape = nodeViewer.toolbarShape({
            width: $child.width() - (
                getcssint($child, "margin-left") +
                getcssint($child, "margin-right")
            ),
            height: $child.height() - (
                getcssint($child, "margin-top") +
                getcssint($child, "margin-bottom")
            )
        });
        iconCanvases[shapeId].add(toolbarShape);
        $(canvasId).tooltip();

        // Setup highlighter!
        $child.mouseover(function(event) {
            $(event.currentTarget).addClass("toolbar_button_highlighted");
        }).mouseout(function(event) {
            $(event.currentTarget).removeClass("toolbar_button_highlighted");
        }).click(function(event) {
            // Add the shape on the canvas at the center
            var id = event.currentTarget.id.replace(/canvas_/, "");
            addShapeForToolbar(id);
        });
    });
    */
}
