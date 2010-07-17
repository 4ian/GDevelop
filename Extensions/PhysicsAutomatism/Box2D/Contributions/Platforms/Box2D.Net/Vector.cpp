#pragma once

#include "Stdafx.h"

namespace Box2D
{
	namespace Net
	{
		public ref class Vector
		{
		internal:
			b2Vec2 getVec2()
			{
				return b2Vec2(X, Y);
			}

		public:

			//TODO: this needs to be read only outside the class,
			//because if you have a vector as a get property, and
			//try to set the X,Y components, it won't take to the
			//original vector:
			//
			//ie: Shape.Extents.X += 10;
			//won't behave like you think it should (or will it?)
			float32 X, Y;

			Vector() : X(0), Y(0) { }
			Vector(float32 x, float32 y) : X(x), Y(y) { }
			Vector(Vector^ other) : X(other->X), Y(other->Y) { }
			Vector(const b2Vec2 &other) : X(other.x), Y(other.y) { }

			/*
			Vector^ Set(float32 x, float32 y)
			{
				X = x;
				Y = y;
				return this;
			}
			*/
			
			///Defines basic vector addition
			static Vector^ operator +(Vector^ a, Vector^ b)
			{
				return gcnew Vector(a->X + b->X, a->Y + b->Y);
			}
			
			///<summary>Negates a vector (that is, returns (-X, -Y)</summary>
			static Vector^ operator - (Vector^ a)
			{
				return gcnew Vector(-a->X, -a->Y);
			}

			///<summary>Defines basic vector subtraction</summary>
			static Vector^ operator - (Vector^ a, Vector^ b)
			{
				return gcnew Vector(a->X - b->X, a->Y - b->Y);
			}
			
			///<summary>Scalar multiplication for a vector</summary>
			static Vector^ operator * (Vector^ a, float32 b)
			{
				return gcnew Vector(a->X * b, a->Y * b);
			}

			/*
			static Vector^ operator = (Vector^ a, Vector^ b)
			{
				a.X = b.X;
				a.Y = b.Y;
			}
			*/

			///<summary>Returns a string representation of this vector</summary>
			virtual System::String^ ToString() override
			{
				return gcnew System::String("<" + X + ", " + Y + ">");
			}
		};
	}
}
