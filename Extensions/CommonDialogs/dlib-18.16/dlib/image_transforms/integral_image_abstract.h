// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_INTEGRAL_IMAGe_ABSTRACT_
#ifdef DLIB_INTEGRAL_IMAGe_ABSTRACT_

#include "../geometry/rectangle_abstract.h"
#include "../array2d/array2d_kernel_abstract.h"
#include "../pixel.h"
#include "../noncopyable.h"
#include "../image_processing/generic_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class integral_image_generic : noncopyable
    {
        /*!
            REQUIREMENTS ON T
                T should be a built in scalar type.  Moreover, it should
                be capable of storing sums of whatever kind of pixel
                you will be dealing with.

            INITIAL VALUE
                - nr() == 0
                - nc() == 0

            WHAT THIS OBJECT REPRESENTS
                This object is an alternate way of representing image data
                that allows for very fast computations of sums of pixels in 
                rectangular regions.  To use this object you load it with a
                normal image and then you can use the get_sum_of_area()
                function to compute sums of pixels in a given area in
                constant time.
        !*/
    public:
        typedef T value_type;

        const long nr(
        ) const;
        /*!
            ensures
                - returns the number of rows in this integral image object
        !*/

        const long nc(
        ) const;
        /*!
            ensures
                - returns the number of columns in this integral image object
        !*/

        template <typename image_type>
        void load (
            const image_type& img
        );
        /*!
            requires
                - image_type == an image object that implements the interface defined in
                  dlib/image_processing/generic_image.h 
                - Let P denote the type of pixel in img, then we require:
                    - pixel_traits<P>::has_alpha == false 
            ensures
                - #nr() == img.nr()
                - #nc() == img.nc()
                - #*this will now contain an "integral image" representation of the
                  given input image.  
        !*/

        value_type get_sum_of_area (
            const rectangle& rect
        ) const;
        /*!
            requires
                - rect.is_empty() == false
                - get_rect(*this).contains(rect) == true
                  (i.e. rect must not be outside the integral image)
            ensures
                - Let O denote the image this integral image was generated from.
                  Then this function returns sum(subm(mat(O),rect)).
                  That is, this function returns the sum of the pixels in O that
                  are contained within the given rectangle.
        !*/

        void swap(
            integral_image_generic& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

// ----------------------------------------------------------------------------------------

    template < typename T >
    void swap (
        integral_image_generic<T>& a,
        integral_image_generic<T>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/ 

// ----------------------------------------------------------------------------------------

    typedef integral_image_generic<long> integral_image;

// ----------------------------------------------------------------------------------------

    template <typename integral_image_type>
    typename integral_image_type::value_type haar_x (
        const integral_image_type& img,
        const point& p,
        long width
    )
    /*!
        requires
            - get_rect(img).contains(centered_rect(p,width,width)) == true
            - integral_image_type == a type that implements the integral_image_generic 
              interface defined above
        ensures
            - returns the response of a Haar wavelet centered at the point p
              with the given width.  The wavelet is oriented along the X axis
              and has the following shape:
                ----++++
                ----++++
                ----++++
                ----++++
              That is, the wavelet is square and computes the sum of pixels on the
              right minus the sum of pixels on the left.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename integral_image_type>
    typename integral_image_type::value_type haar_y (
        const integral_image_type& img,
        const point& p,
        long width
    )
    /*!
        requires
            - get_rect(img).contains(centered_rect(p,width,width)) == true
            - integral_image_type == a type that implements the integral_image_generic 
              interface defined above
        ensures
            - returns the response of a Haar wavelet centered at the point p
              with the given width in the given image.  The wavelet is oriented 
              along the Y axis and has the following shape:
                --------
                --------
                ++++++++
                ++++++++
              That is, the wavelet is square and computes the sum of pixels on the
              bottom minus the sum of pixels on the top.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_INTEGRAL_IMAGe_ABSTRACT_

