/*
    SDL - Simple DirectMedia Layer
    Copyright (C) 1997-2006 Sam Lantinga

    This library is free software; you can redistribute it and/or
    modify it under the terms of the GNU Lesser General Public
    License as published by the Free Software Foundation; either
    version 2.1 of the License, or (at your option) any later version.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with this library; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

    Sam Lantinga
    slouken@libsdl.org
*/

/* This is a simple file to encapsulate the OpenGL API headers */

#include "SDL_config.h"

#ifdef __WIN32__
#define WIN32_LEAN_AND_MEAN
#ifndef NOMINMAX
#define NOMINMAX	/* Don't defined min() and max() */
#endif
#include <windows.h>
#endif
#ifndef NO_SDL_GLEXT
#define __glext_h_  /* Don't let gl.h include glext.h */
#endif
#if defined(__MACOSX__)
#include <OpenGL/gl.h>	/* Header File For The OpenGL Library */
#include <OpenGL/glu.h>	/* Header File For The GLU Library */
#elif defined(__MACOS__)
#include <gl.h>		/* Header File For The OpenGL Library */
#include <glu.h>	/* Header File For The GLU Library */
#else
#include <GL/gl.h>	/* Header File For The OpenGL Library */
#include <GL/glu.h>	/* Header File For The GLU Library */
#endif
#ifndef NO_SDL_GLEXT
#undef __glext_h_
#endif

/* This file taken from "GLext.h" from the Jeff Molofee OpenGL tutorials.
   It is included here because glext.h is not available on some systems.
   If you don't want this version included, simply define "NO_SDL_GLEXT"
 */
#ifndef NO_SDL_GLEXT
#if !defined(__glext_h_) && !defined(GL_GLEXT_LEGACY)
#define __glext_h_

#ifdef __cplusplus
extern "C" {
#endif

/*
** License Applicability. Except to the extent portions of this file are
** made subject to an alternative license as permitted in the SGI Free
** Software License B, Version 1.1 (the "License"), the contents of this
** file are subject only to the provisions of the License. You may not use
** this file except in compliance with the License. You may obtain a copy
** of the License at Silicon Graphics, Inc., attn: Legal Services, 1600
** Amphitheatre Parkway, Mountain View, CA 94043-1351, or at:
** 
** http://oss.sgi.com/projects/FreeB
** 
** Note that, as provided in the License, the Software is distributed on an
** "AS IS" basis, with ALL EXPRESS AND IMPLIED WARRANTIES AND CONDITIONS
** DISCLAIMED, INCLUDING, WITHOUT LIMITATION, ANY IMPLIED WARRANTIES AND
** CONDITIONS OF MERCHANTABILITY, SATISFACTORY QUALITY, FITNESS FOR A
** PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
** 
** Original Code. The Original Code is: OpenGL Sample Implementation,
** Version 1.2.1, released January 26, 2000, developed by Silicon Graphics,
** Inc. The Original Code is Copyright (c) 1991-2004 Silicon Graphics, Inc.
** Copyright in any portions created by third parties is as indicated
** elsewhere herein. All Rights Reserved.
** 
** Additional Notice Provisions: This software was created using the
** OpenGL(R) version 1.2.1 Sample Implementation published by SGI, but has
** not been independently verified as being compliant with the OpenGL(R)
** version 1.2.1 Specification.
*/

#if defined(_WIN32) && !defined(APIENTRY) && !defined(__CYGWIN__) && !defined(__SCITECH_SNAP__)
#define WIN32_LEAN_AND_MEAN 1
#include <windows.h>
#endif

#ifndef APIENTRY
#define APIENTRY
#endif
#ifndef APIENTRYP
#define APIENTRYP APIENTRY *
#endif
#ifndef GLAPI
#define GLAPI extern
#endif

/*************************************************************/

/* Header file version number, required by OpenGL ABI for Linux */
/* glext.h last updated 2005/06/20 */
/* Current version at http://oss.sgi.com/projects/ogl-sample/registry/ */
#define GL_GLEXT_VERSION 29

#ifndef GL_VERSION_1_2
#define GL_UNSIGNED_BYTE_3_3_2            0x8032
#define GL_UNSIGNED_SHORT_4_4_4_4         0x8033
#define GL_UNSIGNED_SHORT_5_5_5_1         0x8034
#define GL_UNSIGNED_INT_8_8_8_8           0x8035
#define GL_UNSIGNED_INT_10_10_10_2        0x8036
#define GL_RESCALE_NORMAL                 0x803A
#define GL_TEXTURE_BINDING_3D             0x806A
#define GL_PACK_SKIP_IMAGES               0x806B
#define GL_PACK_IMAGE_HEIGHT              0x806C
#define GL_UNPACK_SKIP_IMAGES             0x806D
#define GL_UNPACK_IMAGE_HEIGHT            0x806E
#define GL_TEXTURE_3D                     0x806F
#define GL_PROXY_TEXTURE_3D               0x8070
#define GL_TEXTURE_DEPTH                  0x8071
#define GL_TEXTURE_WRAP_R                 0x8072
#define GL_MAX_3D_TEXTURE_SIZE            0x8073
#define GL_UNSIGNED_BYTE_2_3_3_REV        0x8362
#define GL_UNSIGNED_SHORT_5_6_5           0x8363
#define GL_UNSIGNED_SHORT_5_6_5_REV       0x8364
#define GL_UNSIGNED_SHORT_4_4_4_4_REV     0x8365
#define GL_UNSIGNED_SHORT_1_5_5_5_REV     0x8366
#define GL_UNSIGNED_INT_8_8_8_8_REV       0x8367
#define GL_UNSIGNED_INT_2_10_10_10_REV    0x8368
#define GL_BGR                            0x80E0
#define GL_BGRA                           0x80E1
#define GL_MAX_ELEMENTS_VERTICES          0x80E8
#define GL_MAX_ELEMENTS_INDICES           0x80E9
#define GL_CLAMP_TO_EDGE                  0x812F
#define GL_TEXTURE_MIN_LOD                0x813A
#define GL_TEXTURE_MAX_LOD                0x813B
#define GL_TEXTURE_BASE_LEVEL             0x813C
#define GL_TEXTURE_MAX_LEVEL              0x813D
#define GL_LIGHT_MODEL_COLOR_CONTROL      0x81F8
#define GL_SINGLE_COLOR                   0x81F9
#define GL_SEPARATE_SPECULAR_COLOR        0x81FA
#define GL_SMOOTH_POINT_SIZE_RANGE        0x0B12
#define GL_SMOOTH_POINT_SIZE_GRANULARITY  0x0B13
#define GL_SMOOTH_LINE_WIDTH_RANGE        0x0B22
#define GL_SMOOTH_LINE_WIDTH_GRANULARITY  0x0B23
#define GL_ALIASED_POINT_SIZE_RANGE       0x846D
#define GL_ALIASED_LINE_WIDTH_RANGE       0x846E
#endif

#ifndef GL_ARB_imaging
#define GL_CONSTANT_COLOR                 0x8001
#define GL_ONE_MINUS_CONSTANT_COLOR       0x8002
#define GL_CONSTANT_ALPHA                 0x8003
#define GL_ONE_MINUS_CONSTANT_ALPHA       0x8004
#define GL_BLEND_COLOR                    0x8005
#define GL_FUNC_ADD                       0x8006
#define GL_MIN                            0x8007
#define GL_MAX                            0x8008
#define GL_BLEND_EQUATION                 0x8009
#define GL_FUNC_SUBTRACT                  0x800A
#define GL_FUNC_REVERSE_SUBTRACT          0x800B
#define GL_CONVOLUTION_1D                 0x8010
#define GL_CONVOLUTION_2D                 0x8011
#define GL_SEPARABLE_2D                   0x8012
#define GL_CONVOLUTION_BORDER_MODE        0x8013
#define GL_CONVOLUTION_FILTER_SCALE       0x8014
#define GL_CONVOLUTION_FILTER_BIAS        0x8015
#define GL_REDUCE                         0x8016
#define GL_CONVOLUTION_FORMAT             0x8017
#define GL_CONVOLUTION_WIDTH              0x8018
#define GL_CONVOLUTION_HEIGHT             0x8019
#define GL_MAX_CONVOLUTION_WIDTH          0x801A
#define GL_MAX_CONVOLUTION_HEIGHT         0x801B
#define GL_POST_CONVOLUTION_RED_SCALE     0x801C
#define GL_POST_CONVOLUTION_GREEN_SCALE   0x801D
#define GL_POST_CONVOLUTION_BLUE_SCALE    0x801E
#define GL_POST_CONVOLUTION_ALPHA_SCALE   0x801F
#define GL_POST_CONVOLUTION_RED_BIAS      0x8020
#define GL_POST_CONVOLUTION_GREEN_BIAS    0x8021
#define GL_POST_CONVOLUTION_BLUE_BIAS     0x8022
#define GL_POST_CONVOLUTION_ALPHA_BIAS    0x8023
#define GL_HISTOGRAM                      0x8024
#define GL_PROXY_HISTOGRAM                0x8025
#define GL_HISTOGRAM_WIDTH                0x8026
#define GL_HISTOGRAM_FORMAT               0x8027
#define GL_HISTOGRAM_RED_SIZE             0x8028
#define GL_HISTOGRAM_GREEN_SIZE           0x8029
#define GL_HISTOGRAM_BLUE_SIZE            0x802A
#define GL_HISTOGRAM_ALPHA_SIZE           0x802B
#define GL_HISTOGRAM_LUMINANCE_SIZE       0x802C
#define GL_HISTOGRAM_SINK                 0x802D
#define GL_MINMAX                         0x802E
#define GL_MINMAX_FORMAT                  0x802F
#define GL_MINMAX_SINK                    0x8030
#define GL_TABLE_TOO_LARGE                0x8031
#define GL_COLOR_MATRIX                   0x80B1
#define GL_COLOR_MATRIX_STACK_DEPTH       0x80B2
#define GL_MAX_COLOR_MATRIX_STACK_DEPTH   0x80B3
#define GL_POST_COLOR_MATRIX_RED_SCALE    0x80B4
#define GL_POST_COLOR_MATRIX_GREEN_SCALE  0x80B5
#define GL_POST_COLOR_MATRIX_BLUE_SCALE   0x80B6
#define GL_POST_COLOR_MATRIX_ALPHA_SCALE  0x80B7
#define GL_POST_COLOR_MATRIX_RED_BIAS     0x80B8
#define GL_POST_COLOR_MATRIX_GREEN_BIAS   0x80B9
#define GL_POST_COLOR_MATRIX_BLUE_BIAS    0x80BA
#define GL_POST_COLOR_MATRIX_ALPHA_BIAS   0x80BB
#define GL_COLOR_TABLE                    0x80D0
#define GL_POST_CONVOLUTION_COLOR_TABLE   0x80D1
#define GL_POST_COLOR_MATRIX_COLOR_TABLE  0x80D2
#define GL_PROXY_COLOR_TABLE              0x80D3
#define GL_PROXY_POST_CONVOLUTION_COLOR_TABLE 0x80D4
#define GL_PROXY_POST_COLOR_MATRIX_COLOR_TABLE 0x80D5
#define GL_COLOR_TABLE_SCALE              0x80D6
#define GL_COLOR_TABLE_BIAS               0x80D7
#define GL_COLOR_TABLE_FORMAT             0x80D8
#define GL_COLOR_TABLE_WIDTH              0x80D9
#define GL_COLOR_TABLE_RED_SIZE           0x80DA
#define GL_COLOR_TABLE_GREEN_SIZE         0x80DB
#define GL_COLOR_TABLE_BLUE_SIZE          0x80DC
#define GL_COLOR_TABLE_ALPHA_SIZE         0x80DD
#define GL_COLOR_TABLE_LUMINANCE_SIZE     0x80DE
#define GL_COLOR_TABLE_INTENSITY_SIZE     0x80DF
#define GL_CONSTANT_BORDER                0x8151
#define GL_REPLICATE_BORDER               0x8153
#define GL_CONVOLUTION_BORDER_COLOR       0x8154
#endif

#ifndef GL_VERSION_1_3
#define GL_TEXTURE0                       0x84C0
#define GL_TEXTURE1                       0x84C1
#define GL_TEXTURE2                       0x84C2
#define GL_TEXTURE3                       0x84C3
#define GL_TEXTURE4                       0x84C4
#define GL_TEXTURE5                       0x84C5
#define GL_TEXTURE6                       0x84C6
#define GL_TEXTURE7                       0x84C7
#define GL_TEXTURE8                       0x84C8
#define GL_TEXTURE9                       0x84C9
#define GL_TEXTURE10                      0x84CA
#define GL_TEXTURE11                      0x84CB
#define GL_TEXTURE12                      0x84CC
#define GL_TEXTURE13                      0x84CD
#define GL_TEXTURE14                      0x84CE
#define GL_TEXTURE15                      0x84CF
#define GL_TEXTURE16                      0x84D0
#define GL_TEXTURE17                      0x84D1
#define GL_TEXTURE18                      0x84D2
#define GL_TEXTURE19                      0x84D3
#define GL_TEXTURE20                      0x84D4
#define GL_TEXTURE21                      0x84D5
#define GL_TEXTURE22                      0x84D6
#define GL_TEXTURE23                      0x84D7
#define GL_TEXTURE24                      0x84D8
#define GL_TEXTURE25                      0x84D9
#define GL_TEXTURE26                      0x84DA
#define GL_TEXTURE27                      0x84DB
#define GL_TEXTURE28                      0x84DC
#define GL_TEXTURE29                      0x84DD
#define GL_TEXTURE30                      0x84DE
#define GL_TEXTURE31                      0x84DF
#define GL_ACTIVE_TEXTURE                 0x84E0
#define GL_CLIENT_ACTIVE_TEXTURE          0x84E1
#define GL_MAX_TEXTURE_UNITS              0x84E2
#define GL_TRANSPOSE_MODELVIEW_MATRIX     0x84E3
#define GL_TRANSPOSE_PROJECTION_MATRIX    0x84E4
#define GL_TRANSPOSE_TEXTURE_MATRIX       0x84E5
#define GL_TRANSPOSE_COLOR_MATRIX         0x84E6
#define GL_MULTISAMPLE                    0x809D
#define GL_SAMPLE_ALPHA_TO_COVERAGE       0x809E
#define GL_SAMPLE_ALPHA_TO_ONE            0x809F
#define GL_SAMPLE_COVERAGE                0x80A0
#define GL_SAMPLE_BUFFERS                 0x80A8
#define GL_SAMPLES                        0x80A9
#define GL_SAMPLE_COVERAGE_VALUE          0x80AA
#define GL_SAMPLE_COVERAGE_INVERT         0x80AB
#define GL_MULTISAMPLE_BIT                0x20000000
#define GL_NORMAL_MAP                     0x8511
#define GL_REFLECTION_MAP                 0x8512
#define GL_TEXTURE_CUBE_MAP               0x8513
#define GL_TEXTURE_BINDING_CUBE_MAP       0x8514
#define GL_TEXTURE_CUBE_MAP_POSITIVE_X    0x8515
#define GL_TEXTURE_CUBE_MAP_NEGATIVE_X    0x8516
#define GL_TEXTURE_CUBE_MAP_POSITIVE_Y    0x8517
#define GL_TEXTURE_CUBE_MAP_NEGATIVE_Y    0x8518
#define GL_TEXTURE_CUBE_MAP_POSITIVE_Z    0x8519
#define GL_TEXTURE_CUBE_MAP_NEGATIVE_Z    0x851A
#define GL_PROXY_TEXTURE_CUBE_MAP         0x851B
#define GL_MAX_CUBE_MAP_TEXTURE_SIZE      0x851C
#define GL_COMPRESSED_ALPHA               0x84E9
#define GL_COMPRESSED_LUMINANCE           0x84EA
#define GL_COMPRESSED_LUMINANCE_ALPHA     0x84EB
#define GL_COMPRESSED_INTENSITY           0x84EC
#define GL_COMPRESSED_RGB                 0x84ED
#define GL_COMPRESSED_RGBA                0x84EE
#define GL_TEXTURE_COMPRESSION_HINT       0x84EF
#define GL_TEXTURE_COMPRESSED_IMAGE_SIZE  0x86A0
#define GL_TEXTURE_COMPRESSED             0x86A1
#define GL_NUM_COMPRESSED_TEXTURE_FORMATS 0x86A2
#define GL_COMPRESSED_TEXTURE_FORMATS     0x86A3
#define GL_CLAMP_TO_BORDER                0x812D
#define GL_COMBINE                        0x8570
#define GL_COMBINE_RGB                    0x8571
#define GL_COMBINE_ALPHA                  0x8572
#define GL_SOURCE0_RGB                    0x8580
#define GL_SOURCE1_RGB                    0x8581
#define GL_SOURCE2_RGB                    0x8582
#define GL_SOURCE0_ALPHA                  0x8588
#define GL_SOURCE1_ALPHA                  0x8589
#define GL_SOURCE2_ALPHA                  0x858A
#define GL_OPERAND0_RGB                   0x8590
#define GL_OPERAND1_RGB                   0x8591
#define GL_OPERAND2_RGB                   0x8592
#define GL_OPERAND0_ALPHA                 0x8598
#define GL_OPERAND1_ALPHA                 0x8599
#define GL_OPERAND2_ALPHA                 0x859A
#define GL_RGB_SCALE                      0x8573
#define GL_ADD_SIGNED                     0x8574
#define GL_INTERPOLATE                    0x8575
#define GL_SUBTRACT                       0x84E7
#define GL_CONSTANT                       0x8576
#define GL_PRIMARY_COLOR                  0x8577
#define GL_PREVIOUS                       0x8578
#define GL_DOT3_RGB                       0x86AE
#define GL_DOT3_RGBA                      0x86AF
#endif

#ifndef GL_VERSION_1_4
#define GL_BLEND_DST_RGB                  0x80C8
#define GL_BLEND_SRC_RGB                  0x80C9
#define GL_BLEND_DST_ALPHA                0x80CA
#define GL_BLEND_SRC_ALPHA                0x80CB
#define GL_POINT_SIZE_MIN                 0x8126
#define GL_POINT_SIZE_MAX                 0x8127
#define GL_POINT_FADE_THRESHOLD_SIZE      0x8128
#define GL_POINT_DISTANCE_ATTENUATION     0x8129
#define GL_GENERATE_MIPMAP                0x8191
#define GL_GENERATE_MIPMAP_HINT           0x8192
#define GL_DEPTH_COMPONENT16              0x81A5
#define GL_DEPTH_COMPONENT24              0x81A6
#define GL_DEPTH_COMPONENT32              0x81A7
#define GL_MIRRORED_REPEAT                0x8370
#define GL_FOG_COORDINATE_SOURCE          0x8450
#define GL_FOG_COORDINATE                 0x8451
#define GL_FRAGMENT_DEPTH                 0x8452
#define GL_CURRENT_FOG_COORDINATE         0x8453
#define GL_FOG_COORDINATE_ARRAY_TYPE      0x8454
#define GL_FOG_COORDINATE_ARRAY_STRIDE    0x8455
#define GL_FOG_COORDINATE_ARRAY_POINTER   0x8456
#define GL_FOG_COORDINATE_ARRAY           0x8457
#define GL_COLOR_SUM                      0x8458
#define GL_CURRENT_SECONDARY_COLOR        0x8459
#define GL_SECONDARY_COLOR_ARRAY_SIZE     0x845A
#define GL_SECONDARY_COLOR_ARRAY_TYPE     0x845B
#define GL_SECONDARY_COLOR_ARRAY_STRIDE   0x845C
#define GL_SECONDARY_COLOR_ARRAY_POINTER  0x845D
#define GL_SECONDARY_COLOR_ARRAY          0x845E
#define GL_MAX_TEXTURE_LOD_BIAS           0x84FD
#define GL_TEXTURE_FILTER_CONTROL         0x8500
#define GL_TEXTURE_LOD_BIAS               0x8501
#define GL_INCR_WRAP                      0x8507
#define GL_DECR_WRAP                      0x8508
#define GL_TEXTURE_DEPTH_SIZE             0x884A
#define GL_DEPTH_TEXTURE_MODE             0x884B
#define GL_TEXTURE_COMPARE_MODE           0x884C
#define GL_TEXTURE_COMPARE_FUNC           0x884D
#define GL_COMPARE_R_TO_TEXTURE           0x884E
#endif

#ifndef GL_VERSION_1_5
#define GL_BUFFER_SIZE                    0x8764
#define GL_BUFFER_USAGE                   0x8765
#define GL_QUERY_COUNTER_BITS             0x8864
#define GL_CURRENT_QUERY                  0x8865
#define GL_QUERY_RESULT                   0x8866
#define GL_QUERY_RESULT_AVAILABLE         0x8867
#define GL_ARRAY_BUFFER                   0x8892
#define GL_ELEMENT_ARRAY_BUFFER           0x8893
#define GL_ARRAY_BUFFER_BINDING           0x8894
#define GL_ELEMENT_ARRAY_BUFFER_BINDING   0x8895
#define GL_VERTEX_ARRAY_BUFFER_BINDING    0x8896
#define GL_NORMAL_ARRAY_BUFFER_BINDING    0x8897
#define GL_COLOR_ARRAY_BUFFER_BINDING     0x8898
#define GL_INDEX_ARRAY_BUFFER_BINDING     0x8899
#define GL_TEXTURE_COORD_ARRAY_BUFFER_BINDING 0x889A
#define GL_EDGE_FLAG_ARRAY_BUFFER_BINDING 0x889B
#define GL_SECONDARY_COLOR_ARRAY_BUFFER_BINDING 0x889C
#define GL_FOG_COORDINATE_ARRAY_BUFFER_BINDING 0x889D
#define GL_WEIGHT_ARRAY_BUFFER_BINDING    0x889E
#define GL_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING 0x889F
#define GL_READ_ONLY                      0x88B8
#define GL_WRITE_ONLY                     0x88B9
#define GL_READ_WRITE                     0x88BA
#define GL_BUFFER_ACCESS                  0x88BB
#define GL_BUFFER_MAPPED                  0x88BC
#define GL_BUFFER_MAP_POINTER             0x88BD
#define GL_STREAM_DRAW                    0x88E0
#define GL_STREAM_READ                    0x88E1
#define GL_STREAM_COPY                    0x88E2
#define GL_STATIC_DRAW                    0x88E4
#define GL_STATIC_READ                    0x88E5
#define GL_STATIC_COPY                    0x88E6
#define GL_DYNAMIC_DRAW                   0x88E8
#define GL_DYNAMIC_READ                   0x88E9
#define GL_DYNAMIC_COPY                   0x88EA
#define GL_SAMPLES_PASSED                 0x8914
#define GL_FOG_COORD_SRC                  GL_FOG_COORDINATE_SOURCE
#define GL_FOG_COORD                      GL_FOG_COORDINATE
#define GL_CURRENT_FOG_COORD              GL_CURRENT_FOG_COORDINATE
#define GL_FOG_COORD_ARRAY_TYPE           GL_FOG_COORDINATE_ARRAY_TYPE
#define GL_FOG_COORD_ARRAY_STRIDE         GL_FOG_COORDINATE_ARRAY_STRIDE
#define GL_FOG_COORD_ARRAY_POINTER        GL_FOG_COORDINATE_ARRAY_POINTER
#define GL_FOG_COORD_ARRAY                GL_FOG_COORDINATE_ARRAY
#define GL_FOG_COORD_ARRAY_BUFFER_BINDING GL_FOG_COORDINATE_ARRAY_BUFFER_BINDING
#define GL_SRC0_RGB                       GL_SOURCE0_RGB
#define GL_SRC1_RGB                       GL_SOURCE1_RGB
#define GL_SRC2_RGB                       GL_SOURCE2_RGB
#define GL_SRC0_ALPHA                     GL_SOURCE0_ALPHA
#define GL_SRC1_ALPHA                     GL_SOURCE1_ALPHA
#define GL_SRC2_ALPHA                     GL_SOURCE2_ALPHA
#endif

#ifndef GL_VERSION_2_0
#define GL_BLEND_EQUATION_RGB             GL_BLEND_EQUATION
#define GL_VERTEX_ATTRIB_ARRAY_ENABLED    0x8622
#define GL_VERTEX_ATTRIB_ARRAY_SIZE       0x8623
#define GL_VERTEX_ATTRIB_ARRAY_STRIDE     0x8624
#define GL_VERTEX_ATTRIB_ARRAY_TYPE       0x8625
#define GL_CURRENT_VERTEX_ATTRIB          0x8626
#define GL_VERTEX_PROGRAM_POINT_SIZE      0x8642
#define GL_VERTEX_PROGRAM_TWO_SIDE        0x8643
#define GL_VERTEX_ATTRIB_ARRAY_POINTER    0x8645
#define GL_STENCIL_BACK_FUNC              0x8800
#define GL_STENCIL_BACK_FAIL              0x8801
#define GL_STENCIL_BACK_PASS_DEPTH_FAIL   0x8802
#define GL_STENCIL_BACK_PASS_DEPTH_PASS   0x8803
#define GL_MAX_DRAW_BUFFERS               0x8824
#define GL_DRAW_BUFFER0                   0x8825
#define GL_DRAW_BUFFER1                   0x8826
#define GL_DRAW_BUFFER2                   0x8827
#define GL_DRAW_BUFFER3                   0x8828
#define GL_DRAW_BUFFER4                   0x8829
#define GL_DRAW_BUFFER5                   0x882A
#define GL_DRAW_BUFFER6                   0x882B
#define GL_DRAW_BUFFER7                   0x882C
#define GL_DRAW_BUFFER8                   0x882D
#define GL_DRAW_BUFFER9                   0x882E
#define GL_DRAW_BUFFER10                  0x882F
#define GL_DRAW_BUFFER11                  0x8830
#define GL_DRAW_BUFFER12                  0x8831
#define GL_DRAW_BUFFER13                  0x8832
#define GL_DRAW_BUFFER14                  0x8833
#define GL_DRAW_BUFFER15                  0x8834
#define GL_BLEND_EQUATION_ALPHA           0x883D
#define GL_POINT_SPRITE                   0x8861
#define GL_COORD_REPLACE                  0x8862
#define GL_MAX_VERTEX_ATTRIBS             0x8869
#define GL_VERTEX_ATTRIB_ARRAY_NORMALIZED 0x886A
#define GL_MAX_TEXTURE_COORDS             0x8871
#define GL_MAX_TEXTURE_IMAGE_UNITS        0x8872
#define GL_FRAGMENT_SHADER                0x8B30
#define GL_VERTEX_SHADER                  0x8B31
#define GL_MAX_FRAGMENT_UNIFORM_COMPONENTS 0x8B49
#define GL_MAX_VERTEX_UNIFORM_COMPONENTS  0x8B4A
#define GL_MAX_VARYING_FLOATS             0x8B4B
#define GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS 0x8B4C
#define GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS 0x8B4D
#define GL_SHADER_TYPE                    0x8B4F
#define GL_FLOAT_VEC2                     0x8B50
#define GL_FLOAT_VEC3                     0x8B51
#define GL_FLOAT_VEC4                     0x8B52
#define GL_INT_VEC2                       0x8B53
#define GL_INT_VEC3                       0x8B54
#define GL_INT_VEC4                       0x8B55
#define GL_BOOL                           0x8B56
#define GL_BOOL_VEC2                      0x8B57
#define GL_BOOL_VEC3                      0x8B58
#define GL_BOOL_VEC4                      0x8B59
#define GL_FLOAT_MAT2                     0x8B5A
#define GL_FLOAT_MAT3                     0x8B5B
#define GL_FLOAT_MAT4                     0x8B5C
#define GL_SAMPLER_1D                     0x8B5D
#define GL_SAMPLER_2D                     0x8B5E
#define GL_SAMPLER_3D                     0x8B5F
#define GL_SAMPLER_CUBE                   0x8B60
#define GL_SAMPLER_1D_SHADOW              0x8B61
#define GL_SAMPLER_2D_SHADOW              0x8B62
#define GL_DELETE_STATUS                  0x8B80
#define GL_COMPILE_STATUS                 0x8B81
#define GL_LINK_STATUS                    0x8B82
#define GL_VALIDATE_STATUS                0x8B83
#define GL_INFO_LOG_LENGTH                0x8B84
#define GL_ATTACHED_SHADERS               0x8B85
#define GL_ACTIVE_UNIFORMS                0x8B86
#define GL_ACTIVE_UNIFORM_MAX_LENGTH      0x8B87
#define GL_SHADER_SOURCE_LENGTH           0x8B88
#define GL_ACTIVE_ATTRIBUTES              0x8B89
#define GL_ACTIVE_ATTRIBUTE_MAX_LENGTH    0x8B8A
#define GL_FRAGMENT_SHADER_DERIVATIVE_HINT 0x8B8B
#define GL_SHADING_LANGUAGE_VERSION       0x8B8C
#define GL_CURRENT_PROGRAM                0x8B8D
#define GL_POINT_SPRITE_COORD_ORIGIN      0x8CA0
#define GL_LOWER_LEFT                     0x8CA1
#define GL_UPPER_LEFT                     0x8CA2
#define GL_STENCIL_BACK_REF               0x8CA3
#define GL_STENCIL_BACK_VALUE_MASK        0x8CA4
#define GL_STENCIL_BACK_WRITEMASK         0x8CA5
#endif

#ifndef GL_ARB_multitexture
#define GL_TEXTURE0_ARB                   0x84C0
#define GL_TEXTURE1_ARB                   0x84C1
#define GL_TEXTURE2_ARB                   0x84C2
#define GL_TEXTURE3_ARB                   0x84C3
#define GL_TEXTURE4_ARB                   0x84C4
#define GL_TEXTURE5_ARB                   0x84C5
#define GL_TEXTURE6_ARB                   0x84C6
#define GL_TEXTURE7_ARB                   0x84C7
#define GL_TEXTURE8_ARB                   0x84C8
#define GL_TEXTURE9_ARB                   0x84C9
#define GL_TEXTURE10_ARB                  0x84CA
#define GL_TEXTURE11_ARB                  0x84CB
#define GL_TEXTURE12_ARB                  0x84CC
#define GL_TEXTURE13_ARB                  0x84CD
#define GL_TEXTURE14_ARB                  0x84CE
#define GL_TEXTURE15_ARB                  0x84CF
#define GL_TEXTURE16_ARB                  0x84D0
#define GL_TEXTURE17_ARB                  0x84D1
#define GL_TEXTURE18_ARB                  0x84D2
#define GL_TEXTURE19_ARB                  0x84D3
#define GL_TEXTURE20_ARB                  0x84D4
#define GL_TEXTURE21_ARB                  0x84D5
#define GL_TEXTURE22_ARB                  0x84D6
#define GL_TEXTURE23_ARB                  0x84D7
#define GL_TEXTURE24_ARB                  0x84D8
#define GL_TEXTURE25_ARB                  0x84D9
#define GL_TEXTURE26_ARB                  0x84DA
#define GL_TEXTURE27_ARB                  0x84DB
#define GL_TEXTURE28_ARB                  0x84DC
#define GL_TEXTURE29_ARB                  0x84DD
#define GL_TEXTURE30_ARB                  0x84DE
#define GL_TEXTURE31_ARB                  0x84DF
#define GL_ACTIVE_TEXTURE_ARB             0x84E0
#define GL_CLIENT_ACTIVE_TEXTURE_ARB      0x84E1
#define GL_MAX_TEXTURE_UNITS_ARB          0x84E2
#endif

#ifndef GL_ARB_transpose_matrix
#define GL_TRANSPOSE_MODELVIEW_MATRIX_ARB 0x84E3
#define GL_TRANSPOSE_PROJECTION_MATRIX_ARB 0x84E4
#define GL_TRANSPOSE_TEXTURE_MATRIX_ARB   0x84E5
#define GL_TRANSPOSE_COLOR_MATRIX_ARB     0x84E6
#endif

#ifndef GL_ARB_multisample
#define GL_MULTISAMPLE_ARB                0x809D
#define GL_SAMPLE_ALPHA_TO_COVERAGE_ARB   0x809E
#define GL_SAMPLE_ALPHA_TO_ONE_ARB        0x809F
#define GL_SAMPLE_COVERAGE_ARB            0x80A0
#define GL_SAMPLE_BUFFERS_ARB             0x80A8
#define GL_SAMPLES_ARB                    0x80A9
#define GL_SAMPLE_COVERAGE_VALUE_ARB      0x80AA
#define GL_SAMPLE_COVERAGE_INVERT_ARB     0x80AB
#define GL_MULTISAMPLE_BIT_ARB            0x20000000
#endif

#ifndef GL_ARB_texture_env_add
#endif

#ifndef GL_ARB_texture_cube_map
#define GL_NORMAL_MAP_ARB                 0x8511
#define GL_REFLECTION_MAP_ARB             0x8512
#define GL_TEXTURE_CUBE_MAP_ARB           0x8513
#define GL_TEXTURE_BINDING_CUBE_MAP_ARB   0x8514
#define GL_TEXTURE_CUBE_MAP_POSITIVE_X_ARB 0x8515
#define GL_TEXTURE_CUBE_MAP_NEGATIVE_X_ARB 0x8516
#define GL_TEXTURE_CUBE_MAP_POSITIVE_Y_ARB 0x8517
#define GL_TEXTURE_CUBE_MAP_NEGATIVE_Y_ARB 0x8518
#define GL_TEXTURE_CUBE_MAP_POSITIVE_Z_ARB 0x8519
#define GL_TEXTURE_CUBE_MAP_NEGATIVE_Z_ARB 0x851A
#define GL_PROXY_TEXTURE_CUBE_MAP_ARB     0x851B
#define GL_MAX_CUBE_MAP_TEXTURE_SIZE_ARB  0x851C
#endif

#ifndef GL_ARB_texture_compression
#define GL_COMPRESSED_ALPHA_ARB           0x84E9
#define GL_COMPRESSED_LUMINANCE_ARB       0x84EA
#define GL_COMPRESSED_LUMINANCE_ALPHA_ARB 0x84EB
#define GL_COMPRESSED_INTENSITY_ARB       0x84EC
#define GL_COMPRESSED_RGB_ARB             0x84ED
#define GL_COMPRESSED_RGBA_ARB            0x84EE
#define GL_TEXTURE_COMPRESSION_HINT_ARB   0x84EF
#define GL_TEXTURE_COMPRESSED_IMAGE_SIZE_ARB 0x86A0
#define GL_TEXTURE_COMPRESSED_ARB         0x86A1
#define GL_NUM_COMPRESSED_TEXTURE_FORMATS_ARB 0x86A2
#define GL_COMPRESSED_TEXTURE_FORMATS_ARB 0x86A3
#endif

#ifndef GL_ARB_texture_border_clamp
#define GL_CLAMP_TO_BORDER_ARB            0x812D
#endif

#ifndef GL_ARB_point_parameters
#define GL_POINT_SIZE_MIN_ARB             0x8126
#define GL_POINT_SIZE_MAX_ARB             0x8127
#define GL_POINT_FADE_THRESHOLD_SIZE_ARB  0x8128
#define GL_POINT_DISTANCE_ATTENUATION_ARB 0x8129
#endif

#ifndef GL_ARB_vertex_blend
#define GL_MAX_VERTEX_UNITS_ARB           0x86A4
#define GL_ACTIVE_VERTEX_UNITS_ARB        0x86A5
#define GL_WEIGHT_SUM_UNITY_ARB           0x86A6
#define GL_VERTEX_BLEND_ARB               0x86A7
#define GL_CURRENT_WEIGHT_ARB             0x86A8
#define GL_WEIGHT_ARRAY_TYPE_ARB          0x86A9
#define GL_WEIGHT_ARRAY_STRIDE_ARB        0x86AA
#define GL_WEIGHT_ARRAY_SIZE_ARB          0x86AB
#define GL_WEIGHT_ARRAY_POINTER_ARB       0x86AC
#define GL_WEIGHT_ARRAY_ARB               0x86AD
#define GL_MODELVIEW0_ARB                 0x1700
#define GL_MODELVIEW1_ARB                 0x850A
#define GL_MODELVIEW2_ARB                 0x8722
#define GL_MODELVIEW3_ARB                 0x8723
#define GL_MODELVIEW4_ARB                 0x8724
#define GL_MODELVIEW5_ARB                 0x8725
#define GL_MODELVIEW6_ARB                 0x8726
#define GL_MODELVIEW7_ARB                 0x8727
#define GL_MODELVIEW8_ARB                 0x8728
#define GL_MODELVIEW9_ARB                 0x8729
#define GL_MODELVIEW10_ARB                0x872A
#define GL_MODELVIEW11_ARB                0x872B
#define GL_MODELVIEW12_ARB                0x872C
#define GL_MODELVIEW13_ARB                0x872D
#define GL_MODELVIEW14_ARB                0x872E
#define GL_MODELVIEW15_ARB                0x872F
#define GL_MODELVIEW16_ARB                0x8730
#define GL_MODELVIEW17_ARB                0x8731
#define GL_MODELVIEW18_ARB                0x8732
#define GL_MODELVIEW19_ARB                0x8733
#define GL_MODELVIEW20_ARB                0x8734
#define GL_MODELVIEW21_ARB                0x8735
#define GL_MODELVIEW22_ARB                0x8736
#define GL_MODELVIEW23_ARB                0x8737
#define GL_MODELVIEW24_ARB                0x8738
#define GL_MODELVIEW25_ARB                0x8739
#define GL_MODELVIEW26_ARB                0x873A
#define GL_MODELVIEW27_ARB                0x873B
#define GL_MODELVIEW28_ARB                0x873C
#define GL_MODELVIEW29_ARB                0x873D
#define GL_MODELVIEW30_ARB                0x873E
#define GL_MODELVIEW31_ARB                0x873F
#endif

#ifndef GL_ARB_matrix_palette
#define GL_MATRIX_PALETTE_ARB             0x8840
#define GL_MAX_MATRIX_PALETTE_STACK_DEPTH_ARB 0x8841
#define GL_MAX_PALETTE_MATRICES_ARB       0x8842
#define GL_CURRENT_PALETTE_MATRIX_ARB     0x8843
#define GL_MATRIX_INDEX_ARRAY_ARB         0x8844
#define GL_CURRENT_MATRIX_INDEX_ARB       0x8845
#define GL_MATRIX_INDEX_ARRAY_SIZE_ARB    0x8846
#define GL_MATRIX_INDEX_ARRAY_TYPE_ARB    0x8847
#define GL_MATRIX_INDEX_ARRAY_STRIDE_ARB  0x8848
#define GL_MATRIX_INDEX_ARRAY_POINTER_ARB 0x8849
#endif

#ifndef GL_ARB_texture_env_combine
#define GL_COMBINE_ARB                    0x8570
#define GL_COMBINE_RGB_ARB                0x8571
#define GL_COMBINE_ALPHA_ARB              0x8572
#define GL_SOURCE0_RGB_ARB                0x8580
#define GL_SOURCE1_RGB_ARB                0x8581
#define GL_SOURCE2_RGB_ARB                0x8582
#define GL_SOURCE0_ALPHA_ARB              0x8588
#define GL_SOURCE1_ALPHA_ARB              0x8589
#define GL_SOURCE2_ALPHA_ARB              0x858A
#define GL_OPERAND0_RGB_ARB               0x8590
#define GL_OPERAND1_RGB_ARB               0x8591
#define GL_OPERAND2_RGB_ARB               0x8592
#define GL_OPERAND0_ALPHA_ARB             0x8598
#define GL_OPERAND1_ALPHA_ARB             0x8599
#define GL_OPERAND2_ALPHA_ARB             0x859A
#define GL_RGB_SCALE_ARB                  0x8573
#define GL_ADD_SIGNED_ARB                 0x8574
#define GL_INTERPOLATE_ARB                0x8575
#define GL_SUBTRACT_ARB                   0x84E7
#define GL_CONSTANT_ARB                   0x8576
#define GL_PRIMARY_COLOR_ARB              0x8577
#define GL_PREVIOUS_ARB                   0x8578
#endif

#ifndef GL_ARB_texture_env_crossbar
#endif

#ifndef GL_ARB_texture_env_dot3
#define GL_DOT3_RGB_ARB                   0x86AE
#define GL_DOT3_RGBA_ARB                  0x86AF
#endif

#ifndef GL_ARB_texture_mirrored_repeat
#define GL_MIRRORED_REPEAT_ARB            0x8370
#endif

#ifndef GL_ARB_depth_texture
#define GL_DEPTH_COMPONENT16_ARB          0x81A5
#define GL_DEPTH_COMPONENT24_ARB          0x81A6
#define GL_DEPTH_COMPONENT32_ARB          0x81A7
#define GL_TEXTURE_DEPTH_SIZE_ARB         0x884A
#define GL_DEPTH_TEXTURE_MODE_ARB         0x884B
#endif

#ifndef GL_ARB_shadow
#define GL_TEXTURE_COMPARE_MODE_ARB       0x884C
#define GL_TEXTURE_COMPARE_FUNC_ARB       0x884D
#define GL_COMPARE_R_TO_TEXTURE_ARB       0x884E
#endif

#ifndef GL_ARB_shadow_ambient
#define GL_TEXTURE_COMPARE_FAIL_VALUE_ARB 0x80BF
#endif

#ifndef GL_ARB_window_pos
#endif

#ifndef GL_ARB_vertex_program
#define GL_COLOR_SUM_ARB                  0x8458
#define GL_VERTEX_PROGRAM_ARB             0x8620
#define GL_VERTEX_ATTRIB_ARRAY_ENABLED_ARB 0x8622
#define GL_VERTEX_ATTRIB_ARRAY_SIZE_ARB   0x8623
#define GL_VERTEX_ATTRIB_ARRAY_STRIDE_ARB 0x8624
#define GL_VERTEX_ATTRIB_ARRAY_TYPE_ARB   0x8625
#define GL_CURRENT_VERTEX_ATTRIB_ARB      0x8626
#define GL_PROGRAM_LENGTH_ARB             0x8627
#define GL_PROGRAM_STRING_ARB             0x8628
#define GL_MAX_PROGRAM_MATRIX_STACK_DEPTH_ARB 0x862E
#define GL_MAX_PROGRAM_MATRICES_ARB       0x862F
#define GL_CURRENT_MATRIX_STACK_DEPTH_ARB 0x8640
#define GL_CURRENT_MATRIX_ARB             0x8641
#define GL_VERTEX_PROGRAM_POINT_SIZE_ARB  0x8642
#define GL_VERTEX_PROGRAM_TWO_SIDE_ARB    0x8643
#define GL_VERTEX_ATTRIB_ARRAY_POINTER_ARB 0x8645
#define GL_PROGRAM_ERROR_POSITION_ARB     0x864B
#define GL_PROGRAM_BINDING_ARB            0x8677
#define GL_MAX_VERTEX_ATTRIBS_ARB         0x8869
#define GL_VERTEX_ATTRIB_ARRAY_NORMALIZED_ARB 0x886A
#define GL_PROGRAM_ERROR_STRING_ARB       0x8874
#define GL_PROGRAM_FORMAT_ASCII_ARB       0x8875
#define GL_PROGRAM_FORMAT_ARB             0x8876
#define GL_PROGRAM_INSTRUCTIONS_ARB       0x88A0
#define GL_MAX_PROGRAM_INSTRUCTIONS_ARB   0x88A1
#define GL_PROGRAM_NATIVE_INSTRUCTIONS_ARB 0x88A2
#define GL_MAX_PROGRAM_NATIVE_INSTRUCTIONS_ARB 0x88A3
#define GL_PROGRAM_TEMPORARIES_ARB        0x88A4
#define GL_MAX_PROGRAM_TEMPORARIES_ARB    0x88A5
#define GL_PROGRAM_NATIVE_TEMPORARIES_ARB 0x88A6
#define GL_MAX_PROGRAM_NATIVE_TEMPORARIES_ARB 0x88A7
#define GL_PROGRAM_PARAMETERS_ARB         0x88A8
#define GL_MAX_PROGRAM_PARAMETERS_ARB     0x88A9
#define GL_PROGRAM_NATIVE_PARAMETERS_ARB  0x88AA
#define GL_MAX_PROGRAM_NATIVE_PARAMETERS_ARB 0x88AB
#define GL_PROGRAM_ATTRIBS_ARB            0x88AC
#define GL_MAX_PROGRAM_ATTRIBS_ARB        0x88AD
#define GL_PROGRAM_NATIVE_ATTRIBS_ARB     0x88AE
#define GL_MAX_PROGRAM_NATIVE_ATTRIBS_ARB 0x88AF
#define GL_PROGRAM_ADDRESS_REGISTERS_ARB  0x88B0
#define GL_MAX_PROGRAM_ADDRESS_REGISTERS_ARB 0x88B1
#define GL_PROGRAM_NATIVE_ADDRESS_REGISTERS_ARB 0x88B2
#define GL_MAX_PROGRAM_NATIVE_ADDRESS_REGISTERS_ARB 0x88B3
#define GL_MAX_PROGRAM_LOCAL_PARAMETERS_ARB 0x88B4
#define GL_MAX_PROGRAM_ENV_PARAMETERS_ARB 0x88B5
#define GL_PROGRAM_UNDER_NATIVE_LIMITS_ARB 0x88B6
#define GL_TRANSPOSE_CURRENT_MATRIX_ARB   0x88B7
#define GL_MATRIX0_ARB                    0x88C0
#define GL_MATRIX1_ARB                    0x88C1
#define GL_MATRIX2_ARB                    0x88C2
#define GL_MATRIX3_ARB                    0x88C3
#define GL_MATRIX4_ARB                    0x88C4
#define GL_MATRIX5_ARB                    0x88C5
#define GL_MATRIX6_ARB                    0x88C6
#define GL_MATRIX7_ARB                    0x88C7
#define GL_MATRIX8_ARB                    0x88C8
#define GL_MATRIX9_ARB                    0x88C9
#define GL_MATRIX10_ARB                   0x88CA
#define GL_MATRIX11_ARB                   0x88CB
#define GL_MATRIX12_ARB                   0x88CC
#define GL_MATRIX13_ARB                   0x88CD
#define GL_MATRIX14_ARB                   0x88CE
#define GL_MATRIX15_ARB                   0x88CF
#define GL_MATRIX16_ARB                   0x88D0
#define GL_MATRIX17_ARB                   0x88D1
#define GL_MATRIX18_ARB                   0x88D2
#define GL_MATRIX19_ARB                   0x88D3
#define GL_MATRIX20_ARB                   0x88D4
#define GL_MATRIX21_ARB                   0x88D5
#define GL_MATRIX22_ARB                   0x88D6
#define GL_MATRIX23_ARB                   0x88D7
#define GL_MATRIX24_ARB                   0x88D8
#define GL_MATRIX25_ARB                   0x88D9
#define GL_MATRIX26_ARB                   0x88DA
#define GL_MATRIX27_ARB                   0x88DB
#define GL_MATRIX28_ARB                   0x88DC
#define GL_MATRIX29_ARB                   0x88DD
#define GL_MATRIX30_ARB                   0x88DE
#define GL_MATRIX31_ARB                   0x88DF
#endif

#ifndef GL_ARB_fragment_program
#define GL_FRAGMENT_PROGRAM_ARB           0x8804
#define GL_PROGRAM_ALU_INSTRUCTIONS_ARB   0x8805
#define GL_PROGRAM_TEX_INSTRUCTIONS_ARB   0x8806
#define GL_PROGRAM_TEX_INDIRECTIONS_ARB   0x8807
#define GL_PROGRAM_NATIVE_ALU_INSTRUCTIONS_ARB 0x8808
#define GL_PROGRAM_NATIVE_TEX_INSTRUCTIONS_ARB 0x8809
#define GL_PROGRAM_NATIVE_TEX_INDIRECTIONS_ARB 0x880A
#define GL_MAX_PROGRAM_ALU_INSTRUCTIONS_ARB 0x880B
#define GL_MAX_PROGRAM_TEX_INSTRUCTIONS_ARB 0x880C
#define GL_MAX_PROGRAM_TEX_INDIRECTIONS_ARB 0x880D
#define GL_MAX_PROGRAM_NATIVE_ALU_INSTRUCTIONS_ARB 0x880E
#define GL_MAX_PROGRAM_NATIVE_TEX_INSTRUCTIONS_ARB 0x880F
#define GL_MAX_PROGRAM_NATIVE_TEX_INDIRECTIONS_ARB 0x8810
#define GL_MAX_TEXTURE_COORDS_ARB         0x8871
#define GL_MAX_TEXTURE_IMAGE_UNITS_ARB    0x8872
#endif

#ifndef GL_ARB_vertex_buffer_object
#define GL_BUFFER_SIZE_ARB                0x8764
#define GL_BUFFER_USAGE_ARB               0x8765
#define GL_ARRAY_BUFFER_ARB               0x8892
#define GL_ELEMENT_ARRAY_BUFFER_ARB       0x8893
#define GL_ARRAY_BUFFER_BINDING_ARB       0x8894
#define GL_ELEMENT_ARRAY_BUFFER_BINDING_ARB 0x8895
#define GL_VERTEX_ARRAY_BUFFER_BINDING_ARB 0x8896
#define GL_NORMAL_ARRAY_BUFFER_BINDING_ARB 0x8897
#define GL_COLOR_ARRAY_BUFFER_BINDING_ARB 0x8898
#define GL_INDEX_ARRAY_BUFFER_BINDING_ARB 0x8899
#define GL_TEXTURE_COORD_ARRAY_BUFFER_BINDING_ARB 0x889A
#define GL_EDGE_FLAG_ARRAY_BUFFER_BINDING_ARB 0x889B
#define GL_SECONDARY_COLOR_ARRAY_BUFFER_BINDING_ARB 0x889C
#define GL_FOG_COORDINATE_ARRAY_BUFFER_BINDING_ARB 0x889D
#define GL_WEIGHT_ARRAY_BUFFER_BINDING_ARB 0x889E
#define GL_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING_ARB 0x889F
#define GL_READ_ONLY_ARB                  0x88B8
#define GL_WRITE_ONLY_ARB                 0x88B9
#define GL_READ_WRITE_ARB                 0x88BA
#define GL_BUFFER_ACCESS_ARB              0x88BB
#define GL_BUFFER_MAPPED_ARB              0x88BC
#define GL_BUFFER_MAP_POINTER_ARB         0x88BD
#define GL_STREAM_DRAW_ARB                0x88E0
#define GL_STREAM_READ_ARB                0x88E1
#define GL_STREAM_COPY_ARB                0x88E2
#define GL_STATIC_DRAW_ARB                0x88E4
#define GL_STATIC_READ_ARB                0x88E5
#define GL_STATIC_COPY_ARB                0x88E6
#define GL_DYNAMIC_DRAW_ARB               0x88E8
#define GL_DYNAMIC_READ_ARB               0x88E9
#define GL_DYNAMIC_COPY_ARB               0x88EA
#endif

#ifndef GL_ARB_occlusion_query
#define GL_QUERY_COUNTER_BITS_ARB         0x8864
#define GL_CURRENT_QUERY_ARB              0x8865
#define GL_QUERY_RESULT_ARB               0x8866
#define GL_QUERY_RESULT_AVAILABLE_ARB     0x8867
#define GL_SAMPLES_PASSED_ARB             0x8914
#endif

#ifndef GL_ARB_shader_objects
#define GL_PROGRAM_OBJECT_ARB             0x8B40
#define GL_SHADER_OBJECT_ARB              0x8B48
#define GL_OBJECT_TYPE_ARB                0x8B4E
#define GL_OBJECT_SUBTYPE_ARB             0x8B4F
#define GL_FLOAT_VEC2_ARB                 0x8B50
#define GL_FLOAT_VEC3_ARB                 0x8B51
#define GL_FLOAT_VEC4_ARB                 0x8B52
#define GL_INT_VEC2_ARB                   0x8B53
#define GL_INT_VEC3_ARB                   0x8B54
#define GL_INT_VEC4_ARB                   0x8B55
#define GL_BOOL_ARB                       0x8B56
#define GL_BOOL_VEC2_ARB                  0x8B57
#define GL_BOOL_VEC3_ARB                  0x8B58
#define GL_BOOL_VEC4_ARB                  0x8B59
#define GL_FLOAT_MAT2_ARB                 0x8B5A
#define GL_FLOAT_MAT3_ARB                 0x8B5B
#define GL_FLOAT_MAT4_ARB                 0x8B5C
#define GL_SAMPLER_1D_ARB                 0x8B5D
#define GL_SAMPLER_2D_ARB                 0x8B5E
#define GL_SAMPLER_3D_ARB                 0x8B5F
#define GL_SAMPLER_CUBE_ARB               0x8B60
#define GL_SAMPLER_1D_SHADOW_ARB          0x8B61
#define GL_SAMPLER_2D_SHADOW_ARB          0x8B62
#define GL_SAMPLER_2D_RECT_ARB            0x8B63
#define GL_SAMPLER_2D_RECT_SHADOW_ARB     0x8B64
#define GL_OBJECT_DELETE_STATUS_ARB       0x8B80
#define GL_OBJECT_COMPILE_STATUS_ARB      0x8B81
#define GL_OBJECT_LINK_STATUS_ARB         0x8B82
#define GL_OBJECT_VALIDATE_STATUS_ARB     0x8B83
#define GL_OBJECT_INFO_LOG_LENGTH_ARB     0x8B84
#define GL_OBJECT_ATTACHED_OBJECTS_ARB    0x8B85
#define GL_OBJECT_ACTIVE_UNIFORMS_ARB     0x8B86
#define GL_OBJECT_ACTIVE_UNIFORM_MAX_LENGTH_ARB 0x8B87
#define GL_OBJECT_SHADER_SOURCE_LENGTH_ARB 0x8B88
#endif

#ifndef GL_ARB_vertex_shader
#define GL_VERTEX_SHADER_ARB              0x8B31
#define GL_MAX_VERTEX_UNIFORM_COMPONENTS_ARB 0x8B4A
#define GL_MAX_VARYING_FLOATS_ARB         0x8B4B
#define GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS_ARB 0x8B4C
#define GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS_ARB 0x8B4D
#define GL_OBJECT_ACTIVE_ATTRIBUTES_ARB   0x8B89
#define GL_OBJECT_ACTIVE_ATTRIBUTE_MAX_LENGTH_ARB 0x8B8A
#endif

#ifndef GL_ARB_fragment_shader
#define GL_FRAGMENT_SHADER_ARB            0x8B30
#define GL_MAX_FRAGMENT_UNIFORM_COMPONENTS_ARB 0x8B49
#define GL_FRAGMENT_SHADER_DERIVATIVE_HINT_ARB 0x8B8B
#endif

#ifndef GL_ARB_shading_language_100
#define GL_SHADING_LANGUAGE_VERSION_ARB   0x8B8C
#endif

#ifndef GL_ARB_texture_non_power_of_two
#endif

#ifndef GL_ARB_point_sprite
#define GL_POINT_SPRITE_ARB               0x8861
#define GL_COORD_REPLACE_ARB              0x8862
#endif

#ifndef GL_ARB_fragment_program_shadow
#endif

#ifndef GL_ARB_draw_buffers
#define GL_MAX_DRAW_BUFFERS_ARB           0x8824
#define GL_DRAW_BUFFER0_ARB               0x8825
#define GL_DRAW_BUFFER1_ARB               0x8826
#define GL_DRAW_BUFFER2_ARB               0x8827
#define GL_DRAW_BUFFER3_ARB               0x8828
#define GL_DRAW_BUFFER4_ARB               0x8829
#define GL_DRAW_BUFFER5_ARB               0x882A
#define GL_DRAW_BUFFER6_ARB               0x882B
#define GL_DRAW_BUFFER7_ARB               0x882C
#define GL_DRAW_BUFFER8_ARB               0x882D
#define GL_DRAW_BUFFER9_ARB               0x882E
#define GL_DRAW_BUFFER10_ARB              0x882F
#define GL_DRAW_BUFFER11_ARB              0x8830
#define GL_DRAW_BUFFER12_ARB              0x8831
#define GL_DRAW_BUFFER13_ARB              0x8832
#define GL_DRAW_BUFFER14_ARB              0x8833
#define GL_DRAW_BUFFER15_ARB              0x8834
#endif

#ifndef GL_ARB_texture_rectangle
#define GL_TEXTURE_RECTANGLE_ARB          0x84F5
#define GL_TEXTURE_BINDING_RECTANGLE_ARB  0x84F6
#define GL_PROXY_TEXTURE_RECTANGLE_ARB    0x84F7
#define GL_MAX_RECTANGLE_TEXTURE_SIZE_ARB 0x84F8
#endif

#ifndef GL_ARB_color_buffer_float
#define GL_RGBA_FLOAT_MODE_ARB            0x8820
#define GL_CLAMP_VERTEX_COLOR_ARB         0x891A
#define GL_CLAMP_FRAGMENT_COLOR_ARB       0x891B
#define GL_CLAMP_READ_COLOR_ARB           0x891C
#define GL_FIXED_ONLY_ARB                 0x891D
#endif

#ifndef GL_ARB_half_float_pixel
#define GL_HALF_FLOAT_ARB                 0x140B
#endif

#ifndef GL_ARB_texture_float
#define GL_TEXTURE_RED_TYPE_ARB           0x8C10
#define GL_TEXTURE_GREEN_TYPE_ARB         0x8C11
#define GL_TEXTURE_BLUE_TYPE_ARB          0x8C12
#define GL_TEXTURE_ALPHA_TYPE_ARB         0x8C13
#define GL_TEXTURE_LUMINANCE_TYPE_ARB     0x8C14
#define GL_TEXTURE_INTENSITY_TYPE_ARB     0x8C15
#define GL_TEXTURE_DEPTH_TYPE_ARB         0x8C16
#define GL_UNSIGNED_NORMALIZED_ARB        0x8C17
#define GL_RGBA32F_ARB                    0x8814
#define GL_RGB32F_ARB                     0x8815
#define GL_ALPHA32F_ARB                   0x8816
#define GL_INTENSITY32F_ARB               0x8817
#define GL_LUMINANCE32F_ARB               0x8818
#define GL_LUMINANCE_ALPHA32F_ARB         0x8819
#define GL_RGBA16F_ARB                    0x881A
#define GL_RGB16F_ARB                     0x881B
#define GL_ALPHA16F_ARB                   0x881C
#define GL_INTENSITY16F_ARB               0x881D
#define GL_LUMINANCE16F_ARB               0x881E
#define GL_LUMINANCE_ALPHA16F_ARB         0x881F
#endif

#ifndef GL_ARB_pixel_buffer_object
#define GL_PIXEL_PACK_BUFFER_ARB          0x88EB
#define GL_PIXEL_UNPACK_BUFFER_ARB        0x88EC
#define GL_PIXEL_PACK_BUFFER_BINDING_ARB  0x88ED
#define GL_PIXEL_UNPACK_BUFFER_BINDING_ARB 0x88EF
#endif

#ifndef GL_EXT_abgr
#define GL_ABGR_EXT                       0x8000
#endif

#ifndef GL_EXT_blend_color
#define GL_CONSTANT_COLOR_EXT             0x8001
#define GL_ONE_MINUS_CONSTANT_COLOR_EXT   0x8002
#define GL_CONSTANT_ALPHA_EXT             0x8003
#define GL_ONE_MINUS_CONSTANT_ALPHA_EXT   0x8004
#define GL_BLEND_COLOR_EXT                0x8005
#endif

#ifndef GL_EXT_polygon_offset
#define GL_POLYGON_OFFSET_EXT             0x8037
#define GL_POLYGON_OFFSET_FACTOR_EXT      0x8038
#define GL_POLYGON_OFFSET_BIAS_EXT        0x8039
#endif

#ifndef GL_EXT_texture
#define GL_ALPHA4_EXT                     0x803B
#define GL_ALPHA8_EXT                     0x803C
#define GL_ALPHA12_EXT                    0x803D
#define GL_ALPHA16_EXT                    0x803E
#define GL_LUMINANCE4_EXT                 0x803F
#define GL_LUMINANCE8_EXT                 0x8040
#define GL_LUMINANCE12_EXT                0x8041
#define GL_LUMINANCE16_EXT                0x8042
#define GL_LUMINANCE4_ALPHA4_EXT          0x8043
#define GL_LUMINANCE6_ALPHA2_EXT          0x8044
#define GL_LUMINANCE8_ALPHA8_EXT          0x8045
#define GL_LUMINANCE12_ALPHA4_EXT         0x8046
#define GL_LUMINANCE12_ALPHA12_EXT        0x8047
#define GL_LUMINANCE16_ALPHA16_EXT        0x8048
#define GL_INTENSITY_EXT                  0x8049
#define GL_INTENSITY4_EXT                 0x804A
#define GL_INTENSITY8_EXT                 0x804B
#define GL_INTENSITY12_EXT                0x804C
#define GL_INTENSITY16_EXT                0x804D
#define GL_RGB2_EXT                       0x804E
#define GL_RGB4_EXT                       0x804F
#define GL_RGB5_EXT                       0x8050
#define GL_RGB8_EXT                       0x8051
#define GL_RGB10_EXT                      0x8052
#define GL_RGB12_EXT                      0x8053
#define GL_RGB16_EXT                      0x8054
#define GL_RGBA2_EXT                      0x8055
#define GL_RGBA4_EXT                      0x8056
#define GL_RGB5_A1_EXT                    0x8057
#define GL_RGBA8_EXT                      0x8058
#define GL_RGB10_A2_EXT                   0x8059
#define GL_RGBA12_EXT                     0x805A
#define GL_RGBA16_EXT                     0x805B
#define GL_TEXTURE_RED_SIZE_EXT           0x805C
#define GL_TEXTURE_GREEN_SIZE_EXT         0x805D
#define GL_TEXTURE_BLUE_SIZE_EXT          0x805E
#define GL_TEXTURE_ALPHA_SIZE_EXT         0x805F
#define GL_TEXTURE_LUMINANCE_SIZE_EXT     0x8060
#define GL_TEXTURE_INTENSITY_SIZE_EXT     0x8061
#define GL_REPLACE_EXT                    0x8062
#define GL_PROXY_TEXTURE_1D_EXT           0x8063
#define GL_PROXY_TEXTURE_2D_EXT           0x8064
#define GL_TEXTURE_TOO_LARGE_EXT          0x8065
#endif

#ifndef GL_EXT_texture3D
#define GL_PACK_SKIP_IMAGES_EXT           0x806B
#define GL_PACK_IMAGE_HEIGHT_EXT          0x806C
#define GL_UNPACK_SKIP_IMAGES_EXT         0x806D
#define GL_UNPACK_IMAGE_HEIGHT_EXT        0x806E
#define GL_TEXTURE_3D_EXT                 0x806F
#define GL_PROXY_TEXTURE_3D_EXT           0x8070
#define GL_TEXTURE_DEPTH_EXT              0x8071
#define GL_TEXTURE_WRAP_R_EXT             0x8072
#define GL_MAX_3D_TEXTURE_SIZE_EXT        0x8073
#endif

#ifndef GL_SGIS_texture_filter4
#define GL_FILTER4_SGIS                   0x8146
#define GL_TEXTURE_FILTER4_SIZE_SGIS      0x8147
#endif

#ifndef GL_EXT_subtexture
#endif

#ifndef GL_EXT_copy_texture
#endif

#ifndef GL_EXT_histogram
#define GL_HISTOGRAM_EXT                  0x8024
#define GL_PROXY_HISTOGRAM_EXT            0x8025
#define GL_HISTOGRAM_WIDTH_EXT            0x8026
#define GL_HISTOGRAM_FORMAT_EXT           0x8027
#define GL_HISTOGRAM_RED_SIZE_EXT         0x8028
#define GL_HISTOGRAM_GREEN_SIZE_EXT       0x8029
#define GL_HISTOGRAM_BLUE_SIZE_EXT        0x802A
#define GL_HISTOGRAM_ALPHA_SIZE_EXT       0x802B
#define GL_HISTOGRAM_LUMINANCE_SIZE_EXT   0x802C
#define GL_HISTOGRAM_SINK_EXT             0x802D
#define GL_MINMAX_EXT                     0x802E
#define GL_MINMAX_FORMAT_EXT              0x802F
#define GL_MINMAX_SINK_EXT                0x8030
#define GL_TABLE_TOO_LARGE_EXT            0x8031
#endif

#ifndef GL_EXT_convolution
#define GL_CONVOLUTION_1D_EXT             0x8010
#define GL_CONVOLUTION_2D_EXT             0x8011
#define GL_SEPARABLE_2D_EXT               0x8012
#define GL_CONVOLUTION_BORDER_MODE_EXT    0x8013
#define GL_CONVOLUTION_FILTER_SCALE_EXT   0x8014
#define GL_CONVOLUTION_FILTER_BIAS_EXT    0x8015
#define GL_REDUCE_EXT                     0x8016
#define GL_CONVOLUTION_FORMAT_EXT         0x8017
#define GL_CONVOLUTION_WIDTH_EXT          0x8018
#define GL_CONVOLUTION_HEIGHT_EXT         0x8019
#define GL_MAX_CONVOLUTION_WIDTH_EXT      0x801A
#define GL_MAX_CONVOLUTION_HEIGHT_EXT     0x801B
#define GL_POST_CONVOLUTION_RED_SCALE_EXT 0x801C
#define GL_POST_CONVOLUTION_GREEN_SCALE_EXT 0x801D
#define GL_POST_CONVOLUTION_BLUE_SCALE_EXT 0x801E
#define GL_POST_CONVOLUTION_ALPHA_SCALE_EXT 0x801F
#define GL_POST_CONVOLUTION_RED_BIAS_EXT  0x8020
#define GL_POST_CONVOLUTION_GREEN_BIAS_EXT 0x8021
#define GL_POST_CONVOLUTION_BLUE_BIAS_EXT 0x8022
#define GL_POST_CONVOLUTION_ALPHA_BIAS_EXT 0x8023
#endif

#ifndef GL_SGI_color_matrix
#define GL_COLOR_MATRIX_SGI               0x80B1
#define GL_COLOR_MATRIX_STACK_DEPTH_SGI   0x80B2
#define GL_MAX_COLOR_MATRIX_STACK_DEPTH_SGI 0x80B3
#define GL_POST_COLOR_MATRIX_RED_SCALE_SGI 0x80B4
#define GL_POST_COLOR_MATRIX_GREEN_SCALE_SGI 0x80B5
#define GL_POST_COLOR_MATRIX_BLUE_SCALE_SGI 0x80B6
#define GL_POST_COLOR_MATRIX_ALPHA_SCALE_SGI 0x80B7
#define GL_POST_COLOR_MATRIX_RED_BIAS_SGI 0x80B8
#define GL_POST_COLOR_MATRIX_GREEN_BIAS_SGI 0x80B9
#define GL_POST_COLOR_MATRIX_BLUE_BIAS_SGI 0x80BA
#define GL_POST_COLOR_MATRIX_ALPHA_BIAS_SGI 0x80BB
#endif

#ifndef GL_SGI_color_table
#define GL_COLOR_TABLE_SGI                0x80D0
#define GL_POST_CONVOLUTION_COLOR_TABLE_SGI 0x80D1
#define GL_POST_COLOR_MATRIX_COLOR_TABLE_SGI 0x80D2
#define GL_PROXY_COLOR_TABLE_SGI          0x80D3
#define GL_PROXY_POST_CONVOLUTION_COLOR_TABLE_SGI 0x80D4
#define GL_PROXY_POST_COLOR_MATRIX_COLOR_TABLE_SGI 0x80D5
#define GL_COLOR_TABLE_SCALE_SGI          0x80D6
#define GL_COLOR_TABLE_BIAS_SGI           0x80D7
#define GL_COLOR_TABLE_FORMAT_SGI         0x80D8
#define GL_COLOR_TABLE_WIDTH_SGI          0x80D9
#define GL_COLOR_TABLE_RED_SIZE_SGI       0x80DA
#define GL_COLOR_TABLE_GREEN_SIZE_SGI     0x80DB
#define GL_COLOR_TABLE_BLUE_SIZE_SGI      0x80DC
#define GL_COLOR_TABLE_ALPHA_SIZE_SGI     0x80DD
#define GL_COLOR_TABLE_LUMINANCE_SIZE_SGI 0x80DE
#define GL_COLOR_TABLE_INTENSITY_SIZE_SGI 0x80DF
#endif

#ifndef GL_SGIS_pixel_texture
#define GL_PIXEL_TEXTURE_SGIS             0x8353
#define GL_PIXEL_FRAGMENT_RGB_SOURCE_SGIS 0x8354
#define GL_PIXEL_FRAGMENT_ALPHA_SOURCE_SGIS 0x8355
#define GL_PIXEL_GROUP_COLOR_SGIS         0x8356
#endif

#ifndef GL_SGIX_pixel_texture
#define GL_PIXEL_TEX_GEN_SGIX             0x8139
#define GL_PIXEL_TEX_GEN_MODE_SGIX        0x832B
#endif

#ifndef GL_SGIS_texture4D
#define GL_PACK_SKIP_VOLUMES_SGIS         0x8130
#define GL_PACK_IMAGE_DEPTH_SGIS          0x8131
#define GL_UNPACK_SKIP_VOLUMES_SGIS       0x8132
#define GL_UNPACK_IMAGE_DEPTH_SGIS        0x8133
#define GL_TEXTURE_4D_SGIS                0x8134
#define GL_PROXY_TEXTURE_4D_SGIS          0x8135
#define GL_TEXTURE_4DSIZE_SGIS            0x8136
#define GL_TEXTURE_WRAP_Q_SGIS            0x8137
#define GL_MAX_4D_TEXTURE_SIZE_SGIS       0x8138
#define GL_TEXTURE_4D_BINDING_SGIS        0x814F
#endif

#ifndef GL_SGI_texture_color_table
#define GL_TEXTURE_COLOR_TABLE_SGI        0x80BC
#define GL_PROXY_TEXTURE_COLOR_TABLE_SGI  0x80BD
#endif

#ifndef GL_EXT_cmyka
#define GL_CMYK_EXT                       0x800C
#define GL_CMYKA_EXT                      0x800D
#define GL_PACK_CMYK_HINT_EXT             0x800E
#define GL_UNPACK_CMYK_HINT_EXT           0x800F
#endif

#ifndef GL_EXT_texture_object
#define GL_TEXTURE_PRIORITY_EXT           0x8066
#define GL_TEXTURE_RESIDENT_EXT           0x8067
#define GL_TEXTURE_1D_BINDING_EXT         0x8068
#define GL_TEXTURE_2D_BINDING_EXT         0x8069
#define GL_TEXTURE_3D_BINDING_EXT         0x806A
#endif

#ifndef GL_SGIS_detail_texture
#define GL_DETAIL_TEXTURE_2D_SGIS         0x8095
#define GL_DETAIL_TEXTURE_2D_BINDING_SGIS 0x8096
#define GL_LINEAR_DETAIL_SGIS             0x8097
#define GL_LINEAR_DETAIL_ALPHA_SGIS       0x8098
#define GL_LINEAR_DETAIL_COLOR_SGIS       0x8099
#define GL_DETAIL_TEXTURE_LEVEL_SGIS      0x809A
#define GL_DETAIL_TEXTURE_MODE_SGIS       0x809B
#define GL_DETAIL_TEXTURE_FUNC_POINTS_SGIS 0x809C
#endif

#ifndef GL_SGIS_sharpen_texture
#define GL_LINEAR_SHARPEN_SGIS            0x80AD
#define GL_LINEAR_SHARPEN_ALPHA_SGIS      0x80AE
#define GL_LINEAR_SHARPEN_COLOR_SGIS      0x80AF
#define GL_SHARPEN_TEXTURE_FUNC_POINTS_SGIS 0x80B0
#endif

#ifndef GL_EXT_packed_pixels
#define GL_UNSIGNED_BYTE_3_3_2_EXT        0x8032
#define GL_UNSIGNED_SHORT_4_4_4_4_EXT     0x8033
#define GL_UNSIGNED_SHORT_5_5_5_1_EXT     0x8034
#define GL_UNSIGNED_INT_8_8_8_8_EXT       0x8035
#define GL_UNSIGNED_INT_10_10_10_2_EXT    0x8036
#endif

#ifndef GL_SGIS_texture_lod
#define GL_TEXTURE_MIN_LOD_SGIS           0x813A
#define GL_TEXTURE_MAX_LOD_SGIS           0x813B
#define GL_TEXTURE_BASE_LEVEL_SGIS        0x813C
#define GL_TEXTURE_MAX_LEVEL_SGIS         0x813D
#endif

#ifndef GL_SGIS_multisample
#define GL_MULTISAMPLE_SGIS               0x809D
#define GL_SAMPLE_ALPHA_TO_MASK_SGIS      0x809E
#define GL_SAMPLE_ALPHA_TO_ONE_SGIS       0x809F
#define GL_SAMPLE_MASK_SGIS               0x80A0
#define GL_1PASS_SGIS                     0x80A1
#define GL_2PASS_0_SGIS                   0x80A2
#define GL_2PASS_1_SGIS                   0x80A3
#define GL_4PASS_0_SGIS                   0x80A4
#define GL_4PASS_1_SGIS                   0x80A5
#define GL_4PASS_2_SGIS                   0x80A6
#define GL_4PASS_3_SGIS                   0x80A7
#define GL_SAMPLE_BUFFERS_SGIS            0x80A8
#define GL_SAMPLES_SGIS                   0x80A9
#define GL_SAMPLE_MASK_VALUE_SGIS         0x80AA
#define GL_SAMPLE_MASK_INVERT_SGIS        0x80AB
#define GL_SAMPLE_PATTERN_SGIS            0x80AC
#endif

#ifndef GL_EXT_rescale_normal
#define GL_RESCALE_NORMAL_EXT             0x803A
#endif

#ifndef GL_EXT_vertex_array
#define GL_VERTEX_ARRAY_EXT               0x8074
#define GL_NORMAL_ARRAY_EXT               0x8075
#define GL_COLOR_ARRAY_EXT                0x8076
#define GL_INDEX_ARRAY_EXT                0x8077
#define GL_TEXTURE_COORD_ARRAY_EXT        0x8078
#define GL_EDGE_FLAG_ARRAY_EXT            0x8079
#define GL_VERTEX_ARRAY_SIZE_EXT          0x807A
#define GL_VERTEX_ARRAY_TYPE_EXT          0x807B
#define GL_VERTEX_ARRAY_STRIDE_EXT        0x807C
#define GL_VERTEX_ARRAY_COUNT_EXT         0x807D
#define GL_NORMAL_ARRAY_TYPE_EXT          0x807E
#define GL_NORMAL_ARRAY_STRIDE_EXT        0x807F
#define GL_NORMAL_ARRAY_COUNT_EXT         0x8080
#define GL_COLOR_ARRAY_SIZE_EXT           0x8081
#define GL_COLOR_ARRAY_TYPE_EXT           0x8082
#define GL_COLOR_ARRAY_STRIDE_EXT         0x8083
#define GL_COLOR_ARRAY_COUNT_EXT          0x8084
#define GL_INDEX_ARRAY_TYPE_EXT           0x8085
#define GL_INDEX_ARRAY_STRIDE_EXT         0x8086
#define GL_INDEX_ARRAY_COUNT_EXT          0x8087
#define GL_TEXTURE_COORD_ARRAY_SIZE_EXT   0x8088
#define GL_TEXTURE_COORD_ARRAY_TYPE_EXT   0x8089
#define GL_TEXTURE_COORD_ARRAY_STRIDE_EXT 0x808A
#define GL_TEXTURE_COORD_ARRAY_COUNT_EXT  0x808B
#define GL_EDGE_FLAG_ARRAY_STRIDE_EXT     0x808C
#define GL_EDGE_FLAG_ARRAY_COUNT_EXT      0x808D
#define GL_VERTEX_ARRAY_POINTER_EXT       0x808E
#define GL_NORMAL_ARRAY_POINTER_EXT       0x808F
#define GL_COLOR_ARRAY_POINTER_EXT        0x8090
#define GL_INDEX_ARRAY_POINTER_EXT        0x8091
#define GL_TEXTURE_COORD_ARRAY_POINTER_EXT 0x8092
#define GL_EDGE_FLAG_ARRAY_POINTER_EXT    0x8093
#endif

#ifndef GL_EXT_misc_attribute
#endif

#ifndef GL_SGIS_generate_mipmap
#define GL_GENERATE_MIPMAP_SGIS           0x8191
#define GL_GENERATE_MIPMAP_HINT_SGIS      0x8192
#endif

#ifndef GL_SGIX_clipmap
#define GL_LINEAR_CLIPMAP_LINEAR_SGIX     0x8170
#define GL_TEXTURE_CLIPMAP_CENTER_SGIX    0x8171
#define GL_TEXTURE_CLIPMAP_FRAME_SGIX     0x8172
#define GL_TEXTURE_CLIPMAP_OFFSET_SGIX    0x8173
#define GL_TEXTURE_CLIPMAP_VIRTUAL_DEPTH_SGIX 0x8174
#define GL_TEXTURE_CLIPMAP_LOD_OFFSET_SGIX 0x8175
#define GL_TEXTURE_CLIPMAP_DEPTH_SGIX     0x8176
#define GL_MAX_CLIPMAP_DEPTH_SGIX         0x8177
#define GL_MAX_CLIPMAP_VIRTUAL_DEPTH_SGIX 0x8178
#define GL_NEAREST_CLIPMAP_NEAREST_SGIX   0x844D
#define GL_NEAREST_CLIPMAP_LINEAR_SGIX    0x844E
#define GL_LINEAR_CLIPMAP_NEAREST_SGIX    0x844F
#endif

#ifndef GL_SGIX_shadow
#define GL_TEXTURE_COMPARE_SGIX           0x819A
#define GL_TEXTURE_COMPARE_OPERATOR_SGIX  0x819B
#define GL_TEXTURE_LEQUAL_R_SGIX          0x819C
#define GL_TEXTURE_GEQUAL_R_SGIX          0x819D
#endif

#ifndef GL_SGIS_texture_edge_clamp
#define GL_CLAMP_TO_EDGE_SGIS             0x812F
#endif

#ifndef GL_SGIS_texture_border_clamp
#define GL_CLAMP_TO_BORDER_SGIS           0x812D
#endif

#ifndef GL_EXT_blend_minmax
#define GL_FUNC_ADD_EXT                   0x8006
#define GL_MIN_EXT                        0x8007
#define GL_MAX_EXT                        0x8008
#define GL_BLEND_EQUATION_EXT             0x8009
#endif

#ifndef GL_EXT_blend_subtract
#define GL_FUNC_SUBTRACT_EXT              0x800A
#define GL_FUNC_REVERSE_SUBTRACT_EXT      0x800B
#endif

#ifndef GL_EXT_blend_logic_op
#endif

#ifndef GL_SGIX_interlace
#define GL_INTERLACE_SGIX                 0x8094
#endif

#ifndef GL_SGIX_pixel_tiles
#define GL_PIXEL_TILE_BEST_ALIGNMENT_SGIX 0x813E
#define GL_PIXEL_TILE_CACHE_INCREMENT_SGIX 0x813F
#define GL_PIXEL_TILE_WIDTH_SGIX          0x8140
#define GL_PIXEL_TILE_HEIGHT_SGIX         0x8141
#define GL_PIXEL_TILE_GRID_WIDTH_SGIX     0x8142
#define GL_PIXEL_TILE_GRID_HEIGHT_SGIX    0x8143
#define GL_PIXEL_TILE_GRID_DEPTH_SGIX     0x8144
#define GL_PIXEL_TILE_CACHE_SIZE_SGIX     0x8145
#endif

#ifndef GL_SGIS_texture_select
#define GL_DUAL_ALPHA4_SGIS               0x8110
#define GL_DUAL_ALPHA8_SGIS               0x8111
#define GL_DUAL_ALPHA12_SGIS              0x8112
#define GL_DUAL_ALPHA16_SGIS              0x8113
#define GL_DUAL_LUMINANCE4_SGIS           0x8114
#define GL_DUAL_LUMINANCE8_SGIS           0x8115
#define GL_DUAL_LUMINANCE12_SGIS          0x8116
#define GL_DUAL_LUMINANCE16_SGIS          0x8117
#define GL_DUAL_INTENSITY4_SGIS           0x8118
#define GL_DUAL_INTENSITY8_SGIS           0x8119
#define GL_DUAL_INTENSITY12_SGIS          0x811A
#define GL_DUAL_INTENSITY16_SGIS          0x811B
#define GL_DUAL_LUMINANCE_ALPHA4_SGIS     0x811C
#define GL_DUAL_LUMINANCE_ALPHA8_SGIS     0x811D
#define GL_QUAD_ALPHA4_SGIS               0x811E
#define GL_QUAD_ALPHA8_SGIS               0x811F
#define GL_QUAD_LUMINANCE4_SGIS           0x8120
#define GL_QUAD_LUMINANCE8_SGIS           0x8121
#define GL_QUAD_INTENSITY4_SGIS           0x8122
#define GL_QUAD_INTENSITY8_SGIS           0x8123
#define GL_DUAL_TEXTURE_SELECT_SGIS       0x8124
#define GL_QUAD_TEXTURE_SELECT_SGIS       0x8125
#endif

#ifndef GL_SGIX_sprite
#define GL_SPRITE_SGIX                    0x8148
#define GL_SPRITE_MODE_SGIX               0x8149
#define GL_SPRITE_AXIS_SGIX               0x814A
#define GL_SPRITE_TRANSLATION_SGIX        0x814B
#define GL_SPRITE_AXIAL_SGIX              0x814C
#define GL_SPRITE_OBJECT_ALIGNED_SGIX     0x814D
#define GL_SPRITE_EYE_ALIGNED_SGIX        0x814E
#endif

#ifndef GL_SGIX_texture_multi_buffer
#define GL_TEXTURE_MULTI_BUFFER_HINT_SGIX 0x812E
#endif

#ifndef GL_EXT_point_parameters
#define GL_POINT_SIZE_MIN_EXT             0x8126
#define GL_POINT_SIZE_MAX_EXT             0x8127
#define GL_POINT_FADE_THRESHOLD_SIZE_EXT  0x8128
#define GL_DISTANCE_ATTENUATION_EXT       0x8129
#endif

#ifndef GL_SGIS_point_parameters
#define GL_POINT_SIZE_MIN_SGIS            0x8126
#define GL_POINT_SIZE_MAX_SGIS            0x8127
#define GL_POINT_FADE_THRESHOLD_SIZE_SGIS 0x8128
#define GL_DISTANCE_ATTENUATION_SGIS      0x8129
#endif

#ifndef GL_SGIX_instruments
#define GL_INSTRUMENT_BUFFER_POINTER_SGIX 0x8180
#define GL_INSTRUMENT_MEASUREMENTS_SGIX   0x8181
#endif

#ifndef GL_SGIX_texture_scale_bias
#define GL_POST_TEXTURE_FILTER_BIAS_SGIX  0x8179
#define GL_POST_TEXTURE_FILTER_SCALE_SGIX 0x817A
#define GL_POST_TEXTURE_FILTER_BIAS_RANGE_SGIX 0x817B
#define GL_POST_TEXTURE_FILTER_SCALE_RANGE_SGIX 0x817C
#endif

#ifndef GL_SGIX_framezoom
#define GL_FRAMEZOOM_SGIX                 0x818B
#define GL_FRAMEZOOM_FACTOR_SGIX          0x818C
#define GL_MAX_FRAMEZOOM_FACTOR_SGIX      0x818D
#endif

#ifndef GL_SGIX_tag_sample_buffer
#endif

#ifndef GL_FfdMaskSGIX
#define GL_TEXTURE_DEFORMATION_BIT_SGIX   0x00000001
#define GL_GEOMETRY_DEFORMATION_BIT_SGIX  0x00000002
#endif

#ifndef GL_SGIX_polynomial_ffd
#define GL_GEOMETRY_DEFORMATION_SGIX      0x8194
#define GL_TEXTURE_DEFORMATION_SGIX       0x8195
#define GL_DEFORMATIONS_MASK_SGIX         0x8196
#define GL_MAX_DEFORMATION_ORDER_SGIX     0x8197
#endif

#ifndef GL_SGIX_reference_plane
#define GL_REFERENCE_PLANE_SGIX           0x817D
#define GL_REFERENCE_PLANE_EQUATION_SGIX  0x817E
#endif

#ifndef GL_SGIX_flush_raster
#endif

#ifndef GL_SGIX_depth_texture
#define GL_DEPTH_COMPONENT16_SGIX         0x81A5
#define GL_DEPTH_COMPONENT24_SGIX         0x81A6
#define GL_DEPTH_COMPONENT32_SGIX         0x81A7
#endif

#ifndef GL_SGIS_fog_function
#define GL_FOG_FUNC_SGIS                  0x812A
#define GL_FOG_FUNC_POINTS_SGIS           0x812B
#define GL_MAX_FOG_FUNC_POINTS_SGIS       0x812C
#endif

#ifndef GL_SGIX_fog_offset
#define GL_FOG_OFFSET_SGIX                0x8198
#define GL_FOG_OFFSET_VALUE_SGIX          0x8199
#endif

#ifndef GL_HP_image_transform
#define GL_IMAGE_SCALE_X_HP               0x8155
#define GL_IMAGE_SCALE_Y_HP               0x8156
#define GL_IMAGE_TRANSLATE_X_HP           0x8157
#define GL_IMAGE_TRANSLATE_Y_HP           0x8158
#define GL_IMAGE_ROTATE_ANGLE_HP          0x8159
#define GL_IMAGE_ROTATE_ORIGIN_X_HP       0x815A
#define GL_IMAGE_ROTATE_ORIGIN_Y_HP       0x815B
#define GL_IMAGE_MAG_FILTER_HP            0x815C
#define GL_IMAGE_MIN_FILTER_HP            0x815D
#define GL_IMAGE_CUBIC_WEIGHT_HP          0x815E
#define GL_CUBIC_HP                       0x815F
#define GL_AVERAGE_HP                     0x8160
#define GL_IMAGE_TRANSFORM_2D_HP          0x8161
#define GL_POST_IMAGE_TRANSFORM_COLOR_TABLE_HP 0x8162
#define GL_PROXY_POST_IMAGE_TRANSFORM_COLOR_TABLE_HP 0x8163
#endif

#ifndef GL_HP_convolution_border_modes
#define GL_IGNORE_BORDER_HP               0x8150
#define GL_CONSTANT_BORDER_HP             0x8151
#define GL_REPLICATE_BORDER_HP            0x8153
#define GL_CONVOLUTION_BORDER_COLOR_HP    0x8154
#endif

#ifndef GL_INGR_palette_buffer
#endif

#ifndef GL_SGIX_texture_add_env
#define GL_TEXTURE_ENV_BIAS_SGIX          0x80BE
#endif

#ifndef GL_EXT_color_subtable
#endif

#ifndef GL_PGI_vertex_hints
#define GL_VERTEX_DATA_HINT_PGI           0x1A22A
#define GL_VERTEX_CONSISTENT_HINT_PGI     0x1A22B
#define GL_MATERIAL_SIDE_HINT_PGI         0x1A22C
#define GL_MAX_VERTEX_HINT_PGI            0x1A22D
#define GL_COLOR3_BIT_PGI                 0x00010000
#define GL_COLOR4_BIT_PGI                 0x00020000
#define GL_EDGEFLAG_BIT_PGI               0x00040000
#define GL_INDEX_BIT_PGI                  0x00080000
#define GL_MAT_AMBIENT_BIT_PGI            0x00100000
#define GL_MAT_AMBIENT_AND_DIFFUSE_BIT_PGI 0x00200000
#define GL_MAT_DIFFUSE_BIT_PGI            0x00400000
#define GL_MAT_EMISSION_BIT_PGI           0x00800000
#define GL_MAT_COLOR_INDEXES_BIT_PGI      0x01000000
#define GL_MAT_SHININESS_BIT_PGI          0x02000000
#define GL_MAT_SPECULAR_BIT_PGI           0x04000000
#define GL_NORMAL_BIT_PGI                 0x08000000
#define GL_TEXCOORD1_BIT_PGI              0x10000000
#define GL_TEXCOORD2_BIT_PGI              0x20000000
#define GL_TEXCOORD3_BIT_PGI              0x40000000
#define GL_TEXCOORD4_BIT_PGI              0x80000000
#define GL_VERTEX23_BIT_PGI               0x00000004
#define GL_VERTEX4_BIT_PGI                0x00000008
#endif

#ifndef GL_PGI_misc_hints
#define GL_PREFER_DOUBLEBUFFER_HINT_PGI   0x1A1F8
#define GL_CONSERVE_MEMORY_HINT_PGI       0x1A1FD
#define GL_RECLAIM_MEMORY_HINT_PGI        0x1A1FE
#define GL_NATIVE_GRAPHICS_HANDLE_PGI     0x1A202
#define GL_NATIVE_GRAPHICS_BEGIN_HINT_PGI 0x1A203
#define GL_NATIVE_GRAPHICS_END_HINT_PGI   0x1A204
#define GL_ALWAYS_FAST_HINT_PGI           0x1A20C
#define GL_ALWAYS_SOFT_HINT_PGI           0x1A20D
#define GL_ALLOW_DRAW_OBJ_HINT_PGI        0x1A20E
#define GL_ALLOW_DRAW_WIN_HINT_PGI        0x1A20F
#define GL_ALLOW_DRAW_FRG_HINT_PGI        0x1A210
#define GL_ALLOW_DRAW_MEM_HINT_PGI        0x1A211
#define GL_STRICT_DEPTHFUNC_HINT_PGI      0x1A216
#define GL_STRICT_LIGHTING_HINT_PGI       0x1A217
#define GL_STRICT_SCISSOR_HINT_PGI        0x1A218
#define GL_FULL_STIPPLE_HINT_PGI          0x1A219
#define GL_CLIP_NEAR_HINT_PGI             0x1A220
#define GL_CLIP_FAR_HINT_PGI              0x1A221
#define GL_WIDE_LINE_HINT_PGI             0x1A222
#define GL_BACK_NORMALS_HINT_PGI          0x1A223
#endif

#ifndef GL_EXT_paletted_texture
#define GL_COLOR_INDEX1_EXT               0x80E2
#define GL_COLOR_INDEX2_EXT               0x80E3
#define GL_COLOR_INDEX4_EXT               0x80E4
#define GL_COLOR_INDEX8_EXT               0x80E5
#define GL_COLOR_INDEX12_EXT              0x80E6
#define GL_COLOR_INDEX16_EXT              0x80E7
#define GL_TEXTURE_INDEX_SIZE_EXT         0x80ED
#endif

#ifndef GL_EXT_clip_volume_hint
#define GL_CLIP_VOLUME_CLIPPING_HINT_EXT  0x80F0
#endif

#ifndef GL_SGIX_list_priority
#define GL_LIST_PRIORITY_SGIX             0x8182
#endif

#ifndef GL_SGIX_ir_instrument1
#define GL_IR_INSTRUMENT1_SGIX            0x817F
#endif

#ifndef GL_SGIX_calligraphic_fragment
#define GL_CALLIGRAPHIC_FRAGMENT_SGIX     0x8183
#endif

#ifndef GL_SGIX_texture_lod_bias
#define GL_TEXTURE_LOD_BIAS_S_SGIX        0x818E
#define GL_TEXTURE_LOD_BIAS_T_SGIX        0x818F
#define GL_TEXTURE_LOD_BIAS_R_SGIX        0x8190
#endif

#ifndef GL_SGIX_shadow_ambient
#define GL_SHADOW_AMBIENT_SGIX            0x80BF
#endif

#ifndef GL_EXT_index_texture
#endif

#ifndef GL_EXT_index_material
#define GL_INDEX_MATERIAL_EXT             0x81B8
#define GL_INDEX_MATERIAL_PARAMETER_EXT   0x81B9
#define GL_INDEX_MATERIAL_FACE_EXT        0x81BA
#endif

#ifndef GL_EXT_index_func
#define GL_INDEX_TEST_EXT                 0x81B5
#define GL_INDEX_TEST_FUNC_EXT            0x81B6
#define GL_INDEX_TEST_REF_EXT             0x81B7
#endif

#ifndef GL_EXT_index_array_formats
#define GL_IUI_V2F_EXT                    0x81AD
#define GL_IUI_V3F_EXT                    0x81AE
#define GL_IUI_N3F_V2F_EXT                0x81AF
#define GL_IUI_N3F_V3F_EXT                0x81B0
#define GL_T2F_IUI_V2F_EXT                0x81B1
#define GL_T2F_IUI_V3F_EXT                0x81B2
#define GL_T2F_IUI_N3F_V2F_EXT            0x81B3
#define GL_T2F_IUI_N3F_V3F_EXT            0x81B4
#endif

#ifndef GL_EXT_compiled_vertex_array
#define GL_ARRAY_ELEMENT_LOCK_FIRST_EXT   0x81A8
#define GL_ARRAY_ELEMENT_LOCK_COUNT_EXT   0x81A9
#endif

#ifndef GL_EXT_cull_vertex
#define GL_CULL_VERTEX_EXT                0x81AA
#define GL_CULL_VERTEX_EYE_POSITION_EXT   0x81AB
#define GL_CULL_VERTEX_OBJECT_POSITION_EXT 0x81AC
#endif

#ifndef GL_SGIX_ycrcb
#define GL_YCRCB_422_SGIX                 0x81BB
#define GL_YCRCB_444_SGIX                 0x81BC
#endif

#ifndef GL_SGIX_fragment_lighting
#define GL_FRAGMENT_LIGHTING_SGIX         0x8400
#define GL_FRAGMENT_COLOR_MATERIAL_SGIX   0x8401
#define GL_FRAGMENT_COLOR_MATERIAL_FACE_SGIX 0x8402
#define GL_FRAGMENT_COLOR_MATERIAL_PARAMETER_SGIX 0x8403
#define GL_MAX_FRAGMENT_LIGHTS_SGIX       0x8404
#define GL_MAX_ACTIVE_LIGHTS_SGIX         0x8405
#define GL_CURRENT_RASTER_NORMAL_SGIX     0x8406
#define GL_LIGHT_ENV_MODE_SGIX            0x8407
#define GL_FRAGMENT_LIGHT_MODEL_LOCAL_VIEWER_SGIX 0x8408
#define GL_FRAGMENT_LIGHT_MODEL_TWO_SIDE_SGIX 0x8409
#define GL_FRAGMENT_LIGHT_MODEL_AMBIENT_SGIX 0x840A
#define GL_FRAGMENT_LIGHT_MODEL_NORMAL_INTERPOLATION_SGIX 0x840B
#define GL_FRAGMENT_LIGHT0_SGIX           0x840C
#define GL_FRAGMENT_LIGHT1_SGIX           0x840D
#define GL_FRAGMENT_LIGHT2_SGIX           0x840E
#define GL_FRAGMENT_LIGHT3_SGIX           0x840F
#define GL_FRAGMENT_LIGHT4_SGIX           0x8410
#define GL_FRAGMENT_LIGHT5_SGIX           0x8411
#define GL_FRAGMENT_LIGHT6_SGIX           0x8412
#define GL_FRAGMENT_LIGHT7_SGIX           0x8413
#endif

#ifndef GL_IBM_rasterpos_clip
#define GL_RASTER_POSITION_UNCLIPPED_IBM  0x19262
#endif

#ifndef GL_HP_texture_lighting
#define GL_TEXTURE_LIGHTING_MODE_HP       0x8167
#define GL_TEXTURE_POST_SPECULAR_HP       0x8168
#define GL_TEXTURE_PRE_SPECULAR_HP        0x8169
#endif

#ifndef GL_EXT_draw_range_elements
#define GL_MAX_ELEMENTS_VERTICES_EXT      0x80E8
#define GL_MAX_ELEMENTS_INDICES_EXT       0x80E9
#endif

#ifndef GL_WIN_phong_shading
#define GL_PHONG_WIN                      0x80EA
#define GL_PHONG_HINT_WIN                 0x80EB
#endif

#ifndef GL_WIN_specular_fog
#define GL_FOG_SPECULAR_TEXTURE_WIN       0x80EC
#endif

#ifndef GL_EXT_light_texture
#define GL_FRAGMENT_MATERIAL_EXT          0x8349
#define GL_FRAGMENT_NORMAL_EXT            0x834A
#define GL_FRAGMENT_COLOR_EXT             0x834C
#define GL_ATTENUATION_EXT                0x834D
#define GL_SHADOW_ATTENUATION_EXT         0x834E
#define GL_TEXTURE_APPLICATION_MODE_EXT   0x834F
#define GL_TEXTURE_LIGHT_EXT              0x8350
#define GL_TEXTURE_MATERIAL_FACE_EXT      0x8351
#define GL_TEXTURE_MATERIAL_PARAMETER_EXT 0x8352
/* reuse GL_FRAGMENT_DEPTH_EXT */
#endif

#ifndef GL_SGIX_blend_alpha_minmax
#define GL_ALPHA_MIN_SGIX                 0x8320
#define GL_ALPHA_MAX_SGIX                 0x8321
#endif

#ifndef GL_SGIX_impact_pixel_texture
#define GL_PIXEL_TEX_GEN_Q_CEILING_SGIX   0x8184
#define GL_PIXEL_TEX_GEN_Q_ROUND_SGIX     0x8185
#define GL_PIXEL_TEX_GEN_Q_FLOOR_SGIX     0x8186
#define GL_PIXEL_TEX_GEN_ALPHA_REPLACE_SGIX 0x8187
#define GL_PIXEL_TEX_GEN_ALPHA_NO_REPLACE_SGIX 0x8188
#define GL_PIXEL_TEX_GEN_ALPHA_LS_SGIX    0x8189
#define GL_PIXEL_TEX_GEN_ALPHA_MS_SGIX    0x818A
#endif

#ifndef GL_EXT_bgra
#define GL_BGR_EXT                        0x80E0
#define GL_BGRA_EXT                       0x80E1
#endif

#ifndef GL_SGIX_async
#define GL_ASYNC_MARKER_SGIX              0x8329
#endif

#ifndef GL_SGIX_async_pixel
#define GL_ASYNC_TEX_IMAGE_SGIX           0x835C
#define GL_ASYNC_DRAW_PIXELS_SGIX         0x835D
#define GL_ASYNC_READ_PIXELS_SGIX         0x835E
#define GL_MAX_ASYNC_TEX_IMAGE_SGIX       0x835F
#define GL_MAX_ASYNC_DRAW_PIXELS_SGIX     0x8360
#define GL_MAX_ASYNC_READ_PIXELS_SGIX     0x8361
#endif

#ifndef GL_SGIX_async_histogram
#define GL_ASYNC_HISTOGRAM_SGIX           0x832C
#define GL_MAX_ASYNC_HISTOGRAM_SGIX       0x832D
#endif

#ifndef GL_INTEL_texture_scissor
#endif

#ifndef GL_INTEL_parallel_arrays
#define GL_PARALLEL_ARRAYS_INTEL          0x83F4
#define GL_VERTEX_ARRAY_PARALLEL_POINTERS_INTEL 0x83F5
#define GL_NORMAL_ARRAY_PARALLEL_POINTERS_INTEL 0x83F6
#define GL_COLOR_ARRAY_PARALLEL_POINTERS_INTEL 0x83F7
#define GL_TEXTURE_COORD_ARRAY_PARALLEL_POINTERS_INTEL 0x83F8
#endif

#ifndef GL_HP_occlusion_test
#define GL_OCCLUSION_TEST_HP              0x8165
#define GL_OCCLUSION_TEST_RESULT_HP       0x8166
#endif

#ifndef GL_EXT_pixel_transform
#define GL_PIXEL_TRANSFORM_2D_EXT         0x8330
#define GL_PIXEL_MAG_FILTER_EXT           0x8331
#define GL_PIXEL_MIN_FILTER_EXT           0x8332
#define GL_PIXEL_CUBIC_WEIGHT_EXT         0x8333
#define GL_CUBIC_EXT                      0x8334
#define GL_AVERAGE_EXT                    0x8335
#define GL_PIXEL_TRANSFORM_2D_STACK_DEPTH_EXT 0x8336
#define GL_MAX_PIXEL_TRANSFORM_2D_STACK_DEPTH_EXT 0x8337
#define GL_PIXEL_TRANSFORM_2D_MATRIX_EXT  0x8338
#endif

#ifndef GL_EXT_pixel_transform_color_table
#endif

#ifndef GL_EXT_shared_texture_palette
#define GL_SHARED_TEXTURE_PALETTE_EXT     0x81FB
#endif

#ifndef GL_EXT_separate_specular_color
#define GL_LIGHT_MODEL_COLOR_CONTROL_EXT  0x81F8
#define GL_SINGLE_COLOR_EXT               0x81F9
#define GL_SEPARATE_SPECULAR_COLOR_EXT    0x81FA
#endif

#ifndef GL_EXT_secondary_color
#define GL_COLOR_SUM_EXT                  0x8458
#define GL_CURRENT_SECONDARY_COLOR_EXT    0x8459
#define GL_SECONDARY_COLOR_ARRAY_SIZE_EXT 0x845A
#define GL_SECONDARY_COLOR_ARRAY_TYPE_EXT 0x845B
#define GL_SECONDARY_COLOR_ARRAY_STRIDE_EXT 0x845C
#define GL_SECONDARY_COLOR_ARRAY_POINTER_EXT 0x845D
#define GL_SECONDARY_COLOR_ARRAY_EXT      0x845E
#endif

#ifndef GL_EXT_texture_perturb_normal
#define GL_PERTURB_EXT                    0x85AE
#define GL_TEXTURE_NORMAL_EXT             0x85AF
#endif

#ifndef GL_EXT_multi_draw_arrays
#endif

#ifndef GL_EXT_fog_coord
#define GL_FOG_COORDINATE_SOURCE_EXT      0x8450
#define GL_FOG_COORDINATE_EXT             0x8451
#define GL_FRAGMENT_DEPTH_EXT             0x8452
#define GL_CURRENT_FOG_COORDINATE_EXT     0x8453
#define GL_FOG_COORDINATE_ARRAY_TYPE_EXT  0x8454
#define GL_FOG_COORDINATE_ARRAY_STRIDE_EXT 0x8455
#define GL_FOG_COORDINATE_ARRAY_POINTER_EXT 0x8456
#define GL_FOG_COORDINATE_ARRAY_EXT       0x8457
#endif

#ifndef GL_REND_screen_coordinates
#define GL_SCREEN_COORDINATES_REND        0x8490
#define GL_INVERTED_SCREEN_W_REND         0x8491
#endif

#ifndef GL_EXT_coordinate_frame
#define GL_TANGENT_ARRAY_EXT              0x8439
#define GL_BINORMAL_ARRAY_EXT             0x843A
#define GL_CURRENT_TANGENT_EXT            0x843B
#define GL_CURRENT_BINORMAL_EXT           0x843C
#define GL_TANGENT_ARRAY_TYPE_EXT         0x843E
#define GL_TANGENT_ARRAY_STRIDE_EXT       0x843F
#define GL_BINORMAL_ARRAY_TYPE_EXT        0x8440
#define GL_BINORMAL_ARRAY_STRIDE_EXT      0x8441
#define GL_TANGENT_ARRAY_POINTER_EXT      0x8442
#define GL_BINORMAL_ARRAY_POINTER_EXT     0x8443
#define GL_MAP1_TANGENT_EXT               0x8444
#define GL_MAP2_TANGENT_EXT               0x8445
#define GL_MAP1_BINORMAL_EXT              0x8446
#define GL_MAP2_BINORMAL_EXT              0x8447
#endif

#ifndef GL_EXT_texture_env_combine
#define GL_COMBINE_EXT                    0x8570
#define GL_COMBINE_RGB_EXT                0x8571
#define GL_COMBINE_ALPHA_EXT              0x8572
#define GL_RGB_SCALE_EXT                  0x8573
#define GL_ADD_SIGNED_EXT                 0x8574
#define GL_INTERPOLATE_EXT                0x8575
#define GL_CONSTANT_EXT                   0x8576
#define GL_PRIMARY_COLOR_EXT              0x8577
#define GL_PREVIOUS_EXT                   0x8578
#define GL_SOURCE0_RGB_EXT                0x8580
#define GL_SOURCE1_RGB_EXT                0x8581
#define GL_SOURCE2_RGB_EXT                0x8582
#define GL_SOURCE0_ALPHA_EXT              0x8588
#define GL_SOURCE1_ALPHA_EXT              0x8589
#define GL_SOURCE2_ALPHA_EXT              0x858A
#define GL_OPERAND0_RGB_EXT               0x8590
#define GL_OPERAND1_RGB_EXT               0x8591
#define GL_OPERAND2_RGB_EXT               0x8592
#define GL_OPERAND0_ALPHA_EXT             0x8598
#define GL_OPERAND1_ALPHA_EXT             0x8599
#define GL_OPERAND2_ALPHA_EXT             0x859A
#endif

#ifndef GL_APPLE_specular_vector
#define GL_LIGHT_MODEL_SPECULAR_VECTOR_APPLE 0x85B0
#endif

#ifndef GL_APPLE_transform_hint
#define GL_TRANSFORM_HINT_APPLE           0x85B1
#endif

#ifndef GL_SGIX_fog_scale
#define GL_FOG_SCALE_SGIX                 0x81FC
#define GL_FOG_SCALE_VALUE_SGIX           0x81FD
#endif

#ifndef GL_SUNX_constant_data
#define GL_UNPACK_CONSTANT_DATA_SUNX      0x81D5
#define GL_TEXTURE_CONSTANT_DATA_SUNX     0x81D6
#endif

#ifndef GL_SUN_global_alpha
#define GL_GLOBAL_ALPHA_SUN               0x81D9
#define GL_GLOBAL_ALPHA_FACTOR_SUN        0x81DA
#endif

#ifndef GL_SUN_triangle_list
#define GL_RESTART_SUN                    0x0001
#define GL_REPLACE_MIDDLE_SUN             0x0002
#define GL_REPLACE_OLDEST_SUN             0x0003
#define GL_TRIANGLE_LIST_SUN              0x81D7
#define GL_REPLACEMENT_CODE_SUN           0x81D8
#define GL_REPLACEMENT_CODE_ARRAY_SUN     0x85C0
#define GL_REPLACEMENT_CODE_ARRAY_TYPE_SUN 0x85C1
#define GL_REPLACEMENT_CODE_ARRAY_STRIDE_SUN 0x85C2
#define GL_REPLACEMENT_CODE_ARRAY_POINTER_SUN 0x85C3
#define GL_R1UI_V3F_SUN                   0x85C4
#define GL_R1UI_C4UB_V3F_SUN              0x85C5
#define GL_R1UI_C3F_V3F_SUN               0x85C6
#define GL_R1UI_N3F_V3F_SUN               0x85C7
#define GL_R1UI_C4F_N3F_V3F_SUN           0x85C8
#define GL_R1UI_T2F_V3F_SUN               0x85C9
#define GL_R1UI_T2F_N3F_V3F_SUN           0x85CA
#define GL_R1UI_T2F_C4F_N3F_V3F_SUN       0x85CB
#endif

#ifndef GL_SUN_vertex
#endif

#ifndef GL_EXT_blend_func_separate
#define GL_BLEND_DST_RGB_EXT              0x80C8
#define GL_BLEND_SRC_RGB_EXT              0x80C9
#define GL_BLEND_DST_ALPHA_EXT            0x80CA
#define GL_BLEND_SRC_ALPHA_EXT            0x80CB
#endif

#ifndef GL_INGR_color_clamp
#define GL_RED_MIN_CLAMP_INGR             0x8560
#define GL_GREEN_MIN_CLAMP_INGR           0x8561
#define GL_BLUE_MIN_CLAMP_INGR            0x8562
#define GL_ALPHA_MIN_CLAMP_INGR           0x8563
#define GL_RED_MAX_CLAMP_INGR             0x8564
#define GL_GREEN_MAX_CLAMP_INGR           0x8565
#define GL_BLUE_MAX_CLAMP_INGR            0x8566
#define GL_ALPHA_MAX_CLAMP_INGR           0x8567
#endif

#ifndef GL_INGR_interlace_read
#define GL_INTERLACE_READ_INGR            0x8568
#endif

#ifndef GL_EXT_stencil_wrap
#define GL_INCR_WRAP_EXT                  0x8507
#define GL_DECR_WRAP_EXT                  0x8508
#endif

#ifndef GL_EXT_422_pixels
#define GL_422_EXT                        0x80CC
#define GL_422_REV_EXT                    0x80CD
#define GL_422_AVERAGE_EXT                0x80CE
#define GL_422_REV_AVERAGE_EXT            0x80CF
#endif

#ifndef GL_NV_texgen_reflection
#define GL_NORMAL_MAP_NV                  0x8511
#define GL_REFLECTION_MAP_NV              0x8512
#endif

#ifndef GL_EXT_texture_cube_map
#define GL_NORMAL_MAP_EXT                 0x8511
#define GL_REFLECTION_MAP_EXT             0x8512
#define GL_TEXTURE_CUBE_MAP_EXT           0x8513
#define GL_TEXTURE_BINDING_CUBE_MAP_EXT   0x8514
#define GL_TEXTURE_CUBE_MAP_POSITIVE_X_EXT 0x8515
#define GL_TEXTURE_CUBE_MAP_NEGATIVE_X_EXT 0x8516
#define GL_TEXTURE_CUBE_MAP_POSITIVE_Y_EXT 0x8517
#define GL_TEXTURE_CUBE_MAP_NEGATIVE_Y_EXT 0x8518
#define GL_TEXTURE_CUBE_MAP_POSITIVE_Z_EXT 0x8519
#define GL_TEXTURE_CUBE_MAP_NEGATIVE_Z_EXT 0x851A
#define GL_PROXY_TEXTURE_CUBE_MAP_EXT     0x851B
#define GL_MAX_CUBE_MAP_TEXTURE_SIZE_EXT  0x851C
#endif

#ifndef GL_SUN_convolution_border_modes
#define GL_WRAP_BORDER_SUN                0x81D4
#endif

#ifndef GL_EXT_texture_env_add
#endif

#ifndef GL_EXT_texture_lod_bias
#define GL_MAX_TEXTURE_LOD_BIAS_EXT       0x84FD
#define GL_TEXTURE_FILTER_CONTROL_EXT     0x8500
#define GL_TEXTURE_LOD_BIAS_EXT           0x8501
#endif

#ifndef GL_EXT_texture_filter_anisotropic
#define GL_TEXTURE_MAX_ANISOTROPY_EXT     0x84FE
#define GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT 0x84FF
#endif

#ifndef GL_EXT_vertex_weighting
#define GL_MODELVIEW0_STACK_DEPTH_EXT     GL_MODELVIEW_STACK_DEPTH
#define GL_MODELVIEW1_STACK_DEPTH_EXT     0x8502
#define GL_MODELVIEW0_MATRIX_EXT          GL_MODELVIEW_MATRIX
#define GL_MODELVIEW1_MATRIX_EXT          0x8506
#define GL_VERTEX_WEIGHTING_EXT           0x8509
#define GL_MODELVIEW0_EXT                 GL_MODELVIEW
#define GL_MODELVIEW1_EXT                 0x850A
#define GL_CURRENT_VERTEX_WEIGHT_EXT      0x850B
#define GL_VERTEX_WEIGHT_ARRAY_EXT        0x850C
#define GL_VERTEX_WEIGHT_ARRAY_SIZE_EXT   0x850D
#define GL_VERTEX_WEIGHT_ARRAY_TYPE_EXT   0x850E
#define GL_VERTEX_WEIGHT_ARRAY_STRIDE_EXT 0x850F
#define GL_VERTEX_WEIGHT_ARRAY_POINTER_EXT 0x8510
#endif

#ifndef GL_NV_light_max_exponent
#define GL_MAX_SHININESS_NV               0x8504
#define GL_MAX_SPOT_EXPONENT_NV           0x8505
#endif

#ifndef GL_NV_vertex_array_range
#define GL_VERTEX_ARRAY_RANGE_NV          0x851D
#define GL_VERTEX_ARRAY_RANGE_LENGTH_NV   0x851E
#define GL_VERTEX_ARRAY_RANGE_VALID_NV    0x851F
#define GL_MAX_VERTEX_ARRAY_RANGE_ELEMENT_NV 0x8520
#define GL_VERTEX_ARRAY_RANGE_POINTER_NV  0x8521
#endif

#ifndef GL_NV_register_combiners
#define GL_REGISTER_COMBINERS_NV          0x8522
#define GL_VARIABLE_A_NV                  0x8523
#define GL_VARIABLE_B_NV                  0x8524
#define GL_VARIABLE_C_NV                  0x8525
#define GL_VARIABLE_D_NV                  0x8526
#define GL_VARIABLE_E_NV                  0x8527
#define GL_VARIABLE_F_NV                  0x8528
#define GL_VARIABLE_G_NV                  0x8529
#define GL_CONSTANT_COLOR0_NV             0x852A
#define GL_CONSTANT_COLOR1_NV             0x852B
#define GL_PRIMARY_COLOR_NV               0x852C
#define GL_SECONDARY_COLOR_NV             0x852D
#define GL_SPARE0_NV                      0x852E
#define GL_SPARE1_NV                      0x852F
#define GL_DISCARD_NV                     0x8530
#define GL_E_TIMES_F_NV                   0x8531
#define GL_SPARE0_PLUS_SECONDARY_COLOR_NV 0x8532
#define GL_UNSIGNED_IDENTITY_NV           0x8536
#define GL_UNSIGNED_INVERT_NV             0x8537
#define GL_EXPAND_NORMAL_NV               0x8538
#define GL_EXPAND_NEGATE_NV               0x8539
#define GL_HALF_BIAS_NORMAL_NV            0x853A
#define GL_HALF_BIAS_NEGATE_NV            0x853B
#define GL_SIGNED_IDENTITY_NV             0x853C
#define GL_SIGNED_NEGATE_NV               0x853D
#define GL_SCALE_BY_TWO_NV                0x853E
#define GL_SCALE_BY_FOUR_NV               0x853F
#define GL_SCALE_BY_ONE_HALF_NV           0x8540
#define GL_BIAS_BY_NEGATIVE_ONE_HALF_NV   0x8541
#define GL_COMBINER_INPUT_NV              0x8542
#define GL_COMBINER_MAPPING_NV            0x8543
#define GL_COMBINER_COMPONENT_USAGE_NV    0x8544
#define GL_COMBINER_AB_DOT_PRODUCT_NV     0x8545
#define GL_COMBINER_CD_DOT_PRODUCT_NV     0x8546
#define GL_COMBINER_MUX_SUM_NV            0x8547
#define GL_COMBINER_SCALE_NV              0x8548
#define GL_COMBINER_BIAS_NV               0x8549
#define GL_COMBINER_AB_OUTPUT_NV          0x854A
#define GL_COMBINER_CD_OUTPUT_NV          0x854B
#define GL_COMBINER_SUM_OUTPUT_NV         0x854C
#define GL_MAX_GENERAL_COMBINERS_NV       0x854D
#define GL_NUM_GENERAL_COMBINERS_NV       0x854E
#define GL_COLOR_SUM_CLAMP_NV             0x854F
#define GL_COMBINER0_NV                   0x8550
#define GL_COMBINER1_NV                   0x8551
#define GL_COMBINER2_NV                   0x8552
#define GL_COMBINER3_NV                   0x8553
#define GL_COMBINER4_NV                   0x8554
#define GL_COMBINER5_NV                   0x8555
#define GL_COMBINER6_NV                   0x8556
#define GL_COMBINER7_NV                   0x8557
/* reuse GL_TEXTURE0_ARB */
/* reuse GL_TEXTURE1_ARB */
/* reuse GL_ZERO */
/* reuse GL_NONE */
/* reuse GL_FOG */
#endif

#ifndef GL_NV_fog_distance
#define GL_FOG_DISTANCE_MODE_NV           0x855A
#define GL_EYE_RADIAL_NV                  0x855B
#define GL_EYE_PLANE_ABSOLUTE_NV          0x855C
/* reuse GL_EYE_PLANE */
#endif

#ifndef GL_NV_texgen_emboss
#define GL_EMBOSS_LIGHT_NV                0x855D
#define GL_EMBOSS_CONSTANT_NV             0x855E
#define GL_EMBOSS_MAP_NV                  0x855F
#endif

#ifndef GL_NV_blend_square
#endif

#ifndef GL_NV_texture_env_combine4
#define GL_COMBINE4_NV                    0x8503
#define GL_SOURCE3_RGB_NV                 0x8583
#define GL_SOURCE3_ALPHA_NV               0x858B
#define GL_OPERAND3_RGB_NV                0x8593
#define GL_OPERAND3_ALPHA_NV              0x859B
#endif

#ifndef GL_MESA_resize_buffers
#endif

#ifndef GL_MESA_window_pos
#endif

#ifndef GL_EXT_texture_compression_s3tc
#define GL_COMPRESSED_RGB_S3TC_DXT1_EXT   0x83F0
#define GL_COMPRESSED_RGBA_S3TC_DXT1_EXT  0x83F1
#define GL_COMPRESSED_RGBA_S3TC_DXT3_EXT  0x83F2
#define GL_COMPRESSED_RGBA_S3TC_DXT5_EXT  0x83F3
#endif

#ifndef GL_IBM_cull_vertex
#define GL_CULL_VERTEX_IBM                103050
#endif

#ifndef GL_IBM_multimode_draw_arrays
#endif

#ifndef GL_IBM_vertex_array_lists
#define GL_VERTEX_ARRAY_LIST_IBM          103070
#define GL_NORMAL_ARRAY_LIST_IBM          103071
#define GL_COLOR_ARRAY_LIST_IBM           103072
#define GL_INDEX_ARRAY_LIST_IBM           103073
#define GL_TEXTURE_COORD_ARRAY_LIST_IBM   103074
#define GL_EDGE_FLAG_ARRAY_LIST_IBM       103075
#define GL_FOG_COORDINATE_ARRAY_LIST_IBM  103076
#define GL_SECONDARY_COLOR_ARRAY_LIST_IBM 103077
#define GL_VERTEX_ARRAY_LIST_STRIDE_IBM   103080
#define GL_NORMAL_ARRAY_LIST_STRIDE_IBM   103081
#define GL_COLOR_ARRAY_LIST_STRIDE_IBM    103082
#define GL_INDEX_ARRAY_LIST_STRIDE_IBM    103083
#define GL_TEXTURE_COORD_ARRAY_LIST_STRIDE_IBM 103084
#define GL_EDGE_FLAG_ARRAY_LIST_STRIDE_IBM 103085
#define GL_FOG_COORDINATE_ARRAY_LIST_STRIDE_IBM 103086
#define GL_SECONDARY_COLOR_ARRAY_LIST_STRIDE_IBM 103087
#endif

#ifndef GL_SGIX_subsample
#define GL_PACK_SUBSAMPLE_RATE_SGIX       0x85A0
#define GL_UNPACK_SUBSAMPLE_RATE_SGIX     0x85A1
#define GL_PIXEL_SUBSAMPLE_4444_SGIX      0x85A2
#define GL_PIXEL_SUBSAMPLE_2424_SGIX      0x85A3
#define GL_PIXEL_SUBSAMPLE_4242_SGIX      0x85A4
#endif

#ifndef GL_SGIX_ycrcb_subsample
#endif

#ifndef GL_SGIX_ycrcba
#define GL_YCRCB_SGIX                     0x8318
#define GL_YCRCBA_SGIX                    0x8319
#endif

#ifndef GL_SGI_depth_pass_instrument
#define GL_DEPTH_PASS_INSTRUMENT_SGIX     0x8310
#define GL_DEPTH_PASS_INSTRUMENT_COUNTERS_SGIX 0x8311
#define GL_DEPTH_PASS_INSTRUMENT_MAX_SGIX 0x8312
#endif

#ifndef GL_3DFX_texture_compression_FXT1
#define GL_COMPRESSED_RGB_FXT1_3DFX       0x86B0
#define GL_COMPRESSED_RGBA_FXT1_3DFX      0x86B1
#endif

#ifndef GL_3DFX_multisample
#define GL_MULTISAMPLE_3DFX               0x86B2
#define GL_SAMPLE_BUFFERS_3DFX            0x86B3
#define GL_SAMPLES_3DFX                   0x86B4
#define GL_MULTISAMPLE_BIT_3DFX           0x20000000
#endif

#ifndef GL_3DFX_tbuffer
#endif

#ifndef GL_EXT_multisample
#define GL_MULTISAMPLE_EXT                0x809D
#define GL_SAMPLE_ALPHA_TO_MASK_EXT       0x809E
#define GL_SAMPLE_ALPHA_TO_ONE_EXT        0x809F
#define GL_SAMPLE_MASK_EXT                0x80A0
#define GL_1PASS_EXT                      0x80A1
#define GL_2PASS_0_EXT                    0x80A2
#define GL_2PASS_1_EXT                    0x80A3
#define GL_4PASS_0_EXT                    0x80A4
#define GL_4PASS_1_EXT                    0x80A5
#define GL_4PASS_2_EXT                    0x80A6
#define GL_4PASS_3_EXT                    0x80A7
#define GL_SAMPLE_BUFFERS_EXT             0x80A8
#define GL_SAMPLES_EXT                    0x80A9
#define GL_SAMPLE_MASK_VALUE_EXT          0x80AA
#define GL_SAMPLE_MASK_INVERT_EXT         0x80AB
#define GL_SAMPLE_PATTERN_EXT             0x80AC
#define GL_MULTISAMPLE_BIT_EXT            0x20000000
#endif

#ifndef GL_SGIX_vertex_preclip
#define GL_VERTEX_PRECLIP_SGIX            0x83EE
#define GL_VERTEX_PRECLIP_HINT_SGIX       0x83EF
#endif

#ifndef GL_SGIX_convolution_accuracy
#define GL_CONVOLUTION_HINT_SGIX          0x8316
#endif

#ifndef GL_SGIX_resample
#define GL_PACK_RESAMPLE_SGIX             0x842C
#define GL_UNPACK_RESAMPLE_SGIX           0x842D
#define GL_RESAMPLE_REPLICATE_SGIX        0x842E
#define GL_RESAMPLE_ZERO_FILL_SGIX        0x842F
#define GL_RESAMPLE_DECIMATE_SGIX         0x8430
#endif

#ifndef GL_SGIS_point_line_texgen
#define GL_EYE_DISTANCE_TO_POINT_SGIS     0x81F0
#define GL_OBJECT_DISTANCE_TO_POINT_SGIS  0x81F1
#define GL_EYE_DISTANCE_TO_LINE_SGIS      0x81F2
#define GL_OBJECT_DISTANCE_TO_LINE_SGIS   0x81F3
#define GL_EYE_POINT_SGIS                 0x81F4
#define GL_OBJECT_POINT_SGIS              0x81F5
#define GL_EYE_LINE_SGIS                  0x81F6
#define GL_OBJECT_LINE_SGIS               0x81F7
#endif

#ifndef GL_SGIS_texture_color_mask
#define GL_TEXTURE_COLOR_WRITEMASK_SGIS   0x81EF
#endif

#ifndef GL_EXT_texture_env_dot3
#define GL_DOT3_RGB_EXT                   0x8740
#define GL_DOT3_RGBA_EXT                  0x8741
#endif

#ifndef GL_ATI_texture_mirror_once
#define GL_MIRROR_CLAMP_ATI               0x8742
#define GL_MIRROR_CLAMP_TO_EDGE_ATI       0x8743
#endif

#ifndef GL_NV_fence
#define GL_ALL_COMPLETED_NV               0x84F2
#define GL_FENCE_STATUS_NV                0x84F3
#define GL_FENCE_CONDITION_NV             0x84F4
#endif

#ifndef GL_IBM_texture_mirrored_repeat
#define GL_MIRRORED_REPEAT_IBM            0x8370
#endif

#ifndef GL_NV_evaluators
#define GL_EVAL_2D_NV                     0x86C0
#define GL_EVAL_TRIANGULAR_2D_NV          0x86C1
#define GL_MAP_TESSELLATION_NV            0x86C2
#define GL_MAP_ATTRIB_U_ORDER_NV          0x86C3
#define GL_MAP_ATTRIB_V_ORDER_NV          0x86C4
#define GL_EVAL_FRACTIONAL_TESSELLATION_NV 0x86C5
#define GL_EVAL_VERTEX_ATTRIB0_NV         0x86C6
#define GL_EVAL_VERTEX_ATTRIB1_NV         0x86C7
#define GL_EVAL_VERTEX_ATTRIB2_NV         0x86C8
#define GL_EVAL_VERTEX_ATTRIB3_NV         0x86C9
#define GL_EVAL_VERTEX_ATTRIB4_NV         0x86CA
#define GL_EVAL_VERTEX_ATTRIB5_NV         0x86CB
#define GL_EVAL_VERTEX_ATTRIB6_NV         0x86CC
#define GL_EVAL_VERTEX_ATTRIB7_NV         0x86CD
#define GL_EVAL_VERTEX_ATTRIB8_NV         0x86CE
#define GL_EVAL_VERTEX_ATTRIB9_NV         0x86CF
#define GL_EVAL_VERTEX_ATTRIB10_NV        0x86D0
#define GL_EVAL_VERTEX_ATTRIB11_NV        0x86D1
#define GL_EVAL_VERTEX_ATTRIB12_NV        0x86D2
#define GL_EVAL_VERTEX_ATTRIB13_NV        0x86D3
#define GL_EVAL_VERTEX_ATTRIB14_NV        0x86D4
#define GL_EVAL_VERTEX_ATTRIB15_NV        0x86D5
#define GL_MAX_MAP_TESSELLATION_NV        0x86D6
#define GL_MAX_RATIONAL_EVAL_ORDER_NV     0x86D7
#endif

#ifndef GL_NV_packed_depth_stencil
#define GL_DEPTH_STENCIL_NV               0x84F9
#define GL_UNSIGNED_INT_24_8_NV           0x84FA
#endif

#ifndef GL_NV_register_combiners2
#define GL_PER_STAGE_CONSTANTS_NV         0x8535
#endif

#ifndef GL_NV_texture_compression_vtc
#endif

#ifndef GL_NV_texture_rectangle
#define GL_TEXTURE_RECTANGLE_NV           0x84F5
#define GL_TEXTURE_BINDING_RECTANGLE_NV   0x84F6
#define GL_PROXY_TEXTURE_RECTANGLE_NV     0x84F7
#define GL_MAX_RECTANGLE_TEXTURE_SIZE_NV  0x84F8
#endif

#ifndef GL_NV_texture_shader
#define GL_OFFSET_TEXTURE_RECTANGLE_NV    0x864C
#define GL_OFFSET_TEXTURE_RECTANGLE_SCALE_NV 0x864D
#define GL_DOT_PRODUCT_TEXTURE_RECTANGLE_NV 0x864E
#define GL_RGBA_UNSIGNED_DOT_PRODUCT_MAPPING_NV 0x86D9
#define GL_UNSIGNED_INT_S8_S8_8_8_NV      0x86DA
#define GL_UNSIGNED_INT_8_8_S8_S8_REV_NV  0x86DB
#define GL_DSDT_MAG_INTENSITY_NV          0x86DC
#define GL_SHADER_CONSISTENT_NV           0x86DD
#define GL_TEXTURE_SHADER_NV              0x86DE
#define GL_SHADER_OPERATION_NV            0x86DF
#define GL_CULL_MODES_NV                  0x86E0
#define GL_OFFSET_TEXTURE_MATRIX_NV       0x86E1
#define GL_OFFSET_TEXTURE_SCALE_NV        0x86E2
#define GL_OFFSET_TEXTURE_BIAS_NV         0x86E3
#define GL_OFFSET_TEXTURE_2D_MATRIX_NV    GL_OFFSET_TEXTURE_MATRIX_NV
#define GL_OFFSET_TEXTURE_2D_SCALE_NV     GL_OFFSET_TEXTURE_SCALE_NV
#define GL_OFFSET_TEXTURE_2D_BIAS_NV      GL_OFFSET_TEXTURE_BIAS_NV
#define GL_PREVIOUS_TEXTURE_INPUT_NV      0x86E4
#define GL_CONST_EYE_NV                   0x86E5
#define GL_PASS_THROUGH_NV                0x86E6
#define GL_CULL_FRAGMENT_NV               0x86E7
#define GL_OFFSET_TEXTURE_2D_NV           0x86E8
#define GL_DEPENDENT_AR_TEXTURE_2D_NV     0x86E9
#define GL_DEPENDENT_GB_TEXTURE_2D_NV     0x86EA
#define GL_DOT_PRODUCT_NV                 0x86EC
#define GL_DOT_PRODUCT_DEPTH_REPLACE_NV   0x86ED
#define GL_DOT_PRODUCT_TEXTURE_2D_NV      0x86EE
#define GL_DOT_PRODUCT_TEXTURE_CUBE_MAP_NV 0x86F0
#define GL_DOT_PRODUCT_DIFFUSE_CUBE_MAP_NV 0x86F1
#define GL_DOT_PRODUCT_REFLECT_CUBE_MAP_NV 0x86F2
#define GL_DOT_PRODUCT_CONST_EYE_REFLECT_CUBE_MAP_NV 0x86F3
#define GL_HILO_NV                        0x86F4
#define GL_DSDT_NV                        0x86F5
#define GL_DSDT_MAG_NV                    0x86F6
#define GL_DSDT_MAG_VIB_NV                0x86F7
#define GL_HILO16_NV                      0x86F8
#define GL_SIGNED_HILO_NV                 0x86F9
#define GL_SIGNED_HILO16_NV               0x86FA
#define GL_SIGNED_RGBA_NV                 0x86FB
#define GL_SIGNED_RGBA8_NV                0x86FC
#define GL_SIGNED_RGB_NV                  0x86FE
#define GL_SIGNED_RGB8_NV                 0x86FF
#define GL_SIGNED_LUMINANCE_NV            0x8701
#define GL_SIGNED_LUMINANCE8_NV           0x8702
#define GL_SIGNED_LUMINANCE_ALPHA_NV      0x8703
#define GL_SIGNED_LUMINANCE8_ALPHA8_NV    0x8704
#define GL_SIGNED_ALPHA_NV                0x8705
#define GL_SIGNED_ALPHA8_NV               0x8706
#define GL_SIGNED_INTENSITY_NV            0x8707
#define GL_SIGNED_INTENSITY8_NV           0x8708
#define GL_DSDT8_NV                       0x8709
#define GL_DSDT8_MAG8_NV                  0x870A
#define GL_DSDT8_MAG8_INTENSITY8_NV       0x870B
#define GL_SIGNED_RGB_UNSIGNED_ALPHA_NV   0x870C
#define GL_SIGNED_RGB8_UNSIGNED_ALPHA8_NV 0x870D
#define GL_HI_SCALE_NV                    0x870E
#define GL_LO_SCALE_NV                    0x870F
#define GL_DS_SCALE_NV                    0x8710
#define GL_DT_SCALE_NV                    0x8711
#define GL_MAGNITUDE_SCALE_NV             0x8712
#define GL_VIBRANCE_SCALE_NV              0x8713
#define GL_HI_BIAS_NV                     0x8714
#define GL_LO_BIAS_NV                     0x8715
#define GL_DS_BIAS_NV                     0x8716
#define GL_DT_BIAS_NV                     0x8717
#define GL_MAGNITUDE_BIAS_NV              0x8718
#define GL_VIBRANCE_BIAS_NV               0x8719
#define GL_TEXTURE_BORDER_VALUES_NV       0x871A
#define GL_TEXTURE_HI_SIZE_NV             0x871B
#define GL_TEXTURE_LO_SIZE_NV             0x871C
#define GL_TEXTURE_DS_SIZE_NV             0x871D
#define GL_TEXTURE_DT_SIZE_NV             0x871E
#define GL_TEXTURE_MAG_SIZE_NV            0x871F
#endif

#ifndef GL_NV_texture_shader2
#define GL_DOT_PRODUCT_TEXTURE_3D_NV      0x86EF
#endif

#ifndef GL_NV_vertex_array_range2
#define GL_VERTEX_ARRAY_RANGE_WITHOUT_FLUSH_NV 0x8533
#endif

#ifndef GL_NV_vertex_program
#define GL_VERTEX_PROGRAM_NV              0x8620
#define GL_VERTEX_STATE_PROGRAM_NV        0x8621
#define GL_ATTRIB_ARRAY_SIZE_NV           0x8623
#define GL_ATTRIB_ARRAY_STRIDE_NV         0x8624
#define GL_ATTRIB_ARRAY_TYPE_NV           0x8625
#define GL_CURRENT_ATTRIB_NV              0x8626
#define GL_PROGRAM_LENGTH_NV              0x8627
#define GL_PROGRAM_STRING_NV              0x8628
#define GL_MODELVIEW_PROJECTION_NV        0x8629
#define GL_IDENTITY_NV                    0x862A
#define GL_INVERSE_NV                     0x862B
#define GL_TRANSPOSE_NV                   0x862C
#define GL_INVERSE_TRANSPOSE_NV           0x862D
#define GL_MAX_TRACK_MATRIX_STACK_DEPTH_NV 0x862E
#define GL_MAX_TRACK_MATRICES_NV          0x862F
#define GL_MATRIX0_NV                     0x8630
#define GL_MATRIX1_NV                     0x8631
#define GL_MATRIX2_NV                     0x8632
#define GL_MATRIX3_NV                     0x8633
#define GL_MATRIX4_NV                     0x8634
#define GL_MATRIX5_NV                     0x8635
#define GL_MATRIX6_NV                     0x8636
#define GL_MATRIX7_NV                     0x8637
#define GL_CURRENT_MATRIX_STACK_DEPTH_NV  0x8640
#define GL_CURRENT_MATRIX_NV              0x8641
#define GL_VERTEX_PROGRAM_POINT_SIZE_NV   0x8642
#define GL_VERTEX_PROGRAM_TWO_SIDE_NV     0x8643
#define GL_PROGRAM_PARAMETER_NV           0x8644
#define GL_ATTRIB_ARRAY_POINTER_NV        0x8645
#define GL_PROGRAM_TARGET_NV              0x8646
#define GL_PROGRAM_RESIDENT_NV            0x8647
#define GL_TRACK_MATRIX_NV                0x8648
#define GL_TRACK_MATRIX_TRANSFORM_NV      0x8649
#define GL_VERTEX_PROGRAM_BINDING_NV      0x864A
#define GL_PROGRAM_ERROR_POSITION_NV      0x864B
#define GL_VERTEX_ATTRIB_ARRAY0_NV        0x8650
#define GL_VERTEX_ATTRIB_ARRAY1_NV        0x8651
#define GL_VERTEX_ATTRIB_ARRAY2_NV        0x8652
#define GL_VERTEX_ATTRIB_ARRAY3_NV        0x8653
#define GL_VERTEX_ATTRIB_ARRAY4_NV        0x8654
#define GL_VERTEX_ATTRIB_ARRAY5_NV        0x8655
#define GL_VERTEX_ATTRIB_ARRAY6_NV        0x8656
#define GL_VERTEX_ATTRIB_ARRAY7_NV        0x8657
#define GL_VERTEX_ATTRIB_ARRAY8_NV        0x8658
#define GL_VERTEX_ATTRIB_ARRAY9_NV        0x8659
#define GL_VERTEX_ATTRIB_ARRAY10_NV       0x865A
#define GL_VERTEX_ATTRIB_ARRAY11_NV       0x865B
#define GL_VERTEX_ATTRIB_ARRAY12_NV       0x865C
#define GL_VERTEX_ATTRIB_ARRAY13_NV       0x865D
#define GL_VERTEX_ATTRIB_ARRAY14_NV       0x865E
#define GL_VERTEX_ATTRIB_ARRAY15_NV       0x865F
#define GL_MAP1_VERTEX_ATTRIB0_4_NV       0x8660
#define GL_MAP1_VERTEX_ATTRIB1_4_NV       0x8661
#define GL_MAP1_VERTEX_ATTRIB2_4_NV       0x8662
#define GL_MAP1_VERTEX_ATTRIB3_4_NV       0x8663
#define GL_MAP1_VERTEX_ATTRIB4_4_NV       0x8664
#define GL_MAP1_VERTEX_ATTRIB5_4_NV       0x8665
#define GL_MAP1_VERTEX_ATTRIB6_4_NV       0x8666
#define GL_MAP1_VERTEX_ATTRIB7_4_NV       0x8667
#define GL_MAP1_VERTEX_ATTRIB8_4_NV       0x8668
#define GL_MAP1_VERTEX_ATTRIB9_4_NV       0x8669
#define GL_MAP1_VERTEX_ATTRIB10_4_NV      0x866A
#define GL_MAP1_VERTEX_ATTRIB11_4_NV      0x866B
#define GL_MAP1_VERTEX_ATTRIB12_4_NV      0x866C
#define GL_MAP1_VERTEX_ATTRIB13_4_NV      0x866D
#define GL_MAP1_VERTEX_ATTRIB14_4_NV      0x866E
#define GL_MAP1_VERTEX_ATTRIB15_4_NV      0x866F
#define GL_MAP2_VERTEX_ATTRIB0_4_NV       0x8670
#define GL_MAP2_VERTEX_ATTRIB1_4_NV       0x8671
#define GL_MAP2_VERTEX_ATTRIB2_4_NV       0x8672
#define GL_MAP2_VERTEX_ATTRIB3_4_NV       0x8673
#define GL_MAP2_VERTEX_ATTRIB4_4_NV       0x8674
#define GL_MAP2_VERTEX_ATTRIB5_4_NV       0x8675
#define GL_MAP2_VERTEX_ATTRIB6_4_NV       0x8676
#define GL_MAP2_VERTEX_ATTRIB7_4_NV       0x8677
#define GL_MAP2_VERTEX_ATTRIB8_4_NV       0x8678
#define GL_MAP2_VERTEX_ATTRIB9_4_NV       0x8679
#define GL_MAP2_VERTEX_ATTRIB10_4_NV      0x867A
#define GL_MAP2_VERTEX_ATTRIB11_4_NV      0x867B
#define GL_MAP2_VERTEX_ATTRIB12_4_NV      0x867C
#define GL_MAP2_VERTEX_ATTRIB13_4_NV      0x867D
#define GL_MAP2_VERTEX_ATTRIB14_4_NV      0x867E
#define GL_MAP2_VERTEX_ATTRIB15_4_NV      0x867F
#endif

#ifndef GL_SGIX_texture_coordinate_clamp
#define GL_TEXTURE_MAX_CLAMP_S_SGIX       0x8369
#define GL_TEXTURE_MAX_CLAMP_T_SGIX       0x836A
#define GL_TEXTURE_MAX_CLAMP_R_SGIX       0x836B
#endif

#ifndef GL_SGIX_scalebias_hint
#define GL_SCALEBIAS_HINT_SGIX            0x8322
#endif

#ifndef GL_OML_interlace
#define GL_INTERLACE_OML                  0x8980
#define GL_INTERLACE_READ_OML             0x8981
#endif

#ifndef GL_OML_subsample
#define GL_FORMAT_SUBSAMPLE_24_24_OML     0x8982
#define GL_FORMAT_SUBSAMPLE_244_244_OML   0x8983
#endif

#ifndef GL_OML_resample
#define GL_PACK_RESAMPLE_OML              0x8984
#define GL_UNPACK_RESAMPLE_OML            0x8985
#define GL_RESAMPLE_REPLICATE_OML         0x8986
#define GL_RESAMPLE_ZERO_FILL_OML         0x8987
#define GL_RESAMPLE_AVERAGE_OML           0x8988
#define GL_RESAMPLE_DECIMATE_OML          0x8989
#endif

#ifndef GL_NV_copy_depth_to_color
#define GL_DEPTH_STENCIL_TO_RGBA_NV       0x886E
#define GL_DEPTH_STENCIL_TO_BGRA_NV       0x886F
#endif

#ifndef GL_ATI_envmap_bumpmap
#define GL_BUMP_ROT_MATRIX_ATI            0x8775
#define GL_BUMP_ROT_MATRIX_SIZE_ATI       0x8776
#define GL_BUMP_NUM_TEX_UNITS_ATI         0x8777
#define GL_BUMP_TEX_UNITS_ATI             0x8778
#define GL_DUDV_ATI                       0x8779
#define GL_DU8DV8_ATI                     0x877A
#define GL_BUMP_ENVMAP_ATI                0x877B
#define GL_BUMP_TARGET_ATI                0x877C
#endif

#ifndef GL_ATI_fragment_shader
#define GL_FRAGMENT_SHADER_ATI            0x8920
#define GL_REG_0_ATI                      0x8921
#define GL_REG_1_ATI                      0x8922
#define GL_REG_2_ATI                      0x8923
#define GL_REG_3_ATI                      0x8924
#define GL_REG_4_ATI                      0x8925
#define GL_REG_5_ATI                      0x8926
#define GL_REG_6_ATI                      0x8927
#define GL_REG_7_ATI                      0x8928
#define GL_REG_8_ATI                      0x8929
#define GL_REG_9_ATI                      0x892A
#define GL_REG_10_ATI                     0x892B
#define GL_REG_11_ATI                     0x892C
#define GL_REG_12_ATI                     0x892D
#define GL_REG_13_ATI                     0x892E
#define GL_REG_14_ATI                     0x892F
#define GL_REG_15_ATI                     0x8930
#define GL_REG_16_ATI                     0x8931
#define GL_REG_17_ATI                     0x8932
#define GL_REG_18_ATI                     0x8933
#define GL_REG_19_ATI                     0x8934
#define GL_REG_20_ATI                     0x8935
#define GL_REG_21_ATI                     0x8936
#define GL_REG_22_ATI                     0x8937
#define GL_REG_23_ATI                     0x8938
#define GL_REG_24_ATI                     0x8939
#define GL_REG_25_ATI                     0x893A
#define GL_REG_26_ATI                     0x893B
#define GL_REG_27_ATI                     0x893C
#define GL_REG_28_ATI                     0x893D
#define GL_REG_29_ATI                     0x893E
#define GL_REG_30_ATI                     0x893F
#define GL_REG_31_ATI                     0x8940
#define GL_CON_0_ATI                      0x8941
#define GL_CON_1_ATI                      0x8942
#define GL_CON_2_ATI                      0x8943
#define GL_CON_3_ATI                      0x8944
#define GL_CON_4_ATI                      0x8945
#define GL_CON_5_ATI                      0x8946
#define GL_CON_6_ATI                      0x8947
#define GL_CON_7_ATI                      0x8948
#define GL_CON_8_ATI                      0x8949
#define GL_CON_9_ATI                      0x894A
#define GL_CON_10_ATI                     0x894B
#define GL_CON_11_ATI                     0x894C
#define GL_CON_12_ATI                     0x894D
#define GL_CON_13_ATI                     0x894E
#define GL_CON_14_ATI                     0x894F
#define GL_CON_15_ATI                     0x8950
#define GL_CON_16_ATI                     0x8951
#define GL_CON_17_ATI                     0x8952
#define GL_CON_18_ATI                     0x8953
#define GL_CON_19_ATI                     0x8954
#define GL_CON_20_ATI                     0x8955
#define GL_CON_21_ATI                     0x8956
#define GL_CON_22_ATI                     0x8957
#define GL_CON_23_ATI                     0x8958
#define GL_CON_24_ATI                     0x8959
#define GL_CON_25_ATI                     0x895A
#define GL_CON_26_ATI                     0x895B
#define GL_CON_27_ATI                     0x895C
#define GL_CON_28_ATI                     0x895D
#define GL_CON_29_ATI                     0x895E
#define GL_CON_30_ATI                     0x895F
#define GL_CON_31_ATI                     0x8960
#define GL_MOV_ATI                        0x8961
#define GL_ADD_ATI                        0x8963
#define GL_MUL_ATI                        0x8964
#define GL_SUB_ATI                        0x8965
#define GL_DOT3_ATI                       0x8966
#define GL_DOT4_ATI                       0x8967
#define GL_MAD_ATI                        0x8968
#define GL_LERP_ATI                       0x8969
#define GL_CND_ATI                        0x896A
#define GL_CND0_ATI                       0x896B
#define GL_DOT2_ADD_ATI                   0x896C
#define GL_SECONDARY_INTERPOLATOR_ATI     0x896D
#define GL_NUM_FRAGMENT_REGISTERS_ATI     0x896E
#define GL_NUM_FRAGMENT_CONSTANTS_ATI     0x896F
#define GL_NUM_PASSES_ATI                 0x8970
#define GL_NUM_INSTRUCTIONS_PER_PASS_ATI  0x8971
#define GL_NUM_INSTRUCTIONS_TOTAL_ATI     0x8972
#define GL_NUM_INPUT_INTERPOLATOR_COMPONENTS_ATI 0x8973
#define GL_NUM_LOOPBACK_COMPONENTS_ATI    0x8974
#define GL_COLOR_ALPHA_PAIRING_ATI        0x8975
#define GL_SWIZZLE_STR_ATI                0x8976
#define GL_SWIZZLE_STQ_ATI                0x8977
#define GL_SWIZZLE_STR_DR_ATI             0x8978
#define GL_SWIZZLE_STQ_DQ_ATI             0x8979
#define GL_SWIZZLE_STRQ_ATI               0x897A
#define GL_SWIZZLE_STRQ_DQ_ATI            0x897B
#define GL_RED_BIT_ATI                    0x00000001
#define GL_GREEN_BIT_ATI                  0x00000002
#define GL_BLUE_BIT_ATI                   0x00000004
#define GL_2X_BIT_ATI                     0x00000001
#define GL_4X_BIT_ATI                     0x00000002
#define GL_8X_BIT_ATI                     0x00000004
#define GL_HALF_BIT_ATI                   0x00000008
#define GL_QUARTER_BIT_ATI                0x00000010
#define GL_EIGHTH_BIT_ATI                 0x00000020
#define GL_SATURATE_BIT_ATI               0x00000040
#define GL_COMP_BIT_ATI                   0x00000002
#define GL_NEGATE_BIT_ATI                 0x00000004
#define GL_BIAS_BIT_ATI                   0x00000008
#endif

#ifndef GL_ATI_pn_triangles
#define GL_PN_TRIANGLES_ATI               0x87F0
#define GL_MAX_PN_TRIANGLES_TESSELATION_LEVEL_ATI 0x87F1
#define GL_PN_TRIANGLES_POINT_MODE_ATI    0x87F2
#define GL_PN_TRIANGLES_NORMAL_MODE_ATI   0x87F3
#define GL_PN_TRIANGLES_TESSELATION_LEVEL_ATI 0x87F4
#define GL_PN_TRIANGLES_POINT_MODE_LINEAR_ATI 0x87F5
#define GL_PN_TRIANGLES_POINT_MODE_CUBIC_ATI 0x87F6
#define GL_PN_TRIANGLES_NORMAL_MODE_LINEAR_ATI 0x87F7
#define GL_PN_TRIANGLES_NORMAL_MODE_QUADRATIC_ATI 0x87F8
#endif

#ifndef GL_ATI_vertex_array_object
#define GL_STATIC_ATI                     0x8760
#define GL_DYNAMIC_ATI                    0x8761
#define GL_PRESERVE_ATI                   0x8762
#define GL_DISCARD_ATI                    0x8763
#define GL_OBJECT_BUFFER_SIZE_ATI         0x8764
#define GL_OBJECT_BUFFER_USAGE_ATI        0x8765
#define GL_ARRAY_OBJECT_BUFFER_ATI        0x8766
#define GL_ARRAY_OBJECT_OFFSET_ATI        0x8767
#endif

#ifndef GL_EXT_vertex_shader
#define GL_VERTEX_SHADER_EXT              0x8780
#define GL_VERTEX_SHADER_BINDING_EXT      0x8781
#define GL_OP_INDEX_EXT                   0x8782
#define GL_OP_NEGATE_EXT                  0x8783
#define GL_OP_DOT3_EXT                    0x8784
#define GL_OP_DOT4_EXT                    0x8785
#define GL_OP_MUL_EXT                     0x8786
#define GL_OP_ADD_EXT                     0x8787
#define GL_OP_MADD_EXT                    0x8788
#define GL_OP_FRAC_EXT                    0x8789
#define GL_OP_MAX_EXT                     0x878A
#define GL_OP_MIN_EXT                     0x878B
#define GL_OP_SET_GE_EXT                  0x878C
#define GL_OP_SET_LT_EXT                  0x878D
#define GL_OP_CLAMP_EXT                   0x878E
#define GL_OP_FLOOR_EXT                   0x878F
#define GL_OP_ROUND_EXT                   0x8790
#define GL_OP_EXP_BASE_2_EXT              0x8791
#define GL_OP_LOG_BASE_2_EXT              0x8792
#define GL_OP_POWER_EXT                   0x8793
#define GL_OP_RECIP_EXT                   0x8794
#define GL_OP_RECIP_SQRT_EXT              0x8795
#define GL_OP_SUB_EXT                     0x8796
#define GL_OP_CROSS_PRODUCT_EXT           0x8797
#define GL_OP_MULTIPLY_MATRIX_EXT         0x8798
#define GL_OP_MOV_EXT                     0x8799
#define GL_OUTPUT_VERTEX_EXT              0x879A
#define GL_OUTPUT_COLOR0_EXT              0x879B
#define GL_OUTPUT_COLOR1_EXT              0x879C
#define GL_OUTPUT_TEXTURE_COORD0_EXT      0x879D
#define GL_OUTPUT_TEXTURE_COORD1_EXT      0x879E
#define GL_OUTPUT_TEXTURE_COORD2_EXT      0x879F
#define GL_OUTPUT_TEXTURE_COORD3_EXT      0x87A0
#define GL_OUTPUT_TEXTURE_COORD4_EXT      0x87A1
#define GL_OUTPUT_TEXTURE_COORD5_EXT      0x87A2
#define GL_OUTPUT_TEXTURE_COORD6_EXT      0x87A3
#define GL_OUTPUT_TEXTURE_COORD7_EXT      0x87A4
#define GL_OUTPUT_TEXTURE_COORD8_EXT      0x87A5
#define GL_OUTPUT_TEXTURE_COORD9_EXT      0x87A6
#define GL_OUTPUT_TEXTURE_COORD10_EXT     0x87A7
#define GL_OUTPUT_TEXTURE_COORD11_EXT     0x87A8
#define GL_OUTPUT_TEXTURE_COORD12_EXT     0x87A9
#define GL_OUTPUT_TEXTURE_COORD13_EXT     0x87AA
#define GL_OUTPUT_TEXTURE_COORD14_EXT     0x87AB
#define GL_OUTPUT_TEXTURE_COORD15_EXT     0x87AC
#define GL_OUTPUT_TEXTURE_COORD16_EXT     0x87AD
#define GL_OUTPUT_TEXTURE_COORD17_EXT     0x87AE
#define GL_OUTPUT_TEXTURE_COORD18_EXT     0x87AF
#define GL_OUTPUT_TEXTURE_COORD19_EXT     0x87B0
#define GL_OUTPUT_TEXTURE_COORD20_EXT     0x87B1
#define GL_OUTPUT_TEXTURE_COORD21_EXT     0x87B2
#define GL_OUTPUT_TEXTURE_COORD22_EXT     0x87B3
#define GL_OUTPUT_TEXTURE_COORD23_EXT     0x87B4
#define GL_OUTPUT_TEXTURE_COORD24_EXT     0x87B5
#define GL_OUTPUT_TEXTURE_COORD25_EXT     0x87B6
#define GL_OUTPUT_TEXTURE_COORD26_EXT     0x87B7
#define GL_OUTPUT_TEXTURE_COORD27_EXT     0x87B8
#define GL_OUTPUT_TEXTURE_COORD28_EXT     0x87B9
#define GL_OUTPUT_TEXTURE_COORD29_EXT     0x87BA
#define GL_OUTPUT_TEXTURE_COORD30_EXT     0x87BB
#define GL_OUTPUT_TEXTURE_COORD31_EXT     0x87BC
#define GL_OUTPUT_FOG_EXT                 0x87BD
#define GL_SCALAR_EXT                     0x87BE
#define GL_VECTOR_EXT                     0x87BF
#define GL_MATRIX_EXT                     0x87C0
#define GL_VARIANT_EXT                    0x87C1
#define GL_INVARIANT_EXT                  0x87C2
#define GL_LOCAL_CONSTANT_EXT             0x87C3
#define GL_LOCAL_EXT                      0x87C4
#define GL_MAX_VERTEX_SHADER_INSTRUCTIONS_EXT 0x87C5
#define GL_MAX_VERTEX_SHADER_VARIANTS_EXT 0x87C6
#define GL_MAX_VERTEX_SHADER_INVARIANTS_EXT 0x87C7
#define GL_MAX_VERTEX_SHADER_LOCAL_CONSTANTS_EXT 0x87C8
#define GL_MAX_VERTEX_SHADER_LOCALS_EXT   0x87C9
#define GL_MAX_OPTIMIZED_VERTEX_SHADER_INSTRUCTIONS_EXT 0x87CA
#define GL_MAX_OPTIMIZED_VERTEX_SHADER_VARIANTS_EXT 0x87CB
#define GL_MAX_OPTIMIZED_VERTEX_SHADER_LOCAL_CONSTANTS_EXT 0x87CC
#define GL_MAX_OPTIMIZED_VERTEX_SHADER_INVARIANTS_EXT 0x87CD
#define GL_MAX_OPTIMIZED_VERTEX_SHADER_LOCALS_EXT 0x87CE
#define GL_VERTEX_SHADER_INSTRUCTIONS_EXT 0x87CF
#define GL_VERTEX_SHADER_VARIANTS_EXT     0x87D0
#define GL_VERTEX_SHADER_INVARIANTS_EXT   0x87D1
#define GL_VERTEX_SHADER_LOCAL_CONSTANTS_EXT 0x87D2
#define GL_VERTEX_SHADER_LOCALS_EXT       0x87D3
#define GL_VERTEX_SHADER_OPTIMIZED_EXT    0x87D4
#define GL_X_EXT                          0x87D5
#define GL_Y_EXT                          0x87D6
#define GL_Z_EXT                          0x87D7
#define GL_W_EXT                          0x87D8
#define GL_NEGATIVE_X_EXT                 0x87D9
#define GL_NEGATIVE_Y_EXT                 0x87DA
#define GL_NEGATIVE_Z_EXT                 0x87DB
#define GL_NEGATIVE_W_EXT                 0x87DC
#define GL_ZERO_EXT                       0x87DD
#define GL_ONE_EXT                        0x87DE
#define GL_NEGATIVE_ONE_EXT               0x87DF
#define GL_NORMALIZED_RANGE_EXT           0x87E0
#define GL_FULL_RANGE_EXT                 0x87E1
#define GL_CURRENT_VERTEX_EXT             0x87E2
#define GL_MVP_MATRIX_EXT                 0x87E3
#define GL_VARIANT_VALUE_EXT              0x87E4
#define GL_VARIANT_DATATYPE_EXT           0x87E5
#define GL_VARIANT_ARRAY_STRIDE_EXT       0x87E6
#define GL_VARIANT_ARRAY_TYPE_EXT         0x87E7
#define GL_VARIANT_ARRAY_EXT              0x87E8
#define GL_VARIANT_ARRAY_POINTER_EXT      0x87E9
#define GL_INVARIANT_VALUE_EXT            0x87EA
#define GL_INVARIANT_DATATYPE_EXT         0x87EB
#define GL_LOCAL_CONSTANT_VALUE_EXT       0x87EC
#define GL_LOCAL_CONSTANT_DATATYPE_EXT    0x87ED
#endif

#ifndef GL_ATI_vertex_streams
#define GL_MAX_VERTEX_STREAMS_ATI         0x876B
#define GL_VERTEX_STREAM0_ATI             0x876C
#define GL_VERTEX_STREAM1_ATI             0x876D
#define GL_VERTEX_STREAM2_ATI             0x876E
#define GL_VERTEX_STREAM3_ATI             0x876F
#define GL_VERTEX_STREAM4_ATI             0x8770
#define GL_VERTEX_STREAM5_ATI             0x8771
#define GL_VERTEX_STREAM6_ATI             0x8772
#define GL_VERTEX_STREAM7_ATI             0x8773
#define GL_VERTEX_SOURCE_ATI              0x8774
#endif

#ifndef GL_ATI_element_array
#define GL_ELEMENT_ARRAY_ATI              0x8768
#define GL_ELEMENT_ARRAY_TYPE_ATI         0x8769
#define GL_ELEMENT_ARRAY_POINTER_ATI      0x876A
#endif

#ifndef GL_SUN_mesh_array
#define GL_QUAD_MESH_SUN                  0x8614
#define GL_TRIANGLE_MESH_SUN              0x8615
#endif

#ifndef GL_SUN_slice_accum
#define GL_SLICE_ACCUM_SUN                0x85CC
#endif

#ifndef GL_NV_multisample_filter_hint
#define GL_MULTISAMPLE_FILTER_HINT_NV     0x8534
#endif

#ifndef GL_NV_depth_clamp
#define GL_DEPTH_CLAMP_NV                 0x864F
#endif

#ifndef GL_NV_occlusion_query
#define GL_PIXEL_COUNTER_BITS_NV          0x8864
#define GL_CURRENT_OCCLUSION_QUERY_ID_NV  0x8865
#define GL_PIXEL_COUNT_NV                 0x8866
#define GL_PIXEL_COUNT_AVAILABLE_NV       0x8867
#endif

#ifndef GL_NV_point_sprite
#define GL_POINT_SPRITE_NV                0x8861
#define GL_COORD_REPLACE_NV               0x8862
#define GL_POINT_SPRITE_R_MODE_NV         0x8863
#endif

#ifndef GL_NV_texture_shader3
#define GL_OFFSET_PROJECTIVE_TEXTURE_2D_NV 0x8850
#define GL_OFFSET_PROJECTIVE_TEXTURE_2D_SCALE_NV 0x8851
#define GL_OFFSET_PROJECTIVE_TEXTURE_RECTANGLE_NV 0x8852
#define GL_OFFSET_PROJECTIVE_TEXTURE_RECTANGLE_SCALE_NV 0x8853
#define GL_OFFSET_HILO_TEXTURE_2D_NV      0x8854
#define GL_OFFSET_HILO_TEXTURE_RECTANGLE_NV 0x8855
#define GL_OFFSET_HILO_PROJECTIVE_TEXTURE_2D_NV 0x8856
#define GL_OFFSET_HILO_PROJECTIVE_TEXTURE_RECTANGLE_NV 0x8857
#define GL_DEPENDENT_HILO_TEXTURE_2D_NV   0x8858
#define GL_DEPENDENT_RGB_TEXTURE_3D_NV    0x8859
#define GL_DEPENDENT_RGB_TEXTURE_CUBE_MAP_NV 0x885A
#define GL_DOT_PRODUCT_PASS_THROUGH_NV    0x885B
#define GL_DOT_PRODUCT_TEXTURE_1D_NV      0x885C
#define GL_DOT_PRODUCT_AFFINE_DEPTH_REPLACE_NV 0x885D
#define GL_HILO8_NV                       0x885E
#define GL_SIGNED_HILO8_NV                0x885F
#define GL_FORCE_BLUE_TO_ONE_NV           0x8860
#endif

#ifndef GL_NV_vertex_program1_1
#endif

#ifndef GL_EXT_shadow_funcs
#endif

#ifndef GL_EXT_stencil_two_side
#define GL_STENCIL_TEST_TWO_SIDE_EXT      0x8910
#define GL_ACTIVE_STENCIL_FACE_EXT        0x8911
#endif

#ifndef GL_ATI_text_fragment_shader
#define GL_TEXT_FRAGMENT_SHADER_ATI       0x8200
#endif

#ifndef GL_APPLE_client_storage
#define GL_UNPACK_CLIENT_STORAGE_APPLE    0x85B2
#endif

#ifndef GL_APPLE_element_array
#define GL_ELEMENT_ARRAY_APPLE            0x8768
#define GL_ELEMENT_ARRAY_TYPE_APPLE       0x8769
#define GL_ELEMENT_ARRAY_POINTER_APPLE    0x876A
#endif

#ifndef GL_APPLE_fence
#define GL_DRAW_PIXELS_APPLE              0x8A0A
#define GL_FENCE_APPLE                    0x8A0B
#endif

#ifndef GL_APPLE_vertex_array_object
#define GL_VERTEX_ARRAY_BINDING_APPLE     0x85B5
#endif

#ifndef GL_APPLE_vertex_array_range
#define GL_VERTEX_ARRAY_RANGE_APPLE       0x851D
#define GL_VERTEX_ARRAY_RANGE_LENGTH_APPLE 0x851E
#define GL_VERTEX_ARRAY_STORAGE_HINT_APPLE 0x851F
#define GL_VERTEX_ARRAY_RANGE_POINTER_APPLE 0x8521
#define GL_STORAGE_CACHED_APPLE           0x85BE
#define GL_STORAGE_SHARED_APPLE           0x85BF
#endif

#ifndef GL_APPLE_ycbcr_422
#define GL_YCBCR_422_APPLE                0x85B9
#define GL_UNSIGNED_SHORT_8_8_APPLE       0x85BA
#define GL_UNSIGNED_SHORT_8_8_REV_APPLE   0x85BB
#endif

#ifndef GL_S3_s3tc
#define GL_RGB_S3TC                       0x83A0
#define GL_RGB4_S3TC                      0x83A1
#define GL_RGBA_S3TC                      0x83A2
#define GL_RGBA4_S3TC                     0x83A3
#endif

#ifndef GL_ATI_draw_buffers
#define GL_MAX_DRAW_BUFFERS_ATI           0x8824
#define GL_DRAW_BUFFER0_ATI               0x8825
#define GL_DRAW_BUFFER1_ATI               0x8826
#define GL_DRAW_BUFFER2_ATI               0x8827
#define GL_DRAW_BUFFER3_ATI               0x8828
#define GL_DRAW_BUFFER4_ATI               0x8829
#define GL_DRAW_BUFFER5_ATI               0x882A
#define GL_DRAW_BUFFER6_ATI               0x882B
#define GL_DRAW_BUFFER7_ATI               0x882C
#define GL_DRAW_BUFFER8_ATI               0x882D
#define GL_DRAW_BUFFER9_ATI               0x882E
#define GL_DRAW_BUFFER10_ATI              0x882F
#define GL_DRAW_BUFFER11_ATI              0x8830
#define GL_DRAW_BUFFER12_ATI              0x8831
#define GL_DRAW_BUFFER13_ATI              0x8832
#define GL_DRAW_BUFFER14_ATI              0x8833
#define GL_DRAW_BUFFER15_ATI              0x8834
#endif

#ifndef GL_ATI_pixel_format_float
#define GL_TYPE_RGBA_FLOAT_ATI            0x8820
#define GL_COLOR_CLEAR_UNCLAMPED_VALUE_ATI 0x8835
#endif

#ifndef GL_ATI_texture_env_combine3
#define GL_MODULATE_ADD_ATI               0x8744
#define GL_MODULATE_SIGNED_ADD_ATI        0x8745
#define GL_MODULATE_SUBTRACT_ATI          0x8746
#endif

#ifndef GL_ATI_texture_float
#define GL_RGBA_FLOAT32_ATI               0x8814
#define GL_RGB_FLOAT32_ATI                0x8815
#define GL_ALPHA_FLOAT32_ATI              0x8816
#define GL_INTENSITY_FLOAT32_ATI          0x8817
#define GL_LUMINANCE_FLOAT32_ATI          0x8818
#define GL_LUMINANCE_ALPHA_FLOAT32_ATI    0x8819
#define GL_RGBA_FLOAT16_ATI               0x881A
#define GL_RGB_FLOAT16_ATI                0x881B
#define GL_ALPHA_FLOAT16_ATI              0x881C
#define GL_INTENSITY_FLOAT16_ATI          0x881D
#define GL_LUMINANCE_FLOAT16_ATI          0x881E
#define GL_LUMINANCE_ALPHA_FLOAT16_ATI    0x881F
#endif

#ifndef GL_NV_float_buffer
#define GL_FLOAT_R_NV                     0x8880
#define GL_FLOAT_RG_NV                    0x8881
#define GL_FLOAT_RGB_NV                   0x8882
#define GL_FLOAT_RGBA_NV                  0x8883
#define GL_FLOAT_R16_NV                   0x8884
#define GL_FLOAT_R32_NV                   0x8885
#define GL_FLOAT_RG16_NV                  0x8886
#define GL_FLOAT_RG32_NV                  0x8887
#define GL_FLOAT_RGB16_NV                 0x8888
#define GL_FLOAT_RGB32_NV                 0x8889
#define GL_FLOAT_RGBA16_NV                0x888A
#define GL_FLOAT_RGBA32_NV                0x888B
#define GL_TEXTURE_FLOAT_COMPONENTS_NV    0x888C
#define GL_FLOAT_CLEAR_COLOR_VALUE_NV     0x888D
#define GL_FLOAT_RGBA_MODE_NV             0x888E
#endif

#ifndef GL_NV_fragment_program
#define GL_MAX_FRAGMENT_PROGRAM_LOCAL_PARAMETERS_NV 0x8868
#define GL_FRAGMENT_PROGRAM_NV            0x8870
#define GL_MAX_TEXTURE_COORDS_NV          0x8871
#define GL_MAX_TEXTURE_IMAGE_UNITS_NV     0x8872
#define GL_FRAGMENT_PROGRAM_BINDING_NV    0x8873
#define GL_PROGRAM_ERROR_STRING_NV        0x8874
#endif

#ifndef GL_NV_half_float
#define GL_HALF_FLOAT_NV                  0x140B
#endif

#ifndef GL_NV_pixel_data_range
#define GL_WRITE_PIXEL_DATA_RANGE_NV      0x8878
#define GL_READ_PIXEL_DATA_RANGE_NV       0x8879
#define GL_WRITE_PIXEL_DATA_RANGE_LENGTH_NV 0x887A
#define GL_READ_PIXEL_DATA_RANGE_LENGTH_NV 0x887B
#define GL_WRITE_PIXEL_DATA_RANGE_POINTER_NV 0x887C
#define GL_READ_PIXEL_DATA_RANGE_POINTER_NV 0x887D
#endif

#ifndef GL_NV_primitive_restart
#define GL_PRIMITIVE_RESTART_NV           0x8558
#define GL_PRIMITIVE_RESTART_INDEX_NV     0x8559
#endif

#ifndef GL_NV_texture_expand_normal
#define GL_TEXTURE_UNSIGNED_REMAP_MODE_NV 0x888F
#endif

#ifndef GL_NV_vertex_program2
#endif

#ifndef GL_ATI_map_object_buffer
#endif

#ifndef GL_ATI_separate_stencil
#define GL_STENCIL_BACK_FUNC_ATI          0x8800
#define GL_STENCIL_BACK_FAIL_ATI          0x8801
#define GL_STENCIL_BACK_PASS_DEPTH_FAIL_ATI 0x8802
#define GL_STENCIL_BACK_PASS_DEPTH_PASS_ATI 0x8803
#endif

#ifndef GL_ATI_vertex_attrib_array_object
#endif

#ifndef GL_OES_read_format
#define GL_IMPLEMENTATION_COLOR_READ_TYPE_OES 0x8B9A
#define GL_IMPLEMENTATION_COLOR_READ_FORMAT_OES 0x8B9B
#endif

#ifndef GL_EXT_depth_bounds_test
#define GL_DEPTH_BOUNDS_TEST_EXT          0x8890
#define GL_DEPTH_BOUNDS_EXT               0x8891
#endif

#ifndef GL_EXT_texture_mirror_clamp
#define GL_MIRROR_CLAMP_EXT               0x8742
#define GL_MIRROR_CLAMP_TO_EDGE_EXT       0x8743
#define GL_MIRROR_CLAMP_TO_BORDER_EXT     0x8912
#endif

#ifndef GL_EXT_blend_equation_separate
#define GL_BLEND_EQUATION_RGB_EXT         GL_BLEND_EQUATION
#define GL_BLEND_EQUATION_ALPHA_EXT       0x883D
#endif

#ifndef GL_MESA_pack_invert
#define GL_PACK_INVERT_MESA               0x8758
#endif

#ifndef GL_MESA_ycbcr_texture
#define GL_UNSIGNED_SHORT_8_8_MESA        0x85BA
#define GL_UNSIGNED_SHORT_8_8_REV_MESA    0x85BB
#define GL_YCBCR_MESA                     0x8757
#endif

#ifndef GL_EXT_pixel_buffer_object
#define GL_PIXEL_PACK_BUFFER_EXT          0x88EB
#define GL_PIXEL_UNPACK_BUFFER_EXT        0x88EC
#define GL_PIXEL_PACK_BUFFER_BINDING_EXT  0x88ED
#define GL_PIXEL_UNPACK_BUFFER_BINDING_EXT 0x88EF
#endif

#ifndef GL_NV_fragment_program_option
#endif

#ifndef GL_NV_fragment_program2
#define GL_MAX_PROGRAM_EXEC_INSTRUCTIONS_NV 0x88F4
#define GL_MAX_PROGRAM_CALL_DEPTH_NV      0x88F5
#define GL_MAX_PROGRAM_IF_DEPTH_NV        0x88F6
#define GL_MAX_PROGRAM_LOOP_DEPTH_NV      0x88F7
#define GL_MAX_PROGRAM_LOOP_COUNT_NV      0x88F8
#endif

#ifndef GL_NV_vertex_program2_option
/* reuse GL_MAX_PROGRAM_EXEC_INSTRUCTIONS_NV */
/* reuse GL_MAX_PROGRAM_CALL_DEPTH_NV */
#endif

#ifndef GL_NV_vertex_program3
/* reuse GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS_ARB */
#endif

#ifndef GL_EXT_framebuffer_object
#define GL_INVALID_FRAMEBUFFER_OPERATION_EXT 0x0506
#define GL_MAX_RENDERBUFFER_SIZE_EXT      0x84E8
#define GL_FRAMEBUFFER_BINDING_EXT        0x8CA6
#define GL_RENDERBUFFER_BINDING_EXT       0x8CA7
#define GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE_EXT 0x8CD0
#define GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME_EXT 0x8CD1
#define GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL_EXT 0x8CD2
#define GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE_EXT 0x8CD3
#define GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_3D_ZOFFSET_EXT 0x8CD4
#define GL_FRAMEBUFFER_COMPLETE_EXT       0x8CD5
#define GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT_EXT 0x8CD6
#define GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT_EXT 0x8CD7
#define GL_FRAMEBUFFER_INCOMPLETE_DUPLICATE_ATTACHMENT_EXT 0x8CD8
#define GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS_EXT 0x8CD9
#define GL_FRAMEBUFFER_INCOMPLETE_FORMATS_EXT 0x8CDA
#define GL_FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER_EXT 0x8CDB
#define GL_FRAMEBUFFER_INCOMPLETE_READ_BUFFER_EXT 0x8CDC
#define GL_FRAMEBUFFER_UNSUPPORTED_EXT    0x8CDD
#define GL_MAX_COLOR_ATTACHMENTS_EXT      0x8CDF
#define GL_COLOR_ATTACHMENT0_EXT          0x8CE0
#define GL_COLOR_ATTACHMENT1_EXT          0x8CE1
#define GL_COLOR_ATTACHMENT2_EXT          0x8CE2
#define GL_COLOR_ATTACHMENT3_EXT          0x8CE3
#define GL_COLOR_ATTACHMENT4_EXT          0x8CE4
#define GL_COLOR_ATTACHMENT5_EXT          0x8CE5
#define GL_COLOR_ATTACHMENT6_EXT          0x8CE6
#define GL_COLOR_ATTACHMENT7_EXT          0x8CE7
#define GL_COLOR_ATTACHMENT8_EXT          0x8CE8
#define GL_COLOR_ATTACHMENT9_EXT          0x8CE9
#define GL_COLOR_ATTACHMENT10_EXT         0x8CEA
#define GL_COLOR_ATTACHMENT11_EXT         0x8CEB
#define GL_COLOR_ATTACHMENT12_EXT         0x8CEC
#define GL_COLOR_ATTACHMENT13_EXT         0x8CED
#define GL_COLOR_ATTACHMENT14_EXT         0x8CEE
#define GL_COLOR_ATTACHMENT15_EXT         0x8CEF
#define GL_DEPTH_ATTACHMENT_EXT           0x8D00
#define GL_STENCIL_ATTACHMENT_EXT         0x8D20
#define GL_FRAMEBUFFER_EXT                0x8D40
#define GL_RENDERBUFFER_EXT               0x8D41
#define GL_RENDERBUFFER_WIDTH_EXT         0x8D42
#define GL_RENDERBUFFER_HEIGHT_EXT        0x8D43
#define GL_RENDERBUFFER_INTERNAL_FORMAT_EXT 0x8D44
#define GL_STENCIL_INDEX1_EXT             0x8D46
#define GL_STENCIL_INDEX4_EXT             0x8D47
#define GL_STENCIL_INDEX8_EXT             0x8D48
#define GL_STENCIL_INDEX16_EXT            0x8D49
#define GL_RENDERBUFFER_RED_SIZE_EXT      0x8D50
#define GL_RENDERBUFFER_GREEN_SIZE_EXT    0x8D51
#define GL_RENDERBUFFER_BLUE_SIZE_EXT     0x8D52
#define GL_RENDERBUFFER_ALPHA_SIZE_EXT    0x8D53
#define GL_RENDERBUFFER_DEPTH_SIZE_EXT    0x8D54
#define GL_RENDERBUFFER_STENCIL_SIZE_EXT  0x8D55
#endif

#ifndef GL_GREMEDY_string_marker
#endif


/*************************************************************/

#include <stddef.h>
#ifndef GL_VERSION_2_0
/* GL type for program/shader text */
typedef char GLchar;			/* native character */
#endif

#ifndef GL_VERSION_1_5
/* GL types for handling large vertex buffer objects */
typedef ptrdiff_t GLintptr;
typedef ptrdiff_t GLsizeiptr;
#endif

#ifndef GL_ARB_vertex_buffer_object
/* GL types for handling large vertex buffer objects */
typedef ptrdiff_t GLintptrARB;
typedef ptrdiff_t GLsizeiptrARB;
#endif

#ifndef GL_ARB_shader_objects
/* GL types for handling shader object handles and program/shader text */
typedef char GLcharARB;		/* native character */
typedef unsigned int GLhandleARB;	/* shader object handle */
#endif

/* GL types for "half" precision (s10e5) float data in host memory */
#ifndef GL_ARB_half_float_pixel
typedef unsigned short GLhalfARB;
#endif

#ifndef GL_NV_half_float
typedef unsigned short GLhalfNV;
#endif

#ifndef GL_VERSION_1_2
#define GL_VERSION_1_2 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBlendColor (GLclampf, GLclampf, GLclampf, GLclampf);
GLAPI void APIENTRY glBlendEquation (GLenum);
GLAPI void APIENTRY glDrawRangeElements (GLenum, GLuint, GLuint, GLsizei, GLenum, const GLvoid *);
GLAPI void APIENTRY glColorTable (GLenum, GLenum, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glColorTableParameterfv (GLenum, GLenum, const GLfloat *);
GLAPI void APIENTRY glColorTableParameteriv (GLenum, GLenum, const GLint *);
GLAPI void APIENTRY glCopyColorTable (GLenum, GLenum, GLint, GLint, GLsizei);
GLAPI void APIENTRY glGetColorTable (GLenum, GLenum, GLenum, GLvoid *);
GLAPI void APIENTRY glGetColorTableParameterfv (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetColorTableParameteriv (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glColorSubTable (GLenum, GLsizei, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glCopyColorSubTable (GLenum, GLsizei, GLint, GLint, GLsizei);
GLAPI void APIENTRY glConvolutionFilter1D (GLenum, GLenum, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glConvolutionFilter2D (GLenum, GLenum, GLsizei, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glConvolutionParameterf (GLenum, GLenum, GLfloat);
GLAPI void APIENTRY glConvolutionParameterfv (GLenum, GLenum, const GLfloat *);
GLAPI void APIENTRY glConvolutionParameteri (GLenum, GLenum, GLint);
GLAPI void APIENTRY glConvolutionParameteriv (GLenum, GLenum, const GLint *);
GLAPI void APIENTRY glCopyConvolutionFilter1D (GLenum, GLenum, GLint, GLint, GLsizei);
GLAPI void APIENTRY glCopyConvolutionFilter2D (GLenum, GLenum, GLint, GLint, GLsizei, GLsizei);
GLAPI void APIENTRY glGetConvolutionFilter (GLenum, GLenum, GLenum, GLvoid *);
GLAPI void APIENTRY glGetConvolutionParameterfv (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetConvolutionParameteriv (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetSeparableFilter (GLenum, GLenum, GLenum, GLvoid *, GLvoid *, GLvoid *);
GLAPI void APIENTRY glSeparableFilter2D (GLenum, GLenum, GLsizei, GLsizei, GLenum, GLenum, const GLvoid *, const GLvoid *);
GLAPI void APIENTRY glGetHistogram (GLenum, GLboolean, GLenum, GLenum, GLvoid *);
GLAPI void APIENTRY glGetHistogramParameterfv (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetHistogramParameteriv (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetMinmax (GLenum, GLboolean, GLenum, GLenum, GLvoid *);
GLAPI void APIENTRY glGetMinmaxParameterfv (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetMinmaxParameteriv (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glHistogram (GLenum, GLsizei, GLenum, GLboolean);
GLAPI void APIENTRY glMinmax (GLenum, GLenum, GLboolean);
GLAPI void APIENTRY glResetHistogram (GLenum);
GLAPI void APIENTRY glResetMinmax (GLenum);
GLAPI void APIENTRY glTexImage3D (GLenum, GLint, GLint, GLsizei, GLsizei, GLsizei, GLint, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glTexSubImage3D (GLenum, GLint, GLint, GLint, GLint, GLsizei, GLsizei, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glCopyTexSubImage3D (GLenum, GLint, GLint, GLint, GLint, GLint, GLint, GLsizei, GLsizei);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBLENDCOLORPROC) (GLclampf red, GLclampf green, GLclampf blue, GLclampf alpha);
typedef void (APIENTRYP PFNGLBLENDEQUATIONPROC) (GLenum mode);
typedef void (APIENTRYP PFNGLDRAWRANGEELEMENTSPROC) (GLenum mode, GLuint start, GLuint end, GLsizei count, GLenum type, const GLvoid *indices);
typedef void (APIENTRYP PFNGLCOLORTABLEPROC) (GLenum target, GLenum internalformat, GLsizei width, GLenum format, GLenum type, const GLvoid *table);
typedef void (APIENTRYP PFNGLCOLORTABLEPARAMETERFVPROC) (GLenum target, GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLCOLORTABLEPARAMETERIVPROC) (GLenum target, GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLCOPYCOLORTABLEPROC) (GLenum target, GLenum internalformat, GLint x, GLint y, GLsizei width);
typedef void (APIENTRYP PFNGLGETCOLORTABLEPROC) (GLenum target, GLenum format, GLenum type, GLvoid *table);
typedef void (APIENTRYP PFNGLGETCOLORTABLEPARAMETERFVPROC) (GLenum target, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETCOLORTABLEPARAMETERIVPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLCOLORSUBTABLEPROC) (GLenum target, GLsizei start, GLsizei count, GLenum format, GLenum type, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOPYCOLORSUBTABLEPROC) (GLenum target, GLsizei start, GLint x, GLint y, GLsizei width);
typedef void (APIENTRYP PFNGLCONVOLUTIONFILTER1DPROC) (GLenum target, GLenum internalformat, GLsizei width, GLenum format, GLenum type, const GLvoid *image);
typedef void (APIENTRYP PFNGLCONVOLUTIONFILTER2DPROC) (GLenum target, GLenum internalformat, GLsizei width, GLsizei height, GLenum format, GLenum type, const GLvoid *image);
typedef void (APIENTRYP PFNGLCONVOLUTIONPARAMETERFPROC) (GLenum target, GLenum pname, GLfloat params);
typedef void (APIENTRYP PFNGLCONVOLUTIONPARAMETERFVPROC) (GLenum target, GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLCONVOLUTIONPARAMETERIPROC) (GLenum target, GLenum pname, GLint params);
typedef void (APIENTRYP PFNGLCONVOLUTIONPARAMETERIVPROC) (GLenum target, GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLCOPYCONVOLUTIONFILTER1DPROC) (GLenum target, GLenum internalformat, GLint x, GLint y, GLsizei width);
typedef void (APIENTRYP PFNGLCOPYCONVOLUTIONFILTER2DPROC) (GLenum target, GLenum internalformat, GLint x, GLint y, GLsizei width, GLsizei height);
typedef void (APIENTRYP PFNGLGETCONVOLUTIONFILTERPROC) (GLenum target, GLenum format, GLenum type, GLvoid *image);
typedef void (APIENTRYP PFNGLGETCONVOLUTIONPARAMETERFVPROC) (GLenum target, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETCONVOLUTIONPARAMETERIVPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETSEPARABLEFILTERPROC) (GLenum target, GLenum format, GLenum type, GLvoid *row, GLvoid *column, GLvoid *span);
typedef void (APIENTRYP PFNGLSEPARABLEFILTER2DPROC) (GLenum target, GLenum internalformat, GLsizei width, GLsizei height, GLenum format, GLenum type, const GLvoid *row, const GLvoid *column);
typedef void (APIENTRYP PFNGLGETHISTOGRAMPROC) (GLenum target, GLboolean reset, GLenum format, GLenum type, GLvoid *values);
typedef void (APIENTRYP PFNGLGETHISTOGRAMPARAMETERFVPROC) (GLenum target, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETHISTOGRAMPARAMETERIVPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETMINMAXPROC) (GLenum target, GLboolean reset, GLenum format, GLenum type, GLvoid *values);
typedef void (APIENTRYP PFNGLGETMINMAXPARAMETERFVPROC) (GLenum target, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETMINMAXPARAMETERIVPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLHISTOGRAMPROC) (GLenum target, GLsizei width, GLenum internalformat, GLboolean sink);
typedef void (APIENTRYP PFNGLMINMAXPROC) (GLenum target, GLenum internalformat, GLboolean sink);
typedef void (APIENTRYP PFNGLRESETHISTOGRAMPROC) (GLenum target);
typedef void (APIENTRYP PFNGLRESETMINMAXPROC) (GLenum target);
typedef void (APIENTRYP PFNGLTEXIMAGE3DPROC) (GLenum target, GLint level, GLint internalformat, GLsizei width, GLsizei height, GLsizei depth, GLint border, GLenum format, GLenum type, const GLvoid *pixels);
typedef void (APIENTRYP PFNGLTEXSUBIMAGE3DPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLint zoffset, GLsizei width, GLsizei height, GLsizei depth, GLenum format, GLenum type, const GLvoid *pixels);
typedef void (APIENTRYP PFNGLCOPYTEXSUBIMAGE3DPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLint zoffset, GLint x, GLint y, GLsizei width, GLsizei height);
#endif

#ifndef GL_VERSION_1_3
#define GL_VERSION_1_3 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glActiveTexture (GLenum);
GLAPI void APIENTRY glClientActiveTexture (GLenum);
GLAPI void APIENTRY glMultiTexCoord1d (GLenum, GLdouble);
GLAPI void APIENTRY glMultiTexCoord1dv (GLenum, const GLdouble *);
GLAPI void APIENTRY glMultiTexCoord1f (GLenum, GLfloat);
GLAPI void APIENTRY glMultiTexCoord1fv (GLenum, const GLfloat *);
GLAPI void APIENTRY glMultiTexCoord1i (GLenum, GLint);
GLAPI void APIENTRY glMultiTexCoord1iv (GLenum, const GLint *);
GLAPI void APIENTRY glMultiTexCoord1s (GLenum, GLshort);
GLAPI void APIENTRY glMultiTexCoord1sv (GLenum, const GLshort *);
GLAPI void APIENTRY glMultiTexCoord2d (GLenum, GLdouble, GLdouble);
GLAPI void APIENTRY glMultiTexCoord2dv (GLenum, const GLdouble *);
GLAPI void APIENTRY glMultiTexCoord2f (GLenum, GLfloat, GLfloat);
GLAPI void APIENTRY glMultiTexCoord2fv (GLenum, const GLfloat *);
GLAPI void APIENTRY glMultiTexCoord2i (GLenum, GLint, GLint);
GLAPI void APIENTRY glMultiTexCoord2iv (GLenum, const GLint *);
GLAPI void APIENTRY glMultiTexCoord2s (GLenum, GLshort, GLshort);
GLAPI void APIENTRY glMultiTexCoord2sv (GLenum, const GLshort *);
GLAPI void APIENTRY glMultiTexCoord3d (GLenum, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glMultiTexCoord3dv (GLenum, const GLdouble *);
GLAPI void APIENTRY glMultiTexCoord3f (GLenum, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glMultiTexCoord3fv (GLenum, const GLfloat *);
GLAPI void APIENTRY glMultiTexCoord3i (GLenum, GLint, GLint, GLint);
GLAPI void APIENTRY glMultiTexCoord3iv (GLenum, const GLint *);
GLAPI void APIENTRY glMultiTexCoord3s (GLenum, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glMultiTexCoord3sv (GLenum, const GLshort *);
GLAPI void APIENTRY glMultiTexCoord4d (GLenum, GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glMultiTexCoord4dv (GLenum, const GLdouble *);
GLAPI void APIENTRY glMultiTexCoord4f (GLenum, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glMultiTexCoord4fv (GLenum, const GLfloat *);
GLAPI void APIENTRY glMultiTexCoord4i (GLenum, GLint, GLint, GLint, GLint);
GLAPI void APIENTRY glMultiTexCoord4iv (GLenum, const GLint *);
GLAPI void APIENTRY glMultiTexCoord4s (GLenum, GLshort, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glMultiTexCoord4sv (GLenum, const GLshort *);
GLAPI void APIENTRY glLoadTransposeMatrixf (const GLfloat *);
GLAPI void APIENTRY glLoadTransposeMatrixd (const GLdouble *);
GLAPI void APIENTRY glMultTransposeMatrixf (const GLfloat *);
GLAPI void APIENTRY glMultTransposeMatrixd (const GLdouble *);
GLAPI void APIENTRY glSampleCoverage (GLclampf, GLboolean);
GLAPI void APIENTRY glCompressedTexImage3D (GLenum, GLint, GLenum, GLsizei, GLsizei, GLsizei, GLint, GLsizei, const GLvoid *);
GLAPI void APIENTRY glCompressedTexImage2D (GLenum, GLint, GLenum, GLsizei, GLsizei, GLint, GLsizei, const GLvoid *);
GLAPI void APIENTRY glCompressedTexImage1D (GLenum, GLint, GLenum, GLsizei, GLint, GLsizei, const GLvoid *);
GLAPI void APIENTRY glCompressedTexSubImage3D (GLenum, GLint, GLint, GLint, GLint, GLsizei, GLsizei, GLsizei, GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glCompressedTexSubImage2D (GLenum, GLint, GLint, GLint, GLsizei, GLsizei, GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glCompressedTexSubImage1D (GLenum, GLint, GLint, GLsizei, GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glGetCompressedTexImage (GLenum, GLint, GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLACTIVETEXTUREPROC) (GLenum texture);
typedef void (APIENTRYP PFNGLCLIENTACTIVETEXTUREPROC) (GLenum texture);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1DPROC) (GLenum target, GLdouble s);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1DVPROC) (GLenum target, const GLdouble *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1FPROC) (GLenum target, GLfloat s);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1FVPROC) (GLenum target, const GLfloat *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1IPROC) (GLenum target, GLint s);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1IVPROC) (GLenum target, const GLint *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1SPROC) (GLenum target, GLshort s);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1SVPROC) (GLenum target, const GLshort *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2DPROC) (GLenum target, GLdouble s, GLdouble t);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2DVPROC) (GLenum target, const GLdouble *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2FPROC) (GLenum target, GLfloat s, GLfloat t);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2FVPROC) (GLenum target, const GLfloat *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2IPROC) (GLenum target, GLint s, GLint t);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2IVPROC) (GLenum target, const GLint *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2SPROC) (GLenum target, GLshort s, GLshort t);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2SVPROC) (GLenum target, const GLshort *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3DPROC) (GLenum target, GLdouble s, GLdouble t, GLdouble r);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3DVPROC) (GLenum target, const GLdouble *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3FPROC) (GLenum target, GLfloat s, GLfloat t, GLfloat r);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3FVPROC) (GLenum target, const GLfloat *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3IPROC) (GLenum target, GLint s, GLint t, GLint r);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3IVPROC) (GLenum target, const GLint *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3SPROC) (GLenum target, GLshort s, GLshort t, GLshort r);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3SVPROC) (GLenum target, const GLshort *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4DPROC) (GLenum target, GLdouble s, GLdouble t, GLdouble r, GLdouble q);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4DVPROC) (GLenum target, const GLdouble *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4FPROC) (GLenum target, GLfloat s, GLfloat t, GLfloat r, GLfloat q);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4FVPROC) (GLenum target, const GLfloat *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4IPROC) (GLenum target, GLint s, GLint t, GLint r, GLint q);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4IVPROC) (GLenum target, const GLint *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4SPROC) (GLenum target, GLshort s, GLshort t, GLshort r, GLshort q);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4SVPROC) (GLenum target, const GLshort *v);
typedef void (APIENTRYP PFNGLLOADTRANSPOSEMATRIXFPROC) (const GLfloat *m);
typedef void (APIENTRYP PFNGLLOADTRANSPOSEMATRIXDPROC) (const GLdouble *m);
typedef void (APIENTRYP PFNGLMULTTRANSPOSEMATRIXFPROC) (const GLfloat *m);
typedef void (APIENTRYP PFNGLMULTTRANSPOSEMATRIXDPROC) (const GLdouble *m);
typedef void (APIENTRYP PFNGLSAMPLECOVERAGEPROC) (GLclampf value, GLboolean invert);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXIMAGE3DPROC) (GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height, GLsizei depth, GLint border, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXIMAGE2DPROC) (GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height, GLint border, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXIMAGE1DPROC) (GLenum target, GLint level, GLenum internalformat, GLsizei width, GLint border, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXSUBIMAGE3DPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLint zoffset, GLsizei width, GLsizei height, GLsizei depth, GLenum format, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXSUBIMAGE2DPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLsizei width, GLsizei height, GLenum format, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXSUBIMAGE1DPROC) (GLenum target, GLint level, GLint xoffset, GLsizei width, GLenum format, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLGETCOMPRESSEDTEXIMAGEPROC) (GLenum target, GLint level, GLvoid *img);
#endif

#ifndef GL_VERSION_1_4
#define GL_VERSION_1_4 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBlendFuncSeparate (GLenum, GLenum, GLenum, GLenum);
GLAPI void APIENTRY glFogCoordf (GLfloat);
GLAPI void APIENTRY glFogCoordfv (const GLfloat *);
GLAPI void APIENTRY glFogCoordd (GLdouble);
GLAPI void APIENTRY glFogCoorddv (const GLdouble *);
GLAPI void APIENTRY glFogCoordPointer (GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glMultiDrawArrays (GLenum, GLint *, GLsizei *, GLsizei);
GLAPI void APIENTRY glMultiDrawElements (GLenum, const GLsizei *, GLenum, const GLvoid* *, GLsizei);
GLAPI void APIENTRY glPointParameterf (GLenum, GLfloat);
GLAPI void APIENTRY glPointParameterfv (GLenum, const GLfloat *);
GLAPI void APIENTRY glPointParameteri (GLenum, GLint);
GLAPI void APIENTRY glPointParameteriv (GLenum, const GLint *);
GLAPI void APIENTRY glSecondaryColor3b (GLbyte, GLbyte, GLbyte);
GLAPI void APIENTRY glSecondaryColor3bv (const GLbyte *);
GLAPI void APIENTRY glSecondaryColor3d (GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glSecondaryColor3dv (const GLdouble *);
GLAPI void APIENTRY glSecondaryColor3f (GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glSecondaryColor3fv (const GLfloat *);
GLAPI void APIENTRY glSecondaryColor3i (GLint, GLint, GLint);
GLAPI void APIENTRY glSecondaryColor3iv (const GLint *);
GLAPI void APIENTRY glSecondaryColor3s (GLshort, GLshort, GLshort);
GLAPI void APIENTRY glSecondaryColor3sv (const GLshort *);
GLAPI void APIENTRY glSecondaryColor3ub (GLubyte, GLubyte, GLubyte);
GLAPI void APIENTRY glSecondaryColor3ubv (const GLubyte *);
GLAPI void APIENTRY glSecondaryColor3ui (GLuint, GLuint, GLuint);
GLAPI void APIENTRY glSecondaryColor3uiv (const GLuint *);
GLAPI void APIENTRY glSecondaryColor3us (GLushort, GLushort, GLushort);
GLAPI void APIENTRY glSecondaryColor3usv (const GLushort *);
GLAPI void APIENTRY glSecondaryColorPointer (GLint, GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glWindowPos2d (GLdouble, GLdouble);
GLAPI void APIENTRY glWindowPos2dv (const GLdouble *);
GLAPI void APIENTRY glWindowPos2f (GLfloat, GLfloat);
GLAPI void APIENTRY glWindowPos2fv (const GLfloat *);
GLAPI void APIENTRY glWindowPos2i (GLint, GLint);
GLAPI void APIENTRY glWindowPos2iv (const GLint *);
GLAPI void APIENTRY glWindowPos2s (GLshort, GLshort);
GLAPI void APIENTRY glWindowPos2sv (const GLshort *);
GLAPI void APIENTRY glWindowPos3d (GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glWindowPos3dv (const GLdouble *);
GLAPI void APIENTRY glWindowPos3f (GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glWindowPos3fv (const GLfloat *);
GLAPI void APIENTRY glWindowPos3i (GLint, GLint, GLint);
GLAPI void APIENTRY glWindowPos3iv (const GLint *);
GLAPI void APIENTRY glWindowPos3s (GLshort, GLshort, GLshort);
GLAPI void APIENTRY glWindowPos3sv (const GLshort *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBLENDFUNCSEPARATEPROC) (GLenum sfactorRGB, GLenum dfactorRGB, GLenum sfactorAlpha, GLenum dfactorAlpha);
typedef void (APIENTRYP PFNGLFOGCOORDFPROC) (GLfloat coord);
typedef void (APIENTRYP PFNGLFOGCOORDFVPROC) (const GLfloat *coord);
typedef void (APIENTRYP PFNGLFOGCOORDDPROC) (GLdouble coord);
typedef void (APIENTRYP PFNGLFOGCOORDDVPROC) (const GLdouble *coord);
typedef void (APIENTRYP PFNGLFOGCOORDPOINTERPROC) (GLenum type, GLsizei stride, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLMULTIDRAWARRAYSPROC) (GLenum mode, GLint *first, GLsizei *count, GLsizei primcount);
typedef void (APIENTRYP PFNGLMULTIDRAWELEMENTSPROC) (GLenum mode, const GLsizei *count, GLenum type, const GLvoid* *indices, GLsizei primcount);
typedef void (APIENTRYP PFNGLPOINTPARAMETERFPROC) (GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLPOINTPARAMETERFVPROC) (GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLPOINTPARAMETERIPROC) (GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLPOINTPARAMETERIVPROC) (GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3BPROC) (GLbyte red, GLbyte green, GLbyte blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3BVPROC) (const GLbyte *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3DPROC) (GLdouble red, GLdouble green, GLdouble blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3DVPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3FPROC) (GLfloat red, GLfloat green, GLfloat blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3FVPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3IPROC) (GLint red, GLint green, GLint blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3IVPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3SPROC) (GLshort red, GLshort green, GLshort blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3SVPROC) (const GLshort *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3UBPROC) (GLubyte red, GLubyte green, GLubyte blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3UBVPROC) (const GLubyte *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3UIPROC) (GLuint red, GLuint green, GLuint blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3UIVPROC) (const GLuint *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3USPROC) (GLushort red, GLushort green, GLushort blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3USVPROC) (const GLushort *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLORPOINTERPROC) (GLint size, GLenum type, GLsizei stride, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLWINDOWPOS2DPROC) (GLdouble x, GLdouble y);
typedef void (APIENTRYP PFNGLWINDOWPOS2DVPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLWINDOWPOS2FPROC) (GLfloat x, GLfloat y);
typedef void (APIENTRYP PFNGLWINDOWPOS2FVPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLWINDOWPOS2IPROC) (GLint x, GLint y);
typedef void (APIENTRYP PFNGLWINDOWPOS2IVPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLWINDOWPOS2SPROC) (GLshort x, GLshort y);
typedef void (APIENTRYP PFNGLWINDOWPOS2SVPROC) (const GLshort *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3DPROC) (GLdouble x, GLdouble y, GLdouble z);
typedef void (APIENTRYP PFNGLWINDOWPOS3DVPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3FPROC) (GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLWINDOWPOS3FVPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3IPROC) (GLint x, GLint y, GLint z);
typedef void (APIENTRYP PFNGLWINDOWPOS3IVPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3SPROC) (GLshort x, GLshort y, GLshort z);
typedef void (APIENTRYP PFNGLWINDOWPOS3SVPROC) (const GLshort *v);
#endif

#ifndef GL_VERSION_1_5
#define GL_VERSION_1_5 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glGenQueries (GLsizei, GLuint *);
GLAPI void APIENTRY glDeleteQueries (GLsizei, const GLuint *);
GLAPI GLboolean APIENTRY glIsQuery (GLuint);
GLAPI void APIENTRY glBeginQuery (GLenum, GLuint);
GLAPI void APIENTRY glEndQuery (GLenum);
GLAPI void APIENTRY glGetQueryiv (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetQueryObjectiv (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetQueryObjectuiv (GLuint, GLenum, GLuint *);
GLAPI void APIENTRY glBindBuffer (GLenum, GLuint);
GLAPI void APIENTRY glDeleteBuffers (GLsizei, const GLuint *);
GLAPI void APIENTRY glGenBuffers (GLsizei, GLuint *);
GLAPI GLboolean APIENTRY glIsBuffer (GLuint);
GLAPI void APIENTRY glBufferData (GLenum, GLsizeiptr, const GLvoid *, GLenum);
GLAPI void APIENTRY glBufferSubData (GLenum, GLintptr, GLsizeiptr, const GLvoid *);
GLAPI void APIENTRY glGetBufferSubData (GLenum, GLintptr, GLsizeiptr, GLvoid *);
GLAPI GLvoid* APIENTRY glMapBuffer (GLenum, GLenum);
GLAPI GLboolean APIENTRY glUnmapBuffer (GLenum);
GLAPI void APIENTRY glGetBufferParameteriv (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetBufferPointerv (GLenum, GLenum, GLvoid* *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLGENQUERIESPROC) (GLsizei n, GLuint *ids);
typedef void (APIENTRYP PFNGLDELETEQUERIESPROC) (GLsizei n, const GLuint *ids);
typedef GLboolean (APIENTRYP PFNGLISQUERYPROC) (GLuint id);
typedef void (APIENTRYP PFNGLBEGINQUERYPROC) (GLenum target, GLuint id);
typedef void (APIENTRYP PFNGLENDQUERYPROC) (GLenum target);
typedef void (APIENTRYP PFNGLGETQUERYIVPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETQUERYOBJECTIVPROC) (GLuint id, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETQUERYOBJECTUIVPROC) (GLuint id, GLenum pname, GLuint *params);
typedef void (APIENTRYP PFNGLBINDBUFFERPROC) (GLenum target, GLuint buffer);
typedef void (APIENTRYP PFNGLDELETEBUFFERSPROC) (GLsizei n, const GLuint *buffers);
typedef void (APIENTRYP PFNGLGENBUFFERSPROC) (GLsizei n, GLuint *buffers);
typedef GLboolean (APIENTRYP PFNGLISBUFFERPROC) (GLuint buffer);
typedef void (APIENTRYP PFNGLBUFFERDATAPROC) (GLenum target, GLsizeiptr size, const GLvoid *data, GLenum usage);
typedef void (APIENTRYP PFNGLBUFFERSUBDATAPROC) (GLenum target, GLintptr offset, GLsizeiptr size, const GLvoid *data);
typedef void (APIENTRYP PFNGLGETBUFFERSUBDATAPROC) (GLenum target, GLintptr offset, GLsizeiptr size, GLvoid *data);
typedef GLvoid* (APIENTRYP PFNGLMAPBUFFERPROC) (GLenum target, GLenum access);
typedef GLboolean (APIENTRYP PFNGLUNMAPBUFFERPROC) (GLenum target);
typedef void (APIENTRYP PFNGLGETBUFFERPARAMETERIVPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETBUFFERPOINTERVPROC) (GLenum target, GLenum pname, GLvoid* *params);
#endif

#ifndef GL_VERSION_2_0
#define GL_VERSION_2_0 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBlendEquationSeparate (GLenum, GLenum);
GLAPI void APIENTRY glDrawBuffers (GLsizei, const GLenum *);
GLAPI void APIENTRY glStencilOpSeparate (GLenum, GLenum, GLenum, GLenum);
GLAPI void APIENTRY glStencilFuncSeparate (GLenum, GLenum, GLint, GLuint);
GLAPI void APIENTRY glStencilMaskSeparate (GLenum, GLuint);
GLAPI void APIENTRY glAttachShader (GLuint, GLuint);
GLAPI void APIENTRY glBindAttribLocation (GLuint, GLuint, const GLchar *);
GLAPI void APIENTRY glCompileShader (GLuint);
GLAPI GLuint APIENTRY glCreateProgram (void);
GLAPI GLuint APIENTRY glCreateShader (GLenum);
GLAPI void APIENTRY glDeleteProgram (GLuint);
GLAPI void APIENTRY glDeleteShader (GLuint);
GLAPI void APIENTRY glDetachShader (GLuint, GLuint);
GLAPI void APIENTRY glDisableVertexAttribArray (GLuint);
GLAPI void APIENTRY glEnableVertexAttribArray (GLuint);
GLAPI void APIENTRY glGetActiveAttrib (GLuint, GLuint, GLsizei, GLsizei *, GLint *, GLenum *, GLchar *);
GLAPI void APIENTRY glGetActiveUniform (GLuint, GLuint, GLsizei, GLsizei *, GLint *, GLenum *, GLchar *);
GLAPI void APIENTRY glGetAttachedShaders (GLuint, GLsizei, GLsizei *, GLuint *);
GLAPI GLint APIENTRY glGetAttribLocation (GLuint, const GLchar *);
GLAPI void APIENTRY glGetProgramiv (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetProgramInfoLog (GLuint, GLsizei, GLsizei *, GLchar *);
GLAPI void APIENTRY glGetShaderiv (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetShaderInfoLog (GLuint, GLsizei, GLsizei *, GLchar *);
GLAPI void APIENTRY glGetShaderSource (GLuint, GLsizei, GLsizei *, GLchar *);
GLAPI GLint APIENTRY glGetUniformLocation (GLuint, const GLchar *);
GLAPI void APIENTRY glGetUniformfv (GLuint, GLint, GLfloat *);
GLAPI void APIENTRY glGetUniformiv (GLuint, GLint, GLint *);
GLAPI void APIENTRY glGetVertexAttribdv (GLuint, GLenum, GLdouble *);
GLAPI void APIENTRY glGetVertexAttribfv (GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glGetVertexAttribiv (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetVertexAttribPointerv (GLuint, GLenum, GLvoid* *);
GLAPI GLboolean APIENTRY glIsProgram (GLuint);
GLAPI GLboolean APIENTRY glIsShader (GLuint);
GLAPI void APIENTRY glLinkProgram (GLuint);
GLAPI void APIENTRY glShaderSource (GLuint, GLsizei, const GLchar* *, const GLint *);
GLAPI void APIENTRY glUseProgram (GLuint);
GLAPI void APIENTRY glUniform1f (GLint, GLfloat);
GLAPI void APIENTRY glUniform2f (GLint, GLfloat, GLfloat);
GLAPI void APIENTRY glUniform3f (GLint, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glUniform4f (GLint, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glUniform1i (GLint, GLint);
GLAPI void APIENTRY glUniform2i (GLint, GLint, GLint);
GLAPI void APIENTRY glUniform3i (GLint, GLint, GLint, GLint);
GLAPI void APIENTRY glUniform4i (GLint, GLint, GLint, GLint, GLint);
GLAPI void APIENTRY glUniform1fv (GLint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glUniform2fv (GLint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glUniform3fv (GLint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glUniform4fv (GLint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glUniform1iv (GLint, GLsizei, const GLint *);
GLAPI void APIENTRY glUniform2iv (GLint, GLsizei, const GLint *);
GLAPI void APIENTRY glUniform3iv (GLint, GLsizei, const GLint *);
GLAPI void APIENTRY glUniform4iv (GLint, GLsizei, const GLint *);
GLAPI void APIENTRY glUniformMatrix2fv (GLint, GLsizei, GLboolean, const GLfloat *);
GLAPI void APIENTRY glUniformMatrix3fv (GLint, GLsizei, GLboolean, const GLfloat *);
GLAPI void APIENTRY glUniformMatrix4fv (GLint, GLsizei, GLboolean, const GLfloat *);
GLAPI void APIENTRY glValidateProgram (GLuint);
GLAPI void APIENTRY glVertexAttrib1d (GLuint, GLdouble);
GLAPI void APIENTRY glVertexAttrib1dv (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib1f (GLuint, GLfloat);
GLAPI void APIENTRY glVertexAttrib1fv (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib1s (GLuint, GLshort);
GLAPI void APIENTRY glVertexAttrib1sv (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib2d (GLuint, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexAttrib2dv (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib2f (GLuint, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexAttrib2fv (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib2s (GLuint, GLshort, GLshort);
GLAPI void APIENTRY glVertexAttrib2sv (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib3d (GLuint, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexAttrib3dv (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib3f (GLuint, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexAttrib3fv (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib3s (GLuint, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glVertexAttrib3sv (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib4Nbv (GLuint, const GLbyte *);
GLAPI void APIENTRY glVertexAttrib4Niv (GLuint, const GLint *);
GLAPI void APIENTRY glVertexAttrib4Nsv (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib4Nub (GLuint, GLubyte, GLubyte, GLubyte, GLubyte);
GLAPI void APIENTRY glVertexAttrib4Nubv (GLuint, const GLubyte *);
GLAPI void APIENTRY glVertexAttrib4Nuiv (GLuint, const GLuint *);
GLAPI void APIENTRY glVertexAttrib4Nusv (GLuint, const GLushort *);
GLAPI void APIENTRY glVertexAttrib4bv (GLuint, const GLbyte *);
GLAPI void APIENTRY glVertexAttrib4d (GLuint, GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexAttrib4dv (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib4f (GLuint, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexAttrib4fv (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib4iv (GLuint, const GLint *);
GLAPI void APIENTRY glVertexAttrib4s (GLuint, GLshort, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glVertexAttrib4sv (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib4ubv (GLuint, const GLubyte *);
GLAPI void APIENTRY glVertexAttrib4uiv (GLuint, const GLuint *);
GLAPI void APIENTRY glVertexAttrib4usv (GLuint, const GLushort *);
GLAPI void APIENTRY glVertexAttribPointer (GLuint, GLint, GLenum, GLboolean, GLsizei, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBLENDEQUATIONSEPARATEPROC) (GLenum modeRGB, GLenum modeAlpha);
typedef void (APIENTRYP PFNGLDRAWBUFFERSPROC) (GLsizei n, const GLenum *bufs);
typedef void (APIENTRYP PFNGLSTENCILOPSEPARATEPROC) (GLenum face, GLenum sfail, GLenum dpfail, GLenum dppass);
typedef void (APIENTRYP PFNGLSTENCILFUNCSEPARATEPROC) (GLenum frontfunc, GLenum backfunc, GLint ref, GLuint mask);
typedef void (APIENTRYP PFNGLSTENCILMASKSEPARATEPROC) (GLenum face, GLuint mask);
typedef void (APIENTRYP PFNGLATTACHSHADERPROC) (GLuint program, GLuint shader);
typedef void (APIENTRYP PFNGLBINDATTRIBLOCATIONPROC) (GLuint program, GLuint index, const GLchar *name);
typedef void (APIENTRYP PFNGLCOMPILESHADERPROC) (GLuint shader);
typedef GLuint (APIENTRYP PFNGLCREATEPROGRAMPROC) (void);
typedef GLuint (APIENTRYP PFNGLCREATESHADERPROC) (GLenum type);
typedef void (APIENTRYP PFNGLDELETEPROGRAMPROC) (GLuint program);
typedef void (APIENTRYP PFNGLDELETESHADERPROC) (GLuint shader);
typedef void (APIENTRYP PFNGLDETACHSHADERPROC) (GLuint program, GLuint shader);
typedef void (APIENTRYP PFNGLDISABLEVERTEXATTRIBARRAYPROC) (GLuint index);
typedef void (APIENTRYP PFNGLENABLEVERTEXATTRIBARRAYPROC) (GLuint index);
typedef void (APIENTRYP PFNGLGETACTIVEATTRIBPROC) (GLuint program, GLuint index, GLsizei bufSize, GLsizei *length, GLint *size, GLenum *type, GLchar *name);
typedef void (APIENTRYP PFNGLGETACTIVEUNIFORMPROC) (GLuint program, GLuint index, GLsizei bufSize, GLsizei *length, GLint *size, GLenum *type, GLchar *name);
typedef void (APIENTRYP PFNGLGETATTACHEDSHADERSPROC) (GLuint program, GLsizei maxCount, GLsizei *count, GLuint *obj);
typedef GLint (APIENTRYP PFNGLGETATTRIBLOCATIONPROC) (GLuint program, const GLchar *name);
typedef void (APIENTRYP PFNGLGETPROGRAMIVPROC) (GLuint program, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETPROGRAMINFOLOGPROC) (GLuint program, GLsizei bufSize, GLsizei *length, GLchar *infoLog);
typedef void (APIENTRYP PFNGLGETSHADERIVPROC) (GLuint shader, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETSHADERINFOLOGPROC) (GLuint shader, GLsizei bufSize, GLsizei *length, GLchar *infoLog);
typedef void (APIENTRYP PFNGLGETSHADERSOURCEPROC) (GLuint shader, GLsizei bufSize, GLsizei *length, GLchar *source);
typedef GLint (APIENTRYP PFNGLGETUNIFORMLOCATIONPROC) (GLuint program, const GLchar *name);
typedef void (APIENTRYP PFNGLGETUNIFORMFVPROC) (GLuint program, GLint location, GLfloat *params);
typedef void (APIENTRYP PFNGLGETUNIFORMIVPROC) (GLuint program, GLint location, GLint *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBDVPROC) (GLuint index, GLenum pname, GLdouble *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBFVPROC) (GLuint index, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBIVPROC) (GLuint index, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBPOINTERVPROC) (GLuint index, GLenum pname, GLvoid* *pointer);
typedef GLboolean (APIENTRYP PFNGLISPROGRAMPROC) (GLuint program);
typedef GLboolean (APIENTRYP PFNGLISSHADERPROC) (GLuint shader);
typedef void (APIENTRYP PFNGLLINKPROGRAMPROC) (GLuint program);
typedef void (APIENTRYP PFNGLSHADERSOURCEPROC) (GLuint shader, GLsizei count, const GLchar* *string, const GLint *length);
typedef void (APIENTRYP PFNGLUSEPROGRAMPROC) (GLuint program);
typedef void (APIENTRYP PFNGLUNIFORM1FPROC) (GLint location, GLfloat v0);
typedef void (APIENTRYP PFNGLUNIFORM2FPROC) (GLint location, GLfloat v0, GLfloat v1);
typedef void (APIENTRYP PFNGLUNIFORM3FPROC) (GLint location, GLfloat v0, GLfloat v1, GLfloat v2);
typedef void (APIENTRYP PFNGLUNIFORM4FPROC) (GLint location, GLfloat v0, GLfloat v1, GLfloat v2, GLfloat v3);
typedef void (APIENTRYP PFNGLUNIFORM1IPROC) (GLint location, GLint v0);
typedef void (APIENTRYP PFNGLUNIFORM2IPROC) (GLint location, GLint v0, GLint v1);
typedef void (APIENTRYP PFNGLUNIFORM3IPROC) (GLint location, GLint v0, GLint v1, GLint v2);
typedef void (APIENTRYP PFNGLUNIFORM4IPROC) (GLint location, GLint v0, GLint v1, GLint v2, GLint v3);
typedef void (APIENTRYP PFNGLUNIFORM1FVPROC) (GLint location, GLsizei count, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORM2FVPROC) (GLint location, GLsizei count, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORM3FVPROC) (GLint location, GLsizei count, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORM4FVPROC) (GLint location, GLsizei count, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORM1IVPROC) (GLint location, GLsizei count, const GLint *value);
typedef void (APIENTRYP PFNGLUNIFORM2IVPROC) (GLint location, GLsizei count, const GLint *value);
typedef void (APIENTRYP PFNGLUNIFORM3IVPROC) (GLint location, GLsizei count, const GLint *value);
typedef void (APIENTRYP PFNGLUNIFORM4IVPROC) (GLint location, GLsizei count, const GLint *value);
typedef void (APIENTRYP PFNGLUNIFORMMATRIX2FVPROC) (GLint location, GLsizei count, GLboolean transpose, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORMMATRIX3FVPROC) (GLint location, GLsizei count, GLboolean transpose, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORMMATRIX4FVPROC) (GLint location, GLsizei count, GLboolean transpose, const GLfloat *value);
typedef void (APIENTRYP PFNGLVALIDATEPROGRAMPROC) (GLuint program);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1DPROC) (GLuint index, GLdouble x);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1DVPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1FPROC) (GLuint index, GLfloat x);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1FVPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1SPROC) (GLuint index, GLshort x);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1SVPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2DPROC) (GLuint index, GLdouble x, GLdouble y);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2DVPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2FPROC) (GLuint index, GLfloat x, GLfloat y);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2FVPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2SPROC) (GLuint index, GLshort x, GLshort y);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2SVPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3DPROC) (GLuint index, GLdouble x, GLdouble y, GLdouble z);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3DVPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3FPROC) (GLuint index, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3FVPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3SPROC) (GLuint index, GLshort x, GLshort y, GLshort z);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3SVPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NBVPROC) (GLuint index, const GLbyte *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NIVPROC) (GLuint index, const GLint *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NSVPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NUBPROC) (GLuint index, GLubyte x, GLubyte y, GLubyte z, GLubyte w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NUBVPROC) (GLuint index, const GLubyte *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NUIVPROC) (GLuint index, const GLuint *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NUSVPROC) (GLuint index, const GLushort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4BVPROC) (GLuint index, const GLbyte *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4DPROC) (GLuint index, GLdouble x, GLdouble y, GLdouble z, GLdouble w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4DVPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4FPROC) (GLuint index, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4FVPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4IVPROC) (GLuint index, const GLint *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4SPROC) (GLuint index, GLshort x, GLshort y, GLshort z, GLshort w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4SVPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4UBVPROC) (GLuint index, const GLubyte *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4UIVPROC) (GLuint index, const GLuint *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4USVPROC) (GLuint index, const GLushort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBPOINTERPROC) (GLuint index, GLint size, GLenum type, GLboolean normalized, GLsizei stride, const GLvoid *pointer);
#endif

#ifndef GL_ARB_multitexture
#define GL_ARB_multitexture 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glActiveTextureARB (GLenum);
GLAPI void APIENTRY glClientActiveTextureARB (GLenum);
GLAPI void APIENTRY glMultiTexCoord1dARB (GLenum, GLdouble);
GLAPI void APIENTRY glMultiTexCoord1dvARB (GLenum, const GLdouble *);
GLAPI void APIENTRY glMultiTexCoord1fARB (GLenum, GLfloat);
GLAPI void APIENTRY glMultiTexCoord1fvARB (GLenum, const GLfloat *);
GLAPI void APIENTRY glMultiTexCoord1iARB (GLenum, GLint);
GLAPI void APIENTRY glMultiTexCoord1ivARB (GLenum, const GLint *);
GLAPI void APIENTRY glMultiTexCoord1sARB (GLenum, GLshort);
GLAPI void APIENTRY glMultiTexCoord1svARB (GLenum, const GLshort *);
GLAPI void APIENTRY glMultiTexCoord2dARB (GLenum, GLdouble, GLdouble);
GLAPI void APIENTRY glMultiTexCoord2dvARB (GLenum, const GLdouble *);
GLAPI void APIENTRY glMultiTexCoord2fARB (GLenum, GLfloat, GLfloat);
GLAPI void APIENTRY glMultiTexCoord2fvARB (GLenum, const GLfloat *);
GLAPI void APIENTRY glMultiTexCoord2iARB (GLenum, GLint, GLint);
GLAPI void APIENTRY glMultiTexCoord2ivARB (GLenum, const GLint *);
GLAPI void APIENTRY glMultiTexCoord2sARB (GLenum, GLshort, GLshort);
GLAPI void APIENTRY glMultiTexCoord2svARB (GLenum, const GLshort *);
GLAPI void APIENTRY glMultiTexCoord3dARB (GLenum, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glMultiTexCoord3dvARB (GLenum, const GLdouble *);
GLAPI void APIENTRY glMultiTexCoord3fARB (GLenum, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glMultiTexCoord3fvARB (GLenum, const GLfloat *);
GLAPI void APIENTRY glMultiTexCoord3iARB (GLenum, GLint, GLint, GLint);
GLAPI void APIENTRY glMultiTexCoord3ivARB (GLenum, const GLint *);
GLAPI void APIENTRY glMultiTexCoord3sARB (GLenum, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glMultiTexCoord3svARB (GLenum, const GLshort *);
GLAPI void APIENTRY glMultiTexCoord4dARB (GLenum, GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glMultiTexCoord4dvARB (GLenum, const GLdouble *);
GLAPI void APIENTRY glMultiTexCoord4fARB (GLenum, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glMultiTexCoord4fvARB (GLenum, const GLfloat *);
GLAPI void APIENTRY glMultiTexCoord4iARB (GLenum, GLint, GLint, GLint, GLint);
GLAPI void APIENTRY glMultiTexCoord4ivARB (GLenum, const GLint *);
GLAPI void APIENTRY glMultiTexCoord4sARB (GLenum, GLshort, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glMultiTexCoord4svARB (GLenum, const GLshort *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLACTIVETEXTUREARBPROC) (GLenum texture);
typedef void (APIENTRYP PFNGLCLIENTACTIVETEXTUREARBPROC) (GLenum texture);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1DARBPROC) (GLenum target, GLdouble s);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1DVARBPROC) (GLenum target, const GLdouble *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1FARBPROC) (GLenum target, GLfloat s);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1FVARBPROC) (GLenum target, const GLfloat *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1IARBPROC) (GLenum target, GLint s);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1IVARBPROC) (GLenum target, const GLint *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1SARBPROC) (GLenum target, GLshort s);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1SVARBPROC) (GLenum target, const GLshort *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2DARBPROC) (GLenum target, GLdouble s, GLdouble t);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2DVARBPROC) (GLenum target, const GLdouble *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2FARBPROC) (GLenum target, GLfloat s, GLfloat t);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2FVARBPROC) (GLenum target, const GLfloat *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2IARBPROC) (GLenum target, GLint s, GLint t);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2IVARBPROC) (GLenum target, const GLint *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2SARBPROC) (GLenum target, GLshort s, GLshort t);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2SVARBPROC) (GLenum target, const GLshort *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3DARBPROC) (GLenum target, GLdouble s, GLdouble t, GLdouble r);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3DVARBPROC) (GLenum target, const GLdouble *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3FARBPROC) (GLenum target, GLfloat s, GLfloat t, GLfloat r);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3FVARBPROC) (GLenum target, const GLfloat *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3IARBPROC) (GLenum target, GLint s, GLint t, GLint r);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3IVARBPROC) (GLenum target, const GLint *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3SARBPROC) (GLenum target, GLshort s, GLshort t, GLshort r);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3SVARBPROC) (GLenum target, const GLshort *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4DARBPROC) (GLenum target, GLdouble s, GLdouble t, GLdouble r, GLdouble q);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4DVARBPROC) (GLenum target, const GLdouble *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4FARBPROC) (GLenum target, GLfloat s, GLfloat t, GLfloat r, GLfloat q);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4FVARBPROC) (GLenum target, const GLfloat *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4IARBPROC) (GLenum target, GLint s, GLint t, GLint r, GLint q);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4IVARBPROC) (GLenum target, const GLint *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4SARBPROC) (GLenum target, GLshort s, GLshort t, GLshort r, GLshort q);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4SVARBPROC) (GLenum target, const GLshort *v);
#endif

#ifndef GL_ARB_transpose_matrix
#define GL_ARB_transpose_matrix 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glLoadTransposeMatrixfARB (const GLfloat *);
GLAPI void APIENTRY glLoadTransposeMatrixdARB (const GLdouble *);
GLAPI void APIENTRY glMultTransposeMatrixfARB (const GLfloat *);
GLAPI void APIENTRY glMultTransposeMatrixdARB (const GLdouble *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLLOADTRANSPOSEMATRIXFARBPROC) (const GLfloat *m);
typedef void (APIENTRYP PFNGLLOADTRANSPOSEMATRIXDARBPROC) (const GLdouble *m);
typedef void (APIENTRYP PFNGLMULTTRANSPOSEMATRIXFARBPROC) (const GLfloat *m);
typedef void (APIENTRYP PFNGLMULTTRANSPOSEMATRIXDARBPROC) (const GLdouble *m);
#endif

#ifndef GL_ARB_multisample
#define GL_ARB_multisample 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glSampleCoverageARB (GLclampf, GLboolean);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLSAMPLECOVERAGEARBPROC) (GLclampf value, GLboolean invert);
#endif

#ifndef GL_ARB_texture_env_add
#define GL_ARB_texture_env_add 1
#endif

#ifndef GL_ARB_texture_cube_map
#define GL_ARB_texture_cube_map 1
#endif

#ifndef GL_ARB_texture_compression
#define GL_ARB_texture_compression 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glCompressedTexImage3DARB (GLenum, GLint, GLenum, GLsizei, GLsizei, GLsizei, GLint, GLsizei, const GLvoid *);
GLAPI void APIENTRY glCompressedTexImage2DARB (GLenum, GLint, GLenum, GLsizei, GLsizei, GLint, GLsizei, const GLvoid *);
GLAPI void APIENTRY glCompressedTexImage1DARB (GLenum, GLint, GLenum, GLsizei, GLint, GLsizei, const GLvoid *);
GLAPI void APIENTRY glCompressedTexSubImage3DARB (GLenum, GLint, GLint, GLint, GLint, GLsizei, GLsizei, GLsizei, GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glCompressedTexSubImage2DARB (GLenum, GLint, GLint, GLint, GLsizei, GLsizei, GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glCompressedTexSubImage1DARB (GLenum, GLint, GLint, GLsizei, GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glGetCompressedTexImageARB (GLenum, GLint, GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXIMAGE3DARBPROC) (GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height, GLsizei depth, GLint border, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXIMAGE2DARBPROC) (GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height, GLint border, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXIMAGE1DARBPROC) (GLenum target, GLint level, GLenum internalformat, GLsizei width, GLint border, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXSUBIMAGE3DARBPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLint zoffset, GLsizei width, GLsizei height, GLsizei depth, GLenum format, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXSUBIMAGE2DARBPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLsizei width, GLsizei height, GLenum format, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOMPRESSEDTEXSUBIMAGE1DARBPROC) (GLenum target, GLint level, GLint xoffset, GLsizei width, GLenum format, GLsizei imageSize, const GLvoid *data);
typedef void (APIENTRYP PFNGLGETCOMPRESSEDTEXIMAGEARBPROC) (GLenum target, GLint level, GLvoid *img);
#endif

#ifndef GL_ARB_texture_border_clamp
#define GL_ARB_texture_border_clamp 1
#endif

#ifndef GL_ARB_point_parameters
#define GL_ARB_point_parameters 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPointParameterfARB (GLenum, GLfloat);
GLAPI void APIENTRY glPointParameterfvARB (GLenum, const GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPOINTPARAMETERFARBPROC) (GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLPOINTPARAMETERFVARBPROC) (GLenum pname, const GLfloat *params);
#endif

#ifndef GL_ARB_vertex_blend
#define GL_ARB_vertex_blend 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glWeightbvARB (GLint, const GLbyte *);
GLAPI void APIENTRY glWeightsvARB (GLint, const GLshort *);
GLAPI void APIENTRY glWeightivARB (GLint, const GLint *);
GLAPI void APIENTRY glWeightfvARB (GLint, const GLfloat *);
GLAPI void APIENTRY glWeightdvARB (GLint, const GLdouble *);
GLAPI void APIENTRY glWeightubvARB (GLint, const GLubyte *);
GLAPI void APIENTRY glWeightusvARB (GLint, const GLushort *);
GLAPI void APIENTRY glWeightuivARB (GLint, const GLuint *);
GLAPI void APIENTRY glWeightPointerARB (GLint, GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glVertexBlendARB (GLint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLWEIGHTBVARBPROC) (GLint size, const GLbyte *weights);
typedef void (APIENTRYP PFNGLWEIGHTSVARBPROC) (GLint size, const GLshort *weights);
typedef void (APIENTRYP PFNGLWEIGHTIVARBPROC) (GLint size, const GLint *weights);
typedef void (APIENTRYP PFNGLWEIGHTFVARBPROC) (GLint size, const GLfloat *weights);
typedef void (APIENTRYP PFNGLWEIGHTDVARBPROC) (GLint size, const GLdouble *weights);
typedef void (APIENTRYP PFNGLWEIGHTUBVARBPROC) (GLint size, const GLubyte *weights);
typedef void (APIENTRYP PFNGLWEIGHTUSVARBPROC) (GLint size, const GLushort *weights);
typedef void (APIENTRYP PFNGLWEIGHTUIVARBPROC) (GLint size, const GLuint *weights);
typedef void (APIENTRYP PFNGLWEIGHTPOINTERARBPROC) (GLint size, GLenum type, GLsizei stride, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLVERTEXBLENDARBPROC) (GLint count);
#endif

#ifndef GL_ARB_matrix_palette
#define GL_ARB_matrix_palette 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glCurrentPaletteMatrixARB (GLint);
GLAPI void APIENTRY glMatrixIndexubvARB (GLint, const GLubyte *);
GLAPI void APIENTRY glMatrixIndexusvARB (GLint, const GLushort *);
GLAPI void APIENTRY glMatrixIndexuivARB (GLint, const GLuint *);
GLAPI void APIENTRY glMatrixIndexPointerARB (GLint, GLenum, GLsizei, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCURRENTPALETTEMATRIXARBPROC) (GLint index);
typedef void (APIENTRYP PFNGLMATRIXINDEXUBVARBPROC) (GLint size, const GLubyte *indices);
typedef void (APIENTRYP PFNGLMATRIXINDEXUSVARBPROC) (GLint size, const GLushort *indices);
typedef void (APIENTRYP PFNGLMATRIXINDEXUIVARBPROC) (GLint size, const GLuint *indices);
typedef void (APIENTRYP PFNGLMATRIXINDEXPOINTERARBPROC) (GLint size, GLenum type, GLsizei stride, const GLvoid *pointer);
#endif

#ifndef GL_ARB_texture_env_combine
#define GL_ARB_texture_env_combine 1
#endif

#ifndef GL_ARB_texture_env_crossbar
#define GL_ARB_texture_env_crossbar 1
#endif

#ifndef GL_ARB_texture_env_dot3
#define GL_ARB_texture_env_dot3 1
#endif

#ifndef GL_ARB_texture_mirrored_repeat
#define GL_ARB_texture_mirrored_repeat 1
#endif

#ifndef GL_ARB_depth_texture
#define GL_ARB_depth_texture 1
#endif

#ifndef GL_ARB_shadow
#define GL_ARB_shadow 1
#endif

#ifndef GL_ARB_shadow_ambient
#define GL_ARB_shadow_ambient 1
#endif

#ifndef GL_ARB_window_pos
#define GL_ARB_window_pos 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glWindowPos2dARB (GLdouble, GLdouble);
GLAPI void APIENTRY glWindowPos2dvARB (const GLdouble *);
GLAPI void APIENTRY glWindowPos2fARB (GLfloat, GLfloat);
GLAPI void APIENTRY glWindowPos2fvARB (const GLfloat *);
GLAPI void APIENTRY glWindowPos2iARB (GLint, GLint);
GLAPI void APIENTRY glWindowPos2ivARB (const GLint *);
GLAPI void APIENTRY glWindowPos2sARB (GLshort, GLshort);
GLAPI void APIENTRY glWindowPos2svARB (const GLshort *);
GLAPI void APIENTRY glWindowPos3dARB (GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glWindowPos3dvARB (const GLdouble *);
GLAPI void APIENTRY glWindowPos3fARB (GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glWindowPos3fvARB (const GLfloat *);
GLAPI void APIENTRY glWindowPos3iARB (GLint, GLint, GLint);
GLAPI void APIENTRY glWindowPos3ivARB (const GLint *);
GLAPI void APIENTRY glWindowPos3sARB (GLshort, GLshort, GLshort);
GLAPI void APIENTRY glWindowPos3svARB (const GLshort *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLWINDOWPOS2DARBPROC) (GLdouble x, GLdouble y);
typedef void (APIENTRYP PFNGLWINDOWPOS2DVARBPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLWINDOWPOS2FARBPROC) (GLfloat x, GLfloat y);
typedef void (APIENTRYP PFNGLWINDOWPOS2FVARBPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLWINDOWPOS2IARBPROC) (GLint x, GLint y);
typedef void (APIENTRYP PFNGLWINDOWPOS2IVARBPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLWINDOWPOS2SARBPROC) (GLshort x, GLshort y);
typedef void (APIENTRYP PFNGLWINDOWPOS2SVARBPROC) (const GLshort *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3DARBPROC) (GLdouble x, GLdouble y, GLdouble z);
typedef void (APIENTRYP PFNGLWINDOWPOS3DVARBPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3FARBPROC) (GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLWINDOWPOS3FVARBPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3IARBPROC) (GLint x, GLint y, GLint z);
typedef void (APIENTRYP PFNGLWINDOWPOS3IVARBPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3SARBPROC) (GLshort x, GLshort y, GLshort z);
typedef void (APIENTRYP PFNGLWINDOWPOS3SVARBPROC) (const GLshort *v);
#endif

#ifndef GL_ARB_vertex_program
#define GL_ARB_vertex_program 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glVertexAttrib1dARB (GLuint, GLdouble);
GLAPI void APIENTRY glVertexAttrib1dvARB (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib1fARB (GLuint, GLfloat);
GLAPI void APIENTRY glVertexAttrib1fvARB (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib1sARB (GLuint, GLshort);
GLAPI void APIENTRY glVertexAttrib1svARB (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib2dARB (GLuint, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexAttrib2dvARB (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib2fARB (GLuint, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexAttrib2fvARB (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib2sARB (GLuint, GLshort, GLshort);
GLAPI void APIENTRY glVertexAttrib2svARB (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib3dARB (GLuint, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexAttrib3dvARB (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib3fARB (GLuint, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexAttrib3fvARB (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib3sARB (GLuint, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glVertexAttrib3svARB (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib4NbvARB (GLuint, const GLbyte *);
GLAPI void APIENTRY glVertexAttrib4NivARB (GLuint, const GLint *);
GLAPI void APIENTRY glVertexAttrib4NsvARB (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib4NubARB (GLuint, GLubyte, GLubyte, GLubyte, GLubyte);
GLAPI void APIENTRY glVertexAttrib4NubvARB (GLuint, const GLubyte *);
GLAPI void APIENTRY glVertexAttrib4NuivARB (GLuint, const GLuint *);
GLAPI void APIENTRY glVertexAttrib4NusvARB (GLuint, const GLushort *);
GLAPI void APIENTRY glVertexAttrib4bvARB (GLuint, const GLbyte *);
GLAPI void APIENTRY glVertexAttrib4dARB (GLuint, GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexAttrib4dvARB (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib4fARB (GLuint, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexAttrib4fvARB (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib4ivARB (GLuint, const GLint *);
GLAPI void APIENTRY glVertexAttrib4sARB (GLuint, GLshort, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glVertexAttrib4svARB (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib4ubvARB (GLuint, const GLubyte *);
GLAPI void APIENTRY glVertexAttrib4uivARB (GLuint, const GLuint *);
GLAPI void APIENTRY glVertexAttrib4usvARB (GLuint, const GLushort *);
GLAPI void APIENTRY glVertexAttribPointerARB (GLuint, GLint, GLenum, GLboolean, GLsizei, const GLvoid *);
GLAPI void APIENTRY glEnableVertexAttribArrayARB (GLuint);
GLAPI void APIENTRY glDisableVertexAttribArrayARB (GLuint);
GLAPI void APIENTRY glProgramStringARB (GLenum, GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glBindProgramARB (GLenum, GLuint);
GLAPI void APIENTRY glDeleteProgramsARB (GLsizei, const GLuint *);
GLAPI void APIENTRY glGenProgramsARB (GLsizei, GLuint *);
GLAPI void APIENTRY glProgramEnvParameter4dARB (GLenum, GLuint, GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glProgramEnvParameter4dvARB (GLenum, GLuint, const GLdouble *);
GLAPI void APIENTRY glProgramEnvParameter4fARB (GLenum, GLuint, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glProgramEnvParameter4fvARB (GLenum, GLuint, const GLfloat *);
GLAPI void APIENTRY glProgramLocalParameter4dARB (GLenum, GLuint, GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glProgramLocalParameter4dvARB (GLenum, GLuint, const GLdouble *);
GLAPI void APIENTRY glProgramLocalParameter4fARB (GLenum, GLuint, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glProgramLocalParameter4fvARB (GLenum, GLuint, const GLfloat *);
GLAPI void APIENTRY glGetProgramEnvParameterdvARB (GLenum, GLuint, GLdouble *);
GLAPI void APIENTRY glGetProgramEnvParameterfvARB (GLenum, GLuint, GLfloat *);
GLAPI void APIENTRY glGetProgramLocalParameterdvARB (GLenum, GLuint, GLdouble *);
GLAPI void APIENTRY glGetProgramLocalParameterfvARB (GLenum, GLuint, GLfloat *);
GLAPI void APIENTRY glGetProgramivARB (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetProgramStringARB (GLenum, GLenum, GLvoid *);
GLAPI void APIENTRY glGetVertexAttribdvARB (GLuint, GLenum, GLdouble *);
GLAPI void APIENTRY glGetVertexAttribfvARB (GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glGetVertexAttribivARB (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetVertexAttribPointervARB (GLuint, GLenum, GLvoid* *);
GLAPI GLboolean APIENTRY glIsProgramARB (GLuint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLVERTEXATTRIB1DARBPROC) (GLuint index, GLdouble x);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1DVARBPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1FARBPROC) (GLuint index, GLfloat x);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1FVARBPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1SARBPROC) (GLuint index, GLshort x);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1SVARBPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2DARBPROC) (GLuint index, GLdouble x, GLdouble y);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2DVARBPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2FARBPROC) (GLuint index, GLfloat x, GLfloat y);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2FVARBPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2SARBPROC) (GLuint index, GLshort x, GLshort y);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2SVARBPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3DARBPROC) (GLuint index, GLdouble x, GLdouble y, GLdouble z);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3DVARBPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3FARBPROC) (GLuint index, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3FVARBPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3SARBPROC) (GLuint index, GLshort x, GLshort y, GLshort z);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3SVARBPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NBVARBPROC) (GLuint index, const GLbyte *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NIVARBPROC) (GLuint index, const GLint *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NSVARBPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NUBARBPROC) (GLuint index, GLubyte x, GLubyte y, GLubyte z, GLubyte w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NUBVARBPROC) (GLuint index, const GLubyte *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NUIVARBPROC) (GLuint index, const GLuint *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4NUSVARBPROC) (GLuint index, const GLushort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4BVARBPROC) (GLuint index, const GLbyte *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4DARBPROC) (GLuint index, GLdouble x, GLdouble y, GLdouble z, GLdouble w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4DVARBPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4FARBPROC) (GLuint index, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4FVARBPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4IVARBPROC) (GLuint index, const GLint *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4SARBPROC) (GLuint index, GLshort x, GLshort y, GLshort z, GLshort w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4SVARBPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4UBVARBPROC) (GLuint index, const GLubyte *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4UIVARBPROC) (GLuint index, const GLuint *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4USVARBPROC) (GLuint index, const GLushort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBPOINTERARBPROC) (GLuint index, GLint size, GLenum type, GLboolean normalized, GLsizei stride, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLENABLEVERTEXATTRIBARRAYARBPROC) (GLuint index);
typedef void (APIENTRYP PFNGLDISABLEVERTEXATTRIBARRAYARBPROC) (GLuint index);
typedef void (APIENTRYP PFNGLPROGRAMSTRINGARBPROC) (GLenum target, GLenum format, GLsizei len, const GLvoid *string);
typedef void (APIENTRYP PFNGLBINDPROGRAMARBPROC) (GLenum target, GLuint program);
typedef void (APIENTRYP PFNGLDELETEPROGRAMSARBPROC) (GLsizei n, const GLuint *programs);
typedef void (APIENTRYP PFNGLGENPROGRAMSARBPROC) (GLsizei n, GLuint *programs);
typedef void (APIENTRYP PFNGLPROGRAMENVPARAMETER4DARBPROC) (GLenum target, GLuint index, GLdouble x, GLdouble y, GLdouble z, GLdouble w);
typedef void (APIENTRYP PFNGLPROGRAMENVPARAMETER4DVARBPROC) (GLenum target, GLuint index, const GLdouble *params);
typedef void (APIENTRYP PFNGLPROGRAMENVPARAMETER4FARBPROC) (GLenum target, GLuint index, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLPROGRAMENVPARAMETER4FVARBPROC) (GLenum target, GLuint index, const GLfloat *params);
typedef void (APIENTRYP PFNGLPROGRAMLOCALPARAMETER4DARBPROC) (GLenum target, GLuint index, GLdouble x, GLdouble y, GLdouble z, GLdouble w);
typedef void (APIENTRYP PFNGLPROGRAMLOCALPARAMETER4DVARBPROC) (GLenum target, GLuint index, const GLdouble *params);
typedef void (APIENTRYP PFNGLPROGRAMLOCALPARAMETER4FARBPROC) (GLenum target, GLuint index, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLPROGRAMLOCALPARAMETER4FVARBPROC) (GLenum target, GLuint index, const GLfloat *params);
typedef void (APIENTRYP PFNGLGETPROGRAMENVPARAMETERDVARBPROC) (GLenum target, GLuint index, GLdouble *params);
typedef void (APIENTRYP PFNGLGETPROGRAMENVPARAMETERFVARBPROC) (GLenum target, GLuint index, GLfloat *params);
typedef void (APIENTRYP PFNGLGETPROGRAMLOCALPARAMETERDVARBPROC) (GLenum target, GLuint index, GLdouble *params);
typedef void (APIENTRYP PFNGLGETPROGRAMLOCALPARAMETERFVARBPROC) (GLenum target, GLuint index, GLfloat *params);
typedef void (APIENTRYP PFNGLGETPROGRAMIVARBPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETPROGRAMSTRINGARBPROC) (GLenum target, GLenum pname, GLvoid *string);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBDVARBPROC) (GLuint index, GLenum pname, GLdouble *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBFVARBPROC) (GLuint index, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBIVARBPROC) (GLuint index, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBPOINTERVARBPROC) (GLuint index, GLenum pname, GLvoid* *pointer);
typedef GLboolean (APIENTRYP PFNGLISPROGRAMARBPROC) (GLuint program);
#endif

#ifndef GL_ARB_fragment_program
#define GL_ARB_fragment_program 1
/* All ARB_fragment_program entry points are shared with ARB_vertex_program. */
#endif

#ifndef GL_ARB_vertex_buffer_object
#define GL_ARB_vertex_buffer_object 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBindBufferARB (GLenum, GLuint);
GLAPI void APIENTRY glDeleteBuffersARB (GLsizei, const GLuint *);
GLAPI void APIENTRY glGenBuffersARB (GLsizei, GLuint *);
GLAPI GLboolean APIENTRY glIsBufferARB (GLuint);
GLAPI void APIENTRY glBufferDataARB (GLenum, GLsizeiptrARB, const GLvoid *, GLenum);
GLAPI void APIENTRY glBufferSubDataARB (GLenum, GLintptrARB, GLsizeiptrARB, const GLvoid *);
GLAPI void APIENTRY glGetBufferSubDataARB (GLenum, GLintptrARB, GLsizeiptrARB, GLvoid *);
GLAPI GLvoid* APIENTRY glMapBufferARB (GLenum, GLenum);
GLAPI GLboolean APIENTRY glUnmapBufferARB (GLenum);
GLAPI void APIENTRY glGetBufferParameterivARB (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetBufferPointervARB (GLenum, GLenum, GLvoid* *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBINDBUFFERARBPROC) (GLenum target, GLuint buffer);
typedef void (APIENTRYP PFNGLDELETEBUFFERSARBPROC) (GLsizei n, const GLuint *buffers);
typedef void (APIENTRYP PFNGLGENBUFFERSARBPROC) (GLsizei n, GLuint *buffers);
typedef GLboolean (APIENTRYP PFNGLISBUFFERARBPROC) (GLuint buffer);
typedef void (APIENTRYP PFNGLBUFFERDATAARBPROC) (GLenum target, GLsizeiptrARB size, const GLvoid *data, GLenum usage);
typedef void (APIENTRYP PFNGLBUFFERSUBDATAARBPROC) (GLenum target, GLintptrARB offset, GLsizeiptrARB size, const GLvoid *data);
typedef void (APIENTRYP PFNGLGETBUFFERSUBDATAARBPROC) (GLenum target, GLintptrARB offset, GLsizeiptrARB size, GLvoid *data);
typedef GLvoid* (APIENTRYP PFNGLMAPBUFFERARBPROC) (GLenum target, GLenum access);
typedef GLboolean (APIENTRYP PFNGLUNMAPBUFFERARBPROC) (GLenum target);
typedef void (APIENTRYP PFNGLGETBUFFERPARAMETERIVARBPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETBUFFERPOINTERVARBPROC) (GLenum target, GLenum pname, GLvoid* *params);
#endif

#ifndef GL_ARB_occlusion_query
#define GL_ARB_occlusion_query 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glGenQueriesARB (GLsizei, GLuint *);
GLAPI void APIENTRY glDeleteQueriesARB (GLsizei, const GLuint *);
GLAPI GLboolean APIENTRY glIsQueryARB (GLuint);
GLAPI void APIENTRY glBeginQueryARB (GLenum, GLuint);
GLAPI void APIENTRY glEndQueryARB (GLenum);
GLAPI void APIENTRY glGetQueryivARB (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetQueryObjectivARB (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetQueryObjectuivARB (GLuint, GLenum, GLuint *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLGENQUERIESARBPROC) (GLsizei n, GLuint *ids);
typedef void (APIENTRYP PFNGLDELETEQUERIESARBPROC) (GLsizei n, const GLuint *ids);
typedef GLboolean (APIENTRYP PFNGLISQUERYARBPROC) (GLuint id);
typedef void (APIENTRYP PFNGLBEGINQUERYARBPROC) (GLenum target, GLuint id);
typedef void (APIENTRYP PFNGLENDQUERYARBPROC) (GLenum target);
typedef void (APIENTRYP PFNGLGETQUERYIVARBPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETQUERYOBJECTIVARBPROC) (GLuint id, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETQUERYOBJECTUIVARBPROC) (GLuint id, GLenum pname, GLuint *params);
#endif

#ifndef GL_ARB_shader_objects
#define GL_ARB_shader_objects 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glDeleteObjectARB (GLhandleARB);
GLAPI GLhandleARB APIENTRY glGetHandleARB (GLenum);
GLAPI void APIENTRY glDetachObjectARB (GLhandleARB, GLhandleARB);
GLAPI GLhandleARB APIENTRY glCreateShaderObjectARB (GLenum);
GLAPI void APIENTRY glShaderSourceARB (GLhandleARB, GLsizei, const GLcharARB* *, const GLint *);
GLAPI void APIENTRY glCompileShaderARB (GLhandleARB);
GLAPI GLhandleARB APIENTRY glCreateProgramObjectARB (void);
GLAPI void APIENTRY glAttachObjectARB (GLhandleARB, GLhandleARB);
GLAPI void APIENTRY glLinkProgramARB (GLhandleARB);
GLAPI void APIENTRY glUseProgramObjectARB (GLhandleARB);
GLAPI void APIENTRY glValidateProgramARB (GLhandleARB);
GLAPI void APIENTRY glUniform1fARB (GLint, GLfloat);
GLAPI void APIENTRY glUniform2fARB (GLint, GLfloat, GLfloat);
GLAPI void APIENTRY glUniform3fARB (GLint, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glUniform4fARB (GLint, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glUniform1iARB (GLint, GLint);
GLAPI void APIENTRY glUniform2iARB (GLint, GLint, GLint);
GLAPI void APIENTRY glUniform3iARB (GLint, GLint, GLint, GLint);
GLAPI void APIENTRY glUniform4iARB (GLint, GLint, GLint, GLint, GLint);
GLAPI void APIENTRY glUniform1fvARB (GLint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glUniform2fvARB (GLint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glUniform3fvARB (GLint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glUniform4fvARB (GLint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glUniform1ivARB (GLint, GLsizei, const GLint *);
GLAPI void APIENTRY glUniform2ivARB (GLint, GLsizei, const GLint *);
GLAPI void APIENTRY glUniform3ivARB (GLint, GLsizei, const GLint *);
GLAPI void APIENTRY glUniform4ivARB (GLint, GLsizei, const GLint *);
GLAPI void APIENTRY glUniformMatrix2fvARB (GLint, GLsizei, GLboolean, const GLfloat *);
GLAPI void APIENTRY glUniformMatrix3fvARB (GLint, GLsizei, GLboolean, const GLfloat *);
GLAPI void APIENTRY glUniformMatrix4fvARB (GLint, GLsizei, GLboolean, const GLfloat *);
GLAPI void APIENTRY glGetObjectParameterfvARB (GLhandleARB, GLenum, GLfloat *);
GLAPI void APIENTRY glGetObjectParameterivARB (GLhandleARB, GLenum, GLint *);
GLAPI void APIENTRY glGetInfoLogARB (GLhandleARB, GLsizei, GLsizei *, GLcharARB *);
GLAPI void APIENTRY glGetAttachedObjectsARB (GLhandleARB, GLsizei, GLsizei *, GLhandleARB *);
GLAPI GLint APIENTRY glGetUniformLocationARB (GLhandleARB, const GLcharARB *);
GLAPI void APIENTRY glGetActiveUniformARB (GLhandleARB, GLuint, GLsizei, GLsizei *, GLint *, GLenum *, GLcharARB *);
GLAPI void APIENTRY glGetUniformfvARB (GLhandleARB, GLint, GLfloat *);
GLAPI void APIENTRY glGetUniformivARB (GLhandleARB, GLint, GLint *);
GLAPI void APIENTRY glGetShaderSourceARB (GLhandleARB, GLsizei, GLsizei *, GLcharARB *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLDELETEOBJECTARBPROC) (GLhandleARB obj);
typedef GLhandleARB (APIENTRYP PFNGLGETHANDLEARBPROC) (GLenum pname);
typedef void (APIENTRYP PFNGLDETACHOBJECTARBPROC) (GLhandleARB containerObj, GLhandleARB attachedObj);
typedef GLhandleARB (APIENTRYP PFNGLCREATESHADEROBJECTARBPROC) (GLenum shaderType);
typedef void (APIENTRYP PFNGLSHADERSOURCEARBPROC) (GLhandleARB shaderObj, GLsizei count, const GLcharARB* *string, const GLint *length);
typedef void (APIENTRYP PFNGLCOMPILESHADERARBPROC) (GLhandleARB shaderObj);
typedef GLhandleARB (APIENTRYP PFNGLCREATEPROGRAMOBJECTARBPROC) (void);
typedef void (APIENTRYP PFNGLATTACHOBJECTARBPROC) (GLhandleARB containerObj, GLhandleARB obj);
typedef void (APIENTRYP PFNGLLINKPROGRAMARBPROC) (GLhandleARB programObj);
typedef void (APIENTRYP PFNGLUSEPROGRAMOBJECTARBPROC) (GLhandleARB programObj);
typedef void (APIENTRYP PFNGLVALIDATEPROGRAMARBPROC) (GLhandleARB programObj);
typedef void (APIENTRYP PFNGLUNIFORM1FARBPROC) (GLint location, GLfloat v0);
typedef void (APIENTRYP PFNGLUNIFORM2FARBPROC) (GLint location, GLfloat v0, GLfloat v1);
typedef void (APIENTRYP PFNGLUNIFORM3FARBPROC) (GLint location, GLfloat v0, GLfloat v1, GLfloat v2);
typedef void (APIENTRYP PFNGLUNIFORM4FARBPROC) (GLint location, GLfloat v0, GLfloat v1, GLfloat v2, GLfloat v3);
typedef void (APIENTRYP PFNGLUNIFORM1IARBPROC) (GLint location, GLint v0);
typedef void (APIENTRYP PFNGLUNIFORM2IARBPROC) (GLint location, GLint v0, GLint v1);
typedef void (APIENTRYP PFNGLUNIFORM3IARBPROC) (GLint location, GLint v0, GLint v1, GLint v2);
typedef void (APIENTRYP PFNGLUNIFORM4IARBPROC) (GLint location, GLint v0, GLint v1, GLint v2, GLint v3);
typedef void (APIENTRYP PFNGLUNIFORM1FVARBPROC) (GLint location, GLsizei count, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORM2FVARBPROC) (GLint location, GLsizei count, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORM3FVARBPROC) (GLint location, GLsizei count, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORM4FVARBPROC) (GLint location, GLsizei count, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORM1IVARBPROC) (GLint location, GLsizei count, const GLint *value);
typedef void (APIENTRYP PFNGLUNIFORM2IVARBPROC) (GLint location, GLsizei count, const GLint *value);
typedef void (APIENTRYP PFNGLUNIFORM3IVARBPROC) (GLint location, GLsizei count, const GLint *value);
typedef void (APIENTRYP PFNGLUNIFORM4IVARBPROC) (GLint location, GLsizei count, const GLint *value);
typedef void (APIENTRYP PFNGLUNIFORMMATRIX2FVARBPROC) (GLint location, GLsizei count, GLboolean transpose, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORMMATRIX3FVARBPROC) (GLint location, GLsizei count, GLboolean transpose, const GLfloat *value);
typedef void (APIENTRYP PFNGLUNIFORMMATRIX4FVARBPROC) (GLint location, GLsizei count, GLboolean transpose, const GLfloat *value);
typedef void (APIENTRYP PFNGLGETOBJECTPARAMETERFVARBPROC) (GLhandleARB obj, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETOBJECTPARAMETERIVARBPROC) (GLhandleARB obj, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETINFOLOGARBPROC) (GLhandleARB obj, GLsizei maxLength, GLsizei *length, GLcharARB *infoLog);
typedef void (APIENTRYP PFNGLGETATTACHEDOBJECTSARBPROC) (GLhandleARB containerObj, GLsizei maxCount, GLsizei *count, GLhandleARB *obj);
typedef GLint (APIENTRYP PFNGLGETUNIFORMLOCATIONARBPROC) (GLhandleARB programObj, const GLcharARB *name);
typedef void (APIENTRYP PFNGLGETACTIVEUNIFORMARBPROC) (GLhandleARB programObj, GLuint index, GLsizei maxLength, GLsizei *length, GLint *size, GLenum *type, GLcharARB *name);
typedef void (APIENTRYP PFNGLGETUNIFORMFVARBPROC) (GLhandleARB programObj, GLint location, GLfloat *params);
typedef void (APIENTRYP PFNGLGETUNIFORMIVARBPROC) (GLhandleARB programObj, GLint location, GLint *params);
typedef void (APIENTRYP PFNGLGETSHADERSOURCEARBPROC) (GLhandleARB obj, GLsizei maxLength, GLsizei *length, GLcharARB *source);
#endif

#ifndef GL_ARB_vertex_shader
#define GL_ARB_vertex_shader 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBindAttribLocationARB (GLhandleARB, GLuint, const GLcharARB *);
GLAPI void APIENTRY glGetActiveAttribARB (GLhandleARB, GLuint, GLsizei, GLsizei *, GLint *, GLenum *, GLcharARB *);
GLAPI GLint APIENTRY glGetAttribLocationARB (GLhandleARB, const GLcharARB *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBINDATTRIBLOCATIONARBPROC) (GLhandleARB programObj, GLuint index, const GLcharARB *name);
typedef void (APIENTRYP PFNGLGETACTIVEATTRIBARBPROC) (GLhandleARB programObj, GLuint index, GLsizei maxLength, GLsizei *length, GLint *size, GLenum *type, GLcharARB *name);
typedef GLint (APIENTRYP PFNGLGETATTRIBLOCATIONARBPROC) (GLhandleARB programObj, const GLcharARB *name);
#endif

#ifndef GL_ARB_fragment_shader
#define GL_ARB_fragment_shader 1
#endif

#ifndef GL_ARB_shading_language_100
#define GL_ARB_shading_language_100 1
#endif

#ifndef GL_ARB_texture_non_power_of_two
#define GL_ARB_texture_non_power_of_two 1
#endif

#ifndef GL_ARB_point_sprite
#define GL_ARB_point_sprite 1
#endif

#ifndef GL_ARB_fragment_program_shadow
#define GL_ARB_fragment_program_shadow 1
#endif

#ifndef GL_ARB_draw_buffers
#define GL_ARB_draw_buffers 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glDrawBuffersARB (GLsizei, const GLenum *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLDRAWBUFFERSARBPROC) (GLsizei n, const GLenum *bufs);
#endif

#ifndef GL_ARB_texture_rectangle
#define GL_ARB_texture_rectangle 1
#endif

#ifndef GL_ARB_color_buffer_float
#define GL_ARB_color_buffer_float 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glClampColorARB (GLenum, GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCLAMPCOLORARBPROC) (GLenum target, GLenum clamp);
#endif

#ifndef GL_ARB_half_float_pixel
#define GL_ARB_half_float_pixel 1
#endif

#ifndef GL_ARB_texture_float
#define GL_ARB_texture_float 1
#endif

#ifndef GL_ARB_pixel_buffer_object
#define GL_ARB_pixel_buffer_object 1
#endif

#ifndef GL_EXT_abgr
#define GL_EXT_abgr 1
#endif

#ifndef GL_EXT_blend_color
#define GL_EXT_blend_color 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBlendColorEXT (GLclampf, GLclampf, GLclampf, GLclampf);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBLENDCOLOREXTPROC) (GLclampf red, GLclampf green, GLclampf blue, GLclampf alpha);
#endif

#ifndef GL_EXT_polygon_offset
#define GL_EXT_polygon_offset 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPolygonOffsetEXT (GLfloat, GLfloat);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPOLYGONOFFSETEXTPROC) (GLfloat factor, GLfloat bias);
#endif

#ifndef GL_EXT_texture
#define GL_EXT_texture 1
#endif

#ifndef GL_EXT_texture3D
#define GL_EXT_texture3D 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glTexImage3DEXT (GLenum, GLint, GLenum, GLsizei, GLsizei, GLsizei, GLint, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glTexSubImage3DEXT (GLenum, GLint, GLint, GLint, GLint, GLsizei, GLsizei, GLsizei, GLenum, GLenum, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLTEXIMAGE3DEXTPROC) (GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height, GLsizei depth, GLint border, GLenum format, GLenum type, const GLvoid *pixels);
typedef void (APIENTRYP PFNGLTEXSUBIMAGE3DEXTPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLint zoffset, GLsizei width, GLsizei height, GLsizei depth, GLenum format, GLenum type, const GLvoid *pixels);
#endif

#ifndef GL_SGIS_texture_filter4
#define GL_SGIS_texture_filter4 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glGetTexFilterFuncSGIS (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glTexFilterFuncSGIS (GLenum, GLenum, GLsizei, const GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLGETTEXFILTERFUNCSGISPROC) (GLenum target, GLenum filter, GLfloat *weights);
typedef void (APIENTRYP PFNGLTEXFILTERFUNCSGISPROC) (GLenum target, GLenum filter, GLsizei n, const GLfloat *weights);
#endif

#ifndef GL_EXT_subtexture
#define GL_EXT_subtexture 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glTexSubImage1DEXT (GLenum, GLint, GLint, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glTexSubImage2DEXT (GLenum, GLint, GLint, GLint, GLsizei, GLsizei, GLenum, GLenum, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLTEXSUBIMAGE1DEXTPROC) (GLenum target, GLint level, GLint xoffset, GLsizei width, GLenum format, GLenum type, const GLvoid *pixels);
typedef void (APIENTRYP PFNGLTEXSUBIMAGE2DEXTPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLsizei width, GLsizei height, GLenum format, GLenum type, const GLvoid *pixels);
#endif

#ifndef GL_EXT_copy_texture
#define GL_EXT_copy_texture 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glCopyTexImage1DEXT (GLenum, GLint, GLenum, GLint, GLint, GLsizei, GLint);
GLAPI void APIENTRY glCopyTexImage2DEXT (GLenum, GLint, GLenum, GLint, GLint, GLsizei, GLsizei, GLint);
GLAPI void APIENTRY glCopyTexSubImage1DEXT (GLenum, GLint, GLint, GLint, GLint, GLsizei);
GLAPI void APIENTRY glCopyTexSubImage2DEXT (GLenum, GLint, GLint, GLint, GLint, GLint, GLsizei, GLsizei);
GLAPI void APIENTRY glCopyTexSubImage3DEXT (GLenum, GLint, GLint, GLint, GLint, GLint, GLint, GLsizei, GLsizei);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCOPYTEXIMAGE1DEXTPROC) (GLenum target, GLint level, GLenum internalformat, GLint x, GLint y, GLsizei width, GLint border);
typedef void (APIENTRYP PFNGLCOPYTEXIMAGE2DEXTPROC) (GLenum target, GLint level, GLenum internalformat, GLint x, GLint y, GLsizei width, GLsizei height, GLint border);
typedef void (APIENTRYP PFNGLCOPYTEXSUBIMAGE1DEXTPROC) (GLenum target, GLint level, GLint xoffset, GLint x, GLint y, GLsizei width);
typedef void (APIENTRYP PFNGLCOPYTEXSUBIMAGE2DEXTPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLint x, GLint y, GLsizei width, GLsizei height);
typedef void (APIENTRYP PFNGLCOPYTEXSUBIMAGE3DEXTPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLint zoffset, GLint x, GLint y, GLsizei width, GLsizei height);
#endif

#ifndef GL_EXT_histogram
#define GL_EXT_histogram 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glGetHistogramEXT (GLenum, GLboolean, GLenum, GLenum, GLvoid *);
GLAPI void APIENTRY glGetHistogramParameterfvEXT (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetHistogramParameterivEXT (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetMinmaxEXT (GLenum, GLboolean, GLenum, GLenum, GLvoid *);
GLAPI void APIENTRY glGetMinmaxParameterfvEXT (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetMinmaxParameterivEXT (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glHistogramEXT (GLenum, GLsizei, GLenum, GLboolean);
GLAPI void APIENTRY glMinmaxEXT (GLenum, GLenum, GLboolean);
GLAPI void APIENTRY glResetHistogramEXT (GLenum);
GLAPI void APIENTRY glResetMinmaxEXT (GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLGETHISTOGRAMEXTPROC) (GLenum target, GLboolean reset, GLenum format, GLenum type, GLvoid *values);
typedef void (APIENTRYP PFNGLGETHISTOGRAMPARAMETERFVEXTPROC) (GLenum target, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETHISTOGRAMPARAMETERIVEXTPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETMINMAXEXTPROC) (GLenum target, GLboolean reset, GLenum format, GLenum type, GLvoid *values);
typedef void (APIENTRYP PFNGLGETMINMAXPARAMETERFVEXTPROC) (GLenum target, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETMINMAXPARAMETERIVEXTPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLHISTOGRAMEXTPROC) (GLenum target, GLsizei width, GLenum internalformat, GLboolean sink);
typedef void (APIENTRYP PFNGLMINMAXEXTPROC) (GLenum target, GLenum internalformat, GLboolean sink);
typedef void (APIENTRYP PFNGLRESETHISTOGRAMEXTPROC) (GLenum target);
typedef void (APIENTRYP PFNGLRESETMINMAXEXTPROC) (GLenum target);
#endif

#ifndef GL_EXT_convolution
#define GL_EXT_convolution 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glConvolutionFilter1DEXT (GLenum, GLenum, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glConvolutionFilter2DEXT (GLenum, GLenum, GLsizei, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glConvolutionParameterfEXT (GLenum, GLenum, GLfloat);
GLAPI void APIENTRY glConvolutionParameterfvEXT (GLenum, GLenum, const GLfloat *);
GLAPI void APIENTRY glConvolutionParameteriEXT (GLenum, GLenum, GLint);
GLAPI void APIENTRY glConvolutionParameterivEXT (GLenum, GLenum, const GLint *);
GLAPI void APIENTRY glCopyConvolutionFilter1DEXT (GLenum, GLenum, GLint, GLint, GLsizei);
GLAPI void APIENTRY glCopyConvolutionFilter2DEXT (GLenum, GLenum, GLint, GLint, GLsizei, GLsizei);
GLAPI void APIENTRY glGetConvolutionFilterEXT (GLenum, GLenum, GLenum, GLvoid *);
GLAPI void APIENTRY glGetConvolutionParameterfvEXT (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetConvolutionParameterivEXT (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetSeparableFilterEXT (GLenum, GLenum, GLenum, GLvoid *, GLvoid *, GLvoid *);
GLAPI void APIENTRY glSeparableFilter2DEXT (GLenum, GLenum, GLsizei, GLsizei, GLenum, GLenum, const GLvoid *, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCONVOLUTIONFILTER1DEXTPROC) (GLenum target, GLenum internalformat, GLsizei width, GLenum format, GLenum type, const GLvoid *image);
typedef void (APIENTRYP PFNGLCONVOLUTIONFILTER2DEXTPROC) (GLenum target, GLenum internalformat, GLsizei width, GLsizei height, GLenum format, GLenum type, const GLvoid *image);
typedef void (APIENTRYP PFNGLCONVOLUTIONPARAMETERFEXTPROC) (GLenum target, GLenum pname, GLfloat params);
typedef void (APIENTRYP PFNGLCONVOLUTIONPARAMETERFVEXTPROC) (GLenum target, GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLCONVOLUTIONPARAMETERIEXTPROC) (GLenum target, GLenum pname, GLint params);
typedef void (APIENTRYP PFNGLCONVOLUTIONPARAMETERIVEXTPROC) (GLenum target, GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLCOPYCONVOLUTIONFILTER1DEXTPROC) (GLenum target, GLenum internalformat, GLint x, GLint y, GLsizei width);
typedef void (APIENTRYP PFNGLCOPYCONVOLUTIONFILTER2DEXTPROC) (GLenum target, GLenum internalformat, GLint x, GLint y, GLsizei width, GLsizei height);
typedef void (APIENTRYP PFNGLGETCONVOLUTIONFILTEREXTPROC) (GLenum target, GLenum format, GLenum type, GLvoid *image);
typedef void (APIENTRYP PFNGLGETCONVOLUTIONPARAMETERFVEXTPROC) (GLenum target, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETCONVOLUTIONPARAMETERIVEXTPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETSEPARABLEFILTEREXTPROC) (GLenum target, GLenum format, GLenum type, GLvoid *row, GLvoid *column, GLvoid *span);
typedef void (APIENTRYP PFNGLSEPARABLEFILTER2DEXTPROC) (GLenum target, GLenum internalformat, GLsizei width, GLsizei height, GLenum format, GLenum type, const GLvoid *row, const GLvoid *column);
#endif

#ifndef GL_EXT_color_matrix
#define GL_EXT_color_matrix 1
#endif

#ifndef GL_SGI_color_table
#define GL_SGI_color_table 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glColorTableSGI (GLenum, GLenum, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glColorTableParameterfvSGI (GLenum, GLenum, const GLfloat *);
GLAPI void APIENTRY glColorTableParameterivSGI (GLenum, GLenum, const GLint *);
GLAPI void APIENTRY glCopyColorTableSGI (GLenum, GLenum, GLint, GLint, GLsizei);
GLAPI void APIENTRY glGetColorTableSGI (GLenum, GLenum, GLenum, GLvoid *);
GLAPI void APIENTRY glGetColorTableParameterfvSGI (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetColorTableParameterivSGI (GLenum, GLenum, GLint *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCOLORTABLESGIPROC) (GLenum target, GLenum internalformat, GLsizei width, GLenum format, GLenum type, const GLvoid *table);
typedef void (APIENTRYP PFNGLCOLORTABLEPARAMETERFVSGIPROC) (GLenum target, GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLCOLORTABLEPARAMETERIVSGIPROC) (GLenum target, GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLCOPYCOLORTABLESGIPROC) (GLenum target, GLenum internalformat, GLint x, GLint y, GLsizei width);
typedef void (APIENTRYP PFNGLGETCOLORTABLESGIPROC) (GLenum target, GLenum format, GLenum type, GLvoid *table);
typedef void (APIENTRYP PFNGLGETCOLORTABLEPARAMETERFVSGIPROC) (GLenum target, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETCOLORTABLEPARAMETERIVSGIPROC) (GLenum target, GLenum pname, GLint *params);
#endif

#ifndef GL_SGIX_pixel_texture
#define GL_SGIX_pixel_texture 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPixelTexGenSGIX (GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPIXELTEXGENSGIXPROC) (GLenum mode);
#endif

#ifndef GL_SGIS_pixel_texture
#define GL_SGIS_pixel_texture 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPixelTexGenParameteriSGIS (GLenum, GLint);
GLAPI void APIENTRY glPixelTexGenParameterivSGIS (GLenum, const GLint *);
GLAPI void APIENTRY glPixelTexGenParameterfSGIS (GLenum, GLfloat);
GLAPI void APIENTRY glPixelTexGenParameterfvSGIS (GLenum, const GLfloat *);
GLAPI void APIENTRY glGetPixelTexGenParameterivSGIS (GLenum, GLint *);
GLAPI void APIENTRY glGetPixelTexGenParameterfvSGIS (GLenum, GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPIXELTEXGENPARAMETERISGISPROC) (GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLPIXELTEXGENPARAMETERIVSGISPROC) (GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLPIXELTEXGENPARAMETERFSGISPROC) (GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLPIXELTEXGENPARAMETERFVSGISPROC) (GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLGETPIXELTEXGENPARAMETERIVSGISPROC) (GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETPIXELTEXGENPARAMETERFVSGISPROC) (GLenum pname, GLfloat *params);
#endif

#ifndef GL_SGIS_texture4D
#define GL_SGIS_texture4D 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glTexImage4DSGIS (GLenum, GLint, GLenum, GLsizei, GLsizei, GLsizei, GLsizei, GLint, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glTexSubImage4DSGIS (GLenum, GLint, GLint, GLint, GLint, GLint, GLsizei, GLsizei, GLsizei, GLsizei, GLenum, GLenum, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLTEXIMAGE4DSGISPROC) (GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height, GLsizei depth, GLsizei size4d, GLint border, GLenum format, GLenum type, const GLvoid *pixels);
typedef void (APIENTRYP PFNGLTEXSUBIMAGE4DSGISPROC) (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLint zoffset, GLint woffset, GLsizei width, GLsizei height, GLsizei depth, GLsizei size4d, GLenum format, GLenum type, const GLvoid *pixels);
#endif

#ifndef GL_SGI_texture_color_table
#define GL_SGI_texture_color_table 1
#endif

#ifndef GL_EXT_cmyka
#define GL_EXT_cmyka 1
#endif

#ifndef GL_EXT_texture_object
#define GL_EXT_texture_object 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI GLboolean APIENTRY glAreTexturesResidentEXT (GLsizei, const GLuint *, GLboolean *);
GLAPI void APIENTRY glBindTextureEXT (GLenum, GLuint);
GLAPI void APIENTRY glDeleteTexturesEXT (GLsizei, const GLuint *);
GLAPI void APIENTRY glGenTexturesEXT (GLsizei, GLuint *);
GLAPI GLboolean APIENTRY glIsTextureEXT (GLuint);
GLAPI void APIENTRY glPrioritizeTexturesEXT (GLsizei, const GLuint *, const GLclampf *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef GLboolean (APIENTRYP PFNGLARETEXTURESRESIDENTEXTPROC) (GLsizei n, const GLuint *textures, GLboolean *residences);
typedef void (APIENTRYP PFNGLBINDTEXTUREEXTPROC) (GLenum target, GLuint texture);
typedef void (APIENTRYP PFNGLDELETETEXTURESEXTPROC) (GLsizei n, const GLuint *textures);
typedef void (APIENTRYP PFNGLGENTEXTURESEXTPROC) (GLsizei n, GLuint *textures);
typedef GLboolean (APIENTRYP PFNGLISTEXTUREEXTPROC) (GLuint texture);
typedef void (APIENTRYP PFNGLPRIORITIZETEXTURESEXTPROC) (GLsizei n, const GLuint *textures, const GLclampf *priorities);
#endif

#ifndef GL_SGIS_detail_texture
#define GL_SGIS_detail_texture 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glDetailTexFuncSGIS (GLenum, GLsizei, const GLfloat *);
GLAPI void APIENTRY glGetDetailTexFuncSGIS (GLenum, GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLDETAILTEXFUNCSGISPROC) (GLenum target, GLsizei n, const GLfloat *points);
typedef void (APIENTRYP PFNGLGETDETAILTEXFUNCSGISPROC) (GLenum target, GLfloat *points);
#endif

#ifndef GL_SGIS_sharpen_texture
#define GL_SGIS_sharpen_texture 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glSharpenTexFuncSGIS (GLenum, GLsizei, const GLfloat *);
GLAPI void APIENTRY glGetSharpenTexFuncSGIS (GLenum, GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLSHARPENTEXFUNCSGISPROC) (GLenum target, GLsizei n, const GLfloat *points);
typedef void (APIENTRYP PFNGLGETSHARPENTEXFUNCSGISPROC) (GLenum target, GLfloat *points);
#endif

#ifndef GL_EXT_packed_pixels
#define GL_EXT_packed_pixels 1
#endif

#ifndef GL_SGIS_texture_lod
#define GL_SGIS_texture_lod 1
#endif

#ifndef GL_SGIS_multisample
#define GL_SGIS_multisample 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glSampleMaskSGIS (GLclampf, GLboolean);
GLAPI void APIENTRY glSamplePatternSGIS (GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLSAMPLEMASKSGISPROC) (GLclampf value, GLboolean invert);
typedef void (APIENTRYP PFNGLSAMPLEPATTERNSGISPROC) (GLenum pattern);
#endif

#ifndef GL_EXT_rescale_normal
#define GL_EXT_rescale_normal 1
#endif

#ifndef GL_EXT_vertex_array
#define GL_EXT_vertex_array 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glArrayElementEXT (GLint);
GLAPI void APIENTRY glColorPointerEXT (GLint, GLenum, GLsizei, GLsizei, const GLvoid *);
GLAPI void APIENTRY glDrawArraysEXT (GLenum, GLint, GLsizei);
GLAPI void APIENTRY glEdgeFlagPointerEXT (GLsizei, GLsizei, const GLboolean *);
GLAPI void APIENTRY glGetPointervEXT (GLenum, GLvoid* *);
GLAPI void APIENTRY glIndexPointerEXT (GLenum, GLsizei, GLsizei, const GLvoid *);
GLAPI void APIENTRY glNormalPointerEXT (GLenum, GLsizei, GLsizei, const GLvoid *);
GLAPI void APIENTRY glTexCoordPointerEXT (GLint, GLenum, GLsizei, GLsizei, const GLvoid *);
GLAPI void APIENTRY glVertexPointerEXT (GLint, GLenum, GLsizei, GLsizei, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLARRAYELEMENTEXTPROC) (GLint i);
typedef void (APIENTRYP PFNGLCOLORPOINTEREXTPROC) (GLint size, GLenum type, GLsizei stride, GLsizei count, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLDRAWARRAYSEXTPROC) (GLenum mode, GLint first, GLsizei count);
typedef void (APIENTRYP PFNGLEDGEFLAGPOINTEREXTPROC) (GLsizei stride, GLsizei count, const GLboolean *pointer);
typedef void (APIENTRYP PFNGLGETPOINTERVEXTPROC) (GLenum pname, GLvoid* *params);
typedef void (APIENTRYP PFNGLINDEXPOINTEREXTPROC) (GLenum type, GLsizei stride, GLsizei count, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLNORMALPOINTEREXTPROC) (GLenum type, GLsizei stride, GLsizei count, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLTEXCOORDPOINTEREXTPROC) (GLint size, GLenum type, GLsizei stride, GLsizei count, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLVERTEXPOINTEREXTPROC) (GLint size, GLenum type, GLsizei stride, GLsizei count, const GLvoid *pointer);
#endif

#ifndef GL_EXT_misc_attribute
#define GL_EXT_misc_attribute 1
#endif

#ifndef GL_SGIS_generate_mipmap
#define GL_SGIS_generate_mipmap 1
#endif

#ifndef GL_SGIX_clipmap
#define GL_SGIX_clipmap 1
#endif

#ifndef GL_SGIX_shadow
#define GL_SGIX_shadow 1
#endif

#ifndef GL_SGIS_texture_edge_clamp
#define GL_SGIS_texture_edge_clamp 1
#endif

#ifndef GL_SGIS_texture_border_clamp
#define GL_SGIS_texture_border_clamp 1
#endif

#ifndef GL_EXT_blend_minmax
#define GL_EXT_blend_minmax 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBlendEquationEXT (GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBLENDEQUATIONEXTPROC) (GLenum mode);
#endif

#ifndef GL_EXT_blend_subtract
#define GL_EXT_blend_subtract 1
#endif

#ifndef GL_EXT_blend_logic_op
#define GL_EXT_blend_logic_op 1
#endif

#ifndef GL_SGIX_interlace
#define GL_SGIX_interlace 1
#endif

#ifndef GL_SGIX_pixel_tiles
#define GL_SGIX_pixel_tiles 1
#endif

#ifndef GL_SGIX_texture_select
#define GL_SGIX_texture_select 1
#endif

#ifndef GL_SGIX_sprite
#define GL_SGIX_sprite 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glSpriteParameterfSGIX (GLenum, GLfloat);
GLAPI void APIENTRY glSpriteParameterfvSGIX (GLenum, const GLfloat *);
GLAPI void APIENTRY glSpriteParameteriSGIX (GLenum, GLint);
GLAPI void APIENTRY glSpriteParameterivSGIX (GLenum, const GLint *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLSPRITEPARAMETERFSGIXPROC) (GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLSPRITEPARAMETERFVSGIXPROC) (GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLSPRITEPARAMETERISGIXPROC) (GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLSPRITEPARAMETERIVSGIXPROC) (GLenum pname, const GLint *params);
#endif

#ifndef GL_SGIX_texture_multi_buffer
#define GL_SGIX_texture_multi_buffer 1
#endif

#ifndef GL_EXT_point_parameters
#define GL_EXT_point_parameters 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPointParameterfEXT (GLenum, GLfloat);
GLAPI void APIENTRY glPointParameterfvEXT (GLenum, const GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPOINTPARAMETERFEXTPROC) (GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLPOINTPARAMETERFVEXTPROC) (GLenum pname, const GLfloat *params);
#endif

#ifndef GL_SGIS_point_parameters
#define GL_SGIS_point_parameters 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPointParameterfSGIS (GLenum, GLfloat);
GLAPI void APIENTRY glPointParameterfvSGIS (GLenum, const GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPOINTPARAMETERFSGISPROC) (GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLPOINTPARAMETERFVSGISPROC) (GLenum pname, const GLfloat *params);
#endif

#ifndef GL_SGIX_instruments
#define GL_SGIX_instruments 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI GLint APIENTRY glGetInstrumentsSGIX (void);
GLAPI void APIENTRY glInstrumentsBufferSGIX (GLsizei, GLint *);
GLAPI GLint APIENTRY glPollInstrumentsSGIX (GLint *);
GLAPI void APIENTRY glReadInstrumentsSGIX (GLint);
GLAPI void APIENTRY glStartInstrumentsSGIX (void);
GLAPI void APIENTRY glStopInstrumentsSGIX (GLint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef GLint (APIENTRYP PFNGLGETINSTRUMENTSSGIXPROC) (void);
typedef void (APIENTRYP PFNGLINSTRUMENTSBUFFERSGIXPROC) (GLsizei size, GLint *buffer);
typedef GLint (APIENTRYP PFNGLPOLLINSTRUMENTSSGIXPROC) (GLint *marker_p);
typedef void (APIENTRYP PFNGLREADINSTRUMENTSSGIXPROC) (GLint marker);
typedef void (APIENTRYP PFNGLSTARTINSTRUMENTSSGIXPROC) (void);
typedef void (APIENTRYP PFNGLSTOPINSTRUMENTSSGIXPROC) (GLint marker);
#endif

#ifndef GL_SGIX_texture_scale_bias
#define GL_SGIX_texture_scale_bias 1
#endif

#ifndef GL_SGIX_framezoom
#define GL_SGIX_framezoom 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glFrameZoomSGIX (GLint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLFRAMEZOOMSGIXPROC) (GLint factor);
#endif

#ifndef GL_SGIX_tag_sample_buffer
#define GL_SGIX_tag_sample_buffer 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glTagSampleBufferSGIX (void);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLTAGSAMPLEBUFFERSGIXPROC) (void);
#endif

#ifndef GL_SGIX_polynomial_ffd
#define GL_SGIX_polynomial_ffd 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glDeformationMap3dSGIX (GLenum, GLdouble, GLdouble, GLint, GLint, GLdouble, GLdouble, GLint, GLint, GLdouble, GLdouble, GLint, GLint, const GLdouble *);
GLAPI void APIENTRY glDeformationMap3fSGIX (GLenum, GLfloat, GLfloat, GLint, GLint, GLfloat, GLfloat, GLint, GLint, GLfloat, GLfloat, GLint, GLint, const GLfloat *);
GLAPI void APIENTRY glDeformSGIX (GLbitfield);
GLAPI void APIENTRY glLoadIdentityDeformationMapSGIX (GLbitfield);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLDEFORMATIONMAP3DSGIXPROC) (GLenum target, GLdouble u1, GLdouble u2, GLint ustride, GLint uorder, GLdouble v1, GLdouble v2, GLint vstride, GLint vorder, GLdouble w1, GLdouble w2, GLint wstride, GLint worder, const GLdouble *points);
typedef void (APIENTRYP PFNGLDEFORMATIONMAP3FSGIXPROC) (GLenum target, GLfloat u1, GLfloat u2, GLint ustride, GLint uorder, GLfloat v1, GLfloat v2, GLint vstride, GLint vorder, GLfloat w1, GLfloat w2, GLint wstride, GLint worder, const GLfloat *points);
typedef void (APIENTRYP PFNGLDEFORMSGIXPROC) (GLbitfield mask);
typedef void (APIENTRYP PFNGLLOADIDENTITYDEFORMATIONMAPSGIXPROC) (GLbitfield mask);
#endif

#ifndef GL_SGIX_reference_plane
#define GL_SGIX_reference_plane 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glReferencePlaneSGIX (const GLdouble *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLREFERENCEPLANESGIXPROC) (const GLdouble *equation);
#endif

#ifndef GL_SGIX_flush_raster
#define GL_SGIX_flush_raster 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glFlushRasterSGIX (void);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLFLUSHRASTERSGIXPROC) (void);
#endif

#ifndef GL_SGIX_depth_texture
#define GL_SGIX_depth_texture 1
#endif

#ifndef GL_SGIS_fog_function
#define GL_SGIS_fog_function 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glFogFuncSGIS (GLsizei, const GLfloat *);
GLAPI void APIENTRY glGetFogFuncSGIS (GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLFOGFUNCSGISPROC) (GLsizei n, const GLfloat *points);
typedef void (APIENTRYP PFNGLGETFOGFUNCSGISPROC) (GLfloat *points);
#endif

#ifndef GL_SGIX_fog_offset
#define GL_SGIX_fog_offset 1
#endif

#ifndef GL_HP_image_transform
#define GL_HP_image_transform 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glImageTransformParameteriHP (GLenum, GLenum, GLint);
GLAPI void APIENTRY glImageTransformParameterfHP (GLenum, GLenum, GLfloat);
GLAPI void APIENTRY glImageTransformParameterivHP (GLenum, GLenum, const GLint *);
GLAPI void APIENTRY glImageTransformParameterfvHP (GLenum, GLenum, const GLfloat *);
GLAPI void APIENTRY glGetImageTransformParameterivHP (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetImageTransformParameterfvHP (GLenum, GLenum, GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLIMAGETRANSFORMPARAMETERIHPPROC) (GLenum target, GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLIMAGETRANSFORMPARAMETERFHPPROC) (GLenum target, GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLIMAGETRANSFORMPARAMETERIVHPPROC) (GLenum target, GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLIMAGETRANSFORMPARAMETERFVHPPROC) (GLenum target, GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLGETIMAGETRANSFORMPARAMETERIVHPPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETIMAGETRANSFORMPARAMETERFVHPPROC) (GLenum target, GLenum pname, GLfloat *params);
#endif

#ifndef GL_HP_convolution_border_modes
#define GL_HP_convolution_border_modes 1
#endif

#ifndef GL_SGIX_texture_add_env
#define GL_SGIX_texture_add_env 1
#endif

#ifndef GL_EXT_color_subtable
#define GL_EXT_color_subtable 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glColorSubTableEXT (GLenum, GLsizei, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glCopyColorSubTableEXT (GLenum, GLsizei, GLint, GLint, GLsizei);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCOLORSUBTABLEEXTPROC) (GLenum target, GLsizei start, GLsizei count, GLenum format, GLenum type, const GLvoid *data);
typedef void (APIENTRYP PFNGLCOPYCOLORSUBTABLEEXTPROC) (GLenum target, GLsizei start, GLint x, GLint y, GLsizei width);
#endif

#ifndef GL_PGI_vertex_hints
#define GL_PGI_vertex_hints 1
#endif

#ifndef GL_PGI_misc_hints
#define GL_PGI_misc_hints 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glHintPGI (GLenum, GLint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLHINTPGIPROC) (GLenum target, GLint mode);
#endif

#ifndef GL_EXT_paletted_texture
#define GL_EXT_paletted_texture 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glColorTableEXT (GLenum, GLenum, GLsizei, GLenum, GLenum, const GLvoid *);
GLAPI void APIENTRY glGetColorTableEXT (GLenum, GLenum, GLenum, GLvoid *);
GLAPI void APIENTRY glGetColorTableParameterivEXT (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetColorTableParameterfvEXT (GLenum, GLenum, GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCOLORTABLEEXTPROC) (GLenum target, GLenum internalFormat, GLsizei width, GLenum format, GLenum type, const GLvoid *table);
typedef void (APIENTRYP PFNGLGETCOLORTABLEEXTPROC) (GLenum target, GLenum format, GLenum type, GLvoid *data);
typedef void (APIENTRYP PFNGLGETCOLORTABLEPARAMETERIVEXTPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETCOLORTABLEPARAMETERFVEXTPROC) (GLenum target, GLenum pname, GLfloat *params);
#endif

#ifndef GL_EXT_clip_volume_hint
#define GL_EXT_clip_volume_hint 1
#endif

#ifndef GL_SGIX_list_priority
#define GL_SGIX_list_priority 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glGetListParameterfvSGIX (GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glGetListParameterivSGIX (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glListParameterfSGIX (GLuint, GLenum, GLfloat);
GLAPI void APIENTRY glListParameterfvSGIX (GLuint, GLenum, const GLfloat *);
GLAPI void APIENTRY glListParameteriSGIX (GLuint, GLenum, GLint);
GLAPI void APIENTRY glListParameterivSGIX (GLuint, GLenum, const GLint *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLGETLISTPARAMETERFVSGIXPROC) (GLuint list, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETLISTPARAMETERIVSGIXPROC) (GLuint list, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLLISTPARAMETERFSGIXPROC) (GLuint list, GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLLISTPARAMETERFVSGIXPROC) (GLuint list, GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLLISTPARAMETERISGIXPROC) (GLuint list, GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLLISTPARAMETERIVSGIXPROC) (GLuint list, GLenum pname, const GLint *params);
#endif

#ifndef GL_SGIX_ir_instrument1
#define GL_SGIX_ir_instrument1 1
#endif

#ifndef GL_SGIX_calligraphic_fragment
#define GL_SGIX_calligraphic_fragment 1
#endif

#ifndef GL_SGIX_texture_lod_bias
#define GL_SGIX_texture_lod_bias 1
#endif

#ifndef GL_SGIX_shadow_ambient
#define GL_SGIX_shadow_ambient 1
#endif

#ifndef GL_EXT_index_texture
#define GL_EXT_index_texture 1
#endif

#ifndef GL_EXT_index_material
#define GL_EXT_index_material 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glIndexMaterialEXT (GLenum, GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLINDEXMATERIALEXTPROC) (GLenum face, GLenum mode);
#endif

#ifndef GL_EXT_index_func
#define GL_EXT_index_func 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glIndexFuncEXT (GLenum, GLclampf);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLINDEXFUNCEXTPROC) (GLenum func, GLclampf ref);
#endif

#ifndef GL_EXT_index_array_formats
#define GL_EXT_index_array_formats 1
#endif

#ifndef GL_EXT_compiled_vertex_array
#define GL_EXT_compiled_vertex_array 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glLockArraysEXT (GLint, GLsizei);
GLAPI void APIENTRY glUnlockArraysEXT (void);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLLOCKARRAYSEXTPROC) (GLint first, GLsizei count);
typedef void (APIENTRYP PFNGLUNLOCKARRAYSEXTPROC) (void);
#endif

#ifndef GL_EXT_cull_vertex
#define GL_EXT_cull_vertex 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glCullParameterdvEXT (GLenum, GLdouble *);
GLAPI void APIENTRY glCullParameterfvEXT (GLenum, GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCULLPARAMETERDVEXTPROC) (GLenum pname, GLdouble *params);
typedef void (APIENTRYP PFNGLCULLPARAMETERFVEXTPROC) (GLenum pname, GLfloat *params);
#endif

#ifndef GL_SGIX_ycrcb
#define GL_SGIX_ycrcb 1
#endif

#ifndef GL_SGIX_fragment_lighting
#define GL_SGIX_fragment_lighting 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glFragmentColorMaterialSGIX (GLenum, GLenum);
GLAPI void APIENTRY glFragmentLightfSGIX (GLenum, GLenum, GLfloat);
GLAPI void APIENTRY glFragmentLightfvSGIX (GLenum, GLenum, const GLfloat *);
GLAPI void APIENTRY glFragmentLightiSGIX (GLenum, GLenum, GLint);
GLAPI void APIENTRY glFragmentLightivSGIX (GLenum, GLenum, const GLint *);
GLAPI void APIENTRY glFragmentLightModelfSGIX (GLenum, GLfloat);
GLAPI void APIENTRY glFragmentLightModelfvSGIX (GLenum, const GLfloat *);
GLAPI void APIENTRY glFragmentLightModeliSGIX (GLenum, GLint);
GLAPI void APIENTRY glFragmentLightModelivSGIX (GLenum, const GLint *);
GLAPI void APIENTRY glFragmentMaterialfSGIX (GLenum, GLenum, GLfloat);
GLAPI void APIENTRY glFragmentMaterialfvSGIX (GLenum, GLenum, const GLfloat *);
GLAPI void APIENTRY glFragmentMaterialiSGIX (GLenum, GLenum, GLint);
GLAPI void APIENTRY glFragmentMaterialivSGIX (GLenum, GLenum, const GLint *);
GLAPI void APIENTRY glGetFragmentLightfvSGIX (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetFragmentLightivSGIX (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetFragmentMaterialfvSGIX (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetFragmentMaterialivSGIX (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glLightEnviSGIX (GLenum, GLint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLFRAGMENTCOLORMATERIALSGIXPROC) (GLenum face, GLenum mode);
typedef void (APIENTRYP PFNGLFRAGMENTLIGHTFSGIXPROC) (GLenum light, GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLFRAGMENTLIGHTFVSGIXPROC) (GLenum light, GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLFRAGMENTLIGHTISGIXPROC) (GLenum light, GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLFRAGMENTLIGHTIVSGIXPROC) (GLenum light, GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLFRAGMENTLIGHTMODELFSGIXPROC) (GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLFRAGMENTLIGHTMODELFVSGIXPROC) (GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLFRAGMENTLIGHTMODELISGIXPROC) (GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLFRAGMENTLIGHTMODELIVSGIXPROC) (GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLFRAGMENTMATERIALFSGIXPROC) (GLenum face, GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLFRAGMENTMATERIALFVSGIXPROC) (GLenum face, GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLFRAGMENTMATERIALISGIXPROC) (GLenum face, GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLFRAGMENTMATERIALIVSGIXPROC) (GLenum face, GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLGETFRAGMENTLIGHTFVSGIXPROC) (GLenum light, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETFRAGMENTLIGHTIVSGIXPROC) (GLenum light, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETFRAGMENTMATERIALFVSGIXPROC) (GLenum face, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETFRAGMENTMATERIALIVSGIXPROC) (GLenum face, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLLIGHTENVISGIXPROC) (GLenum pname, GLint param);
#endif

#ifndef GL_IBM_rasterpos_clip
#define GL_IBM_rasterpos_clip 1
#endif

#ifndef GL_HP_texture_lighting
#define GL_HP_texture_lighting 1
#endif

#ifndef GL_EXT_draw_range_elements
#define GL_EXT_draw_range_elements 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glDrawRangeElementsEXT (GLenum, GLuint, GLuint, GLsizei, GLenum, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLDRAWRANGEELEMENTSEXTPROC) (GLenum mode, GLuint start, GLuint end, GLsizei count, GLenum type, const GLvoid *indices);
#endif

#ifndef GL_WIN_phong_shading
#define GL_WIN_phong_shading 1
#endif

#ifndef GL_WIN_specular_fog
#define GL_WIN_specular_fog 1
#endif

#ifndef GL_EXT_light_texture
#define GL_EXT_light_texture 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glApplyTextureEXT (GLenum);
GLAPI void APIENTRY glTextureLightEXT (GLenum);
GLAPI void APIENTRY glTextureMaterialEXT (GLenum, GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLAPPLYTEXTUREEXTPROC) (GLenum mode);
typedef void (APIENTRYP PFNGLTEXTURELIGHTEXTPROC) (GLenum pname);
typedef void (APIENTRYP PFNGLTEXTUREMATERIALEXTPROC) (GLenum face, GLenum mode);
#endif

#ifndef GL_SGIX_blend_alpha_minmax
#define GL_SGIX_blend_alpha_minmax 1
#endif

#ifndef GL_EXT_bgra
#define GL_EXT_bgra 1
#endif

#ifndef GL_SGIX_async
#define GL_SGIX_async 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glAsyncMarkerSGIX (GLuint);
GLAPI GLint APIENTRY glFinishAsyncSGIX (GLuint *);
GLAPI GLint APIENTRY glPollAsyncSGIX (GLuint *);
GLAPI GLuint APIENTRY glGenAsyncMarkersSGIX (GLsizei);
GLAPI void APIENTRY glDeleteAsyncMarkersSGIX (GLuint, GLsizei);
GLAPI GLboolean APIENTRY glIsAsyncMarkerSGIX (GLuint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLASYNCMARKERSGIXPROC) (GLuint marker);
typedef GLint (APIENTRYP PFNGLFINISHASYNCSGIXPROC) (GLuint *markerp);
typedef GLint (APIENTRYP PFNGLPOLLASYNCSGIXPROC) (GLuint *markerp);
typedef GLuint (APIENTRYP PFNGLGENASYNCMARKERSSGIXPROC) (GLsizei range);
typedef void (APIENTRYP PFNGLDELETEASYNCMARKERSSGIXPROC) (GLuint marker, GLsizei range);
typedef GLboolean (APIENTRYP PFNGLISASYNCMARKERSGIXPROC) (GLuint marker);
#endif

#ifndef GL_SGIX_async_pixel
#define GL_SGIX_async_pixel 1
#endif

#ifndef GL_SGIX_async_histogram
#define GL_SGIX_async_histogram 1
#endif

#ifndef GL_INTEL_parallel_arrays
#define GL_INTEL_parallel_arrays 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glVertexPointervINTEL (GLint, GLenum, const GLvoid* *);
GLAPI void APIENTRY glNormalPointervINTEL (GLenum, const GLvoid* *);
GLAPI void APIENTRY glColorPointervINTEL (GLint, GLenum, const GLvoid* *);
GLAPI void APIENTRY glTexCoordPointervINTEL (GLint, GLenum, const GLvoid* *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLVERTEXPOINTERVINTELPROC) (GLint size, GLenum type, const GLvoid* *pointer);
typedef void (APIENTRYP PFNGLNORMALPOINTERVINTELPROC) (GLenum type, const GLvoid* *pointer);
typedef void (APIENTRYP PFNGLCOLORPOINTERVINTELPROC) (GLint size, GLenum type, const GLvoid* *pointer);
typedef void (APIENTRYP PFNGLTEXCOORDPOINTERVINTELPROC) (GLint size, GLenum type, const GLvoid* *pointer);
#endif

#ifndef GL_HP_occlusion_test
#define GL_HP_occlusion_test 1
#endif

#ifndef GL_EXT_pixel_transform
#define GL_EXT_pixel_transform 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPixelTransformParameteriEXT (GLenum, GLenum, GLint);
GLAPI void APIENTRY glPixelTransformParameterfEXT (GLenum, GLenum, GLfloat);
GLAPI void APIENTRY glPixelTransformParameterivEXT (GLenum, GLenum, const GLint *);
GLAPI void APIENTRY glPixelTransformParameterfvEXT (GLenum, GLenum, const GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPIXELTRANSFORMPARAMETERIEXTPROC) (GLenum target, GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLPIXELTRANSFORMPARAMETERFEXTPROC) (GLenum target, GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLPIXELTRANSFORMPARAMETERIVEXTPROC) (GLenum target, GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLPIXELTRANSFORMPARAMETERFVEXTPROC) (GLenum target, GLenum pname, const GLfloat *params);
#endif

#ifndef GL_EXT_pixel_transform_color_table
#define GL_EXT_pixel_transform_color_table 1
#endif

#ifndef GL_EXT_shared_texture_palette
#define GL_EXT_shared_texture_palette 1
#endif

#ifndef GL_EXT_separate_specular_color
#define GL_EXT_separate_specular_color 1
#endif

#ifndef GL_EXT_secondary_color
#define GL_EXT_secondary_color 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glSecondaryColor3bEXT (GLbyte, GLbyte, GLbyte);
GLAPI void APIENTRY glSecondaryColor3bvEXT (const GLbyte *);
GLAPI void APIENTRY glSecondaryColor3dEXT (GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glSecondaryColor3dvEXT (const GLdouble *);
GLAPI void APIENTRY glSecondaryColor3fEXT (GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glSecondaryColor3fvEXT (const GLfloat *);
GLAPI void APIENTRY glSecondaryColor3iEXT (GLint, GLint, GLint);
GLAPI void APIENTRY glSecondaryColor3ivEXT (const GLint *);
GLAPI void APIENTRY glSecondaryColor3sEXT (GLshort, GLshort, GLshort);
GLAPI void APIENTRY glSecondaryColor3svEXT (const GLshort *);
GLAPI void APIENTRY glSecondaryColor3ubEXT (GLubyte, GLubyte, GLubyte);
GLAPI void APIENTRY glSecondaryColor3ubvEXT (const GLubyte *);
GLAPI void APIENTRY glSecondaryColor3uiEXT (GLuint, GLuint, GLuint);
GLAPI void APIENTRY glSecondaryColor3uivEXT (const GLuint *);
GLAPI void APIENTRY glSecondaryColor3usEXT (GLushort, GLushort, GLushort);
GLAPI void APIENTRY glSecondaryColor3usvEXT (const GLushort *);
GLAPI void APIENTRY glSecondaryColorPointerEXT (GLint, GLenum, GLsizei, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3BEXTPROC) (GLbyte red, GLbyte green, GLbyte blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3BVEXTPROC) (const GLbyte *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3DEXTPROC) (GLdouble red, GLdouble green, GLdouble blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3DVEXTPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3FEXTPROC) (GLfloat red, GLfloat green, GLfloat blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3FVEXTPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3IEXTPROC) (GLint red, GLint green, GLint blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3IVEXTPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3SEXTPROC) (GLshort red, GLshort green, GLshort blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3SVEXTPROC) (const GLshort *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3UBEXTPROC) (GLubyte red, GLubyte green, GLubyte blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3UBVEXTPROC) (const GLubyte *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3UIEXTPROC) (GLuint red, GLuint green, GLuint blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3UIVEXTPROC) (const GLuint *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3USEXTPROC) (GLushort red, GLushort green, GLushort blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3USVEXTPROC) (const GLushort *v);
typedef void (APIENTRYP PFNGLSECONDARYCOLORPOINTEREXTPROC) (GLint size, GLenum type, GLsizei stride, const GLvoid *pointer);
#endif

#ifndef GL_EXT_texture_perturb_normal
#define GL_EXT_texture_perturb_normal 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glTextureNormalEXT (GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLTEXTURENORMALEXTPROC) (GLenum mode);
#endif

#ifndef GL_EXT_multi_draw_arrays
#define GL_EXT_multi_draw_arrays 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glMultiDrawArraysEXT (GLenum, GLint *, GLsizei *, GLsizei);
GLAPI void APIENTRY glMultiDrawElementsEXT (GLenum, const GLsizei *, GLenum, const GLvoid* *, GLsizei);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLMULTIDRAWARRAYSEXTPROC) (GLenum mode, GLint *first, GLsizei *count, GLsizei primcount);
typedef void (APIENTRYP PFNGLMULTIDRAWELEMENTSEXTPROC) (GLenum mode, const GLsizei *count, GLenum type, const GLvoid* *indices, GLsizei primcount);
#endif

#ifndef GL_EXT_fog_coord
#define GL_EXT_fog_coord 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glFogCoordfEXT (GLfloat);
GLAPI void APIENTRY glFogCoordfvEXT (const GLfloat *);
GLAPI void APIENTRY glFogCoorddEXT (GLdouble);
GLAPI void APIENTRY glFogCoorddvEXT (const GLdouble *);
GLAPI void APIENTRY glFogCoordPointerEXT (GLenum, GLsizei, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLFOGCOORDFEXTPROC) (GLfloat coord);
typedef void (APIENTRYP PFNGLFOGCOORDFVEXTPROC) (const GLfloat *coord);
typedef void (APIENTRYP PFNGLFOGCOORDDEXTPROC) (GLdouble coord);
typedef void (APIENTRYP PFNGLFOGCOORDDVEXTPROC) (const GLdouble *coord);
typedef void (APIENTRYP PFNGLFOGCOORDPOINTEREXTPROC) (GLenum type, GLsizei stride, const GLvoid *pointer);
#endif

#ifndef GL_REND_screen_coordinates
#define GL_REND_screen_coordinates 1
#endif

#ifndef GL_EXT_coordinate_frame
#define GL_EXT_coordinate_frame 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glTangent3bEXT (GLbyte, GLbyte, GLbyte);
GLAPI void APIENTRY glTangent3bvEXT (const GLbyte *);
GLAPI void APIENTRY glTangent3dEXT (GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glTangent3dvEXT (const GLdouble *);
GLAPI void APIENTRY glTangent3fEXT (GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glTangent3fvEXT (const GLfloat *);
GLAPI void APIENTRY glTangent3iEXT (GLint, GLint, GLint);
GLAPI void APIENTRY glTangent3ivEXT (const GLint *);
GLAPI void APIENTRY glTangent3sEXT (GLshort, GLshort, GLshort);
GLAPI void APIENTRY glTangent3svEXT (const GLshort *);
GLAPI void APIENTRY glBinormal3bEXT (GLbyte, GLbyte, GLbyte);
GLAPI void APIENTRY glBinormal3bvEXT (const GLbyte *);
GLAPI void APIENTRY glBinormal3dEXT (GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glBinormal3dvEXT (const GLdouble *);
GLAPI void APIENTRY glBinormal3fEXT (GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glBinormal3fvEXT (const GLfloat *);
GLAPI void APIENTRY glBinormal3iEXT (GLint, GLint, GLint);
GLAPI void APIENTRY glBinormal3ivEXT (const GLint *);
GLAPI void APIENTRY glBinormal3sEXT (GLshort, GLshort, GLshort);
GLAPI void APIENTRY glBinormal3svEXT (const GLshort *);
GLAPI void APIENTRY glTangentPointerEXT (GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glBinormalPointerEXT (GLenum, GLsizei, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLTANGENT3BEXTPROC) (GLbyte tx, GLbyte ty, GLbyte tz);
typedef void (APIENTRYP PFNGLTANGENT3BVEXTPROC) (const GLbyte *v);
typedef void (APIENTRYP PFNGLTANGENT3DEXTPROC) (GLdouble tx, GLdouble ty, GLdouble tz);
typedef void (APIENTRYP PFNGLTANGENT3DVEXTPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLTANGENT3FEXTPROC) (GLfloat tx, GLfloat ty, GLfloat tz);
typedef void (APIENTRYP PFNGLTANGENT3FVEXTPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLTANGENT3IEXTPROC) (GLint tx, GLint ty, GLint tz);
typedef void (APIENTRYP PFNGLTANGENT3IVEXTPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLTANGENT3SEXTPROC) (GLshort tx, GLshort ty, GLshort tz);
typedef void (APIENTRYP PFNGLTANGENT3SVEXTPROC) (const GLshort *v);
typedef void (APIENTRYP PFNGLBINORMAL3BEXTPROC) (GLbyte bx, GLbyte by, GLbyte bz);
typedef void (APIENTRYP PFNGLBINORMAL3BVEXTPROC) (const GLbyte *v);
typedef void (APIENTRYP PFNGLBINORMAL3DEXTPROC) (GLdouble bx, GLdouble by, GLdouble bz);
typedef void (APIENTRYP PFNGLBINORMAL3DVEXTPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLBINORMAL3FEXTPROC) (GLfloat bx, GLfloat by, GLfloat bz);
typedef void (APIENTRYP PFNGLBINORMAL3FVEXTPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLBINORMAL3IEXTPROC) (GLint bx, GLint by, GLint bz);
typedef void (APIENTRYP PFNGLBINORMAL3IVEXTPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLBINORMAL3SEXTPROC) (GLshort bx, GLshort by, GLshort bz);
typedef void (APIENTRYP PFNGLBINORMAL3SVEXTPROC) (const GLshort *v);
typedef void (APIENTRYP PFNGLTANGENTPOINTEREXTPROC) (GLenum type, GLsizei stride, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLBINORMALPOINTEREXTPROC) (GLenum type, GLsizei stride, const GLvoid *pointer);
#endif

#ifndef GL_EXT_texture_env_combine
#define GL_EXT_texture_env_combine 1
#endif

#ifndef GL_APPLE_specular_vector
#define GL_APPLE_specular_vector 1
#endif

#ifndef GL_APPLE_transform_hint
#define GL_APPLE_transform_hint 1
#endif

#ifndef GL_SGIX_fog_scale
#define GL_SGIX_fog_scale 1
#endif

#ifndef GL_SUNX_constant_data
#define GL_SUNX_constant_data 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glFinishTextureSUNX (void);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLFINISHTEXTURESUNXPROC) (void);
#endif

#ifndef GL_SUN_global_alpha
#define GL_SUN_global_alpha 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glGlobalAlphaFactorbSUN (GLbyte);
GLAPI void APIENTRY glGlobalAlphaFactorsSUN (GLshort);
GLAPI void APIENTRY glGlobalAlphaFactoriSUN (GLint);
GLAPI void APIENTRY glGlobalAlphaFactorfSUN (GLfloat);
GLAPI void APIENTRY glGlobalAlphaFactordSUN (GLdouble);
GLAPI void APIENTRY glGlobalAlphaFactorubSUN (GLubyte);
GLAPI void APIENTRY glGlobalAlphaFactorusSUN (GLushort);
GLAPI void APIENTRY glGlobalAlphaFactoruiSUN (GLuint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLGLOBALALPHAFACTORBSUNPROC) (GLbyte factor);
typedef void (APIENTRYP PFNGLGLOBALALPHAFACTORSSUNPROC) (GLshort factor);
typedef void (APIENTRYP PFNGLGLOBALALPHAFACTORISUNPROC) (GLint factor);
typedef void (APIENTRYP PFNGLGLOBALALPHAFACTORFSUNPROC) (GLfloat factor);
typedef void (APIENTRYP PFNGLGLOBALALPHAFACTORDSUNPROC) (GLdouble factor);
typedef void (APIENTRYP PFNGLGLOBALALPHAFACTORUBSUNPROC) (GLubyte factor);
typedef void (APIENTRYP PFNGLGLOBALALPHAFACTORUSSUNPROC) (GLushort factor);
typedef void (APIENTRYP PFNGLGLOBALALPHAFACTORUISUNPROC) (GLuint factor);
#endif

#ifndef GL_SUN_triangle_list
#define GL_SUN_triangle_list 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glReplacementCodeuiSUN (GLuint);
GLAPI void APIENTRY glReplacementCodeusSUN (GLushort);
GLAPI void APIENTRY glReplacementCodeubSUN (GLubyte);
GLAPI void APIENTRY glReplacementCodeuivSUN (const GLuint *);
GLAPI void APIENTRY glReplacementCodeusvSUN (const GLushort *);
GLAPI void APIENTRY glReplacementCodeubvSUN (const GLubyte *);
GLAPI void APIENTRY glReplacementCodePointerSUN (GLenum, GLsizei, const GLvoid* *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUISUNPROC) (GLuint code);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUSSUNPROC) (GLushort code);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUBSUNPROC) (GLubyte code);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUIVSUNPROC) (const GLuint *code);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUSVSUNPROC) (const GLushort *code);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUBVSUNPROC) (const GLubyte *code);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEPOINTERSUNPROC) (GLenum type, GLsizei stride, const GLvoid* *pointer);
#endif

#ifndef GL_SUN_vertex
#define GL_SUN_vertex 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glColor4ubVertex2fSUN (GLubyte, GLubyte, GLubyte, GLubyte, GLfloat, GLfloat);
GLAPI void APIENTRY glColor4ubVertex2fvSUN (const GLubyte *, const GLfloat *);
GLAPI void APIENTRY glColor4ubVertex3fSUN (GLubyte, GLubyte, GLubyte, GLubyte, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glColor4ubVertex3fvSUN (const GLubyte *, const GLfloat *);
GLAPI void APIENTRY glColor3fVertex3fSUN (GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glColor3fVertex3fvSUN (const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glNormal3fVertex3fSUN (GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glNormal3fVertex3fvSUN (const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glColor4fNormal3fVertex3fSUN (GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glColor4fNormal3fVertex3fvSUN (const GLfloat *, const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glTexCoord2fVertex3fSUN (GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glTexCoord2fVertex3fvSUN (const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glTexCoord4fVertex4fSUN (GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glTexCoord4fVertex4fvSUN (const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glTexCoord2fColor4ubVertex3fSUN (GLfloat, GLfloat, GLubyte, GLubyte, GLubyte, GLubyte, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glTexCoord2fColor4ubVertex3fvSUN (const GLfloat *, const GLubyte *, const GLfloat *);
GLAPI void APIENTRY glTexCoord2fColor3fVertex3fSUN (GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glTexCoord2fColor3fVertex3fvSUN (const GLfloat *, const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glTexCoord2fNormal3fVertex3fSUN (GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glTexCoord2fNormal3fVertex3fvSUN (const GLfloat *, const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glTexCoord2fColor4fNormal3fVertex3fSUN (GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glTexCoord2fColor4fNormal3fVertex3fvSUN (const GLfloat *, const GLfloat *, const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glTexCoord4fColor4fNormal3fVertex4fSUN (GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glTexCoord4fColor4fNormal3fVertex4fvSUN (const GLfloat *, const GLfloat *, const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glReplacementCodeuiVertex3fSUN (GLuint, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glReplacementCodeuiVertex3fvSUN (const GLuint *, const GLfloat *);
GLAPI void APIENTRY glReplacementCodeuiColor4ubVertex3fSUN (GLuint, GLubyte, GLubyte, GLubyte, GLubyte, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glReplacementCodeuiColor4ubVertex3fvSUN (const GLuint *, const GLubyte *, const GLfloat *);
GLAPI void APIENTRY glReplacementCodeuiColor3fVertex3fSUN (GLuint, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glReplacementCodeuiColor3fVertex3fvSUN (const GLuint *, const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glReplacementCodeuiNormal3fVertex3fSUN (GLuint, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glReplacementCodeuiNormal3fVertex3fvSUN (const GLuint *, const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glReplacementCodeuiColor4fNormal3fVertex3fSUN (GLuint, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glReplacementCodeuiColor4fNormal3fVertex3fvSUN (const GLuint *, const GLfloat *, const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glReplacementCodeuiTexCoord2fVertex3fSUN (GLuint, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glReplacementCodeuiTexCoord2fVertex3fvSUN (const GLuint *, const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glReplacementCodeuiTexCoord2fNormal3fVertex3fSUN (GLuint, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glReplacementCodeuiTexCoord2fNormal3fVertex3fvSUN (const GLuint *, const GLfloat *, const GLfloat *, const GLfloat *);
GLAPI void APIENTRY glReplacementCodeuiTexCoord2fColor4fNormal3fVertex3fSUN (GLuint, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glReplacementCodeuiTexCoord2fColor4fNormal3fVertex3fvSUN (const GLuint *, const GLfloat *, const GLfloat *, const GLfloat *, const GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCOLOR4UBVERTEX2FSUNPROC) (GLubyte r, GLubyte g, GLubyte b, GLubyte a, GLfloat x, GLfloat y);
typedef void (APIENTRYP PFNGLCOLOR4UBVERTEX2FVSUNPROC) (const GLubyte *c, const GLfloat *v);
typedef void (APIENTRYP PFNGLCOLOR4UBVERTEX3FSUNPROC) (GLubyte r, GLubyte g, GLubyte b, GLubyte a, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLCOLOR4UBVERTEX3FVSUNPROC) (const GLubyte *c, const GLfloat *v);
typedef void (APIENTRYP PFNGLCOLOR3FVERTEX3FSUNPROC) (GLfloat r, GLfloat g, GLfloat b, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLCOLOR3FVERTEX3FVSUNPROC) (const GLfloat *c, const GLfloat *v);
typedef void (APIENTRYP PFNGLNORMAL3FVERTEX3FSUNPROC) (GLfloat nx, GLfloat ny, GLfloat nz, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLNORMAL3FVERTEX3FVSUNPROC) (const GLfloat *n, const GLfloat *v);
typedef void (APIENTRYP PFNGLCOLOR4FNORMAL3FVERTEX3FSUNPROC) (GLfloat r, GLfloat g, GLfloat b, GLfloat a, GLfloat nx, GLfloat ny, GLfloat nz, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLCOLOR4FNORMAL3FVERTEX3FVSUNPROC) (const GLfloat *c, const GLfloat *n, const GLfloat *v);
typedef void (APIENTRYP PFNGLTEXCOORD2FVERTEX3FSUNPROC) (GLfloat s, GLfloat t, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLTEXCOORD2FVERTEX3FVSUNPROC) (const GLfloat *tc, const GLfloat *v);
typedef void (APIENTRYP PFNGLTEXCOORD4FVERTEX4FSUNPROC) (GLfloat s, GLfloat t, GLfloat p, GLfloat q, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLTEXCOORD4FVERTEX4FVSUNPROC) (const GLfloat *tc, const GLfloat *v);
typedef void (APIENTRYP PFNGLTEXCOORD2FCOLOR4UBVERTEX3FSUNPROC) (GLfloat s, GLfloat t, GLubyte r, GLubyte g, GLubyte b, GLubyte a, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLTEXCOORD2FCOLOR4UBVERTEX3FVSUNPROC) (const GLfloat *tc, const GLubyte *c, const GLfloat *v);
typedef void (APIENTRYP PFNGLTEXCOORD2FCOLOR3FVERTEX3FSUNPROC) (GLfloat s, GLfloat t, GLfloat r, GLfloat g, GLfloat b, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLTEXCOORD2FCOLOR3FVERTEX3FVSUNPROC) (const GLfloat *tc, const GLfloat *c, const GLfloat *v);
typedef void (APIENTRYP PFNGLTEXCOORD2FNORMAL3FVERTEX3FSUNPROC) (GLfloat s, GLfloat t, GLfloat nx, GLfloat ny, GLfloat nz, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLTEXCOORD2FNORMAL3FVERTEX3FVSUNPROC) (const GLfloat *tc, const GLfloat *n, const GLfloat *v);
typedef void (APIENTRYP PFNGLTEXCOORD2FCOLOR4FNORMAL3FVERTEX3FSUNPROC) (GLfloat s, GLfloat t, GLfloat r, GLfloat g, GLfloat b, GLfloat a, GLfloat nx, GLfloat ny, GLfloat nz, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLTEXCOORD2FCOLOR4FNORMAL3FVERTEX3FVSUNPROC) (const GLfloat *tc, const GLfloat *c, const GLfloat *n, const GLfloat *v);
typedef void (APIENTRYP PFNGLTEXCOORD4FCOLOR4FNORMAL3FVERTEX4FSUNPROC) (GLfloat s, GLfloat t, GLfloat p, GLfloat q, GLfloat r, GLfloat g, GLfloat b, GLfloat a, GLfloat nx, GLfloat ny, GLfloat nz, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLTEXCOORD4FCOLOR4FNORMAL3FVERTEX4FVSUNPROC) (const GLfloat *tc, const GLfloat *c, const GLfloat *n, const GLfloat *v);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUIVERTEX3FSUNPROC) (GLuint rc, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUIVERTEX3FVSUNPROC) (const GLuint *rc, const GLfloat *v);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUICOLOR4UBVERTEX3FSUNPROC) (GLuint rc, GLubyte r, GLubyte g, GLubyte b, GLubyte a, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUICOLOR4UBVERTEX3FVSUNPROC) (const GLuint *rc, const GLubyte *c, const GLfloat *v);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUICOLOR3FVERTEX3FSUNPROC) (GLuint rc, GLfloat r, GLfloat g, GLfloat b, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUICOLOR3FVERTEX3FVSUNPROC) (const GLuint *rc, const GLfloat *c, const GLfloat *v);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUINORMAL3FVERTEX3FSUNPROC) (GLuint rc, GLfloat nx, GLfloat ny, GLfloat nz, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUINORMAL3FVERTEX3FVSUNPROC) (const GLuint *rc, const GLfloat *n, const GLfloat *v);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUICOLOR4FNORMAL3FVERTEX3FSUNPROC) (GLuint rc, GLfloat r, GLfloat g, GLfloat b, GLfloat a, GLfloat nx, GLfloat ny, GLfloat nz, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUICOLOR4FNORMAL3FVERTEX3FVSUNPROC) (const GLuint *rc, const GLfloat *c, const GLfloat *n, const GLfloat *v);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUITEXCOORD2FVERTEX3FSUNPROC) (GLuint rc, GLfloat s, GLfloat t, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUITEXCOORD2FVERTEX3FVSUNPROC) (const GLuint *rc, const GLfloat *tc, const GLfloat *v);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUITEXCOORD2FNORMAL3FVERTEX3FSUNPROC) (GLuint rc, GLfloat s, GLfloat t, GLfloat nx, GLfloat ny, GLfloat nz, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUITEXCOORD2FNORMAL3FVERTEX3FVSUNPROC) (const GLuint *rc, const GLfloat *tc, const GLfloat *n, const GLfloat *v);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUITEXCOORD2FCOLOR4FNORMAL3FVERTEX3FSUNPROC) (GLuint rc, GLfloat s, GLfloat t, GLfloat r, GLfloat g, GLfloat b, GLfloat a, GLfloat nx, GLfloat ny, GLfloat nz, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLREPLACEMENTCODEUITEXCOORD2FCOLOR4FNORMAL3FVERTEX3FVSUNPROC) (const GLuint *rc, const GLfloat *tc, const GLfloat *c, const GLfloat *n, const GLfloat *v);
#endif

#ifndef GL_EXT_blend_func_separate
#define GL_EXT_blend_func_separate 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBlendFuncSeparateEXT (GLenum, GLenum, GLenum, GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBLENDFUNCSEPARATEEXTPROC) (GLenum sfactorRGB, GLenum dfactorRGB, GLenum sfactorAlpha, GLenum dfactorAlpha);
#endif

#ifndef GL_INGR_blend_func_separate
#define GL_INGR_blend_func_separate 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBlendFuncSeparateINGR (GLenum, GLenum, GLenum, GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBLENDFUNCSEPARATEINGRPROC) (GLenum sfactorRGB, GLenum dfactorRGB, GLenum sfactorAlpha, GLenum dfactorAlpha);
#endif

#ifndef GL_INGR_color_clamp
#define GL_INGR_color_clamp 1
#endif

#ifndef GL_INGR_interlace_read
#define GL_INGR_interlace_read 1
#endif

#ifndef GL_EXT_stencil_wrap
#define GL_EXT_stencil_wrap 1
#endif

#ifndef GL_EXT_422_pixels
#define GL_EXT_422_pixels 1
#endif

#ifndef GL_NV_texgen_reflection
#define GL_NV_texgen_reflection 1
#endif

#ifndef GL_SUN_convolution_border_modes
#define GL_SUN_convolution_border_modes 1
#endif

#ifndef GL_EXT_texture_env_add
#define GL_EXT_texture_env_add 1
#endif

#ifndef GL_EXT_texture_lod_bias
#define GL_EXT_texture_lod_bias 1
#endif

#ifndef GL_EXT_texture_filter_anisotropic
#define GL_EXT_texture_filter_anisotropic 1
#endif

#ifndef GL_EXT_vertex_weighting
#define GL_EXT_vertex_weighting 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glVertexWeightfEXT (GLfloat);
GLAPI void APIENTRY glVertexWeightfvEXT (const GLfloat *);
GLAPI void APIENTRY glVertexWeightPointerEXT (GLsizei, GLenum, GLsizei, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLVERTEXWEIGHTFEXTPROC) (GLfloat weight);
typedef void (APIENTRYP PFNGLVERTEXWEIGHTFVEXTPROC) (const GLfloat *weight);
typedef void (APIENTRYP PFNGLVERTEXWEIGHTPOINTEREXTPROC) (GLsizei size, GLenum type, GLsizei stride, const GLvoid *pointer);
#endif

#ifndef GL_NV_light_max_exponent
#define GL_NV_light_max_exponent 1
#endif

#ifndef GL_NV_vertex_array_range
#define GL_NV_vertex_array_range 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glFlushVertexArrayRangeNV (void);
GLAPI void APIENTRY glVertexArrayRangeNV (GLsizei, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLFLUSHVERTEXARRAYRANGENVPROC) (void);
typedef void (APIENTRYP PFNGLVERTEXARRAYRANGENVPROC) (GLsizei length, const GLvoid *pointer);
#endif

#ifndef GL_NV_register_combiners
#define GL_NV_register_combiners 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glCombinerParameterfvNV (GLenum, const GLfloat *);
GLAPI void APIENTRY glCombinerParameterfNV (GLenum, GLfloat);
GLAPI void APIENTRY glCombinerParameterivNV (GLenum, const GLint *);
GLAPI void APIENTRY glCombinerParameteriNV (GLenum, GLint);
GLAPI void APIENTRY glCombinerInputNV (GLenum, GLenum, GLenum, GLenum, GLenum, GLenum);
GLAPI void APIENTRY glCombinerOutputNV (GLenum, GLenum, GLenum, GLenum, GLenum, GLenum, GLenum, GLboolean, GLboolean, GLboolean);
GLAPI void APIENTRY glFinalCombinerInputNV (GLenum, GLenum, GLenum, GLenum);
GLAPI void APIENTRY glGetCombinerInputParameterfvNV (GLenum, GLenum, GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetCombinerInputParameterivNV (GLenum, GLenum, GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetCombinerOutputParameterfvNV (GLenum, GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetCombinerOutputParameterivNV (GLenum, GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetFinalCombinerInputParameterfvNV (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetFinalCombinerInputParameterivNV (GLenum, GLenum, GLint *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCOMBINERPARAMETERFVNVPROC) (GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLCOMBINERPARAMETERFNVPROC) (GLenum pname, GLfloat param);
typedef void (APIENTRYP PFNGLCOMBINERPARAMETERIVNVPROC) (GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLCOMBINERPARAMETERINVPROC) (GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLCOMBINERINPUTNVPROC) (GLenum stage, GLenum portion, GLenum variable, GLenum input, GLenum mapping, GLenum componentUsage);
typedef void (APIENTRYP PFNGLCOMBINEROUTPUTNVPROC) (GLenum stage, GLenum portion, GLenum abOutput, GLenum cdOutput, GLenum sumOutput, GLenum scale, GLenum bias, GLboolean abDotProduct, GLboolean cdDotProduct, GLboolean muxSum);
typedef void (APIENTRYP PFNGLFINALCOMBINERINPUTNVPROC) (GLenum variable, GLenum input, GLenum mapping, GLenum componentUsage);
typedef void (APIENTRYP PFNGLGETCOMBINERINPUTPARAMETERFVNVPROC) (GLenum stage, GLenum portion, GLenum variable, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETCOMBINERINPUTPARAMETERIVNVPROC) (GLenum stage, GLenum portion, GLenum variable, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETCOMBINEROUTPUTPARAMETERFVNVPROC) (GLenum stage, GLenum portion, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETCOMBINEROUTPUTPARAMETERIVNVPROC) (GLenum stage, GLenum portion, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETFINALCOMBINERINPUTPARAMETERFVNVPROC) (GLenum variable, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETFINALCOMBINERINPUTPARAMETERIVNVPROC) (GLenum variable, GLenum pname, GLint *params);
#endif

#ifndef GL_NV_fog_distance
#define GL_NV_fog_distance 1
#endif

#ifndef GL_NV_texgen_emboss
#define GL_NV_texgen_emboss 1
#endif

#ifndef GL_NV_blend_square
#define GL_NV_blend_square 1
#endif

#ifndef GL_NV_texture_env_combine4
#define GL_NV_texture_env_combine4 1
#endif

#ifndef GL_MESA_resize_buffers
#define GL_MESA_resize_buffers 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glResizeBuffersMESA (void);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLRESIZEBUFFERSMESAPROC) (void);
#endif

#ifndef GL_MESA_window_pos
#define GL_MESA_window_pos 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glWindowPos2dMESA (GLdouble, GLdouble);
GLAPI void APIENTRY glWindowPos2dvMESA (const GLdouble *);
GLAPI void APIENTRY glWindowPos2fMESA (GLfloat, GLfloat);
GLAPI void APIENTRY glWindowPos2fvMESA (const GLfloat *);
GLAPI void APIENTRY glWindowPos2iMESA (GLint, GLint);
GLAPI void APIENTRY glWindowPos2ivMESA (const GLint *);
GLAPI void APIENTRY glWindowPos2sMESA (GLshort, GLshort);
GLAPI void APIENTRY glWindowPos2svMESA (const GLshort *);
GLAPI void APIENTRY glWindowPos3dMESA (GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glWindowPos3dvMESA (const GLdouble *);
GLAPI void APIENTRY glWindowPos3fMESA (GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glWindowPos3fvMESA (const GLfloat *);
GLAPI void APIENTRY glWindowPos3iMESA (GLint, GLint, GLint);
GLAPI void APIENTRY glWindowPos3ivMESA (const GLint *);
GLAPI void APIENTRY glWindowPos3sMESA (GLshort, GLshort, GLshort);
GLAPI void APIENTRY glWindowPos3svMESA (const GLshort *);
GLAPI void APIENTRY glWindowPos4dMESA (GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glWindowPos4dvMESA (const GLdouble *);
GLAPI void APIENTRY glWindowPos4fMESA (GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glWindowPos4fvMESA (const GLfloat *);
GLAPI void APIENTRY glWindowPos4iMESA (GLint, GLint, GLint, GLint);
GLAPI void APIENTRY glWindowPos4ivMESA (const GLint *);
GLAPI void APIENTRY glWindowPos4sMESA (GLshort, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glWindowPos4svMESA (const GLshort *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLWINDOWPOS2DMESAPROC) (GLdouble x, GLdouble y);
typedef void (APIENTRYP PFNGLWINDOWPOS2DVMESAPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLWINDOWPOS2FMESAPROC) (GLfloat x, GLfloat y);
typedef void (APIENTRYP PFNGLWINDOWPOS2FVMESAPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLWINDOWPOS2IMESAPROC) (GLint x, GLint y);
typedef void (APIENTRYP PFNGLWINDOWPOS2IVMESAPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLWINDOWPOS2SMESAPROC) (GLshort x, GLshort y);
typedef void (APIENTRYP PFNGLWINDOWPOS2SVMESAPROC) (const GLshort *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3DMESAPROC) (GLdouble x, GLdouble y, GLdouble z);
typedef void (APIENTRYP PFNGLWINDOWPOS3DVMESAPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3FMESAPROC) (GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLWINDOWPOS3FVMESAPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3IMESAPROC) (GLint x, GLint y, GLint z);
typedef void (APIENTRYP PFNGLWINDOWPOS3IVMESAPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLWINDOWPOS3SMESAPROC) (GLshort x, GLshort y, GLshort z);
typedef void (APIENTRYP PFNGLWINDOWPOS3SVMESAPROC) (const GLshort *v);
typedef void (APIENTRYP PFNGLWINDOWPOS4DMESAPROC) (GLdouble x, GLdouble y, GLdouble z, GLdouble w);
typedef void (APIENTRYP PFNGLWINDOWPOS4DVMESAPROC) (const GLdouble *v);
typedef void (APIENTRYP PFNGLWINDOWPOS4FMESAPROC) (GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLWINDOWPOS4FVMESAPROC) (const GLfloat *v);
typedef void (APIENTRYP PFNGLWINDOWPOS4IMESAPROC) (GLint x, GLint y, GLint z, GLint w);
typedef void (APIENTRYP PFNGLWINDOWPOS4IVMESAPROC) (const GLint *v);
typedef void (APIENTRYP PFNGLWINDOWPOS4SMESAPROC) (GLshort x, GLshort y, GLshort z, GLshort w);
typedef void (APIENTRYP PFNGLWINDOWPOS4SVMESAPROC) (const GLshort *v);
#endif

#ifndef GL_IBM_cull_vertex
#define GL_IBM_cull_vertex 1
#endif

#ifndef GL_IBM_multimode_draw_arrays
#define GL_IBM_multimode_draw_arrays 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glMultiModeDrawArraysIBM (const GLenum *, const GLint *, const GLsizei *, GLsizei, GLint);
GLAPI void APIENTRY glMultiModeDrawElementsIBM (const GLenum *, const GLsizei *, GLenum, const GLvoid* const *, GLsizei, GLint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLMULTIMODEDRAWARRAYSIBMPROC) (const GLenum *mode, const GLint *first, const GLsizei *count, GLsizei primcount, GLint modestride);
typedef void (APIENTRYP PFNGLMULTIMODEDRAWELEMENTSIBMPROC) (const GLenum *mode, const GLsizei *count, GLenum type, const GLvoid* const *indices, GLsizei primcount, GLint modestride);
#endif

#ifndef GL_IBM_vertex_array_lists
#define GL_IBM_vertex_array_lists 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glColorPointerListIBM (GLint, GLenum, GLint, const GLvoid* *, GLint);
GLAPI void APIENTRY glSecondaryColorPointerListIBM (GLint, GLenum, GLint, const GLvoid* *, GLint);
GLAPI void APIENTRY glEdgeFlagPointerListIBM (GLint, const GLboolean* *, GLint);
GLAPI void APIENTRY glFogCoordPointerListIBM (GLenum, GLint, const GLvoid* *, GLint);
GLAPI void APIENTRY glIndexPointerListIBM (GLenum, GLint, const GLvoid* *, GLint);
GLAPI void APIENTRY glNormalPointerListIBM (GLenum, GLint, const GLvoid* *, GLint);
GLAPI void APIENTRY glTexCoordPointerListIBM (GLint, GLenum, GLint, const GLvoid* *, GLint);
GLAPI void APIENTRY glVertexPointerListIBM (GLint, GLenum, GLint, const GLvoid* *, GLint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCOLORPOINTERLISTIBMPROC) (GLint size, GLenum type, GLint stride, const GLvoid* *pointer, GLint ptrstride);
typedef void (APIENTRYP PFNGLSECONDARYCOLORPOINTERLISTIBMPROC) (GLint size, GLenum type, GLint stride, const GLvoid* *pointer, GLint ptrstride);
typedef void (APIENTRYP PFNGLEDGEFLAGPOINTERLISTIBMPROC) (GLint stride, const GLboolean* *pointer, GLint ptrstride);
typedef void (APIENTRYP PFNGLFOGCOORDPOINTERLISTIBMPROC) (GLenum type, GLint stride, const GLvoid* *pointer, GLint ptrstride);
typedef void (APIENTRYP PFNGLINDEXPOINTERLISTIBMPROC) (GLenum type, GLint stride, const GLvoid* *pointer, GLint ptrstride);
typedef void (APIENTRYP PFNGLNORMALPOINTERLISTIBMPROC) (GLenum type, GLint stride, const GLvoid* *pointer, GLint ptrstride);
typedef void (APIENTRYP PFNGLTEXCOORDPOINTERLISTIBMPROC) (GLint size, GLenum type, GLint stride, const GLvoid* *pointer, GLint ptrstride);
typedef void (APIENTRYP PFNGLVERTEXPOINTERLISTIBMPROC) (GLint size, GLenum type, GLint stride, const GLvoid* *pointer, GLint ptrstride);
#endif

#ifndef GL_SGIX_subsample
#define GL_SGIX_subsample 1
#endif

#ifndef GL_SGIX_ycrcba
#define GL_SGIX_ycrcba 1
#endif

#ifndef GL_SGIX_ycrcb_subsample
#define GL_SGIX_ycrcb_subsample 1
#endif

#ifndef GL_SGIX_depth_pass_instrument
#define GL_SGIX_depth_pass_instrument 1
#endif

#ifndef GL_3DFX_texture_compression_FXT1
#define GL_3DFX_texture_compression_FXT1 1
#endif

#ifndef GL_3DFX_multisample
#define GL_3DFX_multisample 1
#endif

#ifndef GL_3DFX_tbuffer
#define GL_3DFX_tbuffer 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glTbufferMask3DFX (GLuint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLTBUFFERMASK3DFXPROC) (GLuint mask);
#endif

#ifndef GL_EXT_multisample
#define GL_EXT_multisample 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glSampleMaskEXT (GLclampf, GLboolean);
GLAPI void APIENTRY glSamplePatternEXT (GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLSAMPLEMASKEXTPROC) (GLclampf value, GLboolean invert);
typedef void (APIENTRYP PFNGLSAMPLEPATTERNEXTPROC) (GLenum pattern);
#endif

#ifndef GL_SGIX_vertex_preclip
#define GL_SGIX_vertex_preclip 1
#endif

#ifndef GL_SGIX_convolution_accuracy
#define GL_SGIX_convolution_accuracy 1
#endif

#ifndef GL_SGIX_resample
#define GL_SGIX_resample 1
#endif

#ifndef GL_SGIS_point_line_texgen
#define GL_SGIS_point_line_texgen 1
#endif

#ifndef GL_SGIS_texture_color_mask
#define GL_SGIS_texture_color_mask 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glTextureColorMaskSGIS (GLboolean, GLboolean, GLboolean, GLboolean);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLTEXTURECOLORMASKSGISPROC) (GLboolean red, GLboolean green, GLboolean blue, GLboolean alpha);
#endif

#ifndef GL_SGIX_igloo_interface
#define GL_SGIX_igloo_interface 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glIglooInterfaceSGIX (GLenum, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLIGLOOINTERFACESGIXPROC) (GLenum pname, const GLvoid *params);
#endif

#ifndef GL_EXT_texture_env_dot3
#define GL_EXT_texture_env_dot3 1
#endif

#ifndef GL_ATI_texture_mirror_once
#define GL_ATI_texture_mirror_once 1
#endif

#ifndef GL_NV_fence
#define GL_NV_fence 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glDeleteFencesNV (GLsizei, const GLuint *);
GLAPI void APIENTRY glGenFencesNV (GLsizei, GLuint *);
GLAPI GLboolean APIENTRY glIsFenceNV (GLuint);
GLAPI GLboolean APIENTRY glTestFenceNV (GLuint);
GLAPI void APIENTRY glGetFenceivNV (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glFinishFenceNV (GLuint);
GLAPI void APIENTRY glSetFenceNV (GLuint, GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLDELETEFENCESNVPROC) (GLsizei n, const GLuint *fences);
typedef void (APIENTRYP PFNGLGENFENCESNVPROC) (GLsizei n, GLuint *fences);
typedef GLboolean (APIENTRYP PFNGLISFENCENVPROC) (GLuint fence);
typedef GLboolean (APIENTRYP PFNGLTESTFENCENVPROC) (GLuint fence);
typedef void (APIENTRYP PFNGLGETFENCEIVNVPROC) (GLuint fence, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLFINISHFENCENVPROC) (GLuint fence);
typedef void (APIENTRYP PFNGLSETFENCENVPROC) (GLuint fence, GLenum condition);
#endif

#ifndef GL_NV_evaluators
#define GL_NV_evaluators 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glMapControlPointsNV (GLenum, GLuint, GLenum, GLsizei, GLsizei, GLint, GLint, GLboolean, const GLvoid *);
GLAPI void APIENTRY glMapParameterivNV (GLenum, GLenum, const GLint *);
GLAPI void APIENTRY glMapParameterfvNV (GLenum, GLenum, const GLfloat *);
GLAPI void APIENTRY glGetMapControlPointsNV (GLenum, GLuint, GLenum, GLsizei, GLsizei, GLboolean, GLvoid *);
GLAPI void APIENTRY glGetMapParameterivNV (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGetMapParameterfvNV (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetMapAttribParameterivNV (GLenum, GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetMapAttribParameterfvNV (GLenum, GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glEvalMapsNV (GLenum, GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLMAPCONTROLPOINTSNVPROC) (GLenum target, GLuint index, GLenum type, GLsizei ustride, GLsizei vstride, GLint uorder, GLint vorder, GLboolean packed, const GLvoid *points);
typedef void (APIENTRYP PFNGLMAPPARAMETERIVNVPROC) (GLenum target, GLenum pname, const GLint *params);
typedef void (APIENTRYP PFNGLMAPPARAMETERFVNVPROC) (GLenum target, GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLGETMAPCONTROLPOINTSNVPROC) (GLenum target, GLuint index, GLenum type, GLsizei ustride, GLsizei vstride, GLboolean packed, GLvoid *points);
typedef void (APIENTRYP PFNGLGETMAPPARAMETERIVNVPROC) (GLenum target, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETMAPPARAMETERFVNVPROC) (GLenum target, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETMAPATTRIBPARAMETERIVNVPROC) (GLenum target, GLuint index, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETMAPATTRIBPARAMETERFVNVPROC) (GLenum target, GLuint index, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLEVALMAPSNVPROC) (GLenum target, GLenum mode);
#endif

#ifndef GL_NV_packed_depth_stencil
#define GL_NV_packed_depth_stencil 1
#endif

#ifndef GL_NV_register_combiners2
#define GL_NV_register_combiners2 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glCombinerStageParameterfvNV (GLenum, GLenum, const GLfloat *);
GLAPI void APIENTRY glGetCombinerStageParameterfvNV (GLenum, GLenum, GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLCOMBINERSTAGEPARAMETERFVNVPROC) (GLenum stage, GLenum pname, const GLfloat *params);
typedef void (APIENTRYP PFNGLGETCOMBINERSTAGEPARAMETERFVNVPROC) (GLenum stage, GLenum pname, GLfloat *params);
#endif

#ifndef GL_NV_texture_compression_vtc
#define GL_NV_texture_compression_vtc 1
#endif

#ifndef GL_NV_texture_rectangle
#define GL_NV_texture_rectangle 1
#endif

#ifndef GL_NV_texture_shader
#define GL_NV_texture_shader 1
#endif

#ifndef GL_NV_texture_shader2
#define GL_NV_texture_shader2 1
#endif

#ifndef GL_NV_vertex_array_range2
#define GL_NV_vertex_array_range2 1
#endif

#ifndef GL_NV_vertex_program
#define GL_NV_vertex_program 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI GLboolean APIENTRY glAreProgramsResidentNV (GLsizei, const GLuint *, GLboolean *);
GLAPI void APIENTRY glBindProgramNV (GLenum, GLuint);
GLAPI void APIENTRY glDeleteProgramsNV (GLsizei, const GLuint *);
GLAPI void APIENTRY glExecuteProgramNV (GLenum, GLuint, const GLfloat *);
GLAPI void APIENTRY glGenProgramsNV (GLsizei, GLuint *);
GLAPI void APIENTRY glGetProgramParameterdvNV (GLenum, GLuint, GLenum, GLdouble *);
GLAPI void APIENTRY glGetProgramParameterfvNV (GLenum, GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glGetProgramivNV (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetProgramStringNV (GLuint, GLenum, GLubyte *);
GLAPI void APIENTRY glGetTrackMatrixivNV (GLenum, GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetVertexAttribdvNV (GLuint, GLenum, GLdouble *);
GLAPI void APIENTRY glGetVertexAttribfvNV (GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glGetVertexAttribivNV (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetVertexAttribPointervNV (GLuint, GLenum, GLvoid* *);
GLAPI GLboolean APIENTRY glIsProgramNV (GLuint);
GLAPI void APIENTRY glLoadProgramNV (GLenum, GLuint, GLsizei, const GLubyte *);
GLAPI void APIENTRY glProgramParameter4dNV (GLenum, GLuint, GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glProgramParameter4dvNV (GLenum, GLuint, const GLdouble *);
GLAPI void APIENTRY glProgramParameter4fNV (GLenum, GLuint, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glProgramParameter4fvNV (GLenum, GLuint, const GLfloat *);
GLAPI void APIENTRY glProgramParameters4dvNV (GLenum, GLuint, GLuint, const GLdouble *);
GLAPI void APIENTRY glProgramParameters4fvNV (GLenum, GLuint, GLuint, const GLfloat *);
GLAPI void APIENTRY glRequestResidentProgramsNV (GLsizei, const GLuint *);
GLAPI void APIENTRY glTrackMatrixNV (GLenum, GLuint, GLenum, GLenum);
GLAPI void APIENTRY glVertexAttribPointerNV (GLuint, GLint, GLenum, GLsizei, const GLvoid *);
GLAPI void APIENTRY glVertexAttrib1dNV (GLuint, GLdouble);
GLAPI void APIENTRY glVertexAttrib1dvNV (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib1fNV (GLuint, GLfloat);
GLAPI void APIENTRY glVertexAttrib1fvNV (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib1sNV (GLuint, GLshort);
GLAPI void APIENTRY glVertexAttrib1svNV (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib2dNV (GLuint, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexAttrib2dvNV (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib2fNV (GLuint, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexAttrib2fvNV (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib2sNV (GLuint, GLshort, GLshort);
GLAPI void APIENTRY glVertexAttrib2svNV (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib3dNV (GLuint, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexAttrib3dvNV (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib3fNV (GLuint, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexAttrib3fvNV (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib3sNV (GLuint, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glVertexAttrib3svNV (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib4dNV (GLuint, GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexAttrib4dvNV (GLuint, const GLdouble *);
GLAPI void APIENTRY glVertexAttrib4fNV (GLuint, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexAttrib4fvNV (GLuint, const GLfloat *);
GLAPI void APIENTRY glVertexAttrib4sNV (GLuint, GLshort, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glVertexAttrib4svNV (GLuint, const GLshort *);
GLAPI void APIENTRY glVertexAttrib4ubNV (GLuint, GLubyte, GLubyte, GLubyte, GLubyte);
GLAPI void APIENTRY glVertexAttrib4ubvNV (GLuint, const GLubyte *);
GLAPI void APIENTRY glVertexAttribs1dvNV (GLuint, GLsizei, const GLdouble *);
GLAPI void APIENTRY glVertexAttribs1fvNV (GLuint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glVertexAttribs1svNV (GLuint, GLsizei, const GLshort *);
GLAPI void APIENTRY glVertexAttribs2dvNV (GLuint, GLsizei, const GLdouble *);
GLAPI void APIENTRY glVertexAttribs2fvNV (GLuint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glVertexAttribs2svNV (GLuint, GLsizei, const GLshort *);
GLAPI void APIENTRY glVertexAttribs3dvNV (GLuint, GLsizei, const GLdouble *);
GLAPI void APIENTRY glVertexAttribs3fvNV (GLuint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glVertexAttribs3svNV (GLuint, GLsizei, const GLshort *);
GLAPI void APIENTRY glVertexAttribs4dvNV (GLuint, GLsizei, const GLdouble *);
GLAPI void APIENTRY glVertexAttribs4fvNV (GLuint, GLsizei, const GLfloat *);
GLAPI void APIENTRY glVertexAttribs4svNV (GLuint, GLsizei, const GLshort *);
GLAPI void APIENTRY glVertexAttribs4ubvNV (GLuint, GLsizei, const GLubyte *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef GLboolean (APIENTRYP PFNGLAREPROGRAMSRESIDENTNVPROC) (GLsizei n, const GLuint *programs, GLboolean *residences);
typedef void (APIENTRYP PFNGLBINDPROGRAMNVPROC) (GLenum target, GLuint id);
typedef void (APIENTRYP PFNGLDELETEPROGRAMSNVPROC) (GLsizei n, const GLuint *programs);
typedef void (APIENTRYP PFNGLEXECUTEPROGRAMNVPROC) (GLenum target, GLuint id, const GLfloat *params);
typedef void (APIENTRYP PFNGLGENPROGRAMSNVPROC) (GLsizei n, GLuint *programs);
typedef void (APIENTRYP PFNGLGETPROGRAMPARAMETERDVNVPROC) (GLenum target, GLuint index, GLenum pname, GLdouble *params);
typedef void (APIENTRYP PFNGLGETPROGRAMPARAMETERFVNVPROC) (GLenum target, GLuint index, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETPROGRAMIVNVPROC) (GLuint id, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETPROGRAMSTRINGNVPROC) (GLuint id, GLenum pname, GLubyte *program);
typedef void (APIENTRYP PFNGLGETTRACKMATRIXIVNVPROC) (GLenum target, GLuint address, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBDVNVPROC) (GLuint index, GLenum pname, GLdouble *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBFVNVPROC) (GLuint index, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBIVNVPROC) (GLuint index, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBPOINTERVNVPROC) (GLuint index, GLenum pname, GLvoid* *pointer);
typedef GLboolean (APIENTRYP PFNGLISPROGRAMNVPROC) (GLuint id);
typedef void (APIENTRYP PFNGLLOADPROGRAMNVPROC) (GLenum target, GLuint id, GLsizei len, const GLubyte *program);
typedef void (APIENTRYP PFNGLPROGRAMPARAMETER4DNVPROC) (GLenum target, GLuint index, GLdouble x, GLdouble y, GLdouble z, GLdouble w);
typedef void (APIENTRYP PFNGLPROGRAMPARAMETER4DVNVPROC) (GLenum target, GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLPROGRAMPARAMETER4FNVPROC) (GLenum target, GLuint index, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLPROGRAMPARAMETER4FVNVPROC) (GLenum target, GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLPROGRAMPARAMETERS4DVNVPROC) (GLenum target, GLuint index, GLuint count, const GLdouble *v);
typedef void (APIENTRYP PFNGLPROGRAMPARAMETERS4FVNVPROC) (GLenum target, GLuint index, GLuint count, const GLfloat *v);
typedef void (APIENTRYP PFNGLREQUESTRESIDENTPROGRAMSNVPROC) (GLsizei n, const GLuint *programs);
typedef void (APIENTRYP PFNGLTRACKMATRIXNVPROC) (GLenum target, GLuint address, GLenum matrix, GLenum transform);
typedef void (APIENTRYP PFNGLVERTEXATTRIBPOINTERNVPROC) (GLuint index, GLint fsize, GLenum type, GLsizei stride, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1DNVPROC) (GLuint index, GLdouble x);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1DVNVPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1FNVPROC) (GLuint index, GLfloat x);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1FVNVPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1SNVPROC) (GLuint index, GLshort x);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1SVNVPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2DNVPROC) (GLuint index, GLdouble x, GLdouble y);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2DVNVPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2FNVPROC) (GLuint index, GLfloat x, GLfloat y);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2FVNVPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2SNVPROC) (GLuint index, GLshort x, GLshort y);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2SVNVPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3DNVPROC) (GLuint index, GLdouble x, GLdouble y, GLdouble z);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3DVNVPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3FNVPROC) (GLuint index, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3FVNVPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3SNVPROC) (GLuint index, GLshort x, GLshort y, GLshort z);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3SVNVPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4DNVPROC) (GLuint index, GLdouble x, GLdouble y, GLdouble z, GLdouble w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4DVNVPROC) (GLuint index, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4FNVPROC) (GLuint index, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4FVNVPROC) (GLuint index, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4SNVPROC) (GLuint index, GLshort x, GLshort y, GLshort z, GLshort w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4SVNVPROC) (GLuint index, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4UBNVPROC) (GLuint index, GLubyte x, GLubyte y, GLubyte z, GLubyte w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4UBVNVPROC) (GLuint index, const GLubyte *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS1DVNVPROC) (GLuint index, GLsizei count, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS1FVNVPROC) (GLuint index, GLsizei count, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS1SVNVPROC) (GLuint index, GLsizei count, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS2DVNVPROC) (GLuint index, GLsizei count, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS2FVNVPROC) (GLuint index, GLsizei count, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS2SVNVPROC) (GLuint index, GLsizei count, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS3DVNVPROC) (GLuint index, GLsizei count, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS3FVNVPROC) (GLuint index, GLsizei count, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS3SVNVPROC) (GLuint index, GLsizei count, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS4DVNVPROC) (GLuint index, GLsizei count, const GLdouble *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS4FVNVPROC) (GLuint index, GLsizei count, const GLfloat *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS4SVNVPROC) (GLuint index, GLsizei count, const GLshort *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS4UBVNVPROC) (GLuint index, GLsizei count, const GLubyte *v);
#endif

#ifndef GL_SGIX_texture_coordinate_clamp
#define GL_SGIX_texture_coordinate_clamp 1
#endif

#ifndef GL_SGIX_scalebias_hint
#define GL_SGIX_scalebias_hint 1
#endif

#ifndef GL_OML_interlace
#define GL_OML_interlace 1
#endif

#ifndef GL_OML_subsample
#define GL_OML_subsample 1
#endif

#ifndef GL_OML_resample
#define GL_OML_resample 1
#endif

#ifndef GL_NV_copy_depth_to_color
#define GL_NV_copy_depth_to_color 1
#endif

#ifndef GL_ATI_envmap_bumpmap
#define GL_ATI_envmap_bumpmap 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glTexBumpParameterivATI (GLenum, const GLint *);
GLAPI void APIENTRY glTexBumpParameterfvATI (GLenum, const GLfloat *);
GLAPI void APIENTRY glGetTexBumpParameterivATI (GLenum, GLint *);
GLAPI void APIENTRY glGetTexBumpParameterfvATI (GLenum, GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLTEXBUMPPARAMETERIVATIPROC) (GLenum pname, const GLint *param);
typedef void (APIENTRYP PFNGLTEXBUMPPARAMETERFVATIPROC) (GLenum pname, const GLfloat *param);
typedef void (APIENTRYP PFNGLGETTEXBUMPPARAMETERIVATIPROC) (GLenum pname, GLint *param);
typedef void (APIENTRYP PFNGLGETTEXBUMPPARAMETERFVATIPROC) (GLenum pname, GLfloat *param);
#endif

#ifndef GL_ATI_fragment_shader
#define GL_ATI_fragment_shader 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI GLuint APIENTRY glGenFragmentShadersATI (GLuint);
GLAPI void APIENTRY glBindFragmentShaderATI (GLuint);
GLAPI void APIENTRY glDeleteFragmentShaderATI (GLuint);
GLAPI void APIENTRY glBeginFragmentShaderATI (void);
GLAPI void APIENTRY glEndFragmentShaderATI (void);
GLAPI void APIENTRY glPassTexCoordATI (GLuint, GLuint, GLenum);
GLAPI void APIENTRY glSampleMapATI (GLuint, GLuint, GLenum);
GLAPI void APIENTRY glColorFragmentOp1ATI (GLenum, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint);
GLAPI void APIENTRY glColorFragmentOp2ATI (GLenum, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint);
GLAPI void APIENTRY glColorFragmentOp3ATI (GLenum, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint);
GLAPI void APIENTRY glAlphaFragmentOp1ATI (GLenum, GLuint, GLuint, GLuint, GLuint, GLuint);
GLAPI void APIENTRY glAlphaFragmentOp2ATI (GLenum, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint);
GLAPI void APIENTRY glAlphaFragmentOp3ATI (GLenum, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint, GLuint);
GLAPI void APIENTRY glSetFragmentShaderConstantATI (GLuint, const GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef GLuint (APIENTRYP PFNGLGENFRAGMENTSHADERSATIPROC) (GLuint range);
typedef void (APIENTRYP PFNGLBINDFRAGMENTSHADERATIPROC) (GLuint id);
typedef void (APIENTRYP PFNGLDELETEFRAGMENTSHADERATIPROC) (GLuint id);
typedef void (APIENTRYP PFNGLBEGINFRAGMENTSHADERATIPROC) (void);
typedef void (APIENTRYP PFNGLENDFRAGMENTSHADERATIPROC) (void);
typedef void (APIENTRYP PFNGLPASSTEXCOORDATIPROC) (GLuint dst, GLuint coord, GLenum swizzle);
typedef void (APIENTRYP PFNGLSAMPLEMAPATIPROC) (GLuint dst, GLuint interp, GLenum swizzle);
typedef void (APIENTRYP PFNGLCOLORFRAGMENTOP1ATIPROC) (GLenum op, GLuint dst, GLuint dstMask, GLuint dstMod, GLuint arg1, GLuint arg1Rep, GLuint arg1Mod);
typedef void (APIENTRYP PFNGLCOLORFRAGMENTOP2ATIPROC) (GLenum op, GLuint dst, GLuint dstMask, GLuint dstMod, GLuint arg1, GLuint arg1Rep, GLuint arg1Mod, GLuint arg2, GLuint arg2Rep, GLuint arg2Mod);
typedef void (APIENTRYP PFNGLCOLORFRAGMENTOP3ATIPROC) (GLenum op, GLuint dst, GLuint dstMask, GLuint dstMod, GLuint arg1, GLuint arg1Rep, GLuint arg1Mod, GLuint arg2, GLuint arg2Rep, GLuint arg2Mod, GLuint arg3, GLuint arg3Rep, GLuint arg3Mod);
typedef void (APIENTRYP PFNGLALPHAFRAGMENTOP1ATIPROC) (GLenum op, GLuint dst, GLuint dstMod, GLuint arg1, GLuint arg1Rep, GLuint arg1Mod);
typedef void (APIENTRYP PFNGLALPHAFRAGMENTOP2ATIPROC) (GLenum op, GLuint dst, GLuint dstMod, GLuint arg1, GLuint arg1Rep, GLuint arg1Mod, GLuint arg2, GLuint arg2Rep, GLuint arg2Mod);
typedef void (APIENTRYP PFNGLALPHAFRAGMENTOP3ATIPROC) (GLenum op, GLuint dst, GLuint dstMod, GLuint arg1, GLuint arg1Rep, GLuint arg1Mod, GLuint arg2, GLuint arg2Rep, GLuint arg2Mod, GLuint arg3, GLuint arg3Rep, GLuint arg3Mod);
typedef void (APIENTRYP PFNGLSETFRAGMENTSHADERCONSTANTATIPROC) (GLuint dst, const GLfloat *value);
#endif

#ifndef GL_ATI_pn_triangles
#define GL_ATI_pn_triangles 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPNTrianglesiATI (GLenum, GLint);
GLAPI void APIENTRY glPNTrianglesfATI (GLenum, GLfloat);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPNTRIANGLESIATIPROC) (GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLPNTRIANGLESFATIPROC) (GLenum pname, GLfloat param);
#endif

#ifndef GL_ATI_vertex_array_object
#define GL_ATI_vertex_array_object 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI GLuint APIENTRY glNewObjectBufferATI (GLsizei, const GLvoid *, GLenum);
GLAPI GLboolean APIENTRY glIsObjectBufferATI (GLuint);
GLAPI void APIENTRY glUpdateObjectBufferATI (GLuint, GLuint, GLsizei, const GLvoid *, GLenum);
GLAPI void APIENTRY glGetObjectBufferfvATI (GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glGetObjectBufferivATI (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glFreeObjectBufferATI (GLuint);
GLAPI void APIENTRY glArrayObjectATI (GLenum, GLint, GLenum, GLsizei, GLuint, GLuint);
GLAPI void APIENTRY glGetArrayObjectfvATI (GLenum, GLenum, GLfloat *);
GLAPI void APIENTRY glGetArrayObjectivATI (GLenum, GLenum, GLint *);
GLAPI void APIENTRY glVariantArrayObjectATI (GLuint, GLenum, GLsizei, GLuint, GLuint);
GLAPI void APIENTRY glGetVariantArrayObjectfvATI (GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glGetVariantArrayObjectivATI (GLuint, GLenum, GLint *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef GLuint (APIENTRYP PFNGLNEWOBJECTBUFFERATIPROC) (GLsizei size, const GLvoid *pointer, GLenum usage);
typedef GLboolean (APIENTRYP PFNGLISOBJECTBUFFERATIPROC) (GLuint buffer);
typedef void (APIENTRYP PFNGLUPDATEOBJECTBUFFERATIPROC) (GLuint buffer, GLuint offset, GLsizei size, const GLvoid *pointer, GLenum preserve);
typedef void (APIENTRYP PFNGLGETOBJECTBUFFERFVATIPROC) (GLuint buffer, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETOBJECTBUFFERIVATIPROC) (GLuint buffer, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLFREEOBJECTBUFFERATIPROC) (GLuint buffer);
typedef void (APIENTRYP PFNGLARRAYOBJECTATIPROC) (GLenum array, GLint size, GLenum type, GLsizei stride, GLuint buffer, GLuint offset);
typedef void (APIENTRYP PFNGLGETARRAYOBJECTFVATIPROC) (GLenum array, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETARRAYOBJECTIVATIPROC) (GLenum array, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLVARIANTARRAYOBJECTATIPROC) (GLuint id, GLenum type, GLsizei stride, GLuint buffer, GLuint offset);
typedef void (APIENTRYP PFNGLGETVARIANTARRAYOBJECTFVATIPROC) (GLuint id, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETVARIANTARRAYOBJECTIVATIPROC) (GLuint id, GLenum pname, GLint *params);
#endif

#ifndef GL_EXT_vertex_shader
#define GL_EXT_vertex_shader 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBeginVertexShaderEXT (void);
GLAPI void APIENTRY glEndVertexShaderEXT (void);
GLAPI void APIENTRY glBindVertexShaderEXT (GLuint);
GLAPI GLuint APIENTRY glGenVertexShadersEXT (GLuint);
GLAPI void APIENTRY glDeleteVertexShaderEXT (GLuint);
GLAPI void APIENTRY glShaderOp1EXT (GLenum, GLuint, GLuint);
GLAPI void APIENTRY glShaderOp2EXT (GLenum, GLuint, GLuint, GLuint);
GLAPI void APIENTRY glShaderOp3EXT (GLenum, GLuint, GLuint, GLuint, GLuint);
GLAPI void APIENTRY glSwizzleEXT (GLuint, GLuint, GLenum, GLenum, GLenum, GLenum);
GLAPI void APIENTRY glWriteMaskEXT (GLuint, GLuint, GLenum, GLenum, GLenum, GLenum);
GLAPI void APIENTRY glInsertComponentEXT (GLuint, GLuint, GLuint);
GLAPI void APIENTRY glExtractComponentEXT (GLuint, GLuint, GLuint);
GLAPI GLuint APIENTRY glGenSymbolsEXT (GLenum, GLenum, GLenum, GLuint);
GLAPI void APIENTRY glSetInvariantEXT (GLuint, GLenum, const GLvoid *);
GLAPI void APIENTRY glSetLocalConstantEXT (GLuint, GLenum, const GLvoid *);
GLAPI void APIENTRY glVariantbvEXT (GLuint, const GLbyte *);
GLAPI void APIENTRY glVariantsvEXT (GLuint, const GLshort *);
GLAPI void APIENTRY glVariantivEXT (GLuint, const GLint *);
GLAPI void APIENTRY glVariantfvEXT (GLuint, const GLfloat *);
GLAPI void APIENTRY glVariantdvEXT (GLuint, const GLdouble *);
GLAPI void APIENTRY glVariantubvEXT (GLuint, const GLubyte *);
GLAPI void APIENTRY glVariantusvEXT (GLuint, const GLushort *);
GLAPI void APIENTRY glVariantuivEXT (GLuint, const GLuint *);
GLAPI void APIENTRY glVariantPointerEXT (GLuint, GLenum, GLuint, const GLvoid *);
GLAPI void APIENTRY glEnableVariantClientStateEXT (GLuint);
GLAPI void APIENTRY glDisableVariantClientStateEXT (GLuint);
GLAPI GLuint APIENTRY glBindLightParameterEXT (GLenum, GLenum);
GLAPI GLuint APIENTRY glBindMaterialParameterEXT (GLenum, GLenum);
GLAPI GLuint APIENTRY glBindTexGenParameterEXT (GLenum, GLenum, GLenum);
GLAPI GLuint APIENTRY glBindTextureUnitParameterEXT (GLenum, GLenum);
GLAPI GLuint APIENTRY glBindParameterEXT (GLenum);
GLAPI GLboolean APIENTRY glIsVariantEnabledEXT (GLuint, GLenum);
GLAPI void APIENTRY glGetVariantBooleanvEXT (GLuint, GLenum, GLboolean *);
GLAPI void APIENTRY glGetVariantIntegervEXT (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetVariantFloatvEXT (GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glGetVariantPointervEXT (GLuint, GLenum, GLvoid* *);
GLAPI void APIENTRY glGetInvariantBooleanvEXT (GLuint, GLenum, GLboolean *);
GLAPI void APIENTRY glGetInvariantIntegervEXT (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetInvariantFloatvEXT (GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glGetLocalConstantBooleanvEXT (GLuint, GLenum, GLboolean *);
GLAPI void APIENTRY glGetLocalConstantIntegervEXT (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetLocalConstantFloatvEXT (GLuint, GLenum, GLfloat *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBEGINVERTEXSHADEREXTPROC) (void);
typedef void (APIENTRYP PFNGLENDVERTEXSHADEREXTPROC) (void);
typedef void (APIENTRYP PFNGLBINDVERTEXSHADEREXTPROC) (GLuint id);
typedef GLuint (APIENTRYP PFNGLGENVERTEXSHADERSEXTPROC) (GLuint range);
typedef void (APIENTRYP PFNGLDELETEVERTEXSHADEREXTPROC) (GLuint id);
typedef void (APIENTRYP PFNGLSHADEROP1EXTPROC) (GLenum op, GLuint res, GLuint arg1);
typedef void (APIENTRYP PFNGLSHADEROP2EXTPROC) (GLenum op, GLuint res, GLuint arg1, GLuint arg2);
typedef void (APIENTRYP PFNGLSHADEROP3EXTPROC) (GLenum op, GLuint res, GLuint arg1, GLuint arg2, GLuint arg3);
typedef void (APIENTRYP PFNGLSWIZZLEEXTPROC) (GLuint res, GLuint in, GLenum outX, GLenum outY, GLenum outZ, GLenum outW);
typedef void (APIENTRYP PFNGLWRITEMASKEXTPROC) (GLuint res, GLuint in, GLenum outX, GLenum outY, GLenum outZ, GLenum outW);
typedef void (APIENTRYP PFNGLINSERTCOMPONENTEXTPROC) (GLuint res, GLuint src, GLuint num);
typedef void (APIENTRYP PFNGLEXTRACTCOMPONENTEXTPROC) (GLuint res, GLuint src, GLuint num);
typedef GLuint (APIENTRYP PFNGLGENSYMBOLSEXTPROC) (GLenum datatype, GLenum storagetype, GLenum range, GLuint components);
typedef void (APIENTRYP PFNGLSETINVARIANTEXTPROC) (GLuint id, GLenum type, const GLvoid *addr);
typedef void (APIENTRYP PFNGLSETLOCALCONSTANTEXTPROC) (GLuint id, GLenum type, const GLvoid *addr);
typedef void (APIENTRYP PFNGLVARIANTBVEXTPROC) (GLuint id, const GLbyte *addr);
typedef void (APIENTRYP PFNGLVARIANTSVEXTPROC) (GLuint id, const GLshort *addr);
typedef void (APIENTRYP PFNGLVARIANTIVEXTPROC) (GLuint id, const GLint *addr);
typedef void (APIENTRYP PFNGLVARIANTFVEXTPROC) (GLuint id, const GLfloat *addr);
typedef void (APIENTRYP PFNGLVARIANTDVEXTPROC) (GLuint id, const GLdouble *addr);
typedef void (APIENTRYP PFNGLVARIANTUBVEXTPROC) (GLuint id, const GLubyte *addr);
typedef void (APIENTRYP PFNGLVARIANTUSVEXTPROC) (GLuint id, const GLushort *addr);
typedef void (APIENTRYP PFNGLVARIANTUIVEXTPROC) (GLuint id, const GLuint *addr);
typedef void (APIENTRYP PFNGLVARIANTPOINTEREXTPROC) (GLuint id, GLenum type, GLuint stride, const GLvoid *addr);
typedef void (APIENTRYP PFNGLENABLEVARIANTCLIENTSTATEEXTPROC) (GLuint id);
typedef void (APIENTRYP PFNGLDISABLEVARIANTCLIENTSTATEEXTPROC) (GLuint id);
typedef GLuint (APIENTRYP PFNGLBINDLIGHTPARAMETEREXTPROC) (GLenum light, GLenum value);
typedef GLuint (APIENTRYP PFNGLBINDMATERIALPARAMETEREXTPROC) (GLenum face, GLenum value);
typedef GLuint (APIENTRYP PFNGLBINDTEXGENPARAMETEREXTPROC) (GLenum unit, GLenum coord, GLenum value);
typedef GLuint (APIENTRYP PFNGLBINDTEXTUREUNITPARAMETEREXTPROC) (GLenum unit, GLenum value);
typedef GLuint (APIENTRYP PFNGLBINDPARAMETEREXTPROC) (GLenum value);
typedef GLboolean (APIENTRYP PFNGLISVARIANTENABLEDEXTPROC) (GLuint id, GLenum cap);
typedef void (APIENTRYP PFNGLGETVARIANTBOOLEANVEXTPROC) (GLuint id, GLenum value, GLboolean *data);
typedef void (APIENTRYP PFNGLGETVARIANTINTEGERVEXTPROC) (GLuint id, GLenum value, GLint *data);
typedef void (APIENTRYP PFNGLGETVARIANTFLOATVEXTPROC) (GLuint id, GLenum value, GLfloat *data);
typedef void (APIENTRYP PFNGLGETVARIANTPOINTERVEXTPROC) (GLuint id, GLenum value, GLvoid* *data);
typedef void (APIENTRYP PFNGLGETINVARIANTBOOLEANVEXTPROC) (GLuint id, GLenum value, GLboolean *data);
typedef void (APIENTRYP PFNGLGETINVARIANTINTEGERVEXTPROC) (GLuint id, GLenum value, GLint *data);
typedef void (APIENTRYP PFNGLGETINVARIANTFLOATVEXTPROC) (GLuint id, GLenum value, GLfloat *data);
typedef void (APIENTRYP PFNGLGETLOCALCONSTANTBOOLEANVEXTPROC) (GLuint id, GLenum value, GLboolean *data);
typedef void (APIENTRYP PFNGLGETLOCALCONSTANTINTEGERVEXTPROC) (GLuint id, GLenum value, GLint *data);
typedef void (APIENTRYP PFNGLGETLOCALCONSTANTFLOATVEXTPROC) (GLuint id, GLenum value, GLfloat *data);
#endif

#ifndef GL_ATI_vertex_streams
#define GL_ATI_vertex_streams 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glVertexStream1sATI (GLenum, GLshort);
GLAPI void APIENTRY glVertexStream1svATI (GLenum, const GLshort *);
GLAPI void APIENTRY glVertexStream1iATI (GLenum, GLint);
GLAPI void APIENTRY glVertexStream1ivATI (GLenum, const GLint *);
GLAPI void APIENTRY glVertexStream1fATI (GLenum, GLfloat);
GLAPI void APIENTRY glVertexStream1fvATI (GLenum, const GLfloat *);
GLAPI void APIENTRY glVertexStream1dATI (GLenum, GLdouble);
GLAPI void APIENTRY glVertexStream1dvATI (GLenum, const GLdouble *);
GLAPI void APIENTRY glVertexStream2sATI (GLenum, GLshort, GLshort);
GLAPI void APIENTRY glVertexStream2svATI (GLenum, const GLshort *);
GLAPI void APIENTRY glVertexStream2iATI (GLenum, GLint, GLint);
GLAPI void APIENTRY glVertexStream2ivATI (GLenum, const GLint *);
GLAPI void APIENTRY glVertexStream2fATI (GLenum, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexStream2fvATI (GLenum, const GLfloat *);
GLAPI void APIENTRY glVertexStream2dATI (GLenum, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexStream2dvATI (GLenum, const GLdouble *);
GLAPI void APIENTRY glVertexStream3sATI (GLenum, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glVertexStream3svATI (GLenum, const GLshort *);
GLAPI void APIENTRY glVertexStream3iATI (GLenum, GLint, GLint, GLint);
GLAPI void APIENTRY glVertexStream3ivATI (GLenum, const GLint *);
GLAPI void APIENTRY glVertexStream3fATI (GLenum, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexStream3fvATI (GLenum, const GLfloat *);
GLAPI void APIENTRY glVertexStream3dATI (GLenum, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexStream3dvATI (GLenum, const GLdouble *);
GLAPI void APIENTRY glVertexStream4sATI (GLenum, GLshort, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glVertexStream4svATI (GLenum, const GLshort *);
GLAPI void APIENTRY glVertexStream4iATI (GLenum, GLint, GLint, GLint, GLint);
GLAPI void APIENTRY glVertexStream4ivATI (GLenum, const GLint *);
GLAPI void APIENTRY glVertexStream4fATI (GLenum, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glVertexStream4fvATI (GLenum, const GLfloat *);
GLAPI void APIENTRY glVertexStream4dATI (GLenum, GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glVertexStream4dvATI (GLenum, const GLdouble *);
GLAPI void APIENTRY glNormalStream3bATI (GLenum, GLbyte, GLbyte, GLbyte);
GLAPI void APIENTRY glNormalStream3bvATI (GLenum, const GLbyte *);
GLAPI void APIENTRY glNormalStream3sATI (GLenum, GLshort, GLshort, GLshort);
GLAPI void APIENTRY glNormalStream3svATI (GLenum, const GLshort *);
GLAPI void APIENTRY glNormalStream3iATI (GLenum, GLint, GLint, GLint);
GLAPI void APIENTRY glNormalStream3ivATI (GLenum, const GLint *);
GLAPI void APIENTRY glNormalStream3fATI (GLenum, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glNormalStream3fvATI (GLenum, const GLfloat *);
GLAPI void APIENTRY glNormalStream3dATI (GLenum, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glNormalStream3dvATI (GLenum, const GLdouble *);
GLAPI void APIENTRY glClientActiveVertexStreamATI (GLenum);
GLAPI void APIENTRY glVertexBlendEnviATI (GLenum, GLint);
GLAPI void APIENTRY glVertexBlendEnvfATI (GLenum, GLfloat);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLVERTEXSTREAM1SATIPROC) (GLenum stream, GLshort x);
typedef void (APIENTRYP PFNGLVERTEXSTREAM1SVATIPROC) (GLenum stream, const GLshort *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM1IATIPROC) (GLenum stream, GLint x);
typedef void (APIENTRYP PFNGLVERTEXSTREAM1IVATIPROC) (GLenum stream, const GLint *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM1FATIPROC) (GLenum stream, GLfloat x);
typedef void (APIENTRYP PFNGLVERTEXSTREAM1FVATIPROC) (GLenum stream, const GLfloat *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM1DATIPROC) (GLenum stream, GLdouble x);
typedef void (APIENTRYP PFNGLVERTEXSTREAM1DVATIPROC) (GLenum stream, const GLdouble *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM2SATIPROC) (GLenum stream, GLshort x, GLshort y);
typedef void (APIENTRYP PFNGLVERTEXSTREAM2SVATIPROC) (GLenum stream, const GLshort *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM2IATIPROC) (GLenum stream, GLint x, GLint y);
typedef void (APIENTRYP PFNGLVERTEXSTREAM2IVATIPROC) (GLenum stream, const GLint *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM2FATIPROC) (GLenum stream, GLfloat x, GLfloat y);
typedef void (APIENTRYP PFNGLVERTEXSTREAM2FVATIPROC) (GLenum stream, const GLfloat *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM2DATIPROC) (GLenum stream, GLdouble x, GLdouble y);
typedef void (APIENTRYP PFNGLVERTEXSTREAM2DVATIPROC) (GLenum stream, const GLdouble *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM3SATIPROC) (GLenum stream, GLshort x, GLshort y, GLshort z);
typedef void (APIENTRYP PFNGLVERTEXSTREAM3SVATIPROC) (GLenum stream, const GLshort *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM3IATIPROC) (GLenum stream, GLint x, GLint y, GLint z);
typedef void (APIENTRYP PFNGLVERTEXSTREAM3IVATIPROC) (GLenum stream, const GLint *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM3FATIPROC) (GLenum stream, GLfloat x, GLfloat y, GLfloat z);
typedef void (APIENTRYP PFNGLVERTEXSTREAM3FVATIPROC) (GLenum stream, const GLfloat *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM3DATIPROC) (GLenum stream, GLdouble x, GLdouble y, GLdouble z);
typedef void (APIENTRYP PFNGLVERTEXSTREAM3DVATIPROC) (GLenum stream, const GLdouble *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM4SATIPROC) (GLenum stream, GLshort x, GLshort y, GLshort z, GLshort w);
typedef void (APIENTRYP PFNGLVERTEXSTREAM4SVATIPROC) (GLenum stream, const GLshort *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM4IATIPROC) (GLenum stream, GLint x, GLint y, GLint z, GLint w);
typedef void (APIENTRYP PFNGLVERTEXSTREAM4IVATIPROC) (GLenum stream, const GLint *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM4FATIPROC) (GLenum stream, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLVERTEXSTREAM4FVATIPROC) (GLenum stream, const GLfloat *coords);
typedef void (APIENTRYP PFNGLVERTEXSTREAM4DATIPROC) (GLenum stream, GLdouble x, GLdouble y, GLdouble z, GLdouble w);
typedef void (APIENTRYP PFNGLVERTEXSTREAM4DVATIPROC) (GLenum stream, const GLdouble *coords);
typedef void (APIENTRYP PFNGLNORMALSTREAM3BATIPROC) (GLenum stream, GLbyte nx, GLbyte ny, GLbyte nz);
typedef void (APIENTRYP PFNGLNORMALSTREAM3BVATIPROC) (GLenum stream, const GLbyte *coords);
typedef void (APIENTRYP PFNGLNORMALSTREAM3SATIPROC) (GLenum stream, GLshort nx, GLshort ny, GLshort nz);
typedef void (APIENTRYP PFNGLNORMALSTREAM3SVATIPROC) (GLenum stream, const GLshort *coords);
typedef void (APIENTRYP PFNGLNORMALSTREAM3IATIPROC) (GLenum stream, GLint nx, GLint ny, GLint nz);
typedef void (APIENTRYP PFNGLNORMALSTREAM3IVATIPROC) (GLenum stream, const GLint *coords);
typedef void (APIENTRYP PFNGLNORMALSTREAM3FATIPROC) (GLenum stream, GLfloat nx, GLfloat ny, GLfloat nz);
typedef void (APIENTRYP PFNGLNORMALSTREAM3FVATIPROC) (GLenum stream, const GLfloat *coords);
typedef void (APIENTRYP PFNGLNORMALSTREAM3DATIPROC) (GLenum stream, GLdouble nx, GLdouble ny, GLdouble nz);
typedef void (APIENTRYP PFNGLNORMALSTREAM3DVATIPROC) (GLenum stream, const GLdouble *coords);
typedef void (APIENTRYP PFNGLCLIENTACTIVEVERTEXSTREAMATIPROC) (GLenum stream);
typedef void (APIENTRYP PFNGLVERTEXBLENDENVIATIPROC) (GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLVERTEXBLENDENVFATIPROC) (GLenum pname, GLfloat param);
#endif

#ifndef GL_ATI_element_array
#define GL_ATI_element_array 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glElementPointerATI (GLenum, const GLvoid *);
GLAPI void APIENTRY glDrawElementArrayATI (GLenum, GLsizei);
GLAPI void APIENTRY glDrawRangeElementArrayATI (GLenum, GLuint, GLuint, GLsizei);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLELEMENTPOINTERATIPROC) (GLenum type, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLDRAWELEMENTARRAYATIPROC) (GLenum mode, GLsizei count);
typedef void (APIENTRYP PFNGLDRAWRANGEELEMENTARRAYATIPROC) (GLenum mode, GLuint start, GLuint end, GLsizei count);
#endif

#ifndef GL_SUN_mesh_array
#define GL_SUN_mesh_array 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glDrawMeshArraysSUN (GLenum, GLint, GLsizei, GLsizei);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLDRAWMESHARRAYSSUNPROC) (GLenum mode, GLint first, GLsizei count, GLsizei width);
#endif

#ifndef GL_SUN_slice_accum
#define GL_SUN_slice_accum 1
#endif

#ifndef GL_NV_multisample_filter_hint
#define GL_NV_multisample_filter_hint 1
#endif

#ifndef GL_NV_depth_clamp
#define GL_NV_depth_clamp 1
#endif

#ifndef GL_NV_occlusion_query
#define GL_NV_occlusion_query 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glGenOcclusionQueriesNV (GLsizei, GLuint *);
GLAPI void APIENTRY glDeleteOcclusionQueriesNV (GLsizei, const GLuint *);
GLAPI GLboolean APIENTRY glIsOcclusionQueryNV (GLuint);
GLAPI void APIENTRY glBeginOcclusionQueryNV (GLuint);
GLAPI void APIENTRY glEndOcclusionQueryNV (void);
GLAPI void APIENTRY glGetOcclusionQueryivNV (GLuint, GLenum, GLint *);
GLAPI void APIENTRY glGetOcclusionQueryuivNV (GLuint, GLenum, GLuint *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLGENOCCLUSIONQUERIESNVPROC) (GLsizei n, GLuint *ids);
typedef void (APIENTRYP PFNGLDELETEOCCLUSIONQUERIESNVPROC) (GLsizei n, const GLuint *ids);
typedef GLboolean (APIENTRYP PFNGLISOCCLUSIONQUERYNVPROC) (GLuint id);
typedef void (APIENTRYP PFNGLBEGINOCCLUSIONQUERYNVPROC) (GLuint id);
typedef void (APIENTRYP PFNGLENDOCCLUSIONQUERYNVPROC) (void);
typedef void (APIENTRYP PFNGLGETOCCLUSIONQUERYIVNVPROC) (GLuint id, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGETOCCLUSIONQUERYUIVNVPROC) (GLuint id, GLenum pname, GLuint *params);
#endif

#ifndef GL_NV_point_sprite
#define GL_NV_point_sprite 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPointParameteriNV (GLenum, GLint);
GLAPI void APIENTRY glPointParameterivNV (GLenum, const GLint *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPOINTPARAMETERINVPROC) (GLenum pname, GLint param);
typedef void (APIENTRYP PFNGLPOINTPARAMETERIVNVPROC) (GLenum pname, const GLint *params);
#endif

#ifndef GL_NV_texture_shader3
#define GL_NV_texture_shader3 1
#endif

#ifndef GL_NV_vertex_program1_1
#define GL_NV_vertex_program1_1 1
#endif

#ifndef GL_EXT_shadow_funcs
#define GL_EXT_shadow_funcs 1
#endif

#ifndef GL_EXT_stencil_two_side
#define GL_EXT_stencil_two_side 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glActiveStencilFaceEXT (GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLACTIVESTENCILFACEEXTPROC) (GLenum face);
#endif

#ifndef GL_ATI_text_fragment_shader
#define GL_ATI_text_fragment_shader 1
#endif

#ifndef GL_APPLE_client_storage
#define GL_APPLE_client_storage 1
#endif

#ifndef GL_APPLE_element_array
#define GL_APPLE_element_array 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glElementPointerAPPLE (GLenum, const GLvoid *);
GLAPI void APIENTRY glDrawElementArrayAPPLE (GLenum, GLint, GLsizei);
GLAPI void APIENTRY glDrawRangeElementArrayAPPLE (GLenum, GLuint, GLuint, GLint, GLsizei);
GLAPI void APIENTRY glMultiDrawElementArrayAPPLE (GLenum, const GLint *, const GLsizei *, GLsizei);
GLAPI void APIENTRY glMultiDrawRangeElementArrayAPPLE (GLenum, GLuint, GLuint, const GLint *, const GLsizei *, GLsizei);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLELEMENTPOINTERAPPLEPROC) (GLenum type, const GLvoid *pointer);
typedef void (APIENTRYP PFNGLDRAWELEMENTARRAYAPPLEPROC) (GLenum mode, GLint first, GLsizei count);
typedef void (APIENTRYP PFNGLDRAWRANGEELEMENTARRAYAPPLEPROC) (GLenum mode, GLuint start, GLuint end, GLint first, GLsizei count);
typedef void (APIENTRYP PFNGLMULTIDRAWELEMENTARRAYAPPLEPROC) (GLenum mode, const GLint *first, const GLsizei *count, GLsizei primcount);
typedef void (APIENTRYP PFNGLMULTIDRAWRANGEELEMENTARRAYAPPLEPROC) (GLenum mode, GLuint start, GLuint end, const GLint *first, const GLsizei *count, GLsizei primcount);
#endif

#ifndef GL_APPLE_fence
#define GL_APPLE_fence 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glGenFencesAPPLE (GLsizei, GLuint *);
GLAPI void APIENTRY glDeleteFencesAPPLE (GLsizei, const GLuint *);
GLAPI void APIENTRY glSetFenceAPPLE (GLuint);
GLAPI GLboolean APIENTRY glIsFenceAPPLE (GLuint);
GLAPI GLboolean APIENTRY glTestFenceAPPLE (GLuint);
GLAPI void APIENTRY glFinishFenceAPPLE (GLuint);
GLAPI GLboolean APIENTRY glTestObjectAPPLE (GLenum, GLuint);
GLAPI void APIENTRY glFinishObjectAPPLE (GLenum, GLint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLGENFENCESAPPLEPROC) (GLsizei n, GLuint *fences);
typedef void (APIENTRYP PFNGLDELETEFENCESAPPLEPROC) (GLsizei n, const GLuint *fences);
typedef void (APIENTRYP PFNGLSETFENCEAPPLEPROC) (GLuint fence);
typedef GLboolean (APIENTRYP PFNGLISFENCEAPPLEPROC) (GLuint fence);
typedef GLboolean (APIENTRYP PFNGLTESTFENCEAPPLEPROC) (GLuint fence);
typedef void (APIENTRYP PFNGLFINISHFENCEAPPLEPROC) (GLuint fence);
typedef GLboolean (APIENTRYP PFNGLTESTOBJECTAPPLEPROC) (GLenum object, GLuint name);
typedef void (APIENTRYP PFNGLFINISHOBJECTAPPLEPROC) (GLenum object, GLint name);
#endif

#ifndef GL_APPLE_vertex_array_object
#define GL_APPLE_vertex_array_object 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBindVertexArrayAPPLE (GLuint);
GLAPI void APIENTRY glDeleteVertexArraysAPPLE (GLsizei, const GLuint *);
GLAPI void APIENTRY glGenVertexArraysAPPLE (GLsizei, const GLuint *);
GLAPI GLboolean APIENTRY glIsVertexArrayAPPLE (GLuint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBINDVERTEXARRAYAPPLEPROC) (GLuint array);
typedef void (APIENTRYP PFNGLDELETEVERTEXARRAYSAPPLEPROC) (GLsizei n, const GLuint *arrays);
typedef void (APIENTRYP PFNGLGENVERTEXARRAYSAPPLEPROC) (GLsizei n, const GLuint *arrays);
typedef GLboolean (APIENTRYP PFNGLISVERTEXARRAYAPPLEPROC) (GLuint array);
#endif

#ifndef GL_APPLE_vertex_array_range
#define GL_APPLE_vertex_array_range 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glVertexArrayRangeAPPLE (GLsizei, GLvoid *);
GLAPI void APIENTRY glFlushVertexArrayRangeAPPLE (GLsizei, GLvoid *);
GLAPI void APIENTRY glVertexArrayParameteriAPPLE (GLenum, GLint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLVERTEXARRAYRANGEAPPLEPROC) (GLsizei length, GLvoid *pointer);
typedef void (APIENTRYP PFNGLFLUSHVERTEXARRAYRANGEAPPLEPROC) (GLsizei length, GLvoid *pointer);
typedef void (APIENTRYP PFNGLVERTEXARRAYPARAMETERIAPPLEPROC) (GLenum pname, GLint param);
#endif

#ifndef GL_APPLE_ycbcr_422
#define GL_APPLE_ycbcr_422 1
#endif

#ifndef GL_S3_s3tc
#define GL_S3_s3tc 1
#endif

#ifndef GL_ATI_draw_buffers
#define GL_ATI_draw_buffers 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glDrawBuffersATI (GLsizei, const GLenum *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLDRAWBUFFERSATIPROC) (GLsizei n, const GLenum *bufs);
#endif

#ifndef GL_ATI_pixel_format_float
#define GL_ATI_pixel_format_float 1
/* This is really a WGL extension, but defines some associated GL enums.
 * ATI does not export "GL_ATI_pixel_format_float" in the GL_EXTENSIONS string.
 */
#endif

#ifndef GL_ATI_texture_env_combine3
#define GL_ATI_texture_env_combine3 1
#endif

#ifndef GL_ATI_texture_float
#define GL_ATI_texture_float 1
#endif

#ifndef GL_NV_float_buffer
#define GL_NV_float_buffer 1
#endif

#ifndef GL_NV_fragment_program
#define GL_NV_fragment_program 1
/* Some NV_fragment_program entry points are shared with ARB_vertex_program. */
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glProgramNamedParameter4fNV (GLuint, GLsizei, const GLubyte *, GLfloat, GLfloat, GLfloat, GLfloat);
GLAPI void APIENTRY glProgramNamedParameter4dNV (GLuint, GLsizei, const GLubyte *, GLdouble, GLdouble, GLdouble, GLdouble);
GLAPI void APIENTRY glProgramNamedParameter4fvNV (GLuint, GLsizei, const GLubyte *, const GLfloat *);
GLAPI void APIENTRY glProgramNamedParameter4dvNV (GLuint, GLsizei, const GLubyte *, const GLdouble *);
GLAPI void APIENTRY glGetProgramNamedParameterfvNV (GLuint, GLsizei, const GLubyte *, GLfloat *);
GLAPI void APIENTRY glGetProgramNamedParameterdvNV (GLuint, GLsizei, const GLubyte *, GLdouble *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPROGRAMNAMEDPARAMETER4FNVPROC) (GLuint id, GLsizei len, const GLubyte *name, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
typedef void (APIENTRYP PFNGLPROGRAMNAMEDPARAMETER4DNVPROC) (GLuint id, GLsizei len, const GLubyte *name, GLdouble x, GLdouble y, GLdouble z, GLdouble w);
typedef void (APIENTRYP PFNGLPROGRAMNAMEDPARAMETER4FVNVPROC) (GLuint id, GLsizei len, const GLubyte *name, const GLfloat *v);
typedef void (APIENTRYP PFNGLPROGRAMNAMEDPARAMETER4DVNVPROC) (GLuint id, GLsizei len, const GLubyte *name, const GLdouble *v);
typedef void (APIENTRYP PFNGLGETPROGRAMNAMEDPARAMETERFVNVPROC) (GLuint id, GLsizei len, const GLubyte *name, GLfloat *params);
typedef void (APIENTRYP PFNGLGETPROGRAMNAMEDPARAMETERDVNVPROC) (GLuint id, GLsizei len, const GLubyte *name, GLdouble *params);
#endif

#ifndef GL_NV_half_float
#define GL_NV_half_float 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glVertex2hNV (GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glVertex2hvNV (const GLhalfNV *);
GLAPI void APIENTRY glVertex3hNV (GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glVertex3hvNV (const GLhalfNV *);
GLAPI void APIENTRY glVertex4hNV (GLhalfNV, GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glVertex4hvNV (const GLhalfNV *);
GLAPI void APIENTRY glNormal3hNV (GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glNormal3hvNV (const GLhalfNV *);
GLAPI void APIENTRY glColor3hNV (GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glColor3hvNV (const GLhalfNV *);
GLAPI void APIENTRY glColor4hNV (GLhalfNV, GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glColor4hvNV (const GLhalfNV *);
GLAPI void APIENTRY glTexCoord1hNV (GLhalfNV);
GLAPI void APIENTRY glTexCoord1hvNV (const GLhalfNV *);
GLAPI void APIENTRY glTexCoord2hNV (GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glTexCoord2hvNV (const GLhalfNV *);
GLAPI void APIENTRY glTexCoord3hNV (GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glTexCoord3hvNV (const GLhalfNV *);
GLAPI void APIENTRY glTexCoord4hNV (GLhalfNV, GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glTexCoord4hvNV (const GLhalfNV *);
GLAPI void APIENTRY glMultiTexCoord1hNV (GLenum, GLhalfNV);
GLAPI void APIENTRY glMultiTexCoord1hvNV (GLenum, const GLhalfNV *);
GLAPI void APIENTRY glMultiTexCoord2hNV (GLenum, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glMultiTexCoord2hvNV (GLenum, const GLhalfNV *);
GLAPI void APIENTRY glMultiTexCoord3hNV (GLenum, GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glMultiTexCoord3hvNV (GLenum, const GLhalfNV *);
GLAPI void APIENTRY glMultiTexCoord4hNV (GLenum, GLhalfNV, GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glMultiTexCoord4hvNV (GLenum, const GLhalfNV *);
GLAPI void APIENTRY glFogCoordhNV (GLhalfNV);
GLAPI void APIENTRY glFogCoordhvNV (const GLhalfNV *);
GLAPI void APIENTRY glSecondaryColor3hNV (GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glSecondaryColor3hvNV (const GLhalfNV *);
GLAPI void APIENTRY glVertexWeighthNV (GLhalfNV);
GLAPI void APIENTRY glVertexWeighthvNV (const GLhalfNV *);
GLAPI void APIENTRY glVertexAttrib1hNV (GLuint, GLhalfNV);
GLAPI void APIENTRY glVertexAttrib1hvNV (GLuint, const GLhalfNV *);
GLAPI void APIENTRY glVertexAttrib2hNV (GLuint, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glVertexAttrib2hvNV (GLuint, const GLhalfNV *);
GLAPI void APIENTRY glVertexAttrib3hNV (GLuint, GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glVertexAttrib3hvNV (GLuint, const GLhalfNV *);
GLAPI void APIENTRY glVertexAttrib4hNV (GLuint, GLhalfNV, GLhalfNV, GLhalfNV, GLhalfNV);
GLAPI void APIENTRY glVertexAttrib4hvNV (GLuint, const GLhalfNV *);
GLAPI void APIENTRY glVertexAttribs1hvNV (GLuint, GLsizei, const GLhalfNV *);
GLAPI void APIENTRY glVertexAttribs2hvNV (GLuint, GLsizei, const GLhalfNV *);
GLAPI void APIENTRY glVertexAttribs3hvNV (GLuint, GLsizei, const GLhalfNV *);
GLAPI void APIENTRY glVertexAttribs4hvNV (GLuint, GLsizei, const GLhalfNV *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLVERTEX2HNVPROC) (GLhalfNV x, GLhalfNV y);
typedef void (APIENTRYP PFNGLVERTEX2HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLVERTEX3HNVPROC) (GLhalfNV x, GLhalfNV y, GLhalfNV z);
typedef void (APIENTRYP PFNGLVERTEX3HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLVERTEX4HNVPROC) (GLhalfNV x, GLhalfNV y, GLhalfNV z, GLhalfNV w);
typedef void (APIENTRYP PFNGLVERTEX4HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLNORMAL3HNVPROC) (GLhalfNV nx, GLhalfNV ny, GLhalfNV nz);
typedef void (APIENTRYP PFNGLNORMAL3HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLCOLOR3HNVPROC) (GLhalfNV red, GLhalfNV green, GLhalfNV blue);
typedef void (APIENTRYP PFNGLCOLOR3HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLCOLOR4HNVPROC) (GLhalfNV red, GLhalfNV green, GLhalfNV blue, GLhalfNV alpha);
typedef void (APIENTRYP PFNGLCOLOR4HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLTEXCOORD1HNVPROC) (GLhalfNV s);
typedef void (APIENTRYP PFNGLTEXCOORD1HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLTEXCOORD2HNVPROC) (GLhalfNV s, GLhalfNV t);
typedef void (APIENTRYP PFNGLTEXCOORD2HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLTEXCOORD3HNVPROC) (GLhalfNV s, GLhalfNV t, GLhalfNV r);
typedef void (APIENTRYP PFNGLTEXCOORD3HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLTEXCOORD4HNVPROC) (GLhalfNV s, GLhalfNV t, GLhalfNV r, GLhalfNV q);
typedef void (APIENTRYP PFNGLTEXCOORD4HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1HNVPROC) (GLenum target, GLhalfNV s);
typedef void (APIENTRYP PFNGLMULTITEXCOORD1HVNVPROC) (GLenum target, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2HNVPROC) (GLenum target, GLhalfNV s, GLhalfNV t);
typedef void (APIENTRYP PFNGLMULTITEXCOORD2HVNVPROC) (GLenum target, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3HNVPROC) (GLenum target, GLhalfNV s, GLhalfNV t, GLhalfNV r);
typedef void (APIENTRYP PFNGLMULTITEXCOORD3HVNVPROC) (GLenum target, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4HNVPROC) (GLenum target, GLhalfNV s, GLhalfNV t, GLhalfNV r, GLhalfNV q);
typedef void (APIENTRYP PFNGLMULTITEXCOORD4HVNVPROC) (GLenum target, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLFOGCOORDHNVPROC) (GLhalfNV fog);
typedef void (APIENTRYP PFNGLFOGCOORDHVNVPROC) (const GLhalfNV *fog);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3HNVPROC) (GLhalfNV red, GLhalfNV green, GLhalfNV blue);
typedef void (APIENTRYP PFNGLSECONDARYCOLOR3HVNVPROC) (const GLhalfNV *v);
typedef void (APIENTRYP PFNGLVERTEXWEIGHTHNVPROC) (GLhalfNV weight);
typedef void (APIENTRYP PFNGLVERTEXWEIGHTHVNVPROC) (const GLhalfNV *weight);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1HNVPROC) (GLuint index, GLhalfNV x);
typedef void (APIENTRYP PFNGLVERTEXATTRIB1HVNVPROC) (GLuint index, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2HNVPROC) (GLuint index, GLhalfNV x, GLhalfNV y);
typedef void (APIENTRYP PFNGLVERTEXATTRIB2HVNVPROC) (GLuint index, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3HNVPROC) (GLuint index, GLhalfNV x, GLhalfNV y, GLhalfNV z);
typedef void (APIENTRYP PFNGLVERTEXATTRIB3HVNVPROC) (GLuint index, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4HNVPROC) (GLuint index, GLhalfNV x, GLhalfNV y, GLhalfNV z, GLhalfNV w);
typedef void (APIENTRYP PFNGLVERTEXATTRIB4HVNVPROC) (GLuint index, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS1HVNVPROC) (GLuint index, GLsizei n, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS2HVNVPROC) (GLuint index, GLsizei n, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS3HVNVPROC) (GLuint index, GLsizei n, const GLhalfNV *v);
typedef void (APIENTRYP PFNGLVERTEXATTRIBS4HVNVPROC) (GLuint index, GLsizei n, const GLhalfNV *v);
#endif

#ifndef GL_NV_pixel_data_range
#define GL_NV_pixel_data_range 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPixelDataRangeNV (GLenum, GLsizei, GLvoid *);
GLAPI void APIENTRY glFlushPixelDataRangeNV (GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPIXELDATARANGENVPROC) (GLenum target, GLsizei length, GLvoid *pointer);
typedef void (APIENTRYP PFNGLFLUSHPIXELDATARANGENVPROC) (GLenum target);
#endif

#ifndef GL_NV_primitive_restart
#define GL_NV_primitive_restart 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glPrimitiveRestartNV (void);
GLAPI void APIENTRY glPrimitiveRestartIndexNV (GLuint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLPRIMITIVERESTARTNVPROC) (void);
typedef void (APIENTRYP PFNGLPRIMITIVERESTARTINDEXNVPROC) (GLuint index);
#endif

#ifndef GL_NV_texture_expand_normal
#define GL_NV_texture_expand_normal 1
#endif

#ifndef GL_NV_vertex_program2
#define GL_NV_vertex_program2 1
#endif

#ifndef GL_ATI_map_object_buffer
#define GL_ATI_map_object_buffer 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI GLvoid* APIENTRY glMapObjectBufferATI (GLuint);
GLAPI void APIENTRY glUnmapObjectBufferATI (GLuint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef GLvoid* (APIENTRYP PFNGLMAPOBJECTBUFFERATIPROC) (GLuint buffer);
typedef void (APIENTRYP PFNGLUNMAPOBJECTBUFFERATIPROC) (GLuint buffer);
#endif

#ifndef GL_ATI_separate_stencil
#define GL_ATI_separate_stencil 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glStencilOpSeparateATI (GLenum, GLenum, GLenum, GLenum);
GLAPI void APIENTRY glStencilFuncSeparateATI (GLenum, GLenum, GLint, GLuint);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLSTENCILOPSEPARATEATIPROC) (GLenum face, GLenum sfail, GLenum dpfail, GLenum dppass);
typedef void (APIENTRYP PFNGLSTENCILFUNCSEPARATEATIPROC) (GLenum frontfunc, GLenum backfunc, GLint ref, GLuint mask);
#endif

#ifndef GL_ATI_vertex_attrib_array_object
#define GL_ATI_vertex_attrib_array_object 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glVertexAttribArrayObjectATI (GLuint, GLint, GLenum, GLboolean, GLsizei, GLuint, GLuint);
GLAPI void APIENTRY glGetVertexAttribArrayObjectfvATI (GLuint, GLenum, GLfloat *);
GLAPI void APIENTRY glGetVertexAttribArrayObjectivATI (GLuint, GLenum, GLint *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLVERTEXATTRIBARRAYOBJECTATIPROC) (GLuint index, GLint size, GLenum type, GLboolean normalized, GLsizei stride, GLuint buffer, GLuint offset);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBARRAYOBJECTFVATIPROC) (GLuint index, GLenum pname, GLfloat *params);
typedef void (APIENTRYP PFNGLGETVERTEXATTRIBARRAYOBJECTIVATIPROC) (GLuint index, GLenum pname, GLint *params);
#endif

#ifndef GL_OES_read_format
#define GL_OES_read_format 1
#endif

#ifndef GL_EXT_depth_bounds_test
#define GL_EXT_depth_bounds_test 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glDepthBoundsEXT (GLclampd, GLclampd);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLDEPTHBOUNDSEXTPROC) (GLclampd zmin, GLclampd zmax);
#endif

#ifndef GL_EXT_texture_mirror_clamp
#define GL_EXT_texture_mirror_clamp 1
#endif

#ifndef GL_EXT_blend_equation_separate
#define GL_EXT_blend_equation_separate 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glBlendEquationSeparateEXT (GLenum, GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLBLENDEQUATIONSEPARATEEXTPROC) (GLenum modeRGB, GLenum modeAlpha);
#endif

#ifndef GL_MESA_pack_invert
#define GL_MESA_pack_invert 1
#endif

#ifndef GL_MESA_ycbcr_texture
#define GL_MESA_ycbcr_texture 1
#endif

#ifndef GL_EXT_pixel_buffer_object
#define GL_EXT_pixel_buffer_object 1
#endif

#ifndef GL_NV_fragment_program_option
#define GL_NV_fragment_program_option 1
#endif

#ifndef GL_NV_fragment_program2
#define GL_NV_fragment_program2 1
#endif

#ifndef GL_NV_vertex_program2_option
#define GL_NV_vertex_program2_option 1
#endif

#ifndef GL_NV_vertex_program3
#define GL_NV_vertex_program3 1
#endif

#ifndef GL_EXT_framebuffer_object
#define GL_EXT_framebuffer_object 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI GLboolean APIENTRY glIsRenderbufferEXT (GLuint);
GLAPI void APIENTRY glBindRenderbufferEXT (GLenum, GLuint);
GLAPI void APIENTRY glDeleteRenderbuffersEXT (GLsizei, const GLuint *);
GLAPI void APIENTRY glGenRenderbuffersEXT (GLsizei, GLuint *);
GLAPI void APIENTRY glRenderbufferStorageEXT (GLenum, GLenum, GLsizei, GLsizei);
GLAPI void APIENTRY glGetRenderbufferParameterivEXT (GLenum, GLenum, GLint *);
GLAPI GLboolean APIENTRY glIsFramebufferEXT (GLuint);
GLAPI void APIENTRY glBindFramebufferEXT (GLenum, GLuint);
GLAPI void APIENTRY glDeleteFramebuffersEXT (GLsizei, const GLuint *);
GLAPI void APIENTRY glGenFramebuffersEXT (GLsizei, GLuint *);
GLAPI GLenum APIENTRY glCheckFramebufferStatusEXT (GLenum);
GLAPI void APIENTRY glFramebufferTexture1DEXT (GLenum, GLenum, GLenum, GLuint, GLint);
GLAPI void APIENTRY glFramebufferTexture2DEXT (GLenum, GLenum, GLenum, GLuint, GLint);
GLAPI void APIENTRY glFramebufferTexture3DEXT (GLenum, GLenum, GLenum, GLuint, GLint, GLint);
GLAPI void APIENTRY glFramebufferRenderbufferEXT (GLenum, GLenum, GLenum, GLuint);
GLAPI void APIENTRY glGetFramebufferAttachmentParameterivEXT (GLenum, GLenum, GLenum, GLint *);
GLAPI void APIENTRY glGenerateMipmapEXT (GLenum);
#endif /* GL_GLEXT_PROTOTYPES */
typedef GLboolean (APIENTRYP PFNGLISRENDERBUFFEREXTPROC) (GLuint renderbuffer);
typedef void (APIENTRYP PFNGLBINDRENDERBUFFEREXTPROC) (GLenum target, GLuint renderbuffer);
typedef void (APIENTRYP PFNGLDELETERENDERBUFFERSEXTPROC) (GLsizei n, const GLuint *renderbuffers);
typedef void (APIENTRYP PFNGLGENRENDERBUFFERSEXTPROC) (GLsizei n, GLuint *renderbuffers);
typedef void (APIENTRYP PFNGLRENDERBUFFERSTORAGEEXTPROC) (GLenum target, GLenum internalformat, GLsizei width, GLsizei height);
typedef void (APIENTRYP PFNGLGETRENDERBUFFERPARAMETERIVEXTPROC) (GLenum target, GLenum pname, GLint *params);
typedef GLboolean (APIENTRYP PFNGLISFRAMEBUFFEREXTPROC) (GLuint framebuffer);
typedef void (APIENTRYP PFNGLBINDFRAMEBUFFEREXTPROC) (GLenum target, GLuint framebuffer);
typedef void (APIENTRYP PFNGLDELETEFRAMEBUFFERSEXTPROC) (GLsizei n, const GLuint *framebuffers);
typedef void (APIENTRYP PFNGLGENFRAMEBUFFERSEXTPROC) (GLsizei n, GLuint *framebuffers);
typedef GLenum (APIENTRYP PFNGLCHECKFRAMEBUFFERSTATUSEXTPROC) (GLenum target);
typedef void (APIENTRYP PFNGLFRAMEBUFFERTEXTURE1DEXTPROC) (GLenum target, GLenum attachment, GLenum textarget, GLuint texture, GLint level);
typedef void (APIENTRYP PFNGLFRAMEBUFFERTEXTURE2DEXTPROC) (GLenum target, GLenum attachment, GLenum textarget, GLuint texture, GLint level);
typedef void (APIENTRYP PFNGLFRAMEBUFFERTEXTURE3DEXTPROC) (GLenum target, GLenum attachment, GLenum textarget, GLuint texture, GLint level, GLint zoffset);
typedef void (APIENTRYP PFNGLFRAMEBUFFERRENDERBUFFEREXTPROC) (GLenum target, GLenum attachment, GLenum renderbuffertarget, GLuint renderbuffer);
typedef void (APIENTRYP PFNGLGETFRAMEBUFFERATTACHMENTPARAMETERIVEXTPROC) (GLenum target, GLenum attachment, GLenum pname, GLint *params);
typedef void (APIENTRYP PFNGLGENERATEMIPMAPEXTPROC) (GLenum target);
#endif

#ifndef GL_GREMEDY_string_marker
#define GL_GREMEDY_string_marker 1
#ifdef GL_GLEXT_PROTOTYPES
GLAPI void APIENTRY glStringMarkerGREMEDY (GLsizei, const GLvoid *);
#endif /* GL_GLEXT_PROTOTYPES */
typedef void (APIENTRYP PFNGLSTRINGMARKERGREMEDYPROC) (GLsizei len, const GLvoid *string);
#endif


#ifdef __cplusplus
}
#endif

#endif
#endif /* NO_SDL_GLEXT */
