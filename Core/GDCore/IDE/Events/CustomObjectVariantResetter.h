/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_CUSTOMOBJECTVARIANTRESETTER_H
#define GDCORE_CUSTOMOBJECTVARIANTRESETTER_H

#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Object;
class Behavior;
}  // namespace gd

namespace gd {

/**
 * \brief Make the objects of a given custom object type that use a given
 * variant use the default variant instead (typically because the variant is
 * about to be deleted).
 */
class GD_CORE_API CustomObjectVariantResetter : public ArbitraryObjectsWorker {
 public:
  CustomObjectVariantResetter(const gd::String& objectType_,
                              const gd::String& variantName_)
      : objectType(objectType_), variantName(variantName_){};
  virtual ~CustomObjectVariantResetter();

 private:
  void DoVisitObject(gd::Object& object) override;
  void DoVisitBehavior(gd::Behavior& behavior) override;

  gd::String objectType;
  gd::String variantName;
};

};  // namespace gd

#endif  // GDCORE_CUSTOMOBJECTVARIANTRESETTER_H
