export interface Explanation {
  title: string;
  what: string;
  how: string[];
  why: string;
  applications: string[];
  time: string;
  space: string;
}

export const EXPLANATIONS: Record<string, Explanation> = {
  dijkstra: {
    title: "Dijkstra's algorithm",
    what: 'Finds the shortest path between two nodes in a graph with non-negative edge weights.',
    how: [
      'Keep a best-known distance for every node; start at 0 for the source.',
      'Repeatedly finalise the unvisited node with the smallest distance.',
      'Relax each outgoing edge: a shorter route replaces the stored distance.',
      'Stop when the destination is finalised, then walk predecessors back.',
    ],
    why: 'Road lengths are positive, so once a node is finalised its distance can never improve.',
    applications: ['GPS navigation', 'Network routing', 'Game pathfinding', 'Logistics planning'],
    time: 'O((V + E) log V)',
    space: 'O(V + E)',
  },
  bfs: {
    title: 'Breadth-first search',
    what: 'Explores a graph one layer at a time and finds the fewest-hop route from a start to a target.',
    how: [
      'Put the start node in a queue and mark it visited.',
      'Remove the front node, then enqueue each unvisited neighbour and record its predecessor.',
      'Stop when the target is discovered, then walk predecessors back to the start.',
    ],
    why: 'It guarantees the fewest number of hops to a target when edges are unweighted.',
    applications: ['Social connections', 'Web crawlers', 'Flood fill', 'Shortest hop routes'],
    time: 'O(V + E)',
    space: 'O(V)',
  },
  astar: {
    title: 'A* search',
    what: 'Finds the cheapest path on a grid by combining the cost already paid with an estimate of what remains.',
    how: [
      'Score each candidate as f = g + h, where g is the steps from the start and h is the Manhattan distance to the target.',
      'Pull the lowest-f cell from the priority queue and mark it visited.',
      'For each walkable neighbour, record a better g and f and push it into the frontier.',
      'Stop when the target is visited, then follow the recorded parents back to the start.',
    ],
    why: 'Because Manhattan distance never overestimates the real cost on a 4-way grid, the first visit to the target is guaranteed optimal.',
    applications: ['Game character movement', 'Route planning', 'Robot navigation', 'Puzzle solving'],
    time: 'O(V log V)',
    space: 'O(V)',
  },
  bubble: {
    title: 'Bubble sort',
    what: 'Repeatedly swaps adjacent items that are in the wrong order until a pass makes no swaps.',
    how: [
      'Walk through the array comparing each adjacent pair.',
      'Swap when the left item is larger than the right one.',
      'Each pass bubbles the largest remaining item to its final position.',
    ],
    why: 'It is the simplest sorting idea to reason about, even though it is slow.',
    applications: ['Teaching comparisons', 'Tiny nearly-sorted lists', 'Detecting if a list is sorted'],
    time: 'O(n²) worst, O(n) best',
    space: 'O(1)',
  },
  selection: {
    title: 'Selection sort',
    what: 'Finds the smallest item in the unsorted part and swaps it into the next position.',
    how: [
      'Scan the unsorted suffix for its minimum.',
      'Swap that minimum with the first unsorted position.',
      'Shrink the unsorted suffix by one and repeat.',
    ],
    why: 'It performs at most n swaps, which helps when writing to memory is expensive.',
    applications: ['Flash memory with limited writes', 'Simple embedded systems', 'Teaching min-selection'],
    time: 'O(n²)',
    space: 'O(1)',
  },
  insertion: {
    title: 'Insertion sort',
    what: 'Builds a sorted prefix by inserting each new item into its correct place.',
    how: [
      'Take the next item from the unsorted part.',
      'Shift larger sorted items one slot to the right.',
      'Drop the item into the gap and move on.',
    ],
    why: 'It is fast on small or nearly-sorted data and is used internally by hybrid sorts.',
    applications: ['Small arrays', 'Nearly-sorted feeds', 'TimSort / introsort internals'],
    time: 'O(n²) worst, O(n) best',
    space: 'O(1)',
  },
  merge: {
    title: 'Merge sort',
    what: 'Splits the array in half recursively, sorts each half, then merges the two sorted halves.',
    how: [
      'Divide the array until each piece has one item.',
      'Merge two sorted pieces by repeatedly taking the smaller front item.',
      'Continue upward until one sorted array remains.',
    ],
    why: 'Divide and conquer gives a predictable worst case, unlike quick sort.',
    applications: ['Stable sorting', 'External sorting', 'Linked lists', 'Parallel sorting'],
    time: 'O(n log n)',
    space: 'O(n)',
  },
  quick: {
    title: 'Quick sort',
    what: 'Picks a pivot, partitions items around it, then sorts the two partitions recursively.',
    how: [
      'Choose a pivot (this visualiser uses the last item).',
      'Move smaller items left and larger items right.',
      'Place the pivot at the boundary and recurse on both sides.',
    ],
    why: 'It sorts in place and is usually the fastest comparison sort in practice.',
    applications: ['General-purpose sorting', 'Database engines', 'Language runtimes'],
    time: 'O(n log n) average, O(n²) worst',
    space: 'O(log n) average',
  },
  stack: {
    title: 'Stack · last in, first out',
    what: 'A collection where the newest value is the only one you can remove. Think of a stack of plates.',
    how: [
      'Push places a value on top of the stack.',
      'Pop removes the value that was pushed most recently.',
      'Peek, size, isEmpty and isFull inspect the stack without changing it.',
      'Only the top is visible; everything below waits its turn.',
    ],
    why: 'Reversing order for free makes stacks ideal whenever the most recent work must be handled first.',
    applications: ['Undo / redo', 'Browser history', 'Function call stack', 'Expression parsing'],
    time: 'O(1) push, pop, peek, size and emptiness checks',
    space: 'O(n)',
  },
  queue: {
    title: 'Queue · first in, first out',
    what: 'A collection where the oldest value leaves first. Think of a line at a ticket counter.',
    how: [
      'Enqueue adds a value at the rear.',
      'Dequeue removes the value waiting at the front.',
      'Peek, size, isEmpty and isFull inspect the queue without changing it.',
      'Front and rear move inward as values leave and arrive.',
    ],
    why: 'Fairness: whoever arrived first is served first, with no value overtaking another.',
    applications: ['Print spoolers', 'BFS traversal', 'Message buffers', 'Call centre routing'],
    time: 'O(1) enqueue, dequeue, peek, size and emptiness checks',
    space: 'O(n)',
  },
};
