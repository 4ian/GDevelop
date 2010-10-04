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

#include <SDL.h>

#include <FTGL/ftgl.h>

#include "SPK.h"
#include "SPK_GL.h"

using namespace std;
using namespace SPK;
using namespace SPK::GL;

float angleY = 0.0f;
float angleX = 12.0f;
float rainRatio = 0.5f;

int deltaTime = 0;

float posX = 0.0f;
float posZ = 0.0f;

GLuint texturePaving = 0;
FTGLTextureFont* fontPtr = NULL;

Group* rainGroup = NULL;
Group* dropGroup = NULL;
Group* splashGroup = NULL;
System* particleSystem = NULL;
Emitter* dropEmitter = NULL;

const float PI = 3.14159265358979323846f;

const string STR_RAIN_RATE = "RAIN INTENSITY : ";
const string STR_NB_PARTICLES = "NB PARTICLES : ";
const string STR_FPS = "FPS : ";

string strRainRate = STR_RAIN_RATE;
string strNbParticles = STR_NB_PARTICLES;
string strFps = STR_FPS;

int screenWidth = 0;
int screenHeight = 0;
float screenRatio = 0.0f;

int drawText = 2;
bool renderEnv = true;

// Converts an int into a string
string int2Str(int a)
{
    ostringstream stm;
    stm << a;
    return stm.str();
}

// Loads a texture
bool loadTexture(GLuint& index,char* path,GLuint type,GLuint clamp,bool mipmap)
{
	SDL_Surface *particleImg; 
	particleImg = SDL_LoadBMP(path);
	if (particleImg == NULL)
	{
		cout << "Unable to load bitmap :" << SDL_GetError() << endl;
		return false;
	}

	// converts from BGR to RGB
	if ((type == GL_RGB)||(type == GL_RGBA))
	{
		const int offset = (type == GL_RGB ? 3 : 4);
		unsigned char* iterator = static_cast<unsigned char*>(particleImg->pixels);
		unsigned char *tmp0,*tmp1;
		for (int i = 0; i < particleImg->w * particleImg->h; ++i)
		{
			tmp0 = iterator;
			tmp1 = iterator + 2;
			swap(*tmp0,*tmp1);
			iterator += offset;
		}
	}

	glGenTextures(1,&index);
	glBindTexture(GL_TEXTURE_2D,index);

	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_S,clamp);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_T,clamp);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_LINEAR);

	if (mipmap)
	{
		glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_LINEAR_MIPMAP_LINEAR);

		gluBuild2DMipmaps(GL_TEXTURE_2D,
			type,
			particleImg->w,
			particleImg->h,
			type,
			GL_UNSIGNED_BYTE,
			particleImg->pixels);
	}
	else
	{
		glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_LINEAR);

		glTexImage2D(GL_TEXTURE_2D,
			0,
			type,
			particleImg->w,
			particleImg->h,
			0,
			type,
			GL_UNSIGNED_BYTE,
			particleImg->pixels);
	}

	SDL_FreeSurface(particleImg);

	return true;
}

// Draws the bounding box for a particle group
void drawBoundingBox(const Group& group)
{
	if (!group.isAABBComputingEnabled())
		return;

	Vector3D AABBMin = group.getAABBMin();
	Vector3D AABBMax = group.getAABBMax();

	glDisable(GL_TEXTURE_2D);
	glBegin(GL_LINES);
	glColor3f(1.0f,0.0f,0.0f);

	glVertex3f(AABBMin.x,AABBMin.y,AABBMin.z);
	glVertex3f(AABBMax.x,AABBMin.y,AABBMin.z);
	
	glVertex3f(AABBMin.x,AABBMin.y,AABBMin.z);
	glVertex3f(AABBMin.x,AABBMax.y,AABBMin.z);

	glVertex3f(AABBMin.x,AABBMin.y,AABBMin.z);
	glVertex3f(AABBMin.x,AABBMin.y,AABBMax.z);

	glVertex3f(AABBMax.x,AABBMax.y,AABBMax.z);
	glVertex3f(AABBMin.x,AABBMax.y,AABBMax.z);

	glVertex3f(AABBMax.x,AABBMax.y,AABBMax.z);
	glVertex3f(AABBMax.x,AABBMin.y,AABBMax.z);

	glVertex3f(AABBMax.x,AABBMax.y,AABBMax.z);
	glVertex3f(AABBMax.x,AABBMax.y,AABBMin.z);

	glVertex3f(AABBMin.x,AABBMin.y,AABBMax.z);
	glVertex3f(AABBMax.x,AABBMin.y,AABBMax.z);

	glVertex3f(AABBMin.x,AABBMin.y,AABBMax.z);
	glVertex3f(AABBMin.x,AABBMax.y,AABBMax.z);

	glVertex3f(AABBMin.x,AABBMax.y,AABBMin.z);
	glVertex3f(AABBMax.x,AABBMax.y,AABBMin.z);

	glVertex3f(AABBMin.x,AABBMax.y,AABBMin.z);
	glVertex3f(AABBMin.x,AABBMax.y,AABBMax.z);

	glVertex3f(AABBMax.x,AABBMin.y,AABBMin.z);
	glVertex3f(AABBMax.x,AABBMax.y,AABBMin.z);

	glVertex3f(AABBMax.x,AABBMin.y,AABBMin.z);
	glVertex3f(AABBMax.x,AABBMin.y,AABBMax.z);
	glEnd();
}

