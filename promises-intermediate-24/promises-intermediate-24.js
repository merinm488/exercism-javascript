// PROMISES INTERMEDIATE 24 — EVENT LOOP + STATEFUL PATTERNS
//
// This exercise targets the patterns that are TRICKIEST without careful study:
//   - The event loop: ordering of sync code, microtasks (.then), and macrotasks (setTimeout)
//   - Bounded caches (LRU eviction — no TTL, just size)
//   - Pool patterns with EARLY EXIT (stop spawning work once you have a winner)
//   - Stateful queues that stay correct when items arrive during processing
//   - Manual promise control (resolving from outside the constructor)
//
// All tasks can be solved with .then / .catch / new Promise(...) — NO async/await needed.
// In fact, you'll learn MORE by writing them without async/await, because you'll see
// exactly how the promise chain is wired together.
//
// Hints contain ONLY questions, never answers. If stuck, run the tests to see what
// behaviour is expected, then reason backwards from the assertion.

// =============================================================================
// TASK 1: predictOrder — predict the order of console.log output
// =============================================================================
//
// Below are 6 snippets. Each one logs some values via console.log. You must
// PREDICT the order in which the values get logged, and write your prediction
// as an array in the corresponding `predictionN` export.
//
// The rules you need to know (look these up in your own words if unsure):
//
//   1. SYNCHRONOUS code runs immediately, top to bottom. Nothing interrupts it.
//
//   2. PROMISE callbacks (.then / .catch / .finally) are MICROTASKS. They run
//      AFTER the current synchronous code finishes, but BEFORE any setTimeout.
//      Microtasks are processed FIFO (first-scheduled, first-run). And they are
//      "greedy": if a microtask schedules another microtask, that runs before
//      any macrotask (setTimeout) gets a turn.
//
//   3. setTimeout callbacks are MACROTASKS. They run AFTER all microtasks have
//      drained. Multiple setTimeout(fn, 0) callbacks run in the order they were
//      scheduled. setTimeout(fn, 50) waits at least 50ms before its callback runs.
//
//   4. INSIDE a callback (whether microtask or macrotask), the same rules apply:
//      sync code first, then microtasks, then macrotasks. Each callback is its
//      own little "turn" with the same internal ordering.
//
// The KEY skill: when you see a Promise.then, ask "does this .then's callback run
// NOW or LATER?" The answer is always LATER — even if the promise is already
// resolved. .then ALWAYS defers to the next microtask cycle.
//
// Work each snippet out on paper BEFORE writing your prediction. Don't guess.
//
// -----------------------------------------------------------------------------
// Snippet 1 — the classic: sync, microtask, macrotask
// -----------------------------------------------------------------------------
export function snippet1() {
  console.log('1');
  setTimeout(() => console.log('2'), 0);
  Promise.resolve().then(() => console.log('3'));
  console.log('4');
}

// Write the values in the order they will be logged:
export const prediction1 = ['1','4','3','2'];

// -----------------------------------------------------------------------------
// Snippet 2 — multiple independent microtasks queue FIFO
// -----------------------------------------------------------------------------
export function snippet2() {
  Promise.resolve().then(() => console.log('A'));
  Promise.resolve().then(() => console.log('B'));
  Promise.resolve().then(() => console.log('C'));
  console.log('D');
}

export const prediction2 = ['D','A','B','C'];

// -----------------------------------------------------------------------------
// Snippet 3 — chained .then vs separate .then (this is the tricky one)
// -----------------------------------------------------------------------------
//   A chained .then (p.then(f).then(g)) waits for f's promise before running g.
//   A separate .then on an already-resolved promise runs in the NEXT microtask.
//   So a chain of N .thens takes N microtask cycles; M separate .thens each take 1.
// -----------------------------------------------------------------------------
export function snippet3() {
  Promise.resolve()
    .then(() => console.log('A'))
    .then(() => console.log('B'))
    .then(() => console.log('C'));

  Promise.resolve().then(() => console.log('D'));
  Promise.resolve().then(() => console.log('E'));
}

export const prediction3 = ['A','D','E','B','C'];

// -----------------------------------------------------------------------------
// Snippet 4 — setTimeout with different delays
// -----------------------------------------------------------------------------
//   Macrotasks are processed in order of their SCHEDULED FIRE TIME, not their
//   creation order. setTimeout(fn, 0) fires before setTimeout(fn, 5) which fires
//   before setTimeout(fn, 10). Two setTimeout(fn, 0) calls fire in creation order.
// -----------------------------------------------------------------------------
export function snippet4() {
  setTimeout(() => console.log('A'), 10);
  setTimeout(() => console.log('B'), 0);
  setTimeout(() => console.log('C'), 5);
  setTimeout(() => console.log('D'), 0);
  console.log('E');
}

