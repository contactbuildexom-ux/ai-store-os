const SRC = "/logo.jpeg";
const FULL_W = 1600;
const FULL_H = 861;

type CropProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  height: number;
};

function Crop({ x, y, w, h, height }: CropProps) {
  const s = height / h;
  return (
    <span
      aria-hidden="true"
      className="block shrink-0 mix-blend-multiply"
      style={{
        width: w * s,
        height,
        backgroundImage: `url(${SRC})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${FULL_W * s}px ${FULL_H * s}px`,
        backgroundPosition: `-${x * s}px -${y * s}px`,
        filter: "contrast(1.08) brightness(1.02)",
      }}
    />
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <Crop x={625} y={92} w={360} h={430} height={40} />
      <Crop x={236} y={533} w={1130} h={183} height={26} />
    </span>
  );
}