import domReady from '@wordpress/dom-ready';
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';

domReady(() => {
    const myGallery = GLightbox({
        selector: '.wp-ptgm-item',
        descPosition: 'right'
    });
});
