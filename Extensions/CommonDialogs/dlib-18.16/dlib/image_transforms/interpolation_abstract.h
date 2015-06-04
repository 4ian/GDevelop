// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_INTERPOlATION_ABSTRACT_
#ifdef DLIB_INTERPOlATION_ABSTRACT_ 

#include "../pixel.h"
#include "../image_processing/full_object_detection_abstract.h"
#include "../image_processing/generic_image.h"

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

        template <
            typename image_view_type, 
            typename pixel_type
            >
        bool operator() (
            const image_view_type& img,
            const dlib::point& p,
            pixel_type& result
        ) const;
        /*!
            requires
                - image_view_type == an image_view or const_image_view object. 
                - pixel_traits<typename image_view_type::pixel_type>::has_alpha == false
                - pixel_traits<pixel_type> is defined
            ensures
                - if (p is located inside img) then
                    - #result == img[p.y()][p.x()]
                      (This assignment is done using assign_pixel(#result, img[p.y()][p.x()]), 
                      therefore any necessary color space conversion will be performed)
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
            typename image_view_type,
            typename pixel_type
            >
        bool operator() (
            const image_view_type& img,
            const dlib::vector<T,2>& p,
            pixel_type& result
        ) const;
        /*!
            requires
                - image_view_type == an image_view or const_image_view object 
                - pixel_traits<typename image_view_type::pixel_type>::has_alpha == false
                - pixel_traits<pixel_type> is defined
            ensures
                - if (there is an interpolatable image location at point p in img) then
                    - #result == the interpolated pixel value from img at point p.
                    - assign_pixel() will be used to write to #result, therefore any
                      necessary color space conversion will be performed.
                    - returns true
                    - if img contains RGB pixels then the interpolation will be in color.
                      Otherwise, the interpolation will be performed in a grayscale mode.
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
            typename image_view_type,
            typename pixel_type
            >
        bool operator() (
            const image_view_type& img,
            const dlib::vector<T,2>& p,
            pixel_type& result
        ) const;
        /*!
            requires
                - image_view_type == an image_view or const_image_view object. 
                - pixel_traits<typename image_view_type::pixel_type>::has_alpha == false
                - pixel_traits<pixel_type> is defined
            ensures
                - if (there is an interpolatable image location at point p in img) then
                    - #result == the interpolated pixel value from img at point p
                    - assign_pixel() will be used to write to #result, therefore any
                      necessary color space conversion will be performed.
                    - returns true
                    - if img contains RGB pixels then the interpolation will be in color.
                      Otherwise, the interpolation will be performed in a grayscale mode.
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
        typename image_type1,
        typename image_type2,
        typename interpolation_type,
        typename point_mapping_type,
        typename background_type
        >
    void transform_image (
        const image_type1& in_img,
        image_type2& out_img,
        const interpolation_type& interp,
        const point_mapping_type& map_point,
        const background_type& set_background,
        const rectangle& area
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - interpolation_type == interpolate_nearest_neighbor, interpolate_bilinear, 
              interpolate_quadratic, or a type with a compatible interface.
            - map_point should be a function which takes dlib::vector<T,2> objects and
              returns dlib::vector<T,2> objects.  An example is point_transform_affine.
            - set_background should be a function which can take a single argument of
              type image_traits<image_type2>::pixel_type.  Examples are black_background,
              white_background, and no_background.
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
        typename image_type1,
        typename image_type2,
        typename interpolation_type,
        typename point_mapping_type,
        typename background_type
        >
    void transform_image (
        const image_type1& in_img,
        image_type2& out_img,
        const interpolation_type& interp,
        const point_mapping_type& map_point,
        const background_type& set_background
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - interpolation_type == interpolate_nearest_neighbor, interpolate_bilinear, 
              interpolate_quadratic, or a type with a compatible interface.
            - map_point should be a function which takes dlib::vector<T,2> objects and
              returns dlib::vector<T,2> objects.  An example is point_transform_affine.
            - set_background should be a function which can take a single argument of
              type image_traits<image_type2>::pixel_type.  Examples are black_background, white_background,
              and no_background.
            - is_same_object(in_img, out_img) == false
        ensures
            - performs: 
              transform_image(in_img, out_img, interp, map_point, set_background, get_rect(out_img));
              (i.e. runs transform_image() on the entire out_img)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1,
        typename image_type2,
        typename interpolation_type,
        typename point_mapping_type
        >
    void transform_image (
        const image_type1& in_img,
        image_type2& out_img,
        const interpolation_type& interp,
        const point_mapping_type& map_point
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
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
        typename image_type1,
        typename image_type2,
        typename interpolation_type
        >
    point_transform_affine rotate_image (
        const image_type1& in_img,
        image_type2& out_img,
        double angle,
        const interpolation_type& interp
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - interpolation_type == interpolate_nearest_neighbor, interpolate_bilinear, 
              interpolate_quadratic, or a type with a compatible interface.
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img == a copy of in_img which has been rotated angle radians counter clockwise.
              The rotation is performed with respect to the center of the image.  
            - Parts of #out_img which have no corresponding locations in in_img are set to black.
            - uses the supplied interpolation routine interp to perform the necessary
              pixel interpolation.
            - returns a transformation object that maps points in in_img into their corresponding 
              location in #out_img.
    !*/

