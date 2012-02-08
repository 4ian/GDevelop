/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#ifndef STREXPRESSIONINSTRUCTION_H
#define STREXPRESSIONINSTRUCTION_H

#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
class GDExpression;

/**
 * \brief Instruction ( function or object function ) of a string expression.
 * Each string expression is composed of several StrExpressionInstruction at runtime,
 * which are processed one by one to generate the final string.
 */
class GD_API StrExpressionInstruction
{
    public:
        StrExpressionInstruction() {};
        virtual ~StrExpressionInstruction() {};
        std::vector<GDExpression>   parameters; ///< Parameters to be passed to function
};

#endif // STREXPRESSIONINSTRUCTION_H
#endif
