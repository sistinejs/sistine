
class NumericSlider extends Panel {
    initialize(configs) {
        this.min = configs.min || 0;
        this.max = configs.max || 100;
        this.value = configs.value || 1;
    }

    setupElements() {
        var self = this;

        this.sliderParent = this.rootElement.find("#parent");
        if (this.sliderParent.length == 0) {
            // then add one
            this.rootElement.append($("<div id = parent > </div>"));
            this.sliderParent = this.rootElement.find("#parent");
        }

        this.inputElement = this.rootElement.find("#number");
        if (this.inputElement.length == 0) {
            // then add one
            this.sliderParent.append($("<input type = 'number' id = 'number' />"));
            this.inputElement = this.rootElement.find("#number");
        }
        this.inputElement.attr("min", this.min);
        this.inputElement.attr("max", this.max);
        this.inputElement.attr("value", this.value);

        this.sliderElement = this.rootElement.find("#slider");
        if (this.inputElement.length == 0) {
            // then add one
            this.sliderParent.append($("<div id = 'slider' />"));
            this.sliderElement = this.rootElement.find("#slider");
        } else {
            this.sliderElement.detach();
            this.sliderParent.append(this.sliderElement);
        }
        this.sliderElement.slider({
            min: this.min,
            max: this.max,
            value: this.value,
            slide: function( event, ui ) {
                self.value = ui.value;
            }
        });
    }

    layout() {
        // this.sliderParent.css("position", "absolute");
        this.sliderParent.css("left", "10px");
        this.sliderParent.css("right", "10px");

        this.sliderElement.css("position", "block");
        this.sliderElement.css("top", "9px");
        this.sliderElement.css("margin-left", "10px");
        this.sliderElement.css("margin-right", "20px");
        this.sliderElement.css("margin-bottom", "30px");
        this.sliderElement.css("flow", "left");
        // Sistine.Utils.DOM.centerElem(this.sliderElement, "y");

        this.inputElement.css("position", "absolute");
        this.inputElement.css("right", "0px");
        this.inputElement.css("width", "50px");
        this.inputElement.css("height", "25px");
        this.inputElement.css("flow", "right");
    }
}

