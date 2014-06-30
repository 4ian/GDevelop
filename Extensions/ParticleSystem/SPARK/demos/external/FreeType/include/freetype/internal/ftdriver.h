/***************************************************************************/
/*                                                                         */
/*  ftdriver.h                                                             */
/*                                                                         */
/*    FreeType font driver interface (specification).                      */
/*                                                                         */
/*  Copyright 1996-2001, 2002, 2003, 2006, 2008 by                         */
/*  David Turner, Robert Wilhelm, and Werner Lemberg.                      */
/*                                                                         */
/*  This file is part of the FreeType project, and may only be used,       */
/*  modified, and distributed under the terms of the FreeType project      */
/*  license, LICENSE.TXT.  By continuing to use, modify, or distribute     */
/*  this file you indicate that you have read the license and              */
/*  understand and accept it fully.                                        */
/*                                                                         */
/***************************************************************************/


#ifndef __FTDRIVER_H__
#define __FTDRIVER_H__


#include <ft2build.h>
#include FT_MODULE_H


FT_BEGIN_HEADER


  typedef FT_Error
  (*FT_Face_InitFunc)( FT_Stream      stream,
                       FT_Face        face,
                       FT_Int         typeface_index,
                       FT_Int         num_params,
                       FT_Parameter*  parameters );

  typedef void
  (*FT_Face_DoneFunc)( FT_Face  face );


  typedef FT_Error
  (*FT_Size_InitFunc)( FT_Size  size );

  typedef void
  (*FT_Size_DoneFunc)( FT_Size  size );


  typedef FT_Error
  (*FT_Slot_InitFunc)( FT_GlyphSlot  slot );

  typedef void
  (*FT_Slot_DoneFunc)( FT_GlyphSlot  slot );


  typedef FT_Error
  (*FT_Size_RequestFunc)( FT_Size          size,
                          FT_Size_Request  req );

  typedef FT_Error
  (*FT_Size_SelectFunc)( FT_Size   size,
                         FT_ULong  size_index );

#ifdef FT_CONFIG_OPTION_OLD_INTERNALS

  typedef FT_Error
  (*FT_Size_ResetPointsFunc)( FT_Size     size,
                              FT_F26Dot6  char_width,
                              FT_F26Dot6  char_height,
                              FT_UInt     horz_resolution,
                              FT_UInt     vert_resolution );

  typedef FT_Error
  (*FT_Size_ResetPixelsFunc)( FT_Size  size,
                              FT_UInt  pixel_width,
                              FT_UInt  pixel_height );

