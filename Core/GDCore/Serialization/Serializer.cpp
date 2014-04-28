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
#if !defined(EMSCRIPTEN)
#include "GDCore/TinyXml/tinyxml.h"
#endif

namespace gd
{

#if !defined(EMSCRIPTEN)
void Serializer::SerializeToXML(SerializerElement & element, TiXmlElement * xmlElement)
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
				xmlElement->SetAttribute(it->first.c_str(), attr.GetDouble());
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
			SerializeToXML(*children[i].second, xmlChild);
		}
	}
	else
	{
		TiXmlText * xmlValue = new TiXmlText(element.GetValue().GetString().c_str());
		xmlElement->LinkEndChild(xmlValue);
	}

}

void Serializer::UnserializeFromXML(SerializerElement & element, const TiXmlElement * xmlElement)
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
			UnserializeFromXML(childElement, child);
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
		else if (val.IsString())
			return "\""+val.GetString() + "\"";
		else if (val.IsInt())
			return gd::ToString(val.GetInt());
		else if (val.IsDouble())
			return gd::ToString(val.GetDouble());
		else
			return "\""+val.GetString() + "\"";
	}
}

std::string Serializer::SerializeToJSON(const SerializerElement & element)
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
		        str += SerializeToJSON(*children[i].second);

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
		        str += "\""+children[i].first+"\": "+SerializeToJSON(*children[i].second);

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

}