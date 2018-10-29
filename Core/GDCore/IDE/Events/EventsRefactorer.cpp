/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/IDE/Events/EventsRefactorer.h"
#include <memory>
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Parsers/ExpressionParser.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Events/EventsList.h"

using namespace std;

namespace gd {

// TODO: Replace and remove (ExpressionObjectsRenamer)
class CallbacksForRenamingObject : public gd::ParserCallbacks {
 public:
  CallbacksForRenamingObject(gd::String& plainExpression_,
                             gd::String oldName_,
                             gd::String newName_)
      : plainExpression(plainExpression_),
        newName(newName_),
        oldName(oldName_){};
  virtual ~CallbacksForRenamingObject(){};

  virtual void OnConstantToken(gd::String text) { plainExpression += text; };

  virtual void OnStaticFunction(gd::String functionName,
                                const std::vector<gd::Expression>& parameters,
                                const gd::ExpressionMetadata& expressionInfo) {
    // Special case : Function without name is a litteral string.
    if (functionName.empty()) {
      if (parameters.empty()) return;
      plainExpression += "\"" + parameters[0].GetPlainString() + "\"";

      return;
    }

    gd::String parametersStr;
    for (std::size_t i = 0; i < parameters.size(); ++i) {
      if (i < expressionInfo.parameters.size() &&
          expressionInfo.parameters[i].codeOnly)
        continue;  // Skip code only parameter which are not included in
                   // function calls.

      if (!parametersStr.empty()) parametersStr += ",";
      parametersStr += parameters[i].GetPlainString();
    }
    plainExpression += functionName + "(" + parametersStr + ")";
  };

  virtual void OnObjectFunction(gd::String functionName,
                                const std::vector<gd::Expression>& parameters,
                                const gd::ExpressionMetadata& expressionInfo) {
    if (parameters.empty()) return;

    gd::String parametersStr;
    for (std::size_t i = 1; i < parameters.size(); ++i) {
      if (i < expressionInfo.parameters.size() &&
          expressionInfo.parameters[i].codeOnly)
        continue;  // Skip code only parameter which are not included in
                   // function calls.

      if (!parametersStr.empty()) parametersStr += ",";
      parametersStr += parameters[i].GetPlainString();
    }
    plainExpression += (parameters[0].GetPlainString() == oldName
                            ? newName
                            : parameters[0].GetPlainString()) +
                       "." + functionName + "(" + parametersStr + ")";
  };

  virtual void OnObjectBehaviorFunction(
      gd::String functionName,
      const std::vector<gd::Expression>& parameters,
      const gd::ExpressionMetadata& expressionInfo) {
    if (parameters.size() < 2) return;

    gd::String parametersStr;
    for (std::size_t i = 2; i < parameters.size(); ++i) {
      if (i < expressionInfo.parameters.size() &&
          expressionInfo.parameters[i].codeOnly)
        continue;  // Skip code only parameter which are not included in
                   // function calls.

      if (!parametersStr.empty()) parametersStr += ",";
      parametersStr += parameters[i].GetPlainString();
    }
    plainExpression += (parameters[0].GetPlainString() == oldName
                            ? newName
                            : parameters[0].GetPlainString()) +
                       "." + parameters[1].GetPlainString() +
                       "::" + functionName + "(" + parametersStr + ")";
  };

  virtual bool OnSubMathExpression(const gd::Platform& platform,
                                   const gd::ObjectsContainer& project,
                                   const gd::ObjectsContainer& layout,
                                   gd::Expression& expression) {
    // TODO: Add support for renaming in sub expressions. This is not working
    // as the parser does not handle change made to the expression.
    gd::String newExpression;

    CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

    gd::ExpressionParser parser(expression.GetPlainString());
    if (!parser.ParseMathExpression(platform, project, layout, callbacks))
      return false;

    expression = gd::Expression(newExpression); // This change won't be picked up by the parser
    return true;
  }

  virtual bool OnSubTextExpression(const gd::Platform& platform,
                                   const gd::ObjectsContainer& project,
                                   const gd::ObjectsContainer& layout,
                                   gd::Expression& expression) {
    // TODO: Add support for renaming in sub expressions. This is not working
    // as the parser does not handle change made to the expression.
    gd::String newExpression;

    CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

    gd::ExpressionParser parser(expression.GetPlainString());
    if (!parser.ParseStringExpression(platform, project, layout, callbacks))
      return false;

    expression = gd::Expression(newExpression); // This change won't be picked up by the parser
    return true;
  }

 private:
  gd::String& plainExpression;
  gd::String newName;
  gd::String oldName;
};

// TODO: Replace and remove (ExpressionObjectsRemover)
class CallbacksForRemovingObject : public gd::ParserCallbacks {
 public:
  CallbacksForRemovingObject(gd::String name_)
      : objectPresent(false), name(name_){};
  virtual ~CallbacksForRemovingObject(){};

  bool objectPresent;  // True if the object is present in the expression

  virtual void OnConstantToken(gd::String text){};

  virtual void OnStaticFunction(gd::String functionName,
                                const std::vector<gd::Expression>& parameters,
                                const gd::ExpressionMetadata& expressionInfo){};

  virtual void OnObjectFunction(gd::String functionName,
                                const std::vector<gd::Expression>& parameters,
                                const gd::ExpressionMetadata& expressionInfo) {
    if (parameters.empty()) return;

    if (parameters[0].GetPlainString() == name) objectPresent = true;
  };

