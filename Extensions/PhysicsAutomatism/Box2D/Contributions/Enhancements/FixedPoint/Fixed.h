/*
Copyright (c) 2006 Henry Strickland & Ryan Seto
              2007-2008 Tobias Weyand (modifications and extensions)

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

        (* http://www.opensource.org/licenses/mit-license.php *)
*/

#ifndef _FIXED_H_
#define _FIXED_H_

#include <stdio.h>

#ifdef TARGET_IS_NDS

#include "nds.h"

#endif

#define FIXED_BP        16
#define FIXED_MAX       ((1<<(32-FIXED_BP-1))-1)
#define FIXED_MIN       (-(1<<(32-FIXED_BP-1)))
#define FIXED_EPSILON   (Fixed(0.00007f))

#define G_1_DIV_PI		20861

class Fixed {

	private:
	
		int	g; // the guts
	
		const static int BP= FIXED_BP;  // how many low bits are right of Binary Point
		const static int BP2= BP*2;  // how many low bits are right of Binary Point
		const static int BPhalf= BP/2;  // how many low bits are right of Binary Point
	
		double STEP();  // smallest step we can represent
	
		// for private construction via guts
		enum FixedRaw { RAW };
		Fixed(FixedRaw, int guts);
	
	public:
	
		Fixed();
		Fixed(const Fixed &a);
		Fixed(float a);
		Fixed(double a);
		Fixed(int a);
		Fixed(long a);
	
		Fixed& operator =(const Fixed a);
		Fixed& operator =(float a);
		Fixed& operator =(double a);
		Fixed& operator =(int a);
		Fixed& operator =(long a);
	
		operator float();
		operator double();
		operator int();
		operator long();
		operator unsigned short();
	
		operator float() const;
	
		Fixed operator +() const;
		Fixed operator -() const;

		Fixed operator +(const Fixed a) const;
		Fixed operator -(const Fixed a) const;
#if 1
		// more acurate, using long long
		Fixed operator *(const Fixed a) const;
#else
		// faster, but with only half as many bits right of binary point
		Fixed operator *(const Fixed a) const;
#endif
		Fixed operator /(const Fixed a) const;

		Fixed operator *(unsigned short a) const;
		Fixed operator *(int a) const;
	
		Fixed operator +(float a) const;
		Fixed operator -(float a) const;
		Fixed operator *(float a) const;
		Fixed operator /(float a) const;
	
		Fixed operator +(double a) const;
		Fixed operator -(double a) const;
		Fixed operator *(double a) const;
		Fixed operator /(double a) const;
	
		Fixed operator >>(int a) const;
		Fixed operator <<(int a) const;
	
		Fixed& operator +=(Fixed a);
		Fixed& operator -=(Fixed a);
		Fixed& operator *=(Fixed a);
		Fixed& operator /=(Fixed a);
	
		Fixed& operator +=(int a);
		Fixed& operator -=(int a);
		Fixed& operator *=(int a);
		Fixed& operator /=(int a);
	
		Fixed& operator +=(long a);
		Fixed& operator -=(long a);
		Fixed& operator *=(long a);
		Fixed& operator /=(long a);
	
		Fixed& operator +=(float a);
		Fixed& operator -=(float a);
		Fixed& operator *=(float a);
		Fixed& operator /=(float a);
	
		Fixed& operator +=(double a);
		Fixed& operator -=(double a);
		Fixed& operator *=(double a);
		Fixed& operator /=(double a);
	
		bool operator ==(const Fixed a) const;
		bool operator !=(const Fixed a) const;
		bool operator <=(const Fixed a) const;
		bool operator >=(const Fixed a) const;
		bool operator  <(const Fixed a) const;
		bool operator  >(const Fixed a) const;
	
		bool operator ==(float a) const;
		bool operator !=(float a) const;
		bool operator <=(float a) const;
		bool operator >=(float a) const;
		bool operator  <(float a) const;
		bool operator  >(float a) const;
	
		bool operator ==(double a) const;
		bool operator !=(double a) const;
		bool operator <=(double a) const;
		bool operator >=(double a) const;
		bool operator  <(double a) const;
		bool operator  >(double a) const;
	
