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


#ifndef H_SPK_ARRAYBUFFER
#define H_SPK_ARRAYBUFFER

#include "Core/SPK_Buffer.h"

namespace SPK
{
	class Group;
	template<class T> class ArrayBufferCreator;

	/**
	* @brief A template buffer that holds an array of elements of type T
	* @since 1.03.02
	*/
	template<class T>
	class ArrayBuffer : public Buffer
	{
	friend class ArrayBufferCreator<T>;

	public :

		/**
		* @brief Gets the starting address of the inner array
		* @return the starting address of the first element of the inner array
		*/
		T* getData() const;

		/**
		* @brief Gets the number of elements for a single particle
		* @return the number of elements for a single particle
		*/
		const size_t getParticleSize() const;

		/**
		* @brief Gets the total number of T in the inner array
		* The value is equal to <i>particleSize * nbParticles</i>.
		* @return the total number of T in the inner array
		*/
		size_t getDataSize() const;

	private :

		T* data;

		size_t particleSize;
		size_t dataSize;

		ArrayBuffer<T>(size_t nbParticles,size_t particleSize);
		ArrayBuffer<T>(const ArrayBuffer<T>& buffer);
		virtual ~ArrayBuffer<T>();

		virtual void swap(size_t index0,size_t index1);
	};

	/**
	* @brief Template class to create an ArrayBuffer
	* @since 1.03.02
	*/
	template<class T>
	class ArrayBufferCreator : public BufferCreator
	{
	public :

		/**
		* @brief Constructor of ArrayBuffer
		* @param particleSize : the number of elements per particle in the buffer to be created
		*/
		ArrayBufferCreator<T>(size_t particleSize);

	private :

		size_t particleSize;

		virtual ArrayBuffer<T>* createBuffer(size_t nbParticles,const Group& group) const;
	};

	// Typedefs
	/** @brief A buffer storing an array of floats */
	typedef ArrayBuffer<float> FloatBuffer;
	/** @brief the buffer creator of the float buffer */
	typedef ArrayBufferCreator<float> FloatBufferCreator;


	template<class T>
	ArrayBuffer<T>::ArrayBuffer(size_t nbParticles,size_t particleSize) :
		Buffer(),
		dataSize(nbParticles * particleSize),
		particleSize(particleSize)
	{
		data = new T[dataSize];
	}

	template<class T>
	ArrayBuffer<T>::ArrayBuffer(const ArrayBuffer<T>& buffer) :
		Buffer(buffer),
		dataSize(buffer.dataSize),
		particleSize(buffer.particleSize)
	{
		data = new T[dataSize];
		std::memcpy(data,buffer.data,dataSize * sizeof(T));
	}

	template<class T>
	ArrayBuffer<T>::~ArrayBuffer()
	{
		delete[] data;
	}

	template<class T>
	inline T* ArrayBuffer<T>::getData() const
	{
		return data;
	}

	template<class T>
	inline const size_t ArrayBuffer<T>::getParticleSize() const
	{
		return particleSize;
	}

	template<class T>
	inline size_t ArrayBuffer<T>::getDataSize() const
	{
		return dataSize;
	}

	template<class T>
	void ArrayBuffer<T>::swap(size_t index0,size_t index1)
	{
		T* address0 = data + index0 * particleSize;
		T* address1 = data + index1 * particleSize;
		for (size_t i = 0; i < particleSize; ++i)
			std::swap(address0[i],address1[i]);
	}

	template<class T>
	ArrayBufferCreator<T>::ArrayBufferCreator(size_t particleSize) :
		BufferCreator(),
		particleSize(particleSize)
	{}

	template<class T>
	ArrayBuffer<T>* ArrayBufferCreator<T>::createBuffer(size_t nbParticles,const Group& group) const
	{
		return new ArrayBuffer<T>(nbParticles,particleSize);
	}
}

#endif
