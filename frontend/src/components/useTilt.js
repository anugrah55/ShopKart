import { useRef } from "react";

// 3D tilt + spotlight that follows the cursor. Spread the returned props onto any element.
export default function useTilt(maxDeg = 10) {
  const ref = useRef(null);

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * maxDeg}deg) rotateY(${(x - 0.5) * maxDeg}deg) translateY(-6px)`;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return { ref, onMouseMove, onMouseLeave };
}
