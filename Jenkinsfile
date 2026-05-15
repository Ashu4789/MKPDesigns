pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from git repository
                checkout scm
                script {
                    echo "Creating dummy .env files for docker-compose..."
                    sh "touch server/.env client/.env"
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo 'Building Client and Server images...'
                    // Depending on Jenkins host OS, use 'sh' or 'bat'. Using 'sh' as standard.
                    sh "docker-compose build"
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                script {
                    echo 'Deploying containers...'
                    sh "docker-compose up -d"
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline successfully executed and application deployed.'
        }
        failure {
            echo 'Pipeline failed. Check the logs.'
        }
    }
}
