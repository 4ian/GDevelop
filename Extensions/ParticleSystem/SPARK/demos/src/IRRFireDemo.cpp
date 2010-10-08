//////////////////////////////////////////////////////////////////////////////////
// SPARK Irrlicht Rendering library												//
// Copyright (C) 2009															//
// Thibault Lescoat -  info-tibo <at> orange <dot> fr							//
// Julien Fryer - julienfryer@gmail.com											//
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


// external libs
#include <irrlicht.h>

// SPARK lib
#include <SPK.h>
#include <SPK_IRR.h>

// windows only
#ifdef _WIN32
#include <windows.h>
#endif

using namespace std;
using namespace irr;
using namespace SPK;
using namespace SPK::IRR;

float angleY = 10.0f;
float angleX = -45.0f;
float camPosZ = 5.0f;

int deltaTime = 0;

const float PI = 3.14159265358979323846f;

const string STR_NB_PARTICLES = "NB PARTICLES : ";
const string STR_FPS = "FPS : ";

string strNbParticles = STR_NB_PARTICLES;
string strFps = STR_FPS;

Group* fireGroup = NULL;
Group* smokeGroup = NULL;
Emitter* smokeEmitter = NULL;
System* particleSystem = NULL;

IrrlichtDevice* device = NULL;
scene::ICameraSceneNode* cam = NULL;

bool smokeEnabled = true;

// Input Receiver
class MyEventReceiver : public IEventReceiver
{
    public:
		MyEventReceiver() :
		  IEventReceiver(),
		  init(false)
		  {}

        virtual bool OnEvent(const SEvent& event)
        {
            if(event.EventType==EET_KEY_INPUT_EVENT)
            {
				if(event.KeyInput.Key == KEY_ESCAPE && event.KeyInput.PressedDown==false)
				{
					device->closeDevice();
				}
                if(event.KeyInput.Key == KEY_SPACE && event.KeyInput.PressedDown==false)
                {
                    smokeEnabled=!smokeEnabled;
                    smokeGroup->getEmitter(0)->setActive(smokeEnabled);
                    return true;
                }
                if(event.KeyInput.Key == KEY_DELETE && event.KeyInput.PressedDown==false)
                {
                    particleSystem->empty();
                    return true;
                }
            }
            else if(event.EventType == EET_MOUSE_INPUT_EVENT)
            {
				if (init)
				{
					angleX += (oldMouseX - event.MouseInput.X)*0.1f;
					angleY += (oldMouseY - event.MouseInput.Y)*0.1f;
                    
					if(angleY < 1.0f) angleY=1.0f;
					if(angleY > 70.0f) angleY=70.0f;
					camPosZ -= event.MouseInput.Wheel;
					if(camPosZ < 3.0f) camPosZ=3.0f;
					if(camPosZ > 18.0f) camPosZ=18.0f;

					cam->setPosition(core::vector3df(camPosZ*sinf(angleX*core::DEGTORAD)*sinf((90.0f-angleY)*core::DEGTORAD),
						camPosZ*cosf((90.0f-angleY)*core::DEGTORAD),camPosZ*cosf(angleX*core::DEGTORAD)*sinf((90.0f-angleY)*core::DEGTORAD)));
					cam->setTarget(core::vector3df());
				}

				init = true;
				oldMouseX=event.MouseInput.X;
				oldMouseY=event.MouseInput.Y;

                return true;
            }
            return false;
        }

        int oldMouseX,oldMouseY;

	private :
	
		bool init;
};

