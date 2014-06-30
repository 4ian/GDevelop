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


#include "Extensions/Emitters/SPK_SphericEmitter.h"
#include "Core/SPK_Particle.h"

namespace SPK
{
	const float SphericEmitter::PI = 3.1415926535897932384626433832795f;

	SphericEmitter::SphericEmitter(const Vector3D& direction,float angleA,float angleB) :
		Emitter()
	{
		setDirection(direction);
		setAngles(angleA,angleB);
	}

	void SphericEmitter::setDirection(const Vector3D& direction)
	{
		tDirection = direction;
		computeMatrix();
		this->direction = tDirection; // as tDirection was normalized in computeMatrix()
		notifyForUpdate();
	}

	void SphericEmitter::setAngles(float angleA,float angleB)
	{
		if (angleB < angleA)
			std::swap(angleA,angleB);

		angleA = std::min(2.0f * PI,std::max(0.0f,angleA));
		angleB = std::min(2.0f * PI,std::max(0.0f,angleB));

		angleMin = angleA;
		angleMax = angleB;

		cosAngleMin = std::cos(angleMin * 0.5f);
		cosAngleMax = std::cos(angleMax * 0.5f);
	}

	void SphericEmitter::computeMatrix()
	{
		tDirection.normalize();
		if ((tDirection.x == 0.0f)&&(tDirection.y == 0.0f))
		{
			
			matrix[0] = tDirection.z;
			matrix[1] = 0.0f;
			matrix[2] = 0.0f;
			matrix[3] = 0.0f;
			matrix[4] = tDirection.z;
			matrix[5] = 0.0f;
			matrix[6] = 0.0f;
			matrix[7] = 0.0f;
			matrix[8] = tDirection.z;
		}
		else
		{
			Vector3D axis;
			crossProduct(tDirection,Vector3D(0.0f,0.0f,1.0f),axis);

			float cosA = tDirection.z;
			float sinA = -axis.getNorm();
			axis /= -sinA;

			float x = axis.x;
			float y = axis.y;
			float z = axis.z;

			matrix[0] = x * x + cosA * (1.0f - x * x);
			matrix[1] = x * y * (1.0f - cosA) - z * sinA;
			matrix[2] = tDirection.x;
			matrix[3] = x * y * (1.0f - cosA) + z * sinA;
			matrix[4] = y * y + cosA * (1.0f - y * y);
			matrix[5] = tDirection.y;
			matrix[6] = x * z * (1.0f - cosA) - y * sinA;
			matrix[7] = y * z * (1.0f - cosA) + x * sinA;
			matrix[8] = tDirection.z;
		}
	}

	void SphericEmitter::generateVelocity(Particle& particle,float speed) const
	{
		float a = random(cosAngleMax,cosAngleMin);
		float theta = std::acos(a);
		float phi = random(0.0f,2.0f * PI);

		float sinTheta = std::sin(theta);
		float x = sinTheta * std::cos(phi);
		float y = sinTheta * std::sin(phi);
		float z = std::cos(theta);

		particle.velocity().x = speed * (matrix[0] * x + matrix[1] * y + matrix[2] * z);
		particle.velocity().y = speed * (matrix[3] * x + matrix[4] * y + matrix[5] * z);
		particle.velocity().z = speed * (matrix[6] * x + matrix[7] * y + matrix[8] * z);
	}

	void SphericEmitter::innerUpdateTransform()
	{
		Emitter::innerUpdateTransform();
		transformDir(tDirection,direction);
		computeMatrix();
	}
}
