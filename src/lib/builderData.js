// Builder-level data: oversees multiple contractors across projects

export const BUILDERS = [
  {
    id: "BLD-01",
    name: "Aravali Infra Developers",
    totalBudget: 500000,
  },
];

// Maps which contractor manages which project, under which builder
export const CONTRACTOR_ASSIGNMENTS = [
  {
    contractorId: "CTR-01",
    contractorName: "Rajesh Sharma",
    builderId: "BLD-01",
    projectId: "PRJ-101", // matches your existing PROJECTS ids
  },
  {
    contractorId: "CTR-02",
    contractorName: "Meena Kapoor",
    builderId: "BLD-01",
    projectId: "PRJ-102",
  },
];