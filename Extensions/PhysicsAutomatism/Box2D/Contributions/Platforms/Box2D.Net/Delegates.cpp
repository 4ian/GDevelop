#pragma once

#include "stdafx.h"
#include "Joint.cpp"
#include "Body.cpp"

namespace Box2D
{
	namespace Net
	{
		/// <summary>
		/// If a body is destroyed, then any joints attached to it are also destroyed.
		/// This prevents memory leaks, but you may unexpectedly be left with an
		/// orphaned joint pointer.
		/// Box2D will notify you when a joint is implicitly destroyed.
		/// It is NOT called if you directly destroy a joint.
		/// DO NOT modify the Box2D world inside this callback.
		/// </summary>
		public delegate void NotifyJointDestroyed(Joint);
		
		/// <summary>
		/// Return true if collision calculations should be performed between shape1 and shape2
		/// Box2D has a default implementation for this, so only add a new delegate if you
		/// want to override the default behavior.
		/// </summary>
		public delegate bool CollisionFilter(Shape shape1, Shape shape2);
	}
}
