// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of dlib's bag-of-visual-word based
    tools for detecting objects in images.  In this example we will create three
    simple images, each containing some white squares.  We will then use the
    sliding window classifier tools to learn to detect these squares.

    If the objects you want to detect are somewhat rigid in appearance (e.g.
    faces, pedestrians, etc.) then you should try the methods shown in the
    fhog_object_detector_ex.cpp example program before trying to use the
    bag-of-visual-word tools shown in this example.  
*/


#include <dlib/svm_threaded.h>
#include <dlib/gui_widgets.h>
#include <dlib/array.h>
#include <dlib/array2d.h>
#include <dlib/image_keypoint.h>
#include <dlib/image_processing.h>

#include <iostream>
#include <fstream>


using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

template <
    typename image_array_type
    >
void make_simple_test_data (
    image_array_type& images,
    std::vector<std::vector<rectangle> >& object_locations
)
/*!
    ensures
        - #images.size() == 3
        - #object_locations.size() == 3
        - Creates some simple images to test the object detection routines.  In particular, 
          this function creates images with white 70x70 squares in them.  It also stores 
          the locations of these squares in object_locations.  
        - for all valid i:
            - object_locations[i] == A list of all the white rectangles present in images[i].
!*/
{
    images.clear();
    object_locations.clear();

    images.resize(3);
    images[0].set_size(400,400);
    images[1].set_size(400,400);
    images[2].set_size(400,400);

    // set all the pixel values to black
    assign_all_pixels(images[0], 0);
    assign_all_pixels(images[1], 0);
    assign_all_pixels(images[2], 0);

    // Now make some squares and draw them onto our black images. All the
    // squares will be 70 pixels wide and tall.

    std::vector<rectangle> temp;
    temp.push_back(centered_rect(point(100,100), 70,70)); 
    fill_rect(images[0],temp.back(),255); // Paint the square white
    temp.push_back(centered_rect(point(200,300), 70,70));
    fill_rect(images[0],temp.back(),255); // Paint the square white
    object_locations.push_back(temp);

    temp.clear();
    temp.push_back(centered_rect(point(140,200), 70,70));
    fill_rect(images[1],temp.back(),255); // Paint the square white
    temp.push_back(centered_rect(point(303,200), 70,70));
    fill_rect(images[1],temp.back(),255); // Paint the square white
    object_locations.push_back(temp);

    temp.clear();
    temp.push_back(centered_rect(point(123,121), 70,70));
    fill_rect(images[2],temp.back(),255); // Paint the square white
    object_locations.push_back(temp);

    // corrupt each image with random noise just to make this a little more 
    // challenging 
    dlib::rand rnd;
    for (unsigned long i = 0; i < images.size(); ++i)
    {
        for (long r = 0; r < images[i].nr(); ++r)
        {
            for (long c = 0; c < images[i].nc(); ++c)
            {
                images[i][r][c] = put_in_range(0,255,images[i][r][c] + 40*rnd.get_random_gaussian());
            }
        }
    }
}

// ----------------------------------------------------------------------------------------

