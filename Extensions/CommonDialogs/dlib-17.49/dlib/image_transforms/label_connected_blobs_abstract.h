// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LABEL_CONNeCTED_BLOBS_ABSTRACT_H_
#ifdef DLIB_LABEL_CONNeCTED_BLOBS_ABSTRACT_H_

#include "../geometry.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct neighbors_8 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a pixel neighborhood generating functor for 
                use with the label_connected_blobs() routine defined below.
        !*/

        void operator() (
            const point& p,
            std::vector<point>& neighbors
        ) const;
        /*!
            ensures
                - adds the 8 neighboring pixels surrounding p into neighbors
        !*/
    };

    struct neighbors_4 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a pixel neighborhood generating functor for 
                use with the label_connected_blobs() routine defined below.
        !*/

        void operator() (
            const point& p,
            std::vector<point>& neighbors
        ) const;
        /*!
            ensures
                - adds the 4 neighboring pixels of p into neighbors.  These
                  are the ones immediately to the left, top, right, and bottom.
        !*/
    };

// ----------------------------------------------------------------------------------------

    struct connected_if_both_not_zero
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a pixel connection testing functor for use
                with the label_connected_blobs() routine defined below.
        !*/

        template <typename image_type>
        bool operator() (
            const image_type& img,
            const point& a,
            const point& b
        ) const
        {
            return (img[a.y()][a.x()] != 0 && img[b.y()][b.x()] != 0);
        }
    };

    struct connected_if_equal
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a pixel connection testing functor for use
                with the label_connected_blobs() routine defined below.
        !*/

        template <typename image_type>
        bool operator() (
            const image_type& img,
            const point& a,
            const point& b
        ) const
        {
            return (img[a.y()][a.x()] == img[b.y()][b.x()]);
        }
    };

// ----------------------------------------------------------------------------------------

    struct zero_pixels_are_background
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a background testing functor for use
                with the label_connected_blobs() routine defined below.
        !*/

        template <typename image_type>
        bool operator() (
            const image_type& img,
            const point& p
        ) const
        {
            return img[p.y()][p.x()] == 0;
        }

    };

    struct nothing_is_background 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a background testing functor for use
                with the label_connected_blobs() routine defined below.
        !*/

        template <typename image_type>
        bool operator() (
            const image_type&, 
            const point& 
        ) const
        {
            return false;
        }

    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename label_image_type,
        typename background_functor_type,
        typename neighbors_functor_type,
        typename connected_functor_type
        >
    unsigned long label_connected_blobs (
        const image_type& img,
        const background_functor_type& is_background,
        const neighbors_functor_type&  get_neighbors,
        const connected_functor_type&  is_connected,
        label_image_type& label_img
    );
    /*!
        requires
            - image_type       == is an implementation of array2d/array2d_kernel_abstract.h
            - label_image_type == is an implementation of array2d/array2d_kernel_abstract.h
              and it must contain integers.
            - is_background(img, point(c,r)) is a legal expression that evaluates to bool.
            - get_neighbors(point(c,r), neighbors) is a legal expression where neighbors 
              is of type std::vector<point>.
            - is_connected(img, point(c,r), point(c2,r2)) is a valid expression.
            - is_same_object(img, label_img) == false
        ensures
            - This function labels each of the connected blobs in img with a unique integer 
              label.  
            - An image can be thought of as a graph where pixels A and B are connected if 
              and only if the following two statements are satisfied:
                - is_connected(img,A,B) == true
                - get_neighbors(A, neighbors) results in neighbors containing B or
                  get_neighbors(B, neighbors) results in neighbors containing A.
              Then this function can be understood as labeling all the connected components 
              of this pixel graph such that all pixels in a component get the same label while
              pixels in different components get different labels.  Note that there is a 
              special "background" component determined by is_background().  Any pixels which 
              are "background" always get a blob id of 0 regardless of any other considerations.
            - #label_img.nr() == img.nr()
            - #label_img.nc() == img.nc()
            - for all valid r and c:
                - #label_img[r][c] == the blob label number for pixel img[r][c].  
                - #label_img[r][c] >= 0
                - if (is_background(img, point(c,r))) then
                    - #label_img[r][c] == 0
                - else
                    - #label_img[r][c] != 0
            - if (img.size() != 0) then 
                - returns max(array_to_matrix(#label_img))+1
                  (i.e. returns a number one greater than the maximum blob id number, 
                  this is the number of blobs found.)
            - else
                - returns 0
            - blob labels are contiguous, therefore, the number returned by this function is
              the number of blobs in the image (including the background blob).
            - It is guaranteed that is_connected() and is_background() will never be 
              called with points outside the image.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LABEL_CONNeCTED_BLOBS_ABSTRACT_H_

