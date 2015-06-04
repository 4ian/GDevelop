// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BINNED_VECTOR_FEATUrES_ABSTRACT_Hh_
#ifdef DLIB_BINNED_VECTOR_FEATUrES_ABSTRACT_Hh_

#include "../lsh/projection_hash_abstract.h"
#include <vector>
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type_ = projection_hash
        >
    class binned_vector_feature_image : noncopyable
    {
        /*!
            REQUIREMENTS ON feature_extractor 
                - must be an object with an interface compatible with dlib::hog_image

            REQUIREMENTS ON hash_function_type_ 
                - must be an object with an interface compatible with projection_hash 

            INITIAL VALUE
                 - size() == 0

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for performing image feature extraction.  In
                particular, it wraps another image feature extractor and converts the
                wrapped image feature vectors into a high dimensional sparse vector.  For
                example, if the lower level feature extractor outputs the vector [3,4,5]
                and this vector is hashed into the second bin of four bins then the output
                sparse vector is:
                    [0,0,0,0, 3,4,5,1, 0,0,0,0, 0,0,0,0]. 
                That is, the output vector has a dimensionality that is equal to the number
                of hash bins times the dimensionality of the lower level vector plus one.
                The value in the extra dimension concatenated onto the end of the vector is
                always a constant value of of 1 and serves as a bias value.  This means
                that, if there are N hash bins, these vectors are capable of representing N
                different linear functions, each operating on the vectors that fall into
                their corresponding hash bin.


            THREAD SAFETY
                Concurrent access to an instance of this object is not safe and should be
                protected by a mutex lock except for the case where you are copying the
                configuration (via copy_configuration()) of a binned_vector_feature_image
                object to many other threads.  In this case, it is safe to copy the
                configuration of a shared object so long as no other operations are
                performed on it.


            NOTATION 
                let BASE_FE denote the base feature_extractor object contained inside the
                binned_vector_feature_image.
        !*/

    public:

        typedef feature_extractor feature_extractor_type;
        typedef hash_function_type_ hash_function_type;
        typedef std::vector<std::pair<unsigned int,double> > descriptor_type;

        binned_vector_feature_image (
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

        void set_hash (
            const hash_function_type& hash
        );
        /*!
            ensures
                - #get_hash() == hash
        !*/

        const hash_function_type& get_hash (
        ) const;
        /*!
            ensures
                - returns the hash function used by this object to hash
                  base feature vectors into integers.
        !*/

        void copy_configuration (
            const feature_extractor& item
        );
        /*!
            ensures
                - performs BASE_FE.copy_configuration(item)
        !*/

        void copy_configuration (
            const binned_vector_feature_image& item
        );
        /*!
            ensures
                - copies all the state information of item into *this, except for state 
                  information populated by load().  More precisely, given two binned_vector_feature_image 
                  objects H1 and H2, the following sequence of instructions should always 
                  result in both of them having the exact same state.
                    H2.copy_configuration(H1);
                    H1.load(img);
                    H2.load(img);
        !*/

        template <
            typename image_type
            >
        void load (
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

        unsigned long size (
        ) const;
        /*!
            ensures
                - returns BASE_FE.size() 
        !*/

        long nr (
        ) const;
        /*!
            ensures
                - returns BASE_FE.nr() 
        !*/

        long nc (
        ) const;
        /*!
            ensures
                - returns BASE_FE.nc() 
        !*/

        long get_num_dimensions (
        ) const;
        /*!
            ensures
                - returns the dimensionality of the feature vectors returned by operator().
                  In this case, this is the number of hash bins times the dimensionality of
                  the features produced by BASE_FE plus one.  That is, this function
                  returns get_hash().num_hash_bins()*(BASE_FE.get_num_dimensions()+1)
        !*/

        const descriptor_type& operator() (
            long row,
            long col
        ) const;
        /*!
            requires
                - 0 <= row < nr()
                - 0 <= col < nc()
                - It must be legal to evaluate expressions of the form: get_hash()(BASE_FE(row,col))
                  (e.g. the hash function must be properly configured to process the feature
                  vectors produced by the base feature extractor)
            ensures
                - hashes BASE_FE(row,col) and returns the resulting sparse vector.  In
                  particular, we return a vector that is a copy of BASE_FE(row,col) that
                  has been shifted into the part of the sparse vector indicated by the hash
                  function.  It will also have a constant bias value of 1 appended to it.
                - To be precise, this function returns a sparse vector V such that:
                    - V.size() == BASE_FE.get_num_dimensions()+1
                    - let IDX = get_hash()(BASE_FE(row,col))
                    - for i where 0 <= i < BASE_FE.get_num_dimensions():
                        - V[i].first == IDX*(BASE_FE.get_num_dimensions()+1) + i
                        - V[i].second == BASE_FE(row,col)(i)
                    - V[BASE_FE.get_num_dimensions()].first == IDX*(BASE_FE.get_num_dimensions()+1) + BASE_FE.get_num_dimensions()
                    - V[BASE_FE.get_num_dimensions()].second == 1
        !*/

        const rectangle get_block_rect (
            long row,
            long col
        ) const;
        /*!
            ensures
                - returns BASE_FE.get_block_rect(row,col)
                  I.e. returns a rectangle that tells you what part of the original image is associated
                  with a particular feature vector.
        !*/

        const point image_to_feat_space (
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

        const rectangle image_to_feat_space (
            const rectangle& rect
        ) const;
        /*!
            ensures
                - returns BASE_FE.image_to_feat_space(rect)
                  I.e. returns rectangle(image_to_feat_space(rect.tl_corner()), image_to_feat_space(rect.br_corner()));
                  (i.e. maps a rectangle from image space to feature space)
        !*/

        const point feat_to_image_space (
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

        const rectangle feat_to_image_space (
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

    template <
        typename T,
        typename U
        >
    void serialize (
        const binned_vector_feature_image<T,U>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    void deserialize (
        binned_vector_feature_image<T,U>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BINNED_VECTOR_FEATUrES_ABSTRACT_Hh_

