#include "GDExpressionParser.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/GDExpression.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/ExtensionBase.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/CommonInstructions.h"
#include "GDL/CommonTools.h"

size_t GetMinimalParametersNumber(const std::vector < ParameterInfo > & parametersInfos)
{
    size_t nb = 0;
    for (unsigned int i = 0;i<parametersInfos.size();++i)
    {
    	if ( !parametersInfos[i].optional ) nb++;
    }

    return nb;
}

std::string ReplaceTildesBySpaces(std::string text)
{
    size_t foundPos=text.find("~");
    while(foundPos != string::npos)
    {
        if(foundPos != string::npos) text.replace(foundPos,1," ");
        foundPos=text.find("~", foundPos+1);
    }

    return text;
}

bool GDExpressionParser::ParseMathExpression(const Game & game, const Scene & scene,
                                             ConstantTokenFunctor & constantTokenFunctor,
                                             StaticFunctionFunctor & staticFunctionFunctor,
                                             ObjectFunctionFunctor & objectFunctionFunctor,
                                             AutomatismFunctionFunctor & automatismFunctionFunctor)
{

    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    string expression = expressionPlainString;

    //Constants
    vector < string > mathFunctions = GDMathParser::GetAllMathFunctions();
    const string possibleSeparator = GDMathParser::GetAllMathSeparator();

    size_t parsePosition = 0;

    size_t firstPointPos = expression.find(".");
    size_t firstParPos = expression.find("(");

    while ( firstPointPos != string::npos || firstParPos != string::npos )
    {
        //Identify name
        size_t nameEnd = firstPointPos < firstParPos ? firstPointPos : firstParPos;
        size_t nameStart = expression.find_last_of(possibleSeparator, nameEnd-1);
        nameStart++;

        string nameBefore = expression.substr(nameStart, nameEnd-nameStart);
        string objectName = ReplaceTildesBySpaces(nameBefore);

        //Identify function name
        string functionName = nameBefore;
        size_t functionNameEnd = nameEnd;
        vector < GDExpression > parameters;

        bool nameIsFunction = firstPointPos > firstParPos;
        if ( !nameIsFunction )
        {
            parameters.push_back(GDExpression(objectName));
            functionNameEnd = expression.find_first_of(" (", nameEnd);
            if ( nameEnd+1 < expression.length()) functionName = expression.substr(nameEnd+1, functionNameEnd-(nameEnd+1));
            if ( functionNameEnd == string::npos )
            {
                functionName = "";
                functionNameEnd = expression.length()-1;
            }
        }

        //Try to find an instruction with the same name
        ExpressionInstruction instruction;
        ExpressionInfos instructionInfos;

        //Verify if we are not with a math expression.
        if ( functionName.substr(0, functionName.length()-1).find_first_of(possibleSeparator) == string::npos )
        {
            bool isMathFunction = find(mathFunctions.begin(), mathFunctions.end(), functionName) != mathFunctions.end();
            if ( !isMathFunction )
            {
                //First try to bind to a static expression
                if ( nameIsFunction && extensionsManager->HasExpression(functionName) )
                {
                    instruction.function = (extensionsManager->GetExpressionFunctionPtr(functionName));
                    instructionInfos = extensionsManager->GetExpressionInfos(functionName);
                }
                //Then search in object expression
                else if ( !nameIsFunction && extensionsManager->HasObjectExpression(GetTypeIdOfObject(game, scene, objectName), functionName) )
                {
                    instruction.function = &ExpObjectFunction;
                    instruction.objectFunction = extensionsManager->GetObjectExpressionFunctionPtr(GetTypeIdOfObject(game, scene, objectName), functionName);
                    instructionInfos = extensionsManager->GetObjectExpressionInfos(extensionsManager->GetStringFromTypeId(GetTypeIdOfObject(game, scene, objectName)), functionName);
                }
                //And in automatisms expressions
                else if ( !nameIsFunction )
                {
                    size_t firstDoublePoints = functionName.find("::");
                    if ( firstDoublePoints != string::npos )
                    {
                        std::string autoName = functionName.substr(0, firstDoublePoints);
                        if ( firstDoublePoints+2 < functionName.length() )
                            functionName = functionName.substr(firstDoublePoints+2, functionName.length());
                        else
                            functionName = "";

                        if ( extensionsManager->HasAutomatismExpression(GetTypeIdOfAutomatism(game, scene, autoName), functionName) )
                        {
                            parameters.push_back(GDExpression(autoName));
                            instruction.function = &ExpAutomatismFunction;
                            instruction.automatismFunction = extensionsManager->GetAutomatismExpressionFunctionPtr(GetTypeIdOfAutomatism(game, scene, autoName), functionName);

                            ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
                            instructionInfos = extensionsManager->GetAutomatismExpressionInfos(objectIdentifiersManager->GetNamefromOID(GetTypeIdOfAutomatism(game, scene, autoName)), functionName);

                            //Verify that object has automatism.
                            unsigned int automatismNameId = objectIdentifiersManager->GetOIDfromName(autoName);
                            vector < unsigned int > automatisms = GetAutomatismsOfObject(game, scene, objectName);
                            if ( find(automatisms.begin(), automatisms.end(), automatismNameId) == automatisms.end() )
                            {
                                cout << "Bad automatism requested" << endl;
                                instruction.function = NULL;
                            }
                        }
                    }
                }
            }

            if( !isMathFunction && instruction.function != NULL ) //Add the function
            {
                //Identify parameters
                size_t parametersEnd = expression.find_first_of("(", functionNameEnd);
                string currentParameterStr;
                char previousChar = '(';
                bool takeSymbolsInAccount = true;
                if ( parametersEnd != string::npos )
                {
                    size_t level = 0;
                    parametersEnd++;

                    while ( parametersEnd < expression.length() && !(expression[parametersEnd] == ')' && level == 0) )
                    {
                        //Be sure we are not in quotes
                        if ( expression[parametersEnd] == '\"' && previousChar != '\\') takeSymbolsInAccount = !takeSymbolsInAccount;

                        //So as to be sure paranthesis don't belong to a parameter
                        if ( expression[parametersEnd] == '(' && takeSymbolsInAccount ) level++;
                        if ( expression[parametersEnd] == ')' && takeSymbolsInAccount ) level--;

                        //Add the character to the current parameter or terminate the latter
                        if ( (expression[parametersEnd] == ',' && level == 0) && takeSymbolsInAccount )
                        {
                            if ( !AddParameterToList(game, scene, parameters, currentParameterStr, instructionInfos.parameters, parametersEnd) )
                                return false;

                            currentParameterStr.clear();
                        }
                        else currentParameterStr += expression[parametersEnd];

                        previousChar = expression[parametersEnd];
                        parametersEnd++;
                    }
                    if ( currentParameterStr.find_first_not_of(" ") != string::npos ) //Add last parameter if needed
                    {
                        if ( !AddParameterToList(game, scene, parameters, currentParameterStr, instructionInfos.parameters, parametersEnd) )
                            return false;
                    }

                    if(parametersEnd == expression.length() || expression[parametersEnd] != ')')
                    {
                        #if defined(GDE)
                        firstErrorStr = _("Parenthèses non fermées");
                        firstErrorPos = parametersEnd-1;
                        #endif
                        return false;
                    }

                    //Testing the number of parameters
                    if ( parameters.size() > instructionInfos.parameters.size() || parameters.size() < GetMinimalParametersNumber(instructionInfos.parameters) )
                    {
                        #if defined(GDE)
                        firstErrorPos = functionNameEnd;
                        firstErrorStr = _("Nombre de paramètre incorrect.");
                        firstErrorStr += " ";
                        firstErrorStr += _("Attendu ( au maximum ) :");
                        firstErrorStr += ToString(instructionInfos.parameters.size());
                        #endif
                        return false;
                    }
                }
                else
                {
                    #if defined(GDE)
                    firstErrorPos = functionNameEnd;
                    firstErrorStr = _("Parenthèses des paramètres manquantes");
                    #endif

                    return false;
                }

                instruction.parameters = parameters;

                constantTokenFunctor(expression.substr(parsePosition, nameStart-parsePosition));
                if      ( instruction.objectFunction ) objectFunctionFunctor(functionName, instruction);
                else if ( instruction.automatismFunction ) automatismFunctionFunctor(functionName, instruction);
                else if ( instruction.function ) staticFunctionFunctor(functionName, instruction);

                parsePosition = parametersEnd+1;
                firstPointPos = expression.find(".", parametersEnd+1);
                firstParPos = expression.find("(", parametersEnd+1);
            }
            else //Math function or math constant : Pass it.
            {
                constantTokenFunctor(expression.substr(parsePosition, functionNameEnd+1-parsePosition));
                parsePosition = functionNameEnd+1;
                firstPointPos = expression.find(".", functionNameEnd+1);
                firstParPos = expression.find("(", functionNameEnd+1);
            }
        }
        else //Not a function call : Pass it
        {
            constantTokenFunctor(expression.substr(parsePosition, nameEnd+1-parsePosition));
            parsePosition = nameEnd+1;
            firstPointPos = expression.find(".", nameEnd+1);
            firstParPos = expression.find("(", nameEnd+1);
        }
    }

    if ( parsePosition < expression.length() )
        constantTokenFunctor(expression.substr(parsePosition, expression.length()));

    return true;
}


