/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <fstream>
#include <cstring>
#include <string>
#include <iomanip>
#include <SFML/Network.hpp>
#include "GDCpp/Extensions/Builtin/NetworkTools.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Project/Variable.h"
#include "GDCpp/Runtime/Tools/md5.h"
#include "GDCpp/Runtime/CommonTools.h"

using namespace std;

/**
 * Send data to a php web page.
 * To prevent sending hacked data ( like a modified hi score )
 * a md5 checksum is applied on the data+a password defined by the developer
 * Php web page has to known the same password, and will applied md5 ont on the data+the password to
 * be sure data were not modified.
*/
void GD_API SendDataToPhpWebPage(const gd::String & webpageurl,
    const gd::String & password,
    const gd::String & data1,
    const gd::String & data2,
    const gd::String & data3,
    const gd::String & data4,
    const gd::String & data5,
    const gd::String & data6)
{
    gd::String data1md5 = md5(data1+password); //On leur ajoute le mot de passe
    gd::String data2md5 = md5(data2+password); //Et on effectue la somme de contr�le
    gd::String data3md5 = md5(data3+password);
    gd::String data4md5 = md5(data4+password);
    gd::String data5md5 = md5(data5+password);
    gd::String data6md5 = md5(data6+password);

#ifdef WINDOWS
    //Cr�ation de l'adresse internet � lancer
    gd::String call = "start \"\" \""+webpageurl+
                   "?data1="+data1+"&check1="+data1md5+
                   "&data2="+data2+"&check2="+data2md5+
                   "&data3="+data3+"&check3="+data3md5+
                   "&data4="+data4+"&check4="+data4md5+
                   "&data5="+data5+"&check5="+data5md5+
                   "&data6="+data6+"&check6="+data6md5+"\"";

    system(call.ToLocale().c_str());
#elif defined(LINUX)
    //N�cessite le paquet xdg-utils
    gd::String call = "xdg-open \""+webpageurl+
                   "?data1="+data1+"&check1="+data1md5+
                   "&data2="+data2+"&check2="+data2md5+
                   "&data3="+data3+"&check3="+data3md5+
                   "&data4="+data4+"&check4="+data4md5+
                   "&data5="+data5+"&check5="+data5md5+
                   "&data6="+data6+"&check6="+data6md5+"\"";

    system(call.ToLocale().c_str());
#elif defined(MACOS)
    gd::String call = "open \""+webpageurl+
                   "?data1="+data1+"&check1="+data1md5+
                   "&data2="+data2+"&check2="+data2md5+
                   "&data3="+data3+"&check3="+data3md5+
                   "&data4="+data4+"&check4="+data4md5+
                   "&data5="+data5+"&check5="+data5md5+
                   "&data6="+data6+"&check6="+data6md5+"\"";

    system(call.ToLocale().c_str());
#endif

    return;
}

void GD_API SendHttpRequest(const gd::String & host, const gd::String & uri, const gd::String & body,
    const gd::String & method, const gd::String & contentType, gd::Variable & responseVar)
{
    // Separate the host and the port number
    auto hostInfo = host.Split(U':');

    if(hostInfo.size() < 2)
        return; //Invalid address (there should be two elements: "http" and "//the.domain.com")

    // Create Http
    sf::Http http;
    http.setHost(hostInfo[0].ToUTF8() + ":" + hostInfo[1].ToUTF8(), hostInfo.size() > 2 ? hostInfo[2].To<unsigned short>() : 0);

    // Create request
    sf::Http::Request request;
    request.setMethod(method == "POST" ? sf::Http::Request::Post : sf::Http::Request::Get);
    request.setField("Content-Type", contentType.empty() ? "application/x-www-form-urlencoded" : contentType.ToUTF8());
    request.setUri(uri.ToUTF8());
    request.setBody(body.ToUTF8());

    // Send request & Get response
    sf::Http::Response response = http.sendRequest(request);

    if (response.getStatus() == sf::Http::Response::Ok)
    {
        responseVar.SetString(gd::String::FromUTF8(response.getBody()));
    }
    //else request failed.
}

void GD_API DownloadFile( const gd::String & host, const gd::String & uri, const gd::String & outputfilename )
{
    // Separate the host and the port number
    auto hostInfo = host.Split(U':');

    if(hostInfo.size() < 2)
        return; //Invalid address (there should be two elements: "http" and "//the.domain.com")

    // Create Http
    sf::Http http;
    http.setHost(hostInfo[0].ToUTF8() + ":" + hostInfo[1].ToUTF8(), hostInfo.size() > 2 ? hostInfo[2].To<unsigned short>() : 0);

    // Create request
    sf::Http::Request Request;
    Request.setMethod(sf::Http::Request::Get);
    Request.setUri(uri.ToUTF8());

    // Send request & Get response
    sf::Http::Response datas = http.sendRequest(Request);

    ofstream ofile(outputfilename.ToLocale().c_str(), ios_base::binary);
    if ( ofile.is_open() )
    {
        ofile.write(datas.getBody().c_str(),datas.getBody().size());
        ofile.close();

        return;
    }

    cout << "Downloading file : Unable to open output file " << outputfilename;
    return;
}

