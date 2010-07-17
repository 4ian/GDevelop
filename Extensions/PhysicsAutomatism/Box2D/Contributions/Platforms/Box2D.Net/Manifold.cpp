#pragma once

#include "stdafx.h"
#include "Vector.cpp"
//#include "ContactPoint.cpp"
#include "ManifoldPoint.cpp"

using namespace System::Collections::Generic;

namespace Box2D
{
	namespace Net
	{
		public ref class Manifold
		{
		internal:
			b2Manifold *fold;
			Manifold(b2Manifold *foldRef) : fold(foldRef) { }
		
		public:
			property Vector^ Normal
			{
				Vector^ get()
				{
					return gcnew Vector(fold->normal);
				}
			}

			property IList<ManifoldPoint^ >^ Points
			{
				IList<ManifoldPoint^ >^ get()
				{
					//TODO: implement
					List<ManifoldPoint^>^ list = gcnew List<ManifoldPoint^>;

					for(int x = 0; x < fold->pointCount; ++x)
						list->Add(gcnew ManifoldPoint(&fold->points[x]));

					return list;
				}
			}		
		};
	}
}
