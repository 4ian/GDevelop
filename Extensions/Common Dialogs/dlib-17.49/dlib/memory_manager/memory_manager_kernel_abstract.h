// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MEMORY_MANAGER_KERNEl_ABSTRACT_
#ifdef DLIB_MEMORY_MANAGER_KERNEl_ABSTRACT_

#include "../algs.h"

namespace dlib
{
    template <
        typename T
        >
    class memory_manager
    {
        /*!      
            REQUIREMENTS ON T
                T must have a default constructor.      

            INITIAL VALUE
                get_number_of_allocations() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents some kind of memory manager or memory pool.
        !*/
        
        public:

            typedef T type;

            template <typename U>
            struct rebind {
                typedef memory_manager<U> other;
            };

            memory_manager(
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc
            !*/

            virtual ~memory_manager(
            ); 
            /*!
                ensures
                    - if (get_number_of_allocations() == 0) then
                        - all resources associated with *this have been released.
                    - else
                        - The memory still allocated will not be deleted and this
                          causes a memory leak. 
            !*/

            unsigned long get_number_of_allocations (
            ) const;
            /*!
                ensures
                    - returns the current number of outstanding allocations
            !*/
 
            T* allocate (
            );
            /*!
                ensures
                    - allocates a new object of type T and returns a pointer to it.
                    - #get_number_of_allocations() == get_number_of_allocations() + 1
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
                      this->allocate(). (i.e. you can't deallocate a pointer you
                      got from a different memory_manager instance.)
                    - the memory pointed to by item hasn't already been deallocated.
                ensures
                    - deallocates the object pointed to by item
                    - #get_number_of_allocations() == get_number_of_allocations() - 1
            !*/

            T* allocate_array (
                unsigned long size
            );
            /*!
                ensures
                    - allocates a new array of size objects of type T and returns a 
                      pointer to it.
                    - #get_number_of_allocations() == get_number_of_allocations() + 1
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
                      this->allocate_array(). (i.e. you can't deallocate a pointer you
                      got from a different memory_manager instance and it must be an
                      array.)
                    - the memory pointed to by item hasn't already been deallocated.
                ensures
                    - deallocates the array pointed to by item
                    - #get_number_of_allocations() == get_number_of_allocations() - 1
            !*/

            void swap (
                memory_manager& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 

        private:

            // restricted functions
            memory_manager(memory_manager&);        // copy constructor
            memory_manager& operator=(memory_manager&);    // assignment operator
    };

    template <
        typename T
        >
    inline void swap (
        memory_manager<T>& a, 
        memory_manager<T>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_MEMORY_MANAGER_KERNEl_ABSTRACT_

