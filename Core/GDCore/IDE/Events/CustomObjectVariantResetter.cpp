#include "CustomObjectVariantResetter.h"

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/CustomObjectConfiguration.h"
#include "GDCore/Project/Object.h"

namespace gd {

void CustomObjectVariantResetter::DoVisitObject(gd::Object& object) {
  if (object.GetType() != objectType) return;

  auto* customObjectConfiguration =
      dynamic_cast<gd::CustomObjectConfiguration*>(&object.GetConfiguration());
  if (customObjectConfiguration &&
      customObjectConfiguration->GetVariantName() == variantName) {
    customObjectConfiguration->SetVariantName("");
  }
};

void CustomObjectVariantResetter::DoVisitBehavior(gd::Behavior& behavior) {};

CustomObjectVariantResetter::~CustomObjectVariantResetter() {}

}  // namespace gd
