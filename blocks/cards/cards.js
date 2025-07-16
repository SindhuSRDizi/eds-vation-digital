import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  // Detect if this section uses black background theme
  const isDark = block?.classList.contains('black-bg');
  console.log(isDark);

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });

    ul.append(li);
  });

  // Optimize images
  ul.querySelectorAll('picture > img').forEach((img) =>
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    )
  );

  // Wrap images with link
  ul.querySelectorAll('.cards-card-body .button-container a').forEach((a, index) => {
    const picture = ul.querySelectorAll('picture')[index];
    if (picture) {
      const link = a.cloneNode(true);
      link.textContent = '';
      picture.parentNode.insertBefore(link, picture);
      link.appendChild(picture);
    }
  });

  // Add class to 2nd paragraph
  ul.querySelectorAll('.cards-card-body').forEach((container) => {
    const paragraphs = container.querySelectorAll('p');
    if (paragraphs.length >= 2) {
      paragraphs[1].classList.add('card-paragraph');
    }
  });

  // Apply theme class to UL
  if (isDark) {
    ul.classList.add('cards-dark-theme');
  } else {
    ul.classList.add('cards-light-theme');
  }

  block.textContent = '';
  block.append(ul);
}
