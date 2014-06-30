/**

Game Develop - Physics Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/
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

