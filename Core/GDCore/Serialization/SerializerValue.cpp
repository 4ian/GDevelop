#include "GDCore/Serialization/SerializerValue.h"
#include "GDCore/CommonTools.h"


namespace gd {

SerializerValue::SerializerValue() :
	isUnknown(true),
	isBoolean(false),
	isString(false),
	isUtf8String(false),
	isInt(false),
	isDouble(false),
	booleanValue(false),
	intValue(0),
	doubleValue(0)
{
}

SerializerValue::SerializerValue(bool val) :
	isUnknown(true),
	isBoolean(false),
	isString(false),
	isUtf8String(false),
	isInt(false),
	isDouble(false),
	booleanValue(false),
	intValue(0),
	doubleValue(0)
{
	SetBool(val);
}
SerializerValue::SerializerValue(std::string val) :
	isUnknown(true),
	isBoolean(false),
	isString(false),
	isUtf8String(false),
	isInt(false),
	isDouble(false),
	booleanValue(false),
	intValue(0),
	doubleValue(0)
{
	SetString(val);
}
SerializerValue::SerializerValue(const gd::String &val) :
	isUnknown(true),
	isBoolean(false),
	isString(false),
	isUtf8String(false),
	isInt(false),
	isDouble(false),
	booleanValue(false),
	intValue(0),
	doubleValue(0)
{
	SetUtf8String(val);
}
SerializerValue::SerializerValue(int val) :
	isUnknown(true),
	isBoolean(false),
	isString(false),
	isUtf8String(false),
	isInt(false),
	isDouble(false),
	booleanValue(false),
	intValue(0),
	doubleValue(0)
{
	SetInt(val);
}
SerializerValue::SerializerValue(double val) :
	isUnknown(true),
	isBoolean(false),
	isString(false),
	isUtf8String(false),
	isInt(false),
	isDouble(false),
	booleanValue(false),
	intValue(0),
	doubleValue(0)
{
	SetDouble(val);
}

bool SerializerValue::GetBool() const
{
	if (isString || isUnknown)
		return stringValue != "false";
	else if (isInt)
		return intValue != 0;
	else if (isDouble)
		return doubleValue != 0.0;

	return booleanValue;
}

std::string SerializerValue::GetString() const
{
	if (isBoolean)
		return booleanValue ? "true" : "false";
	else if (isInt)
		return gd::ToString(intValue);
	else if (isDouble)
		return gd::ToString(doubleValue);

	return stringValue;
}

gd::String SerializerValue::GetUtf8String() const
{
	if (isBoolean)
		return booleanValue ? gd::String("true") : gd::String("false");
	else if (isInt)
		return gd::String::FromInt(intValue);
	else if (isDouble)
		return gd::String::FromDouble(doubleValue);

	return utf8StringValue;
}

int SerializerValue::GetInt() const
{
	if (isBoolean)
		return booleanValue ? 1 : 0;
	else if (isString || isUnknown)
		return gd::ToInt(stringValue);
	else if (isDouble)
		return doubleValue;

	return intValue;
}

double SerializerValue::GetDouble() const
{
	if (isBoolean)
		return booleanValue ? 1 : 0;
	else if (isString || isUnknown)
		return gd::ToDouble(stringValue);
	else if (isInt)
		return intValue;

	return doubleValue;
}


void SerializerValue::Set(const std::string & val)
{
	isUnknown = true;
	isBoolean = false;
	isString = false;
	isUtf8String = false;
	isInt = false;
	isDouble = false;

	stringValue = val;
}

void SerializerValue::SetBool(bool val)
{
	isUnknown = false;
	isBoolean = true;
	isString = false;
	isUtf8String = false;
	isInt = false;
	isDouble = false;

	booleanValue = val;
}

void SerializerValue::SetString(const std::string & val)
{
	isUnknown = false;
	isBoolean = false;
	isString = true;
	isUtf8String = false;
	isInt = false;
	isDouble = false;

	stringValue = val;
}

void SerializerValue::SetUtf8String(const gd::String & val)
{
	isUnknown = false;
	isBoolean = false;
	isString = false;
	isUtf8String = true;
	isInt = false;
	isDouble = false;

	utf8StringValue = val;
}

void SerializerValue::SetInt(int val)
{
	isUnknown = false;
	isBoolean = false;
	isString = false;
	isUtf8String = false;
	isInt = true;
	isDouble = false;

	intValue = val;
}

void SerializerValue::SetDouble(double val)
{
	isUnknown = false;
	isBoolean = false;
	isString = false;
	isUtf8String = false;
	isInt = false;
	isDouble = true;

	doubleValue = val;
}

}
