/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "ContactListener.h"
#include "PhysicsBehavior.h"

void ContactListener::BeginContact( b2Contact * contact )
{
    if ( !contact->GetFixtureA()->GetBody() || !contact->GetFixtureB()->GetBody()) return;

    PhysicsBehavior * behavior1 = static_cast<PhysicsBehavior *>(contact->GetFixtureA()->GetBody()->GetUserData());
    PhysicsBehavior * behavior2 = static_cast<PhysicsBehavior *>(contact->GetFixtureB()->GetBody()->GetUserData());
    behavior1->currentContacts.insert(behavior2);
    behavior2->currentContacts.insert(behavior1);
}

void ContactListener::EndContact( b2Contact * contact )
{
    if ( !contact->GetFixtureA()->GetBody() || !contact->GetFixtureB()->GetBody()) return;

    PhysicsBehavior * behavior1 = static_cast<PhysicsBehavior *>(contact->GetFixtureA()->GetBody()->GetUserData());
    PhysicsBehavior * behavior2 = static_cast<PhysicsBehavior *>(contact->GetFixtureB()->GetBody()->GetUserData());
    behavior1->currentContacts.erase(behavior2);
    behavior2->currentContacts.erase(behavior1);
}

