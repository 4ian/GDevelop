import flatten from 'lodash/flatten';
import { mapFor } from '../Utils/MapFor';
const gd = global.gd;

export const enumerateEventsMetadata = () => {
  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();

  return flatten(
    mapFor(0, allExtensions.size(), i => {
      const extension = allExtensions.get(i);
      const extensionEvents = extension.getAllEvents();

      return extensionEvents
        .keys()
        .toJSArray()
        .map(type => {
          const metadata = extensionEvents.get(type);
          return {
            type,
            fullName: metadata.getFullName(),
            description: metadata.getDescription(),
          };
        });
    })
  );
};
