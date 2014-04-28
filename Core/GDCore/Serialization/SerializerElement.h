/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_SERIALIZERELEMENT_H
#define GDCORE_SERIALIZERELEMENT_H
#include <map>
#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
#include "GDCore/Serialization/SerializerValue.h"

namespace gd {

/**
 * \brief An element used during serialization from/to XML or JSON.
 *
 * \see gd::Serializer
 */
class SerializerElement
{
public:
	SerializerElement();
	virtual ~SerializerElement() {};

    /** \name Value
     * Methods related to the value of the element, if any.
     */
    ///@{
	/**
	 * \brief Set the value of the element.
	 */
    void SetValue(const SerializerValue & value) { valueUndefined = false; elementValue = value; }

	/**
	 * \brief Get the value of the element.
	 */
    const SerializerValue & GetValue() const { return elementValue; }

    /**
     * \brief Return true if no value was set for the element.
     */
    bool IsValueUndefined() const { return valueUndefined; }
    ///@}

    /** \name Attributes
     * Methods related to the attributes of the element
     */
    ///@{
	/**
	 * \brief Set the value of an attribute of the element
	 * \param name The name of the attribute.
	 * \param value The value of the attribute.
	 */
	void SetAttribute(const std::string & name, bool value);

	/**
	 * \brief Set the value of an attribute of the element
	 * \param name The name of the attribute.
	 * \param value The value of the attribute.
	 */
	void SetAttribute(const std::string & name, const std::string & value);

	/**
	 * \brief Set the value of an attribute of the element
	 * \param name The name of the attribute.
	 * \param value The value of the attribute.
	 */
	void SetAttribute(const std::string & name, int value);

	/**
	 * \brief Set the value of an attribute of the element
	 * \param name The name of the attribute.
	 * \param value The value of the attribute.
	 */
	void SetAttribute(const std::string & name, double value);

	/**
	 * Get the value of an attribute being a boolean.
	 * \param name The name of the attribute
	 * \param defaultValue The value returned if the attribute is not found.
	 * \param deprecatedName An alternative name for the attribute that will be used if the first one doesn't exists.
	 */
	bool GetBoolAttribute(const std::string & name, bool defaultValue = false, std::string deprecatedName = "") const;

	/**
	 * Get the value of an attribute being a string.
	 * \param name The name of the attribute
	 * \param defaultValue The value returned if the attribute is not found.
	 * \param deprecatedName An alternative name for the attribute that will be used if the first one doesn't exists.
	 */
	std::string GetStringAttribute(const std::string & name, std::string defaultValue = "", std::string deprecatedName = "") const;

	/**
	 * Get the value of an attribute being an int.
	 * \param name The name of the attribute
	 * \param defaultValue The value returned if the attribute is not found.
	 * \param deprecatedName An alternative name for the attribute that will be used if the first one doesn't exists.
	 */
	int GetIntAttribute(const std::string & name, int defaultValue = 0, std::string deprecatedName = "") const;

	/**
	 * Get the value of an attribute being a double.
	 * \param name The name of the attribute
	 * \param defaultValue The value returned if the attribute is not found.
	 * \param deprecatedName An alternative name for the attribute that will be used if the first one doesn't exists.
	 */
	double GetDoubleAttribute(const std::string & name, double defaultValue = 0.0, std::string deprecatedName = "") const;

    /**
     * \brief Return true if the specified attribute exists.
     * \param name The name of the attribute to find.
     */
	bool HasAttribute(const std::string & name);
    /**
     * \brief Return all the children of the element.
     */
	const std::map< std::string, SerializerValue > & GetAllAttributes() const { return attributes; };
    ///@}

    /** \name Children
     * Methods related to the children elements
     */
    ///@{

    /**
     * \brief Add a child at the end of the children list with the given name and return a reference to it.
     * \param name The name of the new child.
     */
	SerializerElement & AddChild(const std::string & name);

    /**
     * \brief Add a child at the end of the children list with the given name and return a reference to it.
     * \param name The name of the new child.
     */
	SerializerElement & GetChild(const std::string & name);

    /**
     * \brief Return true if the specified child exists.
     * \param name The name of the child to find.
     */
	bool HasChild(const std::string & name);

    /**
     * \brief Return all the children of the element.
     */
	const std::vector< std::pair<std::string, boost::shared_ptr<SerializerElement> > > & GetAllChildren() const { return children; };
    ///@}

private:

	bool valueUndefined; ///< If true, the element does not have a value.
	SerializerValue elementValue;

	std::map< std::string, SerializerValue > attributes;
	std::vector< std::pair<std::string, boost::shared_ptr<SerializerElement> > > children;
	static SerializerElement nullElement;
};

}

#endif