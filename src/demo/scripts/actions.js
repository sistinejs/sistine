
class RootUIState extends Sistine.Core.Events.State {
    constructor(app) {
        super();
        this.app = app;
        this.stage = app.stage;
        var machine = this.app.eventMachine;
        var States = Sistine.Views.States;
        var defaultState = new States.DefaultState(this.stage);
        var vpPanningState = new States.ViewPortPanningState(this.stage);
        var vpZoomingState = new States.ViewPortZoomingState(this.stage);
        var creatingShapeState = new States.CreatingShapeState(this.stage);
        machine.registerState(defaultState);
        machine.registerState(vpPanningState);
        machine.registerState(vpZoomingState);
        machine.registerState(creatingShapeState);
    }

    handle(eventType, source, event) {
        if (eventType == "onZoomIn") {
            this.app.eventMachine.enter("ViewPortZoomingState", "zoomin");
        }
        else if (eventType == "onZoomOut") {
            this.app.eventMachine.enter("ViewPortZoomingState", "zoomout");
        }
        else if (eventType == "onHandTool") {
            this.app.eventMachine.enter("ViewPortPanningState", "");
        }
        else if (eventType == "onGroupShapes") {
            this.stage.selection.group();
        }
        else if (eventType == "onUngroupShapes") {
            this.stage.selection.ungroup();
        }
        else if (eventType == "onBringToFront") {
            this.stage.selection.bringToFront();
        }
        else if (eventType == "onSendToBack") {
            this.stage.selection.sendToBack();
        }
        else if (eventType == "onBringForward") {
            this.stage.selection.bringForward();
        }
        else if (eventType == "onSendBackward") {
            this.stage.selection.sendBackward();
        }
        else if (eventType == "onUndo") {
        }
        else if (eventType == "onRedo") {
        }
        else if (eventType == "onCut") {
            this.stage.selection.copyToClipboard(true);
        }
        else if (eventType == "onCopy") {
            this.stage.selection.copyToClipboard();
        }
        else if (eventType == "onPaste") {
            this.stage.selection.pasteFromClipboard();
        }
        else if (eventType == "onPointer") {
            this.app.eventMachine.enter("");
        }
        else if (eventType == "onLineTool") {
        }
        else if (eventType == "onStrokeStyle") {
        }
        else if (eventType == "onStrokeWidth") {
        }
        else if (eventType == "onStrokeColor") {
        }
        else if (eventType == "onShare") {
        }
        else if (eventType == "onTextColor") {
        }
        else if (eventType == "onFillColor") {
        }
        else if (eventType == "onInspector") {
        }
    }

    enter() {
        this.stage.cursor = "auto";
    }
}

