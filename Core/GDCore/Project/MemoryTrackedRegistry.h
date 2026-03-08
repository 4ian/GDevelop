/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <cstdint>
#include <cstring>
#include <string>
#include <unordered_map>
#include <unordered_set>

#include "GDCore/String.h"

namespace gd {

/**
 * \brief A static registry tracking the lifetime of C++ objects exposed to
 * JavaScript via Emscripten/WebIDL bindings.
 *
 * Uses two maps keyed by className, each mapping to a set of pointers:
 * - alive: objects currently alive
 * - dead: objects that were alive and are now destroyed
 *
 * This allows JavaScript wrappers to detect use-after-free by calling isDead(),
 * and enables per-class statistics for debugging.
 */
class MemoryTrackedRegistry {
 public:
  // Internal C++ API (used by MemoryTracked).
  static void add(const void* ptr, const char* className) {
    dead()[className].erase(ptr);
    alive()[className].insert(ptr);
  }

  static void remove(const void* ptr, const char* className) {
    alive()[className].erase(ptr);
    dead()[className].insert(ptr);
  }

  static bool isDead(const void* ptr, const char* className) {
    auto it = dead().find(className);
    return it != dead().end() && it->second.count(ptr) > 0;
  }

  // WebIDL-facing API (called from JS via the binder).
  static void add(long ptr, const gd::String& className) {
    add(reinterpret_cast<const void*>(static_cast<uintptr_t>(ptr)),
        className.c_str());
  }

  static void remove(long ptr, const gd::String& className) {
    remove(reinterpret_cast<const void*>(static_cast<uintptr_t>(ptr)),
           className.c_str());
  }

  static bool isDead(long ptr, const gd::String& className) {
    return isDead(
        reinterpret_cast<const void*>(static_cast<uintptr_t>(ptr)),
        className.c_str());
  }

  static long deadCount() {
    long total = 0;
    for (auto& kv : dead()) total += static_cast<long>(kv.second.size());
    return total;
  }

  static void pruneDead(long maxSize) {
    if (deadCount() > maxSize) {
      dead().clear();
    }
  }

  // Per-class stats. Pass empty string for totals.
  static long getAliveCountForClass(const gd::String& className) {
    if (className.empty()) {
      long total = 0;
      for (auto& kv : alive()) total += static_cast<long>(kv.second.size());
      return total;
    }
    auto it = alive().find(className.c_str());
    return it != alive().end() ? static_cast<long>(it->second.size()) : 0;
  }

  static long getDeadCountForClass(const gd::String& className) {
    if (className.empty()) return deadCount();
    auto it = dead().find(className.c_str());
    return it != dead().end() ? static_cast<long>(it->second.size()) : 0;
  }

 private:
  using PtrSet = std::unordered_set<const void*>;
  using ClassMap = std::unordered_map<std::string, PtrSet>;

  // Heap-allocated maps (intentionally leaked) to avoid static destruction
  // order issues.
  static ClassMap& alive() {
    static auto* m = new ClassMap();
    return *m;
  }

  static ClassMap& dead() {
    static auto* m = new ClassMap();
    return *m;
  }
};

/**
 * \brief A non-copyable, non-movable member object that registers/unregisters
 * its owner with MemoryTrackedRegistry.
 *
 * Add one as a member to any class you want to track:
 * \code
 * class Layout {
 *     MemoryTracked _memoryTracked{this, "Layout"};
 * };
 * \endcode
 */
class MemoryTracked {
 public:
  MemoryTracked(const void* owner, const char* className)
      : owner_(owner), className_(className) {
    MemoryTrackedRegistry::add(owner_, className_);
  }

  ~MemoryTracked() { MemoryTrackedRegistry::remove(owner_, className_); }

  // Non-copyable, non-movable.
  MemoryTracked(const MemoryTracked&) = delete;
  MemoryTracked& operator=(const MemoryTracked&) = delete;
  MemoryTracked(MemoryTracked&&) = delete;
  MemoryTracked& operator=(MemoryTracked&&) = delete;

 private:
  const void* owner_;
  const char* className_;
};

}  // namespace gd
