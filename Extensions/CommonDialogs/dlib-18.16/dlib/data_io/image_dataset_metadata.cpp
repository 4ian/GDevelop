// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_IMAGE_DAtASET_METADATA_CPPh_
#define DLIB_IMAGE_DAtASET_METADATA_CPPh_

#include "image_dataset_metadata.h"

#include <fstream>
#include <sstream>
#include "../compress_stream.h"
#include "../base64.h"
#include "../xml_parser.h"
#include "../string.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{
    namespace image_dataset_metadata
    {

    // ------------------------------------------------------------------------------------

        const std::string get_decoded_string();
        void create_image_metadata_stylesheet_file(const std::string& main_filename)
        {
            std::string path;
            std::string::size_type pos = main_filename.find_last_of("/\\");
            if (pos != std::string::npos)
                path = main_filename.substr(0,pos+1);

            std::ofstream fout((path + "image_metadata_stylesheet.xsl").c_str());
            if (!fout)
                throw dlib::error("ERROR: Unable to open image_metadata_stylesheet.xsl for writing.");

            fout << get_decoded_string();

            if (!fout)
                throw dlib::error("ERROR: Unable to write to image_metadata_stylesheet.xsl.");
        }

        void save_image_dataset_metadata (
            const dataset& meta,
            const std::string& filename
        )
        {
            create_image_metadata_stylesheet_file(filename);

            const std::vector<image>& images = meta.images;

            std::ofstream fout(filename.c_str());
            if (!fout)
                throw dlib::error("ERROR: Unable to open " + filename + " for writing.");

            fout << "<?xml version='1.0' encoding='ISO-8859-1'?>\n";
            fout << "<?xml-stylesheet type='text/xsl' href='image_metadata_stylesheet.xsl'?>\n";
            fout << "<dataset>\n";
            fout << "<name>" << meta.name << "</name>\n";
            fout << "<comment>" << meta.comment << "</comment>\n";
            fout << "<images>\n";
            for (unsigned long i = 0; i < images.size(); ++i)
            {
                fout << "  <image file='" << images[i].filename << "'>\n";

                // save all the boxes
                for (unsigned long j = 0; j < images[i].boxes.size(); ++j)
                {
                    const box& b = images[i].boxes[j];
                    fout << "    <box top='" << b.rect.top() << "' "
                                 << "left='" << b.rect.left() << "' "
                                << "width='" << b.rect.width() << "' "
                               << "height='" << b.rect.height() << "'";
                    if (b.difficult)
                        fout << " difficult='" << b.difficult << "'";
                    if (b.truncated)
                        fout << " truncated='" << b.truncated << "'";
                    if (b.occluded)
                        fout << " occluded='" << b.occluded << "'";
                    if (b.ignore)
                        fout << " ignore='" << b.ignore << "'";
                    if (b.angle != 0)
                        fout << " angle='" << b.angle << "'";

                    if (b.has_label() || b.parts.size() != 0)
                    {
                        fout << ">\n";

                        if (b.has_label())
                            fout << "      <label>" << b.label << "</label>\n";
                        
                        // save all the parts
                        std::map<std::string,point>::const_iterator itr;
                        for (itr = b.parts.begin(); itr != b.parts.end(); ++itr)
                        {
                            fout << "      <part name='"<< itr->first << "' x='"<< itr->second.x() <<"' y='"<< itr->second.y() <<"'/>\n";
                        }

                        fout << "    </box>\n";
                    }
                    else
                    {
                        fout << "/>\n";
                    }
                }



                fout << "  </image>\n";

                if (!fout)
                    throw dlib::error("ERROR: Unable to write to " + filename + ".");
            }
            fout << "</images>\n";
            fout << "</dataset>";
        }

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

        class doc_handler : public document_handler
        {
            std::vector<std::string> ts;
            image temp_image;
            box temp_box;

            dataset& meta;

        public:

            doc_handler(
                dataset& metadata_
            ):
                meta(metadata_) 
            {}


            virtual void start_document (
            )
            {
                meta = dataset();
                ts.clear();
                temp_image = image();
                temp_box = box();
            }

            virtual void end_document (
            )
            {
            }

            virtual void start_element ( 
                const unsigned long line_number,
                const std::string& name,
                const dlib::attribute_list& atts
            )
            {
                try
                {
                    if (ts.size() == 0) 
                    {
                        if (name != "dataset")
                        {
                            std::ostringstream sout;
                            sout << "Invalid XML document.  Root tag must be <dataset>.  Found <" << name << "> instead.";
                            throw dlib::error(sout.str());
                        }
                        else
                        {
                            ts.push_back(name);
                            return;
                        }
                    }


                    if (name == "box")
                    {
                        if (atts.is_in_list("top")) temp_box.rect.top() = sa = atts["top"];
                        else throw dlib::error("<box> missing required attribute 'top'");

                        if (atts.is_in_list("left")) temp_box.rect.left() = sa = atts["left"];
                        else throw dlib::error("<box> missing required attribute 'left'");

                        if (atts.is_in_list("width")) temp_box.rect.right() = sa = atts["width"];
                        else throw dlib::error("<box> missing required attribute 'width'");

                        if (atts.is_in_list("height")) temp_box.rect.bottom() = sa = atts["height"];
                        else throw dlib::error("<box> missing required attribute 'height'");

                        if (atts.is_in_list("difficult")) temp_box.difficult = sa = atts["difficult"];
                        if (atts.is_in_list("truncated")) temp_box.truncated = sa = atts["truncated"];
                        if (atts.is_in_list("occluded"))  temp_box.occluded  = sa = atts["occluded"];
                        if (atts.is_in_list("ignore"))  temp_box.ignore  = sa = atts["ignore"];
                        if (atts.is_in_list("angle"))  temp_box.angle  = sa = atts["angle"];

                        temp_box.rect.bottom() += temp_box.rect.top()-1;
                        temp_box.rect.right() += temp_box.rect.left()-1;
                    }
                    else if (name == "part" && ts.back() == "box")
                    {
                        point temp;
                        if (atts.is_in_list("x")) temp.x() = sa = atts["x"];
                        else throw dlib::error("<part> missing required attribute 'x'");

                        if (atts.is_in_list("y")) temp.y() = sa = atts["y"];
                        else throw dlib::error("<part> missing required attribute 'y'");

                        if (atts.is_in_list("name")) 
                        {
                            if (temp_box.parts.count(atts["name"])==0)
                            {
                                temp_box.parts[atts["name"]] = temp;
                            }
                            else
                            {
                                throw dlib::error("<part> with name '" + atts["name"] + "' is defined more than one time in a single box.");
                            }
                        }
                        else 
                        {
                            throw dlib::error("<part> missing required attribute 'name'");
                        }
                    }
                    else if (name == "image")
                    {
                        temp_image.boxes.clear();

                        if (atts.is_in_list("file")) temp_image.filename = atts["file"];
                        else throw dlib::error("<image> missing required attribute 'file'");
                    }

                    ts.push_back(name);
                }
                catch (error& e)
                {
                    throw dlib::error("Error on line " + cast_to_string(line_number) + ": " + e.what());
                }
            }

            virtual void end_element ( 
                const unsigned long ,
                const std::string& name
            )
            {
                ts.pop_back();
                if (ts.size() == 0)
                    return;

                if (name == "box" && ts.back() == "image")
                {
                    temp_image.boxes.push_back(temp_box);
                    temp_box = box();
                }
                else if (name == "image" && ts.back() == "images")
                {
                    meta.images.push_back(temp_image);
                    temp_image = image();
                }
            }

            virtual void characters ( 
                const std::string& data
            )
            {
                if (ts.size() == 2 && ts[1] == "name")
                {
                    meta.name = trim(data);
                }
                else if (ts.size() == 2 && ts[1] == "comment")
                {
                    meta.comment = trim(data);
                }
                else if (ts.size() >= 2 && ts[ts.size()-1] == "label" && 
                                           ts[ts.size()-2] == "box")
                {
                    temp_box.label = trim(data);
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

    // ------------------------------------------------------------------------------------

        void load_image_dataset_metadata (
            dataset& meta,
            const std::string& filename
        )
        {
            xml_error_handler eh;
            doc_handler dh(meta);

            std::ifstream fin(filename.c_str());
            if (!fin)
                throw dlib::error("ERROR: unable to open " + filename + " for reading.");

            xml_parser parser;
            parser.add_document_handler(dh);
            parser.add_error_handler(eh);
            parser.parse(fin);
        }

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

        // This function returns the contents of the file 'images.xsl'
        const std::string get_decoded_string()
        {
            dlib::base64 base64_coder;
            dlib::compress_stream::kernel_1ea compressor;
            std::ostringstream sout;
            std::istringstream sin;

            // The base64 encoded data from the file 'image_metadata_stylesheet.xsl' we want to decode and return.
            sout << "PFWfgmWfCHr1DkV63lbjjeY2dCc2FbHDOVh0Kd7dkvaOfRYrOG24f0x77/5iMVq8FtE3UBxtGwSd";
            sout << "1ZHOHRSHgieNoeBv8ssJQ75RRxYtFKRY3OTPX5eKQoCN9jUaUnHnR4QZtEHgmKqXSs50Yrdd+2Ah";
            sout << "gNyarPZCiR6nvqNvCjtP2MP5FxleqNf8Fylatm2KdsXmrv5K87LYVN7i7JMkmZ++cTXYSOxDmxZi";
            sout << "OiCH8funXUdF9apDW547gCjz9HOQUI6dkz5dYUeFjfp6dFugpnaJyyprFLKq048Qk7+QiL4CNF/G";
            sout << "7e0VpBw8dMpiyRNi2fSQGSZGfIAUQKKT6+rPwQoRH2spdjsdXVWj4XQAqBX87nmqMnqjMhn/Vd1s";
            sout << "W5aoC0drwRGu3Xe3gn9vBL8hBkRXcJvEy6q/lb9bYnsLemhE5Zp/+nTmTBjfT9UFYLcsmgsjC+4n";
            sout << "Bq6h9QlpuyMYqJ8RvW8pp3mFlvXc3Yg+18t5F0hSMQfaIFYAuDPU2lVzPpY+ba0B39iu9IrPCLsS";
            sout << "+tUtSNSmQ74CtzZgKKjkTMA3nwYP2SDmZE3firq42pihT7hdU5vYkes69K8AQl8WZyLPpMww+r0z";
            sout << "+veEHPlAuxF7kL3ZvVjdB+xABwwqDe0kSRHRZINYdUfJwJdfYLyDnYoMjj6afqIJZ7QOBPZ42tV5";
            sout << "3hYOQTFwTNovOastzJJXQe1kxPg1AQ8ynmfjjJZqD0xKedlyeJybP919mVAA23UryHsq9TVlabou";
            sout << "qNl3xZW/mKKktvVsd/nuH62HIv/kgomyhaEUY5HgupupBUbQFZfyljZ5bl3g3V3Y1400Z1xTM/LL";
            sout << "LJpeLdlqoGzIe/19vAN1zUUVId9F/OLNUl3Zoar63yZERSJHcsuq/Pasisp0HIGi7rfI9EIQF7C/";
            sout << "IhLKLZsJ+LOycreQGOJALZIEZHOqxYLSXG0qaPM5bQL/MQJ2OZfwEhQgYOrjaM7oPOHHEfTq5kcO";
            sout << "daMwzefKfxrF2GXbUs0bYsEXsIGwENIUKMliFaAI4qKLxxb94oc+O3BRjWueZjZty2zKawQyTHNd";
            sout << "ltFJBUzfffdZN9Wq4zbPzntkM3U6Ys4LRztx5M15dtbhFeKx5rAf2tPXT6wU01hx7EJxBJzpvoDE";
            sout << "YwEoYVDSYulRKpgk82cHFzzUDgWXbl4paFSe1L1w8r9KHr67SYJDTUG86Lrm6LJ0rw73Xp0NAFcU";
            sout << "MKpiG9g1cHW74HYbUb/yAbtVWt40eB7M637umdo2jWz/r/vP5WnfSMXEbkyWebsa1fFceg/TLWy6";
            sout << "E8OTc4XKB48h1oFIlGagOiprxho3+F3TIcxDSwA=";



            // Put the data into the istream sin
            sin.str(sout.str());
            sout.str("");

            // Decode the base64 text into its compressed binary form
            base64_coder.decode(sin,sout);
            sin.clear();
            sin.str(sout.str());
            sout.str("");

            // Decompress the data into its original form
            compressor.decompress(sin,sout);

            // Return the decoded and decompressed data
            return sout.str();
        }


    }
}

// ----------------------------------------------------------------------------------------

#endif // DLIB_IMAGE_DAtASET_METADATA_CPPh_


