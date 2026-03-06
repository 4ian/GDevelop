/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <unordered_set>
#include <cstdint>

// MemoryTrackedRegistry.h — Pointer liveness tracking for WebIDL objects
//
// Two ways to use:
//
//   1. Inherit from MemoryTracked (easiest):
//        class Layout : public MemoryTracked { ... };
//
//   2. Manual (if inheritance is awkward):
//        Layout::Layout()  { MemoryTrackedRegistry::Add(this); }
//        Layout::~Layout() { MemoryTrackedRegistry::Remove(this); }

namespace gd {

class MemoryTrackedRegistry {
public:
    static void Add(const void* ptr) {
        auto p = reinterpret_cast<uintptr_t>(ptr);
        Dead().erase(p);
        Alive().insert(p);
    }

    static void Remove(const void* ptr) {
        auto p = reinterpret_cast<uintptr_t>(ptr);
        Alive().erase(p);
        Dead().insert(p);
    }

    // Returns true ONLY if we have positive evidence of death:
    //   Add() was called, then Remove() was called, and no subsequent Add().
    // Returns false for untracked pointers (never seen by the registry).
    static bool IsDead(unsigned int ptr) {
        return Dead().count(static_cast<uintptr_t>(ptr)) > 0;
    }

    static size_t AliveCount() { return Alive().size(); }
    static size_t DeadCount()  { return Dead().size(); }

    // Prune the dead set. Safe to call periodically for long sessions.
    static void PruneDead(size_t maxSize = 10000) {
        if (Dead().size() <= maxSize) return;
        Dead().clear();
    }

private:
    // Intentionally leaked: never destroyed, so MemoryTracked destructors
    // running during program teardown can safely call Remove().
    // In a Wasm context the process memory is reclaimed anyway.
    static std::unordered_set<uintptr_t>& Alive() {
        static auto* instance = new std::unordered_set<uintptr_t>();
        return *instance;
    }

    static std::unordered_set<uintptr_t>& Dead() {
        static auto* instance = new std::unordered_set<uintptr_t>();
        return *instance;
    }
};

// RAII base class.
// Handles copy and move correctly (each instance is its own address).
class MemoryTracked {
public:
    MemoryTracked()                          { MemoryTrackedRegistry::Add(this); }
    ~MemoryTracked()                         { MemoryTrackedRegistry::Remove(this); }

    MemoryTracked(const MemoryTracked&)            { MemoryTrackedRegistry::Add(this); }
    MemoryTracked& operator=(const MemoryTracked&) { return *this; }
    MemoryTracked(MemoryTracked&&)                 { MemoryTrackedRegistry::Add(this); }
    MemoryTracked& operator=(MemoryTracked&&)      { return *this; }
};

}  // namespace gd
