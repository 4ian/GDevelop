/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDExpressionParser.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/GDExpression.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/StrExpressionInstruction.h"
#include "GDL/ExtensionBase.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/CommonInstructions.h"
#include "GDL/CommonTools.h"

std::string GDExpressionParser::parserSeparators = " ,+-*/%.<>=&|;()#^![]{}";

size_t GetMinimalParametersNumber(const std::vector < ParameterInfo > & parametersInfos)
{
    size_t nb = 0;
    for (unsigned int i = 0;i<parametersInfos.size();++i)
    {
    	if ( !parametersInfos[i].optional && !parametersInfos[i].codeOnly ) nb++;
    }

    return nb;
}

size_t GetMaximalParametersNumber(const std::vector < ParameterInfo > & parametersInfos)
{
    size_t nb = 0;
    for (unsigned int i = 0;i<parametersInfos.size();++i)
    {
    	if ( !parametersInfos[i].codeOnly ) nb++;
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

/**
 * Add blank parameters when code-only parameters are excepted.
 * \param Parameters information
 * \param vector of parameters without code only parameters.
 */
std::vector<GDExpression> CompleteParameters(const std::vector < ParameterInfo > & parametersInfo, const std::vector < GDExpression > & parameters)
{
    std::vector<GDExpression> completeParameters = parameters;
    for (unsigned int i = 0;i<parametersInfo.size();++i) //Code only parameters are not included in expressions parameters.
    {
        if ( parametersInfo[i].codeOnly)
        {
            if ( i > completeParameters.size() )
            {
                cout << "Bad parameter count in expression.";
            }

            if ( i >= completeParameters.size() )
                completeParameters.push_back(GDExpression(""));
            else
                completeParameters.insert(completeParameters.begin()+i, GDExpression(""));
        }
        else
        {
            if ( i >= completeParameters.size() )
            {
                completeParameters.push_back(GDExpression(""));
            }
        }
    }
    return completeParameters;
}

bool GDExpressionParser::ParseNonFunctionsTokens(const std::string & str, ParserCallbacks & callbacks, const size_t positionInExpression)
{
    callbacks.OnConstantToken(str);
    return true;

    static const std::string numerics = "0123456789.e";
    static const std::string operators = "+/*-";

    /*
    if ( str.find_first_not_of(allowedCharacters) != std::string::npos )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = _("Erreur de syntaxe");
        firstErrorPos = positionInExpression+str.find_first_not_of(allowedCharacters);
        #endif

        return false;
    }*/

    bool precededByOtherToken = (positionInExpression != 0);
    bool followedByOtherToken = (positionInExpression+str.length() < expressionPlainString.length());

    size_t parenthesisLevel = 0;
    std::string lastOperator;

    bool parsingNumber = false;
    bool parsingScientificNotationNumber = false;
    bool parsingDecimalNumber = false;
    bool requestNumber = false;
    std::string lastNumber;
    bool numberWasParsedLast = precededByOtherToken;

    for (unsigned int parsePos = 0;parsePos<str.length();++parsePos)
    {
        if ( str[parsePos] == ' ' )
        {
            if ( requestNumber )
            {
                #if defined(GD_IDE_ONLY)
                firstErrorStr = _("Nombre attendu");
                firstErrorPos = positionInExpression+parsePos;
                #endif

                return false;
            }

            if ( parsingNumber )
            {
                callbacks.OnNumber(lastNumber);
                parsingNumber = false;
                parsingScientificNotationNumber = false;
                parsingDecimalNumber = false;
                requestNumber = false;
                lastNumber.clear();
                numberWasParsedLast = true;
            }
        }
        else if ( numerics.find_first_of(str[parsePos]) != std::string::npos )
        {
            requestNumber = false;

            if ( str[parsePos] == '.' )
            {
                if ( !parsingNumber )
                {
                    #if defined(GD_IDE_ONLY)
                    firstErrorStr = _("Erreur de syntaxe");
                    firstErrorPos = positionInExpression+parsePos;
                    #endif

                    return false;
                }

                if ( parsingDecimalNumber )
                {
                    #if defined(GD_IDE_ONLY)
                    firstErrorStr = _("Erreur de syntaxe dans la formation d'un nombre.");
                    firstErrorPos = positionInExpression+parsePos;
                    #endif

                    return false;
                }

                parsingDecimalNumber = true;
            }

            if ( str[parsePos] == 'e' )
            {
                if ( parsingScientificNotationNumber )
                {
                    #if defined(GD_IDE_ONLY)
                    firstErrorStr = _("Erreur de syntaxe dans la formation d'un nombre.");
                    firstErrorPos = positionInExpression+parsePos;
                    #endif

                    return false;
                }

                parsingScientificNotationNumber = true;
                requestNumber = true;
            }

            if ( numberWasParsedLast )
            {
                #if defined(GD_IDE_ONLY)
                firstErrorStr = _("Opérateur manquant devant un nombre");
                firstErrorPos = positionInExpression+parsePos;
                #endif

                return false;
            }

            parsingNumber = true;
            lastNumber += str[parsePos];
        }
        else if ( str[parsePos] == ')' )
        {
            if ( requestNumber )
            {
                #if defined(GD_IDE_ONLY)
                firstErrorStr = _("Nombre attendu");
                firstErrorPos = positionInExpression+parsePos;
                #endif

                return false;
            }

            if ( parsingNumber )
            {
                callbacks.OnNumber(lastNumber);
                parsingNumber = false;
                parsingScientificNotationNumber = false;
                parsingDecimalNumber = false;
                lastNumber.clear();
                numberWasParsedLast = true;
            }

            if ( !numberWasParsedLast )
            {
                #if defined(GD_IDE_ONLY)
                firstErrorStr = _("Opérateur en trop avant la parenthèse.");
                firstErrorPos = positionInExpression+parsePos;
                #endif

                return false;
            }

            if (parenthesisLevel>0) parenthesisLevel--;
            /*else
            {
                #if defined(GD_IDE_ONLY)
                firstErrorStr = _("Parenthèse fermante en trop");
                firstErrorPos = positionInExpression+parsePos;
                #endif

                return false;
            }*/

            if ( str[parsePos-1] == '(' )
            {
                #if defined(GD_IDE_ONLY)
                firstErrorStr = _("Parenthèses vides");
                firstErrorPos = positionInExpression+parsePos;
                #endif

                return false;
            }
            callbacks.OnOperator(")");
        }
        else if ( str[parsePos] == '(' )
        {
            if ( requestNumber )
            {
                #if defined(GD_IDE_ONLY)
                firstErrorStr = _("Nombre attendu");
                firstErrorPos = positionInExpression+parsePos;
                #endif

                return false;
            }

            if ( parsingNumber )
            {
                callbacks.OnNumber(lastNumber);
                parsingNumber = false;
                parsingScientificNotationNumber = false;
                parsingDecimalNumber = false;
                lastNumber.clear();
                numberWasParsedLast = true;
            }

            if ( numberWasParsedLast )
            {
                #if defined(GD_IDE_ONLY)
                firstErrorStr = _("Opérateur manquant devant une paranthèse");
                firstErrorPos = positionInExpression+parsePos;
                #endif

                return false;
            }

            parenthesisLevel++;
            numberWasParsedLast = false;
            callbacks.OnOperator("(");
        }
        else if ( operators.find_first_of(str[parsePos]) != std::string::npos )
        {
            if ( str[parsePos] == '-' && parsingNumber && parsingScientificNotationNumber )
            {
                lastNumber += str[parsePos];
                requestNumber = true;
            }
            else
            {
                if ( requestNumber )
                {
                    #if defined(GD_IDE_ONLY)
                    firstErrorStr = _("Nombre attendu");
                    firstErrorPos = positionInExpression+parsePos;
                    #endif

                    return false;
                }

                if ( parsingNumber )
                {
                    callbacks.OnNumber(lastNumber);
                    parsingNumber = false;
                    parsingScientificNotationNumber = false;
                    parsingDecimalNumber = false;
                    lastNumber.clear();
                    numberWasParsedLast = true;
                }

                if ( str[parsePos] != '-' && str[parsePos] != '+' && !numberWasParsedLast )
                {
                    #if defined(GD_IDE_ONLY)
                    firstErrorStr = _("Opérateurs accolés sans nombres entre eux");
                    firstErrorPos = positionInExpression+parsePos;
                    #endif

                    return false;
                }

                callbacks.OnOperator(str.substr(parsePos,1));
                numberWasParsedLast = false;
            }
        }
        else
        {
            #if defined(GD_IDE_ONLY)
            firstErrorStr = _("Erreur de syntaxe");
            firstErrorPos = positionInExpression+parsePos;
            #endif

            return false;
        }
    }

    if ( parsingNumber )
    {
        callbacks.OnNumber(lastNumber);
        parsingNumber = false;
        parsingScientificNotationNumber = false;
        parsingDecimalNumber = false;
        lastNumber.clear();
        numberWasParsedLast = true;
    }
    else if ( requestNumber )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = _("Nombre attendu");
        firstErrorPos = positionInExpression+str.length();
        #endif

        return false;
    }

    /*if ( parenthesisLevel != 0 )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = _("Parenthèses mal formées");
        firstErrorPos = positionInExpression;
        #endif

        return false;
    }*/

    if (followedByOtherToken && numberWasParsedLast)
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = _("Opérateur manquant");
        firstErrorPos = positionInExpression+str.length();
        #endif

        return false;
    }

    if (!followedByOtherToken && !numberWasParsedLast)
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = _("Opérateur seul en fin d'expression");
        firstErrorPos = positionInExpression+str.length();
        #endif

        return false;
    }

    return true;
}

