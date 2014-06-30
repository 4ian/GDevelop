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


#include "RenderingAPIs/SFML/SPK_SFMLRenderer.h"
#include "Core/SPK_Group.h"

namespace SPK
{
namespace SFML
{
	float SFMLRenderer::zFactor = 0.0f;

	sf::RenderTarget* SFMLRenderer::currentTarget = NULL;

	SFMLRenderer::SFMLRenderer() :
		Renderer(),
		blendMode(sf::Blend::None),
		groundCulling(false)
	{}

	SFMLRenderer::~SFMLRenderer() {}

	void SFMLRenderer::setBlending(BlendingMode blendMode)
	{
		switch(blendMode)
		{
		case BLENDING_NONE :
			this->blendMode = sf::Blend::None;
			break;

		case BLENDING_ADD :
			this->blendMode = sf::Blend::Add;
			break;

		case BLENDING_ALPHA :
			this->blendMode = sf::Blend::Alpha;
			break;
		}
	}

	void SFMLRenderer::render(const Group& group)
	{
		if ((getCurrentTarget() == NULL)||(!prepareBuffers(group)))
			return;

		initBlending();

		if (isRenderingHintEnabled(ALPHA_TEST))
		{
			glAlphaFunc(GL_GEQUAL,getAlphaTestThreshold());
			glEnable(GL_ALPHA_TEST);
		}
		else
			glDisable(GL_ALPHA_TEST);

		innerRender(group);
	}

	void SFMLRenderer::setZFactor(float zFactor)
	{
		SFMLRenderer::zFactor = zFactor;
	}

	float SFMLRenderer::getZFactor()
	{
		return zFactor;
	}

	void SFMLRenderer::bindCurrentTarget(sf::RenderTarget& target)
	{
		currentTarget = &target;
	}

	void SFMLRenderer::releaseCurrentTarget()
	{
		currentTarget = NULL;
	}

	sf::RenderTarget* SFMLRenderer::getCurrentTarget()
	{
		return currentTarget;
	}

	float SFMLRenderer::getViewZoom(ResizeMode mode)
	{
		if (mode == RESIZE_NONE)
			return 1.0f;

		sf::Vector2f halfSize(currentTarget->GetView().GetHalfSize());

		if (mode == RESIZE_ZOOM_X)
			return currentTarget->GetWidth() / (halfSize.x * 2.0f);	// target width / view width

		if (mode == RESIZE_ZOOM_Y)
			return currentTarget->GetHeight() / (halfSize.y * 2.0f); // target height / view height

		return 0.0f;
	}
}}
