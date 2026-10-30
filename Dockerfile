FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source
COPY src/RightPixel.Domain/RightPixel.Domain.csproj src/RightPixel.Domain/
COPY src/RightPixel.Application/RightPixel.Application.csproj src/RightPixel.Application/
COPY src/RightPixel.Infrastructure/RightPixel.Infrastructure.csproj src/RightPixel.Infrastructure/
COPY src/RightPixel.Api/RightPixel.Api.csproj src/RightPixel.Api/
RUN dotnet restore src/RightPixel.Api/RightPixel.Api.csproj
COPY src/RightPixel.Domain/ src/RightPixel.Domain/
COPY src/RightPixel.Application/ src/RightPixel.Application/
COPY src/RightPixel.Infrastructure/ src/RightPixel.Infrastructure/
COPY src/RightPixel.Api/ src/RightPixel.Api/
COPY content/csharp/generated/ content/csharp/generated/
RUN dotnet publish src/RightPixel.Api/RightPixel.Api.csproj -c Release --no-restore -o /publish /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN mkdir -p /data /home/app/.aspnet/DataProtection-Keys && chown -R app:app /data /home/app/.aspnet
COPY --from=build /publish .
ENV ASPNETCORE_HTTP_PORTS=8080
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "RightPixel.Api.dll"]
