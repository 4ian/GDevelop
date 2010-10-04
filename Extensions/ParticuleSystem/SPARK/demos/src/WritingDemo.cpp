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
float angleX = 0.0f;
float camPosZ = 5.0f;

int deltaTime = 0;

Group* particleGroup = NULL;
System* particleSystem = NULL;

FTGLTextureFont* fontPtr;

const float PI = 3.14159265358979323846f;

const string STR_NB_PARTICLES = "NB PARTICLES : ";
const string STR_FPS = "FPS : ";

string strNbParticles = STR_NB_PARTICLES;
string strFps = STR_FPS;

int screenWidth;
int screenHeight;
float screenRatio;

int drawText = 2;

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
	glEnable(GL_DEPTH_TEST);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(45.0f,screenRatio,0.01f,80.0f);

	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();                       

	glTranslatef(0.0f,0.0f,-camPosZ);

	glDisable(GL_BLEND);
	drawBoundingBox(*particleGroup);

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
			fontPtr->Render(strNbParticles.c_str(),-1,FTPoint(4.0f,40.0f));
		fontPtr->Render(strFps.c_str(),-1,FTPoint(4.0f,8.0f));
	}

	SDL_GL_SwapBuffers();
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
	SDL_WM_SetCaption("SPARK Writing Demo",NULL);
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER,1);

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
	
	glClearColor(0.0f,0.0f,0.0f,1.0f);
	glViewport(0,0,screen.w,screen.h);

	// Loads texture font
	FTGLTextureFont font = FTGLTextureFont("res/font.ttf");
	if(font.Error())
		return 1;
	font.FaceSize(24);
	fontPtr = &font;

	// Loads particle texture
	GLuint textureParticle;
	if (!loadTexture(textureParticle,"res/point.bmp",GL_ALPHA,GL_CLAMP,false))
		return 1;

	// Inits Particle Engine
	// Renderers
	GLPointRenderer* basicRenderer = GLPointRenderer::create();

	GLQuadRenderer* particleRenderer = GLQuadRenderer::create();
	particleRenderer->enableBlending(true);
	particleRenderer->setBlendingFunctions(GL_SRC_ALPHA,GL_ONE);
	particleRenderer->setTexturingMode(TEXTURE_2D);
	particleRenderer->setTexture(textureParticle);
	particleRenderer->setTextureBlending(GL_MODULATE);
	particleRenderer->setScale(0.05f,0.05f);
	particleRenderer->enableRenderingHint(DEPTH_TEST,false);

	// Model
	Model* particleModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA | FLAG_SIZE,FLAG_ALPHA | FLAG_SIZE);
	particleModel->setParam(PARAM_ALPHA,5.0f,0.0f);	// the particles will fade as they die
	particleModel->setParam(PARAM_SIZE,1.0f,15.0f);	// the particles will enlarge over time
	particleModel->setLifeTime(5.0f,6.0f);

	// Emitter
	// We set up a spheric emitter that emits in all direction with a very small force in order to slightly displace the particles
	RandomEmitter* particleEmitter = RandomEmitter::create();
	particleEmitter->setForce(0.01f,0.01f);

	// Group
	particleGroup = Group::create(particleModel,14000);
	particleGroup->setRenderer(particleRenderer);
	particleGroup->setFriction(-0.3f); // negative friction : The particles will accelerate over time

	// System
	particleSystem = System::create();
	particleSystem->addGroup(particleGroup);

	// This computes the ratio to go from screen coordinates to universe coordinates
	float screenToUniverse = 2.0f * camPosZ * tan(45.0f * 0.5f * PI / 180.0f) / screenHeight;

	float oldX,oldY,oldZ;
	bool add = false;
	float offset = 0.0f;
	
	bool exit = false;
	bool paused = false;

	// renderValue :
	// 0 : normal
	// 1 : basic render
	// 2 : no render
	unsigned int renderValue = 0;

	float step = 0.0f;

	cout << "\nSPARK FACTORY AFTER INIT :" << endl;
	SPKFactory::getInstance().traceAll();

	SDL_Delay(3000);
	while (SDL_PollEvent(&event)){}
	SDL_ShowCursor(1);
	
	std::deque<unsigned int> frameFPS;
	frameFPS.push_back(SDL_GetTicks());

	while(!exit)
	{
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
				particleGroup->enableAABBComputing(!particleGroup->isAABBComputingEnabled());

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
					particleGroup->setRenderer(particleRenderer);
					break;

				case 1 :
					particleGroup->setRenderer(basicRenderer);
					break;

				case 2 :
					particleGroup->setRenderer(NULL);
					break;
				}
			}

			// if pause is pressed, the system is paused
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_PAUSE))
				paused = !paused;

			oldZ = camPosZ;
			if (event.type == SDL_MOUSEBUTTONDOWN)
			{
				if (event.button.button == SDL_BUTTON_LEFT)
				{
					add = true;
					oldX = (event.motion.x - screenWidth * 0.5f) * screenToUniverse;
					oldY = -(event.motion.y - screenHeight * 0.5f) * screenToUniverse;
				}
				if (event.button.button == SDL_BUTTON_WHEELDOWN)
					camPosZ = min(18.0f,camPosZ + 0.5f);
				if (event.button.button == SDL_BUTTON_WHEELUP)
					camPosZ = max(0.0f,camPosZ - 0.5f);
			}

			if (event.type == SDL_MOUSEBUTTONUP)
				if (event.button.button == SDL_BUTTON_LEFT)
					add = false;

			if ((add)&&(!paused))
			{
				float x = (event.motion.x - screenWidth * 0.5f) * screenToUniverse;
				float y = -(event.motion.y - screenHeight * 0.5f) * screenToUniverse;
				offset = particleGroup->addParticles(Vector3D(oldX,oldY,oldZ - 5.0f),Vector3D(x,y,camPosZ - 5.0f),particleEmitter,0.025f,offset);
				oldX = x;
				oldY = y;
			}
		}

		if (!paused)
		{
			// Changes the color of the model over time
			step += deltaTime * 0.0005f;
			particleModel->setParam(PARAM_RED,0.6f + 0.4f * sin(step));
			particleModel->setParam(PARAM_GREEN,0.6f + 0.4f * sin(step + PI * 2.0f / 3.0f));
			particleModel->setParam(PARAM_BLUE,0.6f + 0.4f * sin(step + PI * 4.0f / 3.0f));

			// Updates particle system
			particleSystem->update(deltaTime * 0.001f); // 1 being a second		
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