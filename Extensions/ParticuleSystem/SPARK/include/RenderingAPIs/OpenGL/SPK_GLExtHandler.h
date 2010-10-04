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


#ifndef H_SPK_GLEXTHANDLER
#define H_SPK_GLEXTHANDLER

#include "Core/SPK_DEF.h"
#include "RenderingAPIs/OpenGL/SPK_GL_DEF.h"

// OpenGL defines (from glext.h)
#define GL_POINT_SPRITE                   0x8861
#define GL_COORD_REPLACE                  0x8862
#define GL_POINT_DISTANCE_ATTENUATION     0x8129
#define GL_POINT_SIZE_MIN                 0x8126
#define GL_POINT_SIZE_MAX                 0x8127
#define GL_TEXTURE_3D                     0x806F


namespace SPK
{
namespace GL
{
	/**
	* @class GLExtHandler
	* @brief A class to handle OpenGL extensions
	*
	* This class presents an interface to handle openGL extensions.<br>
	* The interface is static an has a public and a protected side.<br>
	* <br>
	* A class willing to make use of the openGL extensions must derive from this class to access the protected interface.<br>
	* <br>
	* If an OpenGL extension is not handle by this class,
	* the proper way to implement it within SPARK will be to derive this class to implement it.
	* Then the Renderer which will use the extension has to extends the child class.
	* <br>
	* The opengl extensions implemented are :<ul>
	* <li>point sprites : used in SPARK to attach images on points and therfore gain performance</li>
	* <li>point parameters : used in SPARK both to allow to have points size function of the distance and 
	* to overtake the basic point size limitation (usually 64 pix).</li>
	* <li>texture 3D : used in SPARK to animate texture</li>
	* </ul>
	*
	* @since 1.01.00
	*/
	class SPK_GL_PREFIX GLExtHandler
	{
	public :

		///////////////////
		// Point Sprites //
		///////////////////

		/**
		* @brief Loads the openGL point sprite extension
		*
		* Note that this methods is called internally when needed.<br>
		* The extension is loaded or not only at the first call to this method,
		* the following calls only tell whether the extension was loaded or not.<br>
		* In that way, this method is only useful to the user, to check whether the extension is supported or not.
		*
		* @return true if the extension is loaded (supported by the hardware), false if not
		*/
		static bool loadGLExtPointSprite();

		//////////////////////
		// Point Parameters //
		//////////////////////

		/**
		* @brief Loads the openGL extended point parameter extension
		*
		* Note that this methods is called internally when needed.<br>
		* The extension is loaded or not only at the first call to this method,
		* the further calls only tell whether the extension was loaded or not.<br>
		* In that way, this method is only useful to the user, to check whether the extension is supported or not.
		*
		* @return true if the extension is loaded (supported by the hardware), false if not
		*/
		static bool loadGLExtPointParameter();

		/**
		* @brief Computes a conversion ratio between pixels and universe units
		*
		* This method must be called when using GLPointRenderer with world size enabled.<br>
		* It allows to well transpose world size to pixel size by setting the right openGL parameters.<br>
		* <br>
		* Note that fovy can be replaced by fovx if screenHeight is replaced by screenWidth.
		*
		* @param fovy : the field of view in the y axis in radians
		* @param screenHeight : the height of the viewport in pixels
		*/
		static void setPixelPerUnit(float fovy,int screenHeight);

		////////////////
		// Texture 3D //
		////////////////

		/**
		* @brief Loads the OpenGL texture 3D extension
		*
		* Note that this methods is called internally when needed.<br>
		* The extension is loaded or not only at the first call to this method,
		* the further calls only tell whether the extension was loaded or not.<br>
		* In that way, this method is only useful to the user, to check whether the extension is supported or not.
		*
		* @return true if the extension is loaded (supported by the hardware), false if not
		* @since 1.02.00
		*/
		static bool loadGLExtTexture3D();

