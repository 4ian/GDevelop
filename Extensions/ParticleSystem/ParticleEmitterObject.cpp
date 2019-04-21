/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/FontManager.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/Polygon2d.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "ParticleEmitterObject.h"
#include "ParticleSystemWrapper.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCpp/Runtime/CommonTools.h"
#endif

// clang-format off
#include <SPK.h>
#include <SPK_GL.h>
// clang-format on

using namespace std;

ParticleEmitterBase::ParticleEmitterBase()
    : rendererType(Point),
      rendererParam1(3.0f),
      rendererParam2(1.0f),
      additive(false),
      tank(-1),
      flow(45),
      emitterForceMin(45.0f),
      emitterForceMax(85.0f),
      emitterXDirection(0.0f),
      emitterYDirection(1.0f),
      emitterZDirection(0.0f),
      emitterAngleA(0),
      emitterAngleB(90),
      zoneRadius(3.0f),
      particleGravityX(0.0f),
      particleGravityY(0.0f),
      particleGravityZ(0.0f),
      friction(2.0f),
      particleLifeTimeMin(0.5f),
      particleLifeTimeMax(2.5f),
      redParam(Enabled),
      greenParam(Random),
      blueParam(Random),
      alphaParam(Mutable),
      sizeParam(Mutable),
      angleParam(Mutable),
      particleRed1(255.0f),
      particleRed2(255.0f),
      particleGreen1(51),
      particleGreen2(255),
      particleBlue1(51),
      particleBlue2(0.0f),
      particleAlpha1(204),
      particleAlpha2(0.0f),
      particleSize1(100.0f),
      particleSize2(100.0f),
      particleAngle1(0.0f),
      particleAngle2(0.0f),
      particleAlphaRandomness1(0),
      particleAlphaRandomness2(0),
      particleSizeRandomness1(0),
      particleSizeRandomness2(0),
      particleAngleRandomness1(0),
      particleAngleRandomness2(0),
      maxParticleNb(300),
      destroyWhenNoParticles(true),
      particleSystem(NULL) {}

ParticleEmitterObject::ParticleEmitterObject(gd::String name_)
    : Object(name_)
#if defined(GD_IDE_ONLY)
      ,
      particleEditionSimpleMode(true),
      emissionEditionSimpleMode(true),
      gravityEditionSimpleMode(true)
#endif
{
}

void ParticleEmitterObject::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  ParticleEmitterBase::UnserializeParticleEmitterBaseFrom(element);

#if defined(GD_IDE_ONLY)
  particleEditionSimpleMode =
      element.GetBoolAttribute("particleEditionSimpleMode");
  emissionEditionSimpleMode =
      element.GetBoolAttribute("emissionEditionSimpleMode");
  gravityEditionSimpleMode =
      element.GetBoolAttribute("gravityEditionSimpleMode");
#endif
}

