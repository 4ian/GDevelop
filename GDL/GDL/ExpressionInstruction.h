/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXPRESSIONINSTRUCTION_H
#define EXPRESSIONINSTRUCTION_H

#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
#include <boost/serialization/vector.hpp>
#include <boost/serialization/nvp.hpp>
class GDExpression;
class ExpressionInstruction;
class Object;
class ObjectsConcerned;
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
    typedef double (*PtrFunction)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction);
    typedef double (Object::*PtrObjectFunction)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction);
    typedef double (Automatism::*PtrAutomatismFunction)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction);

    public:
        ExpressionInstruction();
        virtual ~ExpressionInstruction();

        PtrFunction                 function;
        PtrObjectFunction           objectFunction;
        PtrAutomatismFunction       automatismFunction;

        std::vector<GDExpression>   parameters;

    private:
};

#endif // EXPRESSIONINSTRUCTION_H
