/*
* Copyright (c) 2006-2009 Erin Catto http://www.gphysics.com
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

#ifndef B2_BUOYANCYCONTROLLER_H
#define B2_BUOYANCYCONTROLLER_H

#include "b2Controller.h"

class b2BuoyancyControllerDef;

/// Calculates buoyancy forces for fluids in the form of a half plane.
class b2BuoyancyController : public b2Controller{
public:
	/// The outer surface normal
	b2Vec2 normal;
	/// The height of the fluid surface along the normal
	float32 offset;
	/// The fluid density
	float32 density;
	/// Fluid velocity, for drag calculations
	b2Vec2 velocity;
	/// Linear drag co-efficient
	float32 linearDrag;
	/// Linear drag co-efficient
	float32 angularDrag;
	/// If false, bodies are assumed to be uniformly dense, otherwise use the shapes densities
	bool useDensity; //False by default to prevent a gotcha
	/// If true, gravity is taken from the world instead of the gravity parameter.
	bool useWorldGravity;
	/// Gravity vector, if the world's gravity is not used
	b2Vec2 gravity;

	/// @see b2Controller::Step
	void Step(const b2TimeStep& step);

	/// @see b2Controller::Draw
	void Draw(b2DebugDraw *debugDraw);

protected:
	void Destroy(b2BlockAllocator* allocator);

private:
	friend class b2BuoyancyControllerDef;
	b2BuoyancyController(const b2BuoyancyControllerDef* def);
};

/// This class is used to build buoyancy controllers
class b2BuoyancyControllerDef : public b2ControllerDef
{
public:
	/// The outer surface normal
	b2Vec2 normal;
	/// The height of the fluid surface along the normal
	float32 offset;
	/// The fluid density
	float32 density;
	/// Fluid velocity, for drag calculations
	b2Vec2 velocity;
	/// Linear drag co-efficient
	float32 linearDrag;
	/// Linear drag co-efficient
	float32 angularDrag;
	/// If false, bodies are assumed to be uniformly dense, otherwise use the shapes densities
	bool useDensity; //False by default to prevent a gotcha
	/// If true, gravity is taken from the world instead of the gravity parameter.
	bool useWorldGravity;
	/// Gravity vector, if the world's gravity is not used
	b2Vec2 gravity;

	b2BuoyancyControllerDef():
		normal(0,1),
		offset(0),
		density(0),
		velocity(0,0),
		linearDrag(0),
		angularDrag(0),
		useDensity(false),
		useWorldGravity(true),
		gravity(0,0)
	{
	}

private:
	b2BuoyancyController* Create(b2BlockAllocator* allocator) const;
};

#endif
