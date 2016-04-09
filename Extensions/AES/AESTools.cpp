/**

GDevelop - AES Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "AESTools.h"

#include "GDCpp/Runtime/Tools/AES.h"
#include <iostream>
#include <fstream>
#include <string>

using namespace std;

namespace GDpriv
{

namespace AES
{

void GD_EXTENSION_API EncryptFile( const gd::String & srcFile, const gd::String & destFile, gd::String passwordWith24characters )
{
    while ( passwordWith24characters.Raw().length() < 24 ) //Test the real size as bytes
        passwordWith24characters += " ";
    if ( passwordWith24characters.Raw().length() > 24 )
        passwordWith24characters.Raw().resize(24);

    ifstream ifile(srcFile.ToLocale().c_str(),ios_base::binary);
    ofstream ofile(destFile.ToLocale().c_str(),ios_base::binary);

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

void GD_EXTENSION_API DecryptFile( const gd::String & srcFile, const gd::String & destFile, gd::String passwordWith24characters )
{
    while ( passwordWith24characters.Raw().length() < 24 ) //Test the real size as bytes
        passwordWith24characters += " ";
    if ( passwordWith24characters.Raw().length() > 24 )
        passwordWith24characters.Raw().resize(24);

    ifstream ifile(srcFile.ToLocale().c_str(),ios_base::binary);
    ofstream ofile(destFile.ToLocale().c_str(),ios_base::binary);

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
