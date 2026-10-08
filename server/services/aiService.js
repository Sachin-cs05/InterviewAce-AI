/**
 * AI Service for Question Generation, Answer Evaluation, and Final Report Generation.
 * Supports external LLM (Gemini / OpenAI) if keys are provided, with an intelligent,
 * domain-rich fallback engine ensuring full offline / zero-cost reliability.
 */

// Curated question matrix across roles, levels, and types
const QUESTION_BANK = {
  'Frontend Developer': {
    Technical: {
      Fresher: [
        {
          text: 'Can you explain the difference between let, const, and var in modern JavaScript, and how hoisting affects them?',
          keywords: ['scope', 'hoisting', 'block scope', 'reassignment', 'temporal dead zone', 'var', 'let', 'const'],
          category: 'Technical',
        },
        {
          text: 'How does the Virtual DOM work in React, and why is it faster than directly updating the real DOM?',
          keywords: ['virtual dom', 'reconciliation', 'diffing algorithm', 'render', 'batching', 'real dom'],
          category: 'Technical',
        },
        {
          text: 'What are CSS Flexbox and CSS Grid, and in what scenarios would you choose one over the other?',
          keywords: ['one-dimensional', 'two-dimensional', 'grid', 'flexbox', 'layout', 'alignment'],
          category: 'Technical',
        },
        {
          text: 'Explain the purpose of React useEffect hook and how the dependency array controls its execution.',
          keywords: ['side effects', 'dependency array', 'lifecycle', 'cleanup', 're-render', 'mount'],
          category: 'Technical',
        },
        {
          text: 'What is responsive web design and how do CSS media queries and relative units (rem, em, %) facilitate it?',
          keywords: ['media queries', 'breakpoints', 'mobile-first', 'rem', 'em', 'viewport'],
          category: 'Technical',
        },
        {
          text: 'What is event delegation in JavaScript and why is it useful when managing dynamic lists?',
          keywords: ['event bubbling', 'event target', 'parent listener', 'memory efficiency', 'propagation'],
          category: 'Technical',
        },
        {
          text: 'Can you explain the difference between synchronous and asynchronous code in JavaScript using Promises and async/await?',
          keywords: ['promises', 'async', 'await', 'event loop', 'call stack', 'callback queue'],
          category: 'Technical',
        },
        {
          text: 'What is the role of key prop in React lists, and what bugs occur if you use array indices as keys?',
          keywords: ['identity', 'reconciliation', 'reordering', 'performance', 'unnecessary re-renders'],
          category: 'Technical',
        },
        {
          text: 'How do you optimize web page asset loading and ensure fast First Contentful Paint (FCP)?',
          keywords: ['lazy loading', 'minification', 'code splitting', 'caching', 'image optimization', 'cdn'],
          category: 'Technical',
        },
        {
          text: 'Explain the difference between client-side routing and traditional server-side navigation.',
          keywords: ['single page application', 'spa', 'history api', 'full page reload', 'react router'],
          category: 'Technical',
        },
      ],
      '1–2 Years': [
        {
          text: 'How does React’s reconciliation algorithm work under the hood, and what role do keys play in preventing state bugs?',
          keywords: ['fiber', 'diffing', 'keys', 'component tree', 'reconciliation', 'work in progress'],
          category: 'Technical',
        },
        {
          text: 'What is the JavaScript Event Loop, and how does the microtask queue differ from the macrotask (callback) queue?',
          keywords: ['event loop', 'call stack', 'microtask', 'macrotask', 'promise.then', 'settimeout'],
          category: 'Technical',
        },
        {
          text: 'Explain how you approach state management in a medium-to-large React application. When is Context API sufficient versus Redux/Zustand?',
          keywords: ['state management', 'context api', 'prop drilling', 'redux', 'zustand', 're-renders'],
          category: 'Technical',
        },
        {
          text: 'How do you identify and debug memory leaks in a frontend Single Page Application (SPA)?',
          keywords: ['event listeners', 'intervals', 'closures', 'chrome devtools', 'heap snapshot', 'cleanup'],
          category: 'Technical',
        },
        {
          text: 'Explain Web Accessibility (a11y) standards and how you ensure keyboard navigation and ARIA attributes work correctly.',
          keywords: ['aria', 'semantic html', 'keyboard navigation', 'focus management', 'contrast', 'screen readers'],
          category: 'Technical',
        },
      ],
      '2–5 Years': [
        {
          text: 'Discuss your strategy for frontend architecture when building a micro-frontend or modular design system across multiple teams.',
          keywords: ['module federation', 'design system', 'versioning', 'shared state', 'ci/cd', 'isolation'],
          category: 'System Design',
        },
        {
          text: 'How do you measure and optimize Core Web Vitals (LCP, FID/INP, CLS) in a high-traffic e-commerce frontend?',
          keywords: ['lcp', 'inp', 'cls', 'code-splitting', 'hydration', 'ssr', 'critical css', 'cdn'],
          category: 'Technical',
        },
        {
          text: 'Can you compare Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR) with Next.js tradeoffs?',
          keywords: ['ssr', 'ssg', 'csr', 'seo', 'time to first byte', 'hydration cost', 'next.js'],
          category: 'Technical',
        },
      ],
    },
  },
  'Backend Developer': {
    Technical: {
      Fresher: [
        {
          text: 'Can you explain the difference between SQL (relational) and NoSQL (document-based) databases, and when to use each?',
          keywords: ['schema', 'acid', 'normalization', 'scaling', 'mongodb', 'postgresql', 'foreign keys'],
          category: 'Technical',
        },
        {
          text: 'What are RESTful API principles, and what are the primary HTTP methods (GET, POST, PUT, DELETE, PATCH)?',
          keywords: ['stateless', 'http methods', 'status codes', 'resource-based', 'idempotent', 'json'],
          category: 'Technical',
        },
        {
          text: 'How does Node.js handle high concurrency despite running on a single-threaded JavaScript execution engine?',
          keywords: ['event loop', 'libuv', 'non-blocking io', 'worker threads', 'asynchronous'],
          category: 'Technical',
        },
        {
          text: 'Explain how JWT (JSON Web Tokens) work for user authentication and how tokens should be stored securely.',
          keywords: ['header', 'payload', 'signature', 'secret', 'httponly cookies', 'bearer token'],
          category: 'Technical',
        },
        {
          text: 'What is database indexing, and how does it speed up queries at the expense of write operations?',
          keywords: ['b-tree', 'lookup time', 'query optimization', 'overhead', 'write penalty', 'primary key'],
          category: 'Technical',
        },
        {
          text: 'What is middleware in Express.js and what are common use cases for custom middleware functions?',
          keywords: ['req', 'res', 'next', 'logging', 'authentication', 'cors', 'error handling'],
          category: 'Technical',
        },
        {
          text: 'How do you prevent SQL Injection and Cross-Site Scripting (XSS) in backend APIs?',
          keywords: ['parameterized queries', 'sanitization', 'validation', 'prepared statements', 'cors', 'helm'],
          category: 'Technical',
        },
        {
          text: 'What is connection pooling in database clients and why is it important in production services?',
          keywords: ['connection pool', 'latency', 'reuse', 'socket', 'database load', 'concurrency'],
          category: 'Technical',
        },
      ],
      '1–2 Years': [
        {
          text: 'How would you design rate limiting for an open public API to prevent abuse or denial-of-service?',
          keywords: ['token bucket', 'leaky bucket', 'redis', 'ip address', 'http 429', 'headers'],
          category: 'Technical',
        },
        {
          text: 'Explain database transactions and ACID guarantees. What happens during a rollback on partial failure?',
          keywords: ['atomicity', 'consistency', 'isolation', 'durability', 'rollback', 'wal', 'commit'],
          category: 'Technical',
        },
        {
          text: 'How does Redis caching work, and what caching strategies (Cache-Aside, Write-Through) would you use for read-heavy workloads?',
          keywords: ['cache-aside', 'ttl', 'in-memory', 'eviction', 'redis', 'cache invalidation'],
          category: 'Technical',
        },
        {
          text: 'Explain the difference between horizontal and vertical database scaling and how read replicas help.',
          keywords: ['sharding', 'vertical scaling', 'horizontal scaling', 'read replicas', 'master-slave'],
          category: 'Technical',
        },
      ],
      '2–5 Years': [
        {
          text: 'Design a distributed task queue system (like BullMQ or Celery) that guarantees at-least-once message processing.',
          keywords: ['message broker', 'redis', 'rabbitmq', 'acknowledgment', 'idempotency', 'dead letter queue'],
          category: 'System Design',
        },
        {
          text: 'How do you handle schema migrations in high-availability relational databases without causing table locking downtime?',
          keywords: ['zero-downtime', 'expand-contract', 'gh-ost', 'online migrations', 'backward compatibility'],
          category: 'Technical',
        },
      ],
    },
  },
  'Full Stack Developer': {
    Technical: {
      Fresher: [
        {
          text: 'Can you explain the end-to-end flow of what happens when a user submits a login form in a MERN stack application?',
          keywords: ['form state', 'fetch/axios', 'express route', 'bcrypt', 'jwt', 'mongo lookup', 'http response'],
          category: 'Technical',
        },
        {
          text: 'What is CORS (Cross-Origin Resource Sharing), why does it happen, and how do you configure it in an Express backend?',
          keywords: ['origin', 'preflight', 'options request', 'access-control-allow-origin', 'security policy'],
          category: 'Technical',
        },
        {
          text: 'How do you manage client-side authentication state in React while keeping credentials secure?',
          keywords: ['localstorage vs cookies', 'httponly', 'context api', 'auth header', 'protected routes'],
          category: 'Technical',
        },
        {
          text: 'Can you compare relational joins in SQL with referencing vs. embedding documents in MongoDB?',
          keywords: ['embedding', 'referencing', 'populate', 'normalization', 'denormalization', 'joins'],
          category: 'Technical',
        },
        {
          text: 'Explain how you handle asynchronous errors gracefully across both React frontend UI and Express backend middleware.',
          keywords: ['try/catch', 'error boundary', 'express error middleware', 'toast/alert', 'status 500'],
          category: 'Technical',
        },
      ],
      '1–2 Years': [
        {
          text: 'How do you architect pagination for large datasets? Compare offset/limit pagination with cursor-based pagination.',
          keywords: ['offset', 'cursor', 'performance', 'real-time inserts', 'index scanning', 'infinite scroll'],
          category: 'Technical',
        },
        {
          text: 'Describe how you structure a production-grade full-stack repository for scalability and clean separation of concerns.',
          keywords: ['controllers', 'services', 'routes', 'reusable components', 'api layer', 'environment config'],
          category: 'Technical',
        },
      ],
      '2–5 Years': [
        {
          text: 'How would you design a real-time collaborative feature (like document editing or live notifications) in a modern web app?',
          keywords: ['websockets', 'sse', 'socket.io', 'redis pub/sub', 'operational transformation', 'crdt'],
          category: 'System Design',
        },
      ],
    },
  },
  'Java Developer': {
    Technical: {
      Fresher: [
        {
          text: 'Can you explain the core principles of Object-Oriented Programming (OOP) in Java with real-world examples?',
          keywords: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'class', 'object'],
          category: 'Technical',
        },
        {
          text: 'What is the Java Virtual Machine (JVM), and what are the roles of the JRE, JDK, and Garbage Collector?',
          keywords: ['jvm', 'jre', 'jdk', 'bytecode', 'garbage collection', 'heap', 'stack'],
          category: 'Technical',
        },
        {
          text: 'Explain the difference between HashMap, ArrayList, and HashSet in the Java Collections Framework.',
          keywords: ['hashmap', 'key-value', 'arraylist', 'indexed', 'hashset', 'unique', 'o(1)'],
          category: 'Technical',
        },
        {
          text: 'What is Dependency Injection in Spring Boot and how does the ApplicationContext manage bean lifecycles?',
          keywords: ['ioc', 'inversion of control', 'beans', 'autowired', 'lifecycle', 'singleton'],
          category: 'Technical',
        },
        {
          text: 'Explain the difference between checked and unchecked exceptions in Java and how to write custom exceptions.',
          keywords: ['runtimeexception', 'throwable', 'try-catch-finally', 'checked', 'unchecked'],
          category: 'Technical',
        },
      ],
      '1–2 Years': [
        {
          text: 'How does Spring Boot’s @Transactional annotation manage transaction propagation and rollbacks?',
          keywords: ['transactional', 'propagation', 'rollbackfor', 'proxy', 'acid', 'isolation level'],
          category: 'Technical',
        },
        {
          text: 'Explain Java Multithreading: what is the synchronized keyword, and how does the ExecutorService manage thread pools?',
          keywords: ['thread pool', 'executorservice', 'runnable', 'callable', 'race conditions', 'deadlock'],
          category: 'Technical',
        },
      ],
      '2–5 Years': [
        {
          text: 'How do you tune JVM garbage collection in high-throughput enterprise Spring services (G1GC vs ZGC)?',
          keywords: ['g1gc', 'zgc', 'stop-the-world', 'heap tuning', 'gc pause', 'metaspace'],
          category: 'Technical',
        },
      ],
    },
  },
  'Software Engineer': {
    Technical: {
      Fresher: [
        {
          text: 'What is Big-O notation, and why is analyzing time and space complexity crucial for software engineering?',
          keywords: ['time complexity', 'space complexity', 'worst case', 'asymptotic analysis', 'o(1)', 'o(n)', 'o(n log n)'],
          category: 'Technical',
        },
        {
          text: 'Can you explain the difference between a stack and a queue, along with common algorithms that utilize them?',
          keywords: ['lifo', 'fifo', 'dfs', 'bfs', 'push/pop', 'enqueue/dequeue'],
          category: 'Technical',
        },
        {
          text: 'What are Git merge conflicts, why do they happen, and what is the difference between git merge and git rebase?',
          keywords: ['branches', 'commit history', 'linear history', 'conflict resolution', 'merge', 'rebase'],
          category: 'Technical',
        },
        {
          text: 'What are unit tests, integration tests, and end-to-end tests, and why is the testing pyramid structured this way?',
          keywords: ['testing pyramid', 'unit test', 'integration test', 'e2e', 'mocking', 'ci/cd'],
          category: 'Technical',
        },
        {
          text: 'Explain the concept of recursion and what causes a stack overflow error.',
          keywords: ['base case', 'recursive call', 'call stack', 'stack overflow', 'memory limit'],
          category: 'Technical',
        },
      ],
      '1–2 Years': [
        {
          text: 'How do you approach refactoring a monolithic legacy function without breaking production behavior?',
          keywords: ['unit tests', 'regression', 'single responsibility', 'extract method', 'clean code'],
          category: 'Technical',
        },
        {
          text: 'Explain Continuous Integration and Continuous Deployment (CI/CD) pipelines and how automated checks prevent regression.',
          keywords: ['github actions', 'build', 'linting', 'automated tests', 'staging', 'deployment'],
          category: 'Technical',
        },
      ],
      '2–5 Years': [
        {
          text: 'Explain how you design a system for high availability, fault tolerance, and disaster recovery across multiple cloud regions.',
          keywords: ['sla', 'fault tolerance', 'load balancer', 'failover', 'active-passive', 'circuit breaker'],
          category: 'System Design',
        },
      ],
    },
  },
  'DevOps Engineer': {
    Technical: {
      Fresher: [
        {
          text: 'How does containerization with Docker differ from traditional virtual machines (VMs), and what are container layers?',
          keywords: ['cgroups', 'namespaces', 'dockerfile', 'layers', 'image', 'overhead', 'daemon'],
          category: 'Technical',
        },
        {
          text: 'Can you explain the core components of Kubernetes architecture (Control Plane, Worker Nodes, Pods, Kubelet, and etcd)?',
          keywords: ['pods', 'kubelet', 'etcd', 'kube-proxy', 'api server', 'control plane', 'deployment'],
          category: 'Technical',
        },
        {
          text: 'What is CI/CD (Continuous Integration / Continuous Delivery), and what are the essential stages of an automated deployment pipeline?',
          keywords: ['ci/cd', 'jenkins', 'github actions', 'build', 'lint', 'test', 'staging', 'deployment'],
          category: 'Technical',
        },
        {
          text: 'Explain the difference between a forward proxy and a reverse proxy (e.g. Nginx), and why reverse proxies are critical in microservices.',
          keywords: ['reverse proxy', 'nginx', 'load balancing', 'ssl termination', 'caching', 'routing'],
          category: 'Technical',
        },
        {
          text: 'What is Infrastructure as Code (IaC) and how does declarative syntax (like Terraform) prevent configuration drift?',
          keywords: ['terraform', 'declarative', 'state file', 'drift', 'idempotent', 'plan', 'apply'],
          category: 'Technical',
        },
        {
          text: 'How do you monitor application health and collect metrics using tools like Prometheus and Grafana?',
          keywords: ['prometheus', 'grafana', 'metrics', 'time-series', 'alertmanager', 'scraping', 'sli', 'slo'],
          category: 'Technical',
        },
      ],
      '1–2 Years': [
        {
          text: 'How would you debug a Kubernetes Pod stuck in CrashLoopBackOff or ImagePullBackOff?',
          keywords: ['kubectl logs', 'describe pod', 'exit code', 'resource limits', 'oom', 'crashloopbackoff'],
          category: 'Technical',
        },
        {
          text: 'Compare Blue-Green deployments with Canary releases. In what scenarios would you choose each strategy?',
          keywords: ['canary', 'blue-green', 'traffic splitting', 'zero downtime', 'rollback', 'ingress'],
          category: 'Technical',
        },
        {
          text: 'How do you manage secrets securely in Kubernetes and CI/CD pipelines instead of committing them to Git?',
          keywords: ['vault', 'sealed secrets', 'external secrets', 'kms', 'environment variables', 'least privilege'],
          category: 'Technical',
        },
      ],
      '2–5 Years': [
        {
          text: 'Design a highly available multi-region Kubernetes cluster deployment with automated disaster recovery and zero data loss.',
          keywords: ['multi-region', 'geo-dns', 'etcd backup', 'stateful sets', 'replication', 'rto', 'rpo'],
          category: 'System Design',
        },
      ],
    },
  },
  'Data Scientist': {
    Technical: {
      Fresher: [
        {
          text: 'What is the bias-variance tradeoff in Machine Learning, and how do regularization techniques (L1/L2) affect it?',
          keywords: ['bias', 'variance', 'overfitting', 'underfitting', 'lasso', 'ridge', 'regularization'],
          category: 'Technical',
        },
        {
          text: 'How do you evaluate classification models when dealing with severely imbalanced datasets? Why is accuracy misleading?',
          keywords: ['precision', 'recall', 'f1 score', 'roc-auc', 'confusion matrix', 'imbalanced', 'smote'],
          category: 'Technical',
        },
        {
          text: 'Explain how gradient descent works, and compare batch gradient descent, mini-batch, and stochastic gradient descent (SGD).',
          keywords: ['learning rate', 'gradient', 'loss function', 'epochs', 'mini-batch', 'convergence'],
          category: 'Technical',
        },
        {
          text: 'What is the difference between supervised, unsupervised, and reinforcement learning? Give real-world examples for each.',
          keywords: ['labeled data', 'clustering', 'reinforcement', 'reward', 'regression', 'classification'],
          category: 'Technical',
        },
        {
          text: 'How do you handle missing or corrupt values in tabular datasets using Pandas, and when is imputation preferable to dropping rows?',
          keywords: ['imputation', 'mean', 'median', 'knn imputation', 'pandas', 'null values', 'data leak'],
          category: 'Technical',
        },
        {
          text: 'What is feature scaling (Standardization vs. Normalization), and which ML algorithms are sensitive to feature scales?',
          keywords: ['standardscaler', 'minmax', 'distance-based', 'knn', 'svm', 'neural networks', 'gradient'],
          category: 'Technical',
        },
      ],
      '1–2 Years': [
        {
          text: 'Explain how Ensemble methods work (Bagging vs. Boosting) using Random Forest and XGBoost/LightGBM as examples.',
          keywords: ['bagging', 'boosting', 'random forest', 'xgboost', 'weak learners', 'residual errors'],
          category: 'Technical',
        },
        {
          text: 'What is data leakage in ML pipelines, how does it occur during preprocessing, and how do you prevent it using Cross-Validation?',
          keywords: ['data leakage', 'train test split', 'pipeline', 'cross-validation', 'target leakage'],
          category: 'Technical',
        },
      ],
      '2–5 Years': [
        {
          text: 'How do you detect and mitigate model drift (covariate shift vs. concept drift) for an ML model deployed in real-time production?',
          keywords: ['concept drift', 'covariate shift', 'evidently', 'monitoring', 'retraining triggers', 'ks-test'],
          category: 'System Design',
        },
      ],
    },
  },
  'AI/ML Engineer': {
    Technical: {
      Fresher: [
        {
          text: 'Explain how backpropagation and the chain rule calculate weight gradients in deep neural networks.',
          keywords: ['backpropagation', 'chain rule', 'gradients', 'activation function', 'loss', 'weights'],
          category: 'Technical',
        },
        {
          text: 'What is the vanishing/exploding gradient problem in deep networks, and how do ReLU and residual connections (ResNet) resolve it?',
          keywords: ['vanishing gradient', 'relu', 'resnet', 'skip connections', 'batch normalization'],
          category: 'Technical',
        },
        {
          text: 'How does the Self-Attention mechanism in Transformer models work, and why did it replace RNNs/LSTMs in NLP?',
          keywords: ['self-attention', 'query', 'key', 'value', 'transformer', 'parallelization', 'embeddings'],
          category: 'Technical',
        },
        {
          text: 'Compare Retrieval-Augmented Generation (RAG) with fine-tuning an LLM. When is RAG preferred over fine-tuning?',
          keywords: ['rag', 'vector database', 'embeddings', 'fine-tuning', 'hallucinations', 'latency', 'cost'],
          category: 'Technical',
        },
        {
          text: 'What are vector embeddings and vector databases (e.g. Pinecone, Chroma, Milvus)? How is similarity measured?',
          keywords: ['cosine similarity', 'dot product', 'embeddings', 'vector search', 'ann', 'hsnw'],
          category: 'Technical',
        },
      ],
      '1–2 Years': [
        {
          text: 'How do you optimize LLM inference latency and throughput in production (e.g., quantization, vLLM, paged attention, ONNX)?',
          keywords: ['quantization', 'int8', 'fp16', 'vllm', 'paged attention', 'tensor parallelism', 'latency'],
          category: 'Technical',
        },
        {
          text: 'Explain Parameter-Efficient Fine-Tuning (PEFT) and LoRA (Low-Rank Adaptation). How does LoRA freeze base weights while adapting?',
          keywords: ['lora', 'peft', 'low rank', 'matrix decomposition', 'gpu memory', 'adapter weights'],
          category: 'Technical',
        },
      ],
      '2–5 Years': [
        {
          text: 'Design an end-to-end multi-modal AI pipeline that indexes enterprise documents, supports RAG semantic search, and enforces strict access control.',
          keywords: ['rag architecture', 'chunking', 'reranking', 'vector db', 'rbac', 'guardrails', 'evaluation'],
          category: 'System Design',
        },
      ],
    },
  },
};

