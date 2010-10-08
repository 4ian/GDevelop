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


#include "Extensions/Zones/SPK_Line.h"
#include "Core/SPK_Particle.h"

namespace SPK
{
	Line::Line(const Vector3D& p0,const Vector3D& p1) :
		Zone(Vector3D())
	{
		setBounds(p0,p1);
	}

	void Line::setPosition(const Vector3D& v)
	{
		Vector3D displacement = v - getPosition();
		bounds[0] = tBounds[0] += displacement;
		bounds[1] = tBounds[1] += displacement;
		computeDist();
		Zone::setPosition(v);
	}

	void Line::setBounds(const Vector3D& p0,const Vector3D& p1)
	{
		bounds[0] = tBounds[0] = p0;
		bounds[1] = tBounds[1] = p1;
		computeDist();
		computePosition();
	}

	void Line::pushBound(const Vector3D& bound)
	{
		bounds[0] = tBounds[0] = bounds[1];
		bounds[1] = tBounds[1] = bound;
		computeDist();
		computePosition();
	}

	void Line::generatePosition(Particle& particle,bool full) const
	{
		float ratio = random(0.0f,1.0f);
		particle.position() = tBounds[0] + tDist * ratio;
	}

	Vector3D Line::computeNormal(const Vector3D& point) const
	{
		float d = -dotProduct(tDist,point);
		float sqrNorm = tDist.getSqrNorm();
		float t = 0.0f;
		if (sqrNorm > 0.0f)
		{
			t = -(dotProduct(tDist,tBounds[0]) + d) / sqrNorm;
			// t is clamped to the segment
			if (t < 0.0f) t = 0.0f;
			else if (t > 1.0f) t = 1.0f;
		}

		Vector3D normal = point;
		normal -= tBounds[0] + t * tDist;

		normalizeOrRandomize(normal);
		return normal;
	}

	void Line::innerUpdateTransform()
	{
		Zone::innerUpdateTransform();
		transformPos(tBounds[0],bounds[0]);
		transformPos(tBounds[1],bounds[1]);
		computeDist();
	}
}
