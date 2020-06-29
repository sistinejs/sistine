import { Sistine } from "../../../../lib/index";
import { Panel } from "./Panel";

declare var shapeDefaults: any;

export class ShapesPanel extends Panel {
  setupElements() {
    this.rootElement.accordion({
      collapsible: true,
      beforeActivate: function (_event: any, ui: any) {
        // The accordion believes a panel is being opened
        if (ui.newHeader[0]) {
          var currHeader = ui.newHeader;
          var currContent = currHeader.next(".ui-accordion-content");
          // The accordion believes a panel is being closed
        } else {
          var currHeader = ui.oldHeader;
          var currContent = currHeader.next(".ui-accordion-content");
        }
        // Since we've changed the default behavior, this detects the actual status
        var isPanelSelected = currHeader.attr("aria-selected") == "true";

        // Toggle the panel's header
        currHeader
          .toggleClass("ui-corner-all", isPanelSelected)
          .toggleClass(
            "accordion-header-active ui-state-active ui-corner-top",
            !isPanelSelected
          )
          .attr("aria-selected", (!isPanelSelected).toString());

        // Toggle the panel's icon
        currHeader
          .children(".ui-icon")
          .toggleClass("ui-icon-triangle-1-e", isPanelSelected)
          .toggleClass("ui-icon-triangle-1-s", !isPanelSelected);

        // Toggle the panel's content
        currContent.toggleClass("accordion-content-active", !isPanelSelected);
        if (isPanelSelected) {
          currContent.slideUp();
        } else {
          currContent.slideDown();
        }
        return false; // Cancels the default action
      },
    });
    this._loadShapeIcons();
  }

  _loadShapeIcons() {
    var shape_buttons = this.find(".shape_button");
    shape_buttons.each(function (index: number, sbbutton: any) {
      var $sbbutton: any = $(sbbutton);
      var label: any = $sbbutton.text();
      var bundleId: string = $sbbutton.attr("bundle");
      console.log("bundleId: ", bundleId);
      $sbbutton.empty();
      $sbbutton.attr("title", label);

      var shapeId = sbbutton.id.replace(/SB_/, "");
      var buttonImage = $(
        "<img src = '" +
          "./src/demos/paint/icons/shapes/" +
          shapeId +
          ".png' />"
      );
      $sbbutton.button({ iconPosition: "top" }).append(buttonImage);
      Sistine.Utils.DOM.fillChildComponent(buttonImage);

      // Setup highlighter!
      $sbbutton
        .on("mouseover", function (event: any) {
          $(event.currentTarget).addClass("toolbar_button_highlighted");
        })
        .on("mouseout", function (event: any) {
          $(event.currentTarget).removeClass("toolbar_button_highlighted");
        })
        .click(function (event: any) {
          // Add the shape on the canvas at the center
          var id = event.currentTarget.id.replace(/SB_/, "");
          var TheBundle = eval(
            event.currentTarget.getAttribute("bundle") ||
              "Sistine.Bundles.BasicShapes"
          );
          var configs = Object.assign({}, shapeDefaults);
          var newShape = new TheBundle[id](configs);
          this.app.eventMachine.enter("CreatingShapeState", newShape);
        });
    });
  }
}
