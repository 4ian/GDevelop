/**

GDevelop - AES Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef AESACTIONS_H_INCLUDED
#define AESACTIONS_H_INCLUDED

#include "GDCpp/Runtime/String.h"

namespace GDpriv
{

namespace AES
{

void GD_EXTENSION_API EncryptFile( const gd::String & srcFile, const gd::String & destFile, gd::String passwordWith24characters );
void GD_EXTENSION_API DecryptFile( const gd::String & srcFile, const gd::String & destFile, gd::String passwordWith24characters );

}

}

#endif // AESACTIONS_H_INCLUDED
