namespace gdjs {
  export namespace physics2 {
    export const computeCurrentContactsFromStartedAndEndedContacts = <T>(
      current: Array<T>,
      started: Array<T>,
      ended: Array<T>
    ): void => {
      started.forEach((startedItem) => {
        current.push(startedItem);
      });
      ended.forEach((endedItem) => {
        const index = current.indexOf(endedItem);
        if (index !== -1) {
          current.splice(index, 1);
        }
      });
    };
  }
}
