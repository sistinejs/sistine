
export class DList {
    constructor() {
        this._head = this._tail = null;
        this._count = 0;
    }

    get head() { return this._head; } 
    get tail() { return this._tail; } 
    get count() { return this._count; }

    add(node) {
        node.next = node.prev = null;
        if (this._head == null) {
            this._head = this._tail = node;
        } else {
            this._tail.next = node;
            node.prev = this._tail;
            this._tail = node;
        }
        this._count ++;
        return this;
    }

    remove(node) {
        var prev = node.prev;
        var next = node.next;
    }
}
