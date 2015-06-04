// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_NEAREST_NEIGHBOR_FeATURE_IMAGE_ABSTRACT_Hh_
#ifdef DLIB_NEAREST_NEIGHBOR_FeATURE_IMAGE_ABSTRACT_Hh_

#include <vector>
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class nearest_neighbor_feature_image : noncopyable
    {
        /*!
            REQUIREMENTS ON feature_extractor 
                - must be an object with an interface compatible with dlib::hog_image

            INITIAL VALUE
                 - size() == 0
                 - get_num_dimensions() == 0

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for performing image feature extraction.  In
                particular, it wraps another image feature extractor and converts
                the wrapped image feature vectors into sparse indicator vectors.  It does
                this by finding the nearest neighbor for each feature vector and returning an
                indicator vector that is zero everywhere except for the position indicated by 
                the nearest neighbor.  


            THREAD SAFETY
                Concurrent access to an instance of this object is not safe and should be protected
                by a mutex lock except for the case where you are copying the configuration 
                (via copy_configuration()) of a nearest_neighbor_feature_image object to many other 
                threads.  In this case, it is safe to copy the configuration of a shared object so 
                long as no other operations are performed on it.


            NOTATION 
                let BASE_FE denote the base feature_extractor object contained inside 
                the nearest_neighbor_feature_image.
        !*/

    public:

        typedef std::vector<std::pair<unsigned int,double> > descriptor_type;

        nearest_neighbor_feature_image (
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
            const feature_extractor& item
        );
        /*!
            ensures
                - performs BASE_FE.copy_configuration(item)
        !*/

        void copy_configuration (
            const nearest_neighbor_feature_image& item
        );
        /*!
            ensures
                - copies all the state information of item into *this, except for state 
                  information populated by load().  More precisely, given two 
                  nearest_neighbor_feature_image objects H1 and H2, the following sequence 
                  of instructions should always result in both of them having the exact 
                  same state.
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
                - image_type == any type that can be supplied to feature_extractor::load() 
            ensures
                - performs BASE_FE.load(img)
                  i.e. does feature extraction.  The features can be accessed using
                  operator() as defined below.
        !*/

        inline unsigned long size (
        ) const;
        /*!
            ensures
                - returns BASE_FE.size() 
        !*/

        inline long nr (
        ) const;
        /*!
            ensures
                - returns BASE_FE.nr() 
        !*/

        inline long nc (
        ) const;
        /*!
            ensures
                - returns BASE_FE.nc() 
        !*/

        inline long get_num_dimensions (
        ) const;
        /*!
            ensures
                - returns the dimensionality of the feature vectors returned by operator().  
                  In this case, this is the number of basis elements.  That is, it is the number
                  of vectors given to the set_basis() member function.
        !*/

        template <typename vector_type>
        void set_basis (
            const vector_type& new_basis
        );
        /*!
            ensures
                - #get_num_dimensions() == new_basis.size()
                - The operator() member function defined below will use new_basis to 
                  determine nearest neighbors.
        !*/

        inline const descriptor_type& operator() (
            long row,
            long col
        ) const;
        /*!
            requires
                - 0 <= row < nr()
                - 0 <= col < nc()
                - get_num_dimensions() > 0
            ensures
                - determines which basis element is nearest to BASE_FE(row,col) and returns a sparse
                  indicator vector identifying the nearest neighbor. 
                - To be precise, this function returns a sparse vector V such that:
                    - V.size() == 1 
                    - V[0].first == The basis element index for the basis vector nearest to BASE_FE(row,col).
                      "nearness" is determined using Euclidean distance.
                    - V[0].second == 1 
        !*/

        inline const rectangle get_block_rect (
            long row,
            long col
        ) const;
        /*!
            ensures
                - returns BASE_FE.get_block_rect(row,col)
                  I.e. returns a rectangle that tells you what part of the original image is associated
                  with a particular feature vector.
        !*/

        inline const point image_to_feat_space (
            const point& p
        ) const;
        /*!
            ensures
                - returns BASE_FE.image_to_feat_space(p)
                  I.e. Each local feature is extracted from a certain point in the input image.
                  This function returns the identity of the local feature corresponding
                  to the image location p.  Or in other words, let P == image_to_feat_space(p), 
                  then (*this)(P.y(),P.x()) == the local feature closest to, or centered at, 
                  the point p in the input image.  Note that some image points might not have 
                  corresponding feature locations.  E.g. border points or points outside the 
                  image.  In these cases the returned point will be outside get_rect(*this).
        !*/

        inline const rectangle image_to_feat_space (
            const rectangle& rect
        ) const;
        /*!
            ensures
                - returns BASE_FE.image_to_feat_space(rect)
                  I.e. returns rectangle(image_to_feat_space(rect.tl_corner()), image_to_feat_space(rect.br_corner()));
                  (i.e. maps a rectangle from image space to feature space)
        !*/

        inline const point feat_to_image_space (
            const point& p
        ) const;
        /*!
            ensures
                - returns BASE_FE.feat_to_image_space(p)
                  I.e. returns the location in the input image space corresponding to the center
                  of the local feature at point p.  In other words, this function computes
                  the inverse of image_to_feat_space().  Note that it may only do so approximately, 
                  since more than one image location might correspond to the same local feature.  
                  That is, image_to_feat_space() might not be invertible so this function gives 
                  the closest possible result.
        !*/

        inline const rectangle feat_to_image_space (
            const rectangle& rect
        ) const;
        /*!
            ensures
                - returns BASE_FE.feat_to_image_space(rect)
                  I.e. return rectangle(feat_to_image_space(rect.tl_corner()), feat_to_image_space(rect.br_corner()));
                  (i.e. maps a rectangle from feature space to image space)
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    void serialize (
        const nearest_neighbor_feature_image<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    template <typename T>
    void deserialize (
        nearest_neighbor_feature_image<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_NEAREST_NEIGHBOR_FeATURE_IMAGE_ABSTRACT_Hh_



