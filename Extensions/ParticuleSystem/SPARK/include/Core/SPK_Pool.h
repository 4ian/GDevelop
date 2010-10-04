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


#ifndef H_SPK_POOL
#define H_SPK_POOL

#include "Core/SPK_DEF.h"


namespace SPK
{
	/**
	* @class Pool
	* @brief A generic container to handle a pool of objects
	*
	* A Pool is a container built upon a std vector.
	* It allows to store continuous objects by handling active and inactive ones.<br>
	* <br>
	* A Pool is designed to be faster than a vector to handle. However, the order of elements is not fixed.<br>
	* A Pool holds 2 continuous list of elements : the actives and the inactives :
	* <ul>
	* <li>When created, elements can either be activate or inactive.</li>
	* <li>When activating an element, the first inactive element is swapped with the element to activate and the number of active elements is increased by 1.</li>
	* <li>When inactivating an element, the last active element is swapped with the element to inactivate and the number of active elements is decreased by 1.</li>
	* </ul>
	* So when activating or disactivating an element, a single swap is used which is faster than the displacement of all following elements when inserting or removing an element from a vector.<br>
	* Elements are not removed in a Pool but only inactivated. Typically, elements will be removed when the Pool has to be destroyed or reinitialize.<br>
	* <br>
	* Another difference with a vector is that the reallocation is not automatic but only manual with a call to reallocate(unsigned int).
	* Therefore adding elements to a full Pool will have no effect until its capacity is increased.
	*/
	template<class T>
	class Pool
	{
	public :

		/** @brief the iterator of a Pool */
		typedef typename std::vector<T>::iterator					iterator;

		/** @brief the constant iterator of a Pool */
		typedef typename std::vector<T>::const_iterator				const_iterator;

		/** @brief the reverse iterator of a Pool */
		typedef typename std::vector<T>::reverse_iterator			reverse_iterator;

		/** @brief the constant reverse iterator of a Pool */
		typedef typename std::vector<T>::const_reverse_iterator		const_reverse_iterator;

		/** @brief the default capacity of a Pool */
		static const unsigned int DEFAULT_CAPACITY = 1000;

		//////////////////
		// Constructors //
		//////////////////

		/**
		* @brief Constructor of Pool
		*
		* The capacity is the maximum number of elements a Pool can hold.<br>
		* Unlike a std vector, the capacity is not automatically increased when reaching it.
		* The user has to manually make a call to reallocate(unsigned int) to increase the capacity.
		* If an elements is added to a full Pool, nothing will happen.
		*
		* @param capacity : the maximum number of elements the Pool can hold
		*/
		Pool<T>(size_t capacity = DEFAULT_CAPACITY);

		Pool<T>(const Pool<T>& pool);

		///////////////
		// Operators //
		///////////////

		Pool<T>& operator=(const Pool<T>& pool);

		/**
		* @brief Gets the element of the Pool at index
		*
		* Note that the index is not tested and can therefore be out of bounds.
		*
		* @param index : the index of the element to access
		* @return the accessed element
		*/
		T& operator[](size_t index);

		/**
		* @brief Gets the element of the Pool at index
		*
		* This is the constant version of operator[](size_t).
		*
		* @param index : the index of the element to access
		* @return the accessed element
		*/
		const T& operator[](size_t index) const;

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the number of active elements in this Pool
		*
		* This method is the standard equivalent to getNbActive()
		*
		* @return the number of active elements in this Pool
		* @since 1.01.01
		*/
		inline size_t size() const;

		/**
		* @brief Gets the number of active elements in this Pool
		*
		* This method is equivalent to the standard size()
		*
		* @return the number of active elements in this Pool
		*/
		inline size_t getNbActive() const;

		/**
		* @brief Gets the number of inactive elements in this Pool
		* @return the number of inactive elements in this Pool
		*/
		inline size_t getNbInactive() const;

		/**
		* @brief Gets the number of elements in this Pool
		*
		* the number of elements is defined by : <i>number of active elements + number of inactive elements</i>.
		*
		* @return the number of elements in this Pool
		*/
		inline size_t getNbTotal() const;

