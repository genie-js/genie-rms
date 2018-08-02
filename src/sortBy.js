module.exports = function createSortby (prop) {
  return function sortBy (a, b) {
    const ap = a[prop]
    const bp = b[prop]
    if (ap > bp) return 1
    if (ap < bp) return -1
    return 0
  }
}
