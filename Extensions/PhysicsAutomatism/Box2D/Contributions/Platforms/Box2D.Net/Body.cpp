#pragma once

#include "Stdafx.h"
#include "Vector.cpp"
#include "Shape.cpp"
#include "ShapeDef.cpp"

namespace Box2D
{
	namespace Net
	{
		/// <summary>
		/// A rigid body. Internal computation are done in terms
		/// of the center of mass position. The center of mass may
		/// be offset from the body's origin.
		/// </summary>
		public ref class Body
		{
		internal:
			b2Body *body;
			Body(b2Body *bodyRef) : body(bodyRef) { }
		public:

			/// <summary>
			/// Set the position of the body's origin and rotation (radians).
			/// This breaks any contacts and wakes the other bodies.
			/// </summary>
			void SetXForm(Vector^ position, float32 rotation)
			{
				body->SetXForm(position->getVec2(), rotation);
			}

			/// <summary>
			/// Get the position of the body's origin. The body's origin does not
			/// necessarily coincide with the center of mass. It depends on how the
			/// shapes are created.
			/// </summary>
			XForm^ GetXForm()
			{
				return gcnew XForm(body->GetXForm());
			}

			///<summary>Accesses the linear velocity of the center of mass.</summary>
			property Vector^ LinearVelocity
			{
				Vector^ get()
				{
					return gcnew Vector(body->GetLinearVelocity());
				}

				void set(Vector^ value)
				{
					body->SetLinearVelocity(value->getVec2());
				}
			}

			///<summary>Accesses the angular velocity.</summary>
			property float32 AngularVelocity
			{
				float32 get()
				{
					return body->GetAngularVelocity();
				}

				void set(float32 value)
				{
					body->SetAngularVelocity(value);
				}
			}
			
			///<summary> Apply a force at a world point. Additive. </summary>
			void ApplyForce(Vector^ Force, Vector^ Point)
			{
				body->ApplyForce(Force->getVec2(), Point->getVec2());
			}
			
			///<summary> Apply a torque.  Additive. </summary>
			void ApplyTorque(float32 Torque)
			{
				body->ApplyTorque(Torque);
			}

			///<summary> Apply an impulse at a point. This immediately modifies the velocity. </summary>
			void ApplyImpulse(Vector^ Impulse, Vector^ Point)
			{
				body->ApplyImpulse(Impulse->getVec2(), Point->getVec2());
			}

			///<summary>Accesses the Mass.</summary>
			property float32 Mass
			{
				float32 get()
				{
					return body->GetMass();
				}
			}

			///<summary>Accesses the Mass.</summary>
			property float32 Inertia
			{
				float32 get()
				{
					return body->GetInertia();
				}
			}

			/// <summary>
			/// Get the world coordinates of a point give the local coordinates
			/// relative to the body's center of mass.
			/// </summary>
			Vector^ GetWorldPoint(Vector^ LocalPoint)
			{
				return gcnew Vector(body->GetWorldPoint(LocalPoint->getVec2()));
			}

			/// <summary>
			/// Get the world coordinates of a vector given the local coordinates.
			/// </summary>
			Vector^ GetWorldVector(Vector^ LocalVector)
			{
				return gcnew Vector(body->GetWorldVector(LocalVector->getVec2()));
			}

			/// <summary>
			/// Returns a local point relative to the center of mass given a world point.
			/// </summary>
			Vector^ GetLocalPoint(Vector^ WorldPoint)
			{
				return gcnew Vector(body->GetLocalPoint(WorldPoint->getVec2()));
			}

			/// <summary>
			/// Returns a local vector given a world vector.
			/// </summary>
			Vector^ GetLocalVector(Vector^ WorldVector)
			{
				return gcnew Vector(body->GetLocalVector(WorldVector->getVec2()));
			}

			///<summary>Is this body static (immovable)</summary>
			property bool Static
			{
				bool get()
				{
					return body->IsStatic();
				}
			}

			///<summary>Is this body frozen</summary>
			property bool Frozen
			{
				bool get()
				{
					return body->IsFrozen();
				}
			}

			///<summary>Is this body sleeping</summary>
			property bool Sleeping
			{
				bool get()
				{
					return body->IsSleeping();
				}
			}

			///<summary>You can disable sleeping on this particular body.</summary>
			property bool AllowSleeping
			{
				bool get()
				{
					return body->IsSleeping();
				}

				void set(bool value)
				{
					body->AllowSleeping(value);
				}
			}

			property bool Bullet
			{
				bool get()
				{
					return body->IsBullet();
				}

				void set(bool value)
				{
					body->SetBullet(value);
				}
			}

			void WakeUp()
			{
				body->WakeUp();
			}

			///<summary> Get the list of all shapes attached to this body.</summary>
			property IList<Shape^>^ Shapes
			{
				IList<Shape^>^ get()
				{
					List<Shape^>^ list = gcnew List<Shape^>();
					for(b2Shape *shape = body->GetShapeList(); shape; shape = shape->GetNext())
						list->Add(gcnew Shape(shape));
	
					return list;
				}
			}

			void CreateShape(ShapeDef^ def)
			{
				body->CreateShape(def->def);
			}

			void DestroyShape(Shape^ shape)
			{
				body->DestroyShape(shape->shape);
			}

			void SetMassFromShapes()
			{
				body->SetMassFromShapes();
			}			

			//TODO:
			//void* GetUserData();
			//const b2Mat22& GetRotationMatrix() const;
		};
	}
}

/*
TODO:

public:	
	// Get the list of all contacts attached to this body.
	b2ContactNode* GetContactList();

	// Get the list of all joints attached to this body.
	b2JointNode* GetJointList();	
*/
