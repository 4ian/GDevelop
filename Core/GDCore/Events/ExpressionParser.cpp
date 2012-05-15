/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/Events/Expression.h"
#include "GDCore/Events/ExpressionParser.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/PlatformDefinition/InstructionsMetadataHolder.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/CommonTools.h"
#include <iostream>
#include <wx/intl.h>

using namespace std;

namespace gd
{

std::string ExpressionParser::parserSeparators = " ,+-*/%.<>=&|;()#^![]{}";

size_t ExpressionParser::GetMinimalParametersNumber(const std::vector < gd::ParameterMetadata > & parametersInfos)
{
    size_t nb = 0;
    for (unsigned int i = 0;i<parametersInfos.size();++i)
    {
    	if ( !parametersInfos[i].optional && !parametersInfos[i].codeOnly ) nb++;
    }

    return nb;
}

size_t ExpressionParser::GetMaximalParametersNumber(const std::vector < gd::ParameterMetadata > & parametersInfos)
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
std::vector<gd::Expression> CompleteParameters(const std::vector < gd::ParameterMetadata > & parametersInfo, const std::vector < gd::Expression > & parameters)
{
    std::vector<gd::Expression> completeParameters = parameters;
    for (unsigned int i = 0;i<parametersInfo.size();++i) //Code only parameters are not included in expressions parameters.
    {
        if ( parametersInfo[i].codeOnly)
        {
            if ( i > completeParameters.size() )
            {
                cout << "Bad parameter count in expression.";
            }

            if ( i >= completeParameters.size() )
                completeParameters.push_back(gd::Expression(""));
            else
                completeParameters.insert(completeParameters.begin()+i, gd::Expression(""));
        }
        else
        {
            if ( i >= completeParameters.size() )
            {
                completeParameters.push_back(gd::Expression(""));
            }
        }
    }
    return completeParameters;
}

bool ExpressionParser::ValidSyntax(const std::string & str)
{
    static const std::string numerics = "0123456789.e";
    static const std::string operators = "+/*-%";

    size_t parenthesisLevel = 0;
    std::string lastOperator;

    bool parsingNumber = false;
    bool parsingScientificNotationNumber = false;
    bool parsingDecimalNumber = false;
    bool requestNumber = false;
    std::string lastNumber;
    bool numberWasParsedLast = false;

    for (unsigned int parsePos = 0;parsePos<str.length();++parsePos)
    {
        if ( str[parsePos] == ' ' || str[parsePos] == '\n' )
        {
            if ( requestNumber )
            {
                firstErrorStr = _("Nombre attendu");

                return false;
            }

            if ( parsingNumber )
            {
                //callbacks.OnNumber(lastNumber);
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
                    firstErrorStr = _("Erreur de syntaxe");

                    return false;
                }

                if ( parsingDecimalNumber )
                {
                    firstErrorStr = _("Erreur de syntaxe dans la formation d'un nombre.");

                    return false;
                }

                parsingDecimalNumber = true;
            }

            if ( str[parsePos] == 'e' )
            {
                if ( parsingScientificNotationNumber )
                {
                    firstErrorStr = _("Erreur de syntaxe dans la formation d'un nombre.");

                    return false;
                }

                parsingScientificNotationNumber = true;
                requestNumber = true;
            }

            if ( numberWasParsedLast )
            {
                firstErrorStr = _("Opérateur manquant devant un nombre");

                return false;
            }

            parsingNumber = true;
            lastNumber += str[parsePos];
        }
        else if ( str[parsePos] == ')' )
        {
            if ( requestNumber )
            {
                firstErrorStr = _("Nombre attendu");

                return false;
            }

            if ( parsingNumber )
            {
                //callbacks.OnNumber(lastNumber);
                parsingNumber = false;
                parsingScientificNotationNumber = false;
                parsingDecimalNumber = false;
                lastNumber.clear();
                numberWasParsedLast = true;
            }

            if ( !numberWasParsedLast )
            {
                firstErrorStr = _("Opérateur en trop avant la parenthèse.");

                return false;
            }

            if (parenthesisLevel>0) parenthesisLevel--;
            else
            {
                firstErrorStr = _("Parenthèse fermante en trop");

                return false;
            }

            if ( str[parsePos-1] == '(' )
            {
                firstErrorStr = _("Parenthèses vides");

                return false;
            }
            //callbacks.OnOperator(")");
        }
        else if ( str[parsePos] == '(' )
        {
            if ( requestNumber )
            {
                firstErrorStr = _("Nombre attendu");

                return false;
            }

            if ( parsingNumber )
            {
                //callbacks.OnNumber(lastNumber);
                parsingNumber = false;
                parsingScientificNotationNumber = false;
                parsingDecimalNumber = false;
                lastNumber.clear();
                numberWasParsedLast = true;
            }

            if ( numberWasParsedLast )
            {
                firstErrorStr = _("Opérateur manquant devant une paranthèse");

                return false;
            }

            parenthesisLevel++;
            numberWasParsedLast = false;
            //callbacks.OnOperator("(");
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
                    firstErrorStr = _("Nombre attendu");

                    return false;
                }

                if ( parsingNumber )
                {
                    //callbacks.OnNumber(lastNumber);
                    parsingNumber = false;
                    parsingScientificNotationNumber = false;
                    parsingDecimalNumber = false;
                    lastNumber.clear();
                    numberWasParsedLast = true;
                }

                if ( str[parsePos] != '-' && str[parsePos] != '+' && !numberWasParsedLast )
                {
                    firstErrorStr = _("Opérateurs accolés sans nombres entre eux");

                    return false;
                }

                //callbacks.OnOperator(str.substr(parsePos,1));
                numberWasParsedLast = false;
            }
        }
        else
        {
            firstErrorStr = _("Erreur de syntaxe");

            return false;
        }
    }

    if ( parsingNumber )
    {
        //callbacks.OnNumber(lastNumber);
        parsingNumber = false;
        parsingScientificNotationNumber = false;
        parsingDecimalNumber = false;
        lastNumber.clear();
        numberWasParsedLast = true;
    }
    else if ( requestNumber )
    {
        firstErrorStr = _("Nombre attendu");

        return false;
    }

    if ( parenthesisLevel != 0 )
    {
        firstErrorStr = _("Parenthèses mal formées");

        return false;
    }

    if (!numberWasParsedLast)
    {
        firstErrorStr = _("Opérateur seul en fin d'expression");

        return false;
    }

    return true;
}