export const prediction4 = ['E','B','D','C','A'];

// -----------------------------------------------------------------------------
// Snippet 5 — a microtask inside a macrotask
// -----------------------------------------------------------------------------
//   When a setTimeout callback runs, it gets its own turn. Inside that turn,
//   sync code runs, then any microtasks it scheduled, before any other macrotask.
// -----------------------------------------------------------------------------
export function snippet5() {
  setTimeout(() => {
    console.log('A');
    Promise.resolve().then(() => console.log('B'));
  }, 0);

  Promise.resolve().then(() => console.log('C'));
  console.log('D');
}

export const prediction5 = ['D','C','A','B'];

// -----------------------------------------------------------------------------
// Snippet 6 — combination: nested microtasks + macrotasks
// -----------------------------------------------------------------------------
export function snippet6() {
  console.log('start');

  Promise.resolve().then(() => {
    console.log('A');
    setTimeout(() => console.log('B'), 0);
    Promise.resolve().then(() => console.log('C'));
  });

  setTimeout(() => {
    console.log('D');
    Promise.resolve().then(() => console.log('E'));
  }, 0);

  Promise.resolve().then(() => console.log('F'));
  console.log('end');
}

export const prediction6 = ['start','end','A','F','C','D','E','B'];

// =============================================================================
// TASK 2: memoizeLRU — cache with a MAX SIZE, evict least-recently-used
// =============================================================================
//
// You are given:
//   - fn(arg): a function returning a value (may be sync or async — treat as sync
//     for the cache key logic, but the value could be a promise)
//   - maxEntries: maximum number of entries the cache will hold
//
// Return a memoized function. Behaviour:
//   - On a call with a NEW arg: call fn(arg), cache the result.
//   - On a call with an EXISTING arg: return cached result (do NOT call fn).
//   - If adding a new entry would exceed maxEntries: evict the LEAST RECENTLY
//     USED entry first, then add the new one.
//
// "Recently used" means either READ or WRITTEN. Both operations refresh an
// entry's position as most-recently-used.
//
// Example with maxEntries = 2:
//   let calls = 0;
//   const fn = (x) => { calls++; return x * 10; };
//   const m = memoizeLRU(fn, 2);
//
//   m(1);  // miss → call fn, calls=1.  Cache order (oldest→newest): [1]
//   m(2);  // miss → call fn, calls=2.  Cache order: [1, 2]
//   m(1);  // HIT (no fn call). 1 is now most-recently-used. Cache order: [2, 1]
//   m(3);  // miss, cache full → evict 2 (oldest). call fn, calls=3. Cache: [1, 3]
//   m(2);  // miss (2 was evicted) → call fn, calls=4. Evict 1. Cache: [3, 2]
//
// WHY THIS MATTERS:
//   TTL caches expire by TIME. LRU caches expire by USAGE PATTERNS. LRU is the
//   standard pattern when memory is bounded (e.g. browser image caches, HTTP
//   response caches with a size cap).
//
// QUESTIONS TO GUIDE YOU (no answers, just the right questions):
//
//   Q1. In exercise 23 Task 2, you used `new Map()` keyed by argument. Maps have
//       a special property that makes LRU implementation clean: ITERATION ORDER.
//       Look up "Map iteration order" on MDN. What does Map iterate in?
//
//   Q2. To "refresh" an entry's position in a Map (move it to most-recently-used),
//       what two operations do you need? Hint: setting a key that ALREADY EXISTS
//       in the Map does NOT update its insertion order — you must do something else.
//
//   Q3. To evict the LEAST recently used entry, you need to find the "first" entry
//       in iteration order. What method gives you the first [key, value] pair of
//       a Map? (Look up `Map.prototype.entries` or the iterator returned by
//       `for...of` on a Map.) There's also a one-liner using spread: `[...cache][0]`.
//
//   Q4. What does `cache.size` tell you? How do you use it to decide when to evict?
//
//   Q5. Should the value you store be the result of fn(arg), or fn(arg) wrapped
//       in something? Think about exercise 23: caching the PROMISE vs the value.
//       For this task, caching the raw result is fine — but if fn is async, what
//       happens if you cache a promise? (You don't have to handle this specially;
//       just be aware.)

