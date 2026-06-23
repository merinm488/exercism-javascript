// PROMISES INTERMEDIATE 23 — VARIATIONS ON THE PATTERNS
//
// =============================================================================
// TASK 1: filterPoolAsync — concurrency-limited FILTER
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - predicate(item): an async function returning a TRUTHY or FALSY value
//   - limit: max concurrent operations
//
// Run predicate on every item with at most `limit` in flight. Return a NEW
// array containing only the items whose predicate returned a truthy value.
// PRESERVE original order.
//
// This is harder than mapPoolAsync because:
//   - You can't preallocate a fixed-size result array (you don't know
//     how many items will pass)
//   - You still need to maintain order despite workers finishing at
//     different times
//
// Example:
//   filterPoolAsync([1,2,3,4,5,6], async n => n % 2 === 0, 2)
//     => [2, 4, 6]
//
//   filterPoolAsync([], predicate, 3) => []
//
//   filterPoolAsync([1,2,3], async n => true, 10) => [1,2,3]
//
// QUESTIONS TO GUIDE YOU (don't read further than you need):
//   Q1. Look at your mapPoolAsync solution. The "striding" worker pattern
//       (each worker handles indices i, i+limit, i+2*limit, ...) still works.
//       What's different about what each worker STORES?
//   Q2. Since you can't preallocate a results array of the right size,
//       what data structure should each worker push into? Hint: the order
//       in which workers finish is unpredictable, but the order of items
//       within a single worker's stride IS predictable. Why does that
//       matter for the final ordering?
//   Q3. After all workers finish, what single array method turns the
//       worker results into a flat, ordered array?

export function filterPoolAsync(items, predicate, limit) {
  let results =  Array(items.length);
  function Helper(index){
    return predicate(items[index]).then(value => {
      if(value)
        results[index] = items[index]
      if(index+limit<items.length)
        return Helper(index+limit)
    })
  }
  let lanes = []
  for(let i=0; i<Math.min(items.length,limit);i++)
    lanes.push(Helper(i))
  return Promise.all(lanes).then(() => results.filter(() =>true) )
}

// =============================================================================
// TASK 2: memoizeWithTTL — caching where entries EXPIRE after a TTL
// =============================================================================
//
// You are given:
//   - fn(arg): an async function
//   - ttlMs: time-to-live in milliseconds. Cached entries become STALE
//            after this duration and must be re-fetched.
//
// Return a memoized function. The first call with a new arg executes fn
// and caches the promise. Subsequent calls within ttlMs return the cached
// promise. Calls AFTER ttlMs has elapsed treat the cache as a miss and
// call fn again.
//
// Example:
//   let callCount = 0;
//   const fetch = (id) => { callCount++; return Promise.resolve(id * 10); };
//   const m = memoizeWithTTL(fetch, 100);
//
//   await m(1);             // fn called, callCount = 1
//   await m(1);             // CACHED (within TTL), callCount = 1
//   await sleep(150);       // TTL has elapsed
//   await m(1);             // STALE — fn called again, callCount = 2
//
// QUESTIONS TO GUIDE YOU:
//   Q1. In Task 2 of exercise 22, the cache stored key → promise.
//       What TWO pieces of information do you need per entry now?
//       (Hint: it's not just the promise.)
//   Q2. When a cache hit happens, what check must you perform before
//       returning the cached promise? What does "now" mean in code?
//   Q3. When the entry is stale, do you delete it and re-create it,
//       or just overwrite it? Either works — but think about which
//       is cleaner.

export function memoizeWithTTL(fn, ttlMs) {
  let cache = new Map()
  return function(arg){
    if(cache.has(arg) && (Date.now() - cache.get(arg).createdAt) < ttlMs)
      return cache.get(arg).promise
    cache.set(arg,{promise: fn(arg), createdAt: Date.now()})
    return cache.get(arg).promise
  }
  
}

