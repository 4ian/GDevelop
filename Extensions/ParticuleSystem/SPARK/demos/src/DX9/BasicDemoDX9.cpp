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

#define USE_SPARK

#define _CRTDBG_MAP_ALLOC
#include <crtdbg.h>

#include <cmath>
#include <iostream>
#include <sstream>
#include <string>
#include <ctime>

#include <windows.h>
#include <windowsx.h>
#include <d3d9.h>
#include <d3dx9.h>

#pragma comment(lib, "d3d9.lib")
#pragma comment(lib, "d3dx9.lib")
#pragma comment(lib, "dxerr.lib")
#pragma comment(lib, "winmm.lib")
#pragma comment(lib, "comctl32.lib")

#include "CTimer.h"
CTimer g_timerDemo;

#include "CCamera.h"
CGlobalCamera *g_pCamera;

#ifndef SAFE_DELETE
#define SAFE_DELETE(p)       { if (p) { delete (p);     (p)=NULL; } }
#endif    
#ifndef SAFE_DELETE_ARRAY
#define SAFE_DELETE_ARRAY(p) { if (p) { delete[] (p);   (p)=NULL; } }
#endif    
#ifndef SAFE_RELEASE
#define SAFE_RELEASE(p)      { if (p) { (p)->Release(); (p)=NULL; } }
#endif

//#define new new(_CLIENT_BLOCK,__FILE__,__LINE__)

#ifdef USE_SPARK
// SPARK lib
#include <SPK.h>
//#define new new(_CLIENT_BLOCK,__FILE__,__LINE__)
#include <SPK_DX9.h>
#endif // USE_SPARK

using namespace std;

#ifdef USE_SPARK
using namespace SPK;
using namespace SPK::DX9;
#endif // USE_SPARK


float step = 0.0f;

#ifdef USE_SPARK
SPK::System* particleSystem = NULL;
SPK::Group* particleGroup = NULL;
SPK::Model* particleModel = NULL;

//*
SPK::DX9::DX9PointRenderer* basicRenderer = NULL;
SPK::DX9::DX9PointRenderer* pointRenderer = NULL;
SPK::DX9::DX9QuadRenderer* quadRenderer = NULL;
//*/

SphericEmitter *particleEmitter = NULL;
Obstacle* groundObstacle = NULL;
#endif // USE_SPARK

const string STR_NB_PARTICLES = "NB PARTICLES : ";
const string STR_FPS = "FPS : ";

string strNbParticles = STR_NB_PARTICLES;
string strFps = STR_FPS;

int screenWidth;
int screenHeight;
float screenRatio;

int drawText = 2;

HWND g_hWnd;
HINSTANCE g_hInst;
int g_iLargeur, g_iHauteur;
LPDIRECT3D9 g_pD3D;
LPDIRECT3DDEVICE9 g_pD3DDevice;
D3DPRESENT_PARAMETERS g_D3Dpp;

LPD3DXMESH g_pMesh;

D3DLIGHT9 g_light;

HRESULT hr;

POINT g_ptSourisPosition;
bool g_bSourisDroite;

LPDIRECT3DTEXTURE9 textureParticle = NULL;

// renderValue :
// 0 : points sprite
// 1 : quad
// 2 : basic render
// 3 : no render
unsigned int renderValue = 0;

void Init();
void UnInit();

LRESULT CALLBACK MsgProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

