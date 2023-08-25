#include "BehaviorDefaultFlagClearer.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {

void BehaviorDefaultFlagClearer::DoVisitObject(gd::Object& object) {
};

void BehaviorDefaultFlagClearer::DoVisitBehavior(gd::Behavior& behavior) {
  behavior.SetDefaultBehavior(false);
};

BehaviorDefaultFlagClearer::~BehaviorDefaultFlagClearer() {}

}  // namespace gd
