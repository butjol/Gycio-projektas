const TASKS_URL = "https://testapi.io/api/butjol/resource/TaskList";
const USERS_URL = "https://testapi.io/api/butjol/resource/UserList";

function normalizeTask(record) {
  return {
    id: record.id ?? record.Id,
    title: record.Title ?? "",
    deadline: record["Due Date"] ?? "",
    status: record.Status ?? "Nepradėta",
    userName: record["User Name"] ?? "",
  };
}

async function request(url, options) {
  const headers = options?.body
    ? { "Content-Type": "application/json" }
    : undefined;
  const response = await fetch(url, {
    ...options,
    ...(headers ? { headers } : {}),
  });

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Nepavyko susisiekti su duomenų baze.");
  }
  return data;
}

function recordsFrom(data) {
  const records = Array.isArray(data) ? data : data?.data;
  if (!Array.isArray(records)) {
    throw new Error("API negrąžino įrašų sąrašo.");
  }
  return records;
}

export async function authenticateUser(userName, password) {
  const users = recordsFrom(await request(USERS_URL));
  if (users.length === 0) {
    throw new Error("UserList lentelė tuščia. Pridėkite vartotoją su laukais User Name ir Password.");
  }

  const normalizedUserName = userName.trim().toLocaleLowerCase();
  const user = users.find((record) => {
    const storedUserName = String(record["User Name"] ?? "").trim().toLocaleLowerCase();
    const storedPassword = String(record.Password ?? "");
    return storedUserName === normalizedUserName && storedPassword === password;
  });
  return user ? { name: user["User Name"] } : null;
}

export async function getTasks(userName) {
  const records = recordsFrom(await request(TASKS_URL));
  return records
    .filter((record) => record["User Name"] === userName)
    .map(normalizeTask);
}

export async function createTask(task) {
  const record = await request(TASKS_URL, {
    method: "POST",
    body: JSON.stringify({
      Title: task.title,
      "Due Date": task.deadline,
      Status: task.status,
      "User Name": task.userName,
    }),
  });
  return normalizeTask(record);
}

export async function updateTask(task, changes) {
  const record = await request(`${TASKS_URL}/${task.id}`, {
    method: "PUT",
    body: JSON.stringify({
      Title: task.title,
      "Due Date": changes.deadline ?? task.deadline,
      Status: changes.status ?? task.status,
      "User Name": task.userName,
    }),
  });
  return { ...task, ...normalizeTask(record) };
}
