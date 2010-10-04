//////////////////////////////////////////////////////////////////////////////////
// SPARK particle engine														//
// Copyright (C) 2009 - foulon matthieu - stardeath@wanadoo.fr					//
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

#pragma once

#include <d3d9.h>
#include <d3dx9.h>

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Camera. classe de base pour la gestion des caméras</summary>
///
////////////////////////////////////////////////////////////////////////////////////////////////////

class CCamera
{
public:
	D3DXMATRIX m_mView;
	D3DXMATRIX m_mProj;

	CCamera(){}
	virtual void Move() = 0;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Global camera. caméra regardant à l'origine du monde, sa position se trouvant sur une sphère</summary>
///
////////////////////////////////////////////////////////////////////////////////////////////////////

class CGlobalCamera : public CCamera
{
public:
	float m_fAngleH;
	float m_fAngleV;

	float m_fDistance;

	D3DXVECTOR3 m_vEye;
	D3DXVECTOR3 m_vCentre;
	D3DXVECTOR3 m_vUp;

	CGlobalCamera(D3DXVECTOR3 eye = D3DXVECTOR3(3.0f, 3.0f, 3.0f), D3DXVECTOR3 centre = D3DXVECTOR3(0.0f, 0.0f, 0.0f), D3DXVECTOR3 up = D3DXVECTOR3(0.0f, 1.0f, 0.0f));

	virtual void Move();
};
