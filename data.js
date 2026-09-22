/*
 * Data Resources MM — site content
 * ---------------------------------
 * Everything the page shows lives in this one file (no build step).
 *
 * HOW THE DIAGRAM IS MADE
 *   Each field lists the TOOLS it uses. The page then works out the diagram:
 *     - circle size   = how many tools the field uses
 *     - overlap size  = how many tools two fields share
 *     - COMMON_TOOLS (below) are left out of the diagram
 *   So to change the diagram, just edit the tool lists. Use the exact same
 *   spelling for the same tool in different fields ("Docker", not "docker").
 *
 * COMMON_TOOLS — tools almost everyone uses (e.g. Python, Git). They are kept in the
 *   tool lists and the table, but left out of the diagram so they don't pull
 *   every circle together.
 * TOOL_GROUPS — categories used to group tools (visualization, modelling, operations …).
 * FIELDS    — the circles (a field may have "tracks", like AI Engineering: Models / Deployment), with the tree content shown on hover, and "value":
 *             what the role brings to a business (the "For business owners" section).
 * OVERLAPS  — optional names for well-known overlaps (key = ids joined by "+", in FIELDS order).
 * (Learning resources are in resources.js; training schools in schools.js.)
 */

window.COMMON_TOOLS = ["Python", "Git"];

/* Tool groups — how tools are grouped everywhere on the page.
   A tool that isn't listed here shows under "Other". */
window.TOOL_GROUPS = [
  { name: "Languages & notebooks", tools: ["Python", "SQL", "R", "Jupyter"] },
  { name: "Data wrangling & analysis", tools: ["Excel / Sheets", "pandas", "NumPy", "statsmodels", "DAX / Power Query"] },
  { name: "Visualization & BI", tools: ["matplotlib / seaborn", "Power BI", "Tableau", "Looker Studio", "Looker", "Metabase", "Google Analytics"] },
  { name: "Storage & databases", tools: ["PostgreSQL", "BigQuery / Snowflake", "Vector DBs (pgvector / Pinecone)"] },
  { name: "Pipelines & processing", tools: ["dbt", "Apache Airflow", "Apache Spark", "Kafka"] },
  { name: "Modelling", tools: ["scikit-learn", "XGBoost", "PyTorch", "TensorFlow", "Hugging Face", "PEFT / LoRA", "DeepSpeed / FSDP", "CUDA / GPUs"] },
  { name: "AI apps", tools: ["LLM APIs (OpenAI / Claude / Gemini)", "LangChain / LlamaIndex"] },
  { name: "Tracking & monitoring", tools: ["MLflow", "Weights & Biases", "Langfuse / LangSmith"] },
  { name: "Operations & deployment", tools: ["Git", "Docker", "Kubernetes", "vLLM / Ollama", "FastAPI", "AWS / GCP / Azure", "Terraform", "Linux / Bash"] },
  { name: "Planning & documentation", tools: ["Jira", "Confluence", "Visio / Lucidchart", "Miro"] },
];

