#pragma once

#include "stdafx.h"
#include "Joint.cpp"
#include "JointDef.cpp"

namespace Box2D
{
	namespace Net
	{
		public ref class RevoluteJointDef : public JointDef
		{
		public:
			RevoluteJointDef() : JointDef(new b2RevoluteJointDef()) { }

			property Vector^ LocalAnchor1
			{
				Vector^ get()
				{
					return gcnew Vector(reinterpret_cast<b2RevoluteJointDef *>(def)->localAnchor1);
				}

				void set(Vector^ value)
				{
					reinterpret_cast<b2RevoluteJointDef *>(def)->localAnchor1 = value->getVec2();
				}
			}

			property Vector^ LocalAnchor2
			{
				Vector^ get()
				{
					return gcnew Vector(reinterpret_cast<b2RevoluteJointDef *>(def)->localAnchor2);
				}

				void set(Vector^ value)
				{
					reinterpret_cast<b2RevoluteJointDef *>(def)->localAnchor2 = value->getVec2();
				}
			}

			property float32 LowerAngle
			{
				float32 get()
				{
					return reinterpret_cast<b2RevoluteJointDef *>(def)->lowerAngle;
				}

				void set(float32 value)
				{
					reinterpret_cast<b2RevoluteJointDef *>(def)->lowerAngle = value;
				}
			}

			property float32 UpperAngle
			{
				float32 get()
				{
					return reinterpret_cast<b2RevoluteJointDef *>(def)->upperAngle;
				}

				void set(float32 value)
				{
					reinterpret_cast<b2RevoluteJointDef *>(def)->upperAngle = value;
				}
			}

			property float32 MotorTorque
			{
				float32 get()
				{
					return reinterpret_cast<b2RevoluteJointDef *>(def)->maxMotorTorque;
				}

				void set(float32 value)
				{
					reinterpret_cast<b2RevoluteJointDef *>(def)->maxMotorTorque = value;
				}
			}

			property float32 MotorSpeed
			{
				float32 get()
				{
					return reinterpret_cast<b2RevoluteJointDef *>(def)->motorSpeed;
				}

				void set(float32 value)
				{
					reinterpret_cast<b2RevoluteJointDef *>(def)->motorSpeed = value;
				}
			}

			property bool EnableLimit
			{
				bool get()
				{
					return reinterpret_cast<b2RevoluteJointDef *>(def)->enableLimit;
				}

				void set(bool value)
				{
					reinterpret_cast<b2RevoluteJointDef *>(def)->enableLimit = value;
				}
			}

			property bool EnableMotor
			{
				bool get()
				{
					return reinterpret_cast<b2RevoluteJointDef *>(def)->enableMotor;
				}

				void set(bool value)
				{
					reinterpret_cast<b2RevoluteJointDef *>(def)->enableMotor = value;
				}
			}
			
			void Initialize(Body^ body1, Body^ body2, Vector^ Anchor)
			{
				reinterpret_cast<b2RevoluteJointDef*>(def)->Initialize(body1->body, body2->body, Anchor->getVec2());
			}
		};

		public ref class RevoluteJoint : public Joint
		{
		internal:
			RevoluteJoint(b2RevoluteJoint *jointRef) : Joint(jointRef) { }

		public:
			property Vector^ Anchor1
			{
				Vector^ get()
				{
					return gcnew Vector(reinterpret_cast<b2RevoluteJoint*>(joint)->GetAnchor1());
				}
			}

			property Vector^ Anchor2
			{
				Vector^ get()
				{
					return gcnew Vector(reinterpret_cast<b2RevoluteJoint*>(joint)->GetAnchor2());
				}
			}

			Vector^ GetReactionForce()
			{
				return gcnew Vector(reinterpret_cast<b2RevoluteJoint*>(joint)->GetReactionForce());
			}

			float32 GetReactionTorque()
			{
				return (reinterpret_cast<b2RevoluteJoint*>(joint)->GetReactionTorque());
			}

			property float32 JointAngle
			{
				float32 get()
				{
					return (reinterpret_cast<b2RevoluteJoint*>(joint)->GetJointAngle());
				}
			}

			property float32 JointSpeed
			{
				float32 get()
				{
					return (reinterpret_cast<b2RevoluteJoint*>(joint)->GetJointSpeed());
				}
			}

			float32 GetMotorTorque()
			{
				return reinterpret_cast<b2RevoluteJoint*>(joint)->GetMotorTorque();
			}

			void SetMotorSpeed(float32 speed)
			{
				reinterpret_cast<b2RevoluteJoint*>(joint)->SetMotorSpeed(speed);
			}

			void SetMotorTorque(float32 torque)
			{
				reinterpret_cast<b2RevoluteJoint*>(joint)->SetMaxMotorTorque(torque);
			}
		};
	}
}
