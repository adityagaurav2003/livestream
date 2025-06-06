pipeline {
    agent any

    environment {
        IMAGE_NAME = "live-stream-app"
        CONTAINER_NAME = "live-stream-container"
    }

    stages {
        stage('Verify Docker Access') {
            steps {
                script {
                    sh 'docker --version'
                    sh 'docker ps'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t $IMAGE_NAME ."
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // Stop if already running
                    sh "docker stop $CONTAINER_NAME || true"
                    sh "docker rm $CONTAINER_NAME || true"

                    // Run new container
                    sh "docker run -d -p 3000:3000 --name $CONTAINER_NAME $IMAGE_NAME"
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build and container run successful!'
        }
        failure {
            echo '❌ Something went wrong during build or deployment.'
        }
    }
}
