/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDJS_LAYOUTCODEGENERATOR_H
#define GDJS_LAYOUTCODEGENERATOR_H
#include <map>
#include <set>
#include <string>
#include <vector>
#include "GDCore/Project/Layout.h"

namespace gdjs {

/**
 * \brief The class being responsible for generating JavaScript code for
 * the events of a scene.
 *
 * See also gd::BehaviorCodeGenerator.
 * See also gd::EventsCodeGenerator.
 */
class LayoutCodeGenerator {
 public:
  LayoutCodeGenerator(const gd::Project& project_)
      : project(project_){};

  /**
   * \brief Generate the complete code for the events of the specified scene.
   */
  gd::String GenerateLayoutCompleteCode(
      const gd::Layout& layout,
      std::set<gd::String>& includeFiles,
      bool compilationForRuntime);

 private:
  const gd::Project& project;
};

}  // namespace gdjs
#endif  // GDJS_LAYOUTCODEGENERATOR_H
