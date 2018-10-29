/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsContextAnalyzer.h"
#include <map>
#include <memory>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Parsers/ExpressionParser.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

// TODO: Replace and remove (ExpressionObjectsFinder)
class CallbacksForListingObjects : public gd::ParserCallbacks {
 public:
  CallbacksForListingObjects(const gd::Platform& platform_,
                             const gd::ObjectsContainer& project_,
                             const gd::ObjectsContainer& layout_,
                             EventsContext& context_)
      : platform(platform_),
        project(project_),
        layout(layout_),
        context(context_){};
  virtual ~CallbacksForListingObjects(){};

  virtual void OnConstantToken(gd::String text){};

  virtual void OnStaticFunction(gd::String functionName,
                                const std::vector<gd::Expression>& parameters,
                                const gd::ExpressionMetadata& expressionInfo) {
    for (std::size_t i = 0;
         i < parameters.size() && i < expressionInfo.parameters.size();
         ++i) {
      EventsContextAnalyzer::AnalyzeParameter(platform,
                                              project,
                                              layout,
                                              expressionInfo.parameters[i],
                                              parameters[i],
                                              context);
    }
  };

  virtual void OnObjectFunction(gd::String functionName,
                                const std::vector<gd::Expression>& parameters,
                                const gd::ExpressionMetadata& expressionInfo) {
    for (std::size_t i = 0;
         i < parameters.size() && i < expressionInfo.parameters.size();
         ++i) {
      EventsContextAnalyzer::AnalyzeParameter(platform,
                                              project,
                                              layout,
                                              expressionInfo.parameters[i],
                                              parameters[i],
                                              context);
    }
  };

  virtual void OnObjectBehaviorFunction(
      gd::String functionName,
      const std::vector<gd::Expression>& parameters,
      const gd::ExpressionMetadata& expressionInfo) {
    for (std::size_t i = 0;
         i < parameters.size() && i < expressionInfo.parameters.size();
         ++i) {
      EventsContextAnalyzer::AnalyzeParameter(platform,
                                              project,
                                              layout,
                                              expressionInfo.parameters[i],
                                              parameters[i],
                                              context);
    }
  };

  virtual bool OnSubMathExpression(const gd::Platform& platform,
                                   const gd::ObjectsContainer& project,
                                   const gd::ObjectsContainer& layout,
                                   gd::Expression& expression) {
    CallbacksForListingObjects callbacks(platform, project, layout, context);

    gd::ExpressionParser parser(expression.GetPlainString());
    parser.ParseMathExpression(platform, project, layout, callbacks);
    return true;
  }

  virtual bool OnSubTextExpression(const gd::Platform& platform,
                                   const gd::ObjectsContainer& project,
                                   const gd::ObjectsContainer& layout,
                                   gd::Expression& expression) {
    CallbacksForListingObjects callbacks(platform, project, layout, context);

    gd::ExpressionParser parser(expression.GetPlainString());
    parser.ParseStringExpression(platform, project, layout, callbacks);
    return true;
  }

 private:
  const gd::Platform& platform;
  const gd::ObjectsContainer& project;
  const gd::ObjectsContainer& layout;
  EventsContext& context;
};

bool EventsContextAnalyzer::DoVisitInstruction(gd::Instruction& instruction,
                                               bool isCondition) {
  const gd::InstructionMetadata& instrInfo =
      isCondition ? MetadataProvider::GetConditionMetadata(
                        platform, instruction.GetType())
                  : MetadataProvider::GetActionMetadata(platform,
                                                        instruction.GetType());

  for (int i = 0; i < instruction.GetParametersCount() &&
                  i < instrInfo.GetParametersCount();
       ++i) {
    AnalyzeParameter(platform,
                     project,
                     layout,
                     instrInfo.GetParameter(i),
                     instruction.GetParameter(i),
                     context);
  }

  return false;
}

void EventsContextAnalyzer::AnalyzeParameter(
    const gd::Platform& platform,
    const gd::ObjectsContainer& project,
    const gd::ObjectsContainer& layout,
    const gd::ParameterMetadata& metadata,
    const gd::Expression& parameter,
    EventsContext& context) {
  const auto& value = parameter.GetPlainString();
  const auto& type = metadata.GetType();
  if (ParameterMetadata::IsObject(type)) {
    context.AddObjectName(value);
  } else if (ParameterMetadata::IsExpression("number", type)) {
    CallbacksForListingObjects callbacks(platform, project, layout, context);

    gd::ExpressionParser parser(value);
    parser.ParseMathExpression(platform, project, layout, callbacks);
  } else if (ParameterMetadata::IsExpression("string", type)) {
    CallbacksForListingObjects callbacks(platform, project, layout, context);

    gd::ExpressionParser parser(value);
    parser.ParseStringExpression(platform, project, layout, callbacks);
  }
}

void EventsContext::AddObjectName(const gd::String& objectName) {
  for (auto& realObjectName : ExpandObjectsName(objectName)) {
    objectNames.insert(realObjectName);
  }
  objectOrGroupNames.insert(objectName);
}

std::vector<gd::String> EventsContext::ExpandObjectsName(
    const gd::String& objectName) {
  // Note: this logic is duplicated in EventsCodeGenerator::ExpandObjectsName
  std::vector<gd::String> realObjects;
  if (project.GetObjectGroups().Has(objectName))
    realObjects =
        project.GetObjectGroups().Get(objectName).GetAllObjectsNames();
  else if (layout.GetObjectGroups().Has(objectName))
    realObjects = layout.GetObjectGroups().Get(objectName).GetAllObjectsNames();
  else
    realObjects.push_back(objectName);

  // Ensure that all returned objects actually exists.
  for (std::size_t i = 0; i < realObjects.size();) {
    if (!layout.HasObjectNamed(realObjects[i]) &&
        !project.HasObjectNamed(realObjects[i]))
      realObjects.erase(realObjects.begin() + i);
    else
      ++i;
  }

  return realObjects;
}

}  // namespace gd