		/**
		* @brief Gets the capacity of this Pool
		*
		* The capacity is the maximum number of elements a Pool can hold.
		*
		* @return the capacity of this Pool
		*/
		inline size_t getNbReserved() const;

		/**
		* @brief Gets the room left for new elements in this Pool
		*
		* This is defined by : <i>capacity - number of elements</i>.
		*
		* @return the room left in this Pool
		*/
		inline size_t getNbEmpty() const;

		/**
		* @brief Gets the maximum number of elements this Pool had
		*
		* This is useful to check if the capacity is well set or not.
		*
		* @return the maximum number of elements this Pool had
		*/
		inline size_t getMaxTotal() const;

		///////////////
		// Iterators //
		///////////////

		/**
		* @brief Gets an iterator referring to the first active element in this Pool
		*
		* This method is the standard equivalent to beginActive().
		*
		* @return an iterator referring to the first active element in this Pool
		*/
		inline iterator begin();

		/**
		* @brief Gets an iterator referring to the past-the-end active element in this Pool
		*
		* This method is the standard equivalent to endActive().<br>
		* It also returns the same iterator as beginInactive() but, to respect the syntax, should not be used for the same purpose.
		*
		* @return an iterator referring to the past-the-end active element in this Pool
		*/
		inline iterator end();

		/**
		* @brief Gets an iterator referring to the first active element in this Pool
		*
		* This method is equivalent to the standard begin().
		*
		* @return an iterator referring to the first active element in this Pool
		*/
		inline iterator beginActive();

		/**
		* @brief Gets an iterator referring to the past-the-end active element in this Pool
		*
		* This method is equivalent to the standard end().<br>
		* It also returns the same iterator as beginInactive() but, to respect the syntax, should not be used for the same purpose.
		*
		* @return an iterator referring to the past-the-end active element in this Pool
		*/
		inline iterator endActive();

		/**
		* @brief Gets an iterator referring to the first inactive element in this Pool
		*
		* Note that this method retuns the same iterator as end() and endActive(), but due to syntax, should not be use for the same purpose.
		*
		* @return an iterator referring to the first inactive element in this Pool
		*/
		inline iterator beginInactive();

		/**
		* @brief Gets an iterator referring to the past-the-end inactive element in this Pool
		* @return an iterator referring to the past-the-end inactive element in this Pool
		*/
		inline iterator endInactive();

		/**
		* @brief Gets an iterator referring to the first active element in this Pool
		*
		* This is the constant version of begin().
		*
		* @return an iterator referring to the first active element in this Pool
		*/
		inline const_iterator begin() const;

		/**
		* @brief Gets an iterator referring to the past-the-end active element in this Pool
		*
		* This is the constant version of end().
		*
		* @return an iterator referring to the past-the-end active element in this Pool
		*/
		inline const_iterator end() const;

		/**
		* @brief Gets an iterator referring to the first active element in this Pool
		*
		* This is the constant version of beginActive().
		*
		* @return an iterator referring to the first active element in this Pool
		*/
		inline const_iterator beginActive() const;

		/**
		* @brief Gets an iterator referring to the past-the-end active element in this Pool
		*
		* This is the constant version of endActive().
		*
		* @return an iterator referring to the past-the-end active element in this Pool
		*/
		inline const_iterator endActive() const;

		/**
		* @brief Gets an iterator referring to the first inactive element in this Pool
		*
		* This is the constant version of beginInactive().
		*
		* @return an iterator referring to the first inactive element in this Pool
		*/
		inline const_iterator beginInactive() const;

		/**
		* @brief Gets an iterator referring to the past-the-end inactive element in this Pool
		*
		* This is the constant version of endInactive().
		*
		* @return an iterator referring to the past-the-end inactive element in this Pool
		*/
		inline const_iterator endInactive() const;

		/**
		* @brief Gets a reverse iterator referring to the first active element in this Pool
		*
		* This method is the standard equivalent to rbeginActive().
		*
		* @return a reverse iterator referring to the first active element in this Pool
		*/
		inline reverse_iterator rbegin();

