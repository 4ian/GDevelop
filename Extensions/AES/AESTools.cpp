/**

Game Develop - AES Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

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

    aes_ks_t keySetting;
    aes_setks_encrypt(reinterpret_cast<const unsigned char*>(passwordWith24characters.c_str()), 192, &keySetting);
    const unsigned char iv[16] = { 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F };
    aes_cbc_encrypt(reinterpret_cast<const unsigned char*>(ibuffer), reinterpret_cast<unsigned char*>(obuffer), 
        (uint8_t*)iv, size/AES_BLOCK_SIZE, &keySetting);

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

    aes_ks_t keySetting;
    aes_setks_decrypt(reinterpret_cast<const unsigned char*>(passwordWith24characters.c_str()), 192, &keySetting);
    const unsigned char iv[16] = { 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F };
    aes_cbc_decrypt(reinterpret_cast<const unsigned char*>(ibuffer), reinterpret_cast<unsigned char*>(obuffer), 
        (uint8_t*)iv, size/AES_BLOCK_SIZE, &keySetting);

    ofile.write(obuffer,size);

    delete [] ibuffer;
    delete [] obuffer;

    ofile.close();
    ifile.close();
}

}
}