const HR_QUESTIONS = [
  {
    text: 'Tell me about yourself, your educational background, and what inspired you to pursue software engineering.',
    keywords: ['background', 'projects', 'passion', 'learning', 'growth', 'problem solving'],
    category: 'HR',
  },
  {
    text: 'Can you describe a challenging technical project you worked on, a major bug or obstacle you encountered, and how you resolved it?',
    keywords: ['star method', 'obstacle', 'debug', 'collaboration', 'solution', 'impact'],
    category: 'Behavioral',
  },
  {
    text: 'How do you handle disagreement or constructive criticism during code reviews or team discussions?',
    keywords: ['feedback', 'open-minded', 'code review', 'empathy', 'team goal', 'communication'],
    category: 'Behavioral',
  },
  {
    text: 'Where do you see yourself in 3 to 5 years, and what technical skills are you actively focusing on mastering right now?',
    keywords: ['career goals', 'mentorship', 'architecture', 'continuous learning', 'leadership'],
    category: 'HR',
  },
  {
    text: 'Why are you interested in this role and what makes you a strong culture fit for a fast-paced development team?',
    keywords: ['ownership', 'proactive', 'team player', 'values', 'adaptability'],
    category: 'HR',
  },
];

/**
 * Synthesizes domain-specific technical questions for any custom job role & skills
 */
