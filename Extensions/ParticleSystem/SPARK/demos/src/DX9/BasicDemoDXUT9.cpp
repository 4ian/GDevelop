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

#include "DXUT.h"
#include "DXUTgui.h"
#include "DXUTmisc.h"
#include "DXUTCamera.h"
#include "DXUTSettingsDlg.h"
#include "SDKmisc.h"
#include "SDKmesh.h"
#include <ctime>

#pragma comment(lib, "d3d9.lib")
#pragma comment(lib, "d3dx9.lib")
#pragma comment(lib, "dxerr.lib")
#pragma comment(lib, "d3d10.lib")
#pragma comment(lib, "d3dx10.lib")
#pragma comment(lib, "winmm.lib")
#pragma comment(lib, "comctl32.lib")

//#define DEBUG_VS   // Uncomment this line to debug D3D9 vertex shaders 
//#define DEBUG_PS   // Uncomment this line to debug D3D9 pixel shaders 

#define CONSOLE
#ifdef CONSOLE
#include <iostream>
#endif


//--------------------------------------------------------------------------------------
// Global variables
//--------------------------------------------------------------------------------------
CFirstPersonCamera          g_Camera;               // A model viewing camera
CDXUTDialogResourceManager  g_DialogResourceManager; // manager for shared resources of dialogs
CD3DSettingsDlg             g_SettingsDlg;          // Device settings dialog
CDXUTTextHelper*            g_pTxtHelper = NULL;
CDXUTDialog                 g_HUD;                  // dialog for standard controls
CDXUTDialog                 g_SampleUI;             // dialog for sample specific controls

// Direct3D 9 resources
ID3DXFont*                  g_pFont9 = NULL;
ID3DXSprite*                g_pSprite9 = NULL;
ID3DXEffect*                g_pEffect9 = NULL;

bool                            g_bLeftButtonDown = false;
bool                            g_bRightButtonDown = false;
bool                            g_bMiddleButtonDown = false;

unsigned int renderValue = 0;
float step = 0.0f;

//--------------------------------------------------------------------------------------
// UI control IDs
//--------------------------------------------------------------------------------------
#define IDC_TOGGLEFULLSCREEN    1
#define IDC_TOGGLEREF           2
#define IDC_CHANGEDEVICE        3


//-----------------------------------------------------------------------------
// callbacks
//-----------------------------------------------------------------------------
LRESULT CALLBACK MsgProc( HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam, bool* pbNoFurtherProcessing,
                          void* pUserContext );
void CALLBACK OnKeyboard( UINT nChar, bool bKeyDown, bool bAltDown, void* pUserContext );
void CALLBACK OnGUIEvent( UINT nEvent, int nControlID, CDXUTControl* pControl, void* pUserContext );
void CALLBACK OnFrameMove( double fTime, float fElapsedTime, void* pUserContext );
bool CALLBACK ModifyDeviceSettings( DXUTDeviceSettings* pDeviceSettings, void* pUserContext );

bool CALLBACK IsD3D9DeviceAcceptable( D3DCAPS9* pCaps, D3DFORMAT AdapterFormat, D3DFORMAT BackBufferFormat,
                                      bool bWindowed, void* pUserContext );
HRESULT CALLBACK OnD3D9CreateDevice( IDirect3DDevice9* pd3dDevice, const D3DSURFACE_DESC* pBackBufferSurfaceDesc,
                                     void* pUserContext );
HRESULT CALLBACK OnD3D9ResetDevice( IDirect3DDevice9* pd3dDevice, const D3DSURFACE_DESC* pBackBufferSurfaceDesc,
                                    void* pUserContext );
void CALLBACK OnD3D9FrameRender( IDirect3DDevice9* pd3dDevice, double fTime, float fElapsedTime, void* pUserContext );
void CALLBACK OnD3D9LostDevice( void* pUserContext );
void CALLBACK OnD3D9DestroyDevice( void* pUserContext );
void CALLBACK MouseProc( bool bLeftButtonDown, bool bRightButtonDown, bool bMiddleButtonDown, bool bSideButton1Down,
                         bool bSideButton2Down, int nMouseWheelDelta, int xPos, int yPos, void* pUserContext );

void InitApp();
void UnInitApp();
void RenderText();

void InitSpark();
void UnInitSpark();


// SPARK lib
#include <SPK.h>
#include <SPK_DX9.h>

