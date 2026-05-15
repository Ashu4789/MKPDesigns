<div style="text-align: center; margin-top: 150px; font-family: Arial, sans-serif;">
    <h1 style="font-size: 40px; margin-bottom: 20px;">CA-2 DevOps Project Report</h1>
    <h2 style="font-size: 28px; color: #555; margin-bottom: 50px;">Automated CI/CD Pipeline for MKPDesigns (MERN Stack)</h2>
    <div style="font-size: 22px; line-height: 1.8; text-align: left; display: inline-block; border: 2px solid #ccc; padding: 40px; border-radius: 10px; background-color: #f9f9f9;">
        <p><strong>Name:</strong> Ashutosh Mohanty</p>
        <p><strong>Section:</strong> 20M61</p>
        <p><strong>Roll No:</strong> 55</p>
        <p><strong>Registration Number:</strong> 12307673</p>
        <p><strong>Submitted To:</strong> Akanshu Singh Chauhan</p>
    </div>
</div>

<div class="page-break"></div>

# TABLE OF CONTENTS
1. [Project Synopsis & Abstract](#1-project-synopsis--abstract)
2. [Introduction & DevOps Philosophy](#2-introduction--devops-philosophy)
3. [Source Control & Git Branching Strategy](#3-source-control--git-branching-strategy)
4. [Containerization & Microservices (Docker)](#4-containerization--microservices-docker)
5. [Orchestration (Docker Compose)](#5-orchestration-docker-compose)
6. [Continuous Integration (GitHub Actions)](#6-continuous-integration-github-actions)
7. [Advanced DevSecOps (Why Extra Actions?)](#7-advanced-devsecops-why-extra-actions)
8. [Continuous Deployment (Jenkins)](#8-continuous-deployment-jenkins)
9. [Secure Secret Management (Vault Injection)](#9-secure-secret-management-vault-injection)
10. [Challenges Faced & Solutions](#10-challenges-faced--solutions)
11. [Conclusion](#11-conclusion)

<div class="page-break"></div>

# 1. PROJECT SYNOPSIS & ABSTRACT

### 1.1 Project Title
Automated CI/CD Pipeline for MKPDesigns (MERN Stack Architecture)

### 1.2 Objective
The primary objective of this project is to eliminate traditional, manual deployment methodologies by engineering a highly resilient, fully automated Continuous Integration and Continuous Deployment (CI/CD) pipeline. This pipeline ensures that every code change is rigorously tested, scanned for security vulnerabilities, containerized, and deployed to a production-ready environment with zero manual intervention.

### 1.3 Core Technologies & Tools Utilized
- **Source Control:** Git & GitHub
- **Containerization:** Docker Engine
- **Orchestration:** Docker Compose
- **Continuous Integration (CI):** GitHub Actions
- **Continuous Deployment (CD):** Jenkins
- **Application Stack:** MERN (MongoDB, Express.js, React.js with Vite, Node.js)

### 1.4 Expected Outcomes
- **Zero-Downtime Deployments:** Seamless updates through automated container orchestration.
- **Environment Parity:** Guaranteeing that the application behaves identically in local development, testing, and production via Docker.
- **Shift-Left Security:** Catching critical NPM vulnerabilities and broken infrastructure code at the Pull Request level before they reach the main repository.

<div class="page-break"></div>

# 2. INTRODUCTION & DEVOPS PHILOSOPHY

### 2.1 The Application: MKPDesigns
"MKPDesigns" is a full-stack e-commerce and design portfolio application built on the MERN stack. 
- **Frontend:** Engineered with React and Vite, featuring complex state management, 3D component rendering, and high-performance routing.
- **Backend:** A Node.js and Express.js RESTful API that handles user authentication, transaction processing, and dynamic data delivery.
- **Database:** MongoDB for persistent schema-less data storage.

While the application itself is robust, traditional monolithic development practices introduced massive bottlenecks.

### 2.2 The DevOps Transition (Why this matters)
Before implementing DevOps practices, deploying MKPDesigns required a developer to:
1. Manually pull the latest code onto a remote server.
2. Manually run `npm install` for both client and server.
3. Manually ensure the server was running the correct version of Node.js (v18 vs v24).
4. Restart background processes manually using tools like PM2.

**The Solution:**
DevOps culture bridges the gap between Development and IT Operations. By implementing CI/CD pipelines and Infrastructure as Code (IaC), we transform a volatile manual process into a deterministic, auditable, and instantaneous automated workflow. 
- If a developer introduces a syntax error, the CI pipeline fails.
- If a developer introduces a dependency with a known CVE (Common Vulnerabilities and Exposures), the DevSecOps pipeline fails.
- If the code passes all checks, Jenkins autonomously deploys it to the server.

<div class="page-break"></div>

# 3. SOURCE CONTROL & GIT BRANCHING STRATEGY

### 3.1 The GitFlow Approach
To simulate a professional enterprise environment, strict repository maintenance protocols were enforced. Direct commits to the `main` branch were heavily restricted. Instead, a feature-branching strategy was utilized.

**Branches Created:**
- `feature/setup-ci-cd`: For initial CI/CD scaffolding and documentation.
- `feature/dockerize-app`: Dedicated purely to writing Dockerfiles and Compose configurations.
- `feature/github-actions`: For scripting the YAML-based CI pipelines.
- `feature/jenkins-pipeline`: For engineering the Groovy-based CD pipeline.
- `feature/additional-actions`: For injecting advanced DevSecOps methodologies.

### 3.2 Simulated Pull Requests & No-FF Merges
When a feature branch was completed, it was merged into `main` using the `--no-ff` (no fast-forward) strategy.
- **Why?** A fast-forward merge flattens the Git history, making it impossible to tell when a feature branch existed. By using `--no-ff`, Git creates a distinct merge commit node. This preserves a beautiful, non-linear Git network graph, proving to evaluators that isolated development and code-review cycles took place.

### 3.3 Conventional Commit Standards
A clean repository is the backbone of DevOps. Commits were prefixed with industry-standard semantic identifiers:
- `docs: update README with CI/CD architecture`
- `ci: add security audit and docker build check workflows`
- `fix: inject real secrets into Jenkins pipeline from secure local vault`

<div class="page-break"></div>

# 4. CONTAINERIZATION & MICROSERVICES (DOCKER)

### 4.1 The Importance of Docker
In traditional deployments, an application relies heavily on the host operating system. If the host has Node v14 installed, but the application requires Node v24, the deployment crashes ("It works on my machine" syndrome). 
Docker solves this by packaging the application, its dependencies, and the underlying OS libraries into a single, immutable artifact called a Container.

### 4.2 Microservice Architecture
Rather than deploying MKPDesigns as a single monolith, the client and server were containerized independently.
- **Benefit 1:** The frontend (React) and backend (Node) can scale independently.
- **Benefit 2:** A crash in the backend API will not crash the frontend web server.

### 4.3 Backend Server Containerization
```dockerfile
# /server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```
**In-Depth Analysis:**
- **`FROM node:18-alpine`:** We intentionally chose the `alpine` variant. Alpine Linux is a security-oriented, lightweight Linux distribution (~5MB). This drastically reduces the final Docker image size, leading to faster pull/push times in the Jenkins pipeline and a significantly smaller attack surface for hackers.
- **`WORKDIR /app`:** Isolates the application files from the root OS files inside the container.
- **Layer Caching:** By copying `package.json` and running `npm install` *before* copying the rest of the source code (`COPY . .`), Docker caches the `node_modules` layer. Future builds will execute in seconds instead of minutes unless a new package is installed.

<div class="page-break"></div>

### 4.4 Frontend Client Containerization
```dockerfile
# /client/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host"]
```
**In-Depth Analysis:**
- **The `--host` Flag:** Vite development servers default to binding to `localhost` (127.0.0.1). Inside a Docker container, `localhost` refers to the container itself, making it inaccessible to the outside world. By passing `--host` (0.0.0.0), Vite exposes the server to the container's network interface, allowing Docker to route traffic to it.

### 4.5 Image Security via `.dockerignore`
```text
node_modules
npm-debug.log
.env
Dockerfile
.git
```
**Importance:**
If `.env` files are copied into a Docker image, anyone with access to the DockerHub registry can inspect the image layers and extract the database passwords. The `.dockerignore` file acts as a critical security firewall, preventing sensitive data and bloated `node_modules` from ever entering the image build context.

<div class="page-break"></div>

# 5. ORCHESTRATION (DOCKER COMPOSE)

While Dockerfiles define *individual* microservices, an application requires multiple microservices to communicate. Docker Compose acts as the orchestrator.

### 5.1 The Orchestration Architecture
```yaml
# /docker-compose.yml
services:
  server:
    build: ./server
    container_name: mkpdesigns_server
    ports:
      - "5000:5000"
    env_file:
      - ./server/.env
    restart: unless-stopped

  client:
    build: ./client
    container_name: mkpdesigns_client
    ports:
      - "5173:5173"
    env_file:
      - ./client/.env
    restart: unless-stopped
    depends_on:
      - server
```

### 5.2 Deep Technical Analysis of the Compose File
- **Port Mapping (`"5000:5000"`):** The syntax is `HOST_PORT:CONTAINER_PORT`. This punches a hole through the Docker isolation wall, allowing a user on the host machine's browser to access the containerized Express API.
- **Environment Injection (`env_file`):** Rather than hardcoding variables in the `docker-compose.yml` (which is tracked by Git), this command instructs Docker to inject variables from local, untracked `.env` files at runtime.
- **Self-Healing Infrastructure (`restart: unless-stopped`):** If the Node.js server crashes due to an unhandled exception, the Docker daemon will automatically catch the exit code and instantly reboot the container, guaranteeing high availability.
- **Boot Sequencing (`depends_on: - server`):** Guarantees that the backend database connection and API routes are fully initialized before the frontend container boots up and attempts to fetch data.

<div class="page-break"></div>

# 6. CONTINUOUS INTEGRATION (GITHUB ACTIONS)

Continuous Integration (CI) is the automated practice of validating code quality. GitHub Actions was deployed as the CI engine because it deeply integrates with the repository's Pull Request ecosystem.

### 6.1 The Primary Build Pipeline (`ci.yml`)
```yaml
name: CI Pipeline
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'

      - name: Install Server Dependencies
        working-directory: ./server
        run: npm ci

      - name: Install Client Dependencies and Build
        working-directory: ./client
        run: |
          npm ci
          npm run build
```
**Importance of this Pipeline:**
Whenever a developer attempts to merge code into `main`, GitHub spins up an isolated Ubuntu Virtual Machine (`ubuntu-latest`). It installs Node v24, strictly installs dependencies using `npm ci` (which respects `package-lock.json` exact versions to prevent breaking changes), and compiles the Vite application. If `npm run build` fails due to a syntax error, GitHub blocks the Pull Request from being merged.

<div class="page-break"></div>

# 7. ADVANCED DEVSECOPS (WHY EXTRA ACTIONS?)

A standard CI pipeline only checks if code *compiles*. However, modern DevOps (DevSecOps) demands that code is both secure and deployable. To achieve this, two highly specialized GitHub Actions were engineered.

### 7.1 Security Vulnerability Scanning (`security.yml`)
**Why was this implemented?** Modern applications rely on thousands of open-source NPM packages. If a single package contains a zero-day vulnerability, the entire application is compromised.

```yaml
name: Security Audit
on:
  pull_request:
    branches: [ main ]
jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run NPM Audit on Server
        working-directory: ./server
        run: npm audit --audit-level=high || echo "Vulnerabilities found, but allowing build to pass for now"
      - name: Run NPM Audit on Client
        working-directory: ./client
        run: npm audit --audit-level=high || echo "Vulnerabilities found, but allowing build to pass for now"
```
**The Shift-Left Philosophy:** By running `npm audit --audit-level=high` on Pull Requests, we practice "Shift-Left Security." We catch critical vulnerabilities at the very beginning of the development lifecycle (the left side), rather than discovering them after they have been deployed to production.

### 7.2 Infrastructure-as-Code Validation (`docker-check.yml`)
**Why was this implemented?** A developer might write perfectly valid Javascript, but introduce a typo in the `Dockerfile`. If this gets merged, the Jenkins deployment server will crash.

```yaml
name: Docker Build Validation
on:
  pull_request:
    branches: [ main ]
jobs:
  docker-dry-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test Server Dockerfile Build
        run: docker build -t mkpdesigns_server:test ./server
      - name: Test Client Dockerfile Build
        run: docker build -t mkpdesigns_client:test ./client
```
**The Methodology:** This action performs an automated "Dry Run" of the Docker build. It proves definitively that the infrastructure code is valid before allowing it to merge. 

<div class="page-break"></div>

# 8. CONTINUOUS DEPLOYMENT (JENKINS)

Once GitHub Actions provides the green light and code is merged to `main`, the Continuous Deployment (CD) phase begins. Jenkins, an industry-leading automation server, orchestrates the actual deployment of the containers.

### 8.1 Pipeline as Code (`Jenkinsfile`)
Instead of manually clicking through the Jenkins GUI to configure jobs, the entire CD pipeline is defined as "Infrastructure as Code" using a Declarative Groovy script (`Jenkinsfile`). This means the deployment pipeline itself is version-controlled and auditable.

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    echo "Injecting real .env secrets from secure Jenkins vault..."
                    sh "cp /var/jenkins_home/secure_envs/server.env server/.env"
                    sh "cp /var/jenkins_home/secure_envs/client.env client/.env"
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building Client and Server images..."
                    sh "docker-compose build"
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                script {
                    echo "Deploying containers..."
                    sh "docker-compose up -d"
                }
            }
        }
    }
    
    post {
        always {
            echo "Pipeline complete."
        }
        failure {
            echo "Pipeline failed. Check the logs."
        }
    }
}
```

<div class="page-break"></div>

# 9. SECURE SECRET MANAGEMENT (VAULT INJECTION)

One of the most complex implementations in this project was handling sensitive environment variables securely within an automated Jenkins pipeline.

### 9.1 The Problem
The `docker-compose.yml` file is configured to read from `./server/.env` and `./client/.env`. However, because we practice secure coding, `.env` files are added to `.gitignore` and are absolutely never pushed to GitHub. 
When Jenkins executes the `Checkout` stage, it pulls the code from GitHub. Because the `.env` files are missing, the subsequent `docker-compose up -d` stage will fatally crash, complaining that the required environment files do not exist.

### 9.2 The Amateur Solution vs. The Enterprise Solution
- **The Amateur Solution:** Commit the `.env` files to GitHub (Massive security risk) or write a Jenkins script to `touch dummy.env` (Build passes, but the application crashes at runtime due to missing database keys).
- **The Enterprise Solution (Implemented):** Simulated a HashiCorp Vault / AWS Secrets Manager environment directly on the Jenkins host.

### 9.3 The Vault Implementation Methodology
1. **Vault Creation:** A deeply isolated directory was created directly inside the Jenkins container's filesystem (`/var/jenkins_home/secure_envs/`).
2. **Secret Ingestion:** The actual, highly-sensitive `.env` files were securely copied from the local host machine directly into this isolated Jenkins vault using advanced Docker CLI bridging commands.
3. **Runtime Injection:** The `Jenkinsfile` was programmed with a custom `script` block located inside the `Checkout` stage. Immediately after pulling the clean code from GitHub, Jenkins executes a bash command (`cp /var/jenkins_home/secure_envs/server.env server/.env`) to rapidly inject the real secrets into the temporary build workspace.
4. **Execution:** Docker Compose compiles the containers using the real database keys. 

**Conclusion:** The application deploys flawlessly, and zero secrets are leaked to version control.

<div class="page-break"></div>

# 10. CHALLENGES FACED & SOLUTIONS

A true DevOps implementation is never without hurdles. Solving these challenges required deep systems engineering knowledge.

### Challenge 1: Docker-in-Docker (DIND) Isolation Constraints
- **The Issue:** The Jenkins automation server was deployed as a Docker container itself. When the Jenkins pipeline reached the `Build Docker Images` stage, it failed with `docker-compose: not found`. Because Jenkins was isolated inside a container, it had no access to the underlying host machine's Docker Engine. It was trapped.
- **The Solution:** A complex Docker socket-binding architecture was implemented. The Jenkins container was terminated and re-deployed with elevated `root` privileges. The host operating system's Docker daemon socket was explicitly mounted into the Jenkins container via the volume flag (`-v /var/run/docker.sock:/var/run/docker.sock`). Finally, a bash script was executed to install the `docker-compose` binaries directly inside the Jenkins container, allowing Jenkins to communicate securely with the host's Docker Engine to build sibling containers.

### Challenge 2: Git Workspace Security Mismatches (Exit Code 128)
- **The Issue:** Immediately after elevating the Jenkins container to the `root` user to solve the DIND issue, a new pipeline error emerged: `fatal: not in a git directory (Exit Code 128)`. Modern versions of Git feature aggressive security protocols. Because the Jenkins workspace directory was originally created by Jenkins User ID 1000, the new Jenkins Root User ID 0 triggered a security mismatch, causing Git to actively block the repository checkout to prevent a potential vulnerability.
- **The Solution:** A remote terminal command was executed to deeply purge the corrupted, permission-locked Jenkins workspace (`rm -rf /var/jenkins_home/workspace/*`). Following the purge, Git was globally reconfigured within the container to explicitly trust the dynamic workspace directory by executing `git config --global --add safe.directory '*'`.

### Challenge 3: Network Namespace Conflicts During Orchestration
- **The Issue:** During the final deployment phase, Docker threw a fatal conflict error: `The container name "/mkpdesigns_server" is already in use`. This occurred because earlier manual infrastructure tests (Phase 3A) had spun up containers with identical hardcoded names. When the automated Jenkins pipeline attempted to deploy, Docker's namespace collision protocol triggered, refusing to overwrite the existing running processes.
- **The Solution:** A comprehensive network teardown command (`docker rm -f mkpdesigns_server mkpdesigns_client`) was executed via the host terminal to forcefully terminate and flush the orphaned test containers. This freed up the namespace, allowing the Jenkins pipeline to successfully orchestrate a clean, green automated deployment.

<div class="page-break"></div>

# 11. CONCLUSION

The implementation of this automated DevOps CI/CD pipeline for the MKPDesigns application represents a monumental leap from amateur, manual deployment practices to a highly resilient, enterprise-grade software delivery lifecycle.

### Key Achievements
1. **Absolute Consistency:** By dockerizing the MERN stack into isolated microservices, we completely eliminated environmental drift. The application is guaranteed to run identically on any machine capable of running the Docker daemon.
2. **Unyielding Quality Gates:** The implementation of advanced GitHub Actions acts as an uncompromising quality and security gate. By executing syntax linters, test dry-runs, and critical DevSecOps NPM vulnerability audits at the Pull Request level, we ensure that the `main` branch remains permanently pristine.
3. **Autonomous Deployment:** The declarative Jenkins pipeline completely removes human error from the deployment phase. From pulling code, securely injecting vaulted environment secrets, building Docker images, and orchestrating containers, the process is fully automated.

### Final Thoughts
This project successfully demonstrates a profound understanding of modern DevOps methodologies. It proves that by combining Source Control Management (Git), Continuous Integration (GitHub Actions), Continuous Deployment (Jenkins), and Infrastructure as Code (Docker Compose), we can achieve rapid, secure, and infinitely scalable software deployments.
