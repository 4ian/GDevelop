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


#ifndef H_SPK_GLRENDERER
#define H_SPK_GLRENDERER

#include "RenderingAPIs/OpenGL/SPK_GL_DEF.h"
#include "Core/SPK_Renderer.h"

namespace SPK
{
namespace GL
{
	/**
	* @class GLRenderer
	* @brief An abstract Renderer for the openGL renderers
	*/
	class SPK_GL_PREFIX GLRenderer : public Renderer
	{
	public :

		/////////////////
		// Constructor //
		/////////////////

		/** @brief Constructor of GLRenderer */
		GLRenderer();

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of GLRenderer */
		virtual ~GLRenderer();

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Enables or disables the blending of this GLRenderer
		* @param blendingEnabled true to enable the blending, false to disable it
		*/
		virtual void enableBlending(bool blendingEnabled);

		/**
		* @brief Sets the blending functions of this GLRenderer
		*
		* the blending functions are one of the openGL blending functions.
		*
		* @param src : the source blending function of this GLRenderer
		* @param dest : the destination blending function of this GLRenderer
		*/
		void setBlendingFunctions(GLuint src,GLuint dest);
		virtual void setBlending(BlendingMode blendMode);

		/**
		* @brief Sets the texture blending function of this GLRenderer
		*
		* the texture blending function is one of the openGL texture blending functions.
		*
		* @param textureBlending : the texture blending function of this GLRenderer
		*/
		void setTextureBlending(GLuint textureBlending);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Tells whether blending is enabled for this GLRenderer
		* @return true if blending is enabled, false if it is disabled
		*/
		bool isBlendingEnabled() const;

		/**
		* @brief Gets the source blending function of this GLRenderer
		* @return the source blending function of this GLRenderer
		*/
		GLuint getSrcBlendingFunction() const;

		/**
		* @brief Gets the destination blending function of this GLRenderer
		* @return the source destination function of this GLRenderer
		*/
		GLuint getDestBlendingFunction() const;

		/**
		* @brief Gets the texture blending function of this GLRenderer
		* @return the texture blending function of this GLRenderer
		*/
		GLuint getTextureBlending() const;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Saves the current openGL states
		*
		* This method saves all the states that are likely to be modified by a GLRenderer.<br>
		* Use restoreGLStates() to restore the states.<br>
		* <br>
		* Note that for one saveGLStates call, a call to restoreGLStates must occur.
		* In case of several saveGLStates with no restoreGLStates, the restoreGLStates is called priorly in an implicit way.
		*/
		static void saveGLStates();

		/**
		* @brief Restores the openGL states
		*
		* This method restores the openGL states at the values they were at the last call of saveGLStates().
		*/
		static void restoreGLStates();

	protected :

		/** @brief Inits the blending of this GLRenderer */
		void initBlending() const;

		/**
		* @brief Inits the rendering hints of this GLRenderer
		* @since 1.04.00
		*/
		void initRenderingHints() const;

	private :

		bool blendingEnabled;
		GLuint srcBlending;
		GLuint destBlending;

		GLuint textureBlending;
	};


	inline void GLRenderer::enableBlending(bool blendingEnabled)
	{
		this->blendingEnabled = blendingEnabled;
	}

	inline void GLRenderer::setBlendingFunctions(GLuint src,GLuint dest)
	{
		srcBlending = src;
		destBlending = dest;
	}

	inline void GLRenderer::setTextureBlending(GLuint textureBlending)
	{
		this->textureBlending = textureBlending;
	}

	inline bool GLRenderer::isBlendingEnabled() const
	{
		return blendingEnabled;
	}

	inline GLuint GLRenderer::getSrcBlendingFunction() const
	{
		return srcBlending;
	}

	inline GLuint GLRenderer::getDestBlendingFunction() const
	{
		return destBlending;
	}

	inline GLuint GLRenderer::getTextureBlending() const
	{
		return textureBlending;
	}

	inline void GLRenderer::initBlending() const
	{
		if (blendingEnabled)
		{
			glBlendFunc(srcBlending,destBlending);
			glEnable(GL_BLEND);
		}
		else
			glDisable(GL_BLEND);
	}

	inline void GLRenderer::initRenderingHints() const
	{
		// alpha test
		if (isRenderingHintEnabled(ALPHA_TEST))
		{
			glAlphaFunc(GL_GEQUAL,getAlphaTestThreshold());
			glEnable(GL_ALPHA_TEST);
		}
		else
			glDisable(GL_ALPHA_TEST);

		// depth test
		if (isRenderingHintEnabled(DEPTH_TEST))
			glEnable(GL_DEPTH_TEST);
		else
			glDisable(GL_DEPTH_TEST);

		// depth write
		glDepthMask(isRenderingHintEnabled(DEPTH_WRITE));
	}
}}

#endif
