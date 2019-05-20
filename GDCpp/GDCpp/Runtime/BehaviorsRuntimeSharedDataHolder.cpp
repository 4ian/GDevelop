/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "BehaviorsRuntimeSharedDataHolder.h"
#include <iostream>
#include "GDCpp/Extensions/CppPlatform.h"
#include "GDCpp/Runtime/BehaviorsRuntimeSharedData.h"
#include "GDCpp/Runtime/Project/BehaviorContent.h"

const std::shared_ptr<BehaviorsRuntimeSharedData>&
BehaviorsRuntimeSharedDataHolder::GetBehaviorSharedData(
    const gd::String& behaviorName) const {
  return behaviorsSharedDatas.find(behaviorName)->second;
}

void BehaviorsRuntimeSharedDataHolder::LoadFrom(
    const std::map<gd::String, std::unique_ptr<gd::BehaviorContent>>&
        sharedData) {
  behaviorsSharedDatas.clear();
  for (auto& it : sharedData) {
    const gd::String& type = it.second->GetTypeName();
    const gd::String& name = it.second->GetName();

    std::unique_ptr<BehaviorsRuntimeSharedData> runtimeSharedData =
        CppPlatform::Get().CreateBehaviorsRuntimeSharedData(
            type, it.second->GetContent());

    if (runtimeSharedData)
      behaviorsSharedDatas[name] = std::move(runtimeSharedData);
    else
      std::cout << "ERROR: Unable to create shared data for behavior \"" << type
                << "\".";
  }
}

BehaviorsRuntimeSharedDataHolder::BehaviorsRuntimeSharedDataHolder(
    const BehaviorsRuntimeSharedDataHolder& other) {
  Init(other);
}

BehaviorsRuntimeSharedDataHolder& BehaviorsRuntimeSharedDataHolder::operator=(
    const BehaviorsRuntimeSharedDataHolder& other) {
  if ((this) != &other) Init(other);

  return *this;
}

void BehaviorsRuntimeSharedDataHolder::Init(
    const BehaviorsRuntimeSharedDataHolder& other) {
  behaviorsSharedDatas.clear();
  for (std::map<gd::String,
                std::shared_ptr<BehaviorsRuntimeSharedData>>::const_iterator
           it = other.behaviorsSharedDatas.begin();
       it != other.behaviorsSharedDatas.end();
       ++it) {
    behaviorsSharedDatas[it->first] = it->second->Clone();
  }
}