		bool operator  >(int a) const;
		bool operator  <(int a) const;
		bool operator  >=(int a) const;
		bool operator  <=(int a) const;
	
		Fixed abs();
		Fixed sqrt();
#ifdef TARGET_IS_NDS
		Fixed cosf();
		Fixed sinf();
		Fixed tanf();
#endif
};

//
// Implementation
//

inline double Fixed::STEP() { return 1.0 / (1<<BP); }  // smallest step we can represent

// for private construction via guts
inline Fixed::Fixed(FixedRaw, int guts) : g(guts) {}

inline Fixed::Fixed() : g(0) {}
inline Fixed::Fixed(const Fixed &a) : g( a.g ) {}
inline Fixed::Fixed(float a) : g( int(a * (float)(1<<BP)) ) {}
inline Fixed::Fixed(double a) : g( int(a * (double)(1<<BP) ) ) {}
inline Fixed::Fixed(int a) : g( a << BP ) {}
inline Fixed::Fixed(long a) : g( a << BP ) {}

inline Fixed& Fixed::operator =(const Fixed a) { g= a.g; return *this; }
inline Fixed& Fixed::operator =(float a) { g= Fixed(a).g; return *this; }
inline Fixed& Fixed::operator =(double a) { g= Fixed(a).g; return *this; }
inline Fixed& Fixed::operator =(int a) { g= Fixed(a).g; return *this; }
inline Fixed& Fixed::operator =(long a) { g= Fixed(a).g; return *this; }

inline Fixed::operator float() { return g * (float)STEP(); }
inline Fixed::operator double() { return g * (double)STEP(); }
inline Fixed::operator int() { return g>>BP; }
inline Fixed::operator long() { return g>>BP; }
#pragma warning(disable: 4244) //HARDWIRE added pragma to prevent VS2005 compilation error
inline Fixed::operator unsigned short() { return g>>BP; }
inline Fixed::operator float() const { return g / (float)(1<<BP); }

inline Fixed Fixed::operator +() const { return Fixed(RAW,g); }
inline Fixed Fixed::operator -() const { return Fixed(RAW,-g); }

inline Fixed Fixed::operator +(const Fixed a) const { return Fixed(RAW, g + a.g); }
inline Fixed Fixed::operator -(const Fixed a) const { return Fixed(RAW, g - a.g); }

#if 1
// more acurate, using long long
inline Fixed Fixed::operator *(const Fixed a) const { return Fixed(RAW,  (int)( ((long long)g * (long long)a.g ) >> BP)); }

#elif 0

// check for overflow and figure out where.  Must specify -rdynamic in linker
#include <execinfo.h>
#include <signal.h>
#include <exception>

inline Fixed Fixed::operator *(const Fixed a) const {
	long long x =  ((long long)g * (long long)a.g );
	if(x > 0x7fffffffffffLL || x < -0x7fffffffffffLL) {
		printf("overflow");
		void *array[2];
		int nSize = backtrace(array, 2);
		char **symbols = backtrace_symbols(array, nSize);
		for(int i=0; i<nSize; i++) {
			printf(" %s", symbols[i]);
		}
		printf("\n");
	}
	return Fixed(RAW, (int)(x>>BP)); 
}

#else
// faster, but with only half as many bits right of binary point
inline Fixed Fixed::operator *(const Fixed a) const { return Fixed(RAW, (g>>BPhalf) * (a.g>>BPhalf) ); }
#endif


#ifdef TARGET_IS_NDS
// Division using the DS's maths coprocessor
inline Fixed Fixed::operator /(const Fixed a) const
{
	//printf("%d %d\n", (long long)g << BP, a.g);
	return Fixed(RAW, int( div64((long long)g << BP, a.g) ) );
}
#else
inline Fixed Fixed::operator /(const Fixed a) const
{
	return Fixed(RAW, int( (((long long)g << BP2) / (long long)(a.g)) >> BP) );
	//return Fixed(RAW, int( (((long long)g << BP) / (long long)(a.g)) ) );
}
#endif

inline Fixed Fixed::operator *(unsigned short a) const { return operator*(Fixed(a)); }
inline Fixed Fixed::operator *(int a) const { return operator*(Fixed(a)); }

