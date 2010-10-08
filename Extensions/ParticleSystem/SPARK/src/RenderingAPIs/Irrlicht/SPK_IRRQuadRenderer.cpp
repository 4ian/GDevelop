//////////////////////////////////////////////////////////////////////////////////
// SPARK Irrlicht Rendering library												//
// Copyright (C) 2009															//
// Thibault Lescoat -  info-tibo <at> orange <dot> fr							//
// Julien Fryer - julienfryer@gmail.com											//
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

#include "RenderingAPIs/Irrlicht/SPK_IRRQuadRenderer.h"
#include "RenderingAPIs/Irrlicht/SPK_IRRBuffer.h"

namespace SPK
{
namespace IRR
{
	const std::string IRRQuadRenderer::IRR_BUFFER_NAME("SPK_IRRQuadRenderer_Buffer");
	void (IRRQuadRenderer::*IRRQuadRenderer::renderParticle)(const Particle&) const = NULL;

	IRRQuadRenderer::IRRQuadRenderer(irr::IrrlichtDevice* d,float scaleX,float scaleY) :
		IRRRenderer(d),
		QuadRendererInterface(scaleX,scaleY),
		Oriented3DRendererInterface()
	{}

	void IRRQuadRenderer::createBuffers(const Group& group)
	{	
		currentBuffer = dynamic_cast<IRRBuffer*>(group.createBuffer(getBufferName(),
																	IRRBufferCreator(device,
																		NB_VERTICES_PER_QUAD,
																		NB_INDICES_PER_QUAD),
																	0,
																	false));
		size_t nbTotalParticles = group.getParticles().getNbReserved();

		irr::scene::IIndexBuffer& indexBuffer = currentBuffer->getIndexBuffer();
		if (indexBuffer.getType() == irr::video::EIT_32BIT)
		{
			irr::u32* indices = reinterpret_cast<irr::u32*>(indexBuffer.pointer());
			for (size_t t = 0; t < nbTotalParticles; ++t)
			{
				indices[NB_INDICES_PER_QUAD*t+0] = NB_VERTICES_PER_QUAD*t+0;
                indices[NB_INDICES_PER_QUAD*t+1] = NB_VERTICES_PER_QUAD*t+1;
                indices[NB_INDICES_PER_QUAD*t+2] = NB_VERTICES_PER_QUAD*t+2;
                indices[NB_INDICES_PER_QUAD*t+3] = NB_VERTICES_PER_QUAD*t+0;
                indices[NB_INDICES_PER_QUAD*t+4] = NB_VERTICES_PER_QUAD*t+2;
                indices[NB_INDICES_PER_QUAD*t+5] = NB_VERTICES_PER_QUAD*t+3;
			}
		}
		else if (indexBuffer.getType() == irr::video::EIT_16BIT)
		{
			irr::u16* indices = reinterpret_cast<irr::u16*>(indexBuffer.pointer());
			for (size_t t = 0; t < nbTotalParticles; ++t)
			{
				indices[NB_INDICES_PER_QUAD*t+0] = NB_VERTICES_PER_QUAD*t+0;
                indices[NB_INDICES_PER_QUAD*t+1] = NB_VERTICES_PER_QUAD*t+1;
                indices[NB_INDICES_PER_QUAD*t+2] = NB_VERTICES_PER_QUAD*t+2;
                indices[NB_INDICES_PER_QUAD*t+3] = NB_VERTICES_PER_QUAD*t+0;
                indices[NB_INDICES_PER_QUAD*t+4] = NB_VERTICES_PER_QUAD*t+2;
				indices[NB_INDICES_PER_QUAD*t+5] = NB_VERTICES_PER_QUAD*t+3;
			}	
		}

		irr::video::S3DVertex* vertices = currentBuffer->getVertexBuffer().pointer();
		for (size_t t = 0; t < nbTotalParticles; t++)
		{
			vertices[NB_VERTICES_PER_QUAD*t+0].TCoords = irr::core::vector2df(0.0f,0.0f);
			vertices[NB_VERTICES_PER_QUAD*t+1].TCoords = irr::core::vector2df(1.0f,0.0f);
			vertices[NB_VERTICES_PER_QUAD*t+2].TCoords = irr::core::vector2df(1.0f,1.0f);
			vertices[NB_VERTICES_PER_QUAD*t+3].TCoords = irr::core::vector2df(0.0f,1.0f);
		}

		currentBuffer->getMeshBuffer().setDirty(irr::scene::EBT_VERTEX_AND_INDEX);
	}

