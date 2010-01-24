#include <iostream>
#include <string.h>
#include <string>
#include <vector>

using namespace std;

void rc4(unsigned char * ByteInput, unsigned char * pwd,
		   unsigned char * &ByteOutput){
	unsigned char * temp;
	int i,j=0,t,tmp,tmp2,s[256], k[256];
	for (tmp=0;tmp<256;tmp++){
		s[tmp]=tmp;
		k[tmp]=pwd[(tmp % strlen((char *)pwd))];
	}
		for (i=0;i<256;i++){
		j = (j + s[i] + k[i]) % 256;
		tmp=s[i];
		s[i]=s[j];
		s[j]=tmp;
	}
temp = new unsigned char [ (int)strlen((char *)ByteInput)  + 1 ] ;
	i=j=0;
	for (tmp=0;tmp<(int)strlen((char *)ByteInput);tmp++){
	    i = (i + 1) % 256;
        j = (j + s[i]) % 256;
		tmp2=s[i];
		s[i]=s[j];
		s[j]=tmp2;
        t = (s[i] + s[j]) % 256;
if (s[t]==ByteInput[tmp])
	temp[tmp]=ByteInput[tmp];
else
	temp[tmp]=s[t]^ByteInput[tmp];
	}
temp[tmp]='\0';
ByteOutput=temp;
}
