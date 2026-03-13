/**
 * Moty Landing Page Scripts
 * Handles the Intersection Observer for smooth scroll animations.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Select all elements with the 'fade-in' class
    const fadeElements = document.querySelectorAll('.fade-in');

    // Create an intersection observer
    const observerOptions = {
        root: null, // Viewport
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the item is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the visible class to trigger the CSS transition
                entry.target.classList.add('visible');
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Attach observer to each element
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // Optional: Add a subtle navbar blur effect on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(7, 8, 10, 0.85)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(7, 8, 10, 0.7)';
            navbar.style.boxShadow = 'none';
        }
    });
});
