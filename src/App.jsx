import { useEffect, useState } from "react";
import TaskList from "./TaskList";
import ProgressBar from "./ProgressBar";
import Navbar from "./Navbar";
import AddTaskForm from "./AddTaskForm";
import Profile from "./Profile";
import { createTask, getTasks, updateTask } from "./taskApi";
import "./App.css";

function App() {
  const user = {
    name: "Jonas Jonaitis",
    email: "jonas@flowly.lt",
  };

  const [activePage, setActivePage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch(() => setTaskError("Nepavyko įkelti užduočių. Patikrinkite, ar API serveris veikia."))
      .finally(() => setTasksLoading(false));
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    if (email === "admin" && password === "admin") {
      setIsLoggedIn(true);
      setLoginError("");
      return;
    }

    setLoginError("Neteisingas vartotojo vardas arba slaptažodis.");
  }

  async function handleAddTask(newTask) {
    try {
      const savedTask = await createTask(newTask);
      setTasks((currentTasks) => [...currentTasks, savedTask]);
      setTaskError("");
    } catch {
      setTaskError("Užduoties išsaugoti nepavyko. Bandykite dar kartą.");
    }
  }

  async function handleTaskChange(taskId, changes) {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    try {
      const updatedTask = await updateTask(currentTask, changes);
      setTasks((currentTasks) =>
        currentTasks.map((task) => task.id === taskId ? updatedTask : task),
      );
      setTaskError("");
    } catch {
      setTaskError("Užduoties pakeitimų išsaugoti nepavyko.");
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedTaskCount = tasks.filter(
    (task) => task.status === "Atlikta",
  ).length;
  const taskProgressByStatus = {
    Nepradėta: 0,
    Vykdoma: 50,
    Atlikta: 100,
  };
  const progress = tasks.length === 0
    ? 0
    : tasks.reduce(
        (total, task) => total + (taskProgressByStatus[task.status] ?? 0),
        0,
      ) / tasks.length;
  const overdueTaskCount = tasks.filter((task) => {
    if (task.status === "Atlikta" || !task.deadline) return false;

    const deadline = new Date(`${task.deadline}T00:00:00`);
    return deadline < today;
  }).length;

  return (
    <>
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      {activePage === "home" && (
        <>
          {isLoggedIn && (
            <header className="welcome-message">
              <h1>Sveiki sugrįžę!</h1>
              <p>Prisijungėte kaip admin.</p>
            </header>
          )}

          <main className="login-page">
            {!isLoggedIn && (
              <div className="login-card">
                <header className="login-card__header">
                  <h1>Prisijungti</h1>
                  <p>Įveskite savo duomenis, kad tęstumėte</p>
                </header>

                <form className="login-form" onSubmit={handleSubmit}>
                  <label className="login-field">
                    <span>Vartotojo vardas</span>
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      placeholder="admin"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </label>

                  <label className="login-field">
                    <span>Slaptažodis</span>
                    <input
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </label>

                  <button type="submit" className="login-submit">
                    Prisijungti
                  </button>

                  {loginError && (
                    <p className="login-error" role="alert">
                      {loginError}
                    </p>
                  )}
                </form>
              </div>
            )}

            {isLoggedIn && (
              <>
                <section className="dashboard-summary" aria-label="Užduočių suvestinė">
                  <p>
                    <strong>{tasks.length} užduotys</strong>
                    <span aria-hidden="true">·</span>
                    <strong>{completedTaskCount} atliktos</strong>
                    <span aria-hidden="true">·</span>
                    <strong>{overdueTaskCount} vėluoja</strong>
                  </p>
                </section>

                {taskError && <p className="login-error" role="alert">{taskError}</p>}

                <TaskList
                  tasks={tasks}
                  loading={tasksLoading}
                  onStatusChange={(taskId, status) => handleTaskChange(taskId, { status })}
                  onDeadlineChange={(taskId, deadline) => handleTaskChange(taskId, { deadline })}
                />

                <AddTaskForm onAddTask={handleAddTask} />
                <ProgressBar progress={progress} tasks={tasks} />
              </>
            )}
          </main>
        </>
      )}

      {activePage === "profile" && <Profile user={user} tasks={tasks} />}
    </>
  );
}

export default App;