void ParticleEmitterBase::UnserializeParticleEmitterBaseFrom(
    const gd::SerializerElement& element) {
  tank = element.GetDoubleAttribute("tank");
  flow = element.GetDoubleAttribute("flow");
  emitterForceMin = element.GetDoubleAttribute("emitterForceMin");
  emitterForceMax = element.GetDoubleAttribute("emitterForceMax");
  emitterXDirection = element.GetDoubleAttribute("emitterXDirection");
  emitterYDirection = element.GetDoubleAttribute("emitterYDirection");
  emitterZDirection = element.GetDoubleAttribute("emitterZDirection");
  emitterAngleA = element.GetDoubleAttribute("emitterAngleA");
  emitterAngleB = element.GetDoubleAttribute("emitterAngleB");
  zoneRadius = element.GetDoubleAttribute("zoneRadius");
  particleGravityX = element.GetDoubleAttribute("particleGravityX");
  particleGravityY = element.GetDoubleAttribute("particleGravityY");
  particleGravityZ = element.GetDoubleAttribute("particleGravityZ");
  friction = element.GetDoubleAttribute("friction");
  particleLifeTimeMin = element.GetDoubleAttribute("particleLifeTimeMin");
  particleLifeTimeMax = element.GetDoubleAttribute("particleLifeTimeMax");
  particleRed1 = element.GetDoubleAttribute("particleRed1");
  particleRed2 = element.GetDoubleAttribute("particleRed2");
  particleGreen1 = element.GetDoubleAttribute("particleGreen1");
  particleGreen2 = element.GetDoubleAttribute("particleGreen2");
  particleBlue1 = element.GetDoubleAttribute("particleBlue1");
  particleBlue2 = element.GetDoubleAttribute("particleBlue2");
  particleAlpha1 = element.GetDoubleAttribute("particleAlpha1");
  particleAlpha2 = element.GetDoubleAttribute("particleAlpha2");
  rendererParam1 = element.GetDoubleAttribute("rendererParam1");
  rendererParam2 = element.GetDoubleAttribute("rendererParam2");
  particleSize1 = element.GetDoubleAttribute("particleSize1");
  particleSize2 = element.GetDoubleAttribute("particleSize2");
  particleAngle1 = element.GetDoubleAttribute("particleAngle1");
  particleAngle2 = element.GetDoubleAttribute("particleAngle2");
  particleAlphaRandomness1 =
      element.GetDoubleAttribute("particleAlphaRandomness1");
  particleAlphaRandomness2 =
      element.GetDoubleAttribute("particleAlphaRandomness2");
  particleSizeRandomness1 =
      element.GetDoubleAttribute("particleSizeRandomness1");
  particleSizeRandomness2 =
      element.GetDoubleAttribute("particleSizeRandomness2");
  particleAngleRandomness1 =
      element.GetDoubleAttribute("particleAngleRandomness1");
  particleAngleRandomness2 =
      element.GetDoubleAttribute("particleAngleRandomness2");
  additive = element.GetBoolAttribute("additive");
  destroyWhenNoParticles =
      element.GetBoolAttribute("destroyWhenNoParticles", false);
  textureParticleName = element.GetStringAttribute("textureParticleName");
  maxParticleNb = element.GetIntAttribute("maxParticleNb", 5000);

  {
    gd::String result = element.GetStringAttribute("rendererType");
    if (result == "Line")
      rendererType = Line;
    else if (result == "Quad")
      rendererType = Quad;
    else
      rendererType = Point;
  }
  {
    gd::String result = element.GetStringAttribute("redParam");
    if (result == "Mutable")
      redParam = Mutable;
    else if (result == "Random")
      redParam = Random;
    else
      redParam = Enabled;
  }
  {
    gd::String result = element.GetStringAttribute("greenParam");
    if (result == "Mutable")
      greenParam = Mutable;
    else if (result == "Random")
      greenParam = Random;
    else
      greenParam = Enabled;
  }
  {
    gd::String result = element.GetStringAttribute("blueParam");
    if (result == "Mutable")
      blueParam = Mutable;
    else if (result == "Random")
      blueParam = Random;
    else
      blueParam = Enabled;
  }
  {
    gd::String result = element.GetStringAttribute("alphaParam");
    if (result == "Mutable")
      alphaParam = Mutable;
    else if (result == "Random")
      alphaParam = Random;
    else
      alphaParam = Enabled;
  }
  {
    gd::String result = element.GetStringAttribute("sizeParam");
    if (result == "Mutable")
      sizeParam = Mutable;
    else if (result == "Random")
      sizeParam = Random;
    else
      sizeParam = Nothing;
  }
  {
    gd::String result = element.GetStringAttribute("angleParam");
    if (result == "Mutable")
      angleParam = Mutable;
    else if (result == "Random")
      angleParam = Random;
    else
      angleParam = Nothing;
  }
}

#if defined(GD_IDE_ONLY)
void ParticleEmitterObject::DoSerializeTo(
    gd::SerializerElement& element) const {
  element.SetAttribute("particleEditionSimpleMode", particleEditionSimpleMode);
  element.SetAttribute("emissionEditionSimpleMode", emissionEditionSimpleMode);
  element.SetAttribute("gravityEditionSimpleMode", gravityEditionSimpleMode);

  ParticleEmitterBase::SerializeParticleEmitterBaseTo(element);
}

