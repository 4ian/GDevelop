// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the extract_fhog_features() routine from
    the dlib C++ Library.

    
    The extract_fhog_features() routine performs the style of HOG feature extraction
    described in the paper:
        Object Detection with Discriminatively Trained Part Based Models by
        P. Felzenszwalb, R. Girshick, D. McAllester, D. Ramanan
        IEEE Transactions on Pattern Analysis and Machine Intelligence, Vol. 32, No. 9, Sep. 2010
    This means that it takes an input image and outputs Felzenszwalb's
    31 dimensional version of HOG features.  We show its use below.
*/



#include <dlib/gui_widgets.h>
#include <dlib/image_io.h>
#include <dlib/image_transforms.h>


using namespace std;
using namespace dlib;

//  ----------------------------------------------------------------------------

int main(int argc, char** argv)
{
    try
    {
        // Make sure the user entered an argument to this program.  It should be the
        // filename for an image.
        if (argc != 2)
        {
            cout << "error, you have to enter a BMP file as an argument to this program" << endl;
            return 1;
        }

        // Here we declare an image object that can store color rgb_pixels.    
        array2d<rgb_pixel> img;

        // Now load the image file into our image.  If something is wrong then
        // load_image() will throw an exception.  Also, if you linked with libpng
        // and libjpeg then load_image() can load PNG and JPEG files in addition
        // to BMP files.
        load_image(img, argv[1]);


        // Now convert the image into a FHOG feature image.  The output, hog, is a 2D array
        // of 31 dimensional vectors.
        array2d<matrix<float,31,1> > hog;
        extract_fhog_features(img, hog);

        cout << "hog image has " << hog.nr() << " rows and " << hog.nc() << " columns." << endl;

        // Let's see what the image and FHOG features look like.
        image_window win(img);
        image_window winhog(draw_fhog(hog));

        // Another thing you might want to do is map between the pixels in img and the
        // cells in the hog image.  dlib provides the image_to_fhog() and fhog_to_image()
        // routines for this.  Their use is demonstrated in the following loop which
        // responds to the user clicking on pixels in the image img.
        point p;  // A 2D point, used to represent pixel locations.
        while (win.get_next_double_click(p))
        {
            point hp = image_to_fhog(p);
            cout << "The point " << p << " in the input image corresponds to " << hp << " in hog space." << endl;
            cout << "FHOG features at this point: " << trans(hog[hp.y()][hp.x()]) << endl;
        }

        // Finally, sometimes you want to get a planar representation of the HOG features
        // rather than the explicit vector (i.e. interlaced) representation used above.  
        dlib::array<array2d<float> > planar_hog;
        extract_fhog_features(img, planar_hog);
        // Now we have an array of 31 float valued image planes, each representing one of
        // the dimensions of the HOG feature vector.  
    }
    catch (exception& e)
    {
        cout << "exception thrown: " << e.what() << endl;
    }
}

//  ----------------------------------------------------------------------------

