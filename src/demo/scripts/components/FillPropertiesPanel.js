
class FillPropertiesPanel extends Panel {
    setupElements() {
        var self = this;

        this.paintStylePanel = new PaintStylePanel(this.subselector("#paintStylePanelTab"));
        this.paintStylePanel.eventHub.chain(this.eventHub);
    }
}