window.FIELDS = [
  {
    id: "business-analysis",
    name: "Business Analysis",
    label: ["Business", "Analysis"],
    color: "ba",
    icon: "clipboard",
    step: "Understand the business",
    tagline: "Turn business needs into clear requirements",
    overview:
      "Business analysts sit between the business and the tech team. They understand how the business works, find what needs to change, and turn it into clear requirements that everyone agrees on.",
    doing: [
      "Interview stakeholders and gather requirements",
      "Map current and future processes",
      "Write user stories and acceptance criteria",
      "Check that what gets built solves the problem",
    ],
    skills: ["Requirements gathering", "Process modeling (BPMN)", "Stakeholder management", "Communication", "Basic data analysis"],
    tools: ["SQL", "Excel / Sheets", "Power BI", "Jira", "Confluence", "Visio / Lucidchart", "Miro"],
    roles: ["Business Analyst", "Business Systems Analyst", "Product Owner", "Process Analyst"],
    value: {
      headline: "Make sure you build the right thing — before you spend money on it.",
      outcomes: [
        "Clear requirements that stop costly rework",
        "Simpler processes that save staff time",
        "IT projects that match what the business actually needs",
      ],
      hireWhen: "You’re launching a new system, moving paper processes online, or projects keep missing what the business needed.",
      example: "What exactly should our new ordering system do?",
    },
  },
  {
    id: "data-analysis",
    name: "Data Analysis & BI",
    label: ["Data Analysis", "& BI"],
    color: "da",
    icon: "chart",
    step: "Answer & report",
    tagline: "Answers, dashboards and trusted metrics",
    overview:
      "Turn raw data into answers and dashboards people can act on. Analysts and BI developers pick the right questions, define the metrics, build the reports, and explain why the numbers move.",
    doing: [
      "Write SQL to pull, join and clean data",
      "Build dashboards and self-service reports",
      "Define KPIs and keep numbers consistent",
      "Dig into why a metric moved and explain it",
    ],
    skills: ["SQL", "Spreadsheets", "Data modeling (star schemas)", "Descriptive statistics", "Data visualization", "Storytelling"],
    tools: ["Python", "Git", "SQL", "Excel / Sheets", "pandas", "Jupyter", "matplotlib / seaborn", "Power BI", "Tableau", "Looker Studio", "Looker", "Metabase", "DAX / Power Query", "BigQuery / Snowflake", "dbt", "Google Analytics"],
    roles: ["Data Analyst", "BI Analyst", "BI Developer", "Reporting Analyst", "Product Analyst"],
    value: {
      headline: "Turn your business data into clear numbers and better decisions.",
      outcomes: [
        "One trusted dashboard instead of scattered spreadsheets",
        "Early warning when sales, costs or stock go off track",
        "Faster, fact-based decisions in meetings",
      ],
      hireWhen: "Reports take days to prepare, different teams quote different numbers, or you can’t see what’s driving your results.",
      example: "Which products and branches actually make us money?",
    },
  },
  {
    id: "data-engineering",
    name: "Data Engineering",
    label: ["Data", "Engineering"],
    color: "de",
    icon: "db",
    step: "Build the pipes",
    tagline: "Move data reliably at scale",
    overview:
      "Build and run the pipelines and platforms that move data from where it is created to where it is used — reliably, on time and at scale.",
    doing: [
      "Design batch and streaming pipelines (ETL / ELT)",
      "Model warehouse and lakehouse tables",
      "Schedule, monitor and fix data jobs",
      "Manage databases and cloud infrastructure",
    ],
    skills: ["SQL", "Data modeling", "Distributed systems", "Cloud basics", "Linux"],
    tools: ["Python", "Git", "SQL", "PostgreSQL", "BigQuery / Snowflake", "dbt", "Apache Airflow", "Apache Spark", "Kafka", "Docker", "Linux / Bash", "AWS / GCP / Azure", "Terraform"],
    roles: ["Data Engineer", "Analytics Engineer", "Data Platform Engineer"],
    value: {
      headline: "Get your data flowing reliably, so every team works from the same facts.",
      outcomes: [
        "Sales, finance and app data combined in one place",
        "Automatic reports instead of manual copy-paste",
        "A secure, solid foundation for analytics and AI",
      ],
      hireWhen: "Your data sits in many systems, reports break or arrive late, or the business has outgrown spreadsheets.",
      example: "Can we see yesterday’s sales from every branch by 8 a.m.?",
    },
  },
  {
    id: "data-science",
    name: "Data Science",
    label: ["Data", "Science"],
    color: "ds",
    icon: "sigma",
    step: "Explain why",
    tagline: "Experiments, inference, causes",
    overview:
      "Use statistics to understand what is happening and why — experiments, inference and models that explain, not just predict.",
    doing: [
      "Design and analyze experiments (A/B tests)",
      "Build statistical models and forecasts",
      "Look for patterns and root causes",
      "Communicate uncertainty to decision makers",
    ],
    skills: ["Probability & statistics", "Hypothesis testing", "Regression", "Causal inference", "Experiment design"],
    tools: ["Python", "Git", "SQL", "R", "pandas", "NumPy", "Jupyter", "matplotlib / seaborn", "statsmodels", "scikit-learn"],
    roles: ["Data Scientist", "Product Data Scientist", "Statistician", "Quantitative Analyst"],
    value: {
      headline: "Know what really works — and why — before you commit.",
      outcomes: [
        "Test ideas like prices and promotions before rolling them out",
        "Forecasts for demand, cash flow and staffing",
        "Understand what really makes customers buy or leave",
      ],
      hireWhen: "You’re making big bets on pricing, marketing or expansion and want evidence, not guesses.",
      example: "Did the discount campaign really increase sales, or would they have happened anyway?",
    },
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    label: ["Machine", "Learning"],
    color: "ml",
    icon: "ml",
    step: "Predict",
    tagline: "Models that run every day",
    overview:
      "Build predictive models from data and turn them into dependable systems — the bridge between a notebook experiment and a model the business runs every day.",
    doing: [
      "Engineer features and training datasets",
      "Train, tune and evaluate models",
      "Build training and batch-scoring pipelines",
      "Track experiments and watch for drift",
    ],
    skills: ["ML algorithms", "Feature engineering", "Model evaluation", "Software engineering", "Linear algebra"],
    tools: ["Python", "Git", "pandas", "NumPy", "Jupyter", "scikit-learn", "XGBoost", "PyTorch", "TensorFlow", "MLflow", "Apache Spark", "Docker", "AWS / GCP / Azure"],
    roles: ["ML Engineer", "Applied Scientist", "MLOps Engineer"],
    value: {
      headline: "Automate predictions that run every day and grow with your business.",
      outcomes: [
        "Personalized recommendations that lift sales",
        "Fraud, risk and customers about to leave flagged automatically",
        "Smarter pricing, stock and delivery planning",
      ],
      hireWhen: "You have plenty of historical data and the same decision is made thousands of times.",
      example: "Which customers are likely to stop buying next month?",
    },
  },
  {
    id: "ai-engineering",
    name: "AI Engineering",
    label: ["AI", "Engineering"],
    color: "am",
    icon: "chip",
    step: "Build with AI",
    tagline: "Train models and ship AI products",
    overview:
      "AI engineering has two tracks: building the models themselves (Models) and putting them into real products (Deployment). Pick one below.",
    value: {
      headline: "Put AI to work for your business — from custom models to everyday tools.",
      outcomes: [
        "Assistants that answer customers 24/7",
        "Documents, emails and support tickets handled automatically",
        "Models tuned for the Myanmar language and your own data",
      ],
      hireWhen: "You want AI in real workflows — not just demos — or off-the-shelf AI doesn’t understand your language, industry or documents.",
      example: "Can an assistant answer customer questions from our product catalogue?",
    },
    // Two tracks share one circle; the tree shows a switch between them.
    // The circle's tools are all tools of both tracks. Learning resources are kept per track.
    tracks: [
      {
        id: "ai-models",
        short: "Models",
        name: "AI Engineering · Models",
        color: "am",
        icon: "chip",
        step: "Train the model",
        tagline: "Train and fine-tune deep models",
        overview:
          "Work on the models themselves: train, fine-tune and evaluate deep learning and foundation models so they get better at a task.",
        doing: [
          "Fine-tune language and vision models on your data",
          "Prepare and clean training datasets",
          "Run training on GPUs and track experiments",
          "Benchmark and evaluate model quality",
        ],
        skills: ["Deep learning", "Transformers & attention", "Linear algebra & calculus", "GPU / distributed training", "Evaluation"],
        tools: ["Python", "Git", "NumPy", "Jupyter", "PyTorch", "Hugging Face", "CUDA / GPUs", "Weights & Biases", "PEFT / LoRA", "DeepSpeed / FSDP"],
        roles: ["Research Engineer", "Model Training Engineer", "Applied Scientist (LLMs)"],
      },
      {
        id: "ai-deployment",
        short: "Deployment",
        name: "AI Engineering · Deployment",
        color: "ad",
        icon: "rocket",
        step: "Ship it",
        tagline: "Put AI into real products",
        overview:
          "Ship AI into products: connect models to data and users, build LLM apps and agents, and keep them fast, affordable and safe in production.",
        doing: [
          "Build LLM apps, RAG pipelines and agents",
          "Serve models behind APIs",
          "Evaluate and monitor quality, latency and cost",
          "Run vector search and the infrastructure behind it",
        ],
        skills: ["Backend & APIs", "Prompt & context design", "Retrieval (RAG)", "Evaluation & observability", "Cloud & containers"],
        tools: ["Python", "Git", "LLM APIs (OpenAI / Claude / Gemini)", "LangChain / LlamaIndex", "Hugging Face", "vLLM / Ollama", "FastAPI", "PostgreSQL", "Vector DBs (pgvector / Pinecone)", "Docker", "Kubernetes", "AWS / GCP / Azure", "Langfuse / LangSmith"],
        roles: ["AI Engineer", "LLM Engineer", "AI Platform Engineer"],
      },
    ],
  },
];

