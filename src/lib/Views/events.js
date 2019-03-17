
import * as events from "../Core/events";

export class ViewPortChanged extends events.Event {
    constructor(oldOffsetX, oldOffsetY, newOffsetX, newOffsetY) {
        super();
        this.oldOffsetX = oldOffsetX;
        this.oldOffsetY = oldOffsetY;
        this.newOffsetX = newOffsetX;
        this.newOffsetY = newOffsetY;
    }
}

export class ZoomChanged extends events.Event {
    constructor(oldZoom, newZoom) {
        super();
        this.oldZoom = oldZoom;
        this.newZoom = newZoom;
    }
}

