// PROMISES INTERMEDIATE 22 - Practice Exercise
//
// THEME: Concurrency control, caching, and combining patterns.
// Each task introduces a new idea that goes one step beyond exercise 21:
//   - Pooling (limit how many run at once)
//   - Memoization (cache async results)
//   - Batching (combine parallel + sequential)
//   - First-fulfilled (different from race)
//   - Per-item timeouts
//   - Leading-edge debounce (inverse of trailing debounce)
//

// =============================================================================
// TASK 1: mapPoolAsync — map with a CONCURRENCY LIMIT
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function returning a value
//   - limit: maximum number of CONCURRENT in-flight operations
//
// Run fn on every item, but never have more than `limit` operations running
// at the same time. Return the results in the SAME ORDER as the input items.
//
// This is the key limitation of Promise.all: if items.length is 10,000, calling
// Promise.all(items.map(fn)) fires 10,000 operations at once — overwhelming
// databases, APIs, or memory. mapPoolAsync lets you process them in a controlled
// pool of size `limit`.
//
// Example:
//   // With limit = 2 and 5 items, at any moment at most 2 calls are running.
//   // When one finishes, the next one starts.
//   mapPoolAsync([1, 2, 3, 4, 5], n => Promise.resolve(n * 10), 2)
//     => [10, 20, 30, 40, 50]
//
//   mapPoolAsync([], fn, 3) => []
//
//   // Edge case: limit larger than items.length — just runs everything at once
//   mapPoolAsync([1, 2], n => Promise.resolve(n), 10) => [1, 2]
//
// HINT:
//   The trick is to spawn `limit` "workers" that each pull the next available
//   item off a shared index counter. Think of it like a queue served by N workers.
//
//   Pseudocode:
//     1. Pre-allocate a results array of the same length as items
//     2. Use a shared index counter: let nextIndex = 0
//     3. Define an inner worker function that:
//          - If nextIndex >= items.length, return (nothing left to do)
//          - Otherwise: grab myIndex = nextIndex, increment nextIndex,
//            call fn(items[myIndex]), store the result at results[myIndex],
//            then RECURSIVELY call worker() to pick up the next item.
//     4. Spawn `min(limit, items.length)` workers and Promise.all them.
//     5. After Promise.all resolves, return results.
//
//   Why this works: each worker stays busy pulling items off the queue until
//   the queue is empty. With N workers, at most N items are in flight at once.
//   The shared `nextIndex` ensures each item is processed exactly once.

export function mapPoolAsync(items, fn, limit) {
  let result = new Array(items.length);
  function helper(index){
    return fn(items[index]).then(value => {
      result[index] = value
      if(index+limit < items.length)
        return helper(index + limit)
    })
  }
  
  let lanes = [];
  for(let i=0; i< Math.min(limit,items.length); i++)
  {
    lanes.push(helper(i))
  }
  return Promise.all(lanes).then(() => {return result})
  
}

// =============================================================================
// TASK 2: memoizeAsync — cache the results of an async function
// =============================================================================
//
// You are given:
//   - fn(arg): an async function returning a value
//   - keyFn(arg): OPTIONAL function returning a cache key (default: arg itself)
//
// Return a NEW function with the same behaviour as fn, but if called again with
// the same argument, return the CACHED result (the same promise) instead of
// calling fn again.
//
// This is the async version of memoization. It's crucial for async functions
// because re-fetching the same resource is wasteful (extra API calls, latency).
// Even if fn is called 10 times with the same arg, fn should only execute ONCE.
//
// Example:
//   let callCount = 0;
//   const fetchUser = (id) => {
//     callCount++;
//     return Promise.resolve({ id, name: 'User ' + id });
//   };
//   const memoized = memoizeAsync(fetchUser);
//
//   await memoized(1);  // fn called, callCount = 1
//   await memoized(1);  // CACHED, callCount stays at 1
//   await memoized(2);  // fn called, callCount = 2
//   await memoized(1);  // CACHED, callCount stays at 2
//
//   // With a custom keyFn (e.g. for objects):
//   const m2 = memoizeAsync(fetchUser, user => user.id);
//
// HINT:
//   Two ingredients: a CLOSURE (to remember the cache) and a MAP (to store
//   arg → promise). Cache the PROMISE itself, not just the resolved value —
//   that way concurrent calls for the same arg share one fn invocation.
//
//   Structure:
//     1. const cache = new Map()
//     2. Return a function(arg) that:
//          a. Compute the key: keyFn ? keyFn(arg) : arg
//          b. If cache.has(key), return cache.get(key) — do NOT call fn
//          c. Otherwise: call fn(arg), store the RESULTING PROMISE in the cache
//             (before it resolves!), and return that same promise.
//
//   Why cache the promise, not the value? If two calls arrive for the same
//   arg before the first fn(arg) resolves, both should share ONE fn call.
//   Storing the promise (set immediately, before .then) achieves this.

