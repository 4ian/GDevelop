// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_IMAGE_PYRaMID_ABSTRACT_H__
#ifdef DLIB_IMAGE_PYRaMID_ABSTRACT_H__

#include "../pixel.h"
#include "../array2d.h"
#include "../geometry.h"

namespace dlib
{

    class pyramid_down : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple functor to help create image pyramids.


                WARNING, when mapping rectangles from one layer of a pyramid
                to another you might end up with rectangles which extend slightly 
                outside your images.  This is because points on the border of an 
                image at a higher pyramid layer might correspond to points outside 
                images at lower layers.  So just keep this in mind.  Note also
                that it's easy to deal with.  Just say something like this:
                    rect = rect.intersect(get_rect(my_image)); // keep rect inside my_image 
        !*/
    public:

        template <
            typename in_image_type,
            typename out_image_type
            >
        void operator() (
            const in_image_type& original,
            out_image_type& down
        ) const;
        /*!
            requires
                - is_same_object(original, down) == false
                - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
                - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
                - pixel_traits<typename in_image_type::type>::has_alpha == false
                - pixel_traits<typename out_image_type::type>::has_alpha == false
            ensures
                - #down will contain an image that is roughly half the size of the original
                  image.  To be specific, this function performs the following steps:
                    - 1. Applies a 5x5 Gaussian filter to the original image to smooth it a little.
                    - 2. Every other row and column is discarded to create an image half the size
                         of the original.  This smaller image is stored in #down.
                - if both input and output images contain RGB pixels then the downsampled image will
                  be in color.  Otherwise, the downsampling will be performed in a grayscale mode.
                - The location of a point P in original image will show up at point point_down(P)
                  in the #down image.  
                - Note that some points on the border of the original image will correspond to 
                  points outside the #down image.  This is because the 5x5 filter is not applied 
                  at the borders.
        !*/

    // -------------------------------

        template <typename T>
        vector<double,2> point_down (
            const vector<T,2>& p
        ) const;
        /*!
            ensures
                - interprets p as a point in a parent image and returns the
                  point in a downsampled image which corresponds to p.
                - This function is the inverse of point_up().  I.e. for a point P:
                  point_down(point_up(P)) == P
        !*/

        template <typename T>
        vector<double,2> point_up (
            const vector<T,2>& p
        ) const;
        /*!
            ensures
                - interprets p as a point in a downsampled image and returns the
                  point in a parent image which corresponds to p.
                - This function is the inverse of point_down().  I.e. for a point P:
                  point_up(point_down(P)) == P
        !*/

        rectangle rect_down (
            const rectangle& rect
        ) const;
        /*!
            ensures
                - returns rectangle(point_down(rect.tl_corner()), point_down(rect.br_corner()));
                  (i.e. maps rect into a downsampled)
        !*/

        rectangle rect_up (
            const rectangle& rect
        ) const;
        /*!
            ensures
                - returns rectangle(point_up(rect.tl_corner()), point_up(rect.br_corner()));
                  (i.e. maps rect into a parent image)
        !*/

    // -------------------------------

        template <typename T>
        vector<double,2> point_down (
            const vector<T,2>& p,
            unsigned int levels
        ) const;
        /*!
            ensures
                - applies point_down() to p levels times and returns the result.
                  (i.e. point_down(p,2) == point_down(point_down(p)),
                        point_down(p,1) == point_down(p),
                        point_down(p,0) == p,  etc. )
        !*/

        template <typename T>
        vector<double,2> point_up (
            const vector<T,2>& p,
            unsigned int levels
        ) const;
        /*!
            ensures
                - applies point_up() to p levels times and returns the result.
                  (i.e. point_up(p,2) == point_up(point_up(p)),
                        point_up(p,1) == point_up(p),
                        point_up(p,0) == p,  etc. )
        !*/

        rectangle rect_down (
            const rectangle& rect,
            unsigned int levels
        ) const;
        /*!
            ensures
                - returns rectangle(point_down(rect.tl_corner(),levels), point_down(rect.br_corner(),levels));
                  (i.e. Basically applies rect_down() to rect levels times and returns the result.)
        !*/

        rectangle rect_up (
            const rectangle& rect,
            unsigned int levels
        ) const;
        /*!
            ensures
                - returns rectangle(point_up(rect.tl_corner(),levels), point_up(rect.br_corner(),levels));
                  (i.e. Basically applies rect_up() to rect levels times and returns the result.)
        !*/

    };

// ----------------------------------------------------------------------------------------

    class pyramid_down_3_2 : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a function object with an interface identical to pyramid_down (defined
                at the top of this file) except that it downsamples images at a ratio of 3 to 2
                instead of 2 to 1.
        !*/
    };


// ----------------------------------------------------------------------------------------

    class pyramid_down_4_3 : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a function object with an interface identical to pyramid_down (defined
                at the top of this file) except that it downsamples images at a ratio of 4 to 3
                instead of 2 to 1.
        !*/
    };

// ----------------------------------------------------------------------------------------

    class pyramid_down_5_4 : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a function object with an interface identical to pyramid_down (defined
                at the top of this file) except that it downsamples images at a ratio of 5 to 4
                instead of 2 to 1.
        !*/
    };

// ----------------------------------------------------------------------------------------

    class pyramid_disable : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a function object with an interface identical to pyramid_down (defined
                at the top of this file) except that it downsamples images at a ratio of infinity
                to 1.  That means it always outputs images of size 0 regardless of the size
                of the inputs.  
                
                This is useful because it can be supplied to routines which take a pyramid_down 
                function object and it will essentially disable pyramid processing.  This way, 
                a pyramid oriented function can be turned into a regular routine which processes
                just the original undownsampled image.
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_IMAGE_PYRaMID_ABSTRACT_H__


