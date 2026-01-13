// This file is no longer in use now that we are fetching data from Firestore.
// It can be deleted.
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
    name: "גדוד 501",
    commander: "סא\"ל רוג'רס",
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
    name: "גדוד 509",
    commander: "סא\"ל סמית'",
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
    name: "סיירת 40",
    commander: "סא\"ל ג'ונס",
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
    name: "גדוד 725",
    commander: "סא\"ל ויליאמס",
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
    name: "גדוד 377",
    commander: "סא\"ל בראון",
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
