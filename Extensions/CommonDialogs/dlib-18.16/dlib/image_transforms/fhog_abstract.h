// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_fHOG_ABSTRACT_Hh_
#ifdef DLIB_fHOG_ABSTRACT_Hh_

#include "../matrix/matrix_abstract.h"
#include "../array2d/array2d_kernel_abstract.h"
#include "../array/array_kernel_abstract.h"
#include "../image_processing/generic_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_type, 
        typename T, 
        typename mm
        >
    void extract_fhog_features(
        const image_type& img, 
        array2d<matrix<T,31,1>,mm>& hog, 
        int cell_size = 8,
        int filter_rows_padding = 1,
        int filter_cols_padding = 1
    );
    /*!
        requires
            - cell_size > 0
            - filter_rows_padding > 0
            - filter_cols_padding > 0
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - T should be float or double
        ensures
            - This function implements the HOG feature extraction method described in 
              the paper:
                Object Detection with Discriminatively Trained Part Based Models by
                P. Felzenszwalb, R. Girshick, D. McAllester, D. Ramanan
                IEEE Transactions on Pattern Analysis and Machine Intelligence, Vol. 32, No. 9, Sep. 2010
              This means that it takes an input image img and outputs Felzenszwalb's
              31 dimensional version of HOG features, which are stored into #hog.
            - The input image is broken into cells that are cell_size by cell_size pixels
              and within each cell we compute a 31 dimensional FHOG vector.  This vector
              describes the gradient structure within the cell.  
            - A common task is to convolve each channel of the hog image with a linear
              filter.  This is made more convenient if the contents of #hog includes extra
              rows and columns of zero padding along the borders.  This extra padding
              allows for more efficient convolution code since the code does not need to
              perform expensive boundary checking.  Therefore, you can set
              filter_rows_padding and filter_cols_padding to indicate the size of the
              filter you wish to use and this function will ensure #hog has the appropriate
              extra zero padding along the borders.  In particular, it will include the
              following extra padding:
                - (filter_rows_padding-1)/2 extra rows of zeros on the top of #hog.
                - (filter_cols_padding-1)/2 extra columns of zeros on the left of #hog.
                - filter_rows_padding/2 extra rows of zeros on the bottom of #hog.
                - filter_cols_padding/2 extra columns of zeros on the right of #hog.
              Therefore, the extra padding is done such that functions like
              spatially_filter_image() apply their filters to the entire content containing
              area of a hog image (note that you should use the following planar version of
              extract_fhog_features() instead of the interlaced version if you want to use
              spatially_filter_image() on a hog image).
            - #hog.nr() == max(round(img.nr()/(double)cell_size)-2,0) + filter_rows_padding-1.
            - #hog.nc() == max(round(img.nc()/(double)cell_size)-2,0) + filter_cols_padding-1.
              (i.e.  Each output dimension is roughly 1/cell_size the original size but
              there is a one cell_size border all around the image that is lost and then we
              add on any additional padding that is requested.)
            - for all valid r and c:
                - #hog[r][c] == the FHOG vector describing the cell centered at the pixel location 
                  fhog_to_image(point(c,r),cell_size,filter_rows_padding,filter_cols_padding) in img.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename T, 
        typename mm1, 
        typename mm2
        >
    void extract_fhog_features(
        const image_type& img, 
        dlib::array<array2d<T,mm1>,mm2>& hog, 
        int cell_size = 8,
        int filter_rows_padding = 1,
        int filter_cols_padding = 1
    );
    /*!
        requires
            - cell_size > 0
            - filter_rows_padding > 0
            - filter_cols_padding > 0
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - T should be float or double
        ensures
            - This function is identical to the above extract_fhog_features() routine
              except that it outputs the results in a planar format rather than the
              interlaced format used above.  That is, each element of the hog vector is
              placed into one of 31 images inside #hog.  To be precise, if vhog is the
              output of the above interlaced version of extract_fhog_features() then we
              will have, for all valid r and c:
                - #hog[i][r][c] == vhog[r][c](i)
                  (where 0 <= i < 31)
            - #hog.size() == 31
            - for all valid i:
                - #hog[i].nr() == hog[0].nr()
                - #hog[i].nc() == hog[0].nc()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    matrix<double,0,1> extract_fhog_features(
        const image_type& img, 
        int cell_size = 8,
        int filter_rows_padding = 1,
        int filter_cols_padding = 1
    );
    /*!
        requires
            - cell_size > 0
            - filter_rows_padding > 0
            - filter_cols_padding > 0
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
        ensures
            - This function calls the above extract_fhog_features() routine and simply
              packages the entire output into a dlib::matrix.  The matrix is constructed
              using the planar version of extract_fhog_features() and then each output
              plane is converted into a column vector and subsequently all 31 column
              vectors are concatenated together and returned.
            - Each plane is converted into a column vector using reshape_to_column_vector(), 
              and is therefore represented in row major order inside the returned vector.  
            - If H is the array<array2d<double>> object output by the planar
              extract_fhog_features() then the returned vector is composed by concatenating
              H[0], then H[1], then H[2], and so on in ascending index order.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename T
        >
    void extract_fhog_features(
        const image_type& img, 
        matrix<T,0,1>& feats,
        int cell_size = 8,
        int filter_rows_padding = 1,
        int filter_cols_padding = 1
    );
    /*!
        requires
            - cell_size > 0
            - filter_rows_padding > 0
            - filter_cols_padding > 0
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - T is float, double, or long double
        ensures
            - This function is identical to the above version of extract_fhog_features()
              that returns a matrix<double,0,1> except that it returns the matrix here
              through a reference argument instead of returning it by value.
    !*/

