// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SORt_
#define DLIB_SORt_

#include "algs.h"
#include <functional>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    inline void qsort_array (
        T& array,
        unsigned long left,
        unsigned long right,
        const compare& comp 
    );
    /*!
        requires
            - T implements operator[]                                 
            - the items in array must be comparable by comp where comp is a function
              object with the same syntax as std::less<>
            - the items in array must be swappable by a global swap()   
            - left and right are within the bounds of array
              i.e. array[left] and array[right] are valid elements
            - left <= right
        ensures
            - for all elements in #array between and including left and right the 
              ith element is < the i+1 element
            - sorts using a quick sort algorithm
    !*/ 

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    void hsort_array (
        T& array,
        unsigned long left,
        unsigned long right,
        const compare& comp 
    );
    /*!
        requires
            - T implements operator[]                                 
            - the items in array must be comparable by comp where comp is a function
              object with the same syntax as std::less<>
            - the items in array must be swappable by a global swap()   
            - left and right are within the bounds of array
              i.e. array[left] and array[right] are valid elements
            - left <= right
        ensures
            - for all elements in #array between and including left and right the 
              ith element is < the i+1 element
            - sorts using a heapsort algorithm
    !*/ 

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    void isort_array (
        T& array,
        unsigned long left,
        unsigned long right,
        const compare& comp 
    );
    /*!
        requires
            - T implements operator[]                                 
            - the items in array must be comparable by comp where comp is a function
              object with the same syntax as std::less<>
            - the items in array must be swappable by a global swap()   
            - left and right are within the bounds of array
              i.e. array[left] and array[right] are valid elements
            - left <= right
        ensures
            - for all elements in #array between and including left and right the 
              ith element is < the i+1 element
            - sorts using an insertion sort algorithm
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    inline void qsort_array (
        T& array,
        unsigned long left,
        unsigned long right
    ); 
    /*!
        requires
            - T implements operator[]                                 
            - the items in array must be comparable by std::less         
            - the items in array must be swappable by a global swap()   
            - left and right are within the bounds of array
              i.e. array[left] and array[right] are valid elements
            - left <= right
        ensures
            - for all elements in #array between and including left and right the 
              ith element is < the i+1 element
            - sorts using a quick sort algorithm
    !*/ 

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void hsort_array (
        T& array,
        unsigned long left,
        unsigned long right
    );
    /*!
        requires
            - T implements operator[]                                 
            - the items in array must be comparable by std::less         
            - the items in array must be swappable by a global swap()   
            - left and right are within the bounds of array
              i.e. array[left] and array[right] are valid elements
            - left <= right
        ensures
            - for all elements in #array between and including left and right the 
              ith element is < the i+1 element
            - sorts using a heapsort algorithm
    !*/ 

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void isort_array (
        T& array,
        unsigned long left,
        unsigned long right
    ); 
    /*!
        requires
            - T implements operator[]                                 
            - the items in array must be comparable by std::less      
            - the items in array must be swappable by a global swap()   
            - left and right are within the bounds of array
              i.e. array[left] and array[right] are valid elements
            - left <= right
        ensures
            - for all elements in #array between and including left and right the 
              ith element is < the i+1 element
            - sorts using an insertion sort algorithm
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                            IMPLEMENTATION DETAILS
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace sort_helpers
    {
        template <typename T>
        inline const std::less<T> comp (const T&)
        {
            return std::less<T>();
        }

        template <
            typename T,
            typename Y,
            typename compare
            >
        inline unsigned long qsort_partition (
            T& array,
            Y& pivot,
            const unsigned long left,
            const unsigned long right,
            const compare& comp
        )
        /*!
            requires
                - &pivot == &array[right]
                - T implements operator[]                             
                - the items in array must be comparable by comp     
                - left and right are within the bounts of the array
                - left < right
            ensures
                - returns a number called partition_element such that:
                    - left <= partition_element <= right                              
                    - all elements in #array < #array[partition_element] have 
                    indices >= left and < partition_element                         
                    - all elements in #array > #array[partition_element] have 
                    indices > partition_element and <= right
        !*/
        {
            DLIB_ASSERT (&pivot == &array[right] && left < right,
                    "\tunsigned long qsort_partition()"
                    << "\n\t&pivot:        " << &pivot
                    << "\n\t&array[right]: " << &array[right]
                    << "\n\tleft:          " << left
                    << "\n\tright:         " << right );

            exchange(array[(right-left)/2 +left],pivot);

            unsigned long i = left;
            for (unsigned long j = left; j < right; ++j)
            {
                if (comp(array[j] , pivot))
                {
                    swap(array[i],array[j]);
                    ++i;
                }
            }
            exchange(array[i],pivot);
            
            return i;
        }

