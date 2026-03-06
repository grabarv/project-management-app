# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS frontend-build
WORKDIR /src/frontend/project-management-ui

COPY frontend/project-management-ui/package*.json ./
RUN npm ci

COPY frontend/project-management-ui/ ./
# Build frontend to use same-origin API calls ("/api").
ENV VITE_API_BASE_URL=/api
RUN npm run build


FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

COPY backend/ProjectManagement.Api/ProjectManagement.Api.csproj backend/ProjectManagement.Api/
RUN dotnet restore backend/ProjectManagement.Api/ProjectManagement.Api.csproj

COPY backend/ProjectManagement.Api/ backend/ProjectManagement.Api/
RUN dotnet publish backend/ProjectManagement.Api/ProjectManagement.Api.csproj -c Release -o /app/publish /p:UseAppHost=false


FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /src/frontend/project-management-ui/dist ./wwwroot

EXPOSE 8080

ENTRYPOINT ["dotnet", "ProjectManagement.Api.dll"]
