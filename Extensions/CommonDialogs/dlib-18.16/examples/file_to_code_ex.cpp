// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the compress_stream and
    base64 components from the dlib C++ Library.

    It reads in a file from the disk and compresses it in an in memory buffer and
    then converts that buffer into base64 text.  The final step is to output to
    the screen some C++ code that contains this base64 encoded text and can decompress
    it back into its original form.
*/


#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <cstdlib>
#include <dlib/compress_stream.h>
#include <dlib/base64.h>


using namespace std;
using namespace dlib;

int main(int argc, char** argv)
{
    if (argc != 2)
    {
        cout << "You must give a file name as the argument to this program.\n" << endl;
        cout << "This program reads in a file from the disk and compresses\n"
             << "it in an in memory buffer and then converts that buffer \n"
             << "into base64 text.  The final step is to output to the screen\n"
             << "some C++ code that contains this base64 encoded text and can\n"
             << "decompress it back into its original form.\n" << endl;

        return EXIT_FAILURE;
    }

    // open the file the user specified on the command line
    ifstream fin(argv[1], ios::binary);
    if (!fin) {
        cout << "can't open file " << argv[1] << endl;
        return EXIT_FAILURE;
    }

    ostringstream sout;
    istringstream sin;

    // this is the object we will use to do the base64 encoding
    base64 base64_coder;
    // this is the object we will use to do the data compression
    compress_stream::kernel_1ea compressor;

    // compress the contents of the file and store the results in the string stream sout
    compressor.compress(fin,sout);
    sin.str(sout.str());
    sout.clear();
    sout.str("");

    // now base64 encode the compressed data
    base64_coder.encode(sin,sout);

    sin.clear();
    sin.str(sout.str());
    sout.str("");

    // the following is a little funny looking but all it does is output some C++ code
    // that contains the compressed/base64 data and the C++ code that can decode it back
    // into its original form.
    sout << "#include <sstream>\n";
    sout << "#include <dlib/compress_stream.h>\n";
    sout << "#include <dlib/base64.h>\n";
    sout << "\n";
    sout << "// This function returns the contents of the file '" << argv[1] << "'\n";
    sout << "const std::string get_decoded_string()\n";
    sout << "{\n";
    sout << "    dlib::base64 base64_coder;\n";
    sout << "    dlib::compress_stream::kernel_1ea compressor;\n";
    sout << "    std::ostringstream sout;\n";
    sout << "    std::istringstream sin;\n\n";


    sout << "    // The base64 encoded data from the file '" << argv[1] << "' we want to decode and return.\n";
    string temp;
    getline(sin,temp);
    while (sin && temp.size() > 0)
    {
        sout << "    sout << \"" << temp << "\";\n";
        getline(sin,temp);
    }

    sout << "\n";
    sout << "    // Put the data into the istream sin\n";
    sout << "    sin.str(sout.str());\n";
    sout << "    sout.str(\"\");\n\n";
    sout << "    // Decode the base64 text into its compressed binary form\n";
    sout << "    base64_coder.decode(sin,sout);\n";
    sout << "    sin.clear();\n";
    sout << "    sin.str(sout.str());\n";
    sout << "    sout.str(\"\");\n\n";
    sout << "    // Decompress the data into its original form\n";
    sout << "    compressor.decompress(sin,sout);\n\n";
    sout << "    // Return the decoded and decompressed data\n";
    sout << "    return sout.str();\n";
    sout << "}\n";


    // finally output our encoded data and its C++ code to the screen
    cout << sout.str() << endl;
}