		/**
		* @brief Gets a reverse iterator referring to the past-the-end active element in this Pool
		*
		* This method is the standard equivalent to rendActive().<br>
		* It also returns the same reverse iterator as rbeginInactive() but, to respect the syntax, should not be used for the same purpose.
		*
		* @return a reverse iterator referring to the past-the-end active element in this Pool
		*/
		inline reverse_iterator rend();

		/**
		* @brief Gets a reverse iterator referring to the first active element in this Pool
		*
		* This method is equivalent to the standard rbegin().
		*
		* @return a reverse iterator referring to the first active element in this Pool
		*/
		inline reverse_iterator rbeginActive();

		/**
		* @brief Gets a reverse iterator referring to the past-the-end active element in this Pool
		*
		* This method is equivalent to the standard rend().<br>
		* It also returns the same reverse iterator as rbeginInactive() but, to respect the syntax, should not be used for the same purpose.
		*
		* @return a reverse iterator referring to the past-the-end active element in this Pool
		*/
		inline reverse_iterator rendActive();

		/**
		* @brief Gets a reverse iterator referring to the first inactive element in this Pool
		*
		* Note that this method retuns the same iterator as rend() and rendActive(), but due to syntax, should not be use for the same purpose.
		*
		* @return a reverse iterator referring to the first inactive element in this Pool
		*/
		inline reverse_iterator rbeginInactive();

		/**
		* @brief Gets a reverse iterator referring to the past-the-end inactive element in this Pool
		* @return a reverse iterator referring to the past-the-end inactive element in this Pool
		*/
		inline reverse_iterator rendInactive();

		/**
		* @brief Gets a reverse iterator referring to the first active element in this Pool
		*
		* This is the constant version of rbegin().
		*
		* @return a reverse iterator referring to the first active element in this Pool
		*/
		inline const_reverse_iterator rbegin() const;

		/**
		* @brief Gets a reverse iterator referring to the past-the-end active element in this Pool
		*
		* This is the constant version of rend().
		*
		* @return a reverse iterator referring to the past-the-end active element in this Pool
		*/
		inline const_reverse_iterator rend() const;

		/**
		* @brief Gets a reverse iterator referring to the first active element in this Pool
		*
		* This is the constant version of rbeginActive().
		*
		* @return a reverse iterator referring to the first active element in this Pool
		*/
		inline const_reverse_iterator rbeginActive() const;

		/**
		* @brief Gets a reverse iterator referring to the past-the-end active element in this Pool
		*
		* This is the constant version of rendActive().
		*
		* @return a reverse iterator referring to the past-the-end active element in this Pool
		*/
		inline const_reverse_iterator rendActive() const;

		/**
		* @brief Gets a reverse iterator referring to the first inactive element in this Pool
		*
		* This is the constant version of rbeginInactive().
		*
		* @return a reverse iterator referring to the first inactive element in this Pool
		*/
		inline const_reverse_iterator rbeginInactive() const;

		/**
		* @brief Gets a reverse iterator referring to the past-the-end inactive element in this Pool
		*
		* This is the constant version of rendInactive().
		*
		* @return a reverse iterator referring to the past-the-end inactive element in this Pool
		*/
		inline const_reverse_iterator rendInactive() const;

		/////////////////////
		// Elements access //
		/////////////////////

		/**
		* @brief Gets the first active element
		*
		* This method is the standard equivalent to frontActive().
		*
		* @return the first active element
		* @since 1.01.01
		*/
		inline T& front();

		/**
		* @brief Gets the last active element
		*
		* This method is the standard equivalent to backActive().
		*
		* @return the last active element
		* @since 1.01.01
		*/
		inline T& back();

		/**
		* @brief Gets the first active element
		*
		* This method is equivalent to the standard front().
		*
		* @return the first active element
		* @since 1.01.01
		*/
		inline T& frontActive();

		/**
		* @brief Gets the last active element
		*
		* This method is the equivalent to the standard back().
		*
		* @return the last active element
		* @since 1.01.01
		*/
		inline T& backActive();

