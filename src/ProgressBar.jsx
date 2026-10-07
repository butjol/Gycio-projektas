import "./ProgressBar.css";

function ProgressBar({ progress = 0 }) {
  const displayedProgress = Math.round(progress);

  return (
    <section className="progress-card">
      <div className="progress-card__top">
        <div>
          <h2>Progresas</h2>
          <p>Užduočių atlikimo progresas</p>
        </div>

        <span className="progress-card__percentage">{displayedProgress}%</span>
      </div>

      <input
        className="progress-slider"
        type="range"
        min="0"
        max="100"
        step="1"
        value={progress}
        style={{
          "--progress": `${progress}%`,
        }}
        readOnly
        aria-label="Užduočių progresas"
      />
    </section>
  );
}

export default ProgressBar;
