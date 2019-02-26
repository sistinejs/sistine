
export const DefaultCursorMap = {
    rotate: 'url("./assets/cursors/rotate.png")',
}

for (var i = 0;i < 360;i++) {
    DefaultCursorMap["resize_" + i] = 'url("./assets/cursors/resize_' + i + '.png")'
}
