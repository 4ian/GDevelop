// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CMD_LINE_PARSER_KERNEl_TEST_H_
#define DLIB_CMD_LINE_PARSER_KERNEl_TEST_H_


#include <string>
#include <dlib/string.h>

#include <dlib/cmd_line_parser.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.cmd_line_parser");

    template <
        typename clp
        >
    void cmd_line_parser_kernel_test (
    )
    /*!
        requires
            - clp is an implementation of cmd_line_parser_kernel_abstract.h
        ensures
            - runs tests on clp for compliance with the specs 
    !*/
    {        
        typedef typename clp::char_type ct;




        int argc;
        const ct* argv[100];            
        bool ok;

        for (int j = 0; j < 3; ++j)
        {
            clp test, test2;




            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start());
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.current_element_valid() == false);



            DLIB_TEST(test.parsed_line() == false);
            DLIB_TEST(test.option_is_defined(_dT(ct,"a")) == false);
            DLIB_TEST(test.option_is_defined(_dT(ct,"a")) == false);
            DLIB_TEST(test.option_is_defined(_dT(ct,"a")) == false);

            DLIB_TEST(test.parsed_line() == false);
            DLIB_TEST(test.option_is_defined(_dT(ct,"a")) == false);
            DLIB_TEST(test.option_is_defined(_dT(ct,"b")) == false);
            DLIB_TEST(test.option_is_defined(_dT(ct,"\0")) == false);

            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.current_element_valid() == false);



            // program arg1 --davis arg2 -cZzarg asdf
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--davis");
            argv[3] = _dT(ct,"arg2");
            argv[4] = _dT(ct,"-cZzarg");
            argv[5] = _dT(ct,"asdf");
            argc = 6;


            test.add_option(_dT(ct,"davis"),_dT(ct,"davis option"));
            test.add_option(_dT(ct,"c"),_dT(ct,"c option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            for (int k = 0; k < 5; ++k)
            {

                try { test.parse(argc,argv); }
                catch (error& e)
                {
                    DLIB_TEST_MSG(false,e.info);
                }

                DLIB_TEST(test.option(_dT(ct,"davis")).name() == _dT(ct,"davis"));
                DLIB_TEST(test.option(_dT(ct,"c")).name() == _dT(ct,"c"));
                DLIB_TEST(test.option(_dT(ct,"Z")).name() == _dT(ct,"Z"));
                DLIB_TEST(test.option(_dT(ct,"davis")).number_of_arguments() == 0);
                DLIB_TEST(test.option(_dT(ct,"c")).number_of_arguments() == 0);
                DLIB_TEST(test.option(_dT(ct,"Z")).number_of_arguments() == 2);
                DLIB_TEST(test.number_of_arguments() == 2);
                DLIB_TEST(test[0] == _dT(ct,"arg1"));
                DLIB_TEST(test[1] == _dT(ct,"arg2"));
                DLIB_TEST(test.option(_dT(ct,"d")).count()==0);
                DLIB_TEST(test.option(_dT(ct,"davis")).count()==1);
                DLIB_TEST_MSG(test.option(_dT(ct,"c")).count()==1,test.option(_dT(ct,"c")).count());
                DLIB_TEST(test.option(_dT(ct,"Z")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(0,0) == _dT(ct,"zarg"));
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(1,0) == _dT(ct,"asdf"));

            }



            swap(test,test2);





            // program arg1 --davis arg2 -cZ zarg asdf
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--davis");
            argv[3] = _dT(ct,"arg2");
            argv[4] = _dT(ct,"-cZ");
            argv[5] = _dT(ct,"zarg");
            argv[6] = _dT(ct,"asdf");
            argc = 7;




            for (int k = 0; k < 5; ++k)
            {

                try { test2.parse(argc,argv); }
                catch (error& e)
                {
                    DLIB_TEST_MSG(false,e.info);
                }

                DLIB_TEST(test2.option(_dT(ct,"davis")).name() == _dT(ct,"davis"));
                DLIB_TEST(test2.option(_dT(ct,"c")).name() == _dT(ct,"c"));
                DLIB_TEST(test2.option(_dT(ct,"Z")).name() == _dT(ct,"Z"));
                DLIB_TEST(test2.option(_dT(ct,"davis")).number_of_arguments() == 0);
                DLIB_TEST(test2.option(_dT(ct,"c")).number_of_arguments() == 0);
                DLIB_TEST(test2.option(_dT(ct,"Z")).number_of_arguments() == 2);
                DLIB_TEST(test2.number_of_arguments() == 2);
                DLIB_TEST(test2[0] == _dT(ct,"arg1"));
                DLIB_TEST(test2[1] == _dT(ct,"arg2"));
                DLIB_TEST(test2.option(_dT(ct,"d")).count()==0);
                DLIB_TEST(test2.option(_dT(ct,"davis")).count()==1);
                DLIB_TEST(test2.option(_dT(ct,"c")).count()==1);
                DLIB_TEST(test2.option(_dT(ct,"Z")).count()==1);
                DLIB_TEST(test2.option(_dT(ct,"Z")).argument(1,0) == _dT(ct,"asdf"));
                DLIB_TEST_MSG(test2.option(_dT(ct,"Z")).argument(0,0) == _dT(ct,"zarg"),
                             narrow(_dT(ct,"*") + test2.option(_dT(ct,"Z")).argument(0,0) + _dT(ct,"*")));


            }





            // program arg1 --davis= darg darg2 arg2 -cZzarg asdf
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--davis=");
            argv[3] = _dT(ct,"darg");
            argv[4] = _dT(ct,"darg2");
            argv[5] = _dT(ct,"arg2");
            argv[6] = _dT(ct,"-cZzarg");
            argv[7] = _dT(ct,"asdf");
            argc = 8;


            test.add_option(_dT(ct,"davis"),_dT(ct,"davis option"), 2);
            test.add_option(_dT(ct,"c"),_dT(ct,"c option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            for (int k = 0; k < 5; ++k)
            {

                try { test.parse(argc,argv); }
                catch (error& e)
                {
                    DLIB_TEST_MSG(false,e.info);
                }

                DLIB_TEST(test.parsed_line());

                int count = 0;
                while (test.move_next())
                {
                    ++count;
                    if (test.element().name() == _dT(ct,"d"))
                    {
                        DLIB_TEST(test.element().count() == 0);
                    }
                    else
                    {                            
                        DLIB_TEST(test.element().count() == 1);
                    }

                }
                DLIB_TEST_MSG(count == 4,count);

                DLIB_TEST(test.option(_dT(ct,"davis")).name() == _dT(ct,"davis"));
                DLIB_TEST(test.option(_dT(ct,"c")).name() == _dT(ct,"c"));
                DLIB_TEST(test.option(_dT(ct,"Z")).name() == _dT(ct,"Z"));
                DLIB_TEST(test.option(_dT(ct,"davis")).number_of_arguments() == 2);
                DLIB_TEST(test.option(_dT(ct,"c")).number_of_arguments() == 0);
                DLIB_TEST(test.option(_dT(ct,"Z")).number_of_arguments() == 2);
                DLIB_TEST(test.number_of_arguments() == 2);
                DLIB_TEST(test[0] == _dT(ct,"arg1"));
                DLIB_TEST(test[1] == _dT(ct,"arg2"));
                DLIB_TEST(test.option(_dT(ct,"d")).count()==0);
                DLIB_TEST(test.option(_dT(ct,"davis")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"c")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(0,0) == _dT(ct,"zarg"));
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(1,0) == _dT(ct,"asdf"));
                DLIB_TEST(test.option(_dT(ct,"davis")).argument(0,0) == _dT(ct,"darg"));
                DLIB_TEST_MSG(test.option(_dT(ct,"davis")).argument(1,0) == _dT(ct,"darg2"),
                             narrow(test.option(_dT(ct,"davis")).argument(1,0)));
            }










            test.clear();







            // program arg1 --dav-is=darg darg2 arg2 -cZzarg asdf
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--dav-is=darg");
            argv[3] = _dT(ct,"darg2");
            argv[4] = _dT(ct,"arg2");
            argv[5] = _dT(ct,"-cZzarg");
            argv[6] = _dT(ct,"asdf");
            argc = 7;


            test.add_option(_dT(ct,"dav-is"),_dT(ct,"davis option"), 2);
            test.add_option(_dT(ct,"c"),_dT(ct,"c option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            for (int k = 0; k < 5; ++k)
            {

                try { test.parse(argc,argv); }
                catch (error& e)
                {
                    DLIB_TEST_MSG(false,e.info);
                }

                DLIB_TEST(test.parsed_line());

                int count = 0;
                while (test.move_next())
                {
                    ++count;
                    if (test.element().name() == _dT(ct,"d"))
                    {
                        DLIB_TEST(test.element().count() == 0);
                    }
                    else
                    {                            
                        DLIB_TEST(test.element().count() == 1);
                    }

                }
                DLIB_TEST_MSG(count == 4,count);

                DLIB_TEST(test.option(_dT(ct,"dav-is")).name() == _dT(ct,"dav-is"));
                DLIB_TEST(test.option(_dT(ct,"c")).name() == _dT(ct,"c"));
                DLIB_TEST(test.option(_dT(ct,"Z")).name() == _dT(ct,"Z"));
                DLIB_TEST(test.option(_dT(ct,"dav-is")).number_of_arguments() == 2);
                DLIB_TEST(test.option(_dT(ct,"c")).number_of_arguments() == 0);
                DLIB_TEST(test.option(_dT(ct,"Z")).number_of_arguments() == 2);
                DLIB_TEST(test.number_of_arguments() == 2);
                DLIB_TEST(test[0] == _dT(ct,"arg1"));
                DLIB_TEST(test[1] == _dT(ct,"arg2"));
                DLIB_TEST(test.option(_dT(ct,"d")).count()==0);
                DLIB_TEST(test.option(_dT(ct,"dav-is")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"c")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(0,0) == _dT(ct,"zarg"));
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(1,0) == _dT(ct,"asdf"));
                DLIB_TEST(test.option(_dT(ct,"dav-is")).argument(0,0) == _dT(ct,"darg"));
                DLIB_TEST_MSG(test.option(_dT(ct,"dav-is")).argument(1,0) == _dT(ct,"darg2"),
                             narrow(test.option(_dT(ct,"dav-is")).argument(1,0)));
            }









            test.clear();







            // program arg1 --davis=darg darg2 arg2 -cZzarg asdf
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--davis=darg");
            argv[3] = _dT(ct,"darg2");
            argv[4] = _dT(ct,"arg2");
            argv[5] = _dT(ct,"-cZzarg");
            argv[6] = _dT(ct,"asdf");
            argc = 7;


            test.add_option(_dT(ct,"davis"),_dT(ct,"davis option"), 2);
            test.add_option(_dT(ct,"c"),_dT(ct,"c option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            for (int k = 0; k < 5; ++k)
            {

                try { test.parse(argc,argv); }
                catch (error& e)
                {
                    DLIB_TEST_MSG(false,e.info);
                }

                DLIB_TEST(test.parsed_line());

                int count = 0;
                while (test.move_next())
                {
                    ++count;
                    if (test.element().name() == _dT(ct,"d"))
                    {
                        DLIB_TEST(test.element().count() == 0);
                    }
                    else
                    {                            
                        DLIB_TEST(test.element().count() == 1);
                    }

                }
                DLIB_TEST_MSG(count == 4,count);

                DLIB_TEST(test.option(_dT(ct,"davis")).name() == _dT(ct,"davis"));
                DLIB_TEST(test.option(_dT(ct,"c")).name() == _dT(ct,"c"));
                DLIB_TEST(test.option(_dT(ct,"Z")).name() == _dT(ct,"Z"));
                DLIB_TEST(test.option(_dT(ct,"davis")).number_of_arguments() == 2);
                DLIB_TEST(test.option(_dT(ct,"c")).number_of_arguments() == 0);
                DLIB_TEST(test.option(_dT(ct,"Z")).number_of_arguments() == 2);
                DLIB_TEST(test.number_of_arguments() == 2);
                DLIB_TEST(test[0] == _dT(ct,"arg1"));
                DLIB_TEST(test[1] == _dT(ct,"arg2"));
                DLIB_TEST(test.option(_dT(ct,"d")).count()==0);
                DLIB_TEST(test.option(_dT(ct,"davis")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"c")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(0,0) == _dT(ct,"zarg"));
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(1,0) == _dT(ct,"asdf"));
                DLIB_TEST(test.option(_dT(ct,"davis")).argument(0,0) == _dT(ct,"darg"));
                DLIB_TEST_MSG(test.option(_dT(ct,"davis")).argument(1,0) == _dT(ct,"darg2"),
                             narrow(test.option(_dT(ct,"davis")).argument(1,0)));
            }









            test.clear();







            // program arg1 --davis=darg arg2 -cZzarg asdf
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--davis=darg");
            argv[3] = _dT(ct,"arg2");
            argv[4] = _dT(ct,"-cZzarg");
            argv[5] = _dT(ct,"asdf");
            argc = 6;


            test.add_option(_dT(ct,"davis"),_dT(ct,"davis option"), 1);
            test.add_option(_dT(ct,"c"),_dT(ct,"c option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            for (int k = 0; k < 5; ++k)
            {

                try { test.parse(argc,argv); }
                catch (error& e)
                {
                    DLIB_TEST_MSG(false,e.info);
                }

                DLIB_TEST(test.parsed_line());

                int count = 0;
                while (test.move_next())
                {
                    ++count;
                    if (test.element().name() == _dT(ct,"d"))
                    {
                        DLIB_TEST(test.element().count() == 0);
                    }
                    else
                    {                            
                        DLIB_TEST(test.element().count() == 1);
                    }

                }
                DLIB_TEST_MSG(count == 4,count);

                DLIB_TEST(test.option(_dT(ct,"davis")).name() == _dT(ct,"davis"));
                DLIB_TEST(test.option(_dT(ct,"c")).name() == _dT(ct,"c"));
                DLIB_TEST(test.option(_dT(ct,"Z")).name() == _dT(ct,"Z"));
                DLIB_TEST(test.option(_dT(ct,"davis")).number_of_arguments() == 1);
                DLIB_TEST(test.option(_dT(ct,"c")).number_of_arguments() == 0);
                DLIB_TEST(test.option(_dT(ct,"Z")).number_of_arguments() == 2);
                DLIB_TEST(test.number_of_arguments() == 2);
                DLIB_TEST(test[0] == _dT(ct,"arg1"));
                DLIB_TEST(test[1] == _dT(ct,"arg2"));
                DLIB_TEST(test.option(_dT(ct,"d")).count()==0);
                DLIB_TEST(test.option(_dT(ct,"davis")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"c")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(0,0) == _dT(ct,"zarg"));
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(1,0) == _dT(ct,"asdf"));
                DLIB_TEST(test.option(_dT(ct,"davis")).argument(0,0) == _dT(ct,"darg"));
            }









            test.clear();






            // program arg1 --davis darg arg2 -cZzarg asdf
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--davis");
            argv[3] = _dT(ct,"darg");
            argv[4] = _dT(ct,"arg2");
            argv[5] = _dT(ct,"-cZzarg");
            argv[6] = _dT(ct,"asdf");
            argc = 7;


            test.add_option(_dT(ct,"davis"),_dT(ct,"davis option"), 1);
            test.add_option(_dT(ct,"c"),_dT(ct,"c option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            for (int k = 0; k < 5; ++k)
            {

                try { test.parse(argc,argv); }
                catch (error& e)
                {
                    DLIB_TEST_MSG(false,e.info);
                }

                DLIB_TEST(test.parsed_line());

                int count = 0;
                while (test.move_next())
                {
                    ++count;
                    if (test.element().name() == _dT(ct,"d"))
                    {
                        DLIB_TEST(test.element().count() == 0);
                    }
                    else
                    {                            
                        DLIB_TEST(test.element().count() == 1);
                    }

                }
                DLIB_TEST_MSG(count == 4,count);

                DLIB_TEST(test.option(_dT(ct,"davis")).name() == _dT(ct,"davis"));
                DLIB_TEST(test.option(_dT(ct,"c")).name() == _dT(ct,"c"));
                DLIB_TEST(test.option(_dT(ct,"Z")).name() == _dT(ct,"Z"));
                DLIB_TEST(test.option(_dT(ct,"davis")).number_of_arguments() == 1);
                DLIB_TEST(test.option(_dT(ct,"c")).number_of_arguments() == 0);
                DLIB_TEST(test.option(_dT(ct,"Z")).number_of_arguments() == 2);
                DLIB_TEST(test.number_of_arguments() == 2);
                DLIB_TEST(test[0] == _dT(ct,"arg1"));
                DLIB_TEST(test[1] == _dT(ct,"arg2"));
                DLIB_TEST(test.option(_dT(ct,"d")).count()==0);
                DLIB_TEST(test.option(_dT(ct,"davis")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"c")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(0,0) == _dT(ct,"zarg"));
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(1) == _dT(ct,"asdf"));
                DLIB_TEST(test.option(_dT(ct,"davis")).argument(0,0) == _dT(ct,"darg"));
            }









            test.clear();

            // this string is incorrect because there is no avis option
            // program arg1 --avis darg arg2 -cZzarg asdf
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--avis");
            argv[3] = _dT(ct,"darg");
            argv[4] = _dT(ct,"arg2");
            argv[5] = _dT(ct,"-cZzarg");
            argv[6] = _dT(ct,"asdf");
            argc = 7;


            test.add_option(_dT(ct,"davis"),_dT(ct,"davis option"), 1);
            test.add_option(_dT(ct,"c"),_dT(ct,"c option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            for (int k = 0; k < 5; ++k)
            {

                ok = false;
                try { test.parse(argc,argv); }
                catch (typename clp::cmd_line_parse_error& e)
                {
                    DLIB_TEST(e.type == EINVALID_OPTION);
                    DLIB_TEST(e.item == _dT(ct,"avis"));
                    ok = true;
                }
                DLIB_TEST(ok);


            }











            test.clear();

            // the c argument appears twice.  make sure its count is correct
            // program arg1 --davis darg arg2 -ccZzarg asdf
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--davis");
            argv[3] = _dT(ct,"darg");
            argv[4] = _dT(ct,"arg2");
            argv[5] = _dT(ct,"-ccZ");
            argv[6] = _dT(ct,"zarg");
            argv[7] = _dT(ct,"asdf");
            argc = 8;


            test.add_option(_dT(ct,"davis"),_dT(ct,"davis option"), 1);
            test.add_option(_dT(ct,"c"),_dT(ct,"c option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            for (int k = 0; k < 5; ++k)
            {

                ok = false;
                test.parse(argc,argv); 

                DLIB_TEST(test.option(_dT(ct,"c")).count()==2);

            }















            test.clear();

            // this is a bad line because the davis argument requires 2 arguments but
            // only gets one. 
            // program arg1 --davis darg darg2 --davis zarg 
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--davis");
            argv[3] = _dT(ct,"darg");
            argv[4] = _dT(ct,"darg2");
            argv[5] = _dT(ct,"--davis");
            argv[6] = _dT(ct,"zarg");
            argc = 7;


            test.add_option(_dT(ct,"davis"),_dT(ct,"davis option"), 2);
            test.add_option(_dT(ct,"b"),_dT(ct,"b option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            DLIB_TEST(test.option(_dT(ct,"davis")).description() == _dT(ct,"davis option"));
            DLIB_TEST(test.option(_dT(ct,"b")).description() == _dT(ct,"b option"));
            DLIB_TEST(test.option(_dT(ct,"d")).description() == _dT(ct,"d option"));
            DLIB_TEST(test.option(_dT(ct,"Z")).description() == _dT(ct,"Z option"));

            for (int k = 0; k < 5; ++k)
            {

                ok = false;
                try { test.parse(argc,argv); }
                catch (typename clp::cmd_line_parse_error& e)
                {
                    DLIB_TEST(e.type == ETOO_FEW_ARGS);
                    DLIB_TEST(e.num == 2);
                    DLIB_TEST(e.item == _dT(ct,"davis"));
                    ok = true;
                }
                DLIB_TEST(ok);



                int count = 0;
                while (test.move_next())
                {
                    ++count;
                    DLIB_TEST(test.element().count() == 0);
                    DLIB_TEST(test.option_is_defined(test.element().name()));
                }
                DLIB_TEST_MSG(count == 4,count);


            }


















            test.clear();

            // this is a bad line because the davis argument is not defined
            // program arg1 --davis darg arg2 -davis zarg asdf
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--davis");
            argv[3] = _dT(ct,"darg");
            argv[4] = _dT(ct,"arg2");
            argv[5] = _dT(ct,"--davis");
            argv[6] = _dT(ct,"zarg");
            argv[7] = _dT(ct,"asdf");
            argc = 8;


			DLIB_TEST(std::basic_string<ct>(argv[0]) == _dT(ct,"program"));

            test.add_option(_dT(ct,"mavis"),_dT(ct,"mavis option"), 1);
            test.add_option(_dT(ct,"b"),_dT(ct,"b option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            DLIB_TEST(test.option(_dT(ct,"mavis")).description() == _dT(ct,"mavis option"));
            DLIB_TEST(test.option(_dT(ct,"b")).description() == _dT(ct,"b option"));
            DLIB_TEST(test.option(_dT(ct,"d")).description() == _dT(ct,"d option"));
            DLIB_TEST(test.option(_dT(ct,"Z")).description() == _dT(ct,"Z option"));

            for (int k = 0; k < 5; ++k)
            {

                ok = false;
                try { test.parse(argc,argv); }
                catch (typename clp::cmd_line_parse_error& e)
                {
                    DLIB_TEST(e.type == EINVALID_OPTION);
                    DLIB_TEST(e.item == _dT(ct,"davis"));
                    ok = true;
                }
                DLIB_TEST(ok);



                int count = 0;
                while (test.move_next())
                {
                    ++count;
                    DLIB_TEST(test.element().count() == 0);
                    DLIB_TEST(test.option_is_defined(test.element().name()));
                }
                DLIB_TEST_MSG(count == 4,count);


            }















            test.clear();


            argv[0] = _dT(ct,"program");
            argc = 1;


            test.add_option(_dT(ct,"davis"),_dT(ct,"davis option"), 1);
            test.add_option(_dT(ct,"c"),_dT(ct,"c option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),2);


            DLIB_TEST(test.option(_dT(ct,"davis")).description() == _dT(ct,"davis option"));
            DLIB_TEST(test.option(_dT(ct,"c")).description() == _dT(ct,"c option"));
            DLIB_TEST(test.option(_dT(ct,"d")).description() == _dT(ct,"d option"));
            DLIB_TEST(test.option(_dT(ct,"Z")).description() == _dT(ct,"Z option"));

            for (int k = 0; k < 5; ++k)
            {

                test.parse(argc,argv); 


                DLIB_TEST(test.number_of_arguments() == 0);

                int count = 0;
                while (test.move_next())
                {
                    ++count;
                    DLIB_TEST(test.element().count() == 0);
                    DLIB_TEST(test.option_is_defined(test.element().name()));
                }
                DLIB_TEST_MSG(count == 4,count);


            }












            test.clear();

            // this is to make sure the -- command works right
            // program arg1 --davis -darg -- arg2 -c asdf -Zeat -Zat -Zjoe's
            argv[0] = _dT(ct,"program");
            argv[1] = _dT(ct,"arg1");
            argv[2] = _dT(ct,"--davis");
            argv[3] = _dT(ct,"-darg");
            argv[4] = _dT(ct,"-Zeat");
            argv[5] = _dT(ct,"-Zat");
            argv[6] = _dT(ct,"-Zjoe's");
            argv[7] = _dT(ct,"--");
            argv[8] = _dT(ct,"arg2");
            argv[9] = _dT(ct,"-c");
            argv[10] = _dT(ct,"asdf");

            argc = 11;


            test.add_option(_dT(ct,"davis"),_dT(ct,"davis option"), 1);
            test.add_option(_dT(ct,"c"),_dT(ct,"c option"));
            test.add_option(_dT(ct,"d"),_dT(ct,"d option"));
            test.add_option(_dT(ct,"Z"),_dT(ct,"Z option"),1);


            DLIB_TEST(test.option(_dT(ct,"davis")).description() == _dT(ct,"davis option"));
            DLIB_TEST(test.option(_dT(ct,"c")).description() == _dT(ct,"c option"));
            DLIB_TEST(test.option(_dT(ct,"d")).description() == _dT(ct,"d option"));
            DLIB_TEST(test.option(_dT(ct,"Z")).description() == _dT(ct,"Z option"));

            for (int k = 0; k < 5; ++k)
            {

                test.parse(argc,argv);

                DLIB_TEST_MSG(test.number_of_arguments() == 4,test.number_of_arguments());
                DLIB_TEST(test[0] == _dT(ct,"arg1"));
                DLIB_TEST(test[1] == _dT(ct,"arg2"));
                DLIB_TEST(test[2] == _dT(ct,"-c"));
                DLIB_TEST(test[3] == _dT(ct,"asdf"));

                DLIB_TEST(test.option(_dT(ct,"davis")).count()==1);
                DLIB_TEST(test.option(_dT(ct,"davis")).argument() == _dT(ct,"-darg"));
                DLIB_TEST(test.option(_dT(ct,"c")).count()==0);
                DLIB_TEST(test.option(_dT(ct,"d")).count()==0);
                DLIB_TEST(test.option(_dT(ct,"Z")).count()==3);

                DLIB_TEST(test.option(_dT(ct,"Z")).argument(0,0) == _dT(ct,"eat"));
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(0,1) == _dT(ct,"at"));
                DLIB_TEST(test.option(_dT(ct,"Z")).argument(0,2) == _dT(ct,"joe's"));


            }


        }
    }

}


#endif // DLIB_CMD_LINE_PARSER_KERNEl_TEST_H_

