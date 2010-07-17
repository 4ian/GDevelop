#pragma once

#include "stdafx.h"
#include "Vector.cpp"
#include "ShapeDef.cpp"

using namespace System::Collections::Generic;

namespace Box2D
{
	namespace Net
	{
		/// The type of body.
		public enum class BodyType
		{
			e_staticBody = ::b2BodyDef::e_staticBody,	///< A static body should not move and has infinite mass.
			e_dynamicBody = ::b2BodyDef::e_dynamicBody	///< A regular moving body.
		};

		public ref class BodyDef
		{
		internal:
			b2BodyDef *def;
			
		public:
			BodyDef() : def(new b2BodyDef()) { }
			virtual ~BodyDef()
			{
				delete def;
			}

			property Vector^ Position
			{
				Vector^ get()
				{
					return gcnew Vector(def->position);
				}

				void set(Vector^ value)
				{
					def->position = value->getVec2();
				}
			}

			property float32 Angle
			{
				float32 get()
				{
					return def->angle;
				}

				void set(float32 value)
				{
					def->angle = value;
				}
			}

			property float32 LinearDamping
			{
				float32 get()
				{
					return def->linearDamping;
				}

				void set(float32 value)
				{
					def->linearDamping = value;
				}
			}

			property float32 AngularDamping
			{
				float32 get()
				{
					return def->angularDamping;
				}

				void set(float32 value)
				{
					def->angularDamping = value;
				}
			}

			property bool AllowSleep
			{
				bool get()
				{
					return def->allowSleep;
				}

				void set(bool value)
				{
					def->allowSleep = value;
				}
			}

			property bool IsBullet
			{
				bool get()
				{
					return def->isBullet;
				}

				void set(bool value)
				{
					def->isBullet = value;
				}
			}

			property bool IsSleeping
			{
				bool get()
				{
					return def->isSleeping;
				}

				void set(bool value)
				{
					def->isSleeping = value;
				}
			}

			property bool FixedRotation
			{
				bool get()
				{
					return def->fixedRotation;
				}

				void set(bool value)
				{
					def->fixedRotation = value;
				}
			}

			property BodyType BodyType
			{
				Box2D::Net::BodyType get()
				{
					return (Box2D::Net::BodyType)def->type;
				}

				void set(Box2D::Net::BodyType value)
				{
					def->type = ((::b2BodyDef::Type)value);
				}
			}

			//TODO:
			/*property Object^ UserData
			{
				Object^ get()
				{
					Object^ ReturnMe;

					System::Runtime::InteropServices::Marshal::PtrToStructure((System::IntPtr)def->userData, ReturnMe);

					return ReturnMe;
				}

				void set(Object^ value)
				{
					def->userData = value;
				}
			}*/
		};
	}
}