void ParticleEmitterBase::SerializeParticleEmitterBaseTo(
    gd::SerializerElement& element) const {
  element.SetAttribute("tank", tank);
  element.SetAttribute("flow", flow);
  element.SetAttribute("emitterForceMin", emitterForceMin);
  element.SetAttribute("emitterForceMax", emitterForceMax);
  element.SetAttribute("emitterXDirection", emitterXDirection);
  element.SetAttribute("emitterYDirection", emitterYDirection);
  element.SetAttribute("emitterZDirection", emitterZDirection);
  element.SetAttribute("emitterAngleA", emitterAngleA);
  element.SetAttribute("emitterAngleB", emitterAngleB);
  element.SetAttribute("zoneRadius", zoneRadius);
  element.SetAttribute("particleGravityX", particleGravityX);
  element.SetAttribute("particleGravityY", particleGravityY);
  element.SetAttribute("particleGravityZ", particleGravityZ);
  element.SetAttribute("friction", friction);
  element.SetAttribute("particleLifeTimeMin", particleLifeTimeMin);
  element.SetAttribute("particleLifeTimeMax", particleLifeTimeMax);
  element.SetAttribute("particleRed1", particleRed1);
  element.SetAttribute("particleRed2", particleRed2);
  element.SetAttribute("particleGreen1", particleGreen1);
  element.SetAttribute("particleGreen2", particleGreen2);
  element.SetAttribute("particleBlue1", particleBlue1);
  element.SetAttribute("particleBlue2", particleBlue2);
  element.SetAttribute("particleAlpha1", particleAlpha1);
  element.SetAttribute("particleAlpha2", particleAlpha2);
  element.SetAttribute("particleSize1", particleSize1);
  element.SetAttribute("particleSize2", particleSize2);
  element.SetAttribute("particleAngle1", particleAngle1);
  element.SetAttribute("particleAngle2", particleAngle2);
  element.SetAttribute("rendererParam1", rendererParam1);
  element.SetAttribute("rendererParam2", rendererParam2);
  element.SetAttribute("particleAlphaRandomness1", particleAlphaRandomness1);
  element.SetAttribute("particleAlphaRandomness2", particleAlphaRandomness2);
  element.SetAttribute("particleSizeRandomness1", particleSizeRandomness1);
  element.SetAttribute("particleSizeRandomness2", particleSizeRandomness2);
  element.SetAttribute("particleAngleRandomness1", particleAngleRandomness1);
  element.SetAttribute("particleAngleRandomness2", particleAngleRandomness2);
  element.SetAttribute("additive", additive);
  element.SetAttribute("destroyWhenNoParticles", destroyWhenNoParticles);
  element.SetAttribute("textureParticleName", textureParticleName);
  element.SetAttribute("maxParticleNb", (int)maxParticleNb);

  gd::String rendererTypeStr = "Point";
  if (rendererType == Line)
    rendererTypeStr = "Line";
  else if (rendererType == Quad)
    rendererTypeStr = "Quad";
  element.SetAttribute("rendererType", rendererTypeStr);

  gd::String redParamStr = "Enabled";
  if (redParam == Mutable)
    redParamStr = "Mutable";
  else if (redParam == Random)
    redParamStr = "Random";
  element.SetAttribute("redParam", redParamStr);

  gd::String greenParamStr = "Enabled";
  if (greenParam == Mutable)
    greenParamStr = "Mutable";
  else if (greenParam == Random)
    greenParamStr = "Random";
  element.SetAttribute("greenParam", greenParamStr);

  gd::String blueParamStr = "Enabled";
  if (blueParam == Mutable)
    blueParamStr = "Mutable";
  else if (blueParam == Random)
    blueParamStr = "Random";
  element.SetAttribute("blueParam", blueParamStr);

  gd::String alphaParamStr = "Enabled";
  if (alphaParam == Mutable)
    alphaParamStr = "Mutable";
  else if (alphaParam == Random)
    alphaParamStr = "Random";
  element.SetAttribute("alphaParam", alphaParamStr);

  gd::String sizeParamStr = "Nothing";
  if (sizeParam == Mutable)
    sizeParamStr = "Mutable";
  else if (sizeParam == Random)
    sizeParamStr = "Random";
  element.SetAttribute("sizeParam", sizeParamStr);

  gd::String angleParamStr = "Nothing";
  if (angleParam == Mutable)
    angleParamStr = "Mutable";
  else if (angleParam == Random)
    angleParamStr = "Random";
  element.SetAttribute("angleParam", angleParamStr);
}
#endif

