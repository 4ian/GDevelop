/**

GDevelop - Timed Event Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "TimedEvent.h"
#include "TimedEventsManager.h"

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  Extension() {
    SetExtensionInformation("TimedEvent",
                            _("Timed events"),
                            _("These events can launch their conditions and "
                              "actions only after an amount of time passes."),
                            "Florian Rival",
                            "Open source (MIT License)");

#if defined(GD_IDE_ONLY)

    AddEvent("TimedEvent",
             _("Timed event"),
             _("This event launches its conditions and actions only after an "
               "amount of time passes."),
             "",
             "CppPlatform/Extensions/timedevent16.png",
             std::make_shared<TimedEvent>())
        .SetCodeGenerator([](gd::BaseEvent& event_,
                             gd::EventsCodeGenerator& codeGenerator,
                             gd::EventsCodeGenerationContext& context) {
          TimedEvent& event = dynamic_cast<TimedEvent&>(event_);

          codeGenerator.AddIncludeFile("TimedEvent/TimedEventTools.h");

          // Notify parent timed event that they have a child
          for (std::size_t i = 0;
               i < TimedEvent::codeGenerationCurrentParents.size();
               ++i)
            TimedEvent::codeGenerationCurrentParents[i]
                ->codeGenerationChildren.push_back(&event);

          // And register this event as potential parent
          TimedEvent::codeGenerationCurrentParents.push_back(&event);
          event.codeGenerationChildren.clear();

          // Prepare code for computing timeout
          gd::String timeOutCode =
              gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator,
                  context,
                  "number",
                  event.GetTimeoutExpression());

          // Prepare name
          gd::String codeName =
              !event.GetName().empty()
                  ? "GDNamedTimedEvent_" +
                        codeGenerator.ConvertToString(event.GetName())
                  : "GDTimedEvent_" + gd::String::From(&event);

          gd::String outputCode;

          outputCode +=
              "if ( "
              "static_cast<double>(GDpriv::TimedEvents::UpdateAndGetTimeOf(*"
              "runtimeContext->scene, \"" +
              codeName + "\"))/1000000.0 > " + timeOutCode + ")";
          outputCode += "{";

          outputCode += codeGenerator.GenerateConditionsListCode(
              event.GetConditions(), context);

          gd::String ifPredicat;
          for (std::size_t i = 0; i < event.GetConditions().size(); ++i) {
            if (i != 0) ifPredicat += " && ";
            ifPredicat += "condition" + gd::String::From(i) + "IsTrue";
          }

          if (!ifPredicat.empty()) outputCode += "if (" + ifPredicat + ")\n";
          outputCode += "{\n";
          outputCode += codeGenerator.GenerateActionsListCode(
              event.GetActions(), context);
          if (event.HasSubEvents())  // Sub events
          {
            outputCode += "\n{\n";
            outputCode += codeGenerator.GenerateEventsListCode(
                event.GetSubEvents(), context);
            outputCode += "}\n";
          }

          outputCode += "}\n";

          outputCode += "}";

          // This event cannot be a parent of other TimedEvent anymore
          if (!TimedEvent::codeGenerationCurrentParents.empty())
            TimedEvent::codeGenerationCurrentParents.pop_back();
          else
            std::cout << "Error! CodeGenerationCurrentParents cannot be empty!";

          return outputCode;
        });

    AddAction("ResetTimedEvent",
              _("Reset a timed event"),
              _("Reset a timed event"),
              _("Reset the timed event called _PARAM1_"),
              _("Timed events"),
              "CppPlatform/Extensions/timedevent24.png",
              "CppPlatform/Extensions/timedevent16.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("", _("Name"))
        .codeExtraInformation.SetCustomCodeGenerator(
            [](gd::Instruction& instruction,
               gd::EventsCodeGenerator& codeGenerator,
               gd::EventsCodeGenerationContext& context) {
              codeGenerator.AddIncludeFile("TimedEvent/TimedEventTools.h");

              gd::String codeName =
                  "GDNamedTimedEvent_" +
                  codeGenerator.ConvertToString(
                      instruction.GetParameter(1).GetPlainString());
              return "GDpriv::TimedEvents::Reset(*runtimeContext->scene, \"" +
                     codeName + "\");\n";

              return gd::String("");
            });

    AddAction("ResetTimedEventAndSubs",
              _("Reset a timed event and sub events"),
              _("Reset a timed event, as well as all of its sub events."),
              _("Reset the timed event called _PARAM1_, as well as all of its "
                "sub events"),
              _("Timed events"),
              "CppPlatform/Extensions/timedevent24.png",
              "CppPlatform/Extensions/timedevent16.png")
        .AddParameter("", _("Name"))
        .codeExtraInformation
        .SetCustomCodeGenerator([](gd::Instruction& instruction,
                                   gd::EventsCodeGenerator& codeGenerator,
                                   gd::EventsCodeGenerationContext& context) {
          codeGenerator.AddIncludeFile("TimedEvent/TimedEventTools.h");

          for (std::size_t i = 0;
               i < TimedEvent::codeGenerationCurrentParents.size();
               ++i) {
            if (TimedEvent::codeGenerationCurrentParents[i] == NULL) {
              std::cout << "WARNING : NULL timed event in "
                           "codeGenerationCurrentParents";
              continue;
            }

            if (TimedEvent::codeGenerationCurrentParents[i]->GetName() ==
                instruction.GetParameter(0).GetPlainString()) {
              TimedEvent& timedEvent =
                  *TimedEvent::codeGenerationCurrentParents[i];

              gd::String code;
              {
                gd::String codeName =
                    !timedEvent.GetName().empty()
                        ? "GDNamedTimedEvent_" + codeGenerator.ConvertToString(
                                                     timedEvent.GetName())
                        : "GDTimedEvent_" + gd::String::From(&timedEvent);
                code +=
                    "GDpriv::TimedEvents::Reset(*runtimeContext->scene, \"" +
                    codeName + "\");\n";
              }
              for (std::size_t j = 0;
                   j < timedEvent.codeGenerationChildren.size();
                   ++j) {
                gd::String codeName =
                    !timedEvent.codeGenerationChildren[j]->GetName().empty()
                        ? "GDNamedTimedEvent_" +
                              codeGenerator.ConvertToString(
                                  timedEvent.codeGenerationChildren[j]
                                      ->GetName())
                        : "GDTimedEvent_" +
                              gd::String::From(
                                  timedEvent.codeGenerationChildren[j]);
                code +=
                    "GDpriv::TimedEvents::Reset(*runtimeContext->scene, \"" +
                    codeName + "\");\n";
              }
              return code;
            }
          }

          return gd::String("");
        })
        .SetIncludeFile("TimedEvent/TimedEventTools.h");
#endif

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };

#if defined(GD_IDE_ONLY)
  bool HasDebuggingProperties() const { return true; };

  void GetPropertyForDebugger(RuntimeScene& scene,
                              std::size_t propertyNb,
                              gd::String& name,
                              gd::String& value) const {
    std::size_t i = 0;
    std::map<gd::String, ManualTimer>::const_iterator end =
        TimedEventsManager::managers[&scene].timedEvents.end();
    for (std::map<gd::String, ManualTimer>::iterator iter =
             TimedEventsManager::managers[&scene].timedEvents.begin();
         iter != end;
         ++iter) {
      if (propertyNb == i) {
        name = iter->first;
        // Unmangle name
        if (name.find("GDNamedTimedEvent_") == 0 && name.length() > 18)
          name = name.substr(18, name.length());
        else
          name = _("No name");

        value = gd::String::From(static_cast<double>(iter->second.GetTime()) /
                                 1000000.0) +
                "s";

        return;
      }

      ++i;
    }
  }

  bool ChangeProperty(RuntimeScene& scene,
                      std::size_t propertyNb,
                      gd::String newValue) {
    std::size_t i = 0;
    std::map<gd::String, ManualTimer>::const_iterator end =
        TimedEventsManager::managers[&scene].timedEvents.end();
    for (std::map<gd::String, ManualTimer>::iterator iter =
             TimedEventsManager::managers[&scene].timedEvents.begin();
         iter != end;
         ++iter) {
      if (propertyNb == i) {
        iter->second.SetTime(newValue.To<double>() * 1000000.0);

        return true;
      }

      ++i;
    }

    return false;
  }

  std::size_t GetNumberOfProperties(RuntimeScene& scene) const {
    return TimedEventsManager::managers[&scene].timedEvents.size();
  }
#endif

  void SceneLoaded(RuntimeScene& scene) {
    TimedEventsManager::managers[&scene].timedEvents.clear();
  }
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new Extension;
}
