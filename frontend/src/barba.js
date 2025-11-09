import barba from '@barba/core';
import { gsap } from 'gsap';

// Initialize Barba.js
barba.init({
  transitions: [
    {
      name: 'default-transition',
      leave(data) {
        return gsap.to(data.current.container, {
          opacity: 0,
          y: -50,
          duration: 0.5,
          ease: 'power2.inOut'
        });
      },
      enter(data) {
        return gsap.fromTo(
          data.next.container,
          {
            opacity: 0,
            y: 50
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.inOut'
          }
        );
      }
    },
    {
      name: 'landing-to-app',
      from: {
        namespace: 'landing'
      },
      to: {
        namespace: 'app'
      },
      leave(data) {
        return gsap.to(data.current.container, {
          opacity: 0,
          scale: 0.9,
          duration: 0.6,
          ease: 'power2.inOut'
        });
      },
      enter(data) {
        return gsap.fromTo(
          data.next.container,
          {
            opacity: 0,
            scale: 1.1
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.inOut'
          }
        );
      }
    },
    {
      name: 'app-to-landing',
      from: {
        namespace: 'app'
      },
      to: {
        namespace: 'landing'
      },
      leave(data) {
        return gsap.to(data.current.container, {
          opacity: 0,
          x: -100,
          duration: 0.5,
          ease: 'power2.inOut'
        });
      },
      enter(data) {
        return gsap.fromTo(
          data.next.container,
          {
            opacity: 0,
            x: 100
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: 'power2.inOut'
          }
        );
      }
    }
  ],
  views: [
    {
      namespace: 'landing',
      beforeEnter() {
        // Initialize landing page animations
        gsap.fromTo('.hero-title', {
          opacity: 0,
          y: 50
        }, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.2,
          ease: 'power2.out'
        });
        
        gsap.fromTo('.hero-subtitle', {
          opacity: 0,
          y: 30
        }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.4,
          ease: 'power2.out'
        });
        
        gsap.fromTo('.hero-buttons', {
          opacity: 0,
          y: 30
        }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.6,
          ease: 'power2.out'
        });
      }
    },
    {
      namespace: 'app',
      beforeEnter() {
        // Initialize app page animations
        gsap.fromTo('.app-header', {
          opacity: 0,
          y: -30
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
        
        gsap.fromTo('.platform-stats', {
          opacity: 0,
          y: 30
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2,
          ease: 'power2.out'
        });
        
        gsap.fromTo('.map-container', {
          opacity: 0,
          scale: 0.95
        }, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.4,
          ease: 'power2.out'
        });
      }
    }
  ]
});

// Custom page transition functions
export const pageTransitions = {
  fadeIn: (element, duration = 0.5) => {
    return gsap.fromTo(element, {
      opacity: 0,
      y: 30
    }, {
      opacity: 1,
      y: 0,
      duration,
      ease: 'power2.out'
    });
  },
  
  slideIn: (element, direction = 'left', duration = 0.5) => {
    const x = direction === 'left' ? -50 : 50;
    return gsap.fromTo(element, {
      opacity: 0,
      x
    }, {
      opacity: 1,
      x: 0,
      duration,
      ease: 'power2.out'
    });
  },
  
  scaleIn: (element, duration = 0.5) => {
    return gsap.fromTo(element, {
      opacity: 0,
      scale: 0.8
    }, {
      opacity: 1,
      scale: 1,
      duration,
      ease: 'back.out(1.7)'
    });
  }
};

export default barba;