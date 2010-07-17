#pragma once

#include "stdafx.h"
#include "Vector.cpp"
#include "Matrix.cpp"

namespace Box2D
{
	namespace Net
	{
		public ref class XForm
		{
		internal:
			b2XForm *xform;
			bool DeleteOnDtor;
			XForm(b2XForm *XForm) : xform(XForm), DeleteOnDtor(false) { }
			XForm(b2XForm XForm) : xform(new b2XForm(XForm)), DeleteOnDtor(false) { }
			b2XForm getXForm()
			{
				return *xform;
			}
		public:
			XForm() : xform(new b2XForm()), DeleteOnDtor(true) { }
			~XForm()
			{
				if(DeleteOnDtor)
					delete xform;
			}

			property Vector^ Position
			{
				Vector^ get()
				{
					return gcnew Vector(xform->position);
				}
			}

			property Matrix^ Rotation
			{
				Matrix^ get()
				{
					return gcnew Matrix(xform->R);
				}
			}
		};
	}
}
