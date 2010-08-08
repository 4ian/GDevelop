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
 * Instruction ( function or object function ) of a string expression
 */
class GD_API StrExpressionInstruction
{
    typedef std::string (*PtrFunction)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);
    typedef std::string (Object::*PtrObjectFunction)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);
    typedef std::string (Automatism::*PtrAutomatismFunction)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);

    public:
        StrExpressionInstruction();
        virtual ~StrExpressionInstruction();

        PtrFunction                 function;
        PtrObjectFunction           objectFunction;
        PtrAutomatismFunction       automatismFunction;
        unsigned int                automatismTypeId;

        std::vector<GDExpression>   parameters;

    private:

        friend class boost::serialization::access;
        /**
         * Serialize
         */
        template<class Archive>
        void serialize(Archive& ar, const unsigned int version){
            ar /*& BOOST_SERIALIZATION_NVP(function)
               & BOOST_SERIALIZATION_NVP(objectFunction)*/
               & BOOST_SERIALIZATION_NVP(parameters);
        }
};

#endif // STREXPRESSIONINSTRUCTION_H
