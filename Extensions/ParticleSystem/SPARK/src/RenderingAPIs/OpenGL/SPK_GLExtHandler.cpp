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


#include "RenderingAPIs/OpenGL/SPK_GLExtHandler.h"

#if defined(__APPLE__) || defined(macintosh)
// Necessary includes to get GL functions pointers from MAC
#include <mach-o/dyld.h>
#include <stdlib.h>
#include <string.h>
#endif

namespace SPK
{
namespace GL
{
	GLExtHandler::GLExtension GLExtHandler::pointSpriteGLExt = UNCHECKED;
	GLExtHandler::GLExtension GLExtHandler::pointParameterGLExt = UNCHECKED;
	GLExtHandler::GLExtension GLExtHandler::texture3DGLExt = UNCHECKED;
	GLExtHandler::GLExtension GLExtHandler::shaderGLExt = UNCHECKED;

	GLExtHandler::SPK_PFNGLPOINTPARAMETERFPROC GLExtHandler::SPK_glPointParameterf = NULL;
	GLExtHandler::SPK_PFNGLPOINTPARAMETERFVPROC GLExtHandler::SPK_glPointParameterfv = NULL;
	GLExtHandler::SPK_PFNGLTEXIMAGE3DPROC GLExtHandler::SPK_glTexImage3D = NULL;
	GLExtHandler::SPK_PFNGLCREATESHADERPROC GLExtHandler::SPK_glCreateShader = NULL;
	GLExtHandler::SPK_PFNGLDELETESHADERPROC GLExtHandler::SPK_glDeleteShader = NULL;
	GLExtHandler::SPK_PFNGLSHADERSOURCEPROC GLExtHandler::SPK_glShaderSource = NULL;
	GLExtHandler::SPK_PFNGLCOMPILESHADERPROC GLExtHandler::SPK_glCompileShader = NULL;
	GLExtHandler::SPK_PFNGLCREATEPROGRAMPROC GLExtHandler::SPK_glCreateProgram = NULL;
	GLExtHandler::SPK_PFNGLDELETEPROGRAMPROC GLExtHandler::SPK_glDeleteProgram = NULL;
	GLExtHandler::SPK_PFNGLATTACHSHADERPROC GLExtHandler::SPK_glAttachShader = NULL;
	GLExtHandler::SPK_PFNGLDETACHSHADERPROC GLExtHandler::SPK_glDetachShader = NULL;
	GLExtHandler::SPK_PFNGLLINKPROGRAMPROC GLExtHandler::SPK_glLinkProgram = NULL;
	GLExtHandler::SPK_PFNGLUSEPROGRAMPROC GLExtHandler::SPK_glUseProgram = NULL;

	const float GLExtHandler::QUADRATIC_SCREEN[3] = {1.0f,0.0f,0.0f};

	float GLExtHandler::pixelPerUnit = 1024.0f;

	const float GLExtHandler::POINT_SIZE_CURRENT = 32.0f;
	const float GLExtHandler::POINT_SIZE_MIN = 1.0f;
	const float GLExtHandler::POINT_SIZE_MAX = 1024.0f;

#ifdef SPK_NO_GLEXT
	bool GLExtHandler::loadGLExtPointSprite()
	{
		pointSpriteGLExt = UNSUPPORTED;
		return false;
	}

	bool GLExtHandler::loadGLExtPointParameter()
	{
		pointParameterGLExt = UNSUPPORTED;
		return false;
	}

	bool GLExtHandler::loadGLExtTexture3D()
	{
		texture3DGLExt = UNSUPPORTED;
		return false;
	}

	bool GLExtHandler::loadGLExtShader()
	{
		shaderGLExt = UNSUPPORTED;
		return false;
	}
#else
	bool GLExtHandler::loadGLExtPointSprite()
	{
		if (pointSpriteGLExt == UNCHECKED)
		{
			pointSpriteGLExt = UNSUPPORTED;

			std::string version = reinterpret_cast<const char*>(glGetString(GL_VERSION));
			// openGL 2.0 and higher
			if (int(version[0] - '0') >= 2)
				pointSpriteGLExt = SUPPORTED;
			else
			{
				std::string extensions = reinterpret_cast<const char*>(glGetString(GL_EXTENSIONS));
				if ((extensions.find("GL_ARB_point_sprites") != std::string::npos)
					||(extensions.find("GL_NV_point_sprites") != std::string::npos))
					pointSpriteGLExt = SUPPORTED;
			}
		}

		return pointSpriteGLExt == SUPPORTED;
	}

