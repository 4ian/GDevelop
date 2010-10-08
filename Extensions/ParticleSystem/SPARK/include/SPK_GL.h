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


#ifndef H_SPK_GL
#define H_SPK_GL

// Defines
#include "RenderingAPIs/OpenGL/SPK_GL_DEF.h"

// Extension interface
#include "RenderingAPIs/OpenGL/SPK_GLExtHandler.h" // 1.01

// Mother Renderer
#include "RenderingAPIs/OpenGL/SPK_GLRenderer.h"

// Renderers
#include "RenderingAPIs/OpenGL/SPK_GLPointRenderer.h"
#include "RenderingAPIs/OpenGL/SPK_GLLineRenderer.h"
#include "RenderingAPIs/OpenGL/SPK_GLQuadRenderer.h"
#include "RenderingAPIs/OpenGL/SPK_GLLineTrailRenderer.h" // 1.03

#endif
