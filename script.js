document.addEventListener('DOMContentLoaded', () => {
    // Preloader handler
    initPreloader();
    
    // Initialize theme, navigation, particles, form validation, and scroll observers
    initTheme();
    initMobileNav();
    initScrollEffects();
    initParticles();
    initIntersectionObservers();
    initResumePrint();
    initContactForm();
    initLightbox();
});

/* ==========================================================================
   Theme Management (Light / Dark Mode)
   ========================================================================== */
let currentTheme = 'dark';
let updateParticleThemeColors = null; // Callback pointer for particle canvas update

function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    
    // Check saved theme or user preference
    if (savedTheme) {
        currentTheme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        currentTheme = 'light';
    }
    
    // Apply initial theme
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    
    // Bind toggle action
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (document.body.classList.contains('light-theme')) {
                document.body.classList.remove('light-theme');
                currentTheme = 'dark';
            } else {
                document.body.classList.add('light-theme');
                currentTheme = 'light';
            }
            localStorage.setItem('theme', currentTheme);
            
            // Notify particles system to update colors
            if (typeof updateParticleThemeColors === 'function') {
                updateParticleThemeColors(currentTheme);
            }
        });
    }
}

/* ==========================================================================
   Mobile Navigation Menu
   ========================================================================== */
function initMobileNav() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (mobileMenuToggle && navbar) {
        // Toggle menu active state
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenuToggle.classList.toggle('active');
            navbar.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navbar.classList.contains('active') && !navbar.contains(e.target) && e.target !== mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
                navbar.classList.remove('active');
            }
        });
        
        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navbar.classList.remove('active');
            });
        });
    }
}

/* ==========================================================================
   Scroll Effects (Progress bar, Header shrinkage, Active Links, Back To Top)
   ========================================================================== */
function initScrollEffects() {
    const header = document.querySelector('.header');
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        
        // 1. Update scroll progress bar
        if (scrollProgress) {
            scrollProgress.style.width = `${scrollPercent}%`;
        }
        
        // 2. Shrink/Contract header on scroll
        if (header) {
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // 3. Show/Hide Back to Top button
        if (scrollTopBtn) {
            if (scrollTop > 400) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        }
        
        // 4. Highlight active nav link on scroll
        let activeSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150; // Offset for header clearance
            const sectionHeight = section.clientHeight;
            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                activeSectionId = section.getAttribute('id');
            }
        });
        
        if (activeSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${activeSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // Back to top scroll execution
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/* ==========================================================================
   HTML5 Particle Canvas Animation
   ========================================================================== */
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let animationId = null;
    
    // Mouse interaction states
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };
    
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Adapt particle parameters depending on dark/light theme
    let particleColor = 'rgba(255, 255, 255, 0.4)';
    let lineColor = 'rgba(255, 255, 255, 0.05)';
    
    function setColorsByTheme(theme) {
        if (theme === 'light') {
            particleColor = 'rgba(37, 99, 235, 0.25)'; // subtle blue
            lineColor = 'rgba(37, 99, 235, 0.04)';
        } else {
            particleColor = 'rgba(255, 255, 255, 0.2)'; // semi-trans white
            lineColor = 'rgba(255, 255, 255, 0.035)';
        }
    }
    
    setColorsByTheme(currentTheme);
    
    // Assign global update hook for the toggle button
    updateParticleThemeColors = (theme) => {
        setColorsByTheme(theme);
    };
    
    // Setup responsive canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticlePool();
    }
    
    window.addEventListener('resize', () => {
        // Debounce resize
        clearTimeout(window.particleResizeTimer);
        window.particleResizeTimer = setTimeout(resizeCanvas, 150);
    });
    
    // Particle constructor
    class Particle {
        constructor(x, y, directionX, directionY, size) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = particleColor;
            ctx.fill();
        }
        
        update() {
            // Check edge boundaries
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            
            // Mouse proximity behavior (push particles slightly away)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius + this.size) {
                    if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                        this.x += 2;
                    }
                    if (mouse.x > this.x && this.x > this.size * 10) {
                        this.x -= 2;
                    }
                    if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                        this.y += 2;
                    }
                    if (mouse.y > this.y && this.y > this.size * 10) {
                        this.y -= 2;
                    }
                }
            }
            
            // Apply standard floating movement
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }
    
    // Initialize particle pool based on screen size
    function initParticlePool() {
        particlesArray = [];
        // Calculate particle count relative to screen area (density-based)
        const density = (canvas.width * canvas.height) / 11000;
        const numberOfParticles = Math.min(Math.floor(density), 100); // capped for performance
        
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1; // 1px to 3px
            let x = (Math.random() * ((canvas.width - size * 2) - size * 2)) + size * 2;
            let y = (Math.random() * ((canvas.height - size * 2) - size * 2)) + size * 2;
            
            // Random direction vectors
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size));
        }
    }
    
    // Main loop to draw lines and update coordinates
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
        animationId = requestAnimationFrame(animate);
    }
    
    // Render lines connecting close particles
    function connectParticles() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                // Connect particles if they are close
                if (distance < 110) {
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Start particles
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticlePool();
    animate();
}

/* ==========================================================================
   Intersection Observers (Scroll reveal and Skills progression)
   ========================================================================== */