// Gets the values of a param function of the rain intensity
template<class T>
T param(T min,T max)
{
	return static_cast<T>(min + rainRatio * (max - min));
}

void renderFirstFrame()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	SDL_GL_SwapBuffers();
	SDL_GL_SwapBuffers();
}

// Renders the scene
void render()
{
	glDepthMask(GL_TRUE);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(45,screenRatio,0.01f,20.0f);

	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();                       

	glRotatef(angleX,1.0f,0.0f,0.0f);
	glRotatef(angleY,0.0f,1.0f,0.0f);
	glTranslatef(-posX,-1.0f,-posZ);	
	
	if (renderEnv)
	{
		float bgColor = param(0.8f,0.2f);
		float color[4] = {bgColor,bgColor,bgColor,1.0f};
		glFogfv(GL_FOG_COLOR,color);

		float dist = param(20.0f,5.0f);

		glFogf(GL_FOG_DENSITY,2.0f / dist);
	
		// Renders floor
		glDisable(GL_BLEND);
		glEnable(GL_TEXTURE_2D);
		glTexEnvi(GL_TEXTURE_ENV,GL_TEXTURE_ENV_MODE,GL_MODULATE);
		glBindTexture(GL_TEXTURE_2D,texturePaving);
		glBegin(GL_QUADS);
		glColor3f(param(1.0f,0.3f),param(1.0f,0.3f),param(1.0f,0.3f));
		glTexCoord2f(dist + posX,dist + posZ);
		glVertex3f(dist + posX,0.0f,dist + posZ);
		glTexCoord2f(dist + posX,-dist + posZ);
		glVertex3f(dist + posX,0.0f,-dist + posZ);
		glTexCoord2f(-dist + posX,-dist + posZ);
		glVertex3f(-dist  + posX,0.0f,-dist + posZ);
		glTexCoord2f(-dist + posX,dist + posZ);
		glVertex3f(-dist  + posX,0.0f,dist + posZ);
		glEnd();
		glDisable(GL_TEXTURE_2D);
	}

	glLineWidth(1.0f);
	drawBoundingBox(*rainGroup);
	drawBoundingBox(*dropGroup);
	drawBoundingBox(*splashGroup);

	// Renders particle system
	particleSystem->render();

	if (drawText != 0)
	{
		glMatrixMode(GL_MODELVIEW);
		glLoadIdentity();

		glMatrixMode(GL_PROJECTION);
		glLoadIdentity();
		gluOrtho2D(0,screenWidth,0,screenHeight);

		// Renders info strings
		glDisable(GL_DEPTH_TEST);
		glColor3f(1.0f,1.0f,1.0f);
		if (drawText == 2)
		{
			fontPtr->Render(strRainRate.c_str(),-1,FTPoint(4.0f,72.0f));
			fontPtr->Render(strNbParticles.c_str(),-1,FTPoint(4.0f,40.0f));
		}
		fontPtr->Render(strFps.c_str(),-1,FTPoint(4.0f,8.0f));
	}

	SDL_GL_SwapBuffers();
}

// Call back function to destroy rain particles when it touches the ground and create splash
bool killRain(Particle& particle,float deltaTime)
{
	if (particle.position().y <= 0.0f)
	{
		particle.position().set(particle.position().x,0.01f,particle.position().z);
		splashGroup->addParticles(1,particle.position(),Vector3D());
		dropGroup->addParticles(param(2,8),particle.position(),dropEmitter);
		return true;
	}
	return false;
}

