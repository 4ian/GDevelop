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


#ifndef H_SPK_ORIENTED2DRENDERERINTERFACE
#define H_SPK_ORIENTED2DRENDERERINTERFACE

#include "Core/SPK_Vector3D.h"
#include "Core/SPK_Group.h"

namespace SPK
{
	/**
	* @brief Defines the orientation of a particle oriented in 2D
	* @since 1.04.00
	*/
	enum Orientation2D
	{
		ORIENTATION2D_UP,			/**< Oriented towards the camera plane */
		ORIENTATION2D_DIRECTION,	/**< Oriented towards the direction of the particle */
		ORIENTATION2D_POINT,		/**< Oriented towards a point in the universe */
		ORIENTATION2D_AXIS			/**< The orientation vector is defined by an axis */		
	};


	/**
	* @brief Base Interface for rendering particles that can be oriented in a 2D world
	* @since 1.04.00
	*/
	class Oriented2DRendererInterface
	{
	public :

		///////////////
		// Parameter //
		///////////////

		/**
		* @brief The orientation vector
		*
		* It is used in 2 orientation modes :
		* <ul>
		* <li>ORIENTATION2D_AXIS : The orientation vector is used as the axis</li>
		* <li>ORIENTATION2D_POINT : The orientation vector is the point particle look to</li>
		* </ul>
		* In other modes the orientation vector is not used
		*/
		Vector3D orientationVector;

		//////////////////
		// Constructors //
		//////////////////

		/** @brief Constructor of Oriented2DRendererInterface */
		Oriented2DRendererInterface();

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of Oriented2DRendererInterface */
		virtual ~Oriented2DRendererInterface() {}

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the way quads are oriented in the universe
		* @param orientation : the orientation of the quad
		*/
		void setOrientation(Orientation2D orientation);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the orientation of the quads
		* @return the orientation of the quads
		*/
		Orientation2D getOrientation() const;

	protected :

		Orientation2D orientation;

		bool hasGlobalOrientation();
		void computeGlobalOrientation2D();
		void computeSingleOrientation2D(const Particle& particle);

		void scaleQuadVectors(const Particle& particle,float scaleX,float scaleY) const;
		void rotateAndScaleQuadVectors(const Particle& particle,float scaleX,float scaleY) const;

		const Vector3D& quadUp() const;
		const Vector3D& quadSide() const;

	private :

		// Used to store the orientation of quads before scaling
		mutable Vector3D up;
		mutable Vector3D side;

		// This is where are stored quad orientation info after computation
		mutable Vector3D sideQuad;
		mutable Vector3D upQuad;
	};


	inline Oriented2DRendererInterface::Oriented2DRendererInterface() :
		orientation(ORIENTATION2D_UP)
	{
		orientationVector.set(0.0f,-1.0f);
	}
		
	inline void Oriented2DRendererInterface::setOrientation(Orientation2D orientation)
	{
		this->orientation = orientation;
	}
	
	inline Orientation2D Oriented2DRendererInterface::getOrientation() const
	{
		return orientation;
	}

	inline const Vector3D& Oriented2DRendererInterface::quadUp() const
	{
		return upQuad;
	}

	inline const Vector3D& Oriented2DRendererInterface::quadSide() const
	{
		return sideQuad;
	}

	inline bool Oriented2DRendererInterface::hasGlobalOrientation()
	{
		return ((orientation == ORIENTATION2D_UP)||(ORIENTATION2D_AXIS));
	}
	
	inline void Oriented2DRendererInterface::computeGlobalOrientation2D()
	{
		if (orientation == ORIENTATION2D_UP)
			up.set(0.0f,-0.5f);
		else if (orientation == ORIENTATION2D_AXIS)
		{
			up.set(orientationVector.x,orientationVector.y);
			up.normalize();
			up *= 0.5f;
		}
	}
	
	inline void Oriented2DRendererInterface::computeSingleOrientation2D(const Particle& particle)
	{
		if (orientation == ORIENTATION2D_DIRECTION)
			up = particle.velocity();
		else if (orientation == ORIENTATION2D_POINT)
		{
			up = orientationVector;
			up -= particle.position();
		}
		
		up.z = 0.0f;
		up.normalize();
		up *= 0.5f;
	}

	inline void Oriented2DRendererInterface::scaleQuadVectors(const Particle& particle,float scaleX,float scaleY) const
	{
		float size = particle.getParamCurrentValue(PARAM_SIZE);

		upQuad.set(up.x,up.y);
		upQuad *= size * scaleY;
		
		sideQuad.set(-up.y,up.x);
		sideQuad *= size * scaleX;
	}

	inline void Oriented2DRendererInterface::rotateAndScaleQuadVectors(const Particle& particle,float scaleX,float scaleY) const
	{
		float size = particle.getParamCurrentValue(PARAM_SIZE);

		float angleTexture = particle.getParamCurrentValue(PARAM_ANGLE);
		float cosA = std::cos(angleTexture);
		float sinA = std::sin(angleTexture);

		upQuad.x = cosA * up.x + sinA * up.y;
		upQuad.y = -sinA * up.x + cosA * up.y;
		upQuad.z = 0.0f;

		sideQuad.set(-upQuad.y,upQuad.x);
		
		sideQuad *= size * scaleX;
		upQuad *= size * scaleY;
	}
}

#endif
