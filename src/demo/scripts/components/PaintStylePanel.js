
class PaintStylePanel extends Panel {
    setupElements() {
        var self = this;
        this.rootElement.tabs();

        this.paintColorPicker = this.find("input[id=PaintColorPicker]");
        this.paintColorPicker.spectrum({
            flat: true,
            allowEmpty: true,
            width: 200,
            showAlpha: true,
            showInput: true,
            showButtons: false
        });

        this.gradientStylePanel = new GradientStylePanel(this.subselector("#gradientStyleDiv"));
    }
}
