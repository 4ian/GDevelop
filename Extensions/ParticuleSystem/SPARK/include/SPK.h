//////////////////////////////////////////////////////////////////////////////////
// SPARK particle engine														//
// Copyright (C) 2008-2009 - Julien Fryer - julienfryer@gmail.com				//
//																				//
// This software is provided 'as-is', without any express or implied			//
// warranty.  In no event will the authors be held liable for any damages		//
// arising from the use of this software.										//
//																				//
// Permission is granted to anyone to use this software for any purpose,		//
// including commercial applications, and to alter it and redistribute it		//
// freely, subject to the following restrictions:								//
//																				//
// 1. The origin of this software must not be misrepresented; you must not		//
//    claim that you wrote the original software. If you use this software		//
//    in a product, an acknowledgment in the product documentation would be		//
//    appreciated but is not required.											//
// 2. Altered source versions must be plainly marked as such, and must not be	//
//    misrepresented as being the original software.							//
// 3. This notice may not be removed or altered from any source distribution.	//
//////////////////////////////////////////////////////////////////////////////////

#ifndef H_SPK
#define H_SPK

// Defines
#include "Core/SPK_DEF.h"

// Core
#include "Core/SPK_Vector3D.h"
#include "Core/SPK_Buffer.h" // 1.03
#include "Core/SPK_ArrayBuffer.h" // 1.03
#include "Core/SPK_Registerable.h" // 1.03
#include "Core/SPK_Transformable.h" // 1.03
#include "Core/SPK_BufferHandler.h" // 1.04
#include "Core/SPK_RegWrapper.h" // 1.03
#include "Core/SPK_Renderer.h"
#include "Core/SPK_System.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Pool.h"
#include "Core/SPK_Zone.h"
#include "Core/SPK_Interpolator.h" // 1.05
#include "Core/SPK_Model.h"
#include "Core/SPK_Emitter.h"
#include "Core/SPK_Modifier.h"
#include "Core/SPK_Group.h"
#include "Core/SPK_Factory.h" // 1.03

// Zones
#include "Extensions/Zones/SPK_AABox.h"
#include "Extensions/Zones/SPK_Point.h"
#include "Extensions/Zones/SPK_Sphere.h"
#include "Extensions/Zones/SPK_Plane.h"
#include "Extensions/Zones/SPK_Line.h" // 1.01
#include "Extensions/Zones/SPK_Ring.h" // 1.05

// Emitters
#include "Extensions/Emitters/SPK_StraightEmitter.h"
#include "Extensions/Emitters/SPK_SphericEmitter.h"
#include "Extensions/Emitters/SPK_NormalEmitter.h" // 1.02
#include "Extensions/Emitters/SPK_RandomEmitter.h" // 1.02
#include "Extensions/Emitters/SPK_StaticEmitter.h" // 1.05

// Modifiers
#include "Extensions/Modifiers/SPK_Obstacle.h"
#include "Extensions/Modifiers/SPK_Destroyer.h"
#include "Extensions/Modifiers/SPK_PointMass.h"
#include "Extensions/Modifiers/SPK_ModifierGroup.h" // 1.02
#include "Extensions/Modifiers/SPK_LinearForce.h" // 1.03
#include "Extensions/Modifiers/SPK_Collision.h" // 1.04
#include "Extensions/Modifiers/SPK_Vortex.h" // 1.05
#include "Extensions/Modifiers/SPK_Rotator.h" // 1.05

// Renderer Interfaces
#include "Extensions/Renderers/SPK_PointRendererInterface.h" // 1.04
#include "Extensions/Renderers/SPK_LineRendererInterface.h" // 1.04
#include "Extensions/Renderers/SPK_Oriented3DRendererInterface.h" // 1.04

#endif
