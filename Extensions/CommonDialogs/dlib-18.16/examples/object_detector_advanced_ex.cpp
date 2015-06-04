// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the process for defining custom
    bag-of-visual-word style feature extractors for use with the
    structural_object_detection_trainer.

    NOTICE: This example assumes you are familiar with the contents of the
    object_detector_ex.cpp example program.  Also, if the objects you want to
    detect are somewhat rigid in appearance (e.g.  faces, pedestrians, etc.)
    then you should try the methods shown in the fhog_object_detector_ex.cpp
    example program before trying to use the bag-of-visual-word tools shown in
    this example.  
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
}

// ----------------------------------------------------------------------------------------

class very_simple_feature_extractor : noncopyable
{
    /*!
        WHAT THIS OBJECT REPRESENTS
            This object is a feature extractor which goes to every pixel in an image and
            produces a 32 dimensional feature vector.  This vector is an indicator vector
            which records the pattern of pixel values in a 4-connected region.  So it should
            be able to distinguish basic things like whether or not a location falls on the
            corner of a white box, on an edge, in the middle, etc.


            Note that this object also implements the interface defined in dlib/image_keypoint/hashed_feature_image_abstract.h.
            This means all the member functions in this object are supposed to behave as 
            described in the hashed_feature_image specification.  So when you define your own
            feature extractor objects you should probably refer yourself to that documentation
            in addition to reading this example program.
    !*/


public:

    template <
        typename image_type
        >
    inline void load (
        const image_type& img
    )
    {
        feat_image.set_size(img.nr(), img.nc());
        assign_all_pixels(feat_image,0);
        for (long r = 1; r+1 < img.nr(); ++r)
        {
            for (long c = 1; c+1 < img.nc(); ++c)
            {
                unsigned char f = 0;
                if (img[r][c])   f |= 0x1;
                if (img[r][c+1]) f |= 0x2;
                if (img[r][c-1]) f |= 0x4;
                if (img[r+1][c]) f |= 0x8;
                if (img[r-1][c]) f |= 0x10;

                // Store the code value for the pattern of pixel values in the 4-connected
                // neighborhood around this row and column.
                feat_image[r][c] = f;
            }
        }
    }

    inline unsigned long size () const { return feat_image.size(); }
    inline long nr () const { return feat_image.nr(); }
    inline long nc () const { return feat_image.nc(); }

    inline long get_num_dimensions (
    ) const
    {
        // Return the dimensionality of the vectors produced by operator()
        return 32;
    }

    typedef std::vector<std::pair<unsigned int,double> > descriptor_type;

    inline const descriptor_type& operator() (
        long row,
        long col
    ) const
    /*!
        requires
            - 0 <= row < nr()
            - 0 <= col < nc()
        ensures
            - returns a sparse vector which describes the image at the given row and column.  
              In particular, this is a vector that is 0 everywhere except for one element. 
    !*/
    {
        feat.clear();
        const unsigned long only_nonzero_element_index = feat_image[row][col];
        feat.push_back(make_pair(only_nonzero_element_index,1.0));
        return feat;
    }

    // This block of functions is meant to provide a way to map between the row/col space taken by
    // this object's operator() function and the images supplied to load().  In this example it's trivial.  
    // However, in general, you might create feature extractors which don't perform extraction at every 
    // possible image location (e.g. the hog_image) and thus result in some more complex mapping.  
    inline const rectangle get_block_rect       ( long row, long col) const { return centered_rect(col,row,3,3); }
    inline const point image_to_feat_space      ( const point& p) const { return p; } 
    inline const rectangle image_to_feat_space  ( const rectangle& rect) const { return rect; } 
    inline const point feat_to_image_space      ( const point& p) const { return p; } 
    inline const rectangle feat_to_image_space  ( const rectangle& rect) const { return rect; }

    inline friend void serialize   ( const very_simple_feature_extractor& item, std::ostream& out)  { serialize(item.feat_image, out); }
    inline friend void deserialize ( very_simple_feature_extractor& item, std::istream& in ) { deserialize(item.feat_image, in); }

    void copy_configuration ( const very_simple_feature_extractor& item){}

private:
    array2d<unsigned char> feat_image;

    // This variable doesn't logically contribute to the state of this object.  It is here
    // only to avoid returning a descriptor_type object by value inside the operator() method.
    mutable descriptor_type feat;
};

// ----------------------------------------------------------------------------------------

int main()
{  
    try
    {
        // Get some data 
        dlib::array<array2d<unsigned char> > images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images, object_locations);


        typedef scan_image_pyramid<pyramid_down<5>, very_simple_feature_extractor> image_scanner_type;
        image_scanner_type scanner;
        // Instead of using setup_grid_detection_templates() like in object_detector_ex.cpp, let's manually
        // setup the sliding window box.  We use a window with the same shape as the white boxes we
        // are trying to detect.
        const rectangle object_box = compute_box_dimensions(1,    // width/height ratio
                                                            70*70 // box area
                                                            );
        scanner.add_detection_template(object_box, create_grid_detection_template(object_box,2,2));

        // Since our sliding window is already the right size to detect our objects we don't need
        // to use an image pyramid.  So setting this to 1 turns off the image pyramid.  
        scanner.set_max_pyramid_levels(1);

        
        // While the very_simple_feature_extractor doesn't have any parameters, when you go solve
        // real problems you might define a feature extractor which has some non-trivial parameters 
        // that need to be setup before it can be used.  So you need to be able to pass these parameters 
        // to the scanner object somehow.  You can do this using the copy_configuration() function as
        // shown below.
        very_simple_feature_extractor fe;
        /*
            setup the parameters in the fe object.
            ...
        */
        // The scanner will use very_simple_feature_extractor::copy_configuration() to copy the state 
        // of fe into its internal feature extractor.
        scanner.copy_configuration(fe);




        // Now that we have defined the kind of sliding window classifier system we want and stored 
        // the details into the scanner object we are ready to use the structural_object_detection_trainer
        // to learn the weight vector and threshold needed to produce a complete object detector.
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4); // Set this to the number of processing cores on your machine. 


        // The trainer will try and find the detector which minimizes the number of detection mistakes.
        // This function controls how it decides if a detection output is a mistake or not.  The bigger
        // the input to this function the more strict it is in deciding if the detector is correctly
        // hitting the targets.  Try reducing the value to 0.001 and observing the results.  You should
        // see that the detections aren't exactly on top of the white squares anymore.  See the documentation
        // for the structural_object_detection_trainer and structural_svm_object_detection_problem objects
        // for a more detailed discussion of this parameter.  
        trainer.set_match_eps(0.95);


        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        // We can easily test the new detector against our training data.  This print
        // statement will indicate that it has perfect precision and recall on this simple
        // task.  It will also print the average precision (AP).
        cout << "Test detector (precision,recall,AP): " << test_object_detection_function(detector, images, object_locations) << endl;

        // The cross validation should also indicate perfect precision and recall.
        cout << "3-fold cross validation (precision,recall,AP): "
             << cross_validate_object_detection_trainer(trainer, images, object_locations, 3) << endl;


        /*
            It is also worth pointing out that you don't have to use dlib::array2d objects to 
            represent your images.  In fact, you can use any object, even something like a struct
            of many images and other things as the "image".  The only requirements on an image
            are that it should be possible to pass it to scanner.load().  So if you can say 
            scanner.load(images[0]), for example, then you are good to go.  See the documentation 
            for scan_image_pyramid::load() for more details.
        */


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

    }
    catch (exception& e)
    {
        cout << "\nexception thrown!" << endl;
        cout << e.what() << endl;
    }
}

// ----------------------------------------------------------------------------------------