		/**
		* @brief Specifies a three-dimensional texture image
		* 
		* This method is exactly like calling the glTexImage3D method of OpenGL
		* excepts it is already defined.<br>
		* If the OpenGL texture 3D extension is not supported, this method does nothing.<br>
		* <br>
		* For more information, check the OpenGL documentation of glTexImage3D.
		*
		* @param target : check the OpenGL documentation of glTexImage3D
		* @param level : check the OpenGL documentation of glTexImage3D
		* @param internalFormat : check the OpenGL documentation of glTexImage3D
		* @param width : check the OpenGL documentation of glTexImage3D
		* @param height : check the OpenGL documentation of glTexImage3D
		* @param depth : check the OpenGL documentation of glTexImage3D
		* @param border : check the OpenGL documentation of glTexImage3D
		* @param format : check the OpenGL documentation of glTexImage3D
		* @param type : check the OpenGL documentation of glTexImage3D
		* @param pixels : check the OpenGL documentation of glTexImage3D
		* @since 1.02.00
		*/
		static void glTexImage3D(GLenum target,
			GLint level,
			GLenum internalFormat,
			GLsizei width,
			GLsizei height,
			GLsizei depth,
			GLint border,
			GLenum format,
			GLenum type,
			const GLvoid* pixels);

		/////////////
		// Shaders //
		/////////////

		/**
		* @brief Loads the shader extension
		*
		* Note that this methods is called internally when needed.<br>
		* The extension is loaded or not only at the first call to this method,
		* the further calls only tell whether the extension was loaded or not.<br>
		* In that way, this method is only useful to the user, to check whether the extension is supported or not.<br>
		* <br>
		* NOTE THAT FOR THE MOMENT, EVEN IF SHADER EXTENSIONS CAN BE LOADED, THEY ARE NOT USED WITHIN SPARK
		*
		* @return true if the extension is loaded (supported by the hardware), false if not
		* @since 1.04.00
		*/
		static bool loadGLExtShader();

	protected :

		/**
		* @enum GLExtension
		* @brief Constants for openGL extension loading
		*/
		enum GLExtension
		{
			UNCHECKED,		/**< Constant meaning the openGL extension was not tested */
			SUPPORTED,		/**< Constant meaning the openGL extension is supported by the hardware */
			UNSUPPORTED,	/**< Constant meaning the openGL extension is not supported by the hardware */
		};

		/**
		* @brief Gets the address of an OpenGL function in a portable way
		* @param name : the name of the OpenGL function
		* @return a pointer to the OpenGL function, or NULL if the function is not found
		*/
		static inline void* glGetProcAddress(const char* name);
		
		///////////////////
		// Point Sprites //
		///////////////////

		/**
		* @brief Gets the state of the point sprite extension
		* @return the state of the point sprite extension
		*/
		static GLExtension getPointSpriteGLExt();

		/** 
		* @brief Enables the use of point sprites 
		*
		* Note that before calling this method, the user must ensure that the point sprite extension is loaded.
		*/
		inline static void enablePointSpriteGLExt();

		/** 
		* @brief Disables the use of point sprites 
		*
		* Note that before calling this method, the user must ensure that the point sprite extension is loaded.
		*/
		inline static void disablePointSpriteGLExt();

		//////////////////////
		// Point Parameters //
		//////////////////////

		/**
		* @brief Gets the state of the point parameters extension
		* @return the state of the point parameters extension
		*/
		static GLExtension getPointParameterGLExt();

		/**
		* @brief Enables the use of point parameters
		*
		* This method will set the right point parameters to get the desired point size.<br>
		* <br>
		* It can either be used to have points size function of the distance to the camera (is distance is true)
		* or only to allow bigger range for point sizes (if distance is false).
		* <br>
		* Note that if distance is set to true setPixelPerUnit(float,int) must be call once before.
		* <br>
		* Note that before calling this method, the user must ensure that the point parameters extension is loaded.
		*
		* @param size : the size of the point
		* @param distance : true to enable the modification of the size function of the distance, false not to.
		*/
		static void enablePointParameterGLExt(float size,bool distance);

		/** 
		* @brief Disables the use of point parameters 
		*
		* Note that before calling this method, the user must ensure that the point parameters extension is loaded.
		*/
		static void disablePointParameterGLExt();

		////////////////
		// Texture 3D //
		////////////////

		/**
		* @brief Gets the state of the texture 3D extension
		* @return the state of the texture 3D extension
		* @since 1.02.00
		*/
		static GLExtension getTexture3DGLExt();

		/////////////
		// Shaders //
		/////////////

		/**
		* @brief Gets the state of the shader support
		* @return the state of the vertex shader support
		* @since 1.04.00
		*/
		static GLExtension getShaderGLExt();

	private :

		// GLchar definition
		typedef char GLchar;