export function memoizeLRU(fn, maxEntries) {
  let cache = new Map()
  return function(arg){
    if(cache.has(arg)){
      let recent = cache.get(arg)
      cache.delete(arg)
      cache.set(arg,recent)
      return recent
    }
    if(cache.size < maxEntries)
    {
      const result = fn(arg)
      cache.set(arg,result)
      return result
    }
    else{
      cache.delete(cache.keys().next().value)
      cache.set(arg,fn(arg))
      return cache.get(arg)
    }
  }
}


// =============================================================================
// TASK 3: poolFirstAsync — concurrency-limited search, FIRST match wins
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - predicate(item): an async function returning TRUTHY or FALSY
//   - limit: max concurrent operations
//
// Run predicate on items with at most `limit` in flight. As soon as ONE predicate
// returns truthy, RESOLVE with that item and STOP spawning new work. If no item
// passes, resolve with undefined.
//
// This is HARDER than filterPoolAsync because:
//   - You must short-circuit: once a winner is found, no more items get tested.
//   - Workers need a way to know "we're done, stop pulling more items".
//   - You need to use the `new Promise((resolve, reject) => { ... })` constructor
//     because you're calling resolve() from inside worker callbacks.
//
// Example:
//   poolFirstAsync([1,2,3,4,5,6], async n => n > 3, 2)
//     // Worker tests 1 (false), 2 (false), 3 (false), 4 (TRUE) → resolve with 4
//     // Does NOT test 5 or 6.
//     => 4
//
//   poolFirstAsync([], predicate, 3) => undefined
//
//   poolFirstAsync([1,2,3], async n => false, 2) => undefined
//
// QUESTIONS TO GUIDE YOU:
//
//   Q1. Unlike mapPoolAsync (which returned Promise.all(lanes)), here you don't
//       want to wait for ALL workers — you want to resolve as soon as ONE finds
//       a winner. That means you CAN'T use Promise.all on the outside. What's
//       the alternative? (Hint: it starts with `new Promise(...)`.)
//
//   Q2. Inside the Promise constructor, you call resolve(item) when a winner is
//       found. But workers are recursive — they keep pulling items off the queue.
//       How does a worker KNOW to stop? You need a shared flag. What would you
//       call it?
//
//   Q3. There are TWO reasons a worker should stop pulling more items:
//       (a) The queue is empty (nextIndex >= items.length)
//       (b) Some other worker found a winner (your shared flag)
//       How do you check both at the top of each iteration?
//
//   Q4. When ALL workers finish WITHOUT finding a winner, you must resolve with
//       undefined. How do you detect "all workers finished, no winner"? One way:
//       count completed items and compare to items.length. Another way: Promise.all
//       the workers (they all complete normally) and resolve(undefined) in its
//       .then. Either works. Which fits your structure?
//
//   Q5. Subtle: once resolve() is called, the outer promise is LOCKED. Calling
//       resolve() again is a no-op. So you don't strictly NEED the shared flag
//       for correctness — the result will be right. But you DO need it for
//       EFFICIENCY (to stop doing unnecessary work). Why does this matter?

export function poolFirstAsync(items, predicate, limit) {
  return new Promise((resolve) => {
    let nextIndex = 0;

    const runBatch = () => {
      // Queue exhausted with no winner → resolve undefined.
      if (nextIndex >= items.length) {
        resolve(undefined);
        return;
      }

      // Slice the next `limit` items (or fewer if near the end).
      const batch = items.slice(nextIndex, nextIndex + limit);
      nextIndex += batch.length;

      // Run predicate on every item in the batch concurrently.
      // Promise.resolve() normalises sync vs async predicate returns.
      const checks = batch.map((item) =>
        Promise.resolve(predicate(item)).then(
          (isMatch) => ({ item, isMatch }),
        )
      );

      // Wait for the ENTIRE batch. Then scan in item order for the first match.
      Promise.all(checks).then((results) => {
        for (const { item, isMatch } of results) {
          if (isMatch) {
            resolve(item);    // first match in this batch wins
            return;           // stop scanning, don't pull next batch
          }
        }
        runBatch();           // no winner — pull the next batch
      });
    };

    runBatch();
  });
}


