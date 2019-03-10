
const TouchModes = Sistine.Views.Handlers.TouchModes;
const TouchMode = Sistine.Views.Handlers.TouchMode;

function onGroupShapes() {
    theStage.selection.group();
}

function onUngroupShapes() {
    theStage.selection.ungroup();
}

function onBringToFront() {
    theStage.selection.bringToFront();
}

function onSendToBack() {
    theStage.selection.sendToBack();
}

function onBringForward() {
    theStage.selection.bringForward();
}

function onSendBackward() {
    theStage.selection.sendBackward();
}

function onZoomIn() {
    theStage.setTouchContext(TouchModes.ZOOM_IN);
}

function onZoomOut() {
    theStage.setTouchContext(TouchModes.ZOOM_OUT);
}

function onUndo() {
}

function onRedo() {
}

function onCut() {
    theStage.selection.copyToClipboard(true);
}

function onCopy() {
    theStage.selection.copyToClipboard();
}

function onPaste() {
    theStage.selection.pasteFromClipboard();
}

function onPointer() {
    theStage.setTouchContext();
}

function onHandTool() {
    theStage.setTouchContext(TouchModes.HAND_TOOL);
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
