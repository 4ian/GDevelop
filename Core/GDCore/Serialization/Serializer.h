/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_SERIALIZER_H
#define GDCORE_SERIALIZER_H
#include <string>
#include "GDCore/Serialization/SerializerElement.h"
class TiXmlElement;

namespace gd
{

/**
 * \brief The class used to save/load projects and GDCore classes
 * from/to XML or JSON.
 *
 * Usage example, with TinyXML:
 \code
    //Unserialize from a XML string:
    TiXmlDocument doc;
    if ( !doc.Parse(xmlString.c_str()) )
        return false; //Error in XML file!

    TiXmlHandle hdl(&doc);
    gd::SerializerElement rootElement;
    gd::Serializer::FromXML(rootElement, hdl.FirstChildElement().Element());
    game.UnserializeFrom(rootElement);
 \endcode
 */
class GD_CORE_API Serializer
{
public:
    /** \name XML serialization.
     * Serialize a SerializerElement from/to XML.
     */
    ///@{
    #if !defined(EMSCRIPTEN)
	static void ToXML(SerializerElement & element, TiXmlElement * xmlElement);
	static void FromXML(SerializerElement & element, const TiXmlElement * xmlElement);
	#endif
    ///@}

    /** \name JSON serialization.
     * Serialize a SerializerElement from/to JSON.
     */
    ///@{
	static gd::String ToJSON(const SerializerElement & element);
	static SerializerElement FromJSON(const std::string & json);
    static SerializerElement FromJSON(const gd::String & json)
    {
        return FromJSON(json.ToUTF8());
    }
    ///@}

	virtual ~Serializer() {};
private:
    Serializer() {};
};

}

#endif
