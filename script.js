/**
 * @file script.js
 * @description This file contains the main JavaScript logic for the interactive portfolio website.
 * It manages UI interactions, animations, data fetching, and theme switching.
 */

// Modern Portfolio JavaScript
class Portfolio {
  /**
   * Initializes the Portfolio application.
   * The constructor immediately calls the init method to set up all functionalities.
   */
  constructor() {
    this.init();
  }

  /**
   * Sets up all the core functionalities of the portfolio site.
   * This includes event listeners, observers, theme toggle, navigation, animations, and data fetching.
   */
  init() {
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.setupThemeToggle();
    this.setupNavigation();
    this.setupAnimations();
    this.setupSkillBars();
    this.setupSkillsFilter();
    this.setupProjectsFilter();
    this.setupContactForm();
    this.loadProjects(); // This will also call setupGitHubStats internally
    this.setupCounters();
    this.setupTextRotation();
    this.setupScrollToTop();
  }

  /**
   * Sets up all global and navigation-related event listeners.
   * This includes scroll, resize, load events for the window, and click events for navigation.
   */
  setupEventListeners() {
    // Event listeners for window events to handle dynamic UI updates and initializations.
    window.addEventListener('scroll', this.handleScroll.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('load', this.handleLoad.bind(this));

    // Event listener for clicks on the document, primarily used for navigation links.
    document.addEventListener('click', this.handleNavClick.bind(this));
  }

  /**
   * Configures an Intersection Observer to trigger animations and other effects
   * when elements enter the viewport.
   */

  /**
   * Optimized intersection observer setup with better performance
   */
  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Trigger specific animations based on section
          if (entry.target.classList.contains('skills')) {
            this.animateSkillBars();
          }
          
          if (entry.target.classList.contains('hero')) {
            this.animateCounters();
          }
          
          // Unobserve after animation to improve performance
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe sections and cards
    document.querySelectorAll('section, .skill-card, .project-card, .highlight-item').forEach(el => {
      el.classList.add('fade-in');
      this.observer.observe(el);
    });
  }

  /**
   * Sets up the functionality for the theme toggle button.
   * It reads the current theme from local storage, applies it, and updates the UI when the button is clicked.
   */
  setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    this.updateThemeIcon(currentTheme);