// ----------------------------------------------------------------------------------------


    template <
        typename image_type1,
        typename image_type2
        >
    point_transform_affine rotate_image (
        const image_type1& in_img,
        image_type2& out_img,
        double angle
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - pixel_traits<typename image_traits<image_type1>::pixel_type>::has_alpha == false
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img == a copy of in_img which has been rotated angle radians counter clockwise.
              The rotation is performed with respect to the center of the image.  
            - Parts of #out_img which have no corresponding locations in in_img are set to black.
            - uses the interpolate_quadratic object to perform the necessary pixel interpolation.
            - returns a transformation object that maps points in in_img into their corresponding 
              location in #out_img.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1,
        typename image_type2,
        typename interpolation_type
        >
    void resize_image (
        const image_type1& in_img,
        image_type2& out_img,
        const interpolation_type& interp
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
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
        typename image_type1,
        typename image_type2
        >
    void resize_image (
        const image_type1& in_img,
        image_type2& out_img
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - pixel_traits<typename image_traits<image_type1>::pixel_type>::has_alpha == false
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img == A copy of in_img which has been stretched so that it 
              fits exactly into out_img.   
            - The size of out_img is not modified.  I.e. 
                - #out_img.nr() == out_img.nr()
                - #out_img.nc() == out_img.nc()
            - Uses the bilinear interpolation to perform the necessary pixel interpolation.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1,
        typename image_type2
        >
    point_transform_affine flip_image_left_right (
        const image_type1& in_img,
        image_type2& out_img
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img.nr() == in_img.nr()
            - #out_img.nc() == in_img.nc()
            - #out_img == a copy of in_img which has been flipped from left to right.  
              (i.e. it is flipped as if viewed though a mirror)
            - returns a transformation object that maps points in in_img into their
              corresponding location in #out_img.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type,
        typename T
        >
    void add_image_left_right_flips (
        image_array_type& images,
        std::vector<std::vector<T> >& objects
    );
    /*!
        requires
            - image_array_type == a dlib::array or std::vector of image objects that each
              implement the interface defined in dlib/image_processing/generic_image.h
            - T == rectangle or full_object_detection
            - images.size() == objects.size()
        ensures
            - This function computes all the left/right flips of the contents of images and
              then appends them onto the end of the images array.  It also finds the
              left/right flips of the rectangles in objects and similarly appends them into
              objects.  That is, we assume objects[i] is the set of bounding boxes in
              images[i] and we flip the bounding boxes so that they still bound the same
              objects in the new flipped images.
            - #images.size() == images.size()*2
            - #objects.size() == objects.size()*2
            - All the original elements of images and objects are left unmodified.  That
              is, this function only appends new elements to each of these containers.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type,
        typename T,
        typename U
        >
    void add_image_left_right_flips (
        image_array_type& images,
        std::vector<std::vector<T> >& objects,
        std::vector<std::vector<U> >& objects2
    );
    /*!
        requires
            - image_array_type == a dlib::array or std::vector of image objects that each
              implement the interface defined in dlib/image_processing/generic_image.h
            - images.size() == objects.size()
            - images.size() == objects2.size()
            - T == rectangle or full_object_detection
            - U == rectangle or full_object_detection
        ensures
            - This function computes all the left/right flips of the contents of images and
              then appends them onto the end of the images array.  It also finds the
              left/right flips of the rectangles in objects and objects2 and similarly
              appends them into objects and objects2 respectively.  That is, we assume
              objects[i] is the set of bounding boxes in images[i] and we flip the bounding
              boxes so that they still bound the same objects in the new flipped images.
              We similarly flip the boxes in objects2.
            - #images.size()   == images.size()*2
            - #objects.size()  == objects.size()*2
            - #objects2.size() == objects2.size()*2
            - All the original elements of images, objects, and objects2 are left unmodified.
              That is, this function only appends new elements to each of these containers.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type,
        typename EXP, 
        typename T, 
        typename U
        >
    void add_image_rotations (
        const matrix_exp<EXP>& angles,
        image_array_type& images,
        std::vector<std::vector<T> >& objects,
        std::vector<std::vector<U> >& objects2
    );
    /*!
        requires
            - image_array_type == a dlib::array or std::vector of image objects that each
              implement the interface defined in dlib/image_processing/generic_image.h
            - is_vector(angles) == true
            - angles.size() > 0
            - images.size() == objects.size()
            - images.size() == objects2.size()
            - T == rectangle or full_object_detection
            - U == rectangle or full_object_detection
        ensures
            - This function computes angles.size() different rotations of all the given
              images and then replaces the contents of images with those rotations of the
              input dataset.  We will also adjust the rectangles inside objects and
              objects2 so that they still bound the same objects in the new rotated images.
              That is, we assume objects[i] and objects2[i] are bounding boxes for things
              in images[i].  So we will adjust the positions of the boxes in objects and
              objects2 accordingly.
            - The elements of angles are interpreted as angles in radians and we will
              rotate the images around their center using the values in angles.  Moreover,
              the rotation is done counter clockwise.
            - #images.size()   == images.size()*angles.size()
            - #objects.size()  == objects.size()*angles.size()
            - #objects2.size() == objects2.size()*angles.size()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type,
        typename EXP,
        typename T
        >
    void add_image_rotations (
        const matrix_exp<EXP>& angles,
        image_array_type& images,
        std::vector<std::vector<T> >& objects
    );
    /*!
        requires
            - image_array_type == a dlib::array or std::vector of image objects that each
              implement the interface defined in dlib/image_processing/generic_image.h
            - is_vector(angles) == true
            - angles.size() > 0
            - images.size() == objects.size()
            - T == rectangle or full_object_detection
        ensures
            - This function is identical to the add_image_rotations() define above except
              that it doesn't have objects2 as an argument.  
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    void flip_image_dataset_left_right (
        image_array_type& images,
        std::vector<std::vector<rectangle> >& objects
    );
    /*!
        requires
            - image_array_type == a dlib::array or std::vector of image objects that each
              implement the interface defined in dlib/image_processing/generic_image.h
            - images.size() == objects.size()
        ensures
            - This function replaces each image in images with the left/right flipped
              version of the image.  Therefore, #images[i] will contain the left/right
              flipped version of images[i].  It also flips all the rectangles in objects so
              that they still bound the same visual objects in each image.
            - #images.size() == image.size()
            - #objects.size() == objects.size()
            - for all valid i:
                #objects[i].size() == objects[i].size()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    void flip_image_dataset_left_right (
        image_array_type& images,
        std::vector<std::vector<rectangle> >& objects,
        std::vector<std::vector<rectangle> >& objects2
    );
    /*!
        requires
            - image_array_type == a dlib::array or std::vector of image objects that each
              implement the interface defined in dlib/image_processing/generic_image.h
            - images.size() == objects.size()
            - images.size() == objects2.size()
        ensures
            - This function replaces each image in images with the left/right flipped
              version of the image.  Therefore, #images[i] will contain the left/right
              flipped version of images[i].  It also flips all the rectangles in objects
              and objects2 so that they still bound the same visual objects in each image.
            - #images.size() == image.size()
            - #objects.size() == objects.size()
            - #objects2.size() == objects2.size()
            - for all valid i:
                #objects[i].size() == objects[i].size()
            - for all valid i:
                #objects2[i].size() == objects2[i].size()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pyramid_type,
        typename image_array_type
        >
    void upsample_image_dataset (
        image_array_type& images,
        std::vector<std::vector<rectangle> >& objects
    );
    /*!
        requires
            - image_array_type == a dlib::array or std::vector of image objects that each
              implement the interface defined in dlib/image_processing/generic_image.h 
            - images.size() == objects.size()
        ensures
            - This function replaces each image in images with an upsampled version of that
              image.  Each image is upsampled using pyramid_up() and the given
              pyramid_type.  Therefore, #images[i] will contain the larger upsampled
              version of images[i].  It also adjusts all the rectangles in objects so that
              they still bound the same visual objects in each image.
            - #images.size() == image.size()
            - #objects.size() == objects.size()
            - for all valid i:
                #objects[i].size() == objects[i].size()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pyramid_type,
        typename image_array_type,
        >
    void upsample_image_dataset (
        image_array_type& images,
        std::vector<std::vector<rectangle> >& objects,
        std::vector<std::vector<rectangle> >& objects2 
    );
    /*!
        requires
            - image_array_type == a dlib::array or std::vector of image objects that each
              implement the interface defined in dlib/image_processing/generic_image.h
            - images.size() == objects.size()
            - images.size() == objects2.size()
        ensures
            - This function replaces each image in images with an upsampled version of that
              image.  Each image is upsampled using pyramid_up() and the given
              pyramid_type.  Therefore, #images[i] will contain the larger upsampled
              version of images[i].  It also adjusts all the rectangles in objects and
              objects2 so that they still bound the same visual objects in each image.
            - #images.size() == image.size()
            - #objects.size() == objects.size()
            - #objects2.size() == objects2.size()
            - for all valid i:
                #objects[i].size() == objects[i].size()
            - for all valid i:
                #objects2[i].size() == objects2[i].size()
    !*/

// ----------------------------------------------------------------------------------------

    template <typename image_array_type>
    void rotate_image_dataset (
        double angle,
        image_array_type& images,
        std::vector<std::vector<rectangle> >& objects
    );
    /*!
        requires
            - image_array_type == a dlib::array or std::vector of image objects that each
              implement the interface defined in dlib/image_processing/generic_image.h
            - images.size() == objects.size()
        ensures
            - This function replaces each image in images with a rotated version of that
              image.  In particular, each image is rotated using
              rotate_image(original,rotated,angle).  Therefore, the images are rotated
              angle radians counter clockwise around their centers. That is, #images[i]
              will contain the rotated version of images[i].  It also adjusts all
              the rectangles in objects so that they still bound the same visual objects in
              each image.
            - All the rectangles will still have the same sizes and aspect ratios after
              rotation.  They will simply have had their positions adjusted so they still
              fall on the same objects.
            - #images.size() == image.size()
            - #objects.size() == objects.size()
            - for all valid i:
                #objects[i].size() == objects[i].size()
    !*/

// ----------------------------------------------------------------------------------------

    template <typename image_array_type>
    void rotate_image_dataset (
        double angle,
        image_array_type& images,
        std::vector<std::vector<rectangle> >& objects,
        std::vector<std::vector<rectangle> >& objects2
    );
    /*!
        requires
            - image_array_type == a dlib::array or std::vector of image objects that each
              implement the interface defined in dlib/image_processing/generic_image.h
            - images.size() == objects.size()
            - images.size() == objects2.size()
        ensures
            - This function replaces each image in images with a rotated version of that
              image.  In particular, each image is rotated using
              rotate_image(original,rotated,angle).  Therefore, the images are rotated
              angle radians counter clockwise around their centers. That is, #images[i]
              will contain the rotated version of images[i].  It also adjusts all
              the rectangles in objects and objects2 so that they still bound the same
              visual objects in each image.
            - All the rectangles will still have the same sizes and aspect ratios after
              rotation.  They will simply have had their positions adjusted so they still
              fall on the same objects.
            - #images.size() == image.size()
            - #objects.size() == objects.size()
            - #objects2.size() == objects2.size()
            - for all valid i:
                #objects[i].size() == objects[i].size()
            - for all valid i:
                #objects2[i].size() == objects2[i].size()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1,
        typename image_type2
        >
    void flip_image_up_down (
        const image_type1& in_img,
        image_type2& out_img
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - is_same_object(in_img, out_img) == false
        ensures
            - #out_img.nr() == in_img.nr()
            - #out_img.nc() == in_img.nc()
            - #out_img == a copy of in_img which has been flipped upside down.  
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1,
        typename image_type2,
        typename pyramid_type,
        typename interpolation_type
        >
    void pyramid_up (
        const image_type1& in_img,
        image_type2& out_img,
        const pyramid_type& pyr,
        const interpolation_type& interp
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
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
              #out_img 1 time with pyr() should result in a final image which looks like
              in_img.
            - Uses the supplied interpolation routine interp to perform the necessary
              pixel interpolation.
            - Note that downsampling an image with pyr() and then upsampling it with 
              pyramid_up() will not necessarily result in a final image which is
              the same size as the original.  This is because the exact size of the
              original image cannot be determined based on the downsampled image.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1,
        typename image_type2,
        typename pyramid_type
        >
    void pyramid_up (
        const image_type1& in_img,
        image_type2& out_img,
        const pyramid_type& pyr
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - pyramid_type == a type compatible with the image pyramid objects defined 
              in dlib/image_transforms/image_pyramid_abstract.h
            - is_same_object(in_img, out_img) == false
        ensures
            - performs: pyramid_up(in_img, out_img, pyr, interpolate_bilinear());
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pyramid_type
        >
    void pyramid_up (
        image_type& img,
        const pyramid_type& pyr
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - pyramid_type == a type compatible with the image pyramid objects defined 
              in dlib/image_transforms/image_pyramid_abstract.h
        ensures
            - Performs an in-place version of pyramid_up() on the given image.  In
              particular, this function is equivalent to:
                pyramid_up(img, temp, pyr); 
                temp.swap(img);
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void pyramid_up (
        image_type& img
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
        ensures
            - performs: pyramid_up(img, pyramid_down<2>());
              (i.e. it upsamples the given image and doubles it in size.)
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    struct chip_dims
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple tool for passing in a pair of row and column values to the
                chip_details constructor.
        !*/

        chip_dims (
            unsigned long rows_,
            unsigned long cols_
        ) : rows(rows_), cols(cols_) { }

        unsigned long rows;
        unsigned long cols;
    };

// ----------------------------------------------------------------------------------------

    struct chip_details
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object describes where an image chip is to be extracted from within
                another image.  In particular, it specifies that the image chip is
                contained within the rectangle this->rect and that prior to extraction the
                image should be rotated counter-clockwise by this->angle radians.  Finally,
                the extracted chip should have this->rows rows and this->cols columns in it
                regardless of the shape of this->rect.  This means that the extracted chip
                will be stretched to fit via bilinear interpolation when necessary.
        !*/

        chip_details(
        ); 
        /*!
            ensures
                - #rect.is_empty() == true
                - #size() == 0
                - #angle == 0
                - #rows == 0
                - #cols == 0
        !*/

        chip_details(
            const drectangle& rect_
        );
        /*!
            ensures
                - #rect == rect_
                - #size() == rect_.area()
                - #angle == 0
                - #rows == rect_.height()
                - #cols == rect_.width()
        !*/

        chip_details(
            const rectangle& rect_
        );
        /*!
            ensures
                - #rect == rect_
                - #size() == rect_.area()
                - #angle == 0
                - #rows == rect_.height()
                - #cols == rect_.width()
        !*/

        chip_details(
            const drectangle& rect_, 
            unsigned long size_
        );
        /*!
            ensures
                - #rect == rect_
                - #size() == size_
                - #angle == 0
                - #rows and #cols is set such that the total size of the chip is as close
                  to size_ as possible but still matches the aspect ratio of rect_.
                - As long as size_ and the aspect ratio of of rect_ stays constant then
                  #rows and #cols will always have the same values.  This means that, for
                  example, if you want all your chips to have the same dimensions then
                  ensure that size_ is always the same and also that rect_ always has the
                  same aspect ratio.  Otherwise the calculated values of #rows and #cols
                  may be different for different chips.  Alternatively, you can use the
                  chip_details constructor below that lets you specify the exact values for
                  rows and cols.
        !*/

        chip_details(
            const drectangle& rect_, 
            unsigned long size_,
            double angle_
        );
        /*!
            ensures
                - #rect == rect_
                - #size() == size_
                - #angle == angle_
                - #rows and #cols is set such that the total size of the chip is as close
                  to size_ as possible but still matches the aspect ratio of rect_.
                - As long as size_ and the aspect ratio of of rect_ stays constant then
                  #rows and #cols will always have the same values.  This means that, for
                  example, if you want all your chips to have the same dimensions then
                  ensure that size_ is always the same and also that rect_ always has the
                  same aspect ratio.  Otherwise the calculated values of #rows and #cols
                  may be different for different chips.  Alternatively, you can use the
                  chip_details constructor below that lets you specify the exact values for
                  rows and cols.
        !*/

        chip_details(
            const drectangle& rect_, 
            const chip_dims& dims
        ); 
        /*!
            ensures
                - #rect == rect_
                - #size() == dims.rows*dims.cols 
                - #angle == 0
                - #rows == dims.rows
                - #cols == dims.cols
        !*/

        chip_details(
            const drectangle& rect_, 
            const chip_dims& dims,
            double angle_
        ); 
        /*!
            ensures
                - #rect == rect_
                - #size() == dims.rows*dims.cols 
                - #angle == angle_
                - #rows == dims.rows
                - #cols == dims.cols
        !*/

        template <typename T>
        chip_details(
            const std::vector<dlib::vector<T,2> >& chip_points,
            const std::vector<dlib::vector<T,2> >& img_points,
            const chip_dims& dims
        );
        /*!
            requires
                - chip_points.size() == img_points.size()
                - chip_points.size() >= 2 
            ensures
                - The chip will be extracted such that the pixel locations chip_points[i]
                  in the chip are mapped to img_points[i] in the original image by a
                  similarity transform.  That is, if you know the pixelwize mapping you
                  want between the chip and the original image then you use this function
                  of chip_details constructor to define the mapping.
                - #rows == dims.rows
                - #cols == dims.cols
                - #size() == dims.rows*dims.cols 
                - #rect and #angle are computed based on the given size of the output chip
                  (specified by dims) and the similarity transform between the chip and
                  image (specified by chip_points and img_points).
        !*/

        inline unsigned long size() const { return rows*cols; }
        /*!
            ensures
                - returns the number of pixels in this chip.  This is just rows*cols.
        !*/

        drectangle rect;
        double angle;
        unsigned long rows; 
        unsigned long cols;
    };

// ----------------------------------------------------------------------------------------

    point_transform_affine get_mapping_to_chip (
        const chip_details& details
    );
    /*!
        ensures
            - returns a transformation that maps from the pixels in the original image
              to the pixels in the cropped image defined by the given details object.
    !*/

// ----------------------------------------------------------------------------------------

    full_object_detection map_det_to_chip (
        const full_object_detection& det,
        const chip_details& details
    );
    /*!
        ensures
            - Maps the given detection into the pixel space of the image chip defined by
              the given details object.  That is, this function returns an object D such
              that:
                - D.get_rect() == a box that bounds the same thing in the image chip as
                  det.get_rect() bounds in the original image the chip is extracted from.
                - for all valid i:
                    - D.part(i) == the location in the image chip corresponding to
                      det.part(i) in the original image.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1,
        typename image_type2
        >
    void extract_image_chips (
        const image_type1& img,
        const std::vector<chip_details>& chip_locations,
        dlib::array<image_type2>& chips
    );
    /*!
        requires
            - image_type1 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - pixel_traits<typename image_traits<image_type1>::pixel_type>::has_alpha == false
            - for all valid i: 
                - chip_locations[i].rect.is_empty() == false
                - chip_locations[i].size() != 0
        ensures
            - This function extracts "chips" from an image.  That is, it takes a list of
              rectangular sub-windows (i.e. chips) within an image and extracts those
              sub-windows, storing each into its own image.  It also scales and rotates the
              image chips according to the instructions inside each chip_details object.
            - #chips == the extracted image chips
            - #chips.size() == chip_locations.size()
            - for all valid i:
                - #chips[i] == The image chip extracted from the position
                  chip_locations[i].rect in img.
                - #chips[i].nr() == chip_locations[i].rows
                - #chips[i].nc() == chip_locations[i].cols
                - The image will have been rotated counter-clockwise by
                  chip_locations[i].angle radians, around the center of
                  chip_locations[i].rect, before the chip was extracted. 
            - Any pixels in an image chip that go outside img are set to 0 (i.e. black).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1,
        typename image_type2
        >
    void extract_image_chip (
        const image_type1& img,
        const chip_details& chip_location,
        image_type2& chip
    );
    /*!
        ensures
            - This function simply calls extract_image_chips() with a single chip location
              and stores the single output chip into #chip.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    struct sub_image_proxy
    {
        /*!
            REQUIREMENTS ON image_type
                - image_type == an image object that implements the interface defined in
                  dlib/image_processing/generic_image.h 

            WHAT THIS OBJECT REPRESENTS
                This is a lightweight image object for referencing a subwindow of an image.
                It implements the generic image interface and can therefore be used with
                any function that expects a generic image, excepting that you cannot change
                the size of a sub_image_proxy.  
                
                Note that it only stores a pointer to the image data given to its
                constructor and therefore does not perform a copy.  Moreover, this means
                that an instance of this object becomes invalid after the underlying image
                data it references is destroyed.
        !*/
        sub_image_proxy (
            T& img,
            const rectangle& rect
        );
        /*!
            ensures
                - This object is an image that represents the part of img contained within
                  rect.  If rect is larger than img then rect is cropped so that it does
                  not go outside img.
        !*/
    };

    template <
        typename image_type
        >
    sub_image_proxy<image_type> sub_image (
        image_type& img,
        const rectangle& rect
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
        ensures
            - returns sub_image_proxy<image_type>(img,rect)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    struct const_sub_image_proxy
    {
        /*!
            REQUIREMENTS ON image_type
                - image_type == an image object that implements the interface defined in
                  dlib/image_processing/generic_image.h 

            WHAT THIS OBJECT REPRESENTS
                This object is just like sub_image_proxy except that it does not allow the
                pixel data to be modified.
        !*/
        const_sub_image_proxy (
            const T& img,
            const rectangle& rect
        );
        /*!
            ensures
                - This object is an image that represents the part of img contained within
                  rect.  If rect is larger than img then rect is cropped so that it does
                  not go outside img.
        !*/
    };

    template <
        typename image_type
        >
    const const_sub_image_proxy<image_type> sub_image (
        const image_type& img,
        const rectangle& rect
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
        ensures
            - returns const_sub_image_proxy<image_type>(img,rect)
    !*/

// ----------------------------------------------------------------------------------------

    chip_details get_face_chip_details (
        const full_object_detection& det,
        const unsigned long size = 200,
        const double padding = 0.2
    );
    /*!
        requires
            - det.num_parts() == 68
            - size > 0
            - padding >= 0
        ensures
            - This function assumes det contains a human face detection with face parts
              annotated using the annotation scheme from the iBUG 300-W face landmark
              dataset.  Given these assumptions, it creates a chip_details object that will
              extract a copy of the face that has been rotated upright, centered, and
              scaled to a standard size when given to extract_image_chip(). 
            - The extracted chips will have size rows and columns in them.
            - if padding == 0 then the chip will be closely cropped around the face.
              Setting larger padding values will result a looser cropping.  In particular,
              a padding of 0.5 would double the width of the cropped area, a value of 1
              would triple it, and so forth.
    !*/

// ----------------------------------------------------------------------------------------

    std::vector<chip_details> get_face_chip_details (
        const std::vector<full_object_detection>& dets,
        const unsigned long size = 200,
        const double padding = 0.2
    );
    /*!
        requires
            - for all valid i:
                - det[i].num_parts() == 68
            - size > 0
            - padding >= 0
        ensures
            - This function is identical to the version of get_face_chip_details() defined
              above except that it creates and returns an array of chip_details objects,
              one for each input full_object_detection.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_INTERPOlATION_ABSTRACT_