function synthesizeCustomRoleQuestions({ jobRole, customSkills = '', customDescription = '', count = 6 }) {
  const roleName = jobRole || 'Specialist Engineer';
  const skillsList = customSkills
    ? customSkills.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
    : [];

  const questions = [];

  // Skill-driven specific questions if skills provided
  if (skillsList.length > 0) {
    const s1 = skillsList[0];
    questions.push({
      text: `In your experience with ${s1}, how do you structure production implementations to ensure scalability, reliability, and maintainability?`,
      keywords: [s1.toLowerCase(), 'architecture', 'scalability', 'production', 'reliability'],
      category: 'Technical',
    });

    if (skillsList.length > 1) {
      const s2 = skillsList[1];
      questions.push({
        text: `How do you integrate ${s1} with ${s2} in real-world workflows, and what architectural challenges or bottlenecks have you encountered?`,
        keywords: [s1.toLowerCase(), s2.toLowerCase(), 'integration', 'bottleneck', 'performance'],
        category: 'Technical',
      });
    }

    if (skillsList.length > 2) {
      const s3 = skillsList[2];
      questions.push({
        text: `What are the best practices for error handling, observability, and debugging when working with ${s3}?`,
        keywords: [s3.toLowerCase(), 'debugging', 'observability', 'monitoring', 'error handling'],
        category: 'Technical',
      });
    }
  }

  // Core role-driven technical questions
  questions.push({
    text: `As a ${roleName}, how do you approach diagnosing and resolving critical production incidents or performance regressions?`,
    keywords: ['troubleshooting', 'incident response', 'root cause analysis', 'latency', 'production'],
    category: 'Technical',
  });

  questions.push({
    text: `What are the most critical security vulnerabilities, compliance requirements, or data protection standards relevant to a ${roleName}?`,
    keywords: ['security', 'compliance', 'least privilege', 'encryption', 'best practices'],
    category: 'Technical',
  });

  questions.push({
    text: `Can you walk me through the lifecycle of deploying a change from local development into production in your ideal ${roleName} workflow?`,
    keywords: ['ci/cd', 'deployment', 'testing', 'code review', 'automation', 'staging'],
    category: 'Technical',
  });

  questions.push({
    text: `When evaluating new technologies or libraries for a ${roleName} initiative, what criteria and trade-offs guide your technical decisions?`,
    keywords: ['trade-offs', 'benchmarking', 'maintainability', 'ecosystem', 'community'],
    category: 'System Design',
  });

  if (customDescription) {
    questions.push({
      text: `Considering your target focus ("${customDescription.substring(0, 120)}"), how do you align day-to-day engineering deliverables with business impact?`,
      keywords: ['business impact', 'prioritization', 'roi', 'architecture', 'deliverables'],
      category: 'Technical',
    });
  }

  return questions.slice(0, count);
}

