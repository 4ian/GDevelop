/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Events/Serialization.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/InstructionsList.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/VersionWrapper.h"

using namespace std;

namespace {
bool AddQuotesToFunctionCall(gd::String& expressionStr,
                             const gd::String& functionName) {
  bool changedSomething = false;
  size_t functionCallPos = expressionStr.find(functionName + "(");
  while (functionCallPos != gd::String::npos) {
    size_t pos = functionCallPos + functionName.size() + 1;

    // Skip whitespace
    while (pos < expressionStr.size() && expressionStr[pos] == ' ') pos++;

    if (pos < expressionStr.size()) {
      changedSomething = true;

      // Insert the first quote
      expressionStr.insert(pos, "\"");
      pos++;

      // Escape the argument
      while (pos < expressionStr.size() && expressionStr[pos] != ')') {
        if (expressionStr[pos] == '"') {
          expressionStr.insert(pos,
                               "\\");  // Insert a backslash to escape the quote
          pos++;
        }
        pos++;
      }

      // Insert the last quote
      if (pos < expressionStr.size() && expressionStr[pos] == ')') {
        expressionStr.insert(pos, "\"");
        pos++;
      }
    }

    functionCallPos = expressionStr.find(functionName + "(", pos + 1);
  }

  return changedSomething;
}
}  // namespace