bool GDExpressionParser::ParseMathExpression(const Game & game, const Scene & scene, ParserCallbacks & callbacks)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
    string expression = expressionPlainString;

    size_t parsePosition = 0;

    size_t firstPointPos = expression.find(".");
    size_t firstParPos = expression.find("(");

    std::string nonFunctionToken;
    size_t nonFunctionTokenStartPos = std::string::npos;

    while ( firstPointPos != string::npos || firstParPos != string::npos )
    {
        //Identify name
        size_t nameEnd = firstPointPos < firstParPos ? firstPointPos : firstParPos;
        size_t nameStart = expression.find_last_of(parserSeparators, nameEnd-1);
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
        if ( functionName.substr(0, functionName.length()-1).find_first_of(parserSeparators) == string::npos )
        {
            bool functionFound = false;
            bool staticFunctionFound = false;
            bool objectFunctionFound = false;
            bool automatismFunctionFound = false;

            //First try to bind to a static expression
            if ( nameIsFunction && extensionsManager->HasExpression(functionName) )
            {
                functionFound = true; staticFunctionFound = true;
                instructionInfos = extensionsManager->GetExpressionInfos(functionName);
            }
            //Then search in object expression
            else if ( !nameIsFunction && extensionsManager->HasObjectExpression(GetTypeOfObject(game, scene, objectName), functionName) )
            {
                functionFound = true; objectFunctionFound = true;
                instructionInfos = extensionsManager->GetObjectExpressionInfos(GetTypeOfObject(game, scene, objectName), functionName);
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

                    if ( extensionsManager->HasAutomatismExpression(GetTypeOfAutomatism(game, scene, autoName), functionName) )
                    {
                        parameters.push_back(GDExpression(autoName));
                        functionFound = true; automatismFunctionFound = true;

                        instructionInfos = extensionsManager->GetAutomatismExpressionInfos(GetTypeOfAutomatism(game, scene, autoName), functionName);

                        //Verify that object has automatism.
                        vector < std::string > automatisms = GetAutomatismsOfObject(game, scene, objectName);
                        if ( find(automatisms.begin(), automatisms.end(), autoName) == automatisms.end() )
                        {
                            cout << "Bad automatism requested" << endl;
                            functionFound = false;
                        }
                    }
                }
            }

            if( functionFound ) //Add the function
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
                            parameters.push_back(currentParameterStr);
                            currentParameterStr.clear();
                        }
                        else currentParameterStr += expression[parametersEnd];

                        previousChar = expression[parametersEnd];
                        parametersEnd++;
                    }
                    if ( currentParameterStr.find_first_not_of(" ") != string::npos ) //Add last parameter if needed
                    {
                        parameters.push_back(currentParameterStr);
                    }

                    //Testing function call is properly closed
                    if(parametersEnd == expression.length() || expression[parametersEnd] != ')')
                    {
                        #if defined(GD_IDE_ONLY)
                        firstErrorStr = _("Parenthèses non fermées");
                        firstErrorPos = parametersEnd-1;
                        #endif
                        return false;
                    }

                    //Testing the number of parameters
                    if ( parameters.size() > GetMaximalParametersNumber(instructionInfos.parameters) || parameters.size() < GetMinimalParametersNumber(instructionInfos.parameters) )
                    {
                        #if defined(GD_IDE_ONLY)
                        firstErrorPos = functionNameEnd;
                        firstErrorStr = _("Nombre de paramètre incorrect.");
                        firstErrorStr += " ";
                        firstErrorStr += _("Attendu ( au maximum ) :");
                        firstErrorStr += ToString(instructionInfos.parameters.size());
                        #endif
                        return false;
                    }

                    //Preparing parameters
                    parameters = CompleteParameters(instructionInfos.parameters, parameters);
                    for (unsigned int i = 0;i<instructionInfos.parameters.size();++i)
                    {
                        if ( !PrepareParameter(game, scene, callbacks, parameters[i], instructionInfos.parameters[i], functionNameEnd) )
                            return false; //TODO : Boarf, paramètres optionels sont rajoutés et évalués : Problème avec les calques par exemple ( Au minimum, il faut "" )
                    }
                }
                else
                {
                    #if defined(GD_IDE_ONLY)
                    firstErrorPos = functionNameEnd;
                    firstErrorStr = _("Parenthèses des paramètres manquantes");
                    #endif
                    return false;
                }

                instruction.parameters = parameters;

                if ( !ParseNonFunctionsTokens(nonFunctionToken+expression.substr(parsePosition, nameStart-parsePosition), callbacks, nonFunctionTokenStartPos != std::string::npos ? nonFunctionTokenStartPos : parsePosition) ) return false;
                nonFunctionToken.clear();
                nonFunctionTokenStartPos = std::string::npos;

                if      ( objectFunctionFound ) callbacks.OnObjectFunction(functionName, instruction, instructionInfos);
                else if ( automatismFunctionFound ) callbacks.OnObjectAutomatismFunction(functionName, instruction, instructionInfos);
                else if ( staticFunctionFound ) callbacks.OnStaticFunction(functionName, instruction, instructionInfos);

                parsePosition = parametersEnd+1;
                firstPointPos = expression.find(".", parametersEnd+1);
                firstParPos = expression.find("(", parametersEnd+1);
            }
            else //Math function or math constant : Pass it.
            {
                nonFunctionToken += expression.substr(parsePosition, functionNameEnd+1-parsePosition);
                nonFunctionTokenStartPos = (nonFunctionTokenStartPos != std::string::npos ? nonFunctionTokenStartPos : parsePosition);
                parsePosition = functionNameEnd+1;
                firstPointPos = expression.find(".", functionNameEnd+1);
                firstParPos = expression.find("(", functionNameEnd+1);
            }
        }
        else //Not a function call : Pass it
        {
            nonFunctionToken += expression.substr(parsePosition, nameEnd+1-parsePosition);
            nonFunctionTokenStartPos = (nonFunctionTokenStartPos != std::string::npos ? nonFunctionTokenStartPos : parsePosition);
            parsePosition = nameEnd+1;
            firstPointPos = expression.find(".", nameEnd+1);
            firstParPos = expression.find("(", nameEnd+1);
        }
    }

    if ( parsePosition < expression.length() || !nonFunctionToken.empty() )
        if ( !ParseNonFunctionsTokens(nonFunctionToken+expression.substr(parsePosition, expression.length()), callbacks, nonFunctionTokenStartPos != std::string::npos ? nonFunctionTokenStartPos : parsePosition) ) return false;

    return true;
}

