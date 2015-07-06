
#include "convert_idl.h"
#include "dlib/data_io.h"
#include <iostream>
#include <string>
#include <dlib/dir_nav.h>
#include <dlib/time_this.h>
#include <dlib/cmd_line_parser.h>

using namespace std;
using namespace dlib;

namespace
{
    using namespace dlib::image_dataset_metadata;

// ----------------------------------------------------------------------------------------

    inline bool next_is_number(std::istream& in)
    {
        return ('0' <= in.peek() && in.peek() <= '9') || in.peek() == '-' || in.peek() == '+';
    }

    int read_int(std::istream& in)
    {
        bool is_neg = false;
        if (in.peek() == '-')
        {
            is_neg = true;
            in.get();
        }
        if (in.peek() == '+')
            in.get();

        int val = 0;
        while ('0' <= in.peek() && in.peek() <= '9')
        {
            val = 10*val + in.get()-'0';
        }

        if (is_neg)
            return -val;
        else
            return val;
    }

// ----------------------------------------------------------------------------------------

    void parse_annotation_file(
        const std::string& file,
        dlib::image_dataset_metadata::dataset& data 
    )
    {
        ifstream fin(file.c_str());
        if (!fin)
            throw dlib::error("Unable to open file " + file);


        bool in_quote = false;
        int point_count = 0;
        bool in_point_list = false;
        bool saw_any_points = false;

        image img;
        string label;
        point p1,p2;
        while (fin.peek() != EOF)
        {
            if (in_point_list && next_is_number(fin))
            {
                const int val = read_int(fin);
                switch (point_count)
                {
                    case 0: p1.x() = val; break;
                    case 1: p1.y() = val; break;
                    case 2: p2.x() = val; break;
                    case 3: p2.y() = val; break;
                    default:
                            throw dlib::error("parse error in file " + file);
                }

                ++point_count;
            }

            char ch = fin.get();

            if (ch == ':')
                continue;

            if (ch == '"')
            {
                in_quote = !in_quote;
                continue;
            }

            if (in_quote)
            {
                img.filename += ch;
                continue;
            }


            if (ch == '(')
            {
                in_point_list = true;
                point_count = 0;
                label.clear();
                saw_any_points = true;
            }
            if (ch == ')')
            {
                in_point_list = false;

                label.clear();
                while (fin.peek() != EOF && 
                       fin.peek() != ';' &&
                       fin.peek() != ',')
                {
                    char ch = fin.get();
                    if (ch == ':')
                        continue;

                    label += ch;
                }
            }

            if (ch == ',' && !in_point_list)
            {

                box b;
                b.rect = rectangle(p1,p2);
                b.label = label;
                img.boxes.push_back(b);
            }


            if (ch == ';')
            {

                if (saw_any_points)
                {
                    box b;
                    b.rect = rectangle(p1,p2);
                    b.label = label;
                    img.boxes.push_back(b);
                    saw_any_points = false;
                }
                data.images.push_back(img);


                img.filename.clear();
                img.boxes.clear();
            }


        }



    }

// ----------------------------------------------------------------------------------------

}

void convert_idl(
    const command_line_parser& parser
)
{
    cout << "Convert from IDL annotation format..." << endl;

    dlib::image_dataset_metadata::dataset dataset;

    for (unsigned long i = 0; i < parser.number_of_arguments(); ++i)
    {
        parse_annotation_file(parser[i], dataset);
    }

    const std::string filename = parser.option("c").argument();
    save_image_dataset_metadata(dataset, filename);
}