using namespace std;
using namespace SPK;
using namespace SPK::DX9;
//-----------------------------------------------------------------------------

// SPARK variables
Group* particleGroupPtr = NULL;
SPK::System particleSystem;
DX9PointRenderer *basicRenderer = NULL;
DX9PointRenderer *pointRenderer = NULL;
DX9QuadRenderer *quadRenderer = NULL;
DX9Renderer* particleRenderer = NULL;
Model *particleModel;
Point *point;
Group *particleGroup;
SphericEmitter *particleEmitter;

LPDIRECT3DTEXTURE9	g_pTextureParticle = NULL;

#include "CCamera.h"
//CGlobalCamera *g_pCamera;
POINT g_ptSourisPosition;
D3DLIGHT9 g_light;
//-----------------------------------------------------------------------------

// Calls back function to have particle bounce on the floor
bool bounceOnFloor(Particle& particle, float deltaTime)
{
	if (particle.position().y < 0.015f)
	{
		particle.position().y = 0.015f;
		particle.velocity().y = -particle.velocity().y * 0.6f;
	}
	return false;
}
#ifdef CONSOLE
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
#endif
//-----------------------------------------------------------------------------

//--------------------------------------------------------------------------------------
// Entry point to the program. Initializes everything and goes into a message processing 
// loop. Idle time is used to render the scene.
//--------------------------------------------------------------------------------------
int WINAPI wWinMain( HINSTANCE hInstance, HINSTANCE hPrevInstance, LPWSTR lpCmdLine, int nCmdShow )
{
    // Enable run-time memory check for debug builds.
#if defined(DEBUG) | defined(_DEBUG)
    _CrtSetDbgFlag( _CRTDBG_ALLOC_MEM_DF | _CRTDBG_LEAK_CHECK_DF );
#endif

#ifdef CONSOLE
	::AllocConsole();
	InitializeConsoleStdIO();
#endif

	// random seed
	randomSeed = static_cast<unsigned int>(time(NULL));

    // DXUT will create and use the best device (either D3D9 or D3D10) 
    // that is available on the system depending on which D3D callbacks are set below

    // Set DXUT callbacks
    DXUTSetCallbackMsgProc( MsgProc );
    DXUTSetCallbackKeyboard( OnKeyboard );
    DXUTSetCallbackFrameMove( OnFrameMove );
    DXUTSetCallbackDeviceChanging( ModifyDeviceSettings );

    DXUTSetCallbackD3D9DeviceAcceptable( IsD3D9DeviceAcceptable );
    DXUTSetCallbackD3D9DeviceCreated( OnD3D9CreateDevice );
    DXUTSetCallbackD3D9DeviceReset( OnD3D9ResetDevice );
    DXUTSetCallbackD3D9DeviceLost( OnD3D9LostDevice );
    DXUTSetCallbackD3D9DeviceDestroyed( OnD3D9DestroyDevice );
    DXUTSetCallbackD3D9FrameRender( OnD3D9FrameRender );
	DXUTSetCallbackMouse( MouseProc );

    InitApp();
    DXUTInit( true, true, NULL ); // Parse the command line, show msgboxes on error, no extra command line params
    DXUTSetCursorSettings( true, true );
    DXUTCreateWindow( L"BasicDemoDXUT9" );
    DXUTCreateDevice( true, 640, 480 );
    
	InitSpark();

	DXUTMainLoop(); // Enter into the DXUT render loop

	UnInitSpark();

	UnInitApp();

	system("PAUSE");

	FreeConsole();

    return DXUTGetExitCode();
}


//--------------------------------------------------------------------------------------
// Initialize the app 
//--------------------------------------------------------------------------------------
void InitApp()
{
#ifdef CONSOLE
	std::cout << "InitApp" << std::endl;
#endif

    g_SettingsDlg.Init( &g_DialogResourceManager );
    g_HUD.Init( &g_DialogResourceManager );
    g_SampleUI.Init( &g_DialogResourceManager );

    g_HUD.SetCallback( OnGUIEvent ); int iY = 10;
    g_HUD.AddButton( IDC_TOGGLEFULLSCREEN, L"Toggle full screen", 35, iY, 125, 22 );
    g_HUD.AddButton( IDC_TOGGLEREF, L"Toggle REF (F3)", 35, iY += 24, 125, 22, VK_F3 );
    g_HUD.AddButton( IDC_CHANGEDEVICE, L"Change device (F2)", 35, iY += 24, 125, 22, VK_F2 );

    g_SampleUI.SetCallback( OnGUIEvent ); iY = 10;

	g_Camera.SetRotateButtons( true, false, false );
	//g_pCamera = new CGlobalCamera();

	D3DVECTOR  Vdir={0,-1,0};
	memset(&g_light,0,sizeof(D3DLIGHT9));
	g_light.Type = D3DLIGHT_DIRECTIONAL;
	g_light.Diffuse.r = 1.0f;
	g_light.Diffuse.g = 1.0f;
	g_light.Diffuse.b = 1.0f;
	g_light.Diffuse.a = 1.0f;
	g_light.Direction = Vdir;

	// Inits Particle Engine
	
}

