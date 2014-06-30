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


#ifndef H_SPK_TRANSFORMABLE
#define H_SPK_TRANSFORMABLE

#include "Core/SPK_Vector3D.h"


namespace SPK
{
	class Zone;


	/**
	* @class Transformable
	* @brief an abstract class that allows matrix transformations
	*
	* Every SPARK object that can be transformated thanks to a matrix should derive from this class.<br>
	* A Transformable stores a matrix and performs operation on object parameters function of its matrix.<br>
	* <br>
	* It allows for instance to transform all emitters and zones in a system with a transform matrix.<br>
	* Particles are still living in the world coordinates (unlike transforming the rendering process).<br>
	* <br>
	* Note that SPARK is not a linear algebra library, so this class does not offers lots of matri operations.<br>
	* It is rather designed to be plugged within an existing engine with its own matrix system.<br>
	* <br>
	* SPARK was not designed to offer a complete scene graph. Even if the library can handle matrices stack, it does not
	* offer lots of possibilities. Once again it was designed to be used with an existing outer scene graph.
	* <br>
	* The transforms used are continuous-in-memory homogeneous matrices with vectors being stored with their coordinates contiguous :<br>
	* <i>[side.x side.y side.z side.w up.x up.y up.z up.w look.x look.y look.z look.w pos.x pos.y pos.z pos.w]</i><br>
	* (look being -look in right-handed coordinate systems)<br>
	*
	* @since 1.03.00
	*/
	class SPK_PREFIX Transformable
	{
	public :

		///////////////
		// Constants //
		///////////////

		/** @brief The number of floats held by a transform */
		static const size_t TRANSFORM_LENGTH = 16;

		/** @brief The identity matrix */
		static const float IDENTITY[TRANSFORM_LENGTH];

		/////////////////
		// Constructor //
		/////////////////

		/** @brief Constructor of Transformable */
		Transformable();

		Transformable(const Transformable& transformable);

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of Transformable */
		virtual ~Transformable() {}

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the local transform of this Transformable
		*
		* Note that the matrix must contain the following value in that order :<br>
		* <i>[side.x side.y side.z side.w up.x up.y up.z up.w look.x look.y look.z look.w pos.x pos.y pos.z pos.w]</i><br>
		* (look being -look in right-handed coordinate systems)<br>
		* <br>
		* The matrix being row or column major is just a convention which is not important.<br>
		* The only thing that matters is that vectors coordinates are contiguous in memory.<br>
		* If not, see setTransformNC(const float*)
		*
		* @param transform : the transform to copy its content from
		*/
		void setTransform(const float* transform);

		/**
		* @brief Sets the local transfom of this Transformable from a "non contiguous vector coordinates" matrix
		*
		* Note that the matrix must contain the following value in that order :<br>
		* <i>[side.x up.x look.x pos.x side.x up.x look.x pos.x side.x up.x look.x pos.x side.w up.w look.w pos.w]</i><br>
		* (look being -look in right-handed coordinate systems)<br>
		* <br>
		* Note the inner transform is stored with vector coordinates being contiguous in memory.<br>
		* See setTransform(const float*)
		*
		* @param transform : the transform to copy its content from
		*/
		void setTransformNC(const float* transform);

		/**
		* @brief Sets the position of the local transform
		*
		* The orientation is left untouched.<br>
		* <br>
		* Note that this methods sets the local transform.
		* To compute the world transform and propagate it, updateTransform(const Transformable*) must be called afterwards.
		*
		* @param pos : the position of the local transform
		* @since 1.05.00
		*/
		void setTransformPosition(const Vector3D& pos);

		/**
		* @brief Sets the orientation of the local transform in a right-handed system
		*
		* The position is left untouched.<br>
		* <br>
		* Note that this methods sets the local transform.
		* To compute the world transform and propagate it, updateTransform(const Transformable*) must be called afterwards.
		*
		* @param look : the look vector of the transformable
		* @param up : the up vector of the transformable
		* @since 1.05.00
		*/
		void setTransformOrientationRH(Vector3D look,Vector3D up);

