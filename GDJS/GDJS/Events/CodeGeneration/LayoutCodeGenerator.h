/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <map>
#include <set>
#include <string>
#include <vector>
#include "GDCore/Project/Layout.h"
#include "GDCore/Events/CodeGeneration/DiagnosticReport.h"

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
      gd::DiagnosticReport& diagnosticReport,
      bool compilationForRuntime);

  /**
   * \brief Generate the body of a JavaScript function `(runtimeScene) => ...`
   * evaluating an expression in the running scene, so that the editor can
   * display the value of a parameter while a preview runs.
   *
   * The function returns `{ result, variables }`: the value of the whole
   * expression and, for each variable it uses (keyed by its text), the
   * variable itself. Objects are resolved to all their instances.
   *
   * \param type The type of the expression ("number", "string", "variable"...).
   * \param objectName The object owning the variable, for object variables.
   */
  gd::String GenerateExpressionEvaluationCode(const gd::Layout& layout,
                                              const gd::String& type,
                                              const gd::String& expression,
                                              const gd::String& objectName);

 private:
  const gd::Project& project;
};

}  // namespace gdjs
