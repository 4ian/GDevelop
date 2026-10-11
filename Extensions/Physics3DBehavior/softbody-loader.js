(function(){
// softbody-loader: ensure SoftBodyBodyUpdater is available and register fallback
if (typeof gdjs !== 'undefined' && gdjs.Physics3DRuntimeBehavior) {
  // If SoftBodyBodyUpdater is available, nothing to do.
  // This script exists so that bundlers/loaders pick up SoftBody modules.
}
})();
