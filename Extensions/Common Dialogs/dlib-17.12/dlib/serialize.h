// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERIALIZe_
#define DLIB_SERIALIZe_

/*!
    There are two global functions in the dlib namespace that provide 
    serialization and deserialization support.  Their signatures and specifications
    are as follows:
        
        void serialize (
            const serializable_type& item,
            std::ostream& out
        );
        /!*
            ensures
                - writes the state of item to the output stream out
                - if (serializable_type implements the enumerable interface) then
                    - item.at_start() == true
            throws                    
                - serialization_error
                    This exception is thrown if there is some problem which prevents
                    us from successfully writing item to the output stream.
                - any other exception
        *!/

        void deserialize (
            serializable_type& item,
            std::istream& in
        );
        /!*
            ensures
                - #item == a deserialized copy of the serializable_type that was
                  in the input stream in.
                - if (serializable_type implements the enumerable interface) then
                    - item.at_start() == true
            throws                    
                - serialization_error
                    This exception is thrown if there is some problem which prevents
                    us from successfully deserializing item from the input stream.
                    If this exception is thrown then item will have an initial value 
                    for its type.
                - any other exception
        *!/


    This file provides serialization support to the following object types:
        - The C++ base types (NOT including pointer types)
        - std::string
        - std::wstring
        - std::vector
        - std::map
        - std::complex
        - dlib::uint64
        - enumerable<T> where T is a serializable type
        - map_pair<D,R> where D and R are both serializable types.
        - C style arrays of serializable types

    This file provides deserialization support to the following object types:
        - The C++ base types (NOT including pointer types)
        - std::string
        - std::wstring
        - std::vector
        - std::map
        - std::complex
        - dlib::uint64
        - C style arrays of serializable types

    Support for deserialization of objects which implement the enumerable or
    map_pair interfaces is the responsibility of those objects.  
    
    Note that you can deserialize an integer value to any integral type (except for a 
    char type) if its value will fit into the target integer type.  I.e.  the types 
    short, int, long, unsigned short, unsigned int, unsigned long, and dlib::uint64 
    can all receive serialized data from each other so long as the actual serizlied 
    value fits within the receiving integral type's range.

    Also note that for any container to be serializable the type of object it contains 
    must be serializable.

    FILE STREAMS
        If you are serializing to and from file streams it is important to 
        remember to set the file streams to binary mode using the std::ios::binary
        flag.  


    INTEGRAL SERIALIZATION FORMAT
        All C++ integral types (except the char types) are serialized to the following
        format:
        The first byte is a control byte.  It tells you if the serialized number is 
        positive or negative and also tells you how many of the following bytes are 
        part of the number.  The absolute value of the number is stored in little 
        endian byte order and follows the control byte.

        The control byte:  
            The high order bit of the control byte is a flag that tells you if the
            encoded number is negative or not.  It is set to 1 when the number is
            negative and 0 otherwise.
            The 4 low order bits of the control byte represent an unsigned number
            and tells you how many of the following bytes are part of the encoded
            number.


!*/


#include "algs.h"
#include "assert.h"
#include <iomanip>
#include <cstddef>
#include <iostream>
#include <string>
#include <vector>
#include <complex>
#include <map>
#include <limits>
#include "uintn.h"
#include "interfaces/enumerable.h"
#include "interfaces/map_pair.h"
#include "enable_if.h"
#include "unicode.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class serialization_error : public error 
    {
    public: 
        serialization_error(const std::string& e):error(e) {}
    };

