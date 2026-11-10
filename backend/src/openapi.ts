import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";

export function documentoOpenApi(app: INestApplication) {
  return cleanupOpenApiDoc(
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("Stable API")
        .setVersion("1.0.0")
        .addBearerAuth()
        .build(),
    ),
  );
}

export function publicarOpenApi(app: INestApplication) {
  SwaggerModule.setup("docs", app, documentoOpenApi(app), {
    jsonDocumentUrl: "/openapi.json",
  });
}
