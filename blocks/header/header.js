import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { createElement } from '../../utils/helpers.js'; // Assuming createElement is defined in the helper.js

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');

  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');

  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // Handle nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');

  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // Enable or disable event listeners based on the state
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // Decorate nav DOM
  block.textContent = '';
  const nav = createElement('nav', { attributes: { id: 'nav' } });

  while (fragment.firstElementChild) {
    nav.append(fragment.firstElementChild);
  }

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });
  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  const brandImage = createElement('img', {
    attributes: {
      src: `${window.hlx.codeBasePath}/img/vation-logo.svg`,
      alt: 'Brand Logo',
    },
  });

  const brandLogoLink = createElement('a', { attributes: { href: '/us/en' } });
  brandLogoLink.appendChild(brandImage);
  navBrand.prepend(brandLogoLink);

  const navSections = nav.querySelector('.nav-sections');
  if (brandLink) {
    brandLogoLink.appendChild(brandImage);
    navBrand.prepend(brandLogoLink);
  }

  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          }
        });
      }
    });
  }

  // Create and add hamburger for mobile view
  const hamburger = createElement('div', {
    classList: ['nav-hamburger'],
    html: `<button type='button' aria-controls='nav' aria-label='Open navigation'>
      <span class='nav-hamburger-icon'></span>
    </button>`,
  });

  // Toggle menu on hamburger click
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));

  // Append the hamburger only if in mobile view
  nav.prepend(hamburger);

  nav.setAttribute('aria-expanded', 'false');

  // Ensure elements exist before initializing the menu state
  if (nav && navSections) {
    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));
  }

  // Append nav elements to the block
  const navWrapper = createElement('div', { classList: ['nav-wrapper'] });
  const navContainer = createElement('div', { classList: ['nav-container'] });
  navContainer.append(nav);
  navWrapper.append(navContainer);
  block.append(navWrapper);

  // Handle scroll behavior
  // const header = document.querySelector('body');
  // const headerNav = document.querySelector('nav');
  // const headerHeight = headerNav?.offsetHeight || 0;

  // window.addEventListener('scroll', () => {
  //   const scrollpos = window.scrollY;
  //   if (scrollpos >= headerHeight) {
  //     header.classList.add('scroll');
  //   } else {
  //     header.classList.remove('scroll');
  //   }
  // });
}
