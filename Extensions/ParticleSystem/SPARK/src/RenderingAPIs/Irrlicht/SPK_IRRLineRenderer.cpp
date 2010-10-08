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

#include "RenderingAPIs/Irrlicht/SPK_IRRLineRenderer.h"
#include "RenderingAPIs/Irrlicht/SPK_IRRBuffer.h"

namespace SPK
{
namespace IRR
{
	const std::string IRRLineRenderer::IRR_BUFFER_NAME("SPK_IRRLineRenderer_Buffer");

	IRRLineRenderer::IRRLineRenderer(irr::IrrlichtDevice* d,float length,float width) :
		IRRRenderer(d),
		LineRendererInterface(length,width)
	{
		material.Thickness = width;
	}

	void IRRLineRenderer::createBuffers(const Group& group)
	{
		currentBuffer = dynamic_cast<IRRBuffer*>(group.createBuffer(getBufferName(),
																	IRRBufferCreator(device,
																		NB_VERTICES_PER_QUAD,
																		NB_INDICES_PER_QUAD),
																	0,
																	false));
		
		size_t nbTotalIndices = group.getParticles().getNbReserved() << 1;
		
		irr::scene::IIndexBuffer& indexBuffer = currentBuffer->getIndexBuffer();
		if (indexBuffer.getType() == irr::video::EIT_32BIT)
        {
            irr::u32* indices = reinterpret_cast<irr::u32*>(indexBuffer.pointer());
            for (size_t t = 0; t < nbTotalIndices; ++t)
                indices[t] = t;
        }
        else
        {
            irr::u16* indices = reinterpret_cast<irr::u16*>(indexBuffer.pointer());
            for (size_t t = 0; t < nbTotalIndices; ++t)
                indices[t] = t;
        }

		currentBuffer->getMeshBuffer().setDirty(irr::scene::EBT_INDEX);
		currentBuffer->setVBOInitialized(true);
	}

	void IRRLineRenderer::render(const Group& group)
	{
		if (!prepareBuffers(group))
			return;

		for (size_t t = 0; t < group.getNbParticles() << 1; t += 2)
		{
			const Particle& particle = group.getParticle(t >> 1);

			irr::video::SColor color(spk2irr(
			 particle.getParamCurrentValue(PARAM_ALPHA),
			 particle.getR(),
			 particle.getG(),
			 particle.getB()));

            currentBuffer->getVertexBuffer()[t].Pos = spk2irr(particle.position());
			currentBuffer->getVertexBuffer()[t].Color = color;
            
			currentBuffer->getVertexBuffer()[t + 1].Pos = spk2irr(particle.position() + particle.velocity() * length);
			currentBuffer->getVertexBuffer()[t + 1].Color = color;
		}
		currentBuffer->getMeshBuffer().setDirty(irr::scene::EBT_VERTEX);

		irr::video::IVideoDriver* driver = device->getVideoDriver();
        driver->setMaterial(material);
        driver->drawVertexPrimitiveList(
			currentBuffer->getVertexBuffer().pointer(),
			group.getNbParticles() * NB_VERTICES_PER_QUAD,
			currentBuffer->getIndexBuffer().pointer(),
			group.getNbParticles(),
			irr::video::EVT_STANDARD,
			irr::scene::EPT_LINES,
			currentBuffer->getIndexBuffer().getType());
	}
}}
