/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <algorithm>
#include <array>
#include <chrono>
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
 * Additionally stores a bounded ring buffer of destruction contexts per class,
 * capturing which JS call triggered each destruction and when it happened.
 *
 * This allows JavaScript wrappers to detect use-after-free by calling isDead(),
 * and enables per-class statistics for debugging.
 */
class MemoryTrackedRegistry {
 public:
  // Internal C++ API (used by MemoryTracked).
  static void add(const void* ptr, const char* className) {
    if (!className) return;
    dead()[className].erase(ptr);
    alive()[className].insert(ptr);
  }

  static void remove(const void* ptr, const char* className) {
    if (!className) return;
    alive()[className].erase(ptr);
    dead()[className].insert(ptr);
    deadContexts()[className].push(ptr, currentCallContextId_(), nowMs());
  }

  static bool isDead(const void* ptr, const char* className) {
    if (!className) return false;
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

  static long getDeadCount() {
    long total = 0;
    for (auto& kv : dead()) total += static_cast<long>(kv.second.size());
    return total;
  }

  static void pruneDead(long maxSize) {
    if (getDeadCount() > maxSize) {
      dead().clear();
      deadContexts().clear();
    }
  }

  static long getAliveCount() {
    long total = 0;
    for (auto& kv : alive()) total += static_cast<long>(kv.second.size());
    return total;
  }

  static long getAliveCountForClass(const gd::String& className) {
    auto it = alive().find(className.c_str());
    return it != alive().end() ? static_cast<long>(it->second.size()) : 0;
  }

  static long getDeadCountForClass(const gd::String& className) {
    auto it = dead().find(className.c_str());
    return it != dead().end() ? static_cast<long>(it->second.size()) : 0;
  }

  // --- Destruction context API ---

  /** Set by JS before each wrapped method call (integer ID, ~50-100ns). */
  static void setCurrentCallContextId(long id) {
    currentCallContextId_() = static_cast<int>(id);
  }

  /**
   * Returns the call-context ID that was active when the object was destroyed,
   * or -1 if the context has been evicted from the ring buffer.
   */
  static long getDeadContextId(long ptr, const gd::String& className) {
    auto* ctx = findDeadContext(
        reinterpret_cast<const void*>(static_cast<uintptr_t>(ptr)),
        className.c_str());
    return ctx ? static_cast<long>(ctx->callContextId) : -1;
  }

  /**
   * Returns the wall-clock timestamp (ms since Unix epoch) when the object
   * was destroyed, or 0 if the context is not available.
   */
  static double getDeadContextTimeMs(long ptr, const gd::String& className) {
    auto* ctx = findDeadContext(
        reinterpret_cast<const void*>(static_cast<uintptr_t>(ptr)),
        className.c_str());
    return ctx ? ctx->timestampMs : 0.0;
  }

 private:
  using PtrSet = std::unordered_set<const void*>;
  using ClassMap = std::unordered_map<std::string, PtrSet>;

  // --- Destruction context ring buffer ---

  struct DestructionContext {
    const void* ptr = nullptr;
    int callContextId = -1;
    double timestampMs = 0.0;
  };

  static constexpr size_t kRingCapacity = 64;

  struct ClassRing {
    std::array<DestructionContext, kRingCapacity> entries{};
    size_t count = 0;  // total pushes; head = count % kRingCapacity

    void push(const void* p, int contextId, double timestamp) {
      entries[count % kRingCapacity] = {p, contextId, timestamp};
      count++;
    }

    // Search newest-first so the most recent destruction of a ptr wins.
    const DestructionContext* find(const void* p) const {
      size_t n = std::min(count, kRingCapacity);
      for (size_t i = 0; i < n; i++) {
        size_t idx = (count - 1 - i) % kRingCapacity;
        if (entries[idx].ptr == p) return &entries[idx];
      }
      return nullptr;
    }
  };

  using RingMap = std::unordered_map<std::string, ClassRing>;

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

  static RingMap& deadContexts() {
    static auto* m = new RingMap();
    return *m;
  }

  static int& currentCallContextId_() {
    static int id = -1;
    return id;
  }

  /** Wall-clock milliseconds (matches Date.now() in JS). */
  static double nowMs() {
    return static_cast<double>(
        std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch())
            .count());
  }

  static const DestructionContext* findDeadContext(const void* ptr,
                                                   const char* className) {
    if (!className) return nullptr;
    auto it = deadContexts().find(className);
    if (it == deadContexts().end()) return nullptr;
    return it->second.find(ptr);
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
 *
 * When adding a new tracked class, also update:
 * - GDevelop.js/Bindings/postjs.js (trackedClassNames set in
 *   patchClassesForUseAfterFreeDetection)
 * - newIDE/app/src/MainFrame/MemoryTrackedRegistryDialog.js (trackedClasses
 *   array)
 */
class MemoryTracked {
 public:
  MemoryTracked(const void* owner, const char* className)
      : owner_(owner), className_(className) {
    if (className_) MemoryTrackedRegistry::add(owner_, className_);
  }

  ~MemoryTracked() { if (className_) MemoryTrackedRegistry::remove(owner_, className_); }

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