void UnInitApp()
{
#ifdef CONSOLE
	std::cout << "UnInitApp" << std::endl;
#endif
}


void InitSpark()
{
#ifdef CONSOLE
	std::cout << "InitSpark" << std::endl;
#endif
	Vector3D gravity(0.0f,-0.8f,0.0f);

	// Renderers

	
	basicRenderer = DX9PointRenderer::create();
//	
	particleRenderer = NULL;

	pointRenderer = DX9PointRenderer::create();
	{
		pointRenderer->setType(POINT_SPRITE);
		pointRenderer->enableBlending(true);
		pointRenderer->setBlendingFunctions(D3DBLEND_SRCALPHA, D3DBLEND_ONE);
		pointRenderer->setTexture(g_pTextureParticle);
		pointRenderer->setTextureBlending(D3DTOP_MODULATE);
		pointRenderer->enableWorldSize(true);
		DX9PointRenderer::setPixelPerUnit(45.0f * D3DX_PI / 180.f, 600);
		pointRenderer->setSize(0.05f);
		particleRenderer = pointRenderer;
	}
//*
	quadRenderer = DX9QuadRenderer::create();
	{
		quadRenderer->enableBlending(true);
		quadRenderer->setBlendingFunctions(D3DBLEND_SRCALPHA, D3DBLEND_ONE);
		quadRenderer->setTexturingMode(TEXTURE_2D);
		quadRenderer->setTexture(g_pTextureParticle);
		quadRenderer->setTextureBlending(D3DTOP_MODULATE);
		quadRenderer->setScale(0.05f,0.05f);
		//particleRenderer = quadRenderer;
	}
//*/
	// Model
	particleModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA);
	particleModel->setParam(PARAM_ALPHA,0.8f); // constant alpha
	particleModel->setLifeTime(8.0f,8.0f);

	// Emitter
	point = Point::create(Vector3D(0.0f,0.016f,0.0f));
	particleEmitter = SphericEmitter::create(Vector3D(0.0f,1.0f,0.0f), 0.1f * D3DX_PI, 0.1f * D3DX_PI);
	particleEmitter->setZone(point);
	particleEmitter->setFlow(250);
	particleEmitter->setForce(1.5f,1.5f);
	int n = sizeof(Group);
	// Group
	particleGroup = Group::create(particleModel, 2100);
	particleGroup->addEmitter(particleEmitter);
	//particleGroup->setRenderer(particleRenderer);
	particleGroup->setCustomUpdate(&bounceOnFloor);
	particleGroup->setGravity(gravity);

	particleSystem.addGroup(particleGroup);
	//particleGroupPtr = particleGroup;

	// /!\ obligatoirement après la création du device, car créé les buffers dans certaines conditions
	particleGroup->setRenderer(particleRenderer);


	SPKFactory::getInstance().traceAll();
}

void UnInitSpark()
{
#ifdef CONSOLE
	std::cout << "UnInitSpark" << std::endl;
#endif
	DX9Info::DX9DestroyAllBuffers();
	SPKFactory::getInstance().traceAll();
	SPKFactory::getInstance().destroyAll();
	SPKFactory::getInstance().traceAll();
	SPKFactory::destroyInstance();
}


//--------------------------------------------------------------------------------------
// Render the help and statistics text. This function uses the ID3DXFont interface for 
// efficient text rendering.
//--------------------------------------------------------------------------------------
void RenderText()
{
    g_pTxtHelper->Begin();
    g_pTxtHelper->SetInsertionPos( 5, 5 );
    g_pTxtHelper->SetForegroundColor( D3DXCOLOR( 1.0f, 1.0f, 0.0f, 1.0f ) );
    g_pTxtHelper->DrawTextLine( DXUTGetFrameStats( DXUTIsVsyncEnabled() ) );
    g_pTxtHelper->DrawTextLine( DXUTGetDeviceStats() );
    g_pTxtHelper->End();
}


