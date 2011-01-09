#include "GDL/GDExpression.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/StrExpressionInstruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/RuntimeScene.h"
#include "GDL/eFreeFunctions.h"
#include "GDL/ObjectIdentifiersManager.h"
#include "GDL/CommonInstructions.h"
#include "GDL/GDExpressionParser.h"
#include <string>

#if defined(GD_IDE_ONLY)
#include <wx/wx.h>
#elif !defined(_)
#define _(x) x
#endif

using namespace std;

GDExpression::GDExpression() : isMathExpressionPreprocessed(false), isTextExpressionPreprocessed(false)
{
}

GDExpression::GDExpression(std::string plainString_) : plainString(plainString_), boolEquivalent(false), isMathExpressionPreprocessed(false), isTextExpressionPreprocessed(false)
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

    if (plainString == "yes" || plainString == "oui") boolEquivalent = true;

    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    oID = objectIdentifiersManager->GetOIDfromName(plainString);
}

bool GDExpression::PrepareForEvaluation(const Game & game, const Scene & scene)
{
    bool ok = true;

    if ( !PrepareForMathEvaluationOnly(game, scene) ) ok = false;
    if ( !PrepareForTextEvaluationOnly(game, scene) ) ok = false;

    return ok;
}

/**
 * Callbacks for parser, designed to prepare an expression for mathematical evaluations
 */
class CallbacksForPreparingMathEvaluation : public ParserCallbacks
{
    public:

    CallbacksForPreparingMathEvaluation(std::string & mathPlainExpression_, std::vector < ExpressionInstruction > & mathExpressionFunctions_) :
    mathPlainExpression(mathPlainExpression_),
    mathExpressionFunctions(mathExpressionFunctions_)
    {};
    virtual ~CallbacksForPreparingMathEvaluation() {};

    virtual void OnConstantToken(std::string text)
    {
        mathPlainExpression += text;
    };

    virtual void OnStaticFunction(std::string functionName, const ExpressionInstruction & instruction)
    {
        mathExpressionFunctions.push_back(instruction);
        mathPlainExpression += "x"+ToString(mathExpressionFunctions.size());
    };

    virtual void OnObjectFunction(std::string functionName, const ExpressionInstruction & instruction)
    {
        mathExpressionFunctions.push_back(instruction);
        mathPlainExpression += "x"+ToString(mathExpressionFunctions.size());
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const ExpressionInstruction & instruction)
    {
        mathExpressionFunctions.push_back(instruction);
        mathPlainExpression += "x"+ToString(mathExpressionFunctions.size());
    };

    virtual bool OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        if ( !expression.PrepareForMathEvaluationOnly(game, scene) )
        {
            #if defined(GD_IDE_ONLY)
            firstErrorStr = expression.GetFirstErrorDuringPreprocessingText();
            firstErrorPos = expression.GetFirstErrorDuringPreprocessingPosition();
            #endif
            return false;
        }

        return true;
    }

    virtual bool OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        if ( !expression.PrepareForTextEvaluationOnly(game, scene) )
        {
            #if defined(GD_IDE_ONLY)
            firstErrorStr = expression.GetFirstErrorDuringPreprocessingText();
            firstErrorPos = expression.GetFirstErrorDuringPreprocessingPosition();
            #endif
            return false;
        }

        return true;
    }

    virtual void OnStaticFunction(std::string functionName, const StrExpressionInstruction & instruction){};
    virtual void OnObjectFunction(std::string functionName, const StrExpressionInstruction & instruction){};
    virtual void OnObjectAutomatismFunction(std::string functionName, const StrExpressionInstruction & instruction){};

    private :
        std::string & mathPlainExpression;
        std::vector < ExpressionInstruction > & mathExpressionFunctions;
};