// ----------------------------------------------------------------------------------------

    inline point image_to_fhog (
        point p,
        int cell_size = 8,
        int filter_rows_padding = 1,
        int filter_cols_padding = 1
    );
    /*!
        requires
            - cell_size > 0
            - filter_rows_padding > 0
            - filter_cols_padding > 0
        ensures
            - When using extract_fhog_features(), each FHOG cell is extracted from a
              certain region in the input image.  image_to_fhog() returns the identity of
              the FHOG cell containing the image pixel at location p.  Or in other words,
              let P == image_to_fhog(p) and hog be a FHOG feature map output by
              extract_fhog_features(), then hog[P.y()][P.x()] == the FHOG vector/cell
              containing the point p in the input image.  Note that some image points
              might not have corresponding feature locations.  E.g. border points or points
              outside the image.  In these cases the returned point will be outside the
              input image.
            - Note that you should use the same values of cell_size, filter_rows_padding,
              and filter_cols_padding that you used with extract_fhog_features().
    !*/

// ----------------------------------------------------------------------------------------

    inline rectangle image_to_fhog (
        const rectangle& rect,
        int cell_size = 8,
        int filter_rows_padding = 1,
        int filter_cols_padding = 1
    );
    /*!
        requires
            - cell_size > 0
            - filter_rows_padding > 0
            - filter_cols_padding > 0
        ensures
            - maps a rectangle from image space to fhog space.  In particular this function returns:
              rectangle(image_to_fhog(rect.tl_corner(),cell_size,filter_rows_padding,filter_cols_padding), 
                        image_to_fhog(rect.br_corner(),cell_size,filter_rows_padding,filter_cols_padding))
    !*/

// ----------------------------------------------------------------------------------------

    inline point fhog_to_image (
        point p,
        int cell_size = 8,
        int filter_rows_padding = 1,
        int filter_cols_padding = 1
    );
    /*!
        requires
            - cell_size > 0
            - filter_rows_padding > 0
            - filter_cols_padding > 0
        ensures
            - Maps a pixel in a FHOG image (produced by extract_fhog_features()) back to the
              corresponding original input pixel.  Note that since FHOG images are
              spatially downsampled by aggregation into cells the mapping is not totally
              invertible.  Therefore, the returned location will be the center of the cell
              in the original image that contained the FHOG vector at position p.  Moreover,
              cell_size, filter_rows_padding, and filter_cols_padding should be set to the
              values used by the call to extract_fhog_features().
            - Mapping from fhog space to image space is an invertible transformation.  That
              is, for any point P we have P == image_to_fhog(fhog_to_image(P,cell_size,filter_rows_padding,filter_cols_padding),
                                                             cell_size,filter_rows_padding,filter_cols_padding).
    !*/

// ----------------------------------------------------------------------------------------

    inline rectangle fhog_to_image (
        const rectangle& rect,
        int cell_size = 8,
        int filter_rows_padding = 1,
        int filter_cols_padding = 1
    );
    /*!
        requires
            - cell_size > 0
            - filter_rows_padding > 0
            - filter_cols_padding > 0
        ensures
            - maps a rectangle from fhog space to image space.  In particular this function returns:
              rectangle(fhog_to_image(rect.tl_corner(),cell_size,filter_rows_padding,filter_cols_padding), 
                        fhog_to_image(rect.br_corner(),cell_size,filter_rows_padding,filter_cols_padding))
            - Mapping from fhog space to image space is an invertible transformation.  That
              is, for any rectangle R we have R == image_to_fhog(fhog_to_image(R,cell_size,filter_rows_padding,filter_cols_padding),
                                                                 cell_size,filter_rows_padding,filter_cols_padding).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename mm1, 
        typename mm2
        >
    matrix<unsigned char> draw_fhog(
        const dlib::array<array2d<T,mm1>,mm2>& hog,
        const long cell_draw_size = 15
    );
    /*!
        requires
            - cell_draw_size > 0
            - hog.size() == 31
        ensures
            - Interprets hog as a FHOG feature map output by extract_fhog_features() and
              converts it into an image suitable for display on the screen.  In particular,
              we draw all the hog cells into a grayscale image in a way that shows the
              magnitude and orientation of the gradient energy in each cell.  The result is
              then returned.
            - The size of the cells in the output image will be rendered as cell_draw_size 
              pixels wide and tall.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    matrix<unsigned char> draw_fhog (
        const std::vector<matrix<T> >& hog,
        const long cell_draw_size = 15
    );
    /*!
        requires
            - cell_draw_size > 0
            - hog.size() == 31
        ensures
            - This function just converts the given hog object into an array<array2d<T>>
              and passes it to the above draw_fhog() routine and returns the results.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename mm
        >
    matrix<unsigned char> draw_fhog(
        const array2d<matrix<T,31,1>,mm>& hog,
        const long cell_draw_size = 15
    );
    /*!
        requires
            - cell_draw_size > 0
        ensures
            - Interprets hog as a FHOG feature map output by extract_fhog_features() and
              converts it into an image suitable for display on the screen.  In particular,
              we draw all the hog cells into a grayscale image in a way that shows the
              magnitude and orientation of the gradient energy in each cell.  The result is 
              then returned.
            - The size of the cells in the output image will be rendered as cell_draw_size 
              pixels wide and tall.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_fHOG_ABSTRACT_Hh_