// Helper to validate Google AI Studio Gemini API key format (starts with AIzaSy or AQ.)
const isValidGeminiKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return (trimmed.startsWith('AIzaSy') || trimmed.startsWith('AQ.')) && trimmed.length >= 35;
};

/**
 * Generate questions tailored to role, type, level, and count (incorporating custom role & resume text if provided)
 */
const generateInterviewQuestions = async ({
  jobRole,
  jobRoleType = 'predefined',
  customSkills = '',
  customDescription = '',
  interviewType,
  experienceLevel,
  questionCount = 5,
  resumeSnippet = '',
}) => {
  // If external API keys (Gemini / OpenAI) exist and are valid, try calling them first
  if (isValidGeminiKey(process.env.GEMINI_API_KEY)) {
    try {
      const questions = await callGeminiForQuestions({
        jobRole,
        jobRoleType,
        customSkills,
        customDescription,
        interviewType,
        experienceLevel,
        questionCount,
        resumeSnippet,
      });
      if (questions && questions.length >= questionCount) return questions.slice(0, questionCount);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to intelligent internal engine:', err.message);
    }
  }

  // Fallback intelligent domain engine
  // Match custom or predefined role from QUESTION_BANK if exact or fuzzy match
  let rolePool = QUESTION_BANK[jobRole];

  if (!rolePool) {
    // Check if role contains key words like 'devops', 'data', 'cloud', 'security'
    const lowerRole = (jobRole || '').toLowerCase();
    if (lowerRole.includes('devops') || lowerRole.includes('sre') || lowerRole.includes('infrastructure')) {
      rolePool = QUESTION_BANK['DevOps Engineer'];
    } else if (lowerRole.includes('data science') || lowerRole.includes('data scientist')) {
      rolePool = QUESTION_BANK['Data Scientist'];
    } else if (lowerRole.includes('ai') || lowerRole.includes('ml') || lowerRole.includes('machine learning')) {
      rolePool = QUESTION_BANK['AI/ML Engineer'];
    } else if (lowerRole.includes('cloud')) {
      rolePool = QUESTION_BANK['DevOps Engineer'];
    } else {
      rolePool = QUESTION_BANK['Software Engineer'];
    }
  }

  const techPool = (rolePool.Technical && (rolePool.Technical[experienceLevel] || rolePool.Technical['Fresher'])) || [];
  const hrPool = HR_QUESTIONS;

  let pool = [];

  // If custom role with custom skills, prioritize synthesized domain questions
  if (jobRoleType === 'custom' || customSkills) {
    const customTechQs = synthesizeCustomRoleQuestions({
      jobRole,
      customSkills,
      customDescription,
      count: questionCount,
    });
    pool = [...customTechQs, ...techPool];
  } else if (interviewType === 'Technical') {
    pool = [...techPool];
    if (pool.length < questionCount) {
      const extra = QUESTION_BANK['Software Engineer'].Technical['Fresher'];
      pool = [...pool, ...extra];
    }
  } else if (interviewType === 'HR') {
    pool = [...hrPool];
  } else {
    // Mixed: balance technical and HR
    const half = Math.ceil(questionCount / 2);
    pool = [...techPool.slice(0, half), ...hrPool.slice(0, questionCount - half)];
  }

  // If candidate uploaded a resume, inject a tailored resume question into position 2 or 3
  if (resumeSnippet && resumeSnippet.length > 50) {
    const resumeKeywords = extractKeywordsFromResume(resumeSnippet);
    if (resumeKeywords.length > 0) {
      const resumeQuestion = {
        text: `I noticed in your resume that you have experience with ${resumeKeywords.slice(0, 3).join(', ')}. Could you walk me through how you architected that and the key challenges you solved?`,
        keywords: resumeKeywords,
        category: 'Technical',
      };
      pool.splice(1, 0, resumeQuestion);
    }
  }

  // Ensure unique questions, format with sequential IDs
  const selected = [];
  const seenTexts = new Set();

  for (const item of pool) {
    if (!seenTexts.has(item.text) && selected.length < questionCount) {
      seenTexts.add(item.text);
      selected.push({
        questionId: selected.length + 1,
        questionText: item.text,
        category: item.category || (interviewType === 'HR' ? 'HR' : 'Technical'),
        expectedKeywords: item.keywords || [],
      });
    }
  }

  // If still below questionCount, pad from fallback general tech bank
  let padIndex = 0;
  const backup = QUESTION_BANK['Software Engineer'].Technical.Fresher;
  while (selected.length < questionCount && padIndex < backup.length) {
    const item = backup[padIndex++];
    if (!seenTexts.has(item.text)) {
      seenTexts.add(item.text);
      selected.push({
        questionId: selected.length + 1,
        questionText: item.text,
        category: item.category,
        expectedKeywords: item.keywords,
      });
    }
  }

  return selected.slice(0, questionCount);
};

