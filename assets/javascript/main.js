if (document.readyState !== 'loading') {
	toggleMobileMenu();
} else {
	document.addEventListener('DOMContentLoaded', (event) => {
		toggleMobileMenu();
	});
}

function toggleMobileMenu() {
	const menuToggle = document.querySelector('.header__menu-toggle');
	const nav = document.querySelector('.header__nav');

	menuToggle.addEventListener('click', function() {
		const expanded = this.getAttribute('aria-expanded') === 'true' || false;
		this.setAttribute('aria-expanded', !expanded);
		nav.classList.toggle('header__nav--active');
	});
}
