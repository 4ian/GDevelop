// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_FFt_Hh_
#define DLIB_FFt_Hh_

#include "matrix_fft_abstract.h"
#include "matrix_utilities.h"
#include "../hash.h"
#include "../algs.h"


// No using FFTW until it becomes thread safe!
#if 0
#ifdef DLIB_USE_FFTW
#include <fftw3.h>
#endif // DLIB_USE_FFTW
#endif

namespace dlib
{

// ----------------------------------------------------------------------------------------

    inline bool is_power_of_two (
        const unsigned long& value
    )
    {
        if (value == 0)
            return true;
        else
            return count_bits(value) == 1;
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {

    // ------------------------------------------------------------------------------------

        /*
            The next few functions related to doing FFTs are derived from Stefan
            Gustavson's (stegu@itn.liu.se) public domain 2D Fourier transformation code.
            The code has a long history, originally a FORTRAN implementation published in:
            Programming for Digital Signal Processing, IEEE Press 1979, Section 1, by G. D.
            Bergland and M. T. Dolan.  In 2003 it was cleaned up and turned into modern C
            by Steven Gustavson.  Davis King then rewrote it in modern C++ in 2014 and also
            changed the transform so that the outputs are identical to those given from FFTW.
        */

    // ------------------------------------------------------------------------------------

        /* Get binary log of integer argument - exact if n is a power of 2 */
        inline long fastlog2(long n)
        {
            long log = -1;
            while(n) {
                log++;
                n >>= 1;
            }
            return log ;
        }

    // ------------------------------------------------------------------------------------

        /* Radix-2 iteration subroutine */
        template <typename T>
        void R2TX(int nthpo, std::complex<T> *c0, std::complex<T> *c1)
        {
            for(int k=0; k<nthpo; k+=2) 
            {
                std::complex<T> temp = c0[k] + c1[k];
                c1[k] = c0[k] - c1[k];
                c0[k] = temp;
            }
        }

    // ------------------------------------------------------------------------------------

        /* Radix-4 iteration subroutine */
        template <typename T>
        void R4TX(int nthpo, std::complex<T> *c0, std::complex<T> *c1,
            std::complex<T> *c2, std::complex<T> *c3)
        {
            for(int k=0;k<nthpo;k+=4) 
            {
                std::complex<T> t1, t2, t3, t4;
                t1 = c0[k] + c2[k];
                t2 = c0[k] - c2[k];
                t3 = c1[k] + c3[k];
                t4 = c1[k] - c3[k];

                c0[k] = t1 + t3;
                c1[k] = t1 - t3;
                c2[k] = std::complex<T>(t2.real()-t4.imag(), t2.imag()+t4.real());
                c3[k] = std::complex<T>(t2.real()+t4.imag(), t2.imag()-t4.real());
            }
        }

    // ------------------------------------------------------------------------------------

        template <typename T>
        class twiddles
        {
            /*!
                The point of this object is to cache the twiddle values so we don't
                recompute them over and over inside R8TX().
            !*/
        public:

            twiddles()
            {
                data.resize(64);
            }
            
            const std::complex<T>* get_twiddles (
                int p 
            ) 
            /*!
                requires
                    - 0 <= p <= 64
                ensures
                    - returns a pointer to the twiddle factors needed by R8TX if nxtlt == 2^p
            !*/
            {
                // Compute the twiddle factors for this p value if we haven't done so
                // already.
                if (data[p].size() == 0)
                {
                    const int nxtlt = 0x1 << p;
                    data[p].reserve(nxtlt*7);
                    const T twopi = 6.2831853071795865; /* 2.0 * pi */
                    const T scale = twopi/(nxtlt*8.0);
                    std::complex<T> cs[7];
                    for (int j = 0; j < nxtlt; ++j)
                    {
                        const T arg = j*scale;
                        cs[0] = std::complex<T>(std::cos(arg),std::sin(arg));
                        cs[1] = cs[0]*cs[0];
                        cs[2] = cs[1]*cs[0];
                        cs[3] = cs[1]*cs[1];
                        cs[4] = cs[2]*cs[1];
                        cs[5] = cs[2]*cs[2];
                        cs[6] = cs[3]*cs[2];
                        data[p].insert(data[p].end(), cs, cs+7);
                    }
                }

                return &data[p][0];
            }

        private:
            std::vector<std::vector<std::complex<T> > > data;
        };

    // ----------------------------------------------------------------------------------------

        /* Radix-8 iteration subroutine */
        template <typename T>
        void R8TX(int nxtlt, int nthpo, int length, const std::complex<T>* cs,
            std::complex<T> *cc0, std::complex<T> *cc1, std::complex<T> *cc2, std::complex<T> *cc3,
            std::complex<T> *cc4, std::complex<T> *cc5, std::complex<T> *cc6, std::complex<T> *cc7)
        {
            const T irt2 = 0.707106781186548;  /* 1.0/sqrt(2.0) */

            for(int j=0; j<nxtlt; j++) 
            {
                for(int k=j;k<nthpo;k+=length) 
                {
                    std::complex<T> a0, a1, a2, a3, a4, a5, a6, a7;
                    std::complex<T> b0, b1, b2, b3, b4, b5, b6, b7;
                    a0 = cc0[k] + cc4[k];
                    a1 = cc1[k] + cc5[k];
                    a2 = cc2[k] + cc6[k];
                    a3 = cc3[k] + cc7[k];
                    a4 = cc0[k] - cc4[k];
                    a5 = cc1[k] - cc5[k];
                    a6 = cc2[k] - cc6[k];
                    a7 = cc3[k] - cc7[k];

                    b0 = a0 + a2;
                    b1 = a1 + a3;
                    b2 = a0 - a2;
                    b3 = a1 - a3;

                    b4 = std::complex<T>(a4.real()-a6.imag(), a4.imag()+a6.real());
                    b5 = std::complex<T>(a5.real()-a7.imag(), a5.imag()+a7.real());
                    b6 = std::complex<T>(a4.real()+a6.imag(), a4.imag()-a6.real());
                    b7 = std::complex<T>(a5.real()+a7.imag(), a5.imag()-a7.real());

                    const std::complex<T> tmp0(-b3.imag(), b3.real());
                    const std::complex<T> tmp1(irt2*(b5.real()-b5.imag()), irt2*(b5.real()+b5.imag()));
                    const std::complex<T> tmp2(-irt2*(b7.real()+b7.imag()), irt2*(b7.real()-b7.imag()));

                    cc0[k] = b0 + b1;
                    cc1[k] = b0 - b1;
                    cc2[k] = b2 + tmp0;
                    cc3[k] = b2 - tmp0;
                    cc4[k] = b4 + tmp1;
                    cc5[k] = b4 - tmp1;
                    cc6[k] = b6 + tmp2;
                    cc7[k] = b6 - tmp2;
                    if(j>0) 
                    {
                        cc1[k] *= cs[3];
                        cc2[k] *= cs[1];
                        cc3[k] *= cs[5];
                        cc4[k] *= cs[0];
                        cc5[k] *= cs[4];
                        cc6[k] *= cs[2];
                        cc7[k] *= cs[6];
                    }
                }

                cs += 7;
            }
        }

    // ------------------------------------------------------------------------------------

        template <typename T, long NR, long NC, typename MM, typename layout>
        void fft1d_inplace(matrix<std::complex<T>,NR,NC,MM,layout>& data, bool do_backward_fft, twiddles<T>& cs)
        /*!
            requires
                - is_vector(data) == true
                - is_power_of_two(data.size()) == true
            ensures
                - This routine replaces the input std::complex<double> vector by its finite
                  discrete complex fourier transform if do_backward_fft==true.  It replaces
                  the input std::complex<double> vector by its finite discrete complex
                  inverse fourier transform if do_backward_fft==false.

                  The implementation is a radix-2 FFT, but with faster shortcuts for
                  radix-4 and radix-8. It performs as many radix-8 iterations as possible,
                  and then finishes with a radix-2 or -4 iteration if needed.
        !*/
        {
            if (data.size() == 0)
                return;

            std::complex<T>* const b = &data(0);
            int L[16],L1,L2,L3,L4,L5,L6,L7,L8,L9,L10,L11,L12,L13,L14,L15;
            int j1,j2,j3,j4,j5,j6,j7,j8,j9,j10,j11,j12,j13,j14;
            int j, ij, ji;
            int n2pow, n8pow, nthpo, ipass, nxtlt, length;

            n2pow = fastlog2(data.size());
            nthpo = data.size();

            n8pow = n2pow/3;

            if(n8pow)
            {
                /* Radix 8 iterations */
                for(ipass=1;ipass<=n8pow;ipass++) 
                {
                    const int p = n2pow - 3*ipass;
                    nxtlt = 0x1 << p;
                    length = 8*nxtlt;
                    R8TX(nxtlt, nthpo, length, cs.get_twiddles(p),
                        b, b+nxtlt, b+2*nxtlt, b+3*nxtlt,
                        b+4*nxtlt, b+5*nxtlt, b+6*nxtlt, b+7*nxtlt);
                }
            }

            if(n2pow%3 == 1) 
            {
                /* A final radix 2 iteration is needed */
                R2TX(nthpo, b, b+1); 
            }

            if(n2pow%3 == 2)  
            {
                /* A final radix 4 iteration is needed */
                R4TX(nthpo, b, b+1, b+2, b+3); 
            }

            for(j=1;j<=15;j++) 
            {
                L[j] = 1;
                if(j-n2pow <= 0) L[j] = 0x1 << (n2pow + 1 - j);
            }

            L15=L[1];L14=L[2];L13=L[3];L12=L[4];L11=L[5];L10=L[6];L9=L[7];
            L8=L[8];L7=L[9];L6=L[10];L5=L[11];L4=L[12];L3=L[13];L2=L[14];L1=L[15];

            ij = 0;

            for(j1=0;j1<L1;j1++)
                for(j2=j1;j2<L2;j2+=L1)
                    for(j3=j2;j3<L3;j3+=L2)
                        for(j4=j3;j4<L4;j4+=L3)
                            for(j5=j4;j5<L5;j5+=L4)
                                for(j6=j5;j6<L6;j6+=L5)
                                    for(j7=j6;j7<L7;j7+=L6)
                                        for(j8=j7;j8<L8;j8+=L7)
                                            for(j9=j8;j9<L9;j9+=L8)
                                                for(j10=j9;j10<L10;j10+=L9)
                                                    for(j11=j10;j11<L11;j11+=L10)
                                                        for(j12=j11;j12<L12;j12+=L11)
                                                            for(j13=j12;j13<L13;j13+=L12)
                                                                for(j14=j13;j14<L14;j14+=L13)
                                                                    for(ji=j14;ji<L15;ji+=L14) 
                                                                    {
                                                                        if(ij<ji)
                                                                            swap(b[ij], b[ji]);
                                                                        ij++;
                                                                    }


            // unscramble outputs
            if(!do_backward_fft) 
            {
                for(long i=1, j=data.size()-1; i<data.size()/2; i++,j--)
                {
                    swap(b[j], b[i]);
                }
            }
        }

    // ------------------------------------------------------------------------------------

        template < typename T, long NR, long NC, typename MM, typename L >
        void fft2d_inplace(
            matrix<std::complex<T>,NR,NC,MM,L>& data,
            bool do_backward_fft
        )
        {
            if (data.size() == 0)
                return;

            matrix<std::complex<double> > buff;
            twiddles<double> cs;

            // Compute transform row by row
            for(long r=0; r<data.nr(); ++r) 
            {
                buff = matrix_cast<std::complex<double> >(rowm(data,r));
                fft1d_inplace(buff, do_backward_fft, cs);
                set_rowm(data,r) = matrix_cast<std::complex<T> >(buff);
            }

            // Compute transform column by column
            for(long c=0; c<data.nc(); ++c) 
            {
                buff = matrix_cast<std::complex<double> >(colm(data,c));
                fft1d_inplace(buff, do_backward_fft, cs);
                set_colm(data,c) = matrix_cast<std::complex<T> >(buff);
            }
        }
        
    // ----------------------------------------------------------------------------------------

        template <
            typename EXP, 
            typename T
            >
        void fft2d(
            const matrix_exp<EXP>& data, 
            matrix<std::complex<T> >& data_out,
            bool do_backward_fft
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(is_power_of_two(data.nr()) && is_power_of_two(data.nc()),
                "\t matrix fft(data)"
                << "\n\t The number of rows and columns must be powers of two."
                << "\n\t data.nr(): "<< data.nr()
                << "\n\t data.nc(): "<< data.nc()
                << "\n\t is_power_of_two(data.nr()): " << is_power_of_two(data.nr())
                << "\n\t is_power_of_two(data.nc()): " << is_power_of_two(data.nc())
            );

            if (data.size() == 0)
                return;

            matrix<std::complex<double> > buff;
            data_out.set_size(data.nr(), data.nc());
            twiddles<double> cs;

            // Compute transform row by row
            for(long r=0; r<data.nr(); ++r) 
            {
                buff = matrix_cast<std::complex<double> >(rowm(data,r));
                fft1d_inplace(buff, do_backward_fft, cs);
                set_rowm(data_out,r) = matrix_cast<std::complex<T> >(buff);
            }

            // Compute transform column by column
            for(long c=0; c<data_out.nc(); ++c) 
            {
                buff = matrix_cast<std::complex<double> >(colm(data_out,c));
                fft1d_inplace(buff, do_backward_fft, cs);
                set_colm(data_out,c) = matrix_cast<std::complex<T> >(buff);
            }
        }
        
    // ------------------------------------------------------------------------------------

    } // end namespace impl

// ----------------------------------------------------------------------------------------

    template <typename EXP>
    matrix<typename EXP::type> fft (const matrix_exp<EXP>& data)
    {
        // You have to give a complex matrix
        COMPILE_TIME_ASSERT(is_complex<typename EXP::type>::value);
        // make sure requires clause is not broken
        DLIB_CASSERT(is_power_of_two(data.nr()) && is_power_of_two(data.nc()),
            "\t matrix fft(data)"
            << "\n\t The number of rows and columns must be powers of two."
            << "\n\t data.nr(): "<< data.nr()
            << "\n\t data.nc(): "<< data.nc()
            << "\n\t is_power_of_two(data.nr()): " << is_power_of_two(data.nr())
            << "\n\t is_power_of_two(data.nc()): " << is_power_of_two(data.nc())
            );

        if (data.nr() == 1 || data.nc() == 1)
        {
            matrix<typename EXP::type> temp(data);
            impl::twiddles<typename EXP::type::value_type> cs;
            impl::fft1d_inplace(temp, false, cs);
            return temp;
        }
        else
        {
            matrix<typename EXP::type> temp;
            impl::fft2d(data, temp, false);
            return temp;
        }
    }

    template <typename EXP>
    matrix<typename EXP::type> ifft (const matrix_exp<EXP>& data)
    {
        // You have to give a complex matrix
        COMPILE_TIME_ASSERT(is_complex<typename EXP::type>::value);
        // make sure requires clause is not broken
        DLIB_CASSERT(is_power_of_two(data.nr()) && is_power_of_two(data.nc()),
            "\t matrix ifft(data)"
            << "\n\t The number of rows and columns must be powers of two."
            << "\n\t data.nr(): "<< data.nr()
            << "\n\t data.nc(): "<< data.nc()
            << "\n\t is_power_of_two(data.nr()): " << is_power_of_two(data.nr())
            << "\n\t is_power_of_two(data.nc()): " << is_power_of_two(data.nc())
            );

        matrix<typename EXP::type> temp;
        if (data.size() == 0)
            return temp;

        if (data.nr() == 1 || data.nc() == 1)
        {
            temp = data;
            impl::twiddles<typename EXP::type::value_type> cs;
            impl::fft1d_inplace(temp, true, cs);
        }
        else
        {
            impl::fft2d(data, temp, true);
        }
        temp /= data.size();
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template < typename T, long NR, long NC, typename MM, typename L >
    void fft_inplace (matrix<std::complex<T>,NR,NC,MM,L>& data)
    // Note that we don't divide the outputs by data.size() so this isn't quite the inverse.
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(is_power_of_two(data.nr()) && is_power_of_two(data.nc()),
            "\t void fft_inplace(data)"
            << "\n\t The number of rows and columns must be powers of two."
            << "\n\t data.nr(): "<< data.nr()
            << "\n\t data.nc(): "<< data.nc()
            << "\n\t is_power_of_two(data.nr()): " << is_power_of_two(data.nr())
            << "\n\t is_power_of_two(data.nc()): " << is_power_of_two(data.nc())
            );

        if (data.nr() == 1 || data.nc() == 1)
        {
            impl::twiddles<T> cs;
            impl::fft1d_inplace(data, false, cs);
        }
        else
        {
            impl::fft2d_inplace(data, false);
        }
    }

    template < typename T, long NR, long NC, typename MM, typename L >
    void ifft_inplace (matrix<std::complex<T>,NR,NC,MM,L>& data)
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(is_power_of_two(data.nr()) && is_power_of_two(data.nc()),
            "\t void ifft_inplace(data)"
            << "\n\t The number of rows and columns must be powers of two."
            << "\n\t data.nr(): "<< data.nr()
            << "\n\t data.nc(): "<< data.nc()
            << "\n\t is_power_of_two(data.nr()): " << is_power_of_two(data.nr())
            << "\n\t is_power_of_two(data.nc()): " << is_power_of_two(data.nc())
            );

        if (data.nr() == 1 || data.nc() == 1)
        {
            impl::twiddles<T> cs;
            impl::fft1d_inplace(data, true, cs);
        }
        else
        {
            impl::fft2d_inplace(data, true);
        }
    }

// ----------------------------------------------------------------------------------------