bool GDExpressionParser::ParseTextExpression(const Game & game, const Scene & scene,
                                             ConstantTokenFunctor & constantTokenFunctor,
                                             StaticFunctionFunctor & staticFunctionFunctor,
                                             ObjectFunctionFunctor & objectFunctionFunctor,
                                             AutomatismFunctionFunctor & automatismFunctionFunctor)
{
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    string expression = expressionPlainString;

    //Constants
    vector < string > mathFunctions = GDMathParser::GetAllMathFunctions();
    const string possibleSeparator = GDMathParser::GetAllMathSeparator();

    size_t parsePosition = 0;

    //Searching for first token.
    size_t firstPointPos = expression.find(".");
    size_t firstParPos = expression.find("(");
    size_t firstQuotePos = expression.find("\"");

    if ( firstPointPos == string::npos && firstParPos == string::npos && firstQuotePos == string::npos  )
    {
        #if defined(GDE)
        firstErrorPos = 0;
        firstErrorStr = _("L'expression est invalide ou vide. Entrez un texte ( entouré de guillemets ) ou une fonction.");
        #endif
        return false;
    }

    while ( firstPointPos != string::npos || firstParPos != string::npos || firstQuotePos != string::npos )
    {
        if ( firstQuotePos < firstPointPos && firstQuotePos < firstParPos ) //Adding a constant text
        {
            //Finding start and end of quotes
            size_t finalQuotePosition = expression.find("\"", firstQuotePos+1);
            while ( finalQuotePosition == expression.find("\\\"", finalQuotePosition-1)+1)
                finalQuotePosition = expression.find("\"", finalQuotePosition+1);

            if ( finalQuotePosition == string::npos )
            {
                #if defined(GDE)
                firstErrorPos = firstQuotePos;
                firstErrorStr = _("Guillemets non fermés.");
                #endif
                return false;
            }

            //Generating final text, by replacing \" by quotes
            string finalText = expression.substr(firstQuotePos+1, finalQuotePosition-(firstQuotePos+1));

            size_t foundPos=finalText.find("\\\"");
            while(foundPos != string::npos)
            {
                if(foundPos != string::npos) finalText.replace(foundPos,2,"\"");
                foundPos=finalText.find("\\\"", foundPos);
            }

            //Adding constant text instruction
            StrExpressionInstruction instruction;

            instruction.function = &ExpConstantText;
            vector < GDExpression > parameters;
            parameters.push_back(finalText);
            instruction.parameters = parameters;

            staticFunctionFunctor("", instruction);

            parsePosition = finalQuotePosition+1;
        }
        else //Adding a function
        {
            //Identify name
            size_t nameEnd = firstPointPos < firstParPos ? firstPointPos : firstParPos;
            size_t nameStart = expression.find_last_of(possibleSeparator, nameEnd-1);
            nameStart++;

            string nameBefore = expression.substr(nameStart, nameEnd-nameStart);
            string objectName = ReplaceTildesBySpaces(nameBefore);

            //Identify function name
            string functionName = nameBefore;
            size_t functionNameEnd = nameEnd;
            vector < GDExpression > parameters;

            bool nameIsFunction = firstPointPos > firstParPos;
            if ( !nameIsFunction )
            {
                parameters.push_back(GDExpression(objectName));
                functionNameEnd = expression.find_first_of("( ", nameEnd);
                if ( nameEnd+1 < expression.length()) functionName = expression.substr(nameEnd+1, functionNameEnd-(nameEnd+1));
            }

            //Identify parameters
            size_t parametersEnd = expression.find_first_of("(", functionNameEnd)+1;
            char previousChar = '(';
            bool takeSymbolsInAccount = true;
            size_t level = 0;
            string currentParameterStr;
            while ( parametersEnd < expression.length() && !(expression[parametersEnd] == ')' && level == 0) )
            {
                //Be sure we are not in quotes
                if ( expression[parametersEnd] == '\"' && previousChar != '\\') takeSymbolsInAccount = !takeSymbolsInAccount;

                //So as to be sure paranthesis don't belong to a parameter
                if ( expression[parametersEnd] == '(' && takeSymbolsInAccount ) level++;
                if ( expression[parametersEnd] == ')' && takeSymbolsInAccount ) level--;

                //Add the character to the current parameter or terminate the latter
                if ( (expression[parametersEnd] == ',' && level == 0) && takeSymbolsInAccount )
                {
                    GDExpression currentParameter(currentParameterStr);
                    parameters.push_back(currentParameter);

                    currentParameterStr.clear();
                }
                else currentParameterStr += expression[parametersEnd];

                previousChar = expression[parametersEnd];
                parametersEnd++;
            }

            if ( parametersEnd == expression.length() || expression[parametersEnd] != ')' )
            {
                #if defined(GDE)
                firstErrorPos = parametersEnd-1;
                firstErrorStr = _("Parenthèses non fermées");
                #endif
                return false;
            }

            GDExpression lastParameter(currentParameterStr);
            parameters.push_back(lastParameter);

            StrExpressionInstruction instruction;

            //First try to bind to a static str expression
            if ( nameIsFunction && extensionsManager->HasStrExpression(functionName) )
            {
                instruction.function = (extensionsManager->GetStrExpressionFunctionPtr(functionName));
                vector < ParameterInfo > parametersInfos = extensionsManager->GetStrExpressionInfos(functionName).parameters;

                //Testing the number of parameters
                if ( parametersInfos.size() > parameters.size() || parameters.size() < GetMinimalParametersNumber(parametersInfos))
                {
                    #if defined(GDE)
                    firstErrorPos = functionNameEnd;
                    firstErrorStr = _("Nombre de paramètres incorrect.");
                    #endif
                    return false;
                }

                //Preparing parameters
                for (unsigned int i = 0;i<parameters.size() && i<parametersInfos.size();++i)
                {
                    if ( !PrepareParameter(game, scene, parameters[i], parametersInfos[i], functionNameEnd) )
                        return false;
                }

                instruction.parameters = parameters;
                staticFunctionFunctor(functionName, instruction);
            }
            //Then an object member expression
            else if ( !nameIsFunction && extensionsManager->HasObjectStrExpression(GetTypeIdOfObject(game, scene, objectName), functionName) )
            {
                instruction.function = &ExpObjectStrFunction;
                instruction.objectFunction = extensionsManager->GetObjectStrExpressionFunctionPtr(GetTypeIdOfObject(game, scene, objectName), functionName);
                vector < ParameterInfo > parametersInfos = extensionsManager->GetObjectStrExpressionInfos(extensionsManager->GetStringFromTypeId(GetTypeIdOfObject(game, scene, nameBefore)), functionName).parameters;

                //Testing the number of parameters
                if ( parametersInfos.size() > parameters.size() || parameters.size() < GetMinimalParametersNumber(parametersInfos))
                {
                    #if defined(GDE)
                    firstErrorPos = functionNameEnd;
                    firstErrorStr = _("Nombre de paramètres incorrect.");
                    #endif
                    return false;
                }

                //Preparing parameters
                for (unsigned int i = 0;i<parameters.size() && i<parametersInfos.size();++i)
                {
                    if ( !PrepareParameter(game, scene, parameters[i], parametersInfos[i], functionNameEnd) )
                        return false;
                }

                instruction.parameters = parameters;
                objectFunctionFunctor(functionName, instruction);
            }
            //And search automatisms expressions
            else
            {
                size_t firstDoublePoints = functionName.find("::");
                if ( firstDoublePoints != string::npos )
                {
                    std::string autoName = functionName.substr(0, firstDoublePoints);
                    if ( firstDoublePoints+2 < functionName.length() )
                        functionName = functionName.substr(firstDoublePoints+2, functionName.length());
                    else
                        functionName = "";

                    if ( extensionsManager->HasAutomatismStrExpression(GetTypeIdOfAutomatism(game, scene, autoName), functionName) )
                    {
                        parameters.push_back(GDExpression(autoName));
                        instruction.function = &ExpAutomatismStrFunction;
                        instruction.automatismFunction = extensionsManager->GetAutomatismStrExpressionFunctionPtr(GetTypeIdOfAutomatism(game, scene, autoName), functionName);

                        ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
                        vector < ParameterInfo > parametersInfos = extensionsManager->GetAutomatismStrExpressionInfos(objectIdentifiersManager->GetNamefromOID(GetTypeIdOfAutomatism(game, scene, autoName)), functionName).parameters;

                        //Verify that object has automatism.
                        unsigned int automatismNameId = objectIdentifiersManager->GetOIDfromName(autoName);
                        vector < unsigned int > automatisms = GetAutomatismsOfObject(game, scene, objectName);
                        if ( find(automatisms.begin(), automatisms.end(), automatismNameId) == automatisms.end() )
                        {
                            cout << "Bad automatism requested" << endl;
                            instruction.function = NULL;
                        }
                        else
                        {
                            //Testing the number of parameters
                            if ( parametersInfos.size() > parameters.size() || parameters.size() < GetMinimalParametersNumber(parametersInfos))
                            {
                                #if defined(GDE)
                                firstErrorPos = functionNameEnd;
                                firstErrorStr = _("Nombre de paramètres incorrect.");
                                #endif
                                return false;
                            }

                            //Preparing parameters
                            for (unsigned int i = 0;i<parameters.size() && i<parametersInfos.size();++i)
                            {
                                if ( !PrepareParameter(game, scene, parameters[i], parametersInfos[i], functionNameEnd) )
                                    return false;
                            }

                            instruction.parameters = parameters;
                            automatismFunctionFunctor(functionName, instruction);
                        }
                    }
                }
            }

            //Support for implicit conversion from math result to string
            if ( instruction.function == NULL )
            {
                GDExpression implicitMathExpression(expression.substr(nameStart, parametersEnd+1-nameStart));
                if ( implicitMathExpression.PrepareForMathEvaluationOnly(game, scene) )
                {
                    vector < GDExpression > implicitConversionParameters;
                    implicitConversionParameters.push_back(implicitMathExpression);

                    instruction.function = &ExpToStr;
                    instruction.parameters = (implicitConversionParameters);
                    staticFunctionFunctor(functionName, instruction);
                }
            }

            if ( instruction.function == NULL ) //Function was not found
            {
                #if defined(GDE)
                firstErrorPos = nameStart;
                firstErrorStr = _("Fonction non reconnue.");
                #endif
                return false;
            }

            parsePosition = parametersEnd+1;
        }

        //Searching for next token
        size_t firstPlusPos = expression.find("+", parsePosition);
        firstPointPos = expression.find(".", parsePosition);
        firstParPos = expression.find("(", parsePosition);
        firstQuotePos = expression.find("\"", parsePosition);

        //Checking for a + between token
        if ( (firstPointPos != string::npos || firstParPos != string::npos || firstQuotePos != string::npos ))
        {
            size_t nextTokenPos = firstPointPos;
            if ( firstParPos < nextTokenPos ) nextTokenPos = firstParPos;
            if ( firstQuotePos < nextTokenPos ) nextTokenPos = firstQuotePos;

            if (nextTokenPos < firstPlusPos)
            {
                #if defined(GDE)
                firstErrorPos = nextTokenPos;
                firstErrorStr = _("+ manquant entre deux chaines.");
                #endif
                return false;
            }
            else if ( expression.find("+", firstPlusPos+1) < nextTokenPos )
            {
                #if defined(GDE)
                firstErrorPos = firstPlusPos;
                firstErrorStr = _("Symbole manquant entre deux +.");
                #endif
                return false;
            }
        }
    }

    return true;
}