inline Fixed Fixed::operator +(float a) const { return Fixed(RAW, g + Fixed(a).g); }
inline Fixed Fixed::operator -(float a) const { return Fixed(RAW, g - Fixed(a).g); }
inline Fixed Fixed::operator *(float a) const { return Fixed(RAW, (g>>BPhalf) * (Fixed(a).g>>BPhalf) ); }
//inline Fixed Fixed::operator /(float a) const { return Fixed(RAW, int( (((long long)g << BP2) / (long long)(Fixed(a).g)) >> BP) ); }
inline Fixed Fixed::operator /(float a) const { return operator/(Fixed(a)); }

inline Fixed Fixed::operator +(double a) const { return Fixed(RAW, g + Fixed(a).g); }
inline Fixed Fixed::operator -(double a) const { return Fixed(RAW, g - Fixed(a).g); }
inline Fixed Fixed::operator *(double a) const { return Fixed(RAW, (g>>BPhalf) * (Fixed(a).g>>BPhalf) ); }
//inline Fixed Fixed::operator /(double a) const { return Fixed(RAW, int( (((long long)g << BP2) / (long long)(Fixed(a).g)) >> BP) ); }
inline Fixed Fixed::operator /(double a) const { return operator/(Fixed(a)); }

inline Fixed Fixed::operator >>(int a) const { return Fixed(RAW, g >> a); }
inline Fixed Fixed::operator <<(int a) const { return Fixed(RAW, g << a); }

inline Fixed& Fixed::operator +=(Fixed a) { return *this = *this + a; }
inline Fixed& Fixed::operator -=(Fixed a) { return *this = *this - a; }
inline Fixed& Fixed::operator *=(Fixed a) { return *this = *this * a; }
//inline Fixed& Fixed::operator /=(Fixed a) { return *this = *this / a; }
inline Fixed& Fixed::operator /=(Fixed a) { return *this = operator/(a); }

inline Fixed& Fixed::operator +=(int a) { return *this = *this + (Fixed)a; }
inline Fixed& Fixed::operator -=(int a) { return *this = *this - (Fixed)a; }
inline Fixed& Fixed::operator *=(int a) { return *this = *this * (Fixed)a; }
//inline Fixed& Fixed::operator /=(int a) { return *this = *this / (Fixed)a; }
inline Fixed& Fixed::operator /=(int a) { return *this = operator/((Fixed)a); }

inline Fixed& Fixed::operator +=(long a) { return *this = *this + (Fixed)a; }
inline Fixed& Fixed::operator -=(long a) { return *this = *this - (Fixed)a; }
inline Fixed& Fixed::operator *=(long a) { return *this = *this * (Fixed)a; }
//inline Fixed& Fixed::operator /=(long a) { return *this = *this / (Fixed)a; }
inline Fixed& Fixed::operator /=(long a) { return *this = operator/((Fixed)a); }

inline Fixed& Fixed::operator +=(float a) { return *this = *this + a; }
inline Fixed& Fixed::operator -=(float a) { return *this = *this - a; }
inline Fixed& Fixed::operator *=(float a) { return *this = *this * a; }
//inline Fixed& Fixed::operator /=(float a) { return *this = *this / a; }
inline Fixed& Fixed::operator /=(float a) { return *this = operator/(a); }

inline Fixed& Fixed::operator +=(double a) { return *this = *this + a; }
inline Fixed& Fixed::operator -=(double a) { return *this = *this - a; }
inline Fixed& Fixed::operator *=(double a) { return *this = *this * a; }
//inline Fixed& Fixed::operator /=(double a) { return *this = *this / a; }
inline Fixed& Fixed::operator /=(double a) { return *this = operator/(a); }

inline Fixed operator +(int a, const Fixed b) { return Fixed(a)+b; }
inline Fixed operator -(int a, const Fixed b) { return Fixed(a)-b; }
inline Fixed operator *(int a, const Fixed b) { return Fixed(a)*b; }
inline Fixed operator /(int a, const Fixed b) { return Fixed(a)/b; };

inline Fixed operator +(float a, const Fixed b) { return Fixed(a)+b; }
inline Fixed operator -(float a, const Fixed b) { return Fixed(a)-b; }
inline Fixed operator *(float a, const Fixed b) { return Fixed(a)*b; }
inline Fixed operator /(float a, const Fixed b) { return Fixed(a)/b; }

