
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
    theApp.eventMachine.enter("zoomingVP", "zoomin");
}

function onZoomOut() {
    theApp.eventMachine.enter("zoomingVP", "zoomout");
}

function onHandTool() {
    theApp.eventMachine.enter("panningVP", "");
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
    theApp.eventMachine.enter("");
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
