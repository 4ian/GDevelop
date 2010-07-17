#pragma once

#include "stdafx.h"
#include "Shape.cpp"
#include "Body.cpp"

namespace Box2D
{
	namespace Net
	{
		Body^ Shape::Body::get()
		{
			return gcnew Box2D::Net::Body(shape->GetBody());
		}
	}
}
