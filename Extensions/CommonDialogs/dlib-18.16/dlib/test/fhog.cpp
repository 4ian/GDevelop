// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/image_transforms.h>
#include <vector>
#include <sstream>
#include <dlib/compress_stream.h>
#include <dlib/base64.h>
#include <dlib/image_io.h>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.fhog");


    class fhog_tester : public tester
    {
    public:
        fhog_tester (
        ) :
            tester (
                "test_fhog",       // the command line argument name for this test
                "Run tests on the fhog functions.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }

        template <typename image_type>
        void test_fhog_interlaced(
            const image_type& img,
            const int sbin,
            const array2d<matrix<float,31,1> >& ref_hog
        )
        {
            array2d<matrix<float,31,1> > hog;
            extract_fhog_features(img, hog, sbin);

            DLIB_TEST(hog.nr() == ref_hog.nr());
            DLIB_TEST(hog.nc() == ref_hog.nc());
            for (long r = 0; r < hog.nr(); ++r)
            {
                for (long c = 0; c < hog.nc(); ++c)
                {
                    DLIB_TEST_MSG(max(abs(hog[r][c] - ref_hog[r][c])) < 1e-6, max(abs(hog[r][c] - ref_hog[r][c])));
                }
            }
        }

        template <typename image_type>
        void test_fhog_planar(
            const image_type& img,
            const int sbin,
            const array2d<matrix<float,31,1> >& ref_hog
        )
        {
            dlib::array<array2d<float> > hog;
            extract_fhog_features(img, hog, sbin);
            DLIB_TEST(hog.size() == 31);
            DLIB_TEST_MSG(hog[0].nr() == max(static_cast<int>(img.nr()/(double)sbin+0.5)-2,0),
                hog[0].nr() << "   " << max(static_cast<int>(img.nr()/(double)sbin+0.5)-2,0));
            DLIB_TEST(hog[0].nc() == max(static_cast<int>(img.nc()/(double)sbin+0.5)-2,0));

            DLIB_TEST(hog.size() == 31);
            for (long o = 0; o < (long)hog.size(); ++o)
            {
                DLIB_TEST(hog[o].nr() == ref_hog.nr());
                DLIB_TEST(hog[o].nc() == ref_hog.nc());
                for (long r = 0; r < hog[o].nr(); ++r)
                {
                    for (long c = 0; c < hog[o].nc(); ++c)
                    {
                        DLIB_TEST_MSG(std::abs(hog[o][r][c] - ref_hog[r][c](o)) < 1e-6, std::abs(hog[o][r][c] - ref_hog[r][c](o)));
                    }
                }
            }
        }

        void test_on_small()
        {
            print_spinner();
            array2d<unsigned char> img;
            dlib::array<array2d<float> > hog;

            // do this just to make sure it doesn't crash on small images
            for (int i = 0; i < 10; ++i)
            {
                img.set_size(i,i);
                assign_all_pixels(img, i);
                extract_fhog_features(img, hog);

                DLIB_TEST(hog.size() == 31);
                DLIB_TEST(hog[0].nr() == max(static_cast<int>(img.nr()/8.0+0.5)-2,0));
                DLIB_TEST(hog[0].nc() == max(static_cast<int>(img.nc()/8.0+0.5)-2,0));
            }
            for (int i = 1; i < 10; ++i)
            {
                img.set_size(i,i+1);
                assign_all_pixels(img, i);
                extract_fhog_features(img, hog);
                DLIB_TEST(hog.size() == 31);
                DLIB_TEST(hog[0].nr() == max(static_cast<int>(img.nr()/8.0+0.5)-2,0));
                DLIB_TEST(hog[0].nc() == max(static_cast<int>(img.nc()/8.0+0.5)-2,0));
            }
            for (int i = 1; i < 10; ++i)
            {
                img.set_size(i+1,i);
                assign_all_pixels(img, i);
                extract_fhog_features(img, hog);
                DLIB_TEST(hog.size() == 31);
                DLIB_TEST(hog[0].nr() == max(static_cast<int>(img.nr()/8.0+0.5)-2,0));
                DLIB_TEST(hog[0].nc() == max(static_cast<int>(img.nc()/8.0+0.5)-2,0));
            }
        }

        void test_point_transforms()
        {
            dlib::rand rnd;
            for (int iter = 0; iter < 100; ++iter)
            {
                for (int cell_size = 1; cell_size < 10; ++cell_size)
                {
                    print_spinner();
                    for (long i = -10; i <= 10; ++i)
                    {
                        for (long j = -10; j <= 10; ++j)
                        {
                            for (long k = -10; k <= 10; ++k)
                            {
                                for (long l = -10; l <= 10; ++l)
                                {
                                    rectangle rect(point(i,j), point(k,l));
                                    const int rows = rnd.get_random_32bit_number()%11+1;
                                    const int cols = rnd.get_random_32bit_number()%11+1;
                                    DLIB_TEST_MSG(rect == image_to_fhog(fhog_to_image(rect,cell_size,rows,cols),cell_size,rows,cols),
                                        " rows: "<< rows << 
                                        " cols: "<< cols << 
                                        " cell_size: "<< cell_size  <<
                                        " rect: "<< rect <<
                                        " irect: "<<fhog_to_image(rect,cell_size,rows,cols) <<
                                        " frect: "<< image_to_fhog(fhog_to_image(rect,cell_size,rows,cols),cell_size,rows,cols)
                                        );
                                }
                            }
                        }
                    }
                }
            }
        }


        void perform_test (
        )
        {
            test_point_transforms();
            test_on_small();

            print_spinner();
            // load the testing data
            array2d<rgb_pixel> img;
            array2d<unsigned char> gimg;
            dlog << LINFO << "get_decoded_string_face_dng()";
            istringstream sin(get_decoded_string_face_dng());
            load_dng(img, sin);
            assign_image(gimg, img);
            dlog << LINFO << "get_decoded_string_fhog_feats()";
            sin.str(get_decoded_string_fhog_feats());
            int sbin1, sbin2, gsbin1;
            array2d<matrix<float,31,1> > vhog1, vhog2, gvhog1;
            deserialize(sbin1, sin);
            deserialize(vhog1, sin);
            deserialize(sbin2, sin);
            deserialize(vhog2, sin);
            dlog << LINFO << "get_decoded_string_fhog_grayscale()";
            sin.str(get_decoded_string_fhog_grayscale());
            deserialize(gsbin1, sin);
            deserialize(gvhog1, sin);

            /*
            // code used to generate the saved feature data.
            ofstream fout1("feats1.dat", ios::binary);
            extract_fhog_features(img, vhog1, sbin1);
            extract_fhog_features(img, vhog2, sbin2);
            serialize(sbin1,fout1);
            serialize(vhog1,fout1);
            serialize(sbin2,fout1);
            serialize(vhog2,fout1);
            ofstream fout2("feats2.dat", ios::binary);
            extract_fhog_features(gimg, gvhog1, gsbin1);
            serialize(gsbin1,fout2);
            serialize(gvhog1,fout2);
            */

            // make sure the feature extractor always outputs the same answer
            dlog << LINFO << "1";
            test_fhog_planar(img, sbin1, vhog1);
            dlog << LINFO << "2";
            test_fhog_planar(img, sbin2, vhog2);
            dlog << LINFO << "3";
            test_fhog_planar(gimg, gsbin1, gvhog1);
            dlog << LINFO << "4";
            test_fhog_interlaced(img, sbin1, vhog1);
            dlog << LINFO << "5";
            test_fhog_interlaced(img, sbin2, vhog2);
            dlog << LINFO << "6";
            test_fhog_interlaced(gimg, gsbin1, gvhog1);

        }

        // This function returns the contents of the file 'face.dng'
        const std::string get_decoded_string_face_dng()
        {
            dlib::base64 base64_coder;
            dlib::compress_stream::kernel_1ea compressor;
            std::ostringstream sout;
            std::istringstream sin;

            // The base64 encoded data from the file 'face.dng' we want to decode and return.
            sout << "RFYXmMpdiStV6dVZSJkJX8t7GVavYwTD+Fn11ZjivhnFQyvVJ5t39yJYrK6Qh6K58ovzMlgPiBLV";
            sout << "nd+ZR0JYVCVvwRapp+dznB9SG9dJbBrsYH68k04uOs9ehP8aK4/EXvcZG6s+rL0rnhVAf7SxL7PT";
            sout << "r/11jIuASMa1daKZjAm5Sc1icGXG2FJjO6CxM8mOzWJ1ze69MPD1bz/QYAWtMUqUUIAM0qOPHY0x";
            sout << "T8tdU+Vo6S6E+8dJpV6a6iDdocbp91meDQcT0/kadhC2tmn0eZoNulTn5MtmsmEeuPI2lLLcRJ9P";
            sout << "yt3c/OJIzI8FaDzYG6aWJ/yBQx/DJF0avAlh7V1UmbD8O/dMoF9nUFDwnhGyS6DYfTXxCYgVgoj+";
            sout << "Ik5RLHY0U/DhNTciFaLX41/MyIt0xcGtxhoVcvwkfIigKnYQsYfNpRdUWseRlZ1KYaR4Oc5B2tie";
            sout << "kH3e5AhrY/HtffCah0sf6MBWJEi7CH9AnVLDQefL8Ph+qCWJGf7cGnM/oAaHQCzHIHVi+mK6EBnN";
            sout << "1NDrzbdXmikwYneB3LUZxCLKZmxsFduB2HgiS0A+tTK6IYc+jqCHqz8N6Gw0sSjAK7rrPDTvxhSN";
            sout << "lX3f6E2IDfVmyvk0l3RhuA1PNEh/nlKR+YxcXHyYW4wGf+UfWScAzKGxrHLxLC7LQycCEaCMkU92";
            sout << "SQV5NSSlwKYKACabK6UJ3gGIpvuQK2Aw7VWmC0iLczqgWsX0GKJR0FAcVL9Ed3nV0Wd0s5BkjBsr";
            sout << "RbUKzw11Qu0toj6BNfwXo/5cY2dtjj93a+CBfNrSEuFyJzZU7cn890c9m+q8C41p+wQdf4pFpjcV";
            sout << "8Kz40Fyt8KtxItWSsACIwmUO9h7DGnyGskWBYrxgDV2VVlvuPAnnSCFPkbdsa/pfnohUq0C5a/ii";
            sout << "BjASduPdaBHpjZ64f+TIaXNAGdrFiN61W6e3fOx4fLFlzPQ8szyWuuDh2hIz1FMflbmu6UOEkQji";
            sout << "w+bwDDJ5OUFmY/00+3B0XAFmj7Pt8OQ70lAVLcX5fC553diQJzrrlJ5p9/8+ILln+oleUVJhtp2q";
            sout << "VCZ9XknXLjkQik30M7orOj+tZt7HDgC5sz/wHU5arOL3nIX5IuIHBJRlB8dERZgoPNQlB090rItP";
            sout << "MuT+Hyr/eR7Kcux7Fy2CoMxcIfWEXvxQoolLKC66q4+SFirdMRjXuwbRXrUBbenmBfMMNDAOkQKO";
            sout << "Bi7d8t1wI9ulNbACtqLbmPjW6iabc0yM4g69cZjRx/JYhV5AaykROJxCP6ZKTw+3ddAht8xoyHLN";
            sout << "40rB40fwEXIvv7qxCdCa3h6l6IRV26fOLdcew1G0qjPORcKK1TPhzmneYvhPZ1m0r6KxWNEnYcFq";
            sout << "WhDGNxj/05eBy2qIiIU/KUPhxKyipF0ekgPoCsWT3S8edYjoaIl5cI0TNpNEwKGRLQeOLBDt+MEh";
            sout << "z1yKm0i2jrtxDBpYf5FW/Fln/XJAK6z9yqSDDTDwQleabvRHDH9bc54bLc0TL9g7/eIj9xcshhaB";
            sout << "zbi7baB/yUnI1+0N6CZ45gV3BcD5n2QLiHME8wELveiMxps6MTf3SdKSRZJcnoVfN4AGYqQV42ec";
            sout << "dFB9y8FLZVL3/8rmB+XEu6YoiGcNK6iATLYQfF0GFRrur0Q6bQgdvXv1uZKtNfYfznsAAu/KBdxX";
            sout << "8qskZBMGA3LxJC3j41VW6Fviy+XUxxcmG9ykbf0COJWDul6ZQ7iRI7rn9EpFIYBM1lKzjdC0UFTW";
            sout << "yDWEE+mf9y+RZdlxHdROFj93FNwzSdzNr1yjqHvZHBZYiuArHEuDPXdxqVRePcID4EHzmpDgWFwR";
            sout << "o5qqDxU8e9UYfS8SG545SPZv69SJVJKld5fQLZ4FbcCjv7wTwrOKTROvurKkxopKt1n69BdDA14H";
            sout << "mViSyK22xK/F7/ydjLoqx6aJ8xyNpoUk6XIeJ5Ei2Lhk84VQk9dxzULVy3KsfRUrZCTTi4YiXkHJ";
            sout << "SmQx4NQKqHR2IOgnJBZuNG9J3Fzv3NKhQpmKL0ZbYLXWdKP9FHWUR0x7y8f74Su+GrplBsjh9NIm";
            sout << "QdaKLa3NvJB1TML1/GNcdJVZUuSaX0cQn4bbumvtcENVbC9u99fGnsaS5FOu4AHd3338zLUMy34C";
            sout << "OpJjU1c/IElgyKmaGYlAolgqGU3lixhxPGBhUlXGfHmST2ZWq/l6NxD//HQXRaRUiQGQzWCvhzOO";
            sout << "ywUlVzl9eJ5e5cdLWvffsPRzBgRMrdHJG4TbSuLAREsSD9QEGab3a6y+qa8T3Si/1Ut+Sn2QvPh2";
            sout << "meqqk9g0fRWtrWxcnbUDU6zMlk36L/o/y5inrHdGY+ixIewhI0n4/Nl3wD96SRITcEVSx6K/BVot";
            sout << "+qIP78I6uk+miUF6MW4AnFyCe1wRNyhT48638KIphSQSKdu7TaBndi2DNgFFvWrm6/cPOqkmCzGC";
            sout << "O22uwHyuY9XhafswKLH02+VD24PIS/Fw7JMP+KzvfCHQd4XxxdsISe0/cjwg26ZfGcnULLY2E+dX";
            sout << "LjdgCxNyFBzFTQ4gB4QExF0dHu+SPoo5T3VAojJbYZqIelFY+u2yQDuS4HCUISPkwuLHXHbcBuwg";
            sout << "5TeuFhyBrlwxHQC/OPACmQJREImiqpzrjmh5QipeEgYHK3Zc72tYSeY7eTzS4jj0eRQ8KiNIGSi2";
            sout << "2LjzAfN2Zm7HGbiBtKZVen96E8HLcrd3nSWnizfaLLWTWB3zu9zz9/vFdaa3TlO6BidYsKomTCgB";
            sout << "wy8yMeykE2qbxgrpRqEqmOkrOI9XtTTJIycfAlwBwoFwuqvGIPtFrYmC/MwRMCphg7acSRcjZg81";
            sout << "5IEqpoq9ca7Zc3s4foteVMCJT1A+qmNAJ/j7IoyeX7GnlM3jsqpYt9BmKfbw5Dr2JB9vzroPV++x";
            sout << "UN2VXRPbahjbIvrTULpeBdmlHU0i3Ya8H/C9RY6c2DhImZ1gDjgn0jQ9GC+CsZpiM2xBvfZZGOEu";
            sout << "c8N8pdo2owD8s5q2G5ZCGNdME/AG+iIlb0P00AX+XR8FYhxKb3y50i1giM41mnkKM/WMGFAnpiuo";
            sout << "YordYSi5plePBnxBfd1Iq46PpsD/n/uUTZMHs6TGp1hM6QriyEhOO261HNHoU+n8m1Omz2cfRJyx";
            sout << "AuFLwHSEqvGCSmslmoDpSg2qOaIWK1LWlN+1sYJj18iL4GRM0A5QzXaS0RThqEgmPjeBOkFBjfSO";
            sout << "hB7mb3sDbY49qbN6P48bGV+yF6y34gYAiVkm2NksHzN4ovwg4O6WMQZwEhNk+4gTIzG69jIm6Hbn";
            sout << "2l48A3CYmn8gcjZw39nrlSxpMf7KPkRsdvGmc5Qx9RjP71zH/KJ2TXP0xxzsaGgmqzXfey5l0Hih";
            sout << "XZtfZw8Y28fHBfm3bnIncS4w9S91no+RYMv0aqc9ty7l+Pa28ELwSgQj9eP4u/i5iq/GPmmSxiTd";
            sout << "Si/eeyK1RFJEP4Tv4f3PkV9Js+azu8BbtU+BLO1FBlVg3CzXH5Pc5FMujLdmlqa495hTmi8YW6Et";
            sout << "Fx8dkC80mYFGpVjS+B6pcQLbLBL9gmKzJf4L94/gXZ25BEDob66+XOaRnJ4RkSAN2g6gFJB9lJDh";
            sout << "rLerp3kP/ubPCvcFywuGx3UjJuwFNHE9m62uiaXFU4m04Kc4n7ccHc6hYUkhkY53v2Qb5SDx2qCf";
            sout << "Yg+PWVXujfYrqxRHSwqtV3yX5kMrtYsYpygb7crweOt58BWUa3duyo23UGJHaCwhGwXat6PEC5DQ";
            sout << "2Oe3LVJmc8eYtD97mHKFPhptBl5u2Bztb3zis/oNj1NdMjnDrNuscEAnrpk1CetvHKLglK63Zo/D";
            sout << "rf6SJcmGR2h9g6wAeV7UdsfD6AvteiPj5sl4UuY9x55pP3CTTYklBO1MaDd/XO3A66uMh95RZVGr";
            sout << "VWDd/uKL+rIuI+vKjz8rt80nv3SyUrY9fbftPdK4pBaVnIt73yZrrqv4Zr28H8XpFFQAV9BPlC9o";
            sout << "a8G+AFx/+W2cSfo9r1Uw7npVvRTe6TtIiKagYUmWpx5BfX0VH/VAW0FUh9oiVfx5rm9eaxfSQnD6";
            sout << "7qBINPxsKq+ZDSXni7qfC3J043Le/uL+3XUqsccvEMoU65akKC3lmw1txoUukv92oxyqPX0eOGsB";
            sout << "AU4JdXCldqjU9K3QhyCvv80ZWotGfUr0TlN1LVZqcF2iq3pX1UDOBsPwz9v0QNg8Bmlqy0Vs+MUj";
            sout << "nMCwU9xErzkXLsuVaG+Llk7mmAl7C34BF9O9qSl2kCmbQYoQ87zS7gm/pK7aKGNsICHrar6vlsKo";
            sout << "BJA++/8XKL3nseNZHzq7hKHnOTzagP52MRf+TPXbTVjQPKnCKVAZJcsOlkmuZc7iDnLn4muHDRjg";
            sout << "y09EYcYlFWhLAgsWmatQBsT028ytgMNrQGHDJdjuNkxYfPo+/91ijaaBiey+DgrUVn0fm20k6/Nm";
            sout << "colrwPwHrK3uOdgBn2ysDeUXU8NLMtR94fIL7etQ9tlUuufwrxEL9zYUM8tpks8HDR51xgTwUOVo";
            sout << "DyGFzOdYQRzwi+kkEPEwkpNQbB258d5w9G5eR00P8B/aSjm+w4FU0MsXM0GgPxnQ+gTpS1cezLTn";
            sout << "eelvJYiq/IInLLxoCXycZFPt3WFQqOBpcs6TV/QucjI/5xMZtP3JHUFv16UKPTFI7p9DF+8Ch5HN";
            sout << "gWXCnRSPdYR4ZRid+Xfzi0TvQsXV6u6PaE+H5MpyNMBWhCwxb6FdiLUW0BswGNpHBaFxjB26Qbmv";
            sout << "OW+s0OuXDvKigjQRkeaYawjRAIAN/+CEYR3oUad2HyJ5Ybr/lRlybQuuIqBhuvpkYzszS7BqrxOh";
            sout << "FJYaivT6r3HbHjaJ+Yz/zNW4KsL80zYkPMP7QgcbbSfE2mAavr+ciXdZBqMMUR50sDNLxep9+hoa";
            sout << "ys9wl75QMdx1jn1qn7f04JMSjCyZ7M4bWSyTW7VEr+NBBLmiMzhI6Ufh1iCUpvrIDSQwSDUL88wt";
            sout << "oSiouRbqizt36TldsvFV6afdLgjRrp2cb4vOQBiltwnY06JraGZnsrb4UCfHZhxd8sq/invK9tUd";
            sout << "D3z8hYyLGbS+3LBCK85r74IYvCuhoUp+KobIZPhvWuvdjmmq3SAxIKHNdLC5hnLVMhGJUrckc18H";
            sout << "9zK53uB3QXX6zGKK62Jph4aOdJoDQaPL0K/yHgn9UayEhH/N1uj3Ao39c05puaxzcSotfBeS5+6K";
            sout << "WYyOOMtt5ikKz79qfj6dVWge22fxXUc6yHYfdga0IbYWRocIx+DuyUZnrRQHihNKgYpvF2vhCX/o";
            sout << "R097oHI4ojZFAX/ZWJ7igJvX7ChiwTjK8KDk+vJ4SUd3IHXaiLkkkd9p6tCuc9Lw5jqWiGrrQKuI";
            sout << "7AmGsPFU2EsfOzmwdZctDGXq2/IutVDmwGiucpBKsRN4y12Q1FWKpceVj2q761LfDx2qJoeZKTPZ";
            sout << "jHPdXnGKcWy+DM6GoH9e5jP4CW+HfdHe474bHfLDbP4NE1oF1vdh4NcLy6woi47hg3FS60z+wePD";
            sout << "bWq29WsSwU5oXq58nMxKOBiMcbGFrkOme/Z59Ybi7Cw1+U3nGE3evCFyVMC6g4f/jvCyWF5I3Nm3";
            sout << "OqmkO6fmZ4ahql6C+RwfdRM8A3FllNPgO5riBNX6RA5xKj+JS+OZUrSSN+tUqcgN18IlmLBExEUt";
            sout << "rdG06PKy+WM8Cju3gtbOFX43H4URr9CQcDxWbN6NoqgF8k5a/4+xf7DilfGJg0E2Vu8GG7tmFSU/";
            sout << "LS6gtfLOFyEnQkTzqK8OhVPVLT62cEfCZN9ZY3iKQyZ+VLQhxwarUAgqeNAMXM40NBJqnUIaaTKa";
            sout << "ryhHefUHazhfVgx2+GikVF9wvMobCvvP1qYONlL9EH+ufuLEw1V35BYIIClbrC2uMrnF0H3QbuJQ";
            sout << "ma69tq8TDPkyDLiaczKuAxUzJoj9reJOYGYTxzP7AQKmmEmEZ2cX6+2klWcRXv23XXN8Ypjjnj+d";
            sout << "fTdzxV4kzcHwOYMsI92tadahezCm9uOR0d8p9IH61QQSlUlJw8tX0TpGkNhZpv23STjQhb+uxzAX";
            sout << "1vYdYbPOenr5vCyhnpp33QezQj9cLhSv1WweplUmZjHcJTkPBdflRA9AuqxDVVnbbofXd4EJDC6k";
            sout << "u7xBoD7EKC+kCEkx7ygj8Gv5GVKbgy1js4gLuYwhJ5aqdNpqm881kkxntfRMluVcdH3IGAUzWR5w";
            sout << "26eq7Je4Ttr1cC/xy452i3pJocbhCqrNUG85RyB5FXHAv6GMvm0rUIa6IyC/kfis+sQsdYkQ8GMQ";
            sout << "wL2s8fdDT6l38N9JbRNwdRv8Xa9QAjwcGNbP2v7tAzM5MyhHW7FImYVAaNAaLbzE8v95zeGpT8Cl";
            sout << "CWronhkcJRab8AKP2UcqAD+mW1hVEAqyDe7oWoZziKa2G5aW2vs/WG0z+NqL1zGvUekDcmJ5L4SK";
            sout << "XgdQgxMb/1k48YqYQZFtQrIqoBbYn4qPeB7i378T5TLcCgB6SldsFdlNzs/czN0doroozh3W+sli";
            sout << "d15Qnv5WMjOinjh0Ybt13wcUzeT2p0ovTtYLoiYAhDeAibydJETLdcozfpXFIJNUSoH6TcLge3tr";
            sout << "0uVP92B1O+n0MibJvLsLUKQ9ueIiHgZb6bUSUixAg89QCDRLCZgkg24DLZ4MMTg7IRfFm2eR2lmJ";
            sout << "Erpe62rf2+JE5JTqU88yn6kLK3bQ9vmaGRZ1NUxibTcdpo4hH91qIldLT+jrdmhrawRjYcRduYGO";
            sout << "WXgjTbgKRTxnqrXwRD4Hl/B1EV6ggYC+jn3LQHaT6bYd1hORmtuLKy9duSHVCNBAZvnto27l+h6g";
            sout << "VbUF8eZasmk+q8Fn83bx7C3eKoHjr6acEUyQxtWVCbmeaMd7h48Mt3Z3r8TyX3DkwQmpClciwpyC";
            sout << "E+pbYEWMZXGOuXPmcHTM/Iky8jNSWyw2lLVQQUzPOJ0v0dtNipYRZqBQCDtSE0JuA3Jo8l00uox2";
            sout << "bH11ErfGplsGZJejPGL8ba90e6xeLwH5oe/GduQ0/Xk4+faqBhy/7TFeexQcFDRCCTrC8+jATm82";
            sout << "vHo+NWJjjDlEI4+F2FOhpRg7MtrrzNP/e+cD++wYeGjkRplbxd5PeyALnjZJ6kghJqFLL3NJ1E4Q";
            sout << "gKmRErg1xWWQzyuDbbXPr5dwwRyZU0gkG0WTwyUy2dFV4KRyn2IbMH6STm+0af96YF0joZzkUroH";
            sout << "ztMN8dWtmQESq6EYQfGlhQzNoBKLXjN3LK4TMWBE+1N5ilXkgv3cnN74RZHdLhEXRJnF29x/DmVQ";
            sout << "qZQ4s31Vk0kqKdQ8tW0rs82+dMMtFv8+P2rYA1GZJQV4P5/TBU36BVetlN+swvULk4XpoqhTTMbx";
            sout << "Oj9tONiyIiJitC3YiCU+G5uL0YETB8nSKrtHRiBD8k7nYj4fbUtSbu9+lKRsVK7kU41mKdBImON1";
            sout << "6Qk0XqAx2DEK4w59khYMRRxOD4u2zZWDVp+Nl7Sd7ihas/vQx5yLXHKmIpjCK3SQYjJz09txIErQ";
            sout << "0wJJZoSxH8efhGsTPuVrbQpGcHLD7bIkWf5kjR9MmOBCmUGgeeGOyi45x0k6Cx+z9oaaTXYcvRtY";
            sout << "M+R8tW5gCLaOPjfbq4QjP6yfYogoaTiSEKOPcMgiOQKrXNiv2ahVBT/lvkm6Q8+IdesGWJtD6xqo";
            sout << "+CC486Du6CFDzAHcnLMk5c3CqDfFGl5Yf68bV4aGm28BaM4vikeKRhm2tULeM7PipfQiI9R9Gy/L";
            sout << "1yZB26qciwCalP4CA2NVjiJut7FZgTF2bO/g0qfvyKsAxMetRTmqALBJi8QvKqAE4i/8gRlTuwgV";
            sout << "x6EGsUPCIcQmD8aJkZgy8+erSAY7MLcnUXu90AC37BLyaOt0tzJKfVRb6cP8wfZHqJneoGSNAA==";

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

    // ------------------------------------------------------------------------------------

        // This function returns the contents of the file 'feats1.dat'
        const std::string get_decoded_string_fhog_feats()
        {
            dlib::base64 base64_coder;
            dlib::compress_stream::kernel_1ea compressor;
            std::ostringstream sout;
            std::istringstream sin;

            // The base64 encoded data from the file 'fhog.feats' we want to decode and return.
            sout << "AXAWQhjCEZzu/U+RFPgnRfCFsyRzQjyOA8TMshjEOL3FZhUZD4amYHfLuNN8NZrJyy2CdiXOWrFH";
            sout << "dTTKsMQkSz9f2VGKE6GCsTcZ+fpbk+d7fBnS2DEUkw5ttiSxj/VsrigkeV0MEUR//EP3/w1uvJad";
            sout << "96PFVeqVf6tEmcuuUbYzViC13lfnps7ftXmic5CwLZ97llqMYpLKgfEIXZpelB2al6PyVAg2FOfe";
            sout << "2L/SzviQ001tYYgx+L2v057L/lJdx2+uOQ7tovbsY0zEBEXTr14ZQW5Wd2lWnj+CrBNQ/4wMQZIV";
            sout << "86X5JV6nl/fxrM3eF5+U6U5cZoZFnn9vRONE0kf6/g6W4Z8qQNL2mJ/M8oKoLGtuaaEjymk0ENRM";
            sout << "0M9GMLrO/qfcH/DHUb/HaK851L5sPuf150ecpIbPmQpxTOpI5XwmvwDAP9BCmLazQWQV85wJJFom";
            sout << "LjT9dNi7eRsV0mNCZDwO9iwUTv6KfAR3Vn4t30X3n3+x+Yhnq5PU/4vu7GJpje25uxICm6+PC9bz";
            sout << "QJC3wiw7jrlF8eRb2kZywIJHWtrN39R1tddENrGZkU8LlPTDcqTqfuwC1HXSt0GKlDRBW42DkSxm";
            sout << "E7yKype2G4bgbSnuf/LKftuWlNXzMP3cDFdChtKJNOws6btgvS014C4UGWe3uNVp9SNAmAFyh+UE";
            sout << "rRTl1w3RNom0yvlee9IP1sB8mOEZn5Rrzo2lCyTm6w49PlLfnS293FxvnpRSSlvqUt1lhzzEh7Wd";
            sout << "YjK90oPWGqvNn/bP1vQW35KlVrc+JT9VlewcZRYJAq2OigVxa9Ao8Gs+fFyh8/Aym6Y3Z6+Y7Xna";
            sout << "fsmYdGaUtfniJemtzHatTuhbuo979fqkIDQ6bhHlMN35IyzK26QKzGrMCaHenZEKck9qR8NTkhc0";
            sout << "urO85952cv4aI/cJ5tz8S6f1v71F1gIz76zL0UNlkULQf3tqEleTqVF5Q+YKAtov0Tig9xiSuCZN";
            sout << "btjVVpg06zlRqmnRqWpZU4W7uu19MKe6BGoZ08l5K/3UNgucyuUBTGtTGt35QaML+N4WLcTYj90J";
            sout << "41Tlt+OD4C8nZ1ID982h7X+YxmnSdMNnaeM2Lc/h8twOwg11vHf6OSo6st4yjK201O8lH0Lemips";
            sout << "LsO2qhAsF4AcWVG7HKUNh5jMr7TTQ/SPP2qiJ6eglJYLFAlwtCSXRSJFuK93Y3eUtzDpVDh44tDJ";
            sout << "y+Bsa9oWJrBeBouo9DHG20N+wJB3rOVDprmq1ZGfhkSzqmVzPk6motDY/jkPGZ2E8/NIWpXpyU8z";
            sout << "cUbc8Er2cAVshJ9uGCg0tUh6lGWsrWucpgCS5lI44PJkbSuyFZMbIZrgxrVmkgOa70pmmuHebs+c";
            sout << "GW0FheFD0IHXVxaJtTuPeDuMML/YrAqdyzibareHbg2Hn4aS+qhRUcMyemOzrvjhGF23oSXbJqaO";
            sout << "sJw/DWkt33eFNqWxofXw2pWMMuF8akESryBDyGEfk9nofHoJhTciXGNkuxIiSZtVYsVnKNU9C4ei";
            sout << "31HWlbHjMtG9RD3zqkIXwerCkhElWfxG2M9ja1S7M4+0VrS9nT2ngc/n/KZDpinuB3GIOnnaqiqQ";
            sout << "8ASsOEl9/Ni9Lflomns/CdxWns3OlcU8KVhWHYz5hqV+MI6SQLlS9j39WFKd1IPaer4y1fd99x44";
            sout << "jkyP4ekjoVVfVxpJlb4favfwI1AnFD2K2TaUeULaALTuBwNT5DnRcLNnwqD+6r33rEv94Nk+2+bB";
            sout << "0QPLkojfPlDJocwcGon+z2EHQO4t+RPAafjQb42dNCymI/bIdgwL64vldhl9KfZtXhE4llYhYuLf";
            sout << "xliN92ELGSt8o5IdAsoOoCPdqQh5NujdDs3p8kVSETq1HLilGRnuxyVwrTqJEUC4G5ntPfqXr1Fp";
            sout << "revo1FOr4SRa8+c2GgA7K8/fvXwN59GONFMKxt+sI/xko8hbOQwOu1VEQ2Ak1aS0cc5MoUrhUFhF";
            sout << "gCTqGd+9bWwg95ELl944dD7MIauKl1wHy5iI7u7EDlhvlGhmtU+6lzCmBiDbbPnoki+yZLc0V0UL";
            sout << "jvaYU1WlKZhjWcA7fHkUyGchIe+KJE8DcW+huCO5iz6gPWwy3ZURQEW+wYPD4Sp6szOTOPsNKcN/";
            sout << "j9PxKGDbNO6/Rou+TEfznVuu4ltLKZSDfYMK9g37+XjMLHTU5jCoPm9KJDjFvCTRAcmRoQfwuXyY";
            sout << "o7w4QwcevrjFdb3/IYMrygb57S0iMkFJPUUiCF/bOfQA8tpLePYYtg2ILGGuH2UFwOLszxguBLLD";
            sout << "ziSVWU+xmCi46kKVuNE9gyeT2OCPtn/U+qEu2B89UkbynI5v/FVpJhJf6MjLc1jfDrEi5NflvvCQ";
            sout << "l2QLJGjtfDRJgcXFuuNzWBMiVglMOhT4n3bta7tV2KraK7Yc3Pc0GIZv/zVHf3BqeDEikXdw73tt";
            sout << "aomM2RQstiy71sMmGkmCvUnEbgrY8O60g5nCSmMZIFbbLit9dLyBjHFUELrLxXup7wmkxu+ZVEzT";
            sout << "FxshL754iYXXkXTqVGirp3NNNhGKPGc4g77Yne+nxpkZ4MwOi3wQ7YqPihwIkIdYewBMiQEJ4Y8W";
            sout << "0+Os7iD8OYrccbHKqvKMTE84QOKGZSsGIaCD+iIvv9F9/EIB2ZDv+2aEs/3ix85vtg8L2f6WmGdq";
            sout << "fOdoKVuU2pPIkzlyTNQAwai3NsjcnI++lEpVC8s0K7fpIN8uWDLRnGGuq/G2gFQEoqN8eP0E944k";
            sout << "l/YTW8+baMZVp/wQNA4mo3v2UvDdHrDcZmIvVuwEaAUW4dwylXMazecCG1SMkusYSXGoorB615oF";
            sout << "DaqndLnQSfyJrsXdBdZDAPmsssTuOvCjrjTPnb36+WebHGuLUNYZ1kqjhZt8hnxTFuYN0sTWb+UU";
            sout << "2tL72LNTK66l8LuuQKUMimV2uHT7Dsv4VX6XE+YXczrC0HycSaVmtshxRh99fnNTEtDKo2bXbSTt";
            sout << "s57BqGWi3/orxqSXecUPFYvQBjrIfDrinany5uht/8FK5JH+c4PMTsbiEeQ95RX7eOaBo6IoF7PB";
            sout << "zaXhJH5TW/qwdO6K/Caqvjp+no08tUTdn/hRdGMyQ8cIYXsMaiQKbkpXlGnhoBK34XA12T6pXa+E";
            sout << "QocfgTw773eQRFWN6vmhvuv8Pd3KPJAJO80slizTFSOvxVO68aM7gZdnDFTgfibe/v+2N1xIUq12";
            sout << "B+YWn9yGP232QOnNq0nuAvFLhuzlau3U+qR2n8DThKWTboF02vsqThaQzF+0EPFk/3we6AeAiatk";
            sout << "dcvXEbGk/TkGI1V5ICcpGS/fvivZlqYhAIL+yi5/5M3wPX14KwriXpFVMGKozUYaW05+27adupOM";
            sout << "p4/0EvfeM8T2m+MQ3GcPLA8njXEDbLLWnoZ+YMC3l2OVRMV/yFXkZvQd6tAQUymv1xB03lNv1M1K";
            sout << "tPE1Ps7ucMH3cOjff0fZOEYabEl81VbmYUCYfntdWlApBLrs3gBWiT0uLoiV3cJkq2VWtgpeyAcJ";
            sout << "PiZ4L7AblENmUS9gr/7gYdn3uridNqfoos0uvUCFrIS4a7siub0FpCMwiwSiyZwtUoD5vcq3Khza";
            sout << "DVGJoijIBo/yEgUTho23FJqMaOYyRnVen4i8GH1H7PUhJe7KThuQYk4UQP+XO1qdLITUwBlbNvks";
            sout << "ciB3IIN6QKQTcoDXEEQaMcPYRNhaaGYFDeSZ4yIRhLV5JyPhOiLFj5EOzrC2B14Op4lOkerAY2J5";
            sout << "cx0CN9xEUrm80GJGtKudSd0JKscXIDTBj9lxngSScCmKQRn4AWJ/acRm/fyc5Gpg5PLx+o0jCI97";
            sout << "hm6qOSqslV4GS3BozqP1x18yqrC++IJvOISjjfSvSAkW2s+qv4ba9gfNYIhsJgAan1vaAgSPDXOD";
            sout << "hf9RJHBE7Xi86Ux4uK/o/0GK3R4QsKa1/t6qij0XAlc6lmt6MXbSr/Tnjs4ykAbSjzmiwON9Jnzo";
            sout << "KYQiY46ULY+o+UjbHTMuxkTJQjCKtyertjpISD1yNYBxItA703l4ZLK0iklv0ZrFMyov8y4ySVmF";
            sout << "Tj/eFWy/PpTEQdyzGXrotmYbb+V+BG5e04bq40FsUhhALgSkcGEYoQtxLCZzkbyWQmEN/uXC9Gdk";
            sout << "wG6Iln2vWqzZSRMeGZ61VMm+dzr5CN2iHtFcNQnjwWHgr8C726YO5j5eWLvHqLouU8ufiojzvsvI";
            sout << "ycQ9aUfkcr3AXu8hv0+SOUK8mT5JdQ5aPXc9WOe4c6mdgfOK9Jq2ZJCLgQvj2swIoGQ4OVXn2D4t";
            sout << "MNaKJu0/5ujgOg/634gfxJbicVJLzn30TgWYXX6Ixj/JQW7yxM2iYyHyOl+/SltruQS+NnF+llzd";
            sout << "rYuXYejtciq7Sf+DFNOJPSaTJuI12jSl4yH4fOMMkkxWMM5QkFzgWGK7A90BJFo4Uhy05TELqU8J";
            sout << "FtUWdrngONpIU6haQcDpoYtXVQ8h06yZYJnVQBToS4szMcsPPUVYxITcGnbT470DR5+Rrsm4MSkO";
            sout << "ZXmf4sC2G/k5at6a8o2OKsohg34bNzdo+R6rpJLcMLmUogDdHj7uNjrvMXgZgN2VS33jpsKaVuww";
            sout << "0fm1I1pD6ltIfO+iF5oEOQz6Ml8TSxcGei4xi9Si7g4KGTZ6+KhS/KcdGQv7HsGH1+auYumQvKIJ";
            sout << "mWY1hPH9tLSAB5t6vh6YUg0Fx9G8Wf5Twz8JXsoyRbOs2AAvXcBQ5EPNbNiKz71rzPb0s4Kd3TKJ";
            sout << "cNZexkD8z0J8U/KVzDHA4kyJU9tKB2ZArGPkIYAWw+u9d9VGdxXgst9WtboxuCOy0+y0XiXez1nq";
            sout << "8Tib6FgDNCMKD4uk1GvVs697TYCphk9MlHPUevFlgBJuVI2uOjsnGjBtzQOeuWHyXoz8xQhyLtI6";
            sout << "MnW6c6lCs8REqpAWwuIPF6YLzAZd4uhpOyKFTWI5jus7I2Rkr7RmFDcOCXcnHw7M60Bvcgsa5xy7";
            sout << "AoMab6/pVJr6EjwK2JEmkLaxPUU/F0WqXpI8roFPbIZ0sfuUzZ7tZmkZtelboyTtuEZTxbKagOWR";
            sout << "78qwMM9feTEwicGFlvyiYdUGaIwiIckil3oQO9w6bQAaPnygDcykVMFK1fZaZztYQ8AKiEjyr/V5";
            sout << "dvc04CEShL8uRKDZNY8Y5cDGVHOSR2g/u0t3PDuzMCfmQeKNJQgc0uF3ozXP4xvTvopiK58Y3656";
            sout << "m2ZUfjDIf/g9gRXmrmte452CbaU4HQzlIblKaEJr153rXTQbZPbSHyHOHWRuczQAtnyP6k8YSC+3";
            sout << "zqBtSIvq637hKi+7Ov8NgiYhw78ehwHiPtenLDlB/YMCwqqPNmo+8eYGmtOoRgaQecIoYHYWfaUE";
            sout << "NMtwvnfU5g3JS0j6VZloZxGNmrtuDqWoXclUftoQdsDlE//Q/5+KHzyZjf60WrXx1Ix35UmF9IEI";
            sout << "jEvtLp8KOoWs077NCkXs0HVwuKxbpZx0v3qVb7HwsgcaoypbjhWaMGYflEKvEbJt+TD4MN8kXDEE";
            sout << "VHFdCSOzUplHRdcy4aOkQdzfEYvNTgaiTSO2CautGYgS2m+l6Cd8B4K5PZs99xYFa7t80L1d2Zpe";
            sout << "M9rYCt6RKakTTFDSR94nxxzdyfbA9sVYu6MCD1G0lN+zrEisA6hjqSAqUXsooaW4WTOd3HoNkZeS";
            sout << "tGviSThwRe0awN4pH5dXfHtxaRBkzOBVw12FB6urObgv+3jcnTzRZWvF14ioEmMuKkHb3Ienbv83";
            sout << "71BeuTrUarJazVmIzbH4ulyWwLxEHeKL0r4PIEfbUg7tiU44lMnfxmrFFR6FiwuBxrUvyv/yEmiP";
            sout << "AbMnRjX+4MVrIHr001qxVFOaeK5FehfvmWotuUW63TvubKCRp++5uQDUh/LeMp5ZSX/RRVpEKEwA";
            sout << "It9wUHj/cafFqSwt603pOOtAC+xL0ozsVF1kYyl9vBEow6mBe66WBwekd+DjlzLbehk5oIXSaYsp";
            sout << "zu0iBnukS7YoO/2Ho5JMdkJuHf5AtuC1bDt51FL9McuIHboobI3/K0YrpwPmFORwSUSroXle6XK8";
            sout << "LeX4Fcp6YaicZoFYpLVbhVvrJSW3F4zBERbSqBrHBMxoXMblajhf58RcPKwZPvPnSL+yB5V0VP5X";
            sout << "RJtdo0ir42WND1VCIfVqCCrSg/m+/R2sffd/CzqQ/JuJnwPtKrAvuaZ8zbmq9UkK0WAWY9Wql+gy";
            sout << "AYQNgM6Nd9TNJ7LEyEJQl3nK2qjg67rBCizIdwRcPFSWoWE9DjVz5eFPIJjPG//dpt296BsBeW7U";
            sout << "NhV2Ig9EstFK3+/GC3annnXsT7OQt7QCnx8BvzbVHiFU0n0yikhA1uU9iYm5qsVwdJ23NWimhTeo";
            sout << "XOWG/MVCrPHpV2qs/4PljiPW2eVdzodj+nfDPVwkHwmFm5Y6TGDRBfJWd+ZiXMkrDa2CEMrMvzEL";
            sout << "/DymDMQfMI9HgMiLWmiXS4DjcRL1Fp7DTHcQa9swLcZwbyE8r14L+5xXzDySF/EKJ9LwmldUaN+t";
            sout << "qjmQ7DecED+MkTHMYXnID/Gl3a1/wnrfxa9IuRAwHiIhuwb8siPJT1S2mncAqk7YwUyaY0hl6TB1";
            sout << "GJqoaPTaeFqzTD1zuz5N3cFxx1O0R7OBzHuBtV/JXrZlyzNKZhUaopWCyQ64+RGa/K/lQcyJNVo9";
            sout << "lErihKgf/LNzd7f94T3CmYMRUJZanOLNUWcOg2iJLGR3hy1pnlmc34IgQ5SHZisUBy2jsdK0xoKA";
            sout << "Kb/cPiaZj6ab/4sq+Owh5I66r7FjACv3uILtt69Fz1o4yaOb8z1ZSvFei4CPrikpxYXltEj+aPZq";
            sout << "pAyL3+qrlJ7eOYE2svEpEAiYTztUAn9/ukCZZ71IafGHnhPggc+eizHPuoqfdUa1NWeM7H/XcFHH";
            sout << "b5PQ2mQPCY1gD4SrBqPS7I1QvfMuOSRba9YFbJAecSC9bPHlQQ+c/rma+R3yhyLyXN2j2xzHpgJr";
            sout << "oT2cEn9yT2fHRiZIWqMAJa0KRJgRN0hLjhGQ1VKN4WZfKy8uyqCrAbzBqR0eYcDjkpvD/syBg81K";
            sout << "8acv+5OjBrHgCofewj2DFs0lC3mMlo8qe+GNjxu/CZufpnNabIY4ggwBxdMWZvZQ7j27VwMmvkdd";
            sout << "Uei0foug3YA/Gy/XUTRLhuyYKy9dqdv6VTSiek0aFQyM4kz4KqKlAbGixu17SFgvZ33fP6ZMZ5Pd";
            sout << "eWC+Z1vRafLRpsABf1DJujXUEUZ8HJfWBuuaMkJkxFApcPwctu4SMpZDjnoc/7gblzc0yLr8BRxD";
            sout << "gygNRNu4uVAT3sbaRzYOvF3tq7wr+R7qS2YmPEzhoZyfubEHdV48wmE3XD/RnZJ8maanzDjEH/Q9";
            sout << "yX/a34y6YSlrtNim3R8pI/AddLi86cAcEKfK3V9QXCGFqO7GfQuyZHO75grKpL+6MwRPUWigaLGN";
            sout << "9JfWrc5tpUu8NPY0ACmztq5p8iNqylVgIYOC9LRIl6TKJQXPSY1k73NpzNNzOJhVCCLY2IaCMUtY";
            sout << "pbxZs+VLufZmNFhq1D5qxUDfKII7x9ocFYqtwLnjZztYT1HhDTcwmB+5uQWHoXKRvsTgvSfR1l33";
            sout << "w4mqzDAI4ykfuNbLmymuKaVV2ST6W7pI6xfZd/YD1em6OQYF+F44tj2G846Ry1IsdVK8AiprcFHA";
            sout << "QFxuwxcY9eUgjSvhbK4BKkQgFSzx7yDZTtDxXSWrGsPoHUCh0GKU757B4ubLvDV197o/No9EKfGh";
            sout << "3tlmEwvvwQd7yTgwdbksgVieGZBJqLK5eRe3CqYXpHryPcxydrO+2LPpzUiiHPY5FDRZjnYY+as0";
            sout << "IC4dtlX5BicqVB2gbHiKHbjLf0pob27d/WqQKKfA/7h2wY/jYyckEiX8g9M6I5QeABzABxyyAMlx";
            sout << "zoi3bd/RD35ijUysmIl/+qi3GHaYKK9Bfu1SRb9oPgmFYKKKRrYxm/cypmJXp+GUjlNokWN1u7OM";
            sout << "Nm6oqRRuqYWiCwZge4HHVQkQs6BuH/Nqvd3Bqkt9U1eH4TnkS5MhnYVdHt0hxmG6Py5A446SERn1";
            sout << "gJRsUDXk/kRkird01o1UqCrlhwX9WG1cjY2I9nFsokudgnYryxn+d+hVdM4E4MO5ZHmOXicEn+hZ";
            sout << "N5eyfU7B75rBT/yZzzot1k+B07BE1x8K7N+S5JX07utAi8/htK/a4vxKhJiyx7p8etztBI06LKss";
            sout << "grLKdJtqZvX3kwFEIXqpJn5W2bijJNeQYnJxfFY+5D/k5POGuBYjf9lw7ilnIkbEDkaMWf9Mrt3W";
            sout << "A30zlSEMksIByxqL5/VFx7oM1oSx872AYwXDNNnfITgNwKBwniRHuU68SjWBO37CYYmDhcB7Ug/M";
            sout << "FMX7oBgPrld/Lg/ut/xbWwFOiM1M6L0TmT5HX6RcFSdKg3Sda6adAkSK3Ux2HTZAUVaK8zG2Mm1e";
            sout << "W+/4SSqK29MAZUBK+oEPrNB7An6NgWZ0TRu8sGeMcZCm2Zb+3+ZVUbsTFoG5pFhzzvMGr9fAsh3Z";
            sout << "4Ngvc76mkiqT7xDZw72BUnrPz+eO+RGqMG+oGWJlXd5PYD4XIkW25kBfOr+iK/gCFUsfZbFoHEFa";
            sout << "M9EFExjXiZYOz4iuSZnpeChRQ5wbl/56iTGSMHpB3KKU9Rfyv4dIDGS0KmnSH7Q7mdn2lXerjDmF";
            sout << "zlc7IbX35O0kHeSXaH08ZFf9vBweKQvEW6Qxs59FWPuS47FpXRAPFClwYskLxByN2ux9kxHprAFr";
            sout << "zuNKRyilr/NlCEJn5SiYU2/fAif/YrNNiyxXx7sWwQW2mf9Emqzsrkb+eCqAPs1NmwuHO8JXIyKO";
            sout << "0EbIUaVuENKa+DLtcrfI9HlxhrF8vd8m8s4ZeBHWr3jkbVdcjX9mmtcSrHyHXcWVImc8CJOiR7jw";
            sout << "0HTAydarj2G229/7kLX6RncrRqY6/Z2e0YEbfTt8RDnwriUmKXuf7VUMljP+tWx8aXMlbm47WMaY";
            sout << "nnjZ4wE7UTgrYUce7ehuGDBEM4VaKYrp4n782gXFdo9VhUZ7JEaveARi8Di1SI5MuTQ8N2hUfPKn";
            sout << "JbK8mEjSmcN1sOZBOXxxWX+e9RRsO5t5ujCSy+UBr4gaqMHAlwxtBmif+kl7s9o+UjHOlWLn7V74";
            sout << "PiLxVUzCTHz5A0rX7MyGXMBai8BT5XjmazTZz8YPIiq/ZmnyULon+uTrmBdivNEjDq4M476YfAma";
            sout << "rcqxp/picZEanq8yctrujPHilXH1WuXhkPM+gn9Gkjp/sGfA13JiFeXZO9GJHkqLwBKApqS1HJIf";
            sout << "bhomnqcdp6+hM/IEaNS3dVZ1aTSefIM/OTR2fNVbmzwfENzVke3dCJvw5B8zTsgEXeKuRE58pYaQ";
            sout << "H+ffv486NoO8gXKrUF47ptIj/Tt5apc5Pt1AVFsuaxvry3UrUmY7MLbfM4xB29ah1PY9iYx/OssX";
            sout << "DGvnDskGHiQJlz1s3saJl9qm3BZr3//6D1/CgGvXw0DffJYL9yIqlzoBRKAue/lQbWagNArmsccI";
            sout << "WxVk2TqYgTHwhl40fWSGIuY1kfj6FEAUxBBxGul8y9Cv3e/hMnE0gDQz2tZs7EGqP8WqKPF4BpDh";
            sout << "Ep+6vvj67y2Hf36GALRYNLlhCB5+HygzOW4jwtQvCHxbmtPWvQkRQ8iQ7XlZH0OOATz1FsccBZXr";
            sout << "3+O26cf7zcoZIE28MIQHIJqsDFHCJVr8JVcYITcv46R1z9ZgQQ+z7KK0M6FY6SOgCyu5kyQR6YJd";
            sout << "HEYkNp9J4N21iRr08DUYycJDtrf7xoyYfj2L5QjpPVEKrEhIkjb1kr8uZp/KfCjCkedPBrMsPuOJ";
            sout << "28Acpne2exkkKaunrJZr64Axfgl5t0OIBP79Cqy8PRnMYQTtqHf/pxaHNyrYaXO9vjtTVoV++kaM";
            sout << "svy9Ol/R4LxEXrgtlSYhKF4o6iCJUSiLhE6j/xzyOtRrCAHZ56WCJ7YTm0oa22TtH0DvoFMY11Tr";
            sout << "SZ04ig5Tl8At1jXKymUSnK7EXANVHZmZ+01xTE4efnFIf33N4uWK+c/hEqmS6KCVjuHT9FwTKEIm";
            sout << "4cKum8uhL11rodikW09dYfIyQV9yO0k6EJpeUSQMhPBqbgTWHnVQoHoot+c1uBoOdK/+bRuz5vip";
            sout << "l6+0nmpZZoO+OjdEap1pQqpcTEhmfBuUGXCibggZhHEvHvFGQo5an4N48OQA2B8CccDHMJIDP9+j";
            sout << "0JfmziBnF+ZOLfKLwuuE4uZg87iSWFkwSynsWwoUQ1Cy3u/URW620WLmkx0GDoGPkcsxJ0LVu9dh";
            sout << "OrWWaFesEANPRMCKuuU55hs913KzoOKdgZPzM8dheJZaZB15wi+u/RTm+obSWZVwibTDyLPQ55mz";
            sout << "FSv7Lyp1EDFvxyel+7osJa5ifhLrU5f6CAcKwS5t2IwaZaBxrVaFgX5lQmifY1Gd2new1mkfWYmb";
            sout << "n4AaURVZOBC4U1Dx65ch0PNeEYxk0DLAGOsvdBDbWbFMNc0LiGEF6GiCMBYVsw/cYnjY07cEZg5N";
            sout << "M9RxGfLfVlyy4MW9ek5ov4+NVLV+vaosZvA9gP92vaiS7jBj8qCb2uYIK1mfrjHcOUFqcxgzltBR";
            sout << "eSU3ewoVRJIaVreWX4RSXTomL1GOyfcFQ7gZghSJLKlwgkK6+yvqig0jyuvmiRFJGDYOxQtDykwM";
            sout << "EKOOZrckRdktXs6aFQOla+IRiN3XVUfY2wvx3egfOYPKrJS2HBEdXeIelB7LK6vRx8nwuFAAwZWQ";
            sout << "iB4OvgM8U9N2H1wa0xXWc1897unEm1KxAP1iS44BmZ0PPASPa1RrltkwWMwRtMp9fD08mwLdGe88";
            sout << "fsGIrnwHA0HIShoZaBmCSvX0yfaJ34nchnMukP0B/8v7f2j0t1F6hr5qJNSV3cTNcc2QToBy03ro";
            sout << "GphkM0UhwwoYTlFppF/8LV4QmtsNK9wuziTmv8ghXUgvFRTtVcBMlHY4SFcRKoagFF+B1UfCuVZt";
            sout << "G8fNilXM8zc2/eP3g5FTU3YXRgw2CAheUNiekne53EE4DmDJ1f6n4OyjZFP8PZ85Nzkkco9FW/8/";
            sout << "31JIClFqSE1VGbDXleZMOrdfoknF55krQB7v6Wsu82gzQU2AvvhbuFlPodDKH1xUuUT7gERKv4ka";
            sout << "fdS1xf/PRafedvPX7k8fFZQerqvvUlgO6PaEAxK5MqZqHiUgUh9A/pqBZNBl1kQLP9+G70i1CY9x";
            sout << "tTETsJJTgYz/HP6yXsqeFm52yO24myKHMURYBmOZU6AFyqFCsOdJG/GA5otaO9MG0A3hPdC3Py+2";
            sout << "GWbnl11yPDVImktL+LYbx2oolBWZrelLRuKAtDp4p/Svt5R6fOvYM9XxZnnpR/MNaTt7I8iEZSQe";
            sout << "w57IL33ZfHgKlxEr/ouJgT3vlxqXsuXnP49ytEVKGja0JAOzlShLYqB3GIY9Gb3EtN0h/id1jqQm";
            sout << "QwR8y5q54W8pdYflhgi92YWYroUUIFRxheAgPwUSqrOUNiN6xpSwr2usNY1zvGGsRqFKuhKgh7P7";
            sout << "cvGc2sOj3izPgl4NlR2DaoFTbXd6uDM3IrYGSCFJdbMlonX5cvO91ySJpKwPOnqjAbzBjnZCfepb";
            sout << "4px8fSH5I6LJVU1R+sGRCoewaHTFlsnaCQrsy9BTGMIWwAKCAYCbWN0T4ItZaXhJWarghYGsT57P";
            sout << "MagSlMpKeiToHWnWhPhtxkhm1ZVRuYekcpwrlWwsHBV6O5pEML3wmWZDWJNZWh/GkmhPhf0aF78F";
            sout << "2lOVKBWLYq+4Xt3lVNvqCr7m2rQNH6KzZUNfeoIJH48SgirJQiNNE2iQOsReTQTbCW87NCN4GKGh";
            sout << "Vf5A2JU03N+5fT+dorN/LTQmeKddK0MR2nshO1m0kZSQ9TDUE6Da7ITtIjGpKK1QqohIx9BEMoML";
            sout << "t3BcLTNkK1SaaYRE9Fm8AZXr4z9AILXUKktv5bytIRBZncs8078FdpF+O2JWEzELgG2s/FTHTyjU";
            sout << "NU3A5q6+8LoeSXuoqOZz2QwEMhKwkz7AlujJU/CJ3+uZBAUBythODaVBlaZM6/f8dSY3489Xiu9z";
            sout << "L917CSsYpq4JQWq7I7pOkPjy0t7Y7QmKPITQv4QQmF3P6SJXiainjWDQlZx59RTzg2Z2MDZ0dcWx";
            sout << "f7f44IkngOVEUHi3iwrSygMTySBYdDxei/kBt7oXAAkOMLucZ24VE26nLD1hMAwRz83ENc0sOZAz";
            sout << "F7He/e0H2I53NAYlk0s55wntUcdp3sHh3UOcGyBGcRUipg6NWy/LrWzxWqJdo1DsBpV4iazYLRfB";
            sout << "JdKobsmPGmWSyABV8tea/IuVgqUm5RrWfBUa6Kw2TqVuos2PsGqsRi4cHKl3XQ0GJjbV7qV7Nacn";
            sout << "mRVqIAetzUUZkuyp6Q8OMLX36zwwrlP0rPJaqk24VBEnx2FKjaR/LkP5lUFenOHJuPXSh89pYWA7";
            sout << "7/y1i2ejWuMrpElkJ7qfpTGD/A5ZkNWCyla2VXOXUVjK2t+cBYByjEwlMCwr+tXUXQYVMPf+UzzT";
            sout << "EVv45u14EhFg5XOu7urPZWyO4EbejgEvyyx0c6Zgt7RaQgXn+akwMHI3oDn2NcZYGo8Vwg/fSs6j";
            sout << "Ggzyse3ShPpUr6qb9TT3Vo6hXegWwd6tDPsqDlc62JhQ0MYdw2A1x8aGK1iUCz4pqsWmXWhGPO1g";
            sout << "rXyqBaIrVHDMim3cZO2LY/TOwIJZGuHNvVnQQ0TDYAQEgyej9mVLuWaFuCE/JZlw/8U2VngPVq0w";
            sout << "EePssUQnewMHYTfceXOETEBkU0xl4WLdwaJbvIXG+pPcVzYW8z/D3yh2LU7KHbklffbjWhYyAm3b";
            sout << "nTTR+YTZoF5PwWA9DmsxIbLQJn3Ejss6pOj1YSqq1cD2r1+TZjWefNmH/nncwjU0T6e/iBxkgQLc";
            sout << "NXouKJEemknL/HOvd5sUS6YYbIGg7Pa3ur3Qn0quKT8QSHRPTxZeTP47rSp+Koibf/XfZOdG5RzB";
            sout << "U2Kbz2vi24JkfzbNCG3tjNvzPJVcZrMde1TNVNQVFbXCzMZgO0Za7o3IRyxy05rmieBcGryGX1ln";
            sout << "hnhwSzxSSxnuJ3szdlfw1j68i8LsX+iaZHonWIw21afDPwXaoflD4cZIZI2uPLAKeBoOYMxKyFGj";
            sout << "2KhIVlr+poDcu9gZBMF3CwwxSRZpwVhpUllBfOJDJTLbM3UOyNRMs/U2T6TdxH1fRbgeQcfQ4CqU";
            sout << "D196crANUlHv6VL0bU8CFS5f85YwKO4JliKHZhvQRDtcBrwKIXttWPt1f3OONAscmsl+JtVgVt+r";
            sout << "h1R+X0b/puYAa4tqBvUBiiokN21cQR40Pp5PPLMszGskImO0XM6Fx9spo80xxDLhOXZsV4rJKs3q";
            sout << "lub2BoFFGa/nbd88uBheoBR8lh5d3sWciz8Y6eMMlEASpLmXFg/nqq1jzTlC7lGmAhyqSTAL2dHJ";
            sout << "+8ACp+IgMI8v7DR1TEp0qgwrVC7B6+8bozJlpH73HdqQYkyjAnVcOBTn6KO1pjAJ+YcXqe2ioiBt";
            sout << "OMAlNQVAJZgxpEnwwd16yXDmK+Fp7v8aGEx1EECVaQYW7ZVvKRC9249ioFaEgFjpo+8veoWFd9G3";
            sout << "1E4aBC8rOXrrsI6U3QqWbYlusqvogtKGwT2pMYSidnPneM9iaJ5ixPSlB7VPp4MwdZvPIpOOR8Hq";
            sout << "cFqQfZAa7sDq5idYKPUrRo5XD6szBNbb9Oob6y3G9RQndEEt2363luFr6Nv80r8yuyaUUlRcmPmU";
            sout << "/VCExotSxcx6B4uWyd6UoA1wZv1hY+OCUL0ahArlLzkR2ZxowfeDCn5eoawdQnazyx9wSAEmqGTT";
            sout << "lrT+MyINZeyxp9DTtvjFwVw1aDVT87PF7E4Yw2H5V/55elbLzn+Rlr4AgU7W+RnuwOk52LCKrSud";
            sout << "JTAq/vix0svgRHAs3E8wsLzBsFXc9SZ6/AWptBKuix0lkoDObM8rLJMjxpQPmIyVvB3jWXITDn+n";
            sout << "8ou5GgmZUDeGu3ZiOWbtPhO90akFKl1XDQJ+k9DGrlQd0dbsDa2lTgPbL+3wOD9fdjFzqfmGA2vI";
            sout << "kg75VqCCEOUXbQ8N2U2IALiOEuYblJk7WVsbmOwmEw7T57QVJvivVJ9Z36TJeWfpzIiHCeReso1y";
            sout << "3RGCo1qlsgfwtz5e3/ycu5aEq+Pg1W4EtSpeuIEZyH7zQaUILmAFP23JDmHyZNh9ewxSRfZGETHg";
            sout << "KKN32MMx6taVzf/8+RQhxI3JJ+PSk0vrvUEX4L/2Bri8meJbN5UtWuRN5gha/O8jPDixa4XrMAiq";
            sout << "etOumapH/QhEJBy5NHmcjLH7XpZ72qxTIL6VS6m2GjFUyekOdKZOHDyEKA0FR6wgEnoki7gS0L6N";
            sout << "5plyHCOmd1aBWEXf5+P8EJeh1nmu6AXtDful0kn8G9nNnWrbC+iIj2QQ+XZPxdZIGuJKd6MrXf0y";
            sout << "zW5dznFYvB8R+LTy2SW4WFvMWzJAlggi1N7w25/rvtnt57E+I5TimCjAKJ5Vcjj/R0DOqX4BNnOK";
            sout << "MqeMDogP+DE9NesTswgfFngZBjomZsx8f2Wdzzi/UW0xBZa3yPk+CV+wwTlWNxgBKFCYFC8GlJ41";
            sout << "MQt+TPDsDZJuBdbexuS/PA/zzOE/wZPVXgzLZFmTKsZAfz9894HEHalRlKLgTlvgW65XDihdoh71";
            sout << "HDwdA9Knb9r2qH0dwsOTpoU0uABJkND+V1Ezr3oi35dJ2zw2gR0omEnVXZM9dW8XIp8ln8zegt+S";
            sout << "dyMbNDzX9RClWSIVIGuRYGCahBqXMCJG/AAKvkXM87mZiQsIz6uLvJpkeGiG1ah7kTSjVFIKSYES";
            sout << "73oz5l7AIAIReUzdvMLk5ZbmqdW4JHBR5XBA3rTpAyNEunRi2Ddy1eBt4i8I7GlXaaZ7sVS028ze";
            sout << "VkY4WR/6FJKO8ccbofsJb8BiM8UZdPmkRdEKGgFv13dkq6inmo3S52P5S50mYapa1YKvWCvMHaov";
            sout << "z8BOe6WqptQRGc+vZ4v1vgq40yaWBa9pSTyvntLUKCkQX0qi3ifKhRykXP6SBylckIHs8DfuJqXP";
            sout << "X06djSx/F7IyvBQg90SLa1h5hYRTAchYX1ZgvG7LlSvPp7i+sWCx5D7KpTbF6O7AU8kMPpaRm2wE";
            sout << "RvZ4DCgXdh9Lgw69wRlMfWJEJcV3mOIGDRoBZToyJqgHMDJigCet6NIsD2xvvza5JWPf3DURWRHz";
            sout << "wdVqLXlUivD6/9r290ZcIbdWFMbz2aY9x/ojLrJmAGX/kySItIXsJlDbcvquJWNc6UYrpxurQEku";
            sout << "ejm7E6HjXUPmi9gh2kRkw29A5xIFaugoph9dZSwyCEx2BbqY21hwQ5elfdcvdJD/fe7iiWmfrtxQ";
            sout << "BqVebUOrY5+/vEvMf7EupYK8cxtCb3mvViCR0rGokTwuw7NVuMH6DEJ/zXB7BO/2bPXnr48Q2pmM";
            sout << "pThaXSCJ5Ta1SZqGZRG5pBsUWg8MCQBc/KmDWv5csQlqDJOLvEULRsKdxxcm2wBthRXx97JVHMwe";
            sout << "Tlb1TkjoSIQonMsvU+dRJCW3qhgbR4i0t7wGfbg9YdXG8LiKJHvkpu/IPKHZtaMxOp3O6kl7Lcb+";
            sout << "Zr412Aanu8BN5GP+rW8/C+TjEBG/WeR23iZr6SByC7TCzZwJO25J6mtC1nFxdAUizSmxUfwDwvdE";
            sout << "5WyGMq8TTIHZ9KvKMw/jODKXcviOmLHY9CsPtYXbChnF/fWgQx/ykshrLmtSqFEaOt4YCiPFKQHh";
            sout << "/IjsYqcs0UQeGTk/6tnp8Cewe8A1DAaBEI1RTllobQKLXEUBWAV0VcrVXILhemvApUW0uqu6dSqg";
            sout << "cfv9uvu1BblNEfNmfTcUssCnDQ5c5vFjEB1KESkrBTL+p6bEn2b1bbxQrhiqnVO6mi9anbtBgBU4";
            sout << "lTjSG4KMnsD63xnrLapoU7ReEZxGjsQgm1Af8/lewJajhNOZi3FmDgkb8Lhq2rz8OYy6pwXCEM07";
            sout << "JwMzOWFBZDUA";

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

    // ------------------------------------------------------------------------------------

        // This function returns the contents of the file 'feats2.dat'
        const std::string get_decoded_string_fhog_grayscale()
        {
            dlib::base64 base64_coder;
            dlib::compress_stream::kernel_1ea compressor;
            std::ostringstream sout;
            std::istringstream sin;

            // The base64 encoded data from the file 'fhog.feats' we want to decode and return.
            sout << "AXE4jk6QRzUCNtyVtAwaCkqQk/DMJKm1t48e6FXsZJ/Zfw0Utm0AVwNlJU7O2+XVsftV/yE3zO4S";
            sout << "YG9DY33gIQWV6sw7AGva02FE7zlkRbW3IOyZeG5LYs2r4vGYmZvZuYQJ8CVmkJpGrYioIuqWLyoD";
            sout << "IfAFmt0z7HREwTsGxP9BG6UIXb95jQCGocuoO+MxQNpq3qtMAr+C2xnN3Na+ITiKYUX+zEP+FrWJ";
            sout << "uqsYqhyN4H+1rlYaLhrj0nhUs4+Zp+fn3LZecDsZGeq6KDEIM68rOZAY8WWA/o4x30cQ0P299z2m";
            sout << "7Pl1vRxpN3MdgzkS2zlOpGnrexfA3TK07nFcTK4Lc97t/75JULM85uEo6yYUBjyeY7MPYTHaM0tH";
            sout << "+TGdAqQBf6TbnYya1MK0BM0nVLp4TkMeRZj49erCtZIVaFWOYmufs3LywApX8AQZAsBhU0QA5cQu";
            sout << "G6HKcdTiqxUxbjOIueAxWBbDbGIwUj8URJVh/WVW4TAXnzZu48JvRzif++Xeswz6O8+PXdPVp4BG";
            sout << "TaJv9bBwqV1y7lM/T9FxktP3YIcnbW+ezBUh/logAVeLzCAbYaqChRMUkBizO54DEiA+NBDV5ndu";
            sout << "Iax8NL9DFp1zmO8gdJBZZLgzf6K8ZbRwwKNlLEkVEZGKei3aVIwo7ed0tjG4aEIodgAuoXD8oa4p";
            sout << "t7v3sYbn/Wz94AyvAwFV0M1mAMaXqXhpfJSb5CJsSOyKqUtBBhpS58V6Gsq9M9weuwVHee5JI8PI";
            sout << "bY8WlfQNSVo4JcToIdKPhehz4Ywad3gdX8DhSd+WBT2aMomB71jr3m9CcC9da3oxXjh/jVaN/boQ";
            sout << "oY5UqFGZ7T1b42x79PiIoOY339sKYR9vr7WPDHTouVtas/3hJBkBKwXqKmBbRPU2N4DTgpt+1zFq";
            sout << "nig8prSmjiAh9ofp20Pbl5FbYoIdoOfLgYIluAOuT0XhKxLAwWoNGLBA37bGagSxzXnzlDPpFDZ2";
            sout << "WVdrBwehuD4WhBRxMiTZkzJwhzRkyvsBnO/JqFxXAD5b2CvH9p+3P/czeRv2hRjNZaKHEfdMtIWn";
            sout << "lPR1zWmZ3LTMBR8R2kmAUt50Sikzj2TpzLlBhemvUVAcv0HEdiILnp3eilOx/ee7GzEroOMHuOGe";
            sout << "moxWRB1EHj6h2Ya6TVmMb47SzMwKo7mf1PtZ5JLDk61k6Bv9M0WCDiwxlBwC/PjTxHDsTOWRrSJG";
            sout << "roZ/csy/RQF//nA0f8uKC9HWmGTOsrA6VAVteglGi9k6E9etxvmGCQD2ud2tyz2HSnklJAMutXd+";
            sout << "flvArk1avpvwXGoNgT3EsEicUGOg93vXl1A873vbHtwnycMzAa8NYjZGW/GPROg8yKkbpoxK+Zel";
            sout << "+VP14SvqQDKEYDevoGuQWhsQHhW7bYeSa0bSamm9DFzqK2Ld4/aU7JUHYdaAvAJPIHe3F/N8NcJ1";
            sout << "RE7VoQlrVZXBy33Ly6wwiv1rm8yK4sMdBnNXcxzCyG1NkPsmC/16A08Dy8RV7nJhd1iOJ3gy9BUG";
            sout << "Y4ofrw/XzITd6vL8mIJW2jyrVzW2OPqMWy6IO/7CHz7d3k5+7KTKWkksTRsuAYWDgZtU5Umph0kN";
            sout << "/RRnuBRIe/6KYj5/thAY7yLmGFoy8jhDmIikSP/l/pJhUjjgKk1R+oYHGDJ4FSD2KNfRDQ/xHZb2";
            sout << "++ObYSCHAuhB1HoJBwPcmxkFtxjS047iGXnXo+2nchItcrtifnQTeI0qyV6conJnskM4jfhnKsj7";
            sout << "A7y4owQjOvkDwu0GueuDOTo/9mW2NjAaiHCp8yarSV1dPI1b/XR231+p5IEp1zWzqFr+O3pDAL8F";
            sout << "+eU/vj8taOxtT0CcT0gW2rRr8oTigRWCUGP1hxDBdhJtAa7Q+CuFvmtpjm/4fmbroJ5ZVNA/71FN";
            sout << "yL9DKBmiVTwljf+yRpTGhpMG+xky30zS2R150N93YDDXVT9StjKaOrtLap+9w7BtCvXGdPiyR2QN";
            sout << "g7gqzrz31poE36fAwM4san1jbbTC+eYcTErQ2wXCQkVne3kbVOwErB0ayl7rNqkw5b3gAME4+DnN";
            sout << "IM13kdtxY2WeBND96g2enTmFizxHWFzW2asW4/XqGt8EVmzTB4XM/Ytd+XXaNadRUHh44wiNIhPp";
            sout << "txmIbtkSesyQ4YYSmUYEEcYkZwfcRxHUAGCcnQbSKGLq+N5IcyiLVwhXDfK4fqxH7Oi5DmOwAVmV";
            sout << "kdDQ6GP7wDcrkAQS9s6fL04bNf7rodacAPdX4HwIKa2YykdXWOiQhp6BRxjUG44AVV5fiTGP1WVn";
            sout << "MJKXYzSyY5oN3ADAT5em+cIYYVPnsnZBuUzAjHAw3WYj4VlRIrmP+oPdKPFncEyfTn1G7DbmyaPd";
            sout << "TL3DdB8EDImfZ+A2UMr2i7jynH/fFXzsi2PM9cFKxCsEqG2LGr7KZDP2FFEVvWwIDnvUClj9nrHd";
            sout << "zyioiild+DW6PoYvqFQX4LUf9Jr09RiJuIvz35I/15pBQbSnTxD1RFJwR92k0yA3514jYBAtfLmf";
            sout << "/1refalgDjOyD1ntgp3INSYSbpR3TqNIynWwSJGxq9I5aFJypV3Nq8w2Rn3/kld9nqDaTG79ns13";
            sout << "dwfPOiIZyfdrcxkYOtS4+iijs+YE3JhRKVWMf6ub0cVXttJGORgpzgkSoDWNVZ6O3hVydCziYzoS";
            sout << "RgHUH2Oas+aZK5IF3Z3aaRYc0A+wy/PEx84LRHsAYdPUQJr+bGseC4wScP1Dyc3xpeJSR1V9t2tc";
            sout << "AMbhtwcKGX4j5nGnhxSevKzbCDteEnB23TnSQwbuWYmzhB77V3jpu1Cm2h7FcKGM8vPbAQeRBr1b";
            sout << "+RY95s8hsZGi/USiu4TQ/wHZfEGYcHuVBI920d84pPRVe5EJ8+FzZj+Qy7JwriqLN+7WyUCFdwxn";
            sout << "4B+WXHTe2epBJMQzlE25kKDHKb2lDDv5HzVUlrZK4rEShkPNv8SB3U9u20GTLlHJbM8RDvPkNjmu";
            sout << "U4ZLDSJylDaRHWqgchgMnmX08aprI/o1HbgZ5aiByXAUoHSSGHanyYmW/S0LOW7YZH+jOgxzW68U";
            sout << "lheNnX6Z26RdMe5Xtkd5jx2jXgIT7HADCN8wWdZEVT7FvXRoxtO3nz30cbOim/+IvB2lt//OcTJU";
            sout << "BwkyweuhJtiXZV1yY+X2z3dWBjBXVFWidPMMWjTUIwalo9A91RL6ZS25kuBXKm/BV6X/zAHkY+jB";
            sout << "A7qJGLPe5h6SO3GKPSLv0wE+9G6VIhH2TPLfAd+PpqM+xuUNlWlo5JR6ItOgGHuFdjZeDlISYOID";
            sout << "CJn4zfaU6M4Dmw+m1wsIiyQy4Cw0DcZYUjwStEfLJu7BRyFI55wEbXJr36PRWpvB2wzkI4z1u2yM";
            sout << "7bFvguH0teVxtMwQy9S4lT9JlfX8QEqNRsuxzQprPJqj0ie2cFBrvJ2E0FtcuarikbcYAmC1iYdz";
            sout << "Tc2CRVe60taBHR92AsvuTv5OhCIssVc5W+Lbv5e3S0vLwUprWPhfbth/zNevKNiIeogTJOOTQexo";
            sout << "4EhJ2pf8QSz+ixlWi5ffYKLKSx03wYBZ3fNIhJDP+Y0mz2pd0IyGhxDrMAxYHhPjoEGCfYX6fYz2";
            sout << "XQGQ1eTGvNEATqz2v9HxYBicYAcW4mjEcTqsMHMYcboVgqiLxOD+jOHJqNrw+eiuC2Ucu6muQ2es";
            sout << "Zhbo1UNZO/J9XbsZIKa6t0PX0CSczL02Dti8r5rCQ7yeUgwZFzy5oJSShAuUvBDILXBeDhnuU4W3";
            sout << "eooTvk0lkb8sNAgkUlvHXgdN9jkfQuHqX453IOffB9TnxopLuxS3R6uuRa5ED2pWkL0L5ceftRv3";
            sout << "0T/sMlHmTNoQhcJSoINMf7f+WmHa95iD1HolQNFJaDEUzLV1DfD2mntncFZoJ4zlr+b/94qp8s/n";
            sout << "NM0CyoI4ansElbkkjUs7QQp+43pGXu8sRgg7tva7/3vUwLp3Md+8WkX+uppIhj25nlwfkD6IHxdk";
            sout << "uFNPNgdIikcM463W56CKek7LufT8wQG13mJOMJCObvhW/EU/yb/88hegDxeVJKrWHRyebllsFbZ9";
            sout << "UeEWkJPKdA+YHilgfSX0aFgofCDmmh1k/cO2RPqIGIqZSfT//6lFEDdzPcCLp/kd4oq7qh5Ko7lo";
            sout << "bg4N9n6F90oJI+JFJRLy6bEhZC/7obQlP6FFUUqSpizj18+zTLPUaDpt3/eg9QeXUeKcNlkHYt23";
            sout << "AqzS6PqB9t4bUr+E81QUxpegh5V0M4OPQJbFQ4/rna/AwZVDmGRjJLKzkWUwpnIv7f2+Gl+91ly2";
            sout << "ve9Ube6Jf9h9M/j7kppHRARY4QbXauYAcSp3wRaIueJWx36dMsqgzuYfwHIyuhGS3CbC1EHUZwM5";
            sout << "hgCHFvPGHLM7T7p4w6k0e7n8RZJsDybyDAydW8SfSI6LIeX2st4LOHrdLrpUNPyE9JyuIMCSnPaT";
            sout << "1XnjdWev4jjMeXxa1XWbzy0AQpeQ0UYA4OpqRSu1DyoPWf4IA+bf012m5Im/1BiGF972Ie/6CNvS";
            sout << "niYOfmxxLWTihdMtslxiy53y2MW2iDzLxX5nvUSyKXfO1XUlDJGTd/zfUywZcY8cgI/f1IPzr2Lk";
            sout << "3/YKqkJ2De4IpbixDEkbgAroIaoOZXEGD+yNzXVcyISIhMiKHJERdwVxp4j3duc3M04wrwJMZvtK";
            sout << "lk5jnn+ILhTxcpboq8gge4CbWziUUj9du6mklxZaeYBBpB6CzlVLitesXieA/zl2JnWzRMD7Ho3r";
            sout << "LLSqxh9UeFgjFtb3ilKSHNZH6x1DS0hFhEIA";

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

    // ----------------------------------------------------------------------------------------

    };

    fhog_tester a;

// ----------------------------------------------------------------------------------------

}


