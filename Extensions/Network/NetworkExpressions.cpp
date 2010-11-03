
#include "GDL/ExpressionInstruction.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
/*
std::string ExpEncrypt( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction )
{
    std::string str = exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned).c_str();

    // round up (ignore pad for here)
    int size = (str.length()+15)&(~15);
    while(str.length()<size)
        str += '\0';

    char * ibuffer = new char[size];
    char * obuffer = new char[size];
    *ibuffer = *str.c_str();

    Network crypt;
    crypt.SetParameters(192);

    crypt.StartEncryption(reinterpret_cast<const unsigned char*>(exprInstruction.parameters[1].GetAsTextExpressionResult(scene, objectsConcerned).c_str()));
    crypt.Encrypt(reinterpret_cast<const unsigned char*>(ibuffer),reinterpret_cast<unsigned char*>(obuffer),size/16);

    std::string output = obuffer;

    delete [] ibuffer;
    delete [] obuffer;

    return output;
}

std::string ExpDecrypt( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction )
{
    std::string str = exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned).c_str();

    // round up (ignore pad for here)
    int size = (str.length()+15)&(~15);
    while(str.length()<size)
        str += '\0';

    char * ibuffer = new char[size];
    char * obuffer = new char[size];
    *ibuffer = *str.c_str();

    Network crypt;
    crypt.SetParameters(192);

    crypt.StartEncryption(reinterpret_cast<const unsigned char*>(exprInstruction.parameters[1].GetAsTextExpressionResult(scene, objectsConcerned).c_str()));
    crypt.Decrypt(reinterpret_cast<const unsigned char*>(ibuffer),reinterpret_cast<unsigned char*>(obuffer),size/16);

    std::string output = obuffer;

    delete [] ibuffer;
    delete [] obuffer;

    return output;
}*/
