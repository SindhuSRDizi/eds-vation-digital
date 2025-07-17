export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // Add black-bg or white-bg to the block based on its class
  if (block?.classList.contains('black-column-bg')) {
    block.classList.add('black-column-bg');
  } else {
    block.classList.add('white-column-bg');
  }

  // Setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
