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


#ifndef H_SPK_VECTOR3D
#define H_SPK_VECTOR3D

#include "Core/SPK_DEF.h"


namespace SPK
{
	/**
	* @class Vector3D
	* @brief A triplet of coordinates in 3D
	*
	* This class offers a set of methods to manipulate 3D points/vectors.<br>
	* To make the use of 3D points/vectors easier and more intuitive, some operators are overloaded.<br>
	* Vector3D are the basic primitive used in SPARK to define 3D points/vectors.<br>
	* <br>
	* Note that Vector3D coordinates are accessible directly without any setters or getters.
	*/
	class SPK_PREFIX Vector3D
	{
	public :

		////////////////
		// Parameters //
		////////////////

		float x; /**< @brief x coordinate of the vector */
		float y; /**< @brief y coordinate of the vector */
		float z; /**< @brief z coordinate of the vector */

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor for the Vector3D
		* @param x : x coordinate
		* @param y : y coordinate
		* @param z : z coordinate
		*/
		Vector3D(float x = 0.0f,float y = 0.0f,float z = 0.0f);

		///////////////
		// Operators //
		///////////////

		/**
		* @brief Adds a Vector3D
		*
		* This method performs these operations :<br><i>
		* x += v.x<br>
		* y += v.y<br>
		* z += v.z</i>
		*
		* @param v : the Vector3D to add
		* @return the result Vector3D
		*/
		Vector3D& operator+=(const Vector3D& v);

		/**
		* @brief Substracts a Vector3D
		*
		* This method performs these operations :<br><i>
		* x -= v.x<br>
		* y -= v.y<br>
		* z -= v.z</i>
		*
		* @param v : the Vector3D to substract
		* @return the result Vector3D
		*/
		Vector3D& operator-=(const Vector3D& v);

		/**
		* @brief Adds a floating number
		*
		* This method performs these operations :<br><i>
		* x += f<br>
		* y += f<br>
		* z += f</i>
		*
		* @param f : the number to add
		* @return the result Vector3D
		*/
		Vector3D& operator+=(float f);

		/**
		* @brief Substracts a floating number
		*
		* This method performs these operations :<br><i>
		* x -= f<br>
		* y -= f<br>
		* z -= f</i>
		*
		* @param f : the number to substract
		* @return the result Vector3D
		*/
		Vector3D& operator-=(float f);

		/**
		* @brief Multiplies by a floating number
		*
		* This method performs these operations :<br><i>
		* x *= f<br>
		* y *= f<br>
		* z *= f</i>
		*
		* @param f : the number to multiply the Vector3D by
		* @return the result Vector3D
		*/
		Vector3D& operator*=(float f);

		/**
		* @brief Divides by a floating number
		*
		* This method performs these operations :<br><i>
		* x /= f<br>
		* y /= f<br>
		* z /= f</i>
		*
		* @param f : the number to divide the Vector3D by
		* @return the result Vector3D
		*/
		Vector3D& operator/=(float f);

		/**
		* @brief Unary - operator of Vector3D
		*
		* This method performs that operation :<br><i>
		* return Vector3D(-x,-y,-z)</i>
		*
		* return a Vector3D which is the reverse of this Vector3D
		*/
		Vector3D operator-() const;

		/**
		* @brief Accesses the Vector3D coordinates in an container like fashion
		*
		* <ul>
		* <li>index 0 is X</li>
		* <li>index 1 is Y</li>
		* <li>index 2 is Z</li>
		* </ul>
		* Note that no check for out of bounds index is performed
		*
		* @param index : the index of the coordinate to get (from 0 to 2)
		* @return : the coordinate value at index
		* @since 1.03.00
		*/
		float& operator[](size_t index);

		/**
		* @brief Accesses the Vector3D coordinates in an container like fashion
		*
		* This is the constant version of operator[](size_t)
		*
		* @param index : the index of the coordinate to get (from 0 to 2)
		* @return : the coordinate value at index
		* @since 1.03.00
		*/
		const float& operator[](size_t index) const;

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the values of the Vector3D
		* @param x : x coordinate
		* @param y : y coordinate
		* @param z : z coordinate
		*/
		void set(float x,float y,float z = 0.0f);

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Gets the square norm of the Vector3D
		*
		* the square norm is defined as <i>x * x + y * y + z * z</i>.
		* This method is faster than getNorm() and should be used when possible.
		*
		* @return the square norm of the Vector3D
		*/
		float getSqrNorm() const;

		/**
		* @brief Gets the norm of the Vector3D
		*
		* the norm is defined as <i>sqrt(x * x + y * y + z * z)</i>.
		*
		* @return the norm of the Vector3D
		*/
		float getNorm() const;

		/**
		* @brief Normalizes the Vector3D
		*
		* This method performs these operations :<br><i>
		* x /= |v|<br>
		* y /= |v|<br>
		* z /= |v|<br></i>
		* Note that if the norm is equal to 0, nothing happens and false is returned.
		*
		* @return true if this Vector3D can be normalized, false otherwise
		*/
		bool normalize();

