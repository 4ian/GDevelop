/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_ARBITRARYSHAREDDATAWORKER_H
#define GDCORE_ARBITRARYSHAREDDATAWORKER_H

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
 * \brief ArbitrarySharedDataWorker is an abstract class used to browse
 * shared data and do some work on them. It can be used to implement
 * refactoring for example.
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitrarySharedDataWorker {
 public:
  ArbitrarySharedDataWorker(){};
  virtual ~ArbitrarySharedDataWorker();

  /**
   * \brief Launch the worker on the specified function container.
   */
  void Launch(const std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData>>& sharedDatas) { VisitSharedDatas(sharedDatas); };

 private:
  void VisitSharedDatas(const std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData>>& sharedDatas);
  void VisitSharedData(gd::BehaviorsSharedData& behavior);

  /**
   * Called to do some work on an function container.
   */
  virtual void DoVisitSharedDatas(const std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData>>& sharedDatas){};

  /**
   * Called to do some work on a function.
   */
  virtual void DoVisitSharedData(gd::BehaviorsSharedData& sharedData){};
};

}  // namespace gd

#endif  // GDCORE_ARBITRARYSHAREDDATAWORKER_H
