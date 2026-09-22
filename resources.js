/*
 * Learning resources — shown in the "Learn" panel.
 *
 * Kept as plain JSON after "window.RESOURCES =" so both people and the
 * suggestion bot (automation/) can edit it safely:
 *   field id → level ("beginner" / "intermediate") → category → [ ["Name", "https://url"], … ]
 * Categories: Courses, Documentation, YouTube, Practice, Books.
 * Use double quotes and no trailing commas (it must stay valid JSON).
 */
window.RESOURCES = {
  "business-analysis": {
    "description": "Requirements, process mapping, stakeholders and agile delivery.",
    "beginner": {
      "Courses": [
        [
          "IIBA — Business Analysis resources & BABOK Guide",
          "https://www.iiba.org/"
        ]
      ],
      "Documentation": [
        [
          "Atlassian Agile Coach (user stories, scrum, kanban)",
          "https://www.atlassian.com/agile"
        ],
        [
          "Jira Guides",
          "https://www.atlassian.com/software/jira/guides"
        ]
      ],
      "Practice": [
        [
          "BPMN — Business Process Model and Notation",
          "https://www.bpmn.org/"
        ],
        [
          "Miro Templates (process maps, journey maps)",
          "https://miro.com/templates/"
        ]
      ]
    }
  },
  "data-analysis": {
    "description": "SQL, spreadsheets, Python, BI tools, dashboards and analytical thinking.",
    "beginner": {
      "Courses": [
        [
          "Google Data Analytics Professional Certificate",
          "https://www.coursera.org/professional-certificates/google-data-analytics"
        ],
        [
          "FreeCodeCamp Data Analysis with Python",
          "https://www.freecodecamp.org/learn/data-analysis-with-python/"
        ],
        [
          "Microsoft Learn — Power BI training",
          "https://learn.microsoft.com/en-us/training/powerplatform/power-bi"
        ],
        [
          "Tableau Free Training Videos",
          "https://www.tableau.com/learn/training"
        ]
      ],
      "Documentation": [
        [
          "Pandas Documentation",
          "https://pandas.pydata.org/docs/"
        ],
        [
          "Python Official Documentation",
          "https://docs.python.org/3/"
        ],
        [
          "Power BI Documentation",
          "https://learn.microsoft.com/en-us/power-bi/"
        ]
      ],
      "YouTube": [
        [
          "Alex The Analyst",
          "https://www.youtube.com/@AlexTheAnalyst"
        ],
        [
          "Luke Barousse",
          "https://www.youtube.com/@LukeBarousse"
        ],
        [
          "Guy in a Cube (Power BI)",
          "https://www.youtube.com/@GuyInACube"
        ]
      ],
      "Practice": [
        [
          "SQLBolt",
          "https://sqlbolt.com/"
        ],
        [
          "Kaggle Learn",
          "https://www.kaggle.com/learn"
        ],
        [
          "Tableau Public",
          "https://public.tableau.com/"
        ],
        [
          "Maven Analytics Data Playground",
          "https://mavenanalytics.io/data-playground"
        ]
      ],
      "Books": [
        [
          "Python for Data Analysis by Wes McKinney",
          "https://wesmckinney.com/book/"
        ],
        [
          "Storytelling with Data by Cole Nussbaumer Knaflic",
          "https://www.storytellingwithdata.com/books"
        ]
      ]
    },
    "intermediate": {
      "Courses": [
        [
          "Mode Analytics SQL Tutorial",
          "https://mode.com/sql-tutorial/"
        ],
        [
          "DataCamp Data Analyst with Python Track",
          "https://www.datacamp.com/tracks/data-analyst-with-python"
        ]
      ],
      "Documentation": [
        [
          "Polars Documentation",
          "https://docs.pola.rs/"
        ],
        [
          "Seaborn Documentation",
          "https://seaborn.pydata.org/"
        ],
        [
          "DAX Guide",
          "https://dax.guide/"
        ]
      ],
      "YouTube": [
        [
          "StatQuest with Josh Starmer",
          "https://www.youtube.com/@statquest"
        ],
        [
          "Corey Schafer",
          "https://www.youtube.com/@coreyms"
        ],
        [
          "SQLBI (DAX & data modeling)",
          "https://www.youtube.com/@SQLBI"
        ]
      ],
      "Practice": [
        [
          "LeetCode Database Problems",
          "https://leetcode.com/problemset/database/"
        ],
        [
          "StrataScratch",
          "https://www.stratascratch.com/"
        ]
      ],
      "Books": [
        [
          "Practical Statistics for Data Scientists",
          "https://www.oreilly.com/library/view/practical-statistics-for/9781492072935/"
        ],
        [
          "SQL for Data Analysis by Cathy Tanimura",
          "https://www.oreilly.com/library/view/sql-for-data/9781492088776/"
        ],
        [
          "The Data Warehouse Toolkit by Ralph Kimball",
          "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/"
        ],
        [
          "The Definitive Guide to DAX by Marco Russo & Alberto Ferrari",
          "https://www.sqlbi.com/books/the-definitive-guide-to-dax-2nd-edition/"
        ]
      ]
    }
  },
  "data-engineering": {
    "description": "Pipelines, databases, cloud platforms, orchestration and data infrastructure.",
    "beginner": {
      "Courses": [
        [
          "Data Engineering Zoomcamp by DataTalks.Club",
          "https://github.com/DataTalksClub/data-engineering-zoomcamp"
        ],
        [
          "IBM Data Engineering Professional Certificate",
          "https://www.coursera.org/professional-certificates/ibm-data-engineer"
        ]
      ],
      "Documentation": [
        [
          "PostgreSQL Documentation",
          "https://www.postgresql.org/docs/"
        ],
        [
          "Docker Documentation",
          "https://docs.docker.com/"
        ]
      ],
      "YouTube": [
        [
          "Seattle Data Guy",
          "https://www.youtube.com/@SeattleDataGuy"
        ],
        [
          "Zach Wilson",
          "https://www.youtube.com/@ZachWilsonData"
        ]
      ],
      "Practice": [
        [
          "PGExercises",
          "https://pgexercises.com/"
        ],
        [
          "DataLemur",
          "https://datalemur.com/"
        ]
      ],
      "Books": [
        [
          "Designing Data-Intensive Applications by Martin Kleppmann",
          "https://dataintensive.net/"
        ],
        [
          "Fundamentals of Data Engineering by Joe Reis & Matt Housley",
          "https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/"
        ]
      ]
    },
    "intermediate": {
      "Courses": [
        [
          "Data Engineering with Apache Spark",
          "https://www.databricks.com/learn"
        ],
        [
          "AWS Certified Data Engineer Training",
          "https://aws.amazon.com/training/"
        ]
      ],
      "Documentation": [
        [
          "Apache Airflow Documentation",
          "https://airflow.apache.org/docs/"
        ],
        [
          "dbt Documentation",
          "https://docs.getdbt.com/"
        ],
        [
          "Apache Spark Documentation",
          "https://spark.apache.org/docs/latest/"
        ]
      ],
      "YouTube": [
        [
          "Andreas Kretz (Plumbers of Data Science)",
          "https://www.youtube.com/@AndreasKretz"
        ]
      ],
      "Practice": [
        [
          "dbt Learn Courses",
          "https://courses.getdbt.com/"
        ],
        [
          "Kaggle BigQuery Datasets",
          "https://www.kaggle.com/datasets"
        ]
      ],
      "Books": [
        [
          "Database Internals by Alex Petrov",
          "https://www.databass.dev/"
        ],
        [
          "Data Pipelines Pocket Reference by James Densmore",
          "https://www.oreilly.com/library/view/data-pipelines-pocket/9781492087823/"
        ]
      ]
    }
  },
  "data-science": {
    "description": "Probability, statistics, experiments and inference.",
    "beginner": {
      "Courses": [
        [
          "Khan Academy — Statistics & Probability",
          "https://www.khanacademy.org/math/statistics-probability"
        ]
      ],
      "Documentation": [
        [
          "NumPy Documentation",
          "https://numpy.org/doc/stable/"
        ],
        [
          "statsmodels Documentation",
          "https://www.statsmodels.org/stable/index.html"
        ]
      ],
      "YouTube": [
        [
          "StatQuest with Josh Starmer",
          "https://www.youtube.com/@statquest"
        ]
      ],
      "Practice": [
        [
          "Seeing Theory (interactive probability)",
          "https://seeing-theory.brown.edu/"
        ],
        [
          "Google Colab",
          "https://colab.research.google.com/"
        ]
      ],
      "Books": [
        [
          "An Introduction to Statistical Learning (ISLR)",
          "https://www.statlearning.com/"
        ]
      ]
    },
    "intermediate": {
      "Courses": [
        [
          "Statistical Rethinking by Richard McElreath",
          "https://github.com/rmcelreath/stat_rethinking_2024"
        ]
      ],
      "Documentation": [
        [
          "PyMC Documentation",
          "https://www.pymc.io/"
        ]
      ],
      "Books": [
        [
          "Practical Statistics for Data Scientists",
          "https://www.oreilly.com/library/view/practical-statistics-for/9781492072935/"
        ],
        [
          "Causal Inference for the Brave and True",
          "https://matheusfacure.github.io/python-causality-handbook/"
        ]
      ]
    }
  },
  "machine-learning": {
    "description": "Classic machine learning, from first models to production pipelines.",
    "beginner": {
      "Courses": [
        [
          "Machine Learning Specialization by Andrew Ng",
          "https://www.coursera.org/specializations/machine-learning-introduction"
        ],
        [
          "Kaggle Learn — Intro to Machine Learning",
          "https://www.kaggle.com/learn/intro-to-machine-learning"
        ]
      ],
      "Documentation": [
        [
          "Scikit-learn Documentation",
          "https://scikit-learn.org/stable/"
        ]
      ],
      "YouTube": [
        [
          "StatQuest with Josh Starmer",
          "https://www.youtube.com/@statquest"
        ]
      ],
      "Practice": [
        [
          "Kaggle Competitions for Beginners",
          "https://www.kaggle.com/competitions"
        ]
      ],
      "Books": [
        [
          "Hands-On Machine Learning by Aurélien Géron",
          "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/"
        ]
      ]
    },
    "intermediate": {
      "Courses": [
        [
          "Stanford CS229: Machine Learning",
          "https://cs229.stanford.edu/"
        ],
        [
          "MLOps Zoomcamp by DataTalks.Club",
          "https://github.com/DataTalksClub/mlops-zoomcamp"
        ],
        [
          "Made With ML",
          "https://madewithml.com/"
        ]
      ],
      "Documentation": [
        [
          "MLflow Documentation",
          "https://mlflow.org/docs/latest/"
        ],
        [
          "XGBoost Documentation",
          "https://xgboost.readthedocs.io/"
        ]
      ],
      "Books": [
        [
          "Designing Machine Learning Systems by Chip Huyen",
          "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/"
        ],
        [
          "Feature Engineering for Machine Learning by Alice Zheng",
          "https://www.oreilly.com/library/view/feature-engineering-for/9781491953235/"
        ]
      ]
    }
  },
  "ai-models": {
    "description": "Deep learning and foundation models: training, fine-tuning and evaluation.",
    "beginner": {
      "Courses": [
        [
          "Fast.ai Practical Deep Learning for Coders",
          "https://course.fast.ai/"
        ],
        [
          "Hugging Face LLM Course",
          "https://huggingface.co/learn/llm-course"
        ]
      ],
      "Documentation": [
        [
          "PyTorch Documentation",
          "https://pytorch.org/docs/stable/index.html"
        ]
      ],
      "YouTube": [
        [
          "3Blue1Brown (Linear Algebra & Neural Networks)",
          "https://www.youtube.com/@3blue1brown"
        ],
        [
          "Andrej Karpathy",
          "https://www.youtube.com/@AndrejKarpathy"
        ]
      ],
      "Practice": [
        [
          "Google Colab",
          "https://colab.research.google.com/"
        ]
      ],
      "Books": [
        [
          "Dive into Deep Learning (free online)",
          "https://d2l.ai/"
        ]
      ]
    },
    "intermediate": {
      "Courses": [
        [
          "Deep Learning Specialization by DeepLearning.AI",
          "https://www.coursera.org/specializations/deep-learning"
        ],
        [
          "Stanford CS224N: NLP with Deep Learning",
          "https://web.stanford.edu/class/cs224n/"
        ]
      ],
      "Documentation": [
        [
          "Hugging Face Transformers Documentation",
          "https://huggingface.co/docs/transformers/index"
        ],
        [
          "TensorFlow API Documentation",
          "https://www.tensorflow.org/api_docs"
        ]
      ],
      "YouTube": [
        [
          "Yannic Kilcher",
          "https://www.youtube.com/@YannicKilcher"
        ]
      ],
      "Practice": [
        [
          "Hugging Face Course & Spaces",
          "https://huggingface.co/course/chapter1/1"
        ]
      ],
      "Books": [
        [
          "Deep Learning by Ian Goodfellow, Yoshua Bengio, & Aaron Courville",
          "https://www.deeplearningbook.org/"
        ]
      ]
    }
  },
  "ai-deployment": {
    "description": "LLM apps, RAG, agents, model serving and running AI in production.",
    "beginner": {
      "Courses": [
        [
          "DeepLearning.AI Short Courses",
          "https://www.deeplearning.ai/short-courses/"
        ],
        [
          "Hugging Face Agents Course",
          "https://huggingface.co/learn/agents-course"
        ]
      ],
      "Documentation": [
        [
          "OpenAI API Documentation",
          "https://platform.openai.com/docs"
        ],
        [
          "Claude API Documentation",
          "https://docs.claude.com/"
        ],
        [
          "FastAPI Documentation",
          "https://fastapi.tiangolo.com/"
        ]
      ],
      "Practice": [
        [
          "Ollama (run models locally)",
          "https://ollama.com/"
        ],
        [
          "Hugging Face Spaces",
          "https://huggingface.co/spaces"
        ]
      ]
    },
    "intermediate": {
      "Courses": [
        [
          "Full Stack Deep Learning — LLM Bootcamp",
          "https://fullstackdeeplearning.com/llm-bootcamp/"
        ]
      ],
      "Documentation": [
        [
          "vLLM Documentation",
          "https://docs.vllm.ai/"
        ],
        [
          "LangChain Documentation",
          "https://python.langchain.com/docs/"
        ],
        [
          "Kubernetes Documentation",
          "https://kubernetes.io/docs/home/"
        ]
      ],
      "Books": [
        [
          "AI Engineering by Chip Huyen",
          "https://www.oreilly.com/library/view/ai-engineering/9781098166298/"
        ]
      ]
    }
  }
};