void ParticleEmitterBase::CreateParticleSystem() {
  if (particleSystem) delete particleSystem;
  particleSystem = new ParticleSystemWrapper;

  int enabledFlag = 0;
  int mutableFlag = 0;
  int randomFlag = 0;

  if (redParam == Enabled)
    enabledFlag |= SPK::FLAG_RED;
  else if (redParam == Mutable) {
    enabledFlag |= SPK::FLAG_RED;
    mutableFlag |= SPK::FLAG_RED;
  } else if (redParam == Random) {
    enabledFlag |= SPK::FLAG_RED;
    randomFlag |= SPK::FLAG_RED;
  }

  if (greenParam == Enabled)
    enabledFlag |= SPK::FLAG_RED;
  else if (greenParam == Mutable) {
    enabledFlag |= SPK::FLAG_GREEN;
    mutableFlag |= SPK::FLAG_GREEN;
  } else if (greenParam == Random) {
    enabledFlag |= SPK::FLAG_GREEN;
    randomFlag |= SPK::FLAG_GREEN;
  }

  if (blueParam == Enabled)
    enabledFlag |= SPK::FLAG_BLUE;
  else if (blueParam == Mutable) {
    enabledFlag |= SPK::FLAG_BLUE;
    mutableFlag |= SPK::FLAG_BLUE;
  } else if (blueParam == Random) {
    enabledFlag |= SPK::FLAG_BLUE;
    randomFlag |= SPK::FLAG_BLUE;
  }

  if (alphaParam == Enabled)
    enabledFlag |= SPK::FLAG_ALPHA;
  else if (alphaParam == Mutable) {
    enabledFlag |= SPK::FLAG_ALPHA;
    randomFlag |= SPK::FLAG_ALPHA;
    mutableFlag |= SPK::FLAG_ALPHA;
  } else if (alphaParam == Random) {
    enabledFlag |= SPK::FLAG_ALPHA;
    randomFlag |= SPK::FLAG_ALPHA;
  }

  if (sizeParam == Mutable) {
    enabledFlag |= SPK::FLAG_SIZE;
    randomFlag |= SPK::FLAG_SIZE;
    mutableFlag |= SPK::FLAG_SIZE;
  } else if (sizeParam == Random) {
    enabledFlag |= SPK::FLAG_SIZE;
    randomFlag |= SPK::FLAG_SIZE;
  }

  if (angleParam == Mutable) {
    enabledFlag |= SPK::FLAG_ANGLE;
    randomFlag |= SPK::FLAG_ANGLE;
    mutableFlag |= SPK::FLAG_ANGLE;
  } else if (angleParam == Random) {
    enabledFlag |= SPK::FLAG_ANGLE;
    randomFlag |= SPK::FLAG_ANGLE;
  }

  if (rendererType == Quad) enabledFlag |= SPK::PARAM_TEXTURE_INDEX;

  // Create the model
  particleSystem->particleModel =
      SPK::Model::create(enabledFlag, mutableFlag, randomFlag);
  UpdateRedParameters();
  UpdateGreenParameters();
  UpdateBlueParameters();
  UpdateAlphaParameters();
  UpdateSizeParameters();
  UpdateAngleParameters();
  UpdateLifeTime();

  // Create the renderer
  if (rendererType == Line)
    particleSystem->renderer =
        SPK::GL::GLLineRenderer::create(rendererParam1, rendererParam2);
  else if (rendererType == Quad) {
    SPK::GL::GLQuadRenderer* quadRenderer =
        new SPK::GL::GLQuadRenderer(rendererParam1, rendererParam2);

    if (particleSystem->textureParticle) {
      quadRenderer->setTexturingMode(SPK::TEXTURE_2D);
      quadRenderer->setTexture(
          particleSystem->textureParticle->texture.getNativeHandle());
    }

    particleSystem->renderer = quadRenderer;
  } else {
    SPK::GL::GLPointRenderer* pointRenderer =
        SPK::GL::GLPointRenderer::create();
    pointRenderer->setType(SPK::POINT_CIRCLE);
    pointRenderer->setSize(rendererParam1);

    particleSystem->renderer = pointRenderer;
  }

  particleSystem->renderer->enableBlending(true);
  if (additive)
    particleSystem->renderer->setBlendingFunctions(GL_SRC_ALPHA, GL_ONE);
  else
    particleSystem->renderer->setBlendingFunctions(GL_SRC_ALPHA,
                                                   GL_ONE_MINUS_SRC_ALPHA);
  particleSystem->renderer->setTextureBlending(
      GL_MODULATE);  // Texture color modulated with particle color
  particleSystem->renderer->enableRenderingHint(
      SPK::DEPTH_TEST, false);  // No depth test for performance

  // Create the zone
  particleSystem->zone = SPK::Sphere::create(SPK::Vector3D(0, 0), zoneRadius);

  // Create the emitter
  particleSystem->emitter = SPK::SphericEmitter::create(
      SPK::Vector3D(emitterXDirection, -emitterYDirection, emitterZDirection),
      emitterAngleA / 180.0f * 3.14159f,
      emitterAngleB / 180.0f * 3.14159f);
  particleSystem->emitter->setForce(emitterForceMin, emitterForceMax);
  particleSystem->emitter->setZone(particleSystem->zone);
  particleSystem->emitter->setTank(tank);
  particleSystem->emitter->setFlow(flow);

  // Create the Group
  particleSystem->group =
      SPK::Group::create(particleSystem->particleModel, maxParticleNb);
  particleSystem->group->addEmitter(particleSystem->emitter);
  particleSystem->group->setGravity(
      SPK::Vector3D(particleGravityX, -particleGravityY, particleGravityZ));
  particleSystem->group->setFriction(friction);
  particleSystem->group->setRenderer(particleSystem->renderer);

  // Create the System
  particleSystem->particleSystem = SPK::System::create();
  particleSystem->particleSystem->addGroup(particleSystem->group);
}

