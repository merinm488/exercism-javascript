// PROMISE BASICS 12 - Practice Exercise
//
// =============================================================================
// TASK 1: Safe parallel fetch — individual .catch() on each promise
// =============================================================================
//
// You are given an array of URLs and a function fetchFn(url) that returns a
// Promise. Fetch ALL URLs in parallel, but DON'T let one failure break the
// whole operation.
//
// Attach a .catch() to EACH individual promise that returns null on failure.
// Then use Promise.all() to collect all results. Finally, filter out the
// null values and return only the successful results.
//
// This is a very common real-world pattern: "safe promises" that never reject,
// combined with Promise.all().
//
// Example:
//   const urls = ["/a", "/bad", "/c"];
//   const fetchFn = (url) => {
//     if (url === "/bad") return Promise.reject(new Error("fail"));
//     return Promise.resolve(url.slice(1));
//   };
//   safeFetchAll(urls, fetchFn) => ["a", "c"]
//
//   safeFetchAll([], fetchFn) => []
//
//   // All fail returns empty array, NOT a rejection
//   safeFetchAll(["/x", "/y"], () => Promise.reject(new Error("nope")))
//     => []
//
// HINT:
//   1. Map each URL to a promise with its own .catch():
//      urls.map(url => fetchFn(url).catch(() => null))
//      — Now every promise RESOLVES (either with data or null)
//   2. Pass to Promise.all()
//   3. Filter out null values from the result array

export function safeFetchAll(urls, fetchFn) {
  let promises = urls.map(url => fetchFn(url).catch(() => null))
  return Promise.all(promises).then(value => {
    return value.filter(item => item !== null)
  })
}

// =============================================================================
// TASK 2: Retry until condition is met
// =============================================================================
//
// You are given a function fn() that returns a Promise, a validation function
// isValid(result) that returns true or false, and a maxAttempts number.
//
// Call fn(). If the result passes isValid(), return it. If NOT, try again.
// Repeat up to maxAttempts times. If the last attempt still doesn't pass,
// reject with an Error.
//
// This is DIFFERENT from the retry you've done before. Previous retries
// retried when fn() REJECTED (threw an error). Here, fn() always resolves
// successfully — but the result might not be good enough.
//
// Example:
//   let count = 0;
//   const rollDice = () => {
//     count++;
//     return Promise.resolve(count); // always resolves
//   };
//   const isHigh = (n) => n >= 3;
//
//   retryUntil(rollDice, isHigh, 5)
//   // Roll 1: resolves 1 -> isHigh(1) = false -> retry
//   // Roll 2: resolves 2 -> isHigh(2) = false -> retry
//   // Roll 3: resolves 3 -> isHigh(3) = true -> return 3
//
//   retryUntil(rollDice, (n) => n >= 10, 3)
//   // Tries 3 times, none pass -> rejects with Error
//
// HINT:
//   Same recursive pattern, but the condition is different:
//   1. Base case: attempts <= 0 -> reject with Error
//   2. Call fn(), then .then(result => { ... })
//   3. If isValid(result) is true -> return result (done!)
//   4. If false -> recurse with attempts - 1

export function retryUntil(fn, isValid, attempts) {
  if (attempts == 0)
      return Promise.reject(new Error('no attempts left'))
  return fn().then(result => {
    if(isValid(result))
      return result
    else
    {
      return retryUntil(fn,isValid,attempts-1)
    }
  })
}

// =============================================================================
// TASK 3: Sequential map that skips errors
// =============================================================================
//
// You are given an array of items and a function processFn(item) that returns
// a Promise. Process items ONE AT A TIME sequentially.
//
// If processFn REJECTS for an item, SKIP it and continue with the next one.
// Do NOT stop the whole process. Return an array of only the successfully
// processed results.
//
// This is like sequentialMap from exercise 7, but with graceful error
// handling — failures are silently skipped.
//
// Example:
//   const items = ["hello", "BAD", "world"];
//   const processFn = (item) => {
//     if (item === "BAD") return Promise.reject(new Error("bad input"));
//     return Promise.resolve(item.toUpperCase());
//   };
//   sequentialMapSkipErrors(items, processFn) => ["HELLO", "WORLD"]
//   // "BAD" fails, gets skipped, processing continues
//
//   sequentialMapSkipErrors([], processFn) => []
//
//   // All fail returns empty array
//   sequentialMapSkipErrors(["x", "y"], () => Promise.reject(new Error("nope")))
//     => []
//
// HINT:
//   Same reduce pattern, but inside the .then():
//   1. processFn(curr).then(r => [...acc, r])
//      — Success: add to accumulator
//   2. .catch(() => acc)
//      — Failure: return accumulator unchanged (skip the item)
//   The .catch() on processFn converts a rejection into a successful result,
//   so the reduce chain keeps going.

export function sequentialMapSkipErrors(items, processFn) {
  return items.reduce((promise,curr) => {
    return promise.then(value => {
      return processFn(curr).then(r => [...value,r]).catch(() => value)
    })
  }, Promise.resolve([]))
}

