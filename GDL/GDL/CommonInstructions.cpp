/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/CommonInstructions.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/profile.h"

/**
 * Common instruction for executing instruction on each object "Foo".
 */
bool AutomatismActionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
        ((*obj)->GetAutomatism(action.GetParameter( 1 ).GetAsObjectIdentifier()).get()->*action.automatismFunction)(scene, objectsConcerned, action);

    return true;
}

/**
 * Common instruction for testing instruction on each object "Foo".
 */
bool AutomatismConditionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    ObjList objectsConcernedByConditions;

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        if ( ((*obj)->GetAutomatism(condition.GetParameter( 1 ).GetAsObjectIdentifier()).get()->*condition.automatismFunction)(scene, objectsConcerned, condition) ^ condition.IsInverted())
            objectsConcernedByConditions.push_back( *obj );
    }

    objectsConcerned.objectsPicked.AddListOfObjectsWithSameName( objectsConcernedByConditions );

    return !objectsConcernedByConditions.empty();
}

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
    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    ObjList objectsConcernedByConditions;

    for ( unsigned int i = 0; i<list.size(); ++i )
    {
        if ( ((list[i]).get()->*condition.objectFunction)(scene, objectsConcerned, condition) ^ condition.IsInverted())
            objectsConcernedByConditions.push_back((list[i]));
    }

    objectsConcerned.objectsPicked.AddListOfObjectsWithSameName( objectsConcernedByConditions );

    return !objectsConcernedByConditions.empty();
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
 * Common instruction testing if all sub conditions are true
 */
bool ConditionAnd( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    for ( unsigned int k = 0; k < condition.GetSubInstructions().size(); ++k )
    {
        if ( condition.GetSubInstructions()[k].function != NULL &&
             !condition.GetSubInstructions()[k].function( scene, objectsConcerned, condition.GetSubInstructions()[k]) )
            return false; //Return false as soon as a condition is false
    }

    return true;
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


/**
 * Expression function needed for adding a constant text to a text expression
 */
string ExpConstantText(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction)
{
    return exprInstruction.parameters[0].GetPlainString();
}

/**
 * Expression function needed for calling objects expressions functions
 */
double ExpObjectFunction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    //We need an object to pass to the function
    ObjSPtr object;
    ObjList list = objectsConcerned.Pick( exprInstruction.parameters[0].GetAsObjectIdentifier() );

    if ( !list.empty() )
    {
        object = list[0]; //On prend le premier objet de la liste par défaut

        //Si l'objet principal de la  est dedans, on le prend
        ObjList::iterator iter = find(list.begin(), list.end(), obj1);
        if ( iter != list.end() )
            object = *iter;
        else
        {
            //Si l'objet secondaire de la  est dedans, on le prend
            iter = find(list.begin(), list.end(), obj2);
            if ( iter != list.end() )
                object = *iter;
        }
    }

    //Verify that we have a valid object
    if ( object != boost::shared_ptr<Object>() )
        return (object.get()->*exprInstruction.objectFunction)(scene, objectsConcerned, obj1, obj2, exprInstruction);
    else
        return 0;
}

/**
 * Expression function needed for calling objects expressions functions
 */
double ExpAutomatismFunction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    //We need an object to pass to the function
    ObjSPtr object;
    ObjList list = objectsConcerned.Pick( exprInstruction.parameters[0].GetAsObjectIdentifier() );

    if ( !list.empty() )
    {
        object = list[0]; //On prend le premier objet de la liste par défaut

        //Si l'objet principal de la  est dedans, on le prend
        ObjList::iterator iter = find(list.begin(), list.end(), obj1);
        if ( iter != list.end() )
            object = *iter;
        else
        {
            //Si l'objet secondaire de la  est dedans, on le prend
            iter = find(list.begin(), list.end(), obj2);
            if ( iter != list.end() )
                object = *iter;
        }
    }

    //Verify that we have a valid object
    if ( object != boost::shared_ptr<Object>() )
        return (object->GetAutomatism(exprInstruction.parameters[1].GetAsObjectIdentifier()).get()->*exprInstruction.automatismFunction)(scene, objectsConcerned, obj1, obj2, exprInstruction);
    else
        return 0;
}

/**
 * Expression function needed for calling objects expressions functions
 */
std::string ExpObjectStrFunction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction)
{
    //We need an object to pass to the function
    ObjSPtr object;
    ObjList list = objectsConcerned.Pick( exprInstruction.parameters[0].GetAsObjectIdentifier() );

    if ( !list.empty() )
    {
        object = list[0]; //On prend le premier objet de la liste par défaut

        //Si l'objet principal de la  est dedans, on le prend
        ObjList::iterator iter = find(list.begin(), list.end(), obj1);
        if ( iter != list.end() )
            object = *iter;
        else
        {
            //Si l'objet secondaire de la  est dedans, on le prend
            iter = find(list.begin(), list.end(), obj2);
            if ( iter != list.end() )
                object = *iter;
        }
    }

    //Verify that we have a valid object
    if ( object != boost::shared_ptr<Object>() )
        return (object.get()->*exprInstruction.objectFunction)(scene, objectsConcerned, obj1, obj2, exprInstruction);
    else
        return "";
}

/**
 * Expression function needed for calling objects expressions functions
 */
std::string ExpAutomatismStrFunction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction)
{
    //We need an object to pass to the function
    ObjSPtr object;
    ObjList list = objectsConcerned.Pick( exprInstruction.parameters[0].GetAsObjectIdentifier() );

    if ( !list.empty() )
    {
        object = list[0]; //On prend le premier objet de la liste par défaut

        //Si l'objet principal de la  est dedans, on le prend
        ObjList::iterator iter = find(list.begin(), list.end(), obj1);
        if ( iter != list.end() )
            object = *iter;
        else
        {
            //Si l'objet secondaire de la  est dedans, on le prend
            iter = find(list.begin(), list.end(), obj2);
            if ( iter != list.end() )
                object = *iter;
        }
    }

    //Verify that we have a valid object
    if ( object != boost::shared_ptr<Object>() )
        return (object->GetAutomatism(exprInstruction.parameters[1].GetAsObjectIdentifier()).get()->*exprInstruction.automatismFunction)(scene, objectsConcerned, obj1, obj2, exprInstruction);
    else
        return "";
}
