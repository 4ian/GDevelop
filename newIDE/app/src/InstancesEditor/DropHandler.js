export default class SelectionRectangle {
  constructor({ canvas, onDrop }) {
    canvas.ondragover = canvas.ondrop = ev => {
      ev.dataTransfer.dropEffect = 'copy';
      ev.preventDefault();
    };

    canvas.ondrop = ev => {
      const canvasRect = canvas.getBoundingClientRect();
      const name = ev.dataTransfer.getData('text');
      if (name)
        onDrop(ev.clientX - canvasRect.left, ev.clientY - canvasRect.top, name);

      ev.preventDefault();
    };
  }
}
