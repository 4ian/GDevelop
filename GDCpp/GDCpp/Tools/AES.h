/* The MIT License

   Copyright (C) 2011, 2012 Zilong Tan (eric.zltan@gmail.com)

   Permission is hereby granted, free of charge, to any person obtaining
   a copy of this software and associated documentation files (the
   "Software"), to deal in the Software without restriction, including
   without limitation the rights to use, copy, modify, merge, publish,
   distribute, sublicense, and/or sell copies of the Software, and to
   permit persons to whom the Software is furnished to do so, subject to
   the following conditions:

   The above copyright notice and this permission notice shall be
   included in all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
   BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
   ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE.
*/

/*
 * aes.h
 *
 * @version 3.0 (December 2000)
 *
 * Optimised ANSI C code for the Rijndael cipher (now AES)
 *
 * @author Vincent Rijmen <vincent.rijmen@esat.kuleuven.ac.be>
 * @author Antoon Bosselaers <antoon.bosselaers@esat.kuleuven.ac.be>
 * @author Paulo Barreto <paulo.barreto@terra.com.br>
 *
 * This code is hereby placed in the public domain.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHORS ''AS IS'' AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHORS OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#ifndef _ULIB_CRYPT_AES_H
#define _ULIB_CRYPT_AES_H

#include <stddef.h>
#include <stdint.h>

#define AES_MAXNR	 14
#define AES_BLOCK_SIZE	 16

typedef struct {
	uint32_t rd_key[4 * (AES_MAXNR + 1)];
	int rounds;
} aes_ks_t;

#ifdef __cplusplus
extern "C" {
#endif

/* AES key schedule functions. Inputs user key buffer and generates
 * key schedule for encryption/decryption. Valid kbits are 128, 192,
 * and 256. */
int GD_API aes_setks_encrypt(const uint8_t *keybuf, int kbits, aes_ks_t *ks);
int GD_API aes_setks_decrypt(const uint8_t *keybuf, int kbits, aes_ks_t *ks);

/* Core AES functions.
 * in and out are input and output buffers, which can be the same
 * (except for the aes_cbc_decrypt).
 * Use aes_setks_* to generate ks.
 */
void GD_API aes_ecb_encrypt(const uint8_t *in, uint8_t *out, const aes_ks_t *ks);
void GD_API aes_ecb_decrypt(const uint8_t *in, uint8_t *out, const aes_ks_t *ks);
void GD_API aes_cbc_encrypt(const uint8_t *in, uint8_t *out, uint8_t *iv,
		     size_t blks, const aes_ks_t *ks);
/* in and out can NOT be the same */
void GD_API aes_cbc_decrypt(const uint8_t *in, uint8_t *out, uint8_t *iv,
		     size_t blks, const aes_ks_t *ks);

#ifdef __cplusplus
}
#endif

#endif /* _ULIB_CRYPT_AES_H */