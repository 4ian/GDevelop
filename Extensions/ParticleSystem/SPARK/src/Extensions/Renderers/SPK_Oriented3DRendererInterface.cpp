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

#include "Extensions/Renderers/SPK_Oriented3DRendererInterface.h"

namespace SPK
{
	Oriented3DRendererInterface::Oriented3DRendererInterface() :
		lookOrientation(LOOK_CAMERA_PLANE),
		upOrientation(UP_CAMERA),
		lockedAxis(LOCK_UP)
	{
		lookVector.set(0.0f,0.0f,1.0f);
		upVector.set(0.0f,1.0f,0.0f);
	}

	void Oriented3DRendererInterface::setOrientation(LookOrientation lookOrientation,UpOrientation upOrientation,LockedAxis lockedAxis)
	{
		this->lookOrientation = lookOrientation;
		this->upOrientation = upOrientation;
		this->lockedAxis = lockedAxis;
	}

	void Oriented3DRendererInterface::setOrientation(OrientationPreset orientation)
	{
		this->lookOrientation = static_cast<LookOrientation>((orientation >> 0x8) & 0xFF);
		this->upOrientation = static_cast<UpOrientation>(orientation & 0xFF);
		this->lockedAxis = static_cast<LockedAxis>((orientation >> 0x10) & 0xFF);
	}
}