		/**
		* @brief Sets the orientation of the local transform in a left-handed system
		*
		* The position is left untouched.<br>
		* <br>
		* Note that this methods sets the local transform.
		* To compute the world transform and propagate it, updateTransform(const Transformable*) must be called afterwards.
		*
		* @param look : the look vector of the transformable
		* @param up : the up vector of the transformable
		* @since 1.05.00
		*/
		void setTransformOrientationLH(Vector3D look,Vector3D up);

		/**
		* @brief Sets the orientation of the local transform
		*
		* This method allows to set the orientation around an arbitrary axis.<br>
		* The position is left untouched.<br>
		* <br>
		* Note that this methods sets the local transform.
		* To compute the world transform and propagate it, updateTransform(const Transformable*) must be called afterwards.
		*
		* @param axis : the axis of rotation
		* @param angle : the angle of rotation around the axis
		* @since 1.05.00
		*/
		void setTransformOrientation(Vector3D axis,float angle);

		/**
		* @brief Sets the orientation of the local transform
		*
		* This method allows to set the orientation around an the x axis.<br>
		* The position is left untouched.<br>
		* <br>
		* Note that this methods sets the local transform.
		* To compute the world transform and propagate it, updateTransform(const Transformable*) must be called afterwards.
		*
		* @param angle : the angle of rotation around the x axis
		* @since 1.05.00
		*/
		void setTransformOrientationX(float angle);

		/**
		* @brief Sets the orientation of the local transform
		*
		* This method allows to set the orientation around an the y axis.<br>
		* The position is left untouched.<br>
		* <br>
		* Note that this methods sets the local transform.
		* To compute the world transform and propagate it, updateTransform(const Transformable*) must be called afterwards.
		*
		* @param angle : the angle of rotation around the y axis
		* @since 1.05.00
		*/
		void setTransformOrientationY(float angle);

		/**
		* @brief Sets the orientation of the local transform
		*
		* This method allows to set the orientation around an the z axis.<br>
		* The position is left untouched.<br>
		* <br>
		* Note that this methods sets the local transform.
		* To compute the world transform and propagate it, updateTransform(const Transformable*) must be called afterwards.
		*
		* @param angle : the angle of rotation around the z axis
		* @since 1.05.00
		*/
		void setTransformOrientationZ(float angle);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the local transform of this Transformable
		* @return a pointer to the local transform of this Transformable
		*/
		const float* getLocalTransform() const;

		/**
		* @brief Gets the world transform of this Transformable
		* @return a pointer to the world transform of this Transformable
		*/
		const float* getWorldTransform() const;

		/**
		* @brief Tells whether the local transform is the identity or not
		* @return true if the local transform is identity, false if not
		*/
		bool isLocalIdentity() const;

		/**
		* @brief Gets the position of the local transform
		* @return the position of the local transform
		* @since 1.05.00
		*/
		Vector3D getLocalTransformPos() const;

		/**
		* @brief Gets the side vector of the local transform
		* @return the side vector of the local transform
		* @since 1.05.00
		*/
		Vector3D getLocalTransformSide() const;

		/**
		* @brief Gets the up vector of the local transform
		* @return the up vector of the local transform
		* @since 1.05.00
		*/
		Vector3D getLocalTransformUp() const;

		/**
		* @brief Gets the look vector of the local transform in a right-handed system
		* @return the look vector of the local transform
		* @since 1.05.00
		*/
		Vector3D getLocalTransformLookRH() const;

		/**
		* @brief Gets the look vector of the local transform in a left-handed system
		* @return the look vector of the local transform
		* @since 1.05.00
		*/
		Vector3D getLocalTransformLookLH() const;

		/**
		* @brief Gets the position of the world transform
		* @return the position of the world transform
		* @since 1.05.00
		*/
		Vector3D getWorldTransformPos() const;

		/**
		* @brief Gets the side vector of the world transform
		* @return the side vector of the world transform
		* @since 1.05.00
		*/
		Vector3D getWorldTransformSide() const;

		/**
		* @brief Gets the up vector of the world transform
		* @return the up vector of the world transform
		* @since 1.05.00
		*/
		Vector3D getWorldTransformUp() const;

