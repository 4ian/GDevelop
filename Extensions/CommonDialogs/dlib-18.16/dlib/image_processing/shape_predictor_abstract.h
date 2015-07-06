// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SHAPE_PREDICToR_ABSTRACT_H_
#ifdef DLIB_SHAPE_PREDICToR_ABSTRACT_H_

#include "full_object_detection_abstract.h"
#include "../matrix.h"
#include "../geometry.h"
#include "../pixel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class shape_predictor
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool that takes in an image region containing some object
                and outputs a set of point locations that define the pose of the object.
                The classic example of this is human face pose prediction, where you take
                an image of a human face as input and are expected to identify the
                locations of important facial landmarks such as the corners of the mouth
                and eyes, tip of the nose, and so forth.

                To create useful instantiations of this object you need to use the
                shape_predictor_trainer object defined below to train a shape_predictor
                using a set of training images, each annotated with shapes you want to
                predict.

            THREAD SAFETY
                No synchronization is required when using this object.  In particular, a
                single instance of this object can be used from multiple threads at the
                same time.  
        !*/

    public:

        shape_predictor (
        );
        /*!
            ensures
                - #num_parts() == 0
        !*/

        unsigned long num_parts (
        ) const;
        /*!
            ensures
                - returns the number of parts in the shapes predicted by this object.
        !*/

        template <typename image_type>
        full_object_detection operator()(
            const image_type& img,
            const rectangle& rect
        ) const;
        /*!
            requires
                - image_type == an image object that implements the interface defined in
                  dlib/image_processing/generic_image.h 
            ensures
                - Runs the shape prediction algorithm on the part of the image contained in
                  the given bounding rectangle.  So it will try and fit the shape model to
                  the contents of the given rectangle in the image.  For example, if there
                  is a human face inside the rectangle and you use a face landmarking shape
                  model then this function will return the locations of the face landmarks
                  as the parts.  So the return value is a full_object_detection DET such
                  that:
                    - DET.get_rect() == rect
                    - DET.num_parts() == num_parts()
                    - for all valid i:
                        - DET.part(i) == the location in img for the i-th part of the shape
                          predicted by this object.
        !*/

    };

    void serialize (const shape_predictor& item, std::ostream& out);
    void deserialize (shape_predictor& item, std::istream& in);
    /*!
        provides serialization support
    !*/

