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


#ifndef H_SPK_ORIENTED3DRENDERERINTERFACE
#define H_SPK_ORIENTED3DRENDERERINTERFACE

#include "Core/SPK_Vector3D.h"
#include "Core/SPK_Group.h"

// Packs the orientations parameters into one int for orientation presets
#define PACK_ORIENTATION(lock,look,up) ((lock << 0x10)|(look << 0x8)|(up))

namespace SPK
{
	/**
	* @brief Defines the orientation of the vector Look of an oriented 3D particle
	*
	* Enumerators marked as (fast) are the ones that only needs to be computed once for
	* a set of particles instead of being computed for each particles.
	*
	* @since 1.04.00
	*/
	enum LookOrientation
	{
		LOOK_CAMERA_PLANE,	/**< Look towards the camera plane (fast) */
		LOOK_CAMERA_POINT,	/**< Look towards the camera point (better effect but more expensive) */
		LOOK_AXIS,			/**< The look vector is defined by an axis (fast) */
		LOOK_POINT,			/**< Look towards a point in the universe */
	};

	/**
	* @brief Defines the orientation of the vector Up of an oriented 3D particle
	*
	* Enumerators marked as (fast) are the ones that only needs to be computed once for
	* a set of particles instead of being computed for each particles.
	*
	* @since 1.04.00
	*/
	enum UpOrientation
	{
		UP_CAMERA,			/**< The up vector is defined by the up vector of the camera (fast) */
		UP_DIRECTION,		/**< The up vector is oriented towards the direction of the particle */
		UP_AXIS,			/**< The up vector is is defined by an axis (fast) */
		UP_POINT,			/**< The up vector is oriented towards a point */		
	};

	/**
	* @brief Defines which axis is locked and will not change when computing a cross product.
	*
	* Note that the side vector cannot be locked as it is always derived from the look and up vectors.
	*
	* @since 1.04.00
	*/
	enum LockedAxis
	{
		LOCK_LOOK,			/**< The look vector is locked */
		LOCK_UP,			/**< The up vector is locked */
	};

	/**
	* @brief Orientation presets to easily set up common orientations
	* @since 1.04.00
	*/
	enum OrientationPreset
	{
		CAMERA_PLANE_ALIGNED = PACK_ORIENTATION(LOCK_LOOK,LOOK_CAMERA_PLANE,UP_CAMERA),		/**< Particles are oriented towards the camera plane (the most common) */
		CAMERA_POINT_ALIGNED = PACK_ORIENTATION(LOCK_LOOK,LOOK_CAMERA_POINT,UP_CAMERA),		/**< Particles are oriented towards the camera point (better effect but more expensive) */	
		DIRECTION_ALIGNED = PACK_ORIENTATION(LOCK_UP,LOOK_CAMERA_PLANE,UP_DIRECTION),		/**< Particles are oriented function of their direction and try to look to the camera */
		AROUND_AXIS = PACK_ORIENTATION(LOCK_UP,LOOK_CAMERA_POINT,LOOK_AXIS),				/**< Particles can only rotate around an axis and try to look to the camera */
		TOWARDS_POINT = PACK_ORIENTATION(LOCK_LOOK,LOOK_POINT,UP_CAMERA),					/**< Particles are oriented towards a point in the universe */
		FIXED_ORIENTATION = PACK_ORIENTATION(LOCK_LOOK,LOOK_AXIS,UP_AXIS),					/**< Particles have a fixed orientation in the universe */
	};


	/**
	* @brief Base Interface for rendering particles that can be oriented in a 3D world
	* @since 1.04.00
	*/
	class SPK_PREFIX Oriented3DRendererInterface
	{
	public :

		///////////////
		// Parameter //
		///////////////

		/**
		* @brief The look vector
		*
		* It is used in 2 LookOrientation modes :
		* <ul>
		* <li>LOOK_AXIS : The look vector is used as the axis</li>
		* <li>LOOK_POINT : The look vector is the point quads look to</li>
		* </ul>
		* In other modes the look vector is not used
		*/
		Vector3D lookVector;

