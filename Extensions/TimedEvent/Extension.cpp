/**

Game Develop - Timed Event Extension
Copyright (c) 2011 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include <boost/version.hpp>
#include "TimedEvent.h"
#include "TimedEventsManager.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/EventsCodeGenerationContext.h"

/**
 * This class declare information about the extension.
 */
class Extension : public ExtensionBase
{
    public:

        /**
         * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
         */
        Extension()
        {
            DECLARE_THE_EXTENSION("TimedEvent",
                                  _("Evenements à retardement"),
                                  _("Extension permettant d'utiliser des évènements qui ne se déclenche qu'au bout de l'accumulation d'un certain temps."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            #if defined(GD_IDE_ONLY)

            DECLARE_EVENT("TimedEvent",
                          _("Evenement à retardement"),
                          _("Evenement qui ne se déclenche qu'au bout de l'accumulation d'un certain temps"),
                          "",
                          "Extensions/timedevent16.png",
                          TimedEvent)

            DECLARE_END_EVENT()

            DECLARE_ACTION("ResetTimedEvent",
                           _("Remettre à zéro un évènement retardé"),
                           _("Remet à zéro un évènement à retardement"),
                           _("Remettre à zéro le(s) évènement(s) retardé(s) _PARAM1_"),
                           _("Evenements retardés"),
                           "Extensions/timedevent24.png",
                           "Extensions/timedevent16.png");

                instrInfo.AddCodeOnlyParameter("currentScene", "");
                instrInfo.AddParameter("", _("Nom"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::TimedEvents::Reset").SetIncludeFile("TimedEvent/TimedEventTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("ResetTimedEventAndSubs",
                           _("Remettre à zéro ainsi que les sous évènements"),
                           _("Remet à zéro un évènement retardé, ainsi que tous les sous évènements à retardement qu'il contient."),
                           _("Remettre à zéro le(s) évènement(s) retardé(s) _PARAM0_ et ses sous évènements"),
                           _("Evenements retardés"),
                           "Extensions/timedevent24.png",
                           "Extensions/timedevent16.png");

                instrInfo.AddParameter("", _("Nom"), "", false);

            class CodeGenerator : public InstructionInfos::CppCallingInformation::CustomCodeGenerator
            {
                virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerationContext & context)
                {
                    context.AddIncludeFile("TimedEvent/TimedEventTools.h");

                    for (unsigned int i = 0;TimedEvent::codeGenerationCurrentParents.size();++i)
                    {
                        if (TimedEvent::codeGenerationCurrentParents[i]->GetName() == instruction.GetParameterSafely(0).GetPlainString())
                        {
                            TimedEvent & timedEvent = *TimedEvent::codeGenerationCurrentParents[i];

                            std::string code;
                            {
                                std::string codeName = !timedEvent.GetName().empty() ? "GDNamedTimedEvent_"+timedEvent.GetName() : "GDTimedEvent_"+ToString(&timedEvent);
                                code += "GDpriv::TimedEvents::Reset(*runtimeContext->scene, \""+codeName+"\");\n";
                            }
                            for (unsigned int j = 0;j<timedEvent.codeGenerationChildren.size();++j)
                            {
                                std::string codeName = !timedEvent.codeGenerationChildren[j]->GetName().empty() ? "GDNamedTimedEvent_"+timedEvent.codeGenerationChildren[j]->GetName() : "GDTimedEvent_"+ToString(timedEvent.codeGenerationChildren[j]);
                                code += "GDpriv::TimedEvents::Reset(*runtimeContext->scene, \""+codeName+"\");\n";
                            }
                            return code;
                        }
                    }

                    return "";
                };
            };
            InstructionInfos::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
            instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

            instrInfo.cppCallingInformation.SetIncludeFile("TimedEvent/TimedEventTools.h");

            DECLARE_END_ACTION()

            #endif

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

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
                    name = iter->first.empty() ? ToString(_("Sans nom")) : iter->first;
                    value = ToString(static_cast<double>(iter->second.GetTime())/1000.0)+"s";

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
                    iter->second.SetTime(ToFloat(newValue));

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

    protected:
    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
        void CompleteCompilationInformation()
        {
            #if defined(GD_IDE_ONLY)
            compilationInfo.runtimeOnly = false;
            #else
            compilationInfo.runtimeOnly = true;
            #endif

            #if defined(__GNUC__)
            compilationInfo.gccMajorVersion = __GNUC__;
            compilationInfo.gccMinorVersion = __GNUC_MINOR__;
            compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;
            #endif

            compilationInfo.boostVersion = BOOST_VERSION;

            compilationInfo.sfmlMajorVersion = 2;
            compilationInfo.sfmlMinorVersion = 0;

            #if defined(GD_IDE_ONLY)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}