    /*
        I'm disabling any use of the FFTW bindings because FFTW is, as of this writing, not
        threadsafe as a library.  This means that if multiple threads were to make
        concurrent calls to these fft routines then the program could crash.  If at some
        point FFTW is fixed I'll turn these bindings back on.

        See https://github.com/FFTW/fftw3/issues/16
    */
#if 0
#ifdef DLIB_USE_FFTW

    template <long NR, long NC, typename MM, typename L>
    matrix<std::complex<double>,NR,NC,MM,L> call_fftw_fft(
        const matrix<std::complex<double>,NR,NC,MM,L>& data
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(is_power_of_two(data.nr()) && is_power_of_two(data.nc()),
            "\t matrix fft(data)"
            << "\n\t The number of rows and columns must be powers of two."
            << "\n\t data.nr(): "<< data.nr()
            << "\n\t data.nc(): "<< data.nc()
            << "\n\t is_power_of_two(data.nr()): " << is_power_of_two(data.nr())
            << "\n\t is_power_of_two(data.nc()): " << is_power_of_two(data.nc())
            );

        if (data.size() == 0)
            return data;

        matrix<std::complex<double>,NR,NC,MM,L> m2(data.nr(),data.nc());
        fftw_complex *in, *out;
        fftw_plan p;
        in = (fftw_complex*)&data(0,0);
        out = (fftw_complex*)&m2(0,0);
        if (data.nr() == 1 || data.nc() == 1)
            p = fftw_plan_dft_1d(data.size(), in, out, FFTW_FORWARD, FFTW_ESTIMATE);
        else
            p = fftw_plan_dft_2d(data.nr(), data.nc(), in, out, FFTW_FORWARD, FFTW_ESTIMATE);
        fftw_execute(p); 
        fftw_destroy_plan(p);
        return m2;
    }

