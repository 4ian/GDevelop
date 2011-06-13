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

GDExpression::GDExpression()
{
}

GDExpression::GDExpression(std::string plainString_) : plainString(plainString_), boolEquivalent(false)
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

    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::GetInstance();
    oID = objectIdentifiersManager->GetOIDfromName(plainString);
}
