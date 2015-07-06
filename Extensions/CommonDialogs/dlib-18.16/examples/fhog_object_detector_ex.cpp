// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This example program shows how you can use dlib to make an object detector
    for things like faces, pedestrians, and any other semi-rigid object.  In
    particular, we go though the steps to train the kind of sliding window
    object detector first published by Dalal and Triggs in 2005 in the paper
    Histograms of Oriented Gradients for Human Detection.  

    Note that this program executes fastest when compiled with at least SSE2
    instructions enabled.  So if you are using a PC with an Intel or AMD chip
    then you should enable at least SSE2 instructions.  If you are using cmake
    to compile this program you can enable them by using one of the following
    commands when you create the build project:
        cmake path_to_dlib_root/examples -DUSE_SSE2_INSTRUCTIONS=ON
        cmake path_to_dlib_root/examples -DUSE_SSE4_INSTRUCTIONS=ON
        cmake path_to_dlib_root/examples -DUSE_AVX_INSTRUCTIONS=ON
    This will set the appropriate compiler options for GCC, clang, Visual
    Studio, or the Intel compiler.  If you are using another compiler then you
    need to consult your compiler's manual to determine how to enable these
    instructions.  Note that AVX is the fastest but requires a CPU from at least
    2011.  SSE4 is the next fastest and is supported by most current machines.  

*/


#include <dlib/svm_threaded.h>
#include <dlib/gui_widgets.h>
#include <dlib/image_processing.h>
#include <dlib/data_io.h>

#include <iostream>
#include <fstream>


using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

