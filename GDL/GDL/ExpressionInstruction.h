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
 * Instruction ( function or object function ) of an expression
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
        unsigned int automatismTypeId; ///<Automatism type to call, if the instruction need one

        std::vector<GDExpression>   parameters;

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

    private:
};

#endif // EXPRESSIONINSTRUCTION_H
