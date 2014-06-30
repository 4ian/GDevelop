// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example showing how you might use dlib to create a reasonably 
    functional command line tool for object detection.  This example assumes 
    you are familiar with the contents of at least the following example 
    programs:
        - object_detector_ex.cpp
        - compress_stream_ex.cpp




    This program is a command line tool for learning to detect objects in images.  
    Therefore, to create an object detector it requires a set of annotated training 
    images.  To create this annotated data you will need to use the imglab tool 
    included with dlib.  It is located in the tools/imglab folder and can be compiled
    using the following commands.  
        cd tools/imglab
        mkdir build
        cd build
        cmake ..
        cmake --build . --config Release
    Note that you may need to install CMake (www.cmake.org) for this to work.  

    Next, lets assume you have a folder of images called /tmp/images.  These images 
    should contain examples of the objects you want to learn to detect.  You will 
    use the imglab tool to label these objects.  Do this by typing the following
        ./imglab -c mydataset.xml /tmp/images
    This will create a file called mydataset.xml which simply lists the images in 
    /tmp/images.  To annotate them run
        ./imglab mydataset.xml
    A window will appear showing all the images.  You can use the up and down arrow 
    keys to cycle though the images and the mouse to label objects.  In particular, 
    holding the shift key, left clicking, and dragging the mouse will allow you to 
    draw boxes around the objects you wish to detect.  So next, label all the objects 
    with boxes.  Note that it is important to label all the objects since any object 
    not labeled is implicitly assumed to be not an object we should detect.

    Once you finish labeling objects go to the file menu, click save, and then close 
    the program. This will save the object boxes back to mydataset.xml.  You can verify 
    this by opening the tool again with
        ./imglab mydataset.xml
    and observing that the boxes are present.

    Returning to the present example program, we can compile it using cmake just as we 
    did with the imglab tool.  Once compiled, we can issue the command 
        ./train_object_detector -tv mydataset.xml
    which will train an object detection model based on our labeled data.  The model 
    will be saved to the file object_detector.svm.  Once this has finished we can use 
    the object detector to locate objects in new images with a command like
        ./train_object_detector some_image.png
    This command will display some_image.png in a window and any detected objects will
    be indicated by a red box.


    There are a number of other useful command line options in the current example 
    program which you can explore below. 
*/


#include "dlib/svm_threaded.h"
#include "dlib/string.h"
#include "dlib/gui_widgets.h"
#include "dlib/array.h"
#include "dlib/array2d.h"
#include "dlib/image_keypoint.h"
#include "dlib/image_processing.h"
#include "dlib/data_io.h"
#include "dlib/cmd_line_parser.h"


#include <iostream>
#include <fstream>


using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

