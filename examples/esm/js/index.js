import {Wheel} from '../../../dist/spin-wheel-esm.js';

window.onload = () => {

  const props = {
    overlayImage: './img/anchor.svg',
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

  // Handle wheel click
  window.wheel.canvas.addEventListener('click', () => {
    if (!window.wheel.isSpinning) {
      window.wheel.spin(500);
    }
  });
};