inline bool Fixed::operator ==(const Fixed a) const { return g == a.g; }
inline bool Fixed::operator !=(const Fixed a) const { return g != a.g; }
inline bool Fixed::operator <=(const Fixed a) const { return g <= a.g; }
inline bool Fixed::operator >=(const Fixed a) const { return g >= a.g; }
inline bool Fixed::operator  <(const Fixed a) const { return g  < a.g; }
inline bool Fixed::operator  >(const Fixed a) const { return g  > a.g; }

inline bool Fixed::operator ==(float a) const { return g == Fixed(a).g; }
inline bool Fixed::operator !=(float a) const { return g != Fixed(a).g; }
inline bool Fixed::operator <=(float a) const { return g <= Fixed(a).g; }
inline bool Fixed::operator >=(float a) const { return g >= Fixed(a).g; }
inline bool Fixed::operator  <(float a) const { return g  < Fixed(a).g; }
inline bool Fixed::operator  >(float a) const { return g  > Fixed(a).g; }

inline bool Fixed::operator ==(double a) const { return g == Fixed(a).g; }
inline bool Fixed::operator !=(double a) const { return g != Fixed(a).g; }
inline bool Fixed::operator <=(double a) const { return g <= Fixed(a).g; }
inline bool Fixed::operator >=(double a) const { return g >= Fixed(a).g; }
inline bool Fixed::operator  <(double a) const { return g  < Fixed(a).g; }
inline bool Fixed::operator  >(double a) const { return g  > Fixed(a).g; }

inline bool Fixed::operator  >(int a) const { return g > Fixed(a).g; }
inline bool Fixed::operator  <(int a) const { return g < Fixed(a).g; }
inline bool Fixed::operator  >=(int a) const{ return g >= Fixed(a).g; };
inline bool Fixed::operator  <=(int a) const{ return g <= Fixed(a).g; };

inline bool operator ==(float a, const Fixed b) { return Fixed(a) == b; }
inline bool operator !=(float a, const Fixed b) { return Fixed(a) != b; }
inline bool operator <=(float a, const Fixed b) { return Fixed(a) <= b; }
inline bool operator >=(float a, const Fixed b) { return Fixed(a) >= b; }
inline bool operator  <(float a, const Fixed b) { return Fixed(a)  < b; }
inline bool operator  >(float a, const Fixed b) { return Fixed(a)  > b; }

inline Fixed operator +(double a, const Fixed b) { return Fixed(a)+b; }
inline Fixed operator -(double a, const Fixed b) { return Fixed(a)-b; }
inline Fixed operator *(double a, const Fixed b) { return Fixed(a)*b; }
inline Fixed operator /(double a, const Fixed b) { return Fixed(a)/b; }

inline bool operator ==(double a, const Fixed b) { return Fixed(a) == b; }
inline bool operator !=(double a, const Fixed b) { return Fixed(a) != b; }
inline bool operator <=(double a, const Fixed b) { return Fixed(a) <= b; }
inline bool operator >=(double a, const Fixed b) { return Fixed(a) >= b; }
inline bool operator  <(double a, const Fixed b) { return Fixed(a)  < b; }
inline bool operator  >(double a, const Fixed b) { return Fixed(a)  > b; }

inline bool operator ==(int a, const Fixed b) { return Fixed(a) == b; }
inline bool operator !=(int a, const Fixed b) { return Fixed(a) != b; }
inline bool operator <=(int a, const Fixed b) { return Fixed(a) <= b; }
inline bool operator >=(int a, const Fixed b) { return Fixed(a) >= b; }
inline bool operator  <(int a, const Fixed b) { return Fixed(a)  < b; }
inline bool operator  >(int a, const Fixed b) { return Fixed(a)  > b; }

inline int& operator +=(int& a, const Fixed b) { a = (Fixed)a + b; return a; }
inline int& operator -=(int& a, const Fixed b) { a = (Fixed)a - b; return a; }
inline int& operator *=(int& a, const Fixed b) { a = (Fixed)a * b; return a; }
inline int& operator /=(int& a, const Fixed b) { a = (Fixed)a / b; return a; }

