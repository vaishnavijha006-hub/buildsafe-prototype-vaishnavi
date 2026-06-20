// Seed data — multiple workers across multiple active projects.
// This is what makes the demo feel like a real system instead of a
// single-user toy: a contractor managing several sites, each with
// several workers at different wage bands and roles.

export const PROJECTS = [
  {
    id: "PRJ-101",
    name: "Sector-21 Metro Extension — Site B",
    location: "Ghaziabad, UP",
    wageLocked: 187000,
    startDate: "2026-05-12",
  },
  {
    id: "PRJ-102",
    name: "Greenfield Heights Tower-3",
    location: "Noida, UP",
    wageLocked: 96000,
    startDate: "2026-06-02",
  },
];

export const WORKERS = [
  {
    id: "BSW-4821",
    name: "Ramesh Kumar",
    role: "Mason",
    projectId: "PRJ-101",
    dailyWage: 650,
    phone: "98XXXXXX12",
    joinedOn: "2026-05-12",
  },
  {
    id: "BSW-4822",
    name: "Sunita Devi",
    role: "Helper",
    projectId: "PRJ-101",
    dailyWage: 480,
    phone: "98XXXXXX45",
    joinedOn: "2026-05-14",
  },
  {
    id: "BSW-4823",
    name: "Irfan Ali",
    role: "Electrician",
    projectId: "PRJ-101",
    dailyWage: 720,
    phone: "98XXXXXX78",
    joinedOn: "2026-05-20",
  },
  {
    id: "BSW-4824",
    name: "Birju Mahato",
    role: "Welder",
    projectId: "PRJ-102",
    dailyWage: 700,
    phone: "98XXXXXX91",
    joinedOn: "2026-06-02",
  },
  {
    id: "BSW-4825",
    name: "Kamla Bai",
    role: "Helper",
    projectId: "PRJ-102",
    dailyWage: 480,
    phone: "98XXXXXX23",
    joinedOn: "2026-06-03",
  },
];

export function getWorkerById(id) {
  return WORKERS.find((w) => w.id === id);
}

export function getProjectById(id) {
  return PROJECTS.find((p) => p.id === id);
}

export function getWorkersByProject(projectId) {
  return WORKERS.filter((w) => w.projectId === projectId);
}
