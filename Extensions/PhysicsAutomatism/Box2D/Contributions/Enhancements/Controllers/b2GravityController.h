/*
* Copyright (c) 2006-2007 Erin Catto http://www.gphysics.com
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

#ifndef B2_GRAVITYCONTROLLER_H
#define B2_GRAVITYCONTROLLER_H

#include "b2Controller.h"

class b2GravityControllerDef;

/// Applies simplified gravity between every pair of bodies
class b2GravityController : public b2Controller{
public:
	/// Specifies the strength of the gravitiation force
	float32 G;
	/// If true, gravity is proportional to r^-2, otherwise r^-1
	bool invSqr;

	/// @see b2Controller::Step
	void Step(const b2TimeStep& step);

protected:
	void Destroy(b2BlockAllocator* allocator);

private:
	friend class b2GravityControllerDef;
	b2GravityController(const b2GravityControllerDef* def);


};

/// This class is used to build gravity controllers
class b2GravityControllerDef : public b2ControllerDef
{
public:
	/// Specifies the strength of the gravitiation force
	float32 G;
	/// If true, gravity is proportional to r^-2, otherwise r^-1
	bool invSqr;
private:
	b2GravityController* Create(b2BlockAllocator* allocator) const;
};

#endif