void ParticleEmitterBase::UpdateRedParameters() {
  if (!particleSystem || !particleSystem->particleModel) return;

  if (redParam == Mutable || redParam == Random)
    particleSystem->particleModel->setParam(
        SPK::PARAM_RED, particleRed1 / 255.0f, particleRed2 / 255.0f);
  else
    particleSystem->particleModel->setParam(SPK::PARAM_RED,
                                            particleRed1 / 255.0f);
}

void ParticleEmitterBase::UpdateGreenParameters() {
  if (!particleSystem || !particleSystem->particleModel) return;

  if (greenParam == Mutable || greenParam == Random)
    particleSystem->particleModel->setParam(
        SPK::PARAM_GREEN, particleGreen1 / 255.0f, particleGreen2 / 255.0f);
  else
    particleSystem->particleModel->setParam(SPK::PARAM_GREEN,
                                            particleGreen1 / 255.0f);
}

void ParticleEmitterBase::UpdateBlueParameters() {
  if (!particleSystem || !particleSystem->particleModel) return;

  if (blueParam == Mutable || blueParam == Random)
    particleSystem->particleModel->setParam(
        SPK::PARAM_BLUE, particleBlue1 / 255.0f, particleBlue2 / 255.0f);
  else
    particleSystem->particleModel->setParam(SPK::PARAM_BLUE,
                                            particleBlue1 / 255.0f);
}

void ParticleEmitterBase::UpdateAlphaParameters() {
  if (!particleSystem || !particleSystem->particleModel) return;

  if (alphaParam == Mutable)
    particleSystem->particleModel->setParam(
        SPK::PARAM_ALPHA,
        (particleAlpha1 - particleAlphaRandomness1 / 2.0f) / 255.0f,
        (particleAlpha1 + particleAlphaRandomness1 / 2.0f) / 255.0f,
        (particleAlpha2 - particleAlphaRandomness2 / 2.0f) / 255.0f,
        (particleAlpha2 + particleAlphaRandomness2 / 2.0f) / 255.0f);
  else if (alphaParam == Random)
    particleSystem->particleModel->setParam(
        SPK::PARAM_ALPHA, (particleAlpha1) / 255.0f, (particleAlpha2) / 255.0f);
  else
    particleSystem->particleModel->setParam(SPK::PARAM_ALPHA,
                                            particleAlpha1 / 255.0f);
}

void ParticleEmitterBase::UpdateSizeParameters() {
  if (!particleSystem || !particleSystem->particleModel) return;

  if (sizeParam == Mutable)
    particleSystem->particleModel->setParam(
        SPK::PARAM_SIZE,
        (particleSize1 - particleSizeRandomness1 / 2.0f) / 100.0f,
        (particleSize1 + particleSizeRandomness1 / 2.0f) / 100.0f,
        (particleSize2 - particleSizeRandomness2 / 2.0f) / 100.0f,
        (particleSize2 + particleSizeRandomness2 / 2.0f) / 100.0f);
  else if (sizeParam == Random)
    particleSystem->particleModel->setParam(
        SPK::PARAM_SIZE, (particleSize1) / 100.0f, (particleSize2) / 100.0f);
  else
    particleSystem->particleModel->setParam(SPK::PARAM_SIZE,
                                            particleSize1 / 100.0f);
}

