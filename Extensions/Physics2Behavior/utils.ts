namespace gdjs {
  export namespace physics2 {
    export const computeCurrentContactsFromStartedAndEndedContacts = <T>(
      current: Array<T>,
      started: Array<T>,
      ended: Array<T>
    ): Array<T> => {
      started.forEach((startedItem) => {
        const isAlsoEndedIndex = ended.indexOf(startedItem);
        if (isAlsoEndedIndex !== -1) {
          ended.splice(isAlsoEndedIndex, 1);
        } else {
          current.push(startedItem);
        }
      });
      ended.forEach((endedItem) => {
        const index = current.indexOf(endedItem);
        if (index !== -1) {
          current.splice(index, 1);
        }
      });
      return current;
    };
  }
}
