/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef BEHAVIORSRUNTIMESHAREDDATAS_H
#define BEHAVIORSRUNTIMESHAREDDATAS_H

namespace gd {
class BehaviorsSharedData;
class SerializerElement;
}
#include <memory>

/**
 * \brief Base class for defining behaviors shared datas used at runtime.
 *
 * Behaviors can use shared datas, as if they were extending the RuntimeScene
 * members.
 *
 * \ingroup GameEngine
 */
class BehaviorsRuntimeSharedData {
 public:
  BehaviorsRuntimeSharedData(const gd::SerializerElement& behaviorSharedDataContent){};
  virtual ~BehaviorsRuntimeSharedData(){};
  virtual std::shared_ptr<BehaviorsRuntimeSharedData> Clone() const {
    return std::shared_ptr<BehaviorsRuntimeSharedData>(
        new BehaviorsRuntimeSharedData(*this));
  }
};

#endif  // BEHAVIORSRUNTIMESHAREDDATAS_H
