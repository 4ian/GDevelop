/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

 /**
 * @file Experimental macros for accelerating saving and loading function creation with TinyXml.
 */

#ifndef XMLMACROS_H_INCLUDED
#define XMLMACROS_H_INCLUDED

#define GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE(name_, value_) elem->SetAttribute( name_, value_ );
#define GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT(name_, value_) elem->SetDoubleAttribute( name_, value_ );
#define GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_DOUBLE(name_, value_) elem->SetDoubleAttribute( name_, value_ );
#define GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING(name_, value_) elem->SetAttribute( name_, value_.c_str() );
#define GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL(name_, value_) if ( value_ ) elem->SetAttribute( name_, "true" ); else elem->SetAttribute( name_, "false" )

#define GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT(name_, variable_) if ( elem->Attribute( name_ )  != NULL ) elem->QueryIntAttribute( name_, &variable_ );
#define GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT(name_, variable_) if ( elem->Attribute( name_ )  != NULL ) elem->QueryFloatAttribute( name_, &variable_ );
#define GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_DOUBLE(name_, variable_) if ( elem->Attribute( name_ )  != NULL ) elem->QueryDoubleAttribute( name_, &variable_ );
#define GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING(name_, variable_) if ( elem->Attribute( name_ )  != NULL ) variable_ = elem->Attribute( name_ );
#define GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL(name_, variable_) if ( elem->Attribute( name_ )  != NULL && strcmp( elem->Attribute( name_ ), "false" ) == 0 ) variable_ = false; else variable_ = true;

#define GD_CURRENT_ELEMENT_GET_ATTRIBUTE_INT(name_, variable_) if ( elem->Attribute( name_ )  != NULL ) elem->QueryIntAttribute( name_, &variable_ );
#define GD_CURRENT_ELEMENT_GET_ATTRIBUTE_FLOAT(name_, variable_) if ( elem->Attribute( name_ )  != NULL ) elem->QueryFloatAttribute( name_, &variable_ );
#define GD_CURRENT_ELEMENT_GET_ATTRIBUTE_DOUBLE(name_, variable_) if ( elem->Attribute( name_ )  != NULL ) elem->QueryDoubleAttribute( name_, &variable_ );
#define GD_CURRENT_ELEMENT_GET_ATTRIBUTE_STRING(name_, variable_) if ( elem->Attribute( name_ )  != NULL ) variable_ = elem->Attribute( name_ );
#define GD_CURRENT_ELEMENT_GET_ATTRIBUTE_BOOL(name_, variable_) if ( elem->Attribute( name_ )  != NULL && strcmp( elem->Attribute( name_ ), "false" ) == 0 ) variable_ = false; else variable_ = true;

#endif // XMLMACROS_H_INCLUDED