namespace gd {

void EventsListSerialization::UpdateInstructionsFromGD4097(
    gd::Project& project, gd::InstructionsList& list) {
  for (std::size_t i = 0; i < list.size(); ++i) {
    gd::Instruction& instr = list[i];

    for (std::size_t j = 0; j < instr.GetParametersCount(); ++j) {
      gd::String expressionStr = instr.GetParameter(j).GetPlainString();
      bool changedSomething = false;
      changedSomething |= AddQuotesToFunctionCall(expressionStr, "PointX");
      changedSomething |= AddQuotesToFunctionCall(expressionStr, "PointY");

      if (changedSomething) {
        std::cout << "(Debug) Converted \""
                  << instr.GetParameter(j).GetPlainString() << "\" to \""
                  << expressionStr << "\"" << std::endl;
        instr.SetParameter(j, gd::Expression(expressionStr));
      }
    }
  }
}

void EventsListSerialization::UpdateInstructionsFromGD31x(
    gd::Project& project, gd::InstructionsList& list) {
  for (std::size_t i = 0; i < list.size(); ++i) {
    gd::Instruction& instr = list[i];

    if (instr.GetType() == "VarScene" || instr.GetType() == "VarSceneTxt" ||
        instr.GetType() == "VarGlobal" || instr.GetType() == "VarGlobalTxt" ||
        instr.GetType() == "ModVarScene" ||
        instr.GetType() == "ModVarSceneTxt" ||
        instr.GetType() == "ModVarGlobal" ||
        instr.GetType() == "ModVarGlobalTxt") {
      std::vector<gd::Expression> parameters = instr.GetParameters();
      if (parameters.size() >= 1) parameters.erase(parameters.begin() + 0);
      instr.SetParameters(parameters);
    }

    if (instr.GetType() == "VarSceneDef" || instr.GetType() == "VarGlobalDef" ||
        instr.GetType() == "VarObjetDef") {
      instr.SetParameter(
          1,
          gd::Expression("\"" + instr.GetParameter(1).GetPlainString() + "\""));
    }
  }
}

void EventsListSerialization::UpdateInstructionsFromGD2x(
    gd::Project& project,
    gd::InstructionsList& list,
    bool instructionsAreActions) {
  for (std::size_t i = 0; i < list.size(); ++i) {
    gd::Instruction& instr = list[i];

    const gd::InstructionMetadata& metadata =
        instructionsAreActions
            ? MetadataProvider::GetActionMetadata(project.GetCurrentPlatform(),
                                                  instr.GetType())
            : MetadataProvider::GetConditionMetadata(
                  project.GetCurrentPlatform(), instr.GetType());

    // Specific updates for some instructions
    if (instr.GetType() == "LinkedObjects::LinkObjects" ||
        instr.GetType() == "LinkedObjects::RemoveLinkBetween") {
      instr.SetParameter(1, instr.GetParameter(3));
      instr.SetParameter(2, instr.GetParameter(4));
    } else if (instr.GetType() == "LinkedObjects::RemoveAllLinksOf") {
      instr.SetParameter(1, instr.GetParameter(2));
    } else if (instr.GetType() == "LinkedObjects::PickObjectsLinkedTo") {
      instr.SetParameter(1, instr.GetParameter(5));
      instr.SetParameter(2, instr.GetParameter(3));
    } else if (instr.GetType() ==
               "PhysicsBehavior::AddRevoluteJointBetweenObjects") {
      instr.SetParameter(4, instr.GetParameter(5));
      instr.SetParameter(5, instr.GetParameter(6));
    } else if (instr.GetType() == "FixCamera" ||
               instr.GetType() == "CentreCamera") {
      std::vector<gd::Expression> parameters = instr.GetParameters();
      if (parameters.size() >= 3) parameters.erase(parameters.begin() + 2);
      instr.SetParameters(parameters);
    } else if (instr.GetType() == "AjoutObjConcern" ||
               instr.GetType() == "AjoutHasard") {
      instr.SetParameter(1, instr.GetParameter(3));
    } else if (instr.GetType() == "SeDirige" ||
               instr.GetType() == "EstTourne") {
      std::vector<gd::Expression> parameters = instr.GetParameters();
      if (parameters.size() >= 3) parameters.erase(parameters.begin() + 2);
      if (parameters.size() >= 3) parameters.erase(parameters.begin() + 2);
      instr.SetParameters(parameters);
    } else if (instr.GetType() == "Create") {
      std::vector<gd::Expression> parameters = instr.GetParameters();
      if (parameters.size() >= 2) parameters.erase(parameters.begin() + 1);
      if (parameters.size() >= 2) parameters.erase(parameters.begin() + 1);
      instr.SetParameters(parameters);
    } else if (instr.GetType() == "CreateByName") {
      std::vector<gd::Expression> parameters = instr.GetParameters();
      if (parameters.size() >= 2) parameters.erase(parameters.begin() + 1);
      instr.SetParameters(parameters);
    } else if (instr.GetType() == "NbObjet") {
      std::vector<gd::Expression> parameters = instr.GetParameters();
      if (parameters.size() >= 2) parameters.erase(parameters.begin() + 1);
      instr.SetParameters(parameters);
    } else if (instr.GetType() == "Distance") {
      std::vector<gd::Expression> parameters = instr.GetParameters();
      if (parameters.size() >= 3) parameters.erase(parameters.begin() + 2);
      if (parameters.size() >= 3) parameters.erase(parameters.begin() + 2);
      if (parameters.size() >= 4 && (parameters[3].GetPlainString() == ">=" ||
                                     parameters[3].GetPlainString() == ">")) {
        instr.SetInverted(true);
      } else {
        instr.SetInverted(false);
      }
      instr.SetParameters(parameters);
    }

    // Common updates for some parameters
    const std::vector<gd::Expression>& parameters = instr.GetParameters();
    for (std::size_t j = 0;
         j < parameters.size() && j < metadata.parameters.size();
         ++j) {
      if (metadata.parameters[j].GetType() == "relationalOperator" ||
          metadata.parameters[j].GetType() == "operator") {
        if (j == parameters.size() - 1) {
          std::cout << "ERROR: No more parameters after a [relational]operator "
                       "when trying to update an instruction from GD2.x";
        } else {
          // Exchange parameters
          gd::String op = parameters[j + 1].GetPlainString();
          instr.SetParameter(j + 1, parameters[j]);
          instr.SetParameter(j, gd::Expression(op));
        }
      }
    }

    // UpdateInstructionsFromGD2x(project, instr.GetSubInstructions(),
    // instructionsAreActions);
  }
}

void EventsListSerialization::UnserializeEventsFrom(
    gd::Project& project, EventsList& list, const SerializerElement& events) {
  list.Clear();
  events.ConsiderAsArrayOf("event", "Event");
  for (std::size_t i = 0; i < events.GetChildrenCount(); ++i) {
    SerializerElement& eventElem = events.GetChild(i);
    gd::String type =
        eventElem.GetChild("type", 0, "Type").GetValue().GetString();
    gd::BaseEventSPtr event = project.CreateEvent(type);
    if (event != std::shared_ptr<gd::BaseEvent>())
      event->UnserializeFrom(project, eventElem);
    else {
      std::cout << "WARNING: Unknown event of type " << type << std::endl;
      event = std::make_shared<EmptyEvent>();
    }

    event->SetDisabled(eventElem.GetBoolAttribute("disabled", false));
    event->SetFolded(eventElem.GetBoolAttribute("folded", false));

    list.InsertEvent(event, list.GetEventsCount());
  }
}

void EventsListSerialization::SerializeEventsTo(const EventsList& list,
                                                SerializerElement& events) {
  events.ConsiderAsArrayOf("event");
  for (std::size_t j = 0; j < list.size(); j++) {
    const gd::BaseEvent& event = list.GetEvent(j);
    SerializerElement& eventElem = events.AddChild("event");

    if (event.IsDisabled())
      eventElem.SetAttribute("disabled", event.IsDisabled());
    if (event.IsFolded()) eventElem.SetAttribute("folded", event.IsFolded());
    eventElem.AddChild("type").SetValue(event.GetType());

    event.SerializeTo(eventElem);
  }
}

using namespace std;

void gd::EventsListSerialization::UnserializeInstructionsFrom(
    gd::Project& project,
    gd::InstructionsList& instructions,
    const SerializerElement& elem) {
  elem.ConsiderAsArrayOf("instruction");
  // Compatibility with GD <= 4.0.95
  if (elem.HasChild("condition", "Condition"))
    elem.ConsiderAsArrayOf("condition", "Condition");
  else if (elem.HasChild("action", "Action"))
    elem.ConsiderAsArrayOf("action", "Action");
  // end of compatibility code

  for (std::size_t i = 0; i < elem.GetChildrenCount(); ++i) {
    gd::Instruction instruction;
    const SerializerElement& instrElement = elem.GetChild(i);

    instruction.SetType(
        instrElement.GetChild("type", 0, "Type")
            .GetStringAttribute("value")
            .FindAndReplace("Automatism",
                            "Behavior"));  // Compatibility with GD <= 4
    instruction.SetInverted(
        instrElement.GetChild("type", 0, "Type")
            .GetBoolAttribute("inverted", false, "Contraire"));

    instruction.SetAwaited(
        instrElement.GetChild("type", 0, "Type").GetBoolAttribute("await"));

    // Read parameters
    vector<gd::Expression> parameters;

    // Compatibility with GD <= 3.3
    if (instrElement.HasChild("Parametre")) {
      for (std::size_t j = 0; j < instrElement.GetChildrenCount("Parametre");
           ++j)
        parameters.push_back(gd::Expression(
            instrElement.GetChild("Parametre", j).GetValue().GetString()));

    }
    // end of compatibility code
    else {
      const SerializerElement& parametersElem =
          instrElement.GetChild("parameters");
      parametersElem.ConsiderAsArrayOf("parameter");
      for (std::size_t j = 0; j < parametersElem.GetChildrenCount(); ++j)
        parameters.push_back(
            gd::Expression(parametersElem.GetChild(j).GetValue().GetString()));
    }

    instruction.SetParameters(parameters);

    // Read sub instructions
    if (instrElement.HasChild("subInstructions"))
      UnserializeInstructionsFrom(project,
                                  instruction.GetSubInstructions(),
                                  instrElement.GetChild("subInstructions"));
    // Compatibility with GD <= 4.0.95
    if (instrElement.HasChild("subConditions", "SubConditions"))
      UnserializeInstructionsFrom(
          project,
          instruction.GetSubInstructions(),
          instrElement.GetChild("subConditions", 0, "SubConditions"));
    if (instrElement.HasChild("subActions", "SubActions"))
      UnserializeInstructionsFrom(
          project,
          instruction.GetSubInstructions(),
          instrElement.GetChild("subActions", 0, "SubActions"));
    // end of compatibility code

    instructions.Insert(instruction);
  }

  // Compatibility with GD <= 3.1
  if (project.GetLastSaveGDMajorVersion() < 3 ||
      (project.GetLastSaveGDMajorVersion() == 3 &&
       project.GetLastSaveGDMinorVersion() <= 1))
    UpdateInstructionsFromGD31x(project, instructions);

  if (project.GetLastSaveGDMajorVersion() < 3)
    UpdateInstructionsFromGD2x(
        project, instructions, elem.HasChild("action", "Action"));

  // Compatibility with GD <= 4.0.97
  if (VersionWrapper::IsOlderOrEqual(project.GetLastSaveGDMajorVersion(),
                                     project.GetLastSaveGDMinorVersion(),
                                     project.GetLastSaveGDBuildVersion(),
                                     0,
                                     4,
                                     0,
                                     97,
                                     0)) {
    UpdateInstructionsFromGD4097(project, instructions);
  }
  // end of compatibility code
}

void gd::EventsListSerialization::SerializeInstructionsTo(
    const gd::InstructionsList& list, SerializerElement& instructions) {
  instructions.ConsiderAsArrayOf("instruction");
  for (std::size_t k = 0; k < list.size(); k++) {
    SerializerElement& instruction = instructions.AddChild("instruction");
    instruction.AddChild("type").SetAttribute("value", list[k].GetType());

    if (list[k].IsInverted())
      instruction.GetChild("type").SetAttribute("inverted", true);
    if (list[k].IsAwaited())
      instruction.GetChild("type").SetAttribute("await", true);

    // Parameters
    SerializerElement& parameters = instruction.AddChild("parameters");
    parameters.ConsiderAsArrayOf("parameter");
    for (std::size_t l = 0; l < list[k].GetParameters().size(); l++)
      parameters.AddChild("parameter")
          .SetValue(list[k].GetParameter(l).GetPlainString());

    // Sub instructions
    if (!list[k].GetSubInstructions().empty()) {
      SerializeInstructionsTo(list[k].GetSubInstructions(),
                              instruction.AddChild("subInstructions"));
    }
  }
}

}  // namespace gd
