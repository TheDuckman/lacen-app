/* eslint-disable @typescript-eslint/no-explicit-any */
<template>
  <div
    id="large-header"
    class="large-header"
  >
    <canvas id="demo-canvas"></canvas>
    <div class="main-title">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import TweenLite from 'gsap/all';
  import Circ from 'gsap/all';
  import { Circle, Point } from '@/interface/point.interface';
  import { draw, getDistance } from '../utils/animation.utils';

  const width = ref();
  const height = ref();
  const heightOffset = ref();
  const largeHeader = ref();
  const canvas = ref();
  const ctx = ref();
  const points = ref<Point[]>([]);
  const target = ref<Point>({ x: 0, y: 0, originX: 0, originY: 0 });
  const animateHeader = ref(true);

  // Init functions
  const initHeader = () => {
    const bodyRect = document.body.getBoundingClientRect();
    const divRect = document
      .getElementById('large-header')
      ?.getBoundingClientRect();
    heightOffset.value = divRect ? divRect.top - bodyRect.top : null;
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    target.value = {
      x: width.value / 2,
      y: height.value / 2,
      originX: width.value / 2,
      originY: height.value / 2,
    };

    largeHeader.value = document.getElementById('large-header');
    largeHeader.value.style.height = height.value + 'px';

    canvas.value = document.getElementById('demo-canvas');
    canvas.value.width = width.value;
    canvas.value.height = height.value;
    ctx.value = canvas.value.getContext('2d');

    // create points
    for (let x = 0; x < width.value; x = x + width.value / 20) {
      for (let y = 0; y < height.value; y = y + height.value / 20) {
        const px = x + (Math.random() * width.value) / 20;
        const py = y + (Math.random() * height.value) / 20;
        const p: Point = { x: px, originX: px, y: py, originY: py };
        points.value.push(p);
      }
    }
    // for each point find the 5 closest points
    for (let i = 0; i < points.value.length; i++) {
      const closest: Point[] = [];
      const p1 = points.value[i];
      for (let j = 0; j < points.value.length; j++) {
        const p2 = points.value[j];
        if (!(p1 == p2)) {
          let placed = false;
          for (let k = 0; k < 5; k++) {
            if (!placed) {
              if (closest[k] == undefined) {
                closest[k] = p2;
                placed = true;
              }
            }
          }
          for (let k = 0; k < 5; k++) {
            if (!placed) {
              if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                closest[k] = p2;
                placed = true;
              }
            }
          }
        }
      }
      p1.closest = closest;
    }
    // assign a circle to each point
    for (const i in points.value) {
      const c: Circle = {
        pos: {
          x: points.value[i].x,
          y: points.value[i].y,
        },
        radius: 2 + Math.random() * 10,
        color: 'rgba(255,255,255,0.3)',
        active: 0,
      };
      points.value[i].circle = c;
    }
  };
  const initAnimation = () => {
    animate();
    for (const i in points.value) {
      shiftPoint(points.value[i]);
    }
  };

  // Animation functions
  const animate = () => {
    if (animateHeader.value) {
      ctx.value.clearRect(0, 0, width.value, height.value);
      for (const i in points.value) {
        // detect points in range
        if (Math.abs(getDistance(target.value, points.value[i])) < 4000) {
          points.value[i].active = 0.3;
          if (points.value[i].circle) {
            points.value[i].circle.active = 0.6;
          }
        } else if (
          Math.abs(getDistance(target.value, points.value[i])) < 20000
        ) {
          points.value[i].active = 0.1;
          if (points.value[i].circle) {
            points.value[i].circle.active = 0.3;
          }
        } else if (
          Math.abs(getDistance(target.value, points.value[i])) < 40000
        ) {
          points.value[i].active = 0.02;
          if (points.value[i].circle) {
            points.value[i].circle.active = 0.1;
          }
        } else {
          points.value[i].active = 0;
          if (points.value[i].circle) {
            points.value[i].circle.active = 0;
          }
        }

        drawLines(points.value[i]);
        draw(ctx.value, points.value[i].circle);
      }
    }
    requestAnimationFrame(animate);
  };
  const shiftPoint = (p: Point) => {
    TweenLite.to(p, 1 + 1 * Math.random(), {
      x: p.originX - 50 + Math.random() * 100,
      y: p.originY - 50 + Math.random() * 100,
      ease: Circ.easeInOut,
      onComplete: () => {
        shiftPoint(p);
      },
    });
  };
  const drawLines = (p: Point) => {
    if (!p.active) {
      return;
    }
    if (p.closest) {
      p.closest.forEach((pt) => {
        ctx.value.beginPath();
        ctx.value.moveTo(p.x, p.y);
        ctx.value.lineTo(pt.x, pt.y);
        if (p.active) {
          ctx.value.strokeStyle = `rgba(21,77,128,${p.active * 4})`;
        }
        ctx.value.stroke();
      });
    }
  };

  // Events and handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mouseMove = (e: any) => {
    let posx = 0;
    let posy = 0;
    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      posx =
        e.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft;
      posy =
        e.clientY +
        document.body.scrollTop +
        document.documentElement.scrollTop;
    }
    target.value.x = posx;
    target.value.y = posy - heightOffset.value;
  };
  const scrollCheck = () => {
    if (document.body.scrollTop > height.value) {
      animateHeader.value = false;
    } else {
      animateHeader.value = true;
    }
  };
  const resize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    largeHeader.value.style.height = `${height.value}px`;
    canvas.value.width = width.value;
    canvas.value.height = height.value;
  };
  const addListeners = () => {
    if (!('ontouchstart' in window)) {
      window.addEventListener('mousemove', mouseMove);
    }
    window.addEventListener('scroll', scrollCheck);
    window.addEventListener('resize', resize);
  };

  onMounted(() => {
    initHeader();
    initAnimation();
    addListeners();
  });
</script>

<style scoped>
  /* Header */
  .large-header {
    position: relative;
    width: 100%;
    background: #fff;
    overflow: hidden;
    background-size: cover;
    background-position: center center;
    z-index: 1;
  }

  .main-title {
    position: absolute;
    margin: 0;
    margin-top: 70px;
    padding: 0;
    color: #154d80;
    text-align: center;
    top: 20%;
    left: 50%;
    -webkit-transform: translate3d(-50%, -50%, 0);
    transform: translate3d(-50%, -50%, 0);
  }

  .demo-1 .main-title {
    text-transform: uppercase;
    font-size: 4.2em;
    letter-spacing: 0.1em;
  }

  .main-title .thin {
    font-weight: 200;
  }

  @media only screen and (max-width: 768px) {
    .demo-1 .main-title {
      font-size: 3em;
    }
  }
</style>
