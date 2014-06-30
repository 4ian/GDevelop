// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STATIC_SET_KERNEl_1_
#define DLIB_STATIC_SET_KERNEl_1_

#include "static_set_kernel_abstract.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../algs.h"
#include "../sort.h"
#include "../serialize.h"
#include <functional>

namespace dlib
{

    template <
        typename T,
        typename compare = std::less<T>
        >
    class static_set_kernel_1 : public enumerable<const T>
    {

        /*!
            INITIAL VALUE
                - set_size == 0
                - d == 0
                - at_start_ == true
                - cur == 0

            CONVENTION
                - size() == set_size
                - if (set_size > 0) then
                    - d == pointer to an array containing all the elements of the set                
                    - d is sorted according to operator<
                - else  
                    - d == 0

                - current_element_valid() == (cur != 0)
                - at_start() == (at_start_)
                - if (current_element_valid()) then
                    - element() == *cur
        !*/

        // I would define this outside the class but Borland 5.5 has some problems
        // with non-inline templated friend functions.
        friend void deserialize (
            static_set_kernel_1& item, 
            std::istream& in
        )    
        {
            try
            {
                item.clear();
                unsigned long size;
                deserialize(size,in);
                item.set_size = size;
                item.d = new T[size];
                for (unsigned long i = 0; i < size; ++i)
                {
                    deserialize(item.d[i],in);
                }
            }
            catch (serialization_error e)
            { 
                item.set_size = 0;
                if (item.d)
                {
                    delete [] item.d;
                    item.d = 0;
                }

                throw serialization_error(e.info + "\n   while deserializing object of type static_set_kernel_1"); 
            }
            catch (...)
            {
                item.set_size = 0;
                if (item.d)
                {
                    delete [] item.d;
                    item.d = 0;
                }

                throw;
            }
        } 

        public:

            typedef T type;
            typedef compare compare_type;

            static_set_kernel_1(
            );

            virtual ~static_set_kernel_1(
            ); 

            void clear (
            );

            void load (
                remover<T>& source
            );

            void load (
                asc_remover<T,compare>& source
            );

            bool is_member (
                const T& item
            ) const;

            inline void swap (
                static_set_kernel_1& item
            );
    
            // functions from the enumerable interface
            inline unsigned long size (
            ) const;

            inline bool at_start (
            ) const;

            inline void reset (
            ) const;

            inline bool current_element_valid (
            ) const;

            inline const T& element (
            ) const;

            inline const T& element (
            );

            inline bool move_next (
            ) const;


        private:

   
            // data members
            unsigned long set_size;
            T* d;
            mutable T* cur;
            mutable bool at_start_;

            // restricted functions
            static_set_kernel_1(static_set_kernel_1&);        // copy constructor
            static_set_kernel_1& operator=(static_set_kernel_1&);    // assignment operator
    };

    template <
        typename T,
        typename compare
        >
    inline void swap (
        static_set_kernel_1<T,compare>& a, 
        static_set_kernel_1<T,compare>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    static_set_kernel_1<T,compare>::
    static_set_kernel_1(
    ) :
        set_size(0),
        d(0),
        cur(0),
        at_start_(true)
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    static_set_kernel_1<T,compare>::
    ~static_set_kernel_1(
    )
    {
        if (set_size > 0)
            delete [] d;
    } 

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    void static_set_kernel_1<T,compare>::
    clear(
    )
    {
        if (set_size > 0)
        {
            set_size = 0;
            delete [] d;
            d = 0;
        }
        reset();
    } 

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    void static_set_kernel_1<T,compare>::
    load (
        remover<T>& source
    )
    {
        if (source.size() > 0)
        {
            d = new T[source.size()];

            set_size = source.size();

            for (unsigned long i = 0; source.size() > 0; ++i)
                source.remove_any(d[i]);
            
            compare comp;
            qsort_array(d,0,set_size-1,comp);
        }
        else
        {
            clear();
        }
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    void static_set_kernel_1<T,compare>::
    load (
        asc_remover<T,compare>& source
    )
    {
        if (source.size() > 0)
        {
            d = new T[source.size()];

            set_size = source.size();

            for (unsigned long i = 0; source.size() > 0; ++i)
                source.remove_any(d[i]);
        }
        else
        {
            clear();
        }
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    bool static_set_kernel_1<T,compare>::
    is_member (
        const T& item
    ) const
    {
        unsigned long high = set_size;
        unsigned long low = 0;
        unsigned long p = set_size;
        unsigned long idx;
        while (p > 0)
        {
            p = (high-low)>>1;
            idx = p+low;
            if (item < d[idx])
                high = idx;
            else if (d[idx] < item)
                low = idx;
            else
                return true;
        }
        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    unsigned long static_set_kernel_1<T,compare>::
    size (
    ) const
    {
        return set_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    void static_set_kernel_1<T,compare>::
    swap (
        static_set_kernel_1<T,compare>& item
    )
    {
        exchange(set_size,item.set_size);
        exchange(d,item.d);
        exchange(cur,item.cur);
        exchange(at_start_,item.at_start_);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // enumerable function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    bool static_set_kernel_1<T,compare>::
    at_start (
    ) const
    {
        return at_start_;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    void static_set_kernel_1<T,compare>::
    reset (
    ) const
    {
        at_start_ = true;
        cur = 0;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    bool static_set_kernel_1<T,compare>::
    current_element_valid (
    ) const
    {   
        return (cur != 0);
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    const T& static_set_kernel_1<T,compare>::
    element (
    ) const
    {
        return *cur;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    const T& static_set_kernel_1<T,compare>::
    element (
    )
    {
        return *cur;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    bool static_set_kernel_1<T,compare>::
    move_next (
    ) const
    {      
        // if at_start() && size() > 0
        if (at_start_ && set_size > 0)
        {
            at_start_ = false;
            cur = d;
            return true;
        }
        // else if current_element_valid()
        else if (cur != 0)
        {
            ++cur;
            if (static_cast<unsigned long>(cur - d) < set_size)
            {
                return true;
            }
            else
            {
                cur = 0;
                return false;
            }
        }
        else
        {
            at_start_ = false;
            return false;
        }
    }
    
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STATIC_SET_KERNEl_1_

