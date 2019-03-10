
class ListNode {
    constructor(value) {
        this.value = value || null;
        this.next = this.prev = null;
    }
}

class DList {
    constructor() {
        this.head = this.tail = null;
    }

    remove(node) {
        var prev = node.prev;
        var next = node.next;
    }
}
