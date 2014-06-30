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


//////////////////////////////////////////////////////////////////////////////////
// Note :																		//
//																				//
// This file is used to speed up the compilation of a module, lower the size	//
// of the output library on certain compilers and allow deeper optimizations	//
// by reunifying all compilation units into one (single compilation unit		//
// method).																		//
//																				//
// Either only this file or all the files below should be compiled, not both or	//
// some 'multiple definition of symbols' errors will occur.						//
//////////////////////////////////////////////////////////////////////////////////


// Core
#include "Core/SPK_DEF.cpp"
#include "Core/SPK_Vector3D.cpp"
#include "Core/SPK_Registerable.cpp" // 1.03
#include "Core/SPK_Transformable.cpp" // 1.03
#include "Core/SPK_BufferHandler.cpp" // 1.04
#include "Core/SPK_Renderer.cpp"
#include "Core/SPK_System.cpp"
#include "Core/SPK_Particle.cpp"
#include "Core/SPK_Zone.cpp"
#include "Core/SPK_Interpolator.cpp" // 1.05
#include "Core/SPK_Model.cpp"
#include "Core/SPK_Emitter.cpp"
#include "Core/SPK_Modifier.cpp"
#include "Core/SPK_Group.cpp"
#include "Core/SPK_Factory.cpp" // 1.03

// Zones
#include "Extensions/Zones/SPK_AABox.cpp"
#include "Extensions/Zones/SPK_Point.cpp"
#include "Extensions/Zones/SPK_Sphere.cpp"
#include "Extensions/Zones/SPK_Plane.cpp"
#include "Extensions/Zones/SPK_Line.cpp" // 1.01
#include "Extensions/Zones/SPK_Ring.cpp" // 1.05
#include "Extensions/Zones/SPK_Cylinder.cpp"

// Emitters
#include "Extensions/Emitters/SPK_StraightEmitter.cpp"
#include "Extensions/Emitters/SPK_SphericEmitter.cpp"
#include "Extensions/Emitters/SPK_NormalEmitter.cpp" // 1.02
#include "Extensions/Emitters/SPK_RandomEmitter.cpp" // 1.02

// Modifiers
#include "Extensions/Modifiers/SPK_Obstacle.cpp"
#include "Extensions/Modifiers/SPK_Destroyer.cpp"
#include "Extensions/Modifiers/SPK_PointMass.cpp"
#include "Extensions/Modifiers/SPK_ModifierGroup.cpp" // 1.02
#include "Extensions/Modifiers/SPK_LinearForce.cpp" // 1.03
#include "Extensions/Modifiers/SPK_Collision.cpp" // 1.04
#include "Extensions/Modifiers/SPK_Vortex.cpp" // 1.05

// Renderer Interfaces
#include "Extensions/Renderers/SPK_QuadRendererInterface.cpp" // 1.04
#include "Extensions/Renderers/SPK_Oriented3DRendererInterface.cpp" // 1.04