	bool GLExtHandler::loadGLExtPointParameter()
	{
		if (pointParameterGLExt == UNCHECKED)
		{
			pointParameterGLExt = UNSUPPORTED;

			std::string version = reinterpret_cast<const char*>(glGetString(GL_VERSION));
			std::string extensions = reinterpret_cast<const char*>(glGetString(GL_EXTENSIONS));

			// openGL 1.4 and higher
			if (((int(version[0] - '0') == 1)&&(int(version[2] - '0') >= 4))
				||(int(version[0] - '0') > 1))
			{
				SPK_glPointParameterf  = (SPK_PFNGLPOINTPARAMETERFPROC)glGetProcAddress("glPointParameterf");
				SPK_glPointParameterfv = (SPK_PFNGLPOINTPARAMETERFVPROC)glGetProcAddress("glPointParameterfv");
			}

			// point parameter ARB
			if (((SPK_glPointParameterf == NULL)||(SPK_glPointParameterfv == NULL))
				&&(extensions.find("GL_ARB_point_parameters") != std::string::npos))
			{
				SPK_glPointParameterf  = (SPK_PFNGLPOINTPARAMETERFPROC)glGetProcAddress("glPointParameterfARB");
				SPK_glPointParameterfv = (SPK_PFNGLPOINTPARAMETERFVPROC)glGetProcAddress("glPointParameterfvARB");
			}

			// point parameter EXT
			if (((SPK_glPointParameterf == NULL)||(SPK_glPointParameterfv == NULL))
				&&(extensions.find("GL_EXT_point_parameters") != std::string::npos))
			{
				SPK_glPointParameterf  = (SPK_PFNGLPOINTPARAMETERFPROC)glGetProcAddress("glPointParameterfEXT");
				SPK_glPointParameterfv = (SPK_PFNGLPOINTPARAMETERFVPROC)glGetProcAddress("glPointParameterfvEXT");
			}

			// point parameter SGIS
			if (((SPK_glPointParameterf == NULL)||(SPK_glPointParameterfv == NULL))
				&&(extensions.find("GL_SGIS_point_parameters") != std::string::npos))
			{
				SPK_glPointParameterf  = (SPK_PFNGLPOINTPARAMETERFPROC)glGetProcAddress("glPointParameterfSGIS");
				SPK_glPointParameterfv = (SPK_PFNGLPOINTPARAMETERFVPROC)glGetProcAddress("glPointParameterfvSGIS");
			}

			if ((SPK_glPointParameterf != NULL)&&(SPK_glPointParameterfv != NULL))
				pointParameterGLExt = SUPPORTED;
		}

		return pointParameterGLExt == SUPPORTED;
	}

	bool GLExtHandler::loadGLExtTexture3D()
	{
		if (texture3DGLExt == UNCHECKED)
		{
			texture3DGLExt = UNSUPPORTED;

			std::string version = reinterpret_cast<const char*>(glGetString(GL_VERSION));
			std::string extensions = reinterpret_cast<const char*>(glGetString(GL_EXTENSIONS));

			// openGL 1.2 and higher
			if (((int(version[0] - '0') == 1)&&(int(version[2] - '0') >= 4))
				||(int(version[0] - '0') > 1))
				SPK_glTexImage3D  = (SPK_PFNGLTEXIMAGE3DPROC)glGetProcAddress("glTexImage3D");

			// texture 3D EXT
			if ((SPK_glTexImage3D == NULL)&&(extensions.find("GL_EXT_texture3D") != std::string::npos))
				SPK_glTexImage3D  = (SPK_PFNGLTEXIMAGE3DPROC)glGetProcAddress("glTexImage3DEXT");

			if (SPK_glTexImage3D != NULL)
				texture3DGLExt = SUPPORTED;
		}

		return texture3DGLExt == SUPPORTED;
	}

