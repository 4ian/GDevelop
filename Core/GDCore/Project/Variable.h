/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_VARIABLE_H
#define GDCORE_VARIABLE_H
#include "GDCore/String.h"
#include <map>
namespace gd { class SerializerElement; }
class TiXmlElement;

namespace gd
{

/**
 * \brief Defines a variable which can be used by an object, a layout or a project.
 *
 * \see gd::VariablesContainer
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Variable
{
public:

    /**
     * \brief Default constructor creating a variable with 0 as value.
     */
    Variable() : value(0), isNumber(true), isStructure(false) {};
    virtual ~Variable() {};

    /** \name Number or string
     * Methods and operators used when the variable is considered as a number or a string.
     */
    ///@{

    /**
     * \brief Return the content of the variable, considered as a string.
     */
    const gd::String & GetString() const;

    /**
     * \brief Change the content of the variable, considered as a string.
     */
    void SetString(const gd::String & newStr)
    {
        str = newStr;
        isNumber = false;
        isStructure = false;
    }

    /**
     * \brief Return the content of the variable, considered as a number.
     */
    double GetValue() const;

    /**
     * \brief Change the content of the variable, considered as a number.
     */
    void SetValue(double val)
    {
        value = val;
        isNumber = true;
        isStructure = false;
    }

    //Operators are overloaded to allow accessing to variable using a simple int-like semantic.
    void operator=(double val)  {SetValue(val);};
    void operator+=(double val) {SetValue(val+GetValue());}
    void operator-=(double val) {SetValue(GetValue()-val);}
    void operator*=(double val) {SetValue(val*GetValue());}
    void operator/=(double val) {SetValue(GetValue()/val);}

    bool operator<=(double val) const { return GetValue() <= val;};
    bool operator>=(double val) const { return GetValue() >= val;};
    bool operator<(double val) const { return GetValue() < val;};
    bool operator>(double val) const { return GetValue() > val;};
    bool operator==(double val) const { return GetValue() == val;};
    bool operator!=(double val) const { return GetValue() != val;};

    //Operators are overloaded to allow accessing to variable using a simple string-like semantic.
    void operator=(const gd::String & val)  {SetString(val);};
    void operator+=(const gd::String & val) {SetString(GetString()+val);}

    bool operator==(const gd::String & val) const { return GetString() == val;};
    bool operator!=(const gd::String & val) const { return GetString() != val;};

    /**
     * \brief Return true if the variable is a number
     */
    bool IsNumber() const { return !isStructure && isNumber; }
    ///@}

    /** \name Structure
     * Methods used when the variable is considered as a structure.
     */
    ///@{

    /**
     * \brief Return true if the variable is a structure which can have children.
     */
    bool IsStructure() const { return isStructure; }

    /**
     * \brief Return true if the variable is a structure and has the specified child.
     */
    bool HasChild(const gd::String & name) const;

    /**
     * \brief Return the child with the specified name.
     *
     * If the variable has not the specified child, an empty variable with the specified name
     * is added as child.
     */
    Variable & GetChild(const gd::String & name);

    /**
     * \brief Return the child with the specified name.
     *
     * If the variable has not the specified child, an empty variable with the specified name
     * is added as child.
     */
    const Variable & GetChild(const gd::String & name) const;

    /**
     * \brief Remove the child with the specified name.
     *
     * If the variable is not a structure or has not
     * the specified child, nothing is done.
     */
    void RemoveChild(const gd::String & name);

    /**
     * \brief Rename the specified child.
     *
     * If the variable is not a structure or has not
     * the specified child, nothing is done.
     * \return true if the child was renamed, false otherwise.
     */
    bool RenameChild(const gd::String & oldName, const gd::String & newName);

    /**
     * \brief Remove all the children.
     *
     * If the variable is not a structure, nothing is done.
     */
    void ClearChildren();

    /**
     * \brief Get the map containing all the children.
     */
    const std::map<gd::String, Variable> & GetAllChildren() const { return children; }

    ///@}

    /** \name Serialization
     * Methods used when to load or save a variable to XML.
     */
    ///@{
    /**
     * Called to save the variable to a TiXmlElement.
     */
    void SaveToXml(TiXmlElement * element) const;

    /**
     * Called to load the variable from a TiXmlElement.
     */
    void LoadFromXml(const TiXmlElement * element);

    /**
     * \brief Serialize variable.
     */
    void SerializeTo(SerializerElement & element) const;

    /**
     * \brief Unserialize the variable.
     */
    void UnserializeFrom(const SerializerElement & element);
    ///@}


private:
    mutable double value;
    mutable gd::String str;
    mutable bool isNumber; ///< True if the type of the variable is a number.
    mutable bool isStructure; ///< False when the variable is a primitive ( i.e: Number or String ), true when it is a structure and has may have children.
    mutable std::map<gd::String, Variable> children; ///<Children, when the variable is considered as a structure.
};

}

#endif // GDCORE_VARIABLE_H
