#include "GDL/ExpressionInstruction.h"
#include "GDL/GDExpression.h"

ExpressionInstruction::ExpressionInstruction() :
function(NULL),
objectFunction(NULL),
automatismFunction(NULL),
automatismTypeId(0)
{
    //ctor
}

ExpressionInstruction::~ExpressionInstruction()
{
    //dtor
}