		/**
		* @brief Reverts the Vector3D
		*
		* This method performs these operations :<br><i>
		* x = -x<br>
		* y = -y<br>
		* z = -z</i>
		*/
		void revert();

		/**
		* @brief Sets this Vector3D to its absolute values
		*
		* This method performs these operations :<br><i>
		* x = abs(x)<br>
		* y = abs(y)<br>
		* z = abs(z)</i>
		*
		* @since 1.02.00
		*/
		void abs();

		/**
		* @brief Computes the cross product between v and the vector3D and store the result in the vector3D
		* @param v : the vector3D used to compute the cross product (*this x v)
		*/
		void crossProduct(const Vector3D& v);
	};

	////////////////////////
	// External operators //
	////////////////////////

	/**
	* @brief Adds two Vector3D
	*
	* This function performs these operations :<br><i>
	* result.x = v0.x + v1.x<br>
	* result.y = v0.y + v1.y<br>
	* result.z = v0.z + v1.z</i>
	*
	* @param v0 : the first vector3D
	* @param v1 : the second vector3D
	* @return the result vector3D
	*/
	Vector3D operator+(const Vector3D& v0,const Vector3D& v1);

	/**
	* @brief Substracts two Vector3D
	*
	* This function performs these operations :<br><i>
	* result.x = v0.x - v1.x<br>
	* result.y = v0.y - v1.y<br>
	* result.z = v0.z - v1.z</i>
	*
	* @param v0 : the first vector3D
	* @param v1 : the second vector3D
	* @return the result vector3D
	*/
	Vector3D operator-(const Vector3D& v0,const Vector3D& v1);

	/**
	* @brief Adds a Vector3D and a float
	*
	* This function performs these operations :<br><i>
	* result.x = v.x + f<br>
	* result.y = v.y + f<br>
	* result.z = v.z + f</i>
	*
	* @param v : the vector3D
	* @param f : the floating number
	* @return the result vector3D
	*/
	Vector3D operator+(const Vector3D& v,float f);

	/**
	* @brief Adds a float and a Vector3D
	*
	* This function performs these operations :<br><i>
	* result.x = f + v.x<br>
	* result.y = f + v.y<br>
	* result.z = f + v.z</i>
	*
	* @param f : the floating number
	* @param v : the vector3D
	* @return the result vector3D
	*/
	Vector3D operator+(float f,const Vector3D& v);

	/**
	* @brief Substracts a float to a Vector3D
	*
	* This function performs these operations :<br><i>
	* result.x = v.x - f<br>
	* result.y = v.y - f<br>
	* result.z = v.z - f</i>
	*
	* @param v : the vector3D
	* @param f : the floating number
	* @return the result vector3D
	*/
	Vector3D operator-(const Vector3D& v,float f);

	/**
	* @brief Substracts a Vector3D to a float
	*
	* This function performs these operations :<br><i>
	* result.x = f - v.x<br>
	* result.y = f - v.y<br>
	* result.z = f - v.z</i>
	*
	* @param f : the floating number
	* @param v : the vector3D
	* @return the result vector3D
	*/
	Vector3D operator-(float f,const Vector3D& v);

	/**
	* @brief Multiplies a Vector3D by a float
	*
	* This function performs these operations :<br><i>
	* result.x = v.x * f<br>
	* result.y = v.y * f<br>
	* result.z = v.z * f</i>
	*
	* @param v : the vector3D
	* @param f : the floating number
	* @return the result vector3D
	*/
	Vector3D operator*(const Vector3D& v,float f);

	/**
	* @brief Multiplies a float by a Vector3D
	*
	* This function performs these operations :<br><i>
	* result.x = f * v.x<br>
	* result.y = f * v.y<br>
	* result.z = f * v.z</i>
	*
	* @param f : the floating number
	* @param v : the vector3D
	* @return the result vector3D
	*/
	Vector3D operator*(float f,const Vector3D& v);

	/**
	* @brief Divides a Vector3D by a float
	*
	* This function performs these operations :<br><i>
	* result.x = v.x / f<br>
	* result.y = v.y / f<br>
	* result.z = v.z / f</i>
	*
	* @param v : the vector3D
	* @param f : the floating number
	* @return the result vector3D
	*/
	Vector3D operator/(const Vector3D& v,float f);

	/**
	* @brief Divides a float by a Vector3D
	*
	* This function performs these operations :<br><i>
	* result.x = f / v.x<br>
	* result.y = f / v.y<br>
	* result.z = f / v.z</i>
	*
	* @param f : the floating number
	* @param v : the vector3D
	* @return the result vector3D
	*/
	Vector3D operator/(float f,const Vector3D& v);

	/**
	* @brief Tests whether 2 Vector3D are equal
	* @param v0 : the first Vector3D to compare
	* @param v1 : the second Vector3D to compare
	* @return true if the Vector3D are equal, false if not
	* @since 1.01.01
	*/
	bool operator==(const Vector3D& v0,const Vector3D& v1);

