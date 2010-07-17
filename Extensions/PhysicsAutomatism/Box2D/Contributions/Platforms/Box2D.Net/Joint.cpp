#pragma once

#include "stdafx.h"
#include "Body.cpp"
#include "JointDef.cpp"

namespace Box2D
{
	namespace Net
	{
		public ref class Joint
		{
		internal:
			b2Joint *joint;
			Joint(b2Joint *jointRef) : joint(jointRef) { }
		public:

			property JointType JointType
			{
				Box2D::Net::JointType get()
				{
					return (Box2D::Net::JointType) joint->GetType();
				}
			}

			property Body^ Body1
			{
				Body^ get()
				{
					return gcnew Body(joint->GetBody1());
				}
			}

			property Body^ Body2
			{
				Body^ get()
				{
					return gcnew Body(joint->GetBody2());
				}
			}

			property Vector^ Anchor1
			{
				Vector^ get()
				{
					return gcnew Vector(joint->GetAnchor1());
				}
			}

			property Vector^ Anchor2
			{
				Vector^ get()
				{
					return gcnew Vector(joint->GetAnchor2());
				}
			}

			Vector^ GetReactionForce()
			{
				return gcnew Vector(joint->GetReactionForce());
			}

			float32 GetReactionTorque()
			{
				return joint->GetReactionTorque();
			}

			Joint^ GetNext()
			{
				return gcnew Joint(joint->GetNext());
			}

			//TODO:
			/*
			void* GetUserData();
			*/
		};

		public ref class MouseJoint : public Joint
		{
		internal:
			b2MouseJoint *mouseJoint;
			MouseJoint(b2MouseJoint *joint) : Joint(joint), mouseJoint(joint) { }
		public:
			MouseJoint(Joint^ joint) : Joint(joint->joint), mouseJoint(0)
			{
				if(joint->JointType == Box2D::Net::JointType::e_mouseJoint &&
					reinterpret_cast<b2MouseJoint *>(joint->joint))
				{
					mouseJoint = reinterpret_cast<b2MouseJoint *>(joint->joint);
				}
				else
				{
					throw gcnew System::Exception("Attempting to convert a Joint to a MouseJoint, "
						"but the joint is not a mouse joint.");
				}
			}
			
			void SetTarget(Vector^ Target)
			{
				mouseJoint->SetTarget(Target->getVec2());
			}

		};
	}
}
