#include <fstream>
#include <iostream>
#include <string>


#include "dlib/cpp_pretty_printer.h"
#include "dlib/cmd_line_parser.h"
#include "dlib/queue.h"
#include "dlib/misc_api.h"
#include "dlib/dir_nav.h"
#include "to_xml.h"


const char* VERSION = "3.5";

using namespace std;
using namespace dlib;

typedef cpp_pretty_printer::kernel_1a cprinter;
typedef cpp_pretty_printer::kernel_2a bprinter;
typedef dlib::map<string,string>::kernel_1a map_string_to_string;
typedef dlib::set<string>::kernel_1a set_of_string;
typedef queue<file>::kernel_1a queue_of_files;
typedef queue<directory>::kernel_1a queue_of_dirs;

void print_manual (
);
/*!
    ensures
        - prints detailed information about this program.
!*/

void htmlify (
    const map_string_to_string& file_map,
    bool colored,
    bool number_lines,
    const std::string& title
);
/*!
    ensures
        - for all valid out_file:
            - the file out_file is the html transformed version of
              file_map[out_file]
        - if (number_lines) then
            - the html version will have numbered lines
        - if (colored) then
            - the html version will have colors
        - title will be the first part of the HTML title in the output file
!*/

void htmlify (
    istream& in,
    ostream& out,
    const std::string& title,
    bool colored,
    bool number_lines
);
/*!
    ensures
        - transforms in into html with the given title and writes it to out.
        - if (number_lines) then
            - the html version of in will have numbered lines
        - if (colored) then
            - the html version of in will have colors
!*/

void add_files (
    const directory& dir,
    const std::string& out_dir,
    map_string_to_string& file_map,
    bool flatten,
    bool cat,
    const set_of_string& filter,
    unsigned long search_depth,
    unsigned long cur_depth = 0
);
/*!
    ensures
        - searches the directory dir for files matching the filter and adds them
          to the file_map.  only looks search_depth deep.
!*/

