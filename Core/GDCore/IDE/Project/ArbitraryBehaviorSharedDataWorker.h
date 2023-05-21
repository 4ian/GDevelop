/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <map>
#include <memory>
#include <vector>

#include "GDCore/String.h"
#include "GDCore/Tools/SerializableWithNameList.h"

namespace gd {
class BehaviorsSharedData;
}  // namespace gd

namespace gd {

/**
 * \brief ArbitraryBehaviorSharedDataWorker is an abstract class used to browse
 * shared data and do some work on them. It can be used to implement
 * refactoring for example.
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryBehaviorSharedDataWorker {
 public:
  ArbitraryBehaviorSharedDataWorker(){};
  virtual ~ArbitraryBehaviorSharedDataWorker();

  /**
   * \brief Launch the worker on the specified shared data.
   */
  void Launch(const std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData>>& sharedDatas) { VisitSharedDatas(sharedDatas); };

 private:
  void VisitSharedDatas(const std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData>>& sharedDatas);
  void VisitSharedData(gd::BehaviorsSharedData& behavior);

  /**
   * Called to do some work on shared data.
   */
  virtual void DoVisitSharedDatas(const std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData>>& sharedDatas){};

  /**
   * Called to do some work on a shared data.
   */
  virtual void DoVisitSharedData(gd::BehaviorsSharedData& sharedData){};
};

}  // namespace gd

