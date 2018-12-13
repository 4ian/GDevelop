/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/IDE/Events/EventsRefactorer.h"
#include <memory>
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/ObjectsContainer.h"

using namespace std;

namespace gd {

/**
 * \brief Go through the nodes and change the given object name to a new one.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionObjectRenamer : public ExpressionParser2NodeWorker {
 public:
  ExpressionObjectRenamer(const gd::String& objectName_,
                          const gd::String& objectNewName_)
      : hasDoneRenaming(false), objectName(objectName_), objectNewName(objectNewName_){};
  virtual ~ExpressionObjectRenamer(){};

  static bool Rename(gd::ExpressionNode & node, const gd::String& objectName, const gd::String& objectNewName) {
    if (ExpressionValidator::HasNoErrors(node)) {  
      ExpressionObjectRenamer renamer(objectName, objectNewName);
      node.Visit(renamer);

      return renamer.HasDoneRenaming();
    }

    return false;
  }

  bool HasDoneRenaming() const { return hasDoneRenaming; }

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    node.expression->Visit(*this);
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    node.leftHandSide->Visit(*this);
    node.rightHandSide->Visit(*this);
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    node.factor->Visit(*this);
  }
  void OnVisitNumberNode(NumberNode& node) override {}
  void OnVisitTextNode(TextNode& node) override {}
  void OnVisitVariableNode(VariableNode& node) override {
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    node.expression->Visit(*this);
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {}
  void OnVisitFunctionNode(FunctionNode& node) override {
    if (node.objectName == objectName) {
      hasDoneRenaming = true;
      node.objectName = objectNewName;
    }
    for (auto& parameter : node.parameters) {
      parameter->Visit(*this);
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  bool hasDoneRenaming;
  const gd::String& objectName;
  const gd::String& objectNewName;
};

/**
 * \brief Go through the nodes and check if the given object is being used
 * in the expression.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionObjectFinder : public ExpressionParser2NodeWorker {
 public:
  ExpressionObjectFinder(const gd::String& objectName_)
      : hasObject(false), objectName(objectName_) {};
  virtual ~ExpressionObjectFinder(){};

  static bool CheckIfHasObject(gd::ExpressionNode & node, const gd::String & objectName) {
    if (ExpressionValidator::HasNoErrors(node)) {  
      ExpressionObjectFinder finder(objectName);
      node.Visit(finder);

      return finder.HasFoundObject();
    }

    return false;
  }

  bool HasFoundObject() const { return hasObject; }

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    node.expression->Visit(*this);
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    node.leftHandSide->Visit(*this);
    node.rightHandSide->Visit(*this);
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    node.factor->Visit(*this);
  }
  void OnVisitNumberNode(NumberNode& node) override {}
  void OnVisitTextNode(TextNode& node) override {}
  void OnVisitVariableNode(VariableNode& node) override {
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    node.expression->Visit(*this);
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {}
  void OnVisitFunctionNode(FunctionNode& node) override {
    if (node.objectName == objectName) {
      hasObject = true;
    }
    for (auto& parameter : node.parameters) {
      parameter->Visit(*this);
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  bool hasObject;
  const gd::String& objectName;
};

bool EventsRefactorer::RenameObjectInActions(const gd::Platform& platform,
                                             gd::ObjectsContainer& project,
                                             gd::ObjectsContainer& layout,
                                             gd::InstructionsList& actions,
                                             gd::String oldName,
                                             gd::String newName) {
  bool somethingModified = false;

  for (std::size_t aId = 0; aId < actions.size(); ++aId) {
    gd::InstructionMetadata instrInfos =
        MetadataProvider::GetActionMetadata(platform, actions[aId].GetType());
    for (std::size_t pNb = 0; pNb < instrInfos.parameters.size(); ++pNb) {
      // Replace object's name in parameters
      if (gd::ParameterMetadata::IsObject(instrInfos.parameters[pNb].type) &&
          actions[aId].GetParameter(pNb).GetPlainString() == oldName)
        actions[aId].SetParameter(pNb, gd::Expression(newName));
      // Replace object's name in expressions
      else if (ParameterMetadata::IsExpression(
                   "number", instrInfos.parameters[pNb].type)) {
        gd::ExpressionParser2 parser(platform, project, layout);
        auto node = parser.ParseExpression("number", actions[aId].GetParameter(pNb).GetPlainString());
        
        if (ExpressionObjectRenamer::Rename(*node, oldName, newName)) {
          actions[aId].SetParameter(pNb, ExpressionParser2NodePrinter::PrintNode(*node));
        }
      }
      // Replace object's name in text expressions
      else if (ParameterMetadata::IsExpression(
                   "string", instrInfos.parameters[pNb].type)) {
        gd::ExpressionParser2 parser(platform, project, layout);
        auto node = parser.ParseExpression("string", actions[aId].GetParameter(pNb).GetPlainString());
        
        if (ExpressionObjectRenamer::Rename(*node, oldName, newName)) {
          actions[aId].SetParameter(pNb, ExpressionParser2NodePrinter::PrintNode(*node));
        }
      }
    }

    if (!actions[aId].GetSubInstructions().empty())
      somethingModified =
          RenameObjectInActions(platform,
                                project,
                                layout,
                                actions[aId].GetSubInstructions(),
                                oldName,
                                newName) ||
          somethingModified;
  }

  return somethingModified;
}

bool EventsRefactorer::RenameObjectInConditions(
    const gd::Platform& platform,
    gd::ObjectsContainer& project,
    gd::ObjectsContainer& layout,
    gd::InstructionsList& conditions,
    gd::String oldName,
    gd::String newName) {
  bool somethingModified = false;

  for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
    gd::InstructionMetadata instrInfos = MetadataProvider::GetConditionMetadata(
        platform, conditions[cId].GetType());
    for (std::size_t pNb = 0; pNb < instrInfos.parameters.size(); ++pNb) {
      // Replace object's name in parameters
      if (gd::ParameterMetadata::IsObject(instrInfos.parameters[pNb].type) &&
          conditions[cId].GetParameter(pNb).GetPlainString() == oldName)
        conditions[cId].SetParameter(pNb, gd::Expression(newName));
      // Replace object's name in expressions
      else if (ParameterMetadata::IsExpression(
                   "number", instrInfos.parameters[pNb].type)) {
        gd::ExpressionParser2 parser(platform, project, layout);
        auto node = parser.ParseExpression("number", conditions[cId].GetParameter(pNb).GetPlainString());
        
        if (ExpressionObjectRenamer::Rename(*node, oldName, newName)) {
          conditions[cId].SetParameter(pNb, ExpressionParser2NodePrinter::PrintNode(*node));
        }
      }
      // Replace object's name in text expressions
      else if (ParameterMetadata::IsExpression(
                   "string", instrInfos.parameters[pNb].type)) {
        gd::ExpressionParser2 parser(platform, project, layout);
        auto node = parser.ParseExpression("string", conditions[cId].GetParameter(pNb).GetPlainString());
        
        if (ExpressionObjectRenamer::Rename(*node, oldName, newName)) {
          conditions[cId].SetParameter(pNb, ExpressionParser2NodePrinter::PrintNode(*node));
        }
      }
    }

    if (!conditions[cId].GetSubInstructions().empty())
      somethingModified =
          RenameObjectInConditions(platform,
                                   project,
                                   layout,
                                   conditions[cId].GetSubInstructions(),
                                   oldName,
                                   newName) ||
          somethingModified;
  }

  return somethingModified;
}

void EventsRefactorer::RenameObjectInEvents(const gd::Platform& platform,
                                            gd::ObjectsContainer& project,
                                            gd::ObjectsContainer& layout,
                                            gd::EventsList& events,
                                            gd::String oldName,
                                            gd::String newName) {
  for (std::size_t i = 0; i < events.size(); ++i) {
    vector<gd::InstructionsList*> conditionsVectors =
        events[i].GetAllConditionsVectors();
    for (std::size_t j = 0; j < conditionsVectors.size(); ++j) {
      bool somethingModified = RenameObjectInConditions(
          platform, project, layout, *conditionsVectors[j], oldName, newName);
#if defined(GD_IDE_ONLY)
      if (somethingModified) events[i].eventHeightNeedUpdate = true;
#endif
    }

    vector<gd::InstructionsList*> actionsVectors =
        events[i].GetAllActionsVectors();
    for (std::size_t j = 0; j < actionsVectors.size(); ++j) {
      bool somethingModified = RenameObjectInActions(
          platform, project, layout, *actionsVectors[j], oldName, newName);
#if defined(GD_IDE_ONLY)
      if (somethingModified) events[i].eventHeightNeedUpdate = true;
#endif
    }

    if (events[i].CanHaveSubEvents())
      RenameObjectInEvents(platform,
                           project,
                           layout,
                           events[i].GetSubEvents(),
                           oldName,
                           newName);
  }
}

bool EventsRefactorer::RemoveObjectInActions(const gd::Platform& platform,
                                             gd::ObjectsContainer& project,
                                             gd::ObjectsContainer& layout,
                                             gd::InstructionsList& actions,
                                             gd::String name) {
  bool somethingModified = false;

  for (std::size_t aId = 0; aId < actions.size(); ++aId) {
    bool deleteMe = false;

    gd::InstructionMetadata instrInfos =
        MetadataProvider::GetActionMetadata(platform, actions[aId].GetType());
    for (std::size_t pNb = 0; pNb < instrInfos.parameters.size(); ++pNb) {
      // Find object's name in parameters
      if (gd::ParameterMetadata::IsObject(instrInfos.parameters[pNb].type) &&
          actions[aId].GetParameter(pNb).GetPlainString() == name) {
        deleteMe = true;
        break;
      }
      // Find object's name in expressions
      else if (ParameterMetadata::IsExpression(
                   "number", instrInfos.parameters[pNb].type)) {
        gd::ExpressionParser2 parser(platform, project, layout);
        auto node = parser.ParseExpression("number", actions[aId].GetParameter(pNb).GetPlainString());
        
        if (ExpressionObjectFinder::CheckIfHasObject(*node, name)) {
          deleteMe = true;
          break;
        }
      }
      // Find object's name in text expressions
      else if (ParameterMetadata::IsExpression(
                   "string", instrInfos.parameters[pNb].type)) {
        gd::ExpressionParser2 parser(platform, project, layout);
        auto node = parser.ParseExpression("string", actions[aId].GetParameter(pNb).GetPlainString());
        
        if (ExpressionObjectFinder::CheckIfHasObject(*node, name)) {
          deleteMe = true;
          break;
        }
      }
    }

    if (deleteMe) {
      somethingModified = true;
      actions.Remove(aId);
      aId--;
    } else if (!actions[aId].GetSubInstructions().empty())
      somethingModified =
          RemoveObjectInActions(platform,
                                project,
                                layout,
                                actions[aId].GetSubInstructions(),
                                name) ||
          somethingModified;
  }

  return somethingModified;
}

bool EventsRefactorer::RemoveObjectInConditions(
    const gd::Platform& platform,
    gd::ObjectsContainer& project,
    gd::ObjectsContainer& layout,
    gd::InstructionsList& conditions,
    gd::String name) {
  bool somethingModified = false;

  for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
    bool deleteMe = false;

    gd::InstructionMetadata instrInfos = MetadataProvider::GetConditionMetadata(
        platform, conditions[cId].GetType());
    for (std::size_t pNb = 0; pNb < instrInfos.parameters.size(); ++pNb) {
      // Find object's name in parameters
      if (gd::ParameterMetadata::IsObject(instrInfos.parameters[pNb].type) &&
          conditions[cId].GetParameter(pNb).GetPlainString() == name) {
        deleteMe = true;
        break;
      }
      // Find object's name in expressions
      else if (ParameterMetadata::IsExpression(
                   "number", instrInfos.parameters[pNb].type)) {
        gd::ExpressionParser2 parser(platform, project, layout);
        auto node = parser.ParseExpression("number", conditions[cId].GetParameter(pNb).GetPlainString());
        
        if (ExpressionObjectFinder::CheckIfHasObject(*node, name)) {
          deleteMe = true;
          break;
        }
      }
      // Find object's name in text expressions
      else if (ParameterMetadata::IsExpression(
                   "string", instrInfos.parameters[pNb].type)) {
        gd::ExpressionParser2 parser(platform, project, layout);
        auto node = parser.ParseExpression("string", conditions[cId].GetParameter(pNb).GetPlainString());
        
        if (ExpressionObjectFinder::CheckIfHasObject(*node, name)) {
          deleteMe = true;
          break;
        }
      }
    }

    if (deleteMe) {
      somethingModified = true;
      conditions.Remove(cId);
      cId--;
    } else if (!conditions[cId].GetSubInstructions().empty())
      somethingModified =
          RemoveObjectInConditions(platform,
                                   project,
                                   layout,
                                   conditions[cId].GetSubInstructions(),
                                   name) ||
          somethingModified;
  }

  return somethingModified;
}

void EventsRefactorer::RemoveObjectInEvents(const gd::Platform& platform,
                                            gd::ObjectsContainer& project,
                                            gd::ObjectsContainer& layout,
                                            gd::EventsList& events,
                                            gd::String name) {
  for (std::size_t i = 0; i < events.size(); ++i) {
    vector<gd::InstructionsList*> conditionsVectors =
        events[i].GetAllConditionsVectors();
    for (std::size_t j = 0; j < conditionsVectors.size(); ++j) {
      bool conditionsModified = RemoveObjectInConditions(
          platform, project, layout, *conditionsVectors[j], name);
#if defined(GD_IDE_ONLY)
      if (conditionsModified) events[i].eventHeightNeedUpdate = true;
#endif
    }

    vector<gd::InstructionsList*> actionsVectors =
        events[i].GetAllActionsVectors();
    for (std::size_t j = 0; j < actionsVectors.size(); ++j) {
      bool actionsModified = RemoveObjectInActions(
          platform, project, layout, *actionsVectors[j], name);
#if defined(GD_IDE_ONLY)
      if (actionsModified) events[i].eventHeightNeedUpdate = true;
#endif
    }

    if (events[i].CanHaveSubEvents())
      RemoveObjectInEvents(
          platform, project, layout, events[i].GetSubEvents(), name);
  }
}

void EventsRefactorer::ReplaceStringInEvents(gd::ObjectsContainer& project,
                                             gd::ObjectsContainer& layout,
                                             gd::EventsList& events,
                                             gd::String toReplace,
                                             gd::String newString,
                                             bool matchCase,
                                             bool inConditions,
                                             bool inActions) {
  for (std::size_t i = 0; i < events.size(); ++i) {
    if (inConditions) {
      vector<gd::InstructionsList*> conditionsVectors =
          events[i].GetAllConditionsVectors();
      for (std::size_t j = 0; j < conditionsVectors.size(); ++j) {
        bool conditionsModified =
            ReplaceStringInConditions(project,
                                      layout,
                                      *conditionsVectors[j],
                                      toReplace,
                                      newString,
                                      matchCase);
#if defined(GD_IDE_ONLY)
        if (conditionsModified) events[i].eventHeightNeedUpdate = true;
#endif
      }
    }

    if (inActions) {
      vector<gd::InstructionsList*> actionsVectors =
          events[i].GetAllActionsVectors();
      for (std::size_t j = 0; j < actionsVectors.size(); ++j) {
        bool actionsModified = ReplaceStringInActions(project,
                                                      layout,
                                                      *actionsVectors[j],
                                                      toReplace,
                                                      newString,
                                                      matchCase);
#if defined(GD_IDE_ONLY)
        if (actionsModified) events[i].eventHeightNeedUpdate = true;
#endif
      }
    }

    if (events[i].CanHaveSubEvents())
      ReplaceStringInEvents(project,
                            layout,
                            events[i].GetSubEvents(),
                            toReplace,
                            newString,
                            matchCase,
                            inConditions,
                            inActions);
  }
}

gd::String ReplaceAllOccurencesCaseUnsensitive(gd::String context,
                                               gd::String from,
                                               const gd::String& to) {
  size_t lookHere = 0;
  size_t foundHere;
  size_t fromSize = from.size();
  size_t toSize = to.size();
  while ((foundHere = context.FindCaseInsensitive(from, lookHere)) !=
         gd::String::npos) {
    context.replace(foundHere, fromSize, to);
    lookHere = foundHere + toSize;
  }

  return context;
}

bool EventsRefactorer::ReplaceStringInActions(gd::ObjectsContainer& project,
                                              gd::ObjectsContainer& layout,
                                              gd::InstructionsList& actions,
                                              gd::String toReplace,
                                              gd::String newString,
                                              bool matchCase) {
  bool somethingModified = false;

  for (std::size_t aId = 0; aId < actions.size(); ++aId) {
    for (std::size_t pNb = 0; pNb < actions[aId].GetParameters().size();
         ++pNb) {
      gd::String newParameter =
          matchCase
              ? actions[aId].GetParameter(pNb).GetPlainString().FindAndReplace(
                    toReplace, newString, true)
              : ReplaceAllOccurencesCaseUnsensitive(
                    actions[aId].GetParameter(pNb).GetPlainString(),
                    toReplace,
                    newString);

      if (newParameter != actions[aId].GetParameter(pNb).GetPlainString()) {
        actions[aId].SetParameter(pNb, gd::Expression(newParameter));
        somethingModified = true;
#if defined(GD_IDE_ONLY)
        actions[aId].renderedHeightNeedUpdate = true;
#endif
      }
    }

    if (!actions[aId].GetSubInstructions().empty())
      ReplaceStringInActions(project,
                             layout,
                             actions[aId].GetSubInstructions(),
                             toReplace,
                             newString,
                             matchCase);
  }

  return somethingModified;
}

bool EventsRefactorer::ReplaceStringInConditions(
    gd::ObjectsContainer& project,
    gd::ObjectsContainer& layout,
    gd::InstructionsList& conditions,
    gd::String toReplace,
    gd::String newString,
    bool matchCase) {
  bool somethingModified = false;

  for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
    for (std::size_t pNb = 0; pNb < conditions[cId].GetParameters().size();
         ++pNb) {
      gd::String newParameter =
          matchCase ? conditions[cId]
                          .GetParameter(pNb)
                          .GetPlainString()
                          .FindAndReplace(toReplace, newString, true)
                    : ReplaceAllOccurencesCaseUnsensitive(
                          conditions[cId].GetParameter(pNb).GetPlainString(),
                          toReplace,
                          newString);

      if (newParameter != conditions[cId].GetParameter(pNb).GetPlainString()) {
        conditions[cId].SetParameter(pNb, gd::Expression(newParameter));
        somethingModified = true;
#if defined(GD_IDE_ONLY)
        conditions[cId].renderedHeightNeedUpdate = true;
#endif
      }
    }

    if (!conditions[cId].GetSubInstructions().empty())
      ReplaceStringInConditions(project,
                                layout,
                                conditions[cId].GetSubInstructions(),
                                toReplace,
                                newString,
                                matchCase);
  }

  return somethingModified;
}

vector<EventsSearchResult> EventsRefactorer::SearchInEvents(
    gd::ObjectsContainer& project,
    gd::ObjectsContainer& layout,
    gd::EventsList& events,
    gd::String search,
    bool matchCase,
    bool inConditions,
    bool inActions) {
  vector<EventsSearchResult> results;

  for (std::size_t i = 0; i < events.size(); ++i) {
    bool eventAddedInResults = false;

    if (inConditions) {
      vector<gd::InstructionsList*> conditionsVectors =
          events[i].GetAllConditionsVectors();
      for (std::size_t j = 0; j < conditionsVectors.size(); ++j) {
        if (!eventAddedInResults &&
            SearchStringInConditions(
                project, layout, *conditionsVectors[j], search, matchCase)) {
          results.push_back(EventsSearchResult(
              std::weak_ptr<gd::BaseEvent>(events.GetEventSmartPtr(i)),
              &events,
              i));
        }
      }
    }

    if (inActions) {
      vector<gd::InstructionsList*> actionsVectors =
          events[i].GetAllActionsVectors();
      for (std::size_t j = 0; j < actionsVectors.size(); ++j) {
        if (!eventAddedInResults &&
            SearchStringInActions(
                project, layout, *actionsVectors[j], search, matchCase)) {
          results.push_back(EventsSearchResult(
              std::weak_ptr<gd::BaseEvent>(events.GetEventSmartPtr(i)),
              &events,
              i));
        }
      }
    }

    if (events[i].CanHaveSubEvents()) {
      vector<EventsSearchResult> subResults =
          SearchInEvents(project,
                         layout,
                         events[i].GetSubEvents(),
                         search,
                         matchCase,
                         inConditions,
                         inActions);
      std::copy(
          subResults.begin(), subResults.end(), std::back_inserter(results));
    }
  }

  return results;
}

bool EventsRefactorer::SearchStringInActions(gd::ObjectsContainer& project,
                                             gd::ObjectsContainer& layout,
                                             gd::InstructionsList& actions,
                                             gd::String search,
                                             bool matchCase) {
  for (std::size_t aId = 0; aId < actions.size(); ++aId) {
    for (std::size_t pNb = 0; pNb < actions[aId].GetParameters().size();
         ++pNb) {
      size_t foundPosition =
          matchCase
              ? actions[aId].GetParameter(pNb).GetPlainString().find(search)
              : actions[aId]
                    .GetParameter(pNb)
                    .GetPlainString()
                    .FindCaseInsensitive(search);

      if (foundPosition != gd::String::npos) return true;
    }

    if (!actions[aId].GetSubInstructions().empty() &&
        SearchStringInActions(project,
                              layout,
                              actions[aId].GetSubInstructions(),
                              search,
                              matchCase))
      return true;
  }

  return false;
}

bool EventsRefactorer::SearchStringInConditions(
    gd::ObjectsContainer& project,
    gd::ObjectsContainer& layout,
    gd::InstructionsList& conditions,
    gd::String search,
    bool matchCase) {
  for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
    for (std::size_t pNb = 0; pNb < conditions[cId].GetParameters().size();
         ++pNb) {
      size_t foundPosition =
          matchCase
              ? conditions[cId].GetParameter(pNb).GetPlainString().find(search)
              : conditions[cId]
                    .GetParameter(pNb)
                    .GetPlainString()
                    .FindCaseInsensitive(search);

      if (foundPosition != gd::String::npos) return true;
    }

    if (!conditions[cId].GetSubInstructions().empty() &&
        SearchStringInConditions(project,
                                 layout,
                                 conditions[cId].GetSubInstructions(),
                                 search,
                                 matchCase))
      return true;
  }

  return false;
}

EventsSearchResult::EventsSearchResult(std::weak_ptr<gd::BaseEvent> event_,
                                       gd::EventsList* eventsList_,
                                       std::size_t positionInList_)
    : event(event_), eventsList(eventsList_), positionInList(positionInList_) {}

EventsSearchResult::EventsSearchResult()
    : eventsList(NULL), positionInList(0) {}

}  // namespace gd
