import { useState } from "react";
import TaskList from "./TaskList";
import ProgressBar from "./ProgressBar";
import Navbar from "./Navbar";
import AddTaskForm from "./AddTaskForm";
import Profile from "./Profile";
import { authenticateUser, createTask, getTasks, registerUser, updateTask } from "./taskApi";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskError, setTaskError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoginError("");

    if (isRegistering && password.length < 6) {
      setLoginError("Slaptažodį turi sudaryti bent 6 simboliai.");
      return;
    }
    if (isRegistering && password !== confirmPassword) {
      setLoginError("Slaptažodžiai nesutampa.");
      return;
    }

    setTasksLoading(true);
    try {
      let authenticatedUser;
      if (isRegistering) {
        authenticatedUser = await registerUser(email, password);
      } else {
        authenticatedUser = await authenticateUser(email.trim(), password);
        if (!authenticatedUser) {
          setLoginError("Neteisingas vartotojo vardas arba slaptažodis.");
          return;
        }
      }

      setUser(authenticatedUser);
      setTaskError("");
      try {
        setTasks(await getTasks(authenticatedUser.name));
      } catch {
        setTasks([]);
        setTaskError("Paskyra sukurta, bet užduočių įkelti nepavyko. Patikrinkite TaskList lentelę.");
      }
    } catch (error) {
      setLoginError(error.message || "Nepavyko užbaigti veiksmo. Patikrinkite duomenų bazės ryšį.");
    } finally {
      setTasksLoading(false);
    }
  }

  function toggleAuthMode() {
    setIsRegistering((registering) => !registering);
    setPassword("");
    setConfirmPassword("");
    setLoginError("");
  }

  async function handleAddTask(newTask) {
    try {
      const savedTask = await createTask({ ...newTask, userName: user.name });
      setTasks((currentTasks) => [...currentTasks, savedTask]);
      setTaskError("");
    } catch {
      setTaskError("Užduoties išsaugoti nepavyko. Patikrinkite TaskList laukus.");
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
  const completedTaskCount = tasks.filter((task) => task.status === "Atlikta").length;
  const taskProgressByStatus = { Nepradėta: 0, Vykdoma: 50, Atlikta: 100 };
  const progress = tasks.length === 0
    ? 0
    : tasks.reduce(
        (total, task) => total + (taskProgressByStatus[task.status] ?? 0),
        0,
      ) / tasks.length;
  const overdueTaskCount = tasks.filter((task) => {
    if (task.status === "Atlikta" || !task.deadline) return false;
    return new Date(`${task.deadline}T00:00:00`) < today;
  }).length;

  return (
    <>
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      {activePage === "home" && (
        <>
          {user && (
            <header className="welcome-message">
              <h1>Sveiki sugrįžę, {user.name}!</h1>
              <p>Jūsų asmeninis užduočių sąrašas.</p>
            </header>
          )}

          <main className="login-page">
            {!user && (
              <div className="login-card">
                <header className="login-card__header">
                  <h1>{isRegistering ? "Nauja paskyra" : "Prisijungti"}</h1>
                  <p>{isRegistering ? "Sukurkite Flowly paskyrą" : "Įveskite savo duomenis, kad tęstumėte"}</p>
                </header>

                <form className="login-form" onSubmit={handleSubmit}>
                  <label className="login-field">
                    <span>Vartotojo vardas</span>
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      minLength={3}
                      required
                    />
                  </label>

                  <label className="login-field">
                    <span>Slaptažodis</span>
                    <span className="password-input-wrap">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete={isRegistering ? "new-password" : "current-password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={isRegistering ? 6 : undefined}
                        required
                      />
                      <button
                        className="password-visibility"
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? "Slėpti slaptažodį" : "Rodyti slaptažodį"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
                            <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.5 5.1 9 6-.3.6-1.5 2.6-3.8 4M6.2 6.2C3.9 7.6 2.4 10 2 11c.5.9 3.8 6 10 6 1 0 1.9-.2 2.7-.5" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 12s3.3-6 10-6 10 6 10 6-3.3 6-10 6-10-6-10-6Z" />
                            <circle cx="12" cy="12" r="2.5" />
                          </svg>
                        )}
                      </button>
                    </span>
                  </label>

                  {isRegistering && (
                    <label className="login-field">
                      <span>Pakartokite slaptažodį</span>
                      <input
                        type="password"
                        name="confirm-password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        minLength={6}
                        required
                      />
                    </label>
                  )}

                  <button type="submit" className="login-submit" disabled={tasksLoading}>
                    {tasksLoading
                      ? "Prašome palaukti..."
                      : isRegistering ? "Registruotis" : "Prisijungti"}
                  </button>

                  {loginError && <p className="login-error" role="alert">{loginError}</p>}
                </form>

                <button className="auth-mode-toggle" type="button" onClick={toggleAuthMode}>
                  {isRegistering ? "Jau turite paskyrą? Prisijunkite" : "Neturite paskyros? Registruokitės"}
                </button>
              </div>
            )}

            {user && (
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

      {activePage === "profile" && user && <Profile user={user} tasks={tasks} />}
    </>
  );
}

export default App;