		/**
		* @brief The up vector
		*
		* It is used in 2 UpOrientation modes :
		* <ul>
		* <li>UP_AXIS : The up axis is used as the axis</li>
		* <li>UP_POINT : The up axis is the point quads will be oriented towards</li>
		* </ul>
		* In other modes the up vector is not used
		*/
		Vector3D upVector;

		//////////////////
		// Constructors //
		//////////////////

		/** @brief Constructor of Oriented3DRendererInterface */
		Oriented3DRendererInterface();

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of Oriented3DRendererInterface */
		virtual ~Oriented3DRendererInterface() {}

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the way quads are oriented in the universe
		*
		* This method allows to accuratly configure the orientation of quads.<br>
		* Another method with only one parameters that take presets exist.<br>
		* See setOrientation(OrientationPreset)
		*
		* @param lookOrientation : The way the look vector of the quad is set
		* @param upOrientation : The way the up vector of the quad is set
		* @param lockedAxis : tells which axis prevails over the other
		*/
		void setOrientation(LookOrientation lookOrientation,UpOrientation upOrientation,LockedAxis lockedAxis);

		/**
		* @brief Sets the way quads are oriented in the universe
		*
		* This method takes some presets to orientate the quads.<br>
		* Another method that has more options to configure orientation exists<br>
		* See setOrientation(LookOrientation,UpOrientation,LockedAxis)
		*
		* @param orientation : the orientation preset of the quad
		*/
		void setOrientation(OrientationPreset orientation);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the look orientation of the quads
		* @return the look orientation of the quads
		*/
		LookOrientation getLookOrientation() const;

		/**
		* @brief Gets the up orientation of the quads
		* @return the up orientation of the quads
		*/
		UpOrientation getUpOrientation() const;

		/**
		* @brief Gets the locked axis (the one prevailing over the others)
		* @return the locked axis
		*/
		LockedAxis getLockedAxis() const;

	protected :

		// Orientation
		LookOrientation lookOrientation;
		UpOrientation upOrientation;
		LockedAxis lockedAxis;

		bool precomputeOrientation3D(const Group& group,const Vector3D& look,const Vector3D& up,const Vector3D& pos);
		void computeGlobalOrientation3D();
		void computeSingleOrientation3D(const Particle& particle);

		void scaleQuadVectors(const Particle& particle,float scaleX,float scaleY) const;
		void rotateAndScaleQuadVectors(const Particle& particle,float scaleX,float scaleY) const;

		const Vector3D& quadUp() const;
		const Vector3D& quadSide() const;

	private :

		// Used to store modelview information
		mutable Vector3D mVLook;
		mutable Vector3D mVUp;
		mutable Vector3D mVPos;

		// Used to store precomputed orientation
		mutable Vector3D globalLook;
		mutable Vector3D globalUp;

		// Used to store the orientation of quads before scaling
		mutable Vector3D up;
		mutable Vector3D side;
		mutable Vector3D look;

		// Is using rotation
		mutable int quadRotated;

		// This is where are stored quad orientation info after computation
		mutable Vector3D sideQuad;
		mutable Vector3D upQuad;
	};


	inline LookOrientation Oriented3DRendererInterface::getLookOrientation() const
	{
		return lookOrientation;
	}

	inline UpOrientation Oriented3DRendererInterface::getUpOrientation() const
	{
		return upOrientation;
	}

	inline LockedAxis Oriented3DRendererInterface::getLockedAxis() const
	{
		return lockedAxis;
	}

	inline const Vector3D& Oriented3DRendererInterface::quadUp() const
	{
		return upQuad;
	}

	inline const Vector3D& Oriented3DRendererInterface::quadSide() const
	{
		return sideQuad;
	}

