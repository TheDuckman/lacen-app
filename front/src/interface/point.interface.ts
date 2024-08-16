export interface Point {
  x: number;
  y: number;
  originX: number;
  originY: number;
  active?: number;
  closest?: Point[];
  circle?: Circle;
}

export interface Circle {
  pos: {
    x: number;
    y: number;
  };
  radius: number;
  color: string;
  active: number;
}