		// typedefs for OpenGL pointers of functions (glext.h is however needed)
		typedef void (APIENTRY *SPK_PFNGLPOINTPARAMETERFPROC)(GLenum,GLfloat);
		typedef void (APIENTRY *SPK_PFNGLPOINTPARAMETERFVPROC)(GLenum,const GLfloat*);
		typedef void (APIENTRY *SPK_PFNGLTEXIMAGE3DPROC)(GLenum,GLint,GLint,GLsizei,GLsizei,GLsizei,GLint,GLenum,GLenum,const GLvoid*);
		typedef void (APIENTRY *SPK_PFNGLCREATESHADERPROC)(GLenum);
		typedef void (APIENTRY *SPK_PFNGLDELETESHADERPROC)(GLuint);
		typedef void (APIENTRY *SPK_PFNGLSHADERSOURCEPROC)(GLuint,GLsizei,const GLchar**,const GLint*);
		typedef void (APIENTRY *SPK_PFNGLCOMPILESHADERPROC)(GLuint);
		typedef void (APIENTRY *SPK_PFNGLCREATEPROGRAMPROC)(void);
		typedef void (APIENTRY *SPK_PFNGLDELETEPROGRAMPROC)(GLuint);
		typedef void (APIENTRY *SPK_PFNGLATTACHSHADERPROC)(GLuint,GLuint);
		typedef void (APIENTRY *SPK_PFNGLDETACHSHADERPROC)(GLuint,GLuint);
		typedef void (APIENTRY *SPK_PFNGLLINKPROGRAMPROC)(GLuint);
		typedef void (APIENTRY *SPK_PFNGLUSEPROGRAMPROC)(GLuint);

		// Gets the GL function address on MAC
#if defined(__APPLE__) || defined(macintosh)
		static void* SPK_NSGLGetProcAddress(const char* name);
#endif

		///////////////////
		// Point Sprites //
		///////////////////

		static GLExtension pointSpriteGLExt;

		//////////////////////
		// Point Parameters //
		//////////////////////

		static GLExtension pointParameterGLExt;

		static SPK_PFNGLPOINTPARAMETERFPROC SPK_glPointParameterf;
		static SPK_PFNGLPOINTPARAMETERFVPROC SPK_glPointParameterfv;

		static const float POINT_SIZE_CURRENT;
		static const float POINT_SIZE_MIN;
		static const float POINT_SIZE_MAX;

		static float pixelPerUnit;

		static const float QUADRATIC_SCREEN[3];

		////////////////
		// Texture 3D //
		////////////////

		static GLExtension texture3DGLExt;

		static SPK_PFNGLTEXIMAGE3DPROC SPK_glTexImage3D;

		//////////////
		//  Shaders //
		//////////////

		static GLExtension shaderGLExt;

		static SPK_PFNGLCREATESHADERPROC SPK_glCreateShader;
		static SPK_PFNGLDELETESHADERPROC SPK_glDeleteShader;
		static SPK_PFNGLSHADERSOURCEPROC SPK_glShaderSource;
		static SPK_PFNGLCOMPILESHADERPROC SPK_glCompileShader;
		static SPK_PFNGLCREATEPROGRAMPROC SPK_glCreateProgram;
		static SPK_PFNGLDELETEPROGRAMPROC SPK_glDeleteProgram;
		static SPK_PFNGLATTACHSHADERPROC SPK_glAttachShader;
		static SPK_PFNGLDETACHSHADERPROC SPK_glDetachShader;
		static SPK_PFNGLLINKPROGRAMPROC SPK_glLinkProgram;
		static SPK_PFNGLUSEPROGRAMPROC SPK_glUseProgram;
	};


	inline void* GLExtHandler::glGetProcAddress(const char* name)
	{
#if defined(WIN32) || defined(_WIN32)
		return (void*)wglGetProcAddress(name);			// Windows
#elif defined(__APPLE__) || defined(macintosh)
		return (void*)SPK_NSGLGetProcAddress(name);		// MAC
#elif defined(linux) || defined(__linux)
		return (void*)glXGetProcAddressARB(name);		// Linux
#else
		return (void*)NULL;
#endif
	}

	inline void GLExtHandler::enablePointSpriteGLExt()
	{
		glTexEnvf(GL_POINT_SPRITE,GL_COORD_REPLACE,GL_TRUE);
		glEnable(GL_POINT_SPRITE);
	}

	inline void GLExtHandler::disablePointSpriteGLExt()
	{
		glDisable(GL_POINT_SPRITE);
	}
}}

#endif