/**
 * Evaluate single candidate answer against rubric
 */
const evaluateCandidateAnswer = async ({
  questionText,
  category,
  expectedKeywords = [],
  userAnswer = '',
  jobRole,
  experienceLevel,
}) => {
  if (isValidGeminiKey(process.env.GEMINI_API_KEY) && userAnswer.trim().length > 5) {
    try {
      const aiEval = await callGeminiForEvaluation({
        questionText,
        userAnswer,
        jobRole,
        experienceLevel,
      });
      if (aiEval && typeof aiEval.score === 'number') return aiEval;
    } catch (err) {
      console.warn('Gemini evaluation failed, using heuristic evaluation engine:', err.message);
    }
  }

  return heuristicAnswerEvaluation({
    questionText,
    category,
    expectedKeywords,
    userAnswer,
    jobRole,
    experienceLevel,
  });
};

/**
 * Intelligent heuristic evaluator that inspects keyword matches, length, structure,
 * clarity, technical depth, and generates specific feedback and missing points.
 */
function heuristicAnswerEvaluation({
  questionText,
  category,
  expectedKeywords = [],
  userAnswer = '',
  jobRole,
  experienceLevel,
}) {
  const cleanAns = (userAnswer || '').trim();
  const lowerAns = cleanAns.toLowerCase();

  // If empty or negligible
  if (!cleanAns || cleanAns.length < 15) {
    return {
      score: 2,
      technicalScore: 2,
      communicationScore: 3,
      relevanceScore: 2,
      problemSolvingScore: 2,
      positiveFeedback: 'You attempted to respond, which shows willingness to engage.',
      missingPoints: [
        'Detailed explanation of the core concept',
        'Real-world implementation example or code flow',
        'Trade-offs and architectural considerations',
      ],
      improvementSuggestion: 'Provide a structured answer following the definition, how it works, and an example.',
      evaluatedAt: new Date(),
    };
  }

  // Count keyword hits
  let matchedKeywords = [];
  let missedKeywords = [];

  for (const kw of expectedKeywords) {
    if (lowerAns.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missedKeywords.push(kw);
    }
  }

  const keywordRatio = expectedKeywords.length > 0 ? matchedKeywords.length / expectedKeywords.length : 0.6;
  const wordCount = cleanAns.split(/\s+/).length;

  // Calculate scores across the 5 dimensions requested
  let baseScore = 5;

  // Word count depth scoring
  if (wordCount > 30) baseScore += 1;
  if (wordCount > 70) baseScore += 1;
  if (wordCount > 120) baseScore += 0.5;

  // Technical keyword bonus
  baseScore += Math.min(2.5, keywordRatio * 3);

  // Clamp overall score
  const finalScore = Math.min(10, Math.max(3, Math.round(baseScore * 10) / 10));

  // Category scores
  const technicalScore = Math.min(10, Math.max(3, Math.round((baseScore * 0.95 + keywordRatio * 2) * 10) / 10));
  const communicationScore = Math.min(
    10,
    Math.max(4, Math.round((wordCount >= 40 && wordCount <= 180 ? 8.5 : 7.0) * 10) / 10)
  );
  const relevanceScore = Math.min(
    10,
    Math.max(3, Math.round((keywordRatio > 0.3 ? 8.0 : 5.5 + keywordRatio * 4) * 10) / 10)
  );
  const problemSolvingScore = Math.min(
    10,
    Math.max(3, Math.round((finalScore * 0.9 + (lowerAns.includes('example') || lowerAns.includes('because') ? 1 : 0)) * 10) / 10)
  );

  // Generate actionable positive feedback
  let positiveFeedback = '';
  if (matchedKeywords.length > 0) {
    positiveFeedback = `Good grasp of key concepts. You effectively highlighted ${matchedKeywords.slice(0, 3).join(', ')} and framed your thoughts cleanly.`;
  } else if (wordCount > 40) {
    positiveFeedback = 'Clear communication structure and articulate phrasing of your thoughts.';
  } else {
    positiveFeedback = 'Direct answer that addresses the basic premise of the question.';
  }

  // Generate missing points
  let missingPoints = [];
  if (missedKeywords.length > 0) {
    missingPoints = missedKeywords.slice(0, 3).map((kw) => `Deeper exploration of "${kw}" in production`);
  } else {
    missingPoints = [
      'Edge cases and performance bottlenecks under high concurrency',
      'Specific trade-offs compared to alternative architectural patterns',
    ];
  }

  // Improvement suggestion
  let improvementSuggestion = '';
  if (finalScore >= 8) {
    improvementSuggestion = 'Excellent response! To elevate this to staff engineer level, quantify your past impact or mention monitoring metrics.';
  } else if (finalScore >= 6) {
    improvementSuggestion = `Consider incorporating real-world trade-offs and specifically elaborating on ${
      missedKeywords[0] || 'underlying system mechanics'
    }.`;
  } else {
    improvementSuggestion = 'Use the STAR method (Situation, Task, Action, Result) or provide concrete syntax and architecture details.';
  }

  return {
    score: finalScore,
    technicalScore,
    communicationScore,
    relevanceScore,
    problemSolvingScore,
    positiveFeedback,
    missingPoints,
    improvementSuggestion,
    evaluatedAt: new Date(),
  };
}

