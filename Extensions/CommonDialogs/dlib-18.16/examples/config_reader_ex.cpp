// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the config_reader component  
    from the dlib C++ Library.

    This example uses the config_reader to load a config file and then
    prints out the values of various fields in the file.
*/


#include <dlib/config_reader.h>
#include <iostream>
#include <fstream>
#include <vector>


using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------
// For reference, the contents of the config file used in this example is reproduced below:  
/*

# This is an example config file.  Note that # is used to create a comment.

# At its most basic level a config file is just a bunch of key/value pairs.
# So for example:
key1 = value2
dlib = a C++ library

# You can also define "sub blocks" in your config files like so
user1 
{ 
    # Inside a sub block you can list more key/value pairs.  
    id = 42
    name = davis

    # you can also nest sub-blocks as deep as you want
    details 
    { 
        editor = vim
        home_dir = /home/davis
    }
}
user2 { 
    id = 1234
    name = joe
    details { 
        editor = emacs
        home_dir = /home/joe
    }
}

*/
// ----------------------------------------------------------------------------------------

void print_config_reader_contents (
    const config_reader& cr,
    int depth = 0
);
/*
    This is a simple function that recursively walks through everything in 
    a config reader and prints it to the screen.
*/

// ----------------------------------------------------------------------------------------

int main()
{
    try
    {
        config_reader cr("config.txt");

        // Use our recursive function to print everything in the config file.
        print_config_reader_contents(cr);

        // Now let's access some of the fields of the config file directly.  You 
        // use [] for accessing key values and .block() for accessing sub-blocks.

        // Print out the string value assigned to key1 in the config file
        cout << cr["key1"] << endl;

        // Print out the name field inside the user1 sub-block
        cout << cr.block("user1")["name"] << endl;
        // Now print out the editor field in the details block
        cout << cr.block("user1").block("details")["editor"] << endl;

        
        // Note that you can use get_option() to easily convert fields into 
        // non-string types.  For example, the config file has an integer id 
        // field that can be converted into an int like so:
        int id1 = get_option(cr,"user1.id",0); 
        int id2 = get_option(cr,"user2.id",0); 
        cout << "user1's id is " << id1 << endl;
        cout << "user2's id is " << id2 << endl;
        // The third argument to get_option() is the default value returned if 
        // the config reader doesn't contain a corresponding entry.  So for 
        // example, the following prints 321 since there is no user3.
        int id3 = get_option(cr,"user3.id",321); 
        cout << "user3's id is " << id3 << endl;

    }
    catch (exception& e)
    {
        // Finally, note that the config_reader throws exceptions if the config
        // file is corrupted or if you ask it for a key or block that doesn't exist. 
        // Here we print out any such error messages.
        cout << e.what() << endl;
    }
}

// ----------------------------------------------------------------------------------------

void print_config_reader_contents (
    const config_reader& cr,
    int depth 
)
{
    // Make a string with depth*4 spaces in it.  
    const string padding(depth*4, ' ');

    // We can obtain a list of all the keys and sub-blocks defined
    // at the current level in the config reader like so:
    vector<string> keys, blocks;
    cr.get_keys(keys);
    cr.get_blocks(blocks);

    // Now print all the key/value pairs
    for (unsigned long i = 0; i < keys.size(); ++i)
        cout << padding << keys[i] << " = " << cr[keys[i]] << endl;

    // Now print all the sub-blocks. 
    for (unsigned long i = 0; i < blocks.size(); ++i)
    {
        // First print the block name
        cout << padding << blocks[i] << " { " << endl;
        // Now recursively print the contents of the sub block.  Note that the cr.block()
        // function returns another config_reader that represents the sub-block.  
        print_config_reader_contents(cr.block(blocks[i]), depth+1);
        cout << padding << "}" << endl;
    }
}

// ----------------------------------------------------------------------------------------

