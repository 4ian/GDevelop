/**

GDevelop - AES Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef AESACTIONS_H_INCLUDED
#define AESACTIONS_H_INCLUDED
#include <string>

namespace GDpriv
{

namespace AES
{

void GD_EXTENSION_API EncryptFile( const std::string & srcFile, const std::string & destFile, std::string passwordWith24characters );
void GD_EXTENSION_API DecryptFile( const std::string & srcFile, const std::string & destFile, std::string passwordWith24characters );

}

}

#endif // AESACTIONS_H_INCLUDED

