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


#include "Extensions/Zones/SPK_AABox.h"
#include "Core/SPK_Particle.h"

namespace SPK
{
	AABox::AABox(const Vector3D& position,const Vector3D& dimension) :
		Zone(position)
	{
		setDimension(dimension);
	}

	void AABox::setDimension(const Vector3D& dimension)
	{
		this->dimension.set(std::max(0.0f,dimension.x),std::max(0.0f,dimension.y),std::max(0.0f,dimension.z));
	}

	void AABox::generatePosition(Particle& particle,bool full) const
	{
		particle.position().x = getTransformedPosition().x + random(-dimension.x * 0.5f,dimension.x * 0.5f);
		particle.position().y = getTransformedPosition().y + random(-dimension.y * 0.5f,dimension.y * 0.5f);
		particle.position().z = getTransformedPosition().z + random(-dimension.z * 0.5f,dimension.z * 0.5f);

		if (!full)
		{
			int axis = random(0,3);
			int sens = (random(0,2) << 1) - 1;

			switch(axis)
			{
			case 0 :
				particle.position().x = getTransformedPosition().x + sens * dimension.x * 0.5f;
				break;
			case 1 :
				particle.position().y = getTransformedPosition().y + sens * dimension.y * 0.5f;
				break;
			default :
				particle.position().z = getTransformedPosition().z + sens * dimension.z * 0.5f;
				break;
			}
		}
	}

	bool AABox::contains(const Vector3D& v) const
	{
		if ((v.x >= getTransformedPosition().x - dimension.x * 0.5f)&&(v.x <= getTransformedPosition().x + dimension.x * 0.5f)
			&&(v.y >= getTransformedPosition().y - dimension.y * 0.5f)&&(v.y <= getTransformedPosition().y + dimension.y * 0.5f)
			&&(v.z >= getTransformedPosition().z - dimension.z * 0.5f)&&(v.z <= getTransformedPosition().z + dimension.z * 0.5f))
			return true;

		return false;
	}

	bool AABox::intersects(const Vector3D& v0,const Vector3D& v1,Vector3D* intersection,Vector3D* normal) const
	{
		float tEnter = 0.0f;
		float tExit = 1.0f;

		int axis = 0;

		if (!slabIntersects(v0.x,v1.x,getTransformedPosition().x - dimension.x * 0.5f,getTransformedPosition().x + dimension.x * 0.5f,tEnter,tExit,axis,0))
			return false;

		if (!slabIntersects(v0.y,v1.y,getTransformedPosition().y - dimension.y * 0.5f,getTransformedPosition().y + dimension.y * 0.5f,tEnter,tExit,axis,1))
			return false;

		if (!slabIntersects(v0.z,v1.z,getTransformedPosition().z - dimension.z * 0.5f,getTransformedPosition().z + dimension.z * 0.5f,tEnter,tExit,axis,2))
			return false;

		if ((tEnter <= 0.0f)&&(tExit >= 1.0f))
			return false;

		if (intersection != NULL)
		{
			if (tEnter <= 0.0f)
			{
				tEnter = tExit;
				axis = (axis & 0xF0) >> 4;
			}
			else
				axis &= 0x0F;

			Vector3D vDir = v1 - v0;
			float norm = vDir.getNorm() * tEnter;
			tEnter = norm < APPROXIMATION_VALUE ? 0.0f : tEnter * (norm - APPROXIMATION_VALUE) / norm;

			vDir *= tEnter;
			*intersection = v0 + vDir;

			if (normal != NULL)
			{
				switch(axis)
				{
				case 0 :
					*normal = Vector3D(-1.0f,0.0f,0.0f);
					break;
				case 1 :
					*normal = Vector3D(0.0f,-1.0f,0.0f);
					break;
				case 2 :
					*normal = Vector3D(0.0f,0.0f,-1.0f);
					break;
				case 3 :
					*normal = Vector3D(1.0f,0.0f,0.0f);
					break;
				case 4 :
					*normal = Vector3D(0.0f,1.0f,0.0f);
					break;
				case 5 :
					*normal = Vector3D(0.0f,0.0f,1.0f);
					break;
				}
			}
		}

		return true;
	}

	void AABox::moveAtBorder(Vector3D& v,bool inside) const
	{
		if (inside)
		{
			Vector3D rayEnd(v - getTransformedPosition());
			float maxDim = getTransformedPosition().x + getTransformedPosition().y + getTransformedPosition().z;
			rayEnd *= maxDim * maxDim / rayEnd.getSqrNorm();
			intersects(getTransformedPosition() + rayEnd,getTransformedPosition(),&v,NULL);
		}
		else
			intersects(getTransformedPosition(),v,&v,NULL);
	}

	Vector3D AABox::computeNormal(const Vector3D& point) const
	{
		// TO DO
		Vector3D normal(point - getTransformedPosition());
		normalizeOrRandomize(normal);
		return normal;
	}
}
