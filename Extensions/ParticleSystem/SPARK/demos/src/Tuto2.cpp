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


#include <cmath>
#include <iostream>
#include <sstream>
#include <string>
#include <ctime>

#if defined(WIN32) || defined(_WIN32)
#include <windows.h>
#endif
#include <GL/gl.h>
#include <GL/glu.h>

#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>

#include <SPK.h>
#include <SPK_SFML.h>

#include "Tuto2/Car.h"

using namespace std;

using namespace sf;

float angleY = 0.0f;
float camPosZ = 5.0f;

int deltaTime = 0;

const string STR_NB_PARTICLES = "NB PARTICLES : ";
const string STR_FPS = "FPS : ";

String strNbParticles(STR_NB_PARTICLES);
String strFps(STR_FPS);

int screenWidth;
int screenHeight;
int universeHeight;
int universeWidth ;

int drawText = 2;

Clock timer;

View hudView;
View worldView;

deque<SPK::SFML::SFMLSystem*> collisionParticleSystems;

SPK::SPK_ID BaseSparkSystemID = SPK::NO_ID;
Image textureGround;

static const size_t NB_CARS = 4;
Car car[NB_CARS];

// Converts an int into a string
string int2Str(int a)
{
    ostringstream stm;
    stm << a;
    return stm.str();
}

// Converts a HSV color to RGB
// h E [0,360]
// s E [0,1]
// v E [0,1]
SPK::Vector3D convertHSV2RGB(const SPK::Vector3D& hsv)
{
	float h = hsv.x;
	float s = hsv.y;
	float v = hsv.z;

	int hi = static_cast<int>(h / 60.0f) % 6;
	float f = h / 60.0f - hi;
	float p = v * (1.0f - s);
	float q = v * (1.0f - f * s);
	float t = v * (1.0f - (1.0f - f) * s);

	switch(hi)
	{
	case 0 : return SPK::Vector3D(v,t,p);
	case 1 : return SPK::Vector3D(q,v,p);
	case 2 : return SPK::Vector3D(p,v,t);
	case 3 : return SPK::Vector3D(p,q,v);
	case 4 : return SPK::Vector3D(t,p,v);
	default : return SPK::Vector3D(v,p,q);
	}
}

// Renders the scene
void render(RenderWindow& window)
{
	window.Clear();
	window.SetView(worldView);

	// Draws ground
	textureGround.Bind();
	glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT ); 
	glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT );
	glBegin(GL_QUADS);
	glColor3f(1.0f,1.0f,1.0f);
	glTexCoord2f(0.0f,0.0f);
	glVertex2f(0.0f,0.0f);
	glTexCoord2f(universeWidth / 128.0f,0.0f);
	glVertex2f((float)universeWidth,0.0f);
	glTexCoord2f(universeWidth / 128.0f,universeHeight / 128.0f);
	glVertex2f((float)universeWidth,(float)universeHeight);
	glTexCoord2f(0.0f,universeHeight / 128.0f);
	glVertex2f(0.0f,(float)universeHeight);
	glEnd();

	for (size_t i = 0; i < NB_CARS; ++i)
		window.Draw(car[i].getSprite());

	for (size_t i = 0; i < NB_CARS; ++i)
		window.Draw(car[i].getParticleSystem());

	// Draws particles
	for (deque<SPK::SFML::SFMLSystem*>::const_iterator it = collisionParticleSystems.begin(); it != collisionParticleSystems.end(); ++it)
		window.Draw(**it);

//	glDisable(GL_ALPHA_TEST);

	if (drawText != 0)
	{
		window.SetView(hudView);
		
		// Renders info strings
		if (drawText == 2)
			window.Draw(strNbParticles);
		window.Draw(strFps);
	}

	window.Display();
}

