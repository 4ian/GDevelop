/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXPRESSIONINSTRUCTION_H
#define EXPRESSIONINSTRUCTION_H

#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
class GDExpression;
class ExpressionInstruction;
class Object;
class RuntimeScene;
class Automatism;

typedef std::vector < boost::shared_ptr<Object> > ObjList;
typedef boost::shared_ptr<Object> ObjSPtr;

/**
 * \brief Instruction ( function or object function ) of an expression
 * Instruction are processed at runtime to generate the mathematical expression which will be evaluated.
 */
class GD_API ExpressionInstruction
{
//TODO : Remove this class

    public:
        ExpressionInstruction() {};
        virtual ~ExpressionInstruction() {};

        std::vector<GDExpression>   parameters;
};

#endif // EXPRESSIONINSTRUCTION_H
