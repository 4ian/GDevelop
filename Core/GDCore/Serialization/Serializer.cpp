/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/CommonTools.h"
#include <iostream>
#include <string>
#include <vector>
#include <utility>
#if !defined(EMSCRIPTEN)
#include "GDCore/TinyXml/tinyxml.h"
#endif

namespace gd
{

#if !defined(EMSCRIPTEN)
void Serializer::ToXML(SerializerElement & element, TiXmlElement * xmlElement)
{
	if(!xmlElement) return;

	if (element.IsValueUndefined())
	{
		const std::map<std::string, SerializerValue> & attributes = element.GetAllAttributes();
		for (std::map<std::string, SerializerValue>::const_iterator it = attributes.begin(); it != attributes.end();++it)
		{
			const SerializerValue & attr = it->second;

			if (attr.IsBoolean())
				xmlElement->SetAttribute(it->first.c_str(), attr.GetBool() ? "true" : "false");
			else if (attr.IsString())
				xmlElement->SetAttribute(it->first.c_str(), attr.GetString().c_str());
			else if (attr.IsInt())
				xmlElement->SetAttribute(it->first.c_str(), attr.GetInt());
			else if (attr.IsDouble())
				xmlElement->SetDoubleAttribute(it->first.c_str(), attr.GetDouble());
			else
				xmlElement->SetAttribute(it->first.c_str(), attr.GetString().c_str());
		}

		const std::vector< std::pair<std::string, boost::shared_ptr<SerializerElement> > > & children = element.GetAllChildren();
		for (size_t i = 0; i < children.size(); ++i)
		{
			if (children[i].second == boost::shared_ptr<SerializerElement>())
				continue;

		    TiXmlElement * xmlChild = new TiXmlElement( children[i].first.c_str() );
	        xmlElement->LinkEndChild( xmlChild );
			ToXML(*children[i].second, xmlChild);
		}
	}
	else
	{
		TiXmlText * xmlValue = new TiXmlText(element.GetValue().GetString().c_str());
		xmlElement->LinkEndChild(xmlValue);
	}

}

void Serializer::FromXML(SerializerElement & element, const TiXmlElement * xmlElement)
{
	if(!xmlElement) return;

	element.HideWarnings();

	const TiXmlAttribute * attr = xmlElement->FirstAttribute();
	while(attr)
	{
		if ( attr->Name() != NULL )
		{
			std::string name = attr->Name();
			if (attr->Value())
				element.SetAttribute(name, std::string(attr->Value()));
		}

		attr = attr->Next();
	}

	const TiXmlElement * child = xmlElement->FirstChildElement();
	while(child)
	{
		if (child->Value())
		{
			std::string name = child->Value();
			SerializerElement & childElement = element.AddChild(name);
			FromXML(childElement, child);
		}

		child = child->NextSiblingElement();
	}

	if (xmlElement->GetText())
	{
		SerializerValue value;
		value.Set(xmlElement->GetText());
		element.SetValue(value);
	}

}
#endif

namespace
{
	std::string ValueToJSON(const SerializerValue & val)
	{
		if (val.IsBoolean())
			return val.GetBool() ? "true" : "false";
		else if (val.IsInt())
			return gd::ToString(val.GetInt());
		else if (val.IsDouble())
			return gd::ToString(val.GetDouble());
		else
		{
			//String: Replace newlines and quotes
			std::string str = val.GetString();

			size_t pos = std::string::npos;
			while((pos = str.find("\n")) < str.length()) {
	            str.replace(pos, 1, "\\n" );
			}
			while((pos = str.find("\"")) < str.length()) {
	            str.replace(pos, 1, "\\\"" );
			}

			return "\""+str+ "\"";
		}
	}
}

std::string Serializer::ToJSON(const SerializerElement & element)
{
	if (element.IsValueUndefined())
	{
		if ( !element.ConsideredAsArrayOf().empty() )
		{
			//Store the element as an array in JSON:
		    std::string str = "[";
		    bool firstChild = true;

		    if ( element.GetAllAttributes().size() > 0 )
		    {
				std::cout << "WARNING: A SerializerElement is considered as an array of " << element.ConsideredAsArrayOf()
					<< " but has attributes. These attributes won't be saved!" << std::endl;
		    }

			const std::vector< std::pair<std::string, boost::shared_ptr<SerializerElement> > > & children = element.GetAllChildren();
			for (size_t i = 0; i < children.size(); ++i)
			{
				if (children[i].second == boost::shared_ptr<SerializerElement>())
					continue;
				if (children[i].first != element.ConsideredAsArrayOf())
				{
					std::cout << "WARNING: A SerializerElement is considered as an array of " << element.ConsideredAsArrayOf()
						<< " but has a children called " << children[i].first << ". This children won't be saved!" << std::endl;
					continue;
				}

		        if ( !firstChild ) str += ",";
		        str += ToJSON(*children[i].second);

		        firstChild = false;
			}

		    str += "]";
		    return str;
		}
		else
		{
		    std::string str = "{";
		    bool firstChild = true;

			const std::map<std::string, SerializerValue> & attributes = element.GetAllAttributes();
			for (std::map<std::string, SerializerValue>::const_iterator it = attributes.begin();
				it != attributes.end();++it)
		    {
		        if ( !firstChild ) str += ",";
		        str += "\""+it->first+"\": "+ValueToJSON(it->second);

		        firstChild = false;
		    }

			const std::vector< std::pair<std::string, boost::shared_ptr<SerializerElement> > > & children = element.GetAllChildren();
			for (size_t i = 0; i < children.size(); ++i)
			{
				if (children[i].second == boost::shared_ptr<SerializerElement>())
					continue;

		        if ( !firstChild ) str += ",";
		        str += "\""+children[i].first+"\": "+ToJSON(*children[i].second);

		        firstChild = false;
			}

		    str += "}";
		    return str;
		}
	}
	else
	{
		return ValueToJSON(element.GetValue());
	}
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
     * Parse a JSON string, starting from pos, and storing the result into the specified element.
     * Note that the parsing is stopped as soon as a valid object is parsed.
     * \return The position at the end of the valid object stored into the element.
     */
    size_t ParseJSONObject(const std::string & jsonStr, size_t startPos, gd::SerializerElement & element)
    {
        size_t pos = SkipBlankChar(jsonStr, startPos);
        if ( pos >= jsonStr.length() ) return std::string::npos;

        if ( jsonStr[pos] == '{' ) //Object
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
                pos = ParseJSONObject(jsonStr, pos, element.AddChild(childName));

                pos = SkipBlankChar(jsonStr, pos);
                if ( pos >= jsonStr.length()) return std::string::npos;
                firstChild = false;
            }

            if ( jsonStr[pos] != '}' ) return std::string::npos;
            return pos+1;
        }
        else if ( jsonStr[pos] == '[' ) //Array
        {
            unsigned int index = 0;
            while ( index == 0 || jsonStr[pos] == ',' )
            {
                pos++;
                pos = ParseJSONObject(jsonStr, pos, element.AddChild(""));

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

            element.SetValue(str);
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
            element.SetValue(ToDouble(str));
            return endPos;
        }
    }
}

SerializerElement Serializer::FromJSON(const std::string & jsonStr)
{
	SerializerElement element;
   	if ( !jsonStr.empty() ) gd::ParseJSONObject(jsonStr, 0, element);
	return element;
}


}