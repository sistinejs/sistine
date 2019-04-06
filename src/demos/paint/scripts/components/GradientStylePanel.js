
class GradientStylePanel extends Panel {
    initialize(configs) {
        this._stops = [{
            offset: 0,
            color: "#000000",
        }, {
            offset: 1000,
            color: "#FFFFFF",
        }];
        this._selectedStopIndex = 0;
    }

    get _ranges() {
        return this._stops.map(function(value) {
            return true;
        });
    }

    get x1() { return parseFloat(this.inputGradientX1.val()); } 
    get y1() { return parseFloat(this.inputGradientY1.val()); } 
    get r1() { return parseFloat(this.inputGradientR1.val()); }
    get x2() { return parseFloat(this.inputGradientX2.val()); } 
    get y2() { return parseFloat(this.inputGradientY2.val()); } 
    get r2() { return parseFloat(this.inputGradientR2.val()); }

    get numStops() {
        return this._stops.length;
    }

    stopOffsetAt(i) {
        return this._stops[i].offset;
    }

    get stopOffsets() {
        return this._stops.map(function(value) {
            return value.offset;
        });
    }

    get stopColors() {
        return this._stops.map(function(value) {
            return value.value;
        });
    }

    get stops() {
        return this._stops.map(function(value) {
            return value;
        });
    }

    setStopAt(index, offset, color) {
        if (index >= 0 && index < this._stops.length) {
            this._stops[i] = {'offset': offset, 'color': color};
            this.reloadData();
        }
        return this;
    }

    setStopColorAt(index, color) {
        if (index >= 0 && index < this._stops.length) {
            this._stops[i]['color'] = color;
            this.reloadData();
        }
        return this;
    }

    setStopOffsetAt(index, offset) {
        if (index >= 0 && index < this._stops.length) {
            this._stops[i]['offset'] = offset;
            this.reloadData();
        }
        return this;
    }

    removeStopAt(index) {
        if (index >= 0 && index < this._stops.length && this._stops.length > 1) {
            this._stops.splice(index, 1);
            if (this._selectedStopIndex >= this._stops.length) {
                this._selectedStopIndex --;
            }
            this.markModified();
            this.reloadData();
            return true;
        }
        return false;
    }

    addStop(offset, color, index) {
        index = index || -1;
        if (color == null) {
            color = this.currentColor;
        }
        // If offset is not provided then find the most "pleasing" offset
        if (offset < 0 || offset == null) {
            offset = (1000 + this.stopOffsetAt(this.numStops - 1)) / 2.0;
        }
        var entry = {'offset': offset, 'color': color};
        if (index < 0) {
            this._stops.push(entry);
            this._selectedStopIndex = this._stops.length - 1;
        } else {
            this._stops.splice(index, 0, entry);
            this._selectedStopIndex = index;
        }
        this.markModified();
        this.reloadData();
    }

    get currentColor() {
        return this.stopColorPicker.spectrum("get");
    }

    set currentColor(color) {
        this._stops[this._selectedStopIndex].color = color;
        this._handleAtIndex(this._selectedStopIndex).css("background", color);
        this.stopColorPicker.spectrum("set", color);
    }

    _handleAtIndex(index) {
        return this.stopsSlider.find(".ui-slider-handle").eq(index);
    }

    setupElements() {
        var self = this;
        this.inputGradientX1 = this.find("#gradientX1");
        this.inputGradientY1 = this.find("#gradientY1");
        this.inputGradientR1 = this.find("#gradientR1");
        this.inputGradientX2 = this.find("#gradientX2");
        this.inputGradientY2 = this.find("#gradientY2");
        this.inputGradientR2 = this.find("#gradientR2");

        function gradientChanged(fieldName, event) {
            self._triggerStyleChanged({
                field: fieldName,
                value: event.currentTarget.value
            });
        }
        this.inputGradientX1.change(function(event) {
            gradientChanged("gradientX1", event);
        });
        this.inputGradientX2.change(function(event) {
            gradientChanged("gradientX2", event);
        });
        this.inputGradientY1.change(function(event) {
            gradientChanged("gradientY1", event);
        });
        this.inputGradientY2.change(function(event) {
            gradientChanged("gradientY2", event);
        });
        this.inputGradientR1.change(function(event) {
            gradientChanged("gradientR1", event);
        });
        this.inputGradientR2.change(function(event) {
            gradientChanged("gradientR2", event);
        });

        this._setupGradientTypeControls();

        this.stopColorPicker = this.find("#StopColorPicker");
        this.stopColorPicker.spectrum({
            value: "#ffaabb",
            showAlpha: true,
            showInput: true,
            showButtons: true,
            preferredFormat: "rgb",
            move: function(color) {
                self.currentColor = color.toRgbString();
                self._triggerStyleChanged({
                    "color": self.currentColor,
                    "stop": self._selectedStopIndex,
                });
            }
        });

        this.addStopButton = this.find("#addStopButton");
        this.addStopButton.button({
            showLabel: false
        });
        this.addStopButton.click(function(event) {
            self.addStop(null, null, -1);
            self._triggerStyleChanged({
                "stop": self._selectedStopIndex,
            });
        });
        this.removeStopButton = this.find("#removeStopButton");
        this.removeStopButton.button({
            showLabel: false
        });
        this.removeStopButton.click(function(event) {
            if (self.removeStopAt(self._selectedStopIndex)) {
                self._triggerStyleChanged({
                    "stop": self._selectedStopIndex,
                });
            }
        });

        this._setupStopsSlider()
    }

