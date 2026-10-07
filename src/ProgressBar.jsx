import "./ProgressBar.css";

function ProgressBar({ progress = 0, tasks = [] }) {
const displayedProgress = Math.round(progress);
  const completedTaskCount = tasks.filter(
    (task) => task.status === "Atlikta",
  ).length;
  const inProgressTaskCount = tasks.filter(
    (task) => task.status === "Vykdoma",
  ).length;
  const notStartedTaskCount = tasks.filter(
    (task) => task.status === "Nepradėta",
  ).length;

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
      <p className="progress-card__summary">
        {completedTaskCount} atlikta&nbsp; {inProgressTaskCount} vykdoma&nbsp; {notStartedTaskCount} nepradėta
      </p>
    </section>
  );
}

export default ProgressBar;
