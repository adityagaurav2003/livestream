pipeline {
    agent any

    environment {
        IMAGE_NAME = "live-stream-app"
    }

    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t $IMAGE_NAME .'
                }
            }
        }

        stage('Run Container') {
            steps {
                script {
                    sh 'docker stop $IMAGE_NAME || true'
                    sh 'docker rm $IMAGE_NAME || true'
                    sh 'docker run -d -p 3000:3000 --name $IMAGE_NAME $IMAGE_NAME'
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Build and Deployment Successful!'
        }
        failure {
            echo '❌ Build Failed.'
        }
    }
}
