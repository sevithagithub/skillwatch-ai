export const INTERVIEW_DATA = {
  Python: {
    questions: [
      'What are Python decorators and how do they work?',
      'Explain the Global Interpreter Lock (GIL) and its impact on multithreading.',
      'How does Python\'s garbage collection and memory management work?',
      'What is a generator function? How does yield differ from return?',
      'Explain the difference between deep and shallow copy in Python.',
      'What are metaclasses in Python?',
      'How do you manage dependencies and virtual environments?'
    ],
    companies: ['Google', 'Meta', 'Netflix', 'Spotify', 'Amazon', 'Dropbox']
  },
  SQL: {
    questions: [
      'Explain the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN.',
      'What is database normalization? Explain 1NF, 2NF, and 3NF.',
      'How do database indexes work under the hood (e.g., B-Trees)?',
      'Explain the difference between WHERE and HAVING clauses.',
      'What are window functions? Can you provide an example using ROW_NUMBER()?',
      'How do you optimize a slow-running SQL query?',
      'Explain ACID properties in database management systems.'
    ],
    companies: ['Oracle', 'Amazon', 'Microsoft', 'Salesforce', 'Snowflake']
  },
  JavaScript: {
    questions: [
      'Explain JavaScript closures and provide a practical use case.',
      'How does the event loop work in JavaScript? Explain the call stack, microtask queue, and macrotask queue.',
      'What is the difference between == and ===? Explain type coercion.',
      'Explain how Promises work and how async/await simplifies asynchronous code.',
      'What is hoisting in JavaScript? How do var, let, and const differ?',
      'Explain prototypal inheritance.',
      'What are memory leaks in JavaScript and how do you avoid them?'
    ],
    companies: ['Airbnb', 'Netflix', 'Uber', 'LinkedIn', 'Twitter']
  },
  'Machine Learning': {
    questions: [
      'What is the bias-variance tradeoff? How does it relate to overfitting and underfitting?',
      'Explain how cross-validation works and why it is necessary.',
      'What is gradient descent? Explain the difference between Batch, Mini-batch, and Stochastic Gradient Descent.',
      'How do Support Vector Machines (SVM) work? What is the kernel trick?',
      'Explain the difference between L1 (Lasso) and L2 (Ridge) regularization.',
      'How do you handle imbalanced datasets?',
      'Explain the architecture of a Convolutional Neural Network (CNN).'
    ],
    companies: ['Google', 'OpenAI', 'DeepMind', 'Tesla', 'Amazon', 'Meta']
  },
  Java: {
    questions: [
      'What is the JVM (Java Virtual Machine) and how does it execute bytecode?',
      'Explain the core OOP concepts: Encapsulation, Inheritance, Polymorphism, and Abstraction.',
      'What is the difference between an Abstract class and an Interface in Java 8+?',
      'How does garbage collection work in Java? Explain different GC algorithms.',
      'Explain multithreading in Java. What is the difference between Runnable and Callable?',
      'What is the Spring Framework and what is Dependency Injection?',
      'Explain the difference between HashMap and ConcurrentHashMap.'
    ],
    companies: ['Oracle', 'IBM', 'Goldman Sachs', 'JP Morgan', 'Infosys']
  },
  'Cloud Computing': {
    questions: [
      'What is the difference between IaaS, PaaS, and SaaS?',
      'Explain the concept of microservices architecture vs monolithic architecture.',
      'What is serverless computing? What are its pros and cons?',
      'Explain containerization and how Docker differs from virtual machines.',
      'What is Kubernetes and what problems does it solve?',
      'Explain how a Load Balancer works in a cloud environment.',
      'What is Infrastructure as Code (IaC)? Give an example using Terraform.'
    ],
    companies: ['AWS', 'Google Cloud', 'Microsoft Azure', 'IBM Cloud', 'Salesforce']
  },
  React: {
    questions: [
      'Explain the Virtual DOM and how React\'s reconciliation algorithm works.',
      'What are React Hooks? Explain useState, useEffect, and useMemo.',
      'How do you manage global state in a React application? (Redux, Context API, Zustand)',
      'What is the difference between controlled and uncontrolled components?',
      'Explain Higher-Order Components (HOCs) and Custom Hooks.',
      'How do you optimize the performance of a React application?',
      'What is Server-Side Rendering (SSR) and how does it differ from Client-Side Rendering (CSR)?'
    ],
    companies: ['Meta', 'Airbnb', 'Netflix', 'Stripe', 'Discord']
  },
  'Node.js': {
    questions: [
      'Explain the Node.js architecture. Is it single-threaded or multi-threaded?',
      'What is the role of libuv in Node.js?',
      'How does the require() function work module caching?',
      'What are Streams in Node.js? Explain the different types of streams.',
      'How do you handle errors in asynchronous Node.js code?',
      'What is the purpose of the cluster module?',
      'Explain middleware in Express.js.'
    ],
    companies: ['Netflix', 'Uber', 'PayPal', 'LinkedIn', 'Trello']
  },
  'Data Science': {
    questions: [
      'What is p-value? Explain statistical significance.',
      'How do you deal with missing data in a dataset?',
      'Explain Principal Component Analysis (PCA) and its use cases.',
      'What is the difference between correlation and causation?',
      'How do you evaluate a classification model? (Precision, Recall, F1-Score, ROC-AUC)',
      'Explain A/B testing methodology.',
      'What is time series forecasting?'
    ],
    companies: ['Airbnb', 'Spotify', 'Uber', 'Instacart', 'DoorDash']
  },
  'C++': {
    questions: [
      'Explain the difference between pointers and references.',
      'What is RAII (Resource Acquisition Is Initialization)?',
      'Explain smart pointers in C++ (std::unique_ptr, std::shared_ptr, std::weak_ptr).',
      'What are virtual functions and how does the vtable work?',
      'Explain the rule of three, five, and zero in C++.',
      'What are move semantics and rvalue references?',
      'How do templates work in C++? What is template metaprogramming?'
    ],
    companies: ['Bloomberg', 'Jane Street', 'Epic Games', 'Tesla', 'Nvidia']
  },
  'Generative AI': {
    questions: [
      'Explain the Transformer architecture and the self-attention mechanism.',
      'What is Retrieval-Augmented Generation (RAG)?',
      'How does fine-tuning differ from prompt engineering?',
      'What are hallucations in LLMs and how do you mitigate them?',
      'Explain the difference between autoregressive and autoencoding models.',
      'What is LoRA (Low-Rank Adaptation) for fine-tuning?',
      'How do vector databases work and why are they used in GenAI apps?'
    ],
    companies: ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Hugging Face']
  }
};

