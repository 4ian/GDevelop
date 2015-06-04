// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/matrix.h>
#include <dlib/rand.h>
#include <dlib/compress_stream.h>
#include <dlib/base64.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.fft");

// ----------------------------------------------------------------------------------------

    matrix<complex<double> > rand_complex(long nr, long nc)
    {
        static dlib::rand rnd;
        matrix<complex<double> > m(nr,nc);

        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                m(r,c) = complex<double>(rnd.get_random_gaussian()*10, rnd.get_random_gaussian()*10);
            }
        }
        return m;
    }

// ----------------------------------------------------------------------------------------

    const std::string get_decoded_string();
    void test_against_saved_good_ffts()
    {
        print_spinner();
        istringstream sin(get_decoded_string());
        matrix<complex<double> > m1, m2;
        matrix<complex<float> > fm1, fm2;
        while (sin.peek() != EOF)
        {
            deserialize(m1,sin);
            deserialize(m2,sin);

            fm1 = matrix_cast<complex<float> >(m1);
            fm2 = matrix_cast<complex<float> >(m2);

            DLIB_TEST(max(norm(fft(m1)-m2)) < 1e-16);
            DLIB_TEST(max(norm(m1-ifft(m2))) < 1e-16);

            DLIB_TEST(max(norm(fft(fm1)-fm2)) < 1e-7);
            DLIB_TEST(max(norm(fm1-ifft(fm2))) < 1e-7);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_random_ffts()
    {
        for (int iter = 0; iter < 10; ++iter)
        {
            print_spinner();
            for (int nr = 1; nr <= 128; nr*=2)
            {
                for (int nc = 1; nc <= 128; nc *= 2)
                {
                    const matrix<complex<double> > m1 = rand_complex(nr,nc);
                    const matrix<complex<float> > fm1 = matrix_cast<complex<float> >(rand_complex(nr,nc));

                    DLIB_TEST(max(norm(ifft(fft(m1))-m1)) < 1e-16);
                    DLIB_TEST(max(norm(ifft(fft(fm1))-fm1)) < 1e-7);

                    matrix<complex<double> > temp = m1;
                    matrix<complex<float> > ftemp = fm1;
                    fft_inplace(temp);
                    fft_inplace(ftemp);
                    DLIB_TEST(max(norm(temp-fft(m1))) < 1e-16);
                    DLIB_TEST(max(norm(ftemp-fft(fm1))) < 1e-7);
                    ifft_inplace(temp);
                    ifft_inplace(ftemp);
                    DLIB_TEST(max(norm(temp/temp.size()-m1)) < 1e-16);
                    DLIB_TEST(max(norm(ftemp/ftemp.size()-fm1)) < 1e-7);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void test_random_real_ffts()
    {
        for (int iter = 0; iter < 10; ++iter)
        {
            print_spinner();
            for (int nr = 1; nr <= 128; nr*=2)
            {
                for (int nc = 1; nc <= 128; nc *= 2)
                {
                    const matrix<complex<double> > m1 = complex_matrix(real(rand_complex(nr,nc)));
                    const matrix<complex<float> > fm1 = matrix_cast<complex<float> >(complex_matrix(real(rand_complex(nr,nc))));

                    DLIB_TEST(max(norm(ifft(fft(complex_matrix(real(m1))))-m1)) < 1e-16);
                    DLIB_TEST(max(norm(ifft(fft(complex_matrix(real(fm1))))-fm1)) < 1e-7);

                    matrix<complex<double> > temp = m1;
                    matrix<complex<float> > ftemp = fm1;
                    fft_inplace(temp);
                    fft_inplace(ftemp);
                    DLIB_TEST(max(norm(temp-fft(m1))) < 1e-16);
                    DLIB_TEST(max(norm(ftemp-fft(fm1))) < 1e-7);
                    ifft_inplace(temp);
                    ifft_inplace(ftemp);
                    DLIB_TEST(max(norm(temp/temp.size()-m1)) < 1e-16);
                    DLIB_TEST(max(norm(ftemp/ftemp.size()-fm1)) < 1e-7);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    class test_fft : public tester
    {
    public:
        test_fft (
        ) :
            tester ("test_fft",
                    "Runs tests on the fft routines.")
        {}

        void perform_test (
        )
        {
            test_against_saved_good_ffts();
            test_random_ffts();
            test_random_real_ffts();
        }
    } a;

// ----------------------------------------------------------------------------------------

    // This function returns the contents of the file 'fft_test_data.dat'
    const std::string get_decoded_string()
    {
        dlib::base64 base64_coder;
        dlib::compress_stream::kernel_1ea compressor;
        std::ostringstream sout;
        std::istringstream sin;

        // The base64 encoded data from the file 'fft_test_data.dat' we want to decode and return.
        sout << "gO1l2wKz8OsyeYMPYcGx6QdBG65vnrB+omgAJ7Bnsuk9vkTw/Y9Y/UZEFXhVf6qnq92QHPLV16Fo";
        sout << "a+IUHNTjoPAfBOTyfb8QRcTj9SaWpxA65+UCJ+5L6x/TEyPKDtB23S0KRpRSdfxBSW9/rnUrkIv7";
        sout << "6i6LWcxKzdsw2WGsRCX1k3t0adQW49m/yb8LV9Loqs7/phzY7HkJ4D2PLtpc6Wyk1qG/h6KQ7nkF";
        sout << "GFkHIoh+xKXhHpqWaSofx8H8m/++H++g0VSPqfQ1ktFz+K8UtiGoyR2GqpP+br47YLXG3WqVU5Km";
        sout << "Di3+IjQoBH2m4jykD926aRvdRrgUH4gZunokl+U6shv20Zm0NL8j4A46/2f++YPGCVBNJJmcJdI7";
        sout << "9RlPL9SFbJ8rnH5bbLvZ2pKZmmbeZN78yzLUhdGwn4DGpf/Zo1fU2YPUjVKkwY6olW4w3tiBl05a";
        sout << "cS1HwBeQjnajqsXNyudbrBkM1Z9XiwM+J5iMsu5ldaJ8iLn30W2Te2RnZhJRHO8MgL7Fn1j0n0Qb";
        sout << "8dB+6aQYv0l/5LQkr5SX6YSRYX5b5rnqhi8IzJKms6dzoyBm97IGTm8pRxtLXcmsk1MvJcHF2gl2";
        sout << "CslQazsl5iIS6fMxEodmlMdwdfIpp/6MqmeIydSHwdyJJZnNPl2p5X+Il5egmwdaSoDQNphPfTaQ";
        sout << "R0Xh3xqsZKgHLKxB14Rsf/R7Eu9ZASTByX3UrEHsSzLSUo9/G+tS3n1iC30Liusksh2Wkt+/QtDy";
        sout << "A1ZX31H5OlSFwCYC/TYitwyl4U9k7WhHBDoT7MdmVTYQEK1dK48nwOhnZa9prE8n3dD40CCe25q3";
        sout << "Qo4VVYc5tBWu1TfTbshvkmHAcp3Gyw/caqq6jdq5Z2BD1b67i/bY66xhmowOFS8xeA7v6tKdkvpp";
        sout << "Rk8FegzVdB72wpw3872T4K+eplMDcCPGkwIieF5pZStWxhGsNOC0p2wvpFvTpQgfNOGUvRt69hsd";
        sout << "xaUEYlWZcY3sfsiOwPGgBUEEv6b+8W7+8Ddj8Nx4wG+bdWozphfz7THbmOeaDM63imIEHmJbZ47I";
        sout << "QgoyzFD5WoWtZ1wMEv4LL+a63B3FzBcvPvdPaa2QEmyiK9yN7GEePs2Fv2A3ymhGw5NeR1dOzAjz";
        sout << "lEQW01p8opk/dpyLO18zj8d+Hn4EnJkKD0p1u+XuLRda8AnRu/WmSOOpyG5EUrUoEyuvbECLbY9X";
        sout << "3AMgzkbxltmZlkyOOwfCGM0yumGYKdz0aGKdyid7ddLMTpQ908dCNLyRgTybdZG9137PQirgX5+O";
        sout << "08T/+L4EIyyrslOYxpUaLm2ASnSUgiivoIJvfnu8IeH2W9fPupY89ioXIYuwZU8f9FDCA9z7peQw";
        sout << "9H6l4PDdDrB7nwQhncpV9FYLkHQLbSgE1VD+eL6Y2k48pI2zUndcoHEZW72NcmK6E8fDvfgbKkYD";
        sout << "m02RiGuj4tvEEsIVuVa29Q0JGO+37n7Mlz7+RMcUMo1pLnh+jibas6R+1LCy7b4ubiKMFB1gvjut";
        sout << "gjMABy1dJxSOdb9xUa0K/Alwwu3MxdkrbTxwqkn0C2JnVV7z9S2I+PWcfZKzcpg8Itzh/ON6I/DE";
        sout << "EGK3s39XhLI2xPg3PE9R9QMaisqxb3FeP1NkBXrLQtuQfrSk+KZk6ArQWVgtem799fxgipQsa5RH";
        sout << "z2Dq9t+pJzNGUnWg5PWzaAY3lWMscn+BIRhsZfDJ3QBtS9Vmib8r2dtYwXi/Q+FhnAHFfcXbhDC3";
        sout << "GHn16aP2PY1sw8KMtfPRAcqY8Ylbr9EQXjWoIYUs0YyX2Ks8ZgibunTPFz/Wu98RVYswMtjubFaJ";
        sout << "jb0pK9S6qoe/w10CAAHqoAfca7uMOxw9trZZmjCf5vF4leH/nDgsNjesYn21rE6rLhSbg8vaZXo5";
        sout << "I/e1uhZlRz4ZNnMlZSnL70Jt0IjuR0YNphCsGZjmvvZ4ihxrcLrHvAcSTJuqW5EARtvjyQWqBKSP";
        sout << "5XhlkrI73Ejvy+Lhv6n6O7+VrfWa/tGRuvvAToS1wPOP1T2oniDXsNlD0QbMnCao+dTWgkTDiNTk";
        sout << "sFxsoN8YjwHqYUAp+hfnu1Vh2ovyemAUmo87vuG7at6f8MgFSuZffmBkGuijKNDDy7OrHoh7+5/+";
        sout << "aOkcvp0pW3ONZ4l6peRNvzaW5DEBTvcZGvRwVCHWII1eGpzeJKaHWvDfLqjaPkFrG5pR7SGCY/9L";
        sout << "73W2U0JCe2h7VjWbCM7hdvJEgYi/mEarVQpt+0P834es6Rm9rsMCbgbrWl7uv35+LVMTHU29Oxln";
        sout << "bDzBUJQs5KIA81IWR3R7D+HuJvpMkAYMF73c1owI7K74SBOsTq1ayC81aNlK7YwOOjZyBqwsQ5sy";
        sout << "zZi0k9AcKRGmTC323o7Tp/n/gkAU3NObTnqPEJitjGloXqrhPvorixBhHXSZy+wgL5R+04KiF1uU";
        sout << "LEFOzJ0zKUMstTB+fgC7D6ZnVEtUq3HEYnmaRRwEhRSgMTLXE8VvnOdo802pMVN5GMCkH299rJm5";
        sout << "Ina8mTwlC9JrNuYHot5KK/Gny4KPyUeS51cifByPwroemwBHe9EmKCkcEJPoDpG3QMaV36aopyJl";
        sout << "GwhZxaZSqbut9XSWr0IMxHUkFeslRB+n/7Vx+xWpDNjQ7JA5S/B0ZW+YBQPcjA3sRQTey25JD4Jy";
        sout << "RsULxNY5e3mjn59fI8OpBOYfNPTt2Jzppm1GDpym0LHuz7KZ6xk6QAyogk+HMjC/5RcQA7zJWDRM";
        sout << "dXC4CXUjrBxVzmm/YHXv76LrsaFdzJgn+/qzlM6IvIgicMhcJl+hA1swTkgcw6JRalJiDqnvapKP";
        sout << "V+T+/X5PSNMswgZURHQJ2l0PkMrUT909pBOC9t4GCsK8k4rYS2o0I0UYfcpm4jMRU5X34zlT8Qv+";
        sout << "GV3mA0oGq1U2dJwArlPX3gI5sZ2Jsw7Qa5edvQNG5GoRb2j2Muo4AkZXXjbx0KEa5leLIhVL4BAE";
        sout << "2GTdbL7T8hUGY3QlRQGwSVAytjUfXg4jCyn9w6ZbxUOu5MDBuCEtrhRSJNKuBLInK3Bh+fr2FshC";
        sout << "T1eDtIFE2EDEaSbLj4NCNWpTFdKMXZ9CQg2VtoVOIJfgKzqAjjcWX8kqWpMFlQgtdTfIqN7gnFit";
        sout << "do/FO0OzLghevyexHdl+Ze+MjITKOF0mTPPMkcIYcINIR1za6q3rLDZg03+GouzYhL8lwM3WAnkg";
        sout << "Qg+NM6reQATKFK3ieOxacZYnIwOR/ZMM/lO/rHY/ZbdAnJHbMBWwRtK1vDi+o+ZgS7EgsDpsmz/l";
        sout << "PguXPK0Ws51OUhIJJ5YDBv+nVPJabxOYV3dU0z49xFpxNTW9pTISo8mKZvLp2D765kExGJ9YKoAx";
        sout << "Hfi6WEg3pFS9YQLNhOZjE4bQThugIWXhi+2OPgqUIUoV5ctSnP5Lv+xhbkZfjnQQQQffrrU4peSz";
        sout << "6CuNEVLuNuG/mc3WEDZwf1HxYv3u9pr7A79QG0EROf23zPzaf5biE9e9xH+ruPApRHM58H2RpxXU";
        sout << "RlkYnfoAUqyvT3Lhhk6ngv8Axhi4otvz7sRiXQmZO7mtzWzsCTkCJoziwRKlD6P6LYnbm4fRYP1M";
        sout << "MvOuW3NhsQNrsDtgMuvqiVQpRzg157ES1i1qnTjJxTD5emK1RljuQEetbGksyetctWdWiEd8ZfSh";
        sout << "DHBJC2FLucmkMt0LHsVPnk4ni055uMRdKPRKjTE2MjpEsxR52xiWR3MtwXiEhH9fZnUl1IdBl3PG";
        sout << "TfLiZ286m4ePm6JOgNM1chtZir+q8pr4ghk/xycWvHmgkqT9dQcFP8iEtlVLCS22/2mS79cTev2r";
        sout << "yE90otp9vibcTnpORzrnLrMhhpmYRTxRjRaHGhwdJYluARJFBBVTMEenK2ubdLOJ8skZjLzPv1dt";
        sout << "9IrO1sNUwrMpEie8PG7D7DzQ7//jdlC/HUZaGKrwj5aMUULi+ZYiBLYoeL4N8ozAK1u3KtXLKlRE";
        sout << "3Akys4Py8+CmrY5qaaDOXZvwl3FF3skmGhx5KValRXrbndqr3Cks0hXglHgNonZh795galZwu0Jp";
        sout << "ww/mTQLCV0djTdEfjXBUnP49zyGXWWsEsl2jfqEAfBDcT4+mMzAUtBSwwPJYXXAJQz45R32MThNb";
        sout << "k21X+rw63QJe0zIbOJepHz3jaedMkj8GKNYBjqzibNqfYelunBUqW0bpi81HYdN5OFY/3GNKgygG";
        sout << "4R5HJaP+x9e1HxehpI/4pKFC+TAIb29uSV5GtkNTb1fYLm0kjeCZNA5GKtf42gBY52N6STl+lcI0";
        sout << "gD+jJ/ogknne3sRtEJEtCFFe1c50oikyJamQbeUO1PcDUBt8Phl1rI/p4PTP+H686usJVhSDY+b5";
        sout << "9CdS6F7XSSDiXlpFl+Esex30fRZ8zAQsTo9oN0sSZUUJKcyVk0dCqw2mHWPpyM6hYKQ3ij1nYjYl";
        sout << "3PzRfFMlu+dgStcBn70jvlEv5pOWXb2OqrN9nJtb29n8jrB2K2nlbcYoPPiQ3yXk+Wpom82LoT5W";
        sout << "F9NeNwwAB4EDWtB96OU6noW8NHJj7NiADQJGvQpk/3JzIzeBJQCxULYJMRJdBKf61+24F791reHa";
        sout << "qrH+rLUrrv05dIPDTUvGW5LQLTTFFa59OmMIu7WJE7Ln6gMIwDw3FXnGFzaWnHlHL/9jJ0zM1FQL";
        sout << "kfK4wTd++GbeI0gsnXWFK0N0kV/FiHm++J4udWwIXZxH7qZCHtwlT/5oGDVujtAtOPag+txUrjVc";
        sout << "G4iLeiPbV/2Vfc2D1oV5/yyXDDii9qrLH6SOOfgvdiJZr7X3uMUIDGO75x5wBDSxr9t3I2CrX2dM";
        sout << "M6kD7U1+bf5QVRbkh3Us4NAhFVnLNEcrm0x9Yx0wRmxPKgJeGGbWi7/BHi8ShIFllizuxuMyfypC";
        sout << "hhzSlxxbYAQwtcC3cHEnyYZAO7HC6hyke+HQJfxAmKyfguGtzEzsiG18XJVruwz7IoOpZS/O71zy";
        sout << "Nv+T8trOhy59ZUAgIsCAAQJYEBWl/T/qFtkE+tITbVRKtHjbxHSeN12OnHFRoKguJYaakTo4qLs0";
        sout << "fr4E4nZUMfjdF7oI7YutegY9TkiJ9ujLJw4pfY1XRtPrRukEl8orypWXq0gErnYO/RVtK3XImrDp";
        sout << "LY5sXH5pNzkqVH9VCl6lh9sg2HWjNwv9bDcDlIhvTL19Mx9yUtx/iQtG/OKy22tW6ByahPNnMNtA";
        sout << "tBVB38RLf6eJr68mhn10Qg68cXxVL7/zEIZd9rUaCo8xCzeFblDNErKfG02JJ6fbQ6M6ZdNez7Q0";
        sout << "x2IYbz2DEk0wHmR7OtA/oTFMvJlyMt+dDWTEpHnvqkbe+veENpxn2WWy3UsumkvhhtzzmLxyD6Sh";
        sout << "mMbMPwgUjvMG51JfRrgMfJzT49z0sebSfzvid/9QV4lNkR7s9nfUJEwAued4S4klRy3LiFdQhjQR";
        sout << "FOZZNqUge8vxVOzVCfS+xsjvnGrd7azt7LJg6wPXFgPfeE2bRlx+8AoRFG7SUpudmm/bkNw+uNgS";
        sout << "YRdaH8p16RyNoMlSfi/7BNDhtKwrl202pVuCqhFey0mPYehYee2HhLZs6ph+HKMYy8lZ/ac1Q17d";
        sout << "1tcI4WH0Hz0B/3GWl8xWfoq2OO40EIjuCPNhk70MpiytWXggJrKoKPu52GOqTU8+jZ6F+u6U2muZ";
        sout << "6QZLYXDwPaNz/lq5U4ACw767DkhUHd1/h0g6r/RwtLKxdrzYldQto99TAMmHc+z9aIciTv7kl/Gs";
        sout << "WA58nI8aODhwjIkOGaExdlR1k/3JR2tAAj5vRzYlJeakhAA82pA+8xMPZr3HRKMPCcCJZiOFUYkA";
        sout << "AAAIGp0hTQAAAAEAAAABAAO4M25wAAAAAQAAAAEAAAABAAAD22vyAAADGD3aK6jS5oPrMPzwAAjt";
        sout << "xbxcPWpGahG+GZHRkwABJjSNeG3dJthsOADhIXZ+4e8jAWWTyn1FQrzNkDMdvhTq6iuNBtgaodaU";
        sout << "LlEAl217cnKFEVX0Gz4mAAAAAQAQ+2CiQuAAAJqBbzxJicET21QADU29xADCbz6wuq0KAV9tgJYC";
        sout << "z4z1fuKC2IFuACLkvCvxAAAAaRl6AAKB7r5zjcz2HSjBdaDc1QgdOUAzmTdpgegYYD9XVQtaphsW";
        sout << "sUhXeeIliGybsdhruMlJ8hi2YzzBBZc1GwjNawB2sz18UCIbQKBoDMBo39MbAAAAP1M+WcfB4DGK";
        sout << "yDXgydAAAACCIiA890S+Coil7foud6zPIspdcqIDxhws3Kiht10f5NDHUhjgTYsAjtAgSoGLQ64J";
        sout << "iNm0zrLDZkuHC4Hm69wkOD43AHbIxu+k5r5vgCW/m4traQAAbol6XlYIroFESJxqPkH6Zdxu3wnY";
        sout << "DA1HzRnsBIlQ6SvPrboLtfVXncBN7aM7vLaX177RTxKn2qep5WX3/yG9sAP1QSkqapaSdLpB0Q2N";
        sout << "9t4O8ryKiLFvPQrbFhK3Pux8X2PWKHAzZfkmUSQh+OiOICNKDbPRY0Es2GaX3Qnl2oIVflDINm0i";
        sout << "Y6t8x0AZriURrafLgtzuoqaC7rAYwb1iQoFJPwXiZJNIk6W8g0623IGSygd7aZ+xqv5NjU+q0C9d";
        sout << "0PJs8kZ7Db15tjjTBIoS9gBNefJg2D5TCJjEPSzPcZeTjPzeZJeK7v1KHgunnfi6igrT1efQvxDa";
        sout << "KlbIBaR5Mk6fxdih+YOFTnVsT1mE8b8nffJ566Rgc6azYkJizsRen8b2g7jzgv2O0BOI7VtdrVpV";
        sout << "BxoQ58p3EGMCV/mlDhcfVTctvr8hrjUu4OhN7UUoqi94JRXL5XbNDcCbFwXScln/Lm0bkzNsDnlM";
        sout << "R4OqLiz3ktIpJhAtUemrNZtPa0+/Ge6PILu4jPNom92BcmxjJusoTOrHSTQg6cYtcSB8spjVRdpj";
        sout << "tFfYfDY/6rxKpE5X+LU8P59b1/cdrNSbqkuRIuGFFzkQDv1BUNfa50aIKo53OmvDWkeEpkpS2xD+";
        sout << "hz3uN05FteKkZ7kHDPmEEJ2lUHB4oicxgkseb8nWToePhOkr2JcNakTx6yc+ZT7bzPcoT0hueCpg";
        sout << "Ljzb2AQ0UdAJEAD9eruD1rF9PDEaXD/W4D3ja2EgvEY9wSMR56Ne8LSi0jeFjp8jKxcbmBo848xY";
        sout << "dofjq919a3V9KDRUZ3d9t2Bmfc4yFoS6nBZCVy9klxK2ZaKePGjeCbENr08cfenUT7kA+ZQURi4u";
        sout << "WEwCgdui67K4H5NPvbq+QAoKn9d+ZHx2YfullZgBCi34oLzT23yccD4uxP4GbZVXakvv9lLoq+rf";
        sout << "T2uxZr36V3aJlhqVoSReJ4Oqz5qbTKNH9F3S14GFJOTByKZP4XJwVytHIcuu9JLpQPDt/nkREX4Q";
        sout << "0cKeNqXqdujkp9XCAZEJ1RkvHE+F4tiUCTKHvoCslgs4x9alnUWVps4Qy5CMaB8+x1eHM3gkuf0Y";
        sout << "qNIFuIXUybNj0hnKO3IV5k8m2MURJiZsmM/dg0fkwJG0DIAmCFCXdugfHMHpqXZR7IBfA+Q6BICL";
        sout << "Njxa4BWCRQoeKc9LD1Nits6rbVmqkKPAlwc+yhfYzny/3/ZHfkMuF/s6CBYugf3dYMIch10I/QRi";
        sout << "9mVUWdCIacS1G42Yaja31j4s+304a/luTAsDKlOObmKTzDV2fDhbKSLToOY9iXxRK6KJY0GydspW";
        sout << "ak8OvtNCCVvEsA5NccWOn8njo/sryvQgM9yzV8XCI2MDF0blRNFJQR72EDdG9NXKgg1gj/vG51dH";
        sout << "CHj9E5ffneorEoPjn8pfOny29jcb16D9lVc1zcp7v83pLXuAyUp3lNC2ff/PcIbRMpNns1MnyV2J";
        sout << "8gjsQTqTL9AAcvz04ohVo1LbZRl6rl2D0PHAOCOJQAJ65OA6BHxfeh7EDDnniKfLlI3CD6W5XZxW";
        sout << "KPVAa4RGyCcSLbmb5d658vkB9rBKvaqncbiarQVbyLQ5cCRokVd9HTmqYX4Ky+0yPVcmoXAS2B7Z";
        sout << "S0zXkeuA8Lo2ZYRad7/CBg6foq40dpQ9EPw19H0YquMXeGVEsgSvu7jBCYrtuJzL/wlxe+plrjXy";
        sout << "E4iwHoZ78KKyOgwTSqKtynp20YkZG9NC59XWvyrd0oTBrGlFpOjer+OtcEgl+3XYl1q66yJTyQie";
        sout << "x/Q7AjBZWPmlhEkktLtXYW1yIqr+EmYJqJJ4Bbssvsa1/jd/EmZQV9//HRBmber5Kw0C8royzI93";
        sout << "uzM2t59sG8hnOHXCjAQgV/HuTCTD3hzeDgrv0aHMfIC+mx5Xkt7mLhrhLeODhJxguHb9a4pQwhfK";
        sout << "gD0DKhyk0RwVZBNF2+3UfK6bJ1zeUgf0FJ6Dvak5i2+BUVtohn2qjbcIRFZKEtE8Oekca+FE+9+S";
        sout << "mTsAIvR/cbfuDVG4cmQE8sPP2nB75KQJHylHW3ZvR5v1icnLfob/CfYMmfSPYDgDFx9cYroX/luf";
        sout << "lLKKxxQ+1r4TIUGKcBV0ZJcvjCwzU3C2eG6oN9P99+qndIXYmvRvpLmq5QYyjsRHmXn2MTKSa8nl";
        sout << "y+vPwWboutMugCUmEfTXhvc33o5/KKWU9cVSP5G3mrGBDu4BfG+GeqP2+DtbHTi9oOYm7723fFF8";
        sout << "CUxOvoAQkOQQWC7Wfd1QGgsVPxhz7FTsviov+G164lh/4Qlkqy/8pzEJdQK9uYmCsvcip7tKbzS9";
        sout << "lRX9OoPwQZQPWPosqZjbYBmEVr/e9jtFv+2pH8p+5S0GI4qiNg8n2fZE+isn9XamDpOqNEpKk1gd";
        sout << "Xg/ombkOajBBxBlpNbXQa4aZylfiz3ANw01leRleTqeHB3HdNnTaJn3mr/lkKg3DYIA1N9/Iv8jQ";
        sout << "1lQexZCF0jEDg51sUNPF2yDGnpSpZVkDLXCGIlKe4BI1/pR/kiqrEdg/ITP3+tVhND3x/pBWKlNs";
        sout << "AteO6/IZrK4XOQ1DnZgJSAdz3Qe2uO4wY/7MQBhFO37V5gAQAQVLcXsik3FDcobieQdvvoJM2Z3b";
        sout << "i+FGg1vcn01gNGDH0PvTKSEN/KFYTpyKDw3sjzgLbfEPOJcGmIFj4JUuaEYB2TfQfzOwzM7QCDQa";
        sout << "6jbMHpN4VvRPQqZ879vRWzHhg8P2M3rJmcQsrjaJDIL7t41eMOmB3Ey4Vajya50NPPyVjXEtFdYj";
        sout << "TPc49LO+npIw81WlxPbynhk9lmLeYwr8LALpc5dNFr8BkfCNc3C+IFi+RHSdq6tj7vXqvE+KtH+7";
        sout << "lFZNdvI4hFiIrDJssynPUFAR7bob0zEq2RxDGJBSe7AmmwhUgGCHRFXlpJg8bFCFs4rCgVrBctry";
        sout << "AY5TT1WWTTa5P/jPOCTfrUOwjxgGD6ubejoyGIoBPfsRM57XSYv9gQKTi5hk3k4qHQnItrf9p/AO";
        sout << "LIxqMGF/nky2Z11JWz1krqtE9phBhmXnMk9ap1YWJd83L5Et4wxpud+J2JxJoM4kjtnG+HXqdEsC";
        sout << "KCg7bNrSyAjtohz2vQvpXsZjWkq7QT+fTzI134PhMzbqnsWdKi/dDsZBNbXB4ua60uqFb/tLtb7n";
        sout << "sNBfRnWfch0qZLuil5eAWkLlRC4zyaF1zJmchHnVync81bHIJVNj22+ctIbdN+P7aCYBA1n3sl1U";
        sout << "0LDKWsXycnOxmKFUMm8kh+f/eP3BQu2Pe5W1tYDQnge9rvF1072VXvjpDBIna/VPuDwCFo2jPPl3";
        sout << "jbxOuvZTOSTWOwyiX5B8aLBfRXm7wXAwRoRy4WLr2dsiGFGSwP+pZlJLfNGY1vmbILPg/9iNNMdW";
        sout << "8MBRnhh4COlSw5/NxCl3FtRLfO3uLe3Z9+tBpX2qkUHcFyeulVFINjZaNB8gUBPr/Ub6/pk603yY";
        sout << "YTEqMSo239BJZvCsJmpgZaCA/weLepsvaEzpJvjI3Gvo1Jf/zdm+eY8VVwprkj4WKWKWjHq4miAf";
        sout << "y4TRxVYOG1lCH/cGcbepOcRMUG6uY0jTP7tqNfd4Re8IXTLCq1P4EOGuvkIe8hT/YdPP2B6W+Rd1";
        sout << "z37NgjkKJqiSZBxpnj4WZLmdJ2eOUUJOR4Mce1mHEKN6gOhzzFRK98ZB0WEI6jITJ4wNcdDpw7Eh";
        sout << "1Sg3JvoigX7Onq9eCnb+5uXFQbQrffuNiTCa++zx5Zm89m7ZuTJ5NFhssQ3v/mv8Wesl/9lebi05";
        sout << "KOVcyMAq9Fzx5Wtj9GMHrTNTyzS33CGVrx3Imh88CXZ79PBLBO9V2Lpjk/yIuCyP9pKezOZDzTED";
        sout << "rrMRA+AkfStHcPOL8WwGaAQgM+AlF6FVrKzs8TQW3hrBUztSeOFrxpDLod53zDcNaWRe/gpKtB/4";
        sout << "RKRjjso+LANmNLW/IepM3Jy3sepn4slG9YS/up5puIZY6zrsw8n7nnejBrUBSgZNUaeYLCLhWcWC";
        sout << "aa/M2BfeOT+X9PXJyzvQxDx/fw2duaVO0yRYb1ZNwtoOXWWXzBmoWKVrlXcegQ1wDzDkLW6lwnww";
        sout << "4wJ2tMR5bWMUJii/0Ep50BMgAG2TrSK5jrBpiAaGJaSOB7k39YsZ/3/8rozN1IKa2mrK6VqkvY2Y";
        sout << "AeOhdivfgdgccST6Ymbe81UvjsiVeCQx6tI2RcnR7NTxLC3guqwsSirHXDHTflWI8aP4bPb895Nq";
        sout << "7JdomRqug/eiaoSfv4AotVU89pWyzC6FAN8UdnEXjZvYNA0gf4plXcMvlLKmRfHj/vs5x3v878/m";
        sout << "elmdsnYX+sIHEc3hAZSISJoTZkGEptELFMW85Rj87/J7d7cC1q6vTMSNHgpysPX+2M9BNMEGDpJh";
        sout << "baYrMV6ASpbVikZm97PCzHNnwQAxsOPIFoA/ZtoyXleszvtD2jgNsKiMQo92dIFDAJU+4FIDWG06";
        sout << "7BoF0nZgUUrfwzC0kL6cN/ui9mBpnAu09t/9dValOs+/Prfp5NfdYesdUpJCqt+o3/VcgGCd5OfD";
        sout << "1n0lyUjd0g69rM73kEb7jOFV6LhN/5sfmzql9DIqUYtaxs5nJ94eFkp+lSLeXKJqBIrxEql0JL8H";
        sout << "ISH+HMQBpE/hWIkXJ/RryGxYv/SLm4mfKYNgp8i0KKzpp5fiK9ZlJVmyLAM0eRAMllUa4j7Q0zNl";
        sout << "p1EO0iv3pD9Lhbb60VlD7ObwhDApO6DpIy0mjj1G31DWJi4uEzYrUttVsSpj6a2+rrI+7nMA1wDO";
        sout << "OEGWM77EjjTElz2sU+1w9gTNn6j3uOFu5Y4+/ysXnAIVtg0zQluCSflOwSAFyUvpBNoKVnQD+mGH";
        sout << "870jvWJ/y5uoyjwaxl33+t79t78PC8ycBjvu5M+RFchnLW3QqUSP4l84gYj5oLsz38LzvrRU+lUk";
        sout << "mFDmrCoDe29pLZXYwnI7HHYPEtPBJX2fdBaudv244Z/a0NPgMSHS2uwdTkdSdWMK1lTBt1GB0+XE";
        sout << "HqdlnBbMPq9U4y9Uhh1hxdBZHvAcrhYjXDSvbDHDzZRE7acCvLmAOR6aRoGup/WIowNtU/wXfK5c";
        sout << "irNg4hSWLIjPNB54AkPsPc99IxGPH66PnE2sAWFALd7E3GnAo9N7t5WniKWWI3xtmQLbSOHwdI37";
        sout << "iAOHsNgX5TjGzUYwwnQndubqfV0NY4/V86wO1Rar1qBsIUSylkids760J0HqyUsWNXxsS6T9Hq8y";
        sout << "0szlFA/E8IBYgdH2LwkayEbDbKMsonJC+9NhEx8u3dj4ckmmKXOY8NT97XlqxomKyexbsKu9mb1G";
        sout << "NtxTI3Yt2mDKyt4hzMvhF/DgvKErMfTMTJ/h21uaZXrmwu9G+yQQJVaB/LEfrAenakK5mhmIR0Ne";
        sout << "+e9cQQSr+iD8oZMy/IkM5rd5FOk8FY9pZb91hXaWNIMDfwyfZZATaJruQfO5cgjMGXSjpq2gFHW2";
        sout << "9m1zGxyWrEkm2lV6FQlPLHBGybLKxq0VNUqIsdM8VX9Kv+6i8UgN9Ee+hyd4a9In41m0Z50jqgja";
        sout << "Jojh/Np7WSPqnPhNCv6/K0teVxq3bo3UfaXlrEZtkAi0hgy67XtZoBBQ2Se0ZWzOntgP3Yo3OI1S";
        sout << "02Ta7r55Ox/WYR5NoFoT5P4ihVcZVmD8DtuFLtjWeWKrHAWPpDDe0RYpN9Ma/DOOlx+vf1Ir7kzz";
        sout << "oXXOiVjM/hgKR9QjX1N05clcmkG8uSoxtaOU6Zov8BKIZAFfTMdQrhKBrW+Xgi5sKef2mBhPGwyx";
        sout << "pnudRmwMFKk1D8UXtuoEHYQX03cvYEDmWberg887C1ca4UdAg7b5/mysr2g5Md+vGHrqRtJE5Zhx";
        sout << "p2BFSzeFV83Zpe7PYf2uTLffLleJSKV5l6ohKDh4V2P4ztKvNwTKZYnYFdWlfMPUz3svuvihxG2h";
        sout << "OXNZJ9+Byx7v6RrU/42lLyY6p2078QYHif06BBp2267VkKcRN4pP9LlS2JECoex4vg43X/dE/48f";
        sout << "DbRfW8KeR5kSOnH9dDWcwdoco8MBwOV47KIkte6i3vj0BpAQZD+GFuR5EfIBxXuklMYFr7KRS9xK";
        sout << "oHMGA00uxrV5VWrzCm5lV4l4oMQcv9/hqFTLKo7nlQP5yu/TyoF+OSXP/qKX7N+CASLfNtwL1Ux5";
        sout << "fweiUkaKnLZh8f+bxh4x0/UO3H0LWyq07/1evSYUBQhHkzSYPhkTq2msJ+eFBc0+gpbOWntK37JY";
        sout << "udFJvL50jNoZf9clWcqzxnK5M/rqMjVCi1zzboiC1vyxWPhR8QMvEMRZ8XpVW/cAdLz5R+M3DGms";
        sout << "KCJtIpxrduXr5+Bq09jn/1oi4qro2/ikBRTVTLj4js+yaI2t0uE6XQX1PO2JwSHW3V9krhJ/7JJh";
        sout << "sLH3xidX1mf+O/hgu6NU1p4yrsGjz6qTYOQSjU7cVsCMRxW8y9vCWh2PcumONvuWeApgNKkkQj5d";
        sout << "c+8ftbo70YFtVWhKjTG4BHpNh6fXDC+0ZmkhTFEyHAwx0hF5k7217oTa7aKEQp2qGEROYxe/wBMO";
        sout << "Kq/lLPLQpVEldVSoOzmFNxGTkOo0j/bjAtwqwEd6mA87f8PvCiAWLTRpPFla4UbU8X0t82Ur943f";
        sout << "m+hm5CdEBtyV9P1uxMO6ez1SI5YezMPfMCkhpFqozJsPrjkPMIUSDc+WtF8frIfNsWWmjukFwFyB";
        sout << "3UU7r1AHWLJlEo4g9XPsMks3LkFeQ30cwm8Lnlj4wAistdLd3HNBydGSxO48Uaya2M6dfm3Xeu8Z";
        sout << "77+7God1knNpAnL7GFhTTTV7XcFxEr76Mfdt+KJTXHIf1M8ofe67hLrsT9FunpPmopFrNp69v2TD";
        sout << "H0/SQbseKjykzwvJkK46UeJFxYabRHSgL67prx6jwl2Cp9JnNIco/hWNPGbFVaEcMbZx5lkinzvT";
        sout << "KgwrJbVJ3oKnY2EJAnNDC2f1F8UpC1qQyEvhkA7g3yaJUKMF74TXqjz6BOhGmzn2c2GQBqzZ6d0/";
        sout << "Ko5f97NNO360xzWgTIiLbg1sPrA8OllufpaQRxyqFzTlU/kSU2BDLWXM2Iy6tGUAWCUGIkMgOUia";
        sout << "cXdp07NMyxlTzWBux4nmXRndTn9y53qZXjkeF87G+ZG2Q4lUmp2hunx+dyYVdOFWCePCYJ8TcORQ";
        sout << "kPI7Jcacu7QjoOz652vsf+PQPsarO1KlyKqX4rFudTs79TVOYdHsf53Y7RIMqp1NAFDjAsyFPdq3";
        sout << "YpOr3UrJu2RZm+eumrTK/JMHSRcbJuAyHJsBITQgvmisRy1wlcDqzw3k8OcfpkjFsJNPNaQ1kL7t";
        sout << "HiNZMtrv3t0ER3+NZL6PnWWp/tN+ASeE5p75S2UyKtgLONa6xg+gNfU1PzxuqgX6CU1me3GLx/xs";
        sout << "9pO0eUq57cy+gFcDzvTPw51WUrsaQhD+ayfUyRw9vpBiw34NQY1vMNReMgl6EbvRxFULAkx/oDFy";
        sout << "wnPkvTkMobxW3JnVGL2mb1iHUKmqQzBsMk6zQKiqtasPGrzg9Reb2DYSVdLpZWCha1BI8ySpOQy/";
        sout << "ndBNtz6DKHgIQ0lp2pzmJbU7JgqZD3UmfnKzHcjskto87KRz15aWYTnIFg7INMFMNUXqUYizX4V/";
        sout << "I6UpRr7GvKsITthFaIdwb1AGzKXRRmv7NrsH0x8ip+p6mDp/Sb9dUG0N4ODEYfLlGzA1U3KbZAWg";
        sout << "tfH2AF5+vVKtgUuuMH7XPQ9FBT8HwvqygWub9K6kLC1qwH9pK8YObWtrfOdTz0yfOwhaMo/kZCzS";
        sout << "+CWcit3PkXtOuNXlq3oO7fYcRDPdCOFbUs/KV522grIRqZ7mgludKZqP9b702FVEGFT+7TbxjS44";
        sout << "sx/F5YjT/XEfCP4ivZNjSYdEsQvSWfvnb5IBkjJafE8xnihUwcUNYYY9gUvKqZNm5XjKiTFLhPJR";
        sout << "SlaNrK/pzAMEDwVzHWPeF0ZG9y22WsIFfsYgDqJwjmXzd7yLkKBBe+NuRPlvhh/Adtzr+P/4NMoz";
        sout << "f7dcJzr/+VJMCqoq3tiRo6j5nOm3sylEvA7/HTethnRyHx494FMdSwJ1t4AXxrH1dSFNGOXWJ8Tn";
        sout << "WMi25e99RMpe+Fy3fBygtCiXgQ5/sozmxR6LEjv80uoqL0sopOWKSKe+aGZVzzPHhkfJV/HY9N9O";
        sout << "vJuNA1Cwp8X9OeFYzusBXdrWMfzTxfeYg6Qj7coKEToRF0SRuskob0+oWzufMPJVCCRRevu2BodH";
        sout << "QWE5HiZMuR4SYbEgwQBnH7RbF9vW/DB57H3HRvRc+NBpbYZcWipQyi3cy1RwmSNOtexX6XdqoXg/";
        sout << "iIBLmFENMiByy8AljjARQPUiH6OBU7xAY4zgiBrM0JCtsNlhnDuF1n1udIMnjmUcjAlJ4OkG9Q0L";
        sout << "w4RvKt6/d7xijIvnX+i0+jH898Jhe+fX+vu9prCfPxnhDPCeDOre7g5xcTAxpX9PyoFww93kdkUq";
        sout << "FAt7//v+bzkV8FvhUzso67ANCtS9w+ZmeEoU/ePml8oW2xGaOCx51hzfSzXhcvi6DQP70QhWGFKE";
        sout << "lqjV3s5Ra5WC4P0Ipqq6PKuho8bJn6hz4nlhlLaSF5GfDpqQKzHxvxvDw0//PJQGNv7LoCu5xtmf";
        sout << "u/CnU9wUfWie3YRDs6023yhdgyuY2nbSWSadumgv/zBNJH8zdP156zru/LLvr05hbn5QMlvdg3H6";
        sout << "jS5SxCi/FXaW5sOvngedtvRwZuN20nHHZQIFLr0JebQGxOS3Pceh6CeSmslzrvflpnrFJJk7wKDw";
        sout << "ponOE1ChzU50pPPl1Cr6vtz3mQ+cSSUfy/yj3jiIjVzs1ZRa73+iC3ibUKWzUcuZFeJtZ63UFYTL";
        sout << "I2oz6V2ylX4Swqr6INVp1abOAWFWba12EP97P36KMGN+Srm5E/BoowWKhpy9uR+AqQVP+NP5BW/m";
        sout << "02UQyGCthZMnbw7lSD+0Ihu4E/j0Zfh6K2vBz72vxGa9BW3aDUgNvLRyU4CyLf/X8Q5+73iT6Cwl";
        sout << "dlFumHdywzarpmRS01qfzCT7WN4Pd5HKKNvq9KaaUOUQqmkXrrGaaIoNTAKHh04hhi6BF5rfueW2";
        sout << "rOFlukiABYz2pLHwd8JCTUUH+l5ly6G5NhNWGdM9AH2tPxUpmqW2D3hmaF7k5I+ehdNQKHxnzXUB";
        sout << "Wv7O540zfZEVkF8cGAuaF9rvd4GTvTSU/0hO9JerDpYPDcwu7V7JT0lDjjlVyf8Rzr/5QtLAvsmR";
        sout << "ptFG+VFBQFzS1oSd0yQ5sSLnJbZcABQq5zK9kYMlSVg+DERu0yqSaxk7f5Kjm+KHLjoSR+9th9lB";
        sout << "AydFXCQdhbntrBkbSjG5t71xVSyhxcazUYoeulumJbiDMo2Nz/GBvviJL3ZAAyq2D0PFXJsVwk+o";
        sout << "0sSWItsGGLiiw55G5NN5KmQ/hxhbjxCMjzQ5ALsREiye7MPDdg9GgwA7xa7NdVdjprN8RxNlCS9a";
        sout << "bQRBO+z+P+2MoN7tk6JIWn2KU7ex6R6FKjwHz+kU4lJRaJF8LzpujYtTw78zAgqS2uTPDGpHdfJ9";
        sout << "uxW9x2IvyYg63TG7xBKS4+iFmSJGHsR5naozx3D72vCZ3jTe8D/fv8FlHOoPyYO4gOZgyC/cOIdC";
        sout << "jM/EFJKHkL99pSetGn8KALo7QbrosHpZER2s1nhIXc/kfG2rq+scF0ECChECnN9sVYEzerYuNXzk";
        sout << "nsAPu/3W0xYMg+TE0xQTdO8OTHsfnbGAm5ELN0wxTVfdXIE9QpYoSSRGtHphyFoKcOgRkyFHXMmb";
        sout << "zPuwR4bRhvT/HiW/bPnNrOBL2qpeoMKmhRyhU/8FpgoYANV+tuh2DCWGSu+b/xgzGO9kuqoekBaf";
        sout << "PGQjh+kV5tWT5u+NTO2SxkBaGLZkBK8j0a/h7CtCmwpK+7Hq6WyiFUgAUenY8FiZAgd/4lPXvcJf";
        sout << "JV+e2P83P/iAnnfFH9rt48Bq54rTjuhgDJ1FGHmW6uzHqX1XTINTidVSukSpy8+hpZvAiiNrQfTc";
        sout << "clOqzIsuuJVBivD5t9/BwKOp3dee9ZyDc9qTH9fjqkq8dKSjZjwTil0meMxI3EEhCOssrXql/+jH";
        sout << "JjPHBao4OnlnblFyPUFDp0MyFP3OE3o7Wa/RYrhLuq+edYM9aKgdWzvSbJAn8/LGHDt3/iH5joVH";
        sout << "UrMD9vp93N8RBsdbMY6hDoHEmHWXJvQAyVQpS/urgZbjbdtKT+vQKvwrRlUY4osNJ5fVGVDfY1qx";
        sout << "+3u5BWq4Fd2UwsKRM8Ut6m4dm0yog+pr3ZVcPfgGsyXG5HZdyDpdg0AJSb/wOAJiNZQGtvZQ87jJ";
        sout << "2Vk3fIVSb0gk2p4vINajCZksZCWordROndVW9kKviwD4QBpuvxTCgW1ww38M+0osHHzptdC/h98m";
        sout << "tFXeW1AOwfG41mRwckQs0MWVn5Be4cUFiZQ+qkgH99p+3ZoNiGdk2CCS5ABvejuAiJ07wbiAzi5S";
        sout << "2kdjxM6GgpBjmT3gOz3jvc4dgcXA6RZC+sbh9k3U7LakNE4PfZ/WME3qbN1nuj+9/xhHoa5/4gVF";
        sout << "qM571ayMhfBoKsoChNxVxiQDwMnMkIsbD+1xUEr/9OzIf1fnYKU26pX94koCtsdxN5l0HH5Url3J";
        sout << "+cSXI/XX9lOo/uUM5VW4eZ9aB9zfOx0/fuZTqcVxqkzUz8SH1gfOS2QzGBkoSDATOxVU++tTGsVS";
        sout << "jvCtloGsRzz7cSOdVEyGH7Pf1PweTT5MIyrqdmVDRyYiYcHNhxJvTS7iEcL6wdwXS0iX8NdIp9uq";
        sout << "NCrhqBcAlQZ8vKgXLe+FJ/oT0lwZQaF46SFEWjbvP8fm0xMVGm+pkaniNAVn2m7D1FADdIfcNTZt";
        sout << "QjWrboY5ZfHbOwOl06gTV9JTQGRjFDUjy98D4st3sQUZBq2JaFJ32Qg+fy7knNSrpu7sHWloP+vT";
        sout << "PvoJGbK/hFP0Zn5ZwN5V5UEbE2JzoJE91+VHhUwbh9TzNBxwnDroOxwpzHvJnCxnb8SPDKKrdT21";
        sout << "n+U+kVkf+0MiLo/GEQMa/365TlPqVNJDKzbtOwFzAV4/001Z8oHQwWqOeMZtOGkgbLx+mSs/sfCC";
        sout << "fMbMfcXXyjRgPYsG0JiQHXnB1AlQ7jdTslLgpTLra1uWB7PdFydbSd9xBrGJliq+s1VLML5vtHOx";
        sout << "zIkRy3z/6F985ZiZN991fTL8O+dnIr7/bhRAfnGz9zjdjVhfMCSZ1qbNg+pDIFre1eRezr7Vi/sf";
        sout << "/EAvYapgYXBpO2YHMivon5jd8BHIiDuMxvO3k8gtoc3N7cS4gRFbBX3KF4OY7st3c2TVBeXFGfQ4";
        sout << "pdfpb7uwAfOLY02qrouv7egOIQkfvVGGtFHHWyF7Ua+rBmdUgSN7qyAoX5ImUCkJBfYWKpDyV+qE";
        sout << "sl2Zv6TAlmoV1Ejb5zpSRGKTOZQeOL32IC4ObnmNN8Tt6PF2jWHKfF+E2EvDUnkvuryJgdaat1/e";
        sout << "ROv+l2tnyxLcsudPd5IC6PX1PtyQ/VRXVjPdgALubsid997mfwVUEKqN6lWCnyxWevrjqybNaNGy";
        sout << "TKR9jTz6c1lS/pvGyI6/tRau4N7yCm17IOPL4IS5LQxIrmZM5u4CJbXb66Jc+ugcFY1tLbh/2cOy";
        sout << "+XriVPTbEGDQ4A5uj+7xOo5ZRdoTrdVVPtDk+dlVfKzXzxpb25S81YFqhjO2mhIAQUVimhDvfzJI";
        sout << "3STEBOwpTG27aw//24pQ/l2/HG5fmjCFKnU27+lJU4OZWLVC4xyNFcC45PPCOcMbbGOv89uwVAzB";
        sout << "grsyHpXH8piJ+i48nWyjJYRcMY7QruLJj0XwI/zyfostfynEtzCQ4z7izYem68epGW8hJIno9YC9";
        sout << "ILlnQ3D1Q6ZuLS+DZbbYX5KtL51EGpOXIcURfvVEgUPpJDRszh3+2ftzLqq2kBq7/fp1qBVlX7V7";
        sout << "FpB+Atuo0nScYLh2qkckGVz6FD+sd55R1X87c2nyoq7Mneo23ed3+fOWL08vOS8k/TRYm8sah4Mw";
        sout << "jBMphehu83zxUzzmCxgyw/YqBpNeIvKOl0aG0QKJl+d/B6ZUujG2c/d21wxvGfhUdmPq0fIDY4f6";
        sout << "C+j6/lZmgeQKQtYoAN6ElDRpTXd1A+3QqqcI4B6stZQR4JS+yXVg9cbekGvrt4QQs4JX28naqY1a";
        sout << "2FUNMAiLZ2HiAOR65wSUstVLm7BfKhWmjwtsaC/0EW20Dk2UgnVOrBLnBQ9qAN4b7NmU0WonmxEY";
        sout << "ojTy/G3EUpNlGyA8/vW01VWvnHXY6vXYFIqbr5vVrcva9uTYUR55ZqOoEwieXtBtjMbrfsnHYv8P";
        sout << "tR/v9PeZbgs9t/KMYR/uMBEJ9AZiee7WVJ4h0btOaXK/46+XzeUtI5WcyLNL//5ryxuloF8d4dv+";
        sout << "Cc9x78QO31N65ELT/k1U0egzJxgrw/3Hki+p9JU8IkTsW0KpGjEGZBOV2pgikBdJvtj6FAa3wRUi";
        sout << "PJoSIfsvxzrV2luFEsFgl5yMEW90eOsiLKXcWDhqEEbulmLx2ij8UrCVCY56umeqc+LyPlDfKgrJ";
        sout << "EZjImfmAt2Ygq1eC4diAMOmE1UxpFq6naGmN7qqepdQluKbFsqDlYTpOaqfems/zLJqkcaw70LGr";
        sout << "VMp8Pqv5ii/0GDRXDBhkijv5WzyxkR3EypXXxNR/+1AiALmzJmi+es37MAcJrzTJXLa9VBqivhbR";
        sout << "8dN5+0P+2LwViHb55+k9sXzIjOGnOk0MEWlYHOGjMRTEGFRTN7A9nCyYXy9GNfPK2JcHVf87/hHY";
        sout << "5K2i4i7tUrCe2Csag8f30XMI6neY3ftCMT4Ig5IaZ1sFOq/T7tq9itnCcp4mwlEYPMyMIkG/F/LU";
        sout << "hee2A7h1pyXJfcGezwMznUz7W2ul6nPiyNiukKwkyscniZUpLlaY4QEqucllRuJ/68AaZ4b/Oej2";
        sout << "jyS1Ic2KncAmPZ+1Bg0neMcNSWquSJgYzaDClIpXV8f3PkHrr2uIsC9W3eNshopJHpqLMzuaQSHY";
        sout << "2vAiF94VOhVSyUWpQ/1azlaZt+to+uWlh913iWJJ1W6/ny5AwzWh7M0ikd65/vX/nmzcWDNIe4FB";
        sout << "dXtUgIbWZGSvTnb1Q0ff0C4F+XGSG/27sLrdSbmNv7IjZcqQJkNsqlIjOMUXKRPmfMmOD68qQomE";
        sout << "m02IDYew+Ah0vholXhlgVIa1V5eHItbFm0krwNfQsxBESR4dEQMJbkQAE17x52EneJzQRaNjkDdB";
        sout << "dCl8MkWvCwi4iNl6Mn5jQsO+3K2cC6fYHDRReXmp2OmWXlR600U+oSNyuQjNiUM6CD+q7IV0SWS9";
        sout << "txg/d76GC3ELUb9MtBhtm0dUBT4hCjyuLqMAVhzzPLfuR8ko2hc9l8VziIHDGnusZKle7mQWr84t";
        sout << "L/ERhHo94fQVR+BuogcMUEcFq0cAqYHWzwI41KVB/N77Tud7X5KuhGc5ulVJaPukTGGvqIrBDbBV";
        sout << "HXFCuuptn8cr123muSyZ9qBcXcSs7DRnZ1mFO1LoxW7j+SsuyE/c0bUN7ndjGTUC8OiS+NC8Bjdu";
        sout << "u6oxAUIqlNYIoY7EAPF0WphyKvId9I8knRWQUQhD4L2kk8yNvtYvjdv4udkJAUQydaZut/lnijSg";
        sout << "Ph21q7/c5IlPo22ZIiPI+a3O3wkV07i6vAPoC3zYn5Vu6bFRHSSyolNsOrEvCkWwQ0oTCcm0Mp2S";
        sout << "eiwjZU6/k1AjV5sbx86VksQ/AvKxU7RyMbeuElprxKJIMLdkghibR3x4clnKG1uRzM5c6eINHY97";
        sout << "vYFAN7XsTbpmtA5GgHUtBWVJl6OYhBplfM/ZECAqOp0ZbBpEpfEntR/Go9qLPlXT7uFTcqxKePSv";
        sout << "pYwsS8xLTovG/ELnF7/7NxL1ZPloXw7JXSPoSWEdbQ77qG6nOOYyeYf8i8MCkSC8tBM6rcORlcfl";
        sout << "GTUIeRALSs6B63QHlms4Ev//nz2bSKv7BHMmrA1+2EI23xeZgiuPoKBfdCe/YxF5kXZ0PSlxsj2N";
        sout << "7OCHsUTBiQrVCUoAO5hXZWAlSz93FgBGkc8bh/d6dLW98dXvWPxLdq6vx7URXleswpb3FPFNm8R5";
        sout << "Q6WOEu2+Y7ilKgIq4yv2259Heqthy3z/t3QuTfa+lmhTEpLDyFFZ1o6ERsqYmMrkPM5DoPn5K1BS";
        sout << "8svZoTTyRFw6yxjoVC3rk3ICe904M/cuuPxOaV6D3/7/k2/9Qn2+dDWV/Kv/HnH9kR5L/YjZ924u";
        sout << "yI4vfT98p5Jbxd+m8wguelLfXVTz2dNjBQ9fxfZbVWMJj2Eo1BjHIAXpFjE7g9fog+NbIqnlIb3J";
        sout << "rBh8jEGWy2lNrNZXVzYly0z4d7qmrcbGI5FhlWOkKBFAdp39ju66kI39BZiM/RoTydqIQ2iA/eZX";
        sout << "wqgzqMPQ/LrpImeroHcY3tMd334UHnzDDq2rJcqreapzK+YM/saPsBmiYWs4joiDCjTJcGuHOroE";
        sout << "PIDb3yGry6Hov+GNqI/NpjFMQIrEJlR25yBiunN3t4sAcHQJzT8OHxrDVV2BWGRbagCMqWqeN7KY";
        sout << "ePwovpts9a5QbgncQzbGT8X9p5WQ/uY9miOJACWeHr/kZXjQt2ngGBQdOm9i3RfYW8NOjBDGtBpJ";
        sout << "Ys31Wj9mwuC7+o+4DLfqtfXrjW/Or4zJca7EkuKJbRjlicYSyMNSrQPjGxq8qYkHds1dEQM0JydM";
        sout << "NjFG5vLb+nqNRrABnSVkuEl2W83udqnjDE+mJVEnfwHnPxF2k1Kr2nmxqO54ZUranYnyggZxrvuu";
        sout << "HGkg62IpJXv6u1R+7rF8XRErh36r2lkmps1cCkmW7PrqaB+z/wExOH7kDZG4cMJitrTDywtYsDVu";
        sout << "xltXSqRBUTH/nxrq/9EiQOM7j/ITCoiZJRfA+G2hW4srArUW8EXEy1dKfOKrooxrZnGeEh2E5sHi";
        sout << "Dib1M9iQlTCc+BZFPqvOv8lM8uIe4ylVvh5DtyzcKgg1ta5hj4nTKL11vLDBXyqBCVz288zqy+Ra";
        sout << "seXn0vPNCk9fsxOtFyjUH9UiE7sYcVB/SWYa662DLAvV832uOjFVlOEESlVhhYWb4nCEDZVnOnPH";
        sout << "1ilf7LOgVi+qHmMm3FS2F55YclALS9CpVmVbt4ADpgKaE8V0TlI84mglvHOJfqE5duRDMfdQkjBV";
        sout << "o4vxT6Y2xv49ARNgDI2J8yt0bxnQ257afzSUxvvlROxBrYYNNkQ5lPivD+zeWH5j/ojyxqF5iSNq";
        sout << "Arp6ClK878ubKMvRPjdmrifFhSfs9vhfL3Ox0YFPBq3zKLPbTJEalN3Eeiuzd0dDSnUatLnV38V+";
        sout << "wyxNsDDywi83kR+dulf2SytyhnCCKOHHstUa3M5klOVLCsrj5lL3CarIo89fqpqqY0H3gzosW+jw";
        sout << "e+Qd/PTgX7FQd08oasrwptSX41xYXtTH/K/ndPg6i/YzmdIBvGuV+A4MltyzGXXRYxulYZv+OLOE";
        sout << "9AIl10pH5amcenHV9Q97qZ2NAtGeBGcWQNpQRl7titOfka4CHpNBXjg1xm/go6SHCy2Lb220mw13";
        sout << "x2kdIEa7b+bRZrXwYJ7CNHE/OuKclyzDvZHfwOrqGl2mfYnG78oi+Gr482vOBZBr5sYf2GxUT4lr";
        sout << "7YPENdvyYarw/liMmmWE7Td9rTkHXTt3KvCaeJRddK63LIjQrOJNCalDytkGT2LfsY9hu5r6a7Of";
        sout << "yspHZhOqBBOyjGXe4/D5nQqwpFfccywWBEtnC/+DINOvqpfqx9CxFAZzdjJJRlIPtK6erv1dSTEn";
        sout << "AodulJz+SoMYUrOSyKPqQlVdN0ycHvLFTwspnZv/6NqNzV8iqYuIb/iylAww3BkmtbmHJBKpeRKc";
        sout << "DVNWSOiFRb83QaDQLh+nfH3J0p8OcEQgN0XSQIamAOGuRPcTILCNsn9gg2qEwpgpo/1gL50XfpvH";
        sout << "2SNQBJqD6DaZ1VwqzEyQXAw26niGJ83+UEB915mZR10FYo8mM3Et5WYyg3/0Y3u3+B0GHtF1lImL";
        sout << "wrpLFhUdRBijcxzCYwuPwrbC6tIHnfV06rwehfR5Anq0cwqip1O+uw2Af3IfjWh0wImoQx3Cm9k5";
        sout << "Z3iRoZ0+MttTVyFuWjHGrwVkSItkwzvzRL/UdeyTkRqSQvDM9zZiwNygcp8FrpdEBuxMmfC4zAyW";
        sout << "y0yNR75+2NpI4MPxmEh6jvDJrsKQ+hxl7teqfPRRi8leqIvz305ZBVcrP5bHMcuj7Iun9znHdqnR";
        sout << "ngddgfi7+SRsy5pQEtmhMoTI5Q3q7OB4I8IrttJPJRu5Y2HCUeCfmTlTVQD0iu/eXYeAbt9GXcb2";
        sout << "LptTexWOkchMYcVh5qFWVmnPWjRa3X1nl3ildvrkqjTjA96J4G9sd0TwldCyZ/GglrM+SP55tvLv";
        sout << "4MOevxl2gpNHipkZh19MiJpBArgBT1uyScDXrty46tWdIC3eKAmVfZprFbjswk6L9f+DmzDyeDlD";
        sout << "v3mfZy7c0rZt/AIrReTIJYb/aWRCno4vyWww6AbvH1AYm0nWD3/jcZazTEsLGk1LkZwQ6hpXOHa7";
        sout << "47lDu5kdU6hprzMEhGuNLdYDKf+Bk8I7sYp7fBn0FvpnD+w11jhINFJZHL+4MG53CzMqo0iiAbX0";
        sout << "9ppZbFaOVCrNfqJaRWKYQnkcyCFFOsF8MCKeujNtUynXLAz258d669Fr8c4jl/nzSdi6Y5SMqdJw";
        sout << "tIBdmkAHxdv6sCRys4gyeyFjVHDeUNrszqG34rEV/905CJn8JNTOtUB/kk+WJaxrKyLkGUMHQHWO";
        sout << "N8whx74uMJhsg4W+Qpogy9uopqF7Unk/kCbuBrDzXR9+XjYwhFE6uteAbUJ7RgrWCP8929150lOz";
        sout << "dk86E6B9KZjyIke0jrxH9AwH1hiOLkF8kIWVXdjTPgqF4Q5BjjIdSWhXWS55t2rpD7Hxg3cvOILF";
        sout << "c6IoU/uRuxpoMMnSuzq+weYnEjTBW6SlnjXjkIuZaK1+2U9rWDaqEgTn2ip8dgS+YA7vA7+dh4we";
        sout << "vR308ToEwblhv8vSWJICn4iyfaUDcFCXVegEzl4oJcLY0u4NAAxEVj8O4YN9XQcA51dADKZD3+70";
        sout << "yfVPjt4xF1StFZAt8zZuiuh17/SxoyRZXSOZ4lrX1ihQI+mVIXAblu+LpJM+ugowwdnnBS/poJwJ";
        sout << "b2W5jv3q+IFy6VJjYkvzUpckAnHGlQyDhYpyYARW6S8BcAox4++WgK6K7iYjgJVUxTKdMf3LmbWm";
        sout << "UhoR8Xy3P6NBq7lzZRddjFQLZ1wtKBgvqjSdtXDFg8C4oUG3s1UKF5rLQ8ZC4EXn9kHCJI6U4IdT";
        sout << "nVsNrF8RTfItEy3ji64JnvVGmFDPb3V0CPSlSrGwmiF9TeN4iT1OOWCXNfJyLL947Mpd2hOx1jpa";
        sout << "52OVo+GofOhImcAXIryA9BoupDVR//+7iFB8qffCuz2ZyhAeKTvVg5/TEXsItr/9Mc4kbKUo31E7";
        sout << "7cd47sykXhs+vdWU1qVpVkjDOmsHdnXLxkrL23+UUu0gUoE/zdEayg+yJ5nckV0EULpnOUdI6kD2";
        sout << "r7PFc0abFaw0FrIV61f0AHLAYuFGL4/pZNXoHbMPcTjIOr5MvuneN2n32lqhHQyoZr7er4gm4n6s";
        sout << "fPmgp/ezVB0uhb5Bovr7uKBjqCSSxwpyWLIioAUIy+J/bGQMqvC447PgH3Kkvkhmp33i0pEp1utN";
        sout << "hXTHtnu2vdNNwZNrdANwSs8/hzRjI4qdcFVjCpnRyrcIATvkalWB6345vTSyg77XPO0m7q3M41sN";
        sout << "me9p4AeLxlgRDIfkJrq27zPlYT+w+o27s3jXBS2MvMdSwl4CW6UyHCqrouaXy51PrWtFLY1LZjx9";
        sout << "3R0xGbp9XZC9WRqiL91VMa9l/sTS92bw7urPeRj1FHh5HNyDSpaLEDHQiihXJaz4xxGbdEveyHW7";
        sout << "4yhgD4sR0slooQhw9O6IaL7gjw0auFf+ty8jedYY/LfLHhbRGYvmdL1NiskwM6mdgPs/w1q++HFt";
        sout << "u613gA7BRTxRw9MIiriCtGyk4U8uO6PnGGqRoXNpnJXE9fgl9Qdoy6N+uw2JTIMcE6btB1lbjdQD";
        sout << "nlUalgZMbXzm07z+MNNNGSc5Lc3ylAJ3v19GL6qPYYvDtXcXC8lPRSmeZu3k4tDZ7gVlokrSewYR";
        sout << "iQznd/Cq4w/MBXFRy5nbtKMeAfQOEU0KTgcOPVYfd4sUJiQixYOyDpRjWHLuEfCXoXEbLIBLeJ8j";
        sout << "6YHwyOMMzxBepwBSxTNRlNnY5GF22kwhk/KUIB12mmkegsiTSfA4Kz3q05i7KF93WZB1gDRSkpJ5";
        sout << "DgtN6fALotQJlAdI7CgKxiqkTD6YD+wIA7g/bu7EwH5anE+r9mBEimDxrDNyhCSVwfYPnFmi/HLk";
        sout << "CtH5msyO61QCth9RCpOKMsnqHH2oqh6XrH+D6FjhmFxqlzp5PJ3SEybtCY25xxxnmwyJh0uDcAzr";
        sout << "a1EupoKzlsY8U8kFdcmhOtPOnSgQRqUoLQxZ0RUixPiKFI3ikbai5/ZNNlt7Cl6XcOWxnQn1XLGh";
        sout << "7KewlqwiweypCVOk1D6NHgTdfCGzW0NWYrs8cqzc47cWDSMQbn8Zzr9LMHdjq1t5VoT+0pyasBhf";
        sout << "Wxih23uQlVfaNO5SlxpMPuW3TFpASdhxiXVmJbIl/j02lo5w2MLYUUouGKT/WeTr2f2R1kNZkCcN";
        sout << "44DdifeZYVqoUrAV3etS4Py0H6OHDtAnFmU7983u/bZ7bpkfvFl97zvms5D5JWuFQ8HZTZikTzIM";
        sout << "uxDpDcxkFz1U24O/WnovgMCipjI6uV39rjWr3qXb3qzc9D7Fp+jh3eg3F9C/SeXY9Ru077P9mAI2";
        sout << "oRgh+2hJ86+1/YdCetlEVgmIVVVGVbcZWLNoHISNo2lnH3fSDcfWTRekNBlvUgiAE49tH+av0SN7";
        sout << "cxjm3vWlWv9Mdt1BvZORAk2sYugBnDJZbB+F53rKioLbUNdlCG2HcjDboLrRnY//cxOlOARg9UYB";
        sout << "N4+HueNJApuqkGhItKHRMKXWXWXKYkyN4PdPicVFpdlxwoeXNWMtNvUbOv9oAox2HwWqFERO9JGa";
        sout << "wSXE2oYyE0+BUUUPq4Bf0HobSR9yOVj2YmgvvEv61uS/7rDiSHElMnyrGnOpy1Jk9Qc7BwDJ4iJt";
        sout << "LH0qQR8w6qXJcDajjLT2dYkzFYj8Hl4iglGCRuFTKjhQLp/E1nium2AS5aSlvk2GwX4SHEnk6nAP";
        sout << "zYbc2wAbehdVW48RzUWWSW62Zckj2YpDSMoHlPJhysfxN5NhGzoBag5D28vAsbmuOYKw+aDDg7/Q";
        sout << "kmGxNMjXuZ8z2dUHAXA04UxRx7P4kIDYHrOPyd1s+V/Nhd2WSodXW+X0N1pC5Wv8EYYeNaUke7h/";
        sout << "8w83XCJ9cHSUO/PTRY8VLd1GX0UFkPb4m3Vgbv2ARqK+ZoZ7t09USLMz9JG9MeD3+J0vL9jShQW3";
        sout << "+4j4G9ZuiIW3VlOu5Qm7jdcLEMzd54mqjC6gYRqTYNP+1P3LtfVY7nhRdxR6S8Zt16B1z+hHtLsY";
        sout << "APWNCR21V6k3R3MjFIit1mBJZDLFFM2OEAYZW+SQ+TkcSueb5xCyFK2gwynzU6l5/CSbaudjWjsE";
        sout << "hpcqZTmHsv+ertehndIaMes/Ihe9ZWf8KJU8sYDn4gV/A/ZXesRLMDtGsTKTywN99GdKi1yX1vpv";
        sout << "ugSgxjMoplA6lZHmz3+sEUepfpLVQxpBQ7OvrZrhBuf8GxgKRC2C9LbdKdq8+qM/qjuNUf4CKz13";
        sout << "OZfp6K89LPJx4Qua2uEKtoa1i4LN3Yt5urZz6CZmlyZR8/jo2e/PBqsKc5zP7SzJdQ3fELngYdUm";
        sout << "HJC7uE6ElkbQWqTUg1Tjm8W2kGmbahkM6eVYps1yVrWqWQvFG/m3IUUrIhtvK5JwzlRfH13GIevg";
        sout << "cyQl2750lWOaewIa3Bni58GNVuR3icSmcf6hZ2PbeEdnnxMW8oHUp/cWMVHmZdG+AA==";


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



