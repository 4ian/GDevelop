// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_HESSIAN_PYRAMId_ABSTRACT_H__
#ifdef DLIB_HESSIAN_PYRAMId_ABSTRACT_H__

#include "../image_transforms/integral_image_abstract.h"
#include "../noncopyable.h"
#include <vector>

namespace dlib
{

    class hessian_pyramid : noncopyable
    {
        /*!
            INITIAL VALUE
                - octaves() == 0
                - intervals() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents an image pyramid where each level in the
                pyramid holds determinants of Hessian matrices for the original 
                input image.  This object can be used to find stable interest
                points in an image.  For further details consult the following
                papers.

                This object is an implementation of the fast Hessian pyramid 
                as described in the paper: 
                   SURF: Speeded Up Robust Features
                   By Herbert Bay, Tinne Tuytelaars, and Luc Van Gool

                This implementation was also influenced by the very well documented
                OpenSURF library and its corresponding description of how the fast
                Hessian algorithm functions:  
                    Notes on the OpenSURF Library
                    Christopher Evans
        !*/
    public:

        template <typename integral_image_type>
        void build_pyramid (
            const integral_image_type& img,
            long num_octaves,
            long num_intervals,
            long initial_step_size
        );
        /*!
            requires
                - num_octaves > 0
                - num_intervals > 0
                - initial_step_size > 0
                - integral_image_type == an object such as dlib::integral_image or another
                  type that implements the interface defined in image_transforms/integral_image_abstract.h
            ensures
                - #get_step_size(0) == initial_step_size
                - #octaves() == num_octaves
                - #intervals() == num_intervals
                - creates a Hessian pyramid from the given input image.  
        !*/

        long octaves (
        ) const;
        /*!
            ensures
                - returns the number of octaves in this pyramid
        !*/

        long intervals (
        ) const; 
        /*!
            ensures
                - returns the number of intervals in this pyramid
        !*/

        long get_border_size (
            long octave
        ) const;
        /*!
            requires
                - 0 <= octave < octaves()
            ensures
                - Each octave of the pyramid has a certain sized border region where we
                  can't compute the Hessian values since they are too close to the edge
                  of the input image.  This function returns the size of that border.
        !*/

        long get_step_size (
            long octave
        ) const;
        /*!
            requires
                - 0 <= octave < octaves()
            ensures
                - Each octave has a step size value.  This value determines how many
                  input image pixels separate each pixel in the given pyramid octave.
                  As the octave gets larger (i.e. as it goes to the top of the pyramid) the
                  step size gets bigger and thus the pyramid narrows.
        !*/

        long nr (
            long octave
        ) const;
        /*!
            requires
                - 0 <= octave < octaves()
            ensures
                - returns the number of rows there are per layer in the given 
                  octave of pyramid
        !*/

        long nc (
            long octave
        ) const;
        /*!
            requires
                - 0 <= octave < octaves()
            ensures
                - returns the number of columns there are per layer in the given 
                  octave of pyramid
        !*/

        double get_value (
            long octave,
            long interval,
            long r,
            long c
        ) const;
        /*!
            requires
                - 0 <= octave < octaves()
                - 0 <= interval < intervals()
                - Let BS == get_border_size(octave): then
                    - BS <= r < nr(octave)-BS
                    - BS <= c < nc(octave)-BS
            ensures
                - returns the determinant of the Hessian from the given octave and interval
                  of the pyramid.  The specific point sampled at this pyramid level is
                  the one that corresponds to the input image point (point(r,c)*get_step_size(octave)).
        !*/

        double get_laplacian (
            long octave,
            long interval,
            long r,
            long c
        ) const;
        /*!
            requires
                - 0 <= octave < octaves()
                - 0 <= interval < intervals()
                - Let BS == get_border_size(octave): then
                    - BS <= r < nr(octave)-BS
                    - BS <= c < nc(octave)-BS
            ensures
                - returns the sign of the laplacian for the given octave and interval
                  of the pyramid.  The specific point sampled at this pyramid level is
                  the one that corresponds to the input image point (point(r,c)*get_step_size(octave)).
                - The laplacian is the trace of the Hessian at the given point.  So this 
                  function returns either +1 or -1 depending on this number's sign.  This
                  value can be used to distinguish bright blobs on dark backgrounds from
                  the reverse.
        !*/

    };

// ----------------------------------------------------------------------------------------

    struct interest_point
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object contains the interest points found using the 
                hessian_pyramid object.  Its fields have the following
                meanings:
                    - center == the x/y location of the center of the interest point
                      (in image space coordinates.  y gives the row and x gives the
                      column in the image)
                    - scale == the scale at which the point was detected
                    - score == the determinant of the Hessian for the interest point
                    - laplacian == the sign of the laplacian for the interest point
        !*/

        interest_point() : scale(0), score(0), laplacian(0) {}

        dlib::vector<double,2> center;
        double scale;
        double score;
        double laplacian;

        bool operator < (const interest_point& p) const { return score < p.score; }
        /*!
            This function is here so you can sort interest points according to 
            their scores
        !*/
    };

// ----------------------------------------------------------------------------------------

    void serialize (
        const interest_point& item,
        std::ostream& out
    );
    /*!
        provides serialization support
    !*/

    void deserialize (
        interest_point& item,
        std::istream& in 
    );
    /*!
        provides serialization support
    !*/

// ----------------------------------------------------------------------------------------

    template <typename Alloc>
    void get_interest_points (
        const hessian_pyramid& pyr,
        double threshold,
        std::vector<interest_point,Alloc>& result_points
    )
    /*!
        requires
            - threshold >= 0
        ensures
            - extracts interest points from the pyramid pyr and stores them into
              result_points (note that result_points is cleared before these new interest
              points are added to it).
            - Only interest points with determinant values in the pyramid larger than
              threshold are output.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif  // DLIB_HESSIAN_PYRAMId_ABSTRACT_H__