export const ROADMAP_DATA = {
  Python: {
    steps: [
      'Year 1: Variables, data types, control structures, and basic functions',
      'Year 1: Object-oriented programming (OOP), file I/O, and error handling',
      'Year 2: Data structures (lists, dicts, sets) and algorithms in Python',
      'Year 2: Intro to libraries (NumPy, Pandas) and API integration',
      'Year 3: Web frameworks (Django, FastAPI, or Flask) and database connections',
      'Year 3: Web scraping (BeautifulSoup, Scrapy) and automation',
      'Year 4: Advanced Python (generators, decorators, async/await)',
      'Year 4: Build a full-stack portfolio project and prep for technical interviews'
    ],
    resources: [
      { n: 'Python.org Official Docs', u: 'https://docs.python.org', t: 'Free', year: 1 },
      { n: 'CS50P (Harvard)', u: 'https://cs50.harvard.edu/python', t: 'Free', year: 1 },
      { n: 'Automate the Boring Stuff', u: 'https://automatetheboringstuff.com', t: 'Free', year: 2 },
      { n: 'Corey Schafer YouTube', u: 'https://www.youtube.com/user/schafer5', t: 'Free', year: 2 },
      { n: 'FastAPI Documentation', u: 'https://fastapi.tiangolo.com/', t: 'Free', year: 3 },
      { n: 'Real Python Tutorials', u: 'https://realpython.com', t: 'Paid', year: 3 },
      { n: 'LeetCode Python Practice', u: 'https://leetcode.com', t: 'Free', year: 4 },
      { n: 'System Design Interview Book', u: 'https://bytebytego.com/', t: 'Paid', year: 4 }
    ]
  },
  SQL: {
    steps: [
      'Year 1: Relational database concepts, SELECT, WHERE, ORDER BY',
      'Year 1: Aggregate functions (COUNT, SUM, AVG) and GROUP BY',
      'Year 2: Table joins (INNER, LEFT, RIGHT, FULL) and unions',
      'Year 2: Database normalization and schema design',
      'Year 3: Subqueries, Common Table Expressions (CTEs), and Window Functions',
      'Year 3: Stored procedures, triggers, and transactions',
      'Year 4: Query optimization, indexing strategies (B-Trees), and execution plans',
      'Year 4: NoSQL vs SQL tradeoffs and system design for scale'
    ],
    resources: [
      { n: 'SQLZoo', u: 'https://sqlzoo.net', t: 'Free', year: 1 },
      { n: 'W3Schools SQL', u: 'https://www.w3schools.com/sql/', t: 'Free', year: 1 },
      { n: 'Mode SQL Tutorial', u: 'https://mode.com/sql-tutorial', t: 'Free', year: 2 },
      { n: 'PostgreSQL Tutorial', u: 'https://www.postgresqltutorial.com/', t: 'Free', year: 2 },
      { n: 'LeetCode Database Problems', u: 'https://leetcode.com/problemset/database/', t: 'Free', year: 3 },
      { n: 'Use the Index, Luke', u: 'https://use-the-index-luke.com/', t: 'Free', year: 4 }
    ]
  },
  JavaScript: {
    steps: [
      'Year 1: Variables (let, const), data types, operators, and basic DOM manipulation',
      'Year 1: Functions, arrow functions, scope, and closures',
      'Year 2: Asynchronous JS (Callbacks, Promises, async/await)',
      'Year 2: ES6+ features (destructuring, spread/rest, template literals)',
      'Year 3: Frontend frameworks (React, Vue, or Angular) fundamentals',
      'Year 3: State management, routing, and interacting with REST APIs',
      'Year 4: Node.js/Express backend development, full-stack integration',
      'Year 4: Advanced JS concepts (Event Loop, prototypes), TypeScript, and Webpack/Vite'
    ],
    resources: [
      { n: 'FreeCodeCamp JS Cert', u: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', t: 'Free', year: 1 },
      { n: 'MDN Web Docs', u: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', t: 'Free', year: 1 },
      { n: 'JavaScript.info', u: 'https://javascript.info/', t: 'Free', year: 2 },
      { n: 'You Don\'t Know JS (Book)', u: 'https://github.com/getify/You-Dont-Know-JS', t: 'Free', year: 2 },
      { n: 'Frontend Masters', u: 'https://frontendmasters.com/', t: 'Paid', year: 3 },
      { n: 'Full Stack Open', u: 'https://fullstackopen.com/en/', t: 'Free', year: 4 },
      { n: 'LeetCode JS Problems', u: 'https://leetcode.com', t: 'Free', year: 4 }
    ]
  },
  React: {
    steps: [
      'Year 1: HTML, CSS, and basic JavaScript (prerequisites)',
      'Year 2: JSX, Components, Props, and basic state (useState)',
      'Year 2: Event handling, forms, and conditional rendering',
      'Year 3: Advanced Hooks (useEffect, useMemo, useCallback, useRef)',
      'Year 3: Context API, Redux/Zustand, and React Router',
      'Year 4: Performance optimization, custom hooks, and testing (Jest/RTL)',
      'Year 4: Next.js (SSR/SSG), Server Components, and deployment'
    ],
    resources: [
      { n: 'React Official Tutorial', u: 'https://react.dev/learn', t: 'Free', year: 2 },
      { n: 'Codecademy React', u: 'https://www.codecademy.com/learn/react-101', t: 'Paid', year: 2 },
      { n: 'Fireship React Course', u: 'https://fireship.io/courses/react/', t: 'Paid', year: 3 },
      { n: 'Epic React by Kent C. Dodds', u: 'https://epicreact.dev/', t: 'Paid', year: 4 },
      { n: 'Next.js Documentation', u: 'https://nextjs.org/docs', t: 'Free', year: 4 }
    ]
  },
  'Machine Learning': {
    steps: [
      'Year 1: Linear Algebra, Calculus, and basic Statistics/Probability',
      'Year 1: Python programming, NumPy, and Pandas',
      'Year 2: Data visualization (Matplotlib, Seaborn) and exploratory data analysis (EDA)',
      'Year 2: Intro to Scikit-Learn (Linear/Logistic Regression, Decision Trees)',
      'Year 3: Supervised vs Unsupervised learning (K-Means, PCA, SVMs, Random Forests)',
      'Year 3: Model evaluation metrics (ROC, AUC, F1) and Cross-Validation',
      'Year 4: Deep Learning frameworks (PyTorch/TensorFlow), Neural Networks, CNNs, RNNs',
      'Year 4: MLOps, model deployment, and real-world ML engineering projects'
    ],
    resources: [
      { n: 'Khan Academy Math', u: 'https://www.khanacademy.org/math', t: 'Free', year: 1 },
      { n: 'Kaggle Learn', u: 'https://www.kaggle.com/learn', t: 'Free', year: 1 },
      { n: 'StatQuest with Josh Starmer', u: 'https://www.youtube.com/c/joshstarmer', t: 'Free', year: 2 },
      { n: 'Andrew Ng ML Course', u: 'https://www.coursera.org/specializations/machine-learning-introduction', t: 'Free Audit', year: 2 },
      { n: 'Hands-On ML Book', u: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/', t: 'Paid', year: 3 },
      { n: 'Fast.ai Practical Deep Learning', u: 'https://course.fast.ai/', t: 'Free', year: 4 },
      { n: 'Made With ML (MLOps)', u: 'https://madewithml.com/', t: 'Free', year: 4 }
    ]
  },
  'Data Science': {
    steps: [
      'Year 1: Python, SQL basics, and introductory Statistics',
      'Year 2: Data wrangling (Pandas) and visualization (Tableau, PowerBI)',
      'Year 3: Hypothesis testing, A/B testing, and introductory Machine Learning',
      'Year 4: Big Data tools (Spark, Hadoop), cloud platforms, and end-to-end data pipelines'
    ],
    resources: [
      { n: 'DataCamp Python', u: 'https://www.datacamp.com/', t: 'Paid', year: 1 },
      { n: 'Google Data Analytics Cert', u: 'https://www.coursera.org/professional-certificates/google-data-analytics', t: 'Paid', year: 2 },
      { n: 'Towards Data Science', u: 'https://towardsdatascience.com/', t: 'Free', year: 3 },
      { n: 'Databricks Academy', u: 'https://academy.databricks.com/', t: 'Free/Paid', year: 4 }
    ]
  },
  'Cloud Computing': {
    steps: [
      'Year 1: Computer Networking basics, Linux fundamentals, and OS concepts',
      'Year 2: Core Cloud Services (Compute, Storage, Networking) on AWS/Azure/GCP',
      'Year 2: Cloud security basics and Identity Access Management (IAM)',
      'Year 3: Containerization (Docker) and Serverless architectures',
      'Year 3: Infrastructure as Code (Terraform, CloudFormation)',
      'Year 4: Container Orchestration (Kubernetes) and CI/CD pipelines',
      'Year 4: Cloud Architecture design, Cost Optimization, and Certification prep'
    ],
    resources: [
      { n: 'NetworkChuck Networking', u: 'https://www.youtube.com/c/NetworkChuck', t: 'Free', year: 1 },
      { n: 'AWS Cloud Practitioner Essentials', u: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/', t: 'Free', year: 2 },
      { n: 'TechWorld with Nana (Docker)', u: 'https://www.youtube.com/c/TechWorldwithNana', t: 'Free', year: 3 },
      { n: 'A Cloud Guru', u: 'https://acloudguru.com/', t: 'Paid', year: 3 },
      { n: 'KodeKloud Kubernetes', u: 'https://kodekloud.com/', t: 'Paid', year: 4 },
      { n: 'AWS Solutions Architect Guide', u: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/', t: 'Paid', year: 4 }
    ]
  },
  'Generative AI': {
    steps: [
      'Year 1: Python, Math (Linear Algebra), and Neural Network basics',
      'Year 2: Natural Language Processing (NLP) foundations and embeddings',
      'Year 3: Transformer architecture, Attention mechanisms, and Hugging Face library',
      'Year 3: Prompt Engineering and interacting with LLM APIs (OpenAI, Gemini)',
      'Year 4: Building RAG systems, Vector Databases (Pinecone, Milvus)',
      'Year 4: Fine-tuning models (LoRA, PEFT) and building AI Agents (LangChain)'
    ],
    resources: [
      { n: 'DeepLearning.AI Math for ML', u: 'https://www.coursera.org/specializations/mathematics-machine-learning', t: 'Free Audit', year: 1 },
      { n: 'Hugging Face NLP Course', u: 'https://huggingface.co/learn/nlp-course/chapter1/1', t: 'Free', year: 2 },
      { n: 'Prompt Engineering Guide', u: 'https://www.promptingguide.ai/', t: 'Free', year: 3 },
      { n: 'LangChain Documentation', u: 'https://python.langchain.com/docs/get_started/introduction', t: 'Free', year: 4 },
      { n: 'DeepLearning.AI GenAI with LLMs', u: 'https://www.coursera.org/learn/generative-ai-with-llms', t: 'Free Audit', year: 4 }
    ]
  },
  DevOps: {
    steps: [
      'Year 1: Linux Administration, Bash Scripting, and Git Version Control',
      'Year 2: Continuous Integration / Continuous Deployment (CI/CD) concepts and Jenkins/GitHub Actions',
      'Year 3: Docker containerization and Infrastructure as Code (Terraform, Ansible)',
      'Year 4: Kubernetes, Monitoring (Prometheus/Grafana), and Site Reliability Engineering (SRE) practices'
    ],
    resources: [
      { n: 'Missing Semester (MIT)', u: 'https://missing.csail.mit.edu/', t: 'Free', year: 1 },
      { n: 'Learn Git Branching', u: 'https://learngitbranching.js.org/', t: 'Free', year: 1 },
      { n: 'GitHub Actions Docs', u: 'https://docs.github.com/en/actions', t: 'Free', year: 2 },
      { n: 'Roadmap.sh DevOps', u: 'https://roadmap.sh/devops', t: 'Free', year: 3 },
      { n: 'KodeKloud', u: 'https://kodekloud.com/', t: 'Paid', year: 4 }
    ]
  },
  Java: {
    steps: [
      'Year 1: Syntax, Control Flow, and OOP basics (Classes, Objects, Inheritance)',
      'Year 2: Collections Framework, Exception Handling, and File I/O',
      'Year 3: Multithreading, Concurrency, JDBC, and JVM internals',
      'Year 4: Spring Boot, Microservices, Hibernate (JPA), and Enterprise App Architecture'
    ],
    resources: [
      { n: 'Mooc.fi Java Programming', u: 'https://java-programming.mooc.fi/', t: 'Free', year: 1 },
      { n: 'Head First Java (Book)', u: 'https://www.oreilly.com/library/view/head-first-java/9781492091646/', t: 'Paid', year: 2 },
      { n: 'Baeldung Java Tutorials', u: 'https://www.baeldung.com/', t: 'Free', year: 3 },
      { n: 'Spring Boot Guide', u: 'https://spring.io/guides', t: 'Free', year: 4 }
    ]
  },
  'C++': {
    steps: [
      'Year 1: Syntax, pointers, references, and memory management basics',
      'Year 2: OOP, templates, and the Standard Template Library (STL)',
      'Year 3: Advanced C++ (C++11/14/17 features, smart pointers, lambda expressions)',
      'Year 4: Concurrency, performance optimization, and system-level programming'
    ],
    resources: [
      { n: 'LearnCpp.com', u: 'https://www.learncpp.com/', t: 'Free', year: 1 },
      { n: 'Cplusplus.com', u: 'https://cplusplus.com/doc/tutorial/', t: 'Free', year: 2 },
      { n: 'Effective C++ (Book)', u: 'https://www.amazon.com/Effective-Specific-Improve-Programs-Designs/dp/0321334876', t: 'Paid', year: 3 },
      { n: 'CppCon YouTube', u: 'https://www.youtube.com/user/CppCon', t: 'Free', year: 4 }
    ]
  },
  'Node.js': {
    steps: [
      'Year 1: JavaScript fundamentals and asynchronous programming',
      'Year 2: Core modules (fs, path, http), npm, and basic REST APIs with Express',
      'Year 3: Authentication (JWT), working with databases (MongoDB/PostgreSQL), and middleware',
      'Year 4: Microservices, WebSockets, performance profiling, and deploying Node apps'
    ],
    resources: [
      { n: 'Node.js Docs', u: 'https://nodejs.org/en/docs/', t: 'Free', year: 2 },
      { n: 'The Net Ninja Node Course', u: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymONOKxwBU', t: 'Free', year: 2 },
      { n: 'Node.js Design Patterns', u: 'https://www.nodejsdesignpatterns.com/', t: 'Paid', year: 4 },
      { n: 'NestJS Framework Docs', u: 'https://docs.nestjs.com/', t: 'Free', year: 4 }
    ]
  }
};

export const DEFAULT_ROADMAP = {
  steps: [
    'Year 1: Learn core fundamentals and basic syntax/concepts',
    'Year 1: Complete beginner tutorials and exercises',
    'Year 2: Practice with small projects and learn intermediate features',
    'Year 2: Understand related tools and ecosystem',
    'Year 3: Study real-world use cases, advanced topics, and architecture',
    'Year 3: Build a full-stack/complex portfolio project',
    'Year 4: Contribute to open source, optimize performance, and deep dive into internals',
    'Year 4: Get certified (if applicable) and prepare for technical interviews'
  ],
  resources: [
    { n: 'roadmap.sh', u: 'https://roadmap.sh', t: 'Free', year: 1 },
    { n: 'freeCodeCamp', u: 'https://freecodecamp.org', t: 'Free', year: 1 },
    { n: 'Coursera', u: 'https://coursera.org', t: 'Free Audit', year: 2 },
    { n: 'Udemy', u: 'https://udemy.com', t: 'Paid', year: 3 },
    { n: 'YouTube Tutorials', u: 'https://youtube.com', t: 'Free', year: 4 }
  ]
};
