import type { Database, Student, ContentItem } from "./types";
const item = (
  id: string,
  title: string,
  subtitle: string,
  description: string,
  url = "",
  tags = "",
): ContentItem => ({ id, title, subtitle, description, url, tags });
export function createSeed(): Database {
  const visibility = {
    education: true,
    skills: true,
    projects: true,
    certificates: true,
    achievements: true,
    experience: true,
    memberships: true,
    records: true,
  };
  const base = {
    college: "Aura Institute of Technology",
    course: "B.Tech · AI & Data Science",
    year: "Second year",
    location: "Pune, India",
    status: "active" as const,
    public: true,
    visibility,
    email: "",
    website: "",
    education: [
      item(
        "edu",
        "B.Tech in AI & Data Science",
        "Aura Institute of Technology · 2025–2029",
        "Exploring intelligent systems, data and human-centered technology.",
      ),
    ],
    certificates: [],
    achievements: [],
    experience: [],
  };
  const students: Student[] = [
    {
      ...base,
      id: "anuj",
      name: "Anuj Dhavane",
      slug: "anuj-dhavane",
      initials: "AD",
      color: "mint",
      headline: "Building thoughtful things with data & code.",
      bio: "AI & Data Science student, curious builder, and a firm believer that the best way to learn is to make something. Currently exploring machine learning and the little ideas that make campus life better.",
      skills: ["Python", "React", "Machine Learning", "Figma", "SQL"],
      projects: [
        item(
          "p1",
          "Campus Compass",
          "A little less lost. A lot more connected.",
          "An accessible campus discovery concept. I designed the interface, built the React prototype and mapped the student onboarding experience.",
          "",
          "React,TypeScript,UX Design",
        ),
        item(
          "p2",
          "Leaf Lens",
          "Small model. Greener possibilities.",
          "An exploratory image classification project for recognizing plant health. Built and evaluated a baseline model using a public dataset.",
          "",
          "Python,TensorFlow",
        ),
      ],
      certificates: [
        item(
          "cert1",
          "Introduction to Machine Learning",
          "Self-reported · Sample certificate",
          "Completed a foundational course covering supervised learning and model evaluation.",
        ),
      ],
      achievements: [
        item(
          "ach1",
          "Built my first end-to-end application",
          "Self-reported · October 2026",
          "Designed, developed, and presented a campus discovery prototype.",
        ),
      ],
      experience: [
        item(
          "exp1",
          "Student design volunteer",
          "Campus Innovation Week · 2026",
          "Created accessible event graphics and supported the registration desk.",
        ),
      ],
    },
    {
      ...base,
      id: "riya",
      name: "Riya Shah",
      slug: "riya-shah",
      initials: "RS",
      color: "lilac",
      headline: "Making space for ideas that matter.",
      bio: "Developer, community builder, and Coding Club lead. I love bringing people together to build things they are proud of.",
      skills: ["TypeScript", "React", "Community building"],
      projects: [
        item(
          "rp",
          "Open Notes",
          "Learning, together.",
          "A collaborative study resource concept with accessible navigation.",
          "",
          "React,Design",
        ),
      ],
    },
    {
      ...base,
      id: "kabir",
      name: "Kabir Mehta",
      slug: "kabir-mehta",
      initials: "KM",
      color: "peach",
      headline: "Turning good questions into better ideas.",
      bio: "Student entrepreneur exploring sustainable products and the communities that make them possible.",
      skills: ["Product strategy", "Public speaking", "Research"],
      projects: [
        item(
          "kp",
          "Refill Loop",
          "Less waste, more possibility.",
          "A campus refill service concept, informed by student interviews.",
          "",
          "Research,Sustainability",
        ),
      ],
    },
  ];
  const today = new Date();
  today.setDate(today.getDate() + 10);
  today.setHours(10, 0, 0, 0);
  const past = new Date();
  past.setDate(past.getDate() - 14);
  past.setHours(10, 0, 0, 0);
  const issued = past.toISOString();
  return {
    version: 1,
    students: students.map((s) => structuredClone(s)),
    clubs: [
      {
        id: "coding",
        slug: "coding-club",
        name: "Coding Club",
        category: "Technology",
        description:
          "A community for the curious. We build, break, learn, and help each other turn ideas into working projects.",
        objective:
          "Make building with technology accessible to every student, one shared project at a time.",
        initials: "</>",
        color: "mint",
        status: "approved",
        members: [
          { studentId: "riya", title: "Club President", role: "owner" },
          { studentId: "kabir", title: "Technical Coordinator", role: "admin" },
          { studentId: "anuj", title: "Community Member", role: "member" },
        ],
        announcements: [
          {
            id: "a1",
            title: "Your next idea belongs here.",
            body: "Campus Build Sprint is open for registrations. Bring a small idea and a curious mind — we will help with the rest.",
            date: issued,
          },
        ],
        handoverTo: null,
      },
      {
        id: "enterprise",
        slug: "entrepreneurship-club",
        name: "Entrepreneurship Club",
        category: "Entrepreneurship",
        description:
          "For the what-if thinkers and the let’s-try-it people. Explore problems, test ideas, and build with purpose.",
        objective:
          "Help students turn real problems into thoughtful, testable business ideas.",
        initials: "↗",
        color: "peach",
        status: "pending",
        members: [
          { studentId: "kabir", title: "Club President", role: "owner" },
          { studentId: "riya", title: "Community Lead", role: "admin" },
        ],
        announcements: [],
        handoverTo: null,
      },
    ],
    events: [
      {
        id: "sprint",
        clubId: "coding",
        name: "Campus Build Sprint",
        description:
          "One day. One idea. Something real. Team up with fellow builders for a hands-on sprint exploring useful campus tools. All skill levels welcome. Bring your laptop, your questions, and something you would love to make.",
        date: today.toISOString(),
        venue: "Innovation Lab · Block B",
        capacity: 30,
        status: "published",
        registrationOpen: true,
        theme: "mint",
      },
      {
        id: "design",
        clubId: "coding",
        name: "Design to Deploy",
        description:
          "An afternoon of moving from rough sketches to working web experiences. Students explored accessible interfaces, component design, and collaborative development.",
        date: past.toISOString(),
        venue: "Creative Studio · Block A",
        capacity: 25,
        status: "completed",
        registrationOpen: false,
        theme: "lilac",
      },
    ],
    registrations: [
      {
        id: "r1",
        eventId: "sprint",
        studentId: "riya",
        status: "registered",
        attended: false,
        date: issued,
      },
      {
        id: "r2",
        eventId: "sprint",
        studentId: "kabir",
        status: "registered",
        attended: false,
        date: issued,
      },
      {
        id: "r3",
        eventId: "design",
        studentId: "anuj",
        status: "registered",
        attended: true,
        date: issued,
      },
      {
        id: "r4",
        eventId: "design",
        studentId: "kabir",
        status: "registered",
        attended: true,
        date: issued,
      },
    ],
    records: [
      {
        id: "record-accepted",
        studentId: "anuj",
        clubId: "coding",
        eventId: "design",
        type: "Participant",
        description:
          "Built and presented an accessible campus discovery prototype during the workshop.",
        issuerId: "riya",
        issuedAt: issued,
        status: "confirmed",
        acceptance: "accepted",
        public: true,
      },
      {
        id: "record-pending",
        studentId: "anuj",
        clubId: "coding",
        eventId: "design",
        type: "Volunteer",
        description:
          "Helped welcome participants and supported the workshop check-in desk.",
        issuerId: "riya",
        issuedAt: issued,
        status: "confirmed",
        acceptance: "pending",
        public: false,
      },
      {
        id: "record-revoked",
        studentId: "anuj",
        clubId: "coding",
        eventId: "design",
        type: "Winner",
        description: "Originally listed as a workshop award recipient.",
        issuerId: "riya",
        issuedAt: issued,
        status: "revoked",
        acceptance: "accepted",
        public: true,
        revokedReason:
          "Demo correction: this workshop did not include a competitive award.",
      },
    ],
    audit: [
      {
        id: "audit1",
        date: issued,
        actor: "riya",
        action: "Confirmation issued",
        target: "record-accepted",
        detail: "Participant · Design to Deploy",
      },
      {
        id: "audit2",
        date: issued,
        actor: "anuj",
        action: "Record accepted",
        target: "record-accepted",
        detail: "Student selected public visibility",
      },
      {
        id: "audit3",
        date: issued,
        actor: "riya",
        action: "Confirmation issued",
        target: "record-pending",
        detail: "Volunteer · Design to Deploy",
      },
      {
        id: "audit4",
        date: issued,
        actor: "riya",
        action: "Confirmation issued",
        target: "record-revoked",
        detail: "Winner · Design to Deploy",
      },
      {
        id: "audit5",
        date: issued,
        actor: "riya",
        action: "Confirmation revoked",
        target: "record-revoked",
        detail:
          "Demo correction: this workshop did not include a competitive award.",
      },
    ],
    reports: [
      {
        id: "report1",
        studentId: "anuj",
        recordId: "record-revoked",
        reason: "The workshop did not have a winner category.",
        status: "resolved",
        resolution:
          "Organizer corrected the record by revoking its confirmation.",
      },
    ],
  };
}
