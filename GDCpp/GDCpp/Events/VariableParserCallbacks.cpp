/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#include <string>
#include <vector>
#include "GDCore/Events/VariableParser.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/ObjectMetadata.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCpp/Events/VariableParserCallbacks.h"
#include "GDCpp/CommonTools.h"

using namespace std;

VariableCodeGenerationCallbacks::VariableCodeGenerationCallbacks(string & output_,
                                                               gd::EventsCodeGenerator & codeGenerator_,
                                                               gd::EventsCodeGenerationContext & context_,
                                                               const VariableScope & scope_) :
    output(output_),
    codeGenerator(codeGenerator_),
    context(context_),
    scope(scope_)
{
	if ( scope == OBJECT_VARIABLE ) {
		std::cout << "ERROR: Initializing VariableCodeGenerationCallbacks with OBJECT_VARIABLE without object.";
	}
}

VariableCodeGenerationCallbacks::VariableCodeGenerationCallbacks(string & output_,
                                                               gd::EventsCodeGenerator & codeGenerator_,
                                                               gd::EventsCodeGenerationContext & context_,
                                                               const std::string & object_) :
    output(output_),
    codeGenerator(codeGenerator_),
    context(context_),
    scope(OBJECT_VARIABLE),
    object(object_)
{
}

void VariableCodeGenerationCallbacks::OnRootVariable(std::string variableName)
{
	const gd::VariablesContainer * variables = NULL;
	if ( scope == LAYOUT_VARIABLE ) {
		output = "runtimeContext->GetSceneVariables()";
		variables = &codeGenerator.GetLayout().GetVariables();
	}
	else if ( scope == PROJECT_VARIABLE ) {
		output = "runtimeContext->GetGameVariables()";
		variables = &codeGenerator.GetProject().GetVariables();	
	}
	else { 
	    std::vector<std::string> realObjects = codeGenerator.ExpandObjectsName(object, context);

	    output = "RuntimeVariablesContainer::GetBadVariablesContainer()";
	    for (unsigned int i = 0;i<realObjects.size();++i)
	    {
	        //Generate the call to GetVariables() method.
	        if ( context.GetCurrentObject() == realObjects[i] && !context.GetCurrentObject().empty())
	            output = codeGenerator.GetObjectListName(realObjects[i], context)+"[i]->GetVariables()";
	        else
	            output = "(("+codeGenerator.GetObjectListName(realObjects[i], context)+".empty() ) ? "+output+" : "+
	            	codeGenerator.GetObjectListName(realObjects[i], context)+"[0]->GetVariables())";
	    }

	    if ( codeGenerator.GetLayout().HasObjectNamed(object) ) //We check first layout's objects' list.
	        variables = &codeGenerator.GetLayout().GetObject(object).GetVariables();
	    else if ( codeGenerator.GetProject().HasObjectNamed(object) ) //Then the global objects list.
	        variables = &codeGenerator.GetProject().GetObject(object).GetVariables();
	}

	//Optimize the lookup of the variable when the variable is declared.
	//(In this case, it is stored in an array at runtime and we know its position.)
	if ( variables && variables->Has(variableName) )
	{
		unsigned int index = variables->GetPosition(variableName);
		if ( index < variables->Count() )
		{
			output += ".Get("+ToString(index)+")";
			return;
		}
	}
	
	output += ".Get(\""+variableName+"\")";
}

void VariableCodeGenerationCallbacks::OnChildVariable(std::string variableName)
{
	output += ".GetChild(\""+variableName+"\")";
}

void VariableCodeGenerationCallbacks::OnChildSubscript(std::string stringExpression)
{
	std::string argumentCode;
    gd::CallbacksForGeneratingExpressionCode callbacks(argumentCode, codeGenerator, context);

    gd::ExpressionParser parser(stringExpression);
    if ( !parser.ParseStringExpression(codeGenerator.GetPlatform(), 
    	codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) )
    {
        cout << "Error in text expression" << parser.firstErrorStr << endl;
        argumentCode = "\"\"";
    }

    if (argumentCode.empty()) argumentCode = "\"\"";

	output += ".GetChild("+argumentCode+")";
}
#endif