bool ExpressionParser::ParseMathExpression(const gd::Project & project, const gd::Layout & layout, gd::ParserCallbacks & callbacks)
{
    InstructionsMetadataHolder & metadataHolder = project.GetPlatform().GetInstructionsMetadataHolder();
    string expression = expressionPlainString;

    size_t parsePosition = 0;

    size_t firstPointPos = expression.find(".");
    size_t firstParPos = expression.find("(");

    std::string expressionWithoutFunctions;
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
        vector < gd::Expression > parameters;

        bool nameIsFunction = firstPointPos > firstParPos;
        if ( !nameIsFunction )
        {
            parameters.push_back(gd::Expression(objectName));
            functionNameEnd = expression.find_first_of(" (", nameEnd);
            if ( nameEnd+1 < expression.length()) functionName = expression.substr(nameEnd+1, functionNameEnd-(nameEnd+1));
            if ( functionNameEnd == string::npos )
            {
                functionName = "";
                functionNameEnd = expression.length()-1;
            }
        }

        //Now we're going to identify the expression
        gd::ExpressionMetadata instructionInfos;

        if ( functionName.substr(0, functionName.length()-1).find_first_of(parserSeparators) == string::npos )
        {
            bool functionFound = false;
            bool staticFunctionFound = false;
            bool objectFunctionFound = false;
            bool automatismFunctionFound = false;

            //First try to bind to a static expression
            if ( nameIsFunction && metadataHolder.HasExpression(functionName) )
            {
                functionFound = true; staticFunctionFound = true;
                instructionInfos = metadataHolder.GetExpressionMetadata(functionName);
            }
            //Then search in object expression
            else if ( !nameIsFunction && metadataHolder.HasObjectExpression(gd::GetTypeOfObject(project, layout, objectName), functionName) )
            {
                functionFound = true; objectFunctionFound = true;
                instructionInfos = metadataHolder.GetObjectExpressionMetadata(gd::GetTypeOfObject(project, layout, objectName), functionName);
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

                    if ( metadataHolder.HasAutomatismExpression(gd::GetTypeOfAutomatism(project, layout, autoName), functionName) )
                    {
                        parameters.push_back(gd::Expression(autoName));
                        functionFound = true; automatismFunctionFound = true;

                        instructionInfos = metadataHolder.GetAutomatismExpressionMetadata(gd::GetTypeOfAutomatism(project, layout, autoName), functionName);

                        //Verify that object has automatism.
                        vector < std::string > automatisms = gd::GetAutomatismsOfObject(project, layout, objectName);
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
                        firstErrorStr = _("Parenthèses non fermées");
                        firstErrorPos = parametersEnd-1;

                        return false;
                    }

                    //Testing the number of parameters
                    if ( parameters.size() > GetMaximalParametersNumber(instructionInfos.parameters) || parameters.size() < GetMinimalParametersNumber(instructionInfos.parameters) )
                    {
                        firstErrorPos = functionNameEnd;
                        firstErrorStr = _("Nombre de paramètre incorrect.");
                        firstErrorStr += " ";
                        firstErrorStr += _("Attendu ( au maximum ) :");
                        firstErrorStr += ToString(GetMaximalParametersNumber(instructionInfos.parameters));

                        return false;
                    }

                    //Preparing parameters
                    parameters = CompleteParameters(instructionInfos.parameters, parameters);
                    for (unsigned int i = 0;i<instructionInfos.parameters.size();++i)
                    {
                        if ( !PrepareParameter(project, layout, callbacks, parameters[i], instructionInfos.parameters[i], functionNameEnd) )
                            return false; //TODO : Boarf, paramètres optionels sont rajoutés et évalués : Problème avec les calques par exemple ( Au minimum, il faut "" )
                    }
                }
                else
                {
                    firstErrorPos = functionNameEnd;
                    firstErrorStr = _("Parenthèses des paramètres manquantes");

                    return false;
                }

                callbacks.OnConstantToken(nonFunctionToken+expression.substr(parsePosition, nameStart-parsePosition));
                expressionWithoutFunctions += expression.substr(parsePosition, nameStart-parsePosition);
                nonFunctionToken.clear();
                nonFunctionTokenStartPos = std::string::npos;

                if      ( objectFunctionFound ) callbacks.OnObjectFunction(functionName, parameters, instructionInfos);
                else if ( automatismFunctionFound ) callbacks.OnObjectAutomatismFunction(functionName, parameters, instructionInfos);
                else if ( staticFunctionFound ) callbacks.OnStaticFunction(functionName, parameters, instructionInfos);

                if ( objectFunctionFound || automatismFunctionFound || staticFunctionFound ) expressionWithoutFunctions += "0";

                parsePosition = parametersEnd+1;
                firstPointPos = expression.find(".", parametersEnd+1);
                firstParPos = expression.find("(", parametersEnd+1);
            }
            else //Math function or math constant : Pass it.
            {
                nonFunctionToken += expression.substr(parsePosition, functionNameEnd+1-parsePosition);
                expressionWithoutFunctions += expression.substr(parsePosition, functionNameEnd+1-parsePosition);
                nonFunctionTokenStartPos = (nonFunctionTokenStartPos != std::string::npos ? nonFunctionTokenStartPos : parsePosition);
                parsePosition = functionNameEnd+1;
                firstPointPos = expression.find(".", functionNameEnd+1);
                firstParPos = expression.find("(", functionNameEnd+1);
            }
        }
        else //Not a function call : Pass it
        {
            nonFunctionToken += expression.substr(parsePosition, nameEnd+1-parsePosition);
            expressionWithoutFunctions += expression.substr(parsePosition, nameEnd+1-parsePosition);
            nonFunctionTokenStartPos = (nonFunctionTokenStartPos != std::string::npos ? nonFunctionTokenStartPos : parsePosition);
            parsePosition = nameEnd+1;
            firstPointPos = expression.find(".", nameEnd+1);
            firstParPos = expression.find("(", nameEnd+1);
        }
    }

    if ( parsePosition < expression.length() || !nonFunctionToken.empty() )
        callbacks.OnConstantToken(nonFunctionToken+expression.substr(parsePosition, expression.length()));

    expressionWithoutFunctions += expression.substr(parsePosition, expression.length());

    return ValidSyntax(expressionWithoutFunctions);
}

