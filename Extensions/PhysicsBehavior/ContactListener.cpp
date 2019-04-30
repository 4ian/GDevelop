/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "ContactListener.h"
#include "PhysicsRuntimeBehavior.h"

void ContactListener::BeginContact(b2Contact *contact) {
  if (!contact->GetFixtureA()->GetBody() || !contact->GetFixtureB()->GetBody())
    return;

  PhysicsRuntimeBehavior *behavior1 = static_cast<PhysicsRuntimeBehavior *>(
      contact->GetFixtureA()->GetBody()->GetUserData());
  PhysicsRuntimeBehavior *behavior2 = static_cast<PhysicsRuntimeBehavior *>(
      contact->GetFixtureB()->GetBody()->GetUserData());
  behavior1->currentContacts.insert(behavior2);
  behavior2->currentContacts.insert(behavior1);
}

void ContactListener::EndContact(b2Contact *contact) {
  if (!contact->GetFixtureA()->GetBody() || !contact->GetFixtureB()->GetBody())
    return;

  PhysicsRuntimeBehavior *behavior1 = static_cast<PhysicsRuntimeBehavior *>(
      contact->GetFixtureA()->GetBody()->GetUserData());
  PhysicsRuntimeBehavior *behavior2 = static_cast<PhysicsRuntimeBehavior *>(
      contact->GetFixtureB()->GetBody()->GetUserData());
  behavior1->currentContacts.erase(behavior2);
  behavior2->currentContacts.erase(behavior1);
}