	void IRRQuadRenderer::render(const Group& group)
	{
		if (!prepareBuffers(group))
			return;

		irr::video::IVideoDriver* driver = device->getVideoDriver();

		// Computes the inverse model view
		irr::core::matrix4 invModelView;
		{
			irr::core::matrix4 modelView(driver->getTransform(irr::video::ETS_VIEW));
			modelView *= driver->getTransform(irr::video::ETS_WORLD);
			modelView.getInversePrimitive(invModelView); // wont work for odd modelview matrices (but should happen in very special cases)
		}

		// Saves the renderer texture
		irr::video::ITexture* savedTexture = material.TextureLayer[0].Texture;
		if (texturingMode == TEXTURE_NONE)
			material.TextureLayer[0].Texture = NULL;

		if ((texturingMode == TEXTURE_2D)&&(group.getModel()->isEnabled(PARAM_TEXTURE_INDEX)))
		{
			if (group.getModel()->isEnabled(PARAM_ANGLE))
				renderParticle = &IRRQuadRenderer::renderAtlasRot;
			else
				renderParticle = &IRRQuadRenderer::renderAtlas;
		}
		else
		{
			if (group.getModel()->isEnabled(PARAM_ANGLE))
				renderParticle = &IRRQuadRenderer::renderRot;
			else
				renderParticle = &IRRQuadRenderer::renderBasic;
		}

		// At the first frame we pass the full buffer so that VBOs are correctly initialised
		// Then at next frames we pass only what is needed to be rendered
		if (currentBuffer->areVBOInitialized())
			currentBuffer->setUsed(group.getNbParticles());
		else
			currentBuffer->setUsed(group.getParticles().getNbReserved());

		bool globalOrientation = precomputeOrientation3D(
			group,
			Vector3D(invModelView[8],invModelView[9],invModelView[10]),
			Vector3D(invModelView[4],invModelView[5],invModelView[6]),
			Vector3D(invModelView[12],invModelView[13],invModelView[14]));

		if (globalOrientation)
		{
			computeGlobalOrientation3D();

			for (size_t t = 0; t < group.getNbParticles(); ++t)
				(this->*renderParticle)(group.getParticle(t));
		}
		else
		{
			for (size_t t = 0; t < group.getNbParticles(); ++t)
			{
				const Particle& particle = group.getParticle(t);
				computeSingleOrientation3D(particle);
				(this->*renderParticle)(particle);
			}
		}
		currentBuffer->getMeshBuffer().setDirty(irr::scene::EBT_VERTEX);

		driver->setMaterial(material);
		driver->drawMeshBuffer(&currentBuffer->getMeshBuffer()); // this draw call is used in order to be able to use VBOs

		currentBuffer->setVBOInitialized(true);
		material.TextureLayer[0].Texture = savedTexture; // Restores the texture
	}

	void IRRQuadRenderer::renderBasic(const Particle& particle) const
	{
		scaleQuadVectors(particle,scaleX,scaleY);
		FillBufferColorAndVertex(particle);
	}

	void IRRQuadRenderer::renderRot(const Particle& particle) const
	{
		rotateAndScaleQuadVectors(particle,scaleX,scaleY);
		FillBufferColorAndVertex(particle);
	}

	void IRRQuadRenderer::renderAtlas(const Particle& particle) const
	{
		scaleQuadVectors(particle,scaleX,scaleY);
		FillBufferColorAndVertex(particle);
		FillBufferTextureAtlas(particle);
	}

	void IRRQuadRenderer::renderAtlasRot(const Particle& particle) const
	{
		rotateAndScaleQuadVectors(particle,scaleX,scaleY);
		FillBufferColorAndVertex(particle);
		FillBufferTextureAtlas(particle);
	}
}}