int main(int argc, char** argv)
{
    if (argc == 1)
    {
        cout << "\nTry the -h option for more information.\n";
        return 0;
    }

    string file;
    try
    {
        command_line_parser parser;
        parser.add_option("b","Pretty print in black and white. The default is to pretty print in color.");
        parser.add_option("n","Number lines.");
        parser.add_option("h","Displays this information.");
        parser.add_option("index","Create an index.");
        parser.add_option("v","Display version.");
        parser.add_option("man","Display the manual.");
        parser.add_option("f","Specifies a list of file extensions to process when using the -i option.  The list elements should be separated by spaces.  The default is \"cpp h c\".",1);
        parser.add_option("i","Specifies an input directory.",1);
        parser.add_option("cat","Puts all the output into a single html file with the given name.",1);
        parser.add_option("depth","Specifies how many directories deep to search when using the i option.  The default value is 30.",1);
        parser.add_option("o","This option causes all the output files to be created inside the given directory.  If this option is not given then all output goes to the current working directory.",1);
        parser.add_option("flatten","When this option is given it prevents the input directory structure from being replicated.");
        parser.add_option("title","This option specifies a string which is prepended onto the title of the generated HTML",1);
        parser.add_option("to-xml","Instead of generating HTML output, create a single output file called output.xml that contains "
                          "a simple XML database which lists all documented classes and functions.");
        parser.add_option("t", "When creating XML output, replace tabs in comments with <arg> spaces.", 1);

        
        parser.parse(argc,argv);


        parser.check_incompatible_options("cat","o");
        parser.check_incompatible_options("cat","flatten");
        parser.check_incompatible_options("cat","index");
        parser.check_option_arg_type<unsigned long>("depth");
        parser.check_option_arg_range("t", 1, 100);

        parser.check_incompatible_options("to-xml", "b");
        parser.check_incompatible_options("to-xml", "n");
        parser.check_incompatible_options("to-xml", "index");
        parser.check_incompatible_options("to-xml", "cat");
        parser.check_incompatible_options("to-xml", "o");
        parser.check_incompatible_options("to-xml", "flatten");
        parser.check_incompatible_options("to-xml", "title");

        const char* singles[] = {"b","n","h","index","v","man","f","cat","depth","o","flatten","title","to-xml", "t"};
        parser.check_one_time_options(singles);

        const char* i_sub_ops[] = {"f","depth","flatten"};
        parser.check_sub_options("i",i_sub_ops);

        const char* to_xml_sub_ops[] = {"t"};
        parser.check_sub_options("to-xml",to_xml_sub_ops);

        const command_line_parser::option_type& b_opt       = parser.option("b");
        const command_line_parser::option_type& n_opt       = parser.option("n");
        const command_line_parser::option_type& h_opt       = parser.option("h");
        const command_line_parser::option_type& index_opt   = parser.option("index");
        const command_line_parser::option_type& v_opt       = parser.option("v");
        const command_line_parser::option_type& o_opt       = parser.option("o");
        const command_line_parser::option_type& man_opt     = parser.option("man");
        const command_line_parser::option_type& f_opt       = parser.option("f");
        const command_line_parser::option_type& cat_opt     = parser.option("cat");
        const command_line_parser::option_type& i_opt       = parser.option("i");
        const command_line_parser::option_type& flatten_opt = parser.option("flatten");
        const command_line_parser::option_type& depth_opt   = parser.option("depth");
        const command_line_parser::option_type& title_opt   = parser.option("title");
        const command_line_parser::option_type& to_xml_opt  = parser.option("to-xml");


        string filter = "cpp h c";

        bool cat = false;
        bool color = true;
        bool number = false;
        unsigned long search_depth = 30;

        string out_dir;  // the name of the output directory if the o option is given.  "" otherwise
        string full_out_dir;  // the full name of the output directory if the o option is given.  "" otherwise
        const char separator = directory::get_separator();

        bool no_run = false;
        if (v_opt)
        {
            cout << "Htmlify v" << VERSION 
                 << "\nCompiled: " << __TIME__ << " " << __DATE__ 
                 << "\nWritten by Davis King\n";
            cout << "Check for updates at http://dlib.net\n\n";
            no_run = true;
        }

        if (h_opt)
        {
            cout << "This program pretty prints C or C++ source code to HTML.\n";
            cout << "Usage: htmlify [options] [file]...\n";
            parser.print_options();
            cout << "\n\n";
            no_run = true;
        }

        if (man_opt)
        {
            print_manual();
            no_run = true;
        }

        if (no_run)
            return 0;

        if (f_opt)
        {
            filter = f_opt.argument();
        }

        if (cat_opt)
        {
            cat = true;
        }

        if (depth_opt)
        {
            search_depth = string_cast<unsigned long>(depth_opt.argument());
        }

        if (to_xml_opt)
        {
            unsigned long expand_tabs = 0;
            if (parser.option("t"))
                expand_tabs = string_cast<unsigned long>(parser.option("t").argument());

            generate_xml_markup(parser, filter, search_depth, expand_tabs);
            return 0;
        }

        if (o_opt)
        {
            // make sure this directory exists
            out_dir = o_opt.argument();
            create_directory(out_dir);
            directory dir(out_dir);
            full_out_dir = dir.full_name();

            // make sure the last character of out_dir is a separator
            if (out_dir[out_dir.size()-1] != separator)
                out_dir += separator;
            if (full_out_dir[out_dir.size()-1] != separator)
                full_out_dir += separator;
        }
         
        if (b_opt) 
            color = false;
        if (n_opt) 
            number = true;

        // this is a map of output file names to input file names.  
        map_string_to_string file_map;


        // add all the files that are just given on the command line to the 
        // file_map.
        for (unsigned long i = 0; i < parser.number_of_arguments(); ++i)
        {
            string in_file, out_file;
            in_file = parser[i];
            string::size_type pos = in_file.find_last_of(separator);
            if (pos != string::npos)
            {
                out_file = out_dir + in_file.substr(pos+1) + ".html";
            }
            else
            {
                out_file = out_dir + in_file + ".html"; 
            }

            if (file_map.is_in_domain(out_file))
            {
                if (file_map[out_file] != in_file)
                {
                    // there is a file name colision in the output folder. definitly a bad thing
                    cout << "Error: Two of the input files have the same name and would overwrite each\n";
                    cout << "other.  They are " << in_file << " and " << file_map[out_file] << ".\n" << endl;
                    return 1;
                }
                else
                {
                    continue;
                }
            }

            file_map.add(out_file,in_file);
        }

        // pick out the filter strings
        set_of_string sfilter;
        istringstream sin(filter);
        string temp;
        sin >> temp;
        while (sin)
        {
            if (sfilter.is_member(temp) == false)
                sfilter.add(temp);
            sin >> temp;
        }

        // now get all the files given by the i options
        for (unsigned long i = 0; i < i_opt.count(); ++i)
        {
            directory dir(i_opt.argument(0,i));
            add_files(dir, out_dir, file_map, flatten_opt, cat, sfilter, search_depth);
        }

        if (cat)
        {
            file_map.reset();
            ofstream fout(cat_opt.argument().c_str());
            if (!fout) 
            {
                throw error("Error: unable to open file " + cat_opt.argument());
            }
            fout << "<html><title>" << cat_opt.argument() << "</title></html>";

            const char separator = directory::get_separator();
            string file;
            while (file_map.move_next())
            {
                ifstream fin(file_map.element().value().c_str());
                if (!fin) 
                {
                    throw error("Error: unable to open file " + file_map.element().value());
                }

                string::size_type pos = file_map.element().value().find_last_of(separator);
                if (pos != string::npos)
                    file = file_map.element().value().substr(pos+1);
                else 
                    file = file_map.element().value();

                std::string title;
                if (title_opt)
                    title = title_opt.argument();
                htmlify(fin, fout, title + file, color, number);
            }

        }
        else
        {
            std::string title;
            if (title_opt)
                title = title_opt.argument();
            htmlify(file_map,color,number,title);
        }



        if (index_opt)
        {
            ofstream index((out_dir + "index.html").c_str());
            ofstream menu((out_dir + "menu.html").c_str());

            if (!index)
            {
                cout << "Error: unable to create " << out_dir << "index.html\n\n";
                return 0;
            }

            if (!menu)
            {
                cout << "Error: unable to create " << out_dir << "menu.html\n\n";
                return 0;
            }


            index << "<html><frameset cols='200,*'>";
            index << "<frame src='menu.html' name='menu'>";
            index << "<frame  name='main'></frameset></html>";

            menu << "<html><body><br>";

            file_map.reset();
            while (file_map.move_next())
            {
                if (o_opt)
                {
                    file = file_map.element().key();
                    if (file.find(full_out_dir) != string::npos)
                        file = file.substr(full_out_dir.size());
                    else
                        file = file.substr(out_dir.size());
                }
                else
                {
                    file = file_map.element().key();
                }
                // strip the .html from file
                file = file.substr(0,file.size()-5);
                menu << "<a href='" << file << ".html' target='main'>"
                     << file << "</a><br>";
            }

            menu << "</body></html>";

        }
        
    }
    catch (ios_base::failure&)
    {
        cout << "ERROR: unable to write to " << file << endl;
        cout << endl;
    }
    catch (exception& e)
    {
        cout << e.what() << endl;
        cout << "\nTry the -h option for more information.\n";
        cout << endl;
    }
}

