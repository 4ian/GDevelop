/*
 * GDevelop Core
 * Copyright 2008-2026 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once
#include <set>

#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Object;
class Behavior;
} // namespace gd

namespace gd {

/**
 * \brief Rename a property in all custom objects of a given type.
 */
class GD_CORE_API ObjectPropertyRenamer : public ArbitraryObjectsWorker {
public:
  ObjectPropertyRenamer(const gd::String &objectType_,
                        const gd::String &oldName_, const gd::String &newName_)
      : objectType(objectType_), oldName(oldName_), newName(newName_){};
  virtual ~ObjectPropertyRenamer();

private:
  void DoVisitObject(gd::Object &object) override;
  void DoVisitBehavior(gd::Behavior &behavior) override;

  gd::String objectType;
  gd::String oldName;
  gd::String newName;
};

}; // namespace gd
