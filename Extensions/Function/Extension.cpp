/**

Game Develop - Function Extension
Copyright (c) 2008-2011 Florian Rival (Florian.Rival@gmail.com)

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
#include "GDL/StrExpressionInstruction.h"
#include "GDL/EventsCodeGenerationContext.h"
#include "GDL/ExpressionsCodeGeneration.h"
#include "GDL/EventsCodeGenerator.h"
#include "GDL/GDExpressionParser.h"
#include "GDL/Instruction.h"
#include "FunctionEvent.h"
#include <boost/version.hpp>

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
            DECLARE_THE_EXTENSION("Function",
                                  _("Evenements fonctions"),
                                  _("Extension permettant d'utiliser des évènements agissant comme des fonctions."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            #if defined(GD_IDE_ONLY)

            DECLARE_ACTION("LaunchFunction",
                           _("Lancer une fonction"),
                           _("Lance une fonction"),
                           _("Lancer _PARAM0_ (_PARAM1_, _PARAM2_, _PARAM3_, _PARAM4_, _PARAM5_, _PARAM6_, _PARAM7_)"),
                           _("Fonctions"),
                           "res/actions/function24.png",
                           "res/actions/function.png");

                instrInfo.AddParameter("", _("Nom de la fonction"), "", false);
                instrInfo.AddParameter("string", _("Paramètre 1"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 2"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 3"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 4"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 5"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 6"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 7"), "", true);
                instrInfo.AddCodeOnlyParameter("mapOfAllObjectLists", "");
                instrInfo.AddCodeOnlyParameter("listOfAlreadyPickedObjects", "");

            class CodeGenerator : public InstructionInfos::CppCallingInformation::CustomCodeGenerator
            {
                virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerationContext & context)
                {
                    context.AddGlobalDeclaration(FunctionEvent::globalDeclaration);
                    std::string functionName = instruction.GetParameterSafely(0).GetPlainString();

                    std::string code;

                    //Generate code for evaluating parameters
                    code += "std::vector<std::string> functionParameters;\n";
                    for (unsigned int i = 1;i<8;++i)
                    {
                        std::string parameterCode;
                        CallbacksForGeneratingExpressionCode callbacks(parameterCode, game, scene, context);
                        GDExpressionParser parser(instruction.GetParameterSafely(i).GetPlainString());
                        parser.ParseTextExpression(game, scene, callbacks);
                        if (parameterCode.empty()) parameterCode = "\"\"";

                        code += "functionParameters.push_back("+parameterCode+");\n";
                    }
                    code += "std::vector<std::string> * oldFunctionParameters = currentFunctionParameters;\n";
                    code += "currentFunctionParameters = &functionParameters;\n";

                    context.MapOfAllObjectsNeeded(game, scene);
                    context.NeedObjectListsDynamicDeclaration();

                    code += "if(functionEventsMap->find(\""+functionName+"\") != functionEventsMap->end()) (*functionEventsMap)[\""+functionName+"\"](runtimeContext, objectsListsMap, objectsAlreadyDeclared);\n";
                    code += "currentFunctionParameters = oldFunctionParameters;\n";

                    return code;
                };
            };

            InstructionInfos::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
            instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

            DECLARE_END_ACTION()

            DECLARE_ACTION("LaunchFunctionFromExpression",
                           _("Lancer une fonction grâce à une expression"),
                           _("Lance une fonction en retrouvant son nom depuis l'expression."),
                           _("Lancer la fonction correspondant à _PARAM0_ (_PARAM2_, _PARAM3_, _PARAM4_, _PARAM5_, _PARAM6_, _PARAM7_)"),
                           _("Fonctions"),
                           "res/actions/function24.png",
                           "res/actions/function.png");

                instrInfo.AddParameter("string", _("Expression donnant le nom de la fonction"), "", false);
                instrInfo.AddParameter("string", _("Paramètre 1"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 2"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 3"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 4"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 5"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 6"), "", true);
                instrInfo.AddParameter("string", _("Paramètre 7"), "", true);

            class CodeGenerator : public InstructionInfos::CppCallingInformation::CustomCodeGenerator
            {
                virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerationContext & context)
                {
                    context.AddGlobalDeclaration(FunctionEvent::globalDeclaration);

                    //Generate code for evaluating function name
                    std::string functionNameCode;
                    CallbacksForGeneratingExpressionCode callbacks(functionNameCode, game, scene, context);
                    GDExpressionParser parser(instruction.GetParameterSafely(0).GetPlainString());
                    parser.ParseTextExpression(game, scene, callbacks);
                    if (functionNameCode.empty()) functionNameCode = "\"\"";

                    std::string code;

                    //Generate code for evaluating parameters
                    code += "std::vector<std::string> functionParameters;\n";
                    for (unsigned int i = 1;i<8;++i)
                    {
                        std::string parameterCode;
                        CallbacksForGeneratingExpressionCode callbacks(parameterCode, game, scene, context);
                        GDExpressionParser parser(instruction.GetParameterSafely(i).GetPlainString());
                        parser.ParseTextExpression(game, scene, callbacks);
                        if (parameterCode.empty()) parameterCode = "\"\"";

                        code += "functionParameters.push_back("+parameterCode+");\n";
                    }

                    code += "std::vector<std::string> * oldFunctionParameters = currentFunctionParameters;\n";
                    code += "currentFunctionParameters = &functionParameters;\n";

                    context.MapOfAllObjectsNeeded(game, scene);
                    context.NeedObjectListsDynamicDeclaration();
                    code += "if(functionEventsMap->find("+functionNameCode+") != functionEventsMap->end()) (*functionEventsMap)["+functionNameCode+"](runtimeContext, objectsListsMap, objectsAlreadyDeclared);";
                    code += "currentFunctionParameters = oldFunctionParameters;\n";

                    return code;
                };
            };

            InstructionInfos::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
            instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>(codeGenerator));


            DECLARE_END_ACTION()

            DECLARE_EVENT("Function",
                          _("Fonction"),
                          _("Évènement fonction : L'évènement lancé uniquement grâce à l'action \"Lancer une fonction\""),
                          "",
                          "res/function.png",
                          FunctionEvent)

            DECLARE_END_EVENT()

            DECLARE_STR_EXPRESSION("Parameter",
                           _("Paramètre de la fonction actuel"),
                           _("Renvoi le texte contenue dans un paramètre de la fonction actuellement lancée"),
                           _("Fonction"),
                           "res/function.png")

                instrInfo.AddParameter("expression", _("Numéro du paramètre ( Commence à 0 ! )"), "", false);

            class CodeGenerator : public StrExpressionInfos::CppCallingInformation::CustomCodeGenerator
            {
                virtual std::string GenerateCode(const Game & game, const Scene & scene, const StrExpressionInstruction & instruction, EventsCodeGenerationContext & context)
                {
                    context.AddGlobalDeclaration(FunctionEvent::globalDeclaration);
                    context.AddIncludeFile("Function/FunctionTools.h");

                    //Generate code for evaluating index
                    std::string expression;
                    CallbacksForGeneratingExpressionCode callbacks(expression, game, scene, context);
                    GDExpressionParser parser(instruction.parameters[0].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || expression.empty()) expression = "0";

                    std::string code;

                    code += "GDpriv::FunctionTools::GetSafelyStringFromVector(currentFunctionParameters, "+expression+")";

                    return code;
                };
            };

            StrExpressionInfos::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
            instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<StrExpressionInfos::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

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
