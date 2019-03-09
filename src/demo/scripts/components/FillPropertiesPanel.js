
class FillPropertiesPanel extends Panel {
    setupElements() {
        var self = this;

        this.fillStylePanel = new FillStylePanel("#fillTypeTabDiv");

        this.opacitySlider = this.rootElement.find("#opacity_slider");
        var handle = this.find("#custom-handle");
        this.opacitySlider.slider({
            min: 0,
            max: 100,
            value: 50,
            create: function() {
                handle.text( $( this ).slider( "value" ) );
            },
            slide: function( event, ui ) {
                handle.text( ui.value );
                self.opacity = ui.value;
            }
        });
    }

    set opacity(value) {
        this.rootElement.find("#opacity_value").html(value / 100.0);
    }

    layout() {
    }
}

class FillStylePanel extends Panel {
    setupElements() {
        var self = this;
        this.fillTypeTab = this.rootElement;
        this.fillTypeTab.tabs();

        this.fillColorPicker = this.find("input[id=FillColorPicker]");
        this.fillColorPicker.spectrum({
            flat: true,
            allowEmpty: true,
            width: 200,
            showAlpha: true,
            showInput: true,
            showButtons: false
        });

        this.gradientStylePanel = new GradientStylePanel("#fillTypeTabDiv #gradientStyleDiv");
    }
}

