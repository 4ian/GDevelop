/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef BEHAVIORSRUNTIMESHAREDDATAS_HOLDER_H
#define BEHAVIORSRUNTIMESHAREDDATAS_HOLDER_H
#include <map>
#include <memory>
#include <string>
#include "GDCpp/Runtime/String.h"
class BehaviorsRuntimeSharedData;
namespace gd {
class BehaviorContent;
}

/**
 * \brief Contains all the shared data of the behaviors of a RuntimeScene.
 */
class GD_API BehaviorsRuntimeSharedDataHolder {
 public:
  BehaviorsRuntimeSharedDataHolder(){};
  BehaviorsRuntimeSharedDataHolder(
      const BehaviorsRuntimeSharedDataHolder& other);
  BehaviorsRuntimeSharedDataHolder& operator=(
      const BehaviorsRuntimeSharedDataHolder& other);

  /**
   * \brief Return the shared data for a behavior.
   * \warning Be careful, no check is made to ensure that the shared data exist.
   * \param name The name of the behavior for which shared data must be fetched.
   */
  const std::shared_ptr<BehaviorsRuntimeSharedData>& GetBehaviorSharedData(
      const gd::String& behaviorName) const;

  /**
   * \brief Create all runtime shared data according to the shared data content
   * passed as argument.
   */
  void LoadFrom(
      const std::map<gd::String, std::unique_ptr<gd::BehaviorContent>>&
          sharedData);

 private:
  void Init(const BehaviorsRuntimeSharedDataHolder& other);

  std::map<gd::String, std::shared_ptr<BehaviorsRuntimeSharedData>>
      behaviorsSharedDatas;
};

#endif