HRESULT CreateWnd(HINSTANCE hInst, int largeur, int hauteur)
{	
	g_hInst = hInst;
	g_iLargeur = largeur;
	g_iHauteur = hauteur;
	
	WNDCLASSEX wc;// = {sizeof(WNDCLASSEX), CS_CLASSDC, MsgProc, 0L, 0L, hInst, NULL, NULL, NULL, "test", NULL};

	wc.lpszClassName = L"SPARKDemoBasicDX9"; // The name of our new window class
    wc.cbSize        = sizeof(WNDCLASSEX); // Specifies the size, in bytes, of this structure
    wc.style         = CS_CLASSDC;//*/CS_HREDRAW | CS_VREDRAW; // Specifies the class style(s)
    wc.lpfnWndProc   = MsgProc; // The name of our call back function
    wc.hInstance     = g_hInst;  // Instance of this application
    wc.hIcon         = LoadIcon(NULL, IDI_APPLICATION); // Don't set any icons
    wc.hIconSm       = LoadIcon(NULL, IDI_APPLICATION); // We'll use the defaults
    wc.hCursor       = LoadCursor(NULL, IDC_ARROW); // Use the standard arrow cursor
    wc.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH); // Fill client-area with black
    wc.lpszMenuName  = NULL; // Our application has no menu
    wc.cbClsExtra    = 0; // Specifies the number of extra bytes to allocate following the window-class structure
    wc.cbWndExtra    = 0; // Specifies the number of extra bytes to allocate following the window instance
	
	if( !RegisterClassEx(&wc) ) return E_FAIL;

	g_hWnd = CreateWindow(L"SPARKDemoBasicDX9", L"SPARK Demo Basic DX9", WS_OVERLAPPEDWINDOW | WS_VISIBLE, 0, 0, g_iLargeur, g_iHauteur, NULL, NULL, g_hInst, NULL);
	
	if( g_hWnd == NULL ) return E_FAIL;

	ShowWindow(g_hWnd, SW_SHOW);

	UpdateWindow(g_hWnd);

    return S_OK;
}

HRESULT InitDX(int largeur, int hauteur, bool bPleinEcran)
{
	g_pD3D = Direct3DCreate9( D3D_SDK_VERSION );

	if( g_pD3D == NULL )
	{
		// TO DO: Respond to failure of Direct3DCreate9
		return E_FAIL;
	}

    D3DDISPLAYMODE d3ddm;

    if( FAILED( g_pD3D->GetAdapterDisplayMode( D3DADAPTER_DEFAULT, &d3ddm ) ) )
	{
		// TO DO: Respond to failure of GetAdapterDisplayMode
		return E_FAIL;
	}

	HRESULT hr;

	D3DDEVTYPE DeviceType = D3DDEVTYPE_HAL;
	DWORD dwBehaviorFlags = 0;

	if( FAILED( hr = g_pD3D->CheckDeviceFormat( D3DADAPTER_DEFAULT, DeviceType, 
												d3ddm.Format, D3DUSAGE_DEPTHSTENCIL,
												D3DRTYPE_SURFACE, D3DFMT_D16 ) ) )
	{
		if( hr == D3DERR_NOTAVAILABLE )
			// POTENTIAL PROBLEM: We need at least a 16-bit z-buffer!
			cout << "pas de z-buffer 16 bits" << endl;
			return E_FAIL;
	}

	D3DCAPS9 d3dCaps;

	if( FAILED( g_pD3D->GetDeviceCaps( D3DADAPTER_DEFAULT, 
		                               DeviceType, &d3dCaps ) ) )
	{
		// TO DO: Respond to failure of GetDeviceCaps
		cout << "GetDeviceCaps fails" << endl;
		return E_FAIL;
	}

	if( d3dCaps.VertexProcessingCaps != 0 )
		dwBehaviorFlags |= D3DCREATE_HARDWARE_VERTEXPROCESSING;
	else
		dwBehaviorFlags |= D3DCREATE_SOFTWARE_VERTEXPROCESSING;

	memset(&g_D3Dpp, 0, sizeof(g_D3Dpp));

	g_D3Dpp.BackBufferFormat       = d3ddm.Format;
	g_D3Dpp.SwapEffect             = D3DSWAPEFFECT_DISCARD;
	g_D3Dpp.Windowed               = TRUE;
    g_D3Dpp.EnableAutoDepthStencil = TRUE;
    g_D3Dpp.AutoDepthStencilFormat = D3DFMT_D16;
    g_D3Dpp.PresentationInterval   = D3DPRESENT_INTERVAL_IMMEDIATE;

	if( FAILED( g_pD3D->CreateDevice( D3DADAPTER_DEFAULT, DeviceType, g_hWnd, dwBehaviorFlags|D3DCREATE_MULTITHREADED, &g_D3Dpp, &g_pD3DDevice ) ) )
	{
		// TO DO: Respond to failure of CreateDevice
		cout << "CreateDevice fails" << endl;
		return E_FAIL;
	}
	
	return S_OK;
}


