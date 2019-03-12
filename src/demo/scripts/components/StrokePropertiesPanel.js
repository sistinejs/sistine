
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
        this.lineWidthSlider = new NumericSlider("#lineWidthSlider", {
            min: 0,
            max: 50,
            value: 1
        });
        this.miterLimitSlider = new NumericSlider("#miterLimitSlider", {
            min: 0,
            max: 50,
            value: 1
        });
        this.dashOffsetSlider.on("valueChanged", function(event) {
            self.triggerOn("dashOffsetChanged", event);
        });
        this.lineWidthSlider.on("valueChanged", function(event) {
            self.triggerOn("lineWidthChanged", event);
        });
        this.miterLimitSlider.on("valueChanged", function(event) {
            self.triggerOn("miterLimitChanged", event);
        });

        this._setupLineCapTypeControls();
        this._setupLineJoinTypeControls();
    }

    _setupLineJoinTypeControls() {
        var self = this;
        this.find("label[for=lineJoinBevel]")
            .attr("for", "lineJoinBevel" + this.uniqueid);
        this.find("label[for=lineJoinMiterType]")
            .attr("for", "lineJoinMiterType" + this.uniqueid);
        this.find("label[for=lineJoinRoundType]")
            .attr("for", "lineJoinRoundType" + this.uniqueid);

        this.find("#lineJoinBevel")
            .attr("id", "lineJoinBevel" + this.uniqueid);
        this.find("#lineJoinMiterType")
            .attr("id", "lineJoinMiterType" + this.uniqueid);
        this.find("#lineJoinRoundType")
            .attr("id", "lineJoinRoundType" + this.uniqueid);

        this.find("input[name='lineJoinType']").checkboxradio();
        this.lineJoinBevel = this.find("#lineJoinBevel" + this.uniqueid)
        this.lineJoinMiter = this.find("#lineJoinMiter" + this.uniqueid)
        this.lineJoinRound = this.find("#lineJoinRound" + this.uniqueid)

        this.find("input[name=lineJoinType]").change(function() {
            var isMiter = this.value === "miter";
            self._triggerOn("lineJoinChanged", {});
            self.miterLimitSlider.enable(isMiter);
        });
    }

    _setupLineCapTypeControls() {
        var self = this;
        this.find("label[for=lineCapButt]")
            .attr("for", "lineCapButt" + this.uniqueid);
        this.find("label[for=lineCapSquareType]")
            .attr("for", "lineCapSquareType" + this.uniqueid);
        this.find("label[for=lineCapRoundType]")
            .attr("for", "lineCapRoundType" + this.uniqueid);

        this.find("#lineCapButt")
            .attr("id", "lineCapButt" + this.uniqueid);
        this.find("#lineCapSquareType")
            .attr("id", "lineCapSquareType" + this.uniqueid);
        this.find("#lineCapRoundType")
            .attr("id", "lineCapRoundType" + this.uniqueid);

        this.find("input[name='lineCapType']").checkboxradio();
        this.lineCapButt = this.find("#lineCapButt" + this.uniqueid)
        this.lineCapSquare = this.find("#lineCapSquare" + this.uniqueid)
        this.lineCapRound = this.find("#lineCapRound" + this.uniqueid)

        this.find("input[name=lineCapType]").change(function() {
            self._triggerOn("lineCapChanged", {});
        });
    }

    _triggerOn(eventType, event) {
        this.markModified();
        this.triggerOn(eventType, event);
    }

    get lineJoin() {
        return this.find("input[name=lineJoinType]:checked").val();
    }

    get lineCap() {
        return this.find("input[name=lineCapType]:checked").val();
    }

    get dashOffset() {
        return this.dashOffsetSlider.value;
    }

    get lineWidth() {
        return this.lineWidthSlider.value;
    }

    get miterLimit() {
        return this.miterLimitSlider.value;
    }

    get lineDash() {
    }
}

