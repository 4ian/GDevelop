/***************************************************************************/
/*                                                                         */
/*  svttglyf.h                                                             */
/*                                                                         */
/*    The FreeType TrueType glyph service.                                 */
/*                                                                         */
/*  Copyright 2007 by David Turner.                                        */
/*                                                                         */
/*  This file is part of the FreeType project, and may only be used,       */
/*  modified, and distributed under the terms of the FreeType project      */
/*  license, LICENSE.TXT.  By continuing to use, modify, or distribute     */
/*  this file you indicate that you have read the license and              */
/*  understand and accept it fully.                                        */
/*                                                                         */
/***************************************************************************/

#ifndef __SVTTGLYF_H__
#define __SVTTGLYF_H__

#include FT_INTERNAL_SERVICE_H
#include FT_TRUETYPE_TABLES_H


FT_BEGIN_HEADER


#define FT_SERVICE_ID_TT_GLYF "tt-glyf"


  typedef FT_ULong
  (*TT_Glyf_GetLocationFunc)( FT_Face    face,
                              FT_UInt    gindex,
                              FT_ULong  *psize );

  FT_DEFINE_SERVICE( TTGlyf )
  {
    TT_Glyf_GetLocationFunc  get_location;
  };

  /* */


FT_END_HEADER

#endif /* __SVTTGLYF_H__ */


/* END */
