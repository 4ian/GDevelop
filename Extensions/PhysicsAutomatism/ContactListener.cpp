#include "ContactListener.h"
#include "PhysicsAutomatism.h"

void ContactListener::BeginContact( b2Contact * contact )
{
    if ( !contact->GetFixtureA()->GetBody() || !contact->GetFixtureB()->GetBody()) return;

    PhysicsAutomatism * automatism1 = static_cast<PhysicsAutomatism *>(contact->GetFixtureA()->GetBody()->GetUserData());
    PhysicsAutomatism * automatism2 = static_cast<PhysicsAutomatism *>(contact->GetFixtureB()->GetBody()->GetUserData());
    automatism1->currentContacts.insert(automatism2);
    automatism2->currentContacts.insert(automatism1);
}

void ContactListener::EndContact( b2Contact * contact )
{
    if ( !contact->GetFixtureA()->GetBody() || !contact->GetFixtureB()->GetBody()) return;

    PhysicsAutomatism * automatism1 = static_cast<PhysicsAutomatism *>(contact->GetFixtureA()->GetBody()->GetUserData());
    PhysicsAutomatism * automatism2 = static_cast<PhysicsAutomatism *>(contact->GetFixtureB()->GetBody()->GetUserData());
    automatism1->currentContacts.erase(automatism2);
    automatism2->currentContacts.erase(automatism1);
}

