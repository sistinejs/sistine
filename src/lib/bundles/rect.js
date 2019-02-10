
class Rectangle extends Shape {
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

class Square extends Shape {
    constructor(configs) {
        super(configs);
        var size = Math.min(this.bounds.width, this.bounds.height);
        this.bounds._width = this.bounds._height = size;
    }

    draw(ctx) {
        var size = Math.min(this.bounds.width, this.bounds.height);
        var left = (this.bounds.left + this.bounds.right - size) / 2;
        var top = (this.bounds.top + this.bounds.bottom - size) / 2;
        if (this.fillStyle) {
            ctx.fillRect(left, top, size, size);
        }
        if (this.lineWidth > 0) {
            ctx.strokeRect(left, top, size, size);
        }
    }
}
