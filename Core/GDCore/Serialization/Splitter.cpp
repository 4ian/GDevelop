/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "Splitter.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/String.h"
#include "GDCore/CommonTools.h"
#include <iostream>
#include <string>
#include <vector>
#include <utility>
#include <iomanip>

namespace gd
{

std::vector<Splitter::SplitElement> Splitter::Split(SerializerElement & element,
	const std::set<gd::String> & tags,
	gd::String path)
{
	std::vector<Splitter::SplitElement> elements;
	for(auto & child : element.GetAllChildren())
	{
		auto & childElement = child.second;
		gd::String ref = path + pathSeparator + child.first;

		if (tags.find(ref) != tags.end())
		{
			gd::String refName = childElement->GetStringAttribute(nameAttribute);
			SplitElement splitElement = {
				ref,
				refName,
				*childElement
			};
			elements.push_back(splitElement);

			SerializerElement refElement;
			refElement.SetAttribute("referenceTo", ref);
			refElement.SetAttribute("name", refName);
			*childElement = refElement;
		}
		else
		{
			auto newElements = Split(*childElement, tags, ref);
			elements.insert(elements.end(), newElements.begin(), newElements.end());
		}
	}

	return elements;
}

void Splitter::Unsplit(SerializerElement & element,
    std::function<SerializerElement(gd::String path, gd::String name)> cb)
{
	for(auto & child : element.GetAllChildren())
	{
		auto & childElement = child.second;
		if ((childElement->HasAttribute("referenceTo") && childElement->HasAttribute("name")) ||
			(childElement->HasChild("referenceTo") && childElement->HasChild("name")))
		{
			SerializerElement newElement = cb(childElement->GetStringAttribute("referenceTo"),
				childElement->GetStringAttribute("name"));
			*childElement = newElement;
		}

		Unsplit(*childElement, cb);
	}
}

}
