/**

GDevelop - Timed Event Extension
Copyright (c) 2011-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"

#include "TimedEvent.h"
#include "TimedEventsManager.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("TimedEvent",
                              _("Timed events"),
                              _("Event which launch its conditions and actions only after a amount of time is reached."),
                              "Florian Rival",
                              "Open source (MIT License)");

        #if defined(GD_IDE_ONLY)


        AddEvent("TimedEvent",
                      _("Timed event"),
                      _("Event which launch its conditions and actions only after a amount of time is reached."),
                      "",
                      "CppPlatform/Extensions/timedevent16.png",
                      std::shared_ptr<gd::BaseEvent>(new TimedEvent))
            .SetCodeGenerator([](gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context) {
                TimedEvent & event = dynamic_cast<TimedEvent&>(event_);

                codeGenerator.AddIncludeFile("TimedEvent/TimedEventTools.h");

                //Notify parent timed event that they have a child
                for (unsigned int i = 0;i<TimedEvent::codeGenerationCurrentParents.size();++i)
                    TimedEvent::codeGenerationCurrentParents[i]->codeGenerationChildren.push_back(&event);

                //And register this event as potential parent
                TimedEvent::codeGenerationCurrentParents.push_back(&event);
                event.codeGenerationChildren.clear();

                //Prepare code for computing timeout
                std::string timeOutCode;
                gd::CallbacksForGeneratingExpressionCode callbacks(timeOutCode, codeGenerator, context);
                gd::ExpressionParser parser(event.GetTimeoutExpression());
                if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || timeOutCode.empty()) timeOutCode = "0";

                //Prepare name
                std::string codeName = !event.GetName().empty() ? "GDNamedTimedEvent_"+codeGenerator.ConvertToString(event.GetName()) : "GDTimedEvent_"+ToString(&event);

                std::string outputCode;

                outputCode += "if ( static_cast<double>(GDpriv::TimedEvents::UpdateAndGetTimeOf(*runtimeContext->scene, \""+codeName+"\"))/1000000.0 > "+timeOutCode+")";
                outputCode += "{";

                outputCode += codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);

                std::string ifPredicat;
                for (unsigned int i = 0;i<event.GetConditions().size();++i)
                {
                    if (i!=0) ifPredicat += " && ";
                    ifPredicat += "condition"+ToString(i)+"IsTrue";
                }

                if ( !ifPredicat.empty() ) outputCode += "if (" +ifPredicat+ ")\n";
                outputCode += "{\n";
                outputCode += codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                if ( event.HasSubEvents() ) //Sub events
                {
                    outputCode += "\n{\n";
                    outputCode += codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
                    outputCode += "}\n";
                }

                outputCode += "}\n";

                outputCode += "}";

                //This event cannot be a parent of other TimedEvent anymore
                if (!TimedEvent::codeGenerationCurrentParents.empty())
                    TimedEvent::codeGenerationCurrentParents.pop_back();
                else
                    std::cout << "Error! CodeGenerationCurrentParents cannot be empty!";

                return outputCode;
            });

        AddAction("ResetTimedEvent",
                       _("Reset a timed event"),
                       _("Reset a timed event"),
                       _("Reset the timed event(s) called _PARAM1_"),
                       _("Timed events"),
                       "CppPlatform/Extensions/timedevent24.png",
                       "CppPlatform/Extensions/timedevent16.png")
            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("", _("Name"))
            .codeExtraInformation.SetCustomCodeGenerator([](gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context) {
                codeGenerator.AddIncludeFile("TimedEvent/TimedEventTools.h");

                std::string codeName = "GDNamedTimedEvent_"+codeGenerator.ConvertToString(instruction.GetParameter(1).GetPlainString());
                return "GDpriv::TimedEvents::Reset(*runtimeContext->scene, \""+codeName+"\");\n";

                return std::string("");
            });

        AddAction("ResetTimedEventAndSubs",
                       _("Reset a timed event and sub events"),
                       _("Reset a timed events, as well as all of its sub events."),
                       _("Reset timed events called _PARAM1_ and their sub events"),
                       _("Timed events"),
                       "CppPlatform/Extensions/timedevent24.png",
                       "CppPlatform/Extensions/timedevent16.png")
            .AddParameter("", _("Name"))
            .codeExtraInformation.SetCustomCodeGenerator([](gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context) {
                codeGenerator.AddIncludeFile("TimedEvent/TimedEventTools.h");

                for (unsigned int i = 0;i<TimedEvent::codeGenerationCurrentParents.size();++i)
                {
                    if ( TimedEvent::codeGenerationCurrentParents[i] == NULL )
                    {
                        std::cout << "WARNING : NULL timed event in codeGenerationCurrentParents";
                        continue;
                    }

                    if (TimedEvent::codeGenerationCurrentParents[i]->GetName() == instruction.GetParameter(0).GetPlainString())
                    {
                        TimedEvent & timedEvent = *TimedEvent::codeGenerationCurrentParents[i];

                        std::string code;
                        {
                            std::string codeName = !timedEvent.GetName().empty() ? "GDNamedTimedEvent_"+codeGenerator.ConvertToString(timedEvent.GetName()) : "GDTimedEvent_"+ToString(&timedEvent);
                            code += "GDpriv::TimedEvents::Reset(*runtimeContext->scene, \""+codeName+"\");\n";
                        }
                        for (unsigned int j = 0;j<timedEvent.codeGenerationChildren.size();++j)
                        {
                            std::string codeName = !timedEvent.codeGenerationChildren[j]->GetName().empty() ? "GDNamedTimedEvent_"+codeGenerator.ConvertToString(timedEvent.codeGenerationChildren[j]->GetName()) : "GDTimedEvent_"+ToString(timedEvent.codeGenerationChildren[j]);
                            code += "GDpriv::TimedEvents::Reset(*runtimeContext->scene, \""+codeName+"\");\n";
                        }
                        return code;
                    }
                }

                return std::string("");
            })
            .SetIncludeFile("TimedEvent/TimedEventTools.h");
        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };

    #if defined(GD_IDE_ONLY)
    bool HasDebuggingProperties() const { return true; };

    void GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const
    {
        unsigned int i = 0;
        std::map < std::string, ManualTimer >::const_iterator end = TimedEventsManager::managers[&scene].timedEvents.end();
        for (std::map < std::string, ManualTimer >::iterator iter = TimedEventsManager::managers[&scene].timedEvents.begin();iter != end;++iter)
        {
            if ( propertyNb == i )
            {
                name = iter->first;
                //Unmangle name
                if ( name.find("GDNamedTimedEvent_") == 0 && name.length() > 18 )
                    name = name.substr(18, name.length());
                else
                    name = _("No name");

                value = ToString(static_cast<double>(iter->second.GetTime())/1000000.0)+"s";

                return;
            }

            ++i;
        }
    }

    bool ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue)
    {
        unsigned int i = 0;
        std::map < std::string, ManualTimer >::const_iterator end = TimedEventsManager::managers[&scene].timedEvents.end();
        for (std::map < std::string, ManualTimer >::iterator iter = TimedEventsManager::managers[&scene].timedEvents.begin();iter != end;++iter)
        {
            if ( propertyNb == i )
            {
                iter->second.SetTime(ToDouble(newValue)*1000000.0);

                return true;
            }

            ++i;
        }

        return false;
    }

    unsigned int GetNumberOfProperties(RuntimeScene & scene) const
    {
        return TimedEventsManager::managers[&scene].timedEvents.size();
    }
    #endif

    void SceneLoaded(RuntimeScene & scene)
    {
        TimedEventsManager::managers[&scene].timedEvents.clear();
    }
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
