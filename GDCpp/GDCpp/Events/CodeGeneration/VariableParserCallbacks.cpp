/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include <string>
#include <vector>
#include "GDCore/Events/Parsers/VariableParser.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCpp/Events/CodeGeneration/VariableParserCallbacks.h"
#include "GDCpp/Runtime/CommonTools.h"

using namespace std;

VariableCodeGenerationCallbacks::VariableCodeGenerationCallbacks(gd::String & output_,
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

VariableCodeGenerationCallbacks::VariableCodeGenerationCallbacks(gd::String & output_,
                                                               gd::EventsCodeGenerator & codeGenerator_,
                                                               gd::EventsCodeGenerationContext & context_,
                                                               const gd::String & object_) :
    output(output_),
    codeGenerator(codeGenerator_),
    context(context_),
    scope(OBJECT_VARIABLE),
    object(object_)
{
}

void VariableCodeGenerationCallbacks::OnRootVariable(gd::String variableName)
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
	    std::vector<gd::String> realObjects = codeGenerator.ExpandObjectsName(object, context);

	    output = "RuntimeVariablesContainer::GetBadVariablesContainer()";
	    for (std::size_t i = 0;i<realObjects.size();++i)
	    {
        	context.ObjectsListNeeded(realObjects[i]);

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
		std::size_t index = variables->GetPosition(variableName);
		if ( index < variables->Count() )
		{
			output += ".Get("+gd::String::From(index)+")";
			return;
		}
	}

	output += ".Get(\""+variableName+"\")";
}

void VariableCodeGenerationCallbacks::OnChildVariable(gd::String variableName)
{
	output += ".GetChild(\""+variableName+"\")";
}

void VariableCodeGenerationCallbacks::OnChildSubscript(gd::String stringExpression)
{
	gd::String argumentCode;
    gd::CallbacksForGeneratingExpressionCode callbacks(argumentCode, codeGenerator, context);

    gd::ExpressionParser parser(stringExpression);
    if ( !parser.ParseStringExpression(codeGenerator.GetPlatform(),
    	codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) )
    {
        cout << "Error in text expression" << parser.GetFirstError() << endl;
        argumentCode = "\"\"";
    }

    if (argumentCode.empty()) argumentCode = "\"\"";

	output += ".GetChild("+argumentCode+")";
}
#endif
