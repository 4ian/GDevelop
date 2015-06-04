// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SCAN_IMAGE_CuSTOM_ABSTRACT_Hh_
#ifdef DLIB_SCAN_IMAGE_CuSTOM_ABSTRACT_Hh_

#include <vector>
#include "../matrix.h"
#include "../geometry.h"
#include "../image_processing/full_object_detection_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class example_feature_extractor
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines the interface a feature extractor must implement if it
                is to be used with the scan_image_custom object defined at the bottom of
                this file.  

                In this case, the purpose of a feature extractor is to associated a
                complete feature vector with each rectangle in an image.  In particular,
                each rectangle is scored by taking the dot product between this feature
                vector and a weight vector.  If this score is greater than a threshold then
                the rectangle is output as a detection.
        !*/

    public:

        template <
            typename image_type
            >
        void load (
            const image_type& image,
            std::vector<rectangle>& candidate_objects
        );
        /*!
            ensures
                - Loads the given image into this feature extractor.  This means that
                  subsequent calls to get_feature_vector() will return the feature vector
                  corresponding to locations in the image given to load().
                - #candidate_objects == a set of bounding boxes in the given image that
                  might contain objects of interest.  These are the locations that will be
                  checked for the presents of objects when this feature extractor is used
                  with the scan_image_custom object.

        !*/

        void copy_configuration (
            const feature_extractor& item
        );
        /*!
            ensures
                - Copies all the state information of item into *this, except for state
                  information populated by load().  More precisely, given two
                  feature extractor objects S1 and S2, the following sequence of
                  instructions should always result in both of them having the exact same
                  state:
                    S2.copy_configuration(S1);
                    S1.load(img, temp);
                    S2.load(img, temp);
        !*/

        unsigned long get_num_dimensions (
        ) const;
        /*!
            ensures
                - returns the dimensionality of the feature vectors output by this object.
        !*/

        void get_feature_vector (
            const rectangle& obj,
            matrix<double,0,1>& psi
        ) const;
        /*!
            requires
                - psi.size() >= get_num_dimensions()
                  (i.e. psi must have preallocated its memory before this function is called)
            ensures
                - This function computes the feature vector associated with the given rectangle
                  in obj.  This rectangle is interpreted as a bounding box within the last image
                  given to this->load() and a feature vector describing that bounding box is 
                  output into psi.
                - The feature vector is added into psi.  That is, it does not overwrite the
                  previous contents of psi, but instead, it adds the vector to psi.
                - The dimensionality of the vector added to psi is get_num_dimensions().  This
                  means that elements of psi after psi(get_num_dimensions()-1) are not modified.
                - #psi.size() == psi.size()
                  (i.e. this function does not change the size of the psi vector)
        !*/

        double compute_object_score (
            const matrix<double,0,1>& w,
            const rectangle& obj
        ) const;
        /*!
            requires
                - w.size() >= get_num_dimensions()
            ensures
                - This function returns the dot product between the feature vector for
                  object box obj and the given w vector.  That is, this function computes
                  the same number as the following code snippet:
                     matrix<double,0,1> psi(w.size());
                     psi = 0;
                     get_feature_vector(obj, psi);
                     return dot(psi, w);
                  The point of the compute_object_score() routine is to compute this dot
                  product in a much more efficient way than directly calling
                  get_feature_vector() and dot().  Therefore, compute_object_score() is an
                  optional function.  If you can't think of a faster way to compute these
                  scores then do not implement compute_object_score() and the
                  scan_image_custom object will simply compute these scores for you.
                  However, it is often the case that there is something clever you can do
                  to make this computation faster.  If that is the case, then you can
                  provide an implementation of this function with your feature extractor
                  and then scan_image_custom will use it instead of using the default
                  calculation method shown in the above code snippet.
        !*/

    };

