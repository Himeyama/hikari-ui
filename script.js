document.querySelector('.dismiss').addEventListener('click', event => event.currentTarget.closest('.notice').remove());
const links = [...document.querySelectorAll('.nav-link')];
const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => { for (const entry of entries) { if (entry.isIntersecting) { links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id)); } } }, { rootMargin: '-15% 0px -70% 0px' });
  sections.forEach(section => observer.observe(section));
}

const colorChoices = [...document.querySelectorAll('.color-choice')];
function selectAccent(color) {
  if (!colorChoices.some(choice => choice.dataset.color === color)) return;
  document.documentElement.style.setProperty('--accent', color);
  const channels = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  document.documentElement.style.setProperty('--accent-foreground', luminance > 0.179 ? '#000' : '#fff');
  colorChoices.forEach(choice => choice.setAttribute('aria-pressed', String(choice.dataset.color === color)));
  try { localStorage.setItem('hikari-accent', color); } catch { }
}
colorChoices.forEach(choice => choice.addEventListener('click', () => selectAccent(choice.dataset.color)));
try { selectAccent(localStorage.getItem('hikari-accent') || '#0078d4'); } catch { selectAccent('#0078d4'); }

const rangeInput = document.querySelector('#range-input');
rangeInput.addEventListener('input', () => document.querySelector('#range-value').value = rangeInput.value);
const tabs = [...document.querySelectorAll('[role=tab]')];
function activateTab(tab) { tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; document.getElementById(item.getAttribute('aria-controls')).hidden = !selected; }); }
tabs.forEach((tab, index) => { tab.addEventListener('click', () => activateTab(tab)); tab.addEventListener('keydown', event => { let next; if (event.key === 'ArrowRight') next = (index + 1) % tabs.length; else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = tabs.length - 1; else return; event.preventDefault(); tabs[next].focus(); activateTab(tabs[next]); }); });
document.querySelectorAll('.page-button').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.page-button').forEach(item => item.removeAttribute('aria-current')); button.setAttribute('aria-current', 'page'); }));
document.querySelector('#open-dialog').addEventListener('click', () => document.querySelector('#example-dialog').showModal());
let toastTimer; document.querySelector('#show-toast').addEventListener('click', () => { const toast = document.querySelector('#toast'); toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 4000); });

// Drag horizontally overflowing navigation with a mouse.
const menu = document.querySelector('.sidebar nav');
let menuDrag = null;
let suppressMenuClick = false;
menu.addEventListener('dragstart', event => event.preventDefault());
menu.addEventListener('click', event => { if (suppressMenuClick) { event.preventDefault(); event.stopPropagation(); suppressMenuClick = false; } }, true);
menu.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0 || menu.scrollWidth <= menu.clientWidth) return;
  menuDrag = { x: event.clientX, left: menu.scrollLeft, moved: false };
});
window.addEventListener('pointermove', event => {
  if (!menuDrag) return;
  const distance = event.clientX - menuDrag.x;
  if (Math.abs(distance) > 4) menuDrag.moved = true;
  if (menuDrag.moved) { menu.scrollLeft = menuDrag.left - distance; event.preventDefault(); }
});
window.addEventListener('pointerup', () => {
  if (!menuDrag) return;
  if (menuDrag.moved) { suppressMenuClick = true; setTimeout(() => { suppressMenuClick = false; }, 0); }
  menuDrag = null;
});

const sidebarResizer = document.querySelector('.sidebar-resizer');
const shell = document.querySelector('.app-shell');
function setSidebarWidth(width) {
  const value = Math.round(Math.max(160, Math.min(400, width)));
  document.documentElement.style.setProperty('--sidebar-width', value + 'px');
  sidebarResizer.setAttribute('aria-valuenow', String(value));
  return value;
}
try { const savedWidth = Number(localStorage.getItem('hikari-sidebar-width')); if (savedWidth) setSidebarWidth(savedWidth); } catch { }
sidebarResizer.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  event.preventDefault();
  sidebarResizer.setPointerCapture(event.pointerId);
  sidebarResizer.classList.add('is-resizing'); shell.classList.add('is-resizing');
});
sidebarResizer.addEventListener('pointermove', event => { if (sidebarResizer.hasPointerCapture(event.pointerId)) setSidebarWidth(event.clientX); });
function finishResize(event) {
  if (!sidebarResizer.hasPointerCapture(event.pointerId)) return;
  sidebarResizer.releasePointerCapture(event.pointerId);
  sidebarResizer.classList.remove('is-resizing'); shell.classList.remove('is-resizing');
  try { localStorage.setItem('hikari-sidebar-width', sidebarResizer.getAttribute('aria-valuenow')); } catch { }
}
sidebarResizer.addEventListener('pointerup', finishResize);
sidebarResizer.addEventListener('pointercancel', finishResize);
sidebarResizer.addEventListener('keydown', event => {
  let width = Number(sidebarResizer.getAttribute('aria-valuenow'));
  if (event.key === 'ArrowLeft') width -= 8; else if (event.key === 'ArrowRight') width += 8; else if (event.key === 'Home') width = 160; else if (event.key === 'End') width = 400; else return;
  event.preventDefault(); setSidebarWidth(width);
  try { localStorage.setItem('hikari-sidebar-width', String(width)); } catch { }
});
