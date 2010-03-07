/*

    This is an example illustrating the use of the compress_stream and
    cmd_line_parser components from the dlib C++ Library.  

    This example implements a simple command line compression utility.


    The output from the program when the -h option is given is:

        Usage: dclib_example (-c|-d) --in input_file --out output_file
        Options:
        -c                       Indicates that we want to compress a file.
        -d                       Indicates that we want to decompress a file.
        -h                       Display this help message.
        --in <arg>               This option takes one argument which specifies the
                                 name of the file we want to compress/decompress.
        --out <arg>              This option takes one argument which specifies the
                                 name of the output file.

*/




#include "dlib/compress_stream.h"
#include "dlib/cmd_line_parser.h"
#include <iostream>
#include <fstream>
#include <string>

// I am making a typedef for the version of compress_stream I want to use.
// I have selected kernel_1ec.
typedef dlib::compress_stream::kernel_1ec cs;

// Here I am making another typedef, this time for the version of
// cmd_line_parser I want to use.  This version gives me a
// command line parser object that has all the available extensions
// for command line parsers applied to it.  So I will be able to use
// its command line validation utilities as well as option printing.
typedef dlib::cmd_line_parser<char>::check_1a_c clp;


using namespace std;
using namespace dlib;


int main(int argc, char** argv)
{  
    try
    {
        clp parser;
        cs compressor;

        // first I will define the command line options I want.  
        // Add a -c option and tell the parser what the option is for.
        parser.add_option("c","Indicates that we want to compress a file.");
        parser.add_option("d","Indicates that we want to decompress a file.");
        // add a --in option that takes 1 argument
        parser.add_option("in","This option takes one argument which specifies the name of the file we want to compress/decompress.",1);
        // add a --out option that takes 1 argument
        parser.add_option("out","This option takes one argument which specifies the name of the output file.",1);
        parser.add_option("h","Display this help message.");


        // now I will parse the command line
        parser.parse(argc,argv);


        // Now I will use the parser to validate some things about the command line.
        // If any of the following checks fail then an exception will be thrown and it will
        // contain a message that tells the user the problem was.

        // First I want to check that none of the options were given on the command line
        // more than once.  To do this I define an array that contains the options
        // that shouldn't appear more than once and then I just call check_one_time_options()
        const char* one_time_opts[] = {"c", "d", "in", "out", "h"};
        parser.check_one_time_options(one_time_opts);
        // Here I'm checking that the user didn't pick both the c and d options at the
        // same time. 
        parser.check_incompatible_options("c", "d");


        // check if the -h option was given on the command line
        if (parser.option("h"))
        {
            // display all the command line options
            cout << "Usage: dclib_example (-c|-d) --in input_file --out output_file\n";
            // This function prints out a nicely formatted list of
            // all the options the parser has
            parser.print_options(cout); 
                                       
            cout << endl;
            return 0;
        }

        // Make some references to the options inside the parser.  This is just
        // for convenience so we don't have to type out he longer form below.  
        const clp::option_type& option_c = parser.option("c");
        const clp::option_type& option_d = parser.option("d");
        const clp::option_type& option_in = parser.option("in");
        const clp::option_type& option_out = parser.option("out");

        // make sure one of the c or d options was given
        if (!option_c && !option_d)
        {
            cout << "Error in command line:\n   You must specify either the c option or the d option.\n";
            cout << "\nTry the -h option for more information." << endl;
            return 0;
        }


        string in_file;
        string out_file;

        // check if the user told us the input file and if they did then 
        // get the file name
        if (option_in)
        {
            in_file = option_in.argument();
        }
        else
        {
            cout << "Error in command line:\n   You must specify an input file.\n";
            cout << "\nTry the -h option for more information." << endl;
            return 0;
        }


        // check if the user told us the output file and if they did then 
        // get the file name
        if (option_out)
        {
            out_file = option_out.argument();
        }
        else
        {
            cout << "Error in command line:\n   You must specify an output file.\n";
            cout << "\nTry the -h option for more information." << endl;
            return 0;
        }


        // open the files we will be reading from and writing to
        ifstream fin(in_file.c_str(),ios::binary);
        ofstream fout(out_file.c_str(),ios::binary);

        // make sure the files opened correctly
        if (!fin)
        {
            cout << "Error opening file " << in_file << ".\n";
            return 0;
        }

        if (!fout)
        {
            cout << "Error creating file " << out_file << ".\n";
            return 0;
        }



        // now perform the actual compression or decompression.
        if (option_c)
        {
            compressor.compress(fin,fout);
        }
        else
        {
            compressor.decompress(fin,fout);
        }


        

    }
    catch (exception& e)
    {
        // Note that this will catch any cmd_line_parse_error exceptions and print
        // the default message.   
        cout << e.what() << endl;
    }
    catch (...)
    {
        cout << "Some error occurred" << endl;
    }
}