//--------------------------------------------------------------------------------------
// Rejects any D3D9 devices that aren't acceptable to the app by returning false
//--------------------------------------------------------------------------------------
bool CALLBACK IsD3D9DeviceAcceptable( D3DCAPS9* pCaps, D3DFORMAT AdapterFormat,
                                      D3DFORMAT BackBufferFormat, bool bWindowed, void* pUserContext )
{
#ifdef CONSOLE
	std::cout << "IsD3D9DeviceAcceptable" << std::endl;
#endif

    // Skip backbuffer formats that don't support alpha blending
    IDirect3D9* pD3D = DXUTGetD3D9Object();
    if( FAILED( pD3D->CheckDeviceFormat( pCaps->AdapterOrdinal, pCaps->DeviceType,
                                         AdapterFormat, D3DUSAGE_QUERY_POSTPIXELSHADER_BLENDING,
                                         D3DRTYPE_TEXTURE, BackBufferFormat ) ) )
        return false;

    return true;
}


//--------------------------------------------------------------------------------------
// Called right before creating a D3D9 or D3D10 device, allowing the app to modify the device settings as needed
//--------------------------------------------------------------------------------------
bool CALLBACK ModifyDeviceSettings( DXUTDeviceSettings* pDeviceSettings, void* pUserContext )
{
#ifdef CONSOLE
	std::cout << "ModifyDeviceSettings" << std::endl;
#endif

    if( pDeviceSettings->ver == DXUT_D3D9_DEVICE )
    {
        IDirect3D9* pD3D = DXUTGetD3D9Object();
        D3DCAPS9 Caps;
        pD3D->GetDeviceCaps( pDeviceSettings->d3d9.AdapterOrdinal, pDeviceSettings->d3d9.DeviceType, &Caps );

		// Turn vsync off
		pDeviceSettings->d3d9.pp.PresentationInterval = D3DPRESENT_INTERVAL_IMMEDIATE;
		g_SettingsDlg.GetDialogControl()->GetComboBox( DXUTSETTINGSDLG_PRESENT_INTERVAL )->SetEnabled( false );

        // If device doesn't support HW T&L or doesn't support 1.1 vertex shaders in HW 
        // then switch to SWVP.
        if( ( Caps.DevCaps & D3DDEVCAPS_HWTRANSFORMANDLIGHT ) == 0 || Caps.VertexShaderVersion < D3DVS_VERSION( 1, 1 ) )
        {
            pDeviceSettings->d3d9.BehaviorFlags = D3DCREATE_SOFTWARE_VERTEXPROCESSING;
        }

        // Debugging vertex shaders requires either REF or software vertex processing 
        // and debugging pixel shaders requires REF.  
#ifdef DEBUG_VS
        if( pDeviceSettings->d3d9.DeviceType != D3DDEVTYPE_REF )
        {
            pDeviceSettings->d3d9.BehaviorFlags &= ~D3DCREATE_HARDWARE_VERTEXPROCESSING;
            pDeviceSettings->d3d9.BehaviorFlags &= ~D3DCREATE_PUREDEVICE;
            pDeviceSettings->d3d9.BehaviorFlags |= D3DCREATE_SOFTWARE_VERTEXPROCESSING;
        }
#endif
#ifdef DEBUG_PS
        pDeviceSettings->d3d9.DeviceType = D3DDEVTYPE_REF;
#endif
    }

    // For the first device created if its a REF device, optionally display a warning dialog box
    static bool s_bFirstTime = true;
    if( s_bFirstTime )
    {
        s_bFirstTime = false;
        if( ( DXUT_D3D9_DEVICE == pDeviceSettings->ver && pDeviceSettings->d3d9.DeviceType == D3DDEVTYPE_REF ) ||
            ( DXUT_D3D10_DEVICE == pDeviceSettings->ver &&
              pDeviceSettings->d3d10.DriverType == D3D10_DRIVER_TYPE_REFERENCE ) )
            DXUTDisplaySwitchingToREFWarning( pDeviceSettings->ver );
    }

    return true;
}


