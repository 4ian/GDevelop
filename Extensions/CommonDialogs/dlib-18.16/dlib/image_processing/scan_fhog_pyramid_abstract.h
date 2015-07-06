// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SCAN_fHOG_PYRAMID_ABSTRACT_Hh_
#ifdef DLIB_SCAN_fHOG_PYRAMID_ABSTRACT_Hh_

#include <vector>
#include "../image_transforms/fhog_abstract.h"
#include "object_detector_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    matrix<unsigned char> draw_fhog (
        const object_detector<scan_fhog_pyramid<Pyramid_type,feature_extractor_type> >& detector,
        const unsigned long weight_index = 0,
        const long cell_draw_size = 15
    );
    /*!
        requires
            - cell_draw_size > 0
            - weight_index < detector.num_detectors()
            - detector.get_w(weight_index).size() >= detector.get_scanner().get_num_dimensions()
              (i.e. the detector must have been populated with a HOG filter)
        ensures
            - Converts the HOG filters in the given detector (specifically, the filters in
              detector.get_w(weight_index)) into an image suitable for display on the
              screen.  In particular, we draw all the HOG cells into a grayscale image in a
              way that shows the magnitude and orientation of the gradient energy in each
              cell.  The resulting image is then returned.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    unsigned long num_separable_filters (
        const object_detector<scan_fhog_pyramid<Pyramid_type,feature_extractor_type> >& detector,
        const unsigned long weight_index = 0
    );
    /*!
        requires
            - weight_index < detector.num_detectors()
            - detector.get_w(weight_index).size() >= detector.get_scanner().get_num_dimensions()
              (i.e. the detector must have been populated with a HOG filter)
        ensures
            - Returns the number of separable filters necessary to represent the HOG
              filters in the given detector's weight_index'th filter.  This is the filter
              defined by detector.get_w(weight_index).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    object_detector<scan_fhog_pyramid<Pyramid_type,feature_extractor_type> > threshold_filter_singular_values (
        const object_detector<scan_fhog_pyramid<Pyramid_type,feature_extractor_type> >& detector,
        double thresh,
        const unsigned long weight_index = 0
    );
    /*!
        requires
            - thresh >= 0
            - weight_index < detector.num_detectors()
            - detector.get_w(weight_index).size() >= detector.get_scanner().get_num_dimensions()
              (i.e. the detector must have been populated with a HOG filter)
        ensures
            - Removes all components of the filters in the given detector that have
              singular values that are smaller than the given threshold.  Therefore, this
              function allows you to control how many separable filters are in a detector.
              In particular, as thresh gets larger the quantity
              num_separable_filters(threshold_filter_singular_values(detector,thresh,weight_index),weight_index)
              will generally get smaller and therefore give a faster running detector.
              However, note that at some point a large enough thresh will drop too much
              information from the filters and their accuracy will suffer.  
            - returns the updated detector
    !*/