// Converts an int into a string
string int2Str(int a)
{
    ostringstream stm;
    stm << a;
    return stm.str();
}


void Init()
{
#ifdef USE_SPARK
	/////////////////////////
	// SPARK initial setup //
	/////////////////////////

	// random seed
	randomSeed = static_cast<unsigned int>(time(NULL));

	// Sets the update step
	System::setClampStep(true,0.1f);			// clamp the step to 100 ms
	System::useAdaptiveStep(0.001f,0.01f);		// use an adaptive step from 1ms to 10ms (1000fps to 100fps)

	// Sets the device for SPARK DX9 rendering
	DX9Info::setDevice( g_pD3DDevice );

	////////////////////////////
	// Loads particle texture //
	////////////////////////////

	
	hr = D3DXCreateTextureFromFile(g_pD3DDevice, L"res/point.bmp", &textureParticle);
	if( FAILED(hr) )
		cout << "erreur chargement texture" << endl;

	/////////////////////////////
	// Creates particle system //
	/////////////////////////////
//*
	// Renderers
	basicRenderer = DX9PointRenderer::create(); // basic renderer used for debug

	DX9PointRenderer::setPixelPerUnit(45.0f * D3DX_PI / 180.f, screenHeight);
	pointRenderer = DX9PointRenderer::create(); // point sprite renderer
	pointRenderer->setType(POINT_SPRITE);
	pointRenderer->enableBlending(true);
	pointRenderer->setBlendingFunctions(D3DBLEND_SRCALPHA, D3DBLEND_ONE);
	pointRenderer->setTexture(textureParticle);
	pointRenderer->setTextureBlending(D3DTOP_MODULATE);
	pointRenderer->enableWorldSize(true);
	pointRenderer->setSize(0.05f);

	quadRenderer = DX9QuadRenderer::create(); // quad renderer
	quadRenderer->enableBlending(true);
	quadRenderer->setBlendingFunctions(D3DBLEND_SRCALPHA, D3DBLEND_ONE);
	quadRenderer->setTexturingMode(TEXTURE_2D);
	quadRenderer->setTexture(textureParticle);
	quadRenderer->setTextureBlending(D3DTOP_MODULATE);
	quadRenderer->setScale(0.05f,0.05f);
//*/

	// Model
	particleModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA);
	particleModel->setParam(PARAM_ALPHA,0.8f); // constant alpha
	particleModel->setLifeTime(8.0f,8.0f);

	// Emitter
	particleEmitter = SphericEmitter::create(Vector3D(0.0f,1.0f,0.0f),0.1f * D3DX_PI,0.1f * D3DX_PI);
	particleEmitter->setZone(Point::create(Vector3D(0.0f,0.016f,0.0f)));
	particleEmitter->setFlow(250);
	particleEmitter->setForce(1.5f,1.5f);

	// Modifier
	groundObstacle = Obstacle::create(Plane::create(),INTERSECT_ZONE,0.6f,1.0f);

	// Group
	particleGroup = Group::create(particleModel, 2100);
	particleGroup->addEmitter(particleEmitter);
	particleGroup->addModifier(groundObstacle);
	particleGroup->setRenderer(pointRenderer);
	particleGroup->setGravity(Vector3D(0.0f,-0.8f,0.0f));
	
	// System
	particleSystem = System::create();
	particleSystem->addGroup(particleGroup);

	/////////////////////////////////////
	// Traces SPARK registered objects //
	/////////////////////////////////////

	cout << "\nSPARK FACTORY AFTER INIT :" << endl;
	SPKFactory::getInstance().traceAll();
#endif // USE_SPARK

	///////////////
	// D3D Setup //
	///////////////

	g_pCamera = new CGlobalCamera();

	D3DXMATRIX mWorld;
	D3DXMatrixIdentity(&mWorld);
	g_pD3DDevice->SetTransform(D3DTS_WORLD, &mWorld);

	D3DXCreateSphere(g_pD3DDevice, 1.0f, 4, 4, &g_pMesh, NULL);

	D3DVECTOR  Vdir={0,-1,0};
	memset(&g_light,0,sizeof(D3DLIGHT9));
	g_light.Type = D3DLIGHT_DIRECTIONAL;
	g_light.Diffuse.r = 1.0f;
	g_light.Diffuse.g = 1.0f;
	g_light.Diffuse.b = 1.0f;
	g_light.Diffuse.a = 1.0f;
	g_light.Direction = Vdir;

	g_timerDemo.Start();
}