void ParticleEmitterBase::UpdateAngleParameters() {
  if (!particleSystem || !particleSystem->particleModel) return;

  if (angleParam == Mutable)
    particleSystem->particleModel->setParam(
        SPK::PARAM_ANGLE,
        -(particleAngle1 - particleAngleRandomness1 / 2.0f) / 180.0f * 3.14159f,
        -(particleAngle1 + particleAngleRandomness1 / 2.0f) / 180.0f * 3.14159f,
        -(particleAngle2 - particleAngleRandomness2 / 2.0f) / 180.0f * 3.14159f,
        -(particleAngle2 + particleAngleRandomness2 / 2.0f) / 180.0f *
            3.14159f);
  else if (angleParam == Random)
    particleSystem->particleModel->setParam(
        SPK::PARAM_ANGLE,
        -(particleAngle1) / 180.0f * 3.14159f,
        -(particleAngle2) / 180.0f * 3.14159f);
  else
    particleSystem->particleModel->setParam(
        SPK::PARAM_ANGLE, -particleAngle1 / 180.0f * 3.14159f);
}

void ParticleEmitterBase::UpdateLifeTime() {
  if (!particleSystem || !particleSystem->particleModel) return;

  particleSystem->particleModel->setLifeTime(particleLifeTimeMin,
                                             particleLifeTimeMax);
}

RuntimeParticleEmitterObject::RuntimeParticleEmitterObject(
    RuntimeScene& scene, const ParticleEmitterObject& particleEmitterObject)
    : RuntimeObject(scene, particleEmitterObject), hasSomeParticles(true) {
  ParticleEmitterBase::operator=(particleEmitterObject);

  CreateParticleSystem();
  SetTexture(scene, GetParticleTexture());

  OnPositionChanged();
}

ParticleEmitterBase::~ParticleEmitterBase() {
  if (particleSystem) delete particleSystem;
}

/**
 * Render object at runtime
 */
bool RuntimeParticleEmitterObject::Draw(sf::RenderTarget& renderTarget) {
  // Don't draw anything if hidden
  if (hidden) return true;

  renderTarget.popGLStates();

  float xView = renderTarget.getView().getCenter().x * 0.25f;
  float yView = -renderTarget.getView().getCenter().y * 0.25f;

  glMatrixMode(GL_MODELVIEW);
  glLoadIdentity();

  glRotatef(renderTarget.getView().getRotation(), 0, 0, 1);
  glTranslatef(
      -xView, -yView, -75.0f * (renderTarget.getView().getSize().y / 600.0f));

  SPK::GL::GLRenderer::saveGLStates();

  GetParticleSystem()->particleSystem->render();
  SPK::GL::GLRenderer::restoreGLStates();

  renderTarget.pushGLStates();

  return true;
}

void RuntimeParticleEmitterObject::OnPositionChanged() {
  if (GetParticleSystem() && GetParticleSystem()->zone)
    GetParticleSystem()->zone->setPosition(
        SPK::Vector3D(GetX() * 0.25f, -GetY() * 0.25f, 0));
}

#if defined(GD_IDE_ONLY)
void ParticleEmitterObject::ExposeResources(
    gd::ArbitraryResourceWorker& worker) {
  gd::String texture = GetParticleTexture();
  worker.ExposeImage(texture);
  SetParticleTexture(texture);
}

void RuntimeParticleEmitterObject::GetPropertyForDebugger(
    std::size_t propertyNb, gd::String& name, gd::String& value) const {
  if (!GetParticleSystem() || !GetParticleSystem()->particleSystem) return;

  if (propertyNb == 0) {
    name = _("Particles number");
    value =
        gd::String::From(GetParticleSystem()->particleSystem->getNbParticles());
  }
}

bool RuntimeParticleEmitterObject::ChangeProperty(std::size_t propertyNb,
                                                  gd::String newValue) {
  if (propertyNb == 0) {
    return false;
  }

  return true;
}

std::size_t RuntimeParticleEmitterObject::GetNumberOfProperties() const {
  return 1;
}
#endif