// ----------------------------------------------------------------------------------------

    class default_fhog_feature_extractor
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                The scan_fhog_pyramid object defined below is primarily meant to be used
                with the feature extraction technique implemented by extract_fhog_features().  
                This technique can generally be understood as taking an input image and
                outputting a multi-planed output image of floating point numbers that
                somehow describe the image contents.  Since there are many ways to define
                how this feature mapping is performed, the scan_fhog_pyramid allows you to
                replace the extract_fhog_features() method with a customized method of your
                choosing.  To do this you implement a class with the same interface as
                default_fhog_feature_extractor.  

                Therefore, the point of default_fhog_feature_extractor is two fold.  First,
                it provides the default FHOG feature extraction method used by scan_fhog_pyramid.
                Second, it serves to document the interface you need to implement to define 
                your own custom HOG style feature extraction. 
        !*/

    public:

        rectangle image_to_feats (
            const rectangle& rect,
            int cell_size,
            int filter_rows_padding,
            int filter_cols_padding
        ) const { return image_to_fhog(rect, cell_size, filter_rows_padding, filter_cols_padding); }
        /*!
            requires
                - cell_size > 0
                - filter_rows_padding > 0
                - filter_cols_padding > 0
            ensures
                - Maps a rectangle from the coordinates in an input image to the corresponding
                  area in the output feature image.
        !*/

        rectangle feats_to_image (
            const rectangle& rect,
            int cell_size,
            int filter_rows_padding,
            int filter_cols_padding
        ) const { return fhog_to_image(rect, cell_size, filter_rows_padding, filter_cols_padding); }
        /*!
            requires
                - cell_size > 0
                - filter_rows_padding > 0
                - filter_cols_padding > 0
            ensures
                - Maps a rectangle from the coordinates of the hog feature image back to
                  the input image.
                - Mapping from feature space to image space is an invertible
                  transformation.  That is, for any rectangle R we have:
                    R == image_to_feats(feats_to_image(R,cell_size,filter_rows_padding,filter_cols_padding),
                                                         cell_size,filter_rows_padding,filter_cols_padding).
        !*/

        template <
            typename image_type
            >
        void operator()(
            const image_type& img, 
            dlib::array<array2d<float> >& hog, 
            int cell_size,
            int filter_rows_padding,
            int filter_cols_padding
        ) const { extract_fhog_features(img,hog,cell_size,filter_rows_padding,filter_cols_padding); }
        /*!
            requires
                - image_type == is an implementation of array2d/array2d_kernel_abstract.h
                - img contains some kind of pixel type. 
                  (i.e. pixel_traits<typename image_type::type> is defined)
            ensures
                - Extracts FHOG features by calling extract_fhog_features().  The results are
                  stored into #hog.  Note that if you are implementing your own feature extractor you can
                  pretty much do whatever you want in terms of feature extraction so long as the following
                  conditions are met:
                    - #hog.size() == get_num_planes()
                    - Each image plane in of #hog has the same dimensions.
                    - for all valid i, r, and c:
                        - #hog[i][r][c] == a feature value describing the image content centered at the 
                          following pixel location in img: 
                            feats_to_image(point(c,r),cell_size,filter_rows_padding,filter_cols_padding)
        !*/

        inline unsigned long get_num_planes (
        ) const { return 31; }
        /*!
            ensures
                - returns the number of planes in the hog image output by the operator()
                  method.
        !*/
    };

    inline void serialize   (const default_fhog_feature_extractor&, std::ostream&) {}
    inline void deserialize (default_fhog_feature_extractor&, std::istream&) {}
    /*!
        Provides serialization support.  Note that there is no state in the default hog
        feature extractor so these functions do nothing.  But if you define a custom
        feature extractor then make sure you remember to serialize any state in your
        feature extractor.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type = default_fhog_feature_extractor
        >
    class scan_fhog_pyramid : noncopyable
    {
        /*!
            REQUIREMENTS ON Pyramid_type
                - Must be one of the pyramid_down objects defined in
                  dlib/image_transforms/image_pyramid_abstract.h or an object with a
                  compatible interface

            REQUIREMENTS ON Feature_extractor_type
                - Must be a type with an interface compatible with the
                  default_fhog_feature_extractor.

            INITIAL VALUE
                - get_padding()   == 1
                - get_cell_size() == 8
                - get_detection_window_width()   == 64
                - get_detection_window_height()  == 64
                - get_max_pyramid_levels()       == 1000
                - get_min_pyramid_layer_width()  == 64
                - get_min_pyramid_layer_height() == 64
                - get_nuclear_norm_regularization_strength() == 0

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for running a fixed sized sliding window classifier
                over an image pyramid.  In particular,  it slides a linear classifier over
                a HOG pyramid as discussed in the paper:  
                    Histograms of Oriented Gradients for Human Detection by Navneet Dalal
                    and Bill Triggs, CVPR 2005
                However, we augment the method slightly to use the version of HOG features 
                from: 
                    Object Detection with Discriminatively Trained Part Based Models by
                    P. Felzenszwalb, R. Girshick, D. McAllester, D. Ramanan
                    IEEE Transactions on Pattern Analysis and Machine Intelligence, Vol. 32, No. 9, Sep. 2010
                Since these HOG features have been shown to give superior performance. 

            THREAD SAFETY
                Concurrent access to an instance of this object is not safe and should be
                protected by a mutex lock except for the case where you are copying the
                configuration (via copy_configuration()) of a scan_fhog_pyramid object to
                many other threads.  In this case, it is safe to copy the configuration of
                a shared object so long as no other operations are performed on it.
        !*/

    public:
        typedef matrix<double,0,1> feature_vector_type;
        typedef Pyramid_type pyramid_type;
        typedef Feature_extractor_type feature_extractor_type;

        scan_fhog_pyramid (
        );  
        /*!
            ensures
                - this object is properly initialized
        !*/

        explicit scan_fhog_pyramid (
            const feature_extractor_type& fe
        );  
        /*!
            ensures
                - this object is properly initialized
                - #get_feature_extractor() == fe
        !*/

        template <
            typename image_type
            >
        void load (
            const image_type& img
        );
        /*!
            requires
                - image_type == is an implementation of array2d/array2d_kernel_abstract.h
                - img contains some kind of pixel type. 
                  (i.e. pixel_traits<typename image_type::type> is defined)
            ensures
                - #is_loaded_with_image() == true
                - This object is ready to run a classifier over img to detect object
                  locations.  Call detect() to do this.
        !*/

        const feature_extractor_type& get_feature_extractor(
        ) const;
        /*!
            ensures
                - returns a const reference to the feature extractor used by this object.
        !*/

        bool is_loaded_with_image (
        ) const;
        /*!
            ensures
                - returns true if this object has been loaded with an image to process and
                  false otherwise.
        !*/

        void copy_configuration (
            const scan_fhog_pyramid& item
        );
        /*!
            ensures
                - Copies all the state information of item into *this, except for state 
                  information populated by load().  More precisely, given two scan_fhog_pyramid
                  objects S1 and S2, the following sequence of instructions should always 
                  result in both of them having the exact same state:
                    S2.copy_configuration(S1);
                    S1.load(img);
                    S2.load(img);
        !*/

        void set_detection_window_size (
            unsigned long window_width,
            unsigned long window_height
        );
        /*!
            requires
                - window_width > 0
                - window_height > 0
            ensures
                - When detect() is called, this object scans a window that is of the given
                  width and height (in pixels) over each layer in an image pyramid.  This
                  means that the rectangle detections which come out of detect() will have
                  a width to height ratio approximately equal to window_width/window_height
                  and will be approximately window_width*window_height pixels in area or
                  larger.  Therefore, the smallest object that can be detected is roughly
                  window_width by window_height pixels in size.
                - #get_detection_window_width() == window_width
                - #get_detection_window_height() == window_height
                - Since we use a HOG feature representation, the detection procedure works
                  as follows:
                    Step 1. Make an image pyramid.
                    Step 2. Convert each layer of the image pyramid into a multi-planed HOG "image".
                    (the number of bands is given by get_feature_extractor().get_num_planes())
                    Step 3. Scan a linear classifier over each HOG image in the pyramid. 
                  Moreover, the HOG features quantize the input image into a grid of cells,
                  each cell being get_cell_size() by get_cell_size() pixels in size.  So
                  when we scan the object detector over the pyramid we are scanning an
                  appropriately sized window over these smaller quantized HOG features.  In
                  particular, the size of the window we scan over the HOG feature pyramid
                  is #get_fhog_window_width() by #get_fhog_window_height() HOG cells in
                  size.    
                - #is_loaded_with_image() == false
        !*/

        unsigned long get_detection_window_width (
        ) const;
        /*!
            ensures
                - returns the width, in pixels, of the detection window that is scanned
                  over the image when detect() is called.    
        !*/

        inline unsigned long get_detection_window_height (
        ) const; 
        /*!
            ensures
                - returns the height, in pixels, of the detection window that is scanned
                  over the image when detect() is called.  
        !*/

        unsigned long get_fhog_window_width (
        ) const; 
        /*!
            ensures
                - Returns the width of the HOG scanning window in terms of HOG cell blocks.
                  Note that this is a function of get_detection_window_width(), get_cell_size(), 
                  and get_padding() and is therefore not something you set directly. 
                - #get_fhog_window_width() is approximately equal to the number of HOG cells 
                  that fit into get_detection_window_width() pixels plus 2*get_padding()
                  since we include additional padding around each window to add context.
        !*/

        unsigned long get_fhog_window_height (
        ) const;
        /*!
            ensures
                - Returns the height of the HOG scanning window in terms of HOG cell blocks.  
                  Note that this is a function of get_detection_window_height(), get_cell_size(), 
                  and get_padding() and is therefore not something you set directly. 
                - #get_fhog_window_height() is approximately equal to the number of HOG cells 
                  that fit into get_detection_window_height() pixels plus 2*get_padding()
                  since we include additional padding around each window to add context.
        !*/

        void set_padding (
            unsigned long new_padding
        );
        /*!
            ensures
                - #get_padding() == new_padding
                - #is_loaded_with_image() == false
        !*/

        unsigned long get_padding (
        ) const;
        /*!
            ensures
                - The HOG windows scanned over the HOG pyramid can include additional HOG
                  cells outside the detection window.  This can help add context and
                  improve detection accuracy.  This function returns the number of extra
                  HOG cells added onto the border of the HOG windows which are scanned by
                  detect().
        !*/

        unsigned long get_cell_size (
        ) const;
        /*!
            ensures
                - Returns the size of the HOG cells.  Each HOG cell is square and contains
                  get_cell_size()*get_cell_size() pixels.
        !*/

        void set_cell_size (
            unsigned long new_cell_size
        );
        /*!
            requires
                - new_cell_size > 0
            ensures
                - #get_cell_size() == new_cell_size
                - #is_loaded_with_image() == false
        !*/

        inline long get_num_dimensions (
        ) const;
        /*!
            ensures
                - returns get_fhog_window_width()*get_fhog_window_height()*get_feature_extractor().get_num_planes()
                  (i.e. The number of features is equal to the size of the HOG window times
                  the number of planes output by the feature extractor. )
        !*/

        inline unsigned long get_num_detection_templates (
        ) const { return 1; }
        /*!
            ensures
                - returns 1.  Note that this function is here only for compatibility with 
                  the scan_image_pyramid object.  Notionally, its return value indicates 
                  that a scan_fhog_pyramid object is always ready to detect objects once
                  an image has been loaded.
        !*/

        inline unsigned long get_num_movable_components_per_detection_template (
        ) const { return 0; }
        /*!
            ensures
                - returns 0.  Note that this function is here only for compatibility with
                  the scan_image_pyramid object.  Its return value means that this object
                  does not support using movable part models.
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

        fhog_filterbank build_fhog_filterbank (
            const feature_vector_type& weights 
        ) const;
        /*!
            requires
                - weights.size() >= get_num_dimensions()
            ensures
                - Creates and then returns a fhog_filterbank object FB such that:
                    - FB.get_num_dimensions() == get_num_dimensions()
                    - FB.get_filters() == the values in weights unpacked into get_feature_extractor().get_num_planes() filters.
                    - FB.num_separable_filters() == the number of separable filters necessary to
                      represent all the filters in FB.get_filters().
        !*/

        class fhog_filterbank 
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This object represents a HOG filter bank.  That is, the classifier that is 
                    slid over a HOG pyramid is a set of get_feature_extractor().get_num_planes() 
                    linear filters, each get_fhog_window_width() rows by get_fhog_window_height() 
                    columns in size.  This object contains that set of filters.  
            !*/

        public:
            long get_num_dimensions(
            ) const;
            /*!
                ensures
                    - Returns the total number of values in the filters.  
            !*/

            const std::vector<matrix<float> >& get_filters(
            ) const; 
            /*!
                ensures
                    - returns the set of HOG filters in this object.
            !*/

            unsigned long num_separable_filters(
            ) const;
            /*!
                ensures
                    - returns the number of separable filters necessary to represent all
                      the filters in get_filters().
            !*/
        };

        void detect (
            const fhog_filterbank& w,
            std::vector<std::pair<double, rectangle> >& dets,
            const double thresh
        ) const;
        /*!
            requires
                - w.get_num_dimensions() == get_num_dimensions()
                - is_loaded_with_image() == true
            ensures
                - Scans the HOG filter defined by w over the HOG pyramid that was populated
                  by the last call to load() and stores all object detections into #dets.  
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
                  then it is reported in #dets.
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
                - performs: detect(build_fhog_filterbank(w), dets, thresh)
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
                - This function allows you to determine the feature vector used for an
                  object detection output from detect().  Note that this vector is
                  added to psi.  Note also that you can use get_full_object_detection() to
                  convert a rectangle from detect() into the needed full_object_detection.
                - The dimensionality of the vector added to psi is get_num_dimensions().  This
                  means that elements of psi after psi(get_num_dimensions()-1) are not modified.
                - Since scan_fhog_pyramid only searches a limited set of object locations,
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
            ensures
                - Since scan_fhog_pyramid only searches a limited set of object locations,
                  not all possible rectangles can be represented.  Therefore, this function
                  allows you to supply a rectangle and obtain the nearest possible
                  candidate object location rectangle.
        !*/

        double get_nuclear_norm_regularization_strength (
        ) const;
        /*!
            ensures
                - If the number of separable filters in a fhog_filterbank is small then the
                  filter bank can be scanned over an image much faster than a normal set of
                  filters.  Therefore, this object provides the option to encourage
                  machine learning methods that learn a HOG filter bank (i.e.
                  structural_object_detection_trainer) to select filter banks that have
                  this beneficial property.  In particular, the value returned by
                  get_nuclear_norm_regularization_strength() is a multiplier on a nuclear
                  norm regularizer which will encourage the selection of filters that use a
                  small number of separable components.  Larger values encourage tend to
                  give a smaller number of separable filters. 
                - if (get_nuclear_norm_regularization_strength() == 0) then
                    - This feature is disabled
                - else
                    - A nuclear norm regularizer will be added when
                      structural_object_detection_trainer is used to learn a HOG filter
                      bank.  Note that this can make the training process take
                      significantly longer (but can result in faster object detectors).
        !*/

        void set_nuclear_norm_regularization_strength (
            double strength
        );
        /*!
            requires
                - strength >= 0
            ensures
                - #get_nuclear_norm_regularization_strength() == strength
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    void serialize (
        const scan_fhog_pyramid<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void deserialize (
        scan_fhog_pyramid<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename pyramid_type,
        typename image_type
        >
    void evaluate_detectors (
        const std::vector<object_detector<scan_fhog_pyramid<pyramid_type>>>& detectors,
        const image_type& img,
        std::vector<rect_detection>& dets,
        const double adjust_threshold = 0
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - img contains some kind of pixel type. 
              (i.e. pixel_traits<typename image_type::type> is defined)
        ensures
            - This function runs each of the provided object_detector objects over img and
              stores the resulting detections into #dets.  Importantly, this function is
              faster than running each detector individually because it computes the HOG
              features only once and then reuses them for each detector.  However, it is
              important to note that this speedup is only possible if all the detectors use
              the same cell_size parameter that determines how HOG features are computed.
              If different cell_size values are used then this function will not be any
              faster than running the detectors individually.
            - This function applies non-max suppression individually to the output of each
              detector.  Therefore, the output is the same as if you ran each detector
              individually and then concatenated the results. 
            - To be precise, this function performs object detection on the given image and
              stores the detected objects into #dets.  In particular, we will have that:
                - #dets is sorted such that the highest confidence detections come first.
                  E.g. element 0 is the best detection, element 1 the next best, and so on.
                - #dets.size() == the number of detected objects.
                - #dets[i].detection_confidence == The strength of the i-th detection.
                  Larger values indicate that the detector is more confident that #dets[i]
                  is a correct detection rather than being a false alarm.  Moreover, the
                  detection_confidence is equal to the detection value output by the
                  scanner minus the threshold value stored at the end of the weight vector.
                - #dets[i].rect == the bounding box for the i-th detection.
                - The detection #dets[i].rect was produced by detectors[#dets[i].weight_index].
            - The detection threshold is adjusted by having adjust_threshold added to it.
              Therefore, an adjust_threshold value > 0 makes detecting objects harder while
              a negative value makes it easier.  Moreover, the following will be true for
              all valid i:
                - #dets[i].detection_confidence >= adjust_threshold
              This means that, for example, you can obtain the maximum possible number of
              detections by setting adjust_threshold equal to negative infinity.
            - This function is threadsafe in the sense that multiple threads can call
              evaluate_detectors() with the same instances of detectors and img without
              requiring a mutex lock.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pyramid_type,
        typename image_type
        >
    std::vector<rectangle> evaluate_detectors (
        const std::vector<object_detector<scan_fhog_pyramid<pyramid_type>>>& detectors,
        const image_type& img,
        const double adjust_threshold = 0
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - img contains some kind of pixel type. 
              (i.e. pixel_traits<typename image_type::type> is defined)
        ensures
            - This function just calls the above evaluate_detectors() routine and copies
              the output dets into a vector<rectangle> object and returns it.  Therefore,
              this function is provided for convenience.
            - This function is threadsafe in the sense that multiple threads can call
              evaluate_detectors() with the same instances of detectors and img without
              requiring a mutex lock.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_fHOG_PYRAMID_ABSTRACT_Hh_


