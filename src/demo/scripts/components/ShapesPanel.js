
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
        var shape_buttons = this.find(".shape_button");
        shape_buttons.each(function(index, sbbutton) {
            var $sbbutton = $(sbbutton)
            var label = $sbbutton.text();
            var bundleId = $sbbutton.attr("bundle");
            console.log("bundleId: ", bundleId);
            $sbbutton.empty()
            $sbbutton.attr("title", label);

            var shapeId = sbbutton.id.replace(/SB_/, "");
            var buttonImage = $("<img src = '" + "./src/demo/icons/shapes/" + shapeId + ".png' />");
            $sbbutton.button({ iconPosition: "top" }).append(buttonImage);
            Sistine.Utils.DOM.fillChildComponent(buttonImage);

            // Setup highlighter!
            $sbbutton.on("mouseover", function(event) {
                $(event.currentTarget).addClass("toolbar_button_highlighted");
            }).on("mouseout", function(event) {
                $(event.currentTarget).removeClass("toolbar_button_highlighted");
            }).click(function(event) {
                // Add the shape on the canvas at the center
                var id = event.currentTarget.id.replace(/SB_/, "");
                var TheBundle = eval(event.currentTarget.getAttribute("bundle") || "Sistine.Bundles.BasicShapes");
                var configs = Object.assign({}, shapeDefaults);
                theApp.eventMachine.enter("CreatingShapeState", TheBundle[id].newShape(configs));
            });
        });
    }
}

