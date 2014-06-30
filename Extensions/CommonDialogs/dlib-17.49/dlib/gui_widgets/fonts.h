// Copyright (C) 2005  Davis E. King (davis@dlib.net), and Nils Labugt, Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.

#ifndef DLIB_FONTs_
#define DLIB_FONTs_

#include "fonts_abstract.h"
#include "../gui_core.h"
#include <string>
#include "../algs.h"
#include "../serialize.h"
#include "../unicode.h"
#include "../array.h"
#include "../array2d.h"
#include "../threads.h"
#include "../smart_pointers_thread_safe.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class letter 
    {    
        /*!
            INITIAL VALUE
                - defined by constructor

            CONVENTION
                - if (points != 0) then
                    - points == an array of count point structs
                - w == width()
                - count == num_of_points()
        !*/
    public:
        struct point 
        {
            point (){}

            point (
                signed char x_,
                signed char y_
            ) :
                x(x_),
                y(y_)
            {}

            signed char x;
            signed char y;
        };

        letter (
        ) :
            points(0),
            w(0),
            count(0)
        {}

        letter (
            unsigned short width_,
            unsigned short point_count
        ) : 
            points(new point[point_count]),
            w(width_),
            count(point_count)
        {}

        ~letter(
        )
        {
            if (points)
                delete [] points; 
        }
            
        unsigned short width (
        ) const { return w; }
        
        unsigned short num_of_points (
        ) const { return count;}

        point& operator[] (
            unsigned short i
        ) 
        { 
            DLIB_ASSERT (i < num_of_points(),
                    "\tvoid letter::operator[]()"
                    << "\n\ti:               " << i 
                    << "\n\tnum_of_points(): " << num_of_points() );
            return points[i]; 
        }

        const point& operator[] (
            unsigned short i
        ) const 
        { 
            DLIB_ASSERT (i < num_of_points(),
                    "\tvoid letter::operator[]()"
                    << "\n\ti:               " << i 
                    << "\n\tnum_of_points(): " << num_of_points() );
            return points[i]; 
        }
    
        friend void serialize (
            const letter& item, 
            std::ostream& out 
        );   

        friend void deserialize (
            letter& item, 
            std::istream& in
        );   

        void swap (
            letter& item
        )
        {
            exchange(points, item.points);
            exchange(w, item.w);
            exchange(count, item.count);
        }

    private:
        // restricted functions
        letter(letter&);        // copy constructor
        letter& operator=(letter&);    // assignment operator

        point* points;
        unsigned short w;
        unsigned short count;
    };

    inline void swap (
        letter& a,
        letter& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

    class font
    {
    public:
        virtual ~font() {}

        virtual bool has_character (
            unichar ch
        )const=0;
        bool has_character(char ch) const    { return this->has_character(zero_extend_cast<unichar>(ch)); }
        bool has_character(wchar_t ch) const { return this->has_character(zero_extend_cast<unichar>(ch)); }

        const letter& operator[] (char ch)   const { return (*this)[zero_extend_cast<unichar>(ch)]; };
        const letter& operator[] (wchar_t ch)const { return (*this)[zero_extend_cast<unichar>(ch)]; };

        virtual const letter& operator[] (
            unichar ch
        )const=0;

        virtual unsigned long height (
        ) const = 0;

        virtual unsigned long ascender (
        ) const = 0;

        virtual unsigned long left_overflow (
        ) const = 0;

        virtual unsigned long right_overflow (
        ) const = 0;

    // ------------------------------------------------------------------------------------

        template <typename T, typename traits, typename alloc>
        void compute_size (
            const std::basic_string<T,traits,alloc>& str,
            unsigned long& width,
            unsigned long& height,
            typename std::basic_string<T,traits,alloc>::size_type first = 0,
            typename std::basic_string<T,traits,alloc>::size_type last = (std::basic_string<T,traits,alloc>::npos)
        ) const
        {
            typedef std::basic_string<T,traits,alloc> string;
            DLIB_ASSERT ( (last == string::npos) || (first <= last && last < str.size())  ,
                          "\tvoid font::compute_size()"
                          << "\n\tlast == string::npos: " << ((last == string::npos)?"true":"false") 
                          << "\n\tfirst: " << (unsigned long)first 
                          << "\n\tlast:  " << (unsigned long)last 
                          << "\n\tstr.size():  " << (unsigned long)str.size() );

            unsigned long line_width = 0;
            unsigned long newlines = 0;
            width = 0;
            height = 0;

            if (str.size())
            {
                if (last == string::npos)
                    last = str.size()-1;
                const font& f = *this;

                for (typename string::size_type i = first; i <= last; ++i)
                {
                    // ignore '\r' characters
                    if (str[i] == '\r')
                        continue;

                    if (str[i] == '\n')
                    {
                        ++newlines;
                        width = std::max(width,line_width);
                        line_width = 0;
                    }
                    else
                    {
                        if (is_combining_char(str[i]) == false)
                            line_width += f[str[i]].width();
                    }
                }
                width = std::max(width,line_width);

                height = (newlines+1)*f.height();
                width += f.left_overflow() + f.right_overflow();
            }
        }

    // ------------------------------------------------------------------------------------

        template <typename T, typename traits, typename alloc, typename pixel_type>
        void draw_string (
            const canvas& c,
            const rectangle& rect,
            const std::basic_string<T,traits,alloc>& str,
            const pixel_type& color,
            typename std::basic_string<T,traits,alloc>::size_type first = 0,
            typename std::basic_string<T,traits,alloc>::size_type last = (std::basic_string<T,traits,alloc>::npos),
            const rectangle area_ = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                            std::numeric_limits<long>::max(), std::numeric_limits<long>::max())
        ) const
        {
            typedef std::basic_string<T,traits,alloc> string;
            DLIB_ASSERT ( (last == string::npos) || (first <= last && last < str.size())  ,
                          "\tvoid font::draw_string()"
                          << "\n\tlast == string::npos: " << ((last == string::npos)?"true":"false") 
                          << "\n\tfirst: " << (unsigned long)first 
                          << "\n\tlast:  " << (unsigned long)last 
                          << "\n\tstr.size():  " << (unsigned long)str.size() );

            rectangle area = rect.intersect(c).intersect(area_);
            if (area.is_empty() || str.size() == 0)
                return;

            if (last == string::npos)
                last = str.size()-1;

            const font& f = *this;        

            long y_offset = rect.top() + f.ascender() - 1;

            long pos = rect.left()+f.left_overflow();
            for (typename string::size_type i = first; i <= last; ++i)
            {
                // ignore the '\r' character
                if (str[i] == '\r')
                    continue;

                // A combining character should be applied to the previous character, and we
                // therefore make one step back. If a combining comes right after a newline, 
                // then there must be some kind of error in the string, and we don't combine.
                if(is_combining_char(str[i]) && 
                   pos > rect.left() + static_cast<long>(f.left_overflow()))
                {
                    pos -= f[str[i]].width();
                }

                if (str[i] == '\n')
                {
                    y_offset += f.height();
                    pos = rect.left()+f.left_overflow();
                    continue;
                }

                // only look at letters in the intersection area
                if (area.bottom() + static_cast<long>(f.height()) < y_offset)
                {
                    // the string is now below our rectangle so we are done
                    break;
                }
                else if (area.left() > pos - static_cast<long>(f.left_overflow()) && 
                    pos + static_cast<long>(f[str[i]].width() + f.right_overflow()) < area.left() )
                {
                    pos += f[str[i]].width();                
                    continue;
                }
                else if (area.right() + static_cast<long>(f.right_overflow()) < pos)
                {
                    // keep looking because there might be a '\n' in the string that
                    // will wrap us around and put us back into our rectangle.
                    continue;
                }

                // at this point in the loop we know that f[str[i]] overlaps 
                // horizontally with the intersection rectangle area.

                const letter& l = f[str[i]];
                for (unsigned short i = 0; i < l.num_of_points(); ++i)
                {
                    const long x = l[i].x + pos;
                    const long y = l[i].y + y_offset;
                    // draw each pixel of the letter if it is inside the intersection
                    // rectangle
                    if (area.contains(x,y))
                    {
                        assign_pixel(c[y-c.top()][x-c.left()], color);
                    }
                }

                pos += l.width();
            }
        }
        template <typename T, typename traits, typename alloc>
        void draw_string (
            const canvas& c,
            const rectangle& rect,
            const std::basic_string<T,traits,alloc>& str
        ) const 
        { 
            draw_string(c,rect, str, 0, 0, (std::basic_string<T,traits,alloc>::npos), 
                        rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                  std::numeric_limits<long>::max(), std::numeric_limits<long>::max())); 
        }

    // ------------------------------------------------------------------------------------

        template <typename T, typename traits, typename alloc>
        const rectangle compute_cursor_rect (
            const rectangle& rect,
            const std::basic_string<T,traits,alloc>& str,
            unsigned long index,
            typename std::basic_string<T,traits,alloc>::size_type first = 0,
            typename std::basic_string<T,traits,alloc>::size_type last = (std::basic_string<T,traits,alloc>::npos)
        ) const
        {
            typedef std::basic_string<T,traits,alloc> string;
            DLIB_ASSERT ( (last == string::npos) || (first <= last && last < str.size())  ,
                          "\trectangle font::compute_cursor_rect()"
                          << "\n\tlast == string::npos: " << ((last == string::npos)?"true":"false") 
                          << "\n\tfirst: " << (unsigned long)first 
                          << "\n\tlast:  " << (unsigned long)last 
                          << "\n\tindex:  " << index
                          << "\n\tstr.size():  " << (unsigned long)str.size() );

            const font& f = *this;

            if (last == string::npos)
                last = str.size()-1;

            long x = f.left_overflow();
            long y = 0;
            int count = 0;

            if (str.size() != 0)
            {
                for (typename string::size_type i = first; i <= last && i < index; ++i)
                {
                    ++count;
                    if (str[i] == '\n')
                    {
                        x = f.left_overflow();
                        y += f.height();
                        count = 0;
                    }
                    else if (is_combining_char(str[i]) == false && 
                             str[i] != '\r')
                    {
                        x += f[str[i]].width();
                    }
                }
            }

            x += rect.left();
            y += rect.top();

            // if the cursor is at the start of a line then back it up one pixel
            if (count == 0)
                --x;

            return rectangle(x,y,x,y+f.height()-1);
        }

    // ------------------------------------------------------------------------------------

        template <typename T, typename traits, typename alloc>
        unsigned long compute_cursor_pos (
            const rectangle& rect,
            const std::basic_string<T,traits,alloc>& str,
            long x,
            long y,
            typename std::basic_string<T,traits,alloc>::size_type first = 0,
            typename std::basic_string<T,traits,alloc>::size_type last = (std::basic_string<T,traits,alloc>::npos)
        ) const
        {
            typedef std::basic_string<T,traits,alloc> string;
            DLIB_ASSERT ( (last == string::npos) || (first <= last && last < str.size())  ,
                          "\tunsigned long font::compute_cursor_pos()"
                          << "\n\tlast == string::npos: " << ((last == string::npos)?"true":"false") 
                          << "\n\tfirst: " << (unsigned long)first 
                          << "\n\tlast:  " << (unsigned long)last 
                          << "\n\tx:  " << x 
                          << "\n\ty:  " << y 
                          << "\n\tstr.size():  " << (unsigned long)str.size() );
            const font& f = *this;


            if (str.size() == 0)
                return 0;
            else if (first >= str.size())
                return static_cast<unsigned long>(str.size());

            y -= rect.top();
            x -= rect.left();
            if (y < 0)
                y = 0;
            if (x < 0)
                x = 0;

            if (last == string::npos)
                last = str.size()-1;


            // first figure out what line we are on
            typename string::size_type pos = first;
            long line = 0;
            while (static_cast<unsigned long>(y) >= f.height())
            {
                ++line;
                y -= f.height();
            }

            // find the start of the given line
            for (typename string::size_type i = first; i <= last && line != 0; ++i)
            {
                if (str[i] == '\n')
                {
                    --line;
                    pos = i + 1;
                }
            }


            // now str[pos] == the first character of the start of the line
            // that contains the cursor.
            const typename string::size_type start_of_line = pos;


            long cur_x = f.left_overflow();
            // set the current cursor position to where the mouse clicked
            while (pos <= last)
            {
                if (x <= cur_x || str[pos] == '\n')
                    break;

                if (is_combining_char(str[pos]) == false &&
                    str[pos] != '\r')
                {
                    cur_x += f[str[pos]].width();
                }
                ++pos;
            }

            if (x <= cur_x)
            {
                if (pos != start_of_line)
                {
                    // we might actually be closer to the previous character 
                    // so check for that and if so then jump us back one.
                    const long width = f[str[pos-1]].width();
                    if (x < cur_x - width/2)
                        --pos;
                }
            }
            return static_cast<unsigned long>(pos);
        }

    };

