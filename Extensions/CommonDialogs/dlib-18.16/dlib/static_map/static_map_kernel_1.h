// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STATIC_MAP_KERNEl_1_
#define DLIB_STATIC_MAP_KERNEl_1_

#include "static_map_kernel_abstract.h"
#include "../interfaces/map_pair.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../algs.h"
#include "../serialize.h"
#include <functional>

namespace dlib
{

    template <
        typename domain,
        typename range,
        typename compare = std::less<domain>
        >
    class static_map_kernel_1 : public enumerable<map_pair<domain,range> >
    {

        /*!
            INITIAL VALUE
                - map_size == 0
                - d == 0
                - r == 0
                - mp.d = 0;
                - at_start_ == true


            CONVENTION                
                - size() == map_size
                - if (size() > 0) then
                    - d == pointer to an array containing all the domain elements
                    - r == pointer to an array containing all the range elements
                    - for every i:  operator[](d[i]) == r[i]
                    - d is sorted according to operator<
                - else
                    - d == 0
                    - r == 0

                - current_element_valid() == (mp.d != 0)
                - at_start() == (at_start_)
                - if (current_element_valid()) then
                    - element() == mp
        !*/
        
        class mpair : public map_pair<domain,range>
        {
        public:
            const domain* d;
            range* r;

            const domain& key( 
            ) const { return *d; }

            const range& value(
            ) const { return *r; }

            range& value(
            ) { return *r; }
        };


        // I would define this outside the class but Borland 5.5 has some problems
        // with non-inline templated friend functions.          
        friend void deserialize (
            static_map_kernel_1& item, 
            std::istream& in
        )
        {
            try
            {
                item.clear();
                unsigned long size;
                deserialize(size,in);
                item.map_size = size;
                item.d = new domain[size];
                item.r = new range[size];
                for (unsigned long i = 0; i < size; ++i)
                {
                    deserialize(item.d[i],in);
                    deserialize(item.r[i],in);
                }
            }
            catch (serialization_error& e)
            { 
                item.map_size = 0;
                if (item.d)
                {
                    delete [] item.d;
                    item.d = 0;
                }
                if (item.r)
                {
                    delete [] item.r;
                    item.r = 0;
                }

                throw serialization_error(e.info + "\n   while deserializing object of type static_map_kernel_1"); 
            }
            catch (...)
            {
                item.map_size = 0;
                if (item.d)
                {
                    delete [] item.d;
                    item.d = 0;
                }
                if (item.r)
                {
                    delete [] item.r;
                    item.r = 0;
                }

                throw;
            }
        }


        public:

            typedef domain domain_type;
            typedef range range_type;
            typedef compare compare_type;

            static_map_kernel_1(
            );

            virtual ~static_map_kernel_1(
            ); 

            void clear (
            );

            void load (
                pair_remover<domain,range>& source
            );

            void load (
                asc_pair_remover<domain,range,compare>& source
            );

            inline const range* operator[] (
                const domain& d
            ) const;

            inline range* operator[] (
                const domain& d
            );