    themeToggle?.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      this.updateThemeIcon(newTheme);
    });
  }

  /**
   * Updates the icon of the theme toggle button based on the current theme.
   * @param {string} theme - The current theme ('light' or 'dark').
   */
  updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle?.querySelector('i');
    
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  /**
   * Initializes the main navigation functionality, including mobile menu toggle and active link highlighting.
   * It handles click events for the toggle button and navigation links, and provides keyboard accessibility.
   */
  setupNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Event listener for the mobile navigation toggle button.
    navToggle?.addEventListener('click', () => {
      const isActive = navToggle.classList.contains('active');
      navToggle.classList.toggle('active');
      navMenu?.classList.toggle('active');
      
      // Update ARIA attributes to reflect the current state of the navigation menu for accessibility.
      navToggle.setAttribute('aria-expanded', !isActive);
      
      // Manages focus to the first navigation link when the menu is opened, improving keyboard navigation.
      if (!isActive) {
        navMenu?.querySelector('.nav-link')?.focus();
      }
    });

    // Adds keyboard support (Enter/Space) for activating the navigation toggle button.
    navToggle?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navToggle.click();
      }
    });

    // Closes the mobile navigation menu when a navigation link is clicked.
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle?.classList.remove('active');
        navMenu?.classList.remove('active');
        navToggle?.setAttribute('aria-expanded', 'false');
      });
    });

    // Dynamically updates the active navigation link based on the scroll position.
    this.updateActiveNavLink();
  }

  /**
   * Handles click events on navigation links, providing smooth scrolling to target sections.
   * It prevents default link behavior and scrolls to the calculated offset.
   * @param {Event} e - The click event object.
   */
  handleNavClick(e) {
    // Checks if the clicked element is a navigation link pointing to an internal section.
    if (e.target.matches('.nav-link[href^="#"]')) {
      e.preventDefault(); // Prevents the default jump-to-anchor behavior.
      const targetId = e.target.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        // Calculates the scroll-to position, accounting for a fixed header (80px offset).
        const offsetTop = targetSection.offsetTop - 80;
        
        // Uses native smooth scrolling if supported by the browser, otherwise falls back to a custom implementation.
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        } else {
          // Fallback for older browsers without native smooth scroll support.
          this.smoothScrollTo(offsetTop, 800);
        }
      }
    }
  }

  /**
   * Provides a custom smooth scrolling animation for browsers that do not support `scroll-behavior: smooth`.
   * @param {number} target - The target vertical scroll position.
   * @param {number} duration - The duration of the scroll animation in milliseconds.
   */
  smoothScrollTo(target, duration) {
    const start = window.pageYOffset;
    const distance = target - start;
    let startTime = null;

    // Animation loop using requestAnimationFrame for smoother performance.
    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      // Applies an easing function to the scroll animation.
      const run = this.easeInOutQuad(timeElapsed, start, distance, duration);
      window.scrollTo(0, run);
      // Continues the animation until the duration is met.
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  }

  /**
   * Easing function for smooth scrolling (QuadraticInOut).
   * @param {number} t - Current time or elapsed time.
   * @param {number} b - Beginning value.
   * @param {number} c - Change in value.
   * @param {number} d - Duration.
   * @returns {number} The eased value.
   */
  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  /**
   * Updates the 'active' class on navigation links based on the current scroll position.
   * This highlights the navigation link corresponding to the section currently in view.
   */
  updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    // Event listener for scroll to update the active navigation link.
    window.addEventListener('scroll', () => {
      // Adds an offset to `scrollY` to activate the link slightly before the section reaches the very top.
      const scrollPos = window.scrollY + 100;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        // Checks if the current scroll position is within the bounds of a section.
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active'); // Remove 'active' from all links first.
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active'); // Add 'active' to the matching link.
            }
          });
        }
      });
    });
  }

  /**
   * Handles the window scroll event to apply visual changes to the navbar, such as adding a shadow.
   */
  handleScroll() {
    const navbar = document.getElementById('navbar');
    
    // Adds or removes the 'scrolled' class based on the scroll position.
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }

  /**
   * Handles the window resize event to update layout adjustments.
   */
  handleResize() {
    this.updateLayout();
  }

  /**
   * Handles the window load event to initialize effects that depend on the entire page being loaded.
   */
  handleLoad() {
    this.initializeEffects();
  }

  /**
   * Sets up various animations on the page, such as staggered loading for cards.
   */
  setupAnimations() {
    // Apply staggered animation delay to skill and project cards
    const cards = document.querySelectorAll('.skill-card, .project-card');
    cards.forEach((card, index) => {
      card.style.setProperty('--animation-delay', `${index * 0.1}s`);
    });
  }

  /**
   * Initializes properties related to skill bar animations.
   */
  setupSkillBars() {
    // Flag to ensure skill bar animations run only once.
    this.skillBarsAnimated = false;
  }

  /**
   * Sets up the filtering functionality for the skills section.
   * It attaches event listeners to filter buttons to dynamically show/hide skill cards based on category.
   * Also includes keyboard navigation for accessibility.
   */
  setupSkillsFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    filterButtons.forEach((button, index) => {
      // Click handler for filtering skills.
      button.addEventListener('click', () => {
        this.filterSkills(button, filterButtons, skillCards);
      });

      // Keyboard navigation support for filter buttons, allowing users to navigate with arrow keys.
      button.addEventListener('keydown', (e) => {
        let targetIndex = index;
        
        switch(e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            targetIndex = index > 0 ? index - 1 : filterButtons.length - 1;
            break;
          case 'ArrowRight':
            e.preventDefault();
            targetIndex = index < filterButtons.length - 1 ? index + 1 : 0;
            break;
          case 'Home':
            e.preventDefault();
            targetIndex = 0;
            break;
          case 'End':
            e.preventDefault();
            targetIndex = filterButtons.length - 1;
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            this.filterSkills(button, filterButtons, skillCards);
            return;
        }
        
        if (targetIndex !== index) {
          filterButtons[targetIndex].focus();
        }
      });
    });
  }

  /**
   * Filters the skill cards based on the selected category.
   * It updates the active state of filter buttons, shows/hides skill cards with animations,
   * and announces the changes to screen readers for accessibility.
   * @param {HTMLElement} activeButton - The button that was clicked to trigger the filter.
   * @param {NodeListOf<HTMLElement>} filterButtons - All filter buttons.
   * @param {NodeListOf<HTMLElement>} skillCards - All skill cards to be filtered.
   */
  filterSkills(activeButton, filterButtons, skillCards) {
    // Removes the 'active' class and updates ARIA attributes for all filter buttons.
    filterButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    
    // Adds the 'active' class and updates ARIA attributes for the newly selected filter button.
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-selected', 'true');
    
    // Retrieves the filter value from the active button's data attribute.
    const filterValue = activeButton.getAttribute('data-filter');
    
    let visibleCount = 0; // Counter for visible cards for screen reader announcement.
    
    // Iterates through each skill card to apply filtering and animations.
    skillCards.forEach((card, index) => {
      const category = card.getAttribute('data-category');
      
      if (filterValue === 'all' || category === filterValue) {
        visibleCount++;
        card.style.display = 'block'; // Shows the card.
        card.style.opacity = '0'; // Starts invisible for fade-in effect.
        card.style.transform = 'translateY(20px)'; // Starts slightly below for slide-up effect.
        
        // Animates the card into view with a staggered delay.
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 50 + 100);
      } else {
        card.style.opacity = '0'; // Fades out the card.
        card.style.transform = 'translateY(20px)'; // Slides down the card.
        
        // Hides the card completely after the fade-out animation.
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
    
    // Announces the filter change to screen readers, improving accessibility.
    const categoryName = filterValue === 'all' ? 'all' : filterValue;
    const announcement = `Showing ${visibleCount} ${categoryName} skills`;
    this.announceToScreenReader(announcement);
  }

  /**
   * Creates a live region to announce messages to screen readers.
   * This helps make dynamic changes, like skill filtering, accessible to users with visual impairments.
   * @param {string} message - The message to be announced.
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Animates the width of skill progress bars to their data-level values.
   * This animation is triggered only once when the skills section comes into view.
   */
  animateSkillBars() {
    if (this.skillBarsAnimated) return;
    
    const skillBars = document.querySelectorAll('.skill-bar');
    
    skillBars.forEach((bar, index) => {
      const level = bar.getAttribute('data-level');
      
      setTimeout(() => {
        bar.style.width = `${level}%`;
      }, index * 100);
    });
    
    this.skillBarsAnimated = true;
  }

  /**
   * Sets up the filtering functionality for the projects section.
   */
  setupProjectsFilter() {
    const filterButtons = document.querySelectorAll('.filter-tab');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const filterValue = button.getAttribute('data-filter');
        this.filterProjects(filterValue);
      });
    });
  }

  /**
   * Filters projects based on category
   */
  filterProjects(category) {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
      const shouldShow = category === 'all' || this.getProjectCategory(card) === category;
      
      if (shouldShow) {
        card.style.display = 'block';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
  }

  /**
   * Determines project category based on technologies
   */
  getProjectCategory(card) {
    const techTags = card.querySelectorAll('.tech-tag');
    const technologies = Array.from(techTags).map(tag => tag.textContent.toLowerCase());
    
    const hasBackend = technologies.some(tech => 
      tech.includes('node') || tech.includes('express') || tech.includes('postgresql') || 
      tech.includes('mongodb') || tech.includes('python') || tech.includes('java')
    );
    
    const hasFrontend = technologies.some(tech => 
      tech.includes('react') || tech.includes('javascript') || tech.includes('css') || 
      tech.includes('html') || tech.includes('bootstrap')
    );
    
    if (hasBackend && hasFrontend) return 'fullstack';
    if (hasBackend) return 'backend';
    if (hasFrontend) return 'frontend';
    return 'fullstack'; // default
  }

  /**
   * Sets up the contact form submission and client-side validation.
   * Uses AJAX to submit form without page redirect for better UX.
   */
  setupContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = form?.querySelector('.submit-btn');
    const formStatus = document.getElementById('form-status');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault(); // Always prevent default to handle with AJAX
      
      if (!this.validateForm(form)) {
        return;
      }

      // Show loading state
      submitBtn?.classList.add('loading');
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      try {
        const formData = new FormData(form);
        
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          this.showFormStatus('success', '✅ Thank you! Your message has been sent successfully. I\'ll get back to you soon!');
          form.reset();
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        this.showFormStatus('error', '❌ Sorry, there was an error sending your message. Please try again or contact me directly via email.');
      } finally {
        submitBtn?.classList.remove('loading');
      }
    });
  }

  /**
   * Enhanced form validation with better UX
   */
  validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    // Clear previous errors
    form.querySelectorAll('.field-error').forEach(error => error.remove());
    form.querySelectorAll('[aria-invalid="true"]').forEach(field => {
      field.style.borderColor = '';
      field.setAttribute('aria-invalid', 'false');
    });

    requiredFields.forEach(field => {
      const value = field.value.trim();
      if (!value) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      } else if (field.type === 'email' && !this.isValidEmail(value)) {
        this.showFieldError(field, 'Please enter a valid email address');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    return isValid;
  }

  /**
   * Improved email validation
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Displays an error message for a given form field.
   * @param {HTMLElement} field - The form field element that has an error.
   * @param {string} message - The error message to display.
   */
  showFieldError(field, message) {
    field.style.borderColor = 'var(--error)';
    field.setAttribute('aria-invalid', 'true');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'field-error';
      errorElement.style.color = 'var(--error)';
      errorElement.style.fontSize = '0.875rem';
      errorElement.style.marginTop = '0.25rem';
      errorElement.setAttribute('role', 'alert');
      field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  /**
   * Clears any error message and styling from a given form field.
   * @param {HTMLElement} field - The form field element to clear errors from.
   */
  clearFieldError(field) {
    field.style.borderColor = '';
    field.setAttribute('aria-invalid', 'false');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Displays a status message (success or error) for the contact form.
   * The message auto-hides after a few seconds.
   * @param {string} type - The type of message ('success' or 'error').
   * @param {string} message - The message content to display.
   */
  showFormStatus(type, message) {
    const formStatus = document.getElementById('form-status');
    formStatus.className = `form-status ${type}`;
    formStatus.textContent = message;
    
    // Automatically clears the status message after a delay.
    setTimeout(() => {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }, 5000);
  }

  /**
   * Loads project data from projects.json and renders them dynamically.
   * Fetches project data and creates project cards in the DOM.
   * After rendering, it sets up GitHub stats for the rendered projects.
   */
  async loadProjects() {
    const projectsContainer = document.getElementById('projects-container');
    const loadingElement = document.getElementById('projects-loading');
    
    try {
      // Show loading state
      if (loadingElement) {
        loadingElement.classList.remove('hidden');
      }
      
      let projects;
      
      // Try to fetch from projects.json first
      try {
        const response = await fetch('projects.json?v=' + Date.now());
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        projects = await response.json();
      } catch (fetchError) {
        // Fallback to embedded data if fetch fails (for file:// protocol)
        console.warn('Fetch failed, using embedded project data:', fetchError.message);
        projects = [
          {
            "id": "dmu-service-hub",
            "title": "DMU Service Hub",
            "description": "A comprehensive student service management system for De Montfort University, built with React.js, Node.js, Express, and PostgreSQL. It streamlines communication between students and administrative departments through a centralized platform for service requests, document management, and real-time notifications.",
            "image": "images/dmu-service.jpg",
            "github_link": "https://github.com/ayni2421/dmu-student-service",
            "live_demo_link": "https://dmu-service-hub.vercel.app",
            "technologies": ["React.js", "Node.js", "Express.js", "PostgreSQL", "Sequelize ORM", "Socket.io", "JWT Authentication", "Bootstrap", "Multer", "Nodemailer"],
            "status": "Completed"
          },
          {
            "id": "todo-list-app",
            "title": "Full-Stack Todo List Application",
            "description": "A professional, full-stack todo list application built with React frontend and Node.js/Express backend, featuring PostgreSQL database persistence. Includes complete CRUD operations with both inline editing and modal interfaces, real-time updates, comprehensive error handling, input validation, and a modern responsive UI design with glassmorphism effects.",
            "image": "images/todo list.png",
            "github_link": "https://github.com/ayni2421/To-do-list",
            "live_demo_link": "https://todo-app-frontend-pwks.onrender.com",
            "technologies": ["React", "Node.js", "Express.js", "PostgreSQL", "JavaScript ES6+", "Bootstrap 5", "CSS3", "HTML5", "REST API", "CORS", "Environment Variables"],
            "status": "Completed"
          },
          {
            "id": "church-website",
            "title": "Nablis - St. Mary Ethiopian Orthodox Tewahedo Church Management System",
            "description": "A comprehensive full-stack web application designed for managing church community members, events, and communications. Features include multi-step member registration with Ethiopian/Amharic labels, admin dashboard with user statistics, role-based access control (Admin/Moderator/Member), real-time messaging system, event management, and notification center. Built specifically for St. Mary Ethiopian Orthodox Tewahedo Church community with complete CRUD operations and secure authentication.",
            "image": "images/nablis-screenshot.png",
            "github_link": "https://github.com/ayni2421/nablis",
            "live_demo_link": "https://nablis-church.vercel.app",
            "technologies": ["React.js 19", "Node.js", "Express.js 4", "PostgreSQL", "JWT Authentication", "Socket.io", "Bootstrap 5", "Axios", "bcryptjs", "React Router DOM", "React Toastify", "CORS", "UUID", "Multer", "Nodemailer", "Winston Logging", "Express Rate Limit"],
            "status": "Completed"
          }
        ];
      }
      
      // Hide loading state
      if (loadingElement) {
        loadingElement.classList.add('hidden');
      }
      
      this.renderProjects(projects);
      
      // Setup GitHub stats after projects are rendered
      await this.setupGitHubStats();
    } catch (error) {
      console.error('Error loading projects:', error);
      
      // Hide loading state
      if (loadingElement) {
        loadingElement.classList.add('hidden');
      }
      
      // Display a fallback message if projects fail to load
      if (projectsContainer) {
        projectsContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--error); margin-bottom: 1rem;"></i>
            <p style="color: var(--gray-600); margin-bottom: 1rem;">Unable to load projects. Please refresh the page.</p>
            <button onclick="location.reload()" class="btn btn-primary">Reload Page</button>
          </div>
        `;
      }
    }
  }

  /**
   * Renders project cards dynamically from project data.
   * Creates HTML elements for each project and appends them to the projects container.
   * @param {Array<Object>} projects - Array of project objects from projects.json.
   */
  renderProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');
    const loadingElement = document.getElementById('projects-loading');
    
    if (!projectsContainer) {
      console.error('Projects container not found');
      return;
    }

    // Hide loading state if still visible
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }

    // Clear any existing content (except loading element)
    const loadingClone = loadingElement ? loadingElement.cloneNode(true) : null;
    projectsContainer.innerHTML = '';
    
    // Re-add loading element if it existed (for potential future use)
    if (loadingClone) {
      loadingClone.id = 'projects-loading';
      loadingClone.classList.add('hidden');
      projectsContainer.appendChild(loadingClone);
    }

    projects.forEach((project, index) => {
      // Create project card element
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      
      // Determine status badge class based on project status
      const statusClass = project.status === 'Completed' ? 'completed' : 'in-progress';
      const statusText = project.status === 'Completed' ? 'Completed' : 'In Progress';
      
      // Extract repo name from GitHub URL for stats
      const githubUrlParts = project.github_link.split('/');
      const repoName = githubUrlParts[githubUrlParts.length - 1];
      const elementId = project.id.replace(/-/g, '-');
      
      // Build project card HTML
      projectCard.innerHTML = `
        <div class="project-image">
          <img src="${project.image}" alt="${project.title}" loading="lazy" onload="this.parentElement.classList.add('loaded')" onerror="this.parentElement.classList.add('error')">
          <div class="project-overlay">
            <div class="project-links">
              ${project.github_link ? `<a href="${project.github_link}" target="_blank" class="project-link" aria-label="View ${project.title} source code on GitHub">
                <i class="fab fa-github"></i>
              </a>` : ''}
              ${project.live_demo_link ? `<a href="${project.live_demo_link}" target="_blank" class="project-link" aria-label="View ${project.title} live demo">
                <i class="fas fa-external-link-alt"></i>
              </a>` : ''}
            </div>
          </div>
        </div>
        <div class="project-content">
          <div class="project-header">
            <h3>${project.title}</h3>
            <div class="project-status">
              <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
          </div>
          <p class="project-description">${project.description}</p>
          <div class="project-tech">
            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
          <div class="project-stats" id="${elementId}-stats">
            <div class="stat">
              <i class="fas fa-star"></i>
              <span id="${elementId}-stars">-</span>
            </div>
            <div class="stat">
              <i class="fas fa-code-branch"></i>
              <span id="${elementId}-forks">-</span>
            </div>
          </div>
        </div>
      `;
      
      // Append project card to container
      projectsContainer.appendChild(projectCard);
      
      // Add fade-in animation class for Intersection Observer
      projectCard.classList.add('fade-in');
      this.observer?.observe(projectCard);
    });
  }

  /**
   * Optimized GitHub stats fetching with better error handling
   */
  async setupGitHubStats() {
    try {
      let projects;
      
      // Try to fetch from projects.json first
      try {
        const response = await fetch('projects.json?v=' + Date.now());
        if (!response.ok) throw new Error(`Failed to fetch projects: ${response.statusText}`);
        projects = await response.json();
      } catch (fetchError) {
        // Fallback to embedded data if fetch fails
        projects = [
          {
            "id": "dmu-service-hub",
            "title": "DMU Service Hub",
            "github_link": "https://github.com/ayni2421/dmu-student-service"
          },
          {
            "id": "todo-list-app",
            "title": "Todo List App",
            "github_link": "https://github.com/ayni2421/To-do-list"
          },
          {
            "id": "church-website",
            "title": "Church Website",
            "github_link": "https://github.com/ayni2421/nablis"
          }
        ];
      }
      
      const promises = projects.map(project => this.fetchRepoStats(project));
      
      // Use Promise.allSettled to handle individual failures gracefully
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error setting up GitHub stats:', error);
    }
  }

  /**
   * Fetch stats for individual repository
   */
  async fetchRepoStats(project) {
    const githubUrlParts = project.github_link.split('/');
    const repoName = githubUrlParts[githubUrlParts.length - 1];
    const elementId = project.id.replace(/-/g, '-');
    
    try {
      const response = await fetch(`https://api.github.com/repos/ayni2421/${repoName}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.updateRepoStats(elementId, data.stargazers_count, data.forks_count);
      } else {
        this.hideRepoStats(elementId);
      }
    } catch (error) {
      console.log(`GitHub API error for ${repoName}:`, error.message);
      this.hideRepoStats(elementId);
    }
  }

  /**
   * Hides the GitHub stats display for a given project if the API call fails or the repo is not found.
   * @param {string} elementPrefix - The prefix used to identify the stats elements (e.g., 'todo', 'church').
   */
  hideRepoStats(elementPrefix) {
    const statsContainer = document.getElementById(`${elementPrefix}-stars`)?.parentElement?.parentElement;
    if (statsContainer) {
      statsContainer.style.display = 'none';
    }
  }

  /**
   * Updates the displayed star and fork counts for a GitHub repository.
   * @param {string} elementPrefix - The prefix used to identify the stats elements.
   * @param {number} stars - The number of stars for the repository.
   * @param {number} forks - The number of forks for the repository.
   */
  updateRepoStats(elementPrefix, stars, forks) {
    const starsElement = document.getElementById(`${elementPrefix}-stars`);
    const forksElement = document.getElementById(`${elementPrefix}-forks`);
    
    if (starsElement) starsElement.textContent = stars;
    if (forksElement) forksElement.textContent = forks;
  }

  /**
   * Initializes properties related to counter animations.
   */
  setupCounters() {
    this.countersAnimated = false; // Flag to ensure counter animations run only once.
  }

  /**
   * Animates numerical counters in the hero section.
   * The animation runs once when the hero section becomes visible.
   */
  animateCounters() {
    if (this.countersAnimated) return; // Ensures animation runs only once.

    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000; // Animation duration in milliseconds (2 seconds).
      let current = 0;
      const increment = target / (duration / 16); // Calculates increment for ~60fps animation.

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.floor(current); // Updates the counter text.
      }, 16); // Approximately 60 frames per second.
    });
    
    this.countersAnimated = true; // Sets the flag to prevent re-animation.
  }

  /**
   * Sets up the rotating text effect in the hero section.
   * Cycles through a predefined list of words with fade and slide animations.
   */
  setupTextRotation() {
    const rotatingElement = document.getElementById("rotating-text");
    if (rotatingElement) {
      // Array of words to rotate through.
      const words = ["Full-Stack Developer", "Problem Solver", "Code Enthusiast", "Tech Innovator", "Creative Thinker"];
      let currentIndex = 0;
      
      // Function to perform the text rotation animation.
      const rotateText = () => {
        rotatingElement.style.opacity = '0';
        rotatingElement.style.transform = 'translateY(-10px)';
        
        // After fading out and moving up, update text and fade/slide in.
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % words.length;
          rotatingElement.textContent = words[currentIndex];
          rotatingElement.style.opacity = '1';
          rotatingElement.style.transform = 'translateY(0)';
        }, 300); // Duration of the fade-out and slide-up.
      };
      
      // Initial setup for the rotating element's transition properties.
      rotatingElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      // Starts the rotation interval after an initial delay.
      setTimeout(() => {
        setInterval(rotateText, 3000); // Rotates text every 3 seconds.
      }, 2000);
    }
  }

  /**
   * Adjusts the layout based on window size, typically for responsive navigation.
   * Adds or removes a 'mobile' class to the navbar.
   */
  updateLayout() {
    const navbar = document.getElementById('navbar');
    if (window.innerWidth <= 768) {
      navbar?.classList.add('mobile');
    } else {
      navbar?.classList.remove('mobile');
    }
  }

  /**
   * Initializes various effects and layout adjustments after the page has fully loaded.
   */
  initializeEffects() {
    this.updateLayout(); // Ensures responsive layout is applied on load.
    
    document.body.classList.add('loaded'); // Adds 'loaded' class to body for CSS animations.
    
    this.setupLazyLoading(); // Initializes lazy loading for images.
  }

  /**
   * Sets up lazy loading for images with the `loading="lazy"` attribute.
   * It adds 'loaded' class on successful load and 'error' class on failure, with console warnings.
   */
  setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
      img.addEventListener('load', () => {
        img.classList.add('loaded'); // Adds class to trigger fade-in effect.
      });
      
      img.addEventListener('error', () => {
        img.classList.add('error'); // Adds error class for visual feedback.
        console.warn(`Failed to load image: ${img.src}`); // Logs a warning for failed image loads.
      });
    });
  }

  /**
   * Sets up the scroll-to-top button functionality.
   * Shows/hides the button based on scroll position and handles smooth scrolling to top.
   */
  setupScrollToTop() {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (!scrollToTopBtn) return;

    // Show/hide button based on scroll position
    const toggleScrollButton = () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    };

    // Initial check
    toggleScrollButton();

    // Listen for scroll events
    window.addEventListener('scroll', toggleScrollButton);

    // Handle click to scroll to top
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Keyboard support
    scrollToTopBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }
}

// Initialize the Portfolio application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new Portfolio();
});

// Export the Portfolio class for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Portfolio;
}

   