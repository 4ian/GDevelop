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


#include "Extensions/Zones/SPK_Sphere.h"
#include "Core/SPK_Particle.h"

namespace SPK
{
	Sphere::Sphere(const Vector3D& position,float radius) :
		Zone(position)
	{
		setRadius(radius);
	}

	void Sphere::generatePosition(Particle& particle,bool full) const
	{
		do particle.position() = Vector3D(random(-radius,radius),random(-radius,radius),random(-radius,radius));
		while (particle.position().getSqrNorm() > radius * radius);

		if ((!full)&&(radius > 0.0f))
			particle.position() *= radius / particle.position().getNorm();

		particle.position() += getTransformedPosition();
	}

	bool Sphere::contains(const Vector3D& v) const
	{
		return getSqrDist(getTransformedPosition(),v) <= radius * radius;
	}

	bool Sphere::intersects(const Vector3D& v0,const Vector3D& v1,Vector3D* intersection,Vector3D* normal) const
	{
		float r2 = radius * radius;
		float dist0 = getSqrDist(getTransformedPosition(),v0);
		float dist1 = getSqrDist(getTransformedPosition(),v1);

		if ((dist0 <= r2) == (dist1 <= r2))
			return false;

		if (intersection != NULL)
		{
			Vector3D vDir = v1 - v0;
			float norm = vDir.getNorm();

			float d = dotProduct(vDir,getTransformedPosition() - v0) / norm;
			float a = std::sqrt(r2 - dist0 + d * d);

			float ti;
			if (dist0 <= r2)
				ti = d - a;
			else
				ti = d + a;

			ti /= norm;

			if (ti < 0.0f) ti = 0.0f;
			if (ti > 1.0f) ti = 1.0f;

			norm *= ti;
			ti = norm < APPROXIMATION_VALUE ? 0.0f : ti * (norm - APPROXIMATION_VALUE) / norm;

			vDir *= ti;
			*intersection = v0 + vDir;

			if (normal != NULL)
			{
				if (dist0 <= r2)
					*normal = getTransformedPosition() - *intersection;
				else
					*normal = *intersection - getTransformedPosition();
				normal->normalize();
			}
		}

		return true;
	}

	void Sphere::moveAtBorder(Vector3D& v,bool inside) const
	{
		Vector3D vDir = v - getTransformedPosition();
		float norm = vDir.getNorm();

		if (inside)
			vDir *= (radius + APPROXIMATION_VALUE) / norm;
		else
			vDir *= (radius - APPROXIMATION_VALUE) / norm;

		v = getTransformedPosition() + vDir;
	}

	Vector3D Sphere::computeNormal(const Vector3D& point) const
	{
		Vector3D normal(point - getTransformedPosition());
		normalizeOrRandomize(normal);
		return normal;
	}
}