int main()
{  
    try
    {
        // The first thing we do is create the set of 3 images discussed above.  
        dlib::array<array2d<unsigned char> > images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images, object_locations);


        /*
            This next block of code specifies the type of sliding window classifier we will
            be using to detect the white squares.  The most important thing here is the
            scan_image_pyramid template.  Instances of this template represent the core
            of a sliding window classifier.  To go into more detail, the sliding window 
            classifiers used by this object have three parts: 
                   1. The underlying feature extraction.  See the dlib documentation for a detailed 
                      discussion of how the hashed_feature_image and hog_image feature extractors
                      work.  However, to understand this example, all you need to know is that the 
                      feature extractor associates a vector with each location in an image.  This 
                      vector is supposed to capture information which describes how parts of the 
                      image look.  Importantly, it should do this in a way that is relevant to the 
                      problem you are trying to solve.

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
                          given by our Feature_extractor_type object inside the ith feature extraction
                          zone.
                        - Then the feature vector for a sliding window is an M*N dimensional vector
                          [F(1) F(2) F(3) ... F(N)] (i.e. it is a concatenation of the N vectors).
                          This feature vector can be thought of as a collection of N "bags of features",
                          each bag coming from a spatial location determined by one of the rectangular
                          feature extraction zones.
                          
                   3. A weight vector and a threshold value.  The dot product between the weight
                      vector and the feature vector for a sliding window location gives the score 
                      of the window.  If this score is greater than the threshold value then the 
                      window location is output as a detection.  You don't need to determine these
                      parameters yourself.  They are automatically populated by the 
                      structural_object_detection_trainer.

                The sliding window classifiers described above are applied to every level of an
                image pyramid.  So you need to tell scan_image_pyramid what kind of pyramid you want
                to use.  In this case we are using pyramid_down<2> which downsamples each pyramid
                layer by half (if you want to use a finer image pyramid then just change the
                template argument to a larger value.  For example, using pyramid_down<5> would
                downsample each layer by a ratio of 5 to 4).

                Finally, some of the feature extraction zones are allowed to move freely within the
                object box.  This means that when we are sliding the classifier over an image, some
                feature extraction zones are stationary (i.e. always in the same place relative to
                the object box) while others are allowed to move anywhere within the object box.  In
                particular, the movable regions are placed at the locations that maximize the score
                of the classifier.  Note further that each of the movable feature extraction zones
                must pass a threshold test for it to be included.  That is, if the score that a
                movable zone would contribute to the overall score for a sliding window location is
                not positive then that zone is not included in the feature vector (i.e. its part of
                the feature vector is set to zero.  This way the length of the feature vector stays
                constant).  This movable region construction allows us to represent objects with
                parts that move around relative to the object box.  For example, a human has hands
                but they aren't always in the same place relative to a person's bounding box.
                However, to keep this example program simple, we will only be using stationary
                feature extraction regions.
        */
        typedef hashed_feature_image<hog_image<3,3,1,4,hog_signed_gradient,hog_full_interpolation> > feature_extractor_type;
        typedef scan_image_pyramid<pyramid_down<2>, feature_extractor_type> image_scanner_type;
        image_scanner_type scanner;

        // The hashed_feature_image in the scanner needs to be supplied with a hash function capable 
        // of hashing the outputs of the hog_image.  Calling this function will set it up for us.  The 
        // 10 here indicates that it will hash HOG vectors into the range [0, pow(2,10)).  Therefore,
        // the feature vectors output by the hashed_feature_image will have dimension pow(2,10).
        setup_hashed_features(scanner, images, 10);
        // We should also tell the scanner to use the uniform feature weighting scheme
        // since it works best on the data in this example.  If you don't call this
        // function then it will use a slightly different weighting scheme which can give
        // improved results on many normal image types.
        use_uniform_feature_weights(scanner);

        // We also need to setup the detection templates the scanner will use.  It is important that 
        // we add detection templates which are capable of matching all the output boxes we want to learn.
        // For example, if object_locations contained a rectangle with a height to width ratio of 10 but
        // we only added square detection templates then it would be impossible to detect this non-square
        // rectangle.  The setup_grid_detection_templates_verbose() routine will take care of this for us by 
        // looking at the contents of object_locations and automatically picking an appropriate set.  Also, 
        // the final arguments indicate that we want our detection templates to have 4 feature extraction 
        // regions laid out in a 2x2 regular grid inside each sliding window.
        setup_grid_detection_templates_verbose(scanner, object_locations, 2, 2);


        // Now that we have defined the kind of sliding window classifier system we want and stored 
        // the details into the scanner object we are ready to use the structural_object_detection_trainer
        // to learn the weight vector and threshold needed to produce a complete object detector.
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4); // Set this to the number of processing cores on your machine. 


        // There are a variety of other useful parameters to the structural_object_detection_trainer.  
        // Examples of the ones you are most likely to use follow (see dlib documentation for what they do):
        //trainer.set_match_eps(0.80);
        //trainer.set_c(1.0);
        //trainer.set_loss_per_missed_target(1);
        //trainer.set_loss_per_false_alarm(1);


        // Do the actual training and save the results into the detector object.  
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        // We can easily test the new detector against our training data.  This print statement will indicate that it
        // has perfect precision and recall on this simple task.  It will also print the average precision (AP).
        cout << "Test detector (precision,recall,AP): " << test_object_detection_function(detector, images, object_locations) << endl;

        // The cross validation should also indicate perfect precision and recall.
        cout << "3-fold cross validation (precision,recall,AP): "
             << cross_validate_object_detection_trainer(trainer, images, object_locations, 3) << endl;




        // Let's display the output of the detector along with our training images.
        image_window win;
        for (unsigned long i = 0; i < images.size(); ++i)
        {
            // Run the detector on images[i] 
            const std::vector<rectangle> rects = detector(images[i]);
            cout << "Number of detections: "<< rects.size() << endl;

            // Put the image and detections into the window.
            win.clear_overlay();
            win.set_image(images[i]);
            win.add_overlay(rects, rgb_pixel(255,0,0));

            cout << "Hit enter to see the next image.";
            cin.get();
        }

        


        // Finally, note that the detector can be serialized to disk just like other dlib objects.
        serialize("object_detector.dat") << detector;

        // Recall from disk.
        deserialize("object_detector.dat") >> detector;
    }
    catch (exception& e)
    {
        cout << "\nexception thrown!" << endl;
        cout << e.what() << endl;
    }
}

// ----------------------------------------------------------------------------------------

