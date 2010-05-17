#include "GDL/GDExpression.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/gpl.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/RuntimeScene.h"
#include "GDL/eFreeFunctions.h"
#include <string>

#if defined(GDE)
#include <wx/wx.h>
#elif !defined(_)
#define _(x) x
#endif

using namespace std;

GDExpression::GDExpression(std::string plainString_) : plainString(plainString_), oIDcomputed(false), isMathExpressionPreprocessed(false)
{
    if (plainString == "=" ) compOperator = Equal;
    else if (plainString == "<" ) compOperator = Inferior;
    else if (plainString == ">" ) compOperator = Superior;
    else if (plainString == "<=" ) compOperator = InferiorOrEqual;
    else if (plainString == ">=" ) compOperator = SuperiorOrEqual;
    else if (plainString == "!=" ) compOperator = Different;
    else compOperator = Undefined;

    if (plainString == "=" ) modOperator = Set;
    else if (plainString == "+" ) modOperator = Add;
    else if (plainString == "-" ) modOperator = Substract;
    else if (plainString == "*" ) modOperator = Multiply;
    else if (plainString == "/" ) modOperator = Divide;
    else modOperator = UndefinedModification;

}

GDExpression::~GDExpression()
{
}

/**
 * Expression function needed for adding a constant text to a text expression
 */
string ExpConstantText(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction)
{
    return exprInstruction.parameters[0].GetPlainString();
}

/**
 * Expression function for converting a math expression to a sting
 */
string ExpToStr(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction)
{
    return ToString(exprInstruction.parameters[0].GetAsMathExpressionResult(scene, objectsConcerned, obj1, obj2));
}

/**
 * Expression function for converting a text expression to a number
 */
double ExpToNumber(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    return ToDouble(exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2));
}

/**
 * Expression function needed for calling objects expressions functions
 */
double ExpObjectFunction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    //We need an object to pass to the function
    ObjSPtr object = boost::shared_ptr<Object>();
    ObjList list = objectsConcerned.Pick( exprInstruction.parameters[0].GetAsObjectIdentifier() );

    if ( !list.empty() )
    {
        object = list[0]; //On prend le premier objet de la liste par défaut

        //Si l'objet principal de la  est dedans, on le prend
        ObjList::iterator iter = find(list.begin(), list.end(), obj1);
        if ( iter != list.end() )
            object = *iter;
        else
        {
            //Si l'objet secondaire de la  est dedans, on le prend
            iter = find(list.begin(), list.end(), obj2);
            if ( iter != list.end() )
                object = *iter;
        }
    }

    //Verify that we have a valid object
    if ( object != boost::shared_ptr<Object>() )
        return (object.get()->*exprInstruction.objectFunction)(scene, objectsConcerned, obj1, obj2, exprInstruction);
    else
        return 0;
}

/**
 * Expression function needed for calling objects expressions functions
 */
std::string ExpObjectStrFunction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction)
{
    //We need an object to pass to the function
    ObjSPtr object = boost::shared_ptr<Object>();
    ObjList list = objectsConcerned.Pick( exprInstruction.parameters[0].GetAsObjectIdentifier() );

    if ( !list.empty() )
    {
        object = list[0]; //On prend le premier objet de la liste par défaut

        //Si l'objet principal de la  est dedans, on le prend
        ObjList::iterator iter = find(list.begin(), list.end(), obj1);
        if ( iter != list.end() )
            object = *iter;
        else
        {
            //Si l'objet secondaire de la  est dedans, on le prend
            iter = find(list.begin(), list.end(), obj2);
            if ( iter != list.end() )
                object = *iter;
        }
    }

    //Verify that we have a valid object
    if ( object != boost::shared_ptr<Object>() )
        return (object.get()->*exprInstruction.objectFunction)(scene, objectsConcerned, obj1, obj2, exprInstruction);
    else
        return 0;
}

std::string GDExpression::GetAsTextExpressionResult(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2) const
{
    string result;
    for (unsigned int i = 0;i<textExpressionFunctions.size();++i)
    	result += (textExpressionFunctions[i].function)(scene, objectsConcerned, obj1, obj2, textExpressionFunctions[i]);

    return result;
}

bool GDExpression::PrepareForEvaluation(const Game & game, const Scene & scene)
{
    PrepareForMathEvaluationOnly(game, scene);
    PrepareForTextEvaluationOnly(game, scene);

    return true;
}