// ----------------------------------------------------------------------------------------
    
    void serialize( 
        const feature_extractor& item, 
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    void deserialize( 
        feature_extractor& item, 
        std::istream& in
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    class scan_image_custom : noncopyable
    {
        /*!
            REQUIREMENTS ON Feature_extractor_type
                - must be an object with an interface compatible with the
                  example_feature_extractor defined at the top of this file.

            INITIAL VALUE
                - is_loaded_with_image() == false

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for running a classifier over an image with the goal
                of localizing each object present.  The localization is in the form of the
                bounding box around each object of interest.  

                Unlike the scan_image_pyramid and scan_image_boxes objects, this image
                scanner delegates all the work of constructing the object feature vector to
                its Feature_extractor_type template argument.  That is, scan_image_custom
                simply asks the supplied feature extractor what boxes in the image we
                should investigate and then asks the feature extractor for the complete
                feature vector for each box.  That is, scan_image_custom does not apply any
                kind of pyramiding or other higher level processing to the features coming
                out of the feature extractor.  That means that when you use
                scan_image_custom it is completely up to you to define the feature vector
                used with each image box.

            THREAD SAFETY
                Concurrent access to an instance of this object is not safe and should be
                protected by a mutex lock except for the case where you are copying the
                configuration (via copy_configuration()) of a scan_image_custom object to
                many other threads.  In this case, it is safe to copy the configuration of
                a shared object so long as no other operations are performed on it.
        !*/

    public:

        typedef matrix<double,0,1> feature_vector_type;
        typedef Feature_extractor_type feature_extractor_type;

        scan_image_custom (
        );  
        /*!
            ensures
                - this object is properly initialized
        !*/

        template <
            typename image_type
            >
        void load (
            const image_type& img
        );
        /*!
            requires
                - image_type must be a type with the following properties:
                    - image_type objects can be loaded into Feature_extractor_type
                      objects via Feature_extractor_type::load().
            ensures
                - #is_loaded_with_image() == true
                - Calls get_feature_extractor().load() on the given image.  That is, we
                  will have loaded the image into the feature extractor in this
                  scan_image_custom object.  We will also have stored the candidate
                  object locations generated by the feature extractor and will scan
                  over them when this->detect() is called.
                - This object is ready to run a classifier over img to detect object
                  locations.  Call detect() to do this.
        !*/

        bool is_loaded_with_image (
        ) const;
        /*!
            ensures
                - returns true if this object has been loaded with an image to process and
                  false otherwise.
        !*/

        const feature_extractor_type& get_feature_extractor (
        ) const; 
        /*!
            ensures
                - returns a const reference to the feature_extractor_type object used 
                  internally for local feature extraction.  
        !*/

        void copy_configuration(
            const feature_extractor_type& fe
        );
        /*!
            ensures
                - This function performs the equivalent of
                  get_feature_extractor().copy_configuration(fe) (i.e. this function allows
                  you to configure the parameters of the underlying feature extractor used
                  by a scan_image_custom object)
        !*/

        void copy_configuration (
            const scan_image_custom& item
        );
        /*!
            ensures
                - Copies all the state information of item into *this, except for state
                  information populated by load().  More precisely, given two
                  scan_image_custom objects S1 and S2, the following sequence of
                  instructions should always result in both of them having the exact same
                  state:
                    S2.copy_configuration(S1);
                    S1.load(img);
                    S2.load(img);
        !*/

        long get_num_dimensions (
        ) const;
        /*!
            ensures
                - returns the number of dimensions in the feature vector for a candidate
                  object location.  That is, this function returns get_feature_extractor().get_num_dimensions().
        !*/

        void detect (
            const feature_vector_type& w,
            std::vector<std::pair<double, rectangle> >& dets,
            const double thresh
        ) const;
        /*!
            requires
                - w.size() >= get_num_dimensions()
                - is_loaded_with_image() == true
            ensures
                - Scans over all the candidate object locations produced by the feature
                  extractor during image loading and stores all detections into #dets.
                - for all valid i:
                    - #dets[i].second == The candidate object location which produced this
                      detection.  This rectangle gives the location of the detection.  
                    - #dets[i].first == The score for this detection.  This value is equal
                      to dot(w, feature vector for this candidate object location).
                    - #dets[i].first >= thresh
                - #dets will be sorted in descending order. 
                  (i.e.  #dets[i].first >= #dets[j].first for all i, and j>i)
                - Elements of w beyond index get_num_dimensions()-1 are ignored.  I.e. only
                  the first get_num_dimensions() are used.
                - Note that no form of non-max suppression is performed.  If a locations
                  has a score >= thresh then it is reported in #dets.
        !*/

        void get_feature_vector (
            const full_object_detection& obj,
            feature_vector_type& psi
        ) const;
        /*!
            requires
                - obj.num_parts() == 0 
                - is_loaded_with_image() == true
                - psi.size() >= get_num_dimensions()
                  (i.e. psi must have preallocated its memory before this function is called)
            ensures
                - This function allows you to determine the feature vector used for a
                  candidate object location output from detect().  Note that this vector is
                  added to psi.  Note also that you must use get_full_object_detection() to
                  convert a rectangle from detect() into the needed full_object_detection.
                - The dimensionality of the vector added to psi is get_num_dimensions().  This
                  means that elements of psi after psi(get_num_dimensions()-1) are not modified.
                - Since scan_image_custom only searches a limited set of object locations,
                  not all possible rectangles can be output by detect().  So in the case
                  where obj.get_rect() could not arise from a call to detect(), this
                  function will map obj.get_rect() to the nearest possible rectangle and
                  then add the feature vector for the mapped rectangle into #psi.
                - get_best_matching_rect(obj.get_rect()) == the rectangle obj.get_rect()
                  gets mapped to for feature extraction.
        !*/

        full_object_detection get_full_object_detection (
            const rectangle& rect,
            const feature_vector_type& w
        ) const;
        /*!
            ensures
                - returns full_object_detection(rect)
                  (This function is here only for compatibility with the scan_image_pyramid
                  object)
        !*/

        const rectangle get_best_matching_rect (
            const rectangle& rect
        ) const;
        /*!
            requires
                - is_loaded_with_image() == true
            ensures
                - Since scan_image_custom only searches a limited set of object locations,
                  not all possible rectangles can be represented.  Therefore, this function
                  allows you to supply a rectangle and obtain the nearest possible
                  candidate object location rectangle.
        !*/

        unsigned long get_num_detection_templates (
        ) const { return 1; }
        /*!
            ensures
                - returns 1.  Note that this function is here only for compatibility with
                  the scan_image_pyramid object.  Notionally, its return value indicates
                  that a scan_image_custom object is always ready to detect objects once an
                  image has been loaded.
        !*/

        unsigned long get_num_movable_components_per_detection_template (
        ) const { return 0; }
        /*!
            ensures
                - returns 0.  Note that this function is here only for compatibility with
                  the scan_image_pyramid object.  Its return value means that this object
                  does not support using movable part models.
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    void serialize (
        const scan_image_custom<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    template <typename T>
    void deserialize (
        scan_image_custom<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_IMAGE_CuSTOM_ABSTRACT_Hh_

