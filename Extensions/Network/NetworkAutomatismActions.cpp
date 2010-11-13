
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"
#include "NetworkAutomatism.h"

/**
 * Generate an object network identifier, unique for each object.
 */
bool ActGenereateObjectNetworkId( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());

    for ( unsigned int i = 0; i<list.size(); ++i )
    {
        //We can afford a dynamic_cast in this action
        boost::shared_ptr<NetworkAutomatism> automatism =
            boost::shared_dynamic_cast<NetworkAutomatism>(list[i]->GetAutomatism(action.GetParameter( 1 ).GetAsObjectIdentifier()));

        if ( automatism !=boost::shared_ptr<NetworkAutomatism>() )
            automatism->objectNetworkId = i;
    }

    return true;
}

/**
 * Set the automatism as the sender
 */
bool NetworkAutomatism::ActSetAsSender( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    sending = true;

    return true;
}

/**
 * Set the automatism as the receiver
 */
bool NetworkAutomatism::ActSetAsReceiver( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    sending = false;

    return true;
}

/**
 * Change object network identiifer
 */
bool NetworkAutomatism::ActSetIdentifier( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    objectNetworkId = static_cast<int>(action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned));

    return true;
}
