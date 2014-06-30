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


#ifndef H_SPK_SFMLSYSTEM
#define H_SPK_SFMLSYSTEM

#include "RenderingAPIs/SFML/SPK_SFML_DEF.h"
#include "Core/SPK_System.h"

namespace SPK
{
namespace SFML
{
	/**
	* @class SFMLSystem
	* @brief A System to use particle systems as SFML Drawable object
	*
	* An SFMLSystem is the link between SPARK and SFML library.
	* An SFMLSystem extends the sf::Drawable class and therefore inherits its public interface.
	* This allows to handle SPARK particle systems the same way as any SFML Drawable :<ul>
	* <li>Translation</li>
	* <li>Rotation</li>
	* <li>Scale</li>
	* <li>Center</li>
	* <li>...</li>
	* </ul>
	* However the color and blend mode of the System is ignored and overidden by the color of Particles
	* and the blending mode of Renderers.<br>
	* <br>
	* An SFMLSystem typically holds SFMLRenderer but any other Renderer can be used to get desired rendering.
	* <br>
	* An SFMLSystem can be renderered in 2 ways :<ul>
	* <li>SFML style using RenderTarget.Draw(const Drawable&)</li>
	* <li>SPARK style using SFMLSystem.render()</li>
	* </ul>
	* In the second case, the System must hold a pointer to a RenderTarget. If not, it cannot be renderered.<br>
	* In the first case, the inner pointer to a RenderTarget of the SFMLSystem is ignored as the RenderTarget is
	* explicitely defined.
	*
	* @since 1.01.00
	*/
	class SPK_SFML_PREFIX SFMLSystem : public System,public sf::Drawable
	{	
		SPK_IMPLEMENT_REGISTERABLE(SFMLSystem)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/** 
		* @brief Constructor of SFMLSystem
		* @param worldTransformed : true to emit particles in world, false to emit them localy
		* @param renderTarget : the render target
		*/
		SFMLSystem(bool worldTransformed = true,sf::RenderTarget* renderTarget = NULL);

		/**
		* @brief Creates and registers a new SFMLSystem
		* @param worldTransformed : true to emit particles in world, false to emit them localy
		* @param renderTarget : the render target
		* @return A new registered SFMLSystem
		* @since 1.04.00
		*/
		static SFMLSystem* create(bool worldTransformed = true,sf::RenderTarget* renderTarget = NULL);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the RenderTarget of this SFMLSystem
		*
		* A RenderTarget is needed when rendering the SFMLSystem in SPARK style using render()
		*
		* @param target : the RenderTarget of this SFMLSystem
		*/
		void setRenderTarget(sf::RenderTarget* target);
		
		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the RenderTarget of this SFMLSystem
		* @return the RenderTarget of this SFMLSystem or NULL if no RenderTarget is set
		*/
		sf::RenderTarget* getRenderTarget() const;

		/**
		* @brief Tells whether this system is world transformed or not
		*
		* If a system is transformed in the world, only its emitter and zones will be transformed.<br>
		* The emitted particles will remain independent from the system transformation.<br>
		* <br>
		* If it is transformed locally, the emitted particles will be transformed as well.
		*
		* @return true if this system is world transformed, false if not
		* @since 1.03.01
		*/
		bool isWorldTransformed() const;

		///////////////
		// Interface //
		///////////////

		virtual bool update(float deltaTime);
		virtual void render() const;

	private :

		sf::RenderTarget* target;
		const bool worldTransformed;

		// Called internally by SFML when rendering
		void Render(sf::RenderTarget& target) const;
	};


	inline SFMLSystem* SFMLSystem::create(bool worldTransformed,sf::RenderTarget* renderTarget)
	{
		SFMLSystem* obj = new SFMLSystem(worldTransformed,renderTarget);
		registerObject(obj);
		return obj;
	}
	
	inline void SFMLSystem::setRenderTarget(sf::RenderTarget* target)
	{
		this->target = target;
	}

	inline sf::RenderTarget* SFMLSystem::getRenderTarget() const
	{
		return target;
	}

	inline bool SFMLSystem::isWorldTransformed() const
	{	
		return worldTransformed;
	}
}}

#endif
