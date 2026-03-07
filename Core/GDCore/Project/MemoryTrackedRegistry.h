/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <cstdint>
#include <cstring>
#include <set>
#include <string>

#include "GDCore/String.h"

namespace gd {

/**
 * \brief A static registry tracking the lifetime of C++ objects exposed to
 * JavaScript via Emscripten/WebIDL bindings.
 *
 * Uses two sets keyed by uint64_t hashes of (pointer, className) pairs:
 * - alive: objects currently alive
 * - dead: objects that were alive and are now destroyed
 *
 * This allows JavaScript wrappers to detect use-after-free by calling isDead().
 */
class MemoryTrackedRegistry {
 public:
  // Internal C++ API (used by MemoryTracked).
  static void add(const void* ptr, const char* className) {
    uint64_t key = hash(ptr, className);
    dead().erase(key);
    alive().insert(key);
  }

  static void remove(const void* ptr, const char* className) {
    uint64_t key = hash(ptr, className);
    alive().erase(key);
    dead().insert(key);
  }

  static bool isDead(const void* ptr, const char* className) {
    uint64_t key = hash(ptr, className);
    return dead().count(key) > 0;
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

  static long deadCount() { return static_cast<long>(dead().size()); }

  static void pruneDead(long maxSize) {
    if (static_cast<long>(dead().size()) > maxSize) {
      dead().clear();
    }
  }

 private:
  // FNV-1a hash mixing pointer bytes and class name string.
  static uint64_t hash(const void* ptr, const char* className) {
    uint64_t h = 14695981039346656037ULL;  // FNV offset basis
    const uint64_t prime = 1099511628211ULL;

    // Hash the pointer value (not the pointed-to data).
    auto ptrVal = reinterpret_cast<uintptr_t>(ptr);
    const auto* bytes = reinterpret_cast<const unsigned char*>(&ptrVal);
    for (size_t i = 0; i < sizeof(ptrVal); i++) {
      h ^= bytes[i];
      h *= prime;
    }

    // Hash the class name string.
    for (const char* c = className; *c != '\0'; c++) {
      h ^= static_cast<unsigned char>(*c);
      h *= prime;
    }

    return h;
  }

  // Heap-allocated sets (intentionally leaked) to avoid static destruction
  // order issues.
  static std::set<uint64_t>& alive() {
    static auto* s = new std::set<uint64_t>();
    return *s;
  }

  static std::set<uint64_t>& dead() {
    static auto* s = new std::set<uint64_t>();
    return *s;
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
