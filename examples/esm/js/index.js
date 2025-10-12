import {Wheel} from '../../../dist/spin-wheel-esm.js';

window.onload = () => {

  const props = {
    items: [
      {
        label: 'one',
      },
      {
        label: 'two',
      },
      {
        label: 'three',
      },
    ],
    onRest: (event) => {
      const winner = event.currentIndex;
      alert('Winner is: ' + props.items[winner].label);
    },
  };

  const container = document.querySelector('.wheel-wrapper');

  window.wheel = new Wheel(container, props);

  const wheelContainer = document.querySelector('.wheel-container');
  if (wheelContainer) {
    const handleCount = 8;
    const handleRadius = 150; // Sesuaikan dengan ukuran roda
    for (let i = 0; i < handleCount; i++) {
      const angle = (i / handleCount) * 360;
      const handle = document.createElement('div');
      handle.className = 'wheel-handle';
      handle.style.transform = `rotate(${angle}deg) translate(0, -${handleRadius}px)`;
      wheelContainer.appendChild(handle);
    }
  }
};