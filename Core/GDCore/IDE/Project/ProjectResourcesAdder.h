/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef PROJECTRESOURCESADDER_H
#define PROJECTRESOURCESADDER_H
#include <vector>
#include "GDCore/String.h"
namespace gd {
class Project;
}

namespace gd {

/**
 * \brief Automatically add missing resources of a project.
 *
 * \ingroup IDE
 */
class GD_CORE_API ProjectResourcesAdder {
 public:
  /**
   * \brief Find all resources of the specified kind that are
   * not used by the project.
   *
   * \param project The project to be crawled.
   * \param resourceType The type of the resource the be searched
   *
   * \return A vector containing the name of all unused resources
   */
  static std::vector<gd::String> GetAllUseless(gd::Project& project, const gd::String & resourceType);

  /**
   * \brief Remove all resources of the specified kind that are not used
   * by the project.
   *
   * \param project The project to be crawled.
   * \param resourceType The type of the resource the be searched
   */
  static void RemoveAllUseless(gd::Project& project, const gd::String & resourceType);
};

}  // namespace gd

#endif  // PROJECTRESOURCESADDER_H
