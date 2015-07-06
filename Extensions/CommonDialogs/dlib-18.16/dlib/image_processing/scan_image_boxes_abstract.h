// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SCAN_IMAGE_bOXES_ABSTRACT_Hh_
#ifdef DLIB_SCAN_IMAGE_bOXES_ABSTRACT_Hh_

#include "../matrix.h"
#include "../geometry.h"
#include "../image_processing.h"
#include "../array2d.h"
#include "full_object_detection_abstract.h"
#include "../image_transforms/segment_image_abstract.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class default_box_generator
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a function object that takes in an image and outputs a set of
                candidate object locations.  It is also the default box generator used by
                the scan_image_boxes object defined below.
        !*/

    public:

        template <typename image_type>
        void operator() (
            const image_type& img,
            std::vector<rectangle>& rects
        ) const
        /*!
            ensures
                - #rects == the set of candidate object locations which should be searched
                  inside img.  That is, these are the rectangles which might contain
                  objects of interest within the given image.
        !*/
        {
            rects.clear();
            find_candidate_object_locations(img, rects);
        }
    };

    inline void serialize  (const default_box_generator&, std::ostream& ) {}
    inline void deserialize(      default_box_generator&, std::istream& ) {}
    /*!
        ensures
            - provides serialization support.  
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator = default_box_generator
        >
    class scan_image_boxes : noncopyable
    {
        /*!
            REQUIREMENTS ON Feature_extractor_type
                - must be an object with an interface compatible with the hashed_feature_image 
                  object defined in dlib/image_keypoint/hashed_feature_image_abstract.h or 
                  with the nearest_neighbor_feature_image object defined in 
                  dlib/image_keypoint/nearest_neighbor_feature_image_abstract.h

            REQUIREMENTS ON Box_generator
                - must be an object with an interface compatible with the
                  default_box_generator object defined at the top of this file.

            INITIAL VALUE
                - get_num_spatial_pyramid_levels() == 3
                - is_loaded_with_image() == false

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for running a classifier over an image with the goal
                of localizing each object present.  The localization is in the form of the
                bounding box around each object of interest.  

                Unlike the scan_image_pyramid object which scans a fixed sized window over
                an image pyramid, the scan_image_boxes tool allows you to define your own
                list of "candidate object locations" which should be evaluated.  This is
                simply a list of rectangle objects which might contain objects of interest.
                The scan_image_boxes object will then evaluate the classifier at each of
                these locations and return the subset of rectangles which appear to have
                objects in them.  The candidate object location generation is provided by
                the Box_generator that is passed in as a template argument.  

                This object can also be understood as a general tool for implementing the
                spatial pyramid models described in the paper:
                    Beyond Bags of Features: Spatial Pyramid Matching for Recognizing 
                    Natural Scene Categories by Svetlana Lazebnik, Cordelia Schmid, 
                    and Jean Ponce


                The classifiers used by this object have three parts: 
                   1. The underlying feature extraction provided by Feature_extractor_type
                      objects, which associate a vector with each location in an image.

                   2. A rule for extracting a feature vector from a candidate object
                      location.  In this object we use the spatial pyramid matching method.
                      This means we cut an object's detection window into a set of "feature
                      extraction regions" and extract a bag-of-words vector from each
                      before finally concatenating them to form the final feature vector
                      representing the entire object window.  The set of feature extraction
                      regions can be configured by the user by calling
                      set_num_spatial_pyramid_levels().  To be a little more precise, the
                      feature vector for a candidate object window is defined as follows:
                        - Let N denote the number of feature extraction zones.
                        - Let M denote the dimensionality of the vectors output by
                          Feature_extractor_type objects.
                        - Let F(i) == the M dimensional vector which is the sum of all
                          vectors given by our Feature_extractor_type object inside the
                          i-th feature extraction zone.  So this is notionally a
                          bag-of-words vector from the i-th zone.
                        - Then the feature vector for an object window is an M*N
                          dimensional vector [F(1) F(2) F(3) ... F(N)] (i.e. it is a
                          concatenation of the N vectors).  This feature vector can be
                          thought of as a collection of N bags-of-words, each bag coming
                          from a spatial location determined by one of the feature
                          extraction zones.
                          
                   3. A weight vector and a threshold value.  The dot product between the
                      weight vector and the feature vector for a candidate object location
                      gives the score of the location.  If this score is greater than the
                      threshold value then the candidate object location is output as a
                      detection.

            THREAD SAFETY
                Concurrent access to an instance of this object is not safe and should be
                protected by a mutex lock except for the case where you are copying the
                configuration (via copy_configuration()) of a scan_image_boxes object to
                many other threads.  In this case, it is safe to copy the configuration of
                a shared object so long as no other operations are performed on it.
        !*/

    public:

        typedef matrix<double,0,1> feature_vector_type;

        typedef Feature_extractor_type feature_extractor_type;
        typedef Box_generator box_generator;

        scan_image_boxes (
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
                    - image_type objects can be passed to the first argument of
                      Box_generator::operator()
            ensures
                - #is_loaded_with_image() == true
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
                  by a scan_image_boxes object)
        !*/

        void copy_configuration(
            const box_generator& bg
        );
        /*!
            ensures
                - #get_box_generator() == bg
                  (i.e. this function allows you to configure the parameters of the
                  underlying box generator used by a scan_image_boxes object)
        !*/

        const box_generator& get_box_generator (
        ) const;
        /*!
            ensures
                - returns the box_generator used by this object to generate candidate
                  object locations.
        !*/

        void copy_configuration (
            const scan_image_boxes& item
        );
        /*!
            ensures
                - Copies all the state information of item into *this, except for state 
                  information populated by load().  More precisely, given two scan_image_boxes 
                  objects S1 and S2, the following sequence of instructions should always 
                  result in both of them having the exact same state:
                    S2.copy_configuration(S1);
                    S1.load(img);
                    S2.load(img);
        !*/

        long get_num_dimensions (
        ) const;
        /*!
            ensures
                - returns the number of dimensions in the feature vector for a candidate
                  object location.  This value is the dimensionality of the underlying
                  feature vectors produced by Feature_extractor_type times the number of
                  feature extraction regions used.  Note that the number of feature
                  extraction regions used is a function of
                  get_num_spatial_pyramid_levels().
        !*/

        unsigned long get_num_spatial_pyramid_levels (
        ) const;
        /*!
            ensures
                - returns the number of layers in the spatial pyramid.  For example, if
                  this function returns 1 then it means we use a simple bag-of-words
                  representation over the whole object window.  If it returns 2 then it
                  means the feature representation is the concatenation of 5 bag-of-words
                  vectors, one from the entire object window and 4 others from 4 different
                  parts of the object window.  If it returns 3 then there are 1+4+16
                  bag-of-words vectors concatenated together in the feature representation,
                  and so on.
        !*/

        void set_num_spatial_pyramid_levels (
            unsigned long levels
        );
        /*!
            requires
                - levels > 0
            ensures
                - #get_num_spatial_pyramid_levels() == levels
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
                - Scans over all the candidate object locations as discussed in the WHAT
                  THIS OBJECT REPRESENTS section and stores all detections into #dets.
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
                - Since scan_image_boxes only searches a limited set of object locations,
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
                - Since scan_image_boxes only searches a limited set of object locations,
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
                  that a scan_image_boxes object is always ready to detect objects once
                  an image has been loaded.
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

    template <
        typename Feature_extractor_type,
        typename Box_generator 
        >
    void serialize (
        const scan_image_boxes<Feature_extractor_type,Box_generator>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    template <
        typename Feature_extractor_type,
        typename Box_generator 
        >
    void deserialize (
        scan_image_boxes<Feature_extractor_type,Box_generator>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_IMAGE_bOXES_ABSTRACT_Hh_