// creates and register the base system
SPK::SPK_ID createParticleSystemBase(Image* texture)
{
	// Creates the model
	SPK::Model* sparkModel = SPK::Model::create(SPK::FLAG_RED | SPK::FLAG_GREEN | SPK::FLAG_BLUE | SPK::FLAG_ALPHA,
		SPK::FLAG_ALPHA,
		SPK::FLAG_GREEN | SPK::FLAG_BLUE);
	sparkModel->setParam(SPK::PARAM_RED,1.0f);
	sparkModel->setParam(SPK::PARAM_BLUE,0.0f,0.2f);
	sparkModel->setParam(SPK::PARAM_GREEN,0.2f,1.0f);
	sparkModel->setParam(SPK::PARAM_ALPHA,0.8f,0.0f);
	sparkModel->setLifeTime(0.2f,0.6f);

	// Creates the renderer
	SPK::SFML::SFMLLineRenderer* sparkRenderer = SPK::SFML::SFMLLineRenderer::create(0.1f,1.0f);
	sparkRenderer->setBlendMode(sf::Blend::Add);
	sparkRenderer->setGroundCulling(true);

	// Creates the zone
	SPK::Sphere* sparkSource = SPK::Sphere::create(SPK::Vector3D(0.0f,0.0f,10.0f),5.0f);

	// Creates the emitter
	SPK::SphericEmitter* sparkEmitter = SPK::SphericEmitter::create(SPK::Vector3D(0.0f,0.0f,1.0f),3.14159f / 4.0f,3.0f * 3.14159f / 4.0f);
	sparkEmitter->setForce(50.0f,150.0f);
	sparkEmitter->setZone(sparkSource);
	sparkEmitter->setTank(25);
	sparkEmitter->setFlow(-1);

	// Creates the Group
	SPK::Group* sparkGroup = SPK::Group::create(sparkModel,25);
	sparkGroup->setRenderer(sparkRenderer);
	sparkGroup->addEmitter(sparkEmitter);
	sparkGroup->setGravity(SPK::Vector3D(0.0f,0.0f,-200.0f));
	sparkGroup->setFriction(2.0f);

	// Creates the System
	SPK::SFML::SFMLSystem* sparkSystem = SPK::SFML::SFMLSystem::create();
	sparkSystem->addGroup(sparkGroup);

	// Defines which objects will be shared by all systems
	sparkModel->setShared(true);
	sparkRenderer->setShared(true);

	// Creates the base and gets the ID
	return sparkSystem->getID();
}

// creates a particle system from the base system
SPK::SFML::SFMLSystem* createParticleSystem(const Vector2f& pos)
{
	SPK::SFML::SFMLSystem* sparkSystem = SPK_Copy(SPK::SFML::SFMLSystem,BaseSparkSystemID);
	sparkSystem->SetPosition(pos);

	return sparkSystem;
}

// destroy a particle system
void destroyParticleSystem(SPK::SFML::SFMLSystem*& system)
{
	SPK_Destroy(system);
	system = NULL;
}