/* Optional names for overlaps people talk about. Unnamed overlaps still work. */
window.OVERLAPS = {
  "business-analysis+data-analysis": {
    name: "Business & Data Analysis",
    overview: "Analysts who both define what the business needs and build the reports that answer it.",
    roles: ["BI Business Analyst", "Reporting Analyst"],
  },
  "data-analysis+data-engineering": {
    name: "Analytics Engineering",
    overview: "Turn raw warehouse tables into clean, tested models that analysts and dashboards can trust.",
    roles: ["Analytics Engineer", "BI Engineer"],
  },
  "data-analysis+data-science": {
    name: "Decision Science",
    overview: "Experiments and statistics aimed squarely at business decisions: what should we do next?",
    roles: ["Product Data Scientist", "Decision Scientist"],
  },
  "data-science+machine-learning": {
    name: "Applied Data Science",
    overview: "Where statistical thinking meets predictive modeling — the classic “data scientist who ships models”.",
    roles: ["Data Scientist (ML)", "Applied Scientist"],
  },
  "data-engineering+machine-learning": {
    name: "MLOps / ML Platform",
    overview: "Feature pipelines, training infrastructure and scheduled scoring — the plumbing that keeps ML running.",
    roles: ["MLOps Engineer", "ML Platform Engineer"],
  },
  "data-engineering+ai-engineering": {
    name: "AI Platform / LLMOps",
    overview: "The data and infrastructure layer under AI products: databases, vector search, containers and cloud.",
    roles: ["AI Platform Engineer", "LLMOps Engineer"],
  },
  "machine-learning+ai-engineering": {
    name: "Applied AI",
    overview: "Where classic ML meets modern AI: deep models in PyTorch, and the containers and cloud to run them.",
    roles: ["ML Engineer (Deep Learning)", "MLOps Engineer"],
  },
};

/* Learning resources live in resources.js, training schools in schools.js. */