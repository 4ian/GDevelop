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


#include "RenderingAPIs/OpenGL/SPK_GLPointRenderer.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Group.h"

namespace SPK
{
namespace GL
{
	GLPointRenderer::GLPointRenderer(float size) :
		GLRenderer(),
		PointRendererInterface(POINT_SQUARE,size),
		GLExtHandler(),
		textureIndex(0),
		worldSize(false)
	{}

	bool GLPointRenderer::setType(PointType type)
	{
		if ((type == POINT_SPRITE)&&(!loadGLExtPointSprite()))
			return false;

		this->type = type;
		return true;
	}

	bool GLPointRenderer::enableWorldSize(bool worldSizeEnabled)
	{
		worldSize = ((worldSizeEnabled)&&(loadGLExtPointParameter()));
		return worldSize;
	}

	void GLPointRenderer::render(const Group& group)
	{
		initBlending();
		initRenderingHints();

		switch(type)
		{
		case POINT_SQUARE :
			glDisable(GL_TEXTURE_2D);
			glDisable(GL_POINT_SMOOTH);
			if (getPointSpriteGLExt() == SUPPORTED)
				disablePointSpriteGLExt();
			break;

		case POINT_SPRITE :
			glEnable(GL_TEXTURE_2D);
			glBindTexture(GL_TEXTURE_2D,textureIndex);
			glTexEnvi(GL_TEXTURE_ENV,GL_TEXTURE_ENV_MODE,getTextureBlending());
			enablePointSpriteGLExt();
			break;

		case POINT_CIRCLE :
			glDisable(GL_TEXTURE_2D);
			glEnable(GL_POINT_SMOOTH);
			if (getPointSpriteGLExt() == SUPPORTED)
				disablePointSpriteGLExt();
			break;
		}

		if (worldSize)
			enablePointParameterGLExt(size,true);
		else
		{
			glPointSize(size);

			if (getPointParameterGLExt() == SUPPORTED)
				disablePointParameterGLExt();
		}

		glEnableClientState(GL_VERTEX_ARRAY);
		glEnableClientState(GL_COLOR_ARRAY);

		glColorPointer(group.getModel()->isEnabled(PARAM_ALPHA) ? 4 : 3,GL_FLOAT,group.getParamStride(),group.getParamAddress(PARAM_RED));
		glVertexPointer(3,GL_FLOAT,group.getPositionStride(),group.getPositionAddress());

		glDrawArrays(GL_POINTS,0,group.getNbParticles());

		glDisableClientState(GL_VERTEX_ARRAY);
		glDisableClientState(GL_COLOR_ARRAY);
	}
}}
