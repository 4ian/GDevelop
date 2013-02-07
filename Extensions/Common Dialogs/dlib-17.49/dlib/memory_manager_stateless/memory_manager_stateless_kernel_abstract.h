// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MEMORY_MANAGER_STATELESs_ABSTRACT_
#ifdef DLIB_MEMORY_MANAGER_STATELESs_ABSTRACT_

#include "../algs.h"

namespace dlib
{
    template <
        typename T
        >
    class memory_manager_stateless
    {
        /*!      
            REQUIREMENTS ON T
                T must have a default constructor.      

            WHAT THIS OBJECT REPRESENTS
                This object represents some kind of stateless memory manager or memory pool.  
                Stateless means that all instances (instances of the same kernel implementation that is) 
                of this object are identical and can be used interchangeably.  Note that 
                implementations are allowed to have some shared global state such as a 
                global memory pool.

            THREAD SAFETY
                This object is thread safe.  You may access it from any thread at any time
                without synchronizing access.
        !*/
        
        public:

            typedef T type;
            const static bool is_stateless = true;

            template <typename U>
            struct rebind {
                typedef memory_manager_stateless<U> other;
            };

            memory_manager_stateless(
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc
            !*/

            virtual ~memory_manager_stateless(
            ); 
            /*!
                ensures
                    - frees any resources used by *this but has no effect on any shared global
                      resources used by the implementation.
            !*/

            T* allocate (
            );
            /*!
                ensures
                    - allocates a new object of type T and returns a pointer to it.
                throws
                    - std::bad_alloc or any exception thrown by T's constructor.
                        If this exception is thrown then the call to allocate() 
                        has no effect on #*this.
            !*/

            void deallocate (
                T* item
            );
            /*!
                requires
                    - item == is a pointer to memory that was obtained from a call to
                      allocate(). (i.e. The pointer you are deallocating must have
                      come from the same implementation of memory_manager_stateless
                      that is trying to deallocate it.)
                    - the memory pointed to by item hasn't already been deallocated.
                ensures
                    - deallocates the object pointed to by item
            !*/

            T* allocate_array (
                unsigned long size
            );
            /*!
                ensures
                    - allocates a new array of size objects of type T and returns a 
                      pointer to it.
                throws
                    - std::bad_alloc or any exception thrown by T's constructor.
                        If this exception is thrown then the call to allocate() 
                        has no effect on #*this.
            !*/

            void deallocate_array (
                T* item
            );
            /*!
                requires
                    - item == is a pointer to memory that was obtained from a call to
                      allocate_array(). (i.e. The pointer you are deallocating must have
                      come from the same implementation of memory_manager_stateless
                      that is trying to deallocate it.)
                    - the memory pointed to by item hasn't already been deallocated.
                ensures
                    - deallocates the array pointed to by item
            !*/

            void swap (
                memory_manager_stateless& item
            );
            /*!
                ensures
                    - this function has no effect on *this or item.  It is just provided 
                      to make this object's interface more compatable with the other 
                      memory managers.
            !*/ 

        private:

            // restricted functions
            memory_manager_stateless(memory_manager_stateless&);        // copy constructor
            memory_manager_stateless& operator=(memory_manager_stateless&);    // assignment operator
    };

    template <
        typename T
        >
    inline void swap (
        memory_manager_stateless<T>& a, 
        memory_manager_stateless<T>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_MEMORY_MANAGER_STATELESs_ABSTRACT_


