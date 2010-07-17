#pragma once

#include "stdafx.h"
#include "Vector.cpp"

namespace Box2D
{
	namespace Net
	{
		//TODO: is this class really necessary for the public interface?
		public ref class ManifoldPoint
		{
		internal:
			b2ManifoldPoint *point;
			ManifoldPoint(b2ManifoldPoint *pointRef) : point(pointRef) { }
		public:

			property Vector^ LocalPoint1
			{
				Vector^ get()
				{
					return gcnew Vector(point->localPoint1);
				}

				void set(Vector^ value)
				{
					point->localPoint1 = value->getVec2();
				}
			}

			property Vector^ LocalPoint2
			{
				Vector^ get()
				{
					return gcnew Vector(point->localPoint2);
				}

				void set(Vector^ value)
				{
					point->localPoint2 = value->getVec2();
				}
			}

			property float32 Separation
			{
				float32 get()
				{
					return point->separation;
				}

				void set(float32 value)
				{
					point->separation = value;
				}
			}

			property float32 NormalForce
			{
				float32 get()
				{
					return point->normalForce;
				}

				void set(float32 value)
				{
					point->normalForce = value;
				}
			}

			property float32 TangentForce
			{
				float32 get()
				{
					return point->tangentForce;
				}

				void set(float32 value)
				{
					point->tangentForce = value;
				}
			}

			//TODO: marshall b2ContactID
			/*
			property b2ContactID ID
			{
				b2ContactID get()
				{
					return point->id;
				}

				void set(b2ContactID value)
				{
					point->id = value;
				}
			}
			*/
		};
	}
}
