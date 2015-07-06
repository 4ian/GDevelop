// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the compress_stream and
    cmd_line_parser components from the dlib C++ Library.  

    This example implements a simple command line compression utility.


    The output from the program when the -h option is given is:

        Usage: compress_stream_ex (-c|-d|-l) --in input_file --out output_file
        Options:
          -c            Indicates that we want to compress a file. 
          -d            Indicates that we want to decompress a file. 
          --in <arg>    This option takes one argument which specifies the name of the 
                        file we want to compress/decompress. 
          --out <arg>   This option takes one argument which specifies the name of the 
                        output file. 

        Miscellaneous Options:
          -h            Display this help message. 
          -l <arg>      Set the compression level [1-3], 3 is max compression, default 
                        is 2. 

*/




#include <dlib/compress_stream.h>
#include <dlib/cmd_line_parser.h>
#include <iostream>
#include <fstream>
#include <string>

// I am making a typedefs for the versions of compress_stream I want to use.  
typedef dlib::compress_stream::kernel_1da cs1;
typedef dlib::compress_stream::kernel_1ea cs2;
typedef dlib::compress_stream::kernel_1ec cs3;


using namespace std;
using namespace dlib;


int main(int argc, char** argv)
{  
    try
    {
        command_line_parser parser;

        // first I will define the command line options I want.  
        // Add a -c option and tell the parser what the option is for.
        parser.add_option("c","Indicates that we want to compress a file.");
        parser.add_option("d","Indicates that we want to decompress a file.");
        // add a --in option that takes 1 argument
        parser.add_option("in","This option takes one argument which specifies the name of the file we want to compress/decompress.",1);
        // add a --out option that takes 1 argument
        parser.add_option("out","This option takes one argument which specifies the name of the output file.",1);
        // In the code below, we use the parser.print_options() method to print all our
        // options to the screen.  We can tell it that we would like some options to be
        // grouped together by calling set_group_name() before adding those options.  In
        // general, you can make as many groups as you like by calling set_group_name().
        // However, here we make only one named group.
        parser.set_group_name("Miscellaneous Options");
        parser.add_option("h","Display this help message.");
        parser.add_option("l","Set the compression level [1-3], 3 is max compression, default is 2.",1);


        // now I will parse the command line
        parser.parse(argc,argv);


        // Now I will use the parser to validate some things about the command line.
        // If any of the following checks fail then an exception will be thrown and it will
        // contain a message that tells the user what the problem was.

        // First I want to check that none of the options were given on the command line
        // more than once.  To do this I define an array that contains the options
        // that shouldn't appear more than once and then I just call check_one_time_options()
        const char* one_time_opts[] = {"c", "d", "in", "out", "h", "l"};
        parser.check_one_time_options(one_time_opts);
        // Here I'm checking that the user didn't pick both the c and d options at the
        // same time. 
        parser.check_incompatible_options("c", "d");

        // Here I'm checking that the argument to the l option is an integer in the range 1 to 3.  
        // That is, it should be convertible to an int by dlib::string_assign and be either 
        // 1, 2, or 3.  Note that if you wanted to allow floating point values in the range 1 to 
        // 3 then you could give a range 1.0 to 3.0 or explicitly supply a type of float or double 
        // to the template argument of the check_option_arg_range() function.
        parser.check_option_arg_range("l", 1, 3);

        // The 'l' option is a sub-option of the 'c' option. That is, you can only select the
        // compression level when compressing.  This command below checks that the listed
        // sub options are always given in the presence of their parent options.
        const char* c_sub_opts[] = {"l"};
        parser.check_sub_options("c", c_sub_opts);

        // check if the -h option was given on the command line
        if (parser.option("h"))
        {
            // display all the command line options
            cout << "Usage: compress_stream_ex (-c|-d|-l) --in input_file --out output_file\n";
            // This function prints out a nicely formatted list of
            // all the options the parser has
            parser.print_options(); 
            return 0;
        }

        // Figure out what the compression level should be.  If the user didn't supply
        // this command line option then a value of 2 will be used. 
        int compression_level = get_option(parser,"l",2);


        // make sure one of the c or d options was given
        if (!parser.option("c") && !parser.option("d"))
        {
            cout << "Error in command line:\n   You must specify either the c option or the d option.\n";
            cout << "\nTry the -h option for more information." << endl;
            return 0;
        }


        string in_file;
        string out_file;

        // check if the user told us the input file and if they did then 
        // get the file name
        if (parser.option("in"))
        {
            in_file = parser.option("in").argument();
        }
        else
        {
            cout << "Error in command line:\n   You must specify an input file.\n";
            cout << "\nTry the -h option for more information." << endl;
            return 0;
        }


        // check if the user told us the output file and if they did then 
        // get the file name
        if (parser.option("out"))
        {
            out_file = parser.option("out").argument();
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
        if (parser.option("c"))
        {
            // save the compression level to the output file
            serialize(compression_level, fout);

            switch (compression_level)
            {
                case 1:
                    {
                        cs1 compressor;
                        compressor.compress(fin,fout);
                    }break;
                case 2:
                    {
                        cs2 compressor;
                        compressor.compress(fin,fout);
                    }break;
                case 3:
                    {
                        cs3 compressor;
                        compressor.compress(fin,fout);
                    }break;
            }
        }
        else
        {
            // obtain the compression level from the input file
            deserialize(compression_level, fin);

            switch (compression_level)
            {
                case 1:
                    {
                        cs1 compressor;
                        compressor.decompress(fin,fout);
                    }break;
                case 2:
                    {
                        cs2 compressor;
                        compressor.decompress(fin,fout);
                    }break;
                case 3:
                    {
                        cs3 compressor;
                        compressor.decompress(fin,fout);
                    }break;
                default:
                    {
                        cout << "Error in compressed file, invalid compression level" << endl;
                    }break;
            }
        }


        

    }
    catch (exception& e)
    {
        // Note that this will catch any cmd_line_parse_error exceptions and print
        // the default message.   
        cout << e.what() << endl;
    }
}





