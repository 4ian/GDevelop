#pragma once

#include "Stdafx.h"
#include "Vector.cpp"

namespace Box2D
{
	namespace Net
	{
		public ref class Matrix
		{
		internal:
			Matrix(const b2Mat22 &matrix) : col1(gcnew Vector(matrix.col1)), col2(gcnew Vector(matrix.col2)) { }
			b2Mat22 getMat22()
			{
				return b2Mat22(col1->getVec2(), col2->getVec2());
			}
		public:
			Vector ^col1, ^col2;

			Matrix() : col1(gcnew Vector()), col2(gcnew Vector()) {}
			Matrix(Vector^ c1, Vector^ c2) : col1(gcnew Vector(c1)), col2(gcnew Vector(c2)) { }
			explicit Matrix(float32 angle)
			{
				Set(angle);
			}

			void Set(Vector^ c1, Vector^ c2)
			{
				col1->X = c1->X;
				col1->Y = c1->Y;

				col2->X = c2->X;
				col2->Y = c2->Y;
			}

			void Set(float32 angle)
			{
				float32 c = cosf(angle), s = sinf(angle);
				col1->X = c; col2->X = -s;
				col1->Y = s; col2->Y = c;
			}

			void SetIdentity()
			{
				col1->X = 1; col2->X = 0;
				col1->Y = 0; col2->Y = 1;
			}

			static Vector^ operator * (Matrix^ mat, Vector^ a)
			{
				return gcnew Vector(b2Mul(mat->getMat22(), a->getVec2()));
			}
		};
	}
}

/*
struct b2Mat22
{
	void SetZero()
	{
		col1.x = 0.0f; col2.x = 0.0f;
		col1.y = 0.0f; col2.y = 0.0f;
	}

	b2Mat22 Invert() const
	{
		float32 a = col1.x, b = col2.x, c = col1.y, d = col2.y;
		b2Mat22 B;
		float32 det = a * d - b * c;
		b2Assert(det != 0.0f);
		det = 1.0f / det;
		B.col1.x =  det * d;	B.col2.x = -det * b;
		B.col1.y = -det * c;	B.col2.y =  det * a;
		return B;
	}

	// Solve A * x = b
	b2Vec2 Solve(const b2Vec2& b) const
	{
		float32 a11 = col1.x, a12 = col2.x, a21 = col1.y, a22 = col2.y;
		float32 det = a11 * a22 - a12 * a21;
		b2Assert(det != 0.0f);
		det = 1.0f / det;
		b2Vec2 x;
		x.x = det * (a22 * b.x - a12 * b.y);
		x.y = det * (a11 * b.y - a21 * b.x);
		return x;
	}

	b2Vec2 col1, col2;
};
*/
