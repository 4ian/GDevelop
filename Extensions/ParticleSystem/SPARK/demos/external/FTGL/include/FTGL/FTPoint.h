/*
 * FTGL - OpenGL font library
 *
 * Copyright (c) 2001-2004 Henry Maddocks <ftgl@opengl.geek.nz>
 * Copyright (c) 2008 Sam Hocevar <sam@zoy.org>
 * Copyright (c) 2008 Sean Morrison <learner@brlcad.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#ifndef __ftgl__
#   warning This header is deprecated. Please use <FTGL/ftgl.h> from now.
#   include <FTGL/ftgl.h>
#endif

#ifndef __FTPoint__
#define __FTPoint__

#ifdef __cplusplus


/**
 * FTPoint class is a basic 3-dimensional point or vector.
 */
class FTGL_EXPORT FTPoint
{
    public:
        /**
         * Default constructor. Point is set to zero.
         */
        inline FTPoint()
        {
            values[0] = 0;
            values[1] = 0;
            values[2] = 0;
        }

        /**
         * Constructor. Z coordinate is set to zero if unspecified.
         *
         * @param x First component
         * @param y Second component
         * @param z Third component
         */
        inline FTPoint(const FTGL_DOUBLE x, const FTGL_DOUBLE y,
                       const FTGL_DOUBLE z = 0)
        {
            values[0] = x;
            values[1] = y;
            values[2] = z;
        }

        /**
         * Constructor. This converts an FT_Vector to an FTPoint
         *
         * @param ft_vector A freetype vector
         */
        inline FTPoint(const FT_Vector& ft_vector)
        {
            values[0] = ft_vector.x;
            values[1] = ft_vector.y;
            values[2] = 0;
        }

        /**
         * Normalise a point's coordinates. If the coordinates are zero,
         * the point is left untouched.
         *
         * @return A vector of norm one.
         */
        FTPoint Normalise();


        /**
         * Operator += In Place Addition.
         *
         * @param point
         * @return this plus point.
         */
        inline FTPoint& operator += (const FTPoint& point)
        {
            values[0] += point.values[0];
            values[1] += point.values[1];
            values[2] += point.values[2];

            return *this;
        }

        /**
         * Operator +
         *
         * @param point
         * @return this plus point.
         */
        inline FTPoint operator + (const FTPoint& point) const
        {
            FTPoint temp;
            temp.values[0] = values[0] + point.values[0];
            temp.values[1] = values[1] + point.values[1];
            temp.values[2] = values[2] + point.values[2];

            return temp;
        }

         /**
         * Operator -= In Place Substraction.
         *
         * @param point
         * @return this minus point.
         */
        inline FTPoint& operator -= (const FTPoint& point)
        {
            values[0] -= point.values[0];
            values[1] -= point.values[1];
            values[2] -= point.values[2];

            return *this;
        }

        /**
         * Operator -
         *
         * @param point
         * @return this minus point.
         */
        inline FTPoint operator - (const FTPoint& point) const
        {
            FTPoint temp;
            temp.values[0] = values[0] - point.values[0];
            temp.values[1] = values[1] - point.values[1];
            temp.values[2] = values[2] - point.values[2];

            return temp;
        }

        /**
         * Operator *  Scalar multiplication
         *
         * @param multiplier
         * @return <code>this</code> multiplied by <code>multiplier</code>.
         */
        inline FTPoint operator * (double multiplier) const
        {
            FTPoint temp;
            temp.values[0] = values[0] * multiplier;
            temp.values[1] = values[1] * multiplier;
            temp.values[2] = values[2] * multiplier;

            return temp;
        }


        /**
         * Operator *  Scalar multiplication
         *
         * @param point
         * @param multiplier
         * @return <code>multiplier</code> multiplied by <code>point</code>.
         */
        inline friend FTPoint operator * (double multiplier, FTPoint& point)
        {
            return point * multiplier;
        }


        /**
         * Operator *  Scalar product
         *
         * @param a  First vector.
         * @param b  Second vector.
         * @return  <code>a.b</code> scalar product.
         */
        inline friend double operator * (FTPoint &a, FTPoint& b)
        {
            return a.values[0] * b.values[0]
                 + a.values[1] * b.values[1]
                 + a.values[2] * b.values[2];
        }


        /**
         * Operator ^  Vector product
         *
         * @param point Second point
         * @return this vector point.
         */
        inline FTPoint operator ^ (const FTPoint& point)
        {
            FTPoint temp;
            temp.values[0] = values[1] * point.values[2]
                              - values[2] * point.values[1];
            temp.values[1] = values[2] * point.values[0]
                              - values[0] * point.values[2];
            temp.values[2] = values[0] * point.values[1]
                              - values[1] * point.values[0];
            return temp;
        }


        /**
         * Operator == Tests for equality
         *
         * @param a
         * @param b
         * @return true if a & b are equal
         */
        friend bool operator == (const FTPoint &a, const FTPoint &b);


        /**
         * Operator != Tests for non equality
         *
         * @param a
         * @param b
         * @return true if a & b are not equal
         */
        friend bool operator != (const FTPoint &a, const FTPoint &b);


        /**
         * Cast to FTGL_DOUBLE*
         */
        inline operator const FTGL_DOUBLE*() const
        {
            return values;
        }


        /**
         * Setters
         */
        inline void X(FTGL_DOUBLE x) { values[0] = x; };
        inline void Y(FTGL_DOUBLE y) { values[1] = y; };
        inline void Z(FTGL_DOUBLE z) { values[2] = z; };


        /**
         * Getters
         */
        inline FTGL_DOUBLE X() const { return values[0]; };
        inline FTGL_DOUBLE Y() const { return values[1]; };
        inline FTGL_DOUBLE Z() const { return values[2]; };
        inline FTGL_FLOAT Xf() const { return static_cast<FTGL_FLOAT>(values[0]); };
        inline FTGL_FLOAT Yf() const { return static_cast<FTGL_FLOAT>(values[1]); };
        inline FTGL_FLOAT Zf() const { return static_cast<FTGL_FLOAT>(values[2]); };

    private:
        /**
         * The point data
         */
        FTGL_DOUBLE values[3];
};

#endif //__cplusplus

#endif  //  __FTPoint__