int main(int argc, char** argv)
{  

    try
    {
        // In this example we are going to train a face detector based on the
        // small faces dataset in the examples/faces directory.  So the first
        // thing we do is load that dataset.  This means you need to supply the
        // path to this faces folder as a command line argument so we will know
        // where it is.
        if (argc != 2)
        {
            cout << "Give the path to the examples/faces directory as the argument to this" << endl;
            cout << "program.  For example, if you are in the examples folder then execute " << endl;
            cout << "this program by running: " << endl;
            cout << "   ./fhog_object_detector_ex faces" << endl;
            cout << endl;
            return 0;
        }
        const std::string faces_directory = argv[1];
        // The faces directory contains a training dataset and a separate
        // testing dataset.  The training data consists of 4 images, each
        // annotated with rectangles that bound each human face.  The idea is 
        // to use this training data to learn to identify human faces in new
        // images.  
        // 
        // Once you have trained an object detector it is always important to
        // test it on data it wasn't trained on.  Therefore, we will also load
        // a separate testing set of 5 images.  Once we have a face detector
        // created from the training data we will see how well it works by
        // running it on the testing images. 
        // 
        // So here we create the variables that will hold our dataset.
        // images_train will hold the 4 training images and face_boxes_train
        // holds the locations of the faces in the training images.  So for
        // example, the image images_train[0] has the faces given by the
        // rectangles in face_boxes_train[0].
        dlib::array<array2d<unsigned char> > images_train, images_test;
        std::vector<std::vector<rectangle> > face_boxes_train, face_boxes_test;

        // Now we load the data.  These XML files list the images in each
        // dataset and also contain the positions of the face boxes.  Obviously
        // you can use any kind of input format you like so long as you store
        // the data into images_train and face_boxes_train.  But for convenience
        // dlib comes with tools for creating and loading XML image dataset
        // files.  Here you see how to load the data.  To create the XML files
        // you can use the imglab tool which can be found in the tools/imglab
        // folder.  It is a simple graphical tool for labeling objects in images
        // with boxes.  To see how to use it read the tools/imglab/README.txt
        // file.
        load_image_dataset(images_train, face_boxes_train, faces_directory+"/training.xml");
        load_image_dataset(images_test, face_boxes_test, faces_directory+"/testing.xml");

        // Now we do a little bit of pre-processing.  This is optional but for
        // this training data it improves the results.  The first thing we do is
        // increase the size of the images by a factor of two.  We do this
        // because it will allow us to detect smaller faces than otherwise would
        // be practical (since the faces are all now twice as big).  Note that,
        // in addition to resizing the images, these functions also make the
        // appropriate adjustments to the face boxes so that they still fall on
        // top of the faces after the images are resized.
        upsample_image_dataset<pyramid_down<2> >(images_train, face_boxes_train);
        upsample_image_dataset<pyramid_down<2> >(images_test,  face_boxes_test);
        // Since human faces are generally left-right symmetric we can increase
        // our training dataset by adding mirrored versions of each image back
        // into images_train.  So this next step doubles the size of our
        // training dataset.  Again, this is obviously optional but is useful in
        // many object detection tasks.
        add_image_left_right_flips(images_train, face_boxes_train);
        cout << "num training images: " << images_train.size() << endl;
        cout << "num testing images:  " << images_test.size() << endl;


        // Finally we get to the training code.  dlib contains a number of
        // object detectors.  This typedef tells it that you want to use the one
        // based on Felzenszwalb's version of the Histogram of Oriented
        // Gradients (commonly called HOG) detector.  The 6 means that you want
        // it to use an image pyramid that downsamples the image at a ratio of
        // 5/6.  Recall that HOG detectors work by creating an image pyramid and
        // then running the detector over each pyramid level in a sliding window
        // fashion.   
        typedef scan_fhog_pyramid<pyramid_down<6> > image_scanner_type; 
        image_scanner_type scanner;
        // The sliding window detector will be 80 pixels wide and 80 pixels tall.
        scanner.set_detection_window_size(80, 80); 
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        // Set this to the number of processing cores on your machine.
        trainer.set_num_threads(4);  
        // The trainer is a kind of support vector machine and therefore has the usual SVM
        // C parameter.  In general, a bigger C encourages it to fit the training data
        // better but might lead to overfitting.  You must find the best C value
        // empirically by checking how well the trained detector works on a test set of
        // images you haven't trained on.  Don't just leave the value set at 1.  Try a few
        // different C values and see what works best for your data.
        trainer.set_c(1);
        // We can tell the trainer to print it's progress to the console if we want.  
        trainer.be_verbose();
        // The trainer will run until the "risk gap" is less than 0.01.  Smaller values
        // make the trainer solve the SVM optimization problem more accurately but will
        // take longer to train.  For most problems a value in the range of 0.1 to 0.01 is
        // plenty accurate.  Also, when in verbose mode the risk gap is printed on each
        // iteration so you can see how close it is to finishing the training.  
        trainer.set_epsilon(0.01);


        // Now we run the trainer.  For this example, it should take on the order of 10
        // seconds to train.
        object_detector<image_scanner_type> detector = trainer.train(images_train, face_boxes_train);

        // Now that we have a face detector we can test it.  The first statement tests it
        // on the training data.  It will print the precision, recall, and then average precision.
        cout << "training results: " << test_object_detection_function(detector, images_train, face_boxes_train) << endl;
        // However, to get an idea if it really worked without overfitting we need to run
        // it on images it wasn't trained on.  The next line does this.  Happily, we see
        // that the object detector works perfectly on the testing images.
        cout << "testing results:  " << test_object_detection_function(detector, images_test, face_boxes_test) << endl;


        // If you have read any papers that use HOG you have probably seen the nice looking
        // "sticks" visualization of a learned HOG detector.  This next line creates a
        // window with such a visualization of our detector.  It should look somewhat like
        // a face.
        image_window hogwin(draw_fhog(detector), "Learned fHOG detector");

        // Now for the really fun part.  Let's display the testing images on the screen and
        // show the output of the face detector overlaid on each image.  You will see that
        // it finds all the faces without false alarming on any non-faces.
        image_window win; 
        for (unsigned long i = 0; i < images_test.size(); ++i)
        {
            // Run the detector and get the face detections.
            std::vector<rectangle> dets = detector(images_test[i]);
            win.clear_overlay();
            win.set_image(images_test[i]);
            win.add_overlay(dets, rgb_pixel(255,0,0));
            cout << "Hit enter to process the next image..." << endl;
            cin.get();
        }


        // Like everything in dlib, you can save your detector to disk using the
        // serialize() function.
        serialize("face_detector.svm") << detector;

        // Then you can recall it using the deserialize() function.
        object_detector<image_scanner_type> detector2;
        deserialize("face_detector.svm") >> detector2;




        // Now let's talk about some optional features of this training tool as well as some
        // important points you should understand.
        //
        // The first thing that should be pointed out is that, since this is a sliding
        // window classifier, it can't output an arbitrary rectangle as a detection.  In
        // this example our sliding window is 80 by 80 pixels and is run over an image
        // pyramid.  This means that it can only output detections that are at least 80 by
        // 80 pixels in size (recall that this is why we upsampled the images after loading
        // them).  It also means that the aspect ratio of the outputs is 1.  So if,
        // for example, you had a box in your training data that was 200 pixels by 10
        // pixels then it would simply be impossible for the detector to learn to detect
        // it.  Similarly, if you had a really small box it would be unable to learn to
        // detect it.  
        //
        // So the training code performs an input validation check on the training data and
        // will throw an exception if it detects any boxes that are impossible to detect
        // given your setting of scanning window size and image pyramid resolution.  You
        // can use a statement like:
        //   remove_unobtainable_rectangles(trainer, images_train, face_boxes_train)
        // to automatically discard these impossible boxes from your training dataset
        // before running the trainer.  This will avoid getting the "impossible box"
        // exception.  However, I would recommend you be careful that you are not throwing
        // away truth boxes you really care about.  The remove_unobtainable_rectangles()
        // will return the set of removed rectangles so you can visually inspect them and
        // make sure you are OK that they are being removed. 
        // 
        // Next, note that any location in the images not marked with a truth box is
        // implicitly treated as a negative example.  This means that when creating
        // training data it is critical that you label all the objects you want to detect.
        // So for example, if you are making a face detector then you must mark all the
        // faces in each image.  However, sometimes there are objects in images you are
        // unsure about or simply don't care if the detector identifies or not.  For these
        // objects you can pass in a set of "ignore boxes" as a third argument to the
        // trainer.train() function.  The trainer will simply disregard any detections that
        // happen to hit these boxes.  
        //
        // Another useful thing you can do is evaluate multiple HOG detectors together. The
        // benefit of this is increased testing speed since it avoids recomputing the HOG
        // features for each run of the detector.  You do this by storing your detectors
        // into a std::vector and then invoking evaluate_detectors() like so:
        std::vector<object_detector<image_scanner_type> > my_detectors;
        my_detectors.push_back(detector);
        std::vector<rectangle> dets = evaluate_detectors(my_detectors, images_train[0]); 
        //
        //
        // Finally, you can add a nuclear norm regularizer to the SVM trainer.  Doing has
        // two benefits.  First, it can cause the learned HOG detector to be composed of
        // separable filters and therefore makes it execute faster when detecting objects.
        // It can also help with generalization since it tends to make the learned HOG
        // filters smoother.  To enable this option you call the following function before
        // you create the trainer object:
        //    scanner.set_nuclear_norm_regularization_strength(1.0);
        // The argument determines how important it is to have a small nuclear norm.  A
        // bigger regularization strength means it is more important.  The smaller the
        // nuclear norm the smoother and faster the learned HOG filters will be, but if the
        // regularization strength value is too large then the SVM will not fit the data
        // well.  This is analogous to giving a C value that is too small.
        //
        // You can see how many separable filters are inside your detector like so:
        cout << "num filters: "<< num_separable_filters(detector) << endl;
        // You can also control how many filters there are by explicitly thresholding the
        // singular values of the filters like this:
        detector = threshold_filter_singular_values(detector,0.1);
        // That removes filter components with singular values less than 0.1.  The bigger
        // this number the fewer separable filters you will have and the faster the
        // detector will run.  However, a large enough threshold will hurt detection
        // accuracy.  

    }
    catch (exception& e)
    {
        cout << "\nexception thrown!" << endl;
        cout << e.what() << endl;
    }
}

// ----------------------------------------------------------------------------------------