// =============================================================================
// TASK 4: createSequentialQueue — chain work that arrives over time
// =============================================================================
//
// Returns an object with a single method:
//   enqueue(item, fn) -> Promise
//     - Submits (item, fn) to the queue.
//     - Returns a promise that resolves with fn(item)'s result.
//     - fn may be sync or async (return a value or a promise).
//
// The queue processes items STRICTLY IN ORDER OF ENQUEUEMENT, ONE AT A TIME.
// Even if 10 items are enqueued in the same tick, fn is called on item 1 first,
// and fn is NOT called on item 2 until item 1's promise resolves.
//
// THE TRICKY PART: items can be enqueued WHILE previous items are still being
// processed. The queue must correctly chain the new item BEHIND all existing work.
//
// Example:
//   const q = createSequentialQueue();
//   q('a', asyncFn).then(console.log);   // starts immediately
//   q('b', asyncFn).then(console.log);   // chained behind a
//   q('c', asyncFn).then(console.log);   // chained behind b
//   // Even if asyncFn takes 100ms each, 'a' resolves first, then 'b', then 'c'.
//   // Total time: ~300ms (sequential).
//
// USE CASE: you have an API that doesn't tolerate concurrent calls (e.g. a
// stateful server, a database transaction). All requests must be serialized.
//
// QUESTIONS TO GUIDE YOU:
//
//   Q1. The queue needs to remember "what's currently being processed" so that
//       the next enqueue can chain AFTER it. What data structure holds "the
//       promise representing all work scheduled so far"?
//
//   Q2. When a new item is enqueued, you need to:
//       (a) Compute fn(item) — but only when the previous chain finishes.
//       (b) Make the chain "longer" so the NEXT enqueue goes after this one.
//       What pattern transforms `currentChainPromise` into
//       `currentChainPromise.then(() => fn(item))`?
//
//   Q3. The promise returned to the CALLER of enqueue should resolve with fn(item)'s
//       result, NOT with the entire chain's result. So you need TWO things:
//         - Update the internal chain (so future items wait).
//         - Return a SEPARATE promise that resolves with just THIS item's result.
//       Hint: inside the .then(() => fn(item)) callback, fn(item)'s result is
//       available. How do you "split" it — feed it both to the chain AND to the
//       caller's promise? You might use Promise.resolve + .then, or you might
//       structure the chain so its .then returns fn(item)'s promise.
//
//   Q4. What's the EMPTY queue state? Before any enqueue is called, what does
//       your "current chain" variable hold? (Hint: it should be a promise that's
//       already resolved, so the first enqueue's .then runs immediately.)
//
//   Q5. If fn(item) REJECTS, what happens? Two choices:
//       (a) The chain breaks — no subsequent items ever run.
//       (b) The chain continues — the rejection is "swallowed" for chaining
//           purposes but propagated to the caller's promise.
//       Which behaviour is more useful for a sequential queue? (Think: if one
//       database query fails, should the rest of the queue be abandoned?)
//       Implement (b) — catch the error for chaining, but propagate to the caller.

export function createSequentialQueue() {
  // The KEY data structure: `tail` — a promise representing "all work scheduled
  // so far". Every new enqueue chains AFTER `tail`, then updates `tail` to point
  // to the new (longer) chain end. This is what lets items arrive DURING
  // processing and still queue up correctly.
  //
  // Initial value is Promise.resolve() so the FIRST enqueue's .then fires
  // immediately (nothing to wait for).
  let tail = Promise.resolve();

  // The tests call `q(item, fn)` directly — so we return a callable FUNCTION,
  // not an object literal. (Functions ARE objects in JS, so this is fine.)
  const enqueue = (item, fn) => {
    // We need to return a SEPARATE promise to the caller that resolves with
    // fn(item)'s result — NOT the whole chain's result. So we create a
    // "deferred": a promise + its captured resolver, controlled from outside.
    let resolveCaller;
    let rejectCaller;
    const callerPromise = new Promise((resolve, reject) => {
      resolveCaller = resolve;
      rejectCaller = reject;
    });

    // Chain fn(item) AFTER the current tail. Two outcomes to handle:
    //   - fn(item) resolves → feed result to caller's promise, chain continues
    //   - fn(item) rejects  → propagate rejection to caller's promise, BUT
    //     swallow it for chaining so subsequent items still run (behaviour b).
    tail = tail
      .then(() => Promise.resolve(fn(item)))   // wait for prev, then run fn(item)
      .then(
        (result) => {
          resolveCaller(result);   // caller gets fn(item)'s result
          // No explicit return → returns undefined → chain stays "resolved"
        },
        (err) => {
          rejectCaller(err);       // caller sees the error
          // No re-throw → chain stays "resolved" → next item still runs.
          // (If we re-threw or returned Promise.reject, the chain would break
          //  and no subsequent items would ever execute.)
        }
      );

    return callerPromise;
  };

  return enqueue;
}


