// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_FULL_OBJECT_DeTECTION_ABSTRACT_Hh_
#ifdef DLIB_FULL_OBJECT_DeTECTION_ABSTRACT_Hh_

#include <vector>
#include "../geometry.h"
#include "../serialize.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    const static point OBJECT_PART_NOT_PRESENT(0x7FFFFFFF,
                                               0x7FFFFFFF);

// ----------------------------------------------------------------------------------------

    class full_object_detection
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents the location of an object in an image along with the
                positions of each of its constituent parts.
        !*/

    public:

        full_object_detection(
            const rectangle& rect,
            const std::vector<point>& parts
        );
        /*!
            ensures
                - #get_rect() == rect
                - #num_parts() == parts.size()
                - for all valid i:
                    - part(i) == parts[i]
        !*/

        full_object_detection(
        );
        /*!
            ensures
                - #get_rect().is_empty() == true
                - #num_parts() == 0
        !*/

        explicit full_object_detection(
            const rectangle& rect
        );
        /*!
            ensures
                - #get_rect() == rect
                - #num_parts() == 0
        !*/

        const rectangle& get_rect(
        ) const;
        /*!
            ensures
                - returns the rectangle that indicates where this object is.  In general,
                  this should be the bounding box for the object.
        !*/

        rectangle& get_rect(
        ); 
        /*!
            ensures
                - returns the rectangle that indicates where this object is.  In general,
                  this should be the bounding box for the object.
        !*/

        unsigned long num_parts(
        ) const;
        /*!
            ensures
                - returns the number of parts in this object.  
        !*/

        const point& part(
            unsigned long idx
        ) const; 
        /*!
            requires
                - idx < num_parts()
            ensures
                - returns the location of the center of the idx-th part of this object.
                  Note that it is valid for a part to be "not present".  This is indicated
                  when the return value of part() is equal to OBJECT_PART_NOT_PRESENT. 
                  This is useful for modeling object parts that are not always observed.
        !*/

        point& part(
            unsigned long idx
        ); 
        /*!
            requires
                - idx < num_parts()
            ensures
                - returns the location of the center of the idx-th part of this object.
                  Note that it is valid for a part to be "not present".  This is indicated
                  when the return value of part() is equal to OBJECT_PART_NOT_PRESENT. 
                  This is useful for modeling object parts that are not always observed.
        !*/
    };

// ----------------------------------------------------------------------------------------

    void serialize (
        const full_object_detection& item, 
        std::ostream& out
    );   
    /*!
        provides serialization support 
    !*/

    void deserialize (
        full_object_detection& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

    bool all_parts_in_rect (
        const full_object_detection& obj
    );
    /*!
        ensures
            - returns true if all the parts in obj are contained within obj.get_rect().
              That is, returns true if and only if, for all valid i, the following is
              always true:
                obj.get_rect().contains(obj.part(i)) == true || obj.part(i) == OBJECT_PART_NOT_PRESENT
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FULL_OBJECT_DeTECTION_ABSTRACT_Hh_


