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


#include "Core/SPK_Vector3D.h"

namespace SPK
{
	Vector3D::Vector3D(float x,float y,float z) :
		x(x),
		y(y),
		z(z) {}

	Vector3D& Vector3D::operator+=(const Vector3D& v)
	{
		x += v.x;
		y += v.y;
		z += v.z;
		return *this;
	}

	Vector3D& Vector3D::operator-=(const Vector3D& v)
	{
		x -= v.x;
		y -= v.y;
		z -= v.z;
		return *this;
	}

	Vector3D& Vector3D::operator+=(float f)
	{
		x += f;
		y += f;
		z += f;
		return *this;
	}

	Vector3D& Vector3D::operator-=(float f)
	{
		x -= f;
		y -= f;
		z -= f;
		return *this;
	}

	Vector3D& Vector3D::operator*=(float f)
	{
		x *= f;
		y *= f;
		z *= f;
		return *this;
	}

	Vector3D& Vector3D::operator/=(float f)
	{
		f = 1.0f / f;
		x *= f;
		y *= f;
		z *= f;
		return *this;
	}

	float& Vector3D::operator[](size_t index)
	{
		switch(index)
		{
		case 0 : return x;
		case 1 : return y;
		default : return z;
		}
	}

	const float& Vector3D::operator[](size_t index) const
	{
		switch(index)
		{
		case 0 : return x;
		case 1 : return y;
		default : return z;
		}
	}

	void Vector3D::set(float x,float y,float z)
	{
		this->x = x;
		this->y = y;
		this->z = z;
	}

	bool Vector3D::normalize()
	{
		float norm = getNorm();
		if (norm != 0.0f)
		{
			x /= norm;
			y /= norm;
			z /= norm;
			return true;
		}
		return false;
	}

	void Vector3D::revert()
	{
		x = -x;
		y = -y;
		z = -z;
	}

	void Vector3D::abs()
	{
		if (x < 0.0f) x = -x;
		if (y < 0.0f) y = -y;
		if (z < 0.0f) z = -z;
	}

	void Vector3D::crossProduct(const Vector3D& v)
	{
		Vector3D result;

		result.x = y * v.z - z * v.y;
		result.y = z * v.x - x * v.z;
		result.z = x * v.y - y * v.x;

		*this = result;
	}

	float getSqrDist(const Vector3D& v0,const Vector3D& v1)
	{
		float dx = v0.x - v1.x;
		float dy = v0.y - v1.y;
		float dz = v0.z - v1.z;

		return dx * dx + dy * dy + dz * dz;
	}

	float getDist(const Vector3D& v0,const Vector3D& v1)
	{
		return std::sqrt(getSqrDist(v0,v1));
	}

	Vector3D crossProduct(const Vector3D& v0,const Vector3D& v1)
	{
		Vector3D result;

		result.x = v0.y * v1.z - v0.z * v1.y;
		result.y = v0.z * v1.x - v0.x * v1.z;
		result.z = v0.x * v1.y - v0.y * v1.x;

		return result;
	}

	void crossProduct(const Vector3D& v0,const Vector3D& v1,Vector3D& result)
	{
		result.x = v0.y * v1.z - v0.z * v1.y;
		result.y = v0.z * v1.x - v0.x * v1.z;
		result.z = v0.x * v1.y - v0.y * v1.x;
	}
}
