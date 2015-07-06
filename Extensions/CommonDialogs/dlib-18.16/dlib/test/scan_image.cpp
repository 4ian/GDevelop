// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include "dlib/image_processing.h"

#include "dlib/test/tester.h"

#include "dlib/image_transforms.h"
#include "dlib/pixel.h"
#include "dlib/array2d.h"
#include "dlib/array.h"

// ----------------------------------------------------------------------------------------

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    using dlib::array;

    // Declare the logger we will use in this test.  The name of the tester 
    // should start with "test."
    logger dlog("test.scan_image");

// ----------------------------------------------------------------------------------------

    template <typename image_type1, typename image_type2>
    void sum_filter_i (
        const image_type1& img,
        image_type2& out,
        const rectangle& rect
    )
    {
        typedef typename image_type1::type pixel_type;
        typedef typename promote<pixel_type>::type ptype;
        integral_image_generic<ptype> iimg;
        iimg.load(img);
        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                const rectangle temp = translate_rect(rect, point(c,r)).intersect(get_rect(iimg));
                if (temp.is_empty() == false)
                    out[r][c] += iimg.get_sum_of_area(temp);
            }
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    void scan_image_i (
        std::vector<std::pair<double, point> >& dets,
        const image_array_type& images,
        const std::vector<std::pair<unsigned int, rectangle> >& rects,
        const double thresh,
        const unsigned long max_dets
    )
    {
        typedef typename image_array_type::type::type pixel_type;
        typedef typename promote<pixel_type>::type ptype;
        array<integral_image_generic<ptype> > iimg;
        iimg.set_max_size(images.size());
        iimg.set_size(images.size());

        for (unsigned long i = 0; i < iimg.size(); ++i)
            iimg[i].load(images[i]);


        dets.clear();


        for (long r = 0; r < images[0].nr(); ++r)
        {
            for (long c = 0; c < images[0].nc(); ++c)
            {
                ptype temp = 0;
                for (unsigned long i = 0; i < rects.size(); ++i)
                {
                    rectangle rtemp = translate_rect(rects[i].second,point(c,r)).intersect(get_rect(images[0]));
                    if (rtemp.is_empty() == false)
                        temp += iimg[rects[i].first].get_sum_of_area(rtemp);
                }
                if (temp > thresh)
                {
                    dets.push_back(std::make_pair(temp, point(c,r)));

                    if (dets.size() >= max_dets)
                        return;

                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    void scan_image_old (
        std::vector<std::pair<double, point> >& dets,
        const image_array_type& images,
        const std::vector<std::pair<unsigned int, rectangle> >& rects,
        const double thresh,
        const unsigned long max_dets
    )
    {
        dets.clear();
        if (max_dets == 0)
            return;

        typedef typename image_array_type::type::type pixel_type;
        typedef typename promote<pixel_type>::type ptype;

        std::vector<std::vector<ptype> > column_sums(rects.size());
        for (unsigned long i = 0; i < column_sums.size(); ++i)
        {
            const typename image_array_type::type& img = images[rects[i].first];
            column_sums[i].resize(img.nc() + rects[i].second.width(),0);

            const long top    = -1 + rects[i].second.top();
            const long bottom = -1 + rects[i].second.bottom();
            long left = rects[i].second.left()-1;

            // initialize column_sums[i] at row -1
            for (unsigned long j = 0; j < column_sums[i].size(); ++j)
            {
                rectangle strip(left,top,left,bottom);
                strip = strip.intersect(get_rect(img));
                if (!strip.is_empty())
                {
                    column_sums[i][j] = sum(matrix_cast<ptype>(subm(mat(img),strip)));
                }

                ++left;
            }
        }


        const rectangle area = get_rect(images[0]);

        for (long r = 0; r < images[0].nr(); ++r)
        {
            // set to sum at point(-1,r). i.e. should be equal to sum_of_rects_in_images(images, rects, point(-1,r))
            // We compute it's value in the next loop.
            ptype cur_sum = 0;
                            
            // Update the first part of column_sums since we only work on the c+width part of column_sums
            // in the main loop.
            for (unsigned long i = 0; i < rects.size(); ++i)
            {
                const typename image_array_type::type& img = images[rects[i].first];
                const long top    = r + rects[i].second.top() - 1;
                const long bottom = r + rects[i].second.bottom();
                const long width  = rects[i].second.width();
                for (long k = 0; k < width; ++k)
                {
                    const long right  = k-width + rects[i].second.right();

                    const ptype br_corner = area.contains(right,bottom) ? img[bottom][right] : 0;
                    const ptype tr_corner = area.contains(right,top)    ? img[top][right]    : 0;
                    // update the sum in this column now that we are on the next row
                    column_sums[i][k] = column_sums[i][k] + br_corner - tr_corner;
                    cur_sum += column_sums[i][k];
                }
            }

            for (long c = 0; c < images[0].nc(); ++c)
            {
                for (unsigned long i = 0; i < rects.size(); ++i)
                {
                    const typename image_array_type::type& img = images[rects[i].first];
                    const long top    = r + rects[i].second.top() - 1;
                    const long bottom = r + rects[i].second.bottom();
                    const long right  = c + rects[i].second.right();
                    const long width  =     rects[i].second.width();

                    const ptype br_corner = area.contains(right,bottom) ? img[bottom][right] : 0;
                    const ptype tr_corner = area.contains(right,top)    ? img[top][right]    : 0;
                    // update the sum in this column now that we are on the next row
                    column_sums[i][c+width] = column_sums[i][c+width] + br_corner - tr_corner;


                    // add in the new right side of the rect and subtract the old right side.
                    cur_sum = cur_sum + column_sums[i][c+width] - column_sums[i][c];
                    
                }

                if (cur_sum > thresh)
                {
                    dets.push_back(std::make_pair(cur_sum, point(c,r)));

                    if (dets.size() >= max_dets)
                        return;
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void run_test1()
    {
        dlog << LINFO << "run_test1()";

        print_spinner();
        array2d<unsigned char> img, temp_img;
        img.set_size(600,600);
        assign_all_pixels(img,0);
        rectangle rect = centered_rect(10,10,5,5);
        dlog << LTRACE << "expected: 10,10";
        fill_rect(img, rect, 255); 


        array<array2d<unsigned char> > images;
        std::vector<std::pair<unsigned int, rectangle> > rects;
        for (int i = 0; i < 10; ++i)
        {
            assign_image(temp_img, img);
            images.push_back(temp_img);
            rects.push_back(make_pair(i,centered_rect(0,0,5,5)));
        }

        std::vector<std::pair<double, point> > dets, dets2, dets3;


        dlog << LTRACE << "best score: "<< sum_of_rects_in_images(images,rects,point(10,10));
        scan_image(dets,images,rects,30000, 100);
        scan_image_i(dets2,images,rects,30000, 100);
        scan_image_old(dets3,images,rects,30000, 100);



        dlog << LTRACE << "dets.size(): "<< dets.size();
        dlog << LTRACE << "dets2.size(): "<< dets2.size();
        dlog << LTRACE << "dets3.size(): "<< dets3.size();

        DLIB_TEST(dets.size() == dets2.size());
        DLIB_TEST(dets.size() == dets3.size());

        for (unsigned long i = 0; i < dets.size(); ++i)
        {
            //dlog << LTRACE << "dets["<<i<<"]: " << dets[i].second << "  -> " << dets[i].first;
            //dlog << LTRACE << "dets2["<<i<<"]: " << dets2[i].second << "  -> " << dets2[i].first;
            //dlog << LTRACE << "dets3["<<i<<"]: " << dets3[i].second << "  -> " << dets3[i].first;

            DLIB_TEST(sum_of_rects_in_images(images, rects, dets[i].second) == dets[i].first);
            DLIB_TEST(sum_of_rects_in_images(images, rects, dets2[i].second) == dets2[i].first);
            DLIB_TEST(sum_of_rects_in_images(images, rects, dets3[i].second) == dets3[i].first);
        }


    }

// ----------------------------------------------------------------------------------------

    void run_test2()
    {
        print_spinner();
        dlog << LINFO << "run_test2()";
        array2d<unsigned char> img, temp_img;
        img.set_size(600,600);
        assign_all_pixels(img,0);
        rectangle rect = centered_rect(10,11,5,6);
        dlog << LTRACE << "expected: 10,11";
        fill_rect(img, rect, 255); 


        array<array2d<unsigned char> > images;
        std::vector<std::pair<unsigned int, rectangle> > rects;
        for (int i = 0; i < 10; ++i)
        {
            assign_image(temp_img, img);
            images.push_back(temp_img);
            rects.push_back(make_pair(i,centered_rect(0,0,5,5)));
            rects.push_back(make_pair(i,centered_rect(3,2,5,6)));
        }

        std::vector<std::pair<double, point> > dets, dets2, dets3;


        scan_image(dets,images,rects,30000, 100);
        scan_image_i(dets2,images,rects,30000, 100);
        scan_image_old(dets3,images,rects,30000, 100);



        dlog << LTRACE << "dets.size(): "<< dets.size();
        dlog << LTRACE << "dets2.size(): "<< dets2.size();
        dlog << LTRACE << "dets3.size(): "<< dets3.size();

        DLIB_TEST(dets.size() == dets2.size());
        DLIB_TEST(dets.size() == dets3.size());

        for (unsigned long i = 0; i < dets.size(); ++i)
        {
            //dlog << LTRACE << "dets["<<i<<"]: " << dets[i].second << "  -> " << dets[i].first;
            //dlog << LTRACE << "dets2["<<i<<"]: " << dets2[i].second << "  -> " << dets2[i].first;
            //dlog << LTRACE << "dets3["<<i<<"]: " << dets3[i].second << "  -> " << dets3[i].first;

            DLIB_TEST(sum_of_rects_in_images(images, rects, dets[i].second) == dets[i].first);
            DLIB_TEST(sum_of_rects_in_images(images, rects, dets2[i].second) == dets2[i].first);
            DLIB_TEST(sum_of_rects_in_images(images, rects, dets3[i].second) == dets3[i].first);
        }


    }

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void run_test3(const double thresh)
    {
        dlog << LINFO << "running run_test3("<<thresh<<")";
        dlib::rand rnd;

        rnd.set_seed("235");

        array<array2d<pixel_type> > images;
        images.resize(1);
        images[0].set_size(200,180);

        for (int iter = 0; iter < 50; ++iter)
        {
            print_spinner();
            assign_all_pixels(images[0], thresh - 0.0001);

            for (int i = 0; i < 20; ++i)
            {
                point p1(rnd.get_random_32bit_number()%images[0].nc(),
                         rnd.get_random_32bit_number()%images[0].nr());
                point p2(rnd.get_random_32bit_number()%images[0].nc(),
                         rnd.get_random_32bit_number()%images[0].nr());

                rectangle rect(p1,p2);
                fill_rect(images[0], rect, static_cast<pixel_type>(rnd.get_random_double()*10 - 5));
            }

            std::vector<std::pair<unsigned int, rectangle> > rects;
            rects.push_back(make_pair(0,centered_rect(0,0,1+rnd.get_random_32bit_number()%40,1+rnd.get_random_32bit_number()%40)));
            rects.push_back(make_pair(0,centered_rect(0,0,1+rnd.get_random_32bit_number()%40,1+rnd.get_random_32bit_number()%40)));




            std::vector<std::pair<double, point> > dets, dets2, dets3;
            scan_image(dets,images,rects,thresh, 100);
            scan_image_i(dets2,images,rects,thresh, 100);
            scan_image_old(dets3,images,rects,thresh, 100);

            dlog << LTRACE << "dets.size(): "<< dets.size();
            dlog << LTRACE << "dets2.size(): "<< dets2.size();
            dlog << LTRACE << "dets3.size(): "<< dets3.size();

            DLIB_TEST(dets.size() == dets2.size());
            DLIB_TEST(dets.size() == dets3.size());

            for (unsigned long i = 0; i < dets.size(); ++i)
            {
                //dlog << LTRACE << "dets["<<i<<"]: " << dets[i].second << "  -> " << dets[i].first;
                //dlog << LTRACE << "dets2["<<i<<"]: " << dets2[i].second << "  -> " << dets2[i].first;
                //dlog << LTRACE << "dets3["<<i<<"]: " << dets3[i].second << "  -> " << dets3[i].first;

                DLIB_TEST_MSG(std::abs(sum_of_rects_in_images(images, rects, dets[i].second) - dets[i].first) < 1e-6,
                              "error: "<< sum_of_rects_in_images(images, rects, dets[i].second) - dets[i].first
                              << "   dets["<<i<<"].second: " << dets[i].second
                              );
                DLIB_TEST_MSG(std::abs(sum_of_rects_in_images(images, rects, dets2[i].second) - dets2[i].first) < 1e-6,
                              sum_of_rects_in_images(images, rects, dets2[i].second) - dets2[i].first
                              );
                DLIB_TEST_MSG(std::abs(sum_of_rects_in_images(images, rects, dets3[i].second) - dets3[i].first) < 1e-6,
                              "error: "<< sum_of_rects_in_images(images, rects, dets3[i].second) - dets3[i].first
                              << "   dets3["<<i<<"].first: " << dets3[i].first
                              << "   dets3["<<i<<"].second: " << dets3[i].second
                              );
            }

        }
    }

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void test_sum_filter (
    )
    {
        dlib::rand rnd;

        for (int k = 0; k < 20; ++k)
        {
            print_spinner();

            array2d<pixel_type> img(1 + rnd.get_random_32bit_number()%100,
                                    1 + rnd.get_random_32bit_number()%100);

            for (long r = 0; r < img.nr(); ++r)
            {
                for (long c = 0; c < img.nc(); ++c)
                {
                    img[r][c] = static_cast<pixel_type>(100*(rnd.get_random_double()-0.5));
                }
            }

            array2d<long> test1(img.nr(), img.nc());
            array2d<double> test2(img.nr(), img.nc());
            array2d<long> test1_i(img.nr(), img.nc());
            array2d<double> test2_i(img.nr(), img.nc());

            assign_all_pixels(test1, 0);
            assign_all_pixels(test2, 0);
            assign_all_pixels(test1_i, 0);
            assign_all_pixels(test2_i, 0);

            for (int i = 0; i < 10; ++i)
            {
                const long width  = rnd.get_random_32bit_number()%10 + 1;
                const long height = rnd.get_random_32bit_number()%10 + 1;
                const point p(rnd.get_random_32bit_number()%img.nc(),
                              rnd.get_random_32bit_number()%img.nr());

                const rectangle rect = centered_rect(p, width, height);
                sum_filter(img, test1, rect);
                sum_filter(img, test2, rect);
                sum_filter(img, test1_i, rect);
                sum_filter(img, test2_i, rect);

                DLIB_TEST(mat(test1) == mat(test1_i));
                DLIB_TEST(mat(test2) == mat(test2_i));
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1, 
        typename image_type2
        >
    void naive_max_filter (
        const image_type1& img,
        image_type2& out,
        const long width,
        const long height,
        typename image_type1::type thresh
        )
    {
        const rectangle area = get_rect(img);
        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                const rectangle win = centered_rect(point(c,r),width,height).intersect(area);
                out[r][c] += std::max(dlib::max(subm(mat(img),win)), thresh);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void test_max_filter(long rows, long cols, long width, long height, dlib::rand& rnd)
    {
        array2d<int> img(rows, cols);
        rectangle rect = centered_rect(0,0, width, height);

        array2d<int> out(img.nr(),img.nc());
        assign_all_pixels(out, 0);
        array2d<int> out2(img.nr(),img.nc());
        assign_all_pixels(out2, 0);

        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                img[r][c] = rnd.get_random_32bit_number();
            }
        }

        const int thresh = rnd.get_random_32bit_number();

        naive_max_filter(img, out2, rect.width(), rect.height(), thresh);
        max_filter(img, out, rect.width(), rect.height(), thresh);

        DLIB_TEST_MSG(mat(out) == mat(out2),
                                "rows: "<< rows 
                                << "\ncols: "<< rows 
                                << "\nwidth: "<< width 
                                << "\nheight: "<< height );
    }

// ----------------------------------------------------------------------------------------

    void test_max_filter()
    {
        dlib::rand rnd;
        for (int iter = 0; iter < 300; ++iter)
        {
            print_spinner();
            test_max_filter(0,0,1,1,rnd);
            test_max_filter(0,0,3,1,rnd);
            test_max_filter(0,0,3,3,rnd);
            test_max_filter(0,0,1,3,rnd);
            test_max_filter(1,1,1,1,rnd);
            test_max_filter(2,2,1,1,rnd);
            test_max_filter(3,3,1,1,rnd);
            test_max_filter(3,3,3,3,rnd);
            test_max_filter(3,3,2,2,rnd);
            test_max_filter(3,3,3,5,rnd);
            test_max_filter(3,3,6,8,rnd);
            test_max_filter(20,20,901,901,rnd);
            test_max_filter(5,5,1,5,rnd);
            test_max_filter(50,50,9,9,rnd);
            test_max_filter(50,50,9,9,rnd);
            test_max_filter(50,50,10,10,rnd);
            test_max_filter(50,50,11,10,rnd);
            test_max_filter(50,50,10,11,rnd);
            test_max_filter(50,50,10,21,rnd);
            test_max_filter(50,50,20,10,rnd);
            test_max_filter(50,50,20,10,rnd);
            test_max_filter(50,50,9,9,rnd);
            test_max_filter(20,20,1,901,rnd);
            test_max_filter(20,20,3,901,rnd);
            test_max_filter(20,20,901,1,rnd);
        }

        for (int iter = 0; iter < 200; ++iter)
        {
            print_spinner();
            test_max_filter((int)rnd.get_random_8bit_number()%100+1,
                            (int)rnd.get_random_8bit_number()%100+1,
                            (int)rnd.get_random_8bit_number()%150+1,
                            (int)rnd.get_random_8bit_number()%150+1,
                            rnd);
        }
    }

// ----------------------------------------------------------------------------------------

    void make_images (
        dlib::rand& rnd,
        array<array2d<unsigned char> >& images,
        long num,
        long nr,
        long nc
    )
    {
        images.resize(num);
        for (unsigned long i = 0; i < images.size(); ++i)
        {
            images[i].set_size(nr,nc);
        }

        for (unsigned long i = 0; i < images.size(); ++i)
        {
            for (long r = 0; r < nr; ++r)
            {
                for (long c = 0; c < nc; ++c)
                {
                    images[i][r][c] = rnd.get_random_8bit_number();
                }
            }
        }
    }


    template <
        typename image_array_type
        >
    void brute_force_scan_image_movable_parts (
        std::vector<std::pair<double, point> >& dets,
        const image_array_type& images,
        const rectangle& window,
        const std::vector<std::pair<unsigned int, rectangle> >& fixed_rects,
        const std::vector<std::pair<unsigned int, rectangle> >& movable_rects,
        const double thresh,
        const unsigned long 
    )
    {
        dets.clear();
        if (movable_rects.size() == 0 && fixed_rects.size() == 0)
            return;

        for (long r = 0; r < images[0].nr(); ++r)
        {
            for (long c = 0; c < images[0].nc(); ++c)
            {
                const point p(c,r);
                double score = sum_of_rects_in_images_movable_parts(images,
                                                                    window,
                                                                    fixed_rects,
                                                                    movable_rects,
                                                                    p); 

                if (score >= thresh)
                {
                    dets.push_back(make_pair(score,p));
                }
            }
        }
    }

    void test_scan_images_movable_parts()
    {
        array<array2d<unsigned char> > images;
        dlib::rand rnd;
        for (int iter = 0; iter < 40; ++iter)
        {
            print_spinner();
            const int num_images = rnd.get_random_32bit_number()%4+1;

            make_images(rnd,images, num_images, 
                        rnd.get_random_32bit_number()%50+1,
                        rnd.get_random_32bit_number()%50+1
                        );

            std::vector<std::pair<double,point> > dets1, dets2;
            std::vector<std::pair<unsigned int, rectangle> > fixed_rects, movable_rects;

            double total_area = 0;
            for (unsigned long i = 0; i < images.size(); ++i)
            {
                fixed_rects.push_back(make_pair(i, centered_rect(
                            rnd.get_random_32bit_number()%10-5,
                            rnd.get_random_32bit_number()%10-5,
                            rnd.get_random_32bit_number()%10,
                            rnd.get_random_32bit_number()%10
                            )));

                total_area += fixed_rects.back().second.area();

                movable_rects.push_back(make_pair(i, centered_rect(
                            0,
                            0,
                            rnd.get_random_32bit_number()%10+1,
                            rnd.get_random_32bit_number()%10+1
                            )));
                total_area += movable_rects.back().second.area();
            }

            const rectangle window = centered_rect(0,0, 
                                                rnd.get_random_32bit_number()%15+1,
                                                rnd.get_random_32bit_number()%15+1);
            dlog << LINFO << "window size: "<< window.width() << ", " << window.height();
            const double thresh = total_area*130;
            const unsigned long max_dets = get_rect(images[0]).area();

            scan_image_movable_parts(dets1,images,window,fixed_rects,movable_rects,thresh, max_dets);
            brute_force_scan_image_movable_parts(dets2,images,window,fixed_rects,movable_rects,thresh, max_dets);

            dlog << LINFO << "max_possible dets: " << max_dets;
            dlog << LINFO << "regular dets: " << dets1.size();
            dlog << LINFO << "brute force:  " << dets2.size();
            DLIB_TEST(dets1.size() == dets2.size());

            array2d<double> check(images[0].nr(), images[0].nc());
            assign_all_pixels(check, 1e-300);
            for (unsigned long i = 0; i < dets1.size(); ++i)
            {
                const point p = dets1[i].second;
                check[p.y()][p.x()] = dets1[i].first;
            }
            for (unsigned long i = 0; i < dets2.size(); ++i)
            {
                const point p = dets2[i].second;
                DLIB_TEST(std::abs(check[p.y()][p.x()] - dets2[i].first) < 1e-10);
            }
            dlog << LINFO << "=======================\n";
        }
    }

// ----------------------------------------------------------------------------------------

    class scan_image_tester : public tester
    {
    public:
        scan_image_tester (
        ) :
            tester ("test_scan_image",
                    "Runs tests on the scan_image routine.")
        {}

        void perform_test (
        )
        {
            test_scan_images_movable_parts();
            test_max_filter();

            run_test1();
            run_test2();
            run_test3<unsigned char>(1);
            run_test3<unsigned char>(-1);
            run_test3<double>(1);
            run_test3<double>(-1);

            test_sum_filter<unsigned char>();
            test_sum_filter<double>();
        }
    } a;

}