//--------------------------------------------------------------------------------------
// Create any D3D9 resources that will live through a device reset (D3DPOOL_MANAGED)
// and aren't tied to the back buffer size
//--------------------------------------------------------------------------------------
HRESULT CALLBACK OnD3D9CreateDevice( IDirect3DDevice9* pd3dDevice, const D3DSURFACE_DESC* pBackBufferSurfaceDesc,
                                     void* pUserContext )
{
#ifdef CONSOLE
	std::cout << "OnD3D9CreateDevice" << std::endl;
#endif

    HRESULT hr;

    V_RETURN( g_DialogResourceManager.OnD3D9CreateDevice( pd3dDevice ) );
    V_RETURN( g_SettingsDlg.OnD3D9CreateDevice( pd3dDevice ) );

    V_RETURN( D3DXCreateFont( pd3dDevice, 15, 0, FW_BOLD, 1, FALSE, DEFAULT_CHARSET,
                              OUT_DEFAULT_PRECIS, DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE,
                              L"Arial", &g_pFont9 ) );

    // Read the D3DX effect file
//    WCHAR str[MAX_PATH];
    DWORD dwShaderFlags = D3DXFX_NOT_CLONEABLE;
#ifdef DEBUG_VS
        dwShaderFlags |= D3DXSHADER_FORCE_VS_SOFTWARE_NOOPT;
    #endif
#ifdef DEBUG_PS
        dwShaderFlags |= D3DXSHADER_FORCE_PS_SOFTWARE_NOOPT;
    #endif
    //V_RETURN( DXUTFindDXSDKMediaFileCch( str, MAX_PATH, L"SimpleSample.fx" ) );
	//V_RETURN( D3DXCreateEffectFromFile( pd3dDevice, L"e:/SimpleSample.fx", NULL, NULL, dwShaderFlags, NULL, &g_pEffect9, NULL ) );

    // Setup the camera's view parameters
    D3DXVECTOR3 vecEye( 0.0f, 0.0f, -5.0f );
    D3DXVECTOR3 vecAt ( 0.0f, 0.0f, -0.0f );
    g_Camera.SetViewParams( &vecEye, &vecAt );
	//-------------------------------------------------------------------------

	//*
	// SPARK init
	DX9Info::setDevice( pd3dDevice );

	hr = D3DXCreateTextureFromFile(pd3dDevice, L"res/point.bmp", &g_pTextureParticle);
	if( FAILED(hr) )
		cout << "erreur chargement texture" << endl;


    return S_OK;
}


