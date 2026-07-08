declare module 'gsap' {
  const gsap: {
    registerPlugin(...args: any[]): void;
    to(target: any, vars: any): any;
    fromTo(target: any, fromVars: any, toVars: any): any;
  };
  export default gsap;
}

declare module 'gsap/ScrollTrigger' {
  const ScrollTrigger: {
    create(vars: any): { kill(): void };
    getAll(): { kill(): void }[];
    maxScroll(target: any): number;
  };
  export default ScrollTrigger;
} 