// -------------------------------------------------------------------------------------------------

void htmlify (
    istream& in,
    ostream& out,
    const std::string& title,
    bool colored,
    bool number_lines
)
{
    if (colored)
    {
        static cprinter cp;
        if (number_lines)
        {
            cp.print_and_number(in,out,title);
        }
        else
        {
            cp.print(in,out,title);
        }
    }
    else
    {
        static bprinter bp;
        if (number_lines)
        {
            bp.print_and_number(in,out,title);
        }
        else
        {
            bp.print(in,out,title);
        }
    }
}

// -------------------------------------------------------------------------------------------------

void htmlify (
    const map_string_to_string& file_map,
    bool colored,
    bool number_lines,
    const std::string& title
)
{
    file_map.reset();
    const char separator = directory::get_separator();
    string file;
    while (file_map.move_next())
    {
        ifstream fin(file_map.element().value().c_str());
        if (!fin) 
        {
            throw error("Error: unable to open file " + file_map.element().value() );
        }

        ofstream fout(file_map.element().key().c_str());

        if (!fout) 
        {
            throw error("Error: unable to open file " + file_map.element().key());
        }

        string::size_type pos = file_map.element().value().find_last_of(separator);
        if (pos != string::npos)
            file = file_map.element().value().substr(pos+1);
        else 
            file = file_map.element().value();

        htmlify(fin, fout,title + file, colored, number_lines);
    }
}

// -------------------------------------------------------------------------------------------------

