using ProjectManagement.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

app.InitializeDatabase()
    .UseApplicationPipeline()
    .MapApplicationEndpoints();

app.Run();
