const whitelist = new Set(['inspect'])

module.exports = typeof Proxy === 'function' ? (
  o => new Proxy(o, {
    get (target, prop) {
      const val = target[prop]
      if (typeof prop === 'symbol' || whitelist.has(prop)) return val
      if (val === undefined) throw new TypeError(`${prop} is undefined`)
      return val
    }
  })
) : (a => a)
