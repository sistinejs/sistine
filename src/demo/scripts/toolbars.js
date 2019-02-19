
function setupHeaderToolbar() {
    $("#zoom_option").selectmenu({ width : 100 });
    var toolbar_buttons = $(".toolbar_button");
    toolbar_buttons.each(function(index, tbbutton) {
        var $tbbutton = $(tbbutton);
        var label = $tbbutton.text();
        $tbbutton.empty()
        $tbbutton.attr("title", label);

        var buttonId = tbbutton.id.replace(/TB_/, "");
        var iconId = "tb_icon_" + buttonId;
        var buttonImage = $("<img src = '" + "./src/demo/icons/" + buttonId + ".png' />");
        $tbbutton.button({
            iconPosition: "top"
        }).append(buttonImage);
        Sistine.utils.dom.fillChildComponent(buttonImage);
        $tbbutton.click(eval("on" + buttonId));
    });
}

function onGroupShapes() {
}

function onUngroupShapes() {
}

function onBringToFront() {
}

function onSendToBack() {
}

function onBringForward() {
}

function onSendBackward() {
}

function onZoomIn() {
}

function onZoomOut() {
}

function onUndo() {
}

function onRedo() {
}

function onCut() {
}

function onCopy() {
}

function onPaste() {
}

function onPointer() {
}

function onHandTool() {
}

function onLineTool() {
}

function onLineWidth() {
}

function onShare() {
}

