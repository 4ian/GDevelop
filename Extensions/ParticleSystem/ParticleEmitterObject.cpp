/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "ParticleEmitterObject.h"

#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

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
      emitterAngleA(0),
      emitterAngleB(90),
      zoneRadius(3.0f),
      particleGravityX(0.0f),
      particleGravityY(0.0f),
      particleLifeTimeMin(0.5f),
      particleLifeTimeMax(2.5f),
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
      jumpForwardInTimeOnCreation(0.0f) {}

ParticleEmitterObject::ParticleEmitterObject() {}

void ParticleEmitterObject::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  ParticleEmitterBase::UnserializeParticleEmitterBaseFrom(element);
}

void ParticleEmitterBase::UnserializeParticleEmitterBaseFrom(
    const gd::SerializerElement& element) {
  tank = element.GetDoubleAttribute("tank");
  flow = element.GetDoubleAttribute("flow");
  emitterForceMin = element.GetDoubleAttribute("emitterForceMin");
  emitterForceMax = element.GetDoubleAttribute("emitterForceMax");
  emitterAngleA = element.GetDoubleAttribute("emitterAngleA");
  emitterAngleB = element.GetDoubleAttribute("emitterAngleB");
  zoneRadius = element.GetDoubleAttribute("zoneRadius");
  particleGravityX = element.GetDoubleAttribute("particleGravityX");
  particleGravityY = element.GetDoubleAttribute("particleGravityY");
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
  jumpForwardInTimeOnCreation = element.GetDoubleAttribute("jumpForwardInTimeOnCreation");

  {
    gd::String result = element.GetStringAttribute("rendererType");
    if (result == "Line")
      rendererType = Line;
    else if (result == "Quad")
      rendererType = Quad;
    else
      rendererType = Point;
  }
}

void ParticleEmitterObject::DoSerializeTo(
    gd::SerializerElement& element) const {
  ParticleEmitterBase::SerializeParticleEmitterBaseTo(element);
}

void ParticleEmitterBase::SerializeParticleEmitterBaseTo(
    gd::SerializerElement& element) const {
  element.SetAttribute("tank", tank);
  element.SetAttribute("flow", flow);
  element.SetAttribute("emitterForceMin", emitterForceMin);
  element.SetAttribute("emitterForceMax", emitterForceMax);
  element.SetAttribute("emitterAngleA", emitterAngleA);
  element.SetAttribute("emitterAngleB", emitterAngleB);
  element.SetAttribute("zoneRadius", zoneRadius);
  element.SetAttribute("particleGravityX", particleGravityX);
  element.SetAttribute("particleGravityY", particleGravityY);
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
  element.SetAttribute("jumpForwardInTimeOnCreation", jumpForwardInTimeOnCreation);

  gd::String rendererTypeStr = "Point";
  if (rendererType == Line)
    rendererTypeStr = "Line";
  else if (rendererType == Quad)
    rendererTypeStr = "Quad";
  element.SetAttribute("rendererType", rendererTypeStr);
}

ParticleEmitterBase::~ParticleEmitterBase() {}

void ParticleEmitterObject::ExposeResources(
    gd::ArbitraryResourceWorker& worker) {
  gd::String texture = GetParticleTexture();
  worker.ExposeImage(texture);
  SetParticleTexture(texture);
}

void ParticleEmitterBase::SetTank(double newValue) { tank = newValue; }
void ParticleEmitterBase::SetFlow(double newValue) { flow = newValue; }
void ParticleEmitterBase::SetEmitterForceMin(double newValue) {
  emitterForceMin = newValue;
}
void ParticleEmitterBase::SetEmitterForceMax(double newValue) {
  emitterForceMax = newValue;
}
void ParticleEmitterBase::SetParticleGravityX(double newValue) {
  particleGravityX = newValue;
}
void ParticleEmitterBase::SetParticleGravityY(double newValue) {
  particleGravityY = newValue;
}
void ParticleEmitterBase::SetEmitterAngleA(double newValue) {
  emitterAngleA = newValue;
}
void ParticleEmitterBase::SetEmitterAngleB(double newValue) {
  emitterAngleB = newValue;
}
void ParticleEmitterBase::SetZoneRadius(double newValue) {
  zoneRadius = newValue;
}

void ParticleEmitterBase::SetParticleGravityAngle(double newAngleInDegree) {
  double length = sqrt(GetParticleGravityY() * GetParticleGravityY() +
                       GetParticleGravityX() * GetParticleGravityX());

  SetParticleGravityX(cos(newAngleInDegree / 180.0f * 3.14159f) * length);
  SetParticleGravityY(sin(newAngleInDegree / 180.0f * 3.14159f) * length);
}
void ParticleEmitterBase::SetParticleGravityLength(double length) {
  double angle = atan2(GetParticleGravityY(), GetParticleGravityX());

  SetParticleGravityX(cos(angle) * length);
  SetParticleGravityY(sin(angle) * length);
}

double ParticleEmitterBase::GetParticleGravityAngle() const {
  return atan2(GetParticleGravityY(), GetParticleGravityX()) * 180.0f /
         3.14159f;
}
double ParticleEmitterBase::GetParticleGravityLength() const {
  return sqrt(GetParticleGravityY() * GetParticleGravityY() +
              GetParticleGravityX() * GetParticleGravityX());
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
 * Used by copy constructor and assignment operator.
 * \warning Do not forget to update me if members were changed!
 */
void ParticleEmitterBase::Init(const ParticleEmitterBase& other) {
  // TODO: might be useless to redefine the copy ctor/assignment operator.
  textureParticleName = other.textureParticleName;
  rendererType = other.rendererType;
  rendererParam1 = other.rendererParam1;
  rendererParam2 = other.rendererParam2;
  additive = other.additive;
  tank = other.tank;
  flow = other.flow;
  emitterForceMin = other.emitterForceMin;
  emitterForceMax = other.emitterForceMax;
  emitterAngleA = other.emitterAngleA;
  emitterAngleB = other.emitterAngleB;
  zoneRadius = other.zoneRadius;
  particleGravityX = other.particleGravityX;
  particleGravityY = other.particleGravityY;
  particleLifeTimeMin = other.particleLifeTimeMin;
  particleLifeTimeMax = other.particleLifeTimeMax;
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
  jumpForwardInTimeOnCreation = other.jumpForwardInTimeOnCreation;
}
