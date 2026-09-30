// EDIT YOUR PORTFOLIO DETAILS HERE. Replace the sample entries with your own.
const PORTFOLIO = {
  profile: {
    name: "Manuel Giron",
    brand: "Mewtwo.github.io",
    handle: "Manuel Giron",
    discipline: "Physics",
    role: "Theoretical",
    availability: "Open to applied, experimental and theoretical physics opportunities",
    summary: "I turn engineering concepts into practical designs through CAD, analysis, and hands-on problem solving.",
    terminalTagline: "Design carefully. Build reliably.",
    contactPrompt: "Let's build something that works.",
    contactIntro: "I’m interested in mechanical engineering internships and roles. Reach me through the links below.",
    pageDescription: "Mechanical engineering portfolio featuring design skills, experience, projects, and contact information.",
    contacts: [
      { label: "LinkedIn", value: "linkedin.com/in/mewtwo", url: "https://www.linkedin.com/in/mewtwo" },
      { label: "GitHub", value: "github.com/mewtwo", url: "https://github.com/mewtwo" },
    ],
  },
  sections: {
    skills: { title: "Engineering toolkit", subtitle: "Design, analysis, and manufacturing skills used to take ideas toward buildable parts." },
    experience: { title: "Experience", subtitle: "Internships, research, teams, and academic engineering work." },
    projects: { title: "Design projects", subtitle: "Selected mechanical design and engineering work." },
  },
  skills: [
    { group: "CAD & Design", type: "Design tools", style: "red", items: ["SolidWorks", "Fusion 360", "AutoCAD", "Technical Drawings", "Assemblies"] },
    { group: "Analysis", type: "Engineering methods", style: "yellow", items: ["Statics", "Mechanics of Materials", "FEA", "Thermodynamics", "GD&T"] },
    { group: "Manufacturing", type: "Build methods", style: "ink", items: ["DFM", "CNC Machining", "3D Printing", "Metrology", "Prototyping"] },
    { group: "Engineering Tools", type: "Technical tools", style: "outline", items: ["MATLAB", "Python", "Excel", "Data Analysis", "Technical Documentation"] },
  ],
  experience: [
    {
      role: "Replace with your role or project team",
      organization: "Company, lab, university, or team",
      period: "Dates",
      description: "Sample timeline entry. Replace this with a short summary of your responsibilities and impact.",
      highlights: ["Example: created or revised a CAD assembly", "Example: tested a design and reported findings"],
    },
    {
      role: "Replace with another experience",
      organization: "Company, lab, university, or team",
      period: "Dates",
      description: "Add an internship, research role, student team, or relevant coursework project.",
      highlights: ["Add a specific engineering contribution", "Add a result, tool, or measurable outcome"],
    },
  ],
  projects: [
    {
      name: "Example: Lightweight Bracket Redesign",
      description: "Sample project. Replace with the design challenge, constraints, and outcome from your own work.",
      highlights: ["Describe your CAD and analysis workflow", "Add a verified weight, cost, or performance result"],
      tech: ["SolidWorks", "FEA", "GD&T"],
    },
    {
      name: "Example: Test Fixture Design",
      description: "Sample project. Summarize what the fixture tests and how you designed or validated it.",
      highlights: ["Describe the requirements and design iterations", "Add fabrication and test details"],
      tech: ["Fusion 360", "Prototyping", "Metrology"],
    },
    {
      name: "Example: Thermal System Study",
      description: "Sample project. Replace with an analysis, lab, or course project you can discuss in detail.",
      highlights: ["Describe the model, assumptions, and method", "Add the result and what you learned"],
      tech: ["MATLAB", "Thermodynamics", "Data Analysis"],
    },
  ],
};

const TERMINAL_SCRIPT = [
  { cmd: "whoami", out: PORTFOLIO.profile.name.toLowerCase().replaceAll(" ", "-") },
  { cmd: "cat discipline.txt", out: `${PORTFOLIO.profile.discipline} · ${PORTFOLIO.profile.role}` },
  { cmd: "ls engineering/", out: PORTFOLIO.skills.map((group) => group.items[0]).join("  ") },
  { cmd: "./design --for-reliability", out: PORTFOLIO.profile.terminalTagline, accent: true },
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child) node.append(child);
  }
  return node;
}

function styleForTech(tech) {
  const match = PORTFOLIO.skills.find((skill) => skill.items.includes(tech));
  return match ? match.style : "outline";
}

