const TASKS_URL = "https://testapi.io/api/butjol/resource/TaskList";

function normalizeTask(record) {
  return {
    id: record.id ?? record.Id,
    title: record.Title ?? "",
    deadline: record["Due Date"] ?? "",
    status: "Nepradėta",
  };
}

async function request(url, options) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Nepavyko susisiekti su užduočių API.");
  }
  return data;
}

export async function getTasks() {
  const data = await request(TASKS_URL);
  const records = Array.isArray(data) ? data : data?.data;
  if (!Array.isArray(records)) {
    throw new Error("API negrąžino užduočių sąrašo.");
  }
  return records.map(normalizeTask);
}

export async function createTask(task) {
  const record = await request(TASKS_URL, {
    method: "POST",
    body: JSON.stringify({
      Title: task.title,
      "Due Date": task.deadline,
    }),
  });
  return normalizeTask(record);
}

export async function updateTask(task, changes) {
  if (changes.deadline === undefined) {
    return { ...task, ...changes };
  }

  const record = await request(`${TASKS_URL}/${task.id}`, {
    method: "PUT",
    body: JSON.stringify({
      Title: task.title,
      "Due Date": changes.deadline,
    }),
  });
  return { ...task, ...normalizeTask(record), status: task.status };
}