// =============================================================================
// TASK 4: Retry fetch, then process results sequentially
// =============================================================================
//
// You are given a URL, a fetchFn(url) that returns a Promise, a number of
// retry attempts, and a processFn(data) that also returns a Promise.
//
// Step 1: Try to fetch the URL. If it fails, retry up to `attempts` times.
// Step 2: Once you have the data, process it through processFn.
//
// This combines the RETRY pattern with .then() chaining — two patterns
// you know, used together.
//
// Example:
//   let tries = 0;
//   const fetchFn = (url) => {
//     tries++;
//     if (tries < 3) return Promise.reject(new Error("not yet"));
//     return Promise.resolve("data from " + url);
//   };
//   const processFn = (data) => Promise.resolve(data.toUpperCase());
//   retryFetchThenProcess("/api", fetchFn, 5, processFn) => "DATA FROM /API"
//
// HINT:
//   Two steps chained together:
//   1. First: retryFetch(url, fetchFn, attempts)
//      — You need a helper function that retries fetchFn up to N times
//      — Use the retry pattern you already know (recursive, decrement attempts)
//   2. Chain .then(data => processFn(data))
//   3. That's it! The retry handles the hard part, .then() handles the rest

function retryFetch(url, fetchFn, attempts) {
  if(attempts === 0)
    return Promise.reject(new Error('no attempts left'))
  return fetchFn(url).catch(() => {
      return retryFetch(url, fetchFn,attempts-1)
    })
}

export function retryFetchThenProcess(url, fetchFn, attempts, processFn) {
  return retryFetch(url, fetchFn, attempts).then(processFn)
}

// =============================================================================
// TASK 5: Find best source, then fetch all items in parallel
// =============================================================================
//
// You are given:
//   - sources: an array of source URLs
//   - fetchFn(url): returns a Promise with source data (an object)
//   - items: an array of strings to look up
//   - lookupFn(item, sourceData): returns a Promise resolving to a value
//
// Step 1: Use Promise.any() to find the first working source
// Step 2: Use the source data to look up ALL items IN PARALLEL
// Step 3: Return an object built from the results
//
// This is like exercise 11 Task 6, but instead of sequential processing,
// the lookups happen in parallel. The lookupFn returns just a value (not
// {key, value}), so you use the original item as the key.
//
// Example:
//   const sources = ["/fail", "/ok"];
//   const fetchFn = (url) => {
//     if (url === "/fail") return Promise.reject(new Error("down"));
//     return Promise.resolve({ multiplier: 10 });
//   };
//   const items = ["a", "b"];
//   const lookupFn = (item, src) => Promise.resolve(item.charCodeAt(0) * src.multiplier);
//   fetchBestThenParallel(sources, fetchFn, items, lookupFn) =>
//     { a: 970, b: 980 }
//
//   // All sources fail -> rejects
//   fetchBestThenParallel(["/x"], () => Promise.reject(new Error("no")), [], lookupFn)
//     => rejects
//
// HINT:
//   Two steps chained:
//   1. Promise.any(sources.map(fetchFn))
//      — finds first working source
//   2. .then(sourceData => {
//      — Inside: use Promise.all(items.map(item => lookupFn(item, sourceData)))
//        to fetch all items in parallel
//      — Then build object from results
//      — You need both the item name AND the lookup result
//      — Use items.map with index to pair them up, or use a second .then()
//   })

export function fetchBestThenParallel(sources, fetchFn, items, lookupFn) {
  return Promise.any(sources.map(fetchFn)).then (sourceData => {
    return Promise.all(items.map(item => lookupFn(item,sourceData))).then(value => {
      return items.reduce((acc,curr,index) => {
        return {...acc, [curr]:value[index]}
      },{})
    })
    })
}

// =============================================================================
// TASK 6: Fetch all, then build success/failure summary
// =============================================================================
//
// You are given an array of URLs and a fetchFn(url) that returns a Promise.
//
// Step 1: Fetch ALL URLs in parallel using Promise.allSettled()
// Step 2: Build and return an object with two properties:
//   - succeeded: an array of values from successful fetches
//   - failed: an array of error messages from failed fetches
//
// This combines Promise.allSettled() with result categorisation — a common
// pattern for reporting what worked and what didn't.
//
// Example:
//   const urls = ["/a", "/bad", "/c"];
//   const fetchFn = (url) => {
//     if (url === "/bad") return Promise.reject(new Error("server error"));
//     return Promise.resolve(url.slice(1));
//   };
//   fetchSummary(urls, fetchFn) =>
//     { succeeded: ["a", "c"], failed: ["server error"] }
//
//   fetchSummary([], fetchFn) => { succeeded: [], failed: [] }
//
//   // All succeed
//   fetchSummary(["/a", "/b"], (url) => Promise.resolve(url.slice(1)))
//     => { succeeded: ["a", "b"], failed: [] }
//
// HINT:
//   1. Promise.allSettled(urls.map(url => fetchFn(url)))
//      — Returns array of { status, value/reason } objects
//   2. .then(results => { ... })
//   3. Inside .then():
//      — Use .filter() and .map() on the results array
//      — A fulfilled result looks like: { status: "fulfilled", value: ... }
//      — A rejected result looks like: { status: "rejected", reason: Error }
//      — Build { succeeded: [...], failed: [...] }

export function fetchSummary(urls, fetchFn) {
  return Promise.allSettled(urls.map(fetchFn)).then(value => {
    return value.reduce((acc,curr) => {
      if(curr.status == 'fulfilled')
      {
        acc['succeeded'].push(curr.value)
        return acc
      }
      else{
        acc['failed'].push(curr.reason.message)
        return acc
      }
    }, {'succeeded' : [], 'failed' : []})
  })
}
