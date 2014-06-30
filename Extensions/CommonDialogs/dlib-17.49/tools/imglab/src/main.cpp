
#include "dlib/data_io.h"
#include "dlib/string.h"
#include "metadata_editor.h"
#include "convert_pascal_xml.h"
#include "convert_pascal_v1.h"
#include "convert_idl.h"

#include <iostream>
#include <fstream>
#include <string>
#include <set>

#include <dlib/dir_nav.h>


const char* VERSION = "0.4";



using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

void create_new_dataset (
    const parser_type& parser
)
{
    using namespace dlib::image_dataset_metadata;

    const std::string filename = parser.option("c").argument();
    // make sure the file exists so we can use the get_parent_directory() command to
    // figure out it's parent directory.
    make_empty_file(filename);
    const std::string parent_dir = get_parent_directory(file(filename)).full_name();

    unsigned long depth = 0;
    if (parser.option("r"))
        depth = 30;

    dataset meta;
    meta.name = "imglab dataset";
    meta.comment = "Created by imglab tool.";
    for (unsigned long i = 0; i < parser.number_of_arguments(); ++i)
    {
        try
        {
            const string temp = strip_path(file(parser[i]).full_name(), parent_dir);
            meta.images.push_back(image(temp));
        }
        catch (dlib::file::file_not_found&)
        {
            // then parser[i] should be a directory

            std::vector<file> files = get_files_in_directory_tree(parser[i], 
                                                                  match_endings(".png .PNG .jpeg .JPEG .jpg .JPG .bmp .BMP .dng .DNG"),
                                                                  depth);
            sort(files.begin(), files.end());

            for (unsigned long j = 0; j < files.size(); ++j)
            {
                meta.images.push_back(image(strip_path(files[j].full_name(), parent_dir)));
            }
        }
    }

    save_image_dataset_metadata(meta, filename);
}

// ----------------------------------------------------------------------------------------

void print_all_labels (
    const dlib::image_dataset_metadata::dataset& data
)
{
    std::set<std::string> labels;
    for (unsigned long i = 0; i < data.images.size(); ++i)
    {
        for (unsigned long j = 0; j < data.images[i].boxes.size(); ++j)
        {
            labels.insert(data.images[i].boxes[j].label);
        }
    }

    for (std::set<std::string>::iterator i = labels.begin(); i != labels.end(); ++i)
    {
        if (i->size() != 0)
        {
            cout << *i << endl;
        }
    }
}

// ----------------------------------------------------------------------------------------

void rename_labels (
    dlib::image_dataset_metadata::dataset& data,
    const std::string& from,
    const std::string& to
)
{
    for (unsigned long i = 0; i < data.images.size(); ++i)
    {
        for (unsigned long j = 0; j < data.images[i].boxes.size(); ++j)
        {
            if (data.images[i].boxes[j].label == from)
                data.images[i].boxes[j].label = to;
        }
    }

}

// ----------------------------------------------------------------------------------------

int main(int argc, char** argv)
{
    try
    {

        parser_type parser;

        parser.add_option("h","Displays this information.");
        parser.add_option("c","Create an XML file named <arg> listing a set of images.",1);
        parser.add_option("r","Search directories recursively for images.");
        parser.add_option("l","List all the labels in the given XML file.");
        parser.add_option("rename", "Rename all labels of <arg1> to <arg2>.",2);
        parser.add_option("v","Display version.");
        parser.add_option("parts","The display will allow image parts to be labeled.  The set of allowable parts "
                          "defined in a space separated list contained in <arg>.",1);
        parser.add_option("convert","Convert foreign image Annotations from <arg> format to the imglab format. "
                          "Supported formats: pascal-xml, pascal-v1, idl.",1);

        parser.parse(argc, argv);

        const char* singles[] = {"h","c","r","l","convert","parts"};
        parser.check_one_time_options(singles);
        const char* c_sub_ops[] = {"r", "convert"};
        parser.check_sub_options("c", c_sub_ops);
        parser.check_incompatible_options("c", "l");
        parser.check_incompatible_options("c", "rename");
        parser.check_incompatible_options("c", "parts");
        parser.check_incompatible_options("l", "rename");
        parser.check_incompatible_options("l", "parts");
        parser.check_incompatible_options("convert", "l");
        parser.check_incompatible_options("convert", "rename");
        parser.check_incompatible_options("convert", "parts");
        const char* convert_args[] = {"pascal-xml","pascal-v1","idl"};
        parser.check_option_arg_range("convert", convert_args);

        if (parser.option("h"))
        {
            cout << "Usage: imglab [options] <image files/directories or XML file>\n";
            parser.print_options(cout);
            cout << endl << endl;
            return EXIT_SUCCESS;
        }

        if (parser.option("v"))
        {
            cout << "imglab v" << VERSION 
                 << "\nCompiled: " << __TIME__ << " " << __DATE__ 
                 << "\nWritten by Davis King\n";
            cout << "Check for updates at http://dlib.net\n\n";
            return EXIT_SUCCESS;
        }

        if (parser.option("c"))
        {
            if (parser.option("convert"))
            {
                if (parser.option("convert").argument() == "pascal-xml")
                    convert_pascal_xml(parser);
                else if (parser.option("convert").argument() == "pascal-v1")
                    convert_pascal_v1(parser);
                else if (parser.option("convert").argument() == "idl")
                    convert_idl(parser);
            }
            else
            {
                create_new_dataset(parser);
            }
            return EXIT_SUCCESS;
        }

        if (parser.option("l"))
        {
            if (parser.number_of_arguments() != 1)
            {
                cerr << "The -l option requires you to give one XML file on the command line." << endl;
                return EXIT_FAILURE;
            }

            dlib::image_dataset_metadata::dataset data;
            load_image_dataset_metadata(data, parser[0]);
            print_all_labels(data);
            return EXIT_SUCCESS;
        }

        if (parser.option("rename"))
        {
            if (parser.number_of_arguments() != 1)
            {
                cerr << "The --rename option requires you to give one XML file on the command line." << endl;
                return EXIT_FAILURE;
            }

            dlib::image_dataset_metadata::dataset data;
            load_image_dataset_metadata(data, parser[0]);
            for (unsigned long i = 0; i < parser.option("rename").count(); ++i)
            {
                rename_labels(data, parser.option("rename").argument(0,i), parser.option("rename").argument(1,i));
            }
            save_image_dataset_metadata(data, parser[0]);
            return EXIT_SUCCESS;
        }

        if (parser.number_of_arguments() == 1)
        {
            metadata_editor editor(parser[0]);
            if (parser.option("parts"))
            {
                std::vector<string> parts = split(parser.option("parts").argument());
                for (unsigned long i = 0; i < parts.size(); ++i)
                {
                    editor.add_labelable_part_name(parts[i]);
                }
            }
            editor.wait_until_closed();
        }
    }
    catch (exception& e)
    {
        cerr << e.what() << endl;
        return EXIT_FAILURE;
    }
}

// ----------------------------------------------------------------------------------------