void UnInit()
{
#ifdef USE_SPARK
	SAFE_RELEASE( textureParticle );
/*
	SAFE_DELETE( basicRenderer ); // basic renderer used for debug

	SAFE_DELETE( pointRenderer ); // point sprite renderer

	SAFE_DELETE( quadRenderer ); // quad renderer

	SAFE_DELETE( particleModel );

	// Emitter
	SAFE_DELETE( particleEmitter );

	// Modifier
	SAFE_DELETE( groundObstacle );

	// Group
	SAFE_DELETE( particleGroup );

	// System
	SAFE_DELETE( particleSystem );
*/
	SAFE_RELEASE( g_pMesh );
#endif // USE_SPARK

	SAFE_DELETE( g_pCamera );
}

void Move()
{
	g_pCamera->Move();
	float deltaTime = float(g_timerDemo.GetElapsedTime());
#ifdef USE_SPARK
	// Changes the color of the model over time
	step += deltaTime * 0.5f;
	particleModel->setParam(PARAM_RED,0.6f + 0.4f * sin(step));
	particleModel->setParam(PARAM_GREEN,0.6f + 0.4f * sin(step + D3DX_PI * 2.0f / 3.0f));
	particleModel->setParam(PARAM_BLUE,0.6f + 0.4f * sin(step + D3DX_PI * 4.0f / 3.0f));

	// Updates particle system
	particleSystem->update(deltaTime);	// 1 defined as a second
#endif // USE_SPARK
}

void Draw()
{
	g_pD3DDevice->Clear( 0, NULL, D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER, D3DCOLOR_COLORVALUE(0.0f,0.0f,0.0f,1.0f), 1.0f, 0 );

	g_pD3DDevice->SetTransform(D3DTS_PROJECTION, &g_pCamera->m_mProj);
	g_pD3DDevice->SetTransform(D3DTS_VIEW, &g_pCamera->m_mView);

	//*
	//g_pD3DDevice->SetLight(0,&g_light); 
	//g_pD3DDevice->LightEnable(0, false);
    g_pD3DDevice->SetRenderState(D3DRS_LIGHTING, false);
	g_pD3DDevice->SetRenderState(D3DRS_SPECULARENABLE, TRUE);
	//*/
	g_pD3DDevice->SetRenderState(D3DRS_COLORVERTEX, true);

	//g_pD3DDevice->SetRenderState( D3DRS_AMBIENT, D3DCOLOR_COLORVALUE( 0.8f, 0.8f, 0.8f, 1.0f ));

	g_pD3DDevice->SetRenderState(D3DRS_ZWRITEENABLE, false);

	g_pD3DDevice->SetRenderState(D3DRS_COLORVERTEX, true);

	g_pD3DDevice->BeginScene();

	//g_pD3DDevice->SetRenderState(D3DRS_FILLMODE, D3DFILL_WIREFRAME);
	//g_pMesh->DrawSubset(0);
#ifdef USE_SPARK
	particleSystem->render();
#endif

	g_pD3DDevice->EndScene();
	g_pD3DDevice->Present( NULL, NULL, NULL, NULL );
}

int Run()
{
	MSG uMsg;
    ZeroMemory(&uMsg, sizeof(uMsg));

	while( uMsg.message != WM_QUIT )
	{
		if( PeekMessage( &uMsg, NULL, 0, 0, PM_REMOVE ) )
		{ 
			TranslateMessage( &uMsg );
			DispatchMessage( &uMsg );
		}
        else
		{
			Move();
			Draw();
		}
	}

#ifdef USE_SPARK
	cout << "\nSPARK FACTORY BEFORE DESTRUCTION :" << endl;
	SPKFactory::getInstance().traceAll();
	SPKFactory::getInstance().destroyAll();
	cout << "\nSPARK FACTORY AFTER DESTRUCTION :" << endl;
	SPKFactory::getInstance().traceAll();
	SPKFactory::destroyInstance();
#endif // USE_SPARK
	UnInit();

	SAFE_RELEASE( g_pD3DDevice );
	SAFE_RELEASE( g_pD3D );
	UnregisterClass(L"SPARKDemoBasicDX9", g_hInst);

	system("PAUSE");

	FreeConsole();

	return int(uMsg.wParam);
}

