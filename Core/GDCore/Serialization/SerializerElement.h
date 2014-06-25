/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
class GD_CORE_API SerializerElement
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
    void SetValue(bool val) { valueUndefined = false; elementValue.SetBool(val); }
    void SetValue(std::string val) { valueUndefined = false; elementValue.SetString(val); }
    void SetValue(int val) { valueUndefined = false; elementValue.SetInt(val); }
    void SetValue(unsigned int val) { valueUndefined = false; elementValue.SetInt((int)val); }
    void SetValue(double val) { valueUndefined = false; elementValue.SetDouble(val); }
    void SetValue(float val) { SetValue((double)val); }

	/**
	 * \brief Get the value of the element.
	 *
	 * If not value was set, an attribute named "value" is searched. If found, its value is returned.
	 */
    const SerializerValue & GetValue() const;

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
	SerializerElement & SetAttribute(const std::string & name, bool value);

	/**
	 * \brief Set the value of an attribute of the element
	 * \param name The name of the attribute.
	 * \param value The value of the attribute.
	 */
	SerializerElement & SetAttribute(const std::string & name, const std::string & value);

	/**
	 * \brief Set the value of an attribute of the element
	 * \param name The name of the attribute.
	 * \param value The value of the attribute.
	 */
	SerializerElement & SetAttribute(const std::string & name, const char * value) { if (value) SetAttribute(name, std::string(value)); return *this; };

	/**
	 * \brief Set the value of an attribute of the element
	 * \param name The name of the attribute.
	 * \param value The value of the attribute.
	 */
	SerializerElement & SetAttribute(const std::string & name, int value);

	/**
	 * \brief Set the value of an attribute of the element
	 * \param name The name of the attribute.
	 * \param value The value of the attribute.
	 */
	SerializerElement & SetAttribute(const std::string & name, double value);

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
     * \brief Consider that the element is an array for elements with the given name.
     *
     * In this case, no child with a different name should be added. When serialized to format accepting arrays,
     * the element will be serialized to an array.
     *
     * \param name The name of the children.
     */
    void ConsiderAsArrayOf(const std::string & name, const std::string & deprecatedName = "") const { arrayOf = name; deprecatedArrayOf = deprecatedName; };

    /**
     * \brief Return the name of the children the element is considered an array of.
     *
     * Return an empty string if the element is not considered as an array.
     */
    const std::string & ConsideredAsArrayOf() const { return arrayOf; };

    /**
     * \brief Add a child at the end of the children list with the given name and return a reference to it.
     * \param name The name of the new child.
     */
	SerializerElement & AddChild(std::string name);

    /**
     * \brief Get a child of the element using its name.
     * \param name The name of the new child.
     * \param name The index of the child
     */
	SerializerElement & GetChild(std::string name, unsigned int index = 0, std::string deprecatedName = "") const;

    /**
     * \brief Get a child of the element using its index (when the element is considered as an array).
     * \param name The index of the child
     */
	SerializerElement & GetChild(unsigned int index) const;

    /**
     * \brief Get the number of children having a specific name.
     *
     * If no children name is specified, return the number of children being part of the array.
     * (ConsiderAsArrayOf must have been called before).
     * Note that unnamed children are considered to be valid element of the array.
     *
     * \param name The name of the children.
     *
     * \see SerializerElement::ConsiderAsArrayOf
     */
	unsigned int GetChildrenCount(std::string name = "", std::string deprecatedName = "") const;

    /**
     * \brief Return true if the specified child exists.
     * \param name The name of the child to find.
     */
	bool HasChild(const std::string & name, std::string deprecatedName = "") const;

    /**
     * \brief Return all the children of the element.
     */
	const std::vector< std::pair<std::string, boost::shared_ptr<SerializerElement> > > & GetAllChildren() const { return children; };
    ///@}

	/**
	 * Hide any deprecated warning concerning how child and attributes are named.
	 * Useful when unserializing from an old file.
	 */
    void HideWarnings() { hideWarning = true; };

private:

	bool valueUndefined; ///< If true, the element does not have a value.
	SerializerValue elementValue;

	std::map< std::string, SerializerValue > attributes;
	std::vector< std::pair<std::string, boost::shared_ptr<SerializerElement> > > children;
	mutable std::string arrayOf;
	mutable std::string deprecatedArrayOf;
	bool hideWarning;
	static SerializerElement nullElement;
};

}

#endif