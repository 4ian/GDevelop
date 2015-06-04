// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_IMAGE_PYRaMID_ABSTRACT_Hh_
#ifdef DLIB_IMAGE_PYRaMID_ABSTRACT_Hh_

#include "../pixel.h"
#include "../array2d.h"
#include "../geometry.h"
#include "../image_processing/generic_image.h"

namespace dlib
{

    template <
        unsigned int N
        >
    class pyramid_down : noncopyable
    {
        /*!
            REQUIREMENTS ON N
                N > 0

            WHAT THIS OBJECT REPRESENTS
                This is a simple functor to help create image pyramids.  In particular, it
                downsamples images at a ratio of N to N-1.

                Note that setting N to 1 means that this object functions like
                pyramid_disable (defined at the bottom of this file).  

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
                - in_image_type == an image object that implements the interface defined in
                  dlib/image_processing/generic_image.h 
                - out_image_type == an image object that implements the interface defined in
                  dlib/image_processing/generic_image.h 
                - for both pixel types P in the input and output images, we require:
                    - pixel_traits<P>::has_alpha == false
            ensures
                - #down will contain an image that is roughly (N-1)/N times the size of the
                  original image.  
                - If both input and output images contain RGB pixels then the downsampled image will
                  be in color.  Otherwise, the downsampling will be performed in a grayscale mode.
                - The location of a point P in original image will show up at point point_down(P)
                  in the #down image.  
                - Note that some points on the border of the original image might correspond to 
                  points outside the #down image.  
        !*/

        template <
            typename image_type
            >
        void operator() (
            image_type& img
        ) const;
        /*!
            requires
                - image_type == an image object that implements the interface defined in
                  dlib/image_processing/generic_image.h 
                - pixel_traits<typename image_traits<image_type>::pixel_type>::has_alpha == false
            ensures
                - This function downsamples the given image and stores the results in #img.
                  In particular, it is equivalent to performing: 
                    (*this)(img, temp); 
                    swap(img, temp);
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

        drectangle rect_down (
            const drectangle& rect
        ) const;
        /*!
            ensures
                - returns drectangle(point_down(rect.tl_corner()), point_down(rect.br_corner()));
                  (i.e. maps rect into a downsampled)
        !*/

        drectangle rect_up (
            const drectangle& rect
        ) const;
        /*!
            ensures
                - returns drectangle(point_up(rect.tl_corner()), point_up(rect.br_corner()));
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

        drectangle rect_down (
            const drectangle& rect,
            unsigned int levels
        ) const;
        /*!
            ensures
                - returns drectangle(point_down(rect.tl_corner(),levels), point_down(rect.br_corner(),levels));
                  (i.e. Basically applies rect_down() to rect levels times and returns the result.)
        !*/

        drectangle rect_up (
            const drectangle& rect,
            unsigned int levels
        ) const;
        /*!
            ensures
                - returns drectangle(point_up(rect.tl_corner(),levels), point_up(rect.br_corner(),levels));
                  (i.e. Basically applies rect_up() to rect levels times and returns the result.)
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

#endif // DLIB_IMAGE_PYRaMID_ABSTRACT_Hh_


