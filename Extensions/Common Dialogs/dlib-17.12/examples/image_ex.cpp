/*

    This is an example illustrating the use of the GUI API as well as some 
    aspects of image manipulation from the dlib C++ Library.


    This is a pretty simple example.  It takes a BMP file on the command line
    and opens it up, runs a simple edge detection algorithm on it, and 
    displays the results on the screen.  
*/



#include "dlib/gui_widgets.h"
#include "dlib/image_io.h"
#include "dlib/image_transforms.h"
#include <fstream>


using namespace std;
using namespace dlib;

//  ----------------------------------------------------------------------------

class win : public drawable_window 
{
    /*
        Here we are making a GUI window that will be capable of displaying
        an image.
    */
public:

    template <typename image_type>
    win(
        const image_type& img
    ) :
        gui_img(*this)
    {
        // set the size of this window to match the size of the input image
        set_size(img.nc(),img.nr());

        // Now load the image into the image widget so it has something to display.
        gui_img.set_image(img);

        set_title("image example");

        // show this window on the screen
        show();
    } 

    ~win(
    )
    {
        // You should always call close_window() in the destructor of window
        // objects to ensure that no events will be sent to this window while 
        // it is being destructed.  
        close_window();
    }

private:

    image_widget gui_img;
};

//  ----------------------------------------------------------------------------

int main(int argc, char** argv)
{
    try
    {
        // make sure the user entered an argument to this program
        if (argc != 2)
        {
            cout << "error, you have to enter a BMP file as an argument to this program" << endl;
            return 1;
        }

        // Here we open the image file.  Note that when you open a binary file with 
        // the C++ ifstream you must supply the ios::binary flag.
        ifstream fin(argv[1],ios::binary);
        if (!fin)
        {
            cout << "error, can't find " << argv[1] << endl;
            return 1;
        }

        // Here we declare an image object that can store rgb_pixels.  Note that in 
        // dlib there is no explicit image object, just a 2D array and
        // various pixel types.  
        array2d<rgb_pixel>::kernel_1a img;

        // now load the bmp file into our image.  If the file isn't really a BMP
        // or is corrupted then load_bmp() will throw an exception.
        load_bmp(img, fin);

        // Now lets use some image functions.  This example is going to perform
        // simple edge detection on the image.  First lets find the horizontal and
        // vertical gradient images.
        array2d<short>::kernel_1a horz_gradient, vert_gradient;
        array2d<unsigned char>::kernel_1a edge_image;
        sobel_edge_detector(img,horz_gradient, vert_gradient);

        // now we do the non-maximum edge suppression step so that our edges are nice and thin
        suppress_non_maximum_edges(horz_gradient, vert_gradient, edge_image); 

        // Now we would like to see what our images look like.  So lets use our 
        // window to display them on the screen.


        // create a window to display the edge image 
        win my_window(edge_image);

        // also make a window to display the original image
        win my_window2(img);

        // wait until the user closes both windows before we let the program 
        // terminate.
        my_window.wait_until_closed();
        my_window2.wait_until_closed();
    }
    catch (exception& e)
    {
        cout << "exception thrown: " << e.what() << endl;
    }
}

//  ----------------------------------------------------------------------------

