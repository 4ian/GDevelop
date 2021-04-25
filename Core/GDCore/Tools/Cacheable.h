#ifndef GDCORE_CACHEABLE
#define GDCORE_CACHEABLE

#include <memory>

#include "GDCore/String.h"

namespace gd {

/**
 * \brief An abstract base class that adds a simple cache. Useful to cache
 * results of code generation.
 */
class Cacheable {
 public:
  /**
   * \brief Get the latest cached value.
   */
  gd::String& GetLatestCache() { return currentCache; };

  /**
   * \brief Test if there is a valid cached value.
   */
  bool HasCache() { return isCacheValid; };

  /**
   * \brief Cache a new value.
   */
  void CacheValue(const gd::String& newCache) {
    isCacheValid = true;
    currentCache = newCache;
  };

  /**
   * \brief Invalidate the current cached value.
   */
  void InvalidateCache() {
    isCacheValid = false;
    // If a parent is using this cached value, notify it it has changed and
    // needs to regenerate.
    if (parent != NULL) parent->InvalidateCache();
  };

  /**
   * \brief Set another cacheable as parent of this one.
   *
   * If the cache of this cacheable gets invalidated, the parents cache will be
   * invalidated as well. This is useful if a parent caches a value dependant on
   * this cached value, to notfiy it that something changed and needs to be
   * regenerated.
   */
  void SetParent(gd::Cacheable* _parent) { parent.reset(_parent); };

 private:
  gd::String currentCache;
  bool isCacheValid = false;
  std::shared_ptr<gd::Cacheable> parent;
};

};  // namespace gd

#endif
