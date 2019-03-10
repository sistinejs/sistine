
import * as coreevents from "../Core/events";

export class ViewPortChanged extends coreevents.Event {
    constructor(oldOffsetX, oldOffsetY, newOffsetX, newOffsetY) {
        super("ViewPortChanged", null)
        this.oldOffsetX = oldOffsetX;
        this.oldOffsetY = oldOffsetY;
        this.newOffsetX = newOffsetX;
        this.newOffsetY = newOffsetY;
    }
}

export class ZoomChanged extends coreevents.Event {
    constructor(oldZoom, newZoom) {
        super("ZoomChanged", null)
        this.oldZoom = oldZoom;
        this.newZoom = newZoom;
    }
}