bool GDExpressionParser::ParseTextExpression(const Game & game, const Scene & scene, ParserCallbacks & callbacks)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
    string expression = expressionPlainString;

    size_t parsePosition = 0;

    //Searching for first token.
    size_t firstPointPos = expression.find(".");
    size_t firstParPos = expression.find("(");
    size_t firstQuotePos = expression.find("\"");

    if ( firstPointPos == string::npos && firstParPos == string::npos && firstQuotePos == string::npos  )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorPos = 0;
        firstErrorStr = _("L'expression est invalide ou vide. Entrez un texte ( entouré de guillemets ) ou une fonction.");
        #endif
        return false;
    }

    while ( firstPointPos != string::npos || firstParPos != string::npos || firstQuotePos != string::npos )
    {
        if ( firstQuotePos < firstPointPos && firstQuotePos < firstParPos ) //Adding a constant text
        {
            callbacks.OnConstantToken(expression.substr(parsePosition, firstQuotePos-parsePosition));

            //Finding start and end of quotes
            size_t finalQuotePosition = expression.find("\"", firstQuotePos+1);
            while ( finalQuotePosition == expression.find("\\\"", finalQuotePosition-1)+1)
                finalQuotePosition = expression.find("\"", finalQuotePosition+1);

            if ( finalQuotePosition == string::npos )
            {
                #if defined(GD_IDE_ONLY)
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

            vector < GDExpression > parameters;
            parameters.push_back(finalText);
            instruction.parameters = parameters;
            StrExpressionInfos noParametersInfo; //TODO : A bit of hack here.

            callbacks.OnStaticFunction("", instruction, noParametersInfo);

            parsePosition = finalQuotePosition+1;
        }
        else //Adding a function
        {
            //Identify name
            size_t nameEnd = firstPointPos < firstParPos ? firstPointPos : firstParPos;
            size_t nameStart = expression.find_last_of(parserSeparators, nameEnd-1);
            nameStart++;

            callbacks.OnConstantToken(expression.substr(parsePosition, nameStart-parsePosition));

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
                #if defined(GD_IDE_ONLY)
                firstErrorPos = parametersEnd-1;
                firstErrorStr = _("Parenthèses non fermées");
                #endif
                return false;
            }

            GDExpression lastParameter(currentParameterStr);
            parameters.push_back(lastParameter);

            StrExpressionInstruction instruction;
            bool functionFound = false;

            //First try to bind to a static str expression
            if ( nameIsFunction && extensionsManager->HasStrExpression(functionName) )
            {
                functionFound = true;
                const StrExpressionInfos & expressionInfo = extensionsManager->GetStrExpressionInfos(functionName);

                //Testing the number of parameters
                if ( parameters.size() > GetMaximalParametersNumber(expressionInfo.parameters) || parameters.size() < GetMinimalParametersNumber(expressionInfo.parameters))
                {
                    #if defined(GD_IDE_ONLY)
                    firstErrorPos = functionNameEnd;
                    firstErrorStr = _("Nombre de paramètres incorrect.");
                    #endif
                    return false;
                }

                //Preparing parameters
                parameters = CompleteParameters(expressionInfo.parameters, parameters);
                for (unsigned int i = 0;i<parameters.size() && i<expressionInfo.parameters.size();++i)
                {
                    if ( !PrepareParameter(game, scene, callbacks, parameters[i], expressionInfo.parameters[i], functionNameEnd) )
                        return false;
                }

                instruction.parameters = parameters;
                callbacks.OnStaticFunction(functionName, instruction, expressionInfo);
            }
            //Then an object member expression
            else if ( !nameIsFunction && extensionsManager->HasObjectStrExpression(GetTypeOfObject(game, scene, objectName), functionName) )
            {
                functionFound = true;
                const StrExpressionInfos & expressionInfo = extensionsManager->GetObjectStrExpressionInfos(GetTypeOfObject(game, scene, nameBefore), functionName);

                //Testing the number of parameters
                if ( parameters.size() > GetMaximalParametersNumber(expressionInfo.parameters) || parameters.size() < GetMinimalParametersNumber(expressionInfo.parameters))
                {
                    #if defined(GD_IDE_ONLY)
                    firstErrorPos = functionNameEnd;
                    firstErrorStr = _("Nombre de paramètres incorrect.");
                    #endif
                    return false;
                }

                //Preparing parameters
                parameters = CompleteParameters(expressionInfo.parameters, parameters);
                for (unsigned int i = 0;i<parameters.size() && i<expressionInfo.parameters.size();++i)
                {
                    if ( !PrepareParameter(game, scene, callbacks, parameters[i], expressionInfo.parameters[i], functionNameEnd) )
                        return false;
                }

                instruction.parameters = parameters;
                callbacks.OnObjectFunction(functionName, instruction, expressionInfo);
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

                    if ( extensionsManager->HasAutomatismStrExpression(GetTypeOfAutomatism(game, scene, autoName), functionName) )
                    {
                        parameters.push_back(GDExpression(autoName));
                        functionFound = true;

                        const StrExpressionInfos & expressionInfo = extensionsManager->GetAutomatismStrExpressionInfos(GetTypeOfAutomatism(game, scene, autoName), functionName);

                        //Verify that object has automatism.
                        vector < std::string > automatisms = GetAutomatismsOfObject(game, scene, objectName);
                        if ( find(automatisms.begin(), automatisms.end(), autoName) == automatisms.end() )
                        {
                            cout << "Bad automatism requested" << endl;
                            functionFound = false;
                        }
                        else
                        {
                            //Testing the number of parameters
                            if ( parameters.size() > GetMaximalParametersNumber(expressionInfo.parameters) || parameters.size() < GetMinimalParametersNumber(expressionInfo.parameters))
                            {
                                #if defined(GD_IDE_ONLY)
                                firstErrorPos = functionNameEnd;
                                firstErrorStr = _("Nombre de paramètres incorrect.");
                                #endif
                                return false;
                            }

                            //Preparing parameters
                            parameters = CompleteParameters(expressionInfo.parameters, parameters);
                            for (unsigned int i = 0;i<parameters.size() && i<expressionInfo.parameters.size();++i)
                            {
                                if ( !PrepareParameter(game, scene, callbacks, parameters[i], expressionInfo.parameters[i], functionNameEnd) )
                                    return false;
                            }

                            instruction.parameters = parameters;
                            callbacks.OnObjectAutomatismFunction(functionName, instruction, expressionInfo);
                        }
                    }
                }
            }

            //Note : _No_ support for implicit conversion from math result to string

            if ( !functionFound ) //Function was not found
            {
                #if defined(GD_IDE_ONLY)
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
                #if defined(GD_IDE_ONLY)
                firstErrorPos = nextTokenPos;
                firstErrorStr = _("+ manquant entre deux chaines.");
                #endif
                return false;
            }
            else if ( expression.find("+", firstPlusPos+1) < nextTokenPos )
            {
                #if defined(GD_IDE_ONLY)
                firstErrorPos = firstPlusPos;
                firstErrorStr = _("Symbole manquant entre deux +.");
                #endif
                return false;
            }
        }
    }

    if ( expression.substr(parsePosition, expression.length()).find_first_not_of(" \n") != std::string::npos )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorPos = parsePosition;
        firstErrorStr = _("Symbole erroné en fin d'expression.");
        #endif
        return false;
    }

    return true;
}

