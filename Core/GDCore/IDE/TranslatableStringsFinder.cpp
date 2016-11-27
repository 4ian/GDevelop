#include "GDCore/IDE/TranslatableStringsFinder.h"

#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"

#include <wx/regex.h>

namespace gd
{

std::set<gd::String> TranslatableStringsFinder::GetTranslatableStrings(gd::Project & project)
{
	std::set<gd::String> translatableStrings;
	EventsListTranslatableStringsFinder finder( project, translatableStrings );

	for( std::size_t i = 0; i < project.GetLayoutsCount(); ++i )
		finder.Launch( project.GetLayout( i ).GetEvents() );

	for( std::size_t i = 0; i < project.GetExternalEventsCount(); ++i )
		finder.Launch( project.GetExternalEvents( i ).GetEvents() );

	return translatableStrings;
}

EventsListTranslatableStringsFinder::EventsListTranslatableStringsFinder(const gd::Project & project, std::set<gd::String> & translatableStrings) :
	project(project),
	translatableStrings(translatableStrings)
{
	//Get all extensions used
    std::vector<gd::String> usedExtensions = project.GetUsedExtensions();
    for (std::size_t i = 0; i < usedExtensions.size(); ++i)
    {
        std::shared_ptr<gd::PlatformExtension> extension = project.GetCurrentPlatform().GetExtension(usedExtensions[i]);

        if ( extension != std::shared_ptr<gd::PlatformExtension>() )
            allGameExtensions.push_back(extension);
    }
}

bool EventsListTranslatableStringsFinder::DoVisitInstruction(gd::Instruction & instruction, bool isCondition)
{
	gd::String type = instruction.GetType();
	for (std::size_t e = 0; e < allGameExtensions.size(); ++e)
	{
		std::map<gd::String, gd::InstructionMetadata>::const_iterator metadataIt;

		const std::map<gd::String, gd::InstructionMetadata> & allActions = allGameExtensions[e]->GetAllActions();
		metadataIt = allActions.find(type);
		if ( metadataIt != allActions.end() )
		{
			FindTranslatable(instruction, metadataIt->second);
		}

		const std::vector < gd::String > & objects = allGameExtensions[e]->GetExtensionObjectsTypes();
		for (std::size_t o = 0;o<objects.size();++o)
		{
			const std::map<gd::String, gd::InstructionMetadata> & allObjectsActions = allGameExtensions[e]->GetAllActionsForObject(objects[o]);
			metadataIt = allObjectsActions.find(type);
			if ( metadataIt != allObjectsActions.end() )
			{
				FindTranslatable(instruction, metadataIt->second);
			}
		}

		const std::vector < gd::String > & autos = allGameExtensions[e]->GetBehaviorsTypes();
		for (std::size_t a = 0;a<autos.size();++a)
		{
			const std::map<gd::String, gd::InstructionMetadata> & allAutosActions = allGameExtensions[e]->GetAllActionsForBehavior(autos[a]);
			metadataIt = allAutosActions.find(type);
			if ( metadataIt != allAutosActions.end() )
			{
				FindTranslatable(instruction, metadataIt->second);
			}
		}
	}

	return false;
}

void EventsListTranslatableStringsFinder::FindTranslatable(gd::Instruction & instruction, const gd::InstructionMetadata & metadata)
{
	for(std::size_t i = 0; i < instruction.GetParametersCount(); ++i)
	{
		gd::String parameterType = metadata.GetParameter(std::min(metadata.GetParametersCount() - 1, i)).GetType();
		if( parameterType == "expression" ||
		   parameterType == "string" ||
		   parameterType == "variadic" )
		{
			gd::String parameterValue = instruction.GetParameter(i).GetPlainString();
			wxRegEx translationFuncRegex( "(.*)_\\( *\"([^\\)]+)\" *\\).*" );

			while( translationFuncRegex.Matches( parameterValue ) )
			{
				translatableStrings.insert( translationFuncRegex.GetMatch(parameterValue, 2) );
				parameterValue = translationFuncRegex.GetMatch(parameterValue, 1); //Will try again to match on the remaining part of the string
			}
		}
		else if( parameterType == "objectvar" ||
			parameterType == "scenevar" ||
			parameterType == "globalvar" )
		{

		}
	}
}

}