#endif /* FT_CONFIG_OPTION_OLD_INTERNALS */

  typedef FT_Error
  (*FT_Slot_LoadFunc)( FT_GlyphSlot  slot,
                       FT_Size       size,
                       FT_UInt       glyph_index,
                       FT_Int32      load_flags );


  typedef FT_UInt
  (*FT_CharMap_CharIndexFunc)( FT_CharMap  charmap,
                               FT_Long     charcode );

  typedef FT_Long
  (*FT_CharMap_CharNextFunc)( FT_CharMap  charmap,
                              FT_Long     charcode );

  typedef FT_Error
  (*FT_Face_GetKerningFunc)( FT_Face     face,
                             FT_UInt     left_glyph,
                             FT_UInt     right_glyph,
                             FT_Vector*  kerning );


  typedef FT_Error
  (*FT_Face_AttachFunc)( FT_Face    face,
                         FT_Stream  stream );


  typedef FT_Error
  (*FT_Face_GetAdvancesFunc)( FT_Face     face,
                              FT_UInt     first,
                              FT_UInt     count,
                              FT_Bool     vertical,
                              FT_UShort*  advances );


  /*************************************************************************/
  /*                                                                       */
  /* <Struct>                                                              */
  /*    FT_Driver_ClassRec                                                 */
  /*                                                                       */
  /* <Description>                                                         */
  /*    The font driver class.  This structure mostly contains pointers to */
  /*    driver methods.                                                    */
  /*                                                                       */
  /* <Fields>                                                              */
  /*    root             :: The parent module.                             */
  /*                                                                       */
  /*    face_object_size :: The size of a face object in bytes.            */
  /*                                                                       */
  /*    size_object_size :: The size of a size object in bytes.            */
  /*                                                                       */
  /*    slot_object_size :: The size of a glyph object in bytes.           */
  /*                                                                       */
  /*    init_face        :: The format-specific face constructor.          */
  /*                                                                       */
  /*    done_face        :: The format-specific face destructor.           */
  /*                                                                       */
  /*    init_size        :: The format-specific size constructor.          */
  /*                                                                       */
  /*    done_size        :: The format-specific size destructor.           */
  /*                                                                       */
  /*    init_slot        :: The format-specific slot constructor.          */
  /*                                                                       */
  /*    done_slot        :: The format-specific slot destructor.           */
  /*                                                                       */
  /*                                                                       */
  /*    load_glyph       :: A function handle to load a glyph to a slot.   */
  /*                        This field is mandatory!                       */
  /*                                                                       */
  /*    get_kerning      :: A function handle to return the unscaled       */
  /*                        kerning for a given pair of glyphs.  Can be    */
  /*                        set to 0 if the format doesn't support         */
  /*                        kerning.                                       */
  /*                                                                       */
  /*    attach_file      :: This function handle is used to read           */
  /*                        additional data for a face from another        */
  /*                        file/stream.  For example, this can be used to */
  /*                        add data from AFM or PFM files on a Type 1     */
  /*                        face, or a CIDMap on a CID-keyed face.         */
  /*                                                                       */
  /*    get_advances     :: A function handle used to return advance       */
  /*                        widths of `count' glyphs (in font units),      */
  /*                        starting at `first'.  The `vertical' flag must */
  /*                        be set to get vertical advance heights.  The   */
  /*                        `advances' buffer is caller-allocated.         */
  /*                        Currently not implemented.  The idea of this   */
  /*                        function is to be able to perform              */
  /*                        device-independent text layout without loading */
  /*                        a single glyph image.                          */
  /*                                                                       */
  /*    request_size     :: A handle to a function used to request the new */
  /*                        character size.  Can be set to 0 if the        */
  /*                        scaling done in the base layer suffices.       */
  /*                                                                       */
  /*    select_size      :: A handle to a function used to select a new    */
  /*                        fixed size.  It is used only if                */
  /*                        @FT_FACE_FLAG_FIXED_SIZES is set.  Can be set  */
  /*                        to 0 if the scaling done in the base layer     */
  /*                        suffices.                                      */
  /* <Note>                                                                */
  /*    Most function pointers, with the exception of `load_glyph', can be */
  /*    set to 0 to indicate a default behaviour.                          */
  /*                                                                       */
  typedef struct  FT_Driver_ClassRec_
  {
    FT_Module_Class           root;

    FT_Long                   face_object_size;
    FT_Long                   size_object_size;
    FT_Long                   slot_object_size;

    FT_Face_InitFunc          init_face;
    FT_Face_DoneFunc          done_face;

    FT_Size_InitFunc          init_size;
    FT_Size_DoneFunc          done_size;

    FT_Slot_InitFunc          init_slot;
    FT_Slot_DoneFunc          done_slot;

#ifdef FT_CONFIG_OPTION_OLD_INTERNALS

    FT_Size_ResetPointsFunc   set_char_sizes;
    FT_Size_ResetPixelsFunc   set_pixel_sizes;

#endif /* FT_CONFIG_OPTION_OLD_INTERNALS */

    FT_Slot_LoadFunc          load_glyph;

    FT_Face_GetKerningFunc    get_kerning;
    FT_Face_AttachFunc        attach_file;
    FT_Face_GetAdvancesFunc   get_advances;

    /* since version 2.2 */
    FT_Size_RequestFunc       request_size;
    FT_Size_SelectFunc        select_size;

  } FT_Driver_ClassRec, *FT_Driver_Class;


  /*
   *  The following functions are used as stubs for `set_char_sizes' and
   *  `set_pixel_sizes'; the code uses `request_size' and `select_size'
   *  functions instead.
   *
   *  Implementation is in `src/base/ftobjs.c'.
   */
#ifdef FT_CONFIG_OPTION_OLD_INTERNALS

  FT_BASE( FT_Error )
  ft_stub_set_char_sizes( FT_Size     size,
                          FT_F26Dot6  width,
                          FT_F26Dot6  height,
                          FT_UInt     horz_res,
                          FT_UInt     vert_res );

  FT_BASE( FT_Error )
  ft_stub_set_pixel_sizes( FT_Size  size,
                           FT_UInt  width,
                           FT_UInt  height );

#endif /* FT_CONFIG_OPTION_OLD_INTERNALS */


FT_END_HEADER

#endif /* __FTDRIVER_H__ */


/* END */
