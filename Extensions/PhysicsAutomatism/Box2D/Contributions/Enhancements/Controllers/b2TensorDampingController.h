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

#ifndef B2_TENSORDAMPINGCONTROLLER_H
#define B2_TENSORDAMPINGCONTROLLER_H

#include "b2Controller.h"

class b2TensorDampingControllerDef;

/// Applies top down linear damping to the controlled bodies
/// The damping is calculated by multiplying velocity by a matrix in local co-ordinates.
class b2TensorDampingController : public b2Controller{
public:
	/// Tensor to use in damping model
	b2Mat22 T;
	/*Some examples (matrixes in format (row1; row2) )
	(-a 0;0 -a)		Standard isotropic damping with strength a
	(0 a;-a 0)		Electron in fixed field - a force at right angles to velocity with proportional magnitude
	(-a 0;0 -b)		Differing x and y damping. Useful e.g. for top-down wheels.
	*/
	//By the way, tensor in this case just means matrix, don't let the terminology get you down.

	/// Set this to a positive number to clamp the maximum amount of damping done.
	float32 maxTimestep;
	// Typically one wants maxTimestep to be 1/(max eigenvalue of T), so that damping will never cause something to reverse direction

	/// @see b2Controller::Step
	void Step(const b2TimeStep& step);

protected:
	void Destroy(b2BlockAllocator* allocator);

private:
	friend class b2TensorDampingControllerDef;
	b2TensorDampingController(const b2TensorDampingControllerDef* def);

};

/// This class is used to build tensor damping controllers
class b2TensorDampingControllerDef : public b2ControllerDef
{
public:
	/// Tensor to use in damping model
	b2Mat22 T;
	/// Set this to a positive number to clamp the maximum amount of damping done.
	float32 maxTimestep;
	/// Sets damping independantly along the x and y axes
	void SetAxisAligned(float32 xDamping,float32 yDamping);
private:
	b2TensorDampingController* Create(b2BlockAllocator* allocator) const;
};

#endif
