// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SURf_ABSTRACT_H_
#ifdef DLIB_SURf_ABSTRACT_H_

#include "hessian_pyramid_abstract.h"
#include "../geometry/vector_abstract.h"
#include "../matrix/matrix_abstract.h"
#include "../image_processing/generic_image.h"

namespace dlib
{
    /*
        The functions in this file implement the components of the SURF algorithm
        for extracting scale invariant feature descriptors from images.

        For the full story on what this algorithm does and how it works
        you should refer to the following papers.

        This is the original paper which introduced the algorithm:
            SURF: Speeded Up Robust Features
            By Herbert Bay, Tinne Tuytelaars, and Luc Van Gool

        This paper provides a nice detailed overview of how the algorithm works:
            Notes on the OpenSURF Library by Christopher Evans
    */

// ----------------------------------------------------------------------------------------
    
    double gaussian (
        double x, 
        double y,
        double sig
    );
    /*!
        requires
            - sig > 0
        ensures
            - computes and returns the value of a 2D Gaussian function with mean 0 
              and standard deviation sig at the given (x,y) point.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename integral_image_type, typename T>
    double compute_dominant_angle (
        const integral_image_type& img,
        const dlib::vector<T,2>& center,
        const double& scale
    );
    /*!
        requires
            - integral_image_type == an object such as dlib::integral_image or another
              type that implements the interface defined in image_transforms/integral_image_abstract.h
            - scale > 0
            - get_rect(img).contains(centered_rect(center, 17*scale, 17*scale)) == true
              (i.e. center can't be within 17*scale pixels of the edge of the image)
        ensures
            - computes and returns the dominant angle (i.e. the angle of the dominant gradient)
              at the given center point and scale in img.  
            - The returned angle is in radians.  Specifically, if the angle is described by
              a vector vect then the angle is exactly the value of std::atan2(vect.y(), vect.x())
    !*/

// ----------------------------------------------------------------------------------------

    template <typename integral_image_type, typename T, typename MM, typename L>
    void compute_surf_descriptor (
        const integral_image_type& img,
        const dlib::vector<T,2>& center,
        const double scale,
        const double angle,
        matrix<double,64,1,MM,L>& des
    )
    /*!
        requires
            - integral_image_type == an object such as dlib::integral_image or another
              type that implements the interface defined in image_transforms/integral_image_abstract.h
            - scale > 0
            - get_rect(img).contains(centered_rect(center, 32*scale, 32*scale)) == true
              (i.e. center can't be within 32*scale pixels of the edge of the image)
        ensures
            - computes the 64 dimensional SURF descriptor vector of a box centered
              at the given center point, tilted at an angle determined by the given 
              angle, and sized according to the given scale.  
            - #des == the computed SURF descriptor vector extracted from the img object.
            - The angle is measured in radians and measures the degree of counter-clockwise 
              rotation around the center point.  This is the same kind of rotation as is 
              performed by the dlib::rotate_point() function.
    !*/

// ----------------------------------------------------------------------------------------

    struct surf_point
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a detected SURF point.  The meanings of 
                its fields are defined below in the get_surf_points() function.
        !*/

        interest_point p;
        matrix<double,64,1> des;
        double angle;
    };

// ----------------------------------------------------------------------------------------

    void serialize (
        const surf_point& item,
        std::ostream& out
    );
    /*!
        provides serialization support
    !*/

    void deserialize (
        surf_point& item,
        std::istream& in 
    );
    /*!
        provides serialization support
    !*/

// ----------------------------------------------------------------------------------------

    template <typename image_type>
    const std::vector<surf_point> get_surf_points (
        const image_type& img,
        long max_points = 10000,
        double detection_threshold = 30.0
    );
    /*!
        requires
            - max_points > 0
            - detection_threshold >= 0
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - Let P denote the type of pixel in img, then we require:
                - pixel_traits<P>::has_alpha == false 
        ensures
            - This function runs the complete SURF algorithm on the given input image and 
              returns the points it found. 
            - returns a vector V such that:
                - V.size() <= max_points
                - for all valid i:
                    - V[i] == a SURF point found in the given input image img
                    - V[i].p == the interest_point extracted from the hessian pyramid for this
                      SURF point.
                    - V[i].des == the SURF descriptor for this point (calculated using 
                      compute_surf_descriptor())
                    - V[i].angle == the angle of the SURF box at this point (calculated using 
                      compute_dominant_angle())
                    - V[i].p.score >= detection_threshold
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SURf_ABSTRACT_H_


