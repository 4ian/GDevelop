// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_FULL_OBJECT_DeTECTION_Hh_
#define DLIB_FULL_OBJECT_DeTECTION_Hh_

#include "../geometry.h"
#include "full_object_detection_abstract.h"
#include <vector>
#include "../serialize.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    const static point OBJECT_PART_NOT_PRESENT(0x7FFFFFFF,
                                                0x7FFFFFFF);

// ----------------------------------------------------------------------------------------

    class full_object_detection
    {
    public:
        full_object_detection(
            const rectangle& rect_,
            const std::vector<point>& parts_
        ) : rect(rect_), parts(parts_) {}

        full_object_detection(){}

        explicit full_object_detection(
            const rectangle& rect_
        ) : rect(rect_) {}

        const rectangle& get_rect() const { return rect; }
        rectangle& get_rect() { return rect; }
        unsigned long num_parts() const { return parts.size(); }

        const point& part(
            unsigned long idx
        ) const 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(idx < num_parts(),
                "\t point full_object_detection::part()"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t idx:         " << idx  
                << "\n\t num_parts(): " << num_parts()  
                << "\n\t this:        " << this
                );
            return parts[idx]; 
        }

        point& part(
            unsigned long idx
        )  
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(idx < num_parts(),
                "\t point full_object_detection::part()"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t idx:         " << idx  
                << "\n\t num_parts(): " << num_parts()  
                << "\n\t this:        " << this
                );
            return parts[idx]; 
        }

        friend void serialize (
            const full_object_detection& item,
            std::ostream& out
        )
        {
            int version = 1;
            serialize(version, out);
            serialize(item.rect, out);
            serialize(item.parts, out);
        }

        friend void deserialize (
            full_object_detection& item,
            std::istream& in
        )
        {
            int version = 0;
            deserialize(version, in);
            if (version != 1)
                throw serialization_error("Unexpected version encountered while deserializing dlib::full_object_detection.");

            deserialize(item.rect, in);
            deserialize(item.parts, in);
        }

    private:
        rectangle rect;
        std::vector<point> parts;  
    };

// ----------------------------------------------------------------------------------------

    inline bool all_parts_in_rect (
        const full_object_detection& obj
    )
    {
        for (unsigned long i = 0; i < obj.num_parts(); ++i)
        {
            if (obj.get_rect().contains(obj.part(i)) == false &&
                obj.part(i) != OBJECT_PART_NOT_PRESENT)
                return false;
        }
        return true;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FULL_OBJECT_DeTECTION_H_

