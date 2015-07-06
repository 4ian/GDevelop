
#include "convert_pascal_v1.h"
#include "dlib/data_io.h"
#include <iostream>
#include <string>
#include <dlib/dir_nav.h>
#include <dlib/time_this.h>

using namespace std;
using namespace dlib;

namespace
{
    using namespace dlib::image_dataset_metadata;

// ----------------------------------------------------------------------------------------

    std::string pick_out_quoted_string (
        const std::string& str
    )
    {
        std::string temp;
        bool in_quotes = false;
        for (unsigned long i = 0; i < str.size(); ++i)
        {
            if (str[i] == '"')
            {
                in_quotes = !in_quotes;
            }
            else if (in_quotes)
            {
                temp += str[i];
            }
        }

        return temp;
    }

// ----------------------------------------------------------------------------------------

    void parse_annotation_file(
        const std::string& file,
        dlib::image_dataset_metadata::image& img,
        std::string& dataset_name
    )
    {
        ifstream fin(file.c_str());
        if (!fin)
            throw dlib::error("Unable to open file " + file);

        img = dlib::image_dataset_metadata::image();

        string str, line;
        std::vector<string> words;
        while (fin.peek() != EOF)
        {
            getline(fin, line);
            words = split(line, " \r\n\t:(,-)\"");
            if (words.size() > 2)
            {
                if (words[0] == "#")
                    continue;

                if (words[0] == "Image" && words[1] == "filename")
                {
                    img.filename = pick_out_quoted_string(line);
                }
                else if (words[0] == "Database")
                {
                    dataset_name = pick_out_quoted_string(line);
                }
                else if (words[0] == "Objects" && words[1] == "with" && words.size() >= 5)
                {
                    const int num = sa = words[4];
                    img.boxes.resize(num);
                }
                else if (words.size() > 4 && (words[2] == "for" || words[2] == "on") && words[3] == "object")
                {
                    long idx = sa = words[4];
                    --idx;
                    if (idx >= (long)img.boxes.size())
                        throw dlib::error("Invalid object id number of " + words[4]);

                    if (words[0] == "Center" && words[1] == "point" && words.size() > 9)
                    {
                        const long x = sa = words[8];
                        const long y = sa = words[9];
                        img.boxes[idx].parts["head"] = point(x,y);
                    }
                    else if (words[0] == "Bounding" && words[1] == "box" && words.size() > 13)
                    {
                        rectangle rect;
                        img.boxes[idx].rect.left() = sa = words[10];
                        img.boxes[idx].rect.top() = sa = words[11];
                        img.boxes[idx].rect.right() = sa = words[12];
                        img.boxes[idx].rect.bottom() = sa = words[13];
                    }
                    else if (words[0] == "Original" && words[1] == "label" && words.size() > 6)
                    {
                        img.boxes[idx].label = words[6];
                    }
                }
            }

        }
    }

// ----------------------------------------------------------------------------------------

    std::string figure_out_full_path_to_image (
        const std::string& annotation_file,
        const std::string& image_name
    )
    {
        directory parent = get_parent_directory(file(annotation_file));


        string temp;
        while (true)
        {
            if (parent.is_root())
                temp = parent.full_name() + image_name;
            else
                temp = parent.full_name() + directory::get_separator() + image_name;

            if (file_exists(temp))
                return temp;

            if (parent.is_root())
                throw dlib::error("Can't figure out where the file " + image_name + " is located.");
            parent = get_parent_directory(parent);
        }
    }

// ----------------------------------------------------------------------------------------

}

void convert_pascal_v1(
    const command_line_parser& parser
)
{
    cout << "Convert from PASCAL v1.00 annotation format..." << endl;

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

            dataset.name = name;
            img.filename = strip_path(figure_out_full_path_to_image(parser[i], img.filename), parent_dir);
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


