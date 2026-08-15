/**
 * Material-style image viewer via GLightbox.
 */

const IMG_CLASS = 'popup';

export function imgPopup() {
  if (document.getElementsByClassName(IMG_CLASS).length === 0) {
    return;
  }

  GLightbox({
    selector: `.${IMG_CLASS}`,
    touchNavigation: true,
    loop: false,
    closeOnOutsideClick: true,
    openEffect: 'fade',
    closeEffect: 'fade',
    skin: 'clean'
  });
}
