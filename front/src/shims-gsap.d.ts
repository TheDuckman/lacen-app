declare module 'gsap/all' {
  // Shim for legacy GSAP v2 API usage (TweenLite.to, Circ.easeInOut)
  // Both TweenLite and Circ are imported as the default export in the codebase.
  const gsap: {
    to(target: object, duration: number, vars: object): any;
    easeInOut: any;
    [key: string]: any;
  };
  export default gsap;
}
