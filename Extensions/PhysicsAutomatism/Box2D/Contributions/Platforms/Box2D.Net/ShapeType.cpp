#pragma once

#include "stdafx.h"

namespace Box2D
{
	namespace Net
	{
		//TODO: is there a way to auto incorporate shape types?
		public enum class ShapeType
		{
			e_unknownShape = ::e_unknownShape,
			e_circleShape = ::e_circleShape,
			e_polygonShape = ::e_polygonShape,
			e_shapeTypeCount = ::e_shapeTypeCount
		};
	}
}