// Main function
int main(int argc, char *argv[])
{
	// random seed
	randomSeed = static_cast<unsigned int>(time(NULL));

	// Sets the update step
	System::setClampStep(true,0.1f);			// clamp the step to 100 ms
	System::useAdaptiveStep(0.001f,0.01f);		// use an adaptive step from 1ms to 10ms (1000fps to 100fps)

	SDL_Event event;

	// inits SDL
	SDL_Init(SDL_INIT_VIDEO);
	SDL_WM_SetCaption("SPARK Rain Demo",NULL);
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER,1);

	// AA
	SDL_GL_SetAttribute(SDL_GL_MULTISAMPLEBUFFERS,1);
	SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES,4);
	
	// vsync
	SDL_GL_SetAttribute(SDL_GL_SWAP_CONTROL,0);

	SDL_SetVideoMode(0,0,32,SDL_OPENGL | SDL_FULLSCREEN);
	SDL_ShowCursor(0);

	SDL_Surface screen = *SDL_GetVideoSurface();
	renderFirstFrame();

	// inits openGL
	screenWidth = screen.w;
	screenHeight = screen.h;
	screenRatio = (float)screen.w / (float)screen.h;

	glClearColor(0.8f,0.8f,0.8f,0.0f);
	glViewport(0,0,screen.w,screen.h);

	glDisable(GL_DEPTH);
	glDisable(GL_DEPTH_TEST);

	// Loads paving texture
	if (!loadTexture(texturePaving,"res/paving.bmp",GL_RGB,GL_REPEAT,true))
		return 1;

	// Loads splash texture
	GLuint textureSplash;
	if (!loadTexture(textureSplash,"res/waterdrops.bmp",GL_ALPHA,GL_CLAMP,false))
		return 1;

	// Inits fog
	glEnable(GL_FOG);
	glFogi(GL_FOG_MODE, GL_EXP2);

	// Loads texture font
	FTGLTextureFont font = FTGLTextureFont("res/font.ttf");
	if(font.Error())
		return 1;
	font.FaceSize(24);
	fontPtr = &font;

	// Inits Particle Engine
	Vector3D gravity = Vector3D(0.0f,-2.0f,0.0f);

	// Renderers
	// the size ratio is used with renderers whose size are defined in pixels. This is to adapt to any resolution
	float sizeRatio = static_cast<float>(screenWidth) / 1440;

	GLPointRenderer* basicRenderer = GLPointRenderer::create();

	// point renderer
	GLPointRenderer* dropRenderer = GLPointRenderer::create();
	dropRenderer->setType(POINT_CIRCLE);
	dropRenderer->setSize(2.0f * sizeRatio);
	dropRenderer->enableBlending(true);

	// line renderer
	GLLineRenderer* rainRenderer = GLLineRenderer::create();
	rainRenderer->setLength(-0.1f);
	rainRenderer->enableBlending(true);

	// quad renderer
	GLQuadRenderer* splashRenderer = GLQuadRenderer::create();
	splashRenderer->setScale(0.05f,0.05f);
	splashRenderer->setTexturingMode(TEXTURE_2D);
	splashRenderer->setTexture(textureSplash);
	splashRenderer->enableBlending(true);
	splashRenderer->enableRenderingHint(DEPTH_WRITE,false);
	
	// Models
	// rain model
	Model* rainModel = Model::create(FLAG_GREEN | FLAG_RED | FLAG_BLUE | FLAG_ALPHA | FLAG_MASS,
		0,
		FLAG_MASS);

	rainModel->setParam(PARAM_ALPHA,0.2f);
	rainModel->setImmortal(true);

	// drop model
	Model* dropModel = Model::create(FLAG_GREEN | FLAG_RED | FLAG_BLUE | FLAG_ALPHA | FLAG_MASS,
		0,
		FLAG_MASS);

	dropModel->setParam(PARAM_ALPHA,0.6f);

	// splash model
	Model* splashModel = Model::create(FLAG_GREEN | FLAG_RED | FLAG_BLUE | FLAG_ALPHA | FLAG_SIZE | FLAG_ANGLE,
		FLAG_SIZE | FLAG_ALPHA,
		FLAG_SIZE | FLAG_ANGLE);

	splashModel->setParam(PARAM_ANGLE,0.0f,2.0f * PI);
	splashModel->setParam(PARAM_ALPHA,1.0f,0.0f);

	// rain emitter
	//AABox* rainZone = AABox::create(Vector3D(0.0f,5.0f,0.0f));
	Ring* rainZone = Ring::create(Vector3D(0.0f,5.0f,0.0f));
	SphericEmitter* rainEmitter = SphericEmitter::create(Vector3D(0.0f,-1.0f,0.0f),0.0f,0.03f * PI);
	rainEmitter->setZone(rainZone);

	// drop emitter
	dropEmitter = SphericEmitter::create(Vector3D(0.0f,1.0f,0.0f),0.0f,0.2f * PI);

	// Groups
	// rain group
	rainGroup = Group::create(rainModel,8000);
	rainGroup->setCustomUpdate(&killRain);
	rainGroup->setRenderer(rainRenderer);
	rainGroup->addEmitter(rainEmitter);
	rainGroup->setFriction(0.7f);
	rainGroup->setGravity(gravity);

	// drop group
	dropGroup = Group::create(dropModel,16000);
	dropGroup->setRenderer(dropRenderer);
	dropGroup->setFriction(0.7f);
	dropGroup->setGravity(gravity);

	// splash group
	splashGroup = Group::create(splashModel,2400);
	splashGroup->setRenderer(splashRenderer);

	// System
	particleSystem = System::create();
	particleSystem->addGroup(splashGroup);
	particleSystem->addGroup(dropGroup);
	particleSystem->addGroup(rainGroup);
	
	bool exit = false;
	bool recompute = true;
	bool paused = false;

	// renderValue :
	// 0 : normal
	// 1 : basic render
	// 2 : no render
	unsigned int renderValue = 0;

	cout << "\nSPARK FACTORY AFTER INIT :" << endl;
	SPKFactory::getInstance().traceAll();

	SDL_Delay(3000);
	while (SDL_PollEvent(&event)){}
	
	std::deque<unsigned int> frameFPS;
	frameFPS.push_back(SDL_GetTicks());

	while(!exit)
	{
		Uint8* keyState = SDL_GetKeyState(NULL);

		if (!paused)
		{
			// Changes the rain intensity rate
			if (keyState[SDLK_PLUS] || keyState[SDLK_KP_PLUS])
			{
				rainRatio += deltaTime * 0.0001f;
				rainRatio = min(1.0f,rainRatio);
				recompute = true;
			}
			if (keyState[SDLK_MINUS] || keyState[SDLK_KP_MINUS])
			{
				rainRatio -= deltaTime * 0.0001f;
				rainRatio = max(0.0f,rainRatio);
				recompute = true;
			}
		}

		// Allows the camera to move into the infinite universe
		bool move = false;
		if (keyState[SDLK_UP] || keyState[SDLK_w])
		{
			posX += 0.001f * deltaTime * sin(angleY * PI / 180.0f);
			posZ += -0.001f * deltaTime * cos(angleY * PI / 180.0f);
			move = true;
		}

		if (keyState[SDLK_DOWN] || keyState[SDLK_s])
		{
			posX += -0.001f * deltaTime * sin(angleY * PI / 180.0f);
			posZ += 0.001f * deltaTime * cos(angleY * PI / 180.0f);	
			move = true;
		}

		if (keyState[SDLK_LEFT] || keyState[SDLK_a])
		{
			posX += -0.001f * deltaTime * cos(angleY * PI / 180.0f);
			posZ += -0.001f * deltaTime * sin(angleY * PI / 180.0f);
			move = true;
		}

		if (keyState[SDLK_RIGHT] || keyState[SDLK_d])
		{
			posX += 0.001f * deltaTime * cos(angleY * PI / 180.0f);
			posZ += 0.001f * deltaTime * sin(angleY * PI / 180.0f);	
			move = true;
		}

		if (move)
			rainZone->setPosition(Vector3D(posX,5.0f,posZ));


		while (SDL_PollEvent(&event))
		{
			// if esc is pressed, exit
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_ESCAPE))
				exit = true;

			// if del is pressed, reinit the system
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_DELETE))
				particleSystem->empty();

			// if F1 is pressed, we display or not the text
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F1))
			{
				--drawText;
				if (drawText < 0)
					drawText = 2;
			}

			// if F2 is pressed, we display or not the bounding boxes
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F2))
			{
				rainGroup->enableAABBComputing(!rainGroup->isAABBComputingEnabled());
				dropGroup->enableAABBComputing(!dropGroup->isAABBComputingEnabled());
				splashGroup->enableAABBComputing(!splashGroup->isAABBComputingEnabled());

				if (paused)
					particleSystem->computeAABB();
			}

			// if F4 is pressed, the renderers are changed
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F4))
			{
				renderValue = (renderValue + 1) % 3;

				switch (renderValue)
				{
				case 0 :
					rainGroup->setRenderer(rainRenderer);
					dropGroup->setRenderer(dropRenderer);
					splashGroup->setRenderer(splashRenderer);
					break;

				case 1 :
					rainGroup->setRenderer(basicRenderer);
					dropGroup->setRenderer(basicRenderer);
					splashGroup->setRenderer(basicRenderer);
					break;

				case 2 :
					rainGroup->setRenderer(NULL);
					dropGroup->setRenderer(NULL);
					splashGroup->setRenderer(NULL);
					break;
				}
			}

			// if F5 is pressed, environment is rendered are not
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F5))
			{
				renderEnv = !renderEnv;
				if (renderEnv)
				{
					float bgColor = param(0.8f,0.2f);
					glClearColor(bgColor,bgColor,bgColor,1.0f);
					glEnable(GL_FOG);
				}
				else
				{
					glClearColor(0.0f,0.0f,0.0f,0.0f);
					glDisable(GL_FOG);
				}
			}

			// if pause is pressed, the system is paused
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_PAUSE))
				paused = !paused;
				
			// Moves the camera with the mouse
			if (event.type == SDL_MOUSEMOTION)
			{
				angleY += event.motion.xrel * 0.05f;
				angleX += event.motion.yrel * 0.05f;
				angleX = min(90.0f,max(-90.0f,angleX)); 
			}
		}

		if (!paused)
		{
			// if the ratio rate has changed, recompute the particule system parameters
			if (recompute)
			{
				strRainRate = STR_RAIN_RATE + int2Str((int)(rainRatio * 100.0f)) + "%";

				if (renderEnv)
				{
					float bgColor = param(0.8f,0.2f);
					glClearColor(bgColor,bgColor,bgColor,1.0f);
				}

				rainModel->setParam(PARAM_RED,param(1.0f,0.40f));
				rainModel->setParam(PARAM_GREEN,param(1.0f,0.40f));
				rainModel->setParam(PARAM_BLUE,param(1.0f,0.42f));
				rainModel->setParam(PARAM_MASS,param(0.4f,0.8f),param(0.8f,1.6f));

				dropModel->setParam(PARAM_RED,param(1.0f,0.40f));
				dropModel->setParam(PARAM_GREEN,param(1.0f,0.40f));
				dropModel->setParam(PARAM_BLUE,param(1.0f,0.42f));
				dropModel->setParam(PARAM_MASS,param(0.4f,0.8f),param(3.0f,4.0f));
				dropModel->setLifeTime(param(0.05f,0.3f),param(0.1f,0.5f));

				splashModel->setParam(PARAM_RED,param(1.0f,0.40f));
				splashModel->setParam(PARAM_GREEN,param(1.0f,0.40f));
				splashModel->setParam(PARAM_BLUE,param(1.0f,0.42f));
				splashModel->setParam(PARAM_SIZE,0.0f,0.0f,param(0.375f,2.25f),param(0.75f,3.78f));
				splashModel->setLifeTime(param(0.2f,0.3f),param(0.4f,0.5f));

				rainEmitter->setFlow(param(0.0f,4800.0f));
				rainEmitter->setForce(param(3.0f,5.0f),param(6.0f,10.0f));
				rainZone->setRadius(0.0f,param(20.0f,5.0f));
				//rainZone->setDimension(Vector3D(param(40.0f,10.0f),0.0f,param(40.0f,10.0f)));

				dropEmitter->setForce(param(0.1f,1.0f),param(0.2f,2.0f));

				dropRenderer->setSize(param(1.0f,3.0f) * sizeRatio);
				rainRenderer->setWidth(param(1.0f,4.0f) * sizeRatio);
				recompute = false;
			}

			// Updates particle system
			particleSystem->update(deltaTime * 0.001f); // 1 defined as a second
		}

		// Renders scene
		render();

		// Computes delta time
		int time = SDL_GetTicks();
		deltaTime = time - frameFPS.back();
		
		frameFPS.push_back(time);

		while((frameFPS.back() - frameFPS.front() > 1000)&&(frameFPS.size() > 2))
			frameFPS.pop_front();

		// Updates info strings
		strNbParticles = STR_NB_PARTICLES + int2Str(particleSystem->getNbParticles());
		int fps = static_cast<int>(((frameFPS.size() - 1) * 1000.0f) / (frameFPS.back() - frameFPS.front()));
		if (drawText == 2)
			strFps = STR_FPS + int2Str(fps);	
		else
			strFps = int2Str(fps);
	}

	cout << "\nSPARK FACTORY BEFORE DESTRUCTION :" << endl;
	SPKFactory::getInstance().traceAll();
	SPKFactory::getInstance().destroyAll();
	cout << "\nSPARK FACTORY AFTER DESTRUCTION :" << endl;
	SPKFactory::getInstance().traceAll();
	SDL_Quit();

	cout << endl;
	system("pause"); // Waits for the user to close the console

	return 0;
}