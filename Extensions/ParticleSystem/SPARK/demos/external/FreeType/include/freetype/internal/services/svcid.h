/***************************************************************************/
/*                                                                         */
/*  svcid.h                                                                */
/*                                                                         */
/*    The FreeType CID font services (specification).                      */
/*                                                                         */
/*  Copyright 2007 by Derek Clegg.                                         */
/*                                                                         */
/*  This file is part of the FreeType project, and may only be used,       */
/*  modified, and distributed under the terms of the FreeType project      */
/*  license, LICENSE.TXT.  By continuing to use, modify, or distribute     */
/*  this file you indicate that you have read the license and              */
/*  understand and accept it fully.                                        */
/*                                                                         */
/***************************************************************************/


#ifndef __SVCID_H__
#define __SVCID_H__

#include FT_INTERNAL_SERVICE_H


FT_BEGIN_HEADER


#define FT_SERVICE_ID_CID  "CID"

  typedef FT_Error
  (*FT_CID_GetRegistryOrderingSupplementFunc)( FT_Face       face,
                                               const char*  *registry,
                                               const char*  *ordering,
                                               FT_Int       *supplement );

  FT_DEFINE_SERVICE( CID )
  {
    FT_CID_GetRegistryOrderingSupplementFunc  get_ros;
  };

  /* */


FT_END_HEADER


#endif /* __SVCID_H__ */


/* END */
