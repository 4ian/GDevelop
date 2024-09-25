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
      particleColor1("255;51;51"),
      particleColor2("255;255;0"),
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

bool ParticleEmitterObject::UpdateProperty(const gd::String& propertyName,
                                           const gd::String& newValue) {
  if (propertyName == "textureParticleName") {
    SetParticleTexture(newValue);
    return true;
  }
  if (propertyName == "rendererType") {
    auto newRendererType = newValue == "Circle" ? Point
                           : newValue == "Line" ? Line
                                                : Quad;
    SetRendererType(newRendererType);
    if (newRendererType != Quad) {
      SetParticleTexture("");
    }

    return true;
  }
  if (propertyName == "particlesWidth") {
    SetRendererParam1(newValue.To<double>());
    return true;
  }
  if (propertyName == "particlesHeight") {
    SetRendererParam2(newValue.To<double>());
    return true;
  }
  if (propertyName == "lineLength") {
    SetRendererParam1(newValue.To<double>());
    return true;
  }
  if (propertyName == "lineThickness") {
    SetRendererParam2(newValue.To<double>());
    return true;
  }
  if (propertyName == "particlesSize") {
    SetRendererParam1(newValue.To<double>());
    return true;
  }
  if (propertyName == "particlesStartSize") {
    SetParticleSize1(newValue.To<double>());
    return true;
  }
  if (propertyName == "particlesEndSize") {
    SetParticleSize2(newValue.To<double>());
    return true;
  }
  if (propertyName == "particlesStartColor") {
    SetParticleColor1(newValue);
    return true;
  }
  if (propertyName == "particlesEndColor") {
    SetParticleColor2(newValue);
    return true;
  }
  if (propertyName == "particlesStartOpacity") {
    SetParticleAlpha1(newValue.To<double>());
    return true;
  }
  if (propertyName == "particlesEndOpacity") {
    SetParticleAlpha2(newValue.To<double>());
    return true;
  }
  if (propertyName == "additiveRendering") {
    if (newValue == "1")
      SetRenderingAdditive();
    else
      SetRenderingAlpha();
    return true;
  }
  if (propertyName == "deleteWhenOutOfParticles") {
    SetDestroyWhenNoParticles(newValue == "1");
    return true;
  }
  if (propertyName == "maxParticlesCount") {
    SetMaxParticleNb(newValue.To<double>());
    return true;
  }
  if (propertyName == "tank") {
    SetTank(newValue.To<double>());
    return true;
  }
  if (propertyName == "flow") {
    SetFlow(newValue.To<double>());
    return true;
  }
  if (propertyName == "emitterForceMin") {
    SetEmitterForceMin(newValue.To<double>());
    return true;
  }
  if (propertyName == "emitterForceMax") {
    SetEmitterForceMax(newValue.To<double>());
    return true;
  }
  if (propertyName == "particleRotationSpeedMin") {
    SetParticleAngle1(newValue.To<double>());
    return true;
  }
  if (propertyName == "particleRotationSpeedMax") {
    SetParticleAngle2(newValue.To<double>());
    return true;
  }
  if (propertyName == "coneSprayAngle") {
    SetConeSprayAngle(newValue.To<double>());
    return true;
  }
  if (propertyName == "zoneRadius") {
    SetZoneRadius(newValue.To<double>());
    return true;
  }
  if (propertyName == "particleGravityX") {
    SetParticleGravityX(newValue.To<double>());
    return true;
  }
  if (propertyName == "particleGravityY") {
    SetParticleGravityY(newValue.To<double>());
    return true;
  }
  if (propertyName == "particleLifeTimeMin") {
    SetParticleLifeTimeMin(newValue.To<double>());
    return true;
  }
  if (propertyName == "particleLifeTimeMax") {
    SetParticleLifeTimeMax(newValue.To<double>());
    return true;
  }
  if (propertyName == "jumpForwardInTimeOnCreation") {
    SetJumpForwardInTimeOnCreation(newValue.To<double>());
    return true;
  }

  return false;
}