/**
 * Generate comprehensive final report from all answered questions
 */
const generateFinalReport = (questions = []) => {
  const answered = questions.filter((q) => q.evaluation && typeof q.evaluation.score === 'number');

  if (answered.length === 0) {
    return {
      overallScore: 0,
      technicalAccuracy: 0,
      communicationClarity: 0,
      answerRelevance: 0,
      problemSolving: 0,
      strengths: ['Started the interview session'],
      areasToImprove: ['Complete the questions to generate in-depth analytics'],
      recommendations: ['Practice full interview sessions with spoken answers'],
      summary: 'Interview was incomplete without submitted answers.',
    };
  }

  const sum = (arr, key) => arr.reduce((acc, q) => acc + (q.evaluation[key] || q.evaluation.score || 0), 0);

  const count = answered.length;
  const overall = Math.round((sum(answered, 'score') / count) * 10) / 10;
  const technical = Math.round((sum(answered, 'technicalScore') / count) * 10) / 10;
  const communication = Math.round((sum(answered, 'communicationScore') / count) * 10) / 10;
  const relevance = Math.round((sum(answered, 'relevanceScore') / count) * 10) / 10;
  const problemSolving = Math.round((sum(answered, 'problemSolvingScore') / count) * 10) / 10;

  // Synthesize strengths
  const strengths = [];
  if (technical >= 7.5) strengths.push('Strong foundational technical knowledge and accurate terminology.');
  if (communication >= 7.5) strengths.push('Clear, articulate expression with structured thought flow.');
  if (relevance >= 7.5) strengths.push('Direct, to-the-point answers that stayed focused on the interviewer prompt.');
  if (problemSolving >= 7.5) strengths.push('Sound analytical reasoning when addressing implementation challenges.');
  if (strengths.length === 0) strengths.push('Demonstrated positive effort and clear motivation to communicate key points.');

  // Synthesize areas to improve
  const areasToImprove = [];
  if (technical < 8) areasToImprove.push('Deepen understanding of edge cases, internal engine mechanics, and memory allocation.');
  if (communication < 8) areasToImprove.push('Structure answers more systematically (e.g. Definition → Architecture → Real-world Example).');
  if (relevance < 8) areasToImprove.push('Ensure answers address all sub-questions before moving to tangential details.');
  if (areasToImprove.length === 0) areasToImprove.push('Focus on architectural trade-offs at extreme scale.');

  // Recommendations
  const recommendations = [
    'Practice speaking answers out loud using the voice recorder to improve confidence and reduce hesitation.',
    'Review system design trade-offs and real-world failure modes for your chosen tech stack.',
    'Incorporate the STAR methodology when discussing past engineering challenges and bugs.',
  ];

  let summary = '';
  if (overall >= 8.5) {
    summary = 'Outstanding performance! You displayed strong technical command, clear communication, and confident delivery. You are well-prepared for real-world SDE interviews.';
  } else if (overall >= 7.0) {
    summary = 'Solid performance with promising potential. Your foundational knowledge is clear, but refining specific trade-offs and edge cases will elevate your responses to top-tier hiring standards.';
  } else {
    summary = 'Good effort. Focusing on structured answering techniques and reviewing core computer science concepts will help you make a significant leap in interview performance.';
  }

  return {
    overallScore: overall,
    technicalAccuracy: technical,
    communicationClarity: communication,
    answerRelevance: relevance,
    problemSolving,
    strengths,
    areasToImprove,
    recommendations,
    summary,
  };
};

