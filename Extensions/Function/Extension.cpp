/**

Game Develop - Function Extension
Copyright (c) 2008-2013 Florian Rival (Florian.Rival@gmail.com)

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
#include "GDL/Events/ExpressionsCodeGeneration.h"
#include "GDL/Events/EventsCodeGenerationContext.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/Events/EventsCodeNameMangler.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/CommonTools.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/ExpressionParser.h"
#include "GDCore/Events/Instruction.h"
#endif
#include "FunctionEvent.h"
#include <boost/version.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
    public:

        /**
         * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
         */
        Extension()
        {
            DECLARE_THE_EXTENSION("Function",
                                  _("Function events"),
                                  _("Extension allowing to use events behaving as functions."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            #if defined(GD_IDE_ONLY)

            DECLARE_ACTION("LaunchFunction",
                           _("Launch a function"),
                           _("Launch a function"),
                           _("Launch _PARAM0_ (_PARAM1_, _PARAM2_, _PARAM3_, _PARAM4_, _PARAM5_, _PARAM6_, _PARAM7_)"),
                           _("Functions"),
                           "res/actions/function24.png",
                           "res/actions/function.png");

                instrInfo.AddParameter("", _("Name of the function"), "", false);
                instrInfo.AddParameter("string", _("Parameter 1"), "", true);
                instrInfo.AddParameter("string", _("Parameter 2"), "", true);
                instrInfo.AddParameter("string", _("Parameter 3"), "", true);
                instrInfo.AddParameter("string", _("Parameter 4"), "", true);
                instrInfo.AddParameter("string", _("Parameter 5"), "", true);
                instrInfo.AddParameter("string", _("Parameter 6"), "", true);
                instrInfo.AddParameter("string", _("Parameter 7"), "", true);

            class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
            {
                virtual std::string GenerateCode(const Game & game, const Scene & scene, gd::Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
                {
                    codeGenerator.AddGlobalDeclaration(FunctionEvent::globalDeclaration);
                    std::string functionName = instruction.GetParameter(0).GetPlainString();

                    boost::shared_ptr<FunctionEvent> functionEvent = FunctionEvent::SearchForFunctionInEvents(scene.GetEvents(), functionName);
                    if ( functionEvent == boost::shared_ptr<FunctionEvent>() )
                    {
                        std::cout << "Function \""+functionName+"\" not found!" << std::endl;
                        return "//Function \""+functionName+"\" not found.\n";
                    }

                    std::string code;

                    //Generate code for objects passed as arguments
                    std::string objectsAsArgumentCode;
                    {
                        vector< gd::ObjectGroup >::const_iterator globalGroup = find_if(game.GetObjectGroups().begin(), game.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), functionEvent->GetObjectsPassedAsArgument()));
                        vector< gd::ObjectGroup >::const_iterator sceneGroup = find_if(scene.GetObjectGroups().begin(), scene.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), functionEvent->GetObjectsPassedAsArgument()));

                        std::vector<std::string> realObjects;
                        if ( globalGroup != game.GetObjectGroups().end() )
                            realObjects = (*globalGroup).GetAllObjectsNames();
                        else if ( sceneGroup != scene.GetObjectGroups().end() )
                            realObjects = (*sceneGroup).GetAllObjectsNames();
                        else
                            realObjects.push_back(functionEvent->GetObjectsPassedAsArgument());

                        objectsAsArgumentCode += "runtimeContext->ClearObjectListsMap()";
                        for (unsigned int i = 0;i<realObjects.size();++i)
                        {
                            context.EmptyObjectsListNeeded(realObjects[i]);
                            objectsAsArgumentCode += ".AddObjectListToMap(\""+EventsCodeGenerator::ConvertToCppString(realObjects[i])+"\", "+ManObjListName(realObjects[i])+")";
                        }
                        objectsAsArgumentCode += ".ReturnObjectListsMap()";
                    }

                    //Generate code for evaluating parameters
                    code += "std::vector<std::string> functionParameters;\n";
                    for (unsigned int i = 1;i<8;++i)
                    {
                        std::string parameterCode;
                        CallbacksForGeneratingExpressionCode callbacks(parameterCode, game, scene, codeGenerator, context);
                        gd::ExpressionParser parser(instruction.GetParameter(i).GetPlainString());
                        parser.ParseStringExpression(game, scene, callbacks);
                        if (parameterCode.empty()) parameterCode = "\"\"";

                        code += "functionParameters.push_back("+parameterCode+");\n";
                    }
                    code += "std::vector<std::string> * oldFunctionParameters = currentFunctionParameters;\n";
                    code += "currentFunctionParameters = &functionParameters;\n";

                    code += FunctionEvent::MangleFunctionName(*functionEvent)+"(runtimeContext, "+objectsAsArgumentCode+");\n";
                    code += "currentFunctionParameters = oldFunctionParameters;\n";

                    return code;
                };
            };

            gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
            instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

            DECLARE_END_ACTION()

            DECLARE_EVENT("Function",
                          _("Function"),
                          _("Function event : An event which is launched only thanks to action \"Launch a function\""),
                          "",
                          "res/function.png",
                          FunctionEvent)

            DECLARE_END_EVENT()

            DECLARE_STR_EXPRESSION("Parameter",
                           _("Parameter of the current function"),
                           _("Return the text contained in a parameter of the currently launched function"),
                           _("Function"),
                           "res/function.png")

                instrInfo.AddParameter("expression", _("Number of the parameter ( Parameters start at 0 ! )"), "", false);

            class CodeGenerator : public gd::StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator
            {
                virtual std::string GenerateCode(const Game & game, const Scene & scene, const std::vector<gd::Expression> & parameters, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
                {
                    codeGenerator.AddGlobalDeclaration(FunctionEvent::globalDeclaration);
                    codeGenerator.AddIncludeFile("Function/FunctionTools.h");

                    //Generate code for evaluating index
                    std::string expression;
                    CallbacksForGeneratingExpressionCode callbacks(expression, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(parameters[0].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || expression.empty()) expression = "0";

                    std::string code;

                    code += "GDpriv::FunctionTools::GetSafelyStringFromVector(currentFunctionParameters, "+expression+")";

                    return code;
                };
            };

            gd::StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
            instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

            DECLARE_END_STR_EXPRESSION()

            #endif

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

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

