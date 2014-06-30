//////////////////////////////////////////////////////////////////////////////////
// SPARK particle engine														//
// Copyright (C) 2008-2009 - Julien Fryer - julienfryer@gmail.com				//
//																				//
// This software is provided 'as-is', without any express or implied			//
// warranty.  In no event will the authors be held liable for any damages		//
// arising from the use of this software.										//
//																				//
// Permission is granted to anyone to use this software for any purpose,		//
// including commercial applications, and to alter it and redistribute it		//
// freely, subject to the following restrictions:								//
//																				//
// 1. The origin of this software must not be misrepresented; you must not		//
//    claim that you wrote the original software. If you use this software		//
//    in a product, an acknowledgment in the product documentation would be		//
//    appreciated but is not required.											//
// 2. Altered source versions must be plainly marked as such, and must not be	//
//    misrepresented as being the original software.							//
// 3. This notice may not be removed or altered from any source distribution.	//
//////////////////////////////////////////////////////////////////////////////////


#include "Core/SPK_Transformable.h"
#include "Core/SPK_Zone.h"

namespace SPK
{
	const float Transformable::IDENTITY[] = 
	{
		1.0f,	0.0f,	0.0f,	0.0f,
		0.0f,	1.0f,	0.0f,	0.0f,
		0.0f,	0.0f,	1.0f,	0.0f,
		0.0f,	0.0f,	0.0f,	1.0f,
	};

	Transformable::Transformable() :
		currentUpdate(0),
		lastUpdate(0),
		lastParentUpdate(0),
		parent(NULL),
		localIdentity(true)
	{
		std::memcpy(local,IDENTITY,sizeof(float) * TRANSFORM_LENGTH);
		std::memcpy(world,IDENTITY,sizeof(float) * TRANSFORM_LENGTH);
	}

	Transformable::Transformable(const Transformable& transformable) :
		currentUpdate(0),
		lastUpdate(0),
		lastParentUpdate(0),
		parent(NULL),
		localIdentity(transformable.localIdentity)
	{
		std::memcpy(local,transformable.local,sizeof(float) * TRANSFORM_LENGTH);
		std::memcpy(world,transformable.world,sizeof(float) * TRANSFORM_LENGTH);
	}

	void Transformable::setTransformNC(const float* transform)
	{
		for (size_t i = 0; i < TRANSFORM_LENGTH; ++i)
			local[i] = transform[(i >> 2) + ((i & 3) << 2)];	// conversion
		
		localIdentity = false;
		notifyForUpdate();
	}

	void Transformable::setTransformPosition(const Vector3D& pos)
	{
		local[12] = pos.x;
		local[13] = pos.y;
		local[14] = pos.z;

		localIdentity = false;
		notifyForUpdate();
	}

	void Transformable::setTransformOrientationRH(Vector3D look,Vector3D up)
	{
		look.normalize();
		up.normalize();

		Vector3D side = crossProduct(look,up);
		side.normalize();

		up = crossProduct(side,look);

		local[0] = side.x;
		local[1] = side.y;
		local[2] = side.z;
		local[4] = up.x;
		local[5] = up.y;
		local[6] = up.z;
		local[8] = -look.x;
		local[9] = -look.y;
		local[10] = -look.z;

		localIdentity = false;
		notifyForUpdate();
	}

	void Transformable::setTransformOrientationLH(Vector3D look,Vector3D up)
	{
		look.normalize();

		Vector3D side = crossProduct(look,up);
		side.normalize();

		up = crossProduct(side,look);

		local[0] = side.x;
		local[1] = side.y;
		local[2] = side.z;
		local[4] = up.x;
		local[5] = up.y;
		local[6] = up.z;
		local[8] = look.x;
		local[9] = look.y;
		local[10] = look.z;

		localIdentity = false;
		notifyForUpdate();
	}

	void Transformable::setTransformOrientation(Vector3D axis,float angle)
	{
		axis.normalize();
		float c = std::cos(angle);
		float s = std::sin(angle);
		float a = 1 - c;
		Vector3D axis2(axis.x * axis.x,axis.y * axis.y,axis.z * axis.z);

		local[0] = axis2.x + (1 - axis2.x) * c;
		local[1] = axis.x * axis.y * a + axis.z * s;
		local[2] = axis.x * axis.z * a - axis.y * s;
		local[4] = axis.x * axis.y * a - axis.z * s;
		local[5] = axis2.y + (1 - axis2.y) * c;
		local[6] = axis.y * axis.z * a + axis.x * s;
		local[8] = axis.x * axis.z * a + axis.y * s;
		local[9] = axis.y * axis.z * a - axis.x * s;
		local[10] = axis2.z + (1 - axis2.z) * c;

		localIdentity = false;
		notifyForUpdate();
	}

	void Transformable::setTransformOrientationX(float angle)
	{
		float cosA = std::cos(angle);
		float sinA = std::sin(angle);

		local[0] = 1.0f;
		local[1] = 0.0f;
		local[2] = 0.0f;
		local[4] = 0.0f;
		local[5] = cosA;
		local[6] = sinA;
		local[8] = 0.0f;
		local[9] = -sinA;
		local[10] = cosA;

		localIdentity = false;
		notifyForUpdate();
	}

	void Transformable::setTransformOrientationY(float angle)
	{
		float cosA = std::cos(angle);
		float sinA = std::sin(angle);

		local[0] = cosA;
		local[1] = 0.0f;
		local[2] = -sinA;
		local[4] = 0.0f;
		local[5] = 1.0f;
		local[6] = 0.0f;
		local[8] = sinA;
		local[9] = 0.0f;
		local[10] = cosA;

		localIdentity = false;
		notifyForUpdate();
	}

	void Transformable::setTransformOrientationZ(float angle)
	{
		float cosA = std::cos(angle);
		float sinA = std::sin(angle);

		local[0] = cosA;
		local[1] = sinA;
		local[2] = 0.0f;
		local[4] = -sinA;
		local[5] = cosA;
		local[6] = 0.0f;
		local[8] = 0.0f;
		local[9] = 0.0f;
		local[10] = 1.0f;

		localIdentity = false;
		notifyForUpdate();
	}

	void Transformable::updateTransform(const Transformable* parent)
	{
		if (isUpdateNotified() ||											// the local transform or instance param have been updated
			parent != this->parent ||										// the parent has changed
			(parent != NULL && lastParentUpdate != parent->currentUpdate))	// the parent transform has been modified
		{
			if (parent == NULL)
				std::memcpy(world,local,sizeof(float) * TRANSFORM_LENGTH);
			else if (isLocalIdentity())
			{
				std::memcpy(world,parent->world,sizeof(float) * TRANSFORM_LENGTH);
				lastParentUpdate = parent->lastUpdate;
			}
			else
			{
				multiply(world,parent->world,local);
				lastParentUpdate = parent->lastUpdate;
			}

			this->parent = parent;
			lastUpdate = ++currentUpdate;
			innerUpdateTransform();
		}

		propagateUpdateTransform();
	}

	void Transformable::transformPos(Vector3D& tPos,const Vector3D& pos)
	{
		multiply(tPos,pos,world);
	}

	void Transformable::transformDir(Vector3D& tDir,const Vector3D& dir)
	{
		rotate(tDir,dir,world); // To transform a direction, the translation is ignored
	}
}
