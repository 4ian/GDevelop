// GDevelop Core
// Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com)
// This project is released under the MIT License.

#include "ArbitraryBehaviorSharedDataWorker.h"
#include "GDCore/Project/BehaviorsSharedData.h"

namespace gd {

ArbitraryBehaviorSharedDataWorker::~ArbitraryBehaviorSharedDataWorker() = default;

// Visit all shared behavior data, applying DoVisitSharedDatas and then each shared data individually.
void ArbitraryBehaviorSharedDataWorker::VisitSharedDatas(
    const std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData>>& sharedDatas) {
  DoVisitSharedDatas(sharedDatas);
  for (const auto& pair : sharedDatas) {
    VisitSharedData(*pair.second);
  }
}

// Visit a single shared behavior data.
void ArbitraryBehaviorSharedDataWorker::VisitSharedData(
    gd::BehaviorsSharedData& sharedData) {
  DoVisitSharedData(sharedData);
}

} // namespace gd
