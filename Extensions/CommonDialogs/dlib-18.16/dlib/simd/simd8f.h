// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_sIMD8F_Hh_
#define DLIB_sIMD8F_Hh_

#include "simd_check.h"
#include "simd4f.h"
#include "simd8i.h"


namespace dlib
{
#ifdef DLIB_HAVE_AVX
    class simd8f
    {
    public:
        typedef float type;

        inline simd8f() {}
        inline simd8f(const simd4f& low, const simd4f& high)
        {
            x = _mm256_insertf128_ps(_mm256_castps128_ps256(low),high,1);
        }
        inline simd8f(float f) { x = _mm256_set1_ps(f); }
        inline simd8f(float r0, float r1, float r2, float r3, float r4, float r5, float r6, float r7) 
        { x = _mm256_setr_ps(r0,r1,r2,r3,r4,r5,r6,r7); }

        inline simd8f(const simd8i& val):x(_mm256_cvtepi32_ps(val)) {}
        inline simd8f(const __m256& val):x(val) {}
        inline simd8f& operator=(const __m256& val)
        {
            x = val;
            return *this;
        }
        inline operator __m256() const { return x; }

        // truncate to 32bit integers
        inline operator __m256i() const { return _mm256_cvttps_epi32(x); }

        inline void load_aligned(const type* ptr)  { x = _mm256_load_ps(ptr); }
        inline void store_aligned(type* ptr) const { _mm256_store_ps(ptr, x); }
        inline void load(const type* ptr)          { x = _mm256_loadu_ps(ptr); }
        inline void store(type* ptr)         const { _mm256_storeu_ps(ptr, x); }

        inline unsigned int size() const { return 8; }
        inline float operator[](unsigned int idx) const 
        {
            float temp[8];
            store(temp);
            return temp[idx];
        }

        inline simd4f low() const { return _mm256_castps256_ps128(x); }
        inline simd4f high() const { return _mm256_extractf128_ps(x,1); }

    private:
        __m256 x;
    };


    class simd8f_bool
    {
    public:
        typedef float type;

        inline simd8f_bool() {}
        inline simd8f_bool(const __m256& val):x(val) {}
        inline simd8f_bool(const simd4f_bool& low, const simd4f_bool& high)
        {
            x = _mm256_insertf128_ps(_mm256_castps128_ps256(low),high,1);
        }

        inline simd8f_bool& operator=(const __m256& val)
        {
            x = val;
            return *this;
        }

        inline operator __m256() const { return x; }


    private:
        __m256 x;
    };

#else
    class simd8f
    {
    public:
        typedef float type;

        inline simd8f() {}
        inline simd8f(const simd4f& low_, const simd4f& high_): _low(low_),_high(high_){}
        inline simd8f(float f) :_low(f),_high(f) {}
        inline simd8f(float r0, float r1, float r2, float r3, float r4, float r5, float r6, float r7) :
            _low(r0,r1,r2,r3), _high(r4,r5,r6,r7) {}
        inline simd8f(const simd8i& val) : _low(val.low()), _high(val.high()) { }

        // truncate to 32bit integers
        inline operator simd8i::rawarray() const 
        { 
            simd8i::rawarray temp;
            temp.low = simd4i(_low);
            temp.high = simd4i(_high);
            return temp;
        }

        inline void load_aligned(const type* ptr)  { _low.load_aligned(ptr); _high.load_aligned(ptr+4); }
        inline void store_aligned(type* ptr) const { _low.store_aligned(ptr); _high.store_aligned(ptr+4); }
        inline void load(const type* ptr)          { _low.load(ptr); _high.load(ptr+4); }
        inline void store(type* ptr)         const { _low.store(ptr); _high.store(ptr+4); }

        inline unsigned int size() const { return 8; }
        inline float operator[](unsigned int idx) const 
        {
            if (idx < 4)
                return _low[idx];
            else
                return _high[idx-4];
        }

        inline simd4f low() const { return _low; }
        inline simd4f high() const { return _high; }

    private:
        simd4f _low, _high;
    };

    class simd8f_bool
    {
    public:
        typedef float type;

        inline simd8f_bool() {}
        inline simd8f_bool(const simd4f_bool& low_, const simd4f_bool& high_): _low(low_),_high(high_){}


        inline simd4f_bool low() const { return _low; }
        inline simd4f_bool high() const { return _high; }
    private:
        simd4f_bool _low,_high;
    };
#endif

// ----------------------------------------------------------------------------------------

    inline std::ostream& operator<<(std::ostream& out, const simd8f& item)
    {
        float temp[8];
        item.store(temp);
        out << "(" << temp[0] << ", " << temp[1] << ", " << temp[2] << ", " << temp[3] << ", "
                   << temp[4] << ", " << temp[5] << ", " << temp[6] << ", " << temp[7] << ")";
        return out;
    }

// ----------------------------------------------------------------------------------------

    inline simd8f operator+ (const simd8f& lhs, const simd8f& rhs) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_add_ps(lhs, rhs); 
#else
        return simd8f(lhs.low()+rhs.low(),
                      lhs.high()+rhs.high());
#endif
    }
    inline simd8f& operator+= (simd8f& lhs, const simd8f& rhs) 
    { return lhs = lhs + rhs; return lhs;}

// ----------------------------------------------------------------------------------------

    inline simd8f operator- (const simd8f& lhs, const simd8f& rhs) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_sub_ps(lhs, rhs); 
#else
        return simd8f(lhs.low()-rhs.low(),
                      lhs.high()-rhs.high());
#endif
    }
    inline simd8f& operator-= (simd8f& lhs, const simd8f& rhs) 
    { return lhs = lhs - rhs; return lhs;}

