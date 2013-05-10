#include "CommonInstructionsExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/ForEachEvent.h"
#include "GDCore/Events/Builtin/WhileEvent.h"
#include "GDCore/Events/Builtin/RepeatEvent.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

CommonInstructionsExtension::CommonInstructionsExtension()
{
    SetExtensionInformation("BuiltinCommonInstructions",
                          _("Standard events"),
                          _("Builtin extension providing standard events."),
                          "Compil Games",
                          "Freeware");

    CloneExtension("Game Develop C++ platform", "BuiltinCommonInstructions");

    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual void Preprocess(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator,
                                    std::vector < gd::BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
            {
                gd::LinkEvent & event = dynamic_cast<gd::LinkEvent&>(event_);
                event.ReplaceLinkByLinkedEvents(codeGenerator.GetProject(), eventList, indexOfTheEventInThisList);
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        GetAllEvents()["BuiltinCommonInstructions::Link"].codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen);
    }

    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string outputCode;
                gd::StandardEvent & event = dynamic_cast<gd::StandardEvent&>(event_);

                outputCode += codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);

                std::string ifPredicat = event.GetConditions().empty() ? "" : "condition"+gd::ToString(event.GetConditions().size()-1)+"IsTrue.val";

                if ( !ifPredicat.empty() ) outputCode += "if (" +ifPredicat+ ") {\n";
                outputCode += codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                if ( event.HasSubEvents() ) //Sub events
                {
                    outputCode += "\n{ //Subevents\n";
                    outputCode += codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
                    outputCode += "} //End of subevents\n";
                }

                if ( !ifPredicat.empty() ) outputCode += "}\n";

                return outputCode;
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        GetAllEvents()["BuiltinCommonInstructions::Standard"].codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen);
    }
}
