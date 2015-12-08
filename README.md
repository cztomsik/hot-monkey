# hot-monkey
Monkey-patch running application

## How?
Makes snapshot of `require.cache` before HMR kicks in, then it tries to merge changes into already loaded modules.

## Limitations
Currently, only ES6 modules with `export default` are supported. Also it only patches classes & objects (shallow) so in extreme cases, it may fail but it actually works suprisingly well.