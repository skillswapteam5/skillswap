/* =====================================================================
   SkillSwap - Sample (seed) data
   ---------------------------------------------------------------------
   This is the starting data of the website. The first time the site is
   opened, this data is copied into the browser's localStorage.
   After that, all changes (new users, requests, projects...) are saved
   in localStorage. Use "Reset demo data" in the sidebar to start again.

   All sample accounts use the password: 123456
   Main demo account:  demo@skillswap.com / 123456
   ===================================================================== */

var SEED_DATA = {

  skills: [
    { id: 1,  name: "HTML & CSS",         category: "Web Development" },
    { id: 2,  name: "JavaScript",         category: "Web Development" },
    { id: 3,  name: "PHP",                category: "Web Development" },
    { id: 4,  name: "Python",             category: "Programming" },
    { id: 5,  name: "Java",               category: "Programming" },
    { id: 6,  name: "C++",                category: "Programming" },
    { id: 7,  name: "Mobile Development", category: "Programming" },
    { id: 8,  name: "Cyber Security",     category: "Programming" },
    { id: 9,  name: "SQL & Databases",    category: "Data & AI" },
    { id: 10, name: "Data Analysis",      category: "Data & AI" },
    { id: 11, name: "Machine Learning",   category: "Data & AI" },
    { id: 12, name: "Cloud Computing",    category: "Data & AI" },
    { id: 13, name: "UI/UX Design",       category: "Design" },
    { id: 14, name: "Graphic Design",     category: "Design" },
    { id: 15, name: "Figma",              category: "Design" },
    { id: 16, name: "Video Editing",      category: "Media" },
    { id: 17, name: "Photography",        category: "Media" },
    { id: 18, name: "Content Writing",    category: "Media" },
    { id: 19, name: "Digital Marketing",  category: "Business" },
    { id: 20, name: "Project Management", category: "Business" },
    { id: 21, name: "Excel",              category: "Business" },
    { id: 22, name: "Public Speaking",    category: "Soft Skills" },
    { id: 23, name: "Leadership",         category: "Soft Skills" },
    { id: 24, name: "English",            category: "Languages" },
    { id: 25, name: "French",             category: "Languages" },
    { id: 26, name: "German",             category: "Languages" },
    { id: 27, name: "Guitar",             category: "Arts & Music" },
    { id: 28, name: "Arabic Calligraphy", category: "Arts & Music" },
    { id: 29, name: "Git & GitHub",       category: "Programming" }
  ],

  // teach: [{ skill: id, level }]   learn: [{ skill: id, progress: 0-100 }]
  users: [
    { id: 1, name: "Omar Khaled", email: "demo@skillswap.com", password: "123456",
      title: "Computer Science Student", university: "Cairo University",
      bio: "Front-end lover who enjoys teaching web basics. Currently learning UI/UX and Machine Learning.",
      color: "#6C4CF1", points: 320, joined: "2026-09-01",
      teach: [{ skill: 1, level: "Advanced" }, { skill: 2, level: "Intermediate" }, { skill: 24, level: "Advanced" }],
      learn: [{ skill: 13, progress: 40 }, { skill: 11, progress: 20 }, { skill: 22, progress: 60 }] },

    { id: 2, name: "Sara Ahmed", email: "sara@skillswap.com", password: "123456",
      title: "UI/UX Designer", university: "German University in Cairo",
      bio: "I design clean and friendly interfaces. Happy to teach Figma in exchange for coding skills.",
      color: "#3B82F6", points: 540, joined: "2026-08-20",
      teach: [{ skill: 13, level: "Advanced" }, { skill: 15, level: "Advanced" }, { skill: 14, level: "Intermediate" }],
      learn: [{ skill: 2, progress: 30 }, { skill: 4, progress: 10 }] },

    { id: 3, name: "Youssef Mahmoud", email: "youssef@skillswap.com", password: "123456",
      title: "Machine Learning Engineer", university: "Ain Shams University",
      bio: "Building AI models for fun and work. Want to improve my front-end and presentation skills.",
      color: "#8B5CF6", points: 780, joined: "2026-08-05",
      teach: [{ skill: 4, level: "Advanced" }, { skill: 11, level: "Advanced" }, { skill: 10, level: "Intermediate" }],
      learn: [{ skill: 1, progress: 50 }, { skill: 22, progress: 25 }] },

    { id: 4, name: "Nour Hassan", email: "nour@skillswap.com", password: "123456",
      title: "Digital Marketing Specialist", university: "American University in Cairo",
      bio: "Marketing, content and storytelling. Looking to learn design and Excel.",
      color: "#EC4899", points: 410, joined: "2026-08-28",
      teach: [{ skill: 19, level: "Advanced" }, { skill: 18, level: "Advanced" }, { skill: 22, level: "Intermediate" }],
      learn: [{ skill: 14, progress: 35 }, { skill: 21, progress: 15 }] },

    { id: 5, name: "Karim Adel", email: "karim@skillswap.com", password: "123456",
      title: "Backend Developer", university: "Alexandria University",
      bio: "Java and databases are my thing. Interested in mobile and cloud.",
      color: "#0EA5E9", points: 260, joined: "2026-09-10",
      teach: [{ skill: 5, level: "Advanced" }, { skill: 9, level: "Advanced" }, { skill: 8, level: "Intermediate" }],
      learn: [{ skill: 7, progress: 20 }, { skill: 12, progress: 5 }] },

    { id: 6, name: "Laila Mostafa", email: "laila@skillswap.com", password: "123456",
      title: "Languages Student", university: "Helwan University",
      bio: "Native-level French speaker. I love photography and want to learn video editing.",
      color: "#F59E0B", points: 190, joined: "2026-09-15",
      teach: [{ skill: 25, level: "Advanced" }, { skill: 24, level: "Intermediate" }, { skill: 17, level: "Intermediate" }],
      learn: [{ skill: 16, progress: 30 }, { skill: 13, progress: 10 }] },

    { id: 7, name: "Ahmed Samir", email: "ahmed@skillswap.com", password: "123456",
      title: "Video Editor & Photographer", university: "Cairo University",
      bio: "Freelance video editor. I can teach editing and photography, want to learn marketing.",
      color: "#10B981", points: 630, joined: "2026-08-12",
      teach: [{ skill: 16, level: "Advanced" }, { skill: 17, level: "Advanced" }, { skill: 14, level: "Advanced" }],
      learn: [{ skill: 19, progress: 45 }, { skill: 24, progress: 70 }] },

    { id: 8, name: "Mariam Tarek", email: "mariam@skillswap.com", password: "123456",
      title: "Business Administration Student", university: "Misr International University",
      bio: "Team leader and public speaker. I want to understand data and AI.",
      color: "#EF4444", points: 470, joined: "2026-08-25",
      teach: [{ skill: 22, level: "Advanced" }, { skill: 20, level: "Advanced" }, { skill: 21, level: "Intermediate" }],
      learn: [{ skill: 11, progress: 15 }, { skill: 10, progress: 40 }] },

    { id: 9, name: "Hana Fathy", email: "hana@skillswap.com", password: "123456",
      title: "Mobile App Developer", university: "Nile University",
      bio: "Flutter and JavaScript developer. Learning Figma and German.",
      color: "#14B8A6", points: 350, joined: "2026-09-03",
      teach: [{ skill: 7, level: "Advanced" }, { skill: 2, level: "Advanced" }, { skill: 12, level: "Intermediate" }],
      learn: [{ skill: 15, progress: 55 }, { skill: 26, progress: 20 }] },

    { id: 10, name: "Ziad Ibrahim", email: "ziad@skillswap.com", password: "123456",
      title: "Engineering Student", university: "Ain Shams University",
      bio: "I teach German and guitar. Want to learn Python and photography.",
      color: "#6366F1", points: 150, joined: "2026-10-01",
      teach: [{ skill: 26, level: "Advanced" }, { skill: 6, level: "Intermediate" }, { skill: 27, level: "Advanced" }],
      learn: [{ skill: 4, progress: 10 }, { skill: 17, progress: 0 }] }
  ],

  // status: pending | accepted | rejected | completed | cancelled
  exchanges: [
    { id: 1, from: 2, to: 1, offer: 13, want: 2, status: "pending", date: "2026-11-06",
      message: "Hi Omar! I can teach you UI/UX design basics and you help me with JavaScript?" },
    { id: 2, from: 6, to: 1, offer: 25, want: 1, status: "pending", date: "2026-11-07",
      message: "Bonjour! I'd love to learn HTML & CSS. I can teach you French in return." },
    { id: 3, from: 1, to: 3, offer: 1, want: 11, status: "accepted", date: "2026-10-20",
      message: "Hey Youssef, I can help you with HTML & CSS if you teach me Machine Learning basics." },
    { id: 4, from: 1, to: 8, offer: 24, want: 22, status: "completed", date: "2026-10-02",
      message: "Hi Mariam, English practice in exchange for public speaking tips?" },
    { id: 5, from: 7, to: 4, offer: 16, want: 19, status: "accepted", date: "2026-10-25",
      message: "Video editing for digital marketing - deal?" },
    { id: 6, from: 9, to: 2, offer: 2, want: 15, status: "completed", date: "2026-09-28",
      message: "I can teach JavaScript, I need Figma for my app designs." }
  ],

  reviews: [
    { id: 1, exchange: null, from: 3, to: 1, rating: 5, date: "2026-10-28", comment: "Great teacher! Explained CSS Flexbox and Grid very clearly." },
    { id: 2, exchange: 4, from: 8, to: 1, rating: 5, date: "2026-10-15", comment: "Very patient and organized. Our English sessions were super useful." },
    { id: 3, exchange: 4, from: 1, to: 8, rating: 5, date: "2026-10-15", comment: "Mariam's public speaking tips changed how I present. Highly recommended!" },
    { id: 4, exchange: 6, from: 9, to: 2, rating: 5, date: "2026-10-10", comment: "Sara is a Figma master. Learned components and auto-layout." },
    { id: 5, exchange: 6, from: 2, to: 9, rating: 4, date: "2026-10-10", comment: "Good JavaScript sessions with lots of practical examples." },
    { id: 6, exchange: null, from: 4, to: 7, rating: 5, date: "2026-10-05", comment: "Ahmed made our promo video look professional." },
    { id: 7, exchange: null, from: 6, to: 7, rating: 4, date: "2026-10-08", comment: "Learned a lot about camera settings and lighting." },
    { id: 8, exchange: null, from: 1, to: 3, rating: 5, date: "2026-10-28", comment: "Youssef explains ML concepts in a very simple way." }
  ],

  // status: open | in_progress | completed
  projects: [
    { id: 1, owner: 3, title: "AI Study Buddy Chatbot", status: "in_progress", max: 4, date: "2026-10-10",
      description: "A chatbot that helps students revise by generating quiz questions from their lecture notes.",
      skills: ["Python", "Machine Learning", "HTML & CSS"],
      members: [{ user: 3, role: "Project Lead" }, { user: 1, role: "Front-end Developer" }],
      tasks: [
        { id: 1, title: "Collect sample lecture notes", done: true },
        { id: 2, title: "Train question generator model", done: true },
        { id: 3, title: "Build chat interface", done: true },
        { id: 4, title: "Connect interface with the model", done: false },
        { id: 5, title: "Test with 10 students", done: false }
      ] },

    { id: 2, owner: 1, title: "University Club Website", status: "completed", max: 3, date: "2026-09-12",
      description: "A responsive website for the student activities club with events and a sign-up form.",
      skills: ["HTML & CSS", "JavaScript", "Graphic Design"],
      members: [{ user: 1, role: "Project Lead" }, { user: 8, role: "Content & Planning" }],
      tasks: [
        { id: 6, title: "Design the homepage", done: true },
        { id: 7, title: "Build events page", done: true },
        { id: 8, title: "Write club content", done: true },
        { id: 9, title: "Publish the website", done: true }
      ] },

    { id: 3, owner: 9, title: "Campus Marketplace App", status: "open", max: 5, date: "2026-10-30",
      description: "A mobile app where students can buy, sell and swap used books and tools on campus.",
      skills: ["Mobile Development", "UI/UX Design", "Cloud Computing"],
      members: [{ user: 9, role: "Project Lead" }, { user: 2, role: "UI/UX Designer" }],
      tasks: [
        { id: 10, title: "Create app wireframes", done: true },
        { id: 11, title: "Set up cloud database", done: false },
        { id: 12, title: "Build product listing screen", done: false }
      ] },

    { id: 4, owner: 7, title: "Charity Event Promo Video", status: "completed", max: 4, date: "2026-09-20",
      description: "A short promotional video and social media campaign for a university charity event.",
      skills: ["Video Editing", "Content Writing", "Photography"],
      members: [{ user: 7, role: "Project Lead" }, { user: 4, role: "Copywriter" }, { user: 6, role: "Photographer" }],
      tasks: [
        { id: 13, title: "Write the script", done: true },
        { id: 14, title: "Shoot the footage", done: true },
        { id: 15, title: "Edit and publish", done: true }
      ] },

    { id: 5, owner: 8, title: "Student Budget Tracker", status: "open", max: 4, date: "2026-11-02",
      description: "A simple tool that helps students track spending and visualise their monthly budget.",
      skills: ["Excel", "Data Analysis", "JavaScript"],
      members: [{ user: 8, role: "Project Lead" }],
      tasks: [
        { id: 16, title: "Define budget categories", done: true },
        { id: 17, title: "Build spreadsheet prototype", done: false },
        { id: 18, title: "Create charts dashboard", done: false }
      ] },

    { id: 6, owner: 5, title: "Cyber Security Awareness Campaign", status: "open", max: 5, date: "2026-11-04",
      description: "Posters, a short talk and an online quiz to teach students how to stay safe online.",
      skills: ["Cyber Security", "Graphic Design", "Public Speaking"],
      members: [{ user: 5, role: "Project Lead" }, { user: 4, role: "Campaign Writer" }],
      tasks: [
        { id: 19, title: "List top 10 security tips", done: true },
        { id: 20, title: "Design posters", done: false },
        { id: 21, title: "Prepare the talk", done: false },
        { id: 22, title: "Create online quiz", done: false }
      ] }
  ],

  rewards: [
    { id: 1, icon: "🏅", title: "Premium Profile Badge",   cost: 100, description: "Show a special badge on your Skill Passport." },
    { id: 2, icon: "⭐", title: "Featured Profile (1 week)", cost: 200, description: "Appear at the top of Explore and AI matches." },
    { id: 3, icon: "🎓", title: "1-on-1 Mentor Session",   cost: 300, description: "A 45-minute session with a top-rated mentor." },
    { id: 4, icon: "📜", title: "Verified Skill Certificate", cost: 400, description: "A printable certificate for a skill you taught." },
    { id: 5, icon: "🎟️", title: "Online Course Voucher",    cost: 500, description: "A voucher for a partner online course." },
    { id: 6, icon: "👕", title: "SkillSwap T-Shirt",        cost: 600, description: "Limited edition SkillSwap community T-shirt." }
  ],

  // Points history (only for the demo user, others start with their total)
  transactions: [
    { user: 1, points: 50,  reason: "Welcome bonus for joining SkillSwap", date: "2026-09-01" },
    { user: 1, points: 25,  reason: "Completed your profile", date: "2026-09-01" },
    { user: 1, points: 10,  reason: "Created a project: University Club Website", date: "2026-09-12" },
    { user: 1, points: 20,  reason: "Exchange accepted with Mariam Tarek", date: "2026-10-03" },
    { user: 1, points: 100, reason: "Project completed: University Club Website", date: "2026-10-08" },
    { user: 1, points: 50,  reason: "Exchange completed with Mariam Tarek", date: "2026-10-15" },
    { user: 1, points: 5,   reason: "Wrote a review for Mariam Tarek", date: "2026-10-15" },
    { user: 1, points: 10,  reason: "Received a 5-star review", date: "2026-10-15" },
    { user: 1, points: 20,  reason: "Exchange accepted with Youssef Mahmoud", date: "2026-10-21" },
    { user: 1, points: 15,  reason: "Joined project: AI Study Buddy Chatbot", date: "2026-10-22" },
    { user: 1, points: 15,  reason: "Received a 5-star review", date: "2026-10-28" }
  ],

  redemptions: []
};