void ParticleEmitterBase::SetTank(float newValue) {
  tank = newValue;
  if (particleSystem && particleSystem->emitter)
    particleSystem->emitter->setFlow(tank);
}
void ParticleEmitterBase::SetFlow(float newValue) {
  flow = newValue;
  if (particleSystem && particleSystem->emitter)
    particleSystem->emitter->setFlow(flow);
}
void ParticleEmitterBase::SetEmitterForceMin(float newValue) {
  emitterForceMin = newValue;
  if (particleSystem && particleSystem->emitter)
    particleSystem->emitter->setForce(emitterForceMin, emitterForceMax);
}
void ParticleEmitterBase::SetEmitterForceMax(float newValue) {
  emitterForceMax = newValue;
  if (particleSystem && particleSystem->emitter)
    particleSystem->emitter->setForce(emitterForceMin, emitterForceMax);
}
void ParticleEmitterBase::SetParticleGravityX(float newValue) {
  particleGravityX = newValue;
  if (particleSystem && particleSystem->group)
    particleSystem->group->setGravity(
        SPK::Vector3D(particleGravityX, -particleGravityY, particleGravityZ));
}
void ParticleEmitterBase::SetParticleGravityY(float newValue) {
  particleGravityY = newValue;
  if (particleSystem && particleSystem->group)
    particleSystem->group->setGravity(
        SPK::Vector3D(particleGravityX, -particleGravityY, particleGravityZ));
}
void ParticleEmitterBase::SetParticleGravityZ(float newValue) {
  particleGravityZ = newValue;
  if (particleSystem && particleSystem->group)
    particleSystem->group->setGravity(
        SPK::Vector3D(particleGravityX, -particleGravityY, particleGravityZ));
}
void ParticleEmitterBase::SetFriction(float newValue) {
  friction = newValue;
  if (particleSystem && particleSystem->group)
    particleSystem->group->setFriction(friction);
}
void ParticleEmitterBase::SetEmitterXDirection(float newValue) {
  emitterXDirection = newValue;
  if (particleSystem && particleSystem->emitter)
    particleSystem->emitter->setDirection(SPK::Vector3D(
        emitterXDirection, -emitterYDirection, emitterZDirection));
}
void ParticleEmitterBase::SetEmitterYDirection(float newValue) {
  emitterYDirection = newValue;
  if (particleSystem && particleSystem->emitter)
    particleSystem->emitter->setDirection(SPK::Vector3D(
        emitterXDirection, -emitterYDirection, emitterZDirection));
}
void ParticleEmitterBase::SetEmitterZDirection(float newValue) {
  emitterZDirection = newValue;
  if (particleSystem && particleSystem->emitter)
    particleSystem->emitter->setDirection(SPK::Vector3D(
        emitterXDirection, -emitterYDirection, emitterZDirection));
}
void ParticleEmitterBase::SetEmitterAngleA(float newValue) {
  emitterAngleA = newValue;
  if (particleSystem && particleSystem->emitter)
    particleSystem->emitter->setAngles(emitterAngleA / 180.0f * 3.14159f,
                                       emitterAngleB / 180.0f * 3.14159f);
}
void ParticleEmitterBase::SetEmitterAngleB(float newValue) {
  emitterAngleB = newValue;
  if (particleSystem && particleSystem->emitter)
    particleSystem->emitter->setAngles(emitterAngleA / 180.0f * 3.14159f,
                                       emitterAngleB / 180.0f * 3.14159f);
}
void ParticleEmitterBase::SetZoneRadius(float newValue) {
  zoneRadius = newValue;
  if (particleSystem && particleSystem->zone)
    particleSystem->zone->setRadius(zoneRadius);
}

void RuntimeParticleEmitterObject::Update(const RuntimeScene& scene) {
  double elapsedTimeInSeconds =
      static_cast<double>(GetElapsedTime(scene)) / 1000000.0;
  if (GetParticleSystem())
    hasSomeParticles =
        GetParticleSystem()->particleSystem->update(elapsedTimeInSeconds);

  if (GetDestroyWhenNoParticles() && !hasSomeParticles)
    DeleteFromScene(const_cast<RuntimeScene&>(scene));  // Ugly const cast
}

void ParticleEmitterBase::SetParticleGravityAngle(float newAngleInDegree) {
  float length = sqrt(GetParticleGravityY() * GetParticleGravityY() +
                      GetParticleGravityX() * GetParticleGravityX());

  SetParticleGravityX(cos(newAngleInDegree / 180.0f * 3.14159f) * length);
  SetParticleGravityY(sin(newAngleInDegree / 180.0f * 3.14159f) * length);
}
void ParticleEmitterBase::SetParticleGravityLength(float length) {
  float angle = atan2(GetParticleGravityY(), GetParticleGravityX());

  SetParticleGravityX(cos(angle) * length);
  SetParticleGravityY(sin(angle) * length);
}

float ParticleEmitterBase::GetParticleGravityAngle() const {
  return atan2(GetParticleGravityY(), GetParticleGravityX()) * 180.0f /
         3.14159f;
}
float ParticleEmitterBase::GetParticleGravityLength() const {
  return sqrt(GetParticleGravityY() * GetParticleGravityY() +
              GetParticleGravityX() * GetParticleGravityX());
}

bool RuntimeParticleEmitterObject::SetAngle(float newAngleInDegrees) {
  SetEmitterXDirection(cos(newAngleInDegrees / 180.0f * 3.14159f));
  SetEmitterYDirection(sin(newAngleInDegrees / 180.0f * 3.14159f));

  return true;
}

