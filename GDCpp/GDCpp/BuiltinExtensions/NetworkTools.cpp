/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <fstream>
#include <string>
#include <SFML/Network.hpp>
#include "GDCpp/BuiltinExtensions/NetworkTools.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Variable.h"
#include "GDCpp/Tools/md5.h"
#include "GDCpp/CommonTools.h"

using namespace std;

/**
 * Send data to a php web page.
 * To prevent sending hacked data ( like a modified hi score )
 * a md5 checksum is applied on the data+a password defined by the developer
 * Php web page has to known the same password, and will applied md5 ont on the data+the password to
 * be sure data were not modified.
*/
void GD_API SendDataToPhpWebPage(const std::string & webpageurl,
    const std::string & password,
    const std::string & data1,
    const std::string & data2,
    const std::string & data3,
    const std::string & data4,
    const std::string & data5,
    const std::string & data6)
{
    string data1md5 = md5(data1+password); //On leur ajoute le mot de passe
    string data2md5 = md5(data2+password); //Et on effectue la somme de contrôle
    string data3md5 = md5(data3+password);
    string data4md5 = md5(data4+password);
    string data5md5 = md5(data5+password);
    string data6md5 = md5(data6+password);

#ifdef WINDOWS
    //Création de l'adresse internet à lancer
    string call = "start \"\" \""+webpageurl+
                   "?data1="+data1+"&check1="+data1md5+
                   "&data2="+data2+"&check2="+data2md5+
                   "&data3="+data3+"&check3="+data3md5+
                   "&data4="+data4+"&check4="+data4md5+
                   "&data5="+data5+"&check5="+data5md5+
                   "&data6="+data6+"&check6="+data6md5+"\"";

    system(call.c_str());
#elif defined(LINUX)
    //Nécessite le paquet xdg-utils
    string call = "xdg-open \""+webpageurl+
                   "?data1="+data1+"&check1="+data1md5+
                   "&data2="+data2+"&check2="+data2md5+
                   "&data3="+data3+"&check3="+data3md5+
                   "&data4="+data4+"&check4="+data4md5+
                   "&data5="+data5+"&check5="+data5md5+
                   "&data6="+data6+"&check6="+data6md5+"\"";

    system(call.c_str());
#elif defined(MAC)
    string call = "open \""+webpageurl+
                   "?data1="+data1+"&check1="+data1md5+
                   "&data2="+data2+"&check2="+data2md5+
                   "&data3="+data3+"&check3="+data3md5+
                   "&data4="+data4+"&check4="+data4md5+
                   "&data5="+data5+"&check5="+data5md5+
                   "&data6="+data6+"&check6="+data6md5+"\"";

    system(call.c_str());
#endif

    return;
}

void GD_API SendHttpRequest(const std::string & host, const std::string & uri, const std::string & body, 
    const std::string & method, const std::string & contentType, gd::Variable & responseVar)
{
    // Create Http
    sf::Http Http;
    Http.setHost(host);

    // Create request
    sf::Http::Request request;
    request.setMethod(method == "POST" ? sf::Http::Request::Post : sf::Http::Request::Get);
    request.setField("Content-Type", contentType.empty() ? "application/x-www-form-urlencoded" : contentType);
    request.setUri(uri);
    request.setBody(body);

    // Send request & Get response
    sf::Http::Response response = Http.sendRequest(request);

    if (response.getStatus() == sf::Http::Response::Ok)
    {
        responseVar.SetString(response.getBody());
    }
    //else request failed.
}

void GD_API DownloadFile( const std::string & host, const std::string & uri, const std::string & outputfilename )
{
    // Create Http
    sf::Http Http;
    Http.setHost(host);

    // Create request
    sf::Http::Request Request;
    Request.setMethod(sf::Http::Request::Get);
    Request.setUri(uri);

    // Send request & Get response
    sf::Http::Response datas = Http.sendRequest(Request);

    ofstream ofile(outputfilename.c_str(), ios_base::binary);
    if ( ofile.is_open() )
    {
        ofile.write(datas.getBody().c_str(),datas.getBody().size());
        ofile.close();

        return;
    }

    cout << "Downloading file : Unable to open output file " << outputfilename;
    return;
}

std::string GD_API VariableStructureToJSON(const gd::Variable & variable)
{
    if ( !variable.IsStructure() ) {
        if ( variable.IsNumber() )
            return ToString(variable.GetValue());
        else
            return "\""+variable.GetString()+"\"";
    }

    std::string str = "{";
    bool firstChild = true;
    for(std::map<std::string, gd::Variable>::const_iterator i = variable.GetAllChildren().begin();
        i != variable.GetAllChildren().end();++i)
    {
        if ( !firstChild ) str += ",";
        str += "\""+i->first+"\": "+VariableStructureToJSON(i->second);

        firstChild = false;
    }

    str += "}";
    return str;
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

            strContent = str.substr(startPos+1, endPos-1-startPos);
            return endPos;
        }
        
        endPos = str.find_first_of(" \n,:");
        if ( endPos >= str.length() ) return std::string::npos; //Invalid string
        
        strContent = str.substr(startPos, endPos-1-startPos);
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

        if ( jsonStr[pos] == '{' ) //Structure
        {
            bool firstChild = true;
            while ( firstChild || jsonStr[pos] == ',' )
            {
                pos++;
                std::string childName;
                pos = SkipString(jsonStr, pos, childName);
                
                pos++;
                pos = SkipBlankChar(jsonStr, pos);
                if ( pos >= jsonStr.length() || jsonStr[pos] != ':' ) return std::string::npos;

                pos++;
                pos = ::ParseJSONObject(jsonStr, pos, variable.GetChild(childName));

                pos = SkipBlankChar(jsonStr, pos);
                if ( pos >= jsonStr.length()) return std::string::npos;
                firstChild = false;
            }

            if ( jsonStr[pos] != '}' ) return std::string::npos;
            return pos+1;
        }
        else if ( jsonStr[pos] == '[' ) //Array are translated into child named 0,1,2...
        {
            unsigned int index = 0;
            while ( index == 0 || jsonStr[pos] == ',' )
            {
                pos++;
                pos = ::ParseJSONObject(jsonStr, pos, variable.GetChild(ToString(index)));

                pos = SkipBlankChar(jsonStr, pos);
                if ( pos >= jsonStr.length()) return std::string::npos;
                index++;
            }

            if ( jsonStr[pos] != ']' ) return std::string::npos;
            return pos+1;
        }
        else if ( jsonStr[pos] == '"' ) //String
        {
            std::string str;
            pos = SkipString(jsonStr, pos, str);
            if ( pos >= jsonStr.length() ) return std::string::npos;

            variable.SetString(str);
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
            variable.SetValue(ToDouble(str));
            return endPos;
        }
    }
}

void GD_API JSONToVariableStructure(const std::string & jsonStr, gd::Variable & variable)
{
    if ( jsonStr.empty() ) return;
    ::ParseJSONObject(jsonStr, 0, variable);
}