function renderPortfolioText() {
  const { profile, sections } = PORTFOLIO;
  document.title = `${profile.name} | ${profile.role}`;
  document.querySelector('meta[name="description"]').content = profile.pageDescription;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = profile.pageDescription;
  document.querySelector(".brand").setAttribute("aria-label", `${profile.name}, home`);
  document.getElementById("brand-name").textContent = profile.brand;
  document.getElementById("terminal-home").textContent = `~/${profile.handle}`;
  document.getElementById("hero-title").textContent = profile.name;
  document.getElementById("availability").textContent = profile.availability;
  document.getElementById("profile-discipline").textContent = profile.discipline;
  document.getElementById("profile-role").textContent = profile.role;
  document.getElementById("profile-summary").textContent = profile.summary;
  document.getElementById("skills-title").textContent = sections.skills.title;
  document.getElementById("skills-subtitle").textContent = sections.skills.subtitle;
  document.getElementById("experience-title").textContent = sections.experience.title;
  document.getElementById("experience-subtitle").textContent = sections.experience.subtitle;
  document.getElementById("projects-title").textContent = sections.projects.title;
  document.getElementById("projects-subtitle").textContent = sections.projects.subtitle;
  document.getElementById("battle-line").textContent = profile.contactPrompt;
  document.getElementById("contact-intro").textContent = profile.contactIntro;
  document.getElementById("footer-name").textContent = profile.name;

  const contactLinks = document.getElementById("contact-links");
  contactLinks.replaceChildren(...profile.contacts.map((contact) => {
    const external = /^https?:/i.test(contact.url);
    return el("li", {}, [
      el("a", {
        class: "battle-option",
        href: contact.url,
        ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
      }, [
        el("span", { class: "caret", "aria-hidden": "true", text: "▶" }),
        el("span", { class: "option-body" }, [
          el("span", { class: "option-title", text: contact.label }),
          el("span", { class: "option-meta", text: contact.value }),
        ]),
        external ? el("span", { class: "sr-only", text: "(opens in a new tab)" }) : null,
      ]),
    ]);
  }));
}

function renderSkills() {
  const grid = document.getElementById("skills-grid");
  for (const skill of PORTFOLIO.skills) {
    const pills = el(
      "ul",
      { class: "pills", "aria-label": skill.group },
      skill.items.map((item) => el("li", { class: `pill pill--${skill.style}`, text: item }))
    );
    grid.append(
      el("article", { class: "skill-card" }, [
        el("div", { class: "skill-card-head" }, [
          el("h3", { text: skill.group }),
          el("span", { class: "type-label", text: skill.type }),
        ]),
        pills,
      ])
    );
  }
}

function renderExperience() {
  const timeline = document.getElementById("experience-timeline");
  if (!PORTFOLIO.experience.length) {
    timeline.append(el("li", { class: "experience-empty", text: "Add internships, research, teams, or relevant coursework to the EXPERIENCE list near the top of script.js." }));
    return;
  }

  PORTFOLIO.experience.forEach((item) => {
    timeline.append(
      el("li", { class: "experience-entry" }, [
        el("div", { class: "experience-marker", "aria-hidden": "true" }),
        el("article", { class: "experience-content" }, [
          el("div", { class: "experience-heading" }, [
            el("div", {}, [
              el("h3", { text: item.role }),
              el("p", { class: "experience-org", text: item.organization }),
            ]),
            el("span", { class: "experience-period", text: item.period }),
          ]),
          el("p", { class: "experience-desc", text: item.description }),
          item.highlights?.length
            ? el("ul", { class: "experience-highlights" }, item.highlights.map((highlight) => el("li", { text: highlight })))
            : null,
        ])
      ])
    );
  });
}

