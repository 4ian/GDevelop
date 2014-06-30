// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_INTERPOlATION_ABSTRACT_
#ifdef DLIB_INTERPOlATION_ABSTRACT_ 

#include "../pixel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class interpolate_nearest_neighbor
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for performing nearest neighbor interpolation
                on an image.  
        !*/

    public:

        template <typename image_type>
        bool operator() (
            const image_type& img,
            const dlib::point& p,
            typename image_type::type& result
        ) const;
        /*!
            requires
                - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            ensures
                - if (p is located inside img) then
                    - #result == img[p.y()][p.x()]
                    - returns true
                - else
                    - returns false
        !*/

    };

// ----------------------------------------------------------------------------------------

    class interpolate_bilinear
    {

        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for performing bilinear interpolation
                on an image.  This is performed by looking at the 4 pixels
                nearest to a point and deriving an interpolated value from them.
        !*/

    public:

        template <
            typename T, 
            typename image_type
            >
        bool operator() (
            const image_type& img,
            const dlib::vector<T,2>& p,
            typename image_type::type& result
        ) const;
        /*!
            requires
                - image_type == is an implementation of array2d/array2d_kernel_abstract.h
                - pixel_traits<typename image_type::type>::has_alpha == false
            ensures
                - if (there is an interpolatable image location at point p in img) then
                    - #result == the interpolated pixel value from img at point p.
                    - returns true
                    - if img contain RGB pixels then the interpolation will be in 
                      color.  Otherwise, the interpolation will be performed in 
                      a grayscale mode.
                - else
                    - returns false
        !*/
    };

// ----------------------------------------------------------------------------------------

    class interpolate_quadratic
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for performing quadratic interpolation
                on an image.  This is performed by looking at the 9 pixels
                nearest to a point and deriving an interpolated value from them.
        !*/

    public:

        template <
            typename T, 
            typename image_type
            >
        bool operator() (
            const image_type& img,
            const dlib::vector<T,2>& p,
            typename image_type::type& result
        ) const;
        /*!
            requires
                - image_type == is an implementation of array2d/array2d_kernel_abstract.h
                - pixel_traits<typename image_type::type>::has_alpha == false
            ensures
                - if (there is an interpolatable image location at point p in img) then
                    - #result == the interpolated pixel value from img at point p
                    - returns true
                    - if img contain RGB pixels then the interpolation will be in 
                      color.  Otherwise, the interpolation will be performed in 
                      a grayscale mode.
                - else
                    - returns false
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class black_background
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a function object which simply sets a pixel 
                to have a black value.
        !*/

    public:
        template <typename pixel_type>
        void operator() ( pixel_type& p) const { assign_pixel(p, 0); }
    };

// ----------------------------------------------------------------------------------------

    class white_background
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a function object which simply sets a pixel 
                to have a white value.
        !*/

    public:
        template <typename pixel_type>
        void operator() ( pixel_type& p) const { assign_pixel(p, 255); }
    };

