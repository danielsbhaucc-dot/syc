import { NextResponse } from 'next/server';

// In a real-world app, you would fetch and process this data from a database.
// For this simulation, we are hardcoding the detailed structure.

function generateReportData(battalionId: string) {
    // This is where you would query your DB for users, equipment, roles, etc.
    // and then construct the report object.

    const report = {
        platoonName: "מחלקת חבלה",
        companyName: "פלוגת חוד",
        headerStats: {
            weapons_m4: "30 יח' M4",
            weapons_negev: "3 יח' נגב",
            optics_m5: "27/30 כוונות M5",
            optics_lior: "4/6 ליאור",
            comms_624: "3 מ.ק 624",
            comms_710: "2 מ.ק 710",
            special_launcher: "3 מטול | 2 לאו",
            special_rockets: "1 מטאדור",
            personal_knives: "25/30 אולרים",
            personal_headlights: "30/30 פנסי ראש",
        },
        hqSquad: {
            commander: { name: "אלון", role: "מפקד<br>מחלקה", icon: "fa-user-tie", items: ["M4", "כוונת M5", "מ.ק 624", "משקפת"] },
            sergeant: { name: "רועי", role: "סמל<br>מחלקה", icon: "fa-user-shield", items: ["M4", "כוונת M5", "מ.ק 624", "לדרמן"] },
            comms: { name: "יואב", role: "קשר<br>מ\"מ", icon: "fa-walkie-talkie", items: ["M4", "מ.ק 710", "סוללות", "לדרמן"] },
            medic: { name: "דניאל", role: "חובש<br>פלוגתי", icon: "fa-user-nurse", items: ["M4", "תיק חובש", "אלונקה"], gap: "חסרה תעודה" },
            sappers: [
                { name: "גיא", role: "חבלן<br>בכיר", icon: "fa-bomb", items: ["M4", "מערכת חבלה", "פלייר חבלה"] },
                { name: null, role: "חבלן ב'<br>(חסר)", icon: "fa-user-slash", items: [], gap: "פער: נדרש קורס" },
            ]
        },
        squads: [
            {
                id: 1,
                commander: "אורן",
                soldiers: [
                    { id: 1, team: "chod", role: "מוביל חוד", name: "אופק", icon: "fa-person-rifle", items: ["M4", "מטול", "מטאדור", "לדרמן"] },
                    { id: 2, team: "chod", role: "רובאי חוד", name: "ניר", icon: "fa-person-rifle", items: ["M4", "ליאור", "אמר\"ל"], gap: "פער: חסר סוללות" },
                    { id: 3, team: "ratak", role: "נגביסט", name: "תומר", icon: "fa-person-rays", items: ["נגב", "אקילה", "תוף רזרבי"] },
                    { id: 4, team: "ratak", role: "ע. נגביסט", name: "עידן", icon: "fa-person-rifle", items: ["M4", "M5", "קנה רזרבי", "לדרמן"] },
                    { id: 5, team: "cmd", role: "מפקד כיתה", name: "אורן", icon: "fa-user-circle", items: ["M4", "M5", "מ.ק 624", "משקפת"] },
                    { id: 6, team: "cmd", role: "קשר מ\"כ", name: "אדיר", icon: "fa-walkie-talkie", items: ["M4", "M5", "מ.ק 710"] },
                    { id: 7, team: "cmd", role: "קלע/רובאי", name: "בר", icon: "fa-crosshairs", items: ["M4", "כוונת צלפים"], gap: "פער: חסר כוונת תקינה" },
                    { id: 8, team: "cmd", role: "מע\"ר", name: "שקד", icon: "fa-kit-medical", items: ["M4", "תיק מע\"ר", "M5"] }
                ]
            },
            // Add other squads here if needed
        ]
    };

    return report;
}

export async function GET(request: Request, { params }: { params: { battalionId: string } }) {
  const reportData = generateReportData(params.battalionId);

  if (reportData) {
      return NextResponse.json(reportData);
  } else {
      return NextResponse.json({ message: "Report data not found or failed to load." }, { status: 404 });
  }
}