const whitelist = new Set(['inspect', '$$typeof', 'nodeType', '@@__IMMUTABLE_ITERABLE__@@', '@@__IMMUTABLE_RECORD__@@', '_isMockFunction'])

module.exports = typeof Proxy === 'function'
  ? o => new Proxy(o, {
    get (target, prop) {
      if (prop === 'toJSON') return () => target
      const val = target[prop]
      if (typeof prop === 'symbol' || whitelist.has(prop)) return val
      if (val === undefined) throw new TypeError(`${prop} is undefined`)
      return val
    }
  })
  : a => a