// Helper: Extract key technologies/skills from resume text
function extractKeywordsFromResume(text) {
  const commonTech = [
    'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'JavaScript', 'TypeScript',
    'Java', 'Spring Boot', 'Python', 'Docker', 'AWS', 'Kubernetes', 'Redux', 'GraphQL',
    'REST API', 'Git', 'Next.js', 'Tailwind', 'Microservices', 'Redis',
  ];

  const found = [];
  const lower = text.toLowerCase();
  for (const tech of commonTech) {
    if (lower.includes(tech.toLowerCase())) {
      found.push(tech);
    }
  }
  return found;
}

// Optional Gemini API integration
async function callGeminiForQuestions({
  jobRole,
  jobRoleType,
  customSkills,
  customDescription,
  interviewType,
  experienceLevel,
  questionCount,
  resumeSnippet,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!isValidGeminiKey(apiKey)) return null;

  const prompt = `You are a senior tech hiring manager and principal technical interviewer. Generate exactly ${questionCount} realistic, rigorous, and relevant interview questions for the role: "${jobRole}", interview type "${interviewType}", and experience level "${experienceLevel}".
${customSkills ? `Focus on these required technologies and skills: ${customSkills}` : ''}
${customDescription ? `Target Role Context / Focus: ${customDescription}` : ''}
${resumeSnippet ? `Candidate Resume Context: ${resumeSnippet.substring(0, 1000)}` : ''}
Return ONLY a valid JSON array of objects with the schema:
[
  {
    "questionId": 1,
    "questionText": "Question string here?",
    "category": "Technical",
    "expectedKeywords": ["keyword1", "keyword2"]
  }
]`;

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) throw new Error(`Gemini API error ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

async function callGeminiForEvaluation({ questionText, userAnswer, jobRole, experienceLevel }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!isValidGeminiKey(apiKey)) return null;

  const prompt = `You are evaluating a candidate's answer for the role of ${jobRole} (${experienceLevel}).
Question: "${questionText}"
Candidate Answer: "${userAnswer}"

Evaluate strictly on: Correctness, Relevance, Technical Knowledge, Completeness, and Communication.
Return ONLY valid JSON matching this schema:
{
  "score": 8.0,
  "technicalScore": 8.0,
  "communicationScore": 8.5,
  "relevanceScore": 8.0,
  "problemSolvingScore": 7.5,
  "positiveFeedback": "One or two sentences highlighting what they did well.",
  "missingPoints": ["Point 1 that was missed", "Point 2 that was missed"],
  "improvementSuggestion": "Concrete actionable tip to make this a 10/10 answer."
}`;

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) throw new Error(`Gemini API error ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(text);
  parsed.evaluatedAt = new Date();
  return parsed;
}

