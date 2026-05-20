//
// This is only a SKELETON file for the 'Linked List' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class LinkedList {
  // Constructor initializes an empty doubly linked list.
  // `head` points to the first node, `tail` to the last node.
  // `total` tracks how many nodes are in the list.
  constructor(head = null, tail = null) {
    this.head = head;
    this.tail = tail;
    this.total = 0;
  }
  // push(num) — Add a node to the END of the list.
  //   Example: list [2] -> push(5) -> list becomes [2, 5]
  push(num) {
    this.total++;

    // If the list is empty, the new node is both head and tail.
    if (this.head === null) {
      this.head = { value: num, next: null, prev: null };
      this.tail = this.head;
    }
    // Otherwise, link the new node after the current tail,
    // then update tail to point to the new node.
    else {
      let newNode = { value: num, next: null, prev: this.tail };
      this.tail.next = newNode; // old tail's "next" now points to new node
      this.tail = newNode;      // tail pointer moves to the new node
    }
  }

  // pop() — Remove and return the value from the END of the list.
  //   Example: list [2, 5] -> pop() returns 5, list becomes [2]
  pop() {
    if (this.tail == null) return undefined; // empty list, nothing to remove

    this.total--;
    let lastTail = this.tail;         // save reference to the node we're removing
    this.tail = lastTail.prev;        // move tail back one node

    // If the list is now empty (we removed the only node),
    // also set head to null. Otherwise, sever the link from
    // the new tail to the removed node.
    if (this.tail === null)
      this.head = null;
    else
      this.tail.next = null;

    return lastTail.value;
  }

  // shift() — Remove and return the value from the START of the list.
  //   Example: list [2, 5] -> shift() returns 2, list becomes [5]
  shift() {
    if (this.head === null) return undefined; // empty list, nothing to remove

    this.total--;
    let savedHead = this.head;         // save reference to the node we're removing
    this.head = savedHead.next;        // move head forward one node

    // If the list is now empty (we removed the only node),
    // also set tail to null. Otherwise, sever the link from
    // the new head back to the removed node.
    if (this.head === null)
      this.tail = null;
    else
      this.head.prev = null;

    return savedHead.value;
  }

  // unshift(num) — Add a node to the START of the list.
  //   Example: list [2, 5] -> unshift(8) -> list becomes [8, 2, 5]
  unshift(num) {
    this.total++;

    // If the list is empty, the new node is both head and tail.
    if (this.head === null) {
      this.head = { value: num, next: null, prev: null };
      this.tail = this.head;
    }
    // Otherwise, link the new node before the current head,
    // then update head to point to the new node.
    else {
      let newNode = { value: num, next: this.head, prev: null };
      this.head.prev = newNode;  // old head's "prev" now points to new node
      this.head = newNode;       // head pointer moves to the new node
    }
  }

  // delete(num) — Remove the FIRST node whose value matches `num`.
  // Walks through the list from head to tail looking for the value,
  // then handles three cases based on where the node is.
  delete(num) {
    let current = this.head;

    // Walk through the list node by node
    while (current !== null) {
      if (current.value == num) {
        this.total--;

        // Case 1: The node to delete is the head (first node).
        //   Move head forward. If list is now empty, also clear tail.
        if (current.prev === null) {
          this.head = current.next;
          if (this.head === null) this.tail = null;
          else this.head.prev = null;
        }
        // Case 2: The node to delete is the tail (last node).
        //   Move tail backward and sever the link.
        else if (current.next === null) {
          this.tail = current.prev;
          this.tail.next = null;
        }
        // Case 3: The node is in the middle.
        //   Bypass it by linking its neighbors directly to each other.
        //   Before: [A] <-> [B] <-> [C]   (deleting B)
        //   After:  [A] <---------> [C]
        else if (current.next !== null && current.prev !== null) {
          current.next.prev = current.prev;  // C's prev now points to A
          current.prev.next = current.next;  // A's next now points to C
        }
        return; // only delete the FIRST match, then stop
      }
      current = current.next; // move to the next node
    }
  }

  count() {
    return this.total;
  }
}