//--------------------------------------------------------------------------------------
// Create any D3D9 resources that won't live through a device reset (D3DPOOL_DEFAULT) 
// or that are tied to the back buffer size 
//--------------------------------------------------------------------------------------
HRESULT CALLBACK OnD3D9ResetDevice( IDirect3DDevice9* pd3dDevice,
                                    const D3DSURFACE_DESC* pBackBufferSurfaceDesc, void* pUserContext )
{
#ifdef CONSOLE
	std::cout << "OnD3D9ResetDevice" << std::endl;
#endif

    HRESULT hr;

    V_RETURN( g_DialogResourceManager.OnD3D9ResetDevice() );
    V_RETURN( g_SettingsDlg.OnD3D9ResetDevice() );

    if( g_pFont9 ) V_RETURN( g_pFont9->OnResetDevice() );
    if( g_pEffect9 ) V_RETURN( g_pEffect9->OnResetDevice() );

    V_RETURN( D3DXCreateSprite( pd3dDevice, &g_pSprite9 ) );
    g_pTxtHelper = new CDXUTTextHelper( g_pFont9, g_pSprite9, NULL, NULL, 15 );

    g_HUD.SetLocation( pBackBufferSurfaceDesc->Width - 170, 0 );
    g_HUD.SetSize( 170, 170 );
    g_SampleUI.SetLocation( pBackBufferSurfaceDesc->Width - 170, pBackBufferSurfaceDesc->Height - 350 );
    g_SampleUI.SetSize( 170, 300 );

	pd3dDevice->SetTextureStageState( 0, D3DTSS_COLORARG1, D3DTA_TEXTURE );
    pd3dDevice->SetTextureStageState( 0, D3DTSS_COLORARG2, D3DTA_DIFFUSE );
    pd3dDevice->SetTextureStageState( 0, D3DTSS_COLOROP, D3DTOP_MODULATE );
    pd3dDevice->SetSamplerState( 0, D3DSAMP_MINFILTER, D3DTEXF_LINEAR );
    pd3dDevice->SetSamplerState( 0, D3DSAMP_MAGFILTER, D3DTEXF_LINEAR );

    pd3dDevice->SetRenderState( D3DRS_ZENABLE, TRUE );
    //pd3dDevice->SetRenderState( D3DRS_DITHERENABLE, TRUE );
    pd3dDevice->SetRenderState( D3DRS_SPECULARENABLE, TRUE );
    pd3dDevice->SetRenderState( D3DRS_LIGHTING, false );
    pd3dDevice->SetRenderState( D3DRS_AMBIENT, 0x80808080 );
	D3DLIGHT9 light;
    D3DXVECTOR3 vecLightDirUnnormalized( 10.0f, -10.0f, 10.0f );
    ZeroMemory( &light, sizeof( D3DLIGHT9 ) );
    light.Type = D3DLIGHT_DIRECTIONAL;
    light.Diffuse.r = 1.0f;
    light.Diffuse.g = 1.0f;
    light.Diffuse.b = 1.0f;
    D3DXVec3Normalize( ( D3DXVECTOR3* )&light.Direction, &vecLightDirUnnormalized );
    light.Position.x = 10.0f;
    light.Position.y = -10.0f;
    light.Position.z = 10.0f;
    light.Range = 1000.0f;
    pd3dDevice->SetLight( 0, &light );
    pd3dDevice->LightEnable( 0, TRUE );

	// Set the transform matrices
    D3DXMATRIXA16 matWorld;
    D3DXMatrixIdentity( &matWorld );
    pd3dDevice->SetTransform( D3DTS_WORLD, &matWorld );

    // Setup the camera with view & projection matrix
    D3DXVECTOR3 vecEye( 0.0f, 0.0f, -5.0f );
    D3DXVECTOR3 vecAt ( 0.0f, 0.0f, 0.0f );
    g_Camera.SetViewParams( &vecEye, &vecAt );
    float fAspectRatio = pBackBufferSurfaceDesc->Width / ( FLOAT )pBackBufferSurfaceDesc->Height;
    g_Camera.SetProjParams( D3DX_PI / 4, fAspectRatio, 1.0f, 1000.0f );

    return S_OK;
}


//--------------------------------------------------------------------------------------
// Handle updates to the scene.  This is called regardless of which D3D API is used
//--------------------------------------------------------------------------------------
void CALLBACK OnFrameMove( double fTime, float fElapsedTime, void* pUserContext )
{
//	g_fElapsedTime = fElapsedTime;
    // Update the camera's position based on user input 
    g_Camera.FrameMove( fElapsedTime );
	//g_pCamera->Move();

	// Updates particle system
	particleSystem.update( fElapsedTime );

	// Changes the color of the model over time
	step += fElapsedTime * 0.5f;
	particleModel->setParam(PARAM_RED,0.6f + 0.4f * sin(step));
	particleModel->setParam(PARAM_GREEN,0.6f + 0.4f * sin(step + D3DX_PI * 2.0f / 3.0f));
	particleModel->setParam(PARAM_BLUE,0.6f + 0.4f * sin(step + D3DX_PI * 4.0f / 3.0f));
}


