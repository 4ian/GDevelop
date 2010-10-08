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

// external libs
#include <SDL.h>
#include <FTGL/ftgl.h>

// SPARK lib
#include <SPK.h>
#include <SPK_GL.h>

using namespace std;
using namespace SPK;
using namespace SPK::GL;

float angleY = 0.0f;
float angleX = 45.0f;
float camPosZ = 5.0f;

int deltaTime = 0;

FTGLTextureFont* fontPtr;

Group* galaxyGroup = NULL;
System* galaxySystem = NULL;
System* starSystem = NULL;

const float PI = 3.14159265358979323846f;

const string STR_NB_PARTICLES = "NB PARTICLES : ";
const string STR_FPS = "FPS : ";

string strNbParticles = STR_NB_PARTICLES;
string strFps = STR_FPS;

int screenWidth;
int screenHeight;
float screenRatio;

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
	gluPerspective(45,screenRatio,0.01f,33.0f);

	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();   

	glTranslatef(0.0f,0.0f,-camPosZ);
	glRotatef(angleX,1.0f,0.0f,0.0f);
	glRotatef(angleY,0.0f,1.0f,0.0f);

	galaxySystem->render();
	if (renderEnv)
		starSystem->render();

	glDisable(GL_BLEND);
	drawBoundingBox(*galaxyGroup);

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
	System::useRealStep();

	SDL_Event event;

	// inits SDL
	SDL_Init(SDL_INIT_VIDEO);
	SDL_WM_SetCaption("SPARK Galaxy Demo",NULL);
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER,1);	// double buffering

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
	if (!loadTexture(textureParticle,"res/flare.bmp",GL_ALPHA,GL_CLAMP,false))
		return 1;

	// Inits Particle Engine

	// Renderers
	GLPointRenderer* basicRenderer = GLPointRenderer::create();

	GLQuadRenderer* particleRenderer = GLQuadRenderer::create();
	particleRenderer->setTexturingMode(TEXTURE_2D);
	particleRenderer->setTexture(textureParticle);
	particleRenderer->setTextureBlending(GL_MODULATE);
	particleRenderer->setScale(0.05f,0.05f);
	particleRenderer->setBlending(BLENDING_ADD);
	particleRenderer->enableRenderingHint(DEPTH_WRITE,false);

	// Model
	Model* galaxyModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA | FLAG_SIZE, // enable
		FLAG_RED | FLAG_GREEN | FLAG_BLUE, // mutable
		FLAG_RED | FLAG_GREEN | FLAG_SIZE, // random
		FLAG_ALPHA);  // interpolated
	galaxyModel->setParam(PARAM_RED,0.0f,0.3f,0.5f,0.5f);
	galaxyModel->setParam(PARAM_GREEN,0.0f,0.3f,0.5f,0.5f);
	galaxyModel->setParam(PARAM_BLUE,1.0f,0.1f);
	galaxyModel->setParam(PARAM_SIZE,0.1f,5.0f);
	galaxyModel->setLifeTime(35.0f,40.0f);

	Interpolator* alphaInterpolator = galaxyModel->getInterpolator(PARAM_ALPHA);
	alphaInterpolator->addEntry(0.0f,0.0f);			// first the alpha is at 0
	alphaInterpolator->addEntry(0.95f,0.6f,1.0f);	// then ot reaches its values between 0.6 and 1 (slow fade in)
	alphaInterpolator->addEntry(1.0f,0.0f);			// At the end of the particle life, it quickly fades out

	Model* starModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA | FLAG_SIZE,
		FLAG_NONE,
		FLAG_RED | FLAG_GREEN | FLAG_ALPHA | FLAG_SIZE);
	starModel->setParam(PARAM_RED,0.8f,1.0f);
	starModel->setParam(PARAM_GREEN,0.4f,1.0f);
	starModel->setParam(PARAM_BLUE,0.8f,1.0f);
	starModel->setParam(PARAM_ALPHA,0.2f,1.0f);
	starModel->setParam(PARAM_SIZE,0.1f,5.0f);
	starModel->setImmortal(true);

	// Emitter
	RandomEmitter* lineEmitter1 = RandomEmitter::create();
	lineEmitter1->setZone(Line::create(Vector3D(-2.5f,0.0f,-2.5f),Vector3D(2.5f,0.0f,2.5f)));
	lineEmitter1->setFlow(100);
	lineEmitter1->setForce(0.0f,0.01f);

	RandomEmitter* lineEmitter2 = RandomEmitter::create();
	lineEmitter2->setZone(Line::create(Vector3D(-2.5f,0.0f,2.5f),Vector3D(2.5f,0.0f,-2.5f)));
	lineEmitter2->setFlow(100);
	lineEmitter2->setForce(0.0f,0.01f);

	Vortex* vortex = Vortex::create();
	vortex->setRotationSpeed(0.4f,false);
	vortex->setAttractionSpeed(0.04f,true);
	vortex->setEyeRadius(0.05f);
	vortex->enableParticleKilling(true);

	// Group
	galaxyGroup = Group::create(galaxyModel,8000);
	galaxyGroup->addEmitter(lineEmitter1);
	galaxyGroup->addEmitter(lineEmitter2);
	galaxyGroup->setRenderer(particleRenderer);
	galaxyGroup->addModifier(vortex);
	
	galaxySystem = System::create();
	galaxySystem->addGroup(galaxyGroup);

	Group* starGroup = Group::create(starModel,1000);
	starGroup->setRenderer(particleRenderer);

	Sphere* skySphere = Sphere::create(Vector3D(),16.0f);
	starGroup->addParticles(1000,skySphere,Vector3D(),false);
	starGroup->flushAddedParticles();
	SPK_Destroy(skySphere);

	starSystem = System::create();
	starSystem->addGroup(starGroup);
	
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
				galaxySystem->empty();

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
				galaxyGroup->enableAABBComputing(!galaxyGroup->isAABBComputingEnabled());

				if (paused)
					galaxySystem->computeAABB();
			}

			// if F4 is pressed, the renderers are changed
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F4))
			{
				renderValue = (renderValue + 1) % 3;

				switch (renderValue)
				{
				case 0 :
					galaxyGroup->setRenderer(particleRenderer);
					break;

				case 1 :
					galaxyGroup->setRenderer(basicRenderer);
					break;

				case 2 :
					galaxyGroup->setRenderer(NULL);
					break;
				}
			}

			// if F5 is pressed, environment is rendered are not
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F5))
				renderEnv = !renderEnv;

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

			// Zoom in and out
			if (event.type == SDL_MOUSEBUTTONDOWN)
			{
				if (event.button.button == SDL_BUTTON_WHEELDOWN)
					camPosZ = min(15.0f,camPosZ + 0.5f);
				if (event.button.button == SDL_BUTTON_WHEELUP)
					camPosZ = max(3.0f,camPosZ - 0.5f);
			}
		}

		if (!paused)
		{
			// Updates particle system
			galaxySystem->update(deltaTime * 0.001f);	// 1 defined as a second
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
		strNbParticles = STR_NB_PARTICLES + int2Str(galaxySystem->getNbParticles() + (renderEnv ? starSystem->getNbParticles() : 0));
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