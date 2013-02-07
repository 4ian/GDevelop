// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_REFERENCE_COUNTER_KERNEl_1_
#define DLIB_REFERENCE_COUNTER_KERNEl_1_

#include "reference_counter_kernel_abstract.h"
#include "../algs.h"

namespace dlib
{

    template <
        typename T,
        typename copy = copy_functor<T>
        >
    class reference_counter_kernel_1 
    {

        /*!
                INITIAL VALUE
                    *data = item of type T with its initial value
                    *count = 1

                CONVENTION
                    *data = pointer to item of type T
                    *count = number of references to *data

                    if clear() threw an exception then count = 0 and data is not a 
                    valid pointer
        !*/

        public:

            typedef T type;


            reference_counter_kernel_1 (
            );

            inline reference_counter_kernel_1 ( 
                const reference_counter_kernel_1& item
            );

            virtual ~reference_counter_kernel_1 (
            ); 

            void clear (
            );

            T& modify (
            );

            inline const T& access (
            ) const;

            inline reference_counter_kernel_1& operator= (
                const reference_counter_kernel_1& rhs
            );

            inline void swap (
                reference_counter_kernel_1& item
            );


        private:

            T* data;
            unsigned long* count;
            mutable copy copy_item;
    };

    template <
        typename T,
        typename copy
        >
    inline void swap (
        reference_counter_kernel_1<T,copy>& a, 
        reference_counter_kernel_1<T,copy>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename copy
        >
    reference_counter_kernel_1<T,copy>::
    reference_counter_kernel_1 (
    ) 
    {
        data = new T;
        try { count = new unsigned long; }
        catch (...) { delete data; throw; }

        *count = 1;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename copy
        >
    reference_counter_kernel_1<T,copy>::
    reference_counter_kernel_1 ( 
        const reference_counter_kernel_1<T,copy>& item
    ) : 
        data(item.data),
        count(item.count)
    {
        ++(*count);
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename copy
        >
    reference_counter_kernel_1<T,copy>::
    ~reference_counter_kernel_1 (
    )
    {
        if (*count > 1)
        {
            // if there are other references to this data
            --(*count);
        }
        else
        {
            // if there are no other references to this data
            delete count;
            delete data;
        }
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename copy
        >
    void reference_counter_kernel_1<T,copy>::
    clear (
    )
    {
        // if an exception was thrown last time clear() was called then do this
        if (count == 0)
        {
            data = new T;
            try { count = new unsigned long; }
            catch (...) { delete data; throw; }

            *count = 1;            
        }
        // if there are other references to the data then do this
        else if (*count > 1)
        {
            --(*count);

            try { data = new T; }               
            catch (...) { count = 0; throw; }

            try { count = new unsigned long; }  
            catch (...) { delete data; count = 0; throw; }

            *count = 1;

        }
        else
        {
            // if there are no other references to this data
            *count = 1;
            delete data;
            try { data = new T; } catch (...) { delete count; count = 0; throw; }
        }
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename copy
        >
    T& reference_counter_kernel_1<T,copy>::
    modify (
    )
    {
        // if this is not the only reference then make a new copy
        if ( *count > 1 )
        {
            T&              old_data    = *data;
            unsigned long&  old_count   = *count;


            // get memory for the new copy
            try { data = new T; }               
            catch (...) { data = &old_data; throw; }

            try { count = new unsigned long; }  
            catch (...) {delete data; data = &old_data; count = &old_count; throw;}

            // decrement the number of references to old_data
            --(old_count);

            *count = 1;

            // make a copy of the old data
            try { copy_item(old_data,*data); }  
            catch (...) 
            { delete data; delete count; data = &old_data; count = &old_count; }

        }

        return *data;

    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename copy
        >
    const T& reference_counter_kernel_1<T,copy>::
    access (
    ) const
    {
        return *data;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename copy
        >
    reference_counter_kernel_1<T,copy>& reference_counter_kernel_1<T,copy>::
    operator= (
        const reference_counter_kernel_1<T,copy>& rhs
    )
    {
        if (this == &rhs)
            return *this;

        // delete the current data if this is the last reference to it
        if (*count > 1)
        {
            // if there are other references to this data
            --(*count);
        }
        else
        {
            // if there are no other references to this data
            delete count;
            delete data;
        }        

        // copy the pointers
        count = (rhs.count);
        data = (rhs.data);
        ++(*count);

        return *this;

    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename copy
        >
    void reference_counter_kernel_1<T,copy>::
    swap (
        reference_counter_kernel_1<T,copy>& item
    )
    {
        T* data_temp                = data;
        unsigned long* count_temp   = count;

        data    = item.data;
        count   = item.count;

        item.data   = data_temp;
        item.count  = count_temp;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_REFERENCE_COUNTER_KERNEl_1_

