#ifndef GDCORE_PROPERTYDESCRIPTOR
#define GDCORE_PROPERTYDESCRIPTOR

#include <string>
#include <vector>

namespace gd
{

/**
 * \brief Used to describe a property shown in a property grid.
 * \see gd::InitialInstancesPropgridHelper
 * \see gd::ObjectsPropgridHelper
 * \see gd::Object
 */
class GD_CORE_API PropertyDescriptor
{
public:
	/**
	 * \brief Create a property being a simple string with the specified value.
	 * \param propertyValue The value of the property.
	 */
	PropertyDescriptor(std::string propertyValue) :
		currentValue(propertyValue),
		type("string")
	{
	}

	/**
	 * \brief Empty constructor creating an empty property to be displayed.
	 */
	PropertyDescriptor() {};

	/**
	 * \brief Destructor
	 */
	virtual ~PropertyDescriptor();

	/**
	 * \brief Change the value displayed in the property grid
	 */
	PropertyDescriptor & SetValue(std::string value) { currentValue = value; return *this; }

	/**
	 * \brief Change the type of the value displayed in the property grid.
	 * \note The type is arbitrary and is interpreted by the class updating the property grid: Refer to it
	 * or to the documentation of the class which is returning the PropertyDescriptor to learn
	 * more about valid values for the type.
	 */
	PropertyDescriptor & SetType(std::string type_) { type = type_; return *this; }

	/**
	 * \brief Add an information about the property.
	 * \note The information are arbitrary and are interpreted by the class updating the property grid: Refer to it
	 * or to the documentation of the class which is returning the PropertyDescriptor to learn
	 * more about valid values for the extra information.
	 */
	PropertyDescriptor & AddExtraInfo(const std::string & info) { extraInformation.push_back(info); return *this; }

	const std::string & GetValue() const { return currentValue; }
	const std::string & GetType() const { return type; }
	const std::vector<std::string> & GetExtraInfo() const { return extraInformation; }

private:
	std::string currentValue; ///< The current value to be shown.
	std::string type; ///< The type of the property. This is arbitrary and interpreted by the class responsible for updating the property grid.
	std::vector<std::string> extraInformation; ///< Can be used to store for example the available choices, if a property is a displayed as a combo box.
};

}

#endif