// ----------------------------------------------------------------------------------------

        template <
            typename T,
            typename compare
            >
        void qsort_array_main (
            T& array,
            const unsigned long left,
            const unsigned long right,
            unsigned long depth_check,
            const compare& comp
        )
        /*!
            requires
                - T implements operator[]                                 
                - the items in array must be comparable by comp         
                - the items in array must be swappable by a global swap()   
                - left and right are within the bounds of array
                  i.e. array[left] and array[right] are valid elements
            ensures
                - for all elements in #array between and including left and right the 
                  ith element is < the i+1 element
                - will only recurse about as deep as log(depth_check) calls
                - sorts using a quick sort algorithm
        !*/ 
        {
            if ( left < right)
            {
                if (right-left < 30 || depth_check == 0)
                {
                    hsort_array(array,left,right,comp);
                }
                else
                {
                    // The idea here is to only let quick sort go about log(N)
                    // calls deep before it kicks into something else.
                    depth_check >>= 1;
                    depth_check += (depth_check>>4);

                    unsigned long partition_element = 
                        qsort_partition(array,array[right],left,right,comp);
                    
                    if (partition_element > 0)
                        qsort_array_main(array,left,partition_element-1,depth_check,comp);
                    qsort_array_main(array,partition_element+1,right,depth_check,comp);
                }
            }
        }

// ----------------------------------------------------------------------------------------

        template <
            typename T,
            typename compare
            >
        void heapify (
            T& array,
            const unsigned long start,
            const unsigned long end,
            unsigned long i,
            const compare& comp
        )
        /*!
            requires
                - T implements operator[]                                 
                - the items in array must be comparable by comp        
                - the items in array must be swappable by a global swap()   
                - start, end, and i are within the bounds of array
                  i.e. array[start], array[end], and array[i] are valid elements
                - start <= i <= end
                - array[i/2] is a max heap
                - array[i/2+1] is a max heap
                - start and end specify the range of the array we are working with.
            ensures
                - array[i] is now a max heap
        !*/
        {
            DLIB_ASSERT (start <= i && i <= end,
                    "\tvoid heapify()"
                    << "\n\tstart:   " << start 
                    << "\n\tend:     " << end 
                    << "\n\ti:       " << i );

            bool keep_going = true;            
            unsigned long left;
            unsigned long right;   
            unsigned long largest; 
            while (keep_going)
            {
                keep_going = false;
                left = (i<<1)+1-start;
                right = left+1;

                if (left <= end && comp(array[i] , array[left]))
                    largest = left;
                else
                    largest = i;

                if (right <= end && comp(array[largest] , array[right]))
                    largest = right;

                if (largest != i)
                {
                    exchange(array[i],array[largest]);
                    i = largest;
                    keep_going = true;
                }
            }
        }

// ----------------------------------------------------------------------------------------
    }
// ----------------------------------------------------------------------------------------


    template <
        typename T
        >
    inline void qsort_array (
        T& array,
        unsigned long left,
        unsigned long right
    ) 
    {
        using namespace sort_helpers;
        qsort_array(array,left,right,comp(array[left]));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void hsort_array (
        T& array,
        unsigned long left,
        unsigned long right
    )
    {
        using namespace sort_helpers;
        hsort_array(array,left,right,comp(array[left]));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void isort_array (
        T& array,
        unsigned long left,
        unsigned long right
    ) 
    {
        using namespace sort_helpers;
        isort_array(array,left,right,comp(array[left]));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    void isort_array (
        T& array,
        const unsigned long left,
        const unsigned long right,
        const compare& comp
    )
    {
        DLIB_ASSERT (left <= right,
                "\tvoid isort_array()"
                << "\n\tleft:          " << left
                << "\n\tright:         " << right );
        using namespace sort_helpers;

        unsigned long pos;
        for (unsigned long i = left+1; i <= right; ++i)
        {
            // everything from left to i-1 is sorted.
            pos = i;
            for (unsigned long j = i-1; comp(array[pos] , array[j]); --j)
            {
                exchange(array[pos],array[j]);
                pos = j;
                
                if (j == left)
                    break;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    void qsort_array (
        T& array,
        const unsigned long left,
        const unsigned long right,
        const compare& comp
    )
    {      
        DLIB_ASSERT (left <= right,
                "\tvoid qsort_array()"
                << "\n\tleft:          " << left
                << "\n\tright:         " << right );

        sort_helpers::qsort_array_main(array,left,right,right-left,comp);
    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename T,
        typename compare
        >
    void hsort_array (
        T& array,
        const unsigned long left,
        const unsigned long right,
        const compare& comp
    )
    {
        DLIB_ASSERT (left <= right,
                "\tvoid hsort_array()"
                << "\n\tleft:          " << left
                << "\n\tright:         " << right );

        if (right-left < 30)
        {
            isort_array(array,left,right,comp);
            return;
        }

        // turn array into a max heap
        for (unsigned long i = left+((right-left)>>1);; --i)
        {
            sort_helpers::heapify(array,left,right,i,comp);
            if (i == left)
                break;
        }

        // now sort the array
        for (unsigned long i = right; i > left;)
        {
            exchange(array[i],array[left]);
            sort_helpers::heapify(array,left,--i,left,comp);
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SORt_