// Main function
int main(int argc, char *argv[])
{
	// inits SFML
	RenderWindow window(VideoMode::GetDesktopMode(),"SPARK Tutorial 2",Style::Fullscreen);
	//window.SetSize(640,480);
	window.UseVerticalSync(false);
	window.ShowMouseCursor(false);
	window.EnableKeyRepeat(false);
	window.Clear();
	window.Display();

	screenWidth = window.GetWidth();
	screenHeight = window.GetHeight();

	universeWidth = 1440;
	universeHeight = (1440 * screenHeight) / screenWidth;
		
	// Views
	worldView = window.GetDefaultView();
	hudView = window.GetDefaultView();
	
	worldView.SetHalfSize(universeWidth / 2.0f,universeHeight / 2.0f);
	worldView.SetCenter(universeWidth / 2.0f,universeHeight / 2.0f);
	window.SetView(worldView);

	// Loads font
	Font font;
	if (!font.LoadFromFile("res/font.ttf"))
		return 1;

	// Inits SFML Strings
	strNbParticles.SetFont(font);
	strFps.SetFont(font);

	strNbParticles.SetSize(24.0f);
	strFps.SetSize(24.0f);

	strNbParticles.SetPosition(4.0f,screenHeight - 40.0f - 24.0f);
	strFps.SetPosition(4.0f,screenHeight - 8.0f - 24.0f);

	// Loads earth texture
	if (!textureGround.LoadFromFile("res/earth.png"))
		return 1;

	// Loads particle texture
	Image textureParticle;
	if (!textureParticle.LoadFromFile("res/flare.png"))
		return 1;

	// Loads smoke texture
	Image textureSmoke;
	if (!textureSmoke.LoadFromFile("res/smoke2.png"))
		return 1;

	// random seed
	SPK::randomSeed = static_cast<unsigned int>(time(NULL));

	// Sets the update step
	SPK::System::setClampStep(true,0.1f);			// clamp the step to 100 ms
	SPK::System::useAdaptiveStep(0.001f,0.01f);		// use an adaptive step from 1ms to 10ms (1000fps to 100fps)

	if (!Car::loadCarTexture())
		return 1;
	Car::loadBaseParticleSystem(textureSmoke);
	Car::setCollisionBox(worldView.GetRect());
	
	for (size_t i = 0; i < NB_CARS; ++i)
	{
		Vector2f pos(
			Randomizer::Random(64.0f,window.GetWidth() - 64.0f),
			Randomizer::Random(64.0f,window.GetHeight() - 64.0f));
		car[i].init(i & 3,pos);
	}

	// creates the base system
	SPK::SFML::SFMLRenderer::setZFactor(1.0f);
	SPK::SFML::setCameraPosition(SPK::SFML::CAMERA_CENTER,SPK::SFML::CAMERA_BOTTOM,static_cast<float>(universeHeight),0.0f);
	BaseSparkSystemID = createParticleSystemBase(&textureParticle);
	
	bool exit = false;
	bool paused = false;

	cout << "\nSPARK FACTORY AFTER INIT :" << endl;
	SPK::SPKFactory::getInstance().traceAll();
	
	Sleep(3.0f);

	std::deque<unsigned int> frameFPS;
	frameFPS.push_back(static_cast<unsigned int>(timer.GetElapsedTime() * 1000.0f));

	float spacePressed = -1.0f;

	while(!exit)
	{
		Event event;
        while (window.GetEvent(event))
		{
			// if esc is pressed, exit
			if ((event.Type == Event::KeyPressed)&&(event.Key.Code == Key::Escape))
				exit = true;

			// if F1 is pressed, we display or not the text
			if ((event.Type == Event::KeyPressed)&&(event.Key.Code == Key::F1))
			{
				--drawText;
				if (drawText < 0)
					drawText = 2;
			}

			// if pause is pressed, the system is paused
			if ((event.Type == Event::KeyPressed)&&(event.Key.Code == Key::Pause))
				paused = !paused;
		}

		if (!paused)
		{
			for (size_t i = 0; i < NB_CARS; ++i)
			{
				Vector2f collisionPos;
				car[i].update(deltaTime * 0.001f);
				if (car[i].checkCollisionWithBox(collisionPos))
					collisionParticleSystems.push_back(createParticleSystem(collisionPos));
				
			}

			for (size_t i = 0; i < NB_CARS; ++i)
				for (size_t j = i + 1; j < NB_CARS; ++j)
				{
					Vector2f collisionPos;
					if (car[i].checkCollisionWithCar(car[j],collisionPos))
						collisionParticleSystems.push_back(createParticleSystem(collisionPos));	
				}

			deque<SPK::SFML::SFMLSystem*>::iterator it = collisionParticleSystems.begin();
			while(it != collisionParticleSystems.end())
			{
				if (!(*it)->update(deltaTime * 0.001f))
				{
					destroyParticleSystem(*it);
					it = collisionParticleSystems.erase(it);
				}
				else
					++it;
			}
		}

		// Renders scene
		render(window);

		// Computes delta time
		int time = static_cast<unsigned int>(timer.GetElapsedTime() * 1000.0f);
		deltaTime = time - frameFPS.back();

		frameFPS.push_back(time);

		while((frameFPS.back() - frameFPS.front() > 1000)&&(frameFPS.size() > 2))
			frameFPS.pop_front();

		// Updates info strings
		unsigned int nbParticles = 0;
		for (size_t i = 0; i < NB_CARS; ++i)
			nbParticles += car[i].getParticleSystem().getNbParticles();
		for (deque<SPK::SFML::SFMLSystem*>::const_iterator it = collisionParticleSystems.begin(); it != collisionParticleSystems.end(); ++it)
			nbParticles += (*it)->getNbParticles();
		strNbParticles.SetText(STR_NB_PARTICLES + int2Str(nbParticles));
		int fps = static_cast<int>(((frameFPS.size() - 1) * 1000.0f) / (frameFPS.back() - frameFPS.front()));
		if (drawText == 2)
			strFps.SetText(STR_FPS + int2Str(fps));	
		else
			strFps.SetText(int2Str(fps));
	}

	cout << "\nSPARK FACTORY BEFORE DESTRUCTION :" << endl;
	SPK::SPKFactory::getInstance().traceAll();
	SPK::SPKFactory::getInstance().destroyAll();
	cout << "\nSPARK FACTORY AFTER DESTRUCTION :" << endl;
	SPK::SPKFactory::getInstance().traceAll();
	window.Close();

	cout << endl;
	system("pause"); // Waits for the user to close the console
	
	return 0;
}