int main(int argc, char** argv)
{  
    try
    {
        command_line_parser parser;
        parser.add_option("h","Display this help message.");
        parser.add_option("v","Be verbose.");
        parser.add_option("t","Train an object detector and save the detector to disk.");
        parser.add_option("cross-validate",
                          "Perform cross-validation on an image dataset and print the results.");
        parser.add_option("folds","When doing cross-validation, do <arg> folds (default: 3).",1);
        parser.add_option("c","Set the SVM C parameter to <arg> (default: 1.0).",1);
        parser.add_option("threads", "Use <arg> threads for training <arg> (default: 4).",1);
        parser.add_option("grid-size", "Extract features in a detection window from an <arg> by <arg> grid. (default: 2).",1);
        parser.add_option("hash-bits", "Use <arg> bits for the feature hashing (default: 10).", 1);
        parser.add_option("test", "Test a trained detector on an image dataset and print the results.");
        parser.add_option("eps", "Set training epsilon to <arg> (default: 0.3).", 1);


        parser.parse(argc, argv);

        // Now we do a little command line validation.  Each of the following functions
        // checks something and throws an exception if the test fails.
        const char* one_time_opts[] = {"h", "v", "t", "cross-validate", "c", "threads", "grid-size", "hash-bits", 
                                        "folds", "test", "eps"};
        parser.check_one_time_options(one_time_opts); // Can't give an option more than once
        // Make sure the arguments to these options are within valid ranges if they are supplied by the user.
        parser.check_option_arg_range("c", 1e-12, 1e12);
        parser.check_option_arg_range("eps", 1e-5, 1e4);
        parser.check_option_arg_range("threads", 1, 1000);
        parser.check_option_arg_range("grid-size", 1, 100);
        parser.check_option_arg_range("hash-bits", 1, 32);
        parser.check_option_arg_range("folds", 2, 100);
        const char* incompatible[] = {"t", "cross-validate", "test"};
        parser.check_incompatible_options(incompatible);
        // You are only allowed to give these training_sub_ops if you also give either -t or --cross-validate.
        const char* training_ops[] = {"t", "cross-validate"};
        const char* training_sub_ops[] = {"v", "c", "threads", "grid-size", "hash-bits"};
        parser.check_sub_options(training_ops, training_sub_ops); 
        parser.check_sub_option("cross-validate", "folds"); 


        if (parser.option("h"))
        {
            cout << "Usage: train_object_detector [options] <image dataset file|image file>\n";
            parser.print_options(cout); 
                                       
            cout << endl;
            return EXIT_SUCCESS;
        }




        typedef hashed_feature_image<hog_image<4,4,1,9,hog_signed_gradient,hog_full_interpolation> > feature_extractor_type;
        typedef scan_image_pyramid<pyramid_down_3_2, feature_extractor_type> image_scanner_type;

        if (parser.option("t") || parser.option("cross-validate"))
        {
            if (parser.number_of_arguments() != 1)
            {
                cout << "You must give an image dataset metadata XML file produced by the imglab tool." << endl;
                cout << "\nTry the -h option for more information." << endl;
                return EXIT_FAILURE;
            }

            array<array2d<unsigned char> > images;
            std::vector<std::vector<rectangle> > object_locations;

            cout << "Loading image dataset from metadata file " << parser[0] << endl;
            load_image_dataset(images, object_locations, parser[0]);

            cout << "Number of images loaded: " << images.size() << endl;

            // Get the value of the hash-bits option if the user supplied it.  Otherwise
            // use the default value of 10.
            const int hash_bits = get_option(parser, "hash-bits", 10);
            const int grid_size = get_option(parser, "grid-size", 2);
            const int threads = get_option(parser, "threads", 4);
            const double C   = get_option(parser, "c", 1.0);
            const double eps = get_option(parser, "eps", 0.3);
            unsigned int num_folds = get_option(parser, "folds", 3);
            // You can't do more folds than there are images.  
            if (num_folds > images.size())
                num_folds = images.size();


            image_scanner_type scanner;
            setup_grid_detection_templates_verbose(scanner, object_locations, grid_size, grid_size);
            setup_hashed_features(scanner, images, hash_bits);

            structural_object_detection_trainer<image_scanner_type> trainer(scanner);
            trainer.set_num_threads(threads);

            if (parser.option("v"))
                trainer.be_verbose();

            trainer.set_c(C);
            trainer.set_epsilon(eps);

            if (parser.option("t"))
            {
                // Do the actual training and save the results into the detector object.  
                object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

                cout << "Saving trained detector to object_detector.svm" << endl;
                ofstream fout("object_detector.svm", ios::binary);
                serialize(detector, fout);
                fout.close();

                cout << "Testing detector on training data..." << endl;
                cout << "Test detector (precision,recall): " << test_object_detection_function(detector, images, object_locations) << endl;
            }
            else
            {
                // shuffle the order of the training images
                randomize_samples(images, object_locations);

                // The cross validation should also indicate perfect precision and recall.
                cout << num_folds << "-fold cross validation (precision,recall): "
                     << cross_validate_object_detection_trainer(trainer, images, object_locations, num_folds) << endl;
            }

            cout << "Parameters used: " << endl;
            cout << "  hash-bits: "<< hash_bits << endl;
            cout << "  grid-size: "<< grid_size << endl;
            cout << "  threads:   "<< threads << endl;
            cout << "  C:         "<< C << endl;
            cout << "  eps:       "<< eps << endl;
            if (parser.option("cross-validate"))
                cout << "  num_folds: "<< num_folds << endl;
            cout << endl;

            return EXIT_SUCCESS;
        }



        // The rest of the code is devoted to testing out an already trained
        // object detector.


        if (parser.number_of_arguments() == 0)
        {
            cout << "You must give an image or an image dataset metadata XML file produced by the imglab tool." << endl;
            cout << "\nTry the -h option for more information." << endl;
            return EXIT_FAILURE;
        }

        // load a previously trained object detector and try it out on some data
        ifstream fin("object_detector.svm", ios::binary);
        if (!fin)
        {
            cout << "Can't find a trained object detector file object_detector.svm. " << endl;
            cout << "You need to train one using the -t option." << endl;
            cout << "\nTry the -h option for more information." << endl;
            return EXIT_FAILURE;

        }
        object_detector<image_scanner_type> detector;
        deserialize(detector, fin);

        array<array2d<unsigned char> > images;
        // Check if the command line argument is an XML file
        if (tolower(right_substr(parser[0],".")) == "xml")
        {
            std::vector<std::vector<rectangle> > object_locations;
            cout << "Loading image dataset from metadata file " << parser[0] << endl;
            load_image_dataset(images, object_locations, parser[0]);
            cout << "Number of images loaded: " << images.size() << endl;

            if (parser.option("test"))
            {
                cout << "Testing detector on data..." << endl;
                cout << "Results (precision,recall): " << test_object_detection_function(detector, images, object_locations) << endl;
                return EXIT_SUCCESS;
            }
        }
        else
        {
            // In this case, the user should have given some image files.  So just
            // load them.
            images.resize(parser.number_of_arguments());
            for (unsigned long i = 0; i < images.size(); ++i)
                load_image(images[i], parser[i]);
        }


        // Test the detector on the images we loaded and display the results
        // in a window.
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
        cout << "\nTry the -h option for more information." << endl;
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}

// ----------------------------------------------------------------------------------------

