/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
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
 */
class GD_CORE_API Serializer
{
public:
    /** \name XML serialization.
     * Serialize a SerializerElement from/to XML.
     *
     * \warning Not available when compiling with emscripten.
     */
    ///@{
    #if !defined(EMSCRIPTEN)
	static void ToXML(SerializerElement & element, TiXmlElement * xmlElement);
	static void FromXML(SerializerElement & element, const TiXmlElement * xmlElement);
	#endif
    ///@}

    /** \name JSON serialization.
     * Serialize a SerializerElement from/to JSON.
     *
     * \warning Not available when compiling with emscripten.
     */
    ///@{
	static std::string ToJSON(const SerializerElement & element);
	static SerializerElement FromJSON(const std::string & json);
    ///@}

private:
	Serializer();
	virtual ~Serializer();

};

}

#endif