//--------------------------------------------------------------------------------------
// Render the scene using the D3D9 device
//--------------------------------------------------------------------------------------
void CALLBACK OnD3D9FrameRender( IDirect3DDevice9* pd3dDevice, double fTime, float fElapsedTime, void* pUserContext )
{
    HRESULT hr;
    D3DXMATRIXA16 mWorld;
    D3DXMATRIXA16 mView;
    D3DXMATRIXA16 mProj;
    D3DXMATRIXA16 mWorldViewProjection;

    // If the settings dialog is being shown, then render it instead of rendering the app's scene
    if( g_SettingsDlg.IsActive() )
    {
        g_SettingsDlg.OnRender( fElapsedTime );
        return;
    }

    // Clear the render target and the zbuffer 
    V( pd3dDevice->Clear( 0, NULL, D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER, D3DCOLOR_ARGB( 0, 0, 0, 0 ), 1.0f, 0 ) );
	//V( pd3dDevice->Clear( 0, NULL, D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER, D3DCOLOR_COLORVALUE( 0.0f, 0.0f, 0.0f, 1.0f ), 1.0f, 0 ) );

    // Render the scene
    if( SUCCEEDED( pd3dDevice->BeginScene() ) )
    {
        // Get the projection & view matrix from the camera class
        //mWorld = *g_Camera.GetWorldMatrix();
        mProj = *g_Camera.GetProjMatrix();
        mView = *g_Camera.GetViewMatrix();
		D3DXMatrixIdentity(&mWorld);

        //mWorldViewProjection = mWorld * mView * mProj;

		//*
		pd3dDevice->SetTransform(D3DTS_WORLD, &mWorld);
		pd3dDevice->SetTransform(D3DTS_VIEW, &mView);
		pd3dDevice->SetTransform(D3DTS_PROJECTION, &mProj);
		//*/
		/*
		pd3dDevice->SetTransform(D3DTS_PROJECTION, &g_pCamera->m_mProj);
		pd3dDevice->SetTransform(D3DTS_VIEW, &g_pCamera->m_mView);
		pd3dDevice->SetTransform(D3DTS_WORLD, &mWorld);
		//*/

        // Update the effect's variables.  Instead of using strings, it would 
        // be more efficient to cache a handle to the parameter by calling 
        // ID3DXEffect::GetParameterByName
		/*
        V( g_pEffect9->SetMatrix( "g_mWorldViewProjection", &mWorldViewProjection ) );
        V( g_pEffect9->SetMatrix( "g_mWorld", &mWorld ) );
        V( g_pEffect9->SetFloat( "g_fTime", ( float )fTime ) );
		*/

		pd3dDevice->SetRenderState( D3DRS_AMBIENT, D3DCOLOR_COLORVALUE( 0.8f, 0.8f, 0.8f, 1.0f ));
		pd3dDevice->SetRenderState( D3DRS_ZWRITEENABLE, false );
		pd3dDevice->SetRenderState( D3DRS_COLORVERTEX, true );

		DXUT_BeginPerfEvent( DXUT_PERFEVENTCOLOR, L"Draw scene" );
		particleSystem.render();
		DXUT_EndPerfEvent();

        DXUT_BeginPerfEvent( DXUT_PERFEVENTCOLOR, L"HUD / Stats" ); // These events are to help PIX identify what the code is doing
        RenderText();
        V( g_HUD.OnRender( fElapsedTime ) );
        V( g_SampleUI.OnRender( fElapsedTime ) );
        DXUT_EndPerfEvent();

        V( pd3dDevice->EndScene() );
    }
}


//--------------------------------------------------------------------------------------
// Handle messages to the application
//--------------------------------------------------------------------------------------
LRESULT CALLBACK MsgProc( HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam, bool* pbNoFurtherProcessing,
                          void* pUserContext )
{
    // Pass messages to dialog resource manager calls so GUI state is updated correctly
    *pbNoFurtherProcessing = g_DialogResourceManager.MsgProc( hWnd, uMsg, wParam, lParam );
    if( *pbNoFurtherProcessing )
        return 0;

    // Pass messages to settings dialog if its active
    if( g_SettingsDlg.IsActive() )
    {
        g_SettingsDlg.MsgProc( hWnd, uMsg, wParam, lParam );
        return 0;
    }

    // Give the dialogs a chance to handle the message first
    *pbNoFurtherProcessing = g_HUD.MsgProc( hWnd, uMsg, wParam, lParam );
    if( *pbNoFurtherProcessing )
        return 0;
    *pbNoFurtherProcessing = g_SampleUI.MsgProc( hWnd, uMsg, wParam, lParam );
    if( *pbNoFurtherProcessing )
        return 0;

    // Pass all remaining windows messages to camera so it can respond to user input
    g_Camera.HandleMessages( hWnd, uMsg, wParam, lParam );

    return 0;
}


//--------------------------------------------------------------------------------------
// Handle key presses
//--------------------------------------------------------------------------------------
void CALLBACK OnKeyboard( UINT nChar, bool bKeyDown, bool bAltDown, void* pUserContext )
{
	if( bKeyDown )
    {
        switch( nChar )
        {
			case VK_F4:
				{
					renderValue = (renderValue + 1) % 4;

					switch (renderValue)
					{
						case 0 :
							particleRenderer = pointRenderer;
							particleGroup->setRenderer(particleRenderer);
							break;

						case 1 :
							particleRenderer = quadRenderer;
							particleGroup->setRenderer(particleRenderer);
							break;

						case 2 :
							particleGroup->setRenderer(basicRenderer);
							break;

						case 3 :
							particleGroup->setRenderer(NULL);
							break;
					}
				}
				break;
        }
    }
}


