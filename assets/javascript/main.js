if (document.readyState !== 'loading') {
	toggleMobileMenu();
	// // Call fetchFaqPosts function to load posts and display them
	fetchFaqPosts();
} else {
	document.addEventListener('DOMContentLoaded', (event) => {
		toggleMobileMenu();
		// Call fetchFaqPosts function to load posts and display them
		fetchFaqPosts();
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


function fetchFaqPosts() {
	// Display the loading message
	const loadingDiv = document.getElementById('loading');

	fetch('https://jsonplaceholder.typicode.com/posts')
	.then(response => response.json()) // Parse the JSON response
	.then(data => {
		// Hide the loading message
		loadingDiv.style.display = 'none';

		// Get the posts container
		const postsContainer = document.getElementById('accordionGroup');

		if (data.length === 0) {
			const noFaqContainer = document.getElementById('no-faqs');
			noFaqContainer.style.display = 'block';
		} else {
			const postsToDisplay = data.slice(0, 5);
			// Iterate over each post and append it to the container
			postsToDisplay.forEach((post, index) => {

				// Create title and body paragraphs
				const accordionHeader = document.createElement('h3');

				const accordionTrigger = document.createElement('button');
				accordionTrigger.id = `accordion-trigger-${index}`;
				accordionTrigger.className = index === 0 ? 'accordion-trigger active' : 'accordion-trigger';
				accordionTrigger.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
				accordionTrigger.setAttribute('aria-controls', `accordion-panel-${index}`);

				const accordionIcon = document.createElement('span');
				accordionIcon.className = 'accordion-icon';

				const accordionTitle = document.createElement('span');
				accordionTitle.className = 'accordion-title';
				accordionTitle.textContent = post.title;

				const accordionPanel = document.createElement('div');
				accordionPanel.id = `accordion-panel-${index}`;
				accordionPanel.className = 'accordion-panel';
				accordionPanel.textContent = post.body;
				accordionPanel.setAttribute('role', 'region');
				accordionPanel.setAttribute('aria-labelledby', `accordion-trigger-${index}`);
				accordionPanel.hidden = index !== 0; // Only the first body is not hidden by default

				// Append title and body to post element
				accordionTrigger.appendChild(accordionIcon);
				accordionTrigger.appendChild(accordionTitle);
				accordionHeader.appendChild(accordionTrigger);
				postsContainer.appendChild(accordionHeader);
				postsContainer.appendChild(accordionPanel);


				// Attach click event to each title
				accordionHeader.addEventListener('click', () => toggleaccordion(index));
			});
		}
	})
	.catch(error => {
		console.error('Error fetching posts:', error);
		// Hide the loading message and possibly show an error message
		loadingDiv.style.display = 'none';
		loadingDiv.textContent = 'Failed to load posts.';
	});

	function toggleaccordion(index) {
		const allaccordionPanels = document.querySelectorAll('.accordion-panel');
		const allaccordionTriggers = document.querySelectorAll('.accordion-trigger');

		allaccordionPanels.forEach((panel, idx) => {
			const isSelected = idx === index;
			panel.hidden = !isSelected;
			allaccordionTriggers[idx].setAttribute('aria-expanded', isSelected);
			allaccordionTriggers[idx].className = isSelected ? 'accordion-trigger active' : 'accordion-trigger';
		});
	}
}
