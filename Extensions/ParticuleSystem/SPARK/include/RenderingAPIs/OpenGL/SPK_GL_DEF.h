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


#ifndef H_SPK_GL_DEF
#define H_SPK_GL_DEF

#ifdef _MSC_VER
#pragma warning(disable : 4275) // disables the warning about exporting DLL classes children of non DLL classes
#endif

// 1.02.02 Compatibility with older versions
#ifdef SPK_DLL
#define SPK_GL_IMPORT
#endif

#ifdef SPK_GL_EXPORT
#define SPK_GL_PREFIX __declspec(dllexport)
#elif defined(SPK_IMPORT) || defined(SPK_GL_IMPORT)
#define SPK_GL_PREFIX __declspec(dllimport) 
#else
#define SPK_GL_PREFIX
#endif

#ifndef SPK_NO_GL_INC

#if defined(WIN32) || defined(_WIN32)
#include <windows.h>
#endif

#if defined(__APPLE__)
#include <OpenGL/gl.h>
#elif defined(macintosh)
#include <gl.h>
#else
#include <GL/gl.h>
#endif

#if defined(linux) || defined(__linux)
#include <GL/glx.h>
#endif

#endif

// Defines the APIENTRY if not already done
#ifndef APIENTRY
#define APIENTRY
#endif

/**
* @namespace SPK::GL
* @brief the namespace for openGL dependent SPARK code
* @since 1.01.00
*/

#endif
