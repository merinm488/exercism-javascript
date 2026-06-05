// PROMISE BASICS 11 - Practice Exercise
//
// =============================================================================
// TASK 1: First successful result — Promise.any()
// =============================================================================
//
// You are given an array of URLs and a function fetchFn(url) that returns a
// Promise. Try ALL URLs in parallel and return the value of the FIRST one
// that succeeds.
//
// If ALL URLs fail, Promise.any() rejects with an AggregateError.
//
// This is different from Promise.race() which settles with the first result
// (even if it's a rejection). Promise.any() IGNORES rejections and waits
// for the first success.
//
// Example:
//   const urls = ["/a", "/b", "/c"];
//   const fetchFn = (url) => {
//     if (url === "/a") return Promise.reject(new Error("fail"));
//     return Promise.resolve(url.slice(1));
//   };
//   firstSuccessful(urls, fetchFn) => resolves with "b"
//
//   firstSuccessful(["/bad1", "/bad2"], () => Promise.reject(new Error("nope")))
//     => rejects with AggregateError
//
//   firstSuccessful([], () => Promise.resolve("ok"))
//     => rejects with AggregateError
//
// HINT:
//   1. Create an array of promises using .map()
//   2. Pass it to the Promise method that returns the first SUCCESSFUL result
//   3. This is a one-liner — you've used Promise.race() before, this is similar
//      but waits for success instead of just the first to settle

export function firstSuccessful(urls, fetchFn) {
  let promises = urls.map(url => fetchFn(url))
  return Promise.any(promises)
}

// =============================================================================
// TASK 2: Async find — sequential, stop at first match
// =============================================================================
//
// You are given an array of items and a function testFn(item) that returns
// a Promise resolving to true or false. Process items ONE AT A TIME.
//
// Return the FIRST item where testFn resolves to true. If no item matches,
// return undefined.
//
// KEY DIFFERENCE from async filter: you STOP as soon as you find a match.
// You do NOT continue testing the remaining items. This is early termination.
//
// Example:
//   const nums = [1, 3, 4, 6, 8];
//   const isEven = (n) => Promise.resolve(n % 2 === 0);
//   asyncFind(nums, isEven) => 4
//   // Only tests 1, 3, 4 — stops at 4 (doesn't test 6 or 8)
//
//   asyncFind([1, 3, 5], isEven) => undefined
//
//   asyncFind([], isEven) => undefined
//
// HINT:
//   Same recursive pattern as trySequential (exercise 6) / firstResolved (exercise 8):
//   1. Base case: items.length === 0 -> return Promise.resolve(undefined)
//   2. Test the first item: testFn(items[0])
//   3. If true -> return items[0] (found it, stop!)
//   4. If false -> recurse with items.slice(1)

export function asyncFind(items, testFn) {
  if (items.length === 0)
    return Promise.resolve(undefined)
  return testFn(items[0]).then(value => {
    if (value)
      return items[0]
    else 
    {
      return asyncFind(items.slice(1),testFn)
    }
  })
}

// =============================================================================
// TASK 3: Async some — sequential, stop when one passes
// =============================================================================
//
// You are given an array of items and a function testFn(item) that returns
// a Promise resolving to true or false. Process items ONE AT A TIME.
//
// Return true as soon as ONE item passes. Return false if none pass.
//
// This is the async version of .some(). It stops as soon as it finds a match.
//
// Example:
//   const nums = [1, 3, 4, 6];
//   const isEven = (n) => Promise.resolve(n % 2 === 0);
//   asyncSome(nums, isEven) => true
//   // Tests 1 (false), 3 (false), 4 (true) -> stops, returns true
//
//   asyncSome([1, 3, 5], isEven) => false
//
//   asyncSome([], isEven) => false
//
// HINT:
//   Same structure as asyncFind, but return true/false:
//   1. Base case: items.length === 0 -> return Promise.resolve(false)
//      (no items means none passed, so false)
//   2. Test the first item
//   3. If true -> return true (at least one passed, stop!)
//   4. If false -> recurse with items.slice(1)

export function asyncSome(items, testFn) {
  if (items.length === 0)
    return false
  return testFn(items[0]).then(value => {
    if(value) return true
    else{
      return asyncSome(items.slice(1),testFn)
    }
  })
}

