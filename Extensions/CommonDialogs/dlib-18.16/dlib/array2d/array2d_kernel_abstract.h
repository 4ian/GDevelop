// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ARRAY2D_KERNEl_ABSTRACT_
#ifdef DLIB_ARRAY2D_KERNEl_ABSTRACT_

#include "../interfaces/enumerable.h"
#include "../serialize.h"
#include "../algs.h"
#include "../geometry/rectangle_abstract.h"

namespace dlib
{

    template <
        typename T,
        typename mem_manager = default_memory_manager 
        >
    class array2d : public enumerable<T>
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
                No member functions in this object will invalidate pointers
                or references to internal data except for the set_size()
                and clear() member functions.

            INITIAL VALUE
                nr() == 0
                nc() == 0
                
            ENUMERATION ORDER
                The enumerator will iterate over the elements of the array starting
                with row 0 and then proceeding to row 1 and so on.  Each row will be
                fully enumerated before proceeding on to the next row and the elements
                in a row will be enumerated beginning with the 0th column, then the 1st 
                column and so on.

            WHAT THIS OBJECT REPRESENTS
                This object represents a 2-Dimensional array of objects of 
                type T. 

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.


                Finally, note that this object stores its data contiguously and in 
                row major order.  Moreover, there is no padding at the end of each row.
                This means that its width_step() value is always equal to sizeof(type)*nc().  
        !*/


    public:

        // ----------------------------------------

        typedef T type;
        typedef mem_manager mem_manager_type;
         
        // ----------------------------------------

        class row 
        {
            /*!
                POINTERS AND REFERENCES TO INTERNAL DATA
                    No member functions in this object will invalidate pointers
                    or references to internal data.

                WHAT THIS OBJECT REPRESENTS
                    This object represents a row of Ts in an array2d object.
            !*/
        public:
            long nc (
            ) const;
            /*!
                ensures
                    - returns the number of columns in this row
            !*/

            const T& operator[] (
                long column
            ) const;
            /*!
                requires
                    - 0 <= column < nc()
                ensures
                    - returns a const reference to the T in the given column 
            !*/

            T& operator[] (
                long column
            );
            /*!
                requires
                    - 0 <= column < nc()
                ensures
                    - returns a non-const reference to the T in the given column 
            !*/

        private:
            // restricted functions
            row();
            row& operator=(row&);
        };

        // ----------------------------------------

        array2d (
        );
        /*!
            ensures 
                - #*this is properly initialized
            throws
                - std::bad_alloc 
        !*/

        array2d (
            long rows,
            long cols 
        );
        /*!
            requires
                - rows >= 0 && cols >= 0
            ensures
                - #nc() == cols
                - #nr() == rows
                - #at_start() == true
                - all elements in this array have initial values for their type
            throws
                - std::bad_alloc 
        !*/

        virtual ~array2d (
        ); 
        /*!
            ensures
                - all resources associated with *this has been released
        !*/
        
        void clear (
        );
        /*!
            ensures
                - #*this has an initial value for its type
        !*/

        long nc (
        ) const;
        /*!
            ensures
                - returns the number of elements there are in a row.  i.e. returns
                  the number of columns in *this
        !*/

        long nr (
        ) const;
        /*!
            ensures
                - returns the number of rows in *this
        !*/

        void set_size (
            long rows,
            long cols
        );
        /*!
            requires
                - rows >= 0 && cols >= 0
            ensures
                - #nc() == cols
                - #nr() == rows
                - #at_start() == true
                - if (the call to set_size() doesn't change the dimensions of this array) then
                    - all elements in this array retain their values from before this function was called
                - else
                    - all elements in this array have initial values for their type
            throws
                - std::bad_alloc 
                    If this exception is thrown then #*this will have an initial
                    value for its type.
        !*/

        row operator[] (
            long row_index
        );
        /*!
            requires
                - 0 <= row_index < nr()
            ensures
                - returns a non-const row of nc() elements that represents the 
                  given row_index'th row in *this.
        !*/

        const row operator[] (
            long row_index
        ) const;
        /*!
            requires
                - 0 <= row_index < nr()
            ensures
                - returns a const row of nc() elements that represents the 
                  given row_index'th row in *this.
        !*/

        void swap (
            array2d& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

        long width_step (
        ) const;
        /*!
            ensures
                - returns the size of one row of the image, in bytes.  
                  More precisely, return a number N such that:
                  (char*)&item[0][0] + N == (char*)&item[1][0].
                - for dlib::array2d objects, the returned value
                  is always equal to sizeof(type)*nc().  However,
                  other objects which implement dlib::array2d style
                  interfaces might have padding at the ends of their
                  rows and therefore might return larger numbers.
                  An example of such an object is the dlib::cv_image.
        !*/

    private:

        // restricted functions
        array2d(array2d&);        // copy constructor
        array2d& operator=(array2d&);    // assignment operator

    };

    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        array2d<T,mem_manager>& a, 
        array2d<T,mem_manager>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename T,
        typename mem_manager
        >
    void serialize (
        const array2d<T,mem_manager>& item, 
        std::ostream& out 
    );   
    /*!
        Provides serialization support.  Note that the serialization formats used by the
        dlib::matrix and dlib::array2d objects are compatible.  That means you can load the
        serialized data from one into another and it will work properly.
    !*/

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        array2d<T,mem_manager>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

}

#endif // DLIB_ARRAY2D_KERNEl_ABSTRACT_ 

