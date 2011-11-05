#include "GDL/GDExpression.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/StrExpressionInstruction.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/RuntimeScene.h"
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

GDExpression::GDExpression(std::string plainString_) : plainString(plainString_)
{
}
