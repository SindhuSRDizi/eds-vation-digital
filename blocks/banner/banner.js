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

    // Wrap in a container
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'single-image-container';
    imageWrapper.append(optimizedPicture);

    // Replace the original block content with optimized image
    block.textContent = '';
    block.append(imageWrapper);
  }
}