            inline void swap (
                static_map_kernel_1& item
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

            inline const map_pair<domain,range>& element (
            ) const;

            inline map_pair<domain,range>& element (
            );

            inline bool move_next (
            ) const;


        private:

            bool binary_search (
                const domain& item,
                unsigned long& pos
            ) const;
            /*!
                ensures
                    - if (there is an item in d equivalent to item) then
                        - returns true
                        - d[#pos] is equivalent item
                    - else
                        - returns false
            !*/

            void sort_arrays (
                unsigned long left,
                unsigned long right
            );
            /*!
                requires    
                    - left and right are within the bounts of the array
                ensures 
                    - everything in the convention is still true and d[left] though
                      d[right] is sorted according to operator<
            !*/

            void qsort_partition (
                unsigned long& partition_element,
                const unsigned long left,
                const unsigned long right
            );    
            /*!
                requires                   
                    - left < right
                    - left and right are within the bounts of the array
                ensures
                    - the convention is still true
                    - left <= #partition_element <= right                              
                    - all elements in #d < #d[#partition_element] have 
                      indices >= left and < #partition_element                         
                    - all elements in #d >= #d[#partition_element] have 
                      indices >= #partition_element and <= right
            !*/

            unsigned long median (
                unsigned long one,
                unsigned long two,
                unsigned long three
            );
            /*!
                requires
                    - one, two, and three are valid indexes into d
                ensures
                    - returns the median of d[one], d[two], and d[three]
            !*/




            // data members
            unsigned long map_size;
            domain* d;
            range* r;          
            mutable mpair mp;
            mutable bool at_start_;
            compare comp;

            // restricted functions
            static_map_kernel_1(static_map_kernel_1&);        // copy constructor
            static_map_kernel_1& operator=(static_map_kernel_1&);    // assignment operator
    };

