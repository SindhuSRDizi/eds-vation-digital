import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    // Create a wrapper div inside li
    const wrapper = document.createElement('div');
    wrapper.className = 'insight-card-wrapper';

    while (row.firstElementChild) {
      const child = row.firstElementChild;
      if (child.children.length === 1 && child.querySelector('picture')) {
        child.className = 'insight-card-image';
      } else {
        child.className = 'insight-card-body';
      }
      wrapper.appendChild(child);
    }

    li.appendChild(wrapper);
    ul.appendChild(li);
  });

  // Optimize all images
  ul.querySelectorAll('picture > img').forEach((img) =>
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]))
  );

  // Add classes to <a> tags based on their title attribute
  ul.querySelectorAll('p > a').forEach((aTag) => {
    const title = aTag.getAttribute('title');
    if (title) {
      const className = `${title.toLowerCase().replace(/\s+/g, '-')}-link`;
      aTag.classList.add(className);
    }
  });

  block.textContent = '';
  block.appendChild(ul);
}
