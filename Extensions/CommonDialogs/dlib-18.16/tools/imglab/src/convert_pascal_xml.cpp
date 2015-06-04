
#include "convert_pascal_xml.h"
#include "dlib/data_io.h"
#include <iostream>
#include <dlib/xml_parser.h>
#include <string>
#include <dlib/dir_nav.h>
#include <dlib/cmd_line_parser.h>

using namespace std;
using namespace dlib;

namespace
{
    using namespace dlib::image_dataset_metadata;

// ----------------------------------------------------------------------------------------

    class doc_handler : public document_handler
    {
        image& temp_image;
        std::string& dataset_name;

        std::vector<std::string> ts;
        box temp_box;

    public:

        doc_handler(
            image& temp_image_,
            std::string& dataset_name_
        ):
            temp_image(temp_image_),
            dataset_name(dataset_name_)
        {}


        virtual void start_document (
        )
        {
            ts.clear();
            temp_image = image();
            temp_box = box();
            dataset_name.clear();
        }

        virtual void end_document (
        )
        {
        }

        virtual void start_element ( 
            const unsigned long ,
            const std::string& name,
            const dlib::attribute_list& 
        )
        {
            if (ts.size() == 0 && name != "annotation") 
            {
                std::ostringstream sout;
                sout << "Invalid XML document.  Root tag must be <annotation>.  Found <" << name << "> instead.";
                throw dlib::error(sout.str());
            }


            ts.push_back(name);
        }

        virtual void end_element ( 
            const unsigned long ,
            const std::string& name
        )
        {
            ts.pop_back();
            if (ts.size() == 0)
                return;

            if (name == "object" && ts.back() == "annotation")
            {
                temp_image.boxes.push_back(temp_box);
                temp_box = box();
            }
        }

        virtual void characters ( 
            const std::string& data
        )
        {
            if (ts.size() == 2 && ts[1] == "filename")
            {
                temp_image.filename = trim(data);
            }
            else if (ts.size() == 3 && ts[2] == "database" && ts[1] == "source")
            {
                dataset_name = trim(data);
            }
            else if (ts.size() >= 3)
            {
                if (ts[ts.size()-2] == "bndbox" && ts[ts.size()-3] == "object")
                {
                    if      (ts.back() == "xmin") temp_box.rect.left()   = string_cast<double>(data);
                    else if (ts.back() == "ymin") temp_box.rect.top()    = string_cast<double>(data);
                    else if (ts.back() == "xmax") temp_box.rect.right()  = string_cast<double>(data);
                    else if (ts.back() == "ymax") temp_box.rect.bottom() = string_cast<double>(data);
                }
                else if (ts.back() == "name" && ts[ts.size()-2] == "object")
                {
                    temp_box.label = trim(data);
                }
                else if (ts.back() == "difficult" && ts[ts.size()-2] == "object")
                {
                    if (trim(data) == "0" || trim(data) == "false")
                    {
                        temp_box.difficult = false;
                    }
                    else
                    {
                        temp_box.difficult = true;
                    }
                }
                else if (ts.back() == "truncated" && ts[ts.size()-2] == "object")
                {
                    if (trim(data) == "0" || trim(data) == "false")
                    {
                        temp_box.truncated = false;
                    }
                    else
                    {
                        temp_box.truncated = true;
                    }
                }
                else if (ts.back() == "occluded" && ts[ts.size()-2] == "object")
                {
                    if (trim(data) == "0" || trim(data) == "false")
                    {
                        temp_box.occluded = false;
                    }
                    else
                    {
                        temp_box.occluded = true;
                    }
                }

            }
        }

        virtual void processing_instruction (
            const unsigned long ,
            const std::string& ,
            const std::string& 
        )
        {
        }
    };

// ----------------------------------------------------------------------------------------

    class xml_error_handler : public error_handler
    {
    public:
        virtual void error (
            const unsigned long 
        ) { }

        virtual void fatal_error (
            const unsigned long line_number
        )
        {
            std::ostringstream sout;
            sout << "There is a fatal error on line " << line_number << " so parsing will now halt.";
            throw dlib::error(sout.str());
        }
    };

// ----------------------------------------------------------------------------------------

    void parse_annotation_file(
        const std::string& file,
        dlib::image_dataset_metadata::image& img,
        std::string& dataset_name
    )
    {
        doc_handler dh(img, dataset_name);
        xml_error_handler eh;

        xml_parser::kernel_1a parser;
        parser.add_document_handler(dh);
        parser.add_error_handler(eh);

        ifstream fin(file.c_str());
        if (!fin)
            throw dlib::error("Unable to open file " + file);
        parser.parse(fin);
    }

// ----------------------------------------------------------------------------------------

}

void convert_pascal_xml(
    const command_line_parser& parser
)
{
    cout << "Convert from PASCAL XML annotation format..." << endl;

    dlib::image_dataset_metadata::dataset dataset;

    std::string name;
    dlib::image_dataset_metadata::image img;

    const std::string filename = parser.option("c").argument();
    // make sure the file exists so we can use the get_parent_directory() command to
    // figure out it's parent directory.
    make_empty_file(filename);
    const std::string parent_dir = get_parent_directory(file(filename)).full_name();

    for (unsigned long i = 0; i < parser.number_of_arguments(); ++i)
    {
        try
        {
            parse_annotation_file(parser[i], img, name);
            const string root = get_parent_directory(get_parent_directory(file(parser[i]))).full_name();
            const string img_path = root + directory::get_separator() + "JPEGImages" + directory::get_separator();

            dataset.name = name;
            img.filename = strip_path(img_path + img.filename,  parent_dir);
            dataset.images.push_back(img);

        }
        catch (exception& )
        {
            cout << "Error while processing file " << parser[i] << endl << endl;
            throw;
        }
    }

    save_image_dataset_metadata(dataset, filename);
}