    reloadData() {
        this.stopsSlider.limitslider("destroy");
        this._setupStopsSlider();
        this.stopColorPicker.spectrum("set", this._stops[this._selectedStopIndex].color);
    }

    set selectedStopIndex(index) {
        var theStop = this._stops[index];
        this._selectedStopIndex = index;
        this.stopColorPicker.spectrum("set", theStop.color);
    }

    _setupGradientTypeControls() {
        var self = this;
        this.find("label[for=linearGradientType]")
            .attr("for", "linearGradientType" + this.uniqueid);
        this.find("label[for=radialGradientType]")
            .attr("for", "radialGradientType" + this.uniqueid);
        this.find("#linearGradientType")
            .attr("id", "linearGradientType" + this.uniqueid);
        this.find("#radialGradientType")
            .attr("id", "radialGradientType" + this.uniqueid);
        this.find("input[name='gradientType']").checkboxradio();
        this.linearGradientType = this.find("#linearGradientType" + this.uniqueid)
        this.linearGradientType.click(
            function(event) {
                self._triggerStyleChanged({
                    type: "linear"
                });
            });
        this.radialGradientType = this.find("#radialGradientType" + this.uniqueid)
        this.radialGradientType.click(
            function(event) {
                self._triggerStyleChanged({
                    type: "radial"
                });
            });
        this.find("input[name=gradientType]").change(function() {
            var isLinear = this.value === "linear";
            self.inputGradientR1.prop("disabled", isLinear);
            self.inputGradientR2.prop("disabled", isLinear);
        });
    }

    _setupStopsSlider() {
        var self = this;
        this.stopsSlider = this.find("#stopsSlider");
        this.stopsSlider.limitslider({
            values:     this.stopOffsets,
            max:        1000,
            title:      function(value) {
                return value / 1000.0;
            },
            create:      function(event, ui) {
                console.log("Create: ", ui);
            },
            slide:      function(event, ui) {
                var handleIndex = ui.handleIndex;
                var nextStop = self._stops[handleIndex];
                nextStop.offset = ui.value;
                self.selectedStopIndex = handleIndex;
                self._triggerStyleChanged({
                    "stop": self._selectedStopIndex,
                    "offset": ui.value
                });
            },
            start:      function(event, ui) {
                var handleIndex = ui.handleIndex;
                var nextStop = self._stops[handleIndex];
                console.log("OnStart CurrSelIndex, ui.index: ", self._selectedStopIndex, handleIndex, nextStop);
                self.selectedStopIndex = handleIndex;
                self._triggerStyleChanged({
                    "stop": self._selectedStopIndex,
                    "offset": ui.value
                });
            },
            showRanges: true,
            ranges:     this._ranges
        });
        this._stops.forEach(function(stop, index) {
            self.stopsSlider.find(".ui-slider-handle").eq(index).css("background", stop.color);
        });
    }

    get currentStyle() {
        if (this._currentStyle == null || this.isModified) {
            this.markCreated();
            // recreate it
            this._currentStyle = this._createStyle();
        }
        return this._currentStyle;
    }

    _createStyle() {
        var style = null;
        if (this.linearGradientType.is(":checked")) {
            style = new Sistine.Core.Styles.LinearGradient(
                this.x1, this.y1, this.x2, this.y2);
        } else {
            style = new Sistine.Core.Styles.RadialGradient(
                this.x1, this.y1, this.r1,
                this.x2, this.y2, this.r2);
        }
        for (var i = 0;i < this._stops.length;i++) {
            var stop = this._stops[i];
            style.addStop(stop.offset / 1000.0, stop.color);
        }
        return style;
    }

    _triggerStyleChanged(data) {
        this.markModified();
        this.triggerOn("styleChanged", data);
    }
}