// =============================================================================
// TASK 5: createLatch — a countdown latch (manual promise control)
// =============================================================================
//
// You are given:
//   - initialCount: a positive integer
//
// Return an object with TWO methods:
//   wait() -> Promise
//     Returns a promise that resolves when the latch count reaches 0.
//     Can be called multiple times — every caller's promise resolves when count hits 0.
//
//   countDown(n = 1) -> void
//     Decrements the count by n. If the count reaches 0 (or below), all pending
//     wait() promises resolve.
//
// USE CASE: wait for N async operations to complete before proceeding, where the
// operations are started by various parts of the code and you don't have references
// to their promises. Like Promise.all, but the promises aren't gathered upfront —
// you just know "N things need to call countDown()".
//
// Example:
//   const latch = createLatch(3);
//   latch.wait().then(() => console.log('all done!'));
//   // ... elsewhere in the code:
//   fetch('/a').then(() => latch.countDown());  // count: 2
//   fetch('/b').then(() => latch.countDown());  // count: 1
//   fetch('/c').then(() => latch.countDown());  // count: 0 → "all done!" logs
//
//   // Calling wait() AFTER count is already 0 resolves immediately:
//   latch.wait().then(() => console.log('late subscriber also resolves'));
//
// QUESTIONS TO GUIDE YOU:
//
//   Q1. You need to manually RESOLVE a promise from OUTSIDE its constructor.
//       The new Promise((resolve, reject) => { ... }) pattern captures resolve
//       inside the constructor — you can't call it from outside.
//       The fix: SAVE resolve to a variable declared OUTSIDE the constructor:
//
//         let resolveFn;
//         const p = new Promise((resolve) => { resolveFn = resolve; });
//         // ... later, from anywhere:
//         resolveFn();   // resolves p
//
//       This is called the "deferred pattern" or "externally-resolvable promise".
//       It's the standard way to manually control a promise.
//
//   Q2. If wait() can be called MULTIPLE TIMES, and all waiters must resolve
//       when count hits 0, you have two options:
//         (a) Store an ARRAY of {promise, resolve} pairs; on count==0, call
//             each saved resolve.
//         (b) Have a SINGLE shared promise + resolve; all wait() calls return
//             the SAME promise.
//       Option (b) is simpler. Why does returning the same promise to all callers
//       work? (Hint: promises are immutable; multiple .then on the same promise
//       all fire when it resolves.)
//
//   Q3. If count is ALREADY 0 when wait() is called, what should happen? Trace
//       through option (b): if you return a promise that's ALREADY resolved, its
//       .then runs on the next microtask. Does that match "resolves immediately"?
//
//   Q4. When countDown decrements count to 0, you call your saved resolveFn().
//       But what if countDown is called AGAIN after that (count goes negative)?
//       Calling resolveFn() again is a no-op (promise is locked). Is that the
//       behaviour you want? (Probably yes — but be aware of it.)
//
//   Q5. What's the empty/zero-count case? If createLatch(0) is called, should
//       wait() resolve immediately on the first call? Trace through your code
//       to confirm.

export function createLatch(initialCount) {
  // The "deferred pattern": capture `resolve` from the Promise constructor so we
  // can trigger it later from countDown(). All wait() callers share ONE promise
  // (option b from the hints) — simpler than tracking an array of waiters, and
  // works because promises are immutable: multiple .then() on the same promise
  // all fire when it resolves.
  let count = initialCount;
  let resolveFn;
  const pending = new Promise((resolve) => {
    resolveFn = resolve;
    // Edge case: createLatch(0) should resolve on the first wait().
    // Resolve immediately inside the constructor so `pending` is born resolved.
    if (initialCount <= 0) {
      resolve();
    }
  });

  return {
    // Every caller gets the SAME promise. If it's already resolved (count hit 0
    // earlier), .then fires on the next microtask — still "async immediate".
    wait() {
      return pending;
    },

    // Decrement by n (default 1). When count reaches 0 OR goes negative, resolve
    // the shared promise. Calling resolveFn() after it's already resolved is a
    // safe no-op — the promise is locked to its first resolution.
    countDown(n = 1) {
      count -= n;
      if (count <= 0) {
        resolveFn();
      }
    },
  };
}
