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


#ifndef H_SPK_BUFFER
#define H_SPK_BUFFER

namespace SPK
{
	class Particle;
	class Group;

	/**
	* @brief An abstract class that defines the interface for the additional buffers of Group
	*
	* A buffer allows a Group to hold additional data.<br>
	* Typically, they are used for rendering as the GPU or the rendering engine needs data to be organized in a specific way.<br>
	* <br>
	* Their use can be extended to anything to store data within a group.<br>
	* Buffers can also be swapped as particles are swap within a group. This allows to have the ordering of data consistent with the ordering of particles.<br>
	* However, if the buffers are only used for temporary storage on a single frame (most of the renderers), it is not necessary to swap the data.<br>
	* <br>
	* A buffer also contains a flag which is an unsigned integer that can be used to check the validity of the buffer from frame to frame.<br>
	* <br>
	* Note that only a group can create and delete a buffer. The user can ask a group to create a new buffer by passing a BufferCreator object to it.<br>
	* Check out the group interface about buffers for more info.
	*
	* @since 1.03.02
	*/
	class Buffer
	{
	friend class BufferCreator;
	friend class Group;
	friend void swapParticles(Particle& a,Particle& b);

	public :

		/**
		* @brief Gets the current flag of this buffer
		* @return the current flag of this buffer
		*/
		unsigned int getFlag() const;

		/**
		* @brief Tells whether data is swapped as particles in the group are swapped
		* @return true if data must be swapped with particles, false if not
		*/
		bool isSwapEnabled() const;

	protected :

		Buffer() {};
		virtual ~Buffer() {};

	private :

		unsigned int flag;
		bool swapEnabled;

		/**
		* @brief Swaps 2 particles data in this buffer
		*
		* This is a pure virtual method that must be implemented by inherited classes of buffer.
		*
		* @param index0 : the index of the first particle to swap
		* @param index1 : the index of the second particle to swap
		*/
		virtual void swap(size_t index0,size_t index1) = 0;
	};

	/**
	* @brief A class used by a Group to create an additional Buffer
	*
	* This class defines a temporary object to pass to a Group so that it can create and store a new buffer.
	* Check out the method <i>Group::createBuffer(const std::string&,const BufferCreator&,unsigned int,bool)</i> for more information.
	*
	* @since 1.03.02
	*/
	class BufferCreator
	{
	friend class Group;

	protected : 

		virtual ~BufferCreator() {}

	private :

		/**
		* @brief Creates a new buffer
		*
		* This method is called internally by a group to create and store an new buffer.<br>
		* This is a pure virtual method that must be implemented by inherited classes of buffer.
		*
		* @param nbParticles : the number of particles the buffer must be able to store
		* @param group : the group which contains the buffer
		*/
		virtual Buffer* createBuffer(size_t nbParticles,const Group& group) const = 0;
	};


	inline unsigned int Buffer::getFlag() const
	{
		return flag;
	}

	inline bool Buffer::isSwapEnabled() const
	{
		return swapEnabled;
	}
}

#endif
