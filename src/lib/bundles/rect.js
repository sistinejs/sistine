
import * as core from "../core"

export function create(configs) {
    return new Rectangle(configs);
}

export class Rectangle extends core.Shape {
    constructor(configs) {
        super(configs);
    }

    draw(ctx) {
        if (this.fillStyle) {
            ctx.fillRect(this.bounds.left, this.bounds.top, this.bounds.width, this.bounds.height);
        }
        if (this.lineWidth > 0) {
            ctx.strokeRect(this.bounds.left, this.bounds.top, this.bounds.width, this.bounds.height);
        }
    }
}