    template <long NR, long NC, typename MM, typename L>
    matrix<std::complex<double>,NR,NC,MM,L> call_fftw_ifft(
        const matrix<std::complex<double>,NR,NC,MM,L>& data
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(is_power_of_two(data.nr()) && is_power_of_two(data.nc()),
            "\t matrix ifft(data)"
            << "\n\t The number of rows and columns must be powers of two."
            << "\n\t data.nr(): "<< data.nr()
            << "\n\t data.nc(): "<< data.nc()
            << "\n\t is_power_of_two(data.nr()): " << is_power_of_two(data.nr())
            << "\n\t is_power_of_two(data.nc()): " << is_power_of_two(data.nc())
            );

        if (data.size() == 0)
            return data;

        matrix<std::complex<double>,NR,NC,MM,L> m2(data.nr(),data.nc());
        fftw_complex *in, *out;
        fftw_plan p;
        in = (fftw_complex*)&data(0,0);
        out = (fftw_complex*)&m2(0,0);
        if (data.nr() == 1 || data.nc() == 1)
            p = fftw_plan_dft_1d(data.size(), in, out, FFTW_BACKWARD, FFTW_ESTIMATE);
        else
            p = fftw_plan_dft_2d(data.nr(), data.nc(), in, out, FFTW_BACKWARD, FFTW_ESTIMATE);
        fftw_execute(p); 
        fftw_destroy_plan(p);
        return m2;
    }

// ----------------------------------------------------------------------------------------

// call FFTW for these cases:
    inline matrix<std::complex<double>,0,1> fft (const matrix<std::complex<double>,0,1>& data) {return call_fftw_fft(data);}
    inline matrix<std::complex<double>,0,1> ifft(const matrix<std::complex<double>,0,1>& data) {return call_fftw_ifft(data)/data.size();}
    inline matrix<std::complex<double>,1,0> fft (const matrix<std::complex<double>,1,0>& data) {return call_fftw_fft(data);}
    inline matrix<std::complex<double>,1,0> ifft(const matrix<std::complex<double>,1,0>& data) {return call_fftw_ifft(data)/data.size();}
    inline matrix<std::complex<double> > fft (const matrix<std::complex<double> >& data) {return call_fftw_fft(data);}
    inline matrix<std::complex<double> > ifft(const matrix<std::complex<double> >& data) {return call_fftw_ifft(data)/data.size();}

    inline void fft_inplace (matrix<std::complex<double>,0,1>& data) {data = call_fftw_fft(data);}
    inline void ifft_inplace(matrix<std::complex<double>,0,1>& data) {data = call_fftw_ifft(data);}
    inline void fft_inplace (matrix<std::complex<double>,1,0>& data) {data = call_fftw_fft(data);}
    inline void ifft_inplace(matrix<std::complex<double>,1,0>& data) {data = call_fftw_ifft(data);}
    inline void fft_inplace (matrix<std::complex<double> >& data) {data = call_fftw_fft(data);}
    inline void ifft_inplace(matrix<std::complex<double> >& data) {data = call_fftw_ifft(data);}

#endif // DLIB_USE_FFTW
#endif // end of #if 0

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FFt_Hh_

