#include "GDL/AES.h"
#include "GDL/Access.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include <iostream>
#include <fstream>
#include <string>

bool ActEncryptFile( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    ifstream ifile(eval.EvalTxt(action.GetParameter(0)).c_str(),ios_base::binary);
    ofstream ofile(eval.EvalTxt(action.GetParameter(1)).c_str(),ios_base::binary);

    // get file size
    ifile.seekg(0,ios_base::end);
    int size,fsize = ifile.tellg();
    ifile.seekg(0,ios_base::beg);

    // round up (ignore pad for here)
    size = (fsize+15)&(~15);

    char * ibuffer = new char[size];
    char * obuffer = new char[size];
    ifile.read(ibuffer,fsize);

    AES crypt;
    crypt.SetParameters(192);

    crypt.StartEncryption(reinterpret_cast<const unsigned char*>(eval.EvalTxt(action.GetParameter(2)).c_str()));
    crypt.Encrypt(reinterpret_cast<const unsigned char*>(ibuffer),reinterpret_cast<unsigned char*>(obuffer),size/16);

    ofile.write(obuffer,size);

    delete [] ibuffer;
    delete [] obuffer;

    ofile.close();
    ifile.close();

    return true;
}

bool ActDecryptFile( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    ifstream ifile(eval.EvalTxt(action.GetParameter(0)).c_str(),ios_base::binary);
    ofstream ofile(eval.EvalTxt(action.GetParameter(1)).c_str(),ios_base::binary);

    // get file size
    ifile.seekg(0,ios_base::end);
    int size,fsize = ifile.tellg();
    ifile.seekg(0,ios_base::beg);

    // round up (ignore pad for here)
    size = (fsize+15)&(~15);

    char * ibuffer = new char[size];
    char * obuffer = new char[size];
    ifile.read(ibuffer,fsize);

    AES crypt;
    crypt.SetParameters(192);

    crypt.StartDecryption(reinterpret_cast<const unsigned char*>(eval.EvalTxt(action.GetParameter(2)).c_str()));
    crypt.Decrypt(reinterpret_cast<const unsigned char*>(ibuffer),reinterpret_cast<unsigned char*>(obuffer),size/16);

    ofile.write(obuffer,size);

    delete [] ibuffer;
    delete [] obuffer;

    ofile.close();
    ifile.close();

    return true;
}
