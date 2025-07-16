import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  // Find the first picture element in the block
  const picture = block.querySelector('picture');

  if (picture) {
    const img = picture.querySelector('img');

    // Create optimized picture
    const optimizedPicture = createOptimizedPicture(
      img.src,
      img.alt || '',
      false,
      [{ width: '750' }]
    );

    // Create wrapper div
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'discover-more-image-container';

    // Create the button
    const button = document.createElement('button');
    button.className = 'image-overlay-button';
    button.textContent = 'Discover More'; // You can customize this

    // Append image and button
    imageWrapper.append(optimizedPicture, button);

    // Clear and append to block
    block.textContent = '';
    block.append(imageWrapper);
  }
}
