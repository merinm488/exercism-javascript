// PROMISE BASICS 10 - Practice Exercise
// =============================================================================
// TASK 1: Count successes and failures
// =============================================================================
//
// You are given an array of URLs and a function `fetchFn(url)` that returns
// a Promise. Call fetchFn for ALL urls in parallel.
//
// Return an object counting how many succeeded and how many failed:
//   { success: <number>, failed: <number> }
//
// Example:
//   const urls = ["/a", "/bad", "/c", "/also-bad"];
//   const fetchFn = (url) => {
//     if (url.startsWith("/bad") || url === "/also-bad")
//       return Promise.reject(new Error("nope"));
//     return Promise.resolve("ok");
//   };
//   countResults(urls, fetchFn) => { success: 2, failed: 2 }
//
//   countResults([], fetchFn) => { success: 0, failed: 0 }
//
//   countResults(["/a", "/b"], (url) => Promise.resolve("ok"))
//     => { success: 2, failed: 0 }
//
// HINT:
//   1. Use Promise.allSettled() on the mapped promises
//   2. Use .reduce() to count — start with { success: 0, failed: 0 }
//   3. For each result: if fulfilled, increment success; if rejected, increment failed
//   4. Remember to return the accumulator object!

export function countResults(urls, fetchFn) {
  let promises = urls.map(url => fetchFn(url));
  return Promise.allSettled(promises).then(value => {
    return value.reduce((acc,curr) => {
      if (curr.status === 'fulfilled')
      {
        acc['success']++
        return acc
      }
      else 
      {
        acc['failed']++
        return acc
      }
    }, {'success': 0, 'failed':0})
  })
}

// =============================================================================
// TASK 2: Sequential filter (keep only items that pass an async test)
// =============================================================================
//
// You are given an array of items and a function `testFn(item)` that returns
// a Promise resolving to true or false. Process items ONE AT A TIME.
//
// Return an array containing ONLY the items where testFn resolved to true.
//
// This is the sequential reduce pattern, but instead of transforming every
// item, you DECIDE whether to include it.
//
// Example:
//   const nums = [1, 2, 3, 4, 5, 6];
//   const isEven = (n) => Promise.resolve(n % 2 === 0);
//   asyncFilter(nums, isEven) => [2, 4, 6]
//
//   asyncFilter([], isEven) => []
//
//   const words = ["hello", "hi", "hey", "yo"];
//   const isLong = (w) => Promise.resolve(w.length > 2);
//   asyncFilter(words, isLong) => ["hello", "hey"]
//
// HINT:
//   1. Same reduce pattern starting with Promise.resolve([])
//   2. For each item, call testFn(item)
//   3. If it resolves to true: return [...acc, item]
//      If it resolves to false: just return acc (don't add the item)
//   4. You can use a ternary: result ? [...acc, item] : acc

export function asyncFilter(items, testFn) {
  return items.reduce((promise,curr) => {
    return promise.then(value => {
      return testFn(curr).then(r => {
       return r ? [...value, curr] : value
      })
    })
  }, Promise.resolve([]))
}

// =============================================================================
// TASK 3: Parallel fetch with fallback values
// =============================================================================
//
// You are given an array of objects, each with `key`, `url`, and `fallback`
// properties, and a function `fetchFn(url)` that returns a Promise.
//
// Call fetchFn for ALL urls in parallel. Return an object where:
//   - For each SUCCESSFUL fetch: { [key]: fetched_value }
//   - For each FAILED fetch: { [key]: fallback } (use the fallback from the item)
//
// This is like fetchAsMap from promise-basics-9, but instead of null for
// failures, you use a provided fallback value.
//
// Example:
//   const items = [
//     { key: "name", url: "/name", fallback: "Unknown" },
//     { key: "age", url: "/age", fallback: 0 },
//     { key: "city", url: "/error", fallback: "N/A" },
//   ];
//   const fetchFn = (url) => {
//     if (url === "/error") return Promise.reject(new Error("fail"));
//     return Promise.resolve(url.slice(1)); // returns "name", "age"
//   };
//   fetchWithFallback(items, fetchFn) =>
//     { name: "name", age: "age", city: "N/A" }
//
//   fetchWithFallback([], fetchFn) => {}
//
// HINT:
//   1. Use Promise.allSettled() on mapped promises
//   2. Use .reduce() with the index parameter (like fetchAsMap)
//   3. If status is "fulfilled": use result.value
//      If status is "rejected": use items[index].fallback (not null!)

export function fetchWithFallback(items, fetchFn) {
  let promises = items.map(item => fetchFn(item.url));
  return Promise.allSettled(promises).then(value => {
    return value.reduce((acc,curr,index) => {
      if(curr.status === 'fulfilled')
      {
        acc[items[index].key] = curr.value
        return acc
      }
      else{
        acc[items[index].key] = items[index].fallback
        return acc
      }
    },{})
  })
}

// =============================================================================
// TASK 4: Sequential object builder from key-value pairs
// =============================================================================
//
// You are given an array of strings and a function `lookupFn(str)` that
// returns a Promise resolving to an object { key: <string>, value: <any> }.
//
// Process items ONE AT A TIME. Call lookupFn for each string and use the
// returned { key, value } to build a single result object.
//
// Example:
//   const names = ["alice", "bob"];
//   const lookupFn = (name) => Promise.resolve({ key: name, value: name.length });
//   buildLookup(names, lookupFn) => { alice: 5, bob: 3 }
//
//   buildLookup([], lookupFn) => {}
//
//   const codes = ["US", "UK"];
//   const countryLookup = (code) => Promise.resolve({
//     key: code,
//     value: code === "US" ? "United States" : "United Kingdom"
//   });
//   buildLookup(codes, countryLookup) =>
//     { US: "United States", UK: "United Kingdom" }
//
// HINT:
//   1. Sequential reduce starting with Promise.resolve({})
//   2. For each item, call lookupFn(item)
//   3. The result is { key, value } — use computed property names:
//      { ...acc, [result.key]: result.value }
//   4. Always return the new object

export function buildLookup(names, lookupFn) {
  return names.reduce((promise,curr) => {
    return promise.then(value => {
      return lookupFn(curr).then(r => {
        return {...value, [r.key]: r.value}
      })
    })
  },Promise.resolve({}))
}
