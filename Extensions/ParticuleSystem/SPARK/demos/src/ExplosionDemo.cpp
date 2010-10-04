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

#include <SPK.h>
#include <SPK_GL.h>

using namespace std;
using namespace SPK;
using namespace SPK::GL;

Vector3D camPos;
float camAngleY = 0.0f;
float camAngleX = 0.0f;
float camPosZ = 5.0f;

int deltaTime = 0;

FTGLTextureFont* fontPtr;

const string STR_NB_PARTICLES = "NB PARTICLES : ";
const string STR_FPS = "FPS : ";

string strNbParticles = STR_NB_PARTICLES;
string strFps = STR_FPS;

int screenWidth;
int screenHeight;
float screenRatio;

int drawText = 2;

list<System*> particleSystems;

SPK_ID BaseSystemID = NO_ID;

const float PI = 3.14159f;

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

void renderFirstFrame()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	SDL_GL_SwapBuffers();
	SDL_GL_SwapBuffers();
}

// Renders the scene
void render()
{
	glEnable(GL_DEPTH_TEST);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(45,screenRatio,0.01f,80.0f);

	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();                       

	glTranslatef(0.0f,0.0f,-camPosZ);
	glRotatef(camAngleX,1.0f,0.0f,0.0f);
	glRotatef(camAngleY,0.0f,1.0f,0.0f);

	// Renders all the particle systems
	for (list<System*>::const_iterator it = particleSystems.begin(); it != particleSystems.end(); ++it)
		(*it)->render();

	if (drawText != 0)
	{
		glMatrixMode(GL_MODELVIEW);
		glLoadIdentity();

		glMatrixMode(GL_PROJECTION);
		glLoadIdentity();
		gluOrtho2D(0,screenWidth,0,screenHeight);

		// Renders info strings
		glColor3f(1.0f,1.0f,1.0f);
		if (drawText == 2)
			fontPtr->Render(strNbParticles.c_str(),-1,FTPoint(4.0f,40.0f));
		fontPtr->Render(strFps.c_str(),-1,FTPoint(4.0f,8.0f));
	}

	SDL_GL_SwapBuffers();
}

