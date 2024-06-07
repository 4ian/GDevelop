/*
 * GDevelop Core
 * Copyright 2008-2024 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"
#include <map>
#include <memory>
#include <vector>

namespace gd {
class Instruction;
class Platform;
class ProjectScopedContainers;
} // namespace gd

namespace gd {

/**
 * \brief Fill empty behavior parameters with any behavior that matches the
 * required behavior type.
 *
 * \ingroup IDE
 */
class GD_CORE_API BehaviorParametersFiller : public ArbitraryEventsWorker {
public:
  BehaviorParametersFiller(
      const gd::Platform &platform_,
      const gd::ProjectScopedContainers &projectScopedContainers_)
      : platform(platform_),
        projectScopedContainers(projectScopedContainers_){};
  virtual ~BehaviorParametersFiller();

private:
  bool DoVisitInstruction(gd::Instruction &instruction,
                          bool isCondition) override;

  const gd::Platform &platform;
  const gd::ProjectScopedContainers &projectScopedContainers;
};

} // namespace gd