  virtual void OnObjectBehaviorFunction(
      gd::String functionName,
      const std::vector<gd::Expression>& parameters,
      const gd::ExpressionMetadata& expressionInfo) {
    if (parameters.empty()) return;

    if (parameters[0].GetPlainString() == name) objectPresent = true;
  };

  virtual bool OnSubMathExpression(const gd::Platform& platform,
                                   const gd::ObjectsContainer& project,
                                   const gd::ObjectsContainer& layout,
                                   gd::Expression& expression) {
    CallbacksForRemovingObject callbacks(name);

    gd::ExpressionParser parser(expression.GetPlainString());
    if (!parser.ParseMathExpression(platform, project, layout, callbacks))
      return false;

    if (callbacks.objectPresent) objectPresent = true;
    return true;
  }

  virtual bool OnSubTextExpression(const gd::Platform& platform,
                                   const gd::ObjectsContainer& project,
                                   const gd::ObjectsContainer& layout,
                                   gd::Expression& expression) {
    CallbacksForRemovingObject callbacks(name);

    gd::ExpressionParser parser(expression.GetPlainString());
    if (!parser.ParseStringExpression(platform, project, layout, callbacks))
      return false;

    if (callbacks.objectPresent) objectPresent = true;
    return true;
  }

 private:
  gd::String name;
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
      else if (ParameterMetadata::IsExpression("number", instrInfos.parameters[pNb].type)) {
        gd::String newExpression;
        gd::String oldExpression =
            actions[aId].GetParameter(pNb).GetPlainString();

        CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

        gd::ExpressionParser parser(oldExpression);
        if (parser.ParseMathExpression(platform, project, layout, callbacks) &&
            newExpression != oldExpression) {
          somethingModified = true;
          actions[aId].SetParameter(pNb, gd::Expression(newExpression));
        }
      }
      // Replace object's name in text expressions
      else if (ParameterMetadata::IsExpression("string", instrInfos.parameters[pNb].type)) {
        gd::String newExpression;
        gd::String oldExpression =
            actions[aId].GetParameter(pNb).GetPlainString();

        CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

        gd::ExpressionParser parser(oldExpression);
        if (parser.ParseStringExpression(
                platform, project, layout, callbacks) &&
            newExpression != oldExpression) {
          somethingModified = true;
          actions[aId].SetParameter(pNb, gd::Expression(newExpression));
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
      else if (ParameterMetadata::IsExpression("number", instrInfos.parameters[pNb].type)) {
        gd::String newExpression;
        gd::String oldExpression =
            conditions[cId].GetParameter(pNb).GetPlainString();

        CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

        gd::ExpressionParser parser(oldExpression);
        if (parser.ParseMathExpression(platform, project, layout, callbacks)) {
          somethingModified = true;
          conditions[cId].SetParameter(pNb, gd::Expression(newExpression));
        }
      }
      // Replace object's name in text expressions
      else if (ParameterMetadata::IsExpression("string", instrInfos.parameters[pNb].type)) {
        gd::String newExpression;
        gd::String oldExpression =
            conditions[cId].GetParameter(pNb).GetPlainString();

        CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

        gd::ExpressionParser parser(oldExpression);
        if (parser.ParseMathExpression(platform, project, layout, callbacks)) {
          somethingModified = true;
          conditions[cId].SetParameter(pNb, gd::Expression(newExpression));
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
      // Replace object's name in parameters
      if (gd::ParameterMetadata::IsObject(instrInfos.parameters[pNb].type) &&
          actions[aId].GetParameter(pNb).GetPlainString() == name) {
        deleteMe = true;
        break;
      }
      // Replace object's name in expressions
      else if (ParameterMetadata::IsExpression("number", instrInfos.parameters[pNb].type)) {
        CallbacksForRemovingObject callbacks(name);

        gd::ExpressionParser parser(
            actions[aId].GetParameter(pNb).GetPlainString());
        if (parser.ParseMathExpression(platform, project, layout, callbacks) &&
            callbacks.objectPresent) {
          deleteMe = true;
          break;
        }
      }
      // Replace object's name in text expressions
      else if (ParameterMetadata::IsExpression("string", instrInfos.parameters[pNb].type)) {
        CallbacksForRemovingObject callbacks(name);

        gd::ExpressionParser parser(
            actions[aId].GetParameter(pNb).GetPlainString());
        if (parser.ParseStringExpression(
                platform, project, layout, callbacks) &&
            callbacks.objectPresent) {
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
      // Replace object's name in parameters
      if (gd::ParameterMetadata::IsObject(instrInfos.parameters[pNb].type) &&
          conditions[cId].GetParameter(pNb).GetPlainString() == name) {
        deleteMe = true;
        break;
      }
      // Replace object's name in expressions
      else if (ParameterMetadata::IsExpression("number", instrInfos.parameters[pNb].type)) {
        CallbacksForRemovingObject callbacks(name);

        gd::ExpressionParser parser(
            conditions[cId].GetParameter(pNb).GetPlainString());
        if (parser.ParseMathExpression(platform, project, layout, callbacks) &&
            callbacks.objectPresent) {
          deleteMe = true;
          break;
        }
      }
      // Replace object's name in text expressions
      else if (ParameterMetadata::IsExpression("string", instrInfos.parameters[pNb].type)) {
        CallbacksForRemovingObject callbacks(name);

        gd::ExpressionParser parser(
            conditions[cId].GetParameter(pNb).GetPlainString());
        if (parser.ParseStringExpression(
                platform, project, layout, callbacks) &&
            callbacks.objectPresent) {
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
