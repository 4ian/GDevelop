namespace gdjs {
  const logger = new gdjs.Logger('Choose extension');

  export namespace evtTools {
    /**
     * This is an example of some functions that can be used through events.
     * They could live on any object but it's usual to store them in an object
     * with the extension name in `gdjs.evtTools`.
     *
     * Functions are being passed the arguments that were declared in the extension.
     */
	export namespace choose {
	
		export const randomNumber = function (text) {
			/** @type {string[]} */
			const choices = text.split(',');
			const number = parseFloat(choices[Math.floor(Math.random() * choices.length)]);
			return Math.floor(number);

		};
		
		export const randomString = function (text) {
			/** @type {string[]} */
			const choices = text.split(',');
			return choices[Math.floor(Math.random() * choices.length)];
		};
    }
  }
}
