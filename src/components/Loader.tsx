// Pencil-scribble loader — shown during route transitions (loading.tsx).
// A pencil glides across, "drawing" a wavy line, then loops. Pure CSS anim.
export default function Loader() {
  return (
    <div className="loader-screen">
      <div className="loader">
        <div className="loader-track">
          <svg className="scribble" viewBox="0 0 170 24" fill="none" aria-hidden>
            <path
              className="scribble-path"
              pathLength={100}
              d="M2,14 q10,-9 20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </svg>
          <span className="pencil" aria-hidden>
            ✏️
          </span>
        </div>
        <p className="loader-text">loading…</p>
      </div>
    </div>
  );
}
