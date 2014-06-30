// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_FINE_HOG_IMaGE_ABSTRACT_H__
#ifdef DLIB_FINE_HOG_IMaGE_ABSTRACT_H__

#include "../array2d.h"
#include "../matrix.h"
#include "hog_abstract.h"


namespace dlib
{
    template <
        unsigned long cell_size_,
        unsigned long block_size_,
        unsigned long pixel_stride_,
        unsigned char num_orientation_bins_,
        int           gradient_type_
        >
    class fine_hog_image : noncopyable
    {
        /*!
            REQUIREMENTS ON TEMPLATE PARAMETERS 
                - cell_size_ > 1
                - block_size_ > 0
                - pixel_stride_ > 0
                - num_orientation_bins_ > 0
                - gradient_type_ == hog_signed_gradient or hog_unsigned_gradient

            INITIAL VALUE
                 - size() == 0

            WHAT THIS OBJECT REPRESENTS
                This object is a version of the hog_image that allows you to extract HOG
                features at a finer resolution.  The hog_image can only extract HOG features
                cell_size_ pixels apart.  However, this object, the fine_hog_image can 
                extract HOG features from every pixel location.

                The template arguments to this class have the same meaning as they do for
                the hog_image, except for pixel_stride_.  This controls the stepping between
                HOG extraction locations.  A value of 1 indicates HOG features should be
                extracted from every pixel location.  A value of 2 indicates every other pixel
                location, etc.

                Finally, note that the interpolation used by this object is equivalent
                to using hog_angle_interpolation with hog_image.  

            THREAD SAFETY
                Concurrent access to an instance of this object is not safe and should be protected
                by a mutex lock except for the case where you are copying the configuration 
                (via copy_configuration()) of a fine_hog_image object to many other threads.  
                In this case, it is safe to copy the configuration of a shared object so long
                as no other operations are performed on it.
        !*/

    public:

        const static unsigned long cell_size = cell_size_;
        const static unsigned long block_size = block_size_;
        const static unsigned long pixel_stride = pixel_stride_;
        const static unsigned long num_orientation_bins = num_orientation_bins_;
        const static int           gradient_type = gradient_type_;

        const static long min_size = cell_size*block_size+2;

        typedef matrix<double, block_size*block_size*num_orientation_bins, 1> descriptor_type;

        fine_hog_image (
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        void clear (
        );
        /*!
            ensures
                - this object will have its initial value
        !*/

        void copy_configuration (
            const fine_hog_image&
        );
        /*!
            ensures
                - copies all the state information of item into *this, except for state 
                  information populated by load().  More precisely, given two fine_hog_image 
                  objects H1 and H2, the following sequence of instructions should always 
                  result in both of them having the exact same state.
                    H2.copy_configuration(H1);
                    H1.load(img);
                    H2.load(img);
        !*/

        template <
            typename image_type
            >
        inline void load (
            const image_type& img
        );
        /*!
            requires
                - image_type is a dlib::matrix or something convertible to a matrix
                  via array_to_matrix()
                - pixel_traits<typename image_type::type>::has_alpha == false
            ensures
                - if (img.nr() < min_size || img.nc() < min_size) then
                    - the image is too small so we don't compute anything on it
                    - #size() == 0
                - else
                    - generates a HOG image from the given image.   
                    - #size() > 0
        !*/

        inline void unload(
        );
        /*!
            ensures
                - #nr() == 0
                - #nc() == 0
                - clears only the state information which is populated by load().  For 
                  example, let H be a fine_hog_image object.  Then consider the two 
                  sequences of instructions:
                    Sequence 1:
                        H.load(img);      
                        H.unload();
                        H.load(img);

                    Sequence 2:
                        H.load(img);
                  Both sequence 1 and sequence 2 should have the same effect on H.  
        !*/

        inline unsigned long size (
        ) const;
        /*!
            ensures
                - returns nr()*nc()
        !*/

        inline long nr (
        ) const;
        /*!
            ensures
                - returns the number of rows in this HOG image
        !*/

        inline long nc (
        ) const;
        /*!
            ensures
                - returns the number of columns in this HOG image
        !*/

        long get_num_dimensions (
        ) const;
        /*!
            ensures
                - returns the number of dimensions in the feature vectors generated by
                  this object.  
                - In particular, returns the value block_size*block_size*num_orientation_bins
        !*/

        inline const descriptor_type& operator() (
            long row,
            long col
        ) const;
        /*!
            requires
                - 0 <= row < nr()
                - 0 <= col < nc()
            ensures
                - returns the descriptor for the HOG block at the given row and column.  This descriptor 
                  will include information from a window that is located at get_block_rect(row,col) in
                  the original image given to load().
                - The returned descriptor vector will have get_num_dimensions() elements.
        !*/

        const rectangle get_block_rect (
            long row,
            long col
        ) const;
        /*!
            ensures
                - returns a rectangle that tells you what part of the original image is associated
                  with a particular HOG block.  That is, what part of the input image is associated
                  with (*this)(row,col).
                - The returned rectangle will be cell_size*block_size pixels wide and tall.
        !*/

        const point image_to_feat_space (
            const point& p
        ) const;
        /*!
            ensures
                - Each local feature is extracted from a certain point in the input image.
                  This function returns the identity of the local feature corresponding
                  to the image location p.  Or in other words, let P == image_to_feat_space(p), 
                  then (*this)(P.y(),P.x()) == the local feature closest to, or centered at, 
                  the point p in the input image.  Note that some image points might not have 
                  corresponding feature locations.  E.g. border points or points outside the 
                  image.  In these cases the returned point will be outside get_rect(*this).
        !*/

        const rectangle image_to_feat_space (
            const rectangle& rect
        ) const;
        /*!
            ensures
                - returns rectangle(image_to_feat_space(rect.tl_corner()), image_to_feat_space(rect.br_corner()));
                  (i.e. maps a rectangle from image space to feature space)
        !*/

        const point feat_to_image_space (
            const point& p
        ) const;
        /*!
            ensures
                - returns the location in the input image space corresponding to the center
                  of the local feature at point p.  In other words, this function computes
                  the inverse of image_to_feat_space().  Note that it may only do so approximately, 
                  since more than one image location might correspond to the same local feature.  
                  That is, image_to_feat_space() might not be invertible so this function gives 
                  the closest possible result.
        !*/

        const rectangle feat_to_image_space (
            const rectangle& rect
        ) const;
        /*!
            ensures
                - return rectangle(feat_to_image_space(rect.tl_corner()), feat_to_image_space(rect.br_corner()));
                  (i.e. maps a rectangle from feature space to image space)
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        unsigned long T1,
        unsigned long T2,
        unsigned long T3,
        unsigned char T4,
        int           T5
        >
    void serialize (
        const fine_hog_image<T1,T2,T3,T4,T5>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    template <
        unsigned long T1,
        unsigned long T2,
        unsigned long T3,
        unsigned char T4,
        int           T5
        >
    void deserialize (
        fine_hog_image<T1,T2,T3,T4,T5>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FINE_HOG_IMaGE_ABSTRACT_H__