// Creates the base system and returns its ID
SPK_ID createParticleSystemBase(GLuint textureExplosion,GLuint textureFlash,GLuint textureSpark1,GLuint textureSpark2,GLuint textureWave)
{
	///////////////
	// Renderers //
	///////////////

	// smoke renderer
	GLQuadRenderer* smokeRenderer = GLQuadRenderer::create();
	smokeRenderer->setTexturingMode(TEXTURE_2D);
	smokeRenderer->setTexture(textureExplosion);
	smokeRenderer->setTextureBlending(GL_MODULATE);
	smokeRenderer->setAtlasDimensions(2,2); // uses 4 different patterns in the texture
	smokeRenderer->setBlending(BLENDING_ALPHA);
	smokeRenderer->enableRenderingHint(DEPTH_WRITE,false);
	smokeRenderer->setShared(true);

	// flame renderer
	GLQuadRenderer* flameRenderer = GLQuadRenderer::create();
	flameRenderer->setTexturingMode(TEXTURE_2D);
	flameRenderer->setTexture(textureExplosion);
	flameRenderer->setTextureBlending(GL_MODULATE);
	flameRenderer->setAtlasDimensions(2,2);
	flameRenderer->setBlending(BLENDING_ADD);
	flameRenderer->enableRenderingHint(DEPTH_WRITE,false);
	flameRenderer->setShared(true);

	// flash renderer
	GLQuadRenderer* flashRenderer = GLQuadRenderer::create();
	flashRenderer->setTexturingMode(TEXTURE_2D);
	flashRenderer->setTexture(textureFlash);
	flashRenderer->setTextureBlending(GL_REPLACE);
	flashRenderer->setBlending(BLENDING_ADD);
	flashRenderer->enableRenderingHint(DEPTH_WRITE,false);
	flashRenderer->setShared(true);

	// spark 1 renderer
	GLQuadRenderer* spark1Renderer = GLQuadRenderer::create();
	spark1Renderer->setTexturingMode(TEXTURE_2D);
	spark1Renderer->setTexture(textureSpark1);
	spark1Renderer->setTextureBlending(GL_REPLACE);
	spark1Renderer->setBlending(BLENDING_ADD);
	spark1Renderer->enableRenderingHint(DEPTH_WRITE,false);
	spark1Renderer->setOrientation(DIRECTION_ALIGNED); // sparks are oriented function o their velocity
	spark1Renderer->setScale(0.05f,1.0f); // thin rectangles
	spark1Renderer->setShared(true);

	// spark 2 renderer
	GLRenderer* spark2Renderer = NULL;
	if (GLPointRenderer::loadGLExtPointSprite() && GLPointRenderer::loadGLExtPointParameter()) // uses point sprite if possible
	{
		GLPointRenderer::setPixelPerUnit(45.0f * PI / 180.f,screenHeight);
		GLPointRenderer* pointRenderer = GLPointRenderer::create();
		pointRenderer->setType(POINT_SPRITE);
		pointRenderer->setTexture(textureSpark2);
		pointRenderer->setTextureBlending(GL_MODULATE);
		pointRenderer->enableWorldSize(true);
		pointRenderer->setSize(0.02f);
		spark2Renderer = pointRenderer;
	}
	else
	{
		GLQuadRenderer* quadRenderer = GLQuadRenderer::create();
		quadRenderer->setTexturingMode(TEXTURE_2D);
		quadRenderer->setTexture(textureSpark2);
		quadRenderer->setTextureBlending(GL_MODULATE);
		quadRenderer->setScale(0.02f,0.02f);
		spark2Renderer = quadRenderer;
	}
	spark2Renderer->setBlending(BLENDING_ADD);
	spark2Renderer->enableRenderingHint(DEPTH_WRITE,false);
	spark2Renderer->setShared(true);

	// wave renderer
	GLQuadRenderer* waveRenderer = GLQuadRenderer::create();
	waveRenderer->setTexturingMode(TEXTURE_2D);
	waveRenderer->setTexture(textureWave);
	waveRenderer->setTextureBlending(GL_MODULATE);
	waveRenderer->setBlending(BLENDING_ALPHA);
	waveRenderer->enableRenderingHint(DEPTH_WRITE,false);
	waveRenderer->enableRenderingHint(ALPHA_TEST,true); // uses the alpha test
	waveRenderer->setAlphaTestThreshold(0.0f);
	waveRenderer->setOrientation(FIXED_ORIENTATION); // the orientatin is fixed
	waveRenderer->lookVector.set(0.0f,1.0f,0.0f);
	waveRenderer->upVector.set(1.0f,0.0f,0.0f); // we dont really care about the up axis
	waveRenderer->setShared(true);

	////////////
	// Models //
	////////////

	Interpolator* interpolator = NULL; // pointer to an interpolator that is used to retrieve interpolators	

	// smoke model
	Model* smokeModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA | FLAG_SIZE | FLAG_ANGLE | FLAG_TEXTURE_INDEX,
		FLAG_SIZE | FLAG_ANGLE,
		FLAG_SIZE | FLAG_ANGLE | FLAG_TEXTURE_INDEX,
		FLAG_ALPHA);
	smokeModel->setParam(PARAM_RED,0.2f);
	smokeModel->setParam(PARAM_GREEN,0.2f);
	smokeModel->setParam(PARAM_BLUE,0.2f);
	smokeModel->setParam(PARAM_SIZE,0.6f,0.8f,1.0f,1.4f);
	smokeModel->setParam(PARAM_TEXTURE_INDEX,0.0f,4.0f);
	smokeModel->setParam(PARAM_ANGLE,0.0f,PI * 0.5f,0.0f,PI * 0.5f);
	smokeModel->setLifeTime(2.5f,3.0f);
	smokeModel->setShared(true);

	interpolator = smokeModel->getInterpolator(PARAM_ALPHA);
	interpolator->addEntry(0.0f,0.0f);
	interpolator->addEntry(0.4f,0.4f,0.6f);
	interpolator->addEntry(0.6f,0.4f,0.6f);
	interpolator->addEntry(1.0f,0.0f);

	// flame model
	Model* flameModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA | FLAG_SIZE | FLAG_ANGLE | FLAG_TEXTURE_INDEX,
		FLAG_ANGLE | FLAG_RED | FLAG_GREEN | FLAG_BLUE,
		FLAG_ANGLE | FLAG_TEXTURE_INDEX,
		FLAG_SIZE | FLAG_ALPHA);
	flameModel->setParam(PARAM_RED,1.0f,0.2f);
	flameModel->setParam(PARAM_GREEN,0.5f,0.2f);
	flameModel->setParam(PARAM_BLUE,0.2f,0.2f);
	flameModel->setParam(PARAM_TEXTURE_INDEX,0.0f,4.0f);
	flameModel->setParam(PARAM_ANGLE,0.0f,PI * 0.5f,0.0f,PI * 0.5f);
	flameModel->setLifeTime(1.5f,2.0f);
	flameModel->setShared(true);

	interpolator = flameModel->getInterpolator(PARAM_SIZE);
	interpolator->addEntry(0.0f,0.25f);
	interpolator->addEntry(0.02f,0.6f,0.8f);
	interpolator->addEntry(1.0f,1.0f,1.4f);

	interpolator = flameModel->getInterpolator(PARAM_ALPHA);
	interpolator->addEntry(0.5f,1.0f);
	interpolator->addEntry(1.0f,0.0f);

	// flash model
	Model* flashModel = Model::create(FLAG_ALPHA | FLAG_SIZE | FLAG_ANGLE,
		FLAG_NONE,
		FLAG_ANGLE,
		FLAG_ALPHA | FLAG_SIZE);
	flashModel->setParam(PARAM_ANGLE,0.0f,2.0f * PI);
	flashModel->setLifeTime(0.5f,0.5f);
	flashModel->setShared(true);

	interpolator = flashModel->getInterpolator(PARAM_SIZE);
	interpolator->addEntry(0.0f,0.25f);
	interpolator->addEntry(0.1f,1.0f,2.0f);

	interpolator = flashModel->getInterpolator(PARAM_ALPHA);
	interpolator->addEntry(0.0f,1.0f);
	interpolator->addEntry(0.4f,0.0f);

	// spark 1 model
	Model* spark1Model = Model::create(FLAG_SIZE | FLAG_ALPHA,
		FLAG_ALPHA,
		FLAG_SIZE);
	spark1Model->setParam(PARAM_ALPHA,1.0f,0.0f);
	spark1Model->setParam(PARAM_SIZE,0.2f,0.4f);
	spark1Model->setLifeTime(0.2f,1.0f);
	spark1Model->setShared(true);

	// spark 2 model
	Model* spark2Model = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA,
		FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA,
		FLAG_GREEN);
	spark2Model->setParam(PARAM_ALPHA,1.0f,0.0f);
	spark2Model->setParam(PARAM_RED,1.0f);
	spark2Model->setParam(PARAM_GREEN,1.0f,1.0f,0.3f,1.0f);
	spark2Model->setParam(PARAM_BLUE,0.7f,0.3f);
	spark2Model->setLifeTime(1.0f,3.0f);
	spark2Model->setShared(true);

	// wave model
	Model* waveModel = Model::create(FLAG_ALPHA | FLAG_SIZE,
		FLAG_SIZE | FLAG_ALPHA);
	waveModel->setParam(PARAM_SIZE,0.0f,4.0f);
	waveModel->setParam(PARAM_ALPHA,0.2f,0.0f);
	waveModel->setLifeTime(0.8f,0.8f);
	waveModel->setShared(true);

	//////////////
	// Emitters //
	//////////////

	// This zone will be used by several emitters
	Sphere* explosionSphere = Sphere::create(Vector3D(0.0f,0.0f,0.0f),0.4f);

	// smoke emitter
	RandomEmitter* smokeEmitter = RandomEmitter::create();
	smokeEmitter->setZone(Sphere::create(Vector3D(0.0f,0.0f,0.0f),0.6f),false);
	smokeEmitter->setFlow(-1);
	smokeEmitter->setTank(15);
	smokeEmitter->setForce(0.02f,0.04f);

	// flame emitter
	NormalEmitter* flameEmitter = NormalEmitter::create();
	flameEmitter->setZone(explosionSphere);
	flameEmitter->setFlow(-1);
	flameEmitter->setTank(15);
	flameEmitter->setForce(0.06f,0.1f);

	// flash emitter
	StaticEmitter* flashEmitter = StaticEmitter::create();
	flashEmitter->setZone(Sphere::create(Vector3D(0.0f,0.0f,0.0f),0.1f));
	flashEmitter->setFlow(-1);
	flashEmitter->setTank(3);

	// spark 1 emitter
	NormalEmitter* spark1Emitter = NormalEmitter::create();
	spark1Emitter->setZone(explosionSphere);
	spark1Emitter->setFlow(-1);
	spark1Emitter->setTank(20);
	spark1Emitter->setForce(2.0f,3.0f);

	// spark 2 emitter
	NormalEmitter* spark2Emitter = NormalEmitter::create();
	spark2Emitter->setZone(explosionSphere);
	spark2Emitter->setFlow(-1);
	spark2Emitter->setTank(400);
	spark2Emitter->setForce(0.4f,0.8f);

	// wave emitter
	StaticEmitter* waveEmitter = StaticEmitter::create();
	waveEmitter->setZone(Point::create());
	waveEmitter->setFlow(-1);
	waveEmitter->setTank(1);

	////////////
	// Groups //
	////////////

	// smoke group
	Group* smokeGroup = Group::create(smokeModel,15);
	smokeGroup->addEmitter(smokeEmitter);
	smokeGroup->setRenderer(smokeRenderer);
	smokeGroup->setGravity(Vector3D(0.0f,0.05f,0.0f));

	// flame group
	Group* flameGroup = Group::create(flameModel,15);
	flameGroup->addEmitter(flameEmitter);
	flameGroup->setRenderer(flameRenderer);

	// flash group
	Group* flashGroup = Group::create(flashModel,3);
	flashGroup->addEmitter(flashEmitter);
	flashGroup->setRenderer(flashRenderer);

	// spark 1 group
	Group* spark1Group = Group::create(spark1Model,20);
	spark1Group->addEmitter(spark1Emitter);
	spark1Group->setRenderer(spark1Renderer);
	spark1Group->setGravity(Vector3D(0.0f,-1.5f,0.0f));

	// spark 2 group
	Group* spark2Group = Group::create(spark2Model,400);
	spark2Group->addEmitter(spark2Emitter);
	spark2Group->setRenderer(spark2Renderer);
	spark2Group->setGravity(Vector3D(0.0f,-0.3f,0.0f));
	spark2Group->setFriction(0.4f);

	// wave group
	Group* waveGroup = Group::create(waveModel,1);
	waveGroup->addEmitter(waveEmitter);
	waveGroup->setRenderer(waveRenderer);
	
	////////////
	// System //
	////////////

	System* system = System::create();
	system->addGroup(waveGroup);
	system->addGroup(smokeGroup);
	system->addGroup(flameGroup);
	system->addGroup(flashGroup);
	system->addGroup(spark1Group);
	system->addGroup(spark2Group);

	// Gets a pointer to the base
	return system->getID();
}

