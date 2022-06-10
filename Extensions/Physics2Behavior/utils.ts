namespace gdjs {
  export namespace physics2 {
    export const computeCurrentContactsFromStartedAndEndedContacts = <T>(
      current: Array<T>,
      started: Array<T>,
      ended: Array<T>
    ): void => {
      const endedDuplicate = [...ended]
      started.forEach((startedItem) => {
        const isAlsoEndedIndex = endedDuplicate.indexOf(startedItem);
        if (isAlsoEndedIndex !== -1) {
          endedDuplicate.splice(isAlsoEndedIndex, 1);
        } else {
          current.push(startedItem);
        }
      });
      endedDuplicate.forEach((endedItem) => {
        const index = current.indexOf(endedItem);
        if (index !== -1) {
          current.splice(index, 1);
        }
      });
    };
  }
}