// ----------------------------------------------------------------------------------------

    const shared_ptr_thread_safe<font> get_native_font ();

// ----------------------------------------------------------------------------------------

    class default_font : public font
    {
        letter* l;


        default_font(
        );
        default_font(default_font&);        // copy constructor
        default_font& operator=(default_font&);    // assignment operator   



    public:
        static const shared_ptr_thread_safe<font>& get_font (
        )
        {        
            static mutex m;
            static shared_ptr_thread_safe<font> f;
            auto_mutex M(m);
            if (f.get() == 0)
                f.reset(new default_font);

            return f;
        }

        ~default_font(
        )
        {
            delete [] l;
        }

        unsigned long height (
        ) const { return 16; }

        unsigned long ascender (
        ) const { return 12; }

        unsigned long left_overflow (
        ) const { return 1; }

        unsigned long right_overflow (
        ) const { return 2; }

        bool has_character (
            unichar ch
        )const
        {
            if (ch < 256 && (l[ch].width() != 0 || l[ch].num_of_points() != 0))
                return true;
            else
                return false;
        }

        const letter& operator[] (
            unichar ch
        ) const
        {
            if(ch < 256)
                return l[ch];
            return l[0]; // just return one of the empty characters in this case 
        }
    };


// ----------------------------------------------------------------------------------------

    class bdf_font : public font
    {
    
    public:
        bdf_font( long default_char_ = -1 );
    
        long read_bdf_file( std::istream& in, unichar max_enc, unichar min_enc = 0 );
        unsigned long height() const
        {
            return fbb.height();
        }
        unsigned long ascender() const
        {
            return std::max( 0L, 1 - fbb.top() );
        }
        unsigned long left_overflow() const
        {
            return std::max( 0L, -fbb.left() );
        }
        unsigned long right_overflow() const
        {
            return right_overflow_;
        }
        const letter& operator[] ( unichar uch ) const
        {
            if ( !has_character(uch) )
            {
                return gl[default_char];
            }
            return gl[uch];
        }

        bool has_character (
            unichar ch
        )const
        {
            if (ch < gl.size() && (gl[ch].width() != 0 || gl[ch].num_of_points() != 0))
                return true;
            else
                return false;
        }

        void adjust_metrics();
    private:

        bool bitmap_to_letter( array2d<char>& bitmap, unichar enc, unsigned long width, int x_offset, int y_offset );

        array<letter> gl;
        unichar default_char; // if (is_intialized == true), then this MUST be an actual glyph
        bool is_initialized;
        rectangle fbb;
        unsigned long right_overflow_;
    
        unsigned global_width;
        bool has_global_width;
        long specified_default_char;
    
        bdf_font( bdf_font& );      // copy constructor
        bdf_font& operator=( bdf_font& );  // assignment operator
    
    };
    
// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "fonts.cpp"
#endif

#endif // DLIB_FONTs_