//Private functions for JSON reading
namespace
{
    /**
     * Adapted from public domain library "jsoncpp" (http://sourceforge.net/projects/jsoncpp/).
     */
    static inline bool isControlCharacter(char ch)
    {
       return ch > 0 && ch <= 0x1F;
    }

    /**
     * Adapted from public domain library "jsoncpp" (http://sourceforge.net/projects/jsoncpp/).
     */
    static bool containsControlCharacter( const char* str )
    {
       while ( *str )
       {
          if ( isControlCharacter( *(str++) ) )
             return true;
       }
       return false;
    }

    /**
     * Tool function converting a string to a quoted string that can be inserted into
     * a JSON file.
     * Adapted from public domain library "jsoncpp" (http://sourceforge.net/projects/jsoncpp/).
     */
    std::string StringToQuotedJSONString( const char *value )
    {
       if (value == NULL)
          return "";
       // Not sure how to handle unicode...
       if (strpbrk(value, "\"\\\b\f\n\r\t") == NULL && !containsControlCharacter( value ))
          return std::string("\"") + value + "\"";
       // We have to walk value and escape any special characters.
       // Appending to std::string is not efficient, but this should be rare.
       // (Note: forward slashes are *not* rare, but I am not escaping them.)
       std::string::size_type maxsize = strlen(value)*2 + 3; // allescaped+quotes+NULL
       std::string result;
       result.reserve(maxsize); // to avoid lots of mallocs
       result += "\"";
       for (const char* c=value; *c != 0; ++c)
       {
          switch(*c)
          {
             case '\"':
                result += "\\\"";
                break;
             case '\\':
                result += "\\\\";
                break;
             case '\b':
                result += "\\b";
                break;
             case '\f':
                result += "\\f";
                break;
             case '\n':
                result += "\\n";
                break;
             case '\r':
                result += "\\r";
                break;
             case '\t':
                result += "\\t";
                break;
             //case '/':
                // Even though \/ is considered a legal escape in JSON, a bare
                // slash is also legal, so I see no reason to escape it.
                // (I hope I am not misunderstanding something.
                // blep notes: actually escaping \/ may be useful in javascript to avoid </
                // sequence.
                // Should add a flag to allow this compatibility mode and prevent this
                // sequence from occurring.
             default:
                if ( isControlCharacter( *c ) )
                {
                   std::ostringstream oss;
                   oss << "\\u" << std::hex << std::uppercase << std::setfill('0') << std::setw(4) << static_cast<int>(*c);
                   result += oss.str();
                }
                else
                {
                   result += *c;
                }
                break;
          }
       }
       result += "\"";
       return result;
    }
}

gd::String GD_API VariableStructureToJSON(const gd::Variable & variable)
{
    if ( !variable.IsStructure() ) {
        if ( variable.IsNumber() )
            return gd::String::From(variable.GetValue());
        else
            return gd::String::FromUTF8(StringToQuotedJSONString(variable.GetString().c_str()));
    }

    gd::String str = "{";
    bool firstChild = true;
    for(std::map<gd::String, gd::Variable>::const_iterator i = variable.GetAllChildren().begin();
        i != variable.GetAllChildren().end();++i)
    {
        if ( !firstChild ) str += ",";
        str += gd::String::FromUTF8(StringToQuotedJSONString(i->first.c_str()))+": "+VariableStructureToJSON(i->second);

        firstChild = false;
    }

    str += "}";
    return str;
}

gd::String GD_API ObjectVariableStructureToJSON(RuntimeObject * object, const gd::Variable & variable)
{
  return VariableStructureToJSON(variable);
}

//Private functions for JSON parsing
namespace
{
    size_t SkipBlankChar(const std::string & str, size_t pos)
    {
        const std::string blankChar = " \n";
        return str.find_first_not_of(blankChar, pos);
    }

    /**
     * Adapted from https://github.com/hjiang/jsonxx
     */
    std::string DecodeString(const std::string & original)
    {
        std::string value;
        value.reserve(original.size());
        std::istringstream input("\""+original+"\"");

        char ch = '\0', delimiter = '"';
        input.get(ch);
        if (ch != delimiter) return "";

        while(!input.eof() && input.good()) {
            input.get(ch);
            if (ch == delimiter) {
                break;
            }
            if (ch == '\\') {
                input.get(ch);
                switch(ch) {
                    case '\\':
                    case '/':
                        value.push_back(ch);
                        break;
                    case 'b':
                        value.push_back('\b');
                        break;
                    case 'f':
                        value.push_back('\f');
                        break;
                    case 'n':
                        value.push_back('\n');
                        break;
                    case 'r':
                        value.push_back('\r');
                        break;
                    case 't':
                        value.push_back('\t');
                        break;
                    case 'u': {
                            int i;
                            std::stringstream ss;
                            for( i = 0; (!input.eof() && input.good()) && i < 4; ++i ) {
                                input.get(ch);
                                ss << ch;
                            }
                            if( input.good() && (ss >> i) )
                                value.push_back(i);
                        }
                        break;
                    default:
                        if (ch != delimiter) {
                            value.push_back('\\');
                            value.push_back(ch);
                        } else value.push_back(ch);
                        break;
                }
            } else {
                value.push_back(ch);
            }
        }
        if (input && ch == delimiter) {
            return value;
        } else {
            return "";
        }
    }