void InitializeConsoleStdIO()
{
    // si une console est rattachée au processus, alors il existe des fichiers
    // virtuel CONIN$ et CONOUT$ qui permettent respectivement de lire
    // et d'écrire depuis / dans cette console (voir la doc de CreateFile).

#if _MSC_VER >= 1400 // VC++ 8
    {
    // éviter le warning C4996: 'freopen' was declared deprecated
    // This function or variable may be unsafe. Consider using freopen_s instead.
    FILE *stream;
    freopen_s( &stream, "CONIN$", "r", stdin );
    freopen_s( &stream, "CONOUT$", "w", stdout );
    freopen_s( &stream, "CONOUT$", "w", stderr );
    }
#else
    std::freopen( "CONIN$", "r", stdin );
    std::freopen( "CONOUT$", "w", stdout );
    std::freopen( "CONOUT$", "w", stderr );
#endif

    // la ligne suivante synchronise les flux standards C++ (cin, cout, cerr...)
    std::ios_base::sync_with_stdio();
}

// Main function
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
	::AllocConsole();
	InitializeConsoleStdIO();

#if defined(DEBUG) | defined(_DEBUG)
	_CrtSetDbgFlag( _CRTDBG_ALLOC_MEM_DF | _CRTDBG_LEAK_CHECK_DF );
#endif

	screenHeight = 600;
	CreateWnd(hInstance, 800, 600);
	InitDX(800, 600, false);
	Init();
	return Run();
}

LRESULT CALLBACK MsgProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	switch( uMsg )
	{
		case WM_KEYDOWN:
			switch( wParam )
			{
				case VK_ESCAPE:
					PostQuitMessage(0);
					break;
				case VK_F4:
					{
						renderValue = (renderValue + 1) % 4;
#ifdef USE_SPARK
						switch (renderValue)
						{
							case 0 :
								particleGroup->setRenderer(pointRenderer);
								break;

							case 1 :
								particleGroup->setRenderer(quadRenderer);
								break;

							case 2 :
								particleGroup->setRenderer(basicRenderer);
								break;

							case 3 :
								particleGroup->setRenderer(NULL);
								break;
						}
#endif
					}
					break;
				default:
					break;
			}
			break;

		case WM_RBUTTONDOWN: 
			g_bSourisDroite = true;
			break;

		case WM_MOUSEMOVE:
			{
				// déplacement relatif
				int	px = GET_X_LPARAM(lParam);
				int	py = GET_Y_LPARAM(lParam);
				
				float dx = (px - g_ptSourisPosition.x)/5.f;
				float dy = (py - g_ptSourisPosition.y)/5.f;
				g_ptSourisPosition.x = px;
				g_ptSourisPosition.y = py;
				if ( g_bSourisDroite  )
				{
					g_pCamera->m_fAngleH += -dx;
					g_pCamera->m_fAngleV += dy;
				}
			}
			break;

		case WM_RBUTTONUP: g_bSourisDroite = false; break;

		case WM_MOUSEWHEEL:
			{
				if ( typeid(*g_pCamera) == typeid(CGlobalCamera) )
				{
					g_pCamera->m_fDistance += float(GET_WHEEL_DELTA_WPARAM(wParam)) / 200.0f;
					if( g_pCamera->m_fDistance < 0.2f ) g_pCamera->m_fDistance = 0.2f;
				}
			}
			break;

		case WM_DESTROY:
            PostQuitMessage(0);
			break;
		
        default:
            // The DefWindowProc() function will process any messages that 
            // we didn't bother to catch in the switch statement above.
            return DefWindowProc( hWnd, uMsg, wParam, lParam );
    }
	return 0;
}