bool ExpressionParser::ParseStringExpression(const gd::Project & project, const gd::Layout & layout, gd::ParserCallbacks & callbacks)
{
    InstructionsMetadataHolder & metadataHolder = project.GetPlatform().GetInstructionsMetadataHolder();
    string expression = expressionPlainString;

    size_t parsePosition = 0;

    //Searching for first token.
    size_t firstPointPos = expression.find(".");
    size_t firstParPos = expression.find("(");
    size_t firstQuotePos = expression.find("\"");

    if ( firstPointPos == string::npos && firstParPos == string::npos && firstQuotePos == string::npos  )
    {
        firstErrorPos = 0;
        firstErrorStr = _("L'expression est invalide ou vide. Entrez un texte ( entouré de guillemets ) ou une fonction.");

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
                firstErrorPos = firstQuotePos;
                firstErrorStr = _("Guillemets non fermés.");

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

            vector < gd::Expression > parameters;
            parameters.push_back(finalText);
            gd::StrExpressionMetadata noParametersInfo; //TODO : A bit of hack here.

            callbacks.OnStaticFunction("", parameters, noParametersInfo);

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
            vector < gd::Expression > parameters;

            bool nameIsFunction = firstPointPos > firstParPos;
            if ( !nameIsFunction )
            {
                parameters.push_back(gd::Expression(objectName));
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
                    gd::Expression currentParameter(currentParameterStr);
                    parameters.push_back(currentParameter);

                    currentParameterStr.clear();
                }
                else currentParameterStr += expression[parametersEnd];

                previousChar = expression[parametersEnd];
                parametersEnd++;
            }

            if ( parametersEnd == expression.length() || expression[parametersEnd] != ')' )
            {
                firstErrorPos = parametersEnd-1;
                firstErrorStr = _("Parenthèses non fermées");

                return false;
            }

            if ( currentParameterStr.find_first_not_of(" ") != string::npos ) //Add last parameter if needed
            {
                gd::Expression lastParameter(currentParameterStr);
                parameters.push_back(lastParameter);
            }

            bool functionFound = false;

            //First try to bind to a static str expression
            if ( nameIsFunction && metadataHolder.HasStrExpression(functionName) )
            {
                functionFound = true;
                const gd::StrExpressionMetadata & expressionInfo = metadataHolder.GetStrExpressionMetadata(functionName);

                //Testing the number of parameters
                if ( parameters.size() > GetMaximalParametersNumber(expressionInfo.parameters) || parameters.size() < GetMinimalParametersNumber(expressionInfo.parameters))
                {
                    firstErrorPos = functionNameEnd;
                    firstErrorStr = _("Nombre de paramètres incorrect.");

                    return false;
                }

                //Preparing parameters
                parameters = CompleteParameters(expressionInfo.parameters, parameters);
                for (unsigned int i = 0;i<parameters.size() && i<expressionInfo.parameters.size();++i)
                {
                    if ( !PrepareParameter(project, layout, callbacks, parameters[i], expressionInfo.parameters[i], functionNameEnd) )
                        return false;
                }

                callbacks.OnStaticFunction(functionName, parameters, expressionInfo);
            }
            //Then an object member expression
            else if ( !nameIsFunction && metadataHolder.HasObjectStrExpression(gd::GetTypeOfObject(project, layout, objectName), functionName) )
            {
                functionFound = true;
                const gd::StrExpressionMetadata & expressionInfo = metadataHolder.GetObjectStrExpressionMetadata(gd::GetTypeOfObject(project, layout, nameBefore), functionName);

                //Testing the number of parameters
                if ( parameters.size() > GetMaximalParametersNumber(expressionInfo.parameters) || parameters.size() < GetMinimalParametersNumber(expressionInfo.parameters))
                {
                    firstErrorPos = functionNameEnd;
                    firstErrorStr = _("Nombre de paramètres incorrect.");

                    for (unsigned int i = 0;i<parameters.size();++i)
                        cout << "Param:" << parameters[i].GetPlainString() << endl;

                    return false;
                }

                //Preparing parameters
                parameters = CompleteParameters(expressionInfo.parameters, parameters);
                for (unsigned int i = 0;i<parameters.size() && i<expressionInfo.parameters.size();++i)
                {
                    if ( !PrepareParameter(project, layout, callbacks, parameters[i], expressionInfo.parameters[i], functionNameEnd) )
                        return false;
                }

                callbacks.OnObjectFunction(functionName, parameters, expressionInfo);
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

                    if ( metadataHolder.HasAutomatismStrExpression(gd::GetTypeOfAutomatism(project, layout, autoName), functionName) )
                    {
                        parameters.push_back(gd::Expression(autoName));
                        functionFound = true;

                        const gd::StrExpressionMetadata & expressionInfo = metadataHolder.GetAutomatismStrExpressionMetadata(gd::GetTypeOfAutomatism(project, layout, autoName), functionName);

                        //Verify that object has automatism.
                        vector < std::string > automatisms = gd::GetAutomatismsOfObject(project, layout, objectName);
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
                                firstErrorPos = functionNameEnd;
                                firstErrorStr = _("Nombre de paramètres incorrect.");

                                return false;
                            }

                            //Preparing parameters
                            parameters = CompleteParameters(expressionInfo.parameters, parameters);
                            for (unsigned int i = 0;i<parameters.size() && i<expressionInfo.parameters.size();++i)
                            {
                                if ( !PrepareParameter(project, layout, callbacks, parameters[i], expressionInfo.parameters[i], functionNameEnd) )
                                    return false;
                            }

                            callbacks.OnObjectAutomatismFunction(functionName, parameters, expressionInfo);
                        }
                    }
                }
            }

            //Note : _No_ support for implicit conversion from math result to string

            if ( !functionFound ) //Function was not found
            {
                firstErrorPos = nameStart;
                firstErrorStr = _("Fonction non reconnue.");

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
                firstErrorPos = nextTokenPos;
                firstErrorStr = _("+ manquant entre deux chaines.");

                return false;
            }
            else if ( expression.find("+", firstPlusPos+1) < nextTokenPos )
            {
                firstErrorPos = firstPlusPos;
                firstErrorStr = _("Symbole manquant entre deux +.");

                return false;
            }
        }
    }

    if ( expression.substr(parsePosition, expression.length()).find_first_not_of(" \n") != std::string::npos )
    {
        firstErrorPos = parsePosition;
        firstErrorStr = _("Symbole erroné en fin d'expression.");

        return false;
    }

    return true;
}