function renderProjects() {
  const grid = document.getElementById("projects-grid");
  PORTFOLIO.projects.forEach((project, index) => {
    const number = String(index + 1).padStart(3, "0");
    const card = el("li", { class: "project", "data-tech": project.tech.join("|") }, [
      el("div", { class: "project-top" }, [
        el("span", {}, [el("span", { class: "dex-no", text: `SAMPLE / ${number}` })]),
        el("span", { class: "ball", "aria-hidden": "true" }),
      ]),
      el("div", { class: "project-body" }, [
        el("h3", { text: project.name }),
        el("p", { class: "project-desc", text: project.description }),
        project.highlights?.length
          ? el(
              "ul",
              { class: "project-highlights" },
              project.highlights.map((h) => el("li", { text: h }))
            )
          : null,
        el("div", { class: "project-foot" }, [
          el(
            "ul",
            { class: "pills", "aria-label": "Technologies" },
            project.tech.map((t) => el("li", { class: `pill pill--${styleForTech(t)}`, text: t }))
          ),
          el("div", { class: "project-links" }, [
            project.source
              ? el(
                  "a",
                  { href: project.source, target: "_blank", rel: "noopener noreferrer" },
                  [`Source code`, el("span", { class: "sr-only", text: ` for ${project.name} (opens in a new tab)` })]
                )
              : null,
            project.demo
              ? el(
                  "a",
                  { href: project.demo, target: "_blank", rel: "noopener noreferrer" },
                  [`Live demo`, el("span", { class: "sr-only", text: ` for ${project.name} (opens in a new tab)` })]
                )
              : null,
          ]),
        ]),
      ]),
    ]);
    grid.append(card);
  });
}

function renderFilters() {
  const container = document.getElementById("filters");
  const empty = document.getElementById("projects-empty");
  const cards = [...document.querySelectorAll(".project")];
  const techs = ["All", ...new Set(PORTFOLIO.projects.flatMap((project) => project.tech))];

  const buttons = techs.map((tech) =>
    el("button", {
      class: "filter",
      type: "button",
      "aria-pressed": tech === "All" ? "true" : "false",
      "data-tech": tech,
      text: tech,
    })
  );
  container.append(...buttons);

  container.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (!button) return;
    const selected = button.dataset.tech;

    for (const b of buttons) b.setAttribute("aria-pressed", String(b === button));

    let visible = 0;
    for (const card of cards) {
      const show = selected === "All" || card.dataset.tech.split("|").includes(selected);
      card.hidden = !show;
      if (show) visible++;
    }
    empty.hidden = visible > 0;
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTerminal() {
  const term = document.getElementById("terminal");
  if (!term) return;
  term.setAttribute("aria-label", TERMINAL_SCRIPT.map((l) => `${l.cmd}: ${l.out}`).join(". "));

  const cursor = el("span", { class: "cursor", "aria-hidden": "true" });

  const writeLine = (line) => {
    const cmd = el("span", {}, [el("span", { class: "prompt", text: "$ " }), line.cmd]);
    const out = el("span", { class: line.accent ? "accent" : "out", text: line.out });
    term.append(cmd, "\n", out, "\n");
  };

  if (reduceMotion) {
    TERMINAL_SCRIPT.forEach(writeLine);
    term.append(el("span", { class: "prompt", text: "$ " }), cursor);
    return;
  }

  await sleep(700);
  for (const line of TERMINAL_SCRIPT) {
    const cmdSpan = el("span");
    term.append(el("span", { class: "prompt", text: "$ " }), cmdSpan, cursor);
    for (const char of line.cmd) {
      cmdSpan.textContent += char;
      await sleep(38 + Math.random() * 40);
    }
    await sleep(260);
    cursor.remove();
    term.append("\n", el("span", { class: line.accent ? "accent" : "out", text: line.out }), "\n");
    await sleep(420);
  }
  term.append(el("span", { class: "prompt", text: "$ " }), cursor);
}

function setupBattleText() {
  const line = document.getElementById("battle-line");
  if (!line || reduceMotion || !("IntersectionObserver" in window)) return;
  const full = line.textContent;
  line.setAttribute("aria-label", full);
  line.textContent = "";

  const observer = new IntersectionObserver(
    async (entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      for (const char of full) {
        line.textContent += char;
        await sleep(32);
      }
    },
    { threshold: 0.6 }
  );
  observer.observe(line);
}

function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    links.classList.toggle("is-open", !open);
  });

  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("is-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && links.classList.contains("is-open")) {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("is-open");
      toggle.focus();
    }
  });

  if (!("IntersectionObserver" in window)) return;
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of navLinks) {
          if (link.getAttribute("href") === `#${entry.target.id}`) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) observer.observe(section);
  });
}

document.getElementById("year").textContent = new Date().getFullYear();
renderPortfolioText();
renderSkills();
renderExperience();
renderProjects();
renderFilters();
setupNav();
setupBattleText();
runTerminal();
