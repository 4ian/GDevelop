/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef STREXPRESSIONINSTRUCTION_H
#define STREXPRESSIONINSTRUCTION_H

#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
#include <boost/serialization/vector.hpp>
#include <boost/serialization/nvp.hpp>
class GDExpression;
class ExpressionInstruction;
class Object;
class Automatism;
class ObjectsConcerned;
class RuntimeScene;

typedef std::vector < boost::shared_ptr<Object> > ObjList;
typedef boost::shared_ptr<Object> ObjSPtr;

/**
 * \brief Instruction ( function or object function ) of a string expression.
 * Each string expression is composed of several StrExpressionInstruction at runtime,
 * which are processed one by one to generate the final string.
 */
class GD_API StrExpressionInstruction
{
    typedef std::string (*PtrFunction)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);
    typedef std::string (Object::*PtrObjectFunction)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);
    typedef std::string (Automatism::*PtrAutomatismFunction)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);

    public:
        StrExpressionInstruction();
        virtual ~StrExpressionInstruction() {};

        PtrFunction                 function; ///< Function to call
        PtrObjectFunction           objectFunction; ///< (Optional) Object function to call
        PtrAutomatismFunction       automatismFunction; ///< (Optional) Automatism function to call

        std::vector<GDExpression>   parameters; ///< Parameters to be passed to function
};

#endif // STREXPRESSIONINSTRUCTION_H
