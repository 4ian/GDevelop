/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_SERIALIZERVALUE_H
#define GDCORE_SERIALIZERVALUE_H
#include <string>

namespace gd {

/**
 * \brief A value stored inside a gd::SerializerElement.
 *
 * \see gd::Serializer
 * \see gd::SerializerElement
 */
class SerializerValue
{
public:
	SerializerValue();
	virtual ~SerializerValue() {};

	/**
	 * Set the value, its type being a boolean.
	 */
	void SetBoolean(bool val);

	/**
	 * Set the value, its type being a std::string.
	 */
	void SetString(const std::string & val);

	/**
	 * Set the value, its type being an integer.
	 */
	void SetInt(int val);

	/**
	 * Set the value, its type being a double.
	 */
	void SetDouble(double val);

	/**
	 * Set the value, its type being unknown, but representable as a string.
	 */
	void Set(const std::string & val);

	/**
	 * Get the value, its type being a boolean.
	 */
	bool GetBoolean() const;

	/**
	 * Get the value, its type being a string.
	 */
	std::string GetString() const;

	/**
	 * Get the value, its type being an int.
	 */
	int GetInt() const;

	/**
	 * Get the value, its type being a double
	 */
	double GetDouble() const;

	/**
	 * \brief Return true if the value is a boolean.
	 */
	bool IsBoolean() const { return isBoolean; };
	/**
	 * \brief Return true if the value is a string.
	 */
	bool IsString() const { return isString; };
	/**
	 * \brief Return true if the value is an int.
	 */
	bool IsInt() const { return isInt; };
	/**
	 * \brief Return true if the value is a double.
	 */
	bool IsDouble() const { return isDouble; };

private:
	bool isUnknown; ///< If true, the type is unknown but the value is stored as a string in stringValue member.
	bool isBoolean;
	bool isString;
	bool isInt;
	bool isDouble;

	bool booleanValue;
	std::string stringValue;
	int intValue;
	double doubleValue;
};

}

#endif