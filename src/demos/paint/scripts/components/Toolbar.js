
class Toolbar extends Panel {
    setupElements() {
        var self = this;
        $("#zoom_option").selectmenu({ width : 100 });
        var toolbar_buttons = $(".toolbar_button");
        toolbar_buttons.each(function(index, tbbutton) {
            var $tbbutton = $(tbbutton);
            var label = $tbbutton.text();
            $tbbutton.empty()
            $tbbutton.attr("title", label);

            var buttonId = tbbutton.id.replace(/TB_/, "");
            var buttonImage = $("<img src = '" + "./src/demos/paint/icons/toolbar/" + buttonId + ".png' />");
            $tbbutton.button({ iconPosition: "top" }).append(buttonImage);
            Sistine.Utils.DOM.fillChildComponent(buttonImage);

            var eventId = "on" + buttonId
            $tbbutton.click(function(event) {
                self.eventMachine.handle(eventId, self, event);
            });
        });
    }
}
