#ifndef STRINGFORMATTER_H
#define STRINGFORMATTER_H

#include <cctype>
#include <stdexcept>
#include <string>
#include <type_traits>

#include "GDCpp/Runtime/String.h"

class FormatStringException : std::runtime_error
{
public:
    FormatStringException( const std::string & what ) : std::runtime_error( what ) {};
    FormatStringException( const char * what ) : std::runtime_error( what ) {};
};

template<typename T>
typename std::enable_if<std::is_constructible<gd::String, T>::value, gd::String>::type ArgumentToString( T & value )
{
    return gd::String( value );
}

template<typename T>
typename std::enable_if<std::is_arithmetic<T>::value, gd::String>::type ArgumentToString( T & value )
{
    return gd::String::From<T>(value);
}

template<typename... Args>
gd::String FormatString( const gd::String & str, Args... args )
{
    std::array<gd::String, sizeof...(Args)> parameters =
        {ArgumentToString(args)...};

    std::string source = str.ToUTF8();

    std::string result;
    result.reserve( source.size() );

    std::string stack;
    stack.reserve( source.size() );

    for( auto it = source.begin(); it != source.end(); ++it )
    {
        char character = *it;
        if( stack.empty() || (stack.front() != '{' && stack.front() != '}') )
        {
            if( character == '{' || character == '}' )
            {
                result += stack;

                stack.clear();
                stack.push_back( character );
            }
            else
            {
                stack.push_back( character );
            }
        }
        else if( stack.front() == '{' )
        {
            if( character == '{' )
            {
                result += "{";

                stack.clear();
            }
            else if( character == '}' )
            {
                std::size_t parameterIndex;
                try
                {
                    parameterIndex = std::stoul( stack.substr( 1, stack.size() - 1 ) );
                }
                catch( const std::exception& e )
                {
                    throw FormatStringException( "Expected a number between '{' and '}'!" );
                }

                if( parameterIndex >= sizeof...(Args) )
                    throw FormatStringException( "Not enough arguments!" );

                stack.clear();
                result += parameters[parameterIndex].ToUTF8();
            }
            else
            {
                stack.push_back( character );
            }
        }
        else if( stack.front() == '}' )
        {
            if( character == '}' )
            {
                result += "}";

                stack.clear();
            }
            else
            {
                throw FormatStringException( "Expected '{' and a number before '}'!" );
            }
        }
    }

    if(!stack.empty())
    {
        if(stack.front() != '{' && stack.front() != '}')
        {
            result += stack;
        }
        else
        {
            throw FormatStringException( "Unexpected end of string!" );
        }
    }

    return gd::String::FromUTF8( result );
}

#endif
