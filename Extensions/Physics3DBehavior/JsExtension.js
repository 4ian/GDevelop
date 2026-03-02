//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />
/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Changes in this file are watched and automatically imported if the editor
 * is running. You can also manually run `node import-GDJS-Runtime.js` (in newIDE/app/scripts).
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'Physics3D',
        _('3D physics engine'),
        "The 3D physics engine simulates realistic object physics, with gravity, forces, collisions, joints, etc. It's perfect for almost all 3D games.\n" +
          '\n' +
          'Objects like floors or wall objects should usually be set to "Static" as type. Objects that should be moveable are usually "Dynamic" (default). "Kinematic" objects (typically, players or controlled characters) are only moved by their "linear velocity" and "angular velocity" - they can interact with other objects but only these other objects will move.\n' +
          '\n' +
          'Forces (and impulses) are expressed in all conditions/expressions/actions of the 3D physics engine in Newtons (N). Typical values for a force are 10-200 N. One meter is 100 pixels by default in the game (check the world scale). Mass is expressed in kilograms (kg).',
        'Florian Rival',
        'MIT'
      )
      .setShortDescription(
        '3D rigid-body physics behavior: gravity, forces, collisions, joints. Static/dynamic/kinematic bodies. Mass, damping.'
      )
      .setDimension('3D')
      .setExtensionHelpPath('/behaviors/physics3d')
      .setCategory('Movement')
      .setTags('physics, gravity, obstacle, collision');
    extension
      .addInstructionOrExpressionGroupMetadata(_('3D physics engine'))
      .setIcon('JsPlatform/Extensions/physics3d.svg');
    {
      const behavior = new gd.BehaviorJsImplementation();
      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'object3D') {
          behaviorContent.getChild('object3D').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'bodyType') {
          const normalizedValue = newValue.toLowerCase();
          let bodyTypeValue = '';
          if (normalizedValue === 'static') bodyTypeValue = 'Static';
          else if (normalizedValue === 'dynamic') bodyTypeValue = 'Dynamic';
          else if (normalizedValue === 'kinematic') bodyTypeValue = 'Kinematic';
          else return false;

          behaviorContent.getChild('bodyType').setStringValue(bodyTypeValue);
          if (
            bodyTypeValue !== 'Static' &&
            behaviorContent.getChild('shape').getStringValue().toLowerCase() ===
              'mesh'
          ) {
            behaviorContent.getChild('shape').setStringValue('Box');
          }
          return true;
        }

        if (propertyName === 'bullet') {
          behaviorContent.getChild('bullet').setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'fixedRotation') {
          behaviorContent
            .getChild('fixedRotation')
            .setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'shape') {
          const normalizedValue = newValue.toLowerCase();
          let shapeValue = '';
          if (normalizedValue === 'box') shapeValue = 'Box';
          else if (normalizedValue === 'capsule') shapeValue = 'Capsule';
          else if (normalizedValue === 'sphere') shapeValue = 'Sphere';
          else if (normalizedValue === 'cylinder') shapeValue = 'Cylinder';
          else if (normalizedValue === 'mesh') shapeValue = 'Mesh';
          else return false;

          behaviorContent.getChild('shape').setStringValue(shapeValue);
          if (shapeValue === 'Mesh') {
            behaviorContent.getChild('bodyType').setStringValue('Static');
          }
          return true;
        }

        if (propertyName === 'meshShapeResourceName') {
          behaviorContent
            .getChild('meshShapeResourceName')
            .setStringValue(newValue);
          return true;
        }

        if (propertyName === 'shapeOrientation') {
          const normalizedValue = newValue.toLowerCase();
          let orientationValue = '';
          if (normalizedValue === 'x') orientationValue = 'X';
          else if (normalizedValue === 'y') orientationValue = 'Y';
          else if (normalizedValue === 'z') orientationValue = 'Z';
          else return false;

          behaviorContent
            .getChild('shapeOrientation')
            .setStringValue(orientationValue);
          return true;
        }

        if (propertyName === 'shapeDimensionA') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeDimensionA')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shapeDimensionB') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeDimensionB')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shapeDimensionC') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeDimensionC')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shapeOffsetX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeOffsetX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shapeOffsetY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeOffsetY')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shapeOffsetZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeOffsetZ')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'massCenterOffsetX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('massCenterOffsetX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'massCenterOffsetY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('massCenterOffsetY')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'massCenterOffsetZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('massCenterOffsetZ')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'density') {
          behaviorContent
            .getChild('density')
            .setDoubleValue(parseFloat(newValue));
          return true;
        }

        if (propertyName === 'massOverride') {
          behaviorContent
            .getChild('massOverride')
            .setDoubleValue(parseFloat(newValue));
          return true;
        }

        if (propertyName === 'friction') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent.getChild('friction').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'restitution') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('restitution')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'linearDamping') {
          const newValueAsNumber = Math.max(0, parseFloat(newValue));
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('linearDamping')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'angularDamping') {
          const newValueAsNumber = Math.max(0, parseFloat(newValue));
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('angularDamping')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gravityScale') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gravityScale')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'layers') {
          behaviorContent
            .getChild('layers')
            .setIntValue(parseInt(newValue, 10));
          return true;
        }

        if (propertyName === 'masks') {
          behaviorContent.getChild('masks').setIntValue(parseInt(newValue, 10));
          return true;
        }

        if (propertyName === 'ragdollRole') {
          if (!behaviorContent.hasChild('ragdollRole')) {
            behaviorContent.addChild('ragdollRole').setStringValue('None');
          }
          behaviorContent.getChild('ragdollRole').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'ragdollGroupTag') {
          if (!behaviorContent.hasChild('ragdollGroupTag')) {
            behaviorContent.addChild('ragdollGroupTag').setStringValue('');
          }
          behaviorContent.getChild('ragdollGroupTag').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'jointAutoWakeBodies') {
          if (!behaviorContent.hasChild('jointAutoWakeBodies')) {
            behaviorContent.addChild('jointAutoWakeBodies').setBoolValue(true);
          }
          behaviorContent
            .getChild('jointAutoWakeBodies')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }

        if (propertyName === 'jointAutoStabilityPreset') {
          const normalizedValue = newValue.toLowerCase();
          let presetValue = 'Balanced';
          if (normalizedValue === 'stable') presetValue = 'Stable';
          else if (normalizedValue === 'ultrastable')
            presetValue = 'UltraStable';
          if (!behaviorContent.hasChild('jointAutoStabilityPreset')) {
            behaviorContent
              .addChild('jointAutoStabilityPreset')
              .setStringValue('Stable');
          }
          behaviorContent
            .getChild('jointAutoStabilityPreset')
            .setStringValue(presetValue);
          return true;
        }

        if (propertyName === 'jointAutoBreakForce') {
          const newValueAsNumber = Math.max(0, parseFloat(newValue));
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointAutoBreakForce')) {
            behaviorContent.addChild('jointAutoBreakForce').setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointAutoBreakForce')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointAutoBreakTorque') {
          const newValueAsNumber = Math.max(0, parseFloat(newValue));
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointAutoBreakTorque')) {
            behaviorContent.addChild('jointAutoBreakTorque').setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointAutoBreakTorque')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorEnabled') {
          if (!behaviorContent.hasChild('jointEditorEnabled')) {
            behaviorContent.addChild('jointEditorEnabled').setBoolValue(false);
          }
          behaviorContent
            .getChild('jointEditorEnabled')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }

        if (propertyName === 'jointEditorTargetObjectName') {
          if (!behaviorContent.hasChild('jointEditorTargetObjectName')) {
            behaviorContent
              .addChild('jointEditorTargetObjectName')
              .setStringValue('');
          }
          behaviorContent
            .getChild('jointEditorTargetObjectName')
            .setStringValue(newValue);
          return true;
        }

        if (propertyName === 'jointEditorType') {
          const normalizedValue = newValue.toLowerCase();
          let jointType = 'None';
          if (normalizedValue === 'fixed') jointType = 'Fixed';
          else if (normalizedValue === 'point') jointType = 'Point';
          else if (normalizedValue === 'hinge') jointType = 'Hinge';
          else if (normalizedValue === 'slider') jointType = 'Slider';
          else if (normalizedValue === 'distance') jointType = 'Distance';
          else if (normalizedValue === 'cone') jointType = 'Cone';
          else if (
            normalizedValue === 'swingtwist' ||
            normalizedValue === 'swing twist'
          )
            jointType = 'SwingTwist';
          if (!behaviorContent.hasChild('jointEditorType')) {
            behaviorContent.addChild('jointEditorType').setStringValue('None');
          }
          behaviorContent.getChild('jointEditorType').setStringValue(jointType);
          return true;
        }

        if (propertyName === 'jointEditorAnchorOffsetX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorAnchorOffsetX')) {
            behaviorContent
              .addChild('jointEditorAnchorOffsetX')
              .setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointEditorAnchorOffsetX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorAnchorOffsetY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorAnchorOffsetY')) {
            behaviorContent
              .addChild('jointEditorAnchorOffsetY')
              .setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointEditorAnchorOffsetY')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorAnchorOffsetZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorAnchorOffsetZ')) {
            behaviorContent
              .addChild('jointEditorAnchorOffsetZ')
              .setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointEditorAnchorOffsetZ')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorTargetAnchorOffsetX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorTargetAnchorOffsetX')) {
            behaviorContent
              .addChild('jointEditorTargetAnchorOffsetX')
              .setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointEditorTargetAnchorOffsetX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorTargetAnchorOffsetY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorTargetAnchorOffsetY')) {
            behaviorContent
              .addChild('jointEditorTargetAnchorOffsetY')
              .setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointEditorTargetAnchorOffsetY')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorTargetAnchorOffsetZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorTargetAnchorOffsetZ')) {
            behaviorContent
              .addChild('jointEditorTargetAnchorOffsetZ')
              .setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointEditorTargetAnchorOffsetZ')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorUseCustomAxis') {
          if (!behaviorContent.hasChild('jointEditorUseCustomAxis')) {
            behaviorContent
              .addChild('jointEditorUseCustomAxis')
              .setBoolValue(false);
          }
          behaviorContent
            .getChild('jointEditorUseCustomAxis')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }

        if (propertyName === 'jointEditorAxisX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorAxisX')) {
            behaviorContent.addChild('jointEditorAxisX').setDoubleValue(1);
          }
          behaviorContent
            .getChild('jointEditorAxisX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorAxisY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorAxisY')) {
            behaviorContent.addChild('jointEditorAxisY').setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointEditorAxisY')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorAxisZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorAxisZ')) {
            behaviorContent.addChild('jointEditorAxisZ').setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointEditorAxisZ')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorHingeMinAngle') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorHingeMinAngle')) {
            behaviorContent
              .addChild('jointEditorHingeMinAngle')
              .setDoubleValue(-60);
          }
          behaviorContent
            .getChild('jointEditorHingeMinAngle')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorHingeMaxAngle') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorHingeMaxAngle')) {
            behaviorContent
              .addChild('jointEditorHingeMaxAngle')
              .setDoubleValue(60);
          }
          behaviorContent
            .getChild('jointEditorHingeMaxAngle')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorDistanceMin') {
          const newValueAsNumber = Math.max(0, parseFloat(newValue));
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorDistanceMin')) {
            behaviorContent
              .addChild('jointEditorDistanceMin')
              .setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointEditorDistanceMin')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorDistanceMax') {
          const newValueAsNumber = Math.max(0, parseFloat(newValue));
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorDistanceMax')) {
            behaviorContent
              .addChild('jointEditorDistanceMax')
              .setDoubleValue(0);
          }
          behaviorContent
            .getChild('jointEditorDistanceMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jointEditorPreviewEnabled') {
          if (!behaviorContent.hasChild('jointEditorPreviewEnabled')) {
            behaviorContent
              .addChild('jointEditorPreviewEnabled')
              .setBoolValue(true);
          }
          behaviorContent
            .getChild('jointEditorPreviewEnabled')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }

        if (propertyName === 'jointEditorPreviewSize') {
          const newValueAsNumber = Math.max(1, parseFloat(newValue));
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!behaviorContent.hasChild('jointEditorPreviewSize')) {
            behaviorContent
              .addChild('jointEditorPreviewSize')
              .setDoubleValue(8);
          }
          behaviorContent
            .getChild('jointEditorPreviewSize')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        return false;
      };
      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        behaviorProperties
          .getOrCreate('object3D')
          .setValue(behaviorContent.getChild('object3D').getStringValue())
          .setType('Behavior')
          .setLabel('3D capability')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addExtraInfo('Scene3D::Base3DBehavior');

        behaviorProperties
          .getOrCreate('bodyType')
          .setValue(behaviorContent.getChild('bodyType').getStringValue())
          .setType('Choice')
          .setLabel('Type')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addChoice('Static', _('Static'))
          .addChoice('Dynamic', _('Dynamic'))
          .addChoice('Kinematic', _('Kinematic'))
          .setDescription(
            _(
              "A static object won't move (perfect for obstacles). Dynamic objects can move. Kinematic will move according to forces applied to it only (useful for characters or specific mechanisms)."
            )
          )
          .setHasImpactOnOtherProperties(true);
        behaviorProperties
          .getOrCreate('bullet')
          .setValue(
            behaviorContent.getChild('bullet').getBoolValue() ? 'true' : 'false'
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setType('Boolean')
          .setLabel(_('Considered as a bullet'))
          .setDescription(
            _(
              'Useful for fast moving objects which requires a more accurate collision detection.'
            )
          )
          .setGroup(_('Physics body advanced settings'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('fixedRotation')
          .setValue(
            behaviorContent.getChild('fixedRotation').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setType('Boolean')
          .setLabel('Fixed Rotation')
          .setDescription(
            _(
              "If enabled, the object won't rotate and will stay at the same angle."
            )
          )
          .setGroup(_('Movement'));
        behaviorProperties
          .getOrCreate('shape')
          .setValue(behaviorContent.getChild('shape').getStringValue())
          .setType('Choice')
          .setLabel('Shape')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addChoice('Box', _('Box'))
          .addChoice('Capsule', _('Capsule'))
          .addChoice('Sphere', _('Sphere'))
          .addChoice('Cylinder', _('Cylinder'))
          .addChoice('Mesh', _('Mesh (works for Static only)'));
        behaviorProperties
          .getOrCreate('meshShapeResourceName')
          .setValue(
            behaviorContent.getChild('meshShapeResourceName').getStringValue()
          )
          .setType('resource')
          .addExtraInfo('model3D')
          .setLabel(_("Simplified 3D model (leave empty to use object's one)"))
          // Hidden as required to be changed in the full editor.
          .setHidden(true)
          .setHasImpactOnOtherProperties(true);
        behaviorProperties
          .getOrCreate('shapeOrientation')
          .setValue(
            behaviorContent.getChild('shapeOrientation').getStringValue()
          )
          .setType('Choice')
          .setLabel('Shape orientation')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addChoice('Z', _('Z'))
          .addChoice('Y', _('Y'))
          .addChoice('X', _('X'));
        behaviorProperties
          .getOrCreate('shapeDimensionA')
          .setValue(
            behaviorContent
              .getChild('shapeDimensionA')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape Dimension A')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        behaviorProperties
          .getOrCreate('shapeDimensionB')
          .setValue(
            behaviorContent
              .getChild('shapeDimensionB')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape Dimension B')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        behaviorProperties
          .getOrCreate('shapeDimensionC')
          .setValue(
            behaviorContent
              .getChild('shapeDimensionC')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape Dimension C')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('shapeOffsetX')) {
          behaviorContent.addChild('shapeOffsetX').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('shapeOffsetX')
          .setValue(
            behaviorContent
              .getChild('shapeOffsetX')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape offset X')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setAdvanced(true)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('shapeOffsetY')) {
          behaviorContent.addChild('shapeOffsetY').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('shapeOffsetY')
          .setValue(
            behaviorContent
              .getChild('shapeOffsetY')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape offset Y')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('shapeOffsetZ')) {
          behaviorContent.addChild('shapeOffsetZ').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('shapeOffsetZ')
          .setValue(
            behaviorContent
              .getChild('shapeOffsetZ')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape offset Z')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setAdvanced(true)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('massCenterOffsetX')) {
          behaviorContent.addChild('massCenterOffsetX').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('massCenterOffsetX')
          .setValue(
            behaviorContent
              .getChild('massCenterOffsetX')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Center of mass offset X')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setAdvanced(true)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('massCenterOffsetY')) {
          behaviorContent.addChild('massCenterOffsetY').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('massCenterOffsetY')
          .setValue(
            behaviorContent
              .getChild('massCenterOffsetY')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Center of mass offset Y')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setAdvanced(true)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('massCenterOffsetZ')) {
          behaviorContent.addChild('massCenterOffsetZ').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('massCenterOffsetZ')
          .setValue(
            behaviorContent
              .getChild('massCenterOffsetZ')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Center of mass offset Z')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setAdvanced(true)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        behaviorProperties
          .getOrCreate('density')
          .setValue(
            behaviorContent.getChild('density').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setLabel(_('Density'))
          .setDescription(
            _(
              'Define the weight of the object, according to its size. The bigger the density, the heavier the object.'
            )
          );
        if (!behaviorContent.hasChild('massOverride')) {
          behaviorContent.addChild('massOverride').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('massOverride')
          .setLabel(_('Mass override'))
          .setGroup('')
          .setType('Number')
          .setValue(
            behaviorContent
              .getChild('massOverride')
              .getDoubleValue()
              .toString(10)
          )
          .setDescription(_('Leave at 0 to use the density.'));
        behaviorProperties
          .getOrCreate('friction')
          .setValue(
            behaviorContent.getChild('friction').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setLabel(_('Friction'))
          .setDescription(
            _(
              'The friction applied when touching other objects. The higher the value, the more friction.'
            )
          )
          .setGroup(_('Movement'));
        behaviorProperties
          .getOrCreate('restitution')
          .setValue(
            behaviorContent
              .getChild('restitution')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Restitution'))
          .setDescription(
            _(
              'The "bounciness" of the object. The higher the value, the more other objects will bounce against it.'
            )
          )
          .setGroup(_('Movement'));
        behaviorProperties
          .getOrCreate('linearDamping')
          .setValue(
            behaviorContent
              .getChild('linearDamping')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Linear Damping'))
          .setDescription(
            _(
              "Linear damping reduces an object's movement speed over time, making its motion slow down smoothly."
            )
          )
          .setGroup(_('Movement'));

        behaviorProperties
          .getOrCreate('angularDamping')
          .setValue(
            behaviorContent
              .getChild('angularDamping')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Angular Damping'))
          .setDescription(
            _(
              "Angular damping reduces an object's rotational speed over time, making its spins slow down smoothly."
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Movement'));
        behaviorProperties
          .getOrCreate('gravityScale')
          .setValue(
            behaviorContent
              .getChild('gravityScale')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel('Gravity Scale')
          .setDescription(
            _(
              "Gravity Scale multiplies the world's gravity for a specific body, making it experience stronger or weaker gravitational force than normal."
            )
          )

          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Gravity'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('layers')
          .setValue(
            behaviorContent.getChild('layers').getIntValue().toString(10)
          )
          .setType('Number')
          .setLabel('Layers')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        behaviorProperties
          .getOrCreate('masks')
          .setValue(
            behaviorContent.getChild('masks').getIntValue().toString(10)
          )
          .setType('Number')
          .setLabel('Masks')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.

        // Ragdoll properties
        if (!behaviorContent.hasChild('ragdollRole')) {
          behaviorContent.addChild('ragdollRole').setStringValue('None');
        }
        behaviorProperties
          .getOrCreate('ragdollRole')
          .setValue(behaviorContent.getChild('ragdollRole').getStringValue())
          .setType('Choice')
          .setLabel(_('Ragdoll Body Part'))
          .setDescription(
            _(
              'Assign a ragdoll role to this object. Objects with the same Group Tag will auto-connect using appropriate joint types.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addChoice('None', _('None'))
          .addChoice('Head', _('Head'))
          .addChoice('Chest', _('Chest'))
          .addChoice('Hips', _('Hips'))
          .addChoice('UpperArmL', _('Upper Arm Left'))
          .addChoice('LowerArmL', _('Lower Arm Left'))
          .addChoice('UpperArmR', _('Upper Arm Right'))
          .addChoice('LowerArmR', _('Lower Arm Right'))
          .addChoice('ThighL', _('Thigh Left'))
          .addChoice('ShinL', _('Shin Left'))
          .addChoice('ThighR', _('Thigh Right'))
          .addChoice('ShinR', _('Shin Right'))
          .setGroup(_('Ragdoll'));

        if (!behaviorContent.hasChild('ragdollGroupTag')) {
          behaviorContent.addChild('ragdollGroupTag').setStringValue('');
        }
        behaviorProperties
          .getOrCreate('ragdollGroupTag')
          .setValue(
            behaviorContent.getChild('ragdollGroupTag').getStringValue()
          )
          .setType('String')
          .setLabel(_('Ragdoll Group Tag'))
          .setDescription(
            _(
              'A shared tag that groups body parts together. Objects with the same tag will be auto-connected into a ragdoll.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Ragdoll'));

        if (!behaviorContent.hasChild('jointAutoWakeBodies')) {
          behaviorContent.addChild('jointAutoWakeBodies').setBoolValue(true);
        }
        behaviorProperties
          .getOrCreate('jointAutoWakeBodies')
          .setValue(
            behaviorContent.getChild('jointAutoWakeBodies').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('Auto wake linked bodies'))
          .setDescription(
            _(
              'When enabled, linked bodies are automatically activated after joint creation/changes so the constraint effect is immediate.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Realism'));

        if (!behaviorContent.hasChild('jointAutoStabilityPreset')) {
          behaviorContent
            .addChild('jointAutoStabilityPreset')
            .setStringValue('Stable');
        }
        behaviorProperties
          .getOrCreate('jointAutoStabilityPreset')
          .setValue(
            behaviorContent
              .getChild('jointAutoStabilityPreset')
              .getStringValue()
          )
          .setType('Choice')
          .setLabel(_('Default joint stability'))
          .addChoice('Balanced', _('Balanced'))
          .addChoice('Stable', _('Stable'))
          .addChoice('UltraStable', _('Ultra Stable'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Realism'));

        if (!behaviorContent.hasChild('jointAutoBreakForce')) {
          behaviorContent.addChild('jointAutoBreakForce').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointAutoBreakForce')
          .setValue(
            behaviorContent
              .getChild('jointAutoBreakForce')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Auto break force'))
          .setDescription(
            _(
              'If > 0, newly created joints break automatically when reaction force exceeds this threshold.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Realism'));

        if (!behaviorContent.hasChild('jointAutoBreakTorque')) {
          behaviorContent.addChild('jointAutoBreakTorque').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointAutoBreakTorque')
          .setValue(
            behaviorContent
              .getChild('jointAutoBreakTorque')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Auto break torque'))
          .setDescription(
            _(
              'If > 0, newly created joints break automatically when reaction torque exceeds this threshold.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Realism'));

        if (!behaviorContent.hasChild('jointEditorEnabled')) {
          behaviorContent.addChild('jointEditorEnabled').setBoolValue(false);
        }
        behaviorProperties
          .getOrCreate('jointEditorEnabled')
          .setValue(
            behaviorContent.getChild('jointEditorEnabled').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('Enable joint editor link'))
          .setDescription(
            _(
              'Automatically creates and maintains one physical joint from this object to a target object name.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorTargetObjectName')) {
          behaviorContent
            .addChild('jointEditorTargetObjectName')
            .setStringValue('');
        }
        behaviorProperties
          .getOrCreate('jointEditorTargetObjectName')
          .setValue(
            behaviorContent
              .getChild('jointEditorTargetObjectName')
              .getStringValue()
          )
          .setType('String')
          .setLabel(_('Target object name'))
          .setDescription(
            _(
              'Object name to link to. The nearest valid instance is selected and kept linked.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorType')) {
          behaviorContent.addChild('jointEditorType').setStringValue('None');
        }
        behaviorProperties
          .getOrCreate('jointEditorType')
          .setValue(
            behaviorContent.getChild('jointEditorType').getStringValue()
          )
          .setType('Choice')
          .setLabel(_('Joint type'))
          .addChoice('None', _('None'))
          .addChoice('Fixed', _('Fixed'))
          .addChoice('Point', _('Point'))
          .addChoice('Hinge', _('Hinge'))
          .addChoice('Slider', _('Slider'))
          .addChoice('Distance', _('Distance'))
          .addChoice('Cone', _('Cone'))
          .addChoice('SwingTwist', _('SwingTwist'))
          .setDescription(
            _(
              'Joint editor supports only Scene3D::Model3DObject and Scene3D::Cube3DObject for real physical links.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorAnchorOffsetX')) {
          behaviorContent
            .addChild('jointEditorAnchorOffsetX')
            .setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointEditorAnchorOffsetX')
          .setValue(
            behaviorContent
              .getChild('jointEditorAnchorOffsetX')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Source anchor offset X'))
          .setDescription(
            _(
              'Local offset in pixels from this object center to place the joint anchor.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorAnchorOffsetY')) {
          behaviorContent
            .addChild('jointEditorAnchorOffsetY')
            .setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointEditorAnchorOffsetY')
          .setValue(
            behaviorContent
              .getChild('jointEditorAnchorOffsetY')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Source anchor offset Y'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorAnchorOffsetZ')) {
          behaviorContent
            .addChild('jointEditorAnchorOffsetZ')
            .setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointEditorAnchorOffsetZ')
          .setValue(
            behaviorContent
              .getChild('jointEditorAnchorOffsetZ')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Source anchor offset Z'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorTargetAnchorOffsetX')) {
          behaviorContent
            .addChild('jointEditorTargetAnchorOffsetX')
            .setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointEditorTargetAnchorOffsetX')
          .setValue(
            behaviorContent
              .getChild('jointEditorTargetAnchorOffsetX')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Target anchor offset X'))
          .setDescription(
            _(
              'Local offset in pixels from target object center to place the joint anchor.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorTargetAnchorOffsetY')) {
          behaviorContent
            .addChild('jointEditorTargetAnchorOffsetY')
            .setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointEditorTargetAnchorOffsetY')
          .setValue(
            behaviorContent
              .getChild('jointEditorTargetAnchorOffsetY')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Target anchor offset Y'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorTargetAnchorOffsetZ')) {
          behaviorContent
            .addChild('jointEditorTargetAnchorOffsetZ')
            .setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointEditorTargetAnchorOffsetZ')
          .setValue(
            behaviorContent
              .getChild('jointEditorTargetAnchorOffsetZ')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Target anchor offset Z'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorUseCustomAxis')) {
          behaviorContent
            .addChild('jointEditorUseCustomAxis')
            .setBoolValue(false);
        }
        behaviorProperties
          .getOrCreate('jointEditorUseCustomAxis')
          .setValue(
            behaviorContent.getChild('jointEditorUseCustomAxis').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('Use custom axis'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorAxisX')) {
          behaviorContent.addChild('jointEditorAxisX').setDoubleValue(1);
        }
        behaviorProperties
          .getOrCreate('jointEditorAxisX')
          .setValue(
            behaviorContent
              .getChild('jointEditorAxisX')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Custom axis X'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorAxisY')) {
          behaviorContent.addChild('jointEditorAxisY').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointEditorAxisY')
          .setValue(
            behaviorContent
              .getChild('jointEditorAxisY')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Custom axis Y'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorAxisZ')) {
          behaviorContent.addChild('jointEditorAxisZ').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointEditorAxisZ')
          .setValue(
            behaviorContent
              .getChild('jointEditorAxisZ')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Custom axis Z'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorHingeMinAngle')) {
          behaviorContent
            .addChild('jointEditorHingeMinAngle')
            .setDoubleValue(-60);
        }
        behaviorProperties
          .getOrCreate('jointEditorHingeMinAngle')
          .setValue(
            behaviorContent
              .getChild('jointEditorHingeMinAngle')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Hinge/Twist min angle'))
          .setDescription(_('Used by Hinge, Cone and SwingTwist presets.'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorHingeMaxAngle')) {
          behaviorContent
            .addChild('jointEditorHingeMaxAngle')
            .setDoubleValue(60);
        }
        behaviorProperties
          .getOrCreate('jointEditorHingeMaxAngle')
          .setValue(
            behaviorContent
              .getChild('jointEditorHingeMaxAngle')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Hinge/Twist max angle'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorDistanceMin')) {
          behaviorContent.addChild('jointEditorDistanceMin').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointEditorDistanceMin')
          .setValue(
            behaviorContent
              .getChild('jointEditorDistanceMin')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Distance min'))
          .setDescription(
            _(
              'Used by Distance joint. Leave min/max at 0 for automatic distance based on current pose.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorDistanceMax')) {
          behaviorContent.addChild('jointEditorDistanceMax').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('jointEditorDistanceMax')
          .setValue(
            behaviorContent
              .getChild('jointEditorDistanceMax')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Distance max'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorPreviewEnabled')) {
          behaviorContent
            .addChild('jointEditorPreviewEnabled')
            .setBoolValue(true);
        }
        behaviorProperties
          .getOrCreate('jointEditorPreviewEnabled')
          .setValue(
            behaviorContent.getChild('jointEditorPreviewEnabled').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('Show realtime preview'))
          .setDescription(
            _(
              'Display source/target/anchor points and axis line in real time while editing.'
            )
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        if (!behaviorContent.hasChild('jointEditorPreviewSize')) {
          behaviorContent.addChild('jointEditorPreviewSize').setDoubleValue(8);
        }
        behaviorProperties
          .getOrCreate('jointEditorPreviewSize')
          .setValue(
            behaviorContent
              .getChild('jointEditorPreviewSize')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Preview size'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Joint Editor (3D Object / 3D Box)'));

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('object3D').setStringValue('');
        behaviorContent.addChild('bodyType').setStringValue('Dynamic');
        behaviorContent.addChild('bullet').setBoolValue(false);
        behaviorContent.addChild('fixedRotation').setBoolValue(false);
        behaviorContent.addChild('shape').setStringValue('Box');
        behaviorContent.addChild('meshShapeResourceName').setStringValue('');
        behaviorContent.addChild('shapeOrientation').setStringValue('Z');
        behaviorContent.addChild('shapeDimensionA').setDoubleValue(0);
        behaviorContent.addChild('shapeDimensionB').setDoubleValue(0);
        behaviorContent.addChild('shapeDimensionC').setDoubleValue(0);
        behaviorContent.addChild('shapeOffsetX').setDoubleValue(0);
        behaviorContent.addChild('shapeOffsetY').setDoubleValue(0);
        behaviorContent.addChild('shapeOffsetZ').setDoubleValue(0);
        behaviorContent.addChild('massCenterOffsetX').setDoubleValue(0);
        behaviorContent.addChild('massCenterOffsetY').setDoubleValue(0);
        behaviorContent.addChild('massCenterOffsetZ').setDoubleValue(0);
        behaviorContent.addChild('massOverride').setDoubleValue(0);
        behaviorContent.addChild('density').setDoubleValue(1.0);
        behaviorContent.addChild('friction').setDoubleValue(0.3);
        behaviorContent.addChild('restitution').setDoubleValue(0.1);
        behaviorContent.addChild('linearDamping').setDoubleValue(0.1);
        behaviorContent.addChild('angularDamping').setDoubleValue(0.1);
        behaviorContent.addChild('gravityScale').setDoubleValue(1);
        behaviorContent.addChild('layers').setIntValue((1 << 4) | (1 << 0));
        behaviorContent.addChild('masks').setIntValue((1 << 4) | (1 << 0));
        behaviorContent.addChild('ragdollRole').setStringValue('None');
        behaviorContent.addChild('ragdollGroupTag').setStringValue('');
        behaviorContent.addChild('jointAutoWakeBodies').setBoolValue(true);
        behaviorContent
          .addChild('jointAutoStabilityPreset')
          .setStringValue('Stable');
        behaviorContent.addChild('jointAutoBreakForce').setDoubleValue(0);
        behaviorContent.addChild('jointAutoBreakTorque').setDoubleValue(0);
        behaviorContent.addChild('jointEditorEnabled').setBoolValue(false);
        behaviorContent
          .addChild('jointEditorTargetObjectName')
          .setStringValue('');
        behaviorContent.addChild('jointEditorType').setStringValue('None');
        behaviorContent.addChild('jointEditorAnchorOffsetX').setDoubleValue(0);
        behaviorContent.addChild('jointEditorAnchorOffsetY').setDoubleValue(0);
        behaviorContent.addChild('jointEditorAnchorOffsetZ').setDoubleValue(0);
        behaviorContent
          .addChild('jointEditorTargetAnchorOffsetX')
          .setDoubleValue(0);
        behaviorContent
          .addChild('jointEditorTargetAnchorOffsetY')
          .setDoubleValue(0);
        behaviorContent
          .addChild('jointEditorTargetAnchorOffsetZ')
          .setDoubleValue(0);
        behaviorContent
          .addChild('jointEditorUseCustomAxis')
          .setBoolValue(false);
        behaviorContent.addChild('jointEditorAxisX').setDoubleValue(1);
        behaviorContent.addChild('jointEditorAxisY').setDoubleValue(0);
        behaviorContent.addChild('jointEditorAxisZ').setDoubleValue(0);
        behaviorContent
          .addChild('jointEditorHingeMinAngle')
          .setDoubleValue(-60);
        behaviorContent.addChild('jointEditorHingeMaxAngle').setDoubleValue(60);
        behaviorContent.addChild('jointEditorDistanceMin').setDoubleValue(0);
        behaviorContent.addChild('jointEditorDistanceMax').setDoubleValue(0);
        behaviorContent
          .addChild('jointEditorPreviewEnabled')
          .setBoolValue(true);
        behaviorContent.addChild('jointEditorPreviewSize').setDoubleValue(8);
      };

      const sharedData = new gd.BehaviorSharedDataJsImplementation();
      sharedData.updateProperty = function (
        sharedContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'gravityX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent.getChild('gravityX').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gravityY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent.getChild('gravityY').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gravityZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent.getChild('gravityZ').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'worldScale') {
          const newValueAsNumber = parseInt(newValue, 10);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!sharedContent.hasChild('worldScale')) {
            sharedContent.addChild('worldScale');
          }
          sharedContent.getChild('worldScale').setDoubleValue(newValueAsNumber);
          return true;
        }
        return false;
      };
      sharedData.getProperties = function (sharedContent) {
        const sharedProperties = new gd.MapStringPropertyDescriptor();

        sharedProperties
          .getOrCreate('gravityX')
          .setValue(
            sharedContent.getChild('gravityX').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getNewton());
        sharedProperties
          .getOrCreate('gravityY')
          .setValue(
            sharedContent.getChild('gravityY').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getNewton());
        sharedProperties
          .getOrCreate('gravityZ')
          .setValue(
            sharedContent.getChild('gravityZ').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getNewton());

        sharedProperties
          .getOrCreate('worldScale')
          .setValue(
            sharedContent.getChild('worldScale').getDoubleValue().toString(10)
          )
          .setType('Number');

        return sharedProperties;
      };
      sharedData.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('gravityX').setDoubleValue(0);
        behaviorContent.addChild('gravityY').setDoubleValue(0);
        behaviorContent.addChild('gravityZ').setDoubleValue(-9.8);
        behaviorContent.addChild('worldScale').setDoubleValue(100);
      };

      const aut = extension
        .addBehavior(
          'Physics3DBehavior',
          _('3D physics engine'),
          'Physics3D',
          _(
            'Simulate realistic 3D physics for this object including gravity, forces, collisions, etc.'
          ),
          '',
          'JsPlatform/Extensions/physics3d.svg',
          'Physics3DBehavior',
          //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
          behavior,
          sharedData
        )
        .markAsIrrelevantForChildObjects()
        .addIncludeFile(
          'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
        )
        .addRequiredFile('Extensions/Physics3DBehavior/jolt-physics.wasm.js')
        .addRequiredFile('Extensions/Physics3DBehavior/jolt-physics.wasm.wasm')
        .setOpenFullEditorLabel(_('Edit shape and advanced settings'));

      // Global
      aut
        .addExpression(
          'WorldScale',
          _('World scale'),
          _('Return the world scale.'),
          _('Global'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getWorldScale');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'GravityX',
          _('World gravity on X axis'),
          _('the world gravity on X axis') +
            ' ' +
            _(
              'While an object is needed, this will apply to all objects using the behavior.'
            ),
          _('the world gravity on X axis'),
          _('Global'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Gravity (in Newton)')
          )
        )
        .setFunctionName('setGravityX')
        .setGetter('getGravityX');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'GravityY',
          _('World gravity on Y axis'),
          _('the world gravity on Y axis') +
            ' ' +
            _(
              'While an object is needed, this will apply to all objects using the behavior.'
            ),
          _('the world gravity on Y axis'),
          _('Global'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Gravity (in Newton)')
          )
        )
        .setFunctionName('setGravityY')
        .setGetter('getGravityY');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'GravityZ',
          _('World gravity on Z axis'),
          _('the world gravity on Z axis') +
            ' ' +
            _(
              'While an object is needed, this will apply to all objects using the behavior.'
            ),
          _('the world gravity on Z axis'),
          _('Global'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Gravity (in Newton)')
          )
        )
        .setFunctionName('setGravityZ')
        .setGetter('getGravityZ');

      aut
        .addScopedCondition(
          'IsDynamic',
          _('Is dynamic'),
          _('Check if an object is dynamic.'),
          _('_PARAM0_ is dynamic'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('isDynamic');

      aut
        .addScopedCondition(
          'IsStatic',
          _('Is static'),
          _('Check if an object is static.'),
          _('_PARAM0_ is static'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('isStatic');

      aut
        .addScopedCondition(
          'IsKinematic',
          _('Is kinematic'),
          _('Check if an object is kinematic.'),
          _('_PARAM0_ is kinematic'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('isKinematic');

      aut
        .addScopedCondition(
          'IsBullet',
          _('Is treated as a bullet'),
          _('Check if the object is being treated as a bullet.'),
          _('_PARAM0_ is treated as a bullet'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('isBullet');

      aut
        .addScopedAction(
          'SetBullet',
          _('Treat as bullet'),
          _(
            'Treat the object as a bullet. Better collision handling on high speeds at cost of some performance.'
          ),
          _('Treat _PARAM0_ as bullet: _PARAM2_'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('yesorno', _('Treat as bullet'), '', false)
        .setDefaultValue('false')
        .getCodeExtraInformation()
        .setFunctionName('setBullet');

      aut
        .addScopedCondition(
          'HasFixedRotation',
          _('Has fixed rotation'),
          _('Check if an object has fixed rotation.'),
          _('_PARAM0_ has fixed rotation'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('hasFixedRotation');

      aut
        .addScopedAction(
          'SetFixedRotation',
          _('Fixed rotation'),
          _(
            "Enable or disable an object fixed rotation. If enabled the object won't be able to rotate. This action has no effect on characters."
          ),
          _('Set _PARAM0_ fixed rotation: _PARAM2_'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('yesorno', _('Fixed rotation'), '', false)
        .setDefaultValue('false')
        .getCodeExtraInformation()
        .setFunctionName('setFixedRotation');

      // Body settings
      aut
        .addScopedAction(
          'ShapeScale',
          _('Shape scale'),
          _(
            'Modify an object shape scale. It affects custom shape dimensions, if custom dimensions are not set the body will be scaled automatically to the object size.'
          ),
          _('the shape scale'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .getCodeExtraInformation()
        .setFunctionName('setShapeScale')
        .setGetter('getShapeScale');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'Density',
          _('Density'),
          _(
            "the object density. The body's density and volume determine its mass."
          ),
          _('the density'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setDensity')
        .setGetter('getDensity');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'ShapeOffsetX',
          _('Shape offset X'),
          _('the object shape offset on X.'),
          _('the shape offset on X'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setShapeOffsetX')
        .setGetter('getShapeOffsetX');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'ShapeOffsetY',
          _('Shape offset Y'),
          _('the object shape offset on Y.'),
          _('the shape offset on Y'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setShapeOffsetY')
        .setGetter('getShapeOffsetY');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'ShapeOffsetZ',
          _('Shape offset Z'),
          _('the object shape offset on Z.'),
          _('the shape offset on Z'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setShapeOffsetZ')
        .setGetter('getShapeOffsetZ');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'Friction',
          _('Friction'),
          _(
            "the object friction. How much energy is lost from the movement of one object over another. The combined friction from two bodies is calculated as 'sqrt(bodyA.friction * bodyB.friction)'."
          ),
          _('the friction'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setFriction')
        .setGetter('getFriction');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'Restitution',
          _('Restitution'),
          _(
            "the object restitution. Energy conservation on collision. The combined restitution from two bodies is calculated as 'max(bodyA.restitution, bodyB.restitution)'."
          ),
          _('the restitution'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setRestitution')
        .setGetter('getRestitution');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'LinearDamping',
          _('Linear damping'),
          _(
            'the object linear damping. How much movement speed is lost across the time.'
          ),
          _('the linear damping'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setLinearDamping')
        .setGetter('getLinearDamping');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'AngularDamping',
          _('Angular damping'),
          _(
            'the object angular damping. How much angular speed is lost across the time.'
          ),
          _('the angular damping'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setAngularDamping')
        .setGetter('getAngularDamping');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'GravityScale',
          _('Gravity scale'),
          _(
            'the object gravity scale. The gravity applied to an object is the world gravity multiplied by the object gravity scale.'
          ),
          _('the gravity scale'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .setFunctionName('setGravityScale')
        .setGetter('getGravityScale');

      // Filtering
      aut
        .addScopedCondition(
          'LayerEnabled',
          _('Layer enabled'),
          _('Check if an object has a specific layer enabled.'),
          _('_PARAM0_ has layer _PARAM2_ enabled'),
          _('Filtering'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Layer (1 - 8)'))
        .getCodeExtraInformation()
        .setFunctionName('layerEnabled');

      aut
        .addScopedAction(
          'EnableLayer',
          _('Enable layer'),
          _(
            'Enable or disable a layer for an object. Two objects collide if any layer of the first object matches any mask of the second one and vice versa.'
          ),
          _('Enable layer _PARAM2_ for _PARAM0_: _PARAM3_'),
          _('Filtering'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Layer (1 - 8)'))
        .addParameter('yesorno', _('Enable'), '', false)
        .setDefaultValue('true')
        .getCodeExtraInformation()
        .setFunctionName('enableLayer');

      aut
        .addScopedCondition(
          'MaskEnabled',
          _('Mask enabled'),
          _('Check if an object has a specific mask enabled.'),
          _('_PARAM0_ has mask _PARAM2_ enabled'),
          _('Filtering'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Mask (1 - 8)'))
        .getCodeExtraInformation()
        .setFunctionName('maskEnabled');

      aut
        .addScopedAction(
          'EnableMask',
          _('Enable mask'),
          _(
            'Enable or disable a mask for an object. Two objects collide if any layer of the first object matches any mask of the second one and vice versa.'
          ),
          _('Enable mask _PARAM2_ for _PARAM0_: _PARAM3_'),
          _('Filtering'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Mask (1 - 8)'))
        .addParameter('yesorno', _('Enable'), '', false)
        .setDefaultValue('true')
        .getCodeExtraInformation()
        .setFunctionName('enableMask');

      // Velocity
      aut
        .addExpressionAndConditionAndAction(
          'number',
          'LinearVelocityX',
          _('Linear velocity X'),
          _('the object linear velocity on X'),
          _('the linear velocity on X'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setLinearVelocityX')
        .setGetter('getLinearVelocityX');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'LinearVelocityY',
          _('Linear velocity Y'),
          _('the object linear velocity on Y'),
          _('the linear velocity on Y'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setLinearVelocityY')
        .setGetter('getLinearVelocityY');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'LinearVelocityZ',
          _('Linear velocity Z'),
          _('the object linear velocity on Z'),
          _('the linear velocity on Z'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setLinearVelocityZ')
        .setGetter('getLinearVelocityZ');

      aut
        .addExpressionAndCondition(
          'number',
          'LinearVelocityLength',
          _('Linear velocity'),
          _('the object linear velocity length'),
          _('the linear velocity length'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed to compare to (in pixels per second)')
          )
        )
        .setFunctionName('getLinearVelocityLength');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'AngularVelocityX',
          _('Angular velocity X'),
          _('the object angular velocity around X'),
          _('the angular velocity around X'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angular speed (in degrees per second)')
          )
        )
        .setFunctionName('setAngularVelocityX')
        .setGetter('getAngularVelocityX');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'AngularVelocityY',
          _('Angular velocity Y'),
          _('the object angular velocity around Y'),
          _('the angular velocity around Y'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angular speed (in degrees per second)')
          )
        )
        .setFunctionName('setAngularVelocityY')
        .setGetter('getAngularVelocityY');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'AngularVelocityZ',
          _('Angular velocity Z'),
          _('the object angular velocity around Z'),
          _('the angular velocity around Z'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angular speed (in degrees per second)')
          )
        )
        .setFunctionName('setAngularVelocityZ')
        .setGetter('getAngularVelocityZ');

      // Forces and impulses
      aut
        .addScopedAction(
          'ApplyForce',
          _('Apply force (at a point)'),
          _(
            'Apply a force to the object over time. It "accelerates" an object and must be used every frame during a time period.'
          ),
          _(
            'Apply a force of _PARAM2_ ; _PARAM3_ ; _PARAM4_ to _PARAM0_ at _PARAM5_ ; _PARAM6_ ; _PARAM7_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('X component (N)'))
        .addParameter('expression', _('Y component (N)'))
        .addParameter('expression', _('Z component (N)'))
        .setParameterLongDescription(
          _('A force is like an acceleration but depends on the mass.')
        )
        .addParameter('expression', _('Application point on X axis'))
        .addParameter('expression', _('Application point on Y axis'))
        .addParameter('expression', _('Application point on Z axis'))
        .setParameterLongDescription(
          _(
            'Use `MassCenterX`, `MassCenterY` and `MassCenterZ` expressions to avoid any rotation.'
          )
        )
        .getCodeExtraInformation()
        .setFunctionName('applyForce');

      aut
        .addScopedAction(
          'ApplyForceAtCenter',
          _('Apply force (at center)'),
          _(
            'Apply a force to the object over time. It "accelerates" an object and must be used every frame during a time period.'
          ),
          _(
            'Apply a force of _PARAM2_ ; _PARAM3_ ; _PARAM4_ at the center of _PARAM0_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('X component (N)'))
        .addParameter('expression', _('Y component (N)'))
        .addParameter('expression', _('Z component (N)'))
        .setParameterLongDescription(
          _('A force is like an acceleration but depends on the mass.')
        )
        .getCodeExtraInformation()
        .setFunctionName('applyForceAtCenter');

      aut
        .addScopedAction(
          'ApplyForceTowardPosition',
          _('Apply force toward position'),
          _(
            'Apply a force to the object over time to move it toward a position. It "accelerates" an object and must be used every frame during a time period.'
          ),
          _(
            'Apply to _PARAM0_ a force of length _PARAM2_ towards _PARAM3_ ; _PARAM4_ ; _PARAM5_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Length (N)'))
        .setParameterLongDescription(
          _('A force is like an acceleration but depends on the mass.')
        )
        .addParameter('expression', _('X position'))
        .addParameter('expression', _('Y position'))
        .addParameter('expression', _('Z position'))
        .getCodeExtraInformation()
        .setFunctionName('applyForceTowardPosition');

      aut
        .addScopedAction(
          'ApplyImpulse',
          _('Apply impulse (at a point)'),
          _(
            'Apply an impulse to the object. It instantly changes the speed, to give an initial speed for instance.'
          ),
          _(
            'Apply an impulse of _PARAM2_ ; _PARAM3_ ; _PARAM4_ to _PARAM0_ at _PARAM5_ ; _PARAM6_ ; _PARAM7_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('X component (N·s or kg·m·s⁻¹)'))
        .addParameter('expression', _('Y component (N·s or kg·m·s⁻¹)'))
        .addParameter('expression', _('Z component (N·s or kg·m·s⁻¹)'))
        .setParameterLongDescription(
          _('An impulse is like a speed addition but depends on the mass.')
        )
        .addParameter('expression', _('Application point on X axis'))
        .addParameter('expression', _('Application point on Y axis'))
        .addParameter('expression', _('Application point on Z axis'))
        .setParameterLongDescription(
          _(
            'Use `MassCenterX`, `MassCenterY` and `MassCenterZ` expressions to avoid any rotation.'
          )
        )
        .getCodeExtraInformation()
        .setFunctionName('applyImpulse');

      aut
        .addScopedAction(
          'ApplyImpulseAtCenter',
          _('Apply impulse (at center)'),
          _(
            'Apply an impulse to the object. It instantly changes the speed, to give an initial speed for instance.'
          ),
          _(
            'Apply an impulse of _PARAM2_ ; _PARAM3_ ; _PARAM4_ at the center of _PARAM0_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('X component (N·s or kg·m·s⁻¹)'))
        .addParameter('expression', _('Y component (N·s or kg·m·s⁻¹)'))
        .addParameter('expression', _('Z component (N·s or kg·m·s⁻¹)'))
        .setParameterLongDescription(
          _('An impulse is like a speed addition but depends on the mass.')
        )
        .getCodeExtraInformation()
        .setFunctionName('applyImpulseAtCenter');

      aut
        .addScopedAction(
          'ApplyImpulseTowardPosition',
          _('Apply impulse toward position'),
          _(
            'Apply an impulse to the object to move it toward a position. It instantly changes the speed, to give an initial speed for instance.'
          ),
          _(
            'Apply to _PARAM0_ an impulse of length _PARAM2_ towards _PARAM3_ ; _PARAM4_ ; _PARAM5_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Length (N·s or kg·m·s⁻¹)'))
        .setParameterLongDescription(
          _('An impulse is like a speed addition but depends on the mass.')
        )
        .addParameter('expression', _('X position'))
        .addParameter('expression', _('Y position'))
        .addParameter('expression', _('Z position'))
        .getCodeExtraInformation()
        .setFunctionName('applyImpulseTowardPosition');

      aut
        .addScopedAction(
          'ApplyTorque',
          _('Apply torque (rotational force)'),
          _(
            'Apply a torque (also called "rotational force") to the object. It "accelerates" an object rotation and must be used every frame during a time period.'
          ),
          _('Apply a torque of _PARAM2_ ; _PARAM3_ ; _PARAM4_ to _PARAM0_ an'),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Torque around X (N·m)'))
        .addParameter('expression', _('Torque around Y (N·m)'))
        .addParameter('expression', _('Torque around Z (N·m)'))
        .setParameterLongDescription(
          _('A torque is like a rotation acceleration but depends on the mass.')
        )
        .getCodeExtraInformation()
        .setFunctionName('applyTorque');

      aut
        .addScopedAction(
          'ApplyAngularImpulse',
          _('Apply angular impulse (rotational impulse)'),
          _(
            'Apply an angular impulse (also called a "rotational impulse") to the object. It instantly changes the rotation speed, to give an initial speed for instance.'
          ),
          _(
            'Apply angular impulse of _PARAM2_ ; _PARAM3_ ; _PARAM4_ to _PARAM0_ an'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Angular impulse around X (N·m·s)'))
        .addParameter('expression', _('Angular impulse around Y (N·m·s)'))
        .addParameter('expression', _('Angular impulse around Z (N·m·s)'))
        .setParameterLongDescription(
          _(
            'An impulse is like a rotation speed addition but depends on the mass.'
          )
        )
        .getCodeExtraInformation()
        .setFunctionName('applyAngularImpulse');

      aut
        .addExpression(
          'Mass',
          _('Mass'),
          _('Return the mass of the object (in kilograms)'),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getMass');

      aut
        .addExpression(
          'InertiaAroundX',
          _('Inertia around X'),
          _(
            'Return the inertia around X axis of the object (in kilograms · meters²) when for its default rotation is (0°; 0°; 0°)'
          ),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getInertiaAroundX');

      aut
        .addExpression(
          'InertiaAroundY',
          _('Inertia around Y'),
          _(
            'Return the inertia around Y axis of the object (in kilograms · meters²) when for its default rotation is (0°; 0°; 0°)'
          ),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getInertiaAroundY');

      aut
        .addExpression(
          'InertiaAroundZ',
          _('Inertia around Z'),
          _(
            'Return the inertia around Z axis of the object (in kilograms · meters²) when for its default rotation is (0°; 0°; 0°)'
          ),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getInertiaAroundZ');

      aut
        .addExpression(
          'MassCenterX',
          _('Mass center X'),
          _('Mass center X'),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getMassCenterX');

      aut
        .addExpression(
          'MassCenterZ',
          _('Mass center Z'),
          _('Mass center Z'),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getMassCenterZ');

      aut
        .addScopedAction(
          'RaycastClosest',
          _('Cast ray (closest hit)'),
          _(
            'Cast a 3D ray in the Jolt physics world and store the closest hit data (position, normal, reflection direction) in this behavior.'
          ),
          _(
            'Cast ray for _PARAM0_ from _PARAM2_; _PARAM3_; _PARAM4_ to _PARAM5_; _PARAM6_; _PARAM7_ (ignore self: _PARAM8_)'
          ),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Start X'))
        .addParameter('expression', _('Start Y'))
        .addParameter('expression', _('Start Z'))
        .addParameter('expression', _('End X'))
        .addParameter('expression', _('End Y'))
        .addParameter('expression', _('End Z'))
        .addParameter('yesorno', _('Ignore this object while raycasting'))
        .setFunctionName('raycastClosest');

      aut
        .addScopedCondition(
          'DidLastRaycastHit',
          _('Last raycast hit'),
          _('Check if the last raycast from this behavior hit a physics body.'),
          _('Last raycast from _PARAM0_ hit a body'),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('didLastRaycastHit');

      aut
        .addScopedCondition(
          'DidLastRaycastHitObject',
          _('Last raycast hit object'),
          _(
            'Check if the last raycast from this behavior hit the specified object.'
          ),
          _('Last raycast from _PARAM0_ hit _PARAM2_'),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('objectPtr', _('Object to test'))
        .setFunctionName('didLastRaycastHitObject');

      aut
        .addExpression(
          'LastRaycastHitX',
          _('Last raycast hit X'),
          _('Return X position of the last raycast hit point (in pixels).'),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastHitX');

      aut
        .addExpression(
          'LastRaycastHitY',
          _('Last raycast hit Y'),
          _('Return Y position of the last raycast hit point (in pixels).'),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastHitY');

      aut
        .addExpression(
          'LastRaycastHitZ',
          _('Last raycast hit Z'),
          _('Return Z position of the last raycast hit point (in pixels).'),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastHitZ');

      aut
        .addExpression(
          'LastRaycastNormalX',
          _('Last raycast normal X'),
          _('Return X component of the last raycast surface normal.'),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastNormalX');

      aut
        .addExpression(
          'LastRaycastNormalY',
          _('Last raycast normal Y'),
          _('Return Y component of the last raycast surface normal.'),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastNormalY');

      aut
        .addExpression(
          'LastRaycastNormalZ',
          _('Last raycast normal Z'),
          _('Return Z component of the last raycast surface normal.'),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastNormalZ');

      aut
        .addExpression(
          'LastRaycastReflectionDirectionX',
          _('Last raycast reflection direction X'),
          _(
            'Return X component of the reflected direction computed from the last raycast hit.'
          ),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastReflectionDirectionX');

      aut
        .addExpression(
          'LastRaycastReflectionDirectionY',
          _('Last raycast reflection direction Y'),
          _(
            'Return Y component of the reflected direction computed from the last raycast hit.'
          ),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastReflectionDirectionY');

      aut
        .addExpression(
          'LastRaycastReflectionDirectionZ',
          _('Last raycast reflection direction Z'),
          _(
            'Return Z component of the reflected direction computed from the last raycast hit.'
          ),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastReflectionDirectionZ');

      aut
        .addExpression(
          'LastRaycastDistance',
          _('Last raycast distance'),
          _(
            'Return distance from ray start to hit point for the last raycast (in pixels).'
          ),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastDistance');

      aut
        .addExpression(
          'LastRaycastFraction',
          _('Last raycast fraction'),
          _(
            'Return fraction (0..1) of the last raycast where the hit occurred.'
          ),
          _('Raycast'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getLastRaycastFraction');

      // Joints
      aut
        .addScopedAction(
          'AddFixedJoint',
          _('Add a fixed joint'),
          _(
            'Add a fixed joint between two objects. They will be linked together and move as a single object.'
          ),
          _(
            'Add a fixed joint between _PARAM0_ and _PARAM2_, save the joint ID in _PARAM3_'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('objectPtr', _('Other object'), '', false)
        .addParameter('scenevar', _('Variable where to store the joint ID'))
        .setFunctionName('addFixedJoint');

      aut
        .addScopedAction(
          'AddPointJoint',
          _('Add a point (ball and socket) joint'),
          _(
            'Add a point joint between two objects. They will be linked together at a given world position, but will be able to rotate freely.'
          ),
          _(
            'Add a point joint between _PARAM0_ and _PARAM2_ at _PARAM3_;_PARAM4_;_PARAM5_, save ID in _PARAM6_'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('objectPtr', _('Other object'), '', false)
        .addParameter('expression', _('Joint position X'))
        .addParameter('expression', _('Joint position Y'))
        .addParameter('expression', _('Joint position Z'))
        .addParameter('scenevar', _('Variable where to store the joint ID'))
        .setFunctionName('addPointJoint');

      aut
        .addScopedAction(
          'AddHingeJoint',
          _('Add a hinge joint'),
          _(
            'Add a hinge joint. Both objects will be linked together at a given position and allowed to rotate around the given axis.'
          ),
          _(
            'Add a hinge joint between _PARAM0_ and _PARAM2_ at position _PARAM3_;_PARAM4_;_PARAM5_ around axis _PARAM6_;_PARAM7_;_PARAM8_, save ID in _PARAM9_'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('objectPtr', _('Other object'), '', false)
        .addParameter('expression', _('Joint position X'))
        .addParameter('expression', _('Joint position Y'))
        .addParameter('expression', _('Joint position Z'))
        .addParameter('expression', _('Axis X'))
        .addParameter('expression', _('Axis Y'))
        .addParameter('expression', _('Axis Z'))
        .addParameter('scenevar', _('Variable where to store the joint ID'))
        .setFunctionName('addHingeJoint');

      aut
        .addScopedAction(
          'AddSliderJoint',
          _('Add a slider joint'),
          _(
            'Add a slider joint. Both objects will be linked but allowed to slide along an axis.'
          ),
          _(
            'Add a slider joint between _PARAM0_ and _PARAM2_ on axis _PARAM3_;_PARAM4_;_PARAM5_, save ID in _PARAM6_'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('objectPtr', _('Other object'), '', false)
        .addParameter('expression', _('Axis X'))
        .addParameter('expression', _('Axis Y'))
        .addParameter('expression', _('Axis Z'))
        .addParameter('scenevar', _('Variable where to store the joint ID'))
        .setFunctionName('addSliderJoint');

      aut
        .addScopedAction(
          'AddDistanceJoint',
          _('Add a distance joint'),
          _(
            'Add a distance joint. Keeps a minimum and maximum distance between the center of mass of both objects, optionally using a spring.'
          ),
          _(
            'Add a distance joint between _PARAM0_ and _PARAM2_ (min: _PARAM3_, max: _PARAM4_, spring freq: _PARAM5_, damping: _PARAM6_), save ID to _PARAM7_'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('objectPtr', _('Other object'), '', false)
        .addParameter('expression', _('Minimum distance (pixels)'))
        .addParameter('expression', _('Maximum distance (pixels)'))
        .addParameter('expression', _('Spring frequency (0 to disable)'))
        .addParameter('expression', _('Spring damping ratio (e.g. 0.5)'))
        .addParameter('scenevar', _('Variable where to store the joint ID'))
        .setFunctionName('addDistanceJoint');

      aut
        .addScopedAction(
          'AddPulleyJoint',
          _('Add a pulley joint'),
          _(
            'Add a pulley joint between two objects using two fixed world pulley anchors and two local attachment points. The total rope length is constrained.'
          ),
          _(
            'Add a pulley joint between _PARAM0_ and _PARAM2_ (total length: _PARAM15_, ratio: _PARAM16_, enabled: _PARAM17_), save ID in _PARAM18_'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('objectPtr', _('Other object'), '', false)
        .addParameter('expression', _('Pulley anchor A X (world, pixels)'))
        .addParameter('expression', _('Pulley anchor A Y (world, pixels)'))
        .addParameter('expression', _('Pulley anchor A Z (world, pixels)'))
        .addParameter('expression', _('Pulley anchor B X (world, pixels)'))
        .addParameter('expression', _('Pulley anchor B Y (world, pixels)'))
        .addParameter('expression', _('Pulley anchor B Z (world, pixels)'))
        .addParameter('expression', _('Local anchor A X (pixels)'))
        .addParameter('expression', _('Local anchor A Y (pixels)'))
        .addParameter('expression', _('Local anchor A Z (pixels)'))
        .addParameter('expression', _('Local anchor B X (pixels)'))
        .addParameter('expression', _('Local anchor B Y (pixels)'))
        .addParameter('expression', _('Local anchor B Z (pixels)'))
        .addParameter('expression', _('Total rope length (pixels)'))
        .addParameter('expression', _('Pulley ratio (default 1.0)'))
        .addParameter('yesorno', _('Enable joint'), '', false)
        .addParameter('scenevar', _('Variable where to store the joint ID'))
        .setFunctionName('addPulleyJoint');

      aut
        .addScopedAction(
          'AddConeJoint',
          _('Add a cone joint'),
          _(
            'Add a cone joint. Constraints the movement to a cone shape around a twist axis.'
          ),
          _(
            'Add a cone joint between _PARAM0_ and _PARAM2_ at _PARAM3_;_PARAM4_;_PARAM5_ (twist axis _PARAM6_;_PARAM7_;_PARAM8_, half angle _PARAM9_°), save ID to _PARAM10_'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('objectPtr', _('Other object'), '', false)
        .addParameter('expression', _('Joint position X'))
        .addParameter('expression', _('Joint position Y'))
        .addParameter('expression', _('Joint position Z'))
        .addParameter('expression', _('Twist axis X'))
        .addParameter('expression', _('Twist axis Y'))
        .addParameter('expression', _('Twist axis Z'))
        .addParameter('expression', _('Half cone angle (degrees)'))
        .addParameter('scenevar', _('Variable where to store the joint ID'))
        .setFunctionName('addConeJoint');

      aut
        .addScopedAction(
          'RemoveJoint',
          _('Remove a joint'),
          _('Remove a joint by its ID.'),
          _('Remove the joint _PARAM2_'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('removeJoint');

      aut
        .addScopedCondition(
          'IsJointFirstObject',
          _('Is first object in a joint'),
          _('Check if an object is the first object in a specific joint.'),
          _('_PARAM0_ is the first object of joint _PARAM2_'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('isJointFirstObject');

      aut
        .addScopedCondition(
          'IsJointSecondObject',
          _('Is second object in a joint'),
          _('Check if an object is the second object in a specific joint.'),
          _('_PARAM0_ is the second object of joint _PARAM2_'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('isJointSecondObject');

      aut
        .addScopedAction(
          'SetHingeJointLimits',
          _('Set hinge joint limits'),
          _('Set the min and max angles for a hinge joint.'),
          _('Set hinge joint _PARAM2_ limits (min: _PARAM3_°, max: _PARAM4_°)'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Min angle (degrees)'))
        .addParameter('expression', _('Max angle (degrees)'))
        .setFunctionName('setHingeJointLimits');

      aut
        .addScopedAction(
          'SetHingeJointMotor',
          _('Set hinge joint motor'),
          _('Set the motor state and target for a hinge joint.'),
          _(
            'Set hinge joint _PARAM2_ motor state to _PARAM3_ (target: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter(
          'stringWithSelector',
          _('Motor State'),
          '["Off", "Velocity", "Position"]',
          false
        )
        .addParameter('expression', _('Target velocity (deg/s) or angle (deg)'))
        .setFunctionName('setHingeJointMotor');

      aut
        .addExpression(
          'HingeJointAngle',
          _('Hinge joint angle'),
          _('Return the current angle of a hinge joint (in degrees).'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getHingeJointAngle');

      aut
        .addScopedAction(
          'SetSliderJointLimits',
          _('Set slider joint limits'),
          _('Set the min and max distance for a slider joint.'),
          _(
            'Set slider joint _PARAM2_ limits (min: _PARAM3_ px, max: _PARAM4_ px)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Min limit (pixels)'))
        .addParameter('expression', _('Max limit (pixels)'))
        .setFunctionName('setSliderJointLimits');

      aut
        .addScopedAction(
          'SetSliderJointMotor',
          _('Set slider joint motor'),
          _('Set the motor state and target for a slider joint.'),
          _(
            'Set slider joint _PARAM2_ motor state to _PARAM3_ (target: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter(
          'stringWithSelector',
          _('Motor State'),
          '["Off", "Velocity", "Position"]',
          false
        )
        .addParameter('expression', _('Target velocity (px/s) or pos. (px)'))
        .setFunctionName('setSliderJointMotor');

      aut
        .addScopedAction(
          'SetHingeJointMotorLimits',
          _('Set hinge motor limits'),
          _('Set torque limits used by the hinge motor solver.'),
          _(
            'Set hinge joint _PARAM2_ motor torque limits (min: _PARAM3_, max: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Min torque limit'))
        .addParameter('expression', _('Max torque limit'))
        .setFunctionName('setHingeJointMotorLimits');

      aut
        .addScopedAction(
          'SetHingeJointMotorSpring',
          _('Set hinge motor spring'),
          _('Set spring frequency and damping for the hinge motor response.'),
          _(
            'Set hinge joint _PARAM2_ motor spring (frequency: _PARAM3_, damping: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Motor spring frequency (Hz)'))
        .addParameter('expression', _('Motor spring damping'))
        .setFunctionName('setHingeJointMotorSpring');

      aut
        .addScopedAction(
          'SetSliderJointMotorLimits',
          _('Set slider motor limits'),
          _('Set force limits used by the slider motor solver.'),
          _(
            'Set slider joint _PARAM2_ motor force limits (min: _PARAM3_, max: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Min force limit'))
        .addParameter('expression', _('Max force limit'))
        .setFunctionName('setSliderJointMotorLimits');

      aut
        .addScopedAction(
          'SetSliderJointMotorSpring',
          _('Set slider motor spring'),
          _('Set spring frequency and damping for the slider motor response.'),
          _(
            'Set slider joint _PARAM2_ motor spring (frequency: _PARAM3_, damping: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Motor spring frequency (Hz)'))
        .addParameter('expression', _('Motor spring damping'))
        .setFunctionName('setSliderJointMotorSpring');

      aut
        .addExpression(
          'SliderJointPosition',
          _('Slider joint position'),
          _('Return the current position of a slider joint (in pixels).'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getSliderJointPosition');

      aut
        .addScopedAction(
          'SetDistanceJointDistance',
          _('Set distance joint limits'),
          _('Set the min and max distance for a distance joint.'),
          _(
            'Set distance joint _PARAM2_ distance (min: _PARAM3_ px, max: _PARAM4_ px)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Min distance (pixels)'))
        .addParameter('expression', _('Max distance (pixels)'))
        .setFunctionName('setDistanceJointDistance');

      aut
        .addScopedAction(
          'SetPulleyJointLength',
          _('Set pulley joint total length'),
          _(
            'Set the total rope length of a pulley joint. Internally this sets min and max rope lengths to the same value.'
          ),
          _('Set pulley joint _PARAM2_ total rope length to _PARAM3_ px'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Total rope length (pixels)'))
        .setFunctionName('setPulleyJointLength');

      aut
        .addExpression(
          'PulleyJointCurrentLength',
          _('Pulley joint current length'),
          _(
            'Return the current rope length of a pulley joint (in pixels), updated as bodies move.'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getPulleyJointCurrentLength');

      aut
        .addExpression(
          'PulleyJointTotalLength',
          _('Pulley joint total length'),
          _(
            'Return the configured total rope length of a pulley joint (in pixels).'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getPulleyJointTotalLength');

      // ==================== Advanced Joint Customization ====================

      // Hinge Joint Spring
      aut
        .addScopedAction(
          'SetHingeJointSpring',
          _('Set hinge limits spring'),
          _(
            'Set spring settings for hinge angle limits (frequency and damping).'
          ),
          _(
            'Set hinge joint _PARAM2_ limits spring (frequency: _PARAM3_, damping: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Spring frequency (Hz, 0 = disable)'))
        .addParameter('expression', _('Damping ratio (0..1)'))
        .setFunctionName('setHingeJointSpring');

      // Hinge Joint Max Friction
      aut
        .addScopedAction(
          'SetHingeJointMaxFriction',
          _('Set hinge joint friction'),
          _('Set the maximum friction torque of a hinge joint.'),
          _('Set hinge joint _PARAM2_ max friction torque to _PARAM3_'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Max friction torque'))
        .setFunctionName('setHingeJointMaxFriction');

      // Hinge Joint Has Limits
      aut
        .addScopedCondition(
          'HasHingeJointLimits',
          _('Hinge joint has limits'),
          _('Check if a hinge joint has angle limits enabled.'),
          _('Hinge joint _PARAM2_ has limits'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('hasHingeJointLimits');

      // Hinge Joint Min/Max Limit Expressions
      aut
        .addExpression(
          'HingeJointMinLimit',
          _('Hinge joint min limit'),
          _('Return the minimum angle limit of a hinge joint (in degrees).'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getHingeJointMinLimit');

      aut
        .addExpression(
          'HingeJointMaxLimit',
          _('Hinge joint max limit'),
          _('Return the maximum angle limit of a hinge joint (in degrees).'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getHingeJointMaxLimit');

      // Slider Joint Spring
      aut
        .addScopedAction(
          'SetSliderJointSpring',
          _('Set slider limits spring'),
          _('Set spring settings for slider limits (frequency and damping).'),
          _(
            'Set slider joint _PARAM2_ limits spring (frequency: _PARAM3_, damping: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Spring frequency (Hz, 0 = disable)'))
        .addParameter('expression', _('Damping ratio (0..1)'))
        .setFunctionName('setSliderJointSpring');

      // Slider Joint Max Friction
      aut
        .addScopedAction(
          'SetSliderJointMaxFriction',
          _('Set slider joint friction'),
          _('Set the maximum friction force of a slider joint.'),
          _('Set slider joint _PARAM2_ max friction force to _PARAM3_'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Max friction force'))
        .setFunctionName('setSliderJointMaxFriction');

      // Slider Joint Has Limits
      aut
        .addScopedCondition(
          'HasSliderJointLimits',
          _('Slider joint has limits'),
          _('Check if a slider joint has position limits enabled.'),
          _('Slider joint _PARAM2_ has limits'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('hasSliderJointLimits');

      // Slider Joint Min/Max Limit Expressions
      aut
        .addExpression(
          'SliderJointMinLimit',
          _('Slider joint min limit'),
          _('Return the minimum position limit of a slider joint (in pixels).'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getSliderJointMinLimit');

      aut
        .addExpression(
          'SliderJointMaxLimit',
          _('Slider joint max limit'),
          _('Return the maximum position limit of a slider joint (in pixels).'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getSliderJointMaxLimit');

      // Distance Joint Spring
      aut
        .addScopedAction(
          'SetDistanceJointSpring',
          _('Set distance joint limits spring'),
          _('Set spring settings for distance limits (frequency and damping).'),
          _(
            'Set distance joint _PARAM2_ limits spring (frequency: _PARAM3_, damping: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Spring frequency (Hz, 0 = disable)'))
        .addParameter('expression', _('Damping ratio (0..1)'))
        .setFunctionName('setDistanceJointSpring');

      // Distance Joint Min/Max Distance Expressions
      aut
        .addExpression(
          'DistanceJointMinDistance',
          _('Distance joint min distance'),
          _(
            'Return the current minimum distance of a distance joint (in pixels).'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getDistanceJointMinDistance');

      aut
        .addExpression(
          'DistanceJointMaxDistance',
          _('Distance joint max distance'),
          _(
            'Return the current maximum distance of a distance joint (in pixels).'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getDistanceJointMaxDistance');

      // Cone Joint Half Angle
      aut
        .addScopedAction(
          'SetConeJointHalfAngle',
          _('Set cone joint angle'),
          _('Update the half cone angle of a cone joint at runtime.'),
          _('Set cone joint _PARAM2_ half angle to _PARAM3_°'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Half cone angle (degrees)'))
        .setFunctionName('setConeJointHalfAngle');

      // ==================== SwingTwist Joint ====================

      aut
        .addScopedAction(
          'AddSwingTwistJoint',
          _('Add a SwingTwist joint'),
          _(
            'Add a SwingTwist joint (professional constraint for shoulders, hips, ragdolls). Allows independent control of swing cone and twist range.'
          ),
          _(
            'Add SwingTwist joint between _PARAM0_ and _PARAM2_ at (_PARAM3_, _PARAM4_, _PARAM5_), store ID in _PARAM12_'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('objectPtr', _('Other object'))
        .addParameter('expression', _('Anchor X (pixels)'))
        .addParameter('expression', _('Anchor Y (pixels)'))
        .addParameter('expression', _('Anchor Z (pixels)'))
        .addParameter('expression', _('Twist axis X'))
        .addParameter('expression', _('Twist axis Y'))
        .addParameter('expression', _('Twist axis Z'))
        .addParameter('expression', _('Normal half cone angle (degrees)'))
        .addParameter('expression', _('Plane half cone angle (degrees)'))
        .addParameter('expression', _('Twist min angle (degrees)'))
        .addParameter('expression', _('Twist max angle (degrees)'))
        .addParameter('scenevar', _('Variable to store joint ID'))
        .setFunctionName('addSwingTwistJoint');

      // ==================== Joint Enable/Disable & Count ====================

      aut
        .addScopedAction(
          'EnableJoint',
          _('Enable joint'),
          _('Enable a previously disabled joint.'),
          _('Enable joint _PARAM2_'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('enableJoint');

      aut
        .addScopedAction(
          'DisableJoint',
          _('Disable joint'),
          _('Temporarily disable a joint without removing it.'),
          _('Disable joint _PARAM2_'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('disableJoint');

      aut
        .addScopedAction(
          'SetJointSolverOverrides',
          _('Set joint solver overrides'),
          _(
            'Override velocity/position solver steps for this joint (0 = engine default).'
          ),
          _(
            'Set joint _PARAM2_ solver overrides (velocity steps: _PARAM3_, position steps: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Velocity steps override'))
        .addParameter('expression', _('Position steps override'))
        .setFunctionName('setJointSolverOverrides');

      aut
        .addScopedAction(
          'SetJointPriority',
          _('Set joint solver priority'),
          _(
            'Set solver priority for a joint. Higher values are solved earlier.'
          ),
          _('Set joint _PARAM2_ priority to _PARAM3_'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Priority'))
        .setFunctionName('setJointPriority');

      aut
        .addScopedAction(
          'SetJointStabilityPreset',
          _('Set joint stability preset'),
          _(
            'Apply a pre-tuned stability preset on a joint (easy professional setup).'
          ),
          _('Set joint _PARAM2_ stability preset to _PARAM3_'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter(
          'stringWithSelector',
          _('Preset'),
          '["Balanced", "Stable", "UltraStable"]',
          false
        )
        .setFunctionName('setJointStabilityPreset');

      aut
        .addScopedAction(
          'SetJointBreakThresholds',
          _('Set joint break thresholds'),
          _(
            'Set max reaction force/torque at which this joint automatically breaks.'
          ),
          _(
            'Set joint _PARAM2_ break thresholds (force: _PARAM3_, torque: _PARAM4_)'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .addParameter('expression', _('Max break force (<=0 disables)'))
        .addParameter('expression', _('Max break torque (<=0 disables)'))
        .setFunctionName('setJointBreakThresholds');

      aut
        .addScopedAction(
          'ClearJointBreakThresholds',
          _('Clear joint break thresholds'),
          _('Disable automatic break thresholds on a joint.'),
          _('Clear break thresholds for joint _PARAM2_'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('clearJointBreakThresholds');

      aut
        .addScopedCondition(
          'IsJointEnabled',
          _('Joint is enabled'),
          _('Check if a joint is currently enabled.'),
          _('Joint _PARAM2_ is enabled'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('isJointEnabled');

      aut
        .addScopedCondition(
          'IsJointBroken',
          _('Joint is broken'),
          _(
            'Check if a joint has been automatically broken by its thresholds.'
          ),
          _('Joint _PARAM2_ is broken'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('isJointBroken');

      aut
        .addExpression(
          'JointCount',
          _('Joint count'),
          _('Return the total number of active joints.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getJointCount');

      aut
        .addExpression(
          'JointEditorJointId',
          _('Joint editor joint ID'),
          _(
            'Return the active joint ID managed by the Joint Editor GUI on this object (0 if none).'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .setFunctionName('getJointEditorJointId');

      aut
        .addExpression(
          'JointReactionForce',
          _('Joint reaction force'),
          _(
            'Return last measured reaction force of a joint. Useful for breakable constraints and debugging stability.'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getJointReactionForce');

      aut
        .addExpression(
          'JointReactionTorque',
          _('Joint reaction torque'),
          _(
            'Return last measured reaction torque of a joint. Useful for breakable constraints and debugging stability.'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getJointReactionTorque');

      // ==================== Hinge Motor Query Expressions ====================

      aut
        .addExpression(
          'HingeJointMotorSpeed',
          _('Hinge joint motor speed'),
          _(
            'Return the target angular velocity of a hinge joint motor (degrees/second).'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getHingeJointMotorSpeed');

      aut
        .addExpression(
          'HingeJointMotorTarget',
          _('Hinge joint motor target'),
          _('Return the target angle of a hinge joint motor (degrees).'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getHingeJointMotorTarget');

      aut
        .addExpression(
          'HingeJointMaxFriction',
          _('Hinge joint max friction'),
          _('Return the maximum friction torque of a hinge joint.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getHingeJointMaxFriction');

      aut
        .addExpression(
          'HingeJointMotorMinTorque',
          _('Hinge motor min torque'),
          _('Return hinge motor minimum torque limit.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getHingeJointMotorMinTorque');

      aut
        .addExpression(
          'HingeJointMotorMaxTorque',
          _('Hinge motor max torque'),
          _('Return hinge motor maximum torque limit.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getHingeJointMotorMaxTorque');

      aut
        .addExpression(
          'HingeJointMotorSpringFrequency',
          _('Hinge motor spring frequency'),
          _('Return hinge motor spring frequency.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getHingeJointMotorSpringFrequency');

      aut
        .addExpression(
          'HingeJointMotorSpringDamping',
          _('Hinge motor spring damping'),
          _('Return hinge motor spring damping.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getHingeJointMotorSpringDamping');

      // ==================== Slider Motor Query Expressions ====================

      aut
        .addExpression(
          'SliderJointMotorSpeed',
          _('Slider joint motor speed'),
          _(
            'Return the target velocity of a slider joint motor (pixels/second).'
          ),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getSliderJointMotorSpeed');

      aut
        .addExpression(
          'SliderJointMotorTarget',
          _('Slider joint motor target'),
          _('Return the target position of a slider joint motor (pixels).'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getSliderJointMotorTarget');

      aut
        .addExpression(
          'SliderJointMaxFriction',
          _('Slider joint max friction'),
          _('Return the maximum friction force of a slider joint.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getSliderJointMaxFriction');

      aut
        .addExpression(
          'SliderJointMotorMinForce',
          _('Slider motor min force'),
          _('Return slider motor minimum force limit.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getSliderJointMotorMinForce');

      aut
        .addExpression(
          'SliderJointMotorMaxForce',
          _('Slider motor max force'),
          _('Return slider motor maximum force limit.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getSliderJointMotorMaxForce');

      aut
        .addExpression(
          'SliderJointMotorSpringFrequency',
          _('Slider motor spring frequency'),
          _('Return slider motor spring frequency.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getSliderJointMotorSpringFrequency');

      aut
        .addExpression(
          'SliderJointMotorSpringDamping',
          _('Slider motor spring damping'),
          _('Return slider motor spring damping.'),
          _('Joints'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getSliderJointMotorSpringDamping');

      // ================================================================
      // ==================== RAGDOLL AUTOMATION SYSTEM ==================
      // ================================================================

      // ==================== Group Management ====================

      aut
        .addScopedAction(
          'CreateRagdollGroup',
          _('Create ragdoll group'),
          _(
            'Create a new ragdoll group for batch control of connected bodies and joints.'
          ),
          _('Create ragdoll group and store ID in _PARAM2_'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('scenevar', _('Variable to store ragdoll ID'))
        .setFunctionName('createRagdollGroup');

      aut
        .addScopedAction(
          'AddBodyToRagdollGroup',
          _('Add body to ragdoll group'),
          _(
            "Add this object's physics body to a ragdoll group for batch control."
          ),
          _('Add _PARAM0_ to ragdoll group _PARAM2_'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .setFunctionName('addBodyToRagdollGroup');

      aut
        .addScopedAction(
          'AddJointToRagdollGroup',
          _('Add joint to ragdoll group'),
          _(
            'Register an existing joint with a ragdoll group for batch control.'
          ),
          _('Add joint _PARAM3_ to ragdoll group _PARAM2_'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('addJointToRagdollGroup');

      aut
        .addScopedAction(
          'RemoveRagdollGroup',
          _('Remove ragdoll group'),
          _('Remove a ragdoll group and all its joints.'),
          _('Remove ragdoll group _PARAM2_ and all its joints'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .setFunctionName('removeRagdollGroup');

      // ==================== Ragdoll State Control ====================

      aut
        .addScopedAction(
          'SetRagdollMode',
          _('Set ragdoll mode'),
          _(
            'Switch all bodies in a ragdoll between Dynamic (physics) and Kinematic (animation) mode.'
          ),
          _('Set ragdoll _PARAM2_ mode to _PARAM3_'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .addParameter(
          'stringWithSelector',
          _('Mode'),
          '["Dynamic", "Kinematic"]',
          false
        )
        .setFunctionName('setRagdollMode');

      aut
        .addScopedAction(
          'SetRagdollState',
          _('Set ragdoll state'),
          _(
            'Set a preset ragdoll state: Active (normal physics), Limp (floppy ragdoll), Stiff (muscle tension), Frozen (kinematic).'
          ),
          _('Set ragdoll _PARAM2_ state to _PARAM3_'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .addParameter(
          'stringWithSelector',
          _('State'),
          '["Active", "Limp", "Stiff", "Frozen"]',
          false
        )
        .setFunctionName('setRagdollState');

      // ==================== Ragdoll Batch Controls ====================

      aut
        .addScopedAction(
          'SetRagdollDamping',
          _('Set ragdoll damping'),
          _('Set linear and angular damping on ALL bodies in a ragdoll group.'),
          _(
            'Set ragdoll _PARAM2_ damping (linear: _PARAM3_, angular: _PARAM4_)'
          ),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .addParameter('expression', _('Linear damping'))
        .addParameter('expression', _('Angular damping'))
        .setFunctionName('setRagdollDamping');

      aut
        .addScopedAction(
          'SetRagdollStiffness',
          _('Set ragdoll stiffness'),
          _(
            'Set spring stiffness on ALL joints in a ragdoll group (simulates muscle tension).'
          ),
          _(
            'Set ragdoll _PARAM2_ stiffness (frequency: _PARAM3_, damping: _PARAM4_)'
          ),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .addParameter('expression', _('Spring frequency (Hz)'))
        .addParameter('expression', _('Damping ratio (0..1)'))
        .setFunctionName('setRagdollStiffness');

      aut
        .addScopedAction(
          'SetRagdollFriction',
          _('Set ragdoll friction'),
          _('Set friction on ALL joints in a ragdoll group.'),
          _('Set ragdoll _PARAM2_ friction to _PARAM3_'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .addParameter('expression', _('Friction'))
        .setFunctionName('setRagdollFriction');

      aut
        .addScopedAction(
          'ApplyRagdollImpulse',
          _('Apply ragdoll impulse'),
          _(
            'Apply an impulse to ALL bodies in a ragdoll group (explosions, hits, knockbacks).'
          ),
          _('Apply impulse (_PARAM3_, _PARAM4_, _PARAM5_) to ragdoll _PARAM2_'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .addParameter('expression', _('Impulse X'))
        .addParameter('expression', _('Impulse Y'))
        .addParameter('expression', _('Impulse Z'))
        .setFunctionName('applyRagdollImpulse');

      aut
        .addScopedAction(
          'SetRagdollGravityScale',
          _('Set ragdoll gravity scale'),
          _(
            'Set gravity scale on ALL bodies in a ragdoll (0 = zero gravity, 1 = normal, 2 = double gravity).'
          ),
          _('Set ragdoll _PARAM2_ gravity scale to _PARAM3_'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .addParameter('expression', _('Gravity scale (0-2)'))
        .setFunctionName('setRagdollGravityScale');

      // ==================== Ragdoll Queries ====================

      aut
        .addExpression(
          'RagdollBodyCount',
          _('Ragdoll body count'),
          _('Return the number of bodies in a ragdoll group.'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .setFunctionName('getRagdollBodyCount');

      aut
        .addExpression(
          'RagdollJointCount',
          _('Ragdoll joint count'),
          _('Return the number of joints in a ragdoll group.'),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Ragdoll group ID'))
        .setFunctionName('getRagdollJointCount');

      // ==================== Joint World Position ====================

      aut
        .addExpression(
          'JointWorldX',
          _('Joint world X position'),
          _(
            'Return the world X position of a joint (midpoint of connected bodies, in pixels).'
          ),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getJointWorldX');

      aut
        .addExpression(
          'JointWorldY',
          _('Joint world Y position'),
          _(
            'Return the world Y position of a joint (midpoint of connected bodies, in pixels).'
          ),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getJointWorldY');

      aut
        .addExpression(
          'JointWorldZ',
          _('Joint world Z position'),
          _(
            'Return the world Z position of a joint (midpoint of connected bodies, in pixels).'
          ),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Joint ID'))
        .setFunctionName('getJointWorldZ');

      // ==================== Humanoid Ragdoll Template ====================

      aut
        .addScopedAction(
          'BuildHumanoidRagdoll',
          _('Build humanoid ragdoll'),
          _(
            'Automatically build a complete humanoid ragdoll from 11 body-part objects with proper joint types and weight distribution.'
          ),
          _(
            'Build humanoid ragdoll from _PARAM2_ body parts, store ID in _PARAM13_'
          ),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('objectPtr', _('Head'))
        .addParameter('objectPtr', _('Chest'))
        .addParameter('objectPtr', _('Hips'))
        .addParameter('objectPtr', _('Upper Arm Left'))
        .addParameter('objectPtr', _('Lower Arm Left'))
        .addParameter('objectPtr', _('Upper Arm Right'))
        .addParameter('objectPtr', _('Lower Arm Right'))
        .addParameter('objectPtr', _('Thigh Left'))
        .addParameter('objectPtr', _('Shin Left'))
        .addParameter('objectPtr', _('Thigh Right'))
        .addParameter('objectPtr', _('Shin Right'))
        .addParameter('scenevar', _('Variable to store ragdoll ID'))
        .setFunctionName('buildHumanoidRagdoll');

      aut
        .addScopedAction(
          'BuildHumanoidRagdollFromTag',
          _('Build humanoid ragdoll from tag'),
          _(
            'Automatically find body parts by their ragdoll role and shared group tag, then build one humanoid ragdoll.'
          ),
          _(
            'Build humanoid ragdoll for group tag _PARAM2_ and store ID in _PARAM3_'
          ),
          _('Ragdoll'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('string', _('Ragdoll group tag'))
        .addParameter('scenevar', _('Variable to store ragdoll ID'))
        .setFunctionName('buildHumanoidRagdollFromTag');
    }
    // Bulk joints
    extension
      .addAction(
        'AddFixedJointsBetweenObjects',
        _('Link fixed joints to all picked objects'),
        _(
          'Create fixed joints between each picked source object and each picked target object.'
        ),
        _(
          'Link fixed joints between _PARAM0_ and _PARAM2_ (linked pairs: _PARAM3_, last joint ID: _PARAM4_)'
        ),
        _('Joints'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Source objects'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Target objects'), '', false)
      .addParameter('scenevar', _('Variable to store linked pairs count'))
      .addParameter('scenevar', _('Variable to store last joint ID'))
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.addFixedJointsBetweenObjects');

    extension
      .addAction(
        'AddPointJointsBetweenObjects',
        _('Link point joints to all picked objects'),
        _(
          'Create point joints between each picked source object and each picked target object.'
        ),
        _(
          'Link point joints between _PARAM0_ and _PARAM2_ at _PARAM3_;_PARAM4_;_PARAM5_ (linked pairs: _PARAM6_, last joint ID: _PARAM7_)'
        ),
        _('Joints'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Source objects'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Target objects'), '', false)
      .addParameter('expression', _('Joint position X'))
      .addParameter('expression', _('Joint position Y'))
      .addParameter('expression', _('Joint position Z'))
      .addParameter('scenevar', _('Variable to store linked pairs count'))
      .addParameter('scenevar', _('Variable to store last joint ID'))
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.addPointJointsBetweenObjects');

    extension
      .addAction(
        'AddHingeJointsBetweenObjects',
        _('Link hinge joints to all picked objects'),
        _(
          'Create hinge joints between each picked source object and each picked target object.'
        ),
        _(
          'Link hinge joints between _PARAM0_ and _PARAM2_ at _PARAM3_;_PARAM4_;_PARAM5_ on axis _PARAM6_;_PARAM7_;_PARAM8_ (linked pairs: _PARAM9_, last joint ID: _PARAM10_)'
        ),
        _('Joints'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Source objects'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Target objects'), '', false)
      .addParameter('expression', _('Joint position X'))
      .addParameter('expression', _('Joint position Y'))
      .addParameter('expression', _('Joint position Z'))
      .addParameter('expression', _('Axis X'))
      .addParameter('expression', _('Axis Y'))
      .addParameter('expression', _('Axis Z'))
      .addParameter('scenevar', _('Variable to store linked pairs count'))
      .addParameter('scenevar', _('Variable to store last joint ID'))
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.addHingeJointsBetweenObjects');

    extension
      .addAction(
        'AddSliderJointsBetweenObjects',
        _('Link slider joints to all picked objects'),
        _(
          'Create slider joints between each picked source object and each picked target object.'
        ),
        _(
          'Link slider joints between _PARAM0_ and _PARAM2_ on axis _PARAM3_;_PARAM4_;_PARAM5_ (linked pairs: _PARAM6_, last joint ID: _PARAM7_)'
        ),
        _('Joints'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Source objects'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Target objects'), '', false)
      .addParameter('expression', _('Axis X'))
      .addParameter('expression', _('Axis Y'))
      .addParameter('expression', _('Axis Z'))
      .addParameter('scenevar', _('Variable to store linked pairs count'))
      .addParameter('scenevar', _('Variable to store last joint ID'))
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.addSliderJointsBetweenObjects');

    extension
      .addAction(
        'AddDistanceJointsBetweenObjects',
        _('Link distance joints to all picked objects'),
        _(
          'Create distance joints between each picked source object and each picked target object.'
        ),
        _(
          'Link distance joints between _PARAM0_ and _PARAM2_ (min: _PARAM3_, max: _PARAM4_, spring: _PARAM5_, damping: _PARAM6_) (linked pairs: _PARAM7_, last joint ID: _PARAM8_)'
        ),
        _('Joints'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Source objects'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Target objects'), '', false)
      .addParameter('expression', _('Minimum distance (pixels)'))
      .addParameter('expression', _('Maximum distance (pixels)'))
      .addParameter('expression', _('Spring frequency (0 to disable)'))
      .addParameter('expression', _('Spring damping ratio'))
      .addParameter('scenevar', _('Variable to store linked pairs count'))
      .addParameter('scenevar', _('Variable to store last joint ID'))
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.addDistanceJointsBetweenObjects');

    extension
      .addAction(
        'AddPulleyJointsBetweenObjects',
        _('Link pulley joints to all picked objects'),
        _(
          'Create pulley joints between each picked source object and each picked target object.'
        ),
        _(
          'Link pulley joints between _PARAM0_ and _PARAM2_ (total length: _PARAM15_, ratio: _PARAM16_, enabled: _PARAM17_) (linked pairs: _PARAM18_, last joint ID: _PARAM19_)'
        ),
        _('Joints'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Source objects'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Target objects'), '', false)
      .addParameter('expression', _('Pulley anchor A X (world, pixels)'))
      .addParameter('expression', _('Pulley anchor A Y (world, pixels)'))
      .addParameter('expression', _('Pulley anchor A Z (world, pixels)'))
      .addParameter('expression', _('Pulley anchor B X (world, pixels)'))
      .addParameter('expression', _('Pulley anchor B Y (world, pixels)'))
      .addParameter('expression', _('Pulley anchor B Z (world, pixels)'))
      .addParameter('expression', _('Local anchor A X (pixels)'))
      .addParameter('expression', _('Local anchor A Y (pixels)'))
      .addParameter('expression', _('Local anchor A Z (pixels)'))
      .addParameter('expression', _('Local anchor B X (pixels)'))
      .addParameter('expression', _('Local anchor B Y (pixels)'))
      .addParameter('expression', _('Local anchor B Z (pixels)'))
      .addParameter('expression', _('Total rope length (pixels)'))
      .addParameter('expression', _('Pulley ratio (default 1.0)'))
      .addParameter('yesorno', _('Enable joint'), '', false)
      .addParameter('scenevar', _('Variable to store linked pairs count'))
      .addParameter('scenevar', _('Variable to store last joint ID'))
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.addPulleyJointsBetweenObjects');

    extension
      .addAction(
        'AddConeJointsBetweenObjects',
        _('Link cone joints to all picked objects'),
        _(
          'Create cone joints between each picked source object and each picked target object.'
        ),
        _(
          'Link cone joints between _PARAM0_ and _PARAM2_ at _PARAM3_;_PARAM4_;_PARAM5_ (axis _PARAM6_;_PARAM7_;_PARAM8_, angle _PARAM9_°) (linked pairs: _PARAM10_, last joint ID: _PARAM11_)'
        ),
        _('Joints'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Source objects'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Target objects'), '', false)
      .addParameter('expression', _('Joint position X'))
      .addParameter('expression', _('Joint position Y'))
      .addParameter('expression', _('Joint position Z'))
      .addParameter('expression', _('Twist axis X'))
      .addParameter('expression', _('Twist axis Y'))
      .addParameter('expression', _('Twist axis Z'))
      .addParameter('expression', _('Half cone angle (degrees)'))
      .addParameter('scenevar', _('Variable to store linked pairs count'))
      .addParameter('scenevar', _('Variable to store last joint ID'))
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.addConeJointsBetweenObjects');

    extension
      .addAction(
        'AddSwingTwistJointsBetweenObjects',
        _('Link SwingTwist joints to all picked objects'),
        _(
          'Create SwingTwist joints between each picked source object and each picked target object.'
        ),
        _(
          'Link SwingTwist joints between _PARAM0_ and _PARAM2_ at _PARAM3_;_PARAM4_;_PARAM5_ (linked pairs: _PARAM13_, last joint ID: _PARAM14_)'
        ),
        _('Joints'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Source objects'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Target objects'), '', false)
      .addParameter('expression', _('Anchor X (pixels)'))
      .addParameter('expression', _('Anchor Y (pixels)'))
      .addParameter('expression', _('Anchor Z (pixels)'))
      .addParameter('expression', _('Twist axis X'))
      .addParameter('expression', _('Twist axis Y'))
      .addParameter('expression', _('Twist axis Z'))
      .addParameter('expression', _('Normal half cone angle (degrees)'))
      .addParameter('expression', _('Plane half cone angle (degrees)'))
      .addParameter('expression', _('Twist min angle (degrees)'))
      .addParameter('expression', _('Twist max angle (degrees)'))
      .addParameter('scenevar', _('Variable to store linked pairs count'))
      .addParameter('scenevar', _('Variable to store last joint ID'))
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.addSwingTwistJointsBetweenObjects');

    // Collision
    extension
      .addCondition(
        'Collision',
        _('Collision'),
        _('Check if two objects collide.'),
        _('_PARAM0_ is colliding with _PARAM2_'),
        '',
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.areObjectsColliding');

    extension
      .addCondition(
        'CollisionStarted',
        _('Collision started'),
        _('Check if two objects just started colliding during this frame.'),
        _('_PARAM0_ started colliding with _PARAM2_'),
        _('Collision'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.haveObjectsStartedColliding');

    extension
      .addCondition(
        'CollisionStopped',
        _('Collision stopped'),
        _('Check if two objects just stopped colliding at this frame.'),
        _('_PARAM0_ stopped colliding with _PARAM2_'),
        _('Collision'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.haveObjectsStoppedColliding');

    {
      const behavior = new gd.BehaviorJsImplementation();
      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'physics3D') {
          behaviorContent.getChild('physics3D').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'jumpHeight') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('jumpHeight')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jumpSustainTime') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('jumpSustainTime')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gravity') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent.getChild('gravity').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'fallingSpeedMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('fallingSpeedMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'forwardAcceleration') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('forwardAcceleration')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'forwardDeceleration') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('forwardDeceleration')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'forwardSpeedMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('forwardSpeedMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'sidewaysAcceleration') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('sidewaysAcceleration')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'sidewaysDeceleration') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('sidewaysDeceleration')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'sidewaysSpeedMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('sidewaysSpeedMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'slopeMaxAngle') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('slopeMaxAngle')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'stairHeightMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('stairHeightMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shouldBindObjectAndForwardAngle') {
          behaviorContent
            .getChild('shouldBindObjectAndForwardAngle')
            .setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'canBePushed') {
          behaviorContent
            .getChild('canBePushed')
            .setBoolValue(newValue === '1');
          return true;
        }

        return false;
      };
      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        behaviorProperties
          .getOrCreate('physics3D')
          .setValue(behaviorContent.getChild('physics3D').getStringValue())
          .setType('Behavior')
          .setLabel('3D physics')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addExtraInfo('Physics3D::Physics3DBehavior');

        behaviorProperties
          .getOrCreate('jumpHeight')
          .setLabel(_('Jump height'))
          .setGroup(_('Jump'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent.getChild('jumpHeight').getDoubleValue().toString(10)
          );

        behaviorProperties
          .getOrCreate('jumpSustainTime')
          .setLabel(_('Jump sustain time'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Jump'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getSecond())
          .setValue(
            behaviorContent
              .getChild('jumpSustainTime')
              .getDoubleValue()
              .toString(10)
          )
          .setDescription(
            _(
              'Maximum time (in seconds) during which the jump strength is sustained if the jump key is held - allowing variable height jumps.'
            )
          );

        behaviorProperties
          .getOrCreate('gravity')
          .setLabel(_('Gravity'))
          .setGroup(_('Jump'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration())
          .setValue(
            behaviorContent.getChild('gravity').getDoubleValue().toString(10)
          );

        behaviorProperties
          .getOrCreate('fallingSpeedMax')
          .setLabel(_('Max. falling speed'))
          .setGroup(_('Jump'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelSpeed())
          .setValue(
            behaviorContent
              .getChild('fallingSpeedMax')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('forwardAcceleration')
          .setLabel(_('Forward acceleration'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration())
          .setValue(
            behaviorContent
              .getChild('forwardAcceleration')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('forwardDeceleration')
          .setLabel(_('Forward deceleration'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration())
          .setValue(
            behaviorContent
              .getChild('forwardDeceleration')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('forwardSpeedMax')
          .setLabel(_('Max. forward speed'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelSpeed())
          .setValue(
            behaviorContent
              .getChild('forwardSpeedMax')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('sidewaysAcceleration')
          .setLabel(_('Sideways acceleration'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration())
          .setValue(
            behaviorContent
              .getChild('sidewaysAcceleration')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true);

        behaviorProperties
          .getOrCreate('sidewaysDeceleration')
          .setLabel(_('Sideways deceleration'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration())
          .setValue(
            behaviorContent
              .getChild('sidewaysDeceleration')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true);

        behaviorProperties
          .getOrCreate('sidewaysSpeedMax')
          .setLabel(_('Max. sideways speed'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelSpeed())
          .setValue(
            behaviorContent
              .getChild('sidewaysSpeedMax')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true);

        behaviorProperties
          .getOrCreate('slopeMaxAngle')
          .setLabel('Slope max. angle')
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
          .setValue(
            behaviorContent
              .getChild('slopeMaxAngle')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        if (!behaviorContent.hasChild('stairHeightMax')) {
          behaviorContent.addChild('stairHeightMax').setDoubleValue(20);
        }
        behaviorProperties
          .getOrCreate('stairHeightMax')
          .setLabel('Max. stair height')
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent
              .getChild('stairHeightMax')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('shouldBindObjectAndForwardAngle')
          .setLabel('Keep object angle and forward direction the same')
          .setGroup(_('Walk'))
          .setType('Boolean')
          .setValue(
            behaviorContent
              .getChild('shouldBindObjectAndForwardAngle')
              .getBoolValue()
              ? 'true'
              : 'false'
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        if (!behaviorContent.hasChild('canBePushed')) {
          behaviorContent.addChild('canBePushed').setBoolValue(true);
        }
        behaviorProperties
          .getOrCreate('canBePushed')
          .setLabel('Can be pushed by other characters')
          .setGroup(_('Walk'))
          .setType('Boolean')
          .setValue(
            behaviorContent.getChild('canBePushed').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('physics3D').setStringValue('');
        behaviorContent.addChild('jumpHeight').setDoubleValue(200);
        behaviorContent.addChild('jumpSustainTime').setDoubleValue(0.2);
        behaviorContent.addChild('gravity').setDoubleValue(1000);
        behaviorContent.addChild('fallingSpeedMax').setDoubleValue(700);
        behaviorContent.addChild('forwardAcceleration').setDoubleValue(1200);
        behaviorContent.addChild('forwardDeceleration').setDoubleValue(1200);
        behaviorContent.addChild('forwardSpeedMax').setDoubleValue(600);
        behaviorContent.addChild('sidewaysAcceleration').setDoubleValue(800);
        behaviorContent.addChild('sidewaysDeceleration').setDoubleValue(800);
        behaviorContent.addChild('sidewaysSpeedMax').setDoubleValue(400);
        behaviorContent.addChild('slopeMaxAngle').setDoubleValue(50);
        behaviorContent.addChild('stairHeightMax').setDoubleValue(20);
        behaviorContent
          .addChild('shouldBindObjectAndForwardAngle')
          .setBoolValue(true);
        behaviorContent.addChild('canBePushed').setBoolValue(true);
      };

      const aut = extension
        .addBehavior(
          'PhysicsCharacter3D',
          _('3D physics character'),
          'PhysicsCharacter3D',
          _(
            'Allow an object to jump and run on platforms that have the 3D physics behavior' +
              '(and which are generally set to "Static" as type, unless the platform is animated/moved in events).\n' +
              '\n' +
              'This behavior is usually used with one or more "mapper" behavior to let the player move it.'
          ),
          '',
          'JsPlatform/Extensions/physics_character3d.svg',
          'PhysicsCharacter3D',
          //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
          behavior,
          new gd.BehaviorsSharedData()
        )
        .addIncludeFile(
          'Extensions/Physics3DBehavior/PhysicsCharacter3DRuntimeBehavior.js'
        );

      aut
        .addScopedAction(
          'SimulateForwardKey',
          _('Simulate move forward key press'),
          _('Simulate a press of the move forward key.'),
          _('Simulate pressing Forward key for _PARAM0_'),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('simulateForwardKey');

      aut
        .addScopedAction(
          'SimulateBackwardKey',
          _('Simulate move backward key press'),
          _('Simulate a press of the move backward key.'),
          _('Simulate pressing Backward key for _PARAM0_'),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('simulateBackwardKey');

      aut
        .addScopedAction(
          'SimulateRightKey',
          _('Simulate move right key press'),
          _('Simulate a press of the move right key.'),
          _('Simulate pressing Right key for _PARAM0_'),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('simulateRightKey');

      aut
        .addScopedAction(
          'SimulateLeftKey',
          _('Simulate move left key press'),
          _('Simulate a press of the move left key.'),
          _('Simulate pressing Left key for _PARAM0_'),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('simulateLeftKey');

      aut
        .addScopedAction(
          'SimulateJumpKey',
          _('Simulate jump key press'),
          _('Simulate a press of the jump key.'),
          _('Simulate pressing Jump key for _PARAM0_'),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('simulateJumpKey');

      aut
        .addScopedAction(
          'SimulateStick',
          _('Simulate stick control'),
          _('Simulate a stick control.'),
          _(
            'Simulate a stick control for _PARAM0_ with a _PARAM2_ angle and a _PARAM3_ force'
          ),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .addParameter('expression', _('Stick angle (in degrees)'))
        .addParameter('expression', _('Stick force (between 0 and 1)'))
        .markAsAdvanced()
        .setFunctionName('simulateStick');

      aut
        .addScopedAction(
          'SetCanJump',
          _('Allow jumping again'),
          _(
            "When this action is executed, the object is able to jump again, even if it is in the air: this can be useful to allow a double jump for example. This is not a permanent effect: you must call again this action every time you want to allow the object to jump (apart if it's on the floor)."
          ),
          _('Allow _PARAM0_ to jump again'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .markAsSimple()
        .setFunctionName('setCanJump');

      aut
        .addScopedAction(
          'SetCanNotAirJump',
          _('Forbid jumping again in the air'),
          _(
            'This revokes the effect of "Allow jumping again". The object is made unable to jump while in mid air. This has no effect if the object is not in the air.'
          ),
          _('Forbid _PARAM0_ to air jump'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('setCanNotAirJump');

      aut
        .addScopedAction(
          'AbortJump',
          _('Abort jump'),
          _(
            "Abort the current jump and stop the object vertically. This action doesn't have any effect when the character is not jumping."
          ),
          _('Abort the current jump of _PARAM0_'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('abortJump');

      aut
        .addScopedCondition(
          'CanJump',
          _('Can jump'),
          _('Check if the object can jump.'),
          _('_PARAM0_ can jump'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .markAsSimple()
        .setFunctionName('canJump');

      aut
        .addScopedCondition(
          'IsMovingEvenALittle',
          _('Is moving'),
          _(
            'Check if the object is moving (whether it is on the floor or in the air).'
          ),
          _('_PARAM0_ is moving'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .markAsSimple()
        .setFunctionName('isMovingEvenALittle');

      aut
        .addScopedCondition(
          'IsOnFloor',
          _('Is on floor'),
          _('Check if the object is on a platform.'),
          _('_PARAM0_ is on floor'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .markAsSimple()
        .setFunctionName('isOnFloor');

      aut
        .addScopedCondition(
          'IsJumping',
          _('Is jumping'),
          _('Check if the object is jumping.'),
          _('_PARAM0_ is jumping'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .markAsSimple()
        .setFunctionName('isJumping');

      aut
        .addScopedCondition(
          'IsFalling',
          _('Is falling'),
          _(
            'Check if the object is falling.\nNote that the object can be flagged as jumping and falling at the same time: at the end of a jump, the fall speed becomes higher than the jump speed.'
          ),
          _('_PARAM0_ is falling'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('isFalling');

      aut
        .addScopedCondition(
          'ShouldBindObjectAndForwardAngle',
          _('Should bind object and forward angle'),
          _(
            'Check if the object angle and forward angle should be kept the same.'
          ),
          _('Keep _PARAM0_ angle and forward angle the same'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .getCodeExtraInformation()
        .setFunctionName('shouldBindObjectAndForwardAngle');

      aut
        .addScopedAction(
          'SetShouldBindObjectAndForwardAngle',
          _('Should bind object and forward angle'),
          _(
            'Enable or disable keeping the object angle and forward angle the same.'
          ),
          _('Should bind _PARAM0_ angle and forward angle: _PARAM2_'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .addParameter(
          'yesorno',
          _('Keep object angle and forward direction the same'),
          '',
          false
        )
        .setDefaultValue('false')
        .getCodeExtraInformation()
        .setFunctionName('setShouldBindObjectAndForwardAngle');

      aut
        .addScopedCondition(
          'IsForwardAngleAround',
          _('Forward angle'),
          _('Compare the angle used by the character to go forward.'),
          _('Forward angle of _PARAM0_ is _PARAM2_ ± _PARAM3_°'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .addParameter('expression', _('Angle (in degrees)'))
        .addParameter('expression', _('Tolerance (in degrees)'))
        .setFunctionName('isForwardAngleAround');

      aut
        .addScopedAction(
          'SetForwardAngle',
          _('Forward angle'),
          _('Change the angle used by the character to go forward.'),
          _('the forward angle'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angle (in degrees)')
          )
        )
        .setFunctionName('setForwardAngle')
        .setGetter('getForwardAngle');

      aut
        .addExpression(
          'ForwardAngle',
          _('Forward angle of the character'),
          _('Return the angle used by the character to go forward.'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('getForwardAngle');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'CurrentForwardSpeed',
          _('Current forward speed'),
          _(
            'the current forward speed of the object. The object moves backward with negative values and forward with positive ones'
          ),
          _('the current forward speed'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setCurrentForwardSpeed')
        .setGetter('getCurrentForwardSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'ForwardAcceleration',
          _('Forward acceleration'),
          _('the forward acceleration of an object'),
          _('the forward acceleration'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Acceleration (in pixels per second per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setForwardAcceleration')
        .setGetter('getForwardAcceleration');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'ForwardDeceleration',
          _('Forward deceleration'),
          _('the forward deceleration of an object'),
          _('the forward deceleration'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Deceleration (in pixels per second per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setForwardDeceleration')
        .setGetter('getForwardDeceleration');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'ForwardSpeedMax',
          _('Forward max speed'),
          _('the forward max speed of the object'),
          _('the forward max speed'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setForwardSpeedMax')
        .setGetter('getForwardSpeedMax');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'CurrentSidewaysSpeed',
          _('Current sideways speed'),
          _(
            'the current sideways speed of the object. The object moves to the left with negative values and to the right with positive ones'
          ),
          _('the current sideways speed'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setCurrentSidewaysSpeed')
        .setGetter('getCurrentSidewaysSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'SidewaysAcceleration',
          _('Sideways acceleration'),
          _('the sideways acceleration of an object'),
          _('the sideways acceleration'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Acceleration (in pixels per second per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setSidewaysAcceleration')
        .setGetter('getSidewaysAcceleration');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'SidewaysDeceleration',
          _('Sideways deceleration'),
          _('the sideways deceleration of an object'),
          _('the sideways deceleration'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Deceleration (in pixels per second per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setSidewaysDeceleration')
        .setGetter('getSidewaysDeceleration');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'SidewaysSpeedMax',
          _('Sideways max speed'),
          _('the sideways max speed of the object'),
          _('the sideways max speed'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setSidewaysSpeedMax')
        .setGetter('getSidewaysSpeedMax');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'CurrentFallSpeed',
          _('Current falling speed'),
          _(
            'the current falling speed of the object. Its value is always positive.'
          ),
          _('the current falling speed'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed to compare to (in pixels per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setCurrentFallSpeed')
        .setGetter('getCurrentFallSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'CurrentJumpSpeed',
          _('Current jump speed'),
          _(
            'the current jump speed of the object. Its value is always positive.'
          ),
          _('the current jump speed'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed to compare to (in pixels per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setCurrentJumpSpeed')
        .setGetter('getCurrentJumpSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'JumpSpeed',
          _('Jump speed'),
          _('the jump speed of an object. Its value is always positive'),
          _('the jump speed'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setJumpSpeed')
        .setGetter('getJumpSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'JumpSustainTime',
          _('Jump sustain time'),
          _(
            'the jump sustain time of an object. This is the time during which keeping the jump button held allow the initial jump speed to be maintained'
          ),
          _('the jump sustain time'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Duration (in seconds)')
          )
        )
        .setFunctionName('setJumpSustainTime')
        .setGetter('getJumpSustainTime');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'Gravity',
          _('Gravity'),
          _('the gravity applied on an object'),
          _('the gravity'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Gravity (in pixels per second per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setGravity')
        .setGetter('getGravity');

      aut
        .addExpressionAndCondition(
          'number',
          'FallingSpeedMax',
          _('Maximum falling speed'),
          _('the maximum falling speed of an object'),
          _('the maximum falling speed'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Max speed (in pixels per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('getMaxFallingSpeed');

      aut
        .addScopedAction(
          'FallingSpeedMax',
          _('Maximum falling speed'),
          _('Change the maximum falling speed of an object.'),
          _('the maximum falling speed'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Max speed (in pixels per second)')
          )
        )
        .addParameter(
          'yesorno',
          _('If jumping, try to preserve the current speed in the air')
        )
        .markAsAdvanced()
        .setFunctionName('setMaxFallingSpeed')
        .setGetter('getMaxFallingSpeed');
    }

    {
      const behavior = new gd.BehaviorJsImplementation();
      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'physics3D') {
          behaviorContent.getChild('physics3D').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'steerAngleMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('steerAngleMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'beginningSteerSpeed') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('beginningSteerSpeed')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'endSteerSpeed') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('endSteerSpeed')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'engineTorqueMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('engineTorqueMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'engineSpeedMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('engineSpeedMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'engineInertia') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('engineInertia')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'reverseGearRatio1') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('reverseGearRatio1')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio1') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio1')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio2') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio2')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio2') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio2')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio3') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio3')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio4') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio4')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio5') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio5')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio6') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio6')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'wheelRadius') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('wheelRadius')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'wheelWidth') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('wheelWidth')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'backWheelOffsetX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('backWheelOffsetX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'frontWheelOffsetX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('frontWheelOffsetX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'wheelOffsetY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('wheelOffsetY')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'wheelOffsetZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('wheelOffsetZ')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'brakeTorqueMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('brakeTorqueMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'handBrakeTorqueMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('handBrakeTorqueMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'hasBackWheelDrive') {
          behaviorContent
            .getChild('hasBackWheelDrive')
            .setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'hasFrontWheelDrive') {
          behaviorContent
            .getChild('hasFrontWheelDrive')
            .setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'pitchRollAngleMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('pitchRollAngleMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        return false;
      };
      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        behaviorProperties
          .getOrCreate('physics3D')
          .setValue(behaviorContent.getChild('physics3D').getStringValue())
          .setType('Behavior')
          .setLabel('3D physics')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addExtraInfo('Physics3D::Physics3DBehavior');

        behaviorProperties
          .getOrCreate('steerAngleMax')
          .setLabel(_('Max steer angle'))
          .setGroup(_('Steering'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
          .setValue(
            behaviorContent
              .getChild('steerAngleMax')
              .getDoubleValue()
              .toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('beginningSteerSpeed')
          .setLabel(_('Beginning steer speed'))
          .setGroup(_('Steering'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getAngularSpeed())
          .setValue(
            behaviorContent
              .getChild('beginningSteerSpeed')
              .getDoubleValue()
              .toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('endSteerSpeed')
          .setLabel(_('End steer speed'))
          .setGroup(_('Steering'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getAngularSpeed())
          .setValue(
            behaviorContent
              .getChild('endSteerSpeed')
              .getDoubleValue()
              .toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('engineTorqueMax')
          .setLabel(_('Max engine torque'))
          .setGroup(_('Speed'))
          .setType('Number')
          .setDescription(
            _('Allow cars to climb steep slopes and push heavy obstacles.')
          )
          .setValue(
            behaviorContent
              .getChild('engineTorqueMax')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('engineSpeedMax')
          .setLabel(_('Max engine speed'))
          .setGroup(_('Speed'))
          .setType('Number')
          .setValue(
            behaviorContent
              .getChild('engineSpeedMax')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('engineInertia')
          .setLabel(_('Engine inertia'))
          .setGroup(_('Speed'))
          .setType('Number')
          .setDescription(_('Slow down car acceleration.'))
          .setValue(
            behaviorContent
              .getChild('engineInertia')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('reverseGearRatio1')
          .setLabel(_('Reverse gear ratio'))
          .setGroup(_('Speed'))
          .setType('Number')
          .setValue(
            behaviorContent
              .getChild('reverseGearRatio1')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio1')
          .setLabel(_('1st gear ratio'))
          .setGroup(_('Speed'))
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio1').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio2')
          .setLabel(_('2nd gear ratio'))
          .setGroup(_('Speed'))
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio2').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio3')
          .setLabel(_('3rd gear ratio'))
          .setGroup(_('Speed'))
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio3').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio4')
          .setLabel(_('4th gear ratio'))
          .setGroup(_('Speed'))
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio4').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio5')
          .setLabel(_('5th gear ratio'))
          .setGroup(_('Speed'))
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio5').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio6')
          .setLabel(_('6th gear ratio'))
          .setGroup(_('Speed'))
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio6').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('wheelRadius')
          .setLabel(_('Wheel radius'))
          .setGroup(_('Wheels'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent
              .getChild('wheelRadius')
              .getDoubleValue()
              .toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('wheelWidth')
          .setLabel(_('Wheel width'))
          .setGroup(_('Wheels'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent.getChild('wheelWidth').getDoubleValue().toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('backWheelOffsetX')
          .setLabel(_('Back wheel offset X'))
          .setGroup(_('Wheels'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setDescription(_('Positive values move wheels outside.'))
          .setValue(
            behaviorContent
              .getChild('backWheelOffsetX')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('frontWheelOffsetX')
          .setLabel(_('Front wheel offset X'))
          .setGroup(_('Wheels'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setDescription(_('Positive values move wheels outside.'))
          .setValue(
            behaviorContent
              .getChild('frontWheelOffsetX')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('wheelOffsetY')
          .setLabel(_('Wheel offset Y'))
          .setGroup(_('Wheels'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setDescription(_('Positive values move wheels outside.'))
          .setValue(
            behaviorContent
              .getChild('wheelOffsetY')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('wheelOffsetZ')
          .setLabel(_('Wheel offset Z'))
          .setGroup(_('Wheels'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setDescription(_('Positive values move wheels outside.'))
          .setValue(
            behaviorContent
              .getChild('wheelOffsetZ')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('brakeTorqueMax')
          .setLabel(_('Brake max torque'))
          .setGroup(_('Brakes'))
          .setType('Number')
          .setValue(
            behaviorContent
              .getChild('brakeTorqueMax')
              .getDoubleValue()
              .toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('handBrakeTorqueMax')
          .setLabel(_('Hand brake max torque'))
          .setGroup(_('Brakes'))
          .setType('Number')
          .setValue(
            behaviorContent
              .getChild('handBrakeTorqueMax')
              .getDoubleValue()
              .toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('hasBackWheelDrive')
          .setValue(
            behaviorContent.getChild('hasBackWheelDrive').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setType('Boolean')
          .setLabel(_('Back wheel drive'))
          .setGroup(_('Wheels'))
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('hasFrontWheelDrive')
          .setValue(
            behaviorContent.getChild('hasFrontWheelDrive').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setType('Boolean')
          .setLabel(_('Front wheel drive'))
          .setGroup(_('Wheels'))
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('pitchRollAngleMax')
          .setLabel(_('Pitch and roll max angle'))
          .setGroup('')
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
          .setValue(
            behaviorContent
              .getChild('pitchRollAngleMax')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('physics3D').setStringValue('');
        behaviorContent.addChild('steerAngleMax').setDoubleValue(70);
        behaviorContent.addChild('beginningSteerSpeed').setDoubleValue(140);
        behaviorContent.addChild('endSteerSpeed').setDoubleValue(10);
        behaviorContent.addChild('engineTorqueMax').setDoubleValue(4500);
        behaviorContent.addChild('engineSpeedMax').setDoubleValue(6000);
        behaviorContent.addChild('engineInertia').setDoubleValue(0.5);
        behaviorContent.addChild('reverseGearRatio1').setDoubleValue(-2.9);
        behaviorContent.addChild('gearRatio1').setDoubleValue(2.66);
        behaviorContent.addChild('gearRatio2').setDoubleValue(1.78);
        behaviorContent.addChild('gearRatio3').setDoubleValue(1.3);
        behaviorContent.addChild('gearRatio4').setDoubleValue(1);
        behaviorContent.addChild('gearRatio5').setDoubleValue(0.74);
        behaviorContent.addChild('gearRatio6').setDoubleValue(0);
        behaviorContent.addChild('backWheelOffsetX').setDoubleValue(0);
        behaviorContent.addChild('frontWheelOffsetX').setDoubleValue(0);
        behaviorContent.addChild('wheelOffsetY').setDoubleValue(0);
        behaviorContent.addChild('wheelOffsetZ').setDoubleValue(0);
        behaviorContent.addChild('wheelRadius').setDoubleValue(10);
        behaviorContent.addChild('wheelWidth').setDoubleValue(5);
        behaviorContent.addChild('brakeTorqueMax').setDoubleValue(1500);
        behaviorContent.addChild('handBrakeTorqueMax').setDoubleValue(4000);
        behaviorContent.addChild('hasBackWheelDrive').setBoolValue(false);
        behaviorContent.addChild('hasFrontWheelDrive').setBoolValue(true);
        behaviorContent.addChild('pitchRollAngleMax').setDoubleValue(90);
      };
      const aut = extension
        .addBehavior(
          'PhysicsCar3D',
          _('3D physics car'),
          'PhysicsCar3D',
          _(
            "Simulate a realistic car using the 3D physics engine. This is mostly useful for the car controlled by the player (it's usually too complex for other cars in a game).\n" +
              '\n' +
              'This behavior is usually used with one or more "mapper" behavior to let the player move it.'
          ),
          '',
          'JsPlatform/Extensions/physics_car3d.svg',
          'PhysicsCar3D',
          //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
          behavior,
          new gd.BehaviorsSharedData()
        )
        .addIncludeFile(
          'Extensions/Physics3DBehavior/PhysicsCar3DRuntimeBehavior.js'
        );

      aut
        .addScopedAction(
          'SimulateForwardKey',
          _('Simulate move forward key press'),
          _('Simulate a press of the move forward key.'),
          _('Simulate pressing Forward key for _PARAM0_'),
          _('Car controls'),
          'JsPlatform/Extensions/physics_car3d.svg',
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .setFunctionName('simulateForwardKey');

      aut
        .addScopedAction(
          'SimulateBackwardKey',
          _('Simulate move backward key press'),
          _('Simulate a press of the move backward key.'),
          _('Simulate pressing Backward key for _PARAM0_'),
          _('Car controls'),
          'JsPlatform/Extensions/physics_car3d.svg',
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .setFunctionName('simulateBackwardKey');

      aut
        .addScopedAction(
          'SimulateRightKey',
          _('Simulate move right key press'),
          _('Simulate a press of the move right key.'),
          _('Simulate pressing Right key for _PARAM0_'),
          _('Car controls'),
          'JsPlatform/Extensions/physics_car3d.svg',
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .setFunctionName('simulateRightKey');

      aut
        .addScopedAction(
          'SimulateLeftKey',
          _('Simulate move left key press'),
          _('Simulate a press of the move left key.'),
          _('Simulate pressing Left key for _PARAM0_'),
          _('Car controls'),
          'JsPlatform/Extensions/physics_car3d.svg',
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .setFunctionName('simulateLeftKey');

      aut
        .addScopedAction(
          'SimulateHandBrakeKey',
          _('Simulate hand brake key press'),
          _('Simulate a press of the hand brake key.'),
          _('Simulate pressing hand brake key for _PARAM0_'),
          _('Car controls'),
          'JsPlatform/Extensions/physics_car3d.svg',
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .setFunctionName('simulateHandBrakeKey');

      aut
        .addScopedAction(
          'SimulateAcceleratorStick',
          _('Simulate accelerator stick control'),
          _('Simulate an accelerator stick control.'),
          _(
            'Simulate an accelerator stick control for _PARAM0_ with a _PARAM2_ force'
          ),
          _('Car controls'),
          'JsPlatform/Extensions/physics_car3d.svg',
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .addParameter('expression', _('Stick force (between -1 and 1)'))
        .markAsAdvanced()
        .setFunctionName('simulateAcceleratorStick');

      aut
        .addScopedAction(
          'SimulateSteeringStick',
          _('Simulate steering stick control'),
          _('Simulate a steering stick control.'),
          _(
            'Simulate a steering stick control for _PARAM0_ with a _PARAM2_ force'
          ),
          _('Car controls'),
          'JsPlatform/Extensions/physics_car3d.svg',
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .addParameter('expression', _('Stick force (between -1 and 1)'))
        .markAsAdvanced()
        .setFunctionName('simulateSteeringStick');

      aut
        .addExpressionAndCondition(
          'number',
          'SteerAngle',
          _('Steer angle'),
          _(
            'the current steer angle (in degree). The value is negative when cars turn left'
          ),
          _('the steer angle'),
          _('Car state'),
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Steer angle (in degree)')
          )
        )
        .setFunctionName('getSteerAngle');

      aut
        .addExpressionAndCondition(
          'number',
          'EngineSpeed',
          _('Engine speed'),
          _('the current engine speed (RPM)'),
          _('the engine speed'),
          _('Car state'),
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Engine speed (RPM)')
          )
        )
        .setFunctionName('getEngineSpeed');

      aut
        .addExpressionAndCondition(
          'number',
          'CurrentGear',
          _('Current gear'),
          _('the current gear (-1 = reverse, 0 = neutral, 1 = 1st gear)'),
          _('the current gear'),
          _('Car state'),
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(_('Current gear'))
        )
        .setFunctionName('getCurrentGear');

      aut
        .addScopedCondition(
          'IsOnFloor',
          _('Is on floor'),
          _('Check if any wheel is in contact with the ground.'),
          _('_PARAM0_ is on floor'),
          _('Car state'),
          'JsPlatform/Extensions/physics_car3d.svg',
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .markAsSimple()
        .setFunctionName('isOnFloor');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'EngineTorqueMax',
          _('Engine max torque'),
          _(
            'the engine max torque (N·m). It allows cars to climb steep slopes and push heavy obstacles'
          ),
          _('the engine max torque'),
          _('Car configuration'),
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Engine max torque (N·m)')
          )
        )
        .setFunctionName('setEngineTorqueMax')
        .setGetter('getEngineTorqueMax');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'EngineSpeedMax',
          _('Engine max speed'),
          _('the engine max speed (RPM)'),
          _('the engine max speed'),
          _('Car configuration'),
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Engine max speed (RPM)')
          )
        )
        .setFunctionName('setEngineSpeedMax')
        .setGetter('getEngineSpeedMax');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'EngineInertia',
          _('Engine inertia'),
          _('the engine inertia (kg·m²). It slows down car acceleration'),
          _('the engine inertia'),
          _('Car configuration'),
          'JsPlatform/Extensions/physics_car3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCar3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Engine inertia (kg·m²)')
          )
        )
        .setFunctionName('setEngineInertia')
        .setGetter('getEngineInertia');
    }

    extension
      .addCondition(
        'IsObjectOnGivenFloor',
        _('Character is on given platform'),
        _('Check if a 3D physics character is on a given platform.'),
        _('_PARAM0_ is on platform _PARAM2_'),
        _('Collision'),
        'JsPlatform/Extensions/physics_car3d.svg',
        'JsPlatform/Extensions/physics_car3d.svg'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
      .addParameter('objectList', _('Platforms'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .setFunctionName('gdjs.physics3d.isOnPlatform')
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js');

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    const dummyBehavior = extension
      .getBehaviorMetadata('Physics3D::Physics3DBehavior')
      .get();
    const sharedData = extension
      .getBehaviorMetadata('Physics3D::Physics3DBehavior')
      .getSharedDataInstance();
    return [
      gd.ProjectHelper.sanityCheckBehaviorProperty(
        dummyBehavior,
        'density',
        '123'
      ),
      gd.ProjectHelper.sanityCheckBehaviorsSharedDataProperty(
        sharedData,
        'gravityY',
        '456'
      ),
    ];
  },
};
