// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_POLY_ImAGE_ABSTRACT_H__
#ifdef DLIB_POLY_ImAGE_ABSTRACT_H__

#include "../algs.h"
#include "../matrix.h"
#include "../geometry/rectangle_abstract.h"
#include <cmath>

namespace dlib
{
    template <
        long Downsample
        >
    class poly_image : noncopyable
    {
        /*!
            REQUIREMENTS ON TEMPLATE PARAMETERS 
                - Downsample >= 1

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for extracting local feature descriptors from an image.
                In particular, it fits polynomials to local pixel patches and allows you to 
                query the coefficients of these polynomials.  Additionally, the coefficients 
                may be intensity normalized by dividing them by the constant term of the fitted 
                polynomial and then the constant term is discarded. 

                Finally, the user can specify a downsampling rate.  If the template argument
                Downsample is set to 1 then feature extraction is performed at every pixel of
                an input image (except for a small area around the image border).  However,
                if Downsample is set to 2 then feature extraction is only performed at every
                other pixel location.  More generally, if Downsample is set to N then feature
                extraction is performed only every N pixels.  
                
            THREAD SAFETY
                Concurrent access to an instance of this object is not safe and should be protected
                by a mutex lock except for the case where you are copying the configuration 
                (via copy_configuration()) of a poly_image object to many other threads.  
                In this case, it is safe to copy the configuration of a shared object so long
                as no other operations are performed on it.
        !*/

    public:

        typedef matrix<double, 0, 1> descriptor_type;
        const static long downsample = Downsample;

        poly_image (
        ); 
        /*!
            ensures
                - #get_order() == 3
                - #get_window_size() == 13
                - #size() == 0
                - #uses_normalization() == true
                - #is_rotationally_invariant() == false 
        !*/

        poly_image(
            long order,
            long window_size,
            bool normalization = true,
            bool rotation_invariance = false
        );
        /*!
            requires
                - 1 <= order <= 6
                - window_size >= 3 && window_size is odd
            ensures
                - #get_order() == order
                - #get_window_size() == window_size
                - #size() == 0
                - #uses_normalization() == normalization
                - #is_rotationally_invariant() == rotation_invariance
        !*/

        void clear (
        );
        /*!
            ensures
                - this object will have its initial value
        !*/

        void setup (
            long order,
            long window_size
        );
        /*!
            requires
                - 1 <= order <= 6
                - window_size >= 3 && window_size is odd
            ensures
                - #get_order() == order
                - #get_window_size() == window_size
        !*/

        long get_order (
        ) const;
        /*!
            ensures
                - returns the order of the polynomial that will be fitted to 
                  each local pixel patch during feature extraction.
        !*/

        long get_window_size (
        ) const;
        /*!
            ensures
                - returns the size of the window used for local feature extraction.
                  This is the width and height of the window in pixels.
        !*/

        bool uses_normalization (
        ) const; 
        /*!
            ensures
                - returns true if the polynomial coefficients are intensity normalized
                  and false otherwise. 
        !*/

        void set_uses_normalization (
            bool normalization
        );
        /*!
            ensures
                - #uses_normalization() == normalization
        !*/

        bool is_rotationally_invariant (
        );
        /*!
            ensures
                - returns true if the feature extractor will adjust the output so that it
                  is rotationally invariant.  This is done by rotating each patch such that
                  the gradient vector always points in the same direction.
        !*/

        void set_is_rotationally_invariant (
            bool rotation_invariance
        );
        /*!
            ensures
                - #is_rotationally_invariant() == rotation_invariance
        !*/

        void copy_configuration (
            const poly_image& item
        );
        /*!
            ensures
                - copies all the state information of item into *this, except for state 
                  information populated by load().  More precisely, given two poly_image 
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
                - image_type == is an implementation of array2d/array2d_kernel_abstract.h
                - pixel_traits<typename image_type::type>::has_alpha == false
            ensures
                - Performs the feature extraction described in the WHAT THIS OBJECT REPRESENTS
                  section above.  This means after load() finishes you can call (*this)(row,col) 
                  to obtain the polynomial coefficients for an order get_order() polynomial which 
                  was fitted to the image patch get_block_rect(row,col).
                - #size() > 0
        !*/

        void unload(
        );
        /*!
            ensures
                - #nr() == 0
                - #nc() == 0
                - clears only the state information which is populated by load().  For 
                  example, let H be a poly_image object.  Then consider the two sequences 
                  of instructions:
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
                - returns the number of rows in this polynomial feature image
        !*/

        inline long nc (
        ) const;
        /*!
            ensures
                - returns the number of columns in this polynomial feature image
        !*/

        long get_num_dimensions (
        ) const;
        /*!
            ensures
                - returns the number of dimensions in the feature vectors generated by
                  this object.  
                - In this case, this will be the number of coefficients in an order 
                  get_order() polynomial, except for the constant term of the polynomial
                  if uses_normalization() == true.
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
                - returns the descriptor for the polynomial filtering block at the given row and column.  
                  This vector will contain the polynomial coefficients for a polynomial fitted to the
                  image patch located at get_block_rect(row,col) in the original image given to load().
                - The returned descriptor vector will have get_num_dimensions() elements.
        !*/

        const rectangle get_block_rect (
            long row,
            long col
        ) const;
        /*!
            ensures
                - returns a rectangle that tells you what part of the original image is associated
                  with a particular polynomial filter block.  That is, what part of the input image 
                  is associated with (*this)(row,col).
                - The returned rectangle will be get_window_size() pixels wide and tall.
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
        long downsample
        >
    void serialize (
        const poly_image<downsample>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    template <
        long downsample
        >
    void deserialize (
        poly_image<downsample>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_POLY_ImAGE_ABSTRACT_H__