float RuntimeParticleEmitterObject::GetAngle() const {
  return atan2f(GetEmitterYDirection(), GetEmitterXDirection()) * 180.0f /
         3.14159f;
}

void ParticleEmitterBase::SetParticleColor1(const gd::String& color) {
  std::vector<gd::String> colors = color.Split(U';');

  if (colors.size() < 3) return;  // Color is incorrect

  SetParticleRed1(colors[0].To<int>());
  SetParticleGreen1(colors[1].To<int>());
  SetParticleBlue1(colors[2].To<int>());
}
void ParticleEmitterBase::SetParticleColor2(const gd::String& color) {
  std::vector<gd::String> colors = color.Split(U';');

  if (colors.size() < 3) return;  // Color is incorrect

  SetParticleRed2(colors[0].To<int>());
  SetParticleGreen2(colors[1].To<int>());
  SetParticleBlue2(colors[2].To<int>());
}

/**
 * Change the texture
 */
void ParticleEmitterBase::SetTexture(RuntimeScene& scene,
                                     const gd::String& textureParticleName_) {
  textureParticleName = textureParticleName_;
  if (particleSystem && rendererType == Quad) {
    // Load new texture
    particleSystem->textureParticle =
        scene.GetImageManager()->GetSFMLTexture(textureParticleName);

    // Notify the renderer of the change
    SPK::GL::GLQuadRenderer* quadRenderer =
        dynamic_cast<SPK::GL::GLQuadRenderer*>(particleSystem->renderer);

    if (quadRenderer) {
      quadRenderer->setTexturingMode(SPK::TEXTURE_2D);
      quadRenderer->setTexture(
          particleSystem->textureParticle->texture.getNativeHandle());
    }
  }
}

/**
 * Used by copy constructor and assignment operator.
 * \warning Do not forget to update me if members were changed!
 */
void ParticleEmitterBase::Init(const ParticleEmitterBase& other) {
  if (particleSystem) delete particleSystem;
  if (other.particleSystem)
    particleSystem = new ParticleSystemWrapper(*other.particleSystem);
  else
    particleSystem = NULL;

  textureParticleName = other.textureParticleName;
  rendererType = other.rendererType;
  rendererParam1 = other.rendererParam1;
  rendererParam2 = other.rendererParam2;
  additive = other.additive;
  tank = other.tank;
  flow = other.flow;
  emitterForceMin = other.emitterForceMin;
  emitterForceMax = other.emitterForceMax;
  emitterXDirection = other.emitterXDirection;
  emitterYDirection = other.emitterYDirection;
  emitterZDirection = other.emitterZDirection;
  emitterAngleA = other.emitterAngleA;
  emitterAngleB = other.emitterAngleB;
  zoneRadius = other.zoneRadius;
  particleGravityX = other.particleGravityX;
  particleGravityY = other.particleGravityY;
  particleGravityZ = other.particleGravityZ;
  friction = other.friction;
  particleLifeTimeMin = other.particleLifeTimeMin;
  particleLifeTimeMax = other.particleLifeTimeMax;
  redParam = other.redParam;
  greenParam = other.greenParam;
  blueParam = other.blueParam;
  alphaParam = other.alphaParam;
  sizeParam = other.sizeParam;
  angleParam = other.angleParam;
  particleRed1 = other.particleRed1;
  particleRed2 = other.particleRed2;
  particleGreen1 = other.particleGreen1;
  particleGreen2 = other.particleGreen2;
  particleBlue1 = other.particleBlue1;
  particleBlue2 = other.particleBlue2;
  particleAlpha1 = other.particleAlpha1;
  particleAlpha2 = other.particleAlpha2;
  particleSize1 = other.particleSize1;
  particleSize2 = other.particleSize2;
  particleAngle1 = other.particleAngle1;
  particleAngle2 = other.particleAngle2;
  particleAlphaRandomness1 = other.particleAlphaRandomness1;
  particleAlphaRandomness2 = other.particleAlphaRandomness2;
  particleSizeRandomness1 = other.particleSizeRandomness1;
  particleSizeRandomness2 = other.particleSizeRandomness2;
  particleAngleRandomness1 = other.particleAngleRandomness1;
  particleAngleRandomness2 = other.particleAngleRandomness2;
  maxParticleNb = other.maxParticleNb;
  destroyWhenNoParticles = other.destroyWhenNoParticles;
}
