#ifdef DONTDEFINE
#ifndef OBJECTWITHOPACITY_H
#define OBJECTWITHOPACITY_H

#include <string>
#include <boost/shared_ptr.hpp>
#include "GDL/Object.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class ExpressionInstruction;

class ObjectWithOpacity
{
    public:
        ObjectWithOpacity() {};
        virtual ~ObjectWithOpacity() {};

        void SetOpacity(int val);
        inline int GetOpacity() const {return opacity;};

        //Conditions
        bool CondOpacity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

        //Actions
        bool ActOpacity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

        //Expressions
        double ExpOpacity( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

    protected:
        int opacity;
};

#endif // OBJECTWITHOPACITY_H
#endif