	/**
	* @brief Tests whether 2 Vector3D are different
	* @param v0 : the first Vector3D to compare
	* @param v1 : the second Vector3D to compare
	* @return true if the Vector3D are different, false if not
	* @since 1.01.01
	*/
	bool operator!=(const Vector3D& v0,const Vector3D& v1);

	/**
	* @brief Writes a Vector3D on an output stream
	*
	* The Vector3D is written that way : <i>(x,y,z)</i>
	*
	* @param s : the output stream where to write
	* @param v : the Vector3D to write to the output stream
	* @return the output stream
	* @since 1.01.01
	*/
	std::ostream& operator<<(std::ostream& s,const Vector3D& v);

	////////////////////////
	// External functions //
	////////////////////////

	/**
	* @brief Returns the square distance between two Vector3D
	*
	* This method is faster than getDist(const Vector3D&,const Vector3D&) and should be used when possible.
	*
	* @param v0 : the first Vector3D
	* @param v1 : the second Vector3D
	* @return the square distance between the two Vector3D
	*/
	extern SPK_PREFIX float getSqrDist(const Vector3D& v0,const Vector3D& v1);

	/**
	* @brief Returns the distance between two Vector3D
	* @param v0 : the first Vector3D
	* @param v1 : the second Vector3D
	* @return the distance between the two Vector3D
	*/
	extern SPK_PREFIX float getDist(const Vector3D& v0,const Vector3D& v1);

	/**
	* @brief Returns the dot product between two Vector3D
	* @param v0 : the first Vector3D
	* @param v1 : the second Vector3D
	* @return the dot product (v0 . v1)
	*/
	float dotProduct(const Vector3D& v0,const Vector3D& v1);

	/**
	* @brief Returns the cross product between two Vector3D
	* @param v0 : the first Vector3D
	* @param v1 : the second Vector3D
	* @return the cross product (v0 x v1)
	*/
	extern SPK_PREFIX Vector3D crossProduct(const Vector3D& v0,const Vector3D& v1);

	/**
	* @brief Computes the cross product between two Vector3D and stores the result in the Vector3D result
	* @param v0 : the first Vector3D
	* @param v1 : the second Vector3D
	* @param result : the Vector3D where to store the cross product (v0 x v1)
	*/
	extern SPK_PREFIX void crossProduct(const Vector3D& v0,const Vector3D& v1,Vector3D& result);


	inline float Vector3D::getSqrNorm() const
	{
		return x * x + y * y + z * z;
	}

	inline float Vector3D::getNorm() const
	{
		return std::sqrt(getSqrNorm());
	}

	inline Vector3D Vector3D::operator-() const
	{
		return Vector3D(-x,-y,-z);
	}

	inline float dotProduct(const Vector3D& v0,const Vector3D& v1)
	{
		return v0.x * v1.x + v0.y * v1.y + v0.z * v1.z;
	}

	inline Vector3D operator+(const Vector3D& v0,const Vector3D& v1)
	{
		return Vector3D(v0.x + v1.x,v0.y + v1.y,v0.z + v1.z);
	}

	inline Vector3D operator-(const Vector3D& v0,const Vector3D& v1)
	{
		return Vector3D(v0.x - v1.x,v0.y - v1.y,v0.z - v1.z);
	}

	inline Vector3D operator+(const Vector3D& v,float f)
	{
		return Vector3D(v.x + f,v.y + f,v.z + f);
	}

	inline Vector3D operator+(float f,const Vector3D& v)
	{
		return Vector3D(v.x + f,v.y + f,v.z + f);
	}

	inline Vector3D operator-(const Vector3D& v,float f)
	{
		return Vector3D(v.x - f,v.y - f,v.z - f);
	}

	inline Vector3D operator-(float f,const Vector3D& v)
	{
		return Vector3D(v.x - f,v.y - f,v.z - f);
	}

	inline Vector3D operator*(const Vector3D& v,float f)
	{
		return Vector3D(v.x * f,v.y * f,v.z * f);
	}

	inline Vector3D operator*(float f,const Vector3D& v)
	{
		return Vector3D(v.x * f,v.y * f,v.z * f);
	}

	inline Vector3D operator/(const Vector3D& v,float f)
	{
		float mul = 1.0f / f;
		return Vector3D(v.x * mul,v.y * mul,v.z * mul);
	}

	inline Vector3D operator/(float f,const Vector3D& v)
	{
		return Vector3D(f / v.x,f / v.y,f / v.z);
	}

	inline bool operator==(const Vector3D& v0,const Vector3D& v1)
	{
		return (v0.x == v1.x)&&(v0.y == v1.y)&&(v0.z == v1.z);
	}

	inline bool operator!=(const Vector3D& v0,const Vector3D& v1)
	{
		return (v0.x != v1.x)||(v0.y != v1.y)||(v0.z != v1.z);
	}

	inline std::ostream& operator<<(std::ostream& s,const Vector3D& v)
	{
		return s << '(' << v.x << ',' << v.y << ',' << v.z << ')';
	}
}

#endif
