/**

Game Develop - AES Extension
Copyright (c) 2008-2013 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDCpp/Tools/AES.h"
#include <iostream>
#include <fstream>
#include <string>

using namespace std;

namespace GDpriv
{

namespace AES
{

void GD_EXTENSION_API EncryptFile( const std::string & srcFile, const std::string & destFile, std::string passwordWith24characters )
{
    while ( passwordWith24characters.length() < 24 )
        passwordWith24characters += " ";
    if ( passwordWith24characters.length() > 24 )
        passwordWith24characters.resize(24);

    ifstream ifile(srcFile.c_str(),ios_base::binary);
    ofstream ofile(destFile.c_str(),ios_base::binary);

    // get file size
    ifile.seekg(0,ios_base::end);
    int size,fsize = ifile.tellg();
    ifile.seekg(0,ios_base::beg);

    // round up (ignore pad for here)
    size = (fsize+15)&(~15);

    char * ibuffer = new char[size];
    char * obuffer = new char[size];
    ifile.read(ibuffer,fsize);

    ::AES crypt;
    crypt.SetParameters(192);

    crypt.StartEncryption(reinterpret_cast<const unsigned char*>(passwordWith24characters.c_str()));
    crypt.Encrypt(reinterpret_cast<const unsigned char*>(ibuffer),reinterpret_cast<unsigned char*>(obuffer),size/16);

    ofile.write(obuffer,size);

    delete [] ibuffer;
    delete [] obuffer;

    ofile.close();
    ifile.close();
}

void GD_EXTENSION_API DecryptFile( const std::string & srcFile, const std::string & destFile, std::string passwordWith24characters )
{
    while ( passwordWith24characters.length() < 24 )
        passwordWith24characters += " ";
    if ( passwordWith24characters.length() > 24 )
        passwordWith24characters.resize(24);

    ifstream ifile(srcFile.c_str(),ios_base::binary);
    ofstream ofile(destFile.c_str(),ios_base::binary);

    // get file size
    ifile.seekg(0,ios_base::end);
    int size,fsize = ifile.tellg();
    ifile.seekg(0,ios_base::beg);

    // round up (ignore pad for here)
    size = (fsize+15)&(~15);

    char * ibuffer = new char[size];
    char * obuffer = new char[size];
    ifile.read(ibuffer,fsize);

    ::AES crypt;
    crypt.SetParameters(192);

    crypt.StartDecryption(reinterpret_cast<const unsigned char*>(passwordWith24characters.c_str()));
    crypt.Decrypt(reinterpret_cast<const unsigned char*>(ibuffer),reinterpret_cast<unsigned char*>(obuffer),size/16);

    ofile.write(obuffer,size);

    delete [] ibuffer;
    delete [] obuffer;

    ofile.close();
    ifile.close();
}

}
}

