
class StrokePropertiesPanel extends Panel {
    setupElements() {
        var self = this;

        this.paintStylePanel = new PaintStylePanel(this.subselector("#paintStylePanelTab"));
        this.paintStylePanel.eventHub.chain(this.eventHub);

        this.dashOffsetSlider = new NumericSlider("#dashOffsetSlider", {
            min: 0,
            max: 50,
            value: 1
        });
        this.strokeWidthSlider = new NumericSlider("#strokeWidthSlider", {
            min: 0,
            max: 50,
            value: 1
        });
        this.miterLimitSlider = new NumericSlider("#miterLimitSlider", {
            min: 0,
            max: 50,
            value: 1
        });
    }

    layout() {
    }
}

