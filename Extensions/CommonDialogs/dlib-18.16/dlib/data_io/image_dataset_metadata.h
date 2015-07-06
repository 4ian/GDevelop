// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_IMAGE_DAtASET_METADATA_Hh_
#define DLIB_IMAGE_DAtASET_METADATA_Hh_

#include <string>
#include <vector>
#include "../geometry.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{
    namespace image_dataset_metadata
    {

    // ------------------------------------------------------------------------------------

        struct box
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This object represents an annotated rectangular area of an image.  
                    It is typically used to mark the location of an object such as a 
                    person, car, etc.

                    The main variable of interest is rect.  It gives the location of 
                    the box.  All the other variables are optional.
            !*/

            box(
            ) : 
                difficult(false),
                truncated(false),
                occluded(false),
                ignore(false),
                angle(0)
            {}

            box (
                const rectangle& rect_
            ) : 
                rect(rect_), 
                difficult(false),
                truncated(false),
                occluded(false),
                ignore(false),
                angle(0)
            {}

            rectangle rect;

            std::map<std::string,point> parts;

            // optional fields
            std::string label;
            bool difficult;
            bool truncated;
            bool occluded;
            bool ignore;

            // The angle of the object in radians.  Positive values indicate that the
            // object at the center of the box is rotated clockwise by angle radians.  A
            // value of 0 would indicate that the object is in its "standard" upright pose.
            // Therefore, to make the object appear upright we would have to rotate the
            // image counter-clockwise by angle radians.
            double angle; 

            bool has_label() const { return label.size() != 0; }
            /*!
                ensures
                    - returns true if label metadata is present and false otherwise.
            !*/
        };

    // ------------------------------------------------------------------------------------

        struct image
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This object represents an annotated image.   
            !*/

            image() {}
            image(const std::string& f) : filename(f) {}

            std::string filename;
            std::vector<box> boxes;
        };

    // ------------------------------------------------------------------------------------

        struct dataset
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This object represents a labeled set of images.  In particular, it
                    contains the filename for each image as well as annotated boxes.
            !*/

            std::vector<image> images;
            std::string comment;
            std::string name;
        };

    // ------------------------------------------------------------------------------------

        void save_image_dataset_metadata (
            const dataset& meta,
            const std::string& filename
        );
        /*!
            ensures
                - Writes the contents of the meta object to a file with the given
                  filename.  The file will be in an XML format.
            throws
                - dlib::error 
                  This exception is thrown if there is an error which prevents
                  this function from succeeding.
        !*/

    // ------------------------------------------------------------------------------------

        void load_image_dataset_metadata (
            dataset& meta,
            const std::string& filename
        );
        /*!
            ensures
                - Attempts to interpret filename as a file containing XML formatted data
                  as produced by the save_image_dataset_metadata() function.  Then
                  meta is loaded with the contents of the file.
            throws
                - dlib::error 
                  This exception is thrown if there is an error which prevents
                  this function from succeeding.
        !*/

    // ------------------------------------------------------------------------------------

    }
}

// ----------------------------------------------------------------------------------------

#ifdef NO_MAKEFILE
#include "image_dataset_metadata.cpp"
#endif

#endif // DLIB_IMAGE_DAtASET_METADATA_Hh_

