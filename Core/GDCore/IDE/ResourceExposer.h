/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

namespace gd {
class Platform;
class Project;
class ArbitraryResourceWorker;
class Effect;
class Layout;
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
  static void ExposeWholeProjectResources(gd::Project &project,
                                          gd::ArbitraryResourceWorker &worker);

  /**
   * @brief Expose only the resources used globally on a project.
   * 
   * It doesn't include resources used in layouts.
   */
  static void ExposeProjectResources(gd::Project &project,
                                     gd::ArbitraryResourceWorker &worker);

  /**
   * @brief Expose the resources used in a given layout.
   * 
   * It doesn't include resources used globally.
   */
  static void ExposeLayoutResources(gd::Project &project, gd::Layout &layout,
                                          gd::ArbitraryResourceWorker &worker);

  /**
   * @brief Expose the resources used in a given effect.
   */
  static void ExposeEffectResources(gd::Platform &platform, gd::Effect &effect,
                                    gd::ArbitraryResourceWorker &worker);
};

} // namespace gd
