// Copyright (C) 2005  Davis E. King (davis@dlib.net), Nils Labugt, Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_FONTs_ABSTRACT_
#ifdef DLIB_FONTs_ABSTRACT_

#include "../gui_core.h"
#include <string>
#include "../serialize.h"
#include "../unicode.h"
#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class letter 
    {    
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a letter in a font.  It tells you the nominal 
                width of the letter and which pixels form the letter.

            THREAD SAFETY
                const versions of this object are thread safe but if you are going to
                be modifying it then you must serialize access to it.
        !*/
    public:
        struct point 
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This object represents one of the pixels of a letter.  
                    
                    The origin (i.e. (0,0)) of the coordinate plane is at the left 
                    side of the letter's baseline.  Also note that y is negative when 
                    above the baseline and positive below (it is zero on the baseline 
                    itself).

                    The x value is positive going to the right and negative to the left.
                    The meaning of a negative x value is that any points with a negative
                    x value will overlap with the preceding letter.
            !*/

            point (
            );
            /*!
                ensures
                    - This constructor does nothing.  The value of x and y 
                      are undefined after its execution.
            !*/

            point (
                signed char x_,
                signed char y_
            );
            /*!
                ensures
                    - #x == x_
                    - #y == y_
            !*/


            signed char x;
            signed char y;
        };

        // ---------------------------------

        letter (
        );
        /*!
            ensures
                - #width() == 0 
                - #num_of_points() == 0 
        !*/

        letter (
            unsigned short width_,
            unsigned short point_count
        );
        /*!
            ensures
                - #width() == width_
                - #num_of_points() == point_count
        !*/

        ~letter(
        );
        /*!
            ensures
                - any resources used by *this have been freed
        !*/
            
        const unsigned short width (
        ) const;
        /*!
            ensures
                - returns the width reserved for this letter in pixels.  This is the 
                  number of pixels that are reserved for this letter between adjoining 
                  letters.  It isn't necessarily the width of the actual letter itself.  
                  (for example, you can make a letter with a width less than how wide it 
                  actually is so that it overlaps with its neighbor letters.)
        !*/

        const unsigned short num_of_points (
        ) const;
        /*!
            ensures
                - returns the number of pixels that make up this letter.
        !*/

        point& operator[] (
            unsigned short i
        );
        /*!
            requires
                - i < num_of_points()
            ensures
                - returns a non-const reference to the ith point in this letter.
        !*/

        const point& operator[] (
            unsigned short i
        ) const;
        /*!
            requires
                - i < num_of_points()
            ensures
                - returns a const reference to the ith point in this letter.
        !*/

        void swap (
            letter& item
        );
        /*!
            ensures
                - swaps *this with item
        !*/
    
        private:

        // restricted functions
        letter(letter&);        // copy constructor
        letter& operator=(letter&);    // assignment operator
    };

    inline void swap (
        letter& a,
        letter& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

// ----------------------------------------------------------------------------------------

    void serialize (
        const letter& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support for letter objects
    !*/

    void deserialize (
        letter& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support for letter objects
    !*/

// ----------------------------------------------------------------------------------------

    class font
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines an interface for a font type.  It provides metrics
                for the font and functions to help you draw strings on a canvas object.

            THREAD SAFETY
                All the functions in this class are thread safe.
        !*/

    public:

        virtual bool has_character (
            unichar ch
        )const=0;
        /*!
            ensures
                - if (this font has a glyph for the given character) then
                    - returns true
                - else
                    - returns false
        !*/
        bool has_character(char ch) const    { return this->has_character(zero_extend_cast<unichar>(ch)); }
        bool has_character(wchar_t ch) const { return this->has_character(zero_extend_cast<unichar>(ch)); }
        /* Cast char and wchar_t to unichar correctly when char or wchar_t is a signed type */

        virtual const letter& operator[] (
            unichar ch
        )const=0;
        /*!
            ensures
                - if (has_character(ch) == true) then
                    - returns a letter object that tells you how to draw this character.
                - else
                    - returns some default glyph for characters that aren't in this font.
        !*/
        const letter& operator[] (char ch)    const { return (*this)[zero_extend_cast<unichar>(ch)]; };
        const letter& operator[] (wchar_t ch) const { return (*this)[zero_extend_cast<unichar>(ch)]; };
        /* Cast char and wchar_t to unichar correctly when char or wchar_t is a signed type */

        virtual const unsigned long height (
        ) const = 0;
        /*!
            ensures
                - returns the height in pixels of the tallest letter in the font                
        !*/

        virtual const unsigned long ascender (
        ) const = 0;
        /*!
            ensures
                - returns the height() minus the number of pixels below the baseline used
                  by the letter that hangs the lowest below the baseline.
        !*/

        virtual const unsigned long left_overflow (
        ) const = 0;
        /*! 
            ensures
                - returns how far outside and to the left of its width a letter
                  from this font may set pixels.  (i.e. how many extra pixels to its
                  left may a font use)
        !*/

        virtual const unsigned long right_overflow (
        ) const = 0;
        /*! 
            ensures
                - returns how far outside and to the right of its width a letter
                  from this font may set pixels.  (i.e. how many extra pixels to its
                  right may a font use)
        !*/

        template <typename T, typename traits, typename alloc>
        void compute_size (
            const std::basic_string<T,traits,alloc>& str,
            unsigned long& width,
            unsigned long& height,
            typename std::basic_string<T,traits,alloc>::size_type first = 0,
            typename std::basic_string<T,traits,alloc>::size_type last = std::basic_string<T,traits,alloc>::npos
        ) const;
        /*!
            requires
                - if (last != std::basic_string<T,traits,alloc>::npos) then
                    - first <= last
                    - last < str.size()
            ensures
                - all characters in str with an index < first are ignored by this
                  function.
                - if (last != std::basic_string<T,traits,alloc>::npos) then
                    - all characters in str with an index > last are ignored by 
                      this function.
                - if (str.size() == 0) then
                    - #width == 0
                    - #height == 0
                - else
                    - #width == sum of the widths of the characters in the widest 
                      line in str + left_overflow() + right_overflow(). 
                    - #height == (count(str.begin(),str.end(),'\n')+1)*height()
        !*/

        template <typename T, typename traits, typename alloc, typename pixel_type>
        void draw_string (
            const canvas& c,
            const rectangle& rect,
            const std::basic_string<T,traits,alloc>& str,
            const pixel_type& color = rgb_pixel(0,0,0),
            typename std::basic_string<T,traits,alloc>::size_type first = 0,
            typename std::basic_string<T,traits,alloc>::size_type last = std::basic_string<T,traits,alloc>::npos,
            const rectangle area = rectangle(-infinity,-infinity,infinity,infinity)
        ) const;
        /*!
            requires
                - if (last != std::basic_string<T,traits,alloc>::npos) then
                    - first <= last
                    - last < str.size()
            ensures
                - all characters in str with an index < first are ignored by this
                  function.
                - if (last != std::basic_string<T,traits,alloc>::npos) then
                    - all characters in str with an index > last are ignored by 
                      this function.
                - if (str.size() == 0) then
                    - does nothing
                - else
                    - draws str on the given canvas at the position defined by rect.  
                      Also uses the given pixel colors for the font color.
                - If the string is too big to fit in rect then the right and
                  bottom sides of it will be clipped to make it fit.                  
                - only the part of the string that is contained inside the area
                  rectangle will be drawn
        !*/

        template <typename T, typename traits, typename alloc>
        const rectangle compute_cursor_rect (
            const rectangle& rect,
            const std::basic_string<T,traits,alloc>& str,
            unsigned long index,
            typename std::basic_string<T,traits,alloc>::size_type first = 0,
            typename std::basic_string<T,traits,alloc>::size_type last = std::basic_string<T,traits,alloc>::npos
        ) const;
        /*!
            requires
                - if (last != std::basic_string<T,traits,alloc>::npos) then
                    - first <= last
                    - last < str.size()
            ensures
                - the returned rectangle has a width of 1 and a 
                  height of this->height().
                - computes the location of the cursor that would sit just before
                  the character str[index] if str were drawn on the screen by
                  draw_string(rect,str,...,first,last).  The cursor location is
                  returned in the form of a rectangle.
                - if (index < first) then
                    - the returned cursor will be just before the character str[first].
                - if (last != std::basic_string<T,traits,alloc>::npos && index > last) then
                    - the returned cursor will be just after the character str[last]
                - if (str.size() == 0) then
                    - the returned cursor will be just at the start of the rectangle where
                      str would be drawn if it wasn't empty.
                - if (index > str.size()-1) then
                    - the returned cursor will be just after the character str[str.size()-1]
        !*/

        template <typename T, typename traits, typename alloc>
        const unsigned long compute_cursor_pos (
            const rectangle& rect,
            const std::basic_string<T,traits,alloc>& str,
            long x,
            long y,
            typename std::basic_string<T,traits,alloc>::size_type first = 0,
            typename std::basic_string<T,traits,alloc>::size_type last = std::basic_string<T,traits,alloc>::npos
        ) const;
        /*!
            requires
                - if (last != std::basic_string<T,traits,alloc>::npos) then
                    - first <= last
                    - last < str.size()
            ensures
                - returns a number idx that has the following properties:
                    - if (first < str.size()) then
                        - first <= idx
                    - else
                        - idx == str.size()
                    - if (last != std::basic_string<T,traits,alloc>::npos) then
                        - idx <= last + 1
                    - compute_cursor_rect(rect,str,idx,first,last) == the cursor
                      position that is closest to the pixel (x,y)
        !*/


    private:

        // restricted functions
        font(font&);        // copy constructor
        font& operator=(font&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    class default_font : public font
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an implementation of the Helvetica 12 point font.

            THREAD SAFETY
                It is safe to call get_font() and access the returned font from any 
                thread and no synchronization is needed as long as it is called 
                after the main() function has been entered.
        !*/

    public:
        static const shared_ptr_thread_safe<font> get_font(
        );
        /*!
            ensures
                - returns an instance of this font.
            throws
                - std::bad_alloc
                    This exception is thrown if there is a problem gathering the needed
                    memory for the font object.
        !*/

    private:

        // restricted functions
        default_font();        // normal constructor
        default_font(default_font&);        // copy constructor
        default_font& operator=(default_font&);    // assignment operator   
    };

// ----------------------------------------------------------------------------------------

    class bdf_font : public font
    {
    
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a font object that is capable of loading of loading BDF (Glyph 
                Bitmap Distribution Format) font files.

            THREAD SAFETY
                If you only access this object via the functions in the parent class font 
                then this object is thread safe.  But if you need to call any of the
                functions introduced in this derived class then you need to serialize 
                access to this object while you call these functions.
        !*/

    public:

        bdf_font( 
            long default_char = -1 
        );
        /*!
            ensures
                - for all x:
                    - #has_character(x) == false
                      (i.e. this font starts out empty.  You have to call read_bdf_file()
                      to load it with data)
                - if (default_char == -1) then
                    - the letter returned by (*this)[ch] for values of
                      ch where has_character(ch) == false will be the
                      default glyph defined in the bdf file.
                - else
                    - the letter returned by (*this)[ch] for values of
                      ch where has_character(ch) == false will be the
                      letter (*this)[default_char].
        !*/
    
        long read_bdf_file( 
            std::istream& in, 
            unichar max_enc, 
            unichar min_enc = 0 
        );
        /*!
            ensures
                - attempts to read the font data from the given input stream into
                  *this.  The input stream is expected to contain a valid BDF file.
                - reads in characters with encodings in the range min_enc to max_enc
                  into this font.  All characters in the font file outside this range
                  are ignored.
                - returns the number of characters loaded into this font from the
                  given input stream.
        !*/

        void adjust_metrics();
        /*!
            ensures
                - Computes metrics based on actual glyphs loaded, instead of using 
                  the values in the bdf file header. (May be useful if loading glyphs 
                  from more than one file or a small part of a file.)
        !*/

    private:
    
        bdf_font( bdf_font& );      // copy constructor
        bdf_font& operator=( bdf_font& );  // assignment operator
    
    };

// ----------------------------------------------------------------------------------------

    const shared_ptr_thread_safe<font> get_native_font(
    );
    /*!
        ensures
            - returns a font object that uses the local font
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FONTs_ABSTRACT_