// =============================================================================
// TASK 4: Async every — sequential, stop when one fails
// =============================================================================
//
// You are given an array of items and a function testFn(item) that returns
// a Promise resolving to true or false. Process items ONE AT A TIME.
//
// Return false as soon as ONE item fails. Return true if ALL pass.
//
// This is the async version of .every(). It stops as soon as one fails.
//
// Example:
//   const nums = [2, 4, 3, 6];
//   const isEven = (n) => Promise.resolve(n % 2 === 0);
//   asyncEvery(nums, isEven) => false
//   // Tests 2 (true), 4 (true), 3 (false) -> stops, returns false
//
//   asyncEvery([2, 4, 6], isEven) => true
//
//   asyncEvery([], isEven) => true
//
// HINT:
//   Same pattern, but opposite logic to asyncSome:
//   1. Base case: items.length === 0 -> return Promise.resolve(true)
//      (no items means none failed, so all passed -> true)
//   2. Test the first item
//   3. If false -> return false (one failed, stop!)
//   4. If true -> recurse with items.slice(1)

export function asyncEvery(items, testFn) {
  if (items.length === 0)
    return true
  return testFn(items[0]).then(value => {
    if (!value)
      return false
    else{
      return asyncEvery(items.slice(1),testFn)
    }
  })
}

// =============================================================================
// TASK 5: Fetch in parallel, then process sequentially
// =============================================================================
//
// You are given an array of URLs, a fetchFn(url) that returns a Promise,
// and a processFn(data) that also returns a Promise.
//
// Step 1: Fetch ALL URLs in parallel (using Promise.all)
// Step 2: Process the results ONE AT A TIME sequentially (using reduce)
//
// Return the array of processed results.
//
// This combines TWO patterns you know — parallel AND sequential — in one
// function. The key insight: use Promise.all().then() to get all results,
// then chain a sequential reduce inside the .then().
//
// Example:
//   const urls = ["/a", "/b", "/c"];
//   const fetchFn = (url) => Promise.resolve(url.slice(1));
//   const processFn = (data) => Promise.resolve(data.toUpperCase());
//   fetchThenProcess(urls, fetchFn, processFn) => ["A", "B", "C"]
//
//   fetchThenProcess([], fetchFn, processFn) => []
//
// HINT:
//   Two steps chained together:
//   1. First: Promise.all(urls.map(url => fetchFn(url))) to fetch in parallel
//   2. Chain .then(results => { ... })
//   3. Inside .then(): use the sequential reduce pattern you know
//      — Start with Promise.resolve([])
//      — For each result, call processFn(item) then add to accumulator
//      — Use [...acc, processed] to add each result

export function fetchThenProcess(urls, fetchFn, processFn) {
  return Promise.all(urls.map(url => fetchFn(url))).then(result => {
    return result.reduce((promise,curr) => {
      return promise.then(value => {
        return processFn(curr).then(r => {
          return [...value, r]
        })
      })
    }, Promise.resolve([]))
  })
}

// =============================================================================
// TASK 6: Resilient fetch — Promise.any + sequential object builder
// =============================================================================
//
// You are given:
//   - sources: an array of URLs to try
//   - fetchFn(url): returns a Promise with source data
//   - items: an array of strings to look up
//   - lookupFn(item, sourceData): returns a Promise resolving to
//     { key: <string>, value: <any> }
//
// Step 1: Use Promise.any() to find the first working source
// Step 2: Use the source data to sequentially look up each item
// Step 3: Build and return an object from the results
//
// This combines Promise.any() + sequential reduce — two patterns in one
// function.
//
// Example:
//   const sources = ["/fail1", "/fail2", "/ok"];
//   const fetchFn = (url) => {
//     if (url.startsWith("/fail")) return Promise.reject(new Error("down"));
//     return Promise.resolve({ prefix: "data-" });
//   };
//   const items = ["name", "age"];
//   const lookupFn = (item, sourceData) =>
//     Promise.resolve({ key: item, value: sourceData.prefix + item });
//   fetchBestAndProcess(sources, fetchFn, items, lookupFn) =>
//     { name: "data-name", age: "data-age" }
//
//   fetchBestAndProcess([], fetchFn, items, lookupFn) => rejects
//
// HINT:
//   Two steps chained together:
//   1. First: Promise.any(sources.map(url => fetchFn(url)))
//      — finds the first working source
//   2. Chain .then(sourceData => { ... })
//   3. Inside .then(): use sequential reduce to build an object
//      — Start with Promise.resolve({})
//      — For each item, call lookupFn(item, sourceData)
//      — Use computed property: { ...acc, [result.key]: result.value }

export function fetchBestAndProcess(sources, fetchFn, items, lookupFn) {
  return Promise.any(sources.map(fetchFn)).then(result => {
    return items.reduce((promise,curr) => {
      return promise.then(value => {
        return lookupFn(curr,result).then(r => {
          return {...value, [r.key]:r.value}
        })
      })
    }, Promise.resolve({}))
  })
}