	bool GLExtHandler::loadGLExtShader()
	{
		if (shaderGLExt == UNCHECKED)
		{
			shaderGLExt = UNSUPPORTED;

			std::string version = reinterpret_cast<const char*>(glGetString(GL_VERSION));

			// openGL 2.0 and higher
			if (int(version[0] - '0') >= 2)
			{
				bool ok = true;

				if (ok && ((SPK_glCreateShader = (SPK_PFNGLCREATESHADERPROC)glGetProcAddress("glCreateShader")) == NULL))		ok = false;
				if (ok && ((SPK_glDeleteShader = (SPK_PFNGLDELETESHADERPROC)glGetProcAddress("glDeleteShader")) == NULL))		ok = false;
				if (ok && ((SPK_glShaderSource = (SPK_PFNGLSHADERSOURCEPROC)glGetProcAddress("glShaderSource")) == NULL))		ok = false;
				if (ok && ((SPK_glCompileShader = (SPK_PFNGLCOMPILESHADERPROC)glGetProcAddress("glCompileShader")) == NULL))	ok = false;
				if (ok && ((SPK_glCreateProgram = (SPK_PFNGLCREATEPROGRAMPROC)glGetProcAddress("glCreateProgram")) == NULL))	ok = false;
				if (ok && ((SPK_glDeleteProgram = (SPK_PFNGLDELETEPROGRAMPROC)glGetProcAddress("glDeleteProgram")) == NULL))	ok = false;
				if (ok && ((SPK_glAttachShader = (SPK_PFNGLATTACHSHADERPROC)glGetProcAddress("glAttachShader")) == NULL))		ok = false;
				if (ok && ((SPK_glDetachShader = (SPK_PFNGLDETACHSHADERPROC)glGetProcAddress("glDetachShader")) == NULL))		ok = false;
				if (ok && ((SPK_glLinkProgram = (SPK_PFNGLLINKPROGRAMPROC)glGetProcAddress("glLinkProgram")) == NULL))			ok = false;
				if (ok && ((SPK_glUseProgram = (SPK_PFNGLUSEPROGRAMPROC)glGetProcAddress("glUseProgram")) == NULL))				ok = false;
	
				if (ok) shaderGLExt = SUPPORTED;
			}

			if (shaderGLExt == UNSUPPORTED)
			{
				std::string extensions = reinterpret_cast<const char*>(glGetString(GL_EXTENSIONS));
				
				if ((extensions.find("GL_ARB_shading_language_100") != std::string::npos)&&
					(extensions.find("GL_ARB_shader_objects") != std::string::npos)&&
					(extensions.find("GL_ARB_vertex_shader") != std::string::npos)&&
					(extensions.find("GL_ARB_fragment_shader") != std::string::npos))
				{
					bool ok = true;

					if (ok && ((SPK_glCreateShader = (SPK_PFNGLCREATESHADERPROC)glGetProcAddress("glCreateShaderObjectARB")) == NULL))				ok = false;
					if (ok && ((SPK_glDeleteShader = SPK_glDeleteProgram = (SPK_PFNGLDELETESHADERPROC)glGetProcAddress("glDeleteObjectARB")) == NULL))	ok = false;
					if (ok && ((SPK_glShaderSource = (SPK_PFNGLSHADERSOURCEPROC)glGetProcAddress("glShaderSourceARB")) == NULL))					ok = false;
					if (ok && ((SPK_glCompileShader = (SPK_PFNGLCOMPILESHADERPROC)glGetProcAddress("glCompileShaderARB")) == NULL))					ok = false;
					if (ok && ((SPK_glCreateProgram = (SPK_PFNGLCREATEPROGRAMPROC)glGetProcAddress("glCreateProgramObjectARB")) == NULL))			ok = false;
					if (ok && ((SPK_glAttachShader = (SPK_PFNGLATTACHSHADERPROC)glGetProcAddress("glAttachObjectARB")) == NULL))					ok = false;
					if (ok && ((SPK_glDetachShader = (SPK_PFNGLDETACHSHADERPROC)glGetProcAddress("glDetachObjectARB")) == NULL))					ok = false;
					if (ok && ((SPK_glLinkProgram = (SPK_PFNGLLINKPROGRAMPROC)glGetProcAddress("glLinkProgramARB")) == NULL))						ok = false;
					if (ok && ((SPK_glUseProgram = (SPK_PFNGLUSEPROGRAMPROC)glGetProcAddress("glUseProgramObjectARB")) == NULL))					ok = false;
				
					if (ok) shaderGLExt = SUPPORTED;
				}
			}
		}

		return shaderGLExt == SUPPORTED;
	}
#endif

#if defined(__APPLE__) || defined(macintosh)
	void* GLExtHandler::SPK_NSGLGetProcAddress(const char* name)
	{
		NSSymbol symbol;
		char *symbolName;

		symbolName = (char*)malloc (strlen (name) + 2);
		strcpy(symbolName + 1, name);
		symbolName[0] = '_';
		symbol = NULL;

		if (NSIsSymbolNameDefined (symbolName))
			symbol = NSLookupAndBindSymbol (symbolName);

		free (symbolName);

		return symbol ? NSAddressOfSymbol (symbol) : NULL; 
	}
#endif