bool GDExpressionParser::AddParameterToList(const Game & game, const Scene & scene, std::vector < GDExpression > & parameters, string parameterStr, std::vector < ParameterInfo > parametersInfos, const size_t positionInExpression)
{
    parameters.push_back(GDExpression(parameterStr));
    if ( parameters.size()-1 >= parametersInfos.size() )
    {
        #if defined(GDE)
        firstErrorStr = _("Trop de paramètre lors de l'appel à une fonction");
        firstErrorPos = positionInExpression;

        return false;
        #endif
    }

    if ( !PrepareParameter(game, scene, parameters.back(), parametersInfos[parameters.size()-1], positionInExpression) )
        return false;

    return true;
}

bool GDExpressionParser::PrepareParameter(const Game & game, const Scene & scene, GDExpression & parameter, const ParameterInfo & parametersInfo, const size_t positionInExpression)
{
    if ( parametersInfo.type == "expression" )
    {
        if ( !parameter.PrepareForMathEvaluationOnly(game, scene) )
        {
            #if defined(GDE)
            firstErrorStr = parameter.GetFirstErrorDuringPreprocessingText();
            if ( parameter.GetFirstErrorDuringPreprocessingPosition() != string::npos )
                firstErrorPos = positionInExpression+parameter.GetFirstErrorDuringPreprocessingPosition();
            else
                firstErrorPos = string::npos;

            return false;
            #endif
        }
    }
    else if ( parametersInfo.type == "text" || parametersInfo.type == "layer" || parametersInfo.type == "color" || parametersInfo.type == "file" || parametersInfo.type == "joyaxis" )
    {
        if ( !parameter.PrepareForTextEvaluationOnly(game, scene) )
        {
            #if defined(GDE)
            firstErrorStr = parameter.GetFirstErrorDuringPreprocessingText();
            if ( parameter.GetFirstErrorDuringPreprocessingPosition() != string::npos )
                firstErrorPos = positionInExpression+parameter.GetFirstErrorDuringPreprocessingPosition();
            else
                firstErrorPos = string::npos;

            return false;
            #endif
        }
    }

    return true;
}