    /**
     * Return the position of the end of the string. Blank are skipped if necessary
     * @param str The string to be used
     * @param startPos The start position
     * @param strContent A reference to a string that will be filled with the string content.
     */
    size_t SkipString(const std::string & str, size_t startPos, std::string & strContent)
    {
        startPos = SkipBlankChar(str, startPos);
        if ( startPos >= str.length() ) return std::string::npos;

        size_t endPos = startPos;

        if ( str[startPos] == '"' )
        {
            if ( startPos+1 >= str.length() ) return std::string::npos;

            while (endPos == startPos || (str[endPos-1] == '\\'))
            {
                endPos = str.find_first_of('\"', endPos+1);
                if ( endPos == std::string::npos ) return std::string::npos; //Invalid string
            }

            strContent = DecodeString(str.substr(startPos+1, endPos-1-startPos));
            return endPos;
        }

        endPos = str.find_first_of(" \n,:");
        if ( endPos >= str.length() ) return std::string::npos; //Invalid string

        strContent = DecodeString(str.substr(startPos, endPos-1-startPos));
        return endPos-1;
    }

    /**
     * Parse a JSON string, starting from pos, and storing the result into the specified variable.
     * Note that the parsing is stopped as soon as a valid object is parsed.
     * \return The position at the end of the valid object stored into the variable.
     */
    size_t ParseJSONObject(const std::string & jsonStr, size_t startPos, gd::Variable & variable)
    {
        size_t pos = SkipBlankChar(jsonStr, startPos);
        if ( pos >= jsonStr.length() ) return std::string::npos;

        if ( jsonStr[pos] == '{' ) //Object
        {
            bool firstChild = true;
            while ( firstChild || jsonStr[pos] == ',' )
            {
                pos++;
                if (pos < jsonStr.length() && jsonStr[pos] == '}' ) break;

                std::string childName;
                pos = SkipString(jsonStr, pos, childName);

                pos++;
                pos = SkipBlankChar(jsonStr, pos);
                if ( pos >= jsonStr.length() || jsonStr[pos] != ':' ) return std::string::npos;

                pos++;
                pos = ::ParseJSONObject(jsonStr, pos, variable.GetChild(gd::String::FromUTF8(childName)));

                pos = SkipBlankChar(jsonStr, pos);
                if ( pos >= jsonStr.length()) return std::string::npos;
                firstChild = false;
            }

            if ( jsonStr[pos] != '}' ) {
                std::cout << "Parsing error: Object not properly formed.";
                return std::string::npos;
            }
            return pos+1;
        }
        else if ( jsonStr[pos] == '[' ) //Array are translated into child named 0,1,2...
        {
            std::size_t index = 0;
            while ( index == 0 || jsonStr[pos] == ',' )
            {
                pos++;
                if (pos < jsonStr.length() && jsonStr[pos] == ']' ) break;
                pos = ::ParseJSONObject(jsonStr, pos, variable.GetChild(gd::String::From(index)));

                pos = SkipBlankChar(jsonStr, pos);
                if ( pos >= jsonStr.length()) {
                    std::cout << "Parsing error: element of array not properly formed.";
                    return std::string::npos;
                }
                index++;
            }

            if ( jsonStr[pos] != ']' ) {
                std::cout << "Parsing error: array not properly ended";
                return std::string::npos;
            }
            return pos+1;
        }
        else if ( jsonStr[pos] == '"' ) //String
        {
            std::string str;
            pos = SkipString(jsonStr, pos, str);
            if ( pos >= jsonStr.length() ) {
                std::cout << "Parsing error: Invalid string";
                return std::string::npos;
            }

            variable.SetString(gd::String::FromUTF8(str));
            return pos+1;
        }
        else
        {
            std::string str;
            size_t endPos = pos;
            const std::string separators = " \n,}";
            while (endPos < jsonStr.length() && separators.find_first_of(jsonStr[endPos]) == std::string::npos ) {
                endPos++;
            }

            str = jsonStr.substr(pos, endPos-pos);
            if ( str == "true" )
                variable.SetValue(1);
            else if ( str == "false" )
                variable.SetValue(0);
            else
                variable.SetValue(gd::String::FromUTF8(str).To<double>());
            return endPos;
        }
    }
}

void GD_API JSONToVariableStructure(const gd::String & jsonStr, gd::Variable & variable)
{
    if ( jsonStr.empty() ) return;
    ::ParseJSONObject(jsonStr.c_str(), 0, variable);
}

void GD_API JSONToObjectVariableStructure(const gd::String & JSON, RuntimeObject * object, gd::Variable & variable)
{
    JSONToVariableStructure(JSON, variable);
}
