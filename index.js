var snapshot = null;

module.exports = hotMonkey;


function hotMonkey(){
  if ( ! module.hot){
    log('[hot-monkey] For patching to work you have to enable webpack hot module replacement');
    return;
  }

  module.hot.addStatusHandler(function(status){
    if (status === 'check'){
      saveModules();
    }

    if (status === 'idle'){
      patchModules();
    }
  });

  log('[hot-monkey] Ready');
}

function saveModules(){
  snapshot = {};

  for (var moduleId in require.cache){
    snapshot[moduleId] = require.cache[moduleId];
  }
}

function patchModules(){
  for (var moduleId in require.cache){
    var prevMod = snapshot[moduleId];
    var patchMod = require.cache[moduleId];

    // no change
    if (prevMod === patchMod){
      continue;
    }

    // new module
    if (prevMod === undefined){
      continue;
    }

    // TODO: warn?

    // not ES6 module with "export default"
    if ( ! (prevMod.exports && prevMod.exports.default && patchMod.exports && patchMod.exports.default)){
      continue;
    }

    var prevExport = prevMod.exports.default;
    var patchExport = patchMod.exports.default;

    if (typeof prevExport === typeof patchExport){
      if (prevExport instanceof Function){
        patchClass(prevExport, patchExport);
      } else {
        patchObject(prevMod, patchExport);
      }
    }

    // restore prev module
    require.cache[moduleId] = prevMod;
  }
}

function patchClass(Clz, patch){
  var proto = Clz.prototype;

  patchObject(Clz, patch);
  patchObject(proto, patch.prototype);

  Clz.prototype = proto;
}

function patchObject(o, patch){
  // delete missing properties
  Object.getOwnPropertyNames(o).forEach(function(k){
    if ( ! patch.hasOwnProperty(k)){
      delete o[k];
    }
  });

  // set new values
  Object.getOwnPropertyNames(patch).forEach(function(k){
    try{
      o[k] = patch[k];
    }
    catch(e){
      // TODO: writability
    }
  });
}

function log(msg){
  if (console){
    console.log(msg);
  }
}