// =============================================================================
// TASK 3: mapSeriesAsync — SEQUENTIAL map, one at a time, in order
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function
//
// Run fn on each item ONE AT A TIME, in order. Wait for fn(items[0]) to
// finish before starting fn(items[1]). Return all results in order.
//
// This is the chunkedMapAsync pattern with chunkSize = 1, but implemented
// directly (no chunking needed).
//
// Example:
//   // Logs "start 1", then after 50ms "start 2", etc.
//   mapSeriesAsync([1,2,3], n => new Promise(r =>
//     setTimeout(() => { console.log('start', n); r(n*2); }, 50)
//   ))
//   // => [2, 4, 6]   (total time ~150ms, NOT ~50ms)
//
//   mapSeriesAsync([], fn) => []
//
// QUESTIONS TO GUIDE YOU:
//   Q1. There are TWO clean ways to write this. One uses a `for` loop
//       with `await` inside an `async function`. The other uses `reduce`
//       to build a promise chain (like chunkedMapAsync in ex 22). Which
//       feels clearer to you?
//   Q2. If you pick the async/await version: what keyword turns the
//       function into one that can use `await`? Where does the keyword go?
//   Q3. The "what's the empty case" question: what should `mapSeriesAsync([], fn)`
//       return? Trace through your code — does it handle this automatically,
//       or do you need a special case?

export function mapSeriesAsync(items, fn) {
  return items.reduce((promise,curr) => {
    return promise.then(value => {
      return fn(curr).then(r => [...value,r])
    })
  },Promise.resolve([]))
}

// =============================================================================
// TASK 4: retryAsync — RETRY an async fn on failure, up to N times
// =============================================================================
//
// You are given:
//   - fn(): an async function (takes no args for simplicity)
//   - attempts: max number of TOTAL attempts (including the first)
//   - delayMs: milliseconds to wait BETWEEN failed attempts
//
// Try fn. If it fulfills → resolve with the value. If it rejects → wait
// delayMs, then try again. Repeat until either:
//   - fn fulfills (resolve with its value), OR
//   - attempts is exhausted (reject with the LAST error)
//
// Examples:
//   let count = 0;
//   const flaky = () => {
//     count++;
//     return count < 3 ? Promise.reject(new Error('not yet')) : Promise.resolve('ok');
//   };
//
//   retryAsync(flaky, 5, 10)
//     // attempt 1: rejects ("not yet") → wait 10ms
//     // attempt 2: rejects ("not yet") → wait 10ms
//     // attempt 3: resolves ("ok") → return "ok"
//     => 'ok', count === 3
//
//   const alwaysFails = () => Promise.reject(new Error('broken'));
//   retryAsync(alwaysFails, 3, 10)
//     // attempt 1: rejects → wait 10ms
//     // attempt 2: rejects → wait 10ms
//     // attempt 3: rejects → no more attempts
//     => REJECTS with Error('broken')
//
//   retryAsync(fn, 1, 10)
//     // Only 1 attempt — no retries. If fn rejects, the whole thing rejects.
//
// QUESTIONS TO GUIDE YOU:
//   Q1. This is fundamentally a SEQUENTIAL pattern (one attempt after
//       another). Would you write it with a `for` loop + `await`, or with
//       recursion? Both work. Which do you find more readable?
//   Q2. How do you "wait delayMs" in JavaScript? You wrote this helper
//       many times in earlier exercises:
//         new Promise(r => setTimeout(r, delayMs))
//       Where in your loop does this wait need to go? Hint: NOT after
//       the last attempt — you don't want to wait before rejecting.
//   Q3. The error semantics: when all attempts fail, you reject with
//       the LAST error. So you need a way to "remember" the most recent
//       error across loop iterations. What variable holds it?
//   Q4. Subtle one: with `attempts = 3`, your loop runs 3 times. After
//       attempt 1 fails, you wait, then try attempt 2. After attempt 2
//       fails, you wait, then try attempt 3. After attempt 3 fails,
//       do you wait? (You shouldn't — there's no attempt 4.) How do you
//       structure the loop so the wait only happens BETWEEN attempts,
//       not after the last one?

export function retryAsync(fn, attempts, delayMs) {
  const wait = (ms) => {
    return new Promise(resolve => setTimeout(resolve,ms))
  }
  function Retry(attempt){
    return fn().catch((error) => {
      if(attempt>=attempts)
        return Promise.reject(error)
      return wait(delayMs).then(() => {
        return Retry(attempt+1)
      })
    })
  }
  return Retry(1)
}
