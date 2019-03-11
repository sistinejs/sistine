
const TouchModes = Sistine.Views.Handlers.TouchModes;
const TouchMode = Sistine.Views.Handlers.TouchMode;

function onGroupShapes() {
    theApp.stage.selection.group();
}

function onUngroupShapes() {
    theApp.stage.selection.ungroup();
}

function onBringToFront() {
    theApp.stage.selection.bringToFront();
}

function onSendToBack() {
    theApp.stage.selection.sendToBack();
}

function onBringForward() {
    theApp.stage.selection.bringForward();
}

function onSendBackward() {
    theApp.stage.selection.sendBackward();
}

function onZoomIn() {
    theApp.stage.setTouchContext(TouchModes.ZOOM_IN);
}

function onZoomOut() {
    theApp.stage.setTouchContext(TouchModes.ZOOM_OUT);
}

function onUndo() {
}

function onRedo() {
}

function onCut() {
    theApp.stage.selection.copyToClipboard(true);
}

function onCopy() {
    theApp.stage.selection.copyToClipboard();
}

function onPaste() {
    theApp.stage.selection.pasteFromClipboard();
}

function onPointer() {
    theApp.stage.setTouchContext();
}

function onHandTool() {
    theApp.stage.setTouchContext(TouchModes.HAND_TOOL);
}

function onLineTool() {
}

function onStrokeStyle() {
}

function onStrokeWidth() {
}

function onStrokeColor() {
}

function onShare() {
}

function onTextColor() {
}

function onFillColor() {
}

function onInspector() {
}
