import { Circle, Point } from '@/interface/point.interface';

export const getDistance = (p1: Point, p2: Point) => {
  return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const draw = (ctx: any, circle: Circle | undefined) => {
  if (!circle) {
    return;
  }
  if (!circle.active) return;
  ctx.beginPath();
  ctx.arc(circle.pos.x, circle.pos.y, circle.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = `rgba(21,77,128,${circle.active * 4})`;
  ctx.fill();
};
