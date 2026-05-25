//
// This is only a SKELETON file for the 'Binary Search Tree' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

// Each node in a BST stores:
// - root: the value of this node
// - _left: reference to left child node (values <= root), or null
// - _right: reference to right child node (values > root), or null
//
// Underscore prefix (_left, _right) avoids naming conflict with the getters.
// If we named the property "left" and the getter "left", calling this.left
// inside the getter would trigger infinite recursion.
export class BinarySearchTree {
  constructor(root) {
    this.root = root;
    this._left = null;
    this._right = null;
  }

  // Getters return the stored values — data returns the number,
  // left/right return the child nodes (or null if no child exists)
  get data() {
    return this.root;
  }
  get right() {
    return this._right;
  }

  get left() {
    return this._left;
  }

  // Inserts a value into the correct position in the tree
  // Rule: values <= current node go left, values > current node go right
  // If the child slot is empty, create a new BST node there
  // If the child slot is taken, recursively call insert on that child
  insert(value) {
    if (value <= this.root) {
      if (this._left == null)
        this._left = new BinarySearchTree(value);
      else
        this._left.insert(value);
    }
    else {
      if (this._right == null)
        this._right = new BinarySearchTree(value);
      else
        this._right.insert(value);
    }
  }

  // In-order traversal: visits nodes in ascending (sorted) order
  // Order: left subtree → current node → right subtree
  // Calls the callback function with each node's value
  each(callback) {
    if (this._left != null)
      this._left.each(callback);
    callback(this.root);
    if (this._right != null)
      this._right.each(callback);
  }
}
