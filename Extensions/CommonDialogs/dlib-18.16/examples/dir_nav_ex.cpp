// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the dir_nav component from the dlib C++ Library.
    It prints a listing of all directories and files in the users
    current working directory or the directory specified on the command line.  

*/


#include <iostream>
#include <iomanip>
#include <dlib/dir_nav.h>
#include <vector>
#include <algorithm>

using namespace std;
using namespace dlib;


int main(int argc, char** argv)
{
    try
    {
        string loc;
        if (argc == 2)
            loc = argv[1];
        else
            loc = ".";  // if no argument is given then use the current working dir.
  
        directory test(loc);


        cout << "directory: " << test.name() << endl;
        cout << "full path: " << test.full_name() << endl;        
        cout << "is root:   " << ((test.is_root())?"yes":"no") << endl;
        
        // get all directories and files in test
        std::vector<directory> dirs = test.get_dirs();
        std::vector<file> files = test.get_files();

        // sort the files and directories
        sort(files.begin(), files.end());
        sort(dirs.begin(), dirs.end());

        cout << "\n\n\n";

        // print all the subdirectories
        for (unsigned long i = 0; i < dirs.size(); ++i)
            cout << "        <DIR>    " << dirs[i].name() << "\n";

        // print all the subfiles
        for (unsigned long i = 0; i < files.size(); ++i)
            cout << setw(13) << files[i].size() << "    " << files[i].name() << "\n";


        cout << "\n\nnumber of dirs:  " << dirs.size() << endl;
        cout << "number of files: " << files.size() << endl;

    }
    catch (file::file_not_found& e)
    {
        cout << "file not found or accessible: " << e.info << endl;
    }
    catch (directory::dir_not_found& e)
    {
        cout << "dir not found or accessible: " << e.info << endl;
    }
    catch (directory::listing_error& e)
    {
        cout << "listing error: " << e.info << endl;
    }
}