//--------------------------------------------------------------------------------------
// Handles the GUI events
//--------------------------------------------------------------------------------------
void CALLBACK OnGUIEvent( UINT nEvent, int nControlID, CDXUTControl* pControl, void* pUserContext )
{
    switch( nControlID )
    {
        case IDC_TOGGLEFULLSCREEN:
            DXUTToggleFullScreen(); break;
        case IDC_TOGGLEREF:
            DXUTToggleREF(); break;
        case IDC_CHANGEDEVICE:
            g_SettingsDlg.SetActive( !g_SettingsDlg.IsActive() ); break;
    }
}


//--------------------------------------------------------------------------------------
// Release D3D9 resources created in the OnD3D9ResetDevice callback 
//--------------------------------------------------------------------------------------
void CALLBACK OnD3D9LostDevice( void* pUserContext )
{
#ifdef CONSOLE
	std::cout << "OnD3D9LostDevice start" << std::endl;
#endif

    g_DialogResourceManager.OnD3D9LostDevice();
    g_SettingsDlg.OnD3D9LostDevice();
    if( g_pFont9 ) g_pFont9->OnLostDevice();
    if( g_pEffect9 ) g_pEffect9->OnLostDevice();
    SAFE_RELEASE( g_pSprite9 );
    SAFE_DELETE( g_pTxtHelper );

	DX9Info::DX9DestroyAllBuffers();

#ifdef CONSOLE
	std::cout << "OnD3D9LostDevice end" << std::endl;
#endif
}


//--------------------------------------------------------------------------------------
// Release D3D9 resources created in the OnD3D9CreateDevice callback 
//--------------------------------------------------------------------------------------
void CALLBACK OnD3D9DestroyDevice( void* pUserContext )
{
#ifdef CONSOLE
	std::cout << "OnD3D9DestroyDevice" << std::endl;
#endif

    g_DialogResourceManager.OnD3D9DestroyDevice();
    g_SettingsDlg.OnD3D9DestroyDevice();
    SAFE_RELEASE( g_pEffect9 );
    SAFE_RELEASE( g_pFont9 );

	// SPARK destroy
	SAFE_RELEASE( g_pTextureParticle );
	
	DX9Info::DX9DestroyAllBuffers();
	//-------------------------------------------------------------------------
}

void CALLBACK MouseProc( bool bLeftButtonDown, bool bRightButtonDown, bool bMiddleButtonDown, bool bSideButton1Down,
                         bool bSideButton2Down, int nMouseWheelDelta, int xPos, int yPos, void* pUserContext )
{
    bool bOldLeftButtonDown = g_bLeftButtonDown;
    bool bOldRightButtonDown = g_bRightButtonDown;
    bool bOldMiddleButtonDown = g_bMiddleButtonDown;
    g_bLeftButtonDown = bLeftButtonDown;
    g_bMiddleButtonDown = bMiddleButtonDown;
    g_bRightButtonDown = bRightButtonDown;

	//*
    if( bOldLeftButtonDown && !g_bLeftButtonDown )
    {
        // Disable movement
        g_Camera.SetEnablePositionMovement( false );
    }
    else if( !bOldLeftButtonDown && g_bLeftButtonDown )
    {
        // Enable movement
        g_Camera.SetEnablePositionMovement( true );
    }
    else if( !bOldRightButtonDown && g_bRightButtonDown )
    {
        // Enable movement
        g_Camera.SetEnablePositionMovement( false );
    }
    else if( !bOldMiddleButtonDown && g_bMiddleButtonDown )
    {
        // Enable movement
        g_Camera.SetEnablePositionMovement( false );
    }

    // If no mouse button is down at all, enable camera movement.
    if( !g_bLeftButtonDown && !g_bRightButtonDown && !g_bMiddleButtonDown )
        g_Camera.SetEnablePositionMovement( true );
	//*/
	/*
	if( bRightButtonDown )
	{
		float dx = (xPos - g_ptSourisPosition.x)/5.f;
		float dy = (yPos - g_ptSourisPosition.y)/5.f;
		g_ptSourisPosition.x = xPos;
		g_ptSourisPosition.y = yPos;
		//if ( g_bSourisDroite  )
		{
			g_pCamera->m_fAngleH += -dx;
			g_pCamera->m_fAngleV += dy;
		}
	}
	//*/
}