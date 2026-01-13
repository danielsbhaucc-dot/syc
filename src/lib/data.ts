export type UnitStatus = "Nominal" | "Warning" | "Critical";

export interface Unit {
  id: string;
  name: string;
  commander: string;
  status: UnitStatus;
  personnel: {
    authorized: number;
    assigned: number;
  };
  equipment: {
    authorized: number;
    onHand: number;
  };
  readiness: number; // percentage
}

export const mockUnits: Unit[] = [
  {
    id: "1-501-pir",
    name: "1-501st PIR",
    commander: "LTC Rogers",
    status: "Nominal",
    personnel: {
      authorized: 650,
      assigned: 642,
    },
    equipment: {
      authorized: 1200,
      onHand: 1180,
    },
    readiness: 97,
  },
  {
    id: "3-509-pir",
    name: "3-509th PIR",
    commander: "LTC Smith",
    status: "Warning",
    personnel: {
      authorized: 650,
      assigned: 610,
    },
    equipment: {
      authorized: 1200,
      onHand: 1050,
    },
    readiness: 89,
  },
  {
    id: "1-40-cav",
    name: "1-40th CAV",
    commander: "LTC Jones",
    status: "Nominal",
    personnel: {
      authorized: 450,
      assigned: 445,
    },
    equipment: {
      authorized: 800,
      onHand: 790,
    },
    readiness: 99,
  },
  {
    id: "725-bsb",
    name: "725th BSB",
    commander: "LTC Williams",
    status: "Critical",
    personnel: {
      authorized: 500,
      assigned: 420,
    },
    equipment: {
      authorized: 1500,
      onHand: 1100,
    },
    readiness: 76,
  },
  {
    id: "2-377-pfar",
    name: "2-377th PFAR",
    commander: "LTC Brown",
    status: "Warning",
    personnel: {
      authorized: 550,
      assigned: 515,
    },
    equipment: {
      authorized: 950,
      onHand: 890,
    },
    readiness: 91,
  },
];