export function memoizeAsync(fn, keyFn) {
  let cache = new Map()
  return function(arg){
    const key = keyFn? keyFn(arg) : arg
    if(cache.has(key))
      return cache.get(key)
    cache.set(key, fn(arg))
    return cache.get(key)  
  }
}

// =============================================================================
// TASK 3: chunkedMapAsync — process items in BATCHES (sequential outer, parallel inner)
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function returning a value
//   - chunkSize: how many items to process per batch
//
// Split `items` into consecutive chunks of size `chunkSize`. Process each chunk
// IN PARALLEL (all items in the chunk at once), but process the CHUNKS
// SEQUENTIALLY — wait for one chunk to finish before starting the next.
//
// Return all results concatenated in original order.
//
// This is useful for APIs that allow batching: you can fetch 10 records at a
// time, but want to fetch them in chunks of 10 rather than all 1000 at once.
//
// Example:
//   chunkedMapAsync([1, 2, 3, 4, 5, 6, 7], n => Promise.resolve(n * 2), 3)
//     // Chunks: [1,2,3], [4,5,6], [7]
//     // Chunk 1 runs in parallel: [2, 4, 6]
//     // Then chunk 2: [8, 10, 12]
//     // Then chunk 3: [14]
//     => [2, 4, 6, 8, 10, 12, 14]
//
//   chunkedMapAsync([], fn, 3) => []
//   chunkedMapAsync([1, 2], fn, 5) => [...]; // chunkSize > items.length
//
// HINT:
//   Two stages:
//   Stage 1: Build the chunks. A loop that slices items into groups:
//     for (let i = 0; i < items.length; i += chunkSize) {
//       chunks.push(items.slice(i, i + chunkSize));
//     }
//
//   Stage 2: Process chunks SEQUENTIALLY using the reduce + .then pattern
//   (the same one you used in scanAsync / flatMapSequential). The accumulator
//   is a flat array of results that grows by [...acc, ...chunkResults] at
//   each step. Inside each step:
//     - Run all items in the current chunk in parallel: Promise.all(chunk.map(fn))
//     - Spread the chunk's results into the accumulator
//
//   The chunking is the new bit; the sequential pattern you already know.

export function chunkedMapAsync(items, fn, chunkSize) {
  let chunks = []
  for(let i=0; i<items.length;i+=chunkSize)
  {
    chunks.push(items.slice(i,i+chunkSize))
  }
  return chunks.reduce((promise,curr) => {
    return promise.then(value => {
      return Promise.all(curr.map(fn)).then(r => [...value,...r])
    })
  },Promise.resolve([]))
}

