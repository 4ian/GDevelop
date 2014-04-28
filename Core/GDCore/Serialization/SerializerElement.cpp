#include "GDCore/Serialization/SerializerElement.h"

namespace gd
{

SerializerElement SerializerElement::nullElement;

SerializerElement::SerializerElement() :
	valueUndefined(true)
{
}


void SerializerElement::SetAttribute(const std::string & name, bool value)
{
	attributes[name].SetBoolean(value);
}

void SerializerElement::SetAttribute(const std::string & name, const std::string & value)
{
	attributes[name].SetString(value);
}

void SerializerElement::SetAttribute(const std::string & name, int value)
{
	attributes[name].SetInt(value);
}

void SerializerElement::SetAttribute(const std::string & name, double value)
{
	attributes[name].SetDouble(value);
}

bool SerializerElement::GetBoolAttribute(const std::string & name, bool defaultValue, std::string deprecatedName) const
{
	if (attributes.find(name) != attributes.end())
		return attributes.find(name)->second.GetBoolean();
	else if (!deprecatedName.empty() && attributes.find(deprecatedName) != attributes.end())
		return attributes.find(name)->second.GetBoolean();

	return defaultValue;
}

std::string SerializerElement::GetStringAttribute(const std::string & name, std::string defaultValue, std::string deprecatedName) const
{
	if (attributes.find(name) != attributes.end())
		return attributes.find(name)->second.GetString();
	else if (!deprecatedName.empty() && attributes.find(deprecatedName) != attributes.end())
		return attributes.find(name)->second.GetString();

	return defaultValue;
}

int SerializerElement::GetIntAttribute(const std::string & name, int defaultValue, std::string deprecatedName) const
{
	if (attributes.find(name) != attributes.end())
		return attributes.find(name)->second.GetInt();
	else if (!deprecatedName.empty() && attributes.find(deprecatedName) != attributes.end())
		return attributes.find(name)->second.GetInt();

	return defaultValue;
}

double SerializerElement::GetDoubleAttribute(const std::string & name, double defaultValue, std::string deprecatedName) const
{
	if (attributes.find(name) != attributes.end())
		return attributes.find(name)->second.GetDouble();
	else if (!deprecatedName.empty() && attributes.find(deprecatedName) != attributes.end())
		return attributes.find(name)->second.GetDouble();

	return defaultValue;
}

bool SerializerElement::HasAttribute(const std::string & name)
{
	return attributes.find(name) != attributes.end();
}

SerializerElement & SerializerElement::AddChild(const std::string & name)
{
	boost::shared_ptr<SerializerElement> newElement(new SerializerElement);
	children.push_back(std::make_pair(name, newElement));

	return *newElement;
}

SerializerElement & SerializerElement::GetChild(const std::string & name)
{
	for (size_t i = 0; i < children.size(); ++i)
	{
		if (children[i].second == boost::shared_ptr<SerializerElement>())
			continue;

		if (children[i].first == name)
			return *children[i].second;
	}

	return nullElement;
}

bool SerializerElement::HasChild(const std::string & name)
{
	for (size_t i = 0; i < children.size(); ++i)
	{
		if (children[i].second == boost::shared_ptr<SerializerElement>())
			continue;

		if (children[i].first == name)
			return true;
	}

	return false;
}


}