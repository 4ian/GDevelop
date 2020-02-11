/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDJS_EVENTSFUNCTIONSEXTENSIONCODEGENERATOR_H
#define GDJS_EVENTSFUNCTIONSEXTENSIONCODEGENERATOR_H
#include <map>
#include <set>
#include <string>
#include <vector>
#include "GDCore/Project/EventsFunctionsExtension.h"
namespace gd {
class NamedPropertyDescriptor;
}

namespace gdjs {

/**
 * \brief The class being responsible for generating JavaScript code for
 * EventsFunctionsExtension.
 *
 * See also gd::BehaviorCodeGenerator.
 * See also gd::EventsCodeGenerator.
 */
class EventsFunctionsExtensionCodeGenerator {
 public:
  EventsFunctionsExtensionCodeGenerator(gd::Project& project_)
      : project(project_){};

  /**
   * \brief Generate the complete code for the specified events function.
   */
  gd::String GenerateFreeEventsFunctionCompleteCode(
      const gd::EventsFunction& eventsFunction,
      const gd::String& codeNamespace,
      std::set<gd::String>& includeFiles,
      bool compilationForRuntime);

 private:
  gd::Project& project;
};

}  // namespace gdjs
#endif  // GDJS_EVENTSFUNCTIONSEXTENSIONCODEGENERATOR_H
