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

#include "CCamera.h"

CGlobalCamera::CGlobalCamera(D3DXVECTOR3 eye, D3DXVECTOR3 centre, D3DXVECTOR3 up) : CCamera()
{
	m_fAngleH = 0.0f;
	m_fAngleV = 0.0f;

	m_fDistance = 5.0f;
	
	this->m_vEye = eye;
	this->m_vCentre = centre;
	this->m_vUp = up;

	D3DXMatrixLookAtLH(&this->m_mView, &this->m_vEye, &this->m_vCentre, &this->m_vUp);
	D3DXMatrixPerspectiveFovLH(&this->m_mProj, D3DX_PI / 4.0f, 4.0f/3.0f, 0.1f, 1000.0f);
}

void CGlobalCamera::Move()
{
	if( this->m_fAngleV >= 89.0f ) this->m_fAngleV = 89.0f;
	if( this->m_fAngleV <= -89.0f ) this->m_fAngleV = -89.0f;
	this->m_vEye.x = this->m_fDistance * cosf(this->m_fAngleH * D3DX_PI / 180.0f) * cosf(this->m_fAngleV * D3DX_PI / 180.0f);
	this->m_vEye.y = this->m_fDistance * sinf(this->m_fAngleV * D3DX_PI / 180.0f);
	this->m_vEye.z = this->m_fDistance * sinf(this->m_fAngleH * D3DX_PI / 180.0f) * cosf(this->m_fAngleV * D3DX_PI / 180.0f);
	D3DXMatrixLookAtLH(&this->m_mView, &this->m_vEye, &this->m_vCentre, &this->m_vUp);
}
