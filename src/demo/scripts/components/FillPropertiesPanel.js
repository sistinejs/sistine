
class FillPropertiesPanel extends Panel {
    setupElements() {
        var self = this;

        this.paintStylePanel = new PaintStylePanel(this.subselector("#paintStylePanelTab"));
        this.paintStylePanel.eventHub.chain(this.eventHub);
    }

    set opacity(value) {
        this.rootElement.find("#opacity_value").html(value / 100.0);
    }

    layout() {
    }
}

