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

#include "RenderingAPIs/SFML/SPK_SFML_GLOBAL.h"
#include "RenderingAPIs/SFML/SPK_SFMLSystem.h"
#include "RenderingAPIs/SFML/SPK_SFMLRenderer.h"

namespace SPK
{
namespace SFML
{
	SFMLSystem::SFMLSystem(bool worldTransformed,sf::RenderTarget* renderTarget) :
		System(),
		sf::Drawable(),
		worldTransformed(worldTransformed),
		target(renderTarget)
	{}

	bool SFMLSystem::update(float deltaTime)
	{
		if (isWorldTransformed())
		{
			setMatrix(*this,GetMatrix());
			updateTransform();
		}
		return System::update(deltaTime);
	}

	void SFMLSystem::render() const
	{
		if (target != NULL)	
			target->Draw(*this);
	}

	void SFMLSystem::Render(sf::RenderTarget& target) const
	{
		SFMLRenderer::bindCurrentTarget(target);

		if (isWorldTransformed())
		{
			glMatrixMode(GL_MODELVIEW);
			glLoadIdentity();
		}
		
		System::render();
	}
}}