bool GDExpression::PrepareForMathEvaluationOnly(const Game & game, const Scene & scene)
{
    GDExpressionParser expressionParser( GetPlainString() );

    string mathPlainExpression;
    mathExpressionFunctions.clear();

    //Prepare functors
    CallbacksForPreparingMathEvaluation callbacks(mathPlainExpression, mathExpressionFunctions);

    //Call parser
    if ( !expressionParser.ParseMathExpression(game, scene, callbacks) )
    {
        //Parsing failed
        #if defined(GD_IDE_ONLY)
        firstErrorStr = expressionParser.firstErrorStr;
        firstErrorPos = expressionParser.firstErrorPos;
        #endif
        mathExpressionFunctions.clear();
        mathExpression.Parse("0", "");

        isMathExpressionPreprocessed = true;
        return false;
    }

    //Parsing successed, prepare math parsing
    string parametersStr;
    for (unsigned int i = 1;i<=mathExpressionFunctions.size();++i)
        parametersStr += "x"+ToString(i)+",";

    //Parse math expression
    if ( -1 != mathExpression.Parse(mathPlainExpression, parametersStr))
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = mathExpression.ErrorMsg();
        firstErrorPos = string::npos;
        #endif
        mathExpressionFunctions.clear();
        mathExpression.Parse("0", "");

        isMathExpressionPreprocessed = true;
        return false;
    }

    mathExpression.Optimize();

    isMathExpressionPreprocessed = true;
    return true;
}

/**
 * Callbacks for parser, designed to prepare an expression for text evaluation
 */
class CallbacksForPreparingTextEvaluation : public ParserCallbacks
{
    public:

    CallbacksForPreparingTextEvaluation(std::vector < StrExpressionInstruction > & textExpressionFunctions_) :
    textExpressionFunctions(textExpressionFunctions_)
    {};
    virtual ~CallbacksForPreparingTextEvaluation() {};

    virtual void OnStaticFunction(std::string functionName, const StrExpressionInstruction & instruction)
    {
        textExpressionFunctions.push_back(instruction);
    };

    virtual void OnObjectFunction(std::string functionName, const StrExpressionInstruction & instruction)
    {
        textExpressionFunctions.push_back(instruction);
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const StrExpressionInstruction & instruction)
    {
        textExpressionFunctions.push_back(instruction);
    };

    virtual bool OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        if ( !expression.PrepareForMathEvaluationOnly(game, scene) )
        {
            #if defined(GD_IDE_ONLY)
            firstErrorStr = expression.GetFirstErrorDuringPreprocessingText();
            firstErrorPos = expression.GetFirstErrorDuringPreprocessingPosition();
            #endif
            return false;
        }

        return true;
    }

    virtual bool OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        if ( !expression.PrepareForTextEvaluationOnly(game, scene) )
        {
            #if defined(GD_IDE_ONLY)
            firstErrorStr = expression.GetFirstErrorDuringPreprocessingText();
            firstErrorPos = expression.GetFirstErrorDuringPreprocessingPosition();
            #endif
            return false;
        }

        return true;
    }

    virtual void OnConstantToken(std::string text){};
    virtual void OnStaticFunction(std::string functionName, const ExpressionInstruction & instruction){};
    virtual void OnObjectFunction(std::string functionName, const ExpressionInstruction & instruction){};
    virtual void OnObjectAutomatismFunction(std::string functionName, const ExpressionInstruction & instruction){};

    private :
        std::vector < StrExpressionInstruction > & textExpressionFunctions;
};

bool GDExpression::PrepareForTextEvaluationOnly(const Game & game, const Scene & scene)
{
    GDExpressionParser expressionParser( GetPlainString() );
    textExpressionFunctions.clear();

    //Prepare functors
    CallbacksForPreparingTextEvaluation callbacks(textExpressionFunctions);

    //Call parser
    if ( !expressionParser.ParseTextExpression(game, scene, callbacks) )
    {
        //Parsing failed
        #if defined(GD_IDE_ONLY)
        firstErrorStr = expressionParser.firstErrorStr;
        firstErrorPos = expressionParser.firstErrorPos;
        #endif
        textExpressionFunctions.clear();

        return false;
    }

    isTextExpressionPreprocessed = true;
    return true;
}