function initIntersectionObservers() {
    // 1. Scroll reveal items (Fade & Slide Up)
    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-slide-up');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
    
    // 2. Skill progress bar animations
    const skillsSection = document.getElementById('skills');
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    
    if (skillsSection && skillBars.length > 0) {
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillBars.forEach(bar => {
                        const targetPercent = bar.getAttribute('data-percent');
                        bar.style.width = targetPercent;
                    });
                    skillsObserver.unobserve(entry.target); // Animate once
                }
            });
        }, {
            threshold: 0.15
        });
        
        skillsObserver.observe(skillsSection);
    }
    
    // 3. Dynamic header restructuring for print layout elements
    // In prints, we want title/degree/date horizontally. We prepare wrappers in JS for clean layout structure when printed.
    const timelineContents = document.querySelectorAll('.timeline-content');
    timelineContents.forEach(content => {
        const date = content.querySelector('.timeline-date');
        const title = content.querySelector('.timeline-title');
        const degree = content.querySelector('.timeline-degree');
        
        if (date && title && degree) {
            // Create a print wrapper container at the top of content card
            const printWrapper = document.createElement('div');
            printWrapper.className = 'timeline-header-print';
            
            // Clone elements to put in print wrapper
            const clonedTitle = title.cloneNode(true);
            const clonedDate = date.cloneNode(true);
            
            printWrapper.appendChild(clonedTitle);
            printWrapper.appendChild(clonedDate);
            
            // Insert the print wrapper before the standard title
            content.insertBefore(printWrapper, title);
        }
    });
}

/* ==========================================================================
   Print Event Handler for CV / Resume Download
   ========================================================================== */
function initResumePrint() {
    // Intentionally left blank so the native anchor links work to download/view the resume.pdf file.
}

/* ==========================================================================
   Contact Form Validation & Submission Simulated States
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const formAlert = document.getElementById('formAlert');
    
    // Regular Expression for email format validation
    const emailRegex = /^[a-zA-Z0-8._%+-]+@[a-zA-Z0-8.-]+\.[a-zA-Z]{2,}$/;
    
    // Validation helper
    function validateField(input, errorElementId, validationFn, errorMessage) {
        const formGroup = input.parentElement;
        const errorElement = document.getElementById(errorElementId);
        
        if (!validationFn(input.value.trim())) {
            formGroup.classList.add('invalid');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
            return false;
        } else {
            formGroup.classList.remove('invalid');
            return true;
        }
    }
    
    // Realtime field validation on input
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            validateField(nameInput, 'nameError', val => val.length > 0, 'Name is required');
        });
    }
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            validateField(emailInput, 'emailError', val => emailRegex.test(val), 'Please enter a valid email address');
        });
    }
    if (messageInput) {
        messageInput.addEventListener('input', () => {
            validateField(messageInput, 'messageError', val => val.length > 0, 'Message cannot be empty');
        });
    }
    
    // Form submit listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate all fields
        const isNameValid = validateField(nameInput, 'nameError', val => val.length > 0, 'Name is required');
        const isEmailValid = validateField(emailInput, 'emailError', val => emailRegex.test(val), 'Please enter a valid email address');
        const isMessageValid = validateField(messageInput, 'messageError', val => val.length > 0, 'Message cannot be empty');
        
        if (!isNameValid || !isEmailValid || !isMessageValid) {
            showFormAlert('Please fix the errors in the form before submitting.', 'error');
            return;
        }
        
        // Visual sending state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        formAlert.style.display = 'none';
        
        // Send form data to email using FormSubmit API
        fetch('https://formsubmit.co/ajax/nithinvirat25@gmail.com', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: nameInput.value,
                email: emailInput.value,
                message: messageInput.value
            })
        })
        .then(response => response.json())
        .then(data => {
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            
            showFormAlert('Thank you! Your message has been sent successfully. I will get back to you soon.', 'success');
            
            // Clear form
            form.reset();
            
            // Reset button state after 3 seconds
            setTimeout(() => {
                submitBtn.classList.remove('success');
                submitBtn.disabled = false;
            }, 3000);
        })
        .catch(error => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            showFormAlert('Oops! There was a problem sending your message. Please try again later.', 'error');
            console.error('Error sending message:', error);
        });
    });
    
    function showFormAlert(message, type) {
        if (!formAlert) return;
        formAlert.textContent = message;
        formAlert.className = 'form-alert'; // reset classes
        
        if (type === 'success') {
            formAlert.classList.add('success-alert');
        } else {
            formAlert.classList.add('error-alert');
        }
        formAlert.style.display = 'block';
    }
}

/* ==========================================================================
   Preloader Fade-Out Action
   ========================================================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.classList.add('fade-out');
        });
        
        // Fallback in case load event takes too long
        setTimeout(() => {
            if (!preloader.classList.contains('fade-out')) {
                preloader.classList.add('fade-out');
            }
        }, 3000);
    }
}

/* ==========================================================================
   Lightbox modal functionality for Certificate Previews
   ========================================================================== */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const certLinks = document.querySelectorAll('.cert-link');
    
    if (lightbox && lightboxImg && lightboxClose) {
        certLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const imgSrc = link.getAttribute('data-cert-img');
                const captionText = link.getAttribute('data-cert-name');
                if (imgSrc) {
                    lightboxImg.src = imgSrc;
                    if (lightboxCaption) {
                        lightboxCaption.textContent = captionText || "";
                    }
                    lightbox.style.display = 'block';
                    document.body.style.overflow = 'hidden'; // lock scroll
                }
            });
        });
        
        const closeLightbox = () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = ''; // unlock scroll
        };
        
        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'block') {
                closeLightbox();
            }
        });
    }
}