// ----------------------------------------------------------------------------------------

    namespace ser_helper
    {

        template <
            typename T
            >
        typename enable_if_c<std::numeric_limits<T>::is_signed,bool>::type pack_int (
            T item,
            std::ostream& out
        )
        /*!
            requires
                - T is a signed integral type
            ensures
                - if (no problems occur serializing item) then
                    - writes item to out
                    - returns false
                - else
                    - returns true
        !*/
        {
            COMPILE_TIME_ASSERT(sizeof(T) <= 8);
            unsigned char buf[8];
            unsigned char size = 0;
            unsigned char neg;
            if (item < 0)
            {
                neg = 0x80;
                item *= -1;
            }
            else
            {
                neg = 0;
            }

            for (unsigned char i = 0; i < sizeof(T); ++i)
            {
                buf[i] = static_cast<unsigned char>(item&0xFF);                
                item >>= 8;
                if (item == 0) { size = i+1; break; }
            }
            if (size == 0) 
                size = sizeof(T);
            size |= neg;

            out.write(reinterpret_cast<char*>(&size),1);            
            size &= 0x7F;  // strip off the neg flag 
            out.write(reinterpret_cast<char*>(buf),size);

            // check if there was an error
            if (!out)
                return true;
            else 
                return false;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        typename enable_if_c<std::numeric_limits<T>::is_signed,bool>::type unpack_int (
            T& item,
            std::istream& in
        )
        /*!
            requires
                - T is a signed integral type
            ensures
                - if (there are no problems deserializing item) then
                    - returns false
                    - #item == the value stored in in
                - else
                    - returns true

        !*/
        {
            COMPILE_TIME_ASSERT(sizeof(T) <= 8);


            unsigned char buf[8];
            unsigned char size;
            bool is_negative;

            item = 0;
            in.read(reinterpret_cast<char*>(&size),1);
            // check if an error occurred 
            if (!in) 
                return true;
            if (size&0x80)
                is_negative = true;
            else
                is_negative = false;
            size &= 0x0F;
            
            // check if the serialized object is too big
            if (size > sizeof(T))
                return true;

            in.read(reinterpret_cast<char*>(&buf),size);

            // check if there was an error reading from in.
            if (!in)
                return true;

            for (unsigned char i = size-1; true; --i)
            {
                item <<= 8;
                item |= buf[i];
                if (i == 0)
                    break;
            }

            if (is_negative)
                item *= -1;
        

            return false;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        typename disable_if_c<std::numeric_limits<T>::is_signed,bool>::type pack_int (
            T item,
            std::ostream& out
        )
        /*!
            requires
                - T is an unsigned integral type
            ensures
                - if (no problems occur serializing item) then
                    - writes item to out
                    - returns false
                - else
                    - returns true
        !*/
        {
            COMPILE_TIME_ASSERT(sizeof(T) <= 8);
            unsigned char buf[8];
            unsigned char size = 0;

            for (unsigned char i = 0; i < sizeof(T); ++i)
            {
                buf[i] = static_cast<unsigned char>(item&0xFF);                
                item >>= 8;
                if (item == 0) { size = i+1; break; }
            }
            if (size == 0) 
                size = sizeof(T);

            out.write(reinterpret_cast<char*>(&size),1);     
            out.write(reinterpret_cast<char*>(buf),size);

            // check if there was an error
            if (!out)
                return true;
            else 
                return false;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        typename disable_if_c<std::numeric_limits<T>::is_signed,bool>::type unpack_int (
            T& item,
            std::istream& in
        )
        /*!
            requires
                - T is an unsigned integral type
            ensures
                - if (there are no problems deserializing item) then
                    - returns false
                    - #item == the value stored in in
                - else
                    - returns true

        !*/
        {
            COMPILE_TIME_ASSERT(sizeof(T) <= 8);

            unsigned char buf[8];
            unsigned char size;

            item = 0;
            in.read(reinterpret_cast<char*>(&size),1);
            // mask out the 3 reserved bits
            size &= 0x8F;
            // check if an error occurred 
            if (!in || size > sizeof(T)) 
                return true;
           

            in.read(reinterpret_cast<char*>(&buf),size);

            // check if the serialized object is too big to fit into something of type T.
            // or if there was an error reading from in.
            if (!in)
                return true;

            for (unsigned char i = size-1; true; --i)
            {
                item <<= 8;
                item |= buf[i];
                if (i == 0)
                    break;
            }

            return false;
        }

    }

// ----------------------------------------------------------------------------------------

    #define USE_DEFAULT_INT_SERIALIZATION_FOR(T)  \
        inline void serialize (const T& item, std::ostream& out) \
        { if (ser_helper::pack_int(item,out)) throw serialization_error("Error serializing object of type " + std::string(#T)); }   \
        inline void deserialize (T& item, std::istream& in) \
        { if (ser_helper::unpack_int(item,in)) throw serialization_error("Error deserializing object of type " + std::string(#T)); }   

    #define USE_DEFAULT_BYTE_SERIALIZATION_FOR(T)  \
        inline void serialize (const T& item,std::ostream& out) \
        { out.write(reinterpret_cast<const char*>(&item),1); if (!out) throw serialization_error("Error serializing object of type " + std::string(#T)); } \
        inline void deserialize (T& item, std::istream& in) \
        { in.read(reinterpret_cast<char*>(&item),1); if (!in) throw serialization_error("Error deserializing object of type " + std::string(#T)); }   

// ----------------------------------------------------------------------------------------

    USE_DEFAULT_INT_SERIALIZATION_FOR(short)
    USE_DEFAULT_INT_SERIALIZATION_FOR(int)
    USE_DEFAULT_INT_SERIALIZATION_FOR(long)
    USE_DEFAULT_INT_SERIALIZATION_FOR(unsigned short)
    USE_DEFAULT_INT_SERIALIZATION_FOR(unsigned int)
    USE_DEFAULT_INT_SERIALIZATION_FOR(unsigned long)
    USE_DEFAULT_INT_SERIALIZATION_FOR(uint64)

    USE_DEFAULT_BYTE_SERIALIZATION_FOR(char)
    USE_DEFAULT_BYTE_SERIALIZATION_FOR(signed char)
    USE_DEFAULT_BYTE_SERIALIZATION_FOR(unsigned char)

    // Don't define serialization for wchar_t when using a version of visual studio
    // older than 8.0 (visual studio 2005) since before then they improperly set
    // wchar_t to be a typedef rather than its own type as required by the C++ 
    // standard.
#if !defined(_MSC_VER) || _NATIVE_WCHAR_T_DEFINED
    USE_DEFAULT_INT_SERIALIZATION_FOR(wchar_t)
#endif

// ----------------------------------------------------------------------------------------

    template <typename T>
    inline bool serialize_floating_point (
        const T& item,
        std::ostream& out
    )
    { 
        std::ios::fmtflags oldflags = out.flags();  
        out.flags(); 
        std::streamsize ss = out.precision(35); 
        if (item == std::numeric_limits<T>::infinity())
            out << "inf ";
        else if (item == -std::numeric_limits<T>::infinity())
            out << "ninf ";
        else if (item < std::numeric_limits<T>::infinity())
            out << item << ' '; 
        else
            out << "NaN ";
        out.flags(oldflags); 
        out.precision(ss); 
        return (!out);
    }

    template <typename T>
    inline bool deserialize_floating_point (
        T& item,
        std::istream& in 
    )
    {
        std::ios::fmtflags oldflags = in.flags();  
        in.flags(); 
        std::streamsize ss = in.precision(35); 
        if (in.peek() == 'i')
        {
            item = std::numeric_limits<T>::infinity();
            in.get();
            in.get();
            in.get();
        }
        else if (in.peek() == 'n')
        {
            item = -std::numeric_limits<T>::infinity();
            in.get();
            in.get();
            in.get();
            in.get();
        }
        else if (in.peek() == 'N')
        {
            item = std::numeric_limits<T>::quiet_NaN();
            in.get();
            in.get();
            in.get();
        }
        else
        {
            in >> item; 
        }
        in.flags(oldflags); 
        in.precision(ss); 
        return (in.get() != ' ');
    }

    inline void serialize ( const float& item, std::ostream& out) 
    { 
        if (serialize_floating_point(item,out))
            throw serialization_error("Error serializing object of type float"); 
    }

    inline void deserialize (float& item, std::istream& in) 
    { 
        if (deserialize_floating_point(item,in))
            throw serialization_error("Error deserializing object of type float");
    }

    inline void serialize ( const double& item, std::ostream& out) 
    { 
        if (serialize_floating_point(item,out))
            throw serialization_error("Error serializing object of type double"); 
    }

    inline void deserialize (double& item, std::istream& in) 
    { 
        if (deserialize_floating_point(item,in))
            throw serialization_error("Error deserializing object of type double");
    }

    inline void serialize ( const long double& item, std::ostream& out) 
    { 
        if (serialize_floating_point(item,out))
            throw serialization_error("Error serializing object of type long double"); 
    }

    inline void deserialize ( long double& item, std::istream& in) 
    { 
        if (deserialize_floating_point(item,in))
            throw serialization_error("Error deserializing object of type long double");
    }

// ----------------------------------------------------------------------------------------
// prototypes

    template <typename domain, typename range, typename compare, typename alloc>
    void serialize (
        const std::map<domain,range, compare, alloc>& item,
        std::ostream& out
    );

    template <typename domain, typename range, typename compare, typename alloc>
    void deserialize (
        std::map<domain, range, compare, alloc>& item,
        std::istream& in
    );

    template <typename T, typename alloc>
    void serialize (
        const std::vector<T,alloc>& item,
        std::ostream& out
    );

    template <typename T, typename alloc>
    void deserialize (
        std::vector<T>& item,
        std::istream& in
    );

    inline void serialize (
        const std::string& item,
        std::ostream& out
    );

    inline void deserialize (
        std::string& item,
        std::istream& in
    );

    template <
        typename T
        >
    inline void serialize (
        const enumerable<T>& item,
        std::ostream& out
    );

    template <
        typename domain,
        typename range
        >
    inline void serialize (
        const map_pair<domain,range>& item,
        std::ostream& out
    );

    template <
        typename T,
        size_t length
        >
    inline void serialize (
        const T (&array)[length],
        std::ostream& out
    );

    template <
        typename T,
        size_t length
        >
    inline void deserialize (
        T (&array)[length],
        std::istream& in
    );

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    inline void serialize (
        bool item,
        std::ostream& out
    )
    {
        if (item)
            out << '1';
        else
            out << '0';

        if (!out) 
            throw serialization_error("Error serializing object of type bool");    
    }

    inline void deserialize (
        bool& item,
        std::istream& in
    )
    {
        int ch = in.get();
        if (ch != EOF)
        {
            if (ch == '1')
                item = true;
            else if (ch == '0')
                item = false;
            else
                throw serialization_error("Error deserializing object of type bool");    
        }
        else
        {
            throw serialization_error("Error deserializing object of type bool");    
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename domain, typename range, typename compare, typename alloc>
    void serialize (
        const std::map<domain,range, compare, alloc>& item,
        std::ostream& out
    )
    {
        try
        { 
            const unsigned long size = static_cast<unsigned long>(item.size());

            serialize(size,out); 
            typename std::map<domain,range,compare,alloc>::const_iterator i;
            for (i = item.begin(); i != item.end(); ++i)
            {
                serialize(i->first,out);
                serialize(i->second,out);
            }

        }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while serializing object of type std::map"); }
    }

    template <typename domain, typename range, typename compare, typename alloc>
    void deserialize (
        std::map<domain, range, compare, alloc>& item,
        std::istream& in
    )
    {
        try 
        { 
            item.clear();

            unsigned long size;
            deserialize(size,in); 
            domain d;
            range r;
            for (unsigned long i = 0; i < size; ++i)
            {
                deserialize(d,in);
                deserialize(r,in);
                item[d] = r;
            }
        }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while deserializing object of type std::map"); }
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename alloc>
    void serialize (
        const std::vector<T,alloc>& item,
        std::ostream& out
    )
    {
        try
        { 
            const unsigned long size = static_cast<unsigned long>(item.size());

            serialize(size,out); 
            for (unsigned long i = 0; i < item.size(); ++i)
                serialize(item[i],out);
        }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while serializing object of type std::vector"); }
    }

    template <typename T, typename alloc>
    void deserialize (
        std::vector<T, alloc>& item,
        std::istream& in
    )
    {
        try 
        { 
            unsigned long size;
            deserialize(size,in); 
            item.resize(size);
            for (unsigned long i = 0; i < size; ++i)
                deserialize(item[i],in);
        }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while deserializing object of type std::vector"); }
    }

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const std::string& item,
        std::ostream& out
    )
    {
        const unsigned long size = static_cast<unsigned long>(item.size());
        try{ serialize(size,out); }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while serializing object of type std::string"); }

        out.write(item.c_str(),size);
        if (!out) throw serialization_error("Error serializing object of type std::string");
    }

    inline void deserialize (
        std::string& item,
        std::istream& in
    )
    {
        char* buf = 0;
        try
        {
            unsigned long size;
            try { deserialize(size,in); }
            catch (serialization_error& e)
            { throw serialization_error(e.info + "\n   while deserializing object of type std::string"); }

            buf = new char[size+1];
            buf[size] = 0;            
            in.read(buf,size);
            item.assign(buf);
            if (!in) throw serialization_error("Error deserializing object of type std::string");
            delete [] buf;
        }
        catch (...)
        {
            if (buf)
                delete [] buf;
            item.erase();
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const std::wstring& item,
        std::ostream& out
    )
    {
        const unsigned long size = static_cast<unsigned long>(item.size());
        try{ serialize(size,out); }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while serializing object of type std::wstring"); }

        for (unsigned long i = 0; i < item.size(); ++i)
            serialize(item[i], out);
        if (!out) throw serialization_error("Error serializing object of type std::wstring");
    }

    inline void deserialize (
        std::wstring& item,
        std::istream& in
    )
    {
        unsigned long size;
        try { deserialize(size,in); }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while deserializing object of type std::wstring"); }

        item.resize(size);
        for (unsigned long i = 0; i < item.size(); ++i)
            deserialize(item[i],in);

        if (!in) throw serialization_error("Error deserializing object of type std::wstring");
    }

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const ustring& item,
        std::ostream& out
    )
    {
        const unsigned long size = static_cast<unsigned long>(item.size());
        try{ serialize(size,out); }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while serializing object of type ustring"); }

        for (unsigned long i = 0; i < item.size(); ++i)
            serialize(item[i], out);
        if (!out) throw serialization_error("Error serializing object of type ustring");
    }

    inline void deserialize (
        ustring& item,
        std::istream& in
    )
    {
        unsigned long size;
        try { deserialize(size,in); }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while deserializing object of type ustring"); }

        item.resize(size);
        for (unsigned long i = 0; i < item.size(); ++i)
            deserialize(item[i],in);

        if (!in) throw serialization_error("Error deserializing object of type ustring");
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    inline void serialize (
        const enumerable<T>& item,
        std::ostream& out
    )
    {
        try
        {
            item.reset();
            serialize(item.size(),out);
            while (item.move_next())
                serialize(item.element(),out);
            item.reset();
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing object of type enumerable");
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range
        >
    inline void serialize (
        const map_pair<domain,range>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.key(),out);
            serialize(item.value(),out);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing object of type map_pair");
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        size_t length
        >
    inline void serialize (
        const T (&array)[length],
        std::ostream& out
    )
    {
        try
        {
            serialize(length,out);
            for (size_t i = 0; i < length; ++i)
                serialize(array[i],out);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing a C style array");
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        size_t length
        >
    inline void deserialize (
        T (&array)[length],
        std::istream& in
    )
    {
        size_t size;
        try
        {
            deserialize(size,in); 
            if (size == length)
            {
                for (size_t i = 0; i < length; ++i)
                    deserialize(array[i],in);            
            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing a C style array");
        }

        if (size != length)
            throw serialization_error("Error deserializing a C style array, lengths do not match");
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    inline void serialize (
        const std::complex<T>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.real(),out);
            serialize(item.imag(),out);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing an object of type std::complex");
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    inline void deserialize (
        std::complex<T>& item,
        std::istream& in
    )
    {
        try
        {
            T real, imag;
            deserialize(real,in); 
            deserialize(imag,in); 
            item = std::complex<T>(real,imag);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing an object of type std::complex");
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SERIALIZe_

