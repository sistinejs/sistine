
type Int = number;

interface DListNode<T> {
    next? : DListNode<T> | null;
    prev? : DListNode<T> | null;
}

export class DList<T> {
    private _head : DListNode<T> | null = null;
    private _tail : DListNode<T> | null = null;
    private _count : Int = 0;

    get head() { return this._head; }
    get tail() { return this._tail; }
    get count() { return this._count; }

    add(node : DListNode<T>) {
        node.next = node.prev = null;
        if (this._head == null || this._tail == null) {
            this._head = this._tail = node;
        } else {
            this._tail.next = node;
            node.prev = this._tail;
            this._tail = node;
        }
        this._count ++;
        return this;
    }

    remove(node : DListNode<T>) {
        var prev = node.prev;
        var next = node.next;
    }
}
