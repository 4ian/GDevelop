// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ARRAY_KERNEl_ABSTRACT_
#ifdef DLIB_ARRAY_KERNEl_ABSTRACT_

#include "../interfaces/enumerable.h"
#include "../serialize.h"
#include "../algs.h"

namespace dlib
{

    template <
        typename T,
        typename mem_manager = default_memory_manager 
        >
    class array : public enumerable<T>
    {

        /*!
            REQUIREMENTS ON T
                T must have a default constructor.

            REQUIREMENTS ON mem_manager
                must be an implementation of memory_manager/memory_manager_kernel_abstract.h or
                must be an implementation of memory_manager_global/memory_manager_global_kernel_abstract.h or
                must be an implementation of memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                mem_manager::type can be set to anything.

            POINTERS AND REFERENCES TO INTERNAL DATA
                front(), back(), swap(), max_size(), set_size(), and operator[] 
                functions do not invalidate pointers or references to internal data.
                All other functions have no such guarantee.

            INITIAL VALUE
                size() == 0    
                max_size() == 0

            ENUMERATION ORDER
                The enumerator will iterate over the elements of the array in the
                order (*this)[0], (*this)[1], (*this)[2], ...

            WHAT THIS OBJECT REPRESENTS
                This object represents an ordered 1-dimensional array of items, 
                each item is associated with an integer value.  The items are 
                numbered from 0 though size() - 1 and the operator[] functions 
                run in constant time.  

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.
        !*/
        
        public:

            typedef T type;
            typedef T value_type;
            typedef mem_manager mem_manager_type;

            array (
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
            !*/

            explicit array (
                unsigned long new_size
            );
            /*!
                ensures 
                    - #*this is properly initialized
                    - #size() == new_size
                    - #max_size() == new_size
                    - All elements of the array will have initial values for their type.
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
            !*/

            ~array (
            ); 
            /*!
                ensures
                    - all memory associated with *this has been released
            !*/

            void clear (
            );
            /*!
                ensures
                    - #*this has its initial value
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        if this exception is thrown then the array object is unusable 
                        until clear() is called and succeeds
            !*/

            const T& operator[] (
                unsigned long pos
            ) const;
            /*!
                requires
                    - pos < size()
                ensures
                    - returns a const reference to the element at position pos
            !*/
            
            T& operator[] (
                unsigned long pos
            );
            /*!
                requires
                    - pos < size()
                ensures
                    - returns a non-const reference to the element at position pos
            !*/

            void set_size (
                unsigned long size
            );
            /*!
                requires
                    - size <= max_size()
                ensures
                    - #size() == size
                    - any element with index between 0 and size - 1 which was in the 
                      array before the call to set_size() retains its value and index.
                      All other elements have undetermined (but valid for their type) 
                      values.  (e.g. this object might buffer old T objects and reuse 
                      them without reinitializing them between calls to set_size())
                    - #at_start() == true
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        may throw this exception if there is not enough memory and 
                        if it does throw then the call to set_size() has no effect    
            !*/

            unsigned long max_size(
            ) const;
            /*!
                ensures
                    - returns the maximum size of *this
            !*/

            void set_max_size(
                unsigned long max
            );
            /*!
                ensures
                    - #max_size() == max
                    - #size() == 0
                    - #at_start() == true
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        may throw this exception if there is not enough 
                        memory and if it does throw then max_size() == 0    
            !*/

            void swap (
                array<T>& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 
            
            void sort (
            );
            /*!
                requires
                    - T must be a type with that is comparable via operator<
                ensures
                    - for all elements in #*this the ith element is <= the i+1 element
                    - #at_start() == true
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        data may be lost if sort() throws
            !*/

            void resize (
                unsigned long new_size
            );
            /*!
                ensures
                    - #size() == new_size
                    - #max_size() == max(new_size,max_size())
                    - for all i < size() && i < new_size:
                        - #(*this)[i] == (*this)[i]
                          (i.e. All the original elements of *this which were at index
                          values less than new_size are unmodified.)
                    - for all valid i >= size():
                        - #(*this)[i] has an undefined value
                          (i.e. any new elements of the array have an undefined value)
                throws
                    - std::bad_alloc or any exception thrown by T's constructor.
                       If an exception is thrown then it has no effect on *this.
            !*/

            
            const T& back (
            ) const;
            /*!
                requires
                    - size() != 0
                ensures
                    - returns a const reference to (*this)[size()-1]
            !*/

            T& back (
            );
            /*!
                requires
                    - size() != 0
                ensures
                    - returns a non-const reference to (*this)[size()-1]
            !*/

            void pop_back (
                T& item
            );
            /*!
                requires
                    - size() != 0
                ensures
                    - #size() == size() - 1
                    - swaps (*this)[size()-1] into item
                    - All elements with an index less than size()-1 are 
                      unmodified by this operation.
            !*/

            void pop_back (
            );
            /*!
                requires
                    - size() != 0
                ensures
                    - #size() == size() - 1
                    - All elements with an index less than size()-1 are 
                      unmodified by this operation.
            !*/

            void push_back (
                T& item
            );
            /*!
                ensures
                    - #size() == size()+1
                    - swaps item into (*this)[#size()-1] 
                    - #back() == item
                    - #item has some undefined value (whatever happens to 
                      get swapped out of the array)
                throws
                    - std::bad_alloc or any exception thrown by T's constructor.
                       If an exception is thrown then it has no effect on *this.
            !*/

            typedef T* iterator;
            typedef const T* const_iterator;

            iterator begin(
            );
            /*!
                ensures
                    - returns an iterator that points to the first element in this array or
                      end() if the array is empty.
            !*/

            const_iterator begin(
            ) const;
            /*!
                ensures
                    - returns a const iterator that points to the first element in this
                      array or end() if the array is empty.
            !*/

            iterator end(
            );
            /*!
                ensures
                    - returns an iterator that points to one past the end of the array.
            !*/

            const_iterator end(
            ) const;
            /*!
                ensures
                    - returns a const iterator that points to one past the end of the
                      array.
            !*/

        private:

            // restricted functions
            array(array<T>&);        // copy constructor
            array<T>& operator=(array<T>&);    // assignment operator        

    };

    template <
        typename T
        >
    inline void swap (
        array<T>& a, 
        array<T>& b 
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

    template <
        typename T
        >
    void serialize (
        const array<T>& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support 
    !*/

    template <
        typename T 
        >
    void deserialize (
        array<T>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

}

#endif // DLIB_ARRAY_KERNEl_ABSTRACT_