		/**
		* @brief Gets the first inactive element
		* @return the first inactive element
		* @since 1.01.01
		*/
		inline T& frontInactive();

		/**
		* @brief Gets the last inactive element
		* @return the last inactive element
		* @since 1.01.01
		*/
		inline T& backInactive();

		/**
		* @brief Gets the first active element
		*
		* This is the constant version of front().
		*
		* @return the first active element
		* @since 1.01.01
		*/
		inline const T& front() const;

		/**
		* @brief Gets the last active element
		*
		* This is the constant version of back().
		*
		* @return the last active element
		* @since 1.01.01
		*/
		inline const T& back() const;

		/**
		* @brief Gets the first active element
		*
		* This is the constant version of frontActive().
		*
		* @return the first active element
		* @since 1.01.01
		*/
		inline const T& frontActive() const;

		/**
		* @brief Gets the last active element
		*
		* This is the constant version of backActive().
		*
		* @return the last active element
		* @since 1.01.01
		*/
		inline const T& backActive() const;

		/**
		* @brief Gets the first inactive element
		*
		* This is the constant version of frontInactive().
		*
		* @return the first inactive element
		* @since 1.01.01
		*/
		inline const T& frontInactive() const;

		/**
		* @brief Gets the last inactive element
		*
		* This is the constant version of backInactive().
		*
		* @return the last inactive element
		* @since 1.01.01
		*/
		inline const T& backInactive() const;
		

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Fills the Pool with a copy of the passed element
		*
		* The Pool is filled entirely which means its number of elements will be equal to its capacity.<br>
		* Note that all added elements are inactive.
		*
		* @param value : the element which will be copied into the Pool
		*/
		inline void assign(T& value);

		/**
		* @brief Adds an active element to this Pool
		* @param element : the element to add to this Pool
		* @return true if the element can be added, false otherwise (if the Pool has no more room left)
		*/
		bool pushActive(T& element);

		/**
		* @brief Adds an inactive element to this Pool
		* @param element : the element to add to this Pool
		* @return true if the element can be added, false otherwise (if the Pool has no more room left)
		*/
		bool pushInactive(T& element);

		/**
		* @brief Inactivates an active element
		*
		* The index is tested and if it does not point to an active element, nothing will happen.
		*
		* @param index : the index of the active element to inactivate
		*/
		void makeInactive(size_t index);

		/** @brief Inactivates all the elements */
		inline void makeAllInactive();

		/**
		* @brief Activates the first inactive element
		*
		* A pointer to the activated element is returned.
		* If there is no inactive element to activate, NULL is returned.
		*
		* @return a pointer to the activated element or NULL if there is no element to activate
		*/
		T* makeActive();

		/**
		* @brief Activates the <i>index</i> inactive element
		*
		* The index starts at the first inactive element.<br>
		* This method is a bit slower than makeActive() but makeActive() has the same effect as makeActive(0).<br>
		* <br>
		* If the element at index is out of bounds, NULL is returned
		*
		* @param index : the inactive element to activate
		* @return a pointer to the activated element or NULL if the index is out of bounds
		*/
		T* makeActive(size_t index);

		/**
		* @brief Removes an element from this Pool
		*
		* The index is checked for bounds. If it is out of bounds nothing happens.<br>
		* <br>
		* Note that either an active or inactive element can be removed.
		*
		* @param index : the index of the element to remove
		*/
		void erase(size_t index);

		/** @brief Removes all elements in this Pool */
		void clear();

		/**
		* @brief reallocates the Pool
		*
		* This will invalidates all iterators on the Pool.<br>
		* If the new capacity is smaller than the number of elements, nothing happens.
		*
		* @param capacity : the new desired capacity for this Pool
		*/
		inline void reallocate(size_t capacity);

	private :

		std::vector<T> container;

		size_t nbActive;
		size_t maxTotal;

		inline void swapElements(T& a,T& b);
	};


	template<class T>
	Pool<T>::Pool(size_t capacity) :
		nbActive(0),
		maxTotal(0)
	{
		container.reserve(capacity);
	}