bool ExpressionParser::PrepareParameter(const gd::Project & project, const gd::Layout & layout, ParserCallbacks & callbacks, gd::Expression & parameter, const gd::ParameterMetadata & parametersInfo, const size_t positionInExpression)
{
    if ( parametersInfo.type == "expression" || parametersInfo.type == "camera" )
    {
        if (parametersInfo.optional && parameter.GetPlainString().empty())
            parameter = parametersInfo.defaultValue.empty() ? gd::Expression("0") : gd::Expression(parametersInfo.defaultValue);

        if ( !callbacks.OnSubMathExpression(project, layout, parameter) )
        {
            firstErrorStr = callbacks.firstErrorStr;
            firstErrorPos = callbacks.firstErrorPos+positionInExpression;

            return false;
        }
    }
    else if ( parametersInfo.type == "string" || parametersInfo.type == "layer" || parametersInfo.type == "color" || parametersInfo.type == "file" || parametersInfo.type == "joyaxis" )
    {
        if (parametersInfo.optional && parameter.GetPlainString().empty())
            parameter = parametersInfo.defaultValue.empty() ? gd::Expression("\"\"") : gd::Expression(parametersInfo.defaultValue);

        if ( !callbacks.OnSubTextExpression(project, layout, parameter) )
        {
            firstErrorStr = callbacks.firstErrorStr;
            firstErrorPos = callbacks.firstErrorPos+positionInExpression;

            return false;
        }
    }

    return true;
}

ExpressionParser::ExpressionParser(const std::string & expressionPlainString_) :
expressionPlainString(expressionPlainString_)
{
}

}