// ----------------------------------------------------------------------------------------

    class shape_predictor_trainer
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for training shape_predictors based on annotated training
                images.  Its implementation uses the algorithm described in:
                    One Millisecond Face Alignment with an Ensemble of Regression Trees
                    by Vahid Kazemi and Josephine Sullivan, CVPR 2014

        !*/

    public:

        shape_predictor_trainer (
        );
        /*!
            ensures
                - #get_cascade_depth() == 10
                - #get_tree_depth() == 4
                - #get_num_trees_per_cascade_level() == 500
                - #get_nu() == 0.1
                - #get_oversampling_amount() == 20
                - #get_feature_pool_size() == 400
                - #get_lambda() == 0.1
                - #get_num_test_splits() == 20
                - #get_feature_pool_region_padding() == 0
                - #get_random_seed() == ""
                - This object will not be verbose
        !*/

        unsigned long get_cascade_depth (
        ) const;
        /*!
            ensures
                - returns the number of cascades created when you train a model.  This
                  means that the total number of trees in the learned model is equal to
                  get_cascade_depth()*get_num_trees_per_cascade_level().
        !*/

        void set_cascade_depth (
            unsigned long depth
        );
        /*!
            requires
                - depth > 0
            ensures
                - #get_cascade_depth() == depth
        !*/

        unsigned long get_tree_depth (
        ) const; 
        /*!
            ensures
                - returns the depth of the trees used in the cascade.  In particular, there
                  are pow(2,get_tree_depth()) leaves in each tree.
        !*/

        void set_tree_depth (
            unsigned long depth
        );
        /*!
            requires
                - depth > 0
            ensures
                - #get_tree_depth() == depth
        !*/

        unsigned long get_num_trees_per_cascade_level (
        ) const;
        /*!
            ensures
                - returns the number of trees created for each cascade.  This means that
                  the total number of trees in the learned model is equal to
                  get_cascade_depth()*get_num_trees_per_cascade_level().  
        !*/

        void set_num_trees_per_cascade_level (
            unsigned long num
        );
        /*!
            requires
                - num > 0
            ensures
                - #get_num_trees_per_cascade_level() == num
        !*/

        double get_nu (
        ) const; 
        /*!
            ensures
                - returns the regularization parameter.  Larger values of this parameter
                  will cause the algorithm to fit the training data better but may also
                  cause overfitting.
        !*/

        void set_nu (
            double nu
        );
        /*!
            requires
                - 0 < nu <= 1
            ensures
                - #get_nu() == nu
        !*/

        std::string get_random_seed (
        ) const;
        /*!
            ensures
                - returns the random seed used by the internal random number generator.
                  Since this algorithm is a random forest style algorithm it relies on a
                  random number generator for generating the trees.  So each setting of the
                  random seed will produce slightly different outputs.  
        !*/

        void set_random_seed (
            const std::string& seed
        );
        /*!
            ensures
                - #get_random_seed() == seed
        !*/

        unsigned long get_oversampling_amount (
        ) const;
        /*!
            ensures
                - You give annotated images to this object as training examples.  You
                  can effectively increase the amount of training data by adding in each
                  training example multiple times but with a randomly selected deformation
                  applied to it.  That is what this parameter controls.  That is, if you
                  supply N training samples to train() then the algorithm runs internally
                  with N*get_oversampling_amount() training samples.  So the bigger this
                  parameter the better (excepting that larger values make training take
                  longer).  In terms of the Kazemi paper, this parameter is the number of
                  randomly selected initial starting points sampled for each training
                  example.
        !*/

        void set_oversampling_amount (
            unsigned long amount
        );
        /*!
            requires
                - amount > 0
            ensures
                - #get_oversampling_amount() == amount
        !*/

        unsigned long get_feature_pool_size (
        ) const;
        /*!
            ensures
                - At each level of the cascade we randomly sample get_feature_pool_size()
                  pixels from the image.  These pixels are used to generate features for
                  the random trees.  So in general larger settings of this parameter give
                  better accuracy but make the algorithm run slower.  
        !*/

        void set_feature_pool_size (
            unsigned long size
        );
        /*!
            requires
                - size > 1
            ensures
                - #get_feature_pool_size() == size
        !*/

        double get_feature_pool_region_padding (
        ) const; 
        /*!
            ensures
                - When we randomly sample the pixels for the feature pool we do so in a box
                  fit around the provided training landmarks.  By default, this box is the
                  tightest box that contains the landmarks (i.e. this is what happens when
                  get_feature_pool_region_padding()==0).  However, you can expand or shrink
                  the size of the pixel sampling region by setting a different value of
                  get_feature_pool_region_padding().  

                  To explain this precisely, for a padding of 0 we say that the pixels are
                  sampled from a box of size 1x1.  The padding value is added to each side
                  of the box.  So a padding of 0.5 would cause the algorithm to sample
                  pixels from a box that was 2x2, effectively multiplying the area pixels
                  are sampled from by 4.  Similarly, setting the padding to -0.2 would
                  cause it to sample from a box 0.6x0.6 in size.
        !*/

        void set_feature_pool_region_padding (
            double padding 
        );
        /*!
            ensures
                - #get_feature_pool_region_padding() == padding
        !*/


        double get_lambda (
        ) const;
        /*!
            ensures
                - To decide how to split nodes in the regression trees the algorithm looks
                  at pairs of pixels in the image.  These pixel pairs are sampled randomly
                  but with a preference for selecting pixels that are near each other.
                  get_lambda() controls this "nearness" preference.  In particular, smaller
                  values of get_lambda() will make the algorithm prefer to select pixels
                  close together and larger values of get_lambda() will make it care less
                  about picking nearby pixel pairs.  

                  Note that this is the inverse of how it is defined in the Kazemi paper.
                  For this object, you should think of lambda as "the fraction of the
                  bounding box will we traverse to find a neighboring pixel".  Nominally,
                  this is normalized between 0 and 1.  So reasonable settings of lambda are
                  values in the range 0 < lambda < 1.
        !*/

        void set_lambda (
            double lambda
        );
        /*!
            requires
                - lambda > 0
            ensures
                - #get_lambda() == lambda
        !*/

        unsigned long get_num_test_splits (
        ) const;
        /*!
            ensures
                - When generating the random trees we randomly sample get_num_test_splits()
                  possible split features at each node and pick the one that gives the best
                  split.  Larger values of this parameter will usually give more accurate
                  outputs but take longer to train.
        !*/

        void set_num_test_splits (
            unsigned long num
        );
        /*!
            requires
                - num > 0
            ensures
                - #get_num_test_splits() == num
        !*/

        void be_verbose (
        );
        /*!
            ensures
                - This object will print status messages to standard out so that a 
                  user can observe the progress of the algorithm.
        !*/

        void be_quiet (
        );
        /*!
            ensures
                - This object will not print anything to standard out
        !*/

        template <typename image_array>
        shape_predictor train (
            const image_array& images,
            const std::vector<std::vector<full_object_detection> >& objects
        ) const;
        /*!
            requires
                - image_array is a dlib::array of image objects where each image object
                  implements the interface defined in dlib/image_processing/generic_image.h 
                - images.size() == objects.size()
                - images.size() > 0
                - for some i: objects[i].size() != 0
                  (i.e. there has to be at least one full_object_detection in the training set)
                - for all valid i,j,k,l:
                    - objects[i][j].num_parts() == objects[k][l].num_parts()
                      (i.e. all objects must agree on the number of parts)
                    - objects[i][j].num_parts() > 0
            ensures
                - This object will try to learn to predict the locations of an object's parts 
                  based on the object bounding box (i.e.  full_object_detection::get_rect()) 
                  and the image pixels in that box.  That is, we will try to learn a
                  shape_predictor, SP, such that:
                    SP(images[i], objects[i][j].get_rect()) == objects[i][j]
                  This learned SP object is then returned.
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename image_array
        >
    double test_shape_predictor (
        const shape_predictor& sp,
        const image_array& images,
        const std::vector<std::vector<full_object_detection> >& objects,
        const std::vector<std::vector<double> >& scales
    );
    /*!
        requires
            - image_array is a dlib::array of image objects where each image object
              implements the interface defined in dlib/image_processing/generic_image.h 
            - images.size() == objects.size()
            - for all valid i and j:
                - objects[i][j].num_parts() == sp.num_parts()
            - if (scales.size() != 0) then
                - There must be a scale value for each full_object_detection in objects.
                  That is, it must be the case that:
                    - scales.size() == objects.size()
                    - for all valid i:
                        - scales[i].size() == objects[i].size()
        ensures
            - Tests the given shape_predictor by running it on each of the given objects and
              checking how well it recovers the part positions.  In particular, for all 
              valid i and j we perform:
                sp(images[i], objects[i][j].get_rect())
              and compare the result with the truth part positions in objects[i][j].  We
              then return the average distance (measured in pixels) between a predicted
              part location and its true position.  
            - if (scales.size() != 0) then
                - Each time we compute the distance between a predicted part location and
                  its true location in objects[i][j] we divide the distance by
                  scales[i][j].  Therefore, if you want the reported error to be the
                  average pixel distance then give an empty scales vector, but if you want
                  the returned value to be something else like the average distance
                  normalized by some feature of each object (e.g. the interocular distance)
                  then you can supply those normalizing values via scales.
    !*/

    template <
        typename image_array
        >
    double test_shape_predictor (
        const shape_predictor& sp,
        const image_array& images,
        const std::vector<std::vector<full_object_detection> >& objects
    );
    /*!
        requires
            - image_array is a dlib::array of image objects where each image object
              implements the interface defined in dlib/image_processing/generic_image.h 
            - images.size() == objects.size()
            - for all valid i and j:
                - objects[i][j].num_parts() == sp.num_parts()
        ensures
            - returns test_shape_predictor(sp, images, objects, no_scales) where no_scales
              is an empty vector.  So this is just a convenience function for calling the
              above test_shape_predictor() routine without a scales argument.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SHAPE_PREDICToR_ABSTRACT_H_

