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


#include "RenderingAPIs/SFML/SPK_SFMLQuadRenderer.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Group.h"
#include "Core/SPK_ArrayBuffer.h"

namespace SPK
{
namespace SFML
{
	const std::string SFMLQuadRenderer::GPU_BUFFER_NAME("SPK_SFMLQuadRenderer_GPU");
	const std::string SFMLQuadRenderer::TEXTURE_BUFFER_NAME("SPK_SFMLQuadRenderer_Texture");

	float* SFMLQuadRenderer::gpuBuffer = NULL;
	float* SFMLQuadRenderer::gpuIterator = NULL;
	float* SFMLQuadRenderer::textureBuffer = NULL;
	float* SFMLQuadRenderer::textureIterator = NULL;

	void (SFMLQuadRenderer::*SFMLQuadRenderer::renderParticle)(const Particle&) const = NULL;

	SFMLQuadRenderer::SFMLQuadRenderer(sf::Image* image,float scaleX,float scaleY) :
		SFMLRenderer(),
		QuadRendererInterface(scaleX,scaleY),
		Oriented2DRendererInterface(),
		image(image)
	{
		if (image != NULL)
			setTexturingMode(image != NULL ? TEXTURE_2D : TEXTURE_NONE);
	}

	bool SFMLQuadRenderer::checkBuffers(const Group& group)
	{
		FloatBuffer* fBuffer;
		if ((fBuffer = dynamic_cast<FloatBuffer*>(group.getBuffer(GPU_BUFFER_NAME))) == NULL)
			return false;

		if (texturingMode != TEXTURE_NONE)
		{
			FloatBuffer* fTextureBuffer;

			if ((fTextureBuffer = dynamic_cast<FloatBuffer*>(group.getBuffer(TEXTURE_BUFFER_NAME))) == NULL)
				textureBuffer = createTextureBuffer(group);

			textureIterator = textureBuffer = fTextureBuffer->getData();
		}

		gpuIterator = gpuBuffer = fBuffer->getData();
		return true;
	}

	void SFMLQuadRenderer::createBuffers(const Group& group)
	{	
		FloatBuffer* fBuffer = dynamic_cast<FloatBuffer*>(group.createBuffer(GPU_BUFFER_NAME,FloatBufferCreator(24),0,false));
		gpuIterator = gpuBuffer = fBuffer->getData();
		if (texturingMode != TEXTURE_NONE)
			textureIterator = textureBuffer = createTextureBuffer(group);
	}

	float* SFMLQuadRenderer::createTextureBuffer(const Group& group) const
	{
		FloatBuffer* fbuffer = dynamic_cast<FloatBuffer*>(group.createBuffer(TEXTURE_BUFFER_NAME,FloatBufferCreator(8),0,false));
		if (!group.getModel()->isEnabled(PARAM_TEXTURE_INDEX))
		{
			float t[8] = {1.0f,0.0f,0.0f,0.0f,0.0f,1.0f,1.0f,1.0f};
			for (size_t i = 0; i < group.getParticles().getNbReserved() << 3; ++i)
				fbuffer->getData()[i] = t[i & 7];
		}
		return fbuffer->getData();
	}

	void SFMLQuadRenderer::destroyBuffers(const Group& group)
	{
		group.destroyBuffer(GPU_BUFFER_NAME);
		group.destroyBuffer(TEXTURE_BUFFER_NAME);
	}

	void SFMLQuadRenderer::innerRender(const Group& group)
	{
		if (texturingMode == TEXTURE_2D)
		{
			if (image != NULL)
				image->Bind();
			if (!group.getModel()->isEnabled(PARAM_ANGLE))
			{
				if (!group.getModel()->isEnabled(PARAM_TEXTURE_INDEX))
					renderParticle = &SFMLQuadRenderer::renderVA;
				else
					renderParticle = &SFMLQuadRenderer::renderAtlasVA;
			}
			else
			{
				if (!group.getModel()->isEnabled(PARAM_TEXTURE_INDEX))
					renderParticle = &SFMLQuadRenderer::renderRotVA;
				else
					renderParticle = &SFMLQuadRenderer::renderAtlasRotVA;
			}
		}
		else
		{
			glDisable(GL_TEXTURE_2D);
			if (!group.getModel()->isEnabled(PARAM_ANGLE))
				renderParticle = &SFMLQuadRenderer::renderVA;
			else
				renderParticle = &SFMLQuadRenderer::renderRotVA;
		}

		glShadeModel(GL_FLAT);

		bool globalOrientation = hasGlobalOrientation();

		size_t nbToRender = 0;
		if (globalOrientation)
		{
			computeGlobalOrientation2D();

			for (size_t i = 0; i < group.getNbParticles(); ++i)
			{
				const Particle& particle = group.getParticle(i);
				if ((!hasGroundCulling())||(particle.position().z >= 0.0f))
				{
					(this->*renderParticle)(particle);
					++nbToRender;
				}
			}
		}
		else
		{
			for (size_t i = 0; i < group.getNbParticles(); ++i)
			{
				const Particle& particle = group.getParticle(i);
				if ((!hasGroundCulling())||(particle.position().z >= 0.0f))
				{
					computeSingleOrientation2D(particle);
					(this->*renderParticle)(particle);
					++nbToRender;
				}
			}
		}

		glEnableClientState(GL_VERTEX_ARRAY);
		glEnableClientState(GL_COLOR_ARRAY);

		if (texturingMode == TEXTURE_2D)
		{
			glEnableClientState(GL_TEXTURE_COORD_ARRAY);
			glTexCoordPointer(2,GL_FLOAT,0,textureBuffer);
		}

		// interleaves vertex and color data
		glVertexPointer(2,GL_FLOAT,6 * sizeof(float),gpuBuffer);
		glColorPointer(4,GL_FLOAT,6 * sizeof(float),gpuBuffer + 2);	

		glDrawArrays(GL_QUADS,0,nbToRender << 2);

		glDisableClientState(GL_VERTEX_ARRAY);
		glDisableClientState(GL_COLOR_ARRAY);

		if (texturingMode == TEXTURE_2D)
			glDisableClientState(GL_TEXTURE_COORD_ARRAY);
	}

	void SFMLQuadRenderer::renderVA(const Particle& particle) const
	{
		scaleQuadVectors(particle,scaleX,scaleY);
		GLCallColorAndVertex(particle);
	}

	void SFMLQuadRenderer::renderAtlasVA(const Particle& particle) const
	{
		scaleQuadVectors(particle,scaleX,scaleY);
		GLCallColorAndVertex(particle);
		GLCallTexture2DAtlas(particle);
	}

	void SFMLQuadRenderer::renderRotVA(const Particle& particle) const
	{
		rotateAndScaleQuadVectors(particle,scaleX,scaleY);
		GLCallColorAndVertex(particle);
	}

	void SFMLQuadRenderer::renderAtlasRotVA(const Particle& particle) const
	{
		rotateAndScaleQuadVectors(particle,scaleX,scaleY);
		GLCallColorAndVertex(particle);
		GLCallTexture2DAtlas(particle);
	}
}}