// Creates a particle system from the base system
System* createParticleSystem(const Vector3D& pos)
{
	// Creates a copy of the base system
	System* system = SPK_Copy(System,BaseSystemID);

	// Locates the system at the given position
	system->setTransformPosition(pos);
	system->updateTransform(); // updates the world transform of system and its children

	return system;
}

// destroy a particle system
void destroyParticleSystem(System*& system)
{
	// Destroys the given system
	SPK_Destroy(system);
	system = NULL;
}

// This function is used to sort the systems from front to back
bool cmpDistToCam(System* system0,System* system1)
{
	return getSqrDist(system0->getWorldTransformPos(),camPos) > getSqrDist(system1->getWorldTransformPos(),camPos);
}

// Main function
int main(int argc, char *argv[])
{
	SDL_Event event;

	// inits SDL
	SDL_Init(SDL_INIT_VIDEO);
	SDL_WM_SetCaption("SPARK Explosion demo",NULL);
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
	GLuint textureExplosion;
	if (!loadTexture(textureExplosion,"res/explosion.bmp",GL_ALPHA,GL_CLAMP,false))
		return 1;

	GLuint textureFlash;
	if (!loadTexture(textureFlash,"res/flash.bmp",GL_RGB,GL_CLAMP,false))
		return 1;

	GLuint textureSpark1;
	if (!loadTexture(textureSpark1,"res/spark1.bmp",GL_RGB,GL_CLAMP,false))
		return 1;

	GLuint textureSpark2;
	if (!loadTexture(textureSpark2,"res/point.bmp",GL_ALPHA,GL_CLAMP,false))
		return 1;

	GLuint textureWave;
	if (!loadTexture(textureWave,"res/wave.bmp",GL_RGBA,GL_CLAMP,false))
		return 1;

	// random seed
	randomSeed = static_cast<unsigned int>(time(NULL));

	// Sets the update step
	System::setClampStep(true,0.1f);			// clamp the step to 100 ms
	System::useAdaptiveStep(0.001f,0.01f);		// use an adaptive step from 1ms to 10ms (1000fps to 100fps)

	// creates the base system
	BaseSystemID = createParticleSystemBase(textureExplosion,textureFlash,textureSpark1,textureSpark2,textureWave);
	
	bool exit = false;
	bool paused = false;

	cout << "\nSPARK FACTORY AFTER INIT :" << endl;
	SPKFactory::getInstance().traceAll();
	
	SDL_Delay(3000);
	while (SDL_PollEvent(&event)){}
	
	std::deque<unsigned int> frameFPS;
	frameFPS.push_back(SDL_GetTicks());

	float spacePressed = -1.0f;

	while(!exit)
	{
		while (SDL_PollEvent(&event))
		{
			// if space is pressed, a new system is added
			if (((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_SPACE))||
				(event.type == SDL_MOUSEBUTTONDOWN)&&
				((event.button.button == SDL_BUTTON_LEFT)||(event.button.button == SDL_BUTTON_RIGHT)))
			{
				spacePressed = 1000.0f;
			}

			if (((event.type == SDL_KEYUP)&&(event.key.keysym.sym == SDLK_SPACE))||
				(event.type == SDL_MOUSEBUTTONUP)&&
				((event.button.button == SDL_BUTTON_LEFT)||(event.button.button == SDL_BUTTON_RIGHT)))
			{
				spacePressed = -1.0f;
			}

			// if esc is pressed, exit
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_ESCAPE))
				exit = true;

			// if F1 is pressed, we display or not the text
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F1))
			{
				--drawText;
				if (drawText < 0)
					drawText = 2;
			}

			// if pause is pressed, the system is paused
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_PAUSE))
				paused = !paused;

			// Moves the camera with the mouse
			if (event.type == SDL_MOUSEMOTION)
			{
				camAngleY -= event.motion.xrel * 0.05f;
				camAngleX -= event.motion.yrel * 0.05f;
				if (camAngleX > 90.0f)
					camAngleX = 90.0f;
				if (camAngleX < -90.0f)
					camAngleX = -90.0f;
			}

			// Zoom in and out
			if (event.type == SDL_MOUSEBUTTONDOWN)
			{
				if (event.button.button == SDL_BUTTON_WHEELDOWN)
					camPosZ = min(10.0f,camPosZ + 0.5f);
				if (event.button.button == SDL_BUTTON_WHEELUP)
					camPosZ = max(0.5f,camPosZ - 0.5f);
			}
		}

		if (!paused)
		{
			// if space is pressed, a new system is added
			if (spacePressed >= 0.0f)
			{
				spacePressed += deltaTime;

				if (spacePressed >= 1000.0f)
				{
					Vector3D position(random(-2.0f,2.0f),random(-2.0f,2.0f),random(-2.0f,2.0f));
					particleSystems.push_back(createParticleSystem(position));

					spacePressed = 0.0f;
				}
			}
		}

		// Computes the camera position and sort the systems from back to front
		float cosX = cos(camAngleX * PI / 180.0f);
		float sinX = sin(camAngleX * PI / 180.0f);
		float cosY = cos(camAngleY * PI / 180.0f);
		float sinY = sin(camAngleY * PI / 180.0f);
		camPos.set(-camPosZ * sinY * cosX,camPosZ * sinX,camPosZ * cosY * cosX);
		particleSystems.sort(cmpDistToCam);

		if (!paused)
		{
			list<System*>::iterator it = particleSystems.begin();
			while(it != particleSystems.end())
			{
				// Updates the particle systems
				if (!(*it)->update(deltaTime * 0.001f))
				{
					// If a system is sleeping, destroys it
					destroyParticleSystem(*it);
					// And erases its entry in the container
					it = particleSystems.erase(it);
				}
				else
					++it;
			}
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
		unsigned int nbParticles = 0;
		for (list<System*>::const_iterator it = particleSystems.begin(); it != particleSystems.end(); ++it)
			nbParticles += (*it)->getNbParticles();
		strNbParticles = STR_NB_PARTICLES + int2Str(nbParticles);
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