	template<class T>
	Pool<T>::Pool(const Pool<T>& pool) :
		nbActive(pool.nbActive),
		maxTotal(0),
		container()
	{
		// the copy constructor of vector does not copy the capacity !
		container.reserve(pool.container.capacity());
		container = pool.container;
	}

	template<class T>
	Pool<T>& Pool<T>::operator=(const Pool<T>& pool)
	{
		if (this != *pool)
		{
			nbActive = pool.nbActive();
			maxTotal = 0;
			container.reserve(pool.container.capacity());
			container = pool.container;
		}
		return *this;
	}

	template<class T>
	T& Pool<T>::operator[](size_t index)
	{
		return container[index];
	}

	template<class T>
	const T& Pool<T>::operator[](size_t index) const
	{
		return container[index];
	}

	template<class T>
	inline size_t Pool<T>::size() const
	{
		return nbActive;
	}

	template<class T>
	inline size_t Pool<T>::getNbActive() const
	{
		return nbActive;
	}

	template<class T>
	inline size_t Pool<T>::getNbInactive() const
	{
		return container.size() - nbActive;
	}

	template<class T>
	inline size_t Pool<T>::getNbTotal() const
	{
		return container.size();
	}

	template<class T>
	inline size_t Pool<T>::getNbReserved() const
	{
		return container.capacity();
	}

	template<class T>
	inline size_t Pool<T>::getNbEmpty() const
	{
		return container.capacity() - container.size();
	}

	template<class T>
	inline size_t Pool<T>::getMaxTotal() const
	{
		return maxTotal;
	}

	template<class T>
	inline typename Pool<T>::iterator Pool<T>::begin()
	{
		return container.begin();
	}

	template<class T>
	inline typename Pool<T>::iterator Pool<T>::end()
	{
		return container.begin() + nbActive;
	}

	template<class T>
	inline typename Pool<T>::iterator Pool<T>::beginActive()
	{
		return begin();
	}

	template<class T>
	inline typename Pool<T>::iterator Pool<T>::endActive()
	{
		return end();
	}

	template<class T>
	inline typename Pool<T>::iterator Pool<T>::beginInactive()
	{
		return end();
	}

	template<class T>
	inline typename Pool<T>::iterator Pool<T>::endInactive()
	{
		return container.end();
	}

	template<class T>
	inline typename Pool<T>::const_iterator Pool<T>::begin() const
	{
		return container.begin();
	}

	template<class T>
	inline typename Pool<T>::const_iterator Pool<T>::end() const
	{
		return container.begin() + nbActive;
	}

	template<class T>
	inline typename Pool<T>::const_iterator Pool<T>::beginActive() const
	{
		return begin();
	}

	template<class T>
	inline typename Pool<T>::const_iterator Pool<T>::endActive() const
	{
		return end();
	}

	template<class T>
	inline typename Pool<T>::const_iterator Pool<T>::beginInactive() const
	{
		return end();
	}

	template<class T>
	inline typename Pool<T>::const_iterator Pool<T>::endInactive() const
	{
		return container.end();
	}

	template<class T>
	inline typename Pool<T>::reverse_iterator Pool<T>::rbegin()
	{
		return container.rbegin();
	}

	template<class T>
	inline typename Pool<T>::reverse_iterator Pool<T>::rend()
	{
		return container.rbegin() + nbActive;
	}

	template<class T>
	inline typename Pool<T>::reverse_iterator Pool<T>::rbeginActive()
	{
		return rbegin();
	}

	template<class T>
	inline typename Pool<T>::reverse_iterator Pool<T>::rendActive()
	{
		return rend();
	}

	template<class T>
	inline typename Pool<T>::reverse_iterator Pool<T>::rbeginInactive()
	{
		return rend();
	}

	template<class T>
	inline typename Pool<T>::reverse_iterator Pool<T>::rendInactive()
	{
		return container.rend();
	}

	template<class T>
	inline typename Pool<T>::const_reverse_iterator Pool<T>::rbegin() const
	{
		return container.rbegin();
	}