void add_files (
    const directory& dir,
    const std::string& out_dir,
    map_string_to_string& file_map,
    bool flatten,
    bool cat,
    const set_of_string& filter,
    unsigned long search_depth,
    unsigned long cur_depth
)
{
    const char separator = directory::get_separator();

    queue_of_files files;
    queue_of_dirs dirs;

    dir.get_files(files);

    // look though all the files in the current directory and add the
    // ones that match the filter to file_map
    string name, ext, in_file, out_file;
    files.reset();
    while (files.move_next())
    {
        name = files.element().name();
        string::size_type pos = name.find_last_of('.');
        if (pos != string::npos && filter.is_member(name.substr(pos+1)))
        {
            in_file = files.element().full_name();

            if (flatten)
            {
                pos = in_file.find_last_of(separator);
            }
            else
            {
                // figure out how much of the file's path we need to keep
                // for the output file name
                pos = in_file.size();
                for (unsigned long i = 0; i <= cur_depth && pos != string::npos; ++i)
                {
                    pos = in_file.find_last_of(separator,pos-1);
                }
            }

            if (pos != string::npos)
            {
                out_file = out_dir + in_file.substr(pos+1) + ".html";
            }
            else
            {
                out_file = out_dir + in_file + ".html"; 
            }

            if (file_map.is_in_domain(out_file))
            {
                if (file_map[out_file] != in_file)
                {
                    // there is a file name colision in the output folder. definitly a bad thing
                    ostringstream sout;
                    sout << "Error: Two of the input files have the same name and would overwrite each\n";
                    sout << "other.  They are " << in_file << " and " << file_map[out_file] << ".";
                    throw error(sout.str());
                }
                else
                {
                    continue;
                }
            }

            file_map.add(out_file,in_file);

        }
    } // while (files.move_next())
    files.clear();

    if (search_depth > cur_depth)
    {
        // search all the sub directories
        dir.get_dirs(dirs);
        dirs.reset();
        while (dirs.move_next())
        {
            if (!flatten && !cat)
            {
                string d = dirs.element().full_name();
                
                // figure out how much of the directorie's path we need to keep.
                string::size_type pos = d.size();
                for (unsigned long i = 0; i <= cur_depth && pos != string::npos; ++i)
                {
                    pos = d.find_last_of(separator,pos-1);
                }
                
                // make sure this directory exists in the output directory tree
                d = d.substr(pos+1);
                create_directory(out_dir + separator + d);
            }

            add_files(dirs.element(), out_dir, file_map, flatten, cat, filter, search_depth, cur_depth+1);
        }
    }
    
}

// -------------------------------------------------------------------------------------------------

void print_manual (
)
{
    ostringstream sout;

    const unsigned long indent = 2;

    cout << "\n";
    sout << "Htmlify v" << VERSION;
    cout << wrap_string(sout.str(),indent,indent);   sout.str("");


    sout << "This is a fairly simple program that takes source files and pretty prints them "
         << "in HTML.  There are two pretty printing styles, black and white or color.  The "
         << "black and white style is meant to look nice when printed out on paper.  It looks "
         << "a little funny on the screen but on paper it is pretty nice.  The color version "
         << "on the other hand has nonprintable HTML elements such as links and anchors.";
    cout << "\n\n" << wrap_string(sout.str(),indent,indent);   sout.str("");


    sout << "The colored style puts HTML anchors on class and function names.  This means "
         << "you can link directly to the part of the code that contains these names.  For example, "
         << "if you had a source file bar.cpp with a function called foo in it you could link "
         << "directly to the function with a link address of \"bar.cpp.html#foo\".  It is also "
         << "possible to instruct Htmlify to place HTML anchors at arbitrary spots by using a "
         << "special comment of the form /*!A anchor_name */.  You can put other things in the "
         << "comment but the important bit is to have it begin with /*!A then some white space "
         << "then the anchor name you want then more white space and then you can add whatever "
         << "you like.  You would then refer to this anchor with a link address of "
         << "\"file.html#anchor_name\".";
    cout << "\n\n" << wrap_string(sout.str(),indent,indent);   sout.str("");

    sout << "Htmlify also has the ability to create a simple index of all the files it is given. "
         << "The --index option creates a file named index.html with a frame on the left side "
         << "that contains links to all the files.";
    cout << "\n\n" << wrap_string(sout.str(),indent,indent);   sout.str("");


    sout << "Finally, Htmlify can produce annotated XML output instead of HTML.  The output will "
         << "contain all functions which are immediately followed by comments of the form /*! comment body !*/. "
         << "Similarly, all classes or structs that immediately contain one of these comments following their "
         << "opening { will also be output as annotated XML.  Note also that if you wish to document a "
         << "piece of code using one of these comments but don't want it to appear in the output XML then "
         << "use either a comment like /* */ or /*!P !*/ to mark the code as \"private\".";
    cout << "\n\n" << wrap_string(sout.str(),indent,indent) << "\n\n";   sout.str("");
}

// -------------------------------------------------------------------------------------------------