// Main function
int main(int argc, char *argv[])
{
	//!IRRLICHT
    video::E_DRIVER_TYPE chosenDriver = video::EDT_OPENGL;
#ifdef _WIN32
	if(MessageBoxA(0,"Do you want to use DirectX 9 ?","SPARK Fire Demo using Irrlicht",MB_YESNO) == 6)
        chosenDriver = video::EDT_DIRECT3D9;
#endif

    //!IRRLICHT
	MyEventReceiver* evtrcv = new MyEventReceiver;
	device = createDevice(chosenDriver,
		core::dimension2d<u32>(640,480),
		32,
		false,
		false,
		false,
		evtrcv);

    video::IVideoDriver* driver = device->getVideoDriver();
    scene::ISceneManager* smgr = device->getSceneManager();
    gui::IGUIEnvironment* guienv = device->getGUIEnvironment();

    device->setWindowCaption(L"SPARK Fire Demo using Irrlicht");
	device->getCursorControl()->setVisible(false);
    cam = smgr->addCameraSceneNode(0,core::vector3df(camPosZ*sinf(angleX*core::DEGTORAD)*sinf((90.0f-angleY)*core::DEGTORAD),
        camPosZ*cosf((90.0f-angleY)*core::DEGTORAD),camPosZ*cosf(angleX*core::DEGTORAD)*sinf((90.0f-angleY)*core::DEGTORAD)),
        core::vector3df());
    cam->setNearValue(0.05f);

	scene::IMesh* sceneryMesh = smgr->getMesh("res/SceneFireCamp.obj");
	scene::ISceneNode* sceneryNode = smgr->addMeshSceneNode(sceneryMesh);
	sceneryNode->setPosition(core::vector3df(0.0f,-1.5f,0.0f));
	sceneryNode->setScale(core::vector3df(0.01f,0.01f,0.01f));

	smgr->setAmbientLight(video::SColorf(0.15f,0.15f,0.25f));

	scene::ILightSceneNode* lightNode = smgr->addLightSceneNode();
	lightNode->setLightType(video::ELT_SPOT);
	video::SLight& lightData = lightNode->getLightData();
	lightData.AmbientColor = video::SColorf(0.0f,0.0f,0.0f);
	lightData.DiffuseColor = video::SColorf(1.0f,0.75f,0.25f);
	lightData.InnerCone = 180.0f;
	lightData.OuterCone = 180.0f;
	lightData.Attenuation.X = 0.0f;
	lightData.Attenuation.Y = 0.0f;

	// random seed
	randomSeed = device->getTimer()->getRealTime();
	// Sets the update step
	System::setClampStep(true,0.1f);			// clamp the step to 100 ms
	System::useAdaptiveStep(0.001f,0.01f);		// use an adaptive step from 1ms to 10ms (1000fps to 100fps)

	// Inits Particle Engine

	// Renderers
	IRRQuadRenderer* fireRenderer = IRRQuadRenderer::create(device);
	fireRenderer->setScale(0.3f,0.3f);
	fireRenderer->setTexture(driver->getTexture("res\\fire2.bmp"));
	fireRenderer->setTexturingMode(TEXTURE_2D);
	fireRenderer->setBlending(BLENDING_ADD);
	fireRenderer->enableRenderingHint(DEPTH_WRITE,false);
	fireRenderer->setAtlasDimensions(2,2);

	IRRQuadRenderer* smokeRenderer = IRRQuadRenderer::create(device);
	smokeRenderer->setScale(0.3f,0.3f);
	smokeRenderer->setTexture(driver->getTexture("res\\explosion.png"));
	smokeRenderer->setTexturingMode(TEXTURE_2D);
	smokeRenderer->setBlending(BLENDING_ALPHA);
	smokeRenderer->enableRenderingHint(DEPTH_WRITE,false);
	smokeRenderer->setAtlasDimensions(2,2);

	// Models
	Model* fireModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA | FLAG_SIZE | FLAG_ANGLE | FLAG_TEXTURE_INDEX,
		FLAG_RED | FLAG_GREEN | FLAG_ALPHA | FLAG_ANGLE,
		FLAG_RED | FLAG_GREEN | FLAG_TEXTURE_INDEX | FLAG_ANGLE,
		FLAG_SIZE);
	fireModel->setParam(PARAM_RED,0.8f,0.9f,0.8f,0.9f);
	fireModel->setParam(PARAM_GREEN,0.5f,0.6f,0.5f,0.6f);
	fireModel->setParam(PARAM_BLUE,0.3f);
	fireModel->setParam(PARAM_ALPHA,0.4f,0.0f);
	fireModel->setParam(PARAM_ANGLE,0.0f,2.0f * PI,0.0f,2.0f * PI);
	fireModel->setParam(PARAM_TEXTURE_INDEX,0.0f,4.0f);
	fireModel->setLifeTime(1.0f,1.5f);

	Interpolator* interpolator = fireModel->getInterpolator(PARAM_SIZE);
	interpolator->addEntry(0.5f,2.0f,5.0f);
	interpolator->addEntry(1.0f,0.0f);

	Model* smokeModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA | FLAG_SIZE | FLAG_ANGLE | FLAG_TEXTURE_INDEX,
		FLAG_RED | FLAG_GREEN | FLAG_SIZE | FLAG_ANGLE,
		FLAG_TEXTURE_INDEX | FLAG_ANGLE,
		FLAG_ALPHA);
	smokeModel->setParam(PARAM_RED,0.3f,0.2f);
	smokeModel->setParam(PARAM_GREEN,0.25f,0.2f);
	smokeModel->setParam(PARAM_BLUE,0.2f);
	smokeModel->setParam(PARAM_ALPHA,0.2f,0.0f);
	smokeModel->setParam(PARAM_SIZE,5.0,10.0f);
	smokeModel->setParam(PARAM_TEXTURE_INDEX,0.0f,4.0f);
	smokeModel->setParam(PARAM_ANGLE,0.0f,2.0f * PI,0.0f,2.0f * PI);
	smokeModel->setLifeTime(5.0f,5.0f);

	interpolator = smokeModel->getInterpolator(PARAM_ALPHA);
	interpolator->addEntry(0.0f,0.0f);
	interpolator->addEntry(0.2f,0.2f);
	interpolator->addEntry(1.0f,0.0f);

	// Emitters
	// The emitters are arranged so that the fire looks realistic
	StraightEmitter* fireEmitter1 = StraightEmitter::create(Vector3D(0.0f,1.0f,0.0f));
	fireEmitter1->setZone(Sphere::create(Vector3D(0.0f,-1.0f,0.0f),0.5f));
	fireEmitter1->setFlow(40);
	fireEmitter1->setForce(1.0f,2.5f);

	StraightEmitter* fireEmitter2 = StraightEmitter::create(Vector3D(1.0f,0.6f,0.0f));
	fireEmitter2->setZone(Sphere::create(Vector3D(0.15f,-1.2f,0.075f),0.1f));
	fireEmitter2->setFlow(15);
	fireEmitter2->setForce(0.5f,1.5f);

	StraightEmitter* fireEmitter3 = StraightEmitter::create(Vector3D(-0.6f,0.8f,-0.8f));
	fireEmitter3->setZone(Sphere::create(Vector3D(-0.375f,-1.15f,-0.375f),0.3f));
	fireEmitter3->setFlow(15);
	fireEmitter3->setForce(0.5f,1.5f);

	StraightEmitter* fireEmitter4 = StraightEmitter::create(Vector3D(-0.8f,0.5f,0.2f));
	fireEmitter4->setZone(Sphere::create(Vector3D(-0.255f,-1.2f,0.225f),0.2f));
	fireEmitter4->setFlow(10);
	fireEmitter4->setForce(0.5f,1.5f);

	StraightEmitter* fireEmitter5 = StraightEmitter::create(Vector3D(0.1f,0.8f,-1.0f));
	fireEmitter5->setZone(Sphere::create(Vector3D(-0.075f,-1.2f,-0.3f),0.2f));
	fireEmitter5->setFlow(10);
	fireEmitter5->setForce(0.5f,1.5f);

	smokeEmitter = SphericEmitter::create(Vector3D(0.0f,1.0f,0.0f),0.0f,0.5f * PI);
	smokeEmitter->setZone(Sphere::create(Vector3D(),1.2f));
	smokeEmitter->setFlow(25);
	smokeEmitter->setForce(0.5f,1.0f);

	// Groups
	fireGroup = Group::create(fireModel,135);
	fireGroup->addEmitter(fireEmitter1);
	fireGroup->addEmitter(fireEmitter2);
	fireGroup->addEmitter(fireEmitter3);
	fireGroup->addEmitter(fireEmitter4);
	fireGroup->addEmitter(fireEmitter5);
	fireGroup->setRenderer(fireRenderer);
	fireGroup->setGravity(Vector3D(0.0f,3.0f,0.0f));
	fireGroup->enableAABBComputing(true);

	smokeGroup = Group::create(smokeModel,135);
	smokeGroup->addEmitter(smokeEmitter);
	smokeGroup->setRenderer(smokeRenderer);
	smokeGroup->setGravity(Vector3D(0.0f,0.4f,0.0f));
	smokeGroup->enableAABBComputing(true);
	
	// System
	particleSystem = IRRSystem::create(smgr->getRootSceneNode(),smgr);
	particleSystem->addGroup(smokeGroup);
	particleSystem->addGroup(fireGroup);
	particleSystem->enableAABBComputing(true);

	// setup some useful variables
	float time=(f32)device->getTimer()->getTime() / 1000.0f,oldtime,deltaTime;
	float step = 0.0f;

	cout << "\nSPARK FACTORY AFTER INIT :" << endl;
	SPKFactory::getInstance().traceAll();

	float lightTime = 0.05f;

	while(device->run())
	{
		oldtime = time;
        time = (f32)device->getTimer()->getTime() / 1000.0f;
        deltaTime = time - oldtime;

		lightTime += deltaTime;
		if (lightTime >= 0.05f)
		{
			float lightIntensity = 1.0f - (random(0.0f,0.05f) * 5.0f);
			lightTime -= lightTime;
			lightNode->setPosition(core::vector3df(random(-0.5f,0.5f),0.5f + random(-0.5f,0.5f),random(-0.5f,0.5f)));
			lightNode->getLightData().Attenuation.Z = 15.0f / lightIntensity;
		}

		driver->beginScene(true, true, video::SColor(0,0,0,0));

		// Renders scene
		smgr->drawAll();

		core::stringw infos; infos+="FPS: "; infos+=driver->getFPS(); infos+=" - Nb Particles: "; infos+=particleSystem->getNbParticles();
        guienv->getBuiltInFont()->draw(infos.c_str(),core::rect<s32>(0,0,170,20),video::SColor(255,255,255,255));

		driver->endScene();

		// clip mouse
        if(device->getCursorControl()->getPosition().X < 20)
        {
            device->getCursorControl()->setPosition(620,device->getCursorControl()->getPosition().Y);
            evtrcv->oldMouseX = 620;
        }
        if(device->getCursorControl()->getPosition().X > 620)
        {
            device->getCursorControl()->setPosition(20,device->getCursorControl()->getPosition().Y);
            evtrcv->oldMouseX = 20;
        }
        if(device->getCursorControl()->getPosition().Y < 20)
        {
            device->getCursorControl()->setPosition(device->getCursorControl()->getPosition().X,460);
            evtrcv->oldMouseY = 460;
        }
        if(device->getCursorControl()->getPosition().Y > 460)
        {
            device->getCursorControl()->setPosition(device->getCursorControl()->getPosition().X,20);
            evtrcv->oldMouseY = 20;
        }
	}

	cout << "\nSPARK FACTORY BEFORE DESTRUCTION :" << endl;
	SPKFactory::getInstance().traceAll();
	SPKFactory::getInstance().destroyAll();
	cout << "\nSPARK FACTORY AFTER DESTRUCTION :" << endl;
	SPKFactory::getInstance().traceAll();
	device->drop();

	cout << endl;
	system("pause"); // Waits for the user to close the console

	return 0;
}