		/**
		* @brief Gets the look vector of the world transform  in a right-handed system
		* @return the look vector of the world transform
		* @since 1.05.00
		*/
		Vector3D getWorldTransformLookRH() const;

		/**
		* @brief Gets the look vector of the world transform  in a left-handed system
		* @return the look vector of the world transform
		* @since 1.05.00
		*/
		Vector3D getWorldTransformLookLH() const;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief lookAt method for a right-handed system
		*
		* The vectors are normalized internally.<br>
		* <br>
		* Note that this methods sets the local transform.
		* To compute the world transform and propagate it, updateTransform(const Transformable*) must be called afterwards.
		*
		* @param target : the point the transformable is looking at
		* @param up : the up vector of the transformable
		* @param pos : the position of the transformable
		* @since 1.05.00
		*/
		void lookAtRH(const Vector3D& target,Vector3D up,const Vector3D& pos);

		/**
		* @brief lookAt method for a left-handed system
		*
		* The vectors are normalized internally.<br>
		* <br>
		* Note that this methods sets the local transform.
		* To compute the world transform and propagate it, updateTransform(const Transformable*) must be called afterwards.
		*
		* @param target : the point the transformable is looking at
		* @param up : the up vector of the transformable
		* @param pos : the position of the transformable
		* @since 1.05.00
		*/
		void lookAtLH(const Vector3D& target,Vector3D up,const Vector3D& pos);

		/**
		* @brief Updates the world transform of this Transformable
		*
		* The parent transform and the local transform is used to derive the world transform.<br>
		* If parent is NULL, the local transform is simply copied to the world transform.<br>
		* <br>
		* Note that this method only updates the transform if needed
		*
		* @param parent : the parent node of this Transformable or NULL
		*/
		void updateTransform(const Transformable* parent = NULL);

		/** @brief Resets the transform to identity */
		void resetTransform();

	protected :

		/**
		* @brief A helper method to transform a position from local to world coordinates
		* @param tPos : the resulting transformed position
		* @param pos : the position in local coordinates
		*/
		void transformPos(Vector3D& tPos,const Vector3D& pos);

		/**
		* @brief A helper method to transform a direction from local to world coordinates
		* @param tDir : the resulting transformed direction
		* @param dir : the direction in local coordinates
		*/
		void transformDir(Vector3D& tDir,const Vector3D& dir);

		/**
		* @brief Tells whether this Transformable needs update or not
		* @return true if it needs update, false if not
		*/
		bool isUpdateNotified() const;

		/**
		* @brief Notifies the Transformable for a update need
		*
		* This method has to be called when modifying a parameter that impose the transform's recomputation.
		*/
		void notifyForUpdate();

		/**
		* @brief Gets the latest parent of this Transformable
		* @return the latest parent of this Transformable or NULL
		*/
		const Transformable* getParentTransform() const;

		/**
		* @brief Updates all the parameters in the world coordinates
		*
		* This method can be overriden in derived classes of Transformable (By default it does nothing).<br>
		* It is this method task to compute all parameters of the class that are dependent of the world transform.
		*/
		virtual void innerUpdateTransform() {}

		/**
		* @brief Propagates the update of the transform to transformable children of this transformable
		*
		* This method can be overriden in derived classes of Transformable (By default it does nothing).<br>
		* It is this method task to call the updateTransform method of transformable children of this transformable.
		*
		* @since 1.05.00
		*/
		virtual void propagateUpdateTransform() {}

	private :

		float local[TRANSFORM_LENGTH];
		float world[TRANSFORM_LENGTH];

		unsigned long int currentUpdate;
		unsigned long int lastUpdate;
		unsigned long int lastParentUpdate;
		bool localIdentity;

		const Transformable* parent;

		static void multiply(
			float* dest,
			const float* src0,
			const float* src1);

		static void multiply(
			Vector3D& dest,
			const Vector3D& v,
			const float* m);

		static void rotate(
			Vector3D& dest,
			const Vector3D& v,
			const float* m);
	};


	inline void Transformable::setTransform(const float* transform)
	{
		std::memcpy(local,transform,sizeof(float) * TRANSFORM_LENGTH);
		localIdentity = false;
		notifyForUpdate();
	}

	inline const float* Transformable::getLocalTransform() const
	{
		return local;
	}

	inline const float* Transformable::getWorldTransform() const
	{
		return world;
	}

	inline bool Transformable::isLocalIdentity() const
	{
		return localIdentity;
	}

	inline Vector3D Transformable::getLocalTransformPos() const
	{
		return Vector3D(local[12],local[13],local[14]);
	}

	inline Vector3D Transformable::getLocalTransformSide() const
	{
		return Vector3D(local[0],local[1],local[2]);
	}

	inline Vector3D Transformable::getLocalTransformUp() const
	{
		return Vector3D(local[4],local[5],local[6]);
	}

	inline Vector3D Transformable::getLocalTransformLookRH() const
	{
		return Vector3D(-local[8],-local[9],-local[10]);
	}

	inline Vector3D Transformable::getLocalTransformLookLH() const
	{
		return Vector3D(local[8],local[9],local[10]);
	}

	inline Vector3D Transformable::getWorldTransformPos() const
	{
		return Vector3D(world[12],world[13],world[14]);
	}

	inline Vector3D Transformable::getWorldTransformSide() const
	{
		return Vector3D(world[0],world[1],world[2]);
	}

	inline Vector3D Transformable::getWorldTransformUp() const
	{
		return Vector3D(world[4],world[5],world[6]);
	}

	inline Vector3D Transformable::getWorldTransformLookRH() const
	{
		return Vector3D(-world[8],-world[9],-world[10]);
	}

	inline Vector3D Transformable::getWorldTransformLookLH() const
	{
		return Vector3D(world[8],world[9],world[10]);
	}

	inline void Transformable::lookAtRH(const Vector3D& target,Vector3D up,const Vector3D& pos)
	{
		setTransformOrientationRH(target - pos,up);
		setTransformPosition(pos);
	}

	inline void Transformable::lookAtLH(const Vector3D& target,Vector3D up,const Vector3D& pos)
	{
		setTransformOrientationLH(target - pos,up);
		setTransformPosition(pos);
	}

	inline void Transformable::resetTransform()
	{
		setTransform(IDENTITY);
		localIdentity = true;
	}

	inline bool Transformable::isUpdateNotified() const
	{
		return lastUpdate != currentUpdate;
	}

	inline void Transformable::notifyForUpdate()
	{
		++currentUpdate;
	}

	inline const Transformable* Transformable::getParentTransform() const
	{
		return parent;
	}

	inline void Transformable::multiply(
		float* dest,
		const float* src0,
		const float* src1)
	{
		// naive matrix multiplication approach
		// warning : no self assignment !
		for (size_t i = 0; i < 4; ++i)
		{
			for (size_t j = 0; j < 4; ++j)
			{
				dest[(i << 2) + j] = 0.0f;
				for (size_t k = 0; k < 4; ++k)
					dest[(i << 2) + j] += src0[(k << 2) + j] * src1[(i << 2) + k];
				//++dest;
			}
			//++dest;
		}
	}

	inline void Transformable::multiply(
		Vector3D& dest,
		const Vector3D& v,
		const float* m)
	{
		// warning : no self assignment !
		// w coord of vectors is implicitely 1
		dest.x = v.x * m[0] + v.y * m[4] + v.z * m[8] + m[12];
		dest.y = v.x * m[1] + v.y * m[5] + v.z * m[9] + m[13];
		dest.z = v.x * m[2] + v.y * m[6] + v.z * m[10] + m[14];
	}

	inline void Transformable::rotate(
		Vector3D& dest,
		const Vector3D& v,
		const float* m)
	{
		// warning : no self assignment !
		// w coord of vectors is implicitely 1
		dest.x = v.x * m[0] + v.y * m[4] + v.z * m[8];
		dest.y = v.x * m[1] + v.y * m[5] + v.z * m[9];
		dest.z = v.x * m[2] + v.y * m[6] + v.z * m[10];
	}
}

#endif
