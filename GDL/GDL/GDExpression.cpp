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

#if defined(GDE)
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

class MathExpressionConstantTokenFunctor : public ConstantTokenFunctor
{
    public:

    MathExpressionConstantTokenFunctor(std::string & mathPlainExpression_) :
    mathPlainExpression(mathPlainExpression_)
    {};
    virtual ~MathExpressionConstantTokenFunctor() {};

    virtual void operator()(std::string text)
    {
        mathPlainExpression += text;
    };

    private :
        std::string & mathPlainExpression;
};

class MathExpressionStaticFunctionFunctor : public StaticFunctionFunctor
{
    public:

    MathExpressionStaticFunctionFunctor(std::string & mathPlainExpression_, std::vector < ExpressionInstruction > & mathExpressionFunctions_) :
    mathPlainExpression(mathPlainExpression_),
    mathExpressionFunctions(mathExpressionFunctions_)
    {};
    virtual ~MathExpressionStaticFunctionFunctor() {};

    virtual void operator()(std::string functionName, const ExpressionInstruction & instruction)
    {
        mathExpressionFunctions.push_back(instruction);
        mathPlainExpression += "x"+ToString(mathExpressionFunctions.size());
    };

    private :
        std::string & mathPlainExpression;
        std::vector < ExpressionInstruction > & mathExpressionFunctions;
};

class MathExpressionObjectFunctionFunctor : public ObjectFunctionFunctor
{
    public:

    MathExpressionObjectFunctionFunctor(std::string & mathPlainExpression_, std::vector < ExpressionInstruction > & mathExpressionFunctions_) :
    mathPlainExpression(mathPlainExpression_),
    mathExpressionFunctions(mathExpressionFunctions_)
    {};
    virtual ~MathExpressionObjectFunctionFunctor() {};

    virtual void operator()(std::string functionName, const ExpressionInstruction & instruction)
    {
        mathExpressionFunctions.push_back(instruction);
        mathPlainExpression += "x"+ToString(mathExpressionFunctions.size());
    };

    private :
        std::string & mathPlainExpression;
        std::vector < ExpressionInstruction > & mathExpressionFunctions;
};

class MathExpressionAutomatismFunctionFunctor : public AutomatismFunctionFunctor
{
    public:

    MathExpressionAutomatismFunctionFunctor(std::string & mathPlainExpression_, std::vector < ExpressionInstruction > & mathExpressionFunctions_) :
    mathPlainExpression(mathPlainExpression_),
    mathExpressionFunctions(mathExpressionFunctions_)
    {};
    virtual ~MathExpressionAutomatismFunctionFunctor() {};

    virtual void operator()(std::string functionName, const ExpressionInstruction & instruction)
    {
        mathExpressionFunctions.push_back(instruction);
        mathPlainExpression += "x"+ToString(mathExpressionFunctions.size());
    };

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
    MathExpressionConstantTokenFunctor constantTokenFunctor(mathPlainExpression);
    MathExpressionStaticFunctionFunctor staticFunctionFunctor(mathPlainExpression, mathExpressionFunctions);
    MathExpressionObjectFunctionFunctor objectFunctionFunctor(mathPlainExpression, mathExpressionFunctions);
    MathExpressionAutomatismFunctionFunctor automatismFunctionFunctor(mathPlainExpression, mathExpressionFunctions);

    //Call parser
    if ( !expressionParser.ParseMathExpression(game, scene, constantTokenFunctor, staticFunctionFunctor, objectFunctionFunctor, automatismFunctionFunctor) )
    {
        //Parsing failed
        #if defined(GDE)
        firstErrorStr = expressionParser.firstErrorStr;
        firstErrorPos = expressionParser.firstErrorPos;
        #endif
        mathExpressionFunctions.clear();
        mathExpression.Parse("0", "");

        isMathExpressionPreprocessed = true;
    }

    //Parsing successed, prepare math parsing
    string parametersStr;
    for (unsigned int i = 1;i<=mathExpressionFunctions.size();++i)
        parametersStr += "x"+ToString(i)+",";

    //Parse math expression
    if ( -1 != mathExpression.Parse(mathPlainExpression, parametersStr))
    {
        #if defined(GDE)
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


class TextExpressionConstantTokenFunctor : public ConstantTokenFunctor
{
    public:

    TextExpressionConstantTokenFunctor() {};
    virtual ~TextExpressionConstantTokenFunctor() {};

    private :
};

class TextExpressionStaticFunctionFunctor : public StaticFunctionFunctor
{
    public:

    TextExpressionStaticFunctionFunctor(std::vector < StrExpressionInstruction > & textExpressionFunctions_) :
    textExpressionFunctions(textExpressionFunctions_)
    {};
    virtual ~TextExpressionStaticFunctionFunctor() {};

    virtual void operator()(std::string functionName, const StrExpressionInstruction & instruction)
    {
        textExpressionFunctions.push_back(instruction);
    };

    private :
        std::vector < StrExpressionInstruction > & textExpressionFunctions;
};

class TextExpressionObjectFunctionFunctor : public ObjectFunctionFunctor
{
    public:

    TextExpressionObjectFunctionFunctor(std::vector < StrExpressionInstruction > & textExpressionFunctions_) :
    textExpressionFunctions(textExpressionFunctions_)
    {};
    virtual ~TextExpressionObjectFunctionFunctor() {};

    virtual void operator()(std::string functionName, const StrExpressionInstruction & instruction)
    {
        textExpressionFunctions.push_back(instruction);
    };

    private :
        std::vector < StrExpressionInstruction > & textExpressionFunctions;
};

class TextExpressionAutomatismFunctionFunctor : public AutomatismFunctionFunctor
{
    public:

    TextExpressionAutomatismFunctionFunctor(std::vector < StrExpressionInstruction > & textExpressionFunctions_) :
    textExpressionFunctions(textExpressionFunctions_)
    {};
    virtual ~TextExpressionAutomatismFunctionFunctor() {};

    virtual void operator()(std::string functionName, const StrExpressionInstruction & instruction)
    {
        textExpressionFunctions.push_back(instruction);
    };

    private :
        std::vector < StrExpressionInstruction > & textExpressionFunctions;
};

bool GDExpression::PrepareForTextEvaluationOnly(const Game & game, const Scene & scene)
{
    GDExpressionParser expressionParser( GetPlainString() );
    textExpressionFunctions.clear();

    //Prepare functors
    TextExpressionConstantTokenFunctor constantTokenFunctor;
    TextExpressionStaticFunctionFunctor staticFunctionFunctor(textExpressionFunctions);
    TextExpressionObjectFunctionFunctor objectFunctionFunctor(textExpressionFunctions);
    TextExpressionAutomatismFunctionFunctor automatismFunctionFunctor(textExpressionFunctions);

    //Call parser
    if ( !expressionParser.ParseTextExpression(game, scene, constantTokenFunctor, staticFunctionFunctor, objectFunctionFunctor, automatismFunctionFunctor) )
    {
        //Parsing failed
        #if defined(GDE)
        firstErrorStr = expressionParser.firstErrorStr;
        firstErrorPos = expressionParser.firstErrorPos;
        #endif
        textExpressionFunctions.clear();
    }

    isTextExpressionPreprocessed = true;
    return true;
}

