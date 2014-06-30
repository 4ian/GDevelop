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

#ifndef H_SPK_IRRBUFFER
#define H_SPK_IRRBUFFER

#include "RenderingAPIs/Irrlicht/SPK_IRR_DEF.h"
#include "Core/SPK_Buffer.h"

namespace SPK
{
namespace IRR
{
	/**
	* @enum E_IRRSPK_INDEXMODE
	* @brief Constant defining the way Irrlicht index buffer are stored
	* @since 1.04.00
	*/
    enum E_IRRSPK_INDEXMODE
    {
		EII_16BITS = irr::video::EIT_16BIT,	/**< Always use 16bits indices. Any attempt to create a buffer with more particles will fail */
     	EII_32BITS = irr::video::EIT_32BIT,	/**< Try to always use 32bits indices. If not available (old graphic cards), setting this indexmode will result in an undefined behavior */		
		EII_AUTO,							/**< Choose the best index mode according to the group size */
    };

	/**
	* @brief A buffer to store particle mesh data to be rendered with Irrlicht
	*
	* The buffer can hold an index buffer of either 16 bits or 32 bits indices.<br>
	* Moreover, it can be used as VBO and store on the GPU side in an optimized way.
	*
	* @since 1.04.00
	*/
    class SPK_IRR_PREFIX IRRBuffer : public Buffer
    {
	friend class IRRBufferCreator;

    public:

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Tells whether VBOs for this buffer are initialized or not
		* 
		* This is used internally by the renderers and may not be called by the user.
		*
		* @param init : true if VBOs are initialized, false of not
		*/
		void setVBOInitialized(bool init);

		/**
		* @brief Tells the amount of data that are used by the buffer
		*
		* This is used internally by the renderers and may not be called by the user.
		*
		* @param nb : the amount of data that are used by the buffer
		*/
		void setUsed(size_t nb);


		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the inner vertex buffer
		* @return the inner vertex buffer
		*/
		irr::scene::IVertexBuffer& getVertexBuffer();

		/**
		* @brief Gets the inner index buffer
		* @return the inner index buffer
		*/
		irr::scene::IIndexBuffer& getIndexBuffer();

		/**
		* @brief Gets the inner mesh buffer
		* @return the inner mesh buffer
		*/
		irr::scene::IDynamicMeshBuffer& getMeshBuffer();

		/**
		* @brief Tells whether VBOs are initialized for this buffer
		* 
		* This is used internally by the renderers and may not be called by the user.
		*
		* @return true if VBOs are initialized, false of not
		*/
		bool areVBOInitialized() const;


		////////////
		// static //
		////////////
	
		/**
		* @brief Sets whether to try to store IRRBuffers on GPU or not
		*
		* When creating an Irrlicht buffer, the system checks whether the VBO is activated or not.<br>
		* If yes, VBOs may be used.<br>
		* <br>
		* Not that activating VBOs is only a hint, the Irrlicht engine may not use them depending
		* on the buffer size, the renderer used and the graphic card.<br>
		* <br<
		* By default, VBOs are not used (the hint is deactivated)
		*
		* @param activate : true to try to use VBO when creating buffers, false not to
		*/
		static void activateVBOHint(bool activate);

		/**
		* @brief Tells whether VBO hint is activated or not
		* @return true if VBO hint is activated, alse if not
		* @since 1.05.03
		*/
		static bool isVBOHintActivated();

    private:

		irr::scene::CDynamicMeshBuffer meshBuffer;

		irr::IrrlichtDevice* device;

		size_t nbParticles;
		size_t particleVertexSize;
		size_t particleIndexSize;

		bool VBOInitialized;
		static bool useVBO;

		IRRBuffer(irr::IrrlichtDevice* device,size_t nbParticles,size_t particleVertexSize,size_t particleIndexSize,irr::video::E_INDEX_TYPE indexType);
		IRRBuffer(const IRRBuffer& buffer);
		virtual ~IRRBuffer();

		virtual void swap(size_t index0,size_t index1);

		void initInnerBuffers();
    };


	/**
	* @brief A buffer creator to create IRRBuffers
	* @since 1.04.00
	*/
    class SPK_IRR_PREFIX IRRBufferCreator : public BufferCreator
    {
    public:

		/**
		* @brief Constructor of IRRBufferCreator
		* @param device : A pointer to the Irrlicht Device 
		* @param particleVertexSize : the number of vertices per particle
		* @param particleIndexSize : the number of indices per particle
		* @param indexType : the index type
		*/
		IRRBufferCreator(irr::IrrlichtDevice* device,size_t particleVertexSize,size_t particleIndexSize,E_IRRSPK_INDEXMODE indexType = EII_AUTO);

    private:
	
		irr::IrrlichtDevice* device;

		size_t particleVertexSize;
		size_t particleIndexSize;
        E_IRRSPK_INDEXMODE indexType;

        virtual IRRBuffer* createBuffer(size_t nbParticles, const Group& group) const;
    };


	inline irr::scene::IVertexBuffer& IRRBuffer::getVertexBuffer()
	{
		return meshBuffer.getVertexBuffer();
	}

	inline irr::scene::IIndexBuffer& IRRBuffer::getIndexBuffer()
	{
		return meshBuffer.getIndexBuffer();
	}

	inline irr::scene::IDynamicMeshBuffer& IRRBuffer::getMeshBuffer()
	{
		return meshBuffer;
	}

	inline void IRRBuffer::setUsed(size_t nb)
	{
		if (nb > nbParticles) // Prevents the buffers from growing
			nb = nbParticles;

		getVertexBuffer().set_used(nb * particleVertexSize);
		getIndexBuffer().set_used(nb * particleIndexSize);
	}

	inline bool IRRBuffer::areVBOInitialized() const
	{
		return VBOInitialized;
	}

	inline void IRRBuffer::setVBOInitialized(bool init)
	{
		VBOInitialized = init;
	}

	inline bool IRRBuffer::isVBOHintActivated()
	{
		return useVBO;
	}
}}

#endif