/**
 * Generates an adaptive, contextual follow-up question when an answer is brief or misses nuance
 */
const generateFollowUpQuestion = ({
  questionText = '',
  userAnswer = '',
  evaluation,
  jobRole = '',
  experienceLevel = '',
}) => {
  const answerLen = (userAnswer || '').trim().split(/\s+/).length;
  // If score is high (> 8.2) and candidate spoke extensively, proceed without follow-up
  if (evaluation && evaluation.score >= 8.2 && answerLen > 70) {
    return null;
  }

  const lowerQ = (questionText || '').toLowerCase();

  if (lowerQ.includes('jwt') || lowerQ.includes('token') || lowerQ.includes('auth')) {
    return {
      questionText: 'That covers the standard flow. How would you handle token expiration, revocation, and secure refresh token storage in production?',
      category: 'Technical',
      expectedKeywords: ['refresh token', 'expiration', 'rotation', 'httponly', 'blacklist', 'redis'],
    };
  }

  if (lowerQ.includes('virtual dom') || lowerQ.includes('react') || lowerQ.includes('reconciliation')) {
    return {
      questionText: 'How would you identify unnecessary re-renders in complex React component trees, and when is useMemo or useCallback actually warranted?',
      category: 'Technical',
      expectedKeywords: ['usememo', 'usecallback', 'profiler', 'referential equality', 'render cost'],
    };
  }

  if (lowerQ.includes('sql') || lowerQ.includes('nosql') || lowerQ.includes('database')) {
    return {
      questionText: 'How would you handle schema migrations or indexing strategies when zero downtime is required on high-write tables?',
      category: 'Technical',
      expectedKeywords: ['indexing', 'zero downtime', 'migration', 'read replica', 'lock contention'],
    };
  }

  if (lowerQ.includes('event loop') || lowerQ.includes('async') || lowerQ.includes('promise')) {
    return {
      questionText: 'What is the operational difference between the microtask queue and macrotask callback queue in Node.js / V8?',
      category: 'Technical',
      expectedKeywords: ['microtask', 'macrotask', 'process.nexttick', 'settimeout', 'promise queue'],
    };
  }

  if (lowerQ.includes('rest') || lowerQ.includes('api') || lowerQ.includes('http')) {
    return {
      questionText: 'How do you ensure idempotency and handle rate-limiting when designing public-facing APIs?',
      category: 'Technical',
      expectedKeywords: ['idempotency key', 'rate limiting', 'redis', 'token bucket', 'http 429'],
    };
  }

  if (evaluation?.missingPoints && evaluation.missingPoints.length > 0) {
    const point = evaluation.missingPoints[0];
    return {
      questionText: `Could you elaborate further on ${point.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}? What are the architectural trade-offs?`,
      category: 'Technical',
      expectedKeywords: ['trade-offs', 'edge cases', 'scalability', 'best practices'],
    };
  }

  return {
    questionText: 'Can you walk through a concrete scenario where this approach would break or encounter performance bottlenecks?',
    category: 'Technical',
    expectedKeywords: ['bottleneck', 'edge case', 'scalability', 'performance'],
  };
};

/**
 * Returns additional questions from the question bank to keep session dynamic if time remains
 */
const getAdditionalQuestions = ({
  jobRole,
  interviewType,
  experienceLevel,
  existingQuestions = [],
  count = 3,
}) => {
  const existingTexts = new Set(existingQuestions.map((q) => (q.questionText || '').trim().toLowerCase()));
  const rolePool = QUESTION_BANK[jobRole] || QUESTION_BANK['Software Engineer'];
  const techPool = (rolePool.Technical && (rolePool.Technical[experienceLevel] || rolePool.Technical['Fresher'])) || [];
  const hrPool = HR_QUESTIONS;

  let candidatePool = [];
  if (interviewType === 'Technical') {
    candidatePool = [...techPool, ...(QUESTION_BANK['Software Engineer']?.Technical?.Fresher || [])];
  } else if (interviewType === 'HR') {
    candidatePool = [...hrPool];
  } else {
    candidatePool = [...techPool, ...hrPool];
  }

  const additional = [];
  for (const item of candidatePool) {
    if (!existingTexts.has((item.text || '').trim().toLowerCase()) && additional.length < count) {
      existingTexts.add((item.text || '').trim().toLowerCase());
      additional.push({
        questionId: existingQuestions.length + additional.length + 1,
        questionText: item.text,
        category: item.category || (interviewType === 'HR' ? 'HR' : 'Technical'),
        expectedKeywords: item.keywords || [],
      });
    }
  }

  return additional;
};

module.exports = {
  generateInterviewQuestions,
  evaluateCandidateAnswer,
  generateFinalReport,
  generateFollowUpQuestion,
  getAdditionalQuestions,
};