// =============================================================================
// TASK 4: anyAsync — resolve with the FIRST FULFILLED result
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function returning a value (may REJECT)
//
// Run fn on ALL items IN PARALLEL. As soon as ONE fn call FULFILLS, resolve
// with its value. Only REJECT if ALL calls reject.
//
// CRUCIAL DIFFERENCE from Promise.race: race resolves/rejects with the first
// SETTLED promise (whether fulfilled OR rejected). anyAsync ignores rejections
// until one fulfills — it only rejects if EVERY call rejects.
//
// This is the pattern for "ask several mirrors, take whichever responds first
// with a valid answer." For example: querying 3 cache servers; if any returns
// the data, use it; only fail if all 3 are down.
//
// Example:
//   anyAsync([1, 2, 3], n => Promise.resolve(n * 10))
//     => 10  (the first fulfilled value; order isn't guaranteed but all resolve)
//
//   anyAsync([1, 2, 3], n => n === 2 ? Promise.resolve(n) : Promise.reject('no'))
//     => 2  (item 1 rejected, item 2 fulfilled first)
//
//   anyAsync([1, 2, 3], n => Promise.reject('fail'))
//     => REJECTS with an AggregateError-like error (all rejected)
//
//   anyAsync([], fn) => REJECTS (no items means no chance of fulfilment)
//
// HINT:
//   You are building Promise.any by hand. Use the manual new Promise(...)
//   constructor and track rejections:
//
//     return new Promise((resolve, reject) => {
//       const promises = items.map(fn);
//       let rejectionCount = 0;
//       promises.forEach(p => {
//         p.then(resolve);              // first fulfilment wins
//         p.catch(() => {
//           rejectionCount++;
//           if (rejectionCount === promises.length) {
//             reject(new Error('All promises rejected'));
//           }
//         });
//       });
//     });
//
//   Two subtle points:
//     - Once resolve() is called, the promise is locked — subsequent resolve()
//       calls are ignored. So you can safely call it on EVERY fulfilment.
//     - For the empty array case: rejectionCount === 0 === promises.length,
//       so the forEach body never runs and the promise never settles. Handle
//       this case explicitly: if items.length === 0, reject immediately.

export function anyAsync(items, fn) {
  let failed = 0;
  return new Promise((resolve,reject) => {
    if(items.length == 0)
    {
      reject(new Error('All promises rejected'))
      return;
    }
    let promises = items.map(fn)
    promises.forEach(element => {
      element.then(resolve).catch(() => {
        failed++
        if(failed == items.length)
          reject(new Error('All promises rejected'))
      })
    });
  })
}

// =============================================================================
// TASK 5: mapWithTimeoutAsync — parallel map where each call auto-rejects on timeout
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function returning a value
//   - ms: timeout in milliseconds per item
//
// Run fn on ALL items IN PARALLEL. Each call must FULFILL within `ms`
// milliseconds. If ANY call takes longer than `ms`, the WHOLE map REJECTS
// with a timeout error. Otherwise resolves with all results in order.
//
// Use case: you're making API calls and want to fail fast if any single call
// hangs, rather than waiting indefinitely.
//
// Example:
//   // All fast calls — resolves
//   mapWithTimeoutAsync([1, 2, 3], n => Promise.resolve(n * 2), 1000)
//     => [2, 4, 6]
//
//   // One slow call — rejects with Error('Timeout')
//   mapWithTimeoutAsync([1, 2, 3],
//     n => n === 2 ? new Promise(r => setTimeout(() => r(n), 50)) : Promise.resolve(n),
//     10)  // 10ms timeout, but item 2 takes 50ms
//     => REJECTS
//
// HINT:
//   Two pieces combined: a per-item timeout helper + Promise.all.
//
//   Step 1: Write a helper that races a promise against a rejection timer:
//     function withTimeout(promise, ms) {
//       return Promise.race([
//         promise,
//         new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
//       ]);
//     }
//   You did something similar in exercise 18's timeoutPromise.
//
//   Step 2: map each item through withTimeout(fn(item), ms), then Promise.all.
//   If any per-item promise rejects (either because fn threw OR the timer
//   fired first), Promise.all rejects and the whole map fails.