bool GDExpressionParser::PrepareParameter(const Game & game, const Scene & scene, ParserCallbacks & callbacks, GDExpression & parameter, const ParameterInfo & parametersInfo, const size_t positionInExpression)
{
    if ( parametersInfo.type == "expression" || parametersInfo.type == "camera" )
    {
        if (parametersInfo.optional && parameter.GetPlainString().empty())
            parameter = parametersInfo.defaultValue.empty() ? GDExpression("0") : GDExpression(parametersInfo.defaultValue);

        if ( !callbacks.OnSubMathExpression(game, scene, parameter) )
        {
            #if defined(GD_IDE_ONLY)
            firstErrorStr = callbacks.firstErrorStr;
            firstErrorPos = callbacks.firstErrorPos+positionInExpression;
            #endif
            return false;
        }
    }
    else if ( parametersInfo.type == "string" || parametersInfo.type == "layer" || parametersInfo.type == "color" || parametersInfo.type == "file" || parametersInfo.type == "joyaxis" )
    {
        if (parametersInfo.optional && parameter.GetPlainString().empty())
            parameter = parametersInfo.defaultValue.empty() ? GDExpression("\"\"") : GDExpression(parametersInfo.defaultValue);

        if ( !callbacks.OnSubTextExpression(game, scene, parameter) )
        {
            #if defined(GD_IDE_ONLY)
            firstErrorStr = callbacks.firstErrorStr;
            firstErrorPos = callbacks.firstErrorPos+positionInExpression;
            #endif
            return false;
        }
    }

    return true;
}

GDExpressionParser::GDExpressionParser(const std::string & expressionPlainString_) :
expressionPlainString(expressionPlainString_)
{
}