std::map<gd::String, gd::PropertyDescriptor>
ParticleEmitterObject::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> objectProperties;

  objectProperties["rendererType"]
      .SetValue(GetRendererType() == Point  ? "Circle"
                : GetRendererType() == Line ? "Line"
                                            : "Image")
      .SetType("choice")
      .AddExtraInfo("Circle")
      .AddExtraInfo("Line")
      .AddExtraInfo("Image")
      .SetLabel(_("Particle type"))
      .SetHasImpactOnOtherProperties(true);

  if (GetRendererType() == Quad) {
    objectProperties["textureParticleName"]
        .SetValue(GetParticleTexture())
        .SetType("resource")
        .AddExtraInfo("image")
        .SetLabel(_("Texture"));

    objectProperties["particlesWidth"]
        .SetValue(gd::String::From(GetRendererParam1()))
        .SetType("number")
        .SetLabel(_("Width"))
        .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
        .SetGroup(_("Particles size"));

    objectProperties["particlesHeight"]
        .SetValue(gd::String::From(GetRendererParam2()))
        .SetType("number")
        .SetLabel(_("Height"))
        .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
        .SetGroup(_("Particles size"));
  } else if (GetRendererType() == Line) {
    objectProperties["lineLength"]
        .SetValue(gd::String::From(GetRendererParam1()))
        .SetType("number")
        .SetLabel(_("Lines length"))
        .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
        .SetGroup(_("Particles size"));

    objectProperties["lineThickness"]
        .SetValue(gd::String::From(GetRendererParam2()))
        .SetType("number")
        .SetLabel(_("Lines thickness"))
        .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
        .SetGroup(_("Particles size"));
  } else {
    objectProperties["particlesSize"]
        .SetValue(gd::String::From(GetRendererParam1()))
        .SetType("number")
        .SetLabel(_("Size"))
        .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
        .SetGroup(_("Particles size"));
  }

  objectProperties["particlesStartSize"]
      .SetValue(gd::String::From(GetParticleSize1()))
      .SetType("number")
      .SetLabel(_("Start size (in percents)"))
      .SetGroup(_("Particles size"));

  objectProperties["particlesEndSize"]
      .SetValue(gd::String::From(GetParticleSize2()))
      .SetType("number")
      .SetLabel(_("End size (in percents)"))
      .SetGroup(_("Particles size"));

  objectProperties["particlesStartColor"]
      .SetValue(GetParticleColor1())
      .SetType("color")
      .SetLabel(_("Start color"))
      .SetGroup(_("Particles color"));

  objectProperties["particlesEndColor"]
      .SetValue(GetParticleColor2())
      .SetType("color")
      .SetLabel(_("End color"))
      .SetGroup(_("Particles color"));

  objectProperties["particlesStartOpacity"]
      .SetValue(gd::String::From(GetParticleAlpha1()))
      .SetType("number")
      .SetLabel(_("Start opacity (0-255)"))
      .SetGroup(_("Particles color"));

  objectProperties["particlesEndOpacity"]
      .SetValue(gd::String::From(GetParticleAlpha2()))
      .SetType("number")
      .SetLabel(_("End opacity (0-255)"))
      .SetGroup(_("Particles color"));

  objectProperties["additiveRendering"]
      .SetValue(IsRenderingAdditive() ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Additive rendering"))
      .SetGroup(_("Particles color"));

  objectProperties["deleteWhenOutOfParticles"]
      .SetValue(GetDestroyWhenNoParticles() ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Delete when out of particles"))
      .SetGroup(_("Particles flow"));

  objectProperties["maxParticlesCount"]
      .SetValue(gd::String::From(GetMaxParticleNb()))
      .SetType("number")
      .SetLabel(_("Max particles count"))
      .SetGroup(_("Particles flow"));

  objectProperties["tank"]
      .SetValue(gd::String::From(GetTank()))
      .SetType("number")
      .SetLabel(_("Tank"))
      .SetGroup(_("Particles flow"))
      .AddExtraInfo("canBeUnlimitedUsingMinus1");

  objectProperties["flow"]
      .SetValue(gd::String::From(GetFlow()))
      .SetType("number")
      .SetLabel(_("Flow"))
      .SetGroup(_("Particles flow (particles/seconds)"));

  objectProperties["emitterForceMin"]
      .SetValue(gd::String::From(GetEmitterForceMin()))
      .SetType("number")
      .SetLabel(_("Emitter force min"))
      .SetGroup(_("Particles movement"));

  objectProperties["emitterForceMax"]
      .SetValue(gd::String::From(GetEmitterForceMax()))
      .SetType("number")
      .SetLabel(_("Emitter force max"))
      .SetGroup(_("Particles movement"));

  objectProperties["particleRotationSpeedMin"]
      .SetValue(gd::String::From(GetParticleAngle1()))
      .SetType("number")
      .SetLabel(_("Minimum rotation speed"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Particles movement"));

  objectProperties["particleRotationSpeedMax"]
      .SetValue(gd::String::From(GetParticleAngle2()))
      .SetType("number")
      .SetLabel(_("Maximum rotation speed"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Particles movement"));

  objectProperties["coneSprayAngle"]
      .SetValue(gd::String::From(GetConeSprayAngle()))
      .SetType("number")
      .SetLabel(_("Cone spray angle"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Particles movement"));

  objectProperties["zoneRadius"]
      .SetValue(gd::String::From(GetZoneRadius()))
      .SetType("number")
      .SetLabel(_("Emitter radius"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Particles movement"));

  objectProperties["particleGravityX"]
      .SetValue(gd::String::From(GetParticleGravityX()))
      .SetType("number")
      .SetLabel(_("Gravity X"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Particles gravity"));

  objectProperties["particleGravityY"]
      .SetValue(gd::String::From(GetParticleGravityY()))
      .SetType("number")
      .SetLabel(_("Gravity Y"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Particles gravity"));

  objectProperties["particleLifeTimeMin"]
      .SetValue(gd::String::From(GetParticleLifeTimeMin()))
      .SetType("number")
      .SetLabel(_("Minimum lifetime"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetSecond())
      .SetGroup(_("Particles life time"));

  objectProperties["particleLifeTimeMax"]
      .SetValue(gd::String::From(GetParticleLifeTimeMax()))
      .SetType("number")
      .SetLabel(_("Maximum lifetime"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetSecond())
      .SetGroup(_("Particles life time"));

  objectProperties["jumpForwardInTimeOnCreation"]
      .SetValue(gd::String::From(GetJumpForwardInTimeOnCreation()))
      .SetType("number")
      .SetLabel(_("Jump forward in time on creation"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetSecond())
      .SetGroup(_("Particles life time"));

  return objectProperties;
}

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

  particleColor1 = element.GetStringAttribute("particleColor1");
  // Compatibility with GD <= 5.4.210
  if (element.HasChild("particleRed1") && !element.HasChild("particleColor1")) {
    particleColor1 =
        element.GetChild("particleRed1").GetValue().GetString() + ";" +
        element.GetChild("particleGreen1").GetValue().GetString() + ";" +
        element.GetChild("particleBlue1").GetValue().GetString();
  }
  // end of compatibility code

  particleColor2 = element.GetStringAttribute("particleColor2");
  // Compatibility with GD <= 5.4.210
  if (element.HasChild("particleRed2") && !element.HasChild("particleColor2")) {
    particleColor2 =
        element.GetChild("particleRed2").GetValue().GetString() + ";" +
        element.GetChild("particleGreen2").GetValue().GetString() + ";" +
        element.GetChild("particleBlue2").GetValue().GetString();
  }
  // end of compatibility code

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
  jumpForwardInTimeOnCreation =
      element.GetDoubleAttribute("jumpForwardInTimeOnCreation");

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
  element.SetAttribute("particleColor1", particleColor1);
  element.SetAttribute("particleColor2", particleColor2);
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
  element.SetAttribute("jumpForwardInTimeOnCreation",
                       jumpForwardInTimeOnCreation);

  gd::String rendererTypeStr = "Point";
  if (rendererType == Line)
    rendererTypeStr = "Line";
  else if (rendererType == Quad)
    rendererTypeStr = "Quad";
  element.SetAttribute("rendererType", rendererTypeStr);

  // Still serialize the old particle color components for compatibility with GDevelop <= 5.4.210.
  // Remove this in a few releases (or when hex strings are accepted for the color).
  {
    auto rgb = particleColor1.Split(';');
    if (rgb.size() == 3) {
      element.SetAttribute("particleRed1", rgb[0].To<double>());
      element.SetAttribute("particleGreen1", rgb[1].To<double>());
      element.SetAttribute("particleBlue1", rgb[2].To<double>());
    }
  }
  {
    auto rgb = particleColor2.Split(';');
    if (rgb.size() == 3) {
      element.SetAttribute("particleRed2", rgb[0].To<double>());
      element.SetAttribute("particleGreen2", rgb[1].To<double>());
      element.SetAttribute("particleBlue2", rgb[2].To<double>());
    }
  }
  // end of compatibility code
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
  particleColor1 = other.particleColor1;
  particleColor2 = other.particleColor2;
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
