/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

namespace gd {
class Project;
class ArbitraryResourceWorker;
} // namespace gd

namespace gd {

/**
 * \brief 
 */
class GD_CORE_API ResourceExposer {
public:
  /**
   * \brief Called ( e.g. during compilation ) so as to inventory internal
   * resources, sometimes update their filename or any other work or resources.
   *
   * See WholeProjectRefactorer for the same thing for events.
   *
   * \see WholeProjectRefactorer
   * \see ArbitraryResourceWorker
   */
  static void ExposeWholeProjectResources(gd::Project& project, gd::ArbitraryResourceWorker& worker);
};

} // namespace gd