// ----------------------------------------------------------------------------------------

    class no_background
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a function object which does nothing.  It is useful
                when used with the transform_image() routine defined below
                if no modification of uninterpolated output pixels is desired.
        !*/
    public:
        template <typename pixel_type>
        void operator() ( pixel_type& ) const { }
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename interpolation_type,
        typename point_mapping_type,
        typename background_type
        >
    void transform_image (
        const image_type& in_img,
        image_type& out_img,
        const interpolation_type& interp,
        const point_mapping_type& map_point,
        const background_type& set_background,
        const rectangle& area
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - interpolation_type == interpolate_nearest_neighbor, interpolate_bilinear, 
              interpolate_quadratic, or a type with a compatible interface.
            - map_point should be a function which takes dlib::vector<T,2> objects and
              returns dlib::vector<T,2> objects.  An example is point_transform_affine.
            - set_background should be a function which can take a single argument of
              type image_type::type.  Examples are black_background, white_background,
              and no_background.
            - get_rect(out_img).contains(area) == true
            - is_same_object(in_img, out_img) == false
        ensures
            - The map_point function defines a mapping from pixels in out_img to pixels
              in in_img.  transform_image() uses this mapping, along with the supplied
              interpolation routine interp, to fill the region of out_img defined by
              area with an interpolated copy of in_img.  
            - This function does not change the size of out_img.
            - Only pixels inside the region defined by area in out_img are modified.
            - For all locations r and c such that area.contains(c,r) but have no corresponding 
              locations in in_img:
                - set_background(out_img[r][c]) is invoked
                  (i.e. some parts of out_img might correspond to areas outside in_img and
                  therefore can't supply interpolated values.  In these cases, these
                  pixels can be assigned a value by the supplied set_background() routine)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename interpolation_type,
        typename point_mapping_type,
        typename background_type
        >
    void transform_image (
        const image_type& in_img,
        image_type& out_img,
        const interpolation_type& interp,
        const point_mapping_type& map_point,
        const background_type& set_background
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - interpolation_type == interpolate_nearest_neighbor, interpolate_bilinear, 
              interpolate_quadratic, or a type with a compatible interface.
            - map_point should be a function which takes dlib::vector<T,2> objects and
              returns dlib::vector<T,2> objects.  An example is point_transform_affine.
            - set_background should be a function which can take a single argument of
              type image_type::type.  Examples are black_background, white_background,
              and no_background.
            - is_same_object(in_img, out_img) == false
        ensures
            - performs: 
              transform_image(in_img, out_img, interp, map_point, set_background, get_rect(out_img));
              (i.e. runs transform_image() on the entire out_img)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename interpolation_type,
        typename point_mapping_type
        >
    void transform_image (
        const image_type& in_img,
        image_type& out_img,
        const interpolation_type& interp,
        const point_mapping_type& map_point
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - interpolation_type == interpolate_nearest_neighbor, interpolate_bilinear, 
              interpolate_quadratic, or a type with a compatible interface.
            - map_point should be a function which takes dlib::vector<T,2> objects and
              returns dlib::vector<T,2> objects.  An example is point_transform_affine.
            - is_same_object(in_img, out_img) == false
        ensures
            - performs: 
              transform_image(in_img, out_img, interp, map_point, black_background(), get_rect(out_img));
              (i.e. runs transform_image() on the entire out_img and sets non-interpolated
              pixels to black)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename interpolation_type
        >
    void rotate_image (
        const image_type& in_img,
        image_type& out_img,
        double angle,
        const interpolation_type& interp
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - interpolation_type == interpolate_nearest_neighbor, interpolate_bilinear, 
              interpolate_quadratic, or a type with a compatible interface.
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img == a copy of in_img which has been rotated angle radians counter clockwise.
              The rotation is performed with respect to the center of the image.  
            - Parts of #out_img which have no corresponding locations in in_img are set to black.
            - uses the supplied interpolation routine interp to perform the necessary
              pixel interpolation.
    !*/

// ----------------------------------------------------------------------------------------


    template <
        typename image_type
        >
    void rotate_image (
        const image_type& in_img,
        image_type& out_img,
        double angle
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type>::has_alpha == false
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img == a copy of in_img which has been rotated angle radians counter clockwise.
              The rotation is performed with respect to the center of the image.  
            - Parts of #out_img which have no corresponding locations in in_img are set to black.
            - uses the interpolate_quadratic object to perform the necessary pixel interpolation.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename interpolation_type
        >
    void resize_image (
        const image_type& in_img,
        image_type& out_img,
        const interpolation_type& interp
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - interpolation_type == interpolate_nearest_neighbor, interpolate_bilinear, 
              interpolate_quadratic, or a type with a compatible interface.
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img == A copy of in_img which has been stretched so that it 
              fits exactly into out_img.   
            - The size of out_img is not modified.  I.e. 
                - #out_img.nr() == out_img.nr()
                - #out_img.nc() == out_img.nc()
            - uses the supplied interpolation routine interp to perform the necessary
              pixel interpolation.
    !*/

// ----------------------------------------------------------------------------------------


    template <
        typename image_type
        >
    void resize_image (
        const image_type& in_img,
        image_type& out_img
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type>::has_alpha == false
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img == A copy of in_img which has been stretched so that it 
              fits exactly into out_img.   
            - The size of out_img is not modified.  I.e. 
                - #out_img.nr() == out_img.nr()
                - #out_img.nc() == out_img.nc()
            - uses the interpolate_quadratic object to perform the necessary pixel 
              interpolation.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void flip_image_left_right (
        const image_type& in_img,
        image_type& out_img
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<image_type::type> is defined
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img.nr() == in_img.nr()
            - #out_img.nc() == in_img.nc()
            - #out_img == a copy of in_img which has been flipped from left to right.  
              (i.e. it is flipped as if viewed though a mirror)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void flip_image_up_down (
        const image_type& in_img,
        image_type& out_img
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<image_type::type> is defined
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img.nr() == in_img.nr()
            - #out_img.nc() == in_img.nc()
            - #out_img == a copy of in_img which has been flipped upside down.  
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pyramid_type,
        typename interpolation_type
        >
    void pyramid_up (
        const image_type& in_img,
        image_type& out_img,
        const pyramid_type& pyr,
        unsigned int levels,
        const interpolation_type& interp
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pyramid_type == a type compatible with the image pyramid objects defined 
              in dlib/image_transforms/image_pyramid_abstract.h
            - interpolation_type == interpolate_nearest_neighbor, interpolate_bilinear, 
              interpolate_quadratic, or a type with a compatible interface.
            - is_same_object(in_img, out_img) == false
        ensures
            - This function inverts the downsampling transformation performed by pyr().
              In particular, it attempts to make an image, out_img, which would result
              in in_img when downsampled with pyr().  
            - #out_img == An upsampled copy of in_img.  In particular, downsampling
              #out_img levels times with pyr() should result in a final image which
              looks like in_img.
            - uses the supplied interpolation routine interp to perform the necessary
              pixel interpolation.
            - Note that downsampling an image with pyr() and then upsampling it with 
              pyramid_up() will not necessarily result in a final image which is
              the same size as the original.  This is because the exact size of the
              original image cannot be determined based on the downsampled image.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pyramid_type
        >
    void pyramid_up (
        const image_type& in_img,
        image_type& out_img,
        const pyramid_type& pyr,
        unsigned int levels = 1
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pyramid_type == a type compatible with the image pyramid objects defined 
              in dlib/image_transforms/image_pyramid_abstract.h
            - is_same_object(in_img, out_img) == false
        ensures
            - performs: pyramid_up(in_img, out_img, pyr, levels, interpolate_quadratic());
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_INTERPOlATION_ABSTRACT_