bool GDExpression::PrepareForMathEvaluationOnly(const Game & game, const Scene & scene)
{
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    string expression = GetPlainString();
    string mathPlainExpression;
    mathExpressionFunctions.clear();

    //Constants
    vector < string > mathFunctions = GDMathParser::GetAllMathFunctions();
    const string possibleSeparator = GDMathParser::GetAllMathSeparator();

    size_t parsePosition = 0;
    unsigned int xNb = 0;

    size_t firstPointPos = expression.find(".");
    size_t firstParPos = expression.find("(");

    while ( firstPointPos != string::npos || firstParPos != string::npos )
    {
        //Identify name
        size_t nameEnd = firstPointPos < firstParPos ? firstPointPos : firstParPos;
        size_t nameStart = expression.find_last_of(possibleSeparator, nameEnd-1);
        nameStart++;

        string nameBefore = expression.substr(nameStart, nameEnd-nameStart);

        //Identify function name
        string functionName = nameBefore;
        size_t functionNameEnd = nameEnd;
        vector < GDExpression > parameters;

        bool nameIsFunction = firstPointPos > firstParPos;
        if ( !nameIsFunction )
        {
            parameters.push_back(GDExpression(nameBefore));
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
        bool isMathFunction = find(mathFunctions.begin(), mathFunctions.end(), functionName) != mathFunctions.end();
        if ( !isMathFunction && nameIsFunction && extensionsManager->HasExpression(functionName) )
        {
            instruction.function = (extensionsManager->GetExpressionFunctionPtr(functionName));
        }
        else if ( !isMathFunction && !nameIsFunction && extensionsManager->HasObjectExpression(GetTypeIdOfObject(game, scene, nameBefore), nameBefore) )
        {
            instruction.function = &ExpObjectFunction;
            instruction.objectFunction = extensionsManager->GetObjectExpressionFunctionPtr(GetTypeIdOfObject(game, scene, nameBefore), nameBefore);
        }

        if( !isMathFunction && instruction.function != NULL ) //Add the function
        {
            //Identify parameters
            size_t parametersEnd = expression.find_first_of("(", functionNameEnd);
            string currentParameterStr;
            if ( parametersEnd != string::npos )
            {
                size_t level = 0;
                parametersEnd++;

                while ( parametersEnd < expression.length() && !(expression[parametersEnd] == ')' && level == 0) )
                {
                    if ( expression[parametersEnd] == '(' ) level++;
                    if ( expression[parametersEnd] == ')' ) level--;

                    if ( (expression[parametersEnd] == ',' && level == 0) )
                    {
                        GDExpression currentParameter(currentParameterStr);
                        currentParameter.PrepareForEvaluation(game, scene);
                        parameters.push_back(currentParameter);

                        currentParameterStr.clear();
                    }
                    else currentParameterStr += expression[parametersEnd];

                    parametersEnd++;
                }
                GDExpression lastParameter(currentParameterStr);
                lastParameter.PrepareForEvaluation(game, scene);
                parameters.push_back(lastParameter);
            }
            instruction.parameters = (parameters);

            mathExpressionFunctions.push_back(instruction);
            xNb++;

            //Update math expression string that will be transmited to the math parser
            mathPlainExpression += expression.substr(parsePosition, nameStart-parsePosition);
            mathPlainExpression += "x"+ToString(xNb);

            parsePosition = parametersEnd+1;
            firstPointPos = expression.find(".", parametersEnd+1);
            firstParPos = expression.find("(", parametersEnd+1);
        }
        else //Math function or math constant : Pass it.
        {
            mathPlainExpression += expression.substr(parsePosition, functionNameEnd+1-parsePosition);
            parsePosition = functionNameEnd+1;
            firstPointPos = expression.find(".", functionNameEnd+1);
            firstParPos = expression.find("(", functionNameEnd+1);
        }
    }

    mathPlainExpression += expression.substr(parsePosition, expression.length());

    //Generate parameter list for math parser
    string parametersStr;
    for (unsigned int i = 1;i<=xNb;++i)
        parametersStr += "x"+ToString(i)+",";

    //Parse math expression
    if ( -1 != mathExpression.Parse(mathPlainExpression, parametersStr))
    {
        #if defined(GDE)
        firstErrorStr = mathExpression.ErrorMsg();
        cout << firstErrorStr;
        #endif
        mathExpression.Parse("0", "");

        isMathExpressionPreprocessed = true;
        return false;
    }

    isMathExpressionPreprocessed = true;
    return true;
}

bool GDExpression::PrepareForTextEvaluationOnly(const Game & game, const Scene & scene)
{
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    string expression = GetPlainString();
    textExpressionFunctions.clear();

    //Constants
    vector < string > mathFunctions = GDMathParser::GetAllMathFunctions();
    const string possibleSeparator = GDMathParser::GetAllMathSeparator();

    size_t parsePosition = 0;

    //Searching for first token.
    size_t firstPointPos = expression.find(".");
    size_t firstParPos = expression.find("(");
    size_t firstQuotePos = expression.find("\"");
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

                isTextExpressionPreprocessed = true;
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
            instruction.parameters = (parameters);

            textExpressionFunctions.push_back(instruction);

            parsePosition = finalQuotePosition+1;
        }
        else //Adding a function
        {
            //Identify name
            size_t nameEnd = firstPointPos < firstParPos ? firstPointPos : firstParPos;
            size_t nameStart = expression.find_last_of(possibleSeparator, nameEnd-1);
            nameStart++;

            string nameBefore = expression.substr(nameStart, nameEnd-nameStart);

            //Identify function name
            string functionName = nameBefore;
            size_t functionNameEnd = nameEnd;
            vector < GDExpression > parameters;
            cout << "STRfunctionName " << functionName << endl;

            bool nameIsFunction = firstPointPos > firstParPos;
            if ( !nameIsFunction )
            {
                parameters.push_back(GDExpression(nameBefore));
                functionNameEnd = expression.find_first_of("( ", nameEnd);
                if ( nameEnd+1 < expression.length()) functionName = expression.substr(nameEnd+1, functionNameEnd-(nameEnd+1));
            }

            //Identify parameters
            size_t parametersEnd = expression.find_first_of("(", functionNameEnd)+1;
            size_t level = 0;
            string currentParameterStr;
            while ( parametersEnd < expression.length() && !(expression[parametersEnd] == ')' && level == 0) )
            {
                if ( expression[parametersEnd] == '(' ) level++;
                if ( expression[parametersEnd] == ')' ) level--;

                if ( (expression[parametersEnd] == ',' && level == 0) )
                {
                    GDExpression currentParameter(currentParameterStr);
                    parameters.push_back(currentParameter);

                    currentParameterStr.clear();
                }
                else currentParameterStr += expression[parametersEnd];

                parametersEnd++;
            }
            GDExpression lastParameter(currentParameterStr);
            parameters.push_back(lastParameter);

            //Add instruction to the list of instructions to call to generate parameters
            bool isMathFunction = find(mathFunctions.begin(), mathFunctions.end(), functionName) != mathFunctions.end();
            StrExpressionInstruction instruction;
            if ( nameIsFunction && extensionsManager->HasStrExpression(functionName) )
            {
                instruction.function = (extensionsManager->GetStrExpressionFunctionPtr(functionName));

                //Preparing parameters
                for (unsigned int i = 0;i<parameters.size();++i)
                	parameters[i].PrepareForEvaluation(game, scene);
                instruction.parameters = (parameters);
            }
            else if ( !nameIsFunction && extensionsManager->HasObjectStrExpression(GetTypeIdOfObject(game, scene, nameBefore), nameBefore) )
            {
                instruction.function = &ExpObjectStrFunction;
                instruction.objectFunction = extensionsManager->GetObjectStrExpressionFunctionPtr(GetTypeIdOfObject(game, scene, nameBefore), nameBefore);

                //Preparing parameters
                for (unsigned int i = 0;i<parameters.size();++i)
                	parameters[i].PrepareForEvaluation(game, scene);
                instruction.parameters = (parameters);
            }
            //Support for implicit conversion from math result to string
            else if ( isMathFunction || extensionsManager->HasExpression(functionName) || extensionsManager->HasObjectExpression(GetTypeIdOfObject(game, scene, nameBefore), nameBefore) )
            {
                vector < GDExpression > implicitConversionParameters;
                GDExpression implicitMathExpression(expression.substr(nameStart, parametersEnd+1-nameStart));
                implicitMathExpression.PrepareForMathEvaluationOnly(game, scene);
                implicitConversionParameters.push_back(implicitMathExpression);

                instruction.function = &ExpToStr;
                instruction.parameters = (implicitConversionParameters);
            }

            if ( instruction.function == NULL ) //Function was not found
            {
                #if defined(GDE)
                firstErrorPos = nameStart;
                firstErrorStr = _("Fonction non reconnue.");
                #endif
                textExpressionFunctions.clear();
                isTextExpressionPreprocessed = true;
                return false;

            }
            textExpressionFunctions.push_back(instruction);

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
                    firstErrorPos = -1;
                    firstErrorStr = _("+ manquant entre deux chaines.");
                    #endif
                    textExpressionFunctions.clear();
                    isTextExpressionPreprocessed = true;
                    return false;
            }
            else if ( expression.find("+", firstPlusPos+1) < nextTokenPos )
            {
                    #if defined(GDE)
                    firstErrorPos = firstPlusPos;
                    firstErrorStr = _("Symbole manquant entre deux +.");
                    #endif
                    textExpressionFunctions.clear();
                    isTextExpressionPreprocessed = true;
                    return false;
            }
        }
    }

    isTextExpressionPreprocessed = true;
    return true;
}

