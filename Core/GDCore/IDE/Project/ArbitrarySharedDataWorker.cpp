/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ArbitrarySharedDataWorker.h"

#include <iostream>
#include <map>
#include <memory>
#include <vector>

#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/String.h"

using namespace std;

namespace gd {

ArbitrarySharedDataWorker::~ArbitrarySharedDataWorker() {}

void ArbitrarySharedDataWorker::VisitSharedDatas(
    const std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData>>
        &sharedDatas) {
  DoVisitSharedDatas(sharedDatas);

  for (auto &behaviorSharedDataContent : sharedDatas) {
    VisitSharedData(*behaviorSharedDataContent.second);
  }
}

void ArbitrarySharedDataWorker::VisitSharedData(
    gd::BehaviorsSharedData &sharedData) {
  DoVisitSharedData(sharedData);
}

} // namespace gd
