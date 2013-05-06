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

        GetAllEvents()["LinkEvent"].codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen);
    }

    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string outputCode;
                gd::StandardEvent & event = dynamic_cast<gd::StandardEvent&>(event_);

                outputCode += codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);

                std::string ifPredicat;
                for (unsigned int i = 0;i<event.GetConditions().size();++i)
                {
                    if (i!=0) ifPredicat += " && ";
                    ifPredicat += "condition"+gd::ToString(i)+"IsTrue";
                }

                if ( !ifPredicat.empty() ) outputCode += "if (" +ifPredicat+ ") {\n";
                outputCode += codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                if ( event.HasSubEvents() ) //Sub events
                {
                    outputCode += "\n{ //Subevents\n";
                    outputCode += codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
                    outputCode += "}\n";
                }

                outputCode += "}\n";

                return outputCode;
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        GetAllEvents()["StandardEvent"].codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen);
    }
}
