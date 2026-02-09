import { Injectable, NgZone } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Injectable({ providedIn: 'root' })
export class AnimationService {
  constructor(private ngZone: NgZone) {}

  /** Initialize AOS-like scroll reveal for elements with [data-aos] */
  initScrollReveal(): void {
    this.ngZone.runOutsideAngular(() => {
      const els = document.querySelectorAll('[data-aos]');
      els.forEach((el) => {
        const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
        const duration = parseFloat(el.getAttribute('data-aos-duration') || '0.6');

        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            setTimeout(() => {
              el.classList.add('aos-animate');
            }, delay);
          }
        });
      });
    });
  }

  /** Refresh ScrollTrigger (call after dynamic content loads) */
  refreshScrollTrigger(): void {
    this.ngZone.runOutsideAngular(() => {
      ScrollTrigger.refresh();
    });
  }

  /** Animate a counter from 0 to target value */
  animateCounter(
    element: HTMLElement,
    target: number,
    duration: number = 2,
    suffix: string = ''
  ): void {
    this.ngZone.runOutsideAngular(() => {
      const obj = { value: 0 };
      gsap.to(obj, {
        value: target,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          element.textContent = Math.round(obj.value).toLocaleString() + suffix;
        }
      });
    });
  }

  /** Stagger children fade-up */
  staggerFadeUp(
    container: HTMLElement,
    childSelector: string,
    staggerDelay: number = 0.1
  ): void {
    this.ngZone.runOutsideAngular(() => {
      const children = container.querySelectorAll(childSelector);
      gsap.fromTo(children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: staggerDelay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            once: true,
          }
        }
      );
    });
  }

  /** Hero text reveal with stagger */
  heroTextReveal(element: HTMLElement): void {
    this.ngZone.runOutsideAngular(() => {
      gsap.fromTo(element,
        { opacity: 0, y: 40, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out'
        }
      );
    });
  }

  /** Parallax float effect on scroll */
  parallaxFloat(element: HTMLElement, yAmount: number = 50): void {
    this.ngZone.runOutsideAngular(() => {
      gsap.to(element, {
        y: yAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });
    });
  }

  /** Scale-in on scroll */
  scaleIn(element: HTMLElement, delay: number = 0): void {
    this.ngZone.runOutsideAngular(() => {
      gsap.fromTo(element,
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            once: true,
          }
        }
      );
    });
  }

  /** Slide in from direction */
  slideIn(element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'up'): void {
    const props: any = { opacity: 0 };
    if (direction === 'left') props.x = -60;
    if (direction === 'right') props.x = 60;
    if (direction === 'up') props.y = 40;
    if (direction === 'down') props.y = -40;

    this.ngZone.runOutsideAngular(() => {
      gsap.fromTo(element, props, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          once: true,
        }
      });
    });
  }

  /** 3D card tilt effect on mouse move */
  add3DTilt(element: HTMLElement, intensity: number = 10): void {
    this.ngZone.runOutsideAngular(() => {
      const onMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(element, {
          rotateX: -y * intensity,
          rotateY: x * intensity,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      };

      const onMouseLeave = () => {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });
      };

      element.addEventListener('mousemove', onMouseMove);
      element.addEventListener('mouseleave', onMouseLeave);
    });
  }

  /** Animate progress line drawn across */
  drawLine(element: HTMLElement): void {
    this.ngZone.runOutsideAngular(() => {
      gsap.fromTo(element,
        { width: '0%' },
        {
          width: '100%',
          duration: 1.2,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            once: true,
          }
        }
      );
    });
  }

  /** Kill all ScrollTrigger instances (cleanup) */
  destroyAll(): void {
    ScrollTrigger.getAll().forEach(st => st.kill());
  }
}
