#pragma once

#include "stdafx.h"
#include "Vector.cpp"

namespace Box2D
{
	namespace Net
	{
		public ref class AABB
		{
		public:
			Vector ^lowerBound, ^upperBound;

			bool IsValid()
			{
				return getAABB().IsValid();
			}

			AABB(Vector^ min, Vector^ max) : lowerBound(gcnew Vector(min)), upperBound(gcnew Vector(max)) { }
			AABB() : lowerBound(gcnew Vector()), upperBound(gcnew Vector()) { }

			b2AABB getAABB()
			{
				b2AABB returnme;
				returnme.lowerBound = lowerBound->getVec2();
				returnme.upperBound = upperBound->getVec2();
				return returnme;
			}
		};
	}
}
