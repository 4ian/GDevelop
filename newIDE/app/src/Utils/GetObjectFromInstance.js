export default function getObjectFromInstance(instance, layout, project) {
  var associatedObjectName = instance.getObjectName();
  var associatedObject = null;
  if (layout.hasObjectNamed(associatedObjectName))
    associatedObject = layout.getObject(associatedObjectName);
  else if (project.hasObjectNamed(associatedObjectName))
    associatedObject = project.getObject(associatedObjectName);
  return associatedObject;
}