	void GLExtHandler::setPixelPerUnit(float fovy,int screenHeight)
	{
		// the pixel per unit is computed for a distance from the camera of screenHeight
		pixelPerUnit = screenHeight / (2.0f * tan(fovy * 0.5f));
	}

	void GLExtHandler::glTexImage3D(GLenum target,
			GLint level,
			GLenum internalFormat,
			GLsizei width,
			GLsizei height,
			GLsizei depth,
			GLint border,
			GLenum format,
			GLenum type,
			const GLvoid* pixels)
	{
		if (loadGLExtTexture3D())
			SPK_glTexImage3D(target,level,internalFormat,width,height,depth,border,format,type,pixels);
	}

	GLExtHandler::GLExtension GLExtHandler::getPointSpriteGLExt()
	{
		return pointSpriteGLExt;
	}

	GLExtHandler::GLExtension GLExtHandler::getPointParameterGLExt()
	{
		return pointParameterGLExt;
	}

	void GLExtHandler::enablePointParameterGLExt(float size,bool distance)
	{
		// derived size = size * sqrt(1 / (A + B * distance + C * distance²))
		if (distance)
		{
			const float sqrtC = POINT_SIZE_CURRENT / (size * pixelPerUnit);
			const float QUADRATIC_WORLD[3] = {0.0f,0.0f,sqrtC * sqrtC}; // A = 0; B = 0; C = (POINT_SIZE_CURRENT / (size * pixelPerUnit))²
			SPK_glPointParameterfv(GL_POINT_DISTANCE_ATTENUATION,QUADRATIC_WORLD);
		}
		else
		{
			const float sqrtA = POINT_SIZE_CURRENT / size;
			const float QUADRATIC_WORLD[3] = {sqrtA * sqrtA,0.0f,0.0f};	// A = (POINT_SIZE_CURRENT / size)²; B = 0; C = 0
			SPK_glPointParameterfv(GL_POINT_DISTANCE_ATTENUATION,QUADRATIC_WORLD);
		}

 		glPointSize(POINT_SIZE_CURRENT);
		SPK_glPointParameterf(GL_POINT_SIZE_MIN,POINT_SIZE_MIN);
		SPK_glPointParameterf(GL_POINT_SIZE_MAX,POINT_SIZE_MAX);
	}

	void GLExtHandler::disablePointParameterGLExt()
	{
		SPK_glPointParameterfv(GL_POINT_DISTANCE_ATTENUATION,QUADRATIC_SCREEN);
	}

	GLExtHandler::GLExtension GLExtHandler::getTexture3DGLExt()
	{
		return texture3DGLExt;
	}

	GLExtHandler::GLExtension GLExtHandler::getShaderGLExt()
	{
		return shaderGLExt;
	}
}}