inline long& operator +=(long& a, const Fixed b) { a = (Fixed)a + b; return a; }
inline long& operator -=(long& a, const Fixed b) { a = (Fixed)a - b; return a; }
inline long& operator *=(long& a, const Fixed b) { a = (Fixed)a * b; return a; }
inline long& operator /=(long& a, const Fixed b) { a = (Fixed)a / b; return a; }

inline float& operator +=(float& a, const Fixed b) { a = a + b; return a; }
inline float& operator -=(float& a, const Fixed b) { a = a - b; return a; }
inline float& operator *=(float& a, const Fixed b) { a = a * b; return a; }
inline float& operator /=(float& a, const Fixed b) { a = a / b; return a; }

inline double& operator +=(double& a, const Fixed b) { a = a + b; return a; }
inline double& operator -=(double& a, const Fixed b) { a = a - b; return a; }
inline double& operator *=(double& a, const Fixed b) { a = a * b; return a; }
inline double& operator /=(double& a, const Fixed b) { a = a / b; return a; }

inline Fixed Fixed::abs() { return (g>0) ? Fixed(RAW, g) : Fixed(RAW, -g); }
inline Fixed abs(Fixed f) { return f.abs(); }

//inline Fixed atan2(Fixed a, Fixed b) { return atan2f((float) a, (float) b); }
inline Fixed atan2(Fixed y, Fixed x)
{
	Fixed abs_y = y.abs() + FIXED_EPSILON;	// avoid 0/0
	Fixed r, angle;

	if(x >= 0.0f) {
		r = (x - abs_y) / (x + abs_y);
		angle = 3.1415926/4.0;
	} else {
		r = (x + abs_y) / (abs_y - x);
		angle = 3.0*3.1415926/4.0;
	}
	angle += Fixed(0.1963) * (r * r * r) - Fixed(0.9817) * r;
	return (y < 0) ? -angle : angle;
}

#if TARGET_IS_NDS

static inline long nds_sqrt64(long long a)
{
	SQRT_CR = SQRT_64;
	while(SQRT_CR & SQRT_BUSY);
	SQRT_PARAM64 = a;
	while(SQRT_CR & SQRT_BUSY);

	return SQRT_RESULT32;
}

static inline int32 div6464(int64 num, int64 den)
{
	DIV_CR = DIV_64_64;
	while(DIV_CR & DIV_BUSY);
	DIV_NUMERATOR64 = num;
	DIV_DENOMINATOR64 = den;
	while(DIV_CR & DIV_BUSY);

	return (DIV_RESULT32);
}

inline Fixed Fixed::sqrt()
{
	return Fixed(RAW, nds_sqrt64(((long long)(g))<<BP));
}
#else
inline Fixed Fixed::sqrt()
{
	long long m, root = 0, left = (long long)g<<FIXED_BP;
	for ( m = (long long)1<<( (sizeof(long long)<<3) - 2); m; m >>= 2 )
	{
		if ( ( left & -m ) > root ) 
			left -= ( root += m ), root += m;
		root >>= 1;
	}
	return Fixed(RAW, root);
}
#endif

inline Fixed sqrt(Fixed a) { return a.sqrt(); }
inline Fixed sqrtf(Fixed a) { return a.sqrt(); }

#endif

#ifdef TARGET_IS_NDS
// Use the libnds lookup tables for trigonometry functions
inline Fixed Fixed::cosf() {
	int idx = (((long long)g*(long long)G_1_DIV_PI)>>24)%512;
	if(idx < 0)
		idx += 512;
	return Fixed(RAW, COS_bin[idx] << 4);
}
inline Fixed cosf(Fixed x) { return x.cosf(); }
inline Fixed Fixed::sinf() {
	int idx = (((long long)g*(long long)G_1_DIV_PI)>>24)%512;
	if(idx < 0)
			idx += 512;
	return Fixed(RAW, SIN_bin[idx] << 4);
}
inline Fixed sinf(Fixed x) { return x.sinf(); }
inline Fixed Fixed::tanf() {
	int idx = (((long long)g*(long long)G_1_DIV_PI)>>24)%512;
	if(idx < 0)
				idx += 512;
	return Fixed(RAW, TAN_bin[idx] << 4);
}
inline Fixed tanf(Fixed x) { return x.tanf(); }


#endif