	inline bool Oriented3DRendererInterface::precomputeOrientation3D(const Group& group,const Vector3D& modelViewLook,const Vector3D& modelViewUp,const Vector3D& modelViewPos)
	{
		mVLook = modelViewLook;
		mVUp = modelViewUp;
		mVPos = modelViewPos;

		bool globalOrientation = true;

		if (lookOrientation == LOOK_CAMERA_PLANE)
			globalLook = -mVLook;
		else if (lookOrientation == LOOK_AXIS)
			globalLook = lookVector;
		else
			globalOrientation = false;

		if (upOrientation == UP_CAMERA)
			globalUp = mVUp;
		else if (upOrientation == UP_AXIS)
			globalUp = upVector;
		else globalOrientation = false;

		quadRotated = group.getModel()->isEnabled(PARAM_ANGLE);

		return globalOrientation;
	}
	
	inline void Oriented3DRendererInterface::computeGlobalOrientation3D()
	{
		look = globalLook;
		up = globalUp;

		crossProduct(up,look,side);
		if (lockedAxis == LOCK_LOOK)
			crossProduct(look,side,up);
		else if (quadRotated)
		{
			crossProduct(side,up,look);
			look.normalize();
		}

		up.normalize();
		up *= 0.5f;

		side.normalize();
		side *= 0.5f;
	}
	
	inline void Oriented3DRendererInterface::computeSingleOrientation3D(const Particle& particle)
	{
		if (lookOrientation == LOOK_CAMERA_POINT)
		{
			look = mVPos;
			look -= particle.position();
		}
		else if (lookOrientation == LOOK_POINT)
		{
			look = lookVector;
			look -= particle.position();
		}
		else
			look = globalLook;

		if (upOrientation == UP_DIRECTION)
			up = particle.velocity();
		else if (upOrientation == UP_POINT)
		{
			up = upVector;
			up -= particle.position();
		}
		else 
			up = globalUp;

		crossProduct(up,look,side);
		if (lockedAxis == LOCK_LOOK)
			crossProduct(look,side,up);
		else if (quadRotated)
		{
			crossProduct(side,up,look);
			look.normalize();
		}

		side.normalize();
		side *= 0.5f;

		up.normalize();
		up *= 0.5f;
	}

	inline void Oriented3DRendererInterface::scaleQuadVectors(const Particle& particle,float scaleX,float scaleY) const
	{
		float size = particle.getParamCurrentValue(PARAM_SIZE);

		sideQuad = side;
		sideQuad *= size * scaleX;

		upQuad = up;
		upQuad *= size * scaleY;
	}

	inline void Oriented3DRendererInterface::rotateAndScaleQuadVectors(const Particle& particle,float scaleX,float scaleY) const
	{
		float size = particle.getParamCurrentValue(PARAM_SIZE);

		float angleTexture = particle.getParamCurrentValue(PARAM_ANGLE);
		float cosA = std::cos(angleTexture);
		float sinA = std::sin(angleTexture);

		upQuad.x = (look.x * look.x + (1.0f - look.x * look.x) * cosA) * up.x
			+ (look.x * look.y * (1.0f - cosA) - look.z * sinA) * up.y
			+ (look.x * look.z * (1.0f - cosA) + look.y * sinA) * up.z;
		
		upQuad.y = (look.x * look.y * (1.0f - cosA) + look.z * sinA) * up.x
			+ (look.y * look.y + (1.0f - look.y * look.y) * cosA) * up.y
			+ (look.y * look.z * (1.0f - cosA) - look.x * sinA) * up.z;

		upQuad.z = (look.x * look.z * (1.0f - cosA) - look.y * sinA) * up.x
			+ (look.y * look.z * (1.0f - cosA) + look.x * sinA) * up.y
			+ (look.z * look.z + (1.0f - look.z * look.z) * cosA) * up.z;

		crossProduct(upQuad,look,sideQuad);
		
		sideQuad *= size * scaleX;
		upQuad *= size * scaleY;
	}
}

#endif
