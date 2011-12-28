/* AES - Advanced Encryption Standard

  source version 1.0, June, 2005

  Copyright (C) 2000-2005 Chris Lomont

  This software is provided 'as-is', without any express or implied
  warranty.  In no event will the author be held liable for any damages
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
  3. This notice may not be removed or altered from any source distribution.

  Chris Lomont
  chris@lomont.org

  The AES Standard is maintained by NIST
  http://csrc.nist.gov/publications/fips/fips197/fips-197.pdf

  This legalese is patterned after the zlib compression library
*/

// headed to implement Advanced Encryption Standard - Rijndael2
#ifndef _AES_H
#define _AES_H

/* USAGE:
	1. Create a AES class (or more as necessary)
	2. Call class method SetParameters
	3. To encrypt, call method StartEncryption with the key, and then
		call method Encrypt with enough space to store the proper size blocks.
	4. To decrypt, call method StartDecryption with the key, and then
		call method Decrypt with enough space to store the proper size blocks.

   Alternatively, you can call EncryptBlock and DecryptBlock block to process blocksize
   (default to 16 bytes) bytes at a time. It is recommended to use the Encrypt function
   for multiple block encryption since it uses chaining modes that make the overall
   stream much more secure than the default block based encryption, which by default would
   be mode ECB.

   EXAMPLE: want to encrypt 37 bytes of data with 192 bit key, which will use 3 16 byte blocks
   AES aes;
   aes.SetParameters(192);
   aes.StartEncryption(key);
   aes.Encrypt(data,output,3); // note data and output must be at least 48 bytes!
  */

// todo - replace all types with u1byte, u4byte, etc

class GD_API AES
	{
public:
	// the constructor - makes sure local things are initialized
	// it if fails, throws the string "Tables failed to initialize"
	AES(void);

	// multiple block encryption/decryption modes
	// See http://en.wikipedia.org/wiki/Block_cipher_modes_of_operation
	enum BlockMode {
		ECB = 0, // Electronic CodeBook	  - each block independent, weak
		CBC = 1  // Cipher Block Chaining - most secure
		// todo - CFB = 2, // Cipher FeedBack       - secure
		// todo - OFB = 3, // Output FeedBack		  - secure
		// todo - CTR = 4,  // Counter				  - allows midstream decryption, somewhat secure
		// todo - EAX = 5, - http://www.cs.berkeley.edu/~daw/papers/eprint-short-ae.pdf
		// todo - GCM = 6, - http://www.cryptobarn.com/papers/gcm-spec.pdf
		};

	// block and key size are in bits, legal values are 128, 192, and 256 independently.
	// NOTE: the AES standard only uses a blocksize of 128, so we default to that
	void SetParameters(int keylength, int blocklength = 128);

	// call this before any encryption with the key to use
	void StartEncryption(const unsigned char * key);
	// encrypt a single block (default 128 bits, or unsigned char[16]) of data
	void EncryptBlock(const unsigned char * datain, unsigned char * dataout);
	// Call this to encrypt any length data. Note the size is in BLOCKS, so you must
	// have enough space in datain and dataout to accomodate this. Pad your data before
	// calling, preferably using the padding methods listed below.
	// Decryption must use the same mode as the encryption.
	void Encrypt(const unsigned char * datain, unsigned char * dataout, unsigned long numBlocks, BlockMode mode = CBC);

	// call this before any decryption with the key to use
	void StartDecryption(const unsigned char * key);
	// decrypt a single block (default 128 bits, or unsigned char[16]) of data
	void DecryptBlock(const unsigned char * datain, unsigned char * dataout);
	// Call this to decrypt any length data. Note the size is in BLOCKS, so you must
	// have enough space in datain and dataout to accomodate this. Pad your data before
	// calling, preferably using the padding methods listed below. You must know the desired
	// length of the output data, since all the blocks are returned decrypted.
	// Encryption must use the same mode as the decryption.
	void Decrypt(const unsigned char * datain, unsigned char * dataout, unsigned long numBlocks, BlockMode mode = CBC);

private:

	int Nb,Nk;    // block and key length / 32, should be 4,6,or 8
	int Nr;       // number of rounds

	unsigned char W[4*8*15];   // the expanded key

	// Key expansion code - makes local copy
	void KeyExpansion(const unsigned char * key);

	}; // class AES


/* PADDING:
    The AES (Rijndael) encryption algorithm pads encrypted data to a multiple of 16 bytes by default.
	Other blocksizes are similar. Methods:
    1. RFC 1423 padding scheme:
	   Each padding byte is set to the number of padding bytes. If the data is already a multiple
	   of 16 bytes, 16 additional bytes are added, each having the value 0x10.
    2. FIPS81 (Federal Information Processing Standards 81):
	   The last byte contains the number of padding bytes, including itself,
	   and the other padding bytes are set to random values.
    3. Each padding byte is set to a random value. The decryptor must know how many bytes are in the original unencrypted data.
	*/

/* TODO
The Encrypt() function is used to encrypt larger blocks of data. The block size has to be a multiple of the method's block size.
This function can operate in the following modes: ECB, CBC or CFB. ECB mode is not using chaining. If the same block is encrypted
twice with the same key, the resulting ciphertext blocks are the same. In CBC mode, a ciphertext block is obtained by first XORing
the plaintext block with the previous ciphertext block, and encrypting the resulting value. In CFB mode, a ciphertext block is
obtained by encrypting the previous ciphertext block and XORing the resulting value with the plaintext. The operation mode is
specified in the iMode parameter with ECB being the default value.

*/

#endif //  _AES_H
// end - AES.h