    template <
        typename domain,
        typename range,
        typename compare
        >
    inline void swap (
        static_map_kernel_1<domain,range,compare>& a, 
        static_map_kernel_1<domain,range,compare>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    static_map_kernel_1<domain,range,compare>::
    static_map_kernel_1(
    ) :
        map_size(0),
        d(0),
        r(0),
        at_start_(true)
    {
        mp.d = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    static_map_kernel_1<domain,range,compare>::
    ~static_map_kernel_1(
    )
    {
        if (map_size > 0)
        {
            delete [] d;
            delete [] r;
        }
    } 

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    void static_map_kernel_1<domain,range,compare>::
    clear (
    )
    {
        if (map_size > 0)
        {
            map_size = 0;
            delete [] d;
            delete [] r;
            d = 0;
            r = 0;
        }
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    void static_map_kernel_1<domain,range,compare>::
    load (
        pair_remover<domain,range>& source
    )
    {        
        if (source.size() > 0)
        {             
            domain* old_d = d;
            d = new domain[source.size()];
            try { r = new range[source.size()]; }
            catch (...) { delete [] d; d = old_d; throw; }

            map_size = source.size();

            for (unsigned long i = 0; source.size() > 0; ++i)
                source.remove_any(d[i],r[i]);
                       
            sort_arrays(0,map_size-1);
        }
        else
        {
            clear();
        }
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    void static_map_kernel_1<domain,range,compare>::
    load (
        asc_pair_remover<domain,range,compare>& source
    )
    {
        if (source.size() > 0)
        {             
            domain* old_d = d;
            d = new domain[source.size()];
            try { r = new range[source.size()]; }
            catch (...) { delete [] d; d = old_d; throw; }

            map_size = source.size();

            for (unsigned long i = 0; source.size() > 0; ++i)
                source.remove_any(d[i],r[i]);
        }
        else
        {
            clear();
        }
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    const range* static_map_kernel_1<domain,range,compare>::
    operator[] (
        const domain& d_item
    ) const
    {
        unsigned long pos;
        if (binary_search(d_item,pos))
            return r+pos;
        else
            return 0;        
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    range* static_map_kernel_1<domain,range,compare>::
    operator[] (
        const domain& d_item
    )
    {
        unsigned long pos;
        if (binary_search(d_item,pos))
            return r+pos;
        else
            return 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    unsigned long static_map_kernel_1<domain,range,compare>::
    size (
    ) const
    {
        return map_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    void static_map_kernel_1<domain,range,compare>::
    swap (
        static_map_kernel_1<domain,range,compare>& item
    )
    {
        exchange(map_size,item.map_size);
        exchange(d,item.d);
        exchange(r,item.r);
        exchange(mp,item.mp);
        exchange(at_start_,item.at_start_);
        exchange(comp,item.comp);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // enumerable function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    bool static_map_kernel_1<domain,range,compare>::
    at_start (
    ) const
    {
        return (at_start_);
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    void static_map_kernel_1<domain,range,compare>::
    reset (
    ) const
    {        
        mp.d = 0;
        at_start_ = true;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    bool static_map_kernel_1<domain,range,compare>::
    current_element_valid (
    ) const
    {   
        return (mp.d != 0);
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    const map_pair<domain,range>& static_map_kernel_1<domain,range,compare>::
    element (
    ) const
    {
        return mp;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    map_pair<domain,range>& static_map_kernel_1<domain,range,compare>::
    element (
    )
    {
        return mp;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    bool static_map_kernel_1<domain,range,compare>::
    move_next (
    ) const
    {
        // if at_start() && size() > 0
        if (at_start_ && map_size > 0)
        {
            at_start_ = false;
            mp.r = r;
            mp.d = d;
            return true;
        }
        // else if current_element_valid()
        else if (mp.d != 0)
        {
            ++mp.d;
            ++mp.r;            
            if (static_cast<unsigned long>(mp.d - d) < map_size)
            {
                return true;
            }
            else
            {
                mp.d = 0;
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
// ----------------------------------------------------------------------------------------
    // private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    bool static_map_kernel_1<domain,range,compare>::
    binary_search (
        const domain& item,
        unsigned long& pos
    ) const
    {
        unsigned long high = map_size;
        unsigned long low = 0;
        unsigned long p = map_size;
        unsigned long idx;
        while (p > 0)
        {
            p = (high-low)>>1;
            idx = p+low;
            if (comp(item , d[idx]))
            {
                high = idx;
            }
            else if (comp(d[idx] , item))
            {
                low = idx;
            }
            else
            {
                pos = idx;
                return true;
            }
        }
        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    void static_map_kernel_1<domain,range,compare>::
    sort_arrays (
        unsigned long left,
        unsigned long right
    ) 
    {
        if ( left < right)
        {
            unsigned long partition_element;
            qsort_partition(partition_element,left,right);
            
            if (partition_element > 0)
                sort_arrays(left,partition_element-1);
            sort_arrays(partition_element+1,right);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    void static_map_kernel_1<domain,range,compare>::
    qsort_partition (
        unsigned long& partition_element,
        const unsigned long left,
        const unsigned long right
    )
    {
        partition_element = right;

        unsigned long med = median(partition_element,left,((right-left)>>1) +left);
        exchange(d[partition_element],d[med]);
        exchange(r[partition_element],r[med]);
        
        unsigned long right_scan = right-1;
        unsigned long left_scan = left;

        while (true)
        {
            // find an element to the left of partition_element that needs to be moved
            while ( comp( d[left_scan] , d[partition_element]) )
            {
                ++left_scan;
            }

            // find an element to the right of partition_element that needs to be moved
            while ( 
                !(comp (d[right_scan] , d[partition_element])) &&  
                (right_scan > left_scan) 
            )
            {
                --right_scan;
            }
            if (left_scan >= right_scan)
                break;

            exchange(d[left_scan],d[right_scan]);
            exchange(r[left_scan],r[right_scan]);

        }
        exchange(d[left_scan],d[partition_element]);
        exchange(r[left_scan],r[partition_element]);
        partition_element = left_scan;

    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    unsigned long static_map_kernel_1<domain,range,compare>::
    median (
        unsigned long one,
        unsigned long two,
        unsigned long three
    )
    {
        if ( comp( d[one] , d[two]) )
        {
            // one < two
            if ( comp( d[two] , d[three]) )
            {
                // one < two < three : two
                return two;                
            }
            else
            {
                // one < two >= three
                if (comp( d[one] , d[three]))
                {
                    // three
                    return three;
                }
            }
            
        }
        else
        {
            // one >= two
            if ( comp(d[three] , d[one] ))
            {
                // three <= one >= two
                if ( comp(d[three] , d[two]) )
                {
                    // two
                    return two;
                }
                else
                {
                    // three
                    return three;
                }
            }
        }  
        return one;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STATIC_MAP_KERNEl_1_

