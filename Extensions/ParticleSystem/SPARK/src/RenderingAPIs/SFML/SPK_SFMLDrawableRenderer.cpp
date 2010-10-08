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


#include "RenderingAPIs/SFML/SPK_SFMLDrawableRenderer.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Group.h"

namespace SPK
{
namespace SFML
{
	const float SFMLDrawableRenderer::RAD2DEG = 180.0f / 3.1415926535897932384626433832795f;

	SFMLDrawableRenderer::SFMLDrawableRenderer(sf::Drawable* drawable,float scaleX,float scaleY) :
		SFMLRenderer(),
		drawable(drawable),
		scaleX(scaleX),
		scaleY(scaleY)
	{}

	void SFMLDrawableRenderer::innerRender(const Group& group)
	{
		if (drawable == NULL)
			return;

		drawable->SetBlendMode(getBlendMode());

		for (size_t i = 0; i < group.getNbParticles(); ++i)
		{
			const Particle& particle = group.getParticle(i);

			if ((!hasGroundCulling())||(particle.position().z >= 0.0f))
			{
				drawable->SetPosition(particle.position().x,
					particle.position().y - particle.position().z * getZFactor());

				drawable->SetColor(sf::Color(static_cast<sf::Uint8>(particle.getR() * 255.0f),
					static_cast<sf::Uint8>(particle.getG() * 255.0f),
					static_cast<sf::Uint8>(particle.getB() * 255.0f),
					static_cast<sf::Uint8>(particle.getParamCurrentValue(PARAM_ALPHA) * 255.0f)));

				drawable->SetScale(particle.getParamCurrentValue(PARAM_SIZE) * scaleX,
					particle.getParamCurrentValue(PARAM_SIZE) * scaleY);

				drawable->SetRotation(-particle.getParamCurrentValue(PARAM_ANGLE) * RAD2DEG);

				getCurrentTarget()->Draw(*drawable);
			}
		}
	}
}}
