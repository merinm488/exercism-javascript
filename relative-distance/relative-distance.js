export const degreesOfSeparation = (familyTree, personA, personB) => {
  // ============================================
  // PART 1: Build a connections map
  // ============================================
  // The family tree only gives parent → child direction.
  // We need EVERYONE to know who they connect to:
  //   - parent connects to children
  //   - child connects to parent
  //   - siblings connect to each other
  // ============================================

  let connections = {};

  for (let [parent, children] of Object.entries(familyTree)) {
    // Parent → Children (parent connects to all their children)
    connections[parent] = connections[parent] || [];
    connections[parent].push(...children);

    // Child → Parent + Siblings
    for (let child of children) {
      // Get all siblings (other children of the same parent, excluding current child)
      let siblings = children.filter(c => c !== child);

      // Child connects to their parent and all their siblings
      connections[child] = connections[child] || [];
      connections[child].push(parent, ...siblings);
    }
  }

  // ============================================
  // PART 2: Breadth-First Search (BFS)
  // ============================================
  // BFS finds the shortest path by exploring
  // layer by layer: distance 1 first, then 2, etc.
  // ============================================

  // Queue holds [person, distance] pairs
  // Start with personA at distance 0
  let queue = [[personA, 0]];

  // Set to track who we've already visited (prevents infinite loops)
  let visited = new Set();

  while (queue.length !== 0) {
    // Take the first person from the queue
    let [currentPerson, dist] = queue.shift();

    // Found the target! Return the distance
    if (currentPerson === personB) {
      return dist;
    }

    // Mark this person as visited so we don't check them again
    visited.add(currentPerson);

    // Look up who this person connects to
    let nextConnections = connections[currentPerson];

    // Add each unvisited connection to the queue with distance + 1
    for (let i = 0; i < nextConnections.length; i++) {
      if (visited.has(nextConnections[i])) {
        continue;
      } else {
        queue.push([nextConnections[i], dist + 1]);
      }
    }
  }

  // Queue is empty and we never found personB — no connection exists
  return -1;
};
