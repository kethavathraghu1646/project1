FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN ./mvnw clean install || mvn clean install

CMD ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]
