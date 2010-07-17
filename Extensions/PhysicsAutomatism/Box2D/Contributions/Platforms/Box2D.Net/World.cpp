#pragma once

#include "Stdafx.h"
#include "AABB.cpp"
#include "Body.cpp"
#include "BodyDef.cpp"
#include "Joint.cpp"
#include "JointDef.cpp"
#include "Contact.cpp"

namespace Box2D
{
	namespace Net
	{
		public ref class World
		{
			b2World *world;
		public:			

			World(AABB^ worldAABB, Vector^ gravity, bool doSleep) : world(new b2World(
				worldAABB->getAABB(), gravity->getVec2(), doSleep)) { }

			~World()
			{
				delete world;
			}

			/// <summary> Create rigid body from a definition </summary>
			Body^ CreateBody(BodyDef^ def)
			{
				return gcnew Body(world->CreateBody(def->def));
			}
			
			///<summary>
			/// Destroy rigid bodies. Destruction is deferred until the the next call to Step. 
			/// This is done so that bodies may be destroyed while you iterate through the contact list.
			///</summary>
			void DestroyBody(Body^ body)
			{
				world->DestroyBody(body->body);
			}

			/// <summary>
			/// The world provides a single ground body with no collision shapes. You
			/// can use this to simplify the creation of joints.
			/// </summary>
			Body^ GetGroundBody()
			{
				return gcnew Body(world->GetGroundBody());
			}

			void Step(float32 timeStep, int32 iterations)
			{
				world->Step(timeStep, iterations);
			}

			Joint^ CreateJoint(JointDef^ def)
			{
				return gcnew Joint(world->CreateJoint(def->def));
			}

			void DestroyJoint(Joint^ joint)
			{
				world->DestroyJoint(joint->joint);
			}

			property IList<Body^>^ Bodies
			{
				IList<Body^>^ get()
				{
					List<Body^>^ list = gcnew List<Body^>();
					for(b2Body *body = world->GetBodyList(); body; body = body->GetNext())
						list->Add(gcnew Body(body));

					return list;
				}
			}

			property IList<Joint^>^ Joints
			{
				IList<Joint^>^ get()
				{
					List<Joint^>^ list = gcnew List<Joint^>();
					for(b2Joint *joint = world->GetJointList(); joint; joint = joint->GetNext())
						list->Add(gcnew Joint(joint));

					return list;
				}
			}

			Joint^ GetJointList()
			{
				return gcnew Joint(world->GetJointList());
			}

			///<summary> You can use these to iterate over all the bodies, joints, and contacts. </summary>
			/*
			Contact^ GetContactList()
			{
				return gcnew Contact(world->C>GetContactList());
			}
			*/

			/// <summary>
			/// Query the world for all shapes that potentially overlap the
			/// provided AABB. You provide a shape pointer buffer of specified
			/// size. The number of shapes found is returned.
			/// </summary>
			IList<Shape^>^ Query(AABB^ aabb)
			{
				const int32 k_maxCount = 25;
				b2Shape* shapes[k_maxCount];
				int32 count = world->Query(aabb->getAABB(), shapes, k_maxCount);

				List<Shape^>^ list = gcnew List<Shape^>();
				for(int x = 0; x < count; ++x)
					list->Add(gcnew Shape(shapes[x]));

				return list;
			}

			static property bool PositionCorrection
			{
				bool get()
				{
					return b2World::s_enablePositionCorrection == 1;
				}

				void set(bool value)
				{
					b2World::s_enablePositionCorrection = value ? 1 : 0;
				}
			}

			static property bool WarmStarting
			{
				bool get()
				{
					return b2World::s_enableWarmStarting == 1;
				}

				void set(bool value)
				{
					b2World::s_enableWarmStarting = value ? 1 : 0;
				}
			}
		};
	}
}

/*
class b2World
{
public:
	// Register a world listener to receive important events that can
	// help prevent your code from crashing.
	void SetListener(b2WorldListener* listener);

	// Register a collision filter to provide specific control over collision.
	// Otherwise the default filter is used (b2CollisionFilter).
	void SetFilter(b2CollisionFilter* filter);
*/