// ----------------------------------------------------------------------------------------

    inline simd8f operator* (const simd8f& lhs, const simd8f& rhs) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_mul_ps(lhs, rhs); 
#else
        return simd8f(lhs.low()*rhs.low(),
                      lhs.high()*rhs.high());
#endif
    }
    inline simd8f& operator*= (simd8f& lhs, const simd8f& rhs) 
    { return lhs = lhs * rhs; return lhs;}

// ----------------------------------------------------------------------------------------

    inline simd8f operator/ (const simd8f& lhs, const simd8f& rhs) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_div_ps(lhs, rhs); 
#else
        return simd8f(lhs.low()/rhs.low(),
                      lhs.high()/rhs.high());
#endif
    }
    inline simd8f& operator/= (simd8f& lhs, const simd8f& rhs) 
    { return lhs = lhs / rhs; return lhs;}

// ----------------------------------------------------------------------------------------

    inline simd8f_bool operator== (const simd8f& lhs, const simd8f& rhs) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_cmp_ps(lhs, rhs, 0); 
#else
        return simd8f_bool(lhs.low() ==rhs.low(),
                      lhs.high()==rhs.high());
#endif
    }

// ----------------------------------------------------------------------------------------

    inline simd8f_bool operator!= (const simd8f& lhs, const simd8f& rhs) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_cmp_ps(lhs, rhs, 4); 
#else
        return simd8f_bool(lhs.low() !=rhs.low(),
                      lhs.high()!=rhs.high());
#endif
    }

// ----------------------------------------------------------------------------------------

    inline simd8f_bool operator< (const simd8f& lhs, const simd8f& rhs) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_cmp_ps(lhs, rhs, 1); 
#else
        return simd8f_bool(lhs.low() <rhs.low(),
                      lhs.high()<rhs.high());
#endif
    }

// ----------------------------------------------------------------------------------------

    inline simd8f_bool operator> (const simd8f& lhs, const simd8f& rhs) 
    { 
        return rhs < lhs;
    }

// ----------------------------------------------------------------------------------------

    inline simd8f_bool operator<= (const simd8f& lhs, const simd8f& rhs) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_cmp_ps(lhs, rhs, 2); 
#else
        return simd8f_bool(lhs.low() <=rhs.low(),
                      lhs.high()<=rhs.high());
#endif
    }

// ----------------------------------------------------------------------------------------

    inline simd8f_bool operator>= (const simd8f& lhs, const simd8f& rhs) 
    { 
        return rhs <= lhs;
    }

// ----------------------------------------------------------------------------------------

    inline simd8f min (const simd8f& lhs, const simd8f& rhs) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_min_ps(lhs, rhs); 
#else
        return simd8f(min(lhs.low(), rhs.low()),
                      min(lhs.high(),rhs.high()));
#endif
    }

// ----------------------------------------------------------------------------------------

    inline simd8f max (const simd8f& lhs, const simd8f& rhs) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_max_ps(lhs, rhs); 
#else
        return simd8f(max(lhs.low(), rhs.low()),
                      max(lhs.high(),rhs.high()));
#endif
    }

// ----------------------------------------------------------------------------------------

    inline simd8f reciprocal (const simd8f& item) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_rcp_ps(item); 
#else
        return simd8f(reciprocal(item.low()),
                      reciprocal(item.high()));
#endif
    }

// ----------------------------------------------------------------------------------------

    inline simd8f reciprocal_sqrt (const simd8f& item) 
    { 
#ifdef DLIB_HAVE_AVX
        return _mm256_rsqrt_ps(item); 
#else
        return simd8f(reciprocal_sqrt(item.low()),
                      reciprocal_sqrt(item.high()));
#endif
    }

// ----------------------------------------------------------------------------------------

    inline float sum(const simd8f& item)
    {
#ifdef DLIB_HAVE_AVX
        simd8f temp = _mm256_hadd_ps(item,item);
        simd8f temp2 = _mm256_hadd_ps(temp,temp);
        return _mm_cvtss_f32(_mm_add_ss(_mm256_castps256_ps128(temp2),_mm256_extractf128_ps(temp2,1)));
#else
        return sum(item.low()+item.high()); 
#endif
    }

// ----------------------------------------------------------------------------------------

    inline float dot(const simd8f& lhs, const simd8f& rhs)
    {
        return sum(lhs*rhs);
    }
   
// ----------------------------------------------------------------------------------------

    inline simd8f sqrt(const simd8f& item)
    {
#ifdef DLIB_HAVE_AVX
        return _mm256_sqrt_ps(item);
#else
        return simd8f(sqrt(item.low()),
                      sqrt(item.high()));
#endif
    }

// ----------------------------------------------------------------------------------------

    inline simd8f ceil(const simd8f& item)
    {
#ifdef DLIB_HAVE_AVX
        return _mm256_ceil_ps(item);
#else
        return simd8f(ceil(item.low()),
                      ceil(item.high()));
#endif
    }

// ----------------------------------------------------------------------------------------

    inline simd8f floor(const simd8f& item)
    {
#ifdef DLIB_HAVE_AVX
        return _mm256_floor_ps(item);
#else
        return simd8f(floor(item.low()),
                      floor(item.high()));
#endif
    }

// ----------------------------------------------------------------------------------------

    // perform cmp ? a : b
    inline simd8f select(const simd8f_bool& cmp, const simd8f& a, const simd8f& b)
    {
#ifdef DLIB_HAVE_AVX
        return _mm256_blendv_ps(b,a,cmp);
#else
        return simd8f(select(cmp.low(),  a.low(),  b.low()),
                      select(cmp.high(), a.high(), b.high()));
#endif
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_sIMD8F_Hh_

