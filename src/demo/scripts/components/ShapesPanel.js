
class ShapesPanel extends Panel {
    setupElements() {
        this.rootElement.accordion({
            collapsible:true,
            beforeActivate: function(event, ui) {
                 // The accordion believes a panel is being opened
                if (ui.newHeader[0]) {
                    var currHeader  = ui.newHeader;
                    var currContent = currHeader.next('.ui-accordion-content');
                 // The accordion believes a panel is being closed
                } else {
                    var currHeader  = ui.oldHeader;
                    var currContent = currHeader.next('.ui-accordion-content');
                }
                 // Since we've changed the default behavior, this detects the actual status
                var isPanelSelected = currHeader.attr('aria-selected') == 'true';

                 // Toggle the panel's header
                currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));

                // Toggle the panel's icon
                currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);

                 // Toggle the panel's content
                currContent.toggleClass('accordion-content-active',!isPanelSelected)    
                if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }
                return false; // Cancels the default action
            }
        });
        this._loadShapeIcons();
    }

    _loadShapeIcons() {
        var shape_icons = this.find(".shape_icon");
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
            var iconStage = new Sistine.Views.Stage.Stage(icondiv.id);
            // iconStages[shapeId] = iconStage;
            var topPane = iconStage.getPane("main");
            var $child = topPane.element;

            var margin = 3;
            var toolbarShape = DefaultBundle[shapeId].newShapeForToolbar(
                margin,
                margin,
                $child.width() - (
                    Sistine.Utils.DOM.getcssint($child, "margin-left") +
                    Sistine.Utils.DOM.getcssint($child, "margin-right")
                ) - (margin * 2),
                $child.height() - (
                    Sistine.Utils.DOM.getcssint($child, "margin-top") +
                    Sistine.Utils.DOM.getcssint($child, "margin-bottom")
                ) - (margin * 2),
                { lineWidth: 2, }
            );
            iconStage.scene.add(toolbarShape);
            iconStage.layout();
            // topPane.element.tooltip();

            // Setup highlighter!
            topPane.element.mouseover(function(event) {
                $(event.currentTarget).addClass("toolbar_button_highlighted");
            }).mouseout(function(event) {
                $(event.currentTarget).removeClass("toolbar_button_highlighted");
            }).click(function(event) {
                // Add the shape on the canvas at the center
                var id = event.currentTarget.id.replace(/mainpane_holder_/, "");
                var configs = Object.assign({}, shapeDefaults);
                theApp.eventMachine.enter("creatingShapes", DefaultBundle[id].newShape(configs));
            });
        });
    }
}

