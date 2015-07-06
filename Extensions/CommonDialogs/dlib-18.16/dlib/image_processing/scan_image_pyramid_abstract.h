// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SCAN_IMaGE_PYRAMID_ABSTRACT_Hh_
#ifdef DLIB_SCAN_IMaGE_PYRAMID_ABSTRACT_Hh_

#include "../matrix.h"
#include "../geometry.h"
#include "../image_processing.h"
#include "../array2d.h"
#include <vector>
#include "full_object_detection_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    class scan_image_pyramid : noncopyable
    {
        /*!
            REQUIREMENTS ON Pyramid_type
                - must be one of the pyramid_down objects defined in 
                  dlib/image_transforms/image_pyramid_abstract.h or an object with
                  a compatible interface

            REQUIREMENTS ON Feature_extractor_type
                - must be an object with an interface compatible with the hashed_feature_image 
                  object defined in dlib/image_keypoint/hashed_feature_image_abstract.h or 
                  with the nearest_neighbor_feature_image object defined in 
                  dlib/image_keypoint/nearest_neighbor_feature_image_abstract.h

            INITIAL VALUE
                - get_num_detection_templates() == 0
                - is_loaded_with_image() == false
                - get_max_detections_per_template() == 10000
                - get_max_pyramid_levels() == 1000
                - get_min_pyramid_layer_width() == 20
                - get_min_pyramid_layer_height() == 20

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for running a sliding window classifier over
                an image pyramid.  This object can also be understood as a general 
                tool for implementing the spatial pyramid models described in the paper:
                    Beyond Bags of Features: Spatial Pyramid Matching for Recognizing 
                    Natural Scene Categories by Svetlana Lazebnik, Cordelia Schmid, 
                    and Jean Ponce
                It also includes the ability to represent movable part models.

                


                The sliding window classifiers used by this object have three parts: 
                   1. The underlying feature extraction provided by Feature_extractor_type
                      objects, which associate a vector with each location in an image.

                   2. A detection template.  This is a rectangle which defines the shape of a 
                      sliding window (i.e. the object_box), as well as a set of rectangular feature 
                      extraction regions inside it.  This set of regions defines the spatial 
                      structure of the overall feature extraction within a sliding window.  In 
                      particular, each location of a sliding window has a feature vector 
                      associated with it.  This feature vector is defined as follows:
                        - Let N denote the number of feature extraction zones.
                        - Let M denote the dimensionality of the vectors output by Feature_extractor_type
                          objects.
                        - Let F(i) == the M dimensional vector which is the sum of all vectors 
                          given by our Feature_extractor_type object inside the i-th feature extraction
                          zone.
                        - Then the feature vector for a sliding window is an M*N dimensional vector
                          [F(1) F(2) F(3) ... F(N)] (i.e. it is a concatenation of the N vectors).
                          This feature vector can be thought of as a collection of N "bags of features",
                          each bag coming from a spatial location determined by one of the rectangular
                          feature extraction zones.
                          
                   3. A weight vector and a threshold value.  The dot product between the weight
                      vector and the feature vector for a sliding window location gives the score 
                      of the window.  If this score is greater than the threshold value then the 
                      window location is output as a detection.

                Finally, the sliding window classifiers described above are applied to every level of
                an image pyramid.  Moreover, some of the feature extraction zones are allowed to move
                freely within the object box.  This means that when we are sliding the classifier over
                an image, some feature extraction zones are stationary (i.e. always in the same place
                relative to the object box) while others are allowed to move anywhere within the object
                box.  In particular, the movable regions are placed at the locations that maximize the
                score of the classifier.  Note further that each of the movable feature extraction
                zones must pass a threshold test for it to be included.  That is, if the score that a
                movable zone would contribute to the overall score for a sliding window location is not
                positive then that zone is not included in the feature vector (i.e.  its part of the
                feature vector is set to zero.  This way the length of the feature vector stays
                constant).  This movable region construction allows us to represent objects with parts
                that move around relative to the object box.  For example, a human has hands but they
                aren't always in the same place relative to a person's bounding box.  

            THREAD SAFETY
                Concurrent access to an instance of this object is not safe and should be protected
                by a mutex lock except for the case where you are copying the configuration 
                (via copy_configuration()) of a scan_image_pyramid object to many other threads.  
                In this case, it is safe to copy the configuration of a shared object so long
                as no other operations are performed on it.
        !*/
    public:

        typedef matrix<double,0,1> feature_vector_type;

        typedef Pyramid_type pyramid_type;
        typedef Feature_extractor_type feature_extractor_type;

        scan_image_pyramid (
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
                    - image_type is default constructable.
                    - image_type is swappable by the global swap() function.
                    - image_type logically represents some kind of image and therefore its
                      number of rows and columns can be queried via num_rows(img) and
                      num_columns(img) respectively.
                    - image_type objects can be loaded into Feature_extractor_type
                      objects via Feature_extractor_type::load().
                    - image_type objects can be used with Pyramid_type.  That is,
                      if pyr is an object of type Pyramid_type while img1 and img2
                      are objects of image_type, then pyr(img1,img2) should be
                      a valid expression which downsamples img1 into img2.
            ensures
                - #is_loaded_with_image() == true
                - This object is ready to run sliding window classifiers over img.  Call
                  detect() to do this.
        !*/

        bool is_loaded_with_image (
        ) const;
        /*!
            ensures
                - returns true if this object has been loaded with an image to process
                  and false otherwise.
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
                  by a scan_image_pyramid object)
        !*/

        void copy_configuration (
            const scan_image_pyramid& item
        );
        /*!
            ensures
                - copies all the state information of item into *this, except for state 
                  information populated by load().  More precisely, given two scan_image_pyramid 
                  objects S1 and S2, the following sequence of instructions should always 
                  result in both of them having the exact same state.
                    S2.copy_configuration(S1);
                    S1.load(img);
                    S2.load(img);
        !*/

        void add_detection_template (
            const rectangle& object_box,
            const std::vector<rectangle>& stationary_feature_extraction_regions,
            const std::vector<rectangle>& movable_feature_extraction_regions
        );
        /*!
            requires
                - center(object_box) == point(0,0)
                - for all valid i:
                    - center(movable_feature_extraction_regions[i]) == point(0,0)
                - if (get_num_detection_templates() > 0) then
                    - get_num_stationary_components_per_detection_template() == stationary_feature_extraction_regions.size() 
                    - get_num_movable_components_per_detection_template() == movable_feature_extraction_regions.size() 
                      (i.e. if you already have detection templates in this object, then
                      any new detection template must declare a consistent number of 
                      feature extraction regions)
            ensures
                - Adds another detection template to this object.  In particular, object_box 
                  defines the size and shape of a sliding window while stationary_feature_extraction_regions 
                  and movable_feature_extraction_regions defines the locations for feature extraction as 
                  discussed in the WHAT THIS OBJECT REPRESENTS section above.  Note also that the locations of 
                  the stationary feature extraction regions are relative to the object_box.  
                - #get_num_detection_templates() == get_num_detection_templates() + 1
                - The order of rectangles in stationary_feature_extraction_regions and
                  movable_feature_extraction_regions matters.  Recall that each rectangle
                  gets its own set of features.  So given two different templates, their
                  i-th rectangles will both share the same part of the weight vector (i.e. the w
                  supplied to detect()).  So there should be some reasonable correspondence
                  between the rectangle ordering in different detection templates.  For,
                  example, different detection templates should place corresponding feature
                  extraction regions in roughly the same part of the object_box.
                - #get_num_stationary_components_per_detection_template() = stationary_feature_extraction_regions.size() 
                - #get_num_movable_components_per_detection_template()    = movable_feature_extraction_regions.size() 
        !*/

        void add_detection_template (
            const rectangle& object_box,
            const std::vector<rectangle>& stationary_feature_extraction_regions
        );
        /*!
            ensures
                - calls add_detection_template(object_box, stationary_feature_extraction_regions, empty_list)
                  where empty_list is a vector of size 0.  I.e. this function is just a convenience
                  routine for adding detection templates with no movable regions.
        !*/

        unsigned long get_num_detection_templates (
        ) const;
        /*!
            ensures
                - returns the number of detection templates in this object
        !*/

        unsigned long get_num_stationary_components_per_detection_template (
        ) const;
        /*!
            requires
                - get_num_detection_templates() > 0
            ensures
                - A detection template is a rectangle which defines the shape of a sliding
                  window (the object_box), as well as a set of rectangles which define
                  feature extraction zones.  This function returns the number of stationary
                  feature extraction zones in the detection templates used by this object. 
        !*/

        unsigned long get_num_movable_components_per_detection_template (
        ) const;
        /*!
            requires
                - get_num_detection_templates() > 0
            ensures
                - A detection template is a rectangle which defines the shape of a sliding
                  window (the object_box), as well as a set of rectangles which define
                  feature extraction zones.  This function returns the number of movable 
                  feature extraction zones in the detection templates used by this object. 
        !*/

        unsigned long get_num_components_per_detection_template (
        ) const;
        /*!
            requires
                - get_num_detection_templates() > 0
            ensures
                - returns the total number of feature extraction zones in the detection
                  templates used by this object.  That is, returns the following:
                    - get_num_movable_components_per_detection_template() + 
                      get_num_stationary_components_per_detection_template()
        !*/

        long get_num_dimensions (
        ) const;
        /*!
            requires
                - get_num_detection_templates() > 0
            ensures
                - returns the number of dimensions in the feature vector for a sliding window
                  location.  This value is the dimensionality of the underlying feature vectors 
                  produced by Feature_extractor_type times (get_num_stationary_components_per_detection_template() + 
                  get_num_movable_components_per_detection_template()).
        !*/

        unsigned long get_max_pyramid_levels (
        ) const;
        /*!
            ensures
                - returns the maximum number of image pyramid levels this object will use.
                  Note that #get_max_pyramid_levels() == 1 indicates that no image pyramid
                  will be used at all.  That is, only the original image will be processed
                  and no lower scale versions will be created.  
        !*/

        void set_max_pyramid_levels (
            unsigned long max_levels
        );
        /*!
            requires
                - max_levels > 0
            ensures
                - #get_max_pyramid_levels() == max_levels
        !*/

        void set_min_pyramid_layer_size (
            unsigned long width,
            unsigned long height 
        );
        /*!
            requires
                - width > 0
                - height > 0
            ensures
                - #get_min_pyramid_layer_width() == width
                - #get_min_pyramid_layer_height() == height
        !*/

        inline unsigned long get_min_pyramid_layer_width (
        ) const;
        /*!
            ensures
                - returns the smallest allowable width of an image in the image pyramid.
                  All pyramids will always include the original input image, however, no
                  pyramid levels will be created which have a width smaller than the
                  value returned by this function.
        !*/

        inline unsigned long get_min_pyramid_layer_height (
        ) const;
        /*!
            ensures
                - returns the smallest allowable height of an image in the image pyramid.
                  All pyramids will always include the original input image, however, no
                  pyramid levels will be created which have a height smaller than the
                  value returned by this function.
        !*/

        unsigned long get_max_detections_per_template (
        ) const;
        /*!
            ensures
                - For each image pyramid layer and detection template, this object scans a sliding
                  window classifier over an image and produces a number of detections.  This
                  function returns a number which defines a hard upper limit on the number of
                  detections allowed by a single scan.  This means that the total number of
                  possible detections produced by detect() is get_max_detections_per_template()*
                  get_num_detection_templates()*(number of image pyramid layers).  Additionally, 
                  if the maximum number of detections is reached during a scan then this object 
                  will return a random subsample of all detections which are above the detection 
                  threshold.
        !*/

        void set_max_detections_per_template (
            unsigned long max_dets
        );
        /*!
            requires
                - max_dets > 0
            ensures
                - #get_max_detections_per_template() == max_dets
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
                - get_num_detection_templates() > 0
            ensures
                - Scans all the detection templates over all pyramid layers as discussed in the 
                  WHAT THIS OBJECT REPRESENTS section and stores all detections into #dets.
                - for all valid i:
                    - #dets[i].second == The object box which produced this detection.  This rectangle gives
                      the location of the detection.  Note that the rectangle will have been converted back into
                      the original image input space.  That is, if this detection was made at a low level in the
                      image pyramid then the object box will have been automatically mapped up the pyramid layers
                      to the original image space.  Or in other words, if you plot #dets[i].second on top of the 
                      image given to load() it will show up in the right place.
                    - #dets[i].first == The score for this detection.  This value is equal to dot(w, feature vector
                      for this sliding window location).
                    - #dets[i].first >= thresh
                - #dets will be sorted in descending order. (i.e.  #dets[i].first >= #dets[j].first for all i, and j>i)
                - Elements of w beyond index get_num_dimensions()-1 are ignored.  I.e. only the first
                  get_num_dimensions() are used.
                - Note that no form of non-max suppression is performed.  If a window has a score >= thresh
                  then it is reported in #dets (assuming the limit imposed by get_max_detections_per_template() hasn't 
                  been reached).
        !*/

        const rectangle get_best_matching_rect (
            const rectangle& rect
        ) const;
        /*!
            requires
                - get_num_detection_templates() > 0
            ensures
                - Since scan_image_pyramid is a sliding window classifier system, not all possible rectangles 
                  can be represented.  Therefore, this function allows you to supply a rectangle and obtain the
                  nearest possible sliding window rectangle.
        !*/

        void get_feature_vector (
            const full_object_detection& obj,
            feature_vector_type& psi
        ) const;
        /*!
            requires
                - all_parts_in_rect(obj) == true
                - obj.num_parts() == get_num_movable_components_per_detection_template()
                - is_loaded_with_image() == true
                - get_num_detection_templates() > 0
                - psi.size() >= get_num_dimensions()
                  (i.e. psi must have preallocated its memory before this function is called)
            ensures
                - This function allows you to determine the feature vector used for a
                  sliding window location.  Note that this vector is added to psi.  Note
                  also that you must use get_full_object_detection() to convert a rect from
                  detect() into the needed full_object_detection.
                - The dimensionality of the vector added to psi is get_num_dimensions().  This
                  means that elements of psi after psi(get_num_dimensions()-1) are not modified.
                - Since scan_image_pyramid is a sliding window classifier system, not all
                  possible rectangles can be output by detect().  So in the case where
                  obj.get_rect() could not arise from a call to detect(), this function
                  will map obj.get_rect() to the nearest possible object box and then add
                  the feature vector for the mapped rectangle into #psi.
                - get_best_matching_rect(obj.get_rect()) == the rectangle obj.get_rect()
                  gets mapped to for feature extraction.
        !*/

        full_object_detection get_full_object_detection (
            const rectangle& rect,
            const feature_vector_type& w
        ) const;
        /*!
            requires
                - w.size() >= get_num_dimensions()
                - is_loaded_with_image() == true
                - get_num_detection_templates() > 0
            ensures
                - This function allows you to determine the full_object_detection
                  corresponding to a sliding window location.  Note that the detect()
                  routine doesn't return the locations of the movable parts in a detected
                  object.  Therefore, if you are using any movable parts in your model you
                  must use get_full_object_detection() to find out where the movable parts
                  were detected.  To do this, you supply the w and detected rectangle.
                  Then the corresponding fully populated full_object_detection will be
                  returned.
                - returns a full_object_detection, OBJ, such that: 
                    - OBJ.get_rect() == rect
                    - OBJ.num_parts() == get_num_movable_components_per_detection_template()
                    - OBJ.part(i) == the location of the i-th movable part inside this detection,
                      or OBJECT_PART_NOT_PRESENT if the part was not found.
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void serialize (
        const scan_image_pyramid<Pyramid_type,Feature_extractor_type>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void deserialize (
        scan_image_pyramid<Pyramid_type,Feature_extractor_type>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_IMaGE_PYRAMID_ABSTRACT_Hh_