	template<class T>
	inline typename Pool<T>::const_reverse_iterator Pool<T>::rend() const
	{
		return container.rbegin() + nbActive;
	}

	template<class T>
	inline typename Pool<T>::const_reverse_iterator Pool<T>::rbeginActive() const
	{
		return rbegin();
	}

	template<class T>
	inline typename Pool<T>::const_reverse_iterator Pool<T>::rendActive() const
	{
		return rend();
	}

	template<class T>
	inline typename Pool<T>::const_reverse_iterator Pool<T>::rbeginInactive() const
	{
		return rend();
	}

	template<class T>
	inline typename Pool<T>::const_reverse_iterator Pool<T>::rendInactive() const
	{
		return container.rend();
	}

	template<class T>
	inline T& Pool<T>::front()
	{
		return container.front();
	}

	template<class T>
	inline T& Pool<T>::back()
	{
		return container[nbActive - 1];
	}

	template<class T>
	inline T& Pool<T>::frontActive()
	{
		return front();
	}

	template<class T>
	inline T& Pool<T>::backActive()
	{
		return back();
	}

	template<class T>
	inline T& Pool<T>::frontInactive()
	{
		return container[nbActive];
	}

	template<class T>
	inline T& Pool<T>::backInactive()
	{
		return container.back();
	}

	template<class T>
	inline const T& Pool<T>::front() const
	{
		return container.front();
	}

	template<class T>
	inline const T& Pool<T>::back() const
	{
		return container[nbActive - 1];
	}

	template<class T>
	inline const T& Pool<T>::frontActive() const
	{
		return front();
	}

	template<class T>
	inline const T& Pool<T>::backActive() const
	{
		return back();
	}

	template<class T>
	inline const T& Pool<T>::frontInactive() const
	{
		return container[nbActive];
	}

	template<class T>
	inline const T& Pool<T>::backInactive() const
	{
		return container.back();
	}

	template<class T>
	inline void Pool<T>::assign(T& value)
	{
		container.insert(container.end(),getNbEmpty(),value);
	}

	template<class T>
	inline void Pool<T>::swapElements(T& a,T& b)
	{
		std::swap(a,b);
	}

	template<class T>
	bool Pool<T>::pushActive(T& element)
	{
		if (container.size() == container.capacity())
			return false;

		container.push_back(element);
		swapElements(container[nbActive],container.back());
		++nbActive;

		if (container.size() > maxTotal)
			maxTotal = container.size();

		return true;
	}

	template<class T>
	bool Pool<T>::pushInactive(T& element)
	{
		if (container.size() == container.capacity())
			return false;

		container.push_back(element);

		if (container.size() > maxTotal)
			maxTotal = container.size();

		return true;
	}

	template<class T>
	void Pool<T>::makeInactive(size_t index)
	{
		if (index >= nbActive)
			return;

		swapElements(container[index],container[nbActive - 1]);
		--nbActive;
	}

	template<class T>
	inline void Pool<T>::makeAllInactive()
	{
		nbActive = 0;
	}

	template<class T>
	T* Pool<T>::makeActive()
	{
		if (getNbInactive() == 0)
			return NULL;

		++nbActive;
		return &container[0] + nbActive - 1;
	}

	template<class T>
	T* Pool<T>::makeActive(size_t index)
	{
		if (getNbInactive() < index)
			return NULL;

		swapElements(container[nbActive],container[nbActive + index]);
		++nbActive;
		return &container[0] + nbActive - 1;
	}

	template<class T>
	void Pool<T>::erase(size_t index)
	{
		if (index >= container.size())
			return;

		if (index < nbActive)
		{
			swapElements(container[index],container[nbActive - 1]);
			--nbActive;
			index = nbActive;
		}

		swapElements(container[index],container.back());
		container.pop_back();
	}

	template<class T>
	void Pool<T>::clear()
	{
		container.clear();
		nbActive = 0;
	}

	template<class T>
	inline void Pool<T>::reallocate(size_t capacity)
	{
		container.reserve(capacity);
	}
}

#endif