export function mapWithTimeoutAsync(items, fn, ms) {
  function timeout(promise,ms){
    return Promise.race([promise, new Promise((_,reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
    ])
  }
  return Promise.all(items.map(item => timeout(fn(item),ms)))
}

// =============================================================================
// TASK 6: debounceImmediateAsync — leading-edge debounce (fire immediately, then cool down)
// =============================================================================
//
// You are given:
//   - fn(...args): a function that returns a Promise
//   - delayMs: cooldown period in milliseconds
//
// Return a NEW function. The FIRST call executes fn IMMEDIATELY. Any calls
// made within `delayMs` afterwards are IGNORED — they return the SAME promise
// as the first call (without re-executing fn). After `delayMs` passes, the
// next call again executes fn immediately, restarting the cooldown.
//
// This is the INVERSE of the trailing debounce you built in exercise 20.
// Trailing debounce waits for silence then fires the last call. Leading
// debounce fires the first call immediately then ignores the rest.
//
// Use case: button clicks — you want the FIRST click to register instantly
// (responsive feel), but ignore rapid double-clicks/spam clicks for a moment.
//
// Example:
//   let callCount = 0;
//   const expensive = (val) => {
//     callCount++;
//     return Promise.resolve(val * 2);
//   };
//   const debounced = debounceImmediateAsync(expensive, 100);
//
//   const p1 = debounced(1);  // executes immediately, callCount = 1, p1 resolves to 2
//   const p2 = debounced(2);  // IGNORED — within cooldown, returns SAME promise as p1
//   const p3 = debounced(3);  // IGNORED — returns SAME promise as p1
//   // p1 === p2 === p3 (same promise, same resolved value 2)
//   // callCount stays at 1
//
//   // ... after 100ms passes:
//   const p4 = debounced(10); // executes again, callCount = 2, p4 resolves to 20
//
// HINT:
//   Use a closure to remember the most recent promise AND a timer to reset it.
//
//   Closure state:
//     let lastPromise = null;
//     let timer = null;
//
//   Return function(...args) that:
//     a. If lastPromise is not null → return lastPromise (still in cooldown)
//     b. Otherwise:
//        - Call fn(...args) and remember it: lastPromise = fn(...args)
//        - Start a timer that, after delayMs, resets lastPromise = null
//        - Return lastPromise
//
//   Why reset lastPromise to null after delayMs? Because once the cooldown
//   ends, the next call should execute fn again. Setting lastPromise = null
//   is the "cooldown is over, ready for next real call" signal.

export function debounceImmediateAsync(fn, delayMs) {
  let lastPromise = null;
  return function(...args){
   if(lastPromise !== null)
    return lastPromise
  lastPromise = fn(...args)

  setTimeout(() => {
    lastPromise = null
  }, delayMs);
  return lastPromise;
  }
}



// =============================================================================
// TASK 7: debounceAsync — delay execution until calls stop coming
// =============================================================================
//
// You are given:
//   - fn(...args): a function that returns a Promise
//   - delayMs: milliseconds to wait after the LAST call before executing
//
// Return a NEW function. Every time it's called, reset a timer. Only after
// delayMs passes with NO new calls should fn actually execute with the LAST
// set of arguments. The returned function itself returns a Promise.
//
// This is the classic "debounce" pattern. It's used for search inputs — you
// don't want to call the API on every keystroke, only after the user stops
// typing for a moment.
//
// Example:
//   let callCount = 0;
//   const expensive = (val) => {
//     callCount++;
//     return Promise.resolve(val * 2);
//   };
//   const debounced = debounceAsync(expensive, 100);
//
//   debounced(1);  // timer starts
//   debounced(2);  // timer resets
//   debounced(3);  // timer resets
//   // ... after 100ms with no new calls, fn(3) executes
//   // callCount is 1, not 3
//
// HINT:
//   You need a closure that tracks a timer ID (like circuitBreaker tracked state).
//   1. let timer = null
//   2. Return a function(...args) that:
//      a. If timer is set, clear it: clearTimeout(timer)
//      b. Return a new Promise(resolve, reject) {
//           timer = setTimeout(() => {
//             fn(...args).then(resolve).catch(reject);
//           }, delayMs);
//         }
//   Each call cancels the previous timer and starts a new one.

export function debounceAsync(fn, delayMs) {
  let timer = null;
  return function(...args) {
    return new Promise((resolve,reject) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        fn(...args).then(resolve).catch(reject)
      }, delayMs);
    })
  }
}
