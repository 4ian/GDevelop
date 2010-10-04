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


//////////////////////////////////////////////////////////////////////////////////
// Note :																		//
//																				//
// This file is used to speed up the compilation of a module, lower the size	//
// of the output library on certain compilers and allow deeper optimizations	//
// by reunifying all compilation units into one (single compilation unit		//
// method).																		//
//																				//
// Either only this file or all the files below should be compiled, not both or	//
// some 'multiple definition of symbols' errors will occur.						//
//////////////////////////////////////////////////////////////////////////////////


// GL
#include "RenderingAPIs/OpenGL/SPK_GLExtHandler.cpp" // 1.01
#include "RenderingAPIs/OpenGL/SPK_GLRenderer.cpp"
#include "RenderingAPIs/OpenGL/SPK_GLLineRenderer.cpp"
#include "RenderingAPIs/OpenGL/SPK_GLPointRenderer.cpp"
#include "RenderingAPIs/OpenGL/SPK_GLQuadRenderer.cpp"
#include "RenderingAPIs/OpenGL/SPK_GLLineTrailRenderer.cpp" // 1.03
