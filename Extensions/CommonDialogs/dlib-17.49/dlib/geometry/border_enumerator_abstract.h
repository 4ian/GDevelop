// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BORDER_EnUMERATOR_ABSTRACT_H_
#ifdef DLIB_BORDER_EnUMERATOR_ABSTRACT_H_

#include "rectangle_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class border_enumerator
    {
        /*!
            POINTERS AND REFERENCES TO INTERNAL DATA
                All operations on this object other than calling element() invalidate
                pointers and references to internal data.

            WHAT THIS OBJECT REPRESENTS
                This object is an enumerator over the border points of a rectangle.
        !*/
    public:

        border_enumerator(
        ); 
        /*!
            ensures
                - #move_next() == false
                  (i.e. this object is "empty" and won't enumerate anything)
                - current_element_valid() == false 
                - at_start() == true
                - size() == 0
        !*/

        border_enumerator(
            const rectangle& rect,
            unsigned long border_size
        );
        /*!
            ensures
                - This object will enumerate over the border points which are inside rect
                  but within border_size of the edge.  For example, if border_size == 1
                  then it enumerates over the single point wide strip of points all around
                  the interior edge of rect.
                - current_element_valid() == false 
                - at_start() == true
                - size() == rect.area() - shrink_rect(rect,border_size).area()
                  (i.e. the number of points in the border area of rect)
        !*/

        border_enumerator(
            const rectangle& rect,
            const rectangle& non_border_region
        );
        /*!
            ensures
                - This object will enumerate over all points which are in rect but
                  not in non_border_region.  
                - current_element_valid() == false 
                - at_start() == true
                - size() == rect.area() - rect.intersect(non_border_region).area() 
        !*/

        bool at_start (
        ) const;
        /*!
            ensures
                - returns true if *this represents one position before the first point 
                  (this would also make the current element invalid) else returns false                
        !*/

        void reset (
        ); 
        /*!
            ensures
                - #current_element_valid() == false 
                - #at_start() == true
        !*/

        bool current_element_valid(
        ) const;
        /*!
            ensures
                - returns true if we are currently at a valid element else
                  returns false 
        !*/

        bool move_next(
        );
        /*!
            ensures
                - moves to the next element.  i.e. #element() will now 
                  return the next border point. 
                - the return value will be equal to #current_element_valid() 
                - #at_start() == false 

                - returns true if there is another element 
                - returns false if there are no more elements in the container
        !*/

        unsigned long size (
        ) const;
        /*!
            ensures
                - returns the number of border points
        !*/

        const point& element (
        ) const;
        /*!
            requires
                - current_element_valid() == true
            ensures
                - returns the current border point
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BORDER_EnUMERATOR_ABSTRACT_H_


