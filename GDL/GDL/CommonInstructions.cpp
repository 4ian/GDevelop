#include "GDL/CommonInstructions.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Access.h"

/**
 * Common instruction for executing instruction on each object "Foo".
 */
bool ActionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
        ((*obj).get()->*action.objectFunction)(scene, objectsConcerned, action);

    return true;
}

/**
 * Common instruction for testing instruction on each object "Foo".
 */
bool ConditionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //Need to copy the old objectsConcerned object to evaluate properly the arguments
    ObjectsConcerned objectsConcernedForExpressions = objectsConcerned;

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    bool isTrue = false;

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        if ( ((*obj).get()->*condition.objectFunction)(scene, objectsConcernedForExpressions, condition) ^ condition.IsInverted())
        {
            isTrue = true;
            objectsConcerned.objectsPicked.AddObject( *obj );
        }
    }

    return isTrue;
}

/**
 * Common instruction testing if one or more sub conditions are true
 */
bool ConditionOr( RuntimeScene & scene, ObjectsConcerned & finalObjectsConcerned, const Instruction & condition )
{
    bool isTrue = false;
    ObjectsConcerned objectsConcernedParent = finalObjectsConcerned;

    for ( unsigned int k = 0; k < condition.GetSubInstructions().size(); ++k )
    {
        bool ok = false;

        //Re use objects concerned from parent at each condition
        ObjectsConcerned objectsConcerned;
        objectsConcerned.InheritsFrom(&objectsConcernedParent);

        if ( condition.GetSubInstructions()[k].function != NULL )
            ok = condition.GetSubInstructions()[k].function( scene, objectsConcerned, condition.GetSubInstructions()[k]);

        if ( ok ) //Condition is true ? Remember objects picked and set the "Or" condition true.
        {
            isTrue = true;
            finalObjectsConcerned.Merge(objectsConcerned);
        }
    }

    return isTrue;
}

/**
 * Common instruction testing sub conditions, inversing the result
 */
bool ConditionNot( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    for ( unsigned int k = 0; k < condition.GetSubInstructions().size(); ++k )
    {
        if ( condition.GetSubInstructions()[k].function != NULL &&
             !condition.GetSubInstructions()[k].function( scene, objectsConcerned, condition.GetSubInstructions()[k]) )
            return true; //Return true ( We are in a NOT condition ) as soon as a condition is false
    }

    return false; //Return false ( We are